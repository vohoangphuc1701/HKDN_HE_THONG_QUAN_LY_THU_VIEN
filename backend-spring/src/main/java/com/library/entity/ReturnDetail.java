package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.enums.BookCondition;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Thực thể ReturnDetail - Đại diện cho bảng 'return_details' trong CSDL MySQL
 * Danh sách từng cuốn sách trong phiếu trả và đối soát tình trạng thực tế tại quầy
 */
@Entity
@Table(name = "return_details", indexes = {
    @Index(name = "idx_return_detail_ticket", columnList = "return_ticket_id"),
    @Index(name = "idx_return_detail_borrow", columnList = "borrow_detail_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Phiếu trả không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_ticket_id", nullable = false)
    @JsonIgnore
    private ReturnTicket returnTicket;

    @NotNull(message = "Chi tiết mượn không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_detail_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BorrowDetail borrowDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "book_condition", nullable = false, length = 30)
    @Builder.Default
    private BookCondition bookCondition = BookCondition.NORMAL;

    @Column(name = "damage_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal damageFee = BigDecimal.ZERO;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.bookCondition == null) {
            this.bookCondition = BookCondition.NORMAL;
        }
        if (this.damageFee == null) {
            this.damageFee = BigDecimal.ZERO;
        }
    }
}
