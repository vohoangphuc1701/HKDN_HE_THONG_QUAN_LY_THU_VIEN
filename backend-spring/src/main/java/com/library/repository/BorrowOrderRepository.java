package com.library.repository;

import com.library.entity.BorrowOrder;
import com.library.enums.BorrowOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác dữ liệu bảng 'borrow_orders'
 * Quản lý đơn mượn trực tuyến, quét QR bàn giao sách tại quầy và tự động hủy đơn quá hạn 48h
 */
@Repository
public interface BorrowOrderRepository extends JpaRepository<BorrowOrder, Long> {

    @EntityGraph(attributePaths = {"user", "borrowDetails", "borrowDetails.book"})
    Optional<BorrowOrder> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"borrowDetails", "borrowDetails.book"})
    List<BorrowOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<BorrowOrder> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "borrowDetails", "borrowDetails.book"})
    List<BorrowOrder> findByStatusOrderByCreatedAtDesc(BorrowOrderStatus status);

    Page<BorrowOrder> findByStatus(BorrowOrderStatus status, Pageable pageable);

    List<BorrowOrder> findByUserIdAndStatusIn(Long userId, Collection<BorrowOrderStatus> statuses);

    /**
     * Phục vụ Cronjob: Tìm các đơn ở trạng thái READY_FOR_PICKUP đã quá hạn giữ chỗ 48h
     * để tự động chuyển sang CANCELLED và hoàn lại availableQuantity vào kho sách
     */
    @EntityGraph(attributePaths = {"user", "borrowDetails", "borrowDetails.book"})
    List<BorrowOrder> findByStatusAndUpdatedAtBefore(BorrowOrderStatus status, LocalDateTime threshold);

    /**
     * Tìm các đơn chưa tới nhận sách khi đã quá ngày hẹn lấy (pickupDate)
     */
    @EntityGraph(attributePaths = {"user", "borrowDetails", "borrowDetails.book"})
    List<BorrowOrder> findByStatusInAndPickupDateBefore(Collection<BorrowOrderStatus> statuses, LocalDate date);

    /**
     * Tìm kiếm và lọc danh sách đơn mượn cho màn hình Quản trị của Thủ thư (LIBRARIAN)
     */
    @Query("SELECT bo FROM BorrowOrder bo WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(bo.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(bo.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(bo.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR bo.status = :status)")
    Page<BorrowOrder> searchBorrowOrders(
            @Param("keyword") String keyword,
            @Param("status") BorrowOrderStatus status,
            Pageable pageable
    );

    long countByStatus(BorrowOrderStatus status);
}

