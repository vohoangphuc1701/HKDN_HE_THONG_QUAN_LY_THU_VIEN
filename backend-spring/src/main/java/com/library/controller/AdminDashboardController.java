package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.entity.User;
import com.library.enums.Role;
import com.library.enums.UserStatus;
import com.library.service.DashboardService;
import com.library.service.DashboardService.InventoryBookRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller cung cấp API cho Cổng Quản Trị Thủ Thư / Admin (frontend-admin - TV6)
 * Ủy quyền xử lý nghiệp vụ cho DashboardService theo chuẩn kiến trúc 3 tầng
 */
@RestController
@RequestMapping({"/api/admin", "/api/dashboard"})
@PreAuthorize("hasRole('LIBRARIAN')")
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

    /**
     * Danh sách kho sách dành cho trang InventoryManagementPage.jsx (TV6)
     */
    @GetMapping("/inventory")
    public ResponseEntity<List<Map<String, Object>>> getInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(dashboardService.getInventory(search, category, status));
    }

    /**
     * Xem chi tiết 1 đầu sách trong kho theo ID
     */
    @GetMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> getInventoryBookById(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getInventoryBookById(id));
    }

    /**
     * Thêm mới 1 đầu sách từ giao diện Quản lý kho của Thủ thư
     */
    @PostMapping("/inventory")
    public ResponseEntity<Map<String, Object>> createInventoryBook(@RequestBody InventoryBookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dashboardService.createInventoryBook(request));
    }

    /**
     * Cập nhật đầu sách từ giao diện Quản lý kho của Thủ thư
     */
    @PutMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> updateInventoryBook(
            @PathVariable Long id,
            @RequestBody InventoryBookRequest request
    ) {
        return ResponseEntity.ok(dashboardService.updateInventoryBook(id, request));
    }

    /**
     * Xóa đầu sách khỏi kho
     */
    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryBook(@PathVariable Long id) {
        dashboardService.deleteInventoryBook(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đầu sách thành công", null));
    }

    // ==================== 3. QUẢN LÝ TÀI KHOẢN SINH VIÊN (/api/admin/users) ====================

    /**
     * Tra cứu danh sách tài khoản người dùng (Sinh viên & Thủ thư)
     */
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

    /**
     * Khóa hoặc mở khóa tài khoản sinh viên (ACTIVE <-> LOCKED)
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        User updated = dashboardService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công", updated));
    }
}
