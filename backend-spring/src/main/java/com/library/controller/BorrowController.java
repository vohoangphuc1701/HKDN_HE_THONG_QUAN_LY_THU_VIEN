package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.entity.BorrowOrder;
import com.library.entity.User;
import com.library.enums.BorrowOrderStatus;
import com.library.service.BorrowService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý toàn bộ Quy trình Mượn Sách & Gia Hạn Trực Tuyến (Borrows Flow)
 * Ủy quyền xử lý nghiệp vụ cho BorrowService theo chuẩn kiến trúc 3 tầng
 */
@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    /**
     * Sinh viên đặt mượn sách trực tuyến (Trừ availableQuantity ngay lập tức và sinh mã QR nhận sách)
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBorrowOrder(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateBorrowRequest request
    ) {
        Map<String, Object> responseData = borrowService.createBorrowOrder(
                currentUser,
                request.getBookIds(),
                request.getPickupDate(),
                request.getNote()
        );
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
        List<Map<String, Object>> result = borrowService.getMyActiveLoans(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Danh sách sách đang mượn của sinh viên", result));
    }

    /**
     * Lấy danh sách lịch sử các đơn mượn của sinh viên đang đăng nhập
     */
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<BorrowOrder>>> getMyOrders(
            @AuthenticationPrincipal User currentUser
    ) {
        List<BorrowOrder> orders = borrowService.getMyOrders(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Danh sách đơn mượn của bạn", orders));
    }

    /**
     * Gia hạn sách trực tuyến (+7 ngày, tối đa 2 lần khi sách chưa quá hạn)
     */
    @PostMapping("/{borrowDetailId}/renew")
    public ResponseEntity<ApiResponse<Map<String, Object>>> renewBorrowedBook(
            @PathVariable Long borrowDetailId,
            @AuthenticationPrincipal User currentUser
    ) {
        Map<String, Object> responseData = borrowService.renewBorrowedBook(borrowDetailId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Gia hạn sách trực tuyến thành công (+7 ngày)", responseData));
    }

    /**
     * Hủy đơn đặt mượn (khi chưa nhận sách) và cộng hoàn lại số lượng khả dụng vào kho
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<BorrowOrder>> cancelBorrowOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser
    ) {
        BorrowOrder savedOrder = borrowService.cancelBorrowOrder(orderId, currentUser);
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
        Page<BorrowOrder> orders = borrowService.getAllBorrowOrders(keyword, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Danh sách đơn mượn toàn hệ thống", orders));
    }

    /**
     * Thủ thư cập nhật trạng thái chuẩn bị đơn (NEW -> PROCESSING -> READY_FOR_PICKUP)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<BorrowOrder>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam BorrowOrderStatus status
    ) {
        BorrowOrder updated = borrowService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn mượn thành công", updated));
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
