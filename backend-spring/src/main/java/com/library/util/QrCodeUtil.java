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
import java.util.List;
import java.util.Map;

/*
 * Tiện ích tạo và mã hóa QR Code cho hệ thống mượn trả sách.
 * Sử dụng thư viện ZXing để sinh mã QR từ nội dung đơn mượn và trả sách.
 * Hỗ trợ xuất ra mảng byte ảnh PNG hoặc chuỗi Base64.
 */
public final class QrCodeUtil {

    /* Kích thước mặc định của QR Code tính theo pixel */
    public static final int DEFAULT_WIDTH = 300;
    public static final int DEFAULT_HEIGHT = 300;

    /* Định dạng ảnh mặc định */
    public static final String DEFAULT_IMAGE_FORMAT = "PNG";

    private QrCodeUtil() {
        throw new UnsupportedOperationException("Lớp tiện ích không được tạo instance");
    }

    /*
     * Tạo ảnh QR Code dạng mảng byte ảnh PNG với kích thước mặc định 300x300.
     */
    public static byte[] generateQrImage(String content) {
        return generateQrImage(content, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /*
     * Tạo ảnh QR Code dạng mảng byte ảnh PNG với kích thước tùy chỉnh.
     */
    public static byte[] generateQrImage(String content, int width, int height) {
        validateContent(content);
        try {
            BitMatrix bitMatrix = createBitMatrix(content, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageConfig config = new MatrixToImageConfig(
                    0xFF000000,
                    0xFFFFFFFF
            );
            MatrixToImageWriter.writeToStream(bitMatrix, DEFAULT_IMAGE_FORMAT, outputStream, config);
            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            throw new QrGenerationException("Không thể tạo QR Code cho nội dung: " + content, e);
        }
    }

    /*
     * Tạo chuỗi Base64 của ảnh QR Code với kích thước mặc định.
     */
    public static String generateQrBase64(String content) {
        return generateQrBase64(content, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /*
     * Tạo chuỗi Base64 của ảnh QR Code với kích thước tùy chỉnh.
     */
    public static String generateQrBase64(String content, int width, int height) {
        byte[] imageBytes = generateQrImage(content, width, height);
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    /*
     * Tạo Data URI để nhúng trực tiếp vào thẻ img trong HTML.
     */
    public static String generateQrDataUri(String content) {
        return "data:image/png;base64," + generateQrBase64(content);
    }

    /*
     * Tạo chuỗi nội dung mã QR cho đơn mượn kèm danh sách sách.
     */
    public static String buildBorrowContent(Long orderId, List<String> bookList, long timestamp) {
        if (orderId == null) {
            throw new IllegalArgumentException("orderId không được để trống");
        }
        String booksStr = (bookList != null && !bookList.isEmpty()) ? String.join(";", bookList) : "NONE";
        return String.format("BORROW|orderId:%d|books:%s|time:%d", orderId, booksStr, timestamp);
    }

    /*
     * Tạo chuỗi nội dung mã QR cho đơn mượn kèm mã sinh viên và danh sách sách.
     */
    public static String buildBorrowContent(Long orderId, String studentId, List<String> bookList, long timestamp) {
        if (orderId == null) {
            throw new IllegalArgumentException("orderId không được để trống");
        }
        String sId = (studentId != null && !studentId.isBlank()) ? studentId.trim() : "UNKNOWN";
        String booksStr = (bookList != null && !bookList.isEmpty()) ? String.join(";", bookList) : "NONE";
        return String.format("BORROW|orderId:%d|student:%s|books:%s|time:%d", orderId, sId, booksStr, timestamp);
    }

    /*
     * Tạo chuỗi nội dung mã QR cho đơn mượn chỉ với mã đơn và sinh viên.
     */
    public static String buildBorrowContent(Long orderId, String studentId, long timestamp) {
        if (orderId == null || studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("orderId và studentId không được để trống");
        }
        return String.format("BORROW|%d|%s|%d", orderId, studentId.trim(), timestamp);
    }

    /*
     * Tạo chuỗi nội dung mã QR cho phiếu trả sách kèm mã phiếu trả và danh sách sách.
     */
    public static String buildReturnContent(String returnTicketId, List<String> bookList, long timestamp) {
        if (returnTicketId == null || returnTicketId.isBlank()) {
            throw new IllegalArgumentException("returnTicketId không được để trống");
        }
        String booksStr = (bookList != null && !bookList.isEmpty()) ? String.join(";", bookList) : "NONE";
        return String.format("RETURN|returnTicketId:%s|books:%s|time:%d", returnTicketId.trim(), booksStr, timestamp);
    }

    /*
     * Tạo chuỗi nội dung mã QR cho đơn trả sách theo mã đơn.
     */
    public static String buildReturnContent(Long orderId, String studentId, long timestamp) {
        if (orderId == null || studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("orderId và studentId không được để trống");
        }
        return String.format("RETURN|%d|%s|%d", orderId, studentId.trim(), timestamp);
    }

    /*
     * Tạo BitMatrix từ nội dung văn bản.
     */
    private static BitMatrix createBitMatrix(String content, int width, int height) throws WriterException {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter writer = new QRCodeWriter();
        return writer.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
    }

    /*
     * Kiểm tra nội dung đầu vào không được rỗng.
     */
    private static void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Nội dung QR Code không được để trống");
        }
    }

    /*
     * Ngoại lệ xảy ra khi tạo mã QR thất bại.
     */
    public static class QrGenerationException extends RuntimeException {
        public QrGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
