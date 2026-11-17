package com.library.service;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.entity.Book;
import com.library.entity.BorrowDetail;
import com.library.entity.BorrowOrder;
import com.library.entity.User;
import com.library.enums.BorrowDetailStatus;
import com.library.enums.BorrowOrderStatus;
import com.library.enums.FineStatus;
import com.library.enums.Role;
import com.library.repository.BorrowDetailRepository;
import com.library.repository.BorrowOrderRepository;
import com.library.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service xử lý toàn bộ nghiệp vụ Mượn sách, Tính hạn trả và Gia hạn trực tuyến
 * - Kiểm tra nợ phạt UNPAID, hạn mức tối đa 5 cuốn/sinh viên và chống đặt trùng đầu sách
 * - Phối hợp với BookService thực hiện khóa bi quan (Pessimistic Lock) trừ/hoàn tồn kho
 * - Tính toán hạn trả tiêu chuẩn (14 ngày) và gia hạn trực tuyến (+7 ngày, tối đa 2 lần)
 */
@Service
@RequiredArgsConstructor
public class BorrowService {

    public static final int MAX_ACTIVE_BOOKS_PER_STUDENT = 5;
    public static final int STANDARD_BORROW_DAYS = 14;
    public static final int MAX_RENEWAL_COUNT = 2;
    public static final int RENEWAL_EXTENSION_DAYS = 7;

    private final BorrowOrderRepository borrowOrderRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final FineRepository fineRepository;
    private final BookService bookService;
    private final QrService qrService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Tạo đơn đặt mượn sách trực tuyến cho Sinh viên
     */
    @Transactional
    public Map<String, Object> createBorrowOrder(
            User currentUser,
            List<Long> bookIds,
            LocalDate pickupDate,
            String note
    ) {
        if (currentUser == null) {
            throw new BadRequestException("Vui lòng đăng nhập để đặt mượn sách");
        }

        // 1. Chặn đặt mượn nếu sinh viên còn khoản phạt chưa thanh toán (UNPAID)
        if (fineRepository.existsByUserIdAndStatus(currentUser.getId(), FineStatus.UNPAID)) {
            throw new BadRequestException("Bạn đang có khoản phạt chưa thanh toán. Vui lòng hoàn tất nộp phạt trước khi mượn sách mới");
        }

        // 2. Kiểm tra ngày hẹn lấy sách hợp lệ (từ hôm nay đến tối đa 7 ngày tới)
        LocalDate today = LocalDate.now();
        if (pickupDate.isBefore(today)) {
            throw new BadRequestException("Ngày hẹn lấy sách không được nhỏ hơn ngày hiện tại");
        }
        if (pickupDate.isAfter(today.plusDays(7))) {
            throw new BadRequestException("Ngày hẹn lấy sách chỉ được phép đặt trước tối đa 7 ngày");
        }

        List<Long> distinctBookIds = bookIds.stream().distinct().toList();

        // 3. Kiểm tra hạn mức mượn tối đa 5 cuốn cùng lúc của sinh viên
        long currentActiveCount = borrowDetailRepository.countActiveBorrowsByUser(
                currentUser.getId(),
                List.of(BorrowDetailStatus.BORROWING, BorrowDetailStatus.OVERDUE),
                List.of(BorrowOrderStatus.RETURNED, BorrowOrderStatus.CANCELLED)
        );
        if (currentActiveCount + distinctBookIds.size() > MAX_ACTIVE_BOOKS_PER_STUDENT) {
            throw new BadRequestException(String.format(
                    "Mỗi sinh viên chỉ được mượn tối đa %d cuốn cùng lúc (Hiện đang giữ/đặt %d cuốn, yêu cầu thêm %d cuốn)",
                    MAX_ACTIVE_BOOKS_PER_STUDENT, currentActiveCount, distinctBookIds.size()
            ));
        }

        // 4. Khởi tạo đơn mượn và tính hạn trả tiêu chuẩn
        String orderCode = generateOrderCode();
        LocalDate expectedDueDate = calculateStandardDueDate(pickupDate);

        BorrowOrder order = BorrowOrder.builder()
                .orderCode(orderCode)
                .user(currentUser)
                .pickupDate(pickupDate)
                .status(BorrowOrderStatus.NEW)
                .note(note)
                .build();

        List<Map<String, Object>> borrowedBooksInfo = new ArrayList<>();
        List<String> bookTitles = new ArrayList<>();

        // 5. Kiểm tra không mượn trùng sách đang giữ và trừ tồn kho bằng Pessimistic Write Lock
        for (Long bookId : distinctBookIds) {
            boolean alreadyHolding = borrowDetailRepository.existsActiveBookBorrowByUser(
                    currentUser.getId(),
                    bookId,
                    List.of(BorrowDetailStatus.BORROWING, BorrowDetailStatus.OVERDUE),
                    List.of(BorrowOrderStatus.RETURNED, BorrowOrderStatus.CANCELLED)
            );
            if (alreadyHolding) {
                throw new BadRequestException("Bạn đang mượn hoặc đã đặt giữ cuốn sách ID=" + bookId + " rồi");
            }

            Book reservedBook = bookService.reserveBookForBorrow(bookId);

            BorrowDetail detail = BorrowDetail.builder()
                    .book(reservedBook)
                    .dueDate(expectedDueDate)
                    .renewalCount(0)
                    .status(BorrowDetailStatus.BORROWING)
                    .build();
            order.addDetail(detail);

            bookTitles.add(reservedBook.getTitle());
            borrowedBooksInfo.add(Map.of(
                    "id", reservedBook.getId(),
                    "title", reservedBook.getTitle(),
                    "documentCode", reservedBook.getDocumentCode() != null ? reservedBook.getDocumentCode() : "",
                    "shelfLocation", reservedBook.getShelfLocation() != null ? reservedBook.getShelfLocation().name() : "",
                    "dueDate", expectedDueDate
            ));
        }

        BorrowOrder savedOrder = borrowOrderRepository.save(order);

        // 6. Sinh mã QR Base64 cho đơn mượn và phát thông báo WebSocket thời gian thực
        String qrBase64 = "data:image/png;base64," +
                qrService.generateBorrowQrBase64(savedOrder.getId(), currentUser.getUsername(), bookTitles);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("orderId", savedOrder.getId());
        responseData.put("orderCode", savedOrder.getOrderCode());
        responseData.put("status", savedOrder.getStatus().name());
        responseData.put("pickupDate", savedOrder.getPickupDate());
        responseData.put("expectedDueDate", expectedDueDate);
        responseData.put("qrCodeBase64", qrBase64);
        responseData.put("books", borrowedBooksInfo);

        messagingTemplate.convertAndSend("/topic/orders", Map.of(
                "event", "NEW_BORROW_ORDER",
                "orderCode", savedOrder.getOrderCode(),
                "studentName", currentUser.getFullName(),
                "bookCount", borrowedBooksInfo.size()
        ));

        return responseData;
    }

    /**
     * Tính hạn trả tiêu chuẩn (14 ngày kể từ ngày nhận sách)
     */
    public LocalDate calculateStandardDueDate(LocalDate pickupOrHandoverDate) {
        LocalDate baseDate = (pickupOrHandoverDate != null) ? pickupOrHandoverDate : LocalDate.now();
        return baseDate.plusDays(STANDARD_BORROW_DAYS);
    }

    /**
     * Gia hạn sách trực tuyến (+7 ngày, tối đa 2 lần khi sách chưa quá hạn)
     */
    @Transactional
    public Map<String, Object> renewBorrowedBook(Long borrowDetailId, User currentUser) {
        BorrowDetail detail = borrowDetailRepository.findById(borrowDetailId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết mượn sách", "id", borrowDetailId));

        if (!detail.getBorrowOrder().getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền gia hạn cuốn sách của người khác");
        }

        if (detail.getStatus() != BorrowDetailStatus.BORROWING) {
            throw new BadRequestException("Chỉ có thể gia hạn sách đang ở trạng thái Đang mượn (BORROWING)");
        }

        LocalDate today = LocalDate.now();
        if (detail.getDueDate() != null && detail.getDueDate().isBefore(today)) {
            throw new BadRequestException("Sách đã quá hạn trả, không thể gia hạn trực tuyến. Vui lòng mang sách lên quầy");
        }

        if (detail.getRenewalCount() >= MAX_RENEWAL_COUNT) {
            throw new BadRequestException("Cuốn sách này đã đạt giới hạn gia hạn tối đa (" + MAX_RENEWAL_COUNT + " lần)");
        }

        LocalDate oldDueDate = detail.getDueDate() != null ? detail.getDueDate() : today;
        LocalDate newDueDate = oldDueDate.plusDays(RENEWAL_EXTENSION_DAYS);

        detail.setDueDate(newDueDate);
        detail.setRenewalCount(detail.getRenewalCount() + 1);
        borrowDetailRepository.save(detail);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("borrowDetailId", detail.getId());
        responseData.put("bookTitle", detail.getBook().getTitle());
        responseData.put("oldDueDate", oldDueDate);
        responseData.put("newDueDate", newDueDate);
        responseData.put("renewalCount", detail.getRenewalCount());
        responseData.put("remainingRenewals", Math.max(0, MAX_RENEWAL_COUNT - detail.getRenewalCount()));
        return responseData;
    }

    /**
     * Lấy danh sách các cuốn sách sinh viên đang cầm kèm trạng thái cho phép gia hạn (canRenew)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyActiveLoans(User currentUser) {
        List<BorrowDetail> details = borrowDetailRepository.findByBorrowOrderUserIdOrderByCreatedAtDesc(currentUser.getId());
        LocalDate today = LocalDate.now();

        return details.stream()
                .map(bd -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("borrowDetailId", bd.getId());
                    item.put("orderCode", bd.getBorrowOrder().getOrderCode());
                    item.put("orderStatus", bd.getBorrowOrder().getStatus().name());
                    item.put("bookId", bd.getBook().getId());
                    item.put("title", bd.getBook().getTitle());
                    item.put("author", bd.getBook().getAuthor());
                    item.put("coverImage", bd.getBook().getCoverImage());
                    item.put("borrowDate", bd.getCreatedAt().toLocalDate());
                    item.put("dueDate", bd.getDueDate());
                    item.put("renewalCount", bd.getRenewalCount());
                    boolean canRenew = bd.getStatus() == BorrowDetailStatus.BORROWING
                            && bd.getRenewalCount() < MAX_RENEWAL_COUNT
                            && (bd.getDueDate() == null || !bd.getDueDate().isBefore(today));
                    item.put("canRenew", canRenew);
                    item.put("status", bd.getStatus().name());
                    return item;
                })
                .toList();
    }

    /**
     * Lấy danh sách các đơn mượn của sinh viên đang đăng nhập
     */
    @Transactional(readOnly = true)
    public List<BorrowOrder> getMyOrders(User currentUser) {
        return borrowOrderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    /**
     * Hủy đơn đặt mượn (khi chưa nhận sách) và hoàn trả số lượng khả dụng vào kho
     */
    @Transactional
    public BorrowOrder cancelBorrowOrder(Long orderId, User currentUser) {
        BorrowOrder order = borrowOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mượn", "id", orderId));

        boolean isLibrarian = currentUser.getRole() == Role.LIBRARIAN;
        if (!isLibrarian && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền hủy đơn mượn này");
        }

        if (order.getStatus() == BorrowOrderStatus.BORROWED
                || order.getStatus() == BorrowOrderStatus.RETURNED
                || order.getStatus() == BorrowOrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể hủy đơn mượn đang ở trạng thái: " + order.getStatus());
        }

        for (BorrowDetail detail : order.getBorrowDetails()) {
            bookService.releaseBookToStock(detail.getBook(), false);
            detail.setStatus(BorrowDetailStatus.RETURNED);
        }

        order.setStatus(BorrowOrderStatus.CANCELLED);
        return borrowOrderRepository.save(order);
    }

    /**
     * Tìm kiếm và lọc danh sách đơn mượn toàn hệ thống cho Thủ thư
     */
    @Transactional(readOnly = true)
    public Page<BorrowOrder> getAllBorrowOrders(String keyword, BorrowOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        return borrowOrderRepository.searchBorrowOrders(keyword, status, pageable);
    }

    /**
     * Thủ thư cập nhật trạng thái đơn mượn (NEW -> PROCESSING -> READY_FOR_PICKUP)
     */
    @Transactional
    public BorrowOrder updateOrderStatus(Long orderId, BorrowOrderStatus status) {
        BorrowOrder order = borrowOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mượn", "id", orderId));

        order.setStatus(status);
        BorrowOrder updated = borrowOrderRepository.save(order);

        messagingTemplate.convertAndSend("/topic/orders", Map.of(
                "event", "ORDER_STATUS_UPDATED",
                "orderCode", updated.getOrderCode(),
                "status", updated.getStatus().name()
        ));

        return updated;
    }

    private String generateOrderCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = 1000 + new Random().nextInt(9000);
        return "OD-" + datePart + "-" + randomPart;
    }
}
