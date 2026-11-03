package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.enums.BorrowDetailStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Thực thể BorrowDetail - Đại diện cho bảng 'borrow_details' trong CSDL MySQL
 * Chi tiết từng cuốn sách trong đơn mượn (hạn trả, gia hạn, trạng thái)
 * Định dạng Lombok: @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor, @Builder
 */
@Entity
@Table(name = "borrow_details", indexes = {
    @Index(name = "idx_borrow_detail_order", columnList = "borrow_order_id"),
    @Index(name = "idx_borrow_detail_book", columnList = "book_id"),
    @Index(name = "idx_borrow_detail_status", columnList = "status"),
    @Index(name = "idx_borrow_detail_due_date", columnList = "due_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Đơn mượn không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_order_id", nullable = false)
    @JsonIgnore
    private BorrowOrder borrowOrder;

    @NotNull(message = "Sách mượn không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Book book;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "actual_return_date")
    private LocalDateTime actualReturnDate;

    @Column(name = "renewal_count", nullable = false)
    @Builder.Default
    private Integer renewalCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private BorrowDetailStatus status = BorrowDetailStatus.BORROWING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.renewalCount == null) {
            this.renewalCount = 0;
        }
        if (this.status == null) {
            this.status = BorrowDetailStatus.BORROWING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
