package com.library.service;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import com.library.entity.Book;
import com.library.enums.ShelfLocation;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service xử lý toàn bộ nghiệp vụ Quản lý Kho sách (Book Catalog & Inventory)
 * - Tra cứu đa tiêu chí, lọc chuyên ngành, vị trí kệ và phân trang
 * - Kiểm tra số lượng khả dụng và khóa bi quan (Pessimistic Lock) khi giữ/hoàn sách
 * - CRUD đầu sách dành cho Thủ thư (LIBRARIAN)
 */
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    /**
     * Tra cứu sách đa điều kiện kết hợp phân trang và sắp xếp
     */
    @Transactional(readOnly = true)
    public Map<String, Object> searchBooks(
            String search,
            String keyword,
            String category,
            ShelfLocation shelfLocation,
            Boolean onlyAvailable,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        String effectiveKeyword = (search != null && !search.isBlank()) ? search.trim() :
                                  (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String effectiveCategory = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL"))
                ? category.trim()
                : null;

        String sortField = (sortBy != null && !sortBy.isBlank()) ? sortBy.trim() : "id";
        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortField).ascending()
                : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Page<Book> bookPage = bookRepository.searchBooks(
                effectiveKeyword,
                effectiveCategory,
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
        return responseData;
    }

    /**
     * Lấy thông tin chi tiết 1 cuốn sách theo ID
     */
    @Transactional(readOnly = true)
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", id));
    }

    /**
     * Lấy danh sách tất cả chuyên ngành hiện có trong kho sách
     */
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return bookRepository.findAllCategories();
    }

    /**
     * Lấy danh sách toàn bộ mã kệ sách (ShelfLocation) kèm mô tả vị trí tầng/khu
     */
    public List<Map<String, String>> getAllShelfLocations() {
        return Arrays.stream(ShelfLocation.values())
                .map(shelf -> Map.of(
                        "code", shelf.name(),
                        "description", shelf.getDescription()
                ))
                .toList();
    }

    /**
     * Kiểm tra một cuốn sách có còn bản khả dụng để mượn hay không
     */
    @Transactional(readOnly = true)
    public boolean isBookAvailable(Long bookId) {
        Book book = getBookById(bookId);
        return book.getAvailableQuantity() != null && book.getAvailableQuantity() > 0;
    }

    /**
     * Khóa bản ghi sách (Pessimistic Write Lock), kiểm tra số lượng khả dụng và trừ 1 cuốn khi đặt mượn
     */
    @Transactional
    public Book reserveBookForBorrow(Long bookId) {
        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Sách", "id", bookId));

        if (book.getAvailableQuantity() == null || book.getAvailableQuantity() <= 0) {
            throw new BadRequestException("Sách '" + book.getTitle() + "' hiện đã hết bản khả dụng trong kho");
        }

        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        return bookRepository.save(book);
    }

    /**
     * Hoàn trả sách về kho khi sinh viên trả sách hoặc hủy đơn (hoặc giảm tổng kho nếu mất sách)
     */
    @Transactional
    public Book releaseBookToStock(Book book, boolean isLost) {
        if (isLost) {
            int newTotal = Math.max(0, (book.getTotalQuantity() != null ? book.getTotalQuantity() : 1) - 1);
            book.setTotalQuantity(newTotal);
            if (book.getAvailableQuantity() != null && book.getAvailableQuantity() > newTotal) {
                book.setAvailableQuantity(newTotal);
            }
        } else {
            int currentAvail = book.getAvailableQuantity() != null ? book.getAvailableQuantity() : 0;
            int total = book.getTotalQuantity() != null ? book.getTotalQuantity() : currentAvail + 1;
            book.setAvailableQuantity(Math.min(total, currentAvail + 1));
        }
        return bookRepository.save(book);
    }

    /**
     * Thêm mới 1 đầu sách vào kho (Dành cho Thủ thư - LIBRARIAN)
     */
    @Transactional
    public Book createBook(Book bookRequest) {
        if (bookRequest.getDocumentCode() != null && !bookRequest.getDocumentCode().isBlank()) {
            String code = bookRequest.getDocumentCode().trim();
            if (bookRepository.existsByDocumentCode(code)) {
                throw new BadRequestException("Mã tài liệu '" + code + "' đã tồn tại trong kho");
            }
            bookRequest.setDocumentCode(code);
        }

        if (bookRequest.getTotalQuantity() == null || bookRequest.getTotalQuantity() < 0) {
            throw new BadRequestException("Tổng số lượng sách không được âm");
        }

        if (bookRequest.getAvailableQuantity() == null) {
            bookRequest.setAvailableQuantity(bookRequest.getTotalQuantity());
        }

        if (bookRequest.getAvailableQuantity() < 0
                || bookRequest.getAvailableQuantity() > bookRequest.getTotalQuantity()) {
            throw new BadRequestException("Số lượng khả dụng phải từ 0 đến tổng số lượng sách trong kho");
        }

        if (bookRequest.getShelfLocation() == null) {
            bookRequest.setShelfLocation(ShelfLocation.A1);
        }

        return bookRepository.save(bookRequest);
    }

    /**
     * Cập nhật thông tin đầu sách, vị trí kệ và số lượng tồn kho (Dành cho Thủ thư - LIBRARIAN)
     */
    @Transactional
    public Book updateBook(Long id, Book bookRequest) {
        Book existingBook = getBookById(id);

        if (bookRequest.getDocumentCode() != null && !bookRequest.getDocumentCode().isBlank()) {
            String newCode = bookRequest.getDocumentCode().trim();
            bookRepository.findByDocumentCode(newCode).ifPresent(found -> {
                if (!found.getId().equals(id)) {
                    throw new BadRequestException("Mã tài liệu '" + newCode + "' đã thuộc về một đầu sách khác");
                }
            });
            existingBook.setDocumentCode(newCode);
        }

        Integer newTotal = bookRequest.getTotalQuantity() != null
                ? bookRequest.getTotalQuantity()
                : existingBook.getTotalQuantity();
        Integer newAvailable = bookRequest.getAvailableQuantity() != null
                ? bookRequest.getAvailableQuantity()
                : existingBook.getAvailableQuantity();

        if (newAvailable > newTotal) {
            throw new BadRequestException("Số lượng khả dụng không được vượt quá tổng số lượng trong kho");
        }

        existingBook.setTitle(bookRequest.getTitle().trim());
        existingBook.setAuthor(bookRequest.getAuthor().trim());
        existingBook.setCategory(bookRequest.getCategory().trim());
        if (bookRequest.getShelfLocation() != null) {
            existingBook.setShelfLocation(bookRequest.getShelfLocation());
        }
        existingBook.setPublisher(bookRequest.getPublisher());
        existingBook.setPublishYear(bookRequest.getPublishYear());
        existingBook.setDescription(bookRequest.getDescription());
        existingBook.setCoverImage(bookRequest.getCoverImage());
        existingBook.setTotalQuantity(newTotal);
        existingBook.setAvailableQuantity(newAvailable);

        return bookRepository.save(existingBook);
    }

    /**
     * Xóa đầu sách khỏi danh mục kho (Dành cho Thủ thư - LIBRARIAN)
     */
    @Transactional
    public void deleteBook(Long id) {
        Book existingBook = getBookById(id);
        bookRepository.delete(existingBook);
    }
}
