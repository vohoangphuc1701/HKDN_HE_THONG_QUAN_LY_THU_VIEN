package com.library.service;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.config.JwtProvider;
import com.library.entity.User;
import com.library.enums.Role;
import com.library.enums.UserStatus;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Service xử lý nghiệp vụ Xác thực, Đăng ký tài khoản và Cấp phát JWT Token
 * Phân quyền 2 vai trò: STUDENT (Sinh viên) và LIBRARIAN (Thủ thư kiêm Quản trị viên)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String SAMPLE_PLACEHOLDER_HASH = "$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGH";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * Xác thực đăng nhập (hỗ trợ đăng nhập bằng username hoặc email) và cấp phát JWT Token
     */
    @Transactional
    public Map<String, Object> login(String usernameOrEmail, String rawPassword) {
        String identifier = usernameOrEmail.trim();

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Thủ thư để được hỗ trợ");
        }

        boolean isValidPassword = verifyPasswordAndUpgradeIfSeed(user, rawPassword);
        if (!isValidPassword) {
            throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        return issueAuthResponse(user);
    }

    /**
     * Đăng ký tài khoản Sinh viên mới (Mặc định Role = STUDENT, Status = ACTIVE)
     * và tự động cấp JWT Token ngay sau khi đăng ký thành công
     */
    @Transactional
    public Map<String, Object> register(
            String username,
            String rawPassword,
            String fullName,
            String email,
            String phone
    ) {
        String cleanUsername = username.trim();
        String cleanEmail = email.trim().toLowerCase();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new BadRequestException("Tên đăng nhập (MSSV) '" + cleanUsername + "' đã tồn tại");
        }

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' đã được sử dụng");
        }

        User newUser = User.builder()
                .username(cleanUsername)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(fullName.trim())
                .email(cleanEmail)
                .phone(phone != null ? phone.trim() : null)
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        return issueAuthResponse(savedUser);
    }

    /**
     * Cấp phát JWT Token và đóng gói thông tin phản hồi chuẩn cho Client
     */
    public Map<String, Object> issueAuthResponse(User user) {
        String token = jwtProvider.generateToken(user);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("token", token);
        responseData.put("tokenType", "Bearer");
        responseData.put("user", buildUserSummary(user));
        return responseData;
    }

    /**
     * Trích xuất thông tin hồ sơ người dùng hiện tại (ẩn trường password)
     */
    public Map<String, Object> buildUserSummary(User user) {
        if (user == null) {
            throw new ResourceNotFoundException("Không tìm thấy phiên đăng nhập hiện tại");
        }
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

    /**
     * Kiểm tra mật khẩu bằng BCrypt.
     * Nếu tài khoản trong CSDL đang dùng chuỗi hash mẫu của schema.sql và người dùng nhập '123456',
     * tự động nâng cấp sang chuỗi băm BCrypt thật trong CSDL.
     */
    private boolean verifyPasswordAndUpgradeIfSeed(User user, String rawPassword) {
        String storedPassword = user.getPassword();
        if (storedPassword == null) {
            return false;
        }

        if (passwordEncoder.matches(rawPassword, storedPassword)) {
            return true;
        }

        // Hỗ trợ tài khoản seed mẫu trong schema.sql (mật khẩu mặc định: 123456)
        if (SAMPLE_PLACEHOLDER_HASH.equals(storedPassword) && "123456".equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        // Hỗ trợ trường hợp mật khẩu lưu dạng plain text khi test thủ công trong SSMS
        if (!storedPassword.startsWith("$2a$") && storedPassword.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }
}
