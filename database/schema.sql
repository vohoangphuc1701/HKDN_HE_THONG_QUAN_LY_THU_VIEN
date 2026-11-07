-- ==============================================================================
-- CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ THƯ VIỆN ĐẠI HỌC GTVT TP.HCM (UTH LIBRARY)
-- Hệ quản trị CSDL: Microsoft SQL Server (SSMS)
-- Tên Database: library_db
-- Mô tả: Script khởi tạo cấu trúc CSDL và 7 bảng liên kết khóa chính - khóa ngoại
-- ==============================================================================

-- 1. TẠO CSDL NẾU CHƯA CÓ VÀ SỬ DỤNG
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'library_db')
BEGIN
    CREATE DATABASE library_db;
END
GO

USE library_db;
GO

-- 2. XÓA CÁC BẢNG CŨ (THEO THỨ TỰ TRÁNH LỖI KHÓA NGOẠI)
IF OBJECT_ID('dbo.fines', 'U') IS NOT NULL DROP TABLE dbo.fines;
IF OBJECT_ID('dbo.return_details', 'U') IS NOT NULL DROP TABLE dbo.return_details;
IF OBJECT_ID('dbo.return_tickets', 'U') IS NOT NULL DROP TABLE dbo.return_tickets;
IF OBJECT_ID('dbo.borrow_details', 'U') IS NOT NULL DROP TABLE dbo.borrow_details;
IF OBJECT_ID('dbo.borrow_orders', 'U') IS NOT NULL DROP TABLE dbo.borrow_orders;
IF OBJECT_ID('dbo.books', 'U') IS NOT NULL DROP TABLE dbo.books;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- ==============================================================================
-- 3. BẢNG USERS (Tài khoản người dùng: Sinh viên và Thủ thư)
-- ==============================================================================
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    role VARCHAR(20) NOT NULL CONSTRAINT chk_user_role CHECK (role IN ('STUDENT', 'LIBRARIAN')),
    status VARCHAR(20) NOT NULL CONSTRAINT df_user_status DEFAULT 'ACTIVE' CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'LOCKED')),
    created_at DATETIME NOT NULL CONSTRAINT df_user_created_at DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
CREATE NONCLUSTERED INDEX idx_user_username ON dbo.users (username);
CREATE NONCLUSTERED INDEX idx_user_email ON dbo.users (email);
GO

-- ==============================================================================
-- 4. BẢNG BOOKS (Danh mục kho sách và tồn kho)
-- ==============================================================================
CREATE TABLE dbo.books (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(150) NOT NULL,
    category NVARCHAR(100) NOT NULL,
    document_code VARCHAR(50) NULL,
    shelf_location VARCHAR(50) NULL,
    publisher NVARCHAR(150) NULL,
    publish_year INT NULL,
    description NVARCHAR(MAX) NULL,
    cover_image VARCHAR(500) NULL,
    total_quantity INT NOT NULL CONSTRAINT df_book_total_qty DEFAULT 0,
    available_quantity INT NOT NULL CONSTRAINT df_book_avail_qty DEFAULT 0,
created_at DATETIME NOT NULL CONSTRAINT df_book_created_at DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
CREATE NONCLUSTERED INDEX idx_book_title ON dbo.books (title);
CREATE NONCLUSTERED INDEX idx_book_author ON dbo.books (author);
CREATE NONCLUSTERED INDEX idx_book_category ON dbo.books (category);
CREATE NONCLUSTERED INDEX idx_book_document_code ON dbo.books (document_code);
GO

-- ==============================================================================
-- 5. BẢNG BORROW_ORDERS (Đơn đặt mượn sách trực tuyến)
-- ==============================================================================
CREATE TABLE dbo.borrow_orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    pickup_date DATE NOT NULL,
    actual_pickup_date DATETIME NULL,
    status VARCHAR(30) NOT NULL CONSTRAINT df_borrow_order_status DEFAULT 'NEW' 
        CONSTRAINT chk_borrow_order_status CHECK (status IN ('NEW', 'PROCESSING', 'READY_FOR_PICKUP', 'BORROWED', 'RETURNED', 'CANCELLED')),
    note NVARCHAR(500) NULL,
    created_at DATETIME NOT NULL CONSTRAINT df_borrow_order_created_at DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    CONSTRAINT fk_borrow_order_user FOREIGN KEY (user_id) REFERENCES dbo.users (id)
);
CREATE NONCLUSTERED INDEX idx_borrow_order_code ON dbo.borrow_orders (order_code);
CREATE NONCLUSTERED INDEX idx_borrow_order_user ON dbo.borrow_orders (user_id);
CREATE NONCLUSTERED INDEX idx_borrow_order_status ON dbo.borrow_orders (status);
GO

-- ==============================================================================
-- 6. BẢNG BORROW_DETAILS (Chi tiết từng cuốn sách trong đơn mượn)
-- ==============================================================================
CREATE TABLE dbo.borrow_details (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    borrow_order_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    due_date DATE NULL,
    actual_return_date DATETIME NULL,
    renewal_count INT NOT NULL CONSTRAINT df_borrow_detail_renewal DEFAULT 0,
    status VARCHAR(30) NOT NULL CONSTRAINT df_borrow_detail_status DEFAULT 'BORROWING'
        CONSTRAINT chk_borrow_detail_status CHECK (status IN ('BORROWING', 'RETURNED', 'OVERDUE', 'LOST')),
    created_at DATETIME NOT NULL CONSTRAINT df_borrow_detail_created_at DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    CONSTRAINT fk_borrow_detail_order FOREIGN KEY (borrow_order_id) REFERENCES dbo.borrow_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_borrow_detail_book FOREIGN KEY (book_id) REFERENCES dbo.books (id)
);
CREATE NONCLUSTERED INDEX idx_borrow_detail_order ON dbo.borrow_details (borrow_order_id);
CREATE NONCLUSTERED INDEX idx_borrow_detail_book ON dbo.borrow_details (book_id);
CREATE NONCLUSTERED INDEX idx_borrow_detail_status ON dbo.borrow_details (status);
CREATE NONCLUSTERED INDEX idx_borrow_detail_due_date ON dbo.borrow_details (due_date);
GO
-- ==============================================================================
-- 7. BẢNG RETURN_TICKETS (Phiếu hẹn trả sách sớm có mã QR)
-- ==============================================================================
CREATE TABLE dbo.return_tickets (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    scheduled_return_date DATE NOT NULL,
    actual_return_date DATETIME NULL,
    status VARCHAR(30) NOT NULL CONSTRAINT df_return_ticket_status DEFAULT 'PENDING_RETURN'
        CONSTRAINT chk_return_ticket_status CHECK (status IN ('PENDING_RETURN', 'COMPLETED', 'CANCELLED')),
    librarian_note NVARCHAR(500) NULL,
    created_at DATETIME NOT NULL CONSTRAINT df_return_ticket_created_at DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    CONSTRAINT fk_return_ticket_user FOREIGN KEY (user_id) REFERENCES dbo.users (id)
);
CREATE NONCLUSTERED INDEX idx_return_ticket_code ON dbo.return_tickets (ticket_code);
CREATE NONCLUSTERED INDEX idx_return_ticket_user ON dbo.return_tickets (user_id);
CREATE NONCLUSTERED INDEX idx_return_ticket_status ON dbo.return_tickets (status);
GO

-- ==============================================================================
-- 8. BẢNG RETURN_DETAILS (Chi tiết đối soát tình trạng sách khi trả)
-- ==============================================================================
CREATE TABLE dbo.return_details (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    return_ticket_id BIGINT NOT NULL,
    borrow_detail_id BIGINT NOT NULL,
    book_condition VARCHAR(30) NOT NULL CONSTRAINT df_return_detail_condition DEFAULT 'NORMAL'
        CONSTRAINT chk_return_detail_condition CHECK (book_condition IN ('NORMAL', 'TORN_COVER', 'DIRTY_PAGE', 'WATER_DAMAGED', 'LOST')),
    damage_fee DECIMAL(12,2) NOT NULL CONSTRAINT df_return_detail_damage_fee DEFAULT 0.00,
    note NVARCHAR(500) NULL,
    created_at DATETIME NOT NULL CONSTRAINT df_return_detail_created_at DEFAULT GETDATE(),
    CONSTRAINT fk_return_detail_ticket FOREIGN KEY (return_ticket_id) REFERENCES dbo.return_tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_return_detail_borrow FOREIGN KEY (borrow_detail_id) REFERENCES dbo.borrow_details (id)
);
CREATE NONCLUSTERED INDEX idx_return_detail_ticket ON dbo.return_details (return_ticket_id);
CREATE NONCLUSTERED INDEX idx_return_detail_borrow ON dbo.return_details (borrow_detail_id);
GO

-- ==============================================================================
-- 9. BẢNG FINES (Biên lai thu phạt quá hạn và bồi thường hư hại)
-- ==============================================================================
CREATE TABLE dbo.fines (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    fine_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    borrow_detail_id BIGINT NULL,
    return_ticket_id BIGINT NULL,
    overdue_days INT NOT NULL CONSTRAINT df_fine_overdue_days DEFAULT 0,
late_fee DECIMAL(12,2) NOT NULL CONSTRAINT df_fine_late_fee DEFAULT 0.00,
    damage_fee DECIMAL(12,2) NOT NULL CONSTRAINT df_fine_damage_fee DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL CONSTRAINT df_fine_total_amount DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CONSTRAINT df_fine_status DEFAULT 'UNPAID'
        CONSTRAINT chk_fine_status CHECK (status IN ('UNPAID', 'PAID')),
    payment_date DATETIME NULL,
    payment_method VARCHAR(20) NULL CONSTRAINT chk_fine_payment_method CHECK (payment_method IN ('CASH', 'TRANSFER')),
    note NVARCHAR(500) NULL,
    created_at DATETIME NOT NULL CONSTRAINT df_fine_created_at DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    CONSTRAINT fk_fine_user FOREIGN KEY (user_id) REFERENCES dbo.users (id),
    CONSTRAINT fk_fine_borrow_detail FOREIGN KEY (borrow_detail_id) REFERENCES dbo.borrow_details (id),
    CONSTRAINT fk_fine_return_ticket FOREIGN KEY (return_ticket_id) REFERENCES dbo.return_tickets (id)
);
CREATE NONCLUSTERED INDEX idx_fine_code ON dbo.fines (fine_code);
CREATE NONCLUSTERED INDEX idx_fine_user ON dbo.fines (user_id);
CREATE NONCLUSTERED INDEX idx_fine_status ON dbo.fines (status);
GO

-- ==============================================================================
-- 10. THÊM DỮ LIỆU MẪU (SEED DATA ĐỂ TEST THỬ)
-- ==============================================================================
-- Tài khoản thủ thư (mật khẩu mẫu: 123456)
INSERT INTO dbo.users (username, password, full_name, email, phone, role, status)
VALUES 
('admin', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGH', N'Thủ Thư Trưởng', 'admin@uth.edu.vn', '0901234567', 'LIBRARIAN', 'ACTIVE'),
('sv2026', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGH', N'Võ Hoàng Phúc', 'sv2026@uth.edu.vn', '0912345678', 'STUDENT', 'ACTIVE');

-- Kho sách mẫu
INSERT INTO dbo.books (title, author, category, document_code, shelf_location, publisher, publish_year, total_quantity, available_quantity)
VALUES 
(N'Giáo Trình Cấu Trúc Dữ Liệu & Giải Thuật', N'Nguyễn Văn A', N'Công nghệ thông tin', 'IT-001', 'A1', N'ĐHQG TP.HCM', 2023, 10, 10),
(N'Lập Trình Web với Spring Boot & React', N'Trần Thị B', N'Công nghệ thông tin', 'IT-002', 'A2', N'Bách Khoa', 2024, 8, 8),
(N'Kỹ Thuật Giao Thông Đô Thị Hiện Đại', N'Lê Văn C', N'Kỹ thuật giao thông', 'GT-001', 'B1', N'GTVT', 2022, 5, 5);
GO