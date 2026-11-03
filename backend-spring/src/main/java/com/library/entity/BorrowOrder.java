package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.enums.BorrowOrderStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Thực thể BorrowOrder - Đại diện cho bảng 'borrow_orders' trong CSDL MySQL
 * Quản lý vòng đời đơn mượn: NEW -> PROCESSING -> READY_FOR_PICKUP -> BORROWED -> RETURNED / CANCELLED
 */
@Entity
@Table(name = "borrow_orders", indexes = {
    @Index(name = "idx_borrow_order_code", columnList = "order_code", unique = true),
    @Index(name = "idx_borrow_order_user", columnList = "user_id"),
    @Index(name = "idx_borrow_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Mã đơn không được để trống")
    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @NotNull(message = "Người mượn không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @NotNull(message = "Ngày hẹn lấy sách không được để trống")
    @Column(name = "pickup_date", nullable = false)
    private LocalDate pickupDate;

    @Column(name = "actual_pickup_date")
    private LocalDateTime actualPickupDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private BorrowOrderStatus status = BorrowOrderStatus.NEW;

    @Column(name = "note", length = 500)
    private String note;

    @OneToMany(mappedBy = "borrowOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BorrowDetail> borrowDetails = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BorrowOrderStatus.NEW;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addDetail(BorrowDetail detail) {
        borrowDetails.add(detail);
        detail.setBorrowOrder(this);
    }
}
