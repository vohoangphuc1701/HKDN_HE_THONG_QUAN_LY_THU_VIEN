package com.library.enums;

/**
 * Trạng thái của phiếu hẹn trả sách sớm (ReturnTicket)
 */
public enum ReturnTicketStatus {
    PENDING_RETURN, // Sinh viên đã tạo lịch hẹn và nhận mã QR, chờ lên quầy trả
    COMPLETED,      // Thủ thư đã quét QR đối soát và hoàn tất nhận trả sách
    CANCELLED       // Phiếu hẹn bị hủy
}

