package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.entity.ReturnTicket;
import com.library.entity.User;
import com.library.enums.ReturnTicketStatus;
import com.library.service.ReturnService;
import com.library.service.ReturnService.ReturnItemInspection;
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
 * Controller xử lý Quy trình Hẹn Trả Sách Sớm & Đối Soát Nhận Trả Tại Quầy (ReturnTicket Flow)
 * Ủy quyền xử lý nghiệp vụ cho ReturnService theo chuẩn kiến trúc 3 tầng
 */
@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    /**
     * Sinh viên tạo phiếu hẹn trả sách kèm mã QR (Validate scheduledReturnDate <= dueDate)
     */
    @PostMapping("/create-ticket")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReturnTicket(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateReturnTicketRequest request
    ) {
        Map<String, Object> responseData = returnService.createReturnTicket(
                currentUser,
                request.getBorrowDetailIds(),
                request.getScheduledReturnDate()
        );
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
        List<ReturnTicket> tickets = returnService.getMyReturnTickets(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Danh sách phiếu hẹn trả của bạn", tickets));
    }

    /**
     * Thủ thư tra cứu phiếu hẹn trả theo mã phiếu (ticketCode) khi quét QR tại quầy
     */
    @GetMapping("/code/{ticketCode}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReturnTicket>> getReturnTicketByCode(@PathVariable String ticketCode) {
        ReturnTicket ticket = returnService.getReturnTicketByCode(ticketCode);
        return ResponseEntity.ok(ApiResponse.success("Thông tin phiếu hẹn trả", ticket));
    }

    /**
     * Thủ thư xem danh sách toàn bộ phiếu hẹn trả (có phân trang và lọc trạng thái)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReturnTicket>>> getAllReturnTickets(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReturnTicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<ReturnTicket> tickets = returnService.getAllReturnTickets(keyword, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Danh sách phiếu hẹn trả toàn hệ thống", tickets));
    }

    /**
     * Thủ thư đối soát tình trạng sách vật lý, hoàn tất nhận trả sách tại quầy & cập nhật tồn kho
     */
    @PostMapping("/{ticketId}/complete")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeReturnTicket(
            @PathVariable Long ticketId,
            @RequestBody(required = false) CompleteReturnRequest request
    ) {
        List<ReturnItemInspection> items = (request != null) ? request.getItems() : null;
        String librarianNote = (request != null) ? request.getLibrarianNote() : null;

        Map<String, Object> responseData = returnService.completeReturnTicket(ticketId, items, librarianNote);
        return ResponseEntity.ok(ApiResponse.success("Hoàn tất nhận trả sách và đối soát thành công", responseData));
    }

    /**
     * Hủy phiếu hẹn trả khi đang ở trạng thái PENDING_RETURN
     */
    @PostMapping("/{ticketId}/cancel")
    public ResponseEntity<ApiResponse<ReturnTicket>> cancelReturnTicket(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal User currentUser
    ) {
        ReturnTicket saved = returnService.cancelReturnTicket(ticketId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy phiếu hẹn trả sách", saved));
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
}
