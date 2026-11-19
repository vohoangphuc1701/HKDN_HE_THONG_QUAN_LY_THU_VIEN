package com.library.service;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.entity.Book;
import com.library.entity.User;
import com.library.enums.*;
import com.library.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service xử lý toàn bộ nghiệp vụ Thống kê Dashboard, Quản lý Kho sách và Quản
 * lý Người dùng
 * Phục vụ Cổng Quản Trị Thủ Thư / Admin (frontend-admin - TV6)
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowOrderRepository borrowOrderRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final ReturnTicketRepository returnTicketRepository;
    private final FineRepository fineRepository;

    // ==================== 1. DASHBOARD OVERVIEW & ANALYTICS ====================

    /**
     * Tổng hợp toàn bộ chỉ số KPI, thống kê đơn mượn/trả, tiền phạt và dữ liệu biểu
     * đồ cho Dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // 1. Thống kê Kho sách
        long totalTitles = bookRepository.count();
        long totalCopies = bookRepository.sumTotalQuantity();
        long availableCopies = bookRepository.sumAvailableQuantity();
        long outOfStockTitles = bookRepository.countByAvailableQuantityEquals(0);

        stats.put("totalBookTitles", totalTitles);
        stats.put("totalPhysicalBooks", totalCopies);
        stats.put("totalCopies", totalCopies);
        stats.put("availableBooks", availableCopies);
        stats.put("availableCopies", availableCopies);
        stats.put("borrowedCopies", Math.max(0, totalCopies - availableCopies));
        stats.put("outOfStockTitles", outOfStockTitles);

        // 2. Thống kê Người dùng
        stats.put("totalStudents", userRepository.countByRole(Role.STUDENT));
        stats.put("totalLibrarians", userRepository.countByRole(Role.LIBRARIAN));
        stats.put("lockedUsersCount", userRepository.countByStatus(UserStatus.LOCKED));

        // 3. Thống kê Đơn mượn & Phiếu trả theo trạng thái
        long newOrders = borrowOrderRepository.countByStatus(BorrowOrderStatus.NEW);
        long processingOrders = borrowOrderRepository.countByStatus(BorrowOrderStatus.PROCESSING);
        long readyOrders = borrowOrderRepository.countByStatus(BorrowOrderStatus.READY_FOR_PICKUP);
        long borrowedOrders = borrowOrderRepository.countByStatus(BorrowOrderStatus.BORROWED);
        long returnedOrders = borrowOrderRepository.countByStatus(BorrowOrderStatus.RETURNED);
        long cancelledOrders = borrowOrderRepository.countByStatus(BorrowOrderStatus.CANCELLED);

        stats.put("newOrdersCount", newOrders);
        stats.put("processingOrdersCount", processingOrders);
        stats.put("readyForPickupCount", readyOrders);
        stats.put("activeBorrowedOrdersCount", borrowedOrders);
        stats.put("returnedOrdersCount", returnedOrders);
        stats.put("cancelledOrdersCount", cancelledOrders);

        stats.put("borrowingItemsCount", borrowDetailRepository.countByStatus(BorrowDetailStatus.BORROWING));
        stats.put("overdueItemsCount", borrowDetailRepository.countByStatus(BorrowDetailStatus.OVERDUE));
        stats.put("pendingReturnTicketsCount", returnTicketRepository.countByStatus(ReturnTicketStatus.PENDING_RETURN));

        // 4. Thống kê Tài chính Tiền phạt
        stats.put("unpaidFinesCount", fineRepository.countByStatus(FineStatus.UNPAID));
        stats.put("paidFinesCount", fineRepository.countByStatus(FineStatus.PAID));
        stats.put("unpaidFinesTotal", fineRepository.sumTotalAmountByStatus(FineStatus.UNPAID));
        stats.put("collectedFinesTotal", fineRepository.sumTotalAmountByStatus(FineStatus.PAID));

        // 5. Top 5 đầu sách được mượn nhiều nhất
        List<Map<String, Object>> topBooks = borrowDetailRepository.findTopBorrowedBooks(PageRequest.of(0, 5))
                .stream()
                .map(row -> {
                    Book b = (Book) row[0];
                    Long count = (Long) row[1];
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", b.getId());
                    item.put("code", b.getDocumentCode());
                    item.put("title", b.getTitle());
                    item.put("author", b.getAuthor());
                    item.put("category", b.getCategory());
                    item.put("borrowCount", count);
                    return item;
                })
                .toList();
        stats.put("topBorrowedBooks", topBooks);

        // 6. Phân bổ sách theo chuyên ngành (Dữ liệu vẽ biểu đồ Recharts)
        List<Map<String, Object>> categoryStats = bookRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCategory() != null ? b.getCategory() : "Khác",
                        Collectors.summarizingInt(b -> b.getTotalQuantity() != null ? b.getTotalQuantity() : 0)))
                .entrySet()
                .stream()
                .map(e -> Map.<String, Object>of(
                        "category", e.getKey(),
                        "titleCount", e.getValue().getCount(),
                        "totalCopies", e.getValue().getSum()))
                .toList();
        stats.put("categoryDistribution", categoryStats);

        // 7. Phân bổ đơn mượn theo trạng thái (Dữ liệu biểu đồ tròn/cột)
        List<Map<String, Object>> orderStatusDistribution = List.of(
                Map.of("status", "NEW", "label", "Đơn mới", "count", newOrders),
                Map.of("status", "PROCESSING", "label", "Đang chuẩn bị", "count", processingOrders),
                Map.of("status", "READY_FOR_PICKUP", "label", "Chờ nhận sách", "count", readyOrders),
                Map.of("status", "BORROWED", "label", "Đang mượn", "count", borrowedOrders),
                Map.of("status", "RETURNED", "label", "Đã trả", "count", returnedOrders),
                Map.of("status", "CANCELLED", "label", "Đã hủy", "count", cancelledOrders));
        stats.put("orderStatusDistribution", orderStatusDistribution);

        return stats;
    }

    // ==================== 2. QUẢN LÝ KHO SÁCH ADMIN (INVENTORY)
    // ====================

    /**
     * Lấy danh sách kho sách tương thích trực tiếp với trang
     * InventoryManagementPage.jsx
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInventory(String search, String category, String status) {
        String effectiveCategory = (category != null && !category.equalsIgnoreCase("ALL")) ? category.trim() : null;
        Boolean onlyAvailable = "AVAILABLE".equalsIgnoreCase(status) ? true : null;

        List<Book> books = bookRepository.searchBooks(
                search,
                effectiveCategory,
                null,
                onlyAvailable,
                PageRequest.of(0, 500, Sort.by("id").descending())).getContent();

        if ("OUT_OF_STOCK".equalsIgnoreCase(status)) {
            books = books.stream()
                    .filter(b -> b.getAvailableQuantity() == null || b.getAvailableQuantity() <= 0)
                    .toList();
        }

        return books.stream()
                .map(this::toInventoryDto)
                .toList();
    }

    /**
     * Xem chi tiết 1 đầu sách trong kho theo ID
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getInventoryBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
        return toInventoryDto(book);
    }

    /**
     * Thêm mới 1 đầu sách từ giao diện Quản lý kho của Thủ thư
     */
    @Transactional
    public Map<String, Object> createInventoryBook(InventoryBookRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Tên đầu sách không được để trống");
        }

        int total = request.getTotalCopies() != null ? request.getTotalCopies()
                : (request.getTotalQuantity() != null ? request.getTotalQuantity() : 1);
        int available = request.getAvailableCopies() != null ? request.getAvailableCopies()
                : (request.getAvailableQuantity() != null ? request.getAvailableQuantity() : total);

        if (available > total) {
            throw new BadRequestException("Số lượng khả dụng không được lớn hơn tổng số lượng trong kho");
        }

        String docCode = (request.getCode() != null && !request.getCode().isBlank())
                ? request.getCode().trim()
                : request.getDocumentCode();

        Book book = Book.builder()
                .title(request.getTitle().trim())
                .author(request.getAuthor() != null && !request.getAuthor().isBlank() ? request.getAuthor().trim()
                        : "Chưa rõ")
                .category(
                        request.getCategory() != null && !request.getCategory().isBlank() ? request.getCategory().trim()
                                : "Công nghệ thông tin")
                .documentCode(docCode)
                .shelfLocation(parseShelfLocation(request.getShelfLocation()))
                .publisher(request.getPublisher())
                .publishYear(request.getPublishYear())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .totalQuantity(total)
                .availableQuantity(available)
                .build();

        Book saved = bookRepository.save(book);
        return toInventoryDto(saved);
    }

    /**
     * Cập nhật đầu sách từ giao diện Quản lý kho của Thủ thư
     */
    @Transactional
    public Map<String, Object> updateInventoryBook(Long id, InventoryBookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            book.setTitle(request.getTitle().trim());
        }
        if (request.getAuthor() != null && !request.getAuthor().isBlank()) {
            book.setAuthor(request.getAuthor().trim());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            book.setCategory(request.getCategory().trim());
        }
        if (request.getCode() != null || request.getDocumentCode() != null) {
            book.setDocumentCode(
                    request.getCode() != null ? request.getCode().trim() : request.getDocumentCode().trim());
        }
        if (request.getShelfLocation() != null) {
            book.setShelfLocation(parseShelfLocation(request.getShelfLocation()));
        }
        if (request.getTotalCopies() != null || request.getTotalQuantity() != null) {
            book.setTotalQuantity(
                    request.getTotalCopies() != null ? request.getTotalCopies() : request.getTotalQuantity());
        }
        if (request.getAvailableCopies() != null || request.getAvailableQuantity() != null) {
            book.setAvailableQuantity(request.getAvailableCopies() != null ? request.getAvailableCopies()
                    : request.getAvailableQuantity());
        }
        if (book.getAvailableQuantity() > book.getTotalQuantity()) {
            throw new BadRequestException("Số lượng khả dụng không được vượt quá tổng số lượng trong kho");
        }

        Book saved = bookRepository.save(book);
        return toInventoryDto(saved);
    }

    /**
     * Xóa đầu sách khỏi kho
     */
    @Transactional
    public void deleteInventoryBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
        bookRepository.delete(book);
    }

    // ==================== 3. QUẢN LÝ NGƯỜI DÙNG ADMIN ====================

    @Transactional(readOnly = true)
    public Page<User> getUsers(String keyword, Role role, UserStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        return userRepository.searchUsers(keyword, role, status, pageable);
    }

    @Transactional
    public User updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));
        user.setStatus(status);
        return userRepository.save(user);
    }

    // ==================== Helper Methods & DTOs ====================

    public Map<String, Object> toInventoryDto(Book book) {
        Map<String, Object> map = new LinkedHashMap<>();
        int total = book.getTotalQuantity() != null ? book.getTotalQuantity() : 0;
        int available = book.getAvailableQuantity() != null ? book.getAvailableQuantity() : 0;

        map.put("id", book.getId());
        map.put("code", book.getDocumentCode() != null ? book.getDocumentCode() : "UTH-" + book.getId());
        map.put("documentCode", book.getDocumentCode());
        map.put("isbn", book.getDocumentCode() != null ? book.getDocumentCode() : "N/A");
        map.put("title", book.getTitle());
        map.put("author", book.getAuthor());
        map.put("category", book.getCategory());
        map.put("shelfLocation", book.getShelfLocation() != null ? book.getShelfLocation().name() : "A1");
        map.put("shelfDescription", book.getShelfLocation() != null ? book.getShelfLocation().getDescription() : "");
        map.put("totalCopies", total);
        map.put("totalQuantity", total);
        map.put("availableCopies", available);
        map.put("availableQuantity", available);
        map.put("status", available > 0 ? "AVAILABLE" : "OUT_OF_STOCK");
        return map;
    }

    private ShelfLocation parseShelfLocation(String rawShelf) {
        if (rawShelf == null || rawShelf.isBlank()) {
            return ShelfLocation.A1;
        }
        String normalized = rawShelf.trim().toUpperCase();
        for (ShelfLocation loc : ShelfLocation.values()) {
            if (normalized.equals(loc.name()) || normalized.contains(loc.name())) {
                return loc;
            }
        }
        return ShelfLocation.A1;
    }

    @Data
    public static class InventoryBookRequest {
        private String title;
        private String author;
        private String category;
        private String code;
        private String documentCode;
        private String isbn;
        private String shelfLocation;
        private String publisher;
        private Integer publishYear;
        private String description;
        private String coverImage;
        private Integer totalCopies;
        private Integer totalQuantity;
        private Integer availableCopies;
        private Integer availableQuantity;
    }
}
