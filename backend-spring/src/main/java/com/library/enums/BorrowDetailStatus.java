package com.library.enums;

/**
 * Trạng thái của từng cuốn sách trong đơn mượn (BorrowDetail)
 */
public enum BorrowDetailStatus {
    BORROWING,   // Đang mượn (trong hạn)
    RETURNED,    // Đã hoàn tất trả
    OVERDUE,     // Quá hạn trả
    LOST         // Báo mất sách (phải bồi thường)
}

