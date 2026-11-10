package com.library.controller;

import com.library.service.QrService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/*
 * Cung cấp các điểm cuối API để sinh mã QR Base64 cho đơn mượn và phiếu trả sách.
 */
@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    /*
     * API mã hóa orderId và danh sách sách thành chuỗi QR Base64 cho đơn mượn qua GET.
     */
    @GetMapping("/borrow/base64")
    public ResponseEntity<Map<String, Object>> getBorrowQrBase64(
            @RequestParam Long orderId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String books) {

        List<String> bookList = parseBooks(books);
        String base64;
        if (studentId != null && !studentId.isBlank()) {
            base64 = qrService.generateBorrowQrBase64(orderId, studentId, bookList);
        } else {
            base64 = qrService.generateBorrowQrBase64(orderId, bookList);
        }
        String dataUri = "data:image/png;base64," + base64;

        return ResponseEntity.ok(Map.of(
                "base64", base64,
                "dataUri", dataUri,
                "orderId", orderId,
                "books", bookList,
                "type", "BORROW"
        ));
    }

    /*
     * API mã hóa orderId và danh sách sách thành chuỗi QR Base64 qua POST.
     */
    @PostMapping("/borrow/base64")
    public ResponseEntity<Map<String, Object>> createBorrowQrBase64(@RequestBody Map<String, Object> payload) {
        Long orderId = payload.get("orderId") != null ? Long.valueOf(payload.get("orderId").toString()) : null;
        String studentId = payload.get("studentId") != null ? payload.get("studentId").toString() : null;
        List<String> books = extractBooksList(payload.get("books"));

        if (orderId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderId không được để trống"));
        }

        String base64;
        if (studentId != null && !studentId.isBlank()) {
            base64 = qrService.generateBorrowQrBase64(orderId, studentId, books);
        } else {
            base64 = qrService.generateBorrowQrBase64(orderId, books);
        }
        String dataUri = "data:image/png;base64," + base64;

        return ResponseEntity.ok(Map.of(
                "base64", base64,
                "dataUri", dataUri,
                "orderId", orderId,
                "books", books,
                "type", "BORROW"
        ));
    }

    /*
     * API mã hóa returnTicketId và danh sách sách thành chuỗi QR Base64 cho phiếu trả qua GET.
     */
    @GetMapping("/return/base64")
    public ResponseEntity<Map<String, Object>> getReturnQrBase64(
            @RequestParam(required = false) String returnTicketId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String books) {

        List<String> bookList = parseBooks(books);
        String ticketId = returnTicketId != null && !returnTicketId.isBlank()
                ? returnTicketId
                : (orderId != null ? "ORDER-" + orderId : "RETURN-DEFAULT");

        String base64 = qrService.generateReturnQrBase64(ticketId, bookList);
        String dataUri = "data:image/png;base64," + base64;

        return ResponseEntity.ok(Map.of(
                "base64", base64,
                "dataUri", dataUri,
                "returnTicketId", ticketId,
                "books", bookList,
                "type", "RETURN"
        ));
    }

    /*
     * API mã hóa returnTicketId và danh sách sách thành chuỗi QR Base64 qua POST.
     */
    @PostMapping("/return/base64")
    public ResponseEntity<Map<String, Object>> createReturnQrBase64(@RequestBody Map<String, Object> payload) {
        String returnTicketId = payload.get("returnTicketId") != null ? payload.get("returnTicketId").toString() : null;
        if (returnTicketId == null && payload.get("orderId") != null) {
            returnTicketId = "ORDER-" + payload.get("orderId");
        }
        if (returnTicketId == null || returnTicketId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "returnTicketId không được để trống"));
        }

        List<String> books = extractBooksList(payload.get("books"));
        String base64 = qrService.generateReturnQrBase64(returnTicketId, books);
        String dataUri = "data:image/png;base64," + base64;

        return ResponseEntity.ok(Map.of(
                "base64", base64,
                "dataUri", dataUri,
                "returnTicketId", returnTicketId,
                "books", books,
                "type", "RETURN"
        ));
    }

    /*
     * API tải trực tiếp ảnh mã QR dạng PNG cho đơn mượn sách.
     */
    @GetMapping("/borrow/image")
    public ResponseEntity<byte[]> getBorrowQrImage(
            @RequestParam Long orderId,
            @RequestParam(required = false) String books) {

        List<String> bookList = parseBooks(books);
        byte[] image = qrService.generateBorrowQrImage(orderId, bookList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(image.length);
        headers.setContentDispositionFormData("inline", "qr-borrow-" + orderId + ".png");

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    /*
     * API tải trực tiếp ảnh mã QR dạng PNG cho phiếu trả sách.
     */
    @GetMapping("/return/image")
    public ResponseEntity<byte[]> getReturnQrImage(
            @RequestParam String returnTicketId,
            @RequestParam(required = false) String books) {

        List<String> bookList = parseBooks(books);
        byte[] image = qrService.generateReturnQrImage(returnTicketId, bookList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(image.length);
        headers.setContentDispositionFormData("inline", "qr-return-" + returnTicketId + ".png");

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    /*
     * Tách chuỗi sách phân cách bằng dấu phẩy thành danh sách chuỗi.
     */
    private List<String> parseBooks(String booksParam) {
        if (booksParam == null || booksParam.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(booksParam.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /*
     * Trích xuất danh sách sách từ dữ liệu payload bất kỳ.
     */
    @SuppressWarnings("unchecked")
    private List<String> extractBooksList(Object booksObj) {
        if (booksObj instanceof List<?>) {
            return ((List<?>) booksObj).stream()
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
        if (booksObj instanceof String) {
            return parseBooks((String) booksObj);
        }
        return Collections.emptyList();
    }
}
