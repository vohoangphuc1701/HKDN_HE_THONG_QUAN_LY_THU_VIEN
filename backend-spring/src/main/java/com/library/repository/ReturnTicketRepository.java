package com.library.repository;

import com.library.entity.ReturnTicket;
import com.library.enums.ReturnTicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác dữ liệu bảng 'return_tickets'
 * Quản lý phiếu hẹn trả sách có mã QR (PENDING_RETURN -> COMPLETED / CANCELLED)
 */
@Repository
public interface ReturnTicketRepository extends JpaRepository<ReturnTicket, Long> {

    @EntityGraph(attributePaths = {"user", "returnDetails", "returnDetails.borrowDetail", "returnDetails.borrowDetail.book"})
    Optional<ReturnTicket> findByTicketCode(String ticketCode);

    boolean existsByTicketCode(String ticketCode);

    @EntityGraph(attributePaths = {"returnDetails", "returnDetails.borrowDetail", "returnDetails.borrowDetail.book"})
    List<ReturnTicket> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "returnDetails", "returnDetails.borrowDetail", "returnDetails.borrowDetail.book"})
    List<ReturnTicket> findByStatusOrderByScheduledReturnDateAsc(ReturnTicketStatus status);

    Page<ReturnTicket> findByStatus(ReturnTicketStatus status, Pageable pageable);

    /**
     * Tìm các phiếu hẹn trả sách đã quá ngày hẹn (scheduledReturnDate) nhưng chưa lên quầy
     */
    List<ReturnTicket> findByStatusAndScheduledReturnDateBefore(ReturnTicketStatus status, LocalDate date);

    /**
     * Tìm kiếm phiếu hẹn trả theo mã phiếu hoặc thông tin sinh viên cho màn hình Thủ thư
     */
    @Query("SELECT rt FROM ReturnTicket rt WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(rt.ticketCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rt.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rt.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR rt.status = :status)")
    Page<ReturnTicket> searchReturnTickets(
            @Param("keyword") String keyword,
            @Param("status") ReturnTicketStatus status,
            Pageable pageable
    );

    long countByStatus(ReturnTicketStatus status);
}

