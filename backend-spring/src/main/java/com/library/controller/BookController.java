package com.library.controller;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.common.response.ApiResponse;
import com.library.entity.Book;
import com.library.enums.ShelfLocation;
import com.library.repository.BookRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.LinkedHashMap;
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

    private final BookRepository bookRepository;

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
        String effectiveKeyword = (search != null && !search.isBlank()) ? search.trim() :
                                  (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Page<Book> bookPage = bookRepository.searchBooks(
                effectiveKeyword,
                category,
                shelfLocation,
                onlyAvailable,
                pageable
        );

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("content", bookPage.getContent());
        responseData.put("page", bookPage.getNumber());
        responseData.put("size", bookPage.getSize());
        responseData.put("totalElements", bookPage.getTotalElements());
        responseData.put("totalPages", bookPage.getTotalPages());

        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục sách thành công", responseData));
    }

    /**
     * Xem thông tin chi tiết 1 cuốn sách theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
        return ResponseEntity.ok(ApiResponse.success("Chi tiết sách", book));
    }

    /**
     * Lấy danh sách tất cả các chuyên ngành (categories) hiện có trong thư viện
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
        List<String> categories = bookRepository.findAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Danh sách chuyên ngành", categories));
    }

    /**
     * Lấy danh sách toàn bộ mã kệ sách (ShelfLocation) kèm mô tả vị trí tầng/khu
     */
    @GetMapping("/shelves")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAllShelfLocations() {
        List<Map<String, String>> shelves = Arrays.stream(ShelfLocation.values())
                .map(shelf -> Map.of(
                        "code", shelf.name(),
                        "description", shelf.getDescription()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Danh sách vị trí kệ sách", shelves));
    }

    /**
     * Thêm mới 1 đầu sách vào kho (Dành cho Thủ thư - LIBRARIAN)
     */
    @PostMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Book>> createBook(@Valid @RequestBody Book bookRequest) {
        if (bookRequest.getDocumentCode() != null && !bookRequest.getDocumentCode().isBlank()
                && bookRepository.existsByDocumentCode(bookRequest.getDocumentCode().trim())) {
            throw new BadRequestException("Mã tài liệu '" + bookRequest.getDocumentCode() + "' đã tồn tại trong kho");
        }

        if (bookRequest.getAvailableQuantity() == null) {
            bookRequest.setAvailableQuantity(bookRequest.getTotalQuantity());
        }
        if (bookRequest.getAvailableQuantity() > bookRequest.getTotalQuantity()) {
            throw new BadRequestException("Số lượng khả dụng không được lớn hơn tổng số lượng sách trong kho");
        }

        Book savedBook = bookRepository.save(bookRequest);
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
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));

        if (bookRequest.getAvailableQuantity() != null
                && bookRequest.getTotalQuantity() != null
                && bookRequest.getAvailableQuantity() > bookRequest.getTotalQuantity()) {
            throw new BadRequestException("Số lượng khả dụng không được vượt quá tổng số lượng trong kho");
        }

        existingBook.setTitle(bookRequest.getTitle());
        existingBook.setAuthor(bookRequest.getAuthor());
        existingBook.setCategory(bookRequest.getCategory());
        existingBook.setDocumentCode(bookRequest.getDocumentCode());
        existingBook.setShelfLocation(bookRequest.getShelfLocation());
        existingBook.setPublisher(bookRequest.getPublisher());
        existingBook.setPublishYear(bookRequest.getPublishYear());
        existingBook.setDescription(bookRequest.getDescription());
        existingBook.setCoverImage(bookRequest.getCoverImage());
        existingBook.setTotalQuantity(bookRequest.getTotalQuantity());
        existingBook.setAvailableQuantity(bookRequest.getAvailableQuantity());

        Book updatedBook = bookRepository.save(existingBook);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin sách thành công", updatedBook));
    }

    /**
     * Xóa đầu sách khỏi danh mục (Dành cho Thủ thư - LIBRARIAN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
        bookRepository.delete(existingBook);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sách khỏi kho thành công", null));
    }
}

