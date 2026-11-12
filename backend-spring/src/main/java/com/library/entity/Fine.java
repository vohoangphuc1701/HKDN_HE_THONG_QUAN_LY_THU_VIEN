package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.enums.FineStatus;
import com.library.enums.PaymentMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Thực thể Fine - Đại diện cho bảng 'fines' trong CSDL MySQL
 * Quản lý tiền phạt trễ hạn và các khoản phụ thu hư hại/bồi thường sách
 * Công thức: TotalAmount = LateFee (Số ngày trễ * 5.000 VNĐ) + DamageFee
 */
@Entity
@Table(name = "fines", indexes = {
    @Index(name = "idx_fine_code", columnList = "fine_code", unique = true),
    @Index(name = "idx_fine_user", columnList = "user_id"),
    @Index(name = "idx_fine_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Mã biên lai phạt không được để trống")
    @Column(name = "fine_code", nullable = false, unique = true, length = 50)
    private String fineCode;

    @NotNull(message = "Sinh viên bị phạt không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_detail_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BorrowDetail borrowDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_ticket_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ReturnTicket returnTicket;

    @Column(name = "overdue_days")
    @Builder.Default
    private Integer overdueDays = 0;

    @Column(name = "late_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(name = "damage_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal damageFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private FineStatus status = FineStatus.UNPAID;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = FineStatus.UNPAID;
        if (this.lateFee == null) this.lateFee = BigDecimal.ZERO;
        if (this.damageFee == null) this.damageFee = BigDecimal.ZERO;
        if (this.totalAmount == null || this.totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            this.totalAmount = this.lateFee.add(this.damageFee);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.lateFee == null) this.lateFee = BigDecimal.ZERO;
        if (this.damageFee == null) this.damageFee = BigDecimal.ZERO;
        this.totalAmount = this.lateFee.add(this.damageFee);
    }
}
