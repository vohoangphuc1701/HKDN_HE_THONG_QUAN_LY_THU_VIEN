package com.library.enums;

import lombok.Getter;

/**
 * Vị trí kệ sách trong thư viện (ShelfLocation)
 * Giúp sinh viên dễ dàng tìm sách trên kệ và thủ thư nhanh chóng gom sách duyệt đơn
 */
@Getter
public enum ShelfLocation {
    A1("Kệ A1 - Tầng 1 (Công nghệ thông tin & Phần mềm)"),
    A2("Kệ A2 - Tầng 1 (Trí tuệ nhân tạo & Mạng máy tính)"),
    B1("Kệ B1 - Tầng 2 (Logistics & Chuỗi cung ứng)"),
    B2("Kệ B2 - Tầng 2 (Kinh tế vận tải & Hàng hải)"),
    C1("Kệ C1 - Tầng 3 (Kỹ thuật Xây dựng & Cầu đường)"),
    C2("Kệ C2 - Tầng 3 (Cơ khí, Điện - Điện tử & Tự động hóa)"),
    D1("Kệ D1 - Tầng 3 (Khoa học cơ bản, Ngoại ngữ & Tham khảo)");

    private final String description;

    ShelfLocation(String description) {
        this.description = description;
    }
}

