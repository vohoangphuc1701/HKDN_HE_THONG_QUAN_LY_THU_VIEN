package com.library.controller;

import com.library.service.QrService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller cung cấp API tạo mã QR cho đơn mượn/trả sách.
 * Khi sinh viên tạo đơn mượn, hệ thống sinh mã QR chứa thông tin đơn.
 * Tại quầy thư viện, thủ thư quét QR để xác nhận bàn giao/nhận sách.
 *
 * @author TV5
 */
@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    // ──────────────────────────────────────────────
    //  API tạo QR cho đơn MƯỢN sách
    // ──────────────────────────────────────────────

    /**
     * Tạo ảnh QR Code (PNG) cho đơn mượn sách.
     * Trả về file ảnh PNG – dùng để hiển thị trực tiếp hoặc download.
     */
    @GetMapping("/borrow/image")
    public ResponseEntity<byte[]> getBorrowQrImage(
            @RequestParam Long orderId,
            @RequestParam String studentId) {

        byte[] image = qrService.generateBorrowQrImage(orderId, studentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(image.length);
        headers.setContentDispositionFormData("inline", "qr-borrow-" + orderId + ".png");

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    /**
     * Tạo QR Code dạng Base64 cho đơn mượn sách.
     * Trả về JSON chứa base64 và dataUri.
     */
    @GetMapping("/borrow/base64")
    public ResponseEntity<Map<String, String>> getBorrowQrBase64(
            @RequestParam Long orderId,
            @RequestParam String studentId) {

        String base64 = qrService.generateBorrowQrBase64(orderId, studentId);
        String dataUri = "data:image/png;base64," + base64;

        return ResponseEntity.ok(Map.of(
                "base64", base64,
                "dataUri", dataUri,
                "orderId", orderId.toString(),
                "studentId", studentId,
                "type", "BORROW"
        ));
    }

    // ──────────────────────────────────────────────
    //  API tạo QR cho đơn TRẢ sách
    // ──────────────────────────────────────────────

    /**
     * Tạo ảnh QR Code (PNG) cho đơn trả sách.
     */
    @GetMapping("/return/image")
    public ResponseEntity<byte[]> getReturnQrImage(
            @RequestParam Long orderId,
            @RequestParam String studentId) {

        byte[] image = qrService.generateReturnQrImage(orderId, studentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(image.length);
        headers.setContentDispositionFormData("inline", "qr-return-" + orderId + ".png");

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    /**
     * Tạo QR Code dạng Base64 cho đơn trả sách.
     * Trả về JSON chứa base64 và dataUri.
     */
    @GetMapping("/return/base64")
    public ResponseEntity<Map<String, String>> getReturnQrBase64(
            @RequestParam Long orderId,
            @RequestParam String studentId) {

        String base64 = qrService.generateReturnQrBase64(orderId, studentId);
        String dataUri = "data:image/png;base64," + base64;

        return ResponseEntity.ok(Map.of(
                "base64", base64,
                "dataUri", dataUri,
                "orderId", orderId.toString(),
                "studentId", studentId,
                "type", "RETURN"
        ));
    }
}
