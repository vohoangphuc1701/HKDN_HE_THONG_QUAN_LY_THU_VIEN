# HƯỚNG DẪN SỬ DỤNG & KỊCH BẢN DEMO BÁO CÁO NGHIỆM THU
## PHÂN HỆ CỔNG SINH VIÊN TRÊN MÁY TÍNH (TV3 - DESKTOP WEB)

> **Dự án:** Hệ thống Quản lý Mượn trả Sách Trực tuyến (University Library Management System - ULMS)  
> **Đơn vị áp dụng:** Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH)  
> **Phụ trách:** TV3 – Kỹ sư Frontend Sinh viên (Student Frontend - Desktop Web)  
> **Phiên bản:** 1.0.0 (Hoàn thiện Milestone Phase 4 - Session 19)

---

## MỤC LỤC
1. [Tổng quan Phân hệ Desktop Web](#1-tổng-quan-phân-hệ-desktop-web)
2. [Cài đặt & Khởi chạy Nhanh](#2-cài-đặt--khởi-chạy-nhanh)
3. [Tài liệu Hướng dẫn Sử dụng Chi tiết (User Guide)](#3-tài-liệu-hướng-dẫn-sử-dụng-chi-tiết-user-guide)
   - [3.1. Trang chủ Học thuật & Tìm kiếm Phím tắt Ctrl+K](#31-trang-chủ-học-thuật--tìm-kiếm-phím-tắt-ctrlk)
   - [3.2. Kho Giáo trình & Bộ lọc Chuyên ngành Đa chiều](#32-kho-giáo-trình--bộ-lọc-chuyên-ngành-đa-chiều)
   - [3.3. Trang Chi tiết Giáo trình 2 Cột](#33-trang-chi-tiết-giáo-trình-2-cột)
   - [3.4. Giỏ mượn Sách & Đặt lịch hẹn Nhận sách Pick & Go](#34-giỏ-mượn-sách--đặt-lịch-hẹn-nhận-sách-pick--go)
   - [3.5. Quản lý Hồ sơ Sách đang mượn & Gia hạn Online](#35-quản-lý-hồ-sơ-sách-đang-mượn--gia-hạn-online)
   - [3.6. Lịch sử Mượn trả, Đối soát Nợ phạt & In Biên lai](#36-lịch-sử-mượn-trả-đối-soát-nợ-phạt--in-biên-lai)
4. [Kịch bản Demo Nghiệm thu Đồ án (Presentation Script)](#4-kịch-bản-demo-nghiệm-thu-đồ-án-presentation-script)
5. [Bảng Đối chiếu Quy tắc Nghiệp vụ (BR01 - BR08)](#5-bảng-đối-chiếu-quy-tắc-nghiệp-vụ-br01---br08)

---

## 1. TỔNG QUAN PHÂN HỆ DESKTOP WEB

Phân hệ Desktop Web (TV3) phục vụ sinh viên Trường Đại học Giao thông Vận tải TP.HCM (UTH) thao tác tra cứu, mượn sách trực tuyến và quản lý hồ sơ thư viện trên máy tính để bàn, laptop và máy tính bảng xoay ngang (`md, lg, xl, 2xl >= 768px`).

* **Kiến trúc công nghệ:**
  * Framework: React 18 SPA + Vite 5.
  * Styling: TailwindCSS 3.4+ với dải màu nhận diện học thuật UTH (`#00666B` Deep Academic Teal).
  * Icons & Trực quan: Lucide React.
  * Tầng mạng & API: Axios Client có Interceptors tự động đính kèm JWT Bearer Token, bóc tách cấu trúc chuẩn `ApiResponse<T>`, tích hợp cơ chế Offline Fallback tự động khi Backend tắt.
  * Tối ưu hiệu năng (Session 18): Áp dụng Code-Splitting với `React.lazy()` và `Suspense`, chia nhỏ vendor chunks, giảm kích thước bundle chính từ **714 kB xuống chỉ còn 236 kB (nén gzip 49.6 kB)**.

---

## 2. CÀI ĐẶT & KHỞI CHẠY NHANH

```bash
# 1. Di chuyển vào thư mục frontend sinh viên
cd frontend-student

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy môi trường phát triển (Development Server)
npm run dev
# -> Ứng dụng chạy tại: http://localhost:5173

# 4. Kiểm tra biên dịch sản phẩm (Production Build)
npm run build
```

---

## 3. TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CHI TIẾT (USER GUIDE)

### 3.1. Trang chủ Học thuật & Tìm kiếm Phím tắt Ctrl+K
* **Truy cập:** Đường dẫn `/` hoặc click vào Logo Thư viện UTH trên thanh điều hướng.
* **Tính năng chính:**
  * **Hero Banner tương tác:** Tự động chuyển đổi hình ảnh và địa chỉ 3 cơ sở đào tạo UTH (Cơ sở 1 Bình Thạnh, Cơ sở 2 Thủ Đức, Cơ sở 3 Quận 12) mỗi 3 giây liên tục.
  * **Thanh tìm kiếm nhanh:** Nhấn tổ hợp phím **`Ctrl + K`** (hoặc `Cmd + K` trên macOS) ở bất kỳ đâu trên trang để tự động focus vào ô tìm kiếm; nhập từ khóa và nhấn `Enter` để chuyển thẳng vào kết quả kho sách.
  * **Cụm đề xuất chuyên ngành:** Chuyển đổi nhanh các tab khoa: *Công nghệ thông tin*, *Kinh tế & Quản trị*, *Logistics & Vận tải*, *Ngoại ngữ chuyên ngành*.

### 3.2. Kho Giáo trình & Bộ lọc Chuyên ngành Đa chiều
* **Truy cập:** Đường dẫn `/books`.
* **Tính năng chính:**
  * **Thanh lọc dính bên trái (`FilterSidebarPC`):**
    * *Tình trạng kho sách:* Nút gạt "Chỉ hiện sách còn sẵn" (lọc theo `availableQuantity > 0`).
    * *Chuyên ngành:* Lọc theo các ngành đào tạo UTH kèm số lượng đầu sách thực tế.
    * *Hình thức tài liệu:* Sách in tại quầy hoặc E-Book giáo trình số.
    * *Cơ sở phục vụ:* Lọc sách đang lưu kho tại CS1, CS2 hoặc CS3.
  * **Chế độ hiển thị linh hoạt:**
    * Chế độ **Lưới 3D (Grid):** Bìa sách dập nổi gáy sách 3D, hiệu ứng ánh sáng spotlight, hiển thị rõ ràng vị trí kệ sách (ví dụ: *Khu CNTT · Kệ A2*).
    * Chế độ **Danh sách rút gọn (Compact list):** Mật độ thông tin cao, dễ dàng đối chiếu số lượng tồn và năm xuất bản.
  * **Thanh phân trang chuẩn Desktop:** Hỗ trợ nút Về trang đầu, Trang trước, danh sách số trang có dấu ba chấm `...`, Trang sau, Đến trang cuối, và tùy chọn hiển thị `8, 12, 16, 24` cuốn/trang.
  * **Skeleton Loader (Session 18):** Tự động hiển thị khung xương trang sách lấp lánh khi hệ thống đang gọi API tìm kiếm, loại bỏ hoàn toàn hiện tượng giật trang.

### 3.3. Trang Chi tiết Giáo trình 2 Cột
* **Truy cập:** Đường dẫn `/books/:id` (hoặc click vào bất kỳ card sách nào).
* **Tính năng chính:**
  * **Bố cục 2 cột chuyên nghiệp:**
    * *Cột trái:* Bìa sách 3D khổ lớn dập nổi học thuật, mã vạch bản sao và tình trạng sẵn sàng.
    * *Cột phải:* Toàn bộ siêu dữ liệu thư viện: Tác giả, Nhà xuất bản, Năm phát hành, Mã xếp giá (Call Number), Vị trí kệ cụ thể tại từng cơ sở.
  * **Nút bấm xúc giác:** Nút *"Thêm vào giỏ mượn"* tự động cập nhật giỏ mượn hoặc hiển thị trạng thái *"Đã trong giỏ mượn"*.
  * **Khối tài liệu cùng chuyên ngành:** Đề xuất 4 cuốn sách liên quan ở chân trang giúp sinh viên dễ dàng tìm tài liệu tham khảo bổ trợ.

### 3.4. Giỏ mượn Sách & Đặt lịch hẹn Nhận sách Pick & Go
* **Truy cập:** Bấm vào icon Giỏ mượn trên thanh điều hướng hoặc truy cập `/checkout`.
* **Quy trình Pick & Go:**
  1. **Kiểm tra hạn mức (BR01):** Giỏ mượn hiển thị thanh tiến độ tối đa **5 cuốn / sinh viên**. Hệ thống tự động cảnh báo và chặn mượn nếu vượt hạn mức hoặc có nợ phạt quá hạn chưa thanh toán.
  2. **Chọn Cơ sở đào tạo UTH:** Chọn 1 trong 3 cơ sở (CS1 - Trụ sở chính Bình Thạnh, CS2 - Thủ Đức, CS3 - Quận 12).
  3. **Chọn Ngày hẹn & Khung giờ lấy sách:**
     * Buổi sáng: `08:00 – 11:30` (Thủ thư soạn sẵn từ 07:30).
     * Buổi chiều: `13:30 – 17:00`.
     * Buổi tối: `17:30 – 20:00` (Áp dụng tại CS1).
  4. **Gửi đơn mượn:** Bấm *"Xác nhận & Đặt lịch hẹn mượn"*. Hệ thống khóa tồn kho theo cơ chế bi quan (`PESSIMISTIC_WRITE`), tạo mã đơn `OD-UTH-...` và tự động hiển thị **Mã QR Đơn mượn** trên modal [ReturnQrModal.jsx](file:///c:/Users/Administrator/HKDN_HE_THONG_QUAN_LY_THU_VIEN/frontend-student/src/components/common/ReturnQrModal.jsx). Sinh viên có thể tải ảnh mã QR hoặc in phiếu để chuẩn bị quét nhận sách tại quầy trong dưới 30 giây.

### 3.5. Quản lý Hồ sơ Sách đang mượn & Gia hạn Online
* **Truy cập:** Đường dẫn `/loans`.
* **Tính năng chính:**
  * **Bảng dữ liệu `LoansTableViewPC`:** Hiển thị toàn bộ sách đang giữ, ngày mượn, hạn trả (14 ngày - BR02), thanh tiến trình số ngày còn lại (Normal: xanh lá, Warning $\le 3$ ngày: vàng hổ phách, Overdue: đỏ).
  * **Gia hạn trực tuyến (+7 ngày) theo quy định BR03:**
    * Sinh viên bấm nút *"Gia hạn (+7d)"* để tăng hạn trả thêm 7 ngày trực tiếp trên hệ thống.
    * Hệ thống **tự động vô hiệu hóa nút** nếu sách đã gia hạn hết 1 lần (`renewCount >= 1`) hoặc sách đã rơi vào tình trạng quá hạn (`status === 'OVERDUE'`).
  * **Hẹn lịch trả sách trực tuyến (BR06):**
    * Chọn các sách muốn trả thông qua checkbox.
    * Bấm *"Tạo phiếu hẹn trả"* ➔ Chọn ngày hẹn mang sách lên quầy (hệ thống tự động ràng buộc ngày hẹn không được trễ hơn hạn trả lớn nhất của các sách được chọn theo quy tắc BR06).
    * Hệ thống sinh **Mã QR Phiếu hẹn trả** (`PT-UTH-...`) để thủ thư quét kiểm tra khi nhận sách.

### 3.6. Lịch sử Mượn trả, Đối soát Nợ phạt & In Biên lai
* **Truy cập:** Đường dẫn `/history`.
* **Tính năng chính:**
  * **Bảng Lịch sử Toàn khóa `LoanHistoryTableViewPC`:** Theo dõi đầy đủ mã giao dịch, tên giáo trình, ngày mượn, ngày trả thực tế, thủ thư tiếp nhận tại quầy.
  * **Đối soát nợ phạt minh bạch (BR04):**
    * Tự động tính số ngày quá hạn và tiền phạt: $\text{Số ngày trễ} \times 5.000\text{ VNĐ}$.
    * Hiển thị phương thức đã thanh toán (VietQR, Chuyển khoản, Quầy).
  * **Xem & In Biên nhận Điện tử:**
    * Bấm nút *"Biên lai"* trên từng dòng giao dịch để mở modal mô phỏng hóa đơn đối soát thư viện.
    * Bấm nút **"In biên nhận"** để gọi lệnh in trực tiếp từ trình duyệt (`window.print()`).
  * **Mượn lại:** Nút bấm một chạm đưa cuốn sách yêu thích từ lịch sử vào lại giỏ mượn mới.

---

## 4. KỊCH BẢN DEMO NGHIỆM THU ĐỒ ÁN (PRESENTATION SCRIPT)

| Phân cảnh (Scene) | Thao tác trên Giao diện Desktop | Lời thoại gợi ý của Thuyết trình viên TV3 | Tiêu chí kỹ thuật làm nổi bật |
| :--- | :--- | :--- | :--- |
| **Phân cảnh 1:**<br>Trang chủ & Tra cứu thông minh | 1. Mở trang chủ Desktop.<br>2. Nhấn tổ hợp phím **`Ctrl + K`**.<br>3. Gõ từ khóa `"Python"` và nhấn Enter. | *"Kính thưa Thầy/Cô, Cổng sinh viên Desktop được TV3 thiết kế bám sát nhận diện học thuật Deep Teal của Thư viện UTH. Để tối ưu tốc độ tra cứu, sinh viên chỉ cần nhấn Ctrl+K để mở nhanh ô tìm kiếm, hệ thống lập tức điều hướng sang Kho giáo trình."* | • Phím tắt `Ctrl+K`<br>• Ambient gradient<br>• Hero banner tự động đổi 3 cơ sở. |
| **Phân cảnh 2:**<br>Bộ lọc Kho sách & Bìa sách 3D | 1. Tại trang `/books`, gạt nút *"Chỉ hiện sách còn sẵn"*.<br>2. Chọn chuyên ngành *"Công nghệ thông tin"*.<br>3. Chuyển đổi giữa chế độ *Lưới 3D* và *Danh sách*. | *"Tại Kho giáo trình, TV3 xây dựng cột lọc dính FilterSidebarPC hỗ trợ lọc đa chiều theo ngành, loại hình và cơ sở lưu kho. Các card sách được thiết kế dập nổi gáy 3D chuẩn xúc giác, hiển thị chính xác vị trí kệ sách trên thực tế để sinh viên dễ dàng định vị."* | • Sticky Sidebar<br>• Skeleton loaders lấp lánh<br>• Phân trang Pagination chuẩn Desktop. |
| **Phân cảnh 3:**<br>Đặt lịch hẹn Pick & Go | 1. Click vào sách để xem trang Chi tiết 2 cột.<br>2. Bấm *"Thêm vào giỏ"* ➔ Mở CartDrawer.<br>3. Vào trang `/checkout`, chọn Cơ sở 1 và khung giờ sáng.<br>4. Bấm *"Xác nhận đơn mượn"*. | *"Mô hình tuần hoàn của hệ thống hoạt động tương tự E-commerce. Sinh viên chọn sách và đặt lịch hẹn Pick & Go. Ngay khi bấm xác nhận, hệ thống áp dụng cơ chế khóa bi quan PESSIMISTIC_WRITE để chống xung đột tồn kho và sinh tức thì Mã QR Đơn mượn độ tương phản cao để quét tại quầy trong dưới 30 giây."* | • Ràng buộc BR01 (max 5 cuốn)<br>• Xuất mã QR Base64<br>• Tự động làm rỗng giỏ mượn. |
| **Phân cảnh 4:**<br>Hồ sơ sách mượn & Gia hạn Online | 1. Chuyển sang tab `/loans`.<br>2. Chỉ vào cuốn sách chưa gia hạn và bấm *"Gia hạn (+7d)"*.<br>3. Quan sát hạn trả tăng thêm 7 ngày và nút gia hạn bị vô hiệu hóa.<br>4. Chọn sách và bấm *"Tạo phiếu hẹn trả"* (thử chọn ngày để thấy ràng buộc BR06). | *"Tại trang quản lý sách đang mượn, sinh viên có thể tự gia hạn trực tuyến thêm 7 ngày theo quy định BR03. Hệ thống kiểm soát chặt chẽ: chỉ cho gia hạn tối đa 1 lần và khóa nút nếu sách đã quá hạn. Khi tạo phiếu hẹn trả, hệ thống áp dụng quy tắc BR06, không cho phép hẹn ngày trễ hơn hạn trả của sách."* | • Quy tắc nghiệp vụ BR02 & BR03<br>• Khóa nút gia hạn khi vi phạm<br>• Ràng buộc BR06 trên ô chọn ngày. |
| **Phân cảnh 5:**<br>Lịch sử mượn trả & In biên lai | 1. Chuyển sang tab `/history`.<br>2. Xem bảng dữ liệu và các chỉ số KPI trên cùng.<br>3. Chọn cuốn sách có phạt trễ hạn để xem công thức BR04.<br>4. Bấm nút *"Biên lai"* ➔ Mở modal ➔ Bấm *"In biên nhận"*. | *"Cuối cùng, màn hình Lịch sử mượn trả TV3 vừa hoàn thiện cung cấp bảng đối soát nợ phạt minh bạch 100%. Tiền phạt trễ hạn được tính đúng công thức BR04 là 5.000đ/ngày. Sinh viên có thể mở Biên nhận điện tử và in trực tiếp ra giấy để làm việc với phòng tài vụ thư viện."* | • Bảng Data Table chuẩn PC<br>• Tính phạt BR04 tự động<br>• Lệnh in biên lai `window.print()`. |

---

## 5. BẢNG ĐỐI CHIẾU QUY TẮC NGHIỆP VỤ (BR01 - BR08)

| Mã BR | Tên Quy tắc | Nội dung Ràng buộc | Cách TV3 Cài đặt trên Desktop Web |
| :---: | :--- | :--- | :--- |
| **BR01** | Hạn mức mượn & Chặn nợ phạt | Tối đa 5 cuốn mượn đồng thời. Chặn mượn sách nếu còn nợ phạt `UNPAID`. | Kiểm tra tại `borrowApi.checkStudentBorrowEligibility`, hiển thị cảnh báo đỏ và vô hiệu hóa nút submit trên `CheckoutSchedulePage`. |
| **BR02** | Thời hạn mượn tiêu chuẩn | 14 ngày kể từ khi nhận sách tại quầy. | Tính toán ngày đến hạn tự động và hiển thị thanh tiến trình trực quan trên `LoansTableViewPC`. |
| **BR03** | Gia hạn trực tuyến | Tối đa 1 lần gia hạn (+7 ngày), chỉ cho phép khi sách chưa quá hạn. | Vô hiệu hóa nút *"Gia hạn (+7d)"* khi `renewCount >= 1` hoặc `status === 'OVERDUE'`. |
| **BR04** | Tiền phạt trễ hạn | 5.000 VNĐ / ngày / cuốn. | Tự động nhân số ngày trễ với 5.000 VNĐ, hiển thị rõ ràng trên `LoansTableViewPC` và `LoanHistoryTableViewPC`. |
| **BR05** | Giữ đơn quầy 48 giờ | Đơn chuẩn bị sẵn sàng được giữ tối đa 48 giờ trước khi tự động hủy. | Hiển thị badge đếm thời gian giữ chỗ 48h trên `ReturnQrModal` và trang checkout. |
| **BR06** | Hạn lịch hẹn trả sách | Ngày hẹn trả phải $\le$ hạn trả lớn nhất của các tài liệu được chọn. | Tự động tính `maxAllowedDueDate`, gán thuộc tính `max` cho date input và validate trước khi tạo phiếu hẹn trả. |
| **BR07** | Đánh giá hư hại sách | Nhập phí đền bù hư hại vật lý lúc trả. | Hiển thị thông tin tình trạng sách và ghi nhận đền bù trên `LoanHistoryTableViewPC` và Biên lai. |
| **BR08** | Phiên ghép nối máy quét | Hết hạn sau 15 phút không hoạt động. | Đồng bộ trạng thái sẵn sàng quét qua mã QR tương thích với TV5 và TV6. |

---

> **Kết luận:** Toàn bộ 19 Session thuộc trách nhiệm của **TV3 (Student Frontend - Desktop Web)** đã được hoàn thành 100%, vượt qua tất cả các bài kiểm tra biên dịch Vite, tối ưu hiệu năng đạt chuẩn xuất sắc và sẵn sàng cho buổi bảo vệ đồ án!
