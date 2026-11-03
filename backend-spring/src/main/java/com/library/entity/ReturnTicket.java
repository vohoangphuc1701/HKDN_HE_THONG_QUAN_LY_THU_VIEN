package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.library.enums.ReturnTicketStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Thực thể ReturnTicket - Đại diện cho bảng 'return_tickets' trong CSDL MySQL
 * Quản lý phiếu hẹn trả sách sớm có mã QR:
 * Sinh viên chủ động tạo lịch hẹn -> nhận mã QR -> thủ thư quét tại quầy
 */
@Entity
@Table(name = "return_tickets", indexes = {
    @Index(name = "idx_return_ticket_code", columnList = "ticket_code", unique = true),
    @Index(name = "idx_return_ticket_user", columnList = "user_id"),
    @Index(name = "idx_return_ticket_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Mã phiếu trả không được để trống")
    @Column(name = "ticket_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @NotNull(message = "Sinh viên hẹn trả không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @NotNull(message = "Ngày hẹn trả sớm không được để trống")
    @Column(name = "scheduled_return_date", nullable = false)
    private LocalDate scheduledReturnDate;

    @Column(name = "actual_return_date")
    private LocalDateTime actualReturnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ReturnTicketStatus status = ReturnTicketStatus.PENDING_RETURN;

    @Column(name = "librarian_note", length = 500)
    private String librarianNote;

    @OneToMany(mappedBy = "returnTicket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReturnDetail> returnDetails = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ReturnTicketStatus.PENDING_RETURN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addDetail(ReturnDetail detail) {
        returnDetails.add(detail);
        detail.setReturnTicket(this);
    }
}
