package com.library.controller;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.common.response.ApiResponse;
import com.library.entity.*;
import com.library.enums.*;
import com.library.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller xử lý Nghiệp vụ Quầy Thủ Thư, Quét QR Thời Gian Thực, Thu Phạt & Dashboard Thống Kê
 * - Bàn giao sách tại quầy bằng mã QR (< 30 giây) kèm đồng bộ WebSocket STOMP
 * - Tra cứu mã QR tự động nhận diện Đơn mượn (OD-...) hoặc Phiếu trả (RT-...)
 * - Quản lý thu tiền phạt (CASH / TRANSFER) và thống kê Dashboard toàn hệ thống
 */
@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationController {

    private static final int STANDARD_BORROW_DAYS = 14;

    private final BorrowOrderRepository borrowOrderRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final ReturnTicketRepository returnTicketRepository;
    private final FineRepository fineRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Thủ thư quét QR đơn mượn để bàn giao sách tại quầy:
     * Chuyển đơn sang BORROWED, ghi nhận actualPickupDate = NOW(), thiết lập hạn trả dueDate = NOW() + 14 ngày
     */
    @PostMapping("/handover")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> handoverBorrowOrder(
            @RequestParam String orderCode
    ) {
        BorrowOrder order = borrowOrderRepository.findByOrderCode(orderCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mượn", "orderCode", orderCode));

        if (order.getStatus() == BorrowOrderStatus.BORROWED) {
            throw new BadRequestException("Đơn mượn '" + orderCode + "' đã được bàn giao sách trước đó");
        }
        if (order.getStatus() == BorrowOrderStatus.CANCELLED || order.getStatus() == BorrowOrderStatus.RETURNED) {
            throw new BadRequestException("Không thể bàn giao đơn mượn đang ở trạng thái: " + order.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDate dueDate = LocalDate.now().plusDays(STANDARD_BORROW_DAYS);

        order.setStatus(BorrowOrderStatus.BORROWED);
        order.setActualPickupDate(now);

        for (BorrowDetail detail : order.getBorrowDetails()) {
            detail.setDueDate(dueDate);
            detail.setStatus(BorrowDetailStatus.BORROWING);
            borrowDetailRepository.save(detail);
        }

        BorrowOrder savedOrder = borrowOrderRepository.save(order);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("orderId", savedOrder.getId());
        responseData.put("orderCode", savedOrder.getOrderCode());
        responseData.put("studentName", savedOrder.getUser().getFullName());
        responseData.put("studentUsername", savedOrder.getUser().getUsername());
        responseData.put("status", savedOrder.getStatus().name());
        responseData.put("actualPickupDate", savedOrder.getActualPickupDate());
        responseData.put("dueDate", dueDate);
        responseData.put("bookCount", savedOrder.getBorrowDetails().size());

        // Bắn sự kiện WebSocket cập nhật trực tiếp lên Trạm quét tại quầy
        messagingTemplate.convertAndSend("/topic/scan-station", Map.of(
                "event", "HANDOVER_SUCCESS",
                "orderCode", savedOrder.getOrderCode(),
                "studentName", savedOrder.getUser().getFullName(),
                "dueDate", dueDate.toString()
        ));

        return ResponseEntity.ok(ApiResponse.success("Quét QR bàn giao sách thành công!", responseData));
    }

    /**
     * API nhận diện thông minh khi máy quét QR tại quầy quét mã bất kỳ (OD-... hoặc RT-...)
     * và đẩy thông tin thời gian thực lên màn hình máy tính của Thủ thư qua WebSocket
     */
    @GetMapping("/scan-lookup")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanLookup(@RequestParam String code) {
        String trimmedCode = code.trim();
        Map<String, Object> payload = new LinkedHashMap<>();

        Optional<BorrowOrder> borrowOpt = borrowOrderRepository.findByOrderCode(trimmedCode);
        if (borrowOpt.isPresent()) {
            BorrowOrder order = borrowOpt.get();
            payload.put("scanType", "BORROW_ORDER");
            payload.put("code", order.getOrderCode());
            payload.put("order", order);
            messagingTemplate.convertAndSend("/topic/scan-station", payload);
            return ResponseEntity.ok(ApiResponse.success("Đã nhận diện mã QR Đơn mượn sách", payload));
        }

        Optional<ReturnTicket> returnOpt = returnTicketRepository.findByTicketCode(trimmedCode);
        if (returnOpt.isPresent()) {
            ReturnTicket ticket = returnOpt.get();
            payload.put("scanType", "RETURN_TICKET");
            payload.put("code", ticket.getTicketCode());
            payload.put("ticket", ticket);
            messagingTemplate.convertAndSend("/topic/scan-station", payload);
            return ResponseEntity.ok(ApiResponse.success("Đã nhận diện mã QR Phiếu hẹn trả sách", payload));
        }

        throw new ResourceNotFoundException("Không tìm thấy Đơn mượn hoặc Phiếu trả nào khớp với mã QR: " + trimmedCode);
    }

    /**
     * Danh sách biên lai phạt cho Thủ thư (hỗ trợ tìm kiếm và lọc UNPAID / PAID)
     */
    @GetMapping("/fines")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Page<Fine>>> getAllFines(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) FineStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        Page<Fine> fines = fineRepository.searchFines(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Danh sách biên lai tiền phạt", fines));
    }

    /**
     * Sinh viên tra cứu biên lai tiền phạt của chính mình
     */
    @GetMapping("/fines/my-fines")
    @PreAuthorize("hasAnyRole('STUDENT', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<List<Fine>>> getMyFines(@AuthenticationPrincipal User currentUser) {
        List<Fine> myFines = fineRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Lịch sử biên lai phạt của bạn", myFines));
    }

    /**
     * Thủ thư xác nhận thu tiền phạt tại quầy (CASH hoặc TRANSFER) -> mở khóa quyền mượn sách cho sinh viên
     */
    @PostMapping("/fines/{fineId}/pay")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Transactional
    public ResponseEntity<ApiResponse<Fine>> payFine(
            @PathVariable Long fineId,
            @RequestParam(defaultValue = "CASH") PaymentMethod paymentMethod
    ) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Biên lai phạt", "id", fineId));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new BadRequestException("Biên lai phạt '" + fine.getFineCode() + "' đã được thanh toán trước đó");
        }

        fine.setStatus(FineStatus.PAID);
        fine.setPaymentMethod(paymentMethod);
        fine.setPaymentDate(LocalDateTime.now());

        Fine savedFine = fineRepository.save(fine);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thanh toán tiền phạt thành công", savedFine));
    }

    /**
     * Số liệu tổng hợp Dashboard cho Thủ thư / Quản trị viên
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview() {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("totalBookTitles", bookRepository.count());
        stats.put("totalPhysicalBooks", bookRepository.sumTotalQuantity());
        stats.put("availableBooks", bookRepository.sumAvailableQuantity());
        stats.put("outOfStockTitles", bookRepository.countByAvailableQuantityEquals(0));

        stats.put("totalStudents", userRepository.countByRole(Role.STUDENT));
        stats.put("newOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.NEW));
        stats.put("readyForPickupCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.READY_FOR_PICKUP));
        stats.put("activeBorrowedOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.BORROWED));

        stats.put("borrowingItemsCount", borrowDetailRepository.countByStatus(BorrowDetailStatus.BORROWING));
        stats.put("overdueItemsCount", borrowDetailRepository.countByStatus(BorrowDetailStatus.OVERDUE));
        stats.put("pendingReturnTicketsCount", returnTicketRepository.countByStatus(ReturnTicketStatus.PENDING_RETURN));

        stats.put("unpaidFinesTotal", fineRepository.sumTotalAmountByStatus(FineStatus.UNPAID));
        stats.put("collectedFinesTotal", fineRepository.sumTotalAmountByStatus(FineStatus.PAID));

        List<Map<String, Object>> topBooks = borrowDetailRepository.findTopBorrowedBooks(PageRequest.of(0, 5))
                .stream()
                .map(row -> {
                    Book b = (Book) row[0];
                    Long count = (Long) row[1];
                    return Map.<String, Object>of(
                            "bookId", b.getId(),
                            "title", b.getTitle(),
                            "author", b.getAuthor(),
                            "category", b.getCategory(),
                            "borrowCount", count
                    );
                })
                .toList();
        stats.put("topBorrowedBooks", topBooks);

        return ResponseEntity.ok(ApiResponse.success("Số liệu tổng quan hệ thống thư viện", stats));
    }
}

