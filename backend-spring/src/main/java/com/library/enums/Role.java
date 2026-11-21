package com.library.enums;

/**
 * Phân quyền 3 vai trò trong hệ thống:
 * - STUDENT: Sinh viên (tra cứu, đặt mượn, gia hạn, tạo phiếu hẹn trả sớm)
 * - LIBRARIAN: Thủ thư (quản lý kho sách, duyệt đơn, quét QR bàn giao/nhận trả, thu phí phạt, quản lý sinh viên)
 * - ADMIN: Quản trị viên hệ thống (toàn bộ quyền của LIBRARIAN + thêm/sửa/xóa và phân quyền Thủ thư)
 */
public enum Role {
    STUDENT,    // Sinh viên
    LIBRARIAN,  // Thủ thư
    ADMIN       // Quản trị viên hệ thống
}
