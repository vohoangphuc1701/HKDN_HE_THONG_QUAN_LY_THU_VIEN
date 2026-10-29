# 📚 HỆ THỐNG QUẢN LÝ MƯỢN TRẢ SÁCH TRỰC TUYẾN 

**Xây dựng hệ thống quản lý mượn trả sách trực tuyến cho Thư viện Đại học Giao thông Vận tải TP.HCM (UTH)**

Hệ thống hoạt động tương tự mô hình mua sắm online: Sinh viên duyệt kho tài liệu, thêm sách vào "Giỏ mượn", chọn ngày/khung giờ hẹn lấy và trả. Tại thư viện, thủ thư nhận danh sách đơn mượn, đi gom sẵn sách từ kệ ra khu vực chờ. Khi đến lấy sách, sinh viên chỉ cần mở điện thoại quét **Mã QR đơn mượn** tại quầy tiếp nhận, nhận sách và rời đi trong vòng **dưới 30 giây**.

---

## 🎯 Mục tiêu & KPI

| Mục tiêu | Chỉ số đo lường (KPI) |
| :--- | :--- |
| Giảm thời gian nhận sách tại quầy | Thời gian giao sách trung bình **< 30 giây/đơn** |
| Giảm tải cho thủ thư | Thời gian xử lý 1 đơn (soạn + bàn giao) **< 3 phút** |
| Tăng tỷ lệ sinh viên đến lấy đúng hẹn | Tỷ lệ no-show **< 5%** |
| Giảm thất lạc sách | Tỷ lệ sách "không tìm thấy trên kệ" **< 2%** |
| Minh bạch phạt | **100%** khoản phạt có công thức và lịch sử tính rõ ràng |

---

## ✨ Các chức năng chính

- **Dành cho Sinh viên:** Đăng nhập/Đăng ký bằng email UTH, Tra cứu sách thông minh, Giỏ mượn, Chọn lịch nhận/trả, Nhận thông báo hạn trả qua email, Gia hạn trực tuyến, Xem lịch sử mượn và tiền phạt.
- **Dành cho Thủ thư/Admin:** Dashboard thống kê, Quản lý kho sách (mã vạch, vị trí kệ), Duyệt đơn mượn, Quét QR bàn giao sách, Quản lý trả sách và thu tiền phạt, Nhật ký thao tác (Audit log).
- **Hệ thống:** Tự động gửi email nhắc hạn, Tạo mã QR động, Phân quyền bảo mật JWT.

---

## 🛠 Công nghệ sử dụng

- **Backend:** Java 17, Spring Boot 3, Spring Security, JWT, MySQL, ZXing (Tạo QR), JavaMail (Gửi Email).
- **Frontend (Sinh viên & Admin):** ReactJS (Vite), React Router, Axios, TailwindCSS, HTML5-QRCode (Quét mã QR qua webcam).
- **Công cụ:** Docker, Postman, Git.
## 🛠 Công nghệ sử dụng

Hệ thống được xây dựng trên mô hình phân tán Client-Server hiện đại, tách biệt hoàn toàn giữa Frontend và Backend.

### 1. Backend (Server-side)
- **Ngôn ngữ & Framework:** Java 17, Spring Boot 3 (RESTful API).
- **Cơ sở dữ liệu:** MySQL 8.0+, Spring Data JPA (Hibernate), quản lý transaction bằng `@Transactional`.
- **Bảo mật:** Spring Security, JWT (JSON Web Token), mã hóa mật khẩu BCrypt.
- **Tích hợp dịch vụ:** 
  - **ZXing:** Sinh và nhận diện mã QR (Base64).
  - **Jakarta Mail:** Gửi email tự động qua SMTP.
  - **Spring Scheduler:** Chạy cron job tự động nhắc hạn trả sách mỗi ngày.

### 2. Frontend (Client-side)
- **Ngôn ngữ & Framework:** ReactJS (khởi tạo bằng Vite).
- **Giao tiếp API:** Axios (đính kèm Bearer JWT Token).
- **Định tuyến & Giao diện:** React Router, TailwindCSS (Responsive Web Design cho cả PC & Mobile).
- **Thư viện chuyên biệt:**
  - **HTML5-QRCode:** Quét mã QR trực tiếp qua Webcam (dành cho thủ thư).
  - **Recharts / Chart.js:** Vẽ biểu đồ thống kê trực quan trên Dashboard Admin.

### 3. Công cụ hỗ trợ (Tools)
- **Quản lý mã nguồn:** Git & GitHub.
- **Kiểm thử API:** Postman / Swagger.
- **Triển khai (Deploy):** Docker (tuỳ chọn), Vercel/Netlify (Frontend).
---

## 📂 Cấu trúc thư mục

```text
library-management-system/
├── backend-spring/      # Source code Java Spring Boot (API, Database, Logic)
├── frontend-student/    # Source code React dành cho Sinh viên
├── frontend-admin/      # Source code React dành cho Thủ thư/Admin
├── database/            # Chứa script khởi tạo CSDL MySQL (.sql)
├── docs/                # Sơ đồ Use Case, ERD, tài liệu API, báo cáo
├── tests/               # Các file kiểm thử
├── .gitignore           # Bỏ qua các file rác (node_modules, target,...)
├── LICENSE              # Giấy phép MIT
└── README.md            # Tài liệu hướng dẫn này
