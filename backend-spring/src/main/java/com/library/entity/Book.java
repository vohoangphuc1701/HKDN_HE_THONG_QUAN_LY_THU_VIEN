package com.library.entity;

import com.library.enums.ShelfLocation;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Thực thể Book - Đại diện cho bảng 'books' trong CSDL SQL Server (SSMS)
 * Quản lý trực tiếp tổng số lượng (totalQuantity), số lượng khả dụng (availableQuantity)
 * và vị trí kệ sách (shelfLocation) trong kho.
 */
@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_book_title", columnList = "title"),
    @Index(name = "idx_book_author", columnList = "author"),
    @Index(name = "idx_book_category", columnList = "category"),
    @Index(name = "idx_book_document_code", columnList = "document_code"),
    @Index(name = "idx_book_shelf_location", columnList = "shelf_location")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên sách không được để trống")
    @Size(max = 255, message = "Tên sách tối đa 255 ký tự")
    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @NotBlank(message = "Tác giả không được để trống")
    @Size(max = 150, message = "Tên tác giả tối đa 150 ký tự")
    @Column(name = "author", nullable = false, columnDefinition = "NVARCHAR(150)")
    private String author;

    @NotBlank(message = "Chuyên ngành/thể loại không được để trống")
    @Size(max = 100, message = "Chuyên ngành tối đa 100 ký tự")
    @Column(name = "category", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String category;

    @Size(max = 50, message = "Mã tài liệu tối đa 50 ký tự")
    @Column(name = "document_code", length = 50)
    private String documentCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "shelf_location", length = 50)
    private ShelfLocation shelfLocation;

    @Size(max = 150, message = "Nhà xuất bản tối đa 150 ký tự")
    @Column(name = "publisher", columnDefinition = "NVARCHAR(150)")
    private String publisher;

    @Column(name = "publish_year")
    private Integer publishYear;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @NotNull(message = "Tổng số lượng không được để trống")
    @Min(value = 0, message = "Tổng số lượng không được âm")
    @Column(name = "total_quantity", nullable = false)
    @Builder.Default
    private Integer totalQuantity = 0;

    @NotNull(message = "Số lượng khả dụng không được để trống")
    @Min(value = 0, message = "Số lượng khả dụng không được âm")
    @Column(name = "available_quantity", nullable = false)
    @Builder.Default
    private Integer availableQuantity = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.totalQuantity == null) this.totalQuantity = 0;
        if (this.availableQuantity == null) this.availableQuantity = this.totalQuantity;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper kiểm tra sách còn sẵn để mượn hay không
    public boolean isAvailable() {
        return this.availableQuantity != null && this.availableQuantity > 0;
    }
}
