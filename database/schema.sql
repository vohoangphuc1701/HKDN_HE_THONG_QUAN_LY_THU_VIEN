-- ==============================================================================
-- CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ THƯ VIỆN ĐẠI HỌC GTVT TP.HCM (UTH LIBRARY)
-- Hệ quản trị CSDL: MySQL 8.0+
-- Tên Database: library_db
-- Mô tả: Script khởi tạo cấu trúc bảng (DDL Schema) - Không chứa dữ liệu mẫu
-- ==============================================================================

-- 1. TẠO CSDL VÀ CHỌN DATABASE
CREATE DATABASE IF NOT EXISTS `library_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `library_db`;

-- Tắt kiểm tra khóa ngoại tạm thời để xóa bảng cũ (nếu có) theo bất kỳ thứ tự nào
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `fines`;
DROP TABLE IF EXISTS `return_details`;
DROP TABLE IF EXISTS `return_tickets`;
DROP TABLE IF EXISTS `borrow_details`;
DROP TABLE IF EXISTS `borrow_orders`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 2. BẢNG USERS (Tài khoản người dùng: Sinh viên và Thủ thư)
-- Phân quyền 2 vai trò: STUDENT và LIBRARIAN
-- ==============================================================================
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tên đăng nhập (Mã SV hoặc mã NV)',
    `password` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu mã hóa BCrypt',
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên người dùng',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email liên hệ/nhận thông báo',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Số điện thoại',
    `role` VARCHAR(20) NOT NULL COMMENT 'Vai trò: STUDENT, LIBRARIAN',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái: ACTIVE, LOCKED',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật',
    INDEX `idx_user_username` (`username`),
    INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng và phân quyền';

-- ==============================================================================
-- 3. BẢNG BOOKS (Danh mục kho sách)
-- Quản lý trực tiếp tổng số lượng (total_quantity), khả dụng (available_quantity)
-- và vị trí kệ sách (shelf_location: A1, A2, B1, B2, C1, C2, D1)
-- ==============================================================================
CREATE TABLE `books` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT 'Tên đầu sách giáo trình/tài liệu',
    `author` VARCHAR(150) NOT NULL COMMENT 'Tác giả chính / Chủ biên',
    `category` VARCHAR(100) NOT NULL COMMENT 'Chuyên ngành/thể loại',
    `document_code` VARCHAR(50) DEFAULT NULL COMMENT 'Mã tài liệu / Phân loại thư viện',
    `shelf_location` VARCHAR(50) DEFAULT NULL COMMENT 'Vị trí kệ sách (A1, A2, B1, B2, C1, C2, D1)',
    `publisher` VARCHAR(150) DEFAULT NULL COMMENT 'Nhà xuất bản',
    `publish_year` INT DEFAULT NULL COMMENT 'Năm xuất bản',
    `description` TEXT DEFAULT NULL COMMENT 'Tóm tắt nội dung sách',
    `cover_image` VARCHAR(500) DEFAULT NULL COMMENT 'Đường dẫn ảnh bìa sách',
    `total_quantity` INT NOT NULL DEFAULT 0 COMMENT 'Tổng số lượng sách trong kho thư viện',
    `available_quantity` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng sách còn sẵn để cho mượn',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_book_title` (`title`),
    INDEX `idx_book_author` (`author`),
    INDEX `idx_book_category` (`category`),
    INDEX `idx_book_document_code` (`document_code`),
    INDEX `idx_book_shelf_location` (`shelf_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng danh mục sách và tồn kho';

-- ==============================================================================
-- 4. BẢNG BORROW_ORDERS (Đơn đặt mượn sách trực tuyến)
-- Vòng đời: NEW -> PROCESSING -> READY_FOR_PICKUP -> BORROWED -> RETURNED / CANCELLED
-- ==============================================================================
CREATE TABLE `borrow_orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã đơn mượn duy nhất (VD: BR-2026-0001)',
    `user_id` BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu sinh viên mượn sách',
    `pickup_date` DATE NOT NULL COMMENT 'Ngày hẹn sinh viên lên quầy nhận sách',
    `actual_pickup_date` DATETIME DEFAULT NULL COMMENT 'Thời điểm thủ thư quét QR bàn giao sách thực tế',
    `status` VARCHAR(30) NOT NULL DEFAULT 'NEW' COMMENT 'NEW, PROCESSING, READY_FOR_PICKUP, BORROWED, RETURNED, CANCELLED',
    `note` VARCHAR(500) DEFAULT NULL COMMENT 'Ghi chú đơn mượn',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_borrow_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_borrow_order_code` (`order_code`),
    INDEX `idx_borrow_order_user` (`user_id`),
    INDEX `idx_borrow_order_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đơn mượn sách';

-- ==============================================================================
-- 5. BẢNG BORROW_DETAILS (Chi tiết từng cuốn sách trong đơn mượn)
-- Quản lý hạn trả, số lần gia hạn (tối đa 1 lần / +14 ngày)
-- ==============================================================================
CREATE TABLE `borrow_details` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `borrow_order_id` BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu đơn mượn',
    `book_id` BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu sách',
    `due_date` DATE DEFAULT NULL COMMENT 'Hạn chót phải trả sách',
    `actual_return_date` DATETIME DEFAULT NULL COMMENT 'Thời điểm hoàn tất trả sách thực tế',
    `renewal_count` INT NOT NULL DEFAULT 0 COMMENT 'Số lần đã gia hạn (tối đa 1)',
    `status` VARCHAR(30) NOT NULL DEFAULT 'BORROWING' COMMENT 'BORROWING, RETURNED, OVERDUE, LOST',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_borrow_detail_order` FOREIGN KEY (`borrow_order_id`) REFERENCES `borrow_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_borrow_detail_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_borrow_detail_order` (`borrow_order_id`),
    INDEX `idx_borrow_detail_book` (`book_id`),
    INDEX `idx_borrow_detail_status` (`status`),
    INDEX `idx_borrow_detail_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết các cuốn sách trong đơn mượn';

-- ==============================================================================
-- 6. BẢNG RETURN_TICKETS (Phiếu hẹn trả sách sớm có mã QR)
-- Vòng đời: PENDING_RETURN -> COMPLETED / CANCELLED
-- ==============================================================================
CREATE TABLE `return_tickets` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `ticket_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã phiếu trả sách (dùng tạo mã QR, VD: RT-2026-0001)',
    `user_id` BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu sinh viên hẹn trả',
    `scheduled_return_date` DATE NOT NULL COMMENT 'Ngày hẹn sinh viên mang sách lên quầy',
    `actual_return_date` DATETIME DEFAULT NULL COMMENT 'Thời điểm thủ thư quét QR nhận sách tại quầy',
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING_RETURN' COMMENT 'PENDING_RETURN, COMPLETED, CANCELLED',
    `librarian_note` VARCHAR(500) DEFAULT NULL COMMENT 'Ghi chú kiểm tra của thủ thư',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_return_ticket_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_return_ticket_code` (`ticket_code`),
    INDEX `idx_return_ticket_user` (`user_id`),
    INDEX `idx_return_ticket_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng phiếu hẹn trả sách mã QR';

-- ==============================================================================
-- 7. BẢNG RETURN_DETAILS (Chi tiết đối soát từng cuốn sách tại quầy trả)
-- Đánh giá tình trạng sách vật lý và phụ thu hư hại nếu có
-- ==============================================================================
CREATE TABLE `return_details` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `return_ticket_id` BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu phiếu hẹn trả',
    `borrow_detail_id` BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu cuốn sách đang mượn',
    `book_condition` VARCHAR(30) NOT NULL DEFAULT 'NORMAL' COMMENT 'NORMAL, TORN_COVER, DIRTY_PAGE, WATER_DAMAGED, LOST',
    `damage_fee` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Khoản phụ thu bồi thường hư hại sách (nếu có)',
    `note` VARCHAR(500) DEFAULT NULL COMMENT 'Mô tả chi tiết hư hại thực tế',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_return_detail_ticket` FOREIGN KEY (`return_ticket_id`) REFERENCES `return_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_return_detail_borrow` FOREIGN KEY (`borrow_detail_id`) REFERENCES `borrow_details` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_return_detail_ticket` (`return_ticket_id`),
    INDEX `idx_return_detail_borrow` (`borrow_detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết đối soát tình trạng sách khi trả';

-- ==============================================================================
-- 8. BẢNG FINES (Biên lai phạt quá hạn và phụ thu hư hại)
-- Công thức: total_amount = late_fee (5.000đ/ngày) + damage_fee
-- ==============================================================================
CREATE TABLE `fines` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `fine_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã biên lai thu phạt (VD: FN-2026-0001)',
    `user_id` BIGINT NOT NULL COMMENT 'Sinh viên bị tính phạt',
    `borrow_detail_id` BIGINT DEFAULT NULL COMMENT 'Sách mượn bị phạt (nếu phạt theo cuốn)',
    `return_ticket_id` BIGINT DEFAULT NULL COMMENT 'Phiếu trả liên quan (nếu phát sinh lúc trả sách)',
    `overdue_days` INT DEFAULT 0 COMMENT 'Số ngày quá hạn mượn',
    `late_fee` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Tiền phạt trễ hạn (5.000 VNĐ * số ngày)',
    `damage_fee` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Tiền bồi thường hư hại hoặc mất sách',
    `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền phải thanh toán',
    `status` VARCHAR(20) NOT NULL DEFAULT 'UNPAID' COMMENT 'UNPAID (chặn mượn sách mới), PAID',
    `payment_date` DATETIME DEFAULT NULL COMMENT 'Thời điểm thanh toán',
    `payment_method` VARCHAR(20) DEFAULT NULL COMMENT 'Phương thức: CASH (tiền mặt), TRANSFER (chuyển khoản/QR)',
    `note` VARCHAR(500) DEFAULT NULL COMMENT 'Ghi chú biên lai',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_fine_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_fine_borrow_detail` FOREIGN KEY (`borrow_detail_id`) REFERENCES `borrow_details` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_fine_return_ticket` FOREIGN KEY (`return_ticket_id`) REFERENCES `return_tickets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_fine_code` (`fine_code`),
    INDEX `idx_fine_user` (`user_id`),
    INDEX `idx_fine_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng biên lai thu phạt và bồi thường';
