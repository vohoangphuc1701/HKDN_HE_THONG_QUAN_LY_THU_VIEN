package com.library.service;

import com.library.util.QrCodeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Base64;

/**
 * Service xử lý nghiệp vụ QR Code cho hệ thống mượn trả sách.
 * Cung cấp các chức năng:
 * - Tạo mã QR cho đơn mượn sách (borrow)
 * - Tạo mã QR cho đơn trả sách (return)
 * - Trả về ảnh QR dạng byte[], Base64, hoặc Data URI
 * Sử dụng QrCodeUtil (thư viện ZXing) để sinh mã QR.
 *
 * @author TV5
 */
@Service
public class QrService {

    private static final Logger log = LoggerFactory.getLogger(QrService.class);

    // ──────────────────────────────────────────────
    //  Tạo QR cho đơn MƯỢN sách
    // ──────────────────────────────────────────────

    /**
     * Tạo ảnh QR Code (byte[] PNG) cho đơn mượn sách.
     */
    public byte[] generateBorrowQrImage(Long orderId, String studentId) {
        log.info("Tạo QR Code mượn sách – Đơn: {}, SV: {}", orderId, studentId);
        String content = QrCodeUtil.buildBorrowContent(orderId, studentId, System.currentTimeMillis());
        byte[] image = QrCodeUtil.generateQrImage(content);
        log.debug("QR Code mượn sách đã tạo thành công – {} bytes", image.length);
        return image;
    }

    /**
     * Tạo chuỗi Base64 của QR Code cho đơn mượn sách.
     * Dùng để nhúng vào email thông báo hoặc hiển thị trên giao diện.
     */
    public String generateBorrowQrBase64(Long orderId, String studentId) {
        log.info("Tạo QR Code Base64 mượn sách – Đơn: {}, SV: {}", orderId, studentId);
        byte[] image = generateBorrowQrImage(orderId, studentId);
        return Base64.getEncoder().encodeToString(image);
    }

    /**
     * Tạo Data URI (data:image/png;base64,...) cho QR đơn mượn.
     */
    public String generateBorrowQrDataUri(Long orderId, String studentId) {
        return "data:image/png;base64," + generateBorrowQrBase64(orderId, studentId);
    }

    // ──────────────────────────────────────────────
    //  Tạo QR cho đơn TRẢ sách
    // ──────────────────────────────────────────────

    /**
     * Tạo ảnh QR Code (byte[] PNG) cho đơn trả sách.
     */
    public byte[] generateReturnQrImage(Long orderId, String studentId) {
        log.info("Tạo QR Code trả sách – Đơn: {}, SV: {}", orderId, studentId);
        String content = QrCodeUtil.buildReturnContent(orderId, studentId, System.currentTimeMillis());
        byte[] image = QrCodeUtil.generateQrImage(content);
        log.debug("QR Code trả sách đã tạo thành công – {} bytes", image.length);
        return image;
    }

    /**
     * Tạo chuỗi Base64 của QR Code cho đơn trả sách.
     */
    public String generateReturnQrBase64(Long orderId, String studentId) {
        log.info("Tạo QR Code Base64 trả sách – Đơn: {}, SV: {}", orderId, studentId);
        byte[] image = generateReturnQrImage(orderId, studentId);
        return Base64.getEncoder().encodeToString(image);
    }

    /**
     * Tạo Data URI (data:image/png;base64,...) cho QR đơn trả.
     */
    public String generateReturnQrDataUri(Long orderId, String studentId) {
        return "data:image/png;base64," + generateReturnQrBase64(orderId, studentId);
    }

    // ──────────────────────────────────────────────
    //  Tạo QR từ nội dung tùy ý
    // ──────────────────────────────────────────────

    /**
     * Tạo ảnh QR Code từ nội dung bất kỳ (dùng cho mục đích mở rộng).
     */
    public byte[] generateQrFromContent(String content) {
        log.info("Tạo QR Code tùy chỉnh – Nội dung: {}", content);
        return QrCodeUtil.generateQrImage(content);
    }

    /**
     * Tạo Base64 của QR từ nội dung bất kỳ.
     */
    public String generateQrBase64FromContent(String content) {
        byte[] image = generateQrFromContent(content);
        return Base64.getEncoder().encodeToString(image);
    }
}
