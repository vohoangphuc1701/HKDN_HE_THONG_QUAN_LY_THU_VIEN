package com.library.controller;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.common.response.ApiResponse;
import com.library.entity.Book;
import com.library.entity.BorrowDetail;
import com.library.entity.BorrowOrder;
import com.library.entity.User;
import com.library.enums.BorrowDetailStatus;
import com.library.enums.BorrowOrderStatus;
import com.library.enums.FineStatus;
import com.library.repository.BookRepository;
import com.library.repository.BorrowDetailRepository;
import com.library.repository.BorrowOrderRepository;
import com.library.repository.FineRepository;
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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Controller xử lý toàn bộ Quy trình Mượn Sách & Gia Hạn Trực Tuyến (Borrows Flow)
 * - Sinh viên đặt mượn online (kiểm tra nợ phạt UNPAID, hạn mức tối đa 5 cuốn, khóa bi quan trừ tồn kho)
 * - Tự động sinh mã QR đơn mượn để quét nhận sách tại quầy < 30s
 * - Hỗ trợ gia hạn trực tuyến (+7 ngày, tối đa 2 lần)
 */
@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private static final int MAX_ACTIVE_BOOKS_PER_STUDENT = 5;
    private static final int MAX_RENEWAL_COUNT = 2;
    private static final int RENEWAL_EXTENSION_DAYS = 7;

    private final BorrowOrderRepository borrowOrderRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BookRepository bookRepository;
    private final FineRepository fineRepository;
    private final QrService qrService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sinh viên đặt mượn sách trực tuyến (Trừ availableQuantity ngay lập tức và sinh mã QR nhận sách)
     */
    @PostMapping("/create")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBorrowOrder(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateBorrowRequest request
    ) {
        if (currentUser == null) {
            throw new BadRequestException("Vui lòng đăng nhập để đặt mượn sách");
        }

        // 1. Kiểm tra sinh viên có nợ tiền phạt chưa đóng (UNPAID) hay không
        if (fineRepository.existsByUserIdAndStatus(currentUser.getId(), FineStatus.UNPAID)) {
            throw new BadRequestException("Bạn đang có khoản phạt chưa thanh toán. Vui lòng hoàn tất nộp phạt trước khi mượn sách mới");
        }

        // 2. Kiểm tra ngày hẹn lấy sách hợp lệ (từ hôm nay đến tối đa 7 ngày tới)
        LocalDate today = LocalDate.now();
        if (request.getPickupDate().isBefore(today)) {
            throw new BadRequestException("Ngày hẹn lấy sách không được nhỏ hơn ngày hiện tại");
        }
        if (request.getPickupDate().isAfter(today.plusDays(7))) {
            throw new BadRequestException("Ngày hẹn lấy sách chỉ được phép đặt trước tối đa 7 ngày");
        }

        // Loại bỏ các bookId bị gửi trùng trong cùng 1 request
        List<Long> distinctBookIds = request.getBookIds().stream().distinct().toList();

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

        // 4. Khởi tạo đơn mượn mới
        String orderCode = generateOrderCode();
        BorrowOrder order = BorrowOrder.builder()
                .orderCode(orderCode)
                .user(currentUser)
                .pickupDate(request.getPickupDate())
                .status(BorrowOrderStatus.NEW)
                .note(request.getNote())
                .build();

        List<Map<String, Object>> borrowedBooksInfo = new ArrayList<>();
        List<String> bookTitles = new ArrayList<>();

        // 5. Khóa bi quan từng đầu sách (Pessimistic Write Lock), kiểm tra tồn kho và trừ availableQuantity
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

            Book book = bookRepository.findByIdForUpdate(bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", bookId));

            if (book.getAvailableQuantity() == null || book.getAvailableQuantity() <= 0) {
                throw new BadRequestException("Sách '" + book.getTitle() + "' hiện đã hết bản khả dụng trong kho");
            }

            book.setAvailableQuantity(book.getAvailableQuantity() - 1);
            bookRepository.save(book);

            BorrowDetail detail = BorrowDetail.builder()
                    .book(book)
                    .dueDate(request.getPickupDate().plusDays(14))
                    .renewalCount(0)
                    .status(BorrowDetailStatus.BORROWING)
                    .build();
            order.addDetail(detail);

            bookTitles.add(book.getTitle());
            borrowedBooksInfo.add(Map.of(
                    "id", book.getId(),
                    "title", book.getTitle(),
                    "documentCode", book.getDocumentCode() != null ? book.getDocumentCode() : "",
                    "shelfLocation", book.getShelfLocation() != null ? book.getShelfLocation().name() : ""
            ));
        }

        BorrowOrder savedOrder = borrowOrderRepository.save(order);

        // 6. Sinh mã QR Base64 cho đơn mượn
        String qrBase64 = "data:image/png;base64," +
                qrService.generateBorrowQrBase64(savedOrder.getId(), currentUser.getUsername(), bookTitles);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("orderId", savedOrder.getId());
        responseData.put("orderCode", savedOrder.getOrderCode());
        responseData.put("status", savedOrder.getStatus().name());
        responseData.put("pickupDate", savedOrder.getPickupDate());
        responseData.put("qrCodeBase64", qrBase64);
        responseData.put("books", borrowedBooksInfo);

        // Phát thông báo WebSocket thời gian thực cho màn hình Thủ thư
        messagingTemplate.convertAndSend("/topic/orders", Map.of(
                "event", "NEW_BORROW_ORDER",
                "orderCode", savedOrder.getOrderCode(),
                "studentName", currentUser.getFullName(),
                "bookCount", borrowedBooksInfo.size()
        ));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đặt mượn sách thành công! Vui lòng mang mã QR đến quầy để nhận sách", responseData));
    }

    /**
     * Lấy danh sách các cuốn sách sinh viên đang cầm (để gia hạn hoặc tạo phiếu hẹn trả sớm)
     */
    @GetMapping("/my-loans")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyActiveLoans(
            @AuthenticationPrincipal User currentUser
    ) {
        List<BorrowDetail> details = borrowDetailRepository.findByBorrowOrderUserIdOrderByCreatedAtDesc(currentUser.getId());
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> result = details.stream()
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

        return ResponseEntity.ok(ApiResponse.success("Danh sách sách đang mượn của sinh viên", result));
    }

    /**
     * Lấy danh sách lịch sử các đơn mượn của sinh viên đang đăng nhập
     */
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<BorrowOrder>>> getMyOrders(
            @AuthenticationPrincipal User currentUser
    ) {
        List<BorrowOrder> orders = borrowOrderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Danh sách đơn mượn của bạn", orders));
    }

    /**
     * Gia hạn sách trực tuyến (+7 ngày, tối đa 2 lần khi sách chưa quá hạn)
     */
    @PostMapping("/{borrowDetailId}/renew")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> renewBorrowedBook(
            @PathVariable Long borrowDetailId,
            @AuthenticationPrincipal User currentUser
    ) {
        BorrowDetail detail = borrowDetailRepository.findById(borrowDetailId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết mượn sách", "id", borrowDetailId));

        if (!detail.getBorrowOrder().getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền gia hạn cuốn sách của người khác");
        }

        if (detail.getStatus() != BorrowDetailStatus.BORROWING) {
            throw new BadRequestException("Chỉ có thể gia hạn sách đang trong trạng thái Đang mượn (BORROWING)");
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
        responseData.put("oldDueDate", oldDueDate);
        responseData.put("newDueDate", newDueDate);
        responseData.put("renewalCount", detail.getRenewalCount());

        return ResponseEntity.ok(ApiResponse.success("Gia hạn sách trực tuyến thành công (+7 ngày)", responseData));
    }

    /**
     * Hủy đơn đặt mượn (khi chưa nhận sách) và cộng hoàn lại số lượng khả dụng vào kho
     */
    @PostMapping("/{orderId}/cancel")
    @Transactional
    public ResponseEntity<ApiResponse<BorrowOrder>> cancelBorrowOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser
    ) {
        BorrowOrder order = borrowOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mượn", "id", orderId));

        boolean isLibrarian = currentUser.getRole().name().equals("LIBRARIAN");
        if (!isLibrarian && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền hủy đơn mượn này");
        }

        if (order.getStatus() == BorrowOrderStatus.BORROWED || order.getStatus() == BorrowOrderStatus.RETURNED
                || order.getStatus() == BorrowOrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể hủy đơn mượn đang ở trạng thái: " + order.getStatus());
        }

        // Hoàn trả lại số lượng khả dụng cho từng cuốn sách trong đơn
        for (BorrowDetail detail : order.getBorrowDetails()) {
            Book book = detail.getBook();
            book.setAvailableQuantity(book.getAvailableQuantity() + 1);
            bookRepository.save(book);
            detail.setStatus(BorrowDetailStatus.RETURNED);
        }

        order.setStatus(BorrowOrderStatus.CANCELLED);
        BorrowOrder savedOrder = borrowOrderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.success("Đã hủy đơn mượn và hoàn lại sách vào kho", savedOrder));
    }

    /**
     * Danh sách tất cả đơn mượn cho Thủ thư (có tìm kiếm theo mã đơn / tên SV và lọc trạng thái)
     */
    @GetMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Page<BorrowOrder>>> getAllBorrowOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BorrowOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        Page<BorrowOrder> orders = borrowOrderRepository.searchBorrowOrders(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Danh sách đơn mượn toàn hệ thống", orders));
    }

    /**
     * Thủ thư cập nhật trạng thái chuẩn bị đơn (NEW -> PROCESSING -> READY_FOR_PICKUP)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Transactional
    public ResponseEntity<ApiResponse<BorrowOrder>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam BorrowOrderStatus status
    ) {
        BorrowOrder order = borrowOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mượn", "id", orderId));

        order.setStatus(status);
        BorrowOrder updated = borrowOrderRepository.save(order);

        messagingTemplate.convertAndSend("/topic/orders", Map.of(
                "event", "ORDER_STATUS_UPDATED",
                "orderCode", updated.getOrderCode(),
                "status", updated.getStatus().name()
        ));

        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn mượn thành công", updated));
    }

    private String generateOrderCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = 1000 + new Random().nextInt(9000);
        return "OD-" + datePart + "-" + randomPart;
    }

    // ==================== DTO Request Classes ====================

    @Data
    public static class CreateBorrowRequest {
        @NotEmpty(message = "Danh sách sách mượn không được để trống")
        private List<Long> bookIds;

        @NotNull(message = "Ngày hẹn lấy sách không được để trống")
        private LocalDate pickupDate;

        private String note;
    }
}

