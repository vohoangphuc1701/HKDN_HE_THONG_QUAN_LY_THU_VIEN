package com.library.controller;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.common.response.ApiResponse;
import com.library.entity.*;
import com.library.enums.*;
import com.library.repository.*;
import com.library.service.QrService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Controller xử lý Quy trình Hẹn Trả Sách Sớm & Đối Soát Nhận Trả Tại Quầy (ReturnTicket Flow)
 * - Sinh viên chủ động chọn các cuốn sách đang mượn để tạo lịch hẹn trả -> nhận mã QR phiếu trả
 * - Thủ thư quét mã QR tại quầy, đối soát tình trạng vật lý (NORMAL, TORN_COVER, LOST...),
 *   tự động tính tiền phạt trễ hạn (5.000đ/ngày) + phụ thu hư hại và cộng hoàn lại kho khả dụng
 */
@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

    private static final BigDecimal LATE_FEE_PER_DAY = new BigDecimal("5000");

    private final ReturnTicketRepository returnTicketRepository;
    private final ReturnDetailRepository returnDetailRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BorrowOrderRepository borrowOrderRepository;
    private final BookRepository bookRepository;
    private final FineRepository fineRepository;
    private final QrService qrService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sinh viên tạo phiếu hẹn trả sách kèm mã QR
     */
    @PostMapping("/create-ticket")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReturnTicket(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateReturnTicketRequest request
    ) {
        if (currentUser == null) {
            throw new BadRequestException("Vui lòng đăng nhập để tạo phiếu hẹn trả sách");
        }

        if (request.getScheduledReturnDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Ngày hẹn trả sách không được nhỏ hơn ngày hiện tại");
        }

        String ticketCode = generateTicketCode();
        ReturnTicket ticket = ReturnTicket.builder()
                .ticketCode(ticketCode)
                .user(currentUser)
                .scheduledReturnDate(request.getScheduledReturnDate())
                .status(ReturnTicketStatus.PENDING_RETURN)
                .build();

        List<Map<String, Object>> booksInfo = new ArrayList<>();
        List<String> bookTitles = new ArrayList<>();

        for (Long borrowDetailId : request.getBorrowDetailIds().stream().distinct().toList()) {
            BorrowDetail borrowDetail = borrowDetailRepository.findById(borrowDetailId)
                    .orElseThrow(() -> new ResourceNotFoundException("Chi tiết mượn sách", "id", borrowDetailId));

            if (!borrowDetail.getBorrowOrder().getUser().getId().equals(currentUser.getId())) {
                throw new BadRequestException("Bạn không thể tạo phiếu trả cho sách của sinh viên khác");
            }

            if (borrowDetail.getStatus() == BorrowDetailStatus.RETURNED) {
                throw new BadRequestException("Cuốn sách '" + borrowDetail.getBook().getTitle() + "' đã được trả trước đó");
            }

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

        String qrBase64 = "data:image/png;base64," +
                qrService.generateReturnQrBase64(savedTicket.getTicketCode(), bookTitles);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("ticketId", savedTicket.getId());
        responseData.put("ticketCode", savedTicket.getTicketCode());
        responseData.put("scheduledReturnDate", savedTicket.getScheduledReturnDate());
        responseData.put("status", savedTicket.getStatus().name());
        responseData.put("qrCodeBase64", qrBase64);
        responseData.put("books", booksInfo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo phiếu hẹn trả sách thành công! Vui lòng đưa mã QR tại quầy", responseData));
    }

    /**
     * Sinh viên xem danh sách các phiếu hẹn trả sách của mình
     */
    @GetMapping("/my-tickets")
    public ResponseEntity<ApiResponse<List<ReturnTicket>>> getMyReturnTickets(
            @AuthenticationPrincipal User currentUser
    ) {
        List<ReturnTicket> tickets = returnTicketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Danh sách phiếu hẹn trả của bạn", tickets));
    }

    /**
     * Thủ thư tra cứu phiếu hẹn trả theo mã phiếu (ticketCode) khi quét QR tại quầy
     */
    @GetMapping("/code/{ticketCode}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<ReturnTicket>> getReturnTicketByCode(@PathVariable String ticketCode) {
        ReturnTicket ticket = returnTicketRepository.findByTicketCode(ticketCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu hẹn trả", "ticketCode", ticketCode));
        return ResponseEntity.ok(ApiResponse.success("Thông tin phiếu hẹn trả", ticket));
    }

    /**
     * Thủ thư xem danh sách toàn bộ phiếu hẹn trả (có phân trang và lọc trạng thái)
     */
    @GetMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Page<ReturnTicket>>> getAllReturnTickets(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReturnTicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        Page<ReturnTicket> tickets = returnTicketRepository.searchReturnTickets(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Danh sách phiếu hẹn trả toàn hệ thống", tickets));
    }

    /**
     * Thủ thư đối soát tình trạng sách vật lý và hoàn tất nhận trả sách tại quầy
     */
    @PostMapping("/{ticketId}/complete")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeReturnTicket(
            @PathVariable Long ticketId,
            @RequestBody(required = false) CompleteReturnRequest request
    ) {
        ReturnTicket ticket = returnTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu hẹn trả", "id", ticketId));

        if (ticket.getStatus() != ReturnTicketStatus.PENDING_RETURN) {
            throw new BadRequestException("Phiếu trả này đã được xử lý hoặc đã hủy trước đó");
        }

        Map<Long, ReturnItemInspection> inspectionMap = new HashMap<>();
        if (request != null && request.getItems() != null) {
            for (ReturnItemInspection item : request.getItems()) {
                inspectionMap.put(item.getBorrowDetailId(), item);
            }
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        int totalOverdueDays = 0;
        BigDecimal totalLateFee = BigDecimal.ZERO;
        BigDecimal totalDamageFee = BigDecimal.ZERO;
        Set<BorrowOrder> affectedOrders = new HashSet<>();

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

            // Tính số ngày quá hạn (nếu có)
            int overdueDays = 0;
            if (bd.getDueDate() != null && today.isAfter(bd.getDueDate())) {
                overdueDays = (int) ChronoUnit.DAYS.between(bd.getDueDate(), today);
            }
            BigDecimal lateFee = LATE_FEE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));

            totalOverdueDays += overdueDays;
            totalLateFee = totalLateFee.add(lateFee);
            totalDamageFee = totalDamageFee.add(damageFee);

            // Cập nhật tồn kho sách và trạng thái chi tiết mượn
            if (condition == BookCondition.LOST) {
                bd.setStatus(BorrowDetailStatus.LOST);
                book.setTotalQuantity(Math.max(0, book.getTotalQuantity() - 1));
            } else {
                bd.setStatus(BorrowDetailStatus.RETURNED);
                book.setAvailableQuantity(book.getAvailableQuantity() + 1);
            }
            bd.setActualReturnDate(now);

            bookRepository.save(book);
            borrowDetailRepository.save(bd);
            affectedOrders.add(bd.getBorrowOrder());
        }

        if (request != null && request.getLibrarianNote() != null) {
            ticket.setLibrarianNote(request.getLibrarianNote());
        }
        ticket.setActualReturnDate(now);
        ticket.setStatus(ReturnTicketStatus.COMPLETED);
        returnTicketRepository.save(ticket);

        // Nếu tất cả sách trong đơn mượn đã trả hết -> chuyển BorrowOrder sang RETURNED
        for (BorrowOrder order : affectedOrders) {
            boolean allFinished = order.getBorrowDetails().stream()
                    .allMatch(d -> d.getStatus() == BorrowDetailStatus.RETURNED || d.getStatus() == BorrowDetailStatus.LOST);
            if (allFinished) {
                order.setStatus(BorrowOrderStatus.RETURNED);
                borrowOrderRepository.save(order);
            }
        }

        // Nếu có phát sinh phạt trễ hạn hoặc hư hại -> tạo biên lai phạt (Fine)
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
            responseData.put("fineCode", createdFine.getFineCode());
            responseData.put("fineId", createdFine.getId());
        }

        messagingTemplate.convertAndSend("/topic/scan-station", Map.of(
                "event", "RETURN_COMPLETED",
                "ticketCode", ticket.getTicketCode(),
                "totalFineAmount", grandTotalFine
        ));

        return ResponseEntity.ok(ApiResponse.success("Hoàn tất nhận trả sách và đối soát thành công", responseData));
    }

    /**
     * Hủy phiếu hẹn trả khi đang ở trạng thái PENDING_RETURN
     */
    @PostMapping("/{ticketId}/cancel")
    @Transactional
    public ResponseEntity<ApiResponse<ReturnTicket>> cancelReturnTicket(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal User currentUser
    ) {
        ReturnTicket ticket = returnTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu hẹn trả", "id", ticketId));

        boolean isLibrarian = currentUser.getRole().name().equals("LIBRARIAN");
        if (!isLibrarian && !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền hủy phiếu hẹn trả này");
        }

        if (ticket.getStatus() != ReturnTicketStatus.PENDING_RETURN) {
            throw new BadRequestException("Chỉ có thể hủy phiếu hẹn trả đang ở trạng thái chờ (PENDING_RETURN)");
        }

        ticket.setStatus(ReturnTicketStatus.CANCELLED);
        ReturnTicket saved = returnTicketRepository.save(ticket);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy phiếu hẹn trả sách", saved));
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

    // ==================== DTO Request Classes ====================

    @Data
    public static class CreateReturnTicketRequest {
        @NotEmpty(message = "Vui lòng chọn ít nhất 1 cuốn sách cần hẹn trả")
        private List<Long> borrowDetailIds;

        @NotNull(message = "Ngày hẹn trả không được để trống")
        private LocalDate scheduledReturnDate;
    }

    @Data
    public static class CompleteReturnRequest {
        private List<ReturnItemInspection> items;
        private String librarianNote;
    }

    @Data
    public static class ReturnItemInspection {
        private Long borrowDetailId;
        private BookCondition bookCondition;
        private BigDecimal damageFee;
        private String note;
    }
}

