package com.library.repository;

import com.library.entity.Book;
import com.library.enums.ShelfLocation;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác dữ liệu bảng 'books'
 * Hỗ trợ tìm kiếm đa tiêu chí, phân trang, khóa bi quan chống tranh chấp tồn kho và thống kê
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByDocumentCode(String documentCode);

    boolean existsByDocumentCode(String documentCode);

    List<Book> findByCategoryIgnoreCase(String category);

    List<Book> findByShelfLocation(ShelfLocation shelfLocation);

    List<Book> findByAvailableQuantityGreaterThan(Integer minQuantity);

    /**
     * Khóa bản ghi sách (Pessimistic Write Lock) khi sinh viên đặt mượn trực tuyến
     * nhằm tránh lỗi Race Condition khi 2 sinh viên cùng mượn cuốn sách cuối cùng
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    Optional<Book> findByIdForUpdate(@Param("id") Long id);

    /**
     * Tra cứu sách đa điều kiện: từ khóa (tên sách, tác giả, mã tài liệu),
     * lọc theo chuyên ngành, vị trí kệ và trạng thái còn sách khả dụng
     */
    @Query("SELECT b FROM Book b WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.documentCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR :category = '' OR LOWER(b.category) = LOWER(:category)) " +
           "AND (:shelfLocation IS NULL OR b.shelfLocation = :shelfLocation) " +
           "AND (:onlyAvailable IS NULL OR :onlyAvailable = false OR b.availableQuantity > 0)")
    Page<Book> searchBooks(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("shelfLocation") ShelfLocation shelfLocation,
            @Param("onlyAvailable") Boolean onlyAvailable,
            Pageable pageable
    );

    @Query("SELECT DISTINCT b.category FROM Book b WHERE b.category IS NOT NULL ORDER BY b.category ASC")
    List<String> findAllCategories();

    @Query("SELECT COALESCE(SUM(b.totalQuantity), 0) FROM Book b")
    long sumTotalQuantity();

    @Query("SELECT COALESCE(SUM(b.availableQuantity), 0) FROM Book b")
    long sumAvailableQuantity();

    long countByAvailableQuantityEquals(Integer quantity);
}

