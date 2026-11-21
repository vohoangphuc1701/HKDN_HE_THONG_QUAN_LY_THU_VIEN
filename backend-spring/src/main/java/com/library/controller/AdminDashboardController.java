package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.entity.User;
import com.library.enums.Role;
import com.library.enums.UserStatus;
import com.library.service.DashboardService;
import com.library.service.DashboardService.CreateLibrarianRequest;
import com.library.service.DashboardService.InventoryBookRequest;
import com.library.service.DashboardService.UpdateLibrarianRequest;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller cung cấp API cho Cổng Quản Trị Thủ Thư & Quản Trị Viên (frontend-admin - TV6)
 * - LIBRARIAN & ADMIN: Dashboard thống kê, Quản lý Kho sách, Quản lý Sinh viên
 * - CHỈ ADMIN: Thêm / Sửa / Xóa Thủ thư, Đặt lại mật khẩu và Phân quyền người dùng (STUDENT / LIBRARIAN / ADMIN)
 */
@RestController
@RequestMapping({"/api/admin", "/api/dashboard"})
@PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    // ==================== 1. DASHBOARD OVERVIEW & ANALYTICS ====================

    /**
     * Lấy toàn bộ chỉ số KPI tổng quan, thống kê đơn mượn, tiền phạt và dữ liệu biểu đồ cho Dashboard
     */
    @GetMapping({"", "/overview", "/stats"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview() {
        Map<String, Object> stats = dashboardService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success("Lấy dữ liệu tổng quan Dashboard thành công", stats));
    }

    // ==================== 2. QUẢN LÝ KHO SÁCH (/api/admin/inventory) ====================

    @GetMapping("/inventory")
    public ResponseEntity<List<Map<String, Object>>> getInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(dashboardService.getInventory(search, category, status));
    }

    @GetMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> getInventoryBookById(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getInventoryBookById(id));
    }

    @PostMapping("/inventory")
    public ResponseEntity<Map<String, Object>> createInventoryBook(@RequestBody InventoryBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dashboardService.createInventoryBook(request));
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> updateInventoryBook(
            @PathVariable Long id,
            @RequestBody InventoryBookRequest request
    ) {
        return ResponseEntity.ok(dashboardService.updateInventoryBook(id, request));
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryBook(@PathVariable Long id) {
        dashboardService.deleteInventoryBook(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đầu sách thành công", null));
    }

    // ==================== 3. QUẢN LÝ NGƯỜI DÙNG (/api/admin/users) ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<User> users = dashboardService.getUsers(keyword, role, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Danh sách tài khoản người dùng", users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status,
            @AuthenticationPrincipal User currentUser
    ) {
        User updated = dashboardService.updateUserStatus(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công", updated));
    }

    // ==================== 4. QUẢN LÝ THỦ THƯ & PHÂN QUYỀN (CHỈ DÀNH CHO ADMIN) ====================

    /**
     * Lấy danh sách tài khoản Thủ thư (Chỉ ADMIN)
     */
    @GetMapping("/librarians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<User>>> getLibrarians(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<User> librarians = dashboardService.getLibrarians(keyword, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Danh sách tài khoản Thủ thư", librarians));
    }

    /**
     * Thêm mới tài khoản Thủ thư (Chỉ ADMIN)
     */
    @PostMapping("/librarians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createLibrarian(
            @Valid @RequestBody CreateLibrarianRequest request
    ) {
        User created = dashboardService.createLibrarian(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo tài khoản Thủ thư thành công", created));
    }

    /**
     * Chỉnh sửa thông tin tài khoản Thủ thư (Chỉ ADMIN)
     */
    @PutMapping("/librarians/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateLibrarian(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLibrarianRequest request
    ) {
        User updated = dashboardService.updateLibrarian(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin Thủ thư thành công", updated));
    }

    /**
     * Xóa tài khoản Thủ thư (Chỉ ADMIN)
     */
    @DeleteMapping("/librarians/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLibrarian(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentAdmin
    ) {
        dashboardService.deleteLibrarian(id, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tài khoản Thủ thư thành công", null));
    }

    /**
     * Đặt lại mật khẩu cho Thủ thư (Chỉ ADMIN)
     */
    @PatchMapping("/librarians/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetLibrarianPassword(
            @PathVariable Long id,
            @RequestBody ResetPasswordRequest request
    ) {
        dashboardService.resetLibrarianPassword(id, request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đã đặt lại mật khẩu cho Thủ thư thành công", null));
    }

    /**
     * Phân quyền / thay đổi vai trò của người dùng: STUDENT <-> LIBRARIAN <-> ADMIN (Chỉ ADMIN)
     */
    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role,
            @AuthenticationPrincipal User currentAdmin
    ) {
        User updated = dashboardService.updateUserRole(id, role, currentAdmin);
        return ResponseEntity.ok(ApiResponse.success("Phân quyền người dùng thành công (Vai trò mới: " + role.name() + ")", updated));
    }

    @Data
    public static class ResetPasswordRequest {
        private String newPassword;
    }
}
