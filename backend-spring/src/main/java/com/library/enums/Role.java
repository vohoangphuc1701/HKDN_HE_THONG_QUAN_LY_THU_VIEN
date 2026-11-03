package com.library.enums;

/**
 * Phân quyền 2 vai trò trong hệ thống:
 * - STUDENT: Sinh viên (tra cứu, đặt mượn, gia hạn, tạo phiếu hẹn trả sớm)
 * - LIBRARIAN: Thủ thư kiêm Quản trị viên (quản lý kho sách, duyệt đơn, quét QR
 * bàn giao/nhận trả, thu phí phạt, xem dashboard thống kê và quản lý hệ thống)
 */
public enum Role {
    STUDENT, // Sinh viên
    LIBRARIAN // Thủ thư (đảm nhiệm toàn bộ nghiệp vụ thủ thư và admin)
}
