package com.library.repository;

import com.library.entity.Fine;
import com.library.enums.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác dữ liệu bảng 'fines'
 * Quản lý biên lai thu phạt trễ hạn (5.000đ/ngày) và phụ thu hư hại/mất sách
 */
@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    @EntityGraph(attributePaths = {"user", "borrowDetail", "borrowDetail.book", "returnTicket"})
    Optional<Fine> findByFineCode(String fineCode);

    boolean existsByFineCode(String fineCode);

    @EntityGraph(attributePaths = {"borrowDetail", "borrowDetail.book", "returnTicket"})
    List<Fine> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"borrowDetail", "borrowDetail.book", "returnTicket"})
    List<Fine> findByUserIdAndStatus(Long userId, FineStatus status);

    /**
     * Kiểm tra sinh viên có biên lai phạt nào chưa thanh toán (UNPAID) hay không.
     * Quy tắc nghiệp vụ: Chặn đặt mượn sách mới nếu còn nợ phạt chưa thanh toán.
     */
    boolean existsByUserIdAndStatus(Long userId, FineStatus status);

    Optional<Fine> findByBorrowDetailIdAndStatus(Long borrowDetailId, FineStatus status);

    Page<Fine> findByStatus(FineStatus status, Pageable pageable);

    /**
     * Tìm kiếm biên lai phạt cho màn hình Quản lý tiền phạt của Thủ thư
     */
    @Query("SELECT f FROM Fine f WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(f.fineCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR f.status = :status)")
    Page<Fine> searchFines(
            @Param("keyword") String keyword,
            @Param("status") FineStatus status,
            Pageable pageable
    );

    /**
     * Tính tổng số tiền phạt chưa đóng của 1 sinh viên
     */
    @Query("SELECT COALESCE(SUM(f.totalAmount), 0) FROM Fine f WHERE f.user.id = :userId AND f.status = :status")
    BigDecimal sumTotalAmountByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") FineStatus status
    );

    /**
     * Thống kê tổng tiền phạt toàn hệ thống theo trạng thái (PAID / UNPAID) cho Dashboard
     */
    @Query("SELECT COALESCE(SUM(f.totalAmount), 0) FROM Fine f WHERE f.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") FineStatus status);

    long countByStatus(FineStatus status);
}

