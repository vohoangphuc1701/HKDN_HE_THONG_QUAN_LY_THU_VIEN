package com.library.controller;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.common.response.ApiResponse;
import com.library.config.JwtProvider;
import com.library.entity.User;
import com.library.enums.Role;
import com.library.enums.UserStatus;
import com.library.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller xử lý Xác thực & Định danh người dùng (JWT Authentication)
 * Hỗ trợ 2 vai trò: STUDENT (Sinh viên) và LIBRARIAN (Thủ thư kiêm Quản trị viên)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * Đăng nhập hệ thống và nhận chuỗi JWT Bearer Token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Thủ thư");
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword())
                || request.getPassword().equals(user.getPassword());

        if (!passwordMatches) {
            throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        String token = jwtProvider.generateToken(user);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("token", token);
        responseData.put("tokenType", "Bearer");
        responseData.put("user", buildUserSummary(user));

        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", responseData));
    }

    /**
     * Đăng ký tài khoản Sinh viên mới (Mặc định Role = STUDENT, Status = ACTIVE)
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Tên đăng nhập (MSSV) '" + username + "' đã tồn tại");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email '" + email + "' đã được sử dụng");
        }

        User newUser = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(request.getPhone())
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        String token = jwtProvider.generateToken(savedUser);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("token", token);
        responseData.put("tokenType", "Bearer");
        responseData.put("user", buildUserSummary(savedUser));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng ký tài khoản thành công", responseData));
    }

    /**
     * Lấy thông tin cá nhân của người dùng hiện đang đăng nhập từ JWT Token
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new ResourceNotFoundException("Không tìm thấy phiên đăng nhập hiện tại");
        }
        return ResponseEntity.ok(ApiResponse.success("Thông tin tài khoản hiện tại", buildUserSummary(currentUser)));
    }

    private Map<String, Object> buildUserSummary(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("fullName", user.getFullName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole().name());
        map.put("status", user.getStatus().name());
        return map;
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

