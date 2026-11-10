package com.library.repository;

import com.library.entity.BorrowDetail;
import com.library.enums.BorrowDetailStatus;
import com.library.enums.BorrowOrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

/**
 * Repository thao tác dữ liệu bảng 'borrow_details'
 * Quản lý từng cuốn sách đang mượn, gia hạn trực tuyến (+14 ngày, tối đa 1 lần) và quét quá hạn
 */
@Repository
public interface BorrowDetailRepository extends JpaRepository<BorrowDetail, Long> {

    @EntityGraph(attributePaths = {"book", "borrowOrder"})
    List<BorrowDetail> findByBorrowOrderId(Long borrowOrderId);

    @EntityGraph(attributePaths = {"book", "borrowOrder"})
    List<BorrowDetail> findByBorrowOrderUserIdAndStatus(Long userId, BorrowDetailStatus status);

    @EntityGraph(attributePaths = {"book", "borrowOrder"})
    List<BorrowDetail> findByBorrowOrderUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Đếm tổng số cuốn sách sinh viên đang giữ hoặc đang đặt mượn (chưa trả/chưa hủy)
     * Dùng để kiểm tra quy tắc nghiệp vụ: Mỗi sinh viên mượn tối đa 5 cuốn cùng lúc
     */
    @Query("SELECT COUNT(bd) FROM BorrowDetail bd " +
           "WHERE bd.borrowOrder.user.id = :userId " +
           "AND bd.status IN :detailStatuses " +
           "AND bd.borrowOrder.status NOT IN :excludedOrderStatuses")
    long countActiveBorrowsByUser(
            @Param("userId") Long userId,
            @Param("detailStatuses") Collection<BorrowDetailStatus> detailStatuses,
            @Param("excludedOrderStatuses") Collection<BorrowOrderStatus> excludedOrderStatuses
    );

    /**
     * Kiểm tra sinh viên có đang giữ hoặc đang đặt mượn trùng 1 đầu sách hay không
     */
    @Query("SELECT COUNT(bd) > 0 FROM BorrowDetail bd " +
           "WHERE bd.borrowOrder.user.id = :userId " +
           "AND bd.book.id = :bookId " +
           "AND bd.status IN :detailStatuses " +
           "AND bd.borrowOrder.status NOT IN :excludedOrderStatuses")
    boolean existsActiveBookBorrowByUser(
            @Param("userId") Long userId,
            @Param("bookId") Long bookId,
            @Param("detailStatuses") Collection<BorrowDetailStatus> detailStatuses,
            @Param("excludedOrderStatuses") Collection<BorrowOrderStatus> excludedOrderStatuses
    );

    /**
     * Phục vụ Cronjob: Tìm các cuốn sách đang mượn (BORROWING) nhưng hạn trả (dueDate) < hôm nay
     * để tự động chuyển trạng thái sang OVERDUE và tính tiền phạt trễ hạn (5.000đ/ngày)
     */
    @EntityGraph(attributePaths = {"book", "borrowOrder", "borrowOrder.user"})
    List<BorrowDetail> findByStatusAndDueDateBefore(BorrowDetailStatus status, LocalDate today);

    /**
     * Phục vụ Cronjob gửi Email nhắc hạn trả trước 1-2 ngày
     */
    @EntityGraph(attributePaths = {"book", "borrowOrder", "borrowOrder.user"})
    List<BorrowDetail> findByStatusAndDueDate(BorrowDetailStatus status, LocalDate targetDate);

    long countByStatus(BorrowDetailStatus status);

    /**
     * Thống kê Top các đầu sách được mượn nhiều nhất cho Dashboard Admin/Thủ thư
     */
    @Query("SELECT bd.book, COUNT(bd) AS borrowCount FROM BorrowDetail bd " +
           "GROUP BY bd.book ORDER BY borrowCount DESC")
    List<Object[]> findTopBorrowedBooks(Pageable pageable);
}

