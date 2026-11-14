# TÀI LIỆU API CONTRACT & MOCK DATA (DÙNG CHUNG CHO DỰ ÁN)

> **Phiên bản:** 1.0.0 
> **Áp dụng cho:** TV2 (Mobile Web), TV3 (PC Web), TV5 (QR/Email Quầy), TV6 (Admin Dashboard)

---

## 1. Cấu trúc Chuẩn hóa Phản hồi (Standard Response Envelope)

Mọi API trong hệ thống đều trả về theo định dạng thống nhất của `ApiResponse<T>`:

### 1.1. Phản hồi Thành công (Success - HTTP 200 / 201)

```json
{
  "success": true,
  "code": 200,
  "message": "Thao tác thành công",
  "data": { ... },
  "timestamp": "2026-11-05T08:00:00"
}
```

### 1.2. Phản hồi Lỗi (Error - HTTP 400 / 401 / 403 / 404 / 500)

```json
{
  "success": false,
  "code": 400,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "errors": [
    "pickupDate: Ngày hẹn lấy sách không được để trống",
    "bookIds: Danh sách sách mượn không được rỗng"
  ],
  "timestamp": "2026-11-05T08:00:00"
}
```

---

## 2. Danh mục Endpoint Chi tiết & Mock Data

### 🔐 2.1. Phân hệ Xác thực (Auth)

#### `POST /api/auth/login`

* **Mô tả:** Đăng nhập lấy Bearer JWT Token.
* **Request:**
  ```json
  {
    "username": "sinhvien01",
    "password": "password123"
  }
  ```
* **Response (Data):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "username": "sinhvien01",
      "fullName": "Nguyễn Văn A",
      "email": "vana@university.edu.vn",
      "role": "STUDENT"
    }
  }
  ```

---

### 📚 2.2. Phân hệ Danh mục Sách (Books)

#### `GET /api/books`

* **Query Params:** `search`, `category`, `onlyAvailable` (true/false), `page`, `size`.
* **Response (Data):**
  ```json
  {
    "content": [
      {
        "id": 1,
        "title": "Lập trình Spring Boot từ cơ bản đến nâng cao",
        "author": "Đỗ Tuấn Anh",
        "category": "Công nghệ thông tin",
        "documentCode": "TL-CNTT-001",
        "publisher": "NXB Đại học Quốc Gia",
        "publishYear": 2024,
        "description": "Giáo trình hướng dẫn Spring Boot 3 & RESTful API...",
        "coverImage": "https://picsum.photos/400/600?random=1",
        "totalQuantity": 10,
        "availableQuantity": 6,
        "available": true
      }
    ],
    "totalPages": 5,
    "totalElements": 50,
    "page": 0,
    "size": 12
  }
  ```

---

### 📦 2.3. Quy trình Mượn Sách (Borrows Flow)

#### `POST /api/borrows/create`

* **Mô tả:** Sinh viên đặt mượn sách trực tuyến (trừ tồn kho khả dụng ngay lập tức).
* **Headers:** `Authorization: Bearer <token>`
* **Request:**
  ```json
  {
    "bookIds": [1, 3],
    "pickupDate": "2026-11-06",
    "note": "Em lấy sách buổi sáng"
  }
  ```
* **Response (Data):**
  ```json
  {
    "orderId": 101,
    "orderCode": "OD-20261105-001",
    "status": "NEW",
    "pickupDate": "2026-11-06",
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "books": [
      { "id": 1, "title": "Lập trình Spring Boot..." },
      { "id": 3, "title": "Cấu trúc dữ liệu và giải thuật" }
    ]
  }
  ```

#### `GET /api/borrows/my-loans`

* **Mô tả:** Danh sách các cuốn sách sinh viên đang cầm (để gia hạn hoặc chọn hẹn trả sớm).
* **Response (Data):**
  ```json
  [
    {
      "borrowDetailId": 201,
      "bookId": 1,
      "title": "Lập trình Spring Boot từ cơ bản đến nâng cao",
      "coverImage": "https://picsum.photos/400/600?random=1",
      "borrowDate": "2026-10-25",
      "dueDate": "2026-11-08",
      "renewalCount": 0,
      "canRenew": true,
      "status": "BORROWING"
    }
  ]
  ```

#### `POST /api/borrows/{borrowDetailId}/renew`

* **Mô tả:** Gia hạn trực tuyến 1 lần (+7 ngày, tối đa 2 lần).
* **Response (Data):**
  ```json
  {
    "borrowDetailId": 201,
    "oldDueDate": "2026-11-08",
    "newDueDate": "2026-11-15",
    "renewalCount": 1
  }
  ```

---

### 🔄 2.4. Quy trình Hẹn Trả Sách Sớm (ReturnTicket Flow)

#### `POST /api/returns/create-ticket`

* **Mô tả:** Sinh viên chọn sách muốn trả sớm, chọn ngày hẹn trả $\le$ `dueDate` $\rightarrow$ sinh mã QR phiếu trả.
* **Request:**
  ```json
  {
    "borrowDetailIds": [201],
    "scheduledReturnDate": "2026-11-07"
  }
  ```
* **Response (Data):**
  ```json
  {
    "ticketId": 501,
    "ticketCode": "RT-20261105-001",
    "scheduledReturnDate": "2026-11-07",
    "status": "PENDING_RETURN",
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "books": [
      {
        "borrowDetailId": 201,
        "title": "Lập trình Spring Boot từ cơ bản đến nâng cao",
        "dueDate": "2026-11-08"
      }
    ]
  }
  ```

---

### 🏢 2.5. Nghiệp vụ Quầy & Quét QR (Desk Operations)

#### `POST /api/operations/handover?orderCode=OD-20261105-001`

* **Mô tả:** Thủ thư quét QR đơn mượn $\rightarrow$ Đơn chuyển sang `BORROWED`, gán `actualPickupDate = NOW()`, hạn trả chuẩn `dueDate = NOW() + 14 ngày`.

#### `POST /api/returns/{ticketId}/complete`

* **Mô tả:** Thủ thư đối soát tình trạng sách vật lý, tính tiền phạt trễ hạn + hư hại, cộng hoàn lại kho khả dụng.
* **Request:**
  ```json
  {
    "items": [
      {
        "borrowDetailId": 201,
        "bookCondition": "NORMAL",
        "damageFee": 0,
        "note": "Sách nguyên vẹn"
      }
    ],
    "librarianNote": "Đã thu đủ sách"
  }
  ```
* **Response (Data):**
  ```json
  {
    "ticketCode": "RT-20261105-001",
    "status": "COMPLETED",
    "overdueDays": 0,
    "lateFee": 0,
    "damageFee": 0,
    "totalFineAmount": 0,
    "fineStatus": "PAID"
  }
  ```
