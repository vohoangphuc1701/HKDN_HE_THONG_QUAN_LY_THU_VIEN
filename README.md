# 📚 HỆ THỐNG QUẢN LÝ MƯỢN TRẢ SÁCH TRỰC TUYẾN CHO THƯ VIỆN THƯ VIỆN

**Xây dựng hệ thống quản lý mượn trả sách trực tuyến cho Thư viện**

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

*   **Frontend (Giao diện):** ReactJS (Vite), TailwindCSS, React Router, Axios, HTML5-QRCode, Recharts.
*   **Backend (Máy chủ):** Java 17, Spring Boot 3, Spring Security (JWT), ZXing (Mã QR), JavaMail, Spring Scheduler.
*   **Database (Cơ sở dữ liệu):** MySQL 8.0+, Spring Data JPA.
*   **Công cụ khác:** Git/GitHub, Postman, Docker.

## 📂 Cấu trúc thư mục

```text
library-management-system/
├── backend-spring/                     # [TV4 & TV5] Java 17, Spring Boot 3, MySQL
│   ├── pom.xml
│   └── src/main/
│       ├── resources/                  # Cấu hình DB, JWT, Mail
│       └── java/com/library/
│           ├── config/                 # [TV4] SecurityConfig, JwtProvider, WebConfig
│           ├── common/                 # [TV4] GlobalExceptionHandler, ApiResponse
│           ├── entity/                 # [TV4] User, Book, BookCopy, BorrowOrder, Fine
│           ├── repository/             # [TV4] Giao tiếp CSDL (JPA)
│           ├── service/                # [TV4] Auth, Book, Borrow | [TV5] Qr, Email, Scheduler
│           └── controller/             # [TV4] Auth, Book, Borrow, Dashboard | [TV5] Qr, Operation
│
├── frontend-student/                   # [TV2 & TV3] React (Vite) - Giao diện Sinh viên
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js              # Cấu hình breakpoints PC & Mobile
│   └── src/
│       ├── services/                   # [TV3] axiosClient, bookApi, borrowApi
│       ├── components/
│       │   ├── common/                 # [TV2 & TV3] BookCard, SearchBar, CartDrawer
│       │   ├── layout/                 # [TV3] StudentLayout, NavbarPC | [TV2] BottomNavMobile
│       │   └── responsive/             # [TV3] FilterSidebarPC, LoansTableViewPC
│       │                               # [TV2] FilterModalMobile, LoansCardListMobile
│       ├── pages/                      # [TV2 & TV3] Home, BookList, BookDetail, ActiveLoans, History
│       ├── App.jsx                     # [TV3] Router
│       └── main.jsx
│
└── frontend-admin/                     # [TV5 & TV6] React (Vite) - Giao diện Quản trị
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── services/                   # [TV6] adminApi, orderApi, statsApi | [TV5] scanApi
        ├── components/
        │   ├── AdminLayout.jsx         # [TV6]
        │   ├── MetricCard.jsx          # [TV6]
        │   └── scanner/                # [TV5] Html5QrScanner, ManualSearchModal, BatchReturnGrid
        ├── pages/
        │   ├── DashboardOverviewPage.jsx # [TV6]
        │   ├── InventoryManagementPage.jsx # [TV6]
        │   ├── OrderWorkflowPage.jsx   # [TV6]
        │   ├── FineTrackingPage.jsx    # [TV6]
        │   ├── AuditLogPage.jsx        # [TV6]
        │   └── ScanStationPage.jsx     # [TV5]
        ├── App.jsx                     # [TV6]
        └── main.jsx

## 👥 Phân công nhiệm vụ (6 Thành viên)

👑 Thành viên 1 — Leader
*   Nhiệm vụ:Quản lý tiến độ, vẽ sơ đồ Use Case, quy trình mượn/trả, kiểm thử tổng thể.
*   Sản phẩm:Kế hoạch, sơ đồ nghiệp vụ, báo cáo kiểm thử.

📱 Thành viên 2 — Frontend Sinh viên (Mobile)
*   Nhiệm vụ:Code giao diện Sinh viên trên Điện thoại (BottomNav, Carousel sách, Modal lọc, thẻ sách đang mượn).
*   File phụ trách: `BottomNavMobile.jsx`, `FilterModalMobile.jsx`, `LoansCardListMobile.jsx`

💻 Thành viên 3 — Frontend Sinh viên (PC)
*   Nhiệm vụ:Code giao diện Sinh viên trên Máy tính (Navbar, Grid sách, Sidebar lọc). Cấu hình API.
*   File phụ trách: `NavbarPC.jsx`, `FilterSidebarPC.jsx`, `LoansTableViewPC.jsx`, `axiosClient.js`

⚙️ Thành viên 4 — Backend & Database
*   Nhiệm vụ:Thiết kế CSDL, cấu hình JWT/Security, API tra cứu sách, tạo đơn, tính phạt, API Dashboard.
*   File phụ trách: CSDL, `SecurityConfig.java`, `BookController.java`, `BorrowController.java`

📷 Thành viên 5 — Backend Services & QR
*   Nhiệm vụ:Tạo mã QR, gửi Email nhắc hạn, quét trả hàng loạt. Làm giao diện quét QR tại quầy Admin.
*   File phụ trách:`QrService.java`, `EmailService.java`, `ScanStationPage.jsx`, `Html5QrScanner.jsx`

📊 Thành viên 6 — Frontend Admin Dashboard
*   Nhiệm vụ: Code giao diện Quản trị (Layout Admin, Quản lý kho, Duyệt đơn, Thống kê, Audit log).
*   File phụ trách:`AdminLayout.jsx`, `InventoryManagementPage.jsx`, `DashboardOverviewPage.jsx`, `statsApi.js`
