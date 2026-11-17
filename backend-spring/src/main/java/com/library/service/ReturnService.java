package com.library.service;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.entity.*;
import com.library.enums.*;
import com.library.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Service xử lý toàn bộ nghiệp vụ Hẹn trả sách sớm (ReturnTicket) và Đối soát hoàn tất trả tại quầy
 * - Validate chặt chẽ ngày hẹn trả sớm (today <= scheduledReturnDate <= dueDate)
 * - Sinh mã QR phiếu trả sách qua QrService
 * - Đối soát tình trạng sách vật lý, tự động tính phạt trễ hạn (5.000đ/ngày) + phụ thu hư hại
 * - Phối hợp với BookService cập nhật lại tồn kho khả dụng (availableQuantity + 1)
 */
@Service
@RequiredArgsConstructor
public class ReturnService {

    public static final BigDecimal LATE_FEE_PER_DAY = new BigDecimal("5000");

    private final ReturnTicketRepository returnTicketRepository;
    private final ReturnDetailRepository returnDetailRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BorrowOrderRepository borrowOrderRepository;
    private final FineRepository fineRepository;
    private final BookService bookService;
    private final QrService qrService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sinh viên tạo phiếu hẹn trả sách sớm kèm mã QR (Validate scheduledReturnDate <= dueDate)
     */
    @Transactional
    public Map<String, Object> createReturnTicket(
            User currentUser,
            List<Long> borrowDetailIds,
            LocalDate scheduledReturnDate
    ) {
        if (currentUser == null) {
            throw new BadRequestException("Vui lòng đăng nhập để tạo phiếu hẹn trả sách");
        }

        LocalDate today = LocalDate.now();
        if (scheduledReturnDate.isBefore(today)) {
            throw new BadRequestException("Ngày hẹn trả sách không được nhỏ hơn ngày hiện tại");
        }

        String ticketCode = generateTicketCode();
        ReturnTicket ticket = ReturnTicket.builder()
                .ticketCode(ticketCode)
                .user(currentUser)
                .scheduledReturnDate(scheduledReturnDate)
                .status(ReturnTicketStatus.PENDING_RETURN)
                .build();

        List<Map<String, Object>> booksInfo = new ArrayList<>();
        List<String> bookTitles = new ArrayList<>();

        for (Long borrowDetailId : borrowDetailIds.stream().distinct().toList()) {
            BorrowDetail borrowDetail = borrowDetailRepository.findById(borrowDetailId)
                    .orElseThrow(() -> new ResourceNotFoundException("Chi tiết mượn sách", "id", borrowDetailId));

            // 1. Kiểm tra quyền sở hữu
            if (!borrowDetail.getBorrowOrder().getUser().getId().equals(currentUser.getId())) {
                throw new BadRequestException("Bạn không thể tạo phiếu trả cho sách của sinh viên khác");
            }

            // 2. Kiểm tra trạng thái sách đang mượn
            if (borrowDetail.getStatus() == BorrowDetailStatus.RETURNED
                    || borrowDetail.getStatus() == BorrowDetailStatus.LOST) {
                throw new BadRequestException("Cuốn sách '" + borrowDetail.getBook().getTitle() + "' đã được trả hoặc đã báo mất trước đó");
            }

            // 3. Validate quy tắc nghiệp vụ: Ngày hẹn trả sớm phải <= hạn trả (dueDate)
            if (borrowDetail.getDueDate() != null && scheduledReturnDate.isAfter(borrowDetail.getDueDate())) {
                throw new BadRequestException(String.format(
                        "Ngày hẹn trả (%s) của cuốn sách '%s' không được vượt quá hạn trả quy định (%s)",
                        scheduledReturnDate, borrowDetail.getBook().getTitle(), borrowDetail.getDueDate()
                ));
            }

            // 4. Kiểm tra không tạo trùng phiếu hẹn trả đang chờ
            boolean alreadyInPendingTicket = returnDetailRepository.existsByBorrowDetailIdAndReturnTicketStatus(
                    borrowDetailId, ReturnTicketStatus.PENDING_RETURN
            );
            if (alreadyInPendingTicket) {
                throw new BadRequestException("Cuốn sách '" + borrowDetail.getBook().getTitle() + "' đã có trong một phiếu hẹn trả đang chờ xử lý");
            }

            ReturnDetail returnDetail = ReturnDetail.builder()
                    .borrowDetail(borrowDetail)
                    .bookCondition(BookCondition.NORMAL)
                    .damageFee(BigDecimal.ZERO)
                    .build();
            ticket.addDetail(returnDetail);

            bookTitles.add(borrowDetail.getBook().getTitle());
            booksInfo.add(Map.of(
                    "borrowDetailId", borrowDetail.getId(),
                    "bookId", borrowDetail.getBook().getId(),
                    "title", borrowDetail.getBook().getTitle(),
                    "dueDate", borrowDetail.getDueDate() != null ? borrowDetail.getDueDate().toString() : ""
            ));
        }

        ReturnTicket savedTicket = returnTicketRepository.save(ticket);

        // 5. Sinh mã QR Base64 cho phiếu hẹn trả
        String qrBase64 = "data:image/png;base64," +
                qrService.generateReturnQrBase64(savedTicket.getTicketCode(), bookTitles);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("ticketId", savedTicket.getId());
        responseData.put("ticketCode", savedTicket.getTicketCode());
        responseData.put("scheduledReturnDate", savedTicket.getScheduledReturnDate());
        responseData.put("status", savedTicket.getStatus().name());
        responseData.put("qrCodeBase64", qrBase64);
        responseData.put("books", booksInfo);

        messagingTemplate.convertAndSend("/topic/orders", Map.of(
                "event", "NEW_RETURN_TICKET",
                "ticketCode", savedTicket.getTicketCode(),
                "studentName", currentUser.getFullName(),
                "bookCount", booksInfo.size()
        ));

        return responseData;
    }

    /**
     * Thủ thư đối soát tình trạng sách vật lý, xử lý hoàn tất trả sách tại quầy & cập nhật tồn kho
     */
    @Transactional
    public Map<String, Object> completeReturnTicket(
            Long ticketId,
            List<ReturnItemInspection> items,
            String librarianNote
    ) {
        ReturnTicket ticket = returnTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu hẹn trả", "id", ticketId));

        if (ticket.getStatus() != ReturnTicketStatus.PENDING_RETURN) {
            throw new BadRequestException("Phiếu trả này đã được hoàn tất hoặc đã hủy trước đó");
        }

        Map<Long, ReturnItemInspection> inspectionMap = new HashMap<>();
        if (items != null) {
            for (ReturnItemInspection item : items) {
                inspectionMap.put(item.getBorrowDetailId(), item);
            }
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        int totalOverdueDays = 0;
        BigDecimal totalLateFee = BigDecimal.ZERO;
        BigDecimal totalDamageFee = BigDecimal.ZERO;
        Set<BorrowOrder> affectedOrders = new HashSet<>();

        // 1. Đối soát từng cuốn sách trong phiếu trả và cập nhật lại kho qua BookService
        for (ReturnDetail rd : ticket.getReturnDetails()) {
            BorrowDetail bd = rd.getBorrowDetail();
            Book book = bd.getBook();

            ReturnItemInspection inspection = inspectionMap.get(bd.getId());
            BookCondition condition = (inspection != null && inspection.getBookCondition() != null)
                    ? inspection.getBookCondition()
                    : BookCondition.NORMAL;
            BigDecimal damageFee = (inspection != null && inspection.getDamageFee() != null)
                    ? inspection.getDamageFee()
                    : BigDecimal.ZERO;
            String note = (inspection != null) ? inspection.getNote() : null;

            rd.setBookCondition(condition);
            rd.setDamageFee(damageFee);
            rd.setNote(note);

            // Tính số ngày quá hạn và tiền phạt trễ hạn (5.000đ/ngày)
            int overdueDays = 0;
            if (bd.getDueDate() != null && today.isAfter(bd.getDueDate())) {
                overdueDays = (int) ChronoUnit.DAYS.between(bd.getDueDate(), today);
            }
            BigDecimal lateFee = LATE_FEE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));

            totalOverdueDays += overdueDays;
            totalLateFee = totalLateFee.add(lateFee);
            totalDamageFee = totalDamageFee.add(damageFee);

            // Cập nhật trạng thái chi tiết mượn & hoàn trả sách vào kho khả dụng
            boolean isLost = (condition == BookCondition.LOST);
            bd.setStatus(isLost ? BorrowDetailStatus.LOST : BorrowDetailStatus.RETURNED);
            bd.setActualReturnDate(now);

            bookService.releaseBookToStock(book, isLost);
            borrowDetailRepository.save(bd);
            affectedOrders.add(bd.getBorrowOrder());
        }

        // 2. Cập nhật trạng thái phiếu hẹn trả sang COMPLETED
        if (librarianNote != null) {
            ticket.setLibrarianNote(librarianNote);
        }
        ticket.setActualReturnDate(now);
        ticket.setStatus(ReturnTicketStatus.COMPLETED);
        returnTicketRepository.save(ticket);

        // 3. Nếu toàn bộ sách trong đơn mượn gốc đã được trả hết -> chuyển BorrowOrder sang RETURNED
        for (BorrowOrder order : affectedOrders) {
            boolean allReturned = order.getBorrowDetails().stream()
                    .allMatch(d -> d.getStatus() == BorrowDetailStatus.RETURNED || d.getStatus() == BorrowDetailStatus.LOST);
            if (allReturned) {
                order.setStatus(BorrowOrderStatus.RETURNED);
                borrowOrderRepository.save(order);
            }
        }

        // 4. Tự động phát hành biên lai phạt (Fine) nếu phát sinh phí trễ hạn hoặc hư hại/mất sách
        BigDecimal grandTotalFine = totalLateFee.add(totalDamageFee);
        Fine createdFine = null;
        if (grandTotalFine.compareTo(BigDecimal.ZERO) > 0) {
            Fine fine = Fine.builder()
                    .fineCode(generateFineCode())
                    .user(ticket.getUser())
                    .returnTicket(ticket)
                    .overdueDays(totalOverdueDays)
                    .lateFee(totalLateFee)
                    .damageFee(totalDamageFee)
                    .totalAmount(grandTotalFine)
                    .status(FineStatus.UNPAID)
                    .note("Phát sinh khi đối soát phiếu trả " + ticket.getTicketCode())
                    .build();
            createdFine = fineRepository.save(fine);
        }

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("ticketId", ticket.getId());
        responseData.put("ticketCode", ticket.getTicketCode());
        responseData.put("status", ticket.getStatus().name());
        responseData.put("actualReturnDate", ticket.getActualReturnDate());
        responseData.put("overdueDays", totalOverdueDays);
        responseData.put("lateFee", totalLateFee);
        responseData.put("damageFee", totalDamageFee);
        responseData.put("totalFineAmount", grandTotalFine);
        if (createdFine != null) {
            responseData.put("fineId", createdFine.getId());
            responseData.put("fineCode", createdFine.getFineCode());
        }

        messagingTemplate.convertAndSend("/topic/scan-station", Map.of(
                "event", "RETURN_COMPLETED",
                "ticketCode", ticket.getTicketCode(),
                "totalFineAmount", grandTotalFine
        ));

        return responseData;
    }

    /**
     * Lấy danh sách phiếu hẹn trả của sinh viên đang đăng nhập
     */
    @Transactional(readOnly = true)
    public List<ReturnTicket> getMyReturnTickets(User currentUser) {
        return returnTicketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    /**
     * Tra cứu phiếu hẹn trả theo mã phiếu (ticketCode) khi quét QR tại quầy
     */
    @Transactional(readOnly = true)
    public ReturnTicket getReturnTicketByCode(String ticketCode) {
        return returnTicketRepository.findByTicketCode(ticketCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu hẹn trả", "ticketCode", ticketCode));
    }

    /**
     * Tìm kiếm và lọc danh sách phiếu hẹn trả toàn hệ thống cho Thủ thư
     */
    @Transactional(readOnly = true)
    public Page<ReturnTicket> getAllReturnTickets(String keyword, ReturnTicketStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        return returnTicketRepository.searchReturnTickets(keyword, status, pageable);
    }

    /**
     * Hủy phiếu hẹn trả khi đang ở trạng thái PENDING_RETURN
     */
    @Transactional
    public ReturnTicket cancelReturnTicket(Long ticketId, User currentUser) {
        ReturnTicket ticket = returnTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu hẹn trả", "id", ticketId));

        boolean isLibrarian = currentUser.getRole() == Role.LIBRARIAN;
        if (!isLibrarian && !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền hủy phiếu hẹn trả này");
        }

        if (ticket.getStatus() != ReturnTicketStatus.PENDING_RETURN) {
            throw new BadRequestException("Chỉ có thể hủy phiếu hẹn trả đang ở trạng thái chờ (PENDING_RETURN)");
        }

        ticket.setStatus(ReturnTicketStatus.CANCELLED);
        return returnTicketRepository.save(ticket);
    }

    private String generateTicketCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = 1000 + new Random().nextInt(9000);
        return "RT-" + datePart + "-" + randomPart;
    }

    private String generateFineCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = 1000 + new Random().nextInt(9000);
        return "FN-" + datePart + "-" + randomPart;
    }

    @Data
    public static class ReturnItemInspection {
        private Long borrowDetailId;
        private BookCondition bookCondition;
        private BigDecimal damageFee;
        private String note;
    }
}
