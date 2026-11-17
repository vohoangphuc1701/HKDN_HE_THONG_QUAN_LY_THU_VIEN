package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.entity.User;
import com.library.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý Xác thực & Định danh người dùng (JWT Authentication)
 * Hỗ trợ 2 vai trò: STUDENT (Sinh viên) và LIBRARIAN (Thủ thư kiêm Quản trị viên)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng nhập hệ thống và nhận chuỗi JWT Bearer Token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> responseData = authService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", responseData));
    }

    /**
     * Đăng ký tài khoản Sinh viên mới (Mặc định Role = STUDENT, Status = ACTIVE)
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> responseData = authService.register(
                request.getUsername(),
                request.getPassword(),
                request.getFullName(),
                request.getEmail(),
                request.getPhone()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng ký tài khoản thành công", responseData));
    }

    /**
     * Lấy thông tin cá nhân của người dùng hiện đang đăng nhập từ JWT Token
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        Map<String, Object> userSummary = authService.buildUserSummary(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Thông tin tài khoản hiện tại", userSummary));
    }

    // ==================== DTO Request Classes ====================

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Tên đăng nhập không được để trống")
        private String username;

        @NotBlank(message = "Mật khẩu không được để trống")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Tên đăng nhập (MSSV) không được để trống")
        @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
        private String username;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 ký tự trở lên")
        private String password;

        @NotBlank(message = "Họ và tên không được để trống")
        private String fullName;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;

        private String phone;
    }
}
