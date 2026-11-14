package com.library.enums;

/**
 * Tình trạng sách vật lý khi đối soát tại quầy trả
 */
public enum BookCondition {
    NORMAL,         // Sách nguyên vẹn, tốt (không phụ thu)
    TORN_COVER,     // Rách bìa (phụ thu phí sửa chữa)
    DIRTY_PAGE,     // Vẽ bẩn / rách trang (phụ thu phí phục hồi)
    WATER_DAMAGED,  // Ướt nước / ẩm mốc (phụ thu phí)
    LOST            // Mất sách (bồi thường 100% giá trị sách)
}

