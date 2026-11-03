package com.library.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

/**
 * Tiện ích tạo và mã hóa QR Code cho hệ thống mượn trả sách.
 * Sử dụng thư viện ZXing (Zebra Crossing) để sinh mã QR từ nội dung đơn mượn/trả.
 * Hỗ trợ xuất ra mảng byte (PNG) hoặc chuỗi Base64 để nhúng trực tiếp vào email/giao diện.
 *
 * @author TV5
 */
public final class QrCodeUtil {

    /** Kích thước mặc định của QR Code (pixel). */
    public static final int DEFAULT_WIDTH = 300;
    public static final int DEFAULT_HEIGHT = 300;

    /** Định dạng ảnh mặc định. */
    public static final String DEFAULT_IMAGE_FORMAT = "PNG";

    // Không cho phép tạo instance
    private QrCodeUtil() {
        throw new UnsupportedOperationException("Lớp tiện ích – không được tạo instance");
    }

    // ──────────────────────────────────────────────
    //  Tạo QR Code → byte[]
    // ──────────────────────────────────────────────

    /**
     * Tạo ảnh QR Code dạng mảng byte (PNG) với kích thước mặc định 300×300.
     */
    public static byte[] generateQrImage(String content) {
        return generateQrImage(content, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * Tạo ảnh QR Code dạng mảng byte (PNG) với kích thước tùy chỉnh.
     */
    public static byte[] generateQrImage(String content, int width, int height) {
        validateContent(content);
        try {
            BitMatrix bitMatrix = createBitMatrix(content, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageConfig config = new MatrixToImageConfig(
                    0xFF000000, // Foreground: đen
                    0xFFFFFFFF  // Background: trắng
            );
            MatrixToImageWriter.writeToStream(bitMatrix, DEFAULT_IMAGE_FORMAT, outputStream, config);
            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            throw new QrGenerationException("Không thể tạo QR Code cho nội dung: " + content, e);
        }
    }

    // ──────────────────────────────────────────────
    //  Tạo QR Code → Base64 String
    // ──────────────────────────────────────────────

    /**
     * Tạo chuỗi Base64 của ảnh QR Code (kích thước mặc định).
     * Kết quả có thể nhúng trực tiếp vào HTML/email.
     */
    public static String generateQrBase64(String content) {
        return generateQrBase64(content, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * Tạo chuỗi Base64 của ảnh QR Code với kích thước tùy chỉnh.
     */
    public static String generateQrBase64(String content, int width, int height) {
        byte[] imageBytes = generateQrImage(content, width, height);
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    /**
     * Tạo Data URI (data:image/png;base64,...) để nhúng trực tiếp vào thẻ img.
     */
    public static String generateQrDataUri(String content) {
        return "data:image/png;base64," + generateQrBase64(content);
    }

    // ──────────────────────────────────────────────
    //  Tạo nội dung QR cho nghiệp vụ mượn/trả sách
    // ──────────────────────────────────────────────

    /**
     * Tạo nội dung QR cho đơn mượn sách.
     * Định dạng: BORROW|{orderId}|{studentId}|{timestamp}
     */
    public static String buildBorrowContent(Long orderId, String studentId, long timestamp) {
        if (orderId == null || studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("orderId và studentId không được để trống");
        }
        return String.format("BORROW|%d|%s|%d", orderId, studentId.trim(), timestamp);
    }

    /**
     * Tạo nội dung QR cho đơn trả sách.
     * Định dạng: RETURN|{orderId}|{studentId}|{timestamp}
     */
    public static String buildReturnContent(Long orderId, String studentId, long timestamp) {
        if (orderId == null || studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("orderId và studentId không được để trống");
        }
        return String.format("RETURN|%d|%s|%d", orderId, studentId.trim(), timestamp);
    }

    /**
     * Tạo ảnh QR Code (byte[]) cho đơn mượn sách.
     */
    public static byte[] generateBorrowQr(Long orderId, String studentId) {
        String content = buildBorrowContent(orderId, studentId, System.currentTimeMillis());
        return generateQrImage(content);
    }

    /**
     * Tạo ảnh QR Code (byte[]) cho đơn trả sách.
     */
    public static byte[] generateReturnQr(Long orderId, String studentId) {
        String content = buildReturnContent(orderId, studentId, System.currentTimeMillis());
        return generateQrImage(content);
    }

    // ──────────────────────────────────────────────
    //  Phương thức nội bộ
    // ──────────────────────────────────────────────

    /**
     * Tạo BitMatrix từ nội dung với các hint tối ưu.
     */
    private static BitMatrix createBitMatrix(String content, int width, int height) throws WriterException {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter writer = new QRCodeWriter();
        return writer.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
    }

    /**
     * Kiểm tra nội dung đầu vào hợp lệ.
     */
    private static void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Nội dung QR Code không được để trống");
        }
    }

    // ──────────────────────────────────────────────
    //  Exception riêng cho QR
    // ──────────────────────────────────────────────

    /**
     * Exception khi không thể tạo QR Code.
     */
    public static class QrGenerationException extends RuntimeException {
        public QrGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
