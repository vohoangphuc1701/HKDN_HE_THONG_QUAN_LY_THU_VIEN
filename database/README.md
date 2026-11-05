# HỆ THỐNG CƠ SỞ DỮ LIỆU MYSQL - THƯ VIỆN UTH

Tài liệu hướng dẫn khởi tạo các bảng cho CSDL **`library_db`** thuộc dự án **Hệ Thống Quản Lý Thư Viện Đại Học Giao Thông Vận Tải TP.HCM**.

---

## 📁 Cấu trúc thư mục `database/`

| Tệp tin | Mô tả chức năng |
| :--- | :--- |
| **`schema.sql`** | Script DDL khởi tạo CSDL `library_db` và 7 bảng dữ liệu (`CREATE DATABASE`, `CREATE TABLE`, `INDEX`, `FOREIGN KEY`). Không chứa dữ liệu mẫu. |
| **`README.md`** | Hướng dẫn chi tiết cấu trúc bảng và cách khởi tạo trong MySQL. |

---

## 🗄️ Cấu trúc 7 Bảng CSDL

1. **`users`**: Lưu trữ tài khoản người dùng với 2 vai trò (`STUDENT`, `LIBRARIAN`) và trạng thái (`ACTIVE`, `LOCKED`).
2. **`books`**: Danh mục kho sách tinh gọn (quản lý trực tiếp `total_quantity`, `available_quantity`, `document_code`).
3. **`borrow_orders`**: Đơn đặt mượn sách trực tuyến (`NEW` -> `PROCESSING` -> `READY_FOR_PICKUP` -> `BORROWED` -> `RETURNED` / `CANCELLED`).
4. **`borrow_details`**: Chi tiết từng cuốn sách trong đơn mượn, quản lý hạn trả (`due_date`) và số lần gia hạn (`renewal_count`).
5. **`return_tickets`**: Phiếu hẹn trả sách sớm có mã QR (`PENDING_RETURN` -> `COMPLETED` / `CANCELLED`).
6. **`return_details`**: Chi tiết đối soát tình trạng vật lý từng cuốn sách tại quầy (`NORMAL`, `TORN_COVER`, `DIRTY_PAGE`, `WATER_DAMAGED`, `LOST`) và phí hư hại (`damage_fee`).
7. **`fines`**: Biên lai thu phạt quá hạn (`late_fee`) và bồi thường hư hại (`damage_fee`).

---

## 🚀 Hướng dẫn chạy tạo bảng trong MySQL

1. Mở **MySQL Workbench**, **DBeaver** hoặc **phpMyAdmin**.
2. Mở file **`database/schema.sql`**.
3. Nhấn **Execute (Run)** để tạo database `library_db` và toàn bộ 7 bảng trống.
