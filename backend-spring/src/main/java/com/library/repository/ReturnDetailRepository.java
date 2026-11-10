package com.library.repository;

import com.library.entity.ReturnDetail;
import com.library.enums.BookCondition;
import com.library.enums.ReturnTicketStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository thao tác dữ liệu bảng 'return_details'
 * Quản lý chi tiết đối soát tình trạng vật lý từng cuốn sách khi trả tại quầy
 */
@Repository
public interface ReturnDetailRepository extends JpaRepository<ReturnDetail, Long> {

    @EntityGraph(attributePaths = {"borrowDetail", "borrowDetail.book"})
    List<ReturnDetail> findByReturnTicketId(Long returnTicketId);

    List<ReturnDetail> findByBorrowDetailId(Long borrowDetailId);

    List<ReturnDetail> findByBookCondition(BookCondition bookCondition);

    /**
     * Kiểm tra một cuốn sách đang mượn đã nằm trong phiếu hẹn trả nào đang chờ (PENDING_RETURN) hay chưa,
     * tránh việc sinh viên tạo trùng nhiều phiếu hẹn trả cho cùng 1 cuốn sách
     */
    boolean existsByBorrowDetailIdAndReturnTicketStatus(Long borrowDetailId, ReturnTicketStatus status);
}

