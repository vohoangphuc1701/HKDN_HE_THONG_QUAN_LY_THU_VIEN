package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.entity.Book;
import com.library.enums.ShelfLocation;
import com.library.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller quản lý Danh mục Kho sách (Books Catalog)
 * - Public (Sinh viên/Khách): Tra cứu sách đa điều kiện, lọc chuyên ngành, xem vị trí kệ
 * - LIBRARIAN (Thủ thư): Thêm mới, cập nhật tồn kho và xóa đầu sách
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * Tra cứu danh sách sách có phân trang và bộ lọc đa tiêu chí
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ShelfLocation shelfLocation,
            @RequestParam(defaultValue = "false") Boolean onlyAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Map<String, Object> responseData = bookService.searchBooks(
                search, keyword, category, shelfLocation, onlyAvailable, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục sách thành công", responseData));
    }

    /**
     * Xem thông tin chi tiết 1 cuốn sách theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success("Chi tiết sách", book));
    }

    /**
     * Lấy danh sách tất cả các chuyên ngành (categories) hiện có trong thư viện
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
        List<String> categories = bookService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Danh sách chuyên ngành", categories));
    }

    /**
     * Lấy danh sách toàn bộ mã kệ sách (ShelfLocation) kèm mô tả vị trí tầng/khu
     */
    @GetMapping("/shelves")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAllShelfLocations() {
        List<Map<String, String>> shelves = bookService.getAllShelfLocations();
        return ResponseEntity.ok(ApiResponse.success("Danh sách vị trí kệ sách", shelves));
    }

    /**
     * Thêm mới 1 đầu sách vào kho (Dành cho Thủ thư - LIBRARIAN)
     */
    @PostMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Book>> createBook(@Valid @RequestBody Book bookRequest) {
        Book savedBook = bookService.createBook(bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Thêm sách mới vào kho thành công", savedBook));
    }

    /**
     * Cập nhật thông tin sách, vị trí kệ và số lượng tồn kho (Dành cho Thủ thư - LIBRARIAN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Book>> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody Book bookRequest
    ) {
        Book updatedBook = bookService.updateBook(id, bookRequest);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin sách thành công", updatedBook));
    }

    /**
     * Xóa đầu sách khỏi danh mục (Dành cho Thủ thư - LIBRARIAN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sách khỏi kho thành công", null));
    }
}
