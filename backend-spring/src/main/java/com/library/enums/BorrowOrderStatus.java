package com.library.enums;

/**
 * Trạng thái của đơn mượn sách (BorrowOrder)
 * Vòng đời: NEW -> PROCESSING -> READY_FOR_PICKUP -> BORROWED -> RETURNED / CANCELLED
 */
public enum BorrowOrderStatus {
    NEW,                // Sinh viên vừa đặt mượn trực tuyến
    PROCESSING,         // Thủ thư đang gom sách từ kho
    READY_FOR_PICKUP,   // Sách đã sẵn sàng tại quầy (tối đa giữ 48h)
    BORROWED,           // Thủ thư đã quét QR bàn giao sách cho sinh viên
    RETURNED,           // Sinh viên đã hoàn tất trả toàn bộ sách trong đơn
    CANCELLED           // Đơn bị hủy (do quá 48h không nhận hoặc hủy trực tuyến)
}

