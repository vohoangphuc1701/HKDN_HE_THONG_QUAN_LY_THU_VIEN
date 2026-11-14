package com.library.controller;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.common.response.ApiResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller cung cấp API cho Cổng Quản Trị Thủ Thư / Admin (frontend-admin - TV6)
 * - Thống kê tổng quan Dashboard, biểu đồ phân bổ kho sách và Top sách mượn nhiều nhất
 * - Quản lý Kho sách (/api/admin/inventory) tương thích trực tiếp với adminApi.js
 * - Quản lý Tài khoản Sinh viên & Khóa/Mở khóa thẻ thư viện (/api/admin/users)
 */
@RestController
@RequestMapping({"/api/admin", "/api/dashboard"})
@PreAuthorize("hasRole('LIBRARIAN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowOrderRepository borrowOrderRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final ReturnTicketRepository returnTicketRepository;
    private final FineRepository fineRepository;

    // ==================== 1. DASHBOARD OVERVIEW & ANALYTICS ====================

    /**
     * Lấy toàn bộ chỉ số KPI tổng quan, thống kê đơn mượn, tiền phạt và dữ liệu biểu đồ cho Dashboard
     */
    @GetMapping({"", "/overview", "/stats"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview() {
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
        stats.put("newOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.NEW));
        stats.put("processingOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.PROCESSING));
        stats.put("readyForPickupCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.READY_FOR_PICKUP));
        stats.put("activeBorrowedOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.BORROWED));
        stats.put("returnedOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.RETURNED));
        stats.put("cancelledOrdersCount", borrowOrderRepository.countByStatus(BorrowOrderStatus.CANCELLED));

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
                        Collectors.summarizingInt(b -> b.getTotalQuantity() != null ? b.getTotalQuantity() : 0)
                ))
                .entrySet()
                .stream()
                .map(e -> Map.<String, Object>of(
                        "category", e.getKey(),
                        "titleCount", e.getValue().getCount(),
                        "totalCopies", e.getValue().getSum()
                ))
                .toList();
        stats.put("categoryDistribution", categoryStats);

        return ResponseEntity.ok(ApiResponse.success("Lấy dữ liệu tổng quan Dashboard thành công", stats));
    }

    // ==================== 2. QUẢN LÝ KHO SÁCH (/api/admin/inventory) ====================

    /**
     * Danh sách kho sách dành cho trang InventoryManagementPage.jsx (TV6)
     */
    @GetMapping("/inventory")
    public ResponseEntity<List<Map<String, Object>>> getInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        String effectiveCategory = (category != null && !category.equalsIgnoreCase("ALL")) ? category.trim() : null;
        Boolean onlyAvailable = "AVAILABLE".equalsIgnoreCase(status) ? true : null;

        List<Book> books = bookRepository.searchBooks(
                search,
                effectiveCategory,
                null,
                onlyAvailable,
                PageRequest.of(0, 500, Sort.by("id").descending())
        ).getContent();

        if ("OUT_OF_STOCK".equalsIgnoreCase(status)) {
            books = books.stream()
                    .filter(b -> b.getAvailableQuantity() == null || b.getAvailableQuantity() <= 0)
                    .toList();
        }

        List<Map<String, Object>> result = books.stream()
                .map(this::toInventoryDto)
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * Xem chi tiết 1 đầu sách trong kho theo ID
     */
    @GetMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> getInventoryBookById(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
        return ResponseEntity.ok(toInventoryDto(book));
    }

    /**
     * Thêm mới 1 đầu sách từ giao diện Quản lý kho của Thủ thư
     */
    @PostMapping("/inventory")
    @Transactional
    public ResponseEntity<Map<String, Object>> createInventoryBook(@RequestBody InventoryBookRequest request) {
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
                .author(request.getAuthor() != null && !request.getAuthor().isBlank() ? request.getAuthor().trim() : "Chưa rõ")
                .category(request.getCategory() != null && !request.getCategory().isBlank() ? request.getCategory().trim() : "Công nghệ thông tin")
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
        return ResponseEntity.status(HttpStatus.CREATED).body(toInventoryDto(saved));
    }

    /**
     * Cập nhật đầu sách từ giao diện Quản lý kho của Thủ thư
     */
    @PutMapping("/inventory/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateInventoryBook(
            @PathVariable Long id,
            @RequestBody InventoryBookRequest request
    ) {
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
            book.setDocumentCode(request.getCode() != null ? request.getCode().trim() : request.getDocumentCode().trim());
        }
        if (request.getShelfLocation() != null) {
            book.setShelfLocation(parseShelfLocation(request.getShelfLocation()));
        }
        if (request.getTotalCopies() != null || request.getTotalQuantity() != null) {
            book.setTotalQuantity(request.getTotalCopies() != null ? request.getTotalCopies() : request.getTotalQuantity());
        }
        if (request.getAvailableCopies() != null || request.getAvailableQuantity() != null) {
            book.setAvailableQuantity(request.getAvailableCopies() != null ? request.getAvailableCopies() : request.getAvailableQuantity());
        }
        if (book.getAvailableQuantity() > book.getTotalQuantity()) {
            throw new BadRequestException("Số lượng khả dụng không được vượt quá tổng số lượng trong kho");
        }

        Book saved = bookRepository.save(book);
        return ResponseEntity.ok(toInventoryDto(saved));
    }

    /**
     * Xóa đầu sách khỏi kho
     */
    @DeleteMapping("/inventory/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteInventoryBook(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
        bookRepository.delete(book);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đầu sách thành công", null));
    }

    // ==================== 3. QUẢN LÝ TÀI KHOẢN SINH VIÊN (/api/admin/users) ====================

    /**
     * Tra cứu danh sách tài khoản người dùng (Sinh viên & Thủ thư)
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by("createdAt").descending());
        Page<User> users = userRepository.searchUsers(keyword, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Danh sách tài khoản người dùng", users));
    }

    /**
     * Khóa hoặc mở khóa tài khoản sinh viên (ACTIVE <-> LOCKED)
     */
    @PatchMapping("/users/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));
        user.setStatus(status);
        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công", updated));
    }

    // ==================== Helper Methods & DTOs ====================

    private Map<String, Object> toInventoryDto(Book book) {
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

