package com.library.service;

import com.library.util.QrCodeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/*
 * Dịch vụ xử lý nghiệp vụ mã hóa mã QR cho mượn và phiếu hẹn trả sách.
 * Hỗ trợ sinh chuỗi QR Base64 cho đơn mượn và phiếu hẹn trả.
 */
@Service
public class QrService {

    private static final Logger log = LoggerFactory.getLogger(QrService.class);

    /*
     * Mã hóa orderId và danh sách sách thành chuỗi QR Base64 cho đơn mượn.
     */
    public String generateBorrowQrBase64(Long orderId, List<String> books) {
        log.info("Mã hóa QR đơn mượn: orderId={}, số lượng sách={}", orderId, books != null ? books.size() : 0);
        String content = QrCodeUtil.buildBorrowContent(orderId, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Mã hóa orderId, mã sinh viên và danh sách sách thành chuỗi QR Base64 cho đơn mượn.
     */
    public String generateBorrowQrBase64(Long orderId, String studentId, List<String> books) {
        log.info("Mã hóa QR đơn mượn: orderId={}, studentId={}, số lượng sách={}", orderId, studentId, books != null ? books.size() : 0);
        String content = QrCodeUtil.buildBorrowContent(orderId, studentId, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Mã hóa orderId và mã sinh viên thành chuỗi QR Base64 cho đơn mượn.
     */
    public String generateBorrowQrBase64(Long orderId, String studentId) {
        log.info("Mã hóa QR đơn mượn: orderId={}, studentId={}", orderId, studentId);
        String content = QrCodeUtil.buildBorrowContent(orderId, studentId, System.currentTimeMillis());
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Mã hóa returnTicketId, ngày hẹn trả và danh sách sách thành chuỗi QR Base64 cho phiếu hẹn trả.
     */
    public String generateReturnTicketQrBase64(String returnTicketId, String appointmentDate, List<String> books) {
        log.info("Mã hóa QR phiếu hẹn trả: ticketId={}, ngày hẹn={}, số sách={}", returnTicketId, appointmentDate, books != null ? books.size() : 0);
        String content = QrCodeUtil.buildReturnTicketContent(returnTicketId, appointmentDate, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Mã hóa returnTicketId và danh sách sách thành chuỗi QR Base64 cho phiếu trả sách.
     */
    public String generateReturnQrBase64(String returnTicketId, List<String> books) {
        log.info("Mã hóa QR phiếu trả: returnTicketId={}, số lượng sách={}", returnTicketId, books != null ? books.size() : 0);
        String content = QrCodeUtil.buildReturnContent(returnTicketId, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Mã hóa đơn trả theo mã đơn và mã sinh viên thành chuỗi QR Base64.
     */
    public String generateReturnQrBase64(Long orderId, String studentId) {
        log.info("Mã hóa QR đơn trả: orderId={}, studentId={}", orderId, studentId);
        String content = QrCodeUtil.buildReturnContent(orderId, studentId, System.currentTimeMillis());
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Tạo ảnh mã QR dạng byte cho đơn mượn kèm danh sách sách.
     */
    public byte[] generateBorrowQrImage(Long orderId, List<String> books) {
        String content = QrCodeUtil.buildBorrowContent(orderId, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrImage(content);
    }

    /*
     * Tạo ảnh mã QR dạng byte cho đơn mượn.
     */
    public byte[] generateBorrowQrImage(Long orderId, String studentId) {
        String content = QrCodeUtil.buildBorrowContent(orderId, studentId, System.currentTimeMillis());
        return QrCodeUtil.generateQrImage(content);
    }

    /*
     * Tạo ảnh mã QR dạng byte cho phiếu hẹn trả sách.
     */
    public byte[] generateReturnTicketQrImage(String returnTicketId, String appointmentDate, List<String> books) {
        String content = QrCodeUtil.buildReturnTicketContent(returnTicketId, appointmentDate, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrImage(content);
    }

    /*
     * Tạo ảnh mã QR dạng byte cho phiếu trả sách.
     */
    public byte[] generateReturnQrImage(String returnTicketId, List<String> books) {
        String content = QrCodeUtil.buildReturnContent(returnTicketId, books, System.currentTimeMillis());
        return QrCodeUtil.generateQrImage(content);
    }

    /*
     * Tạo ảnh mã QR dạng byte cho đơn trả sách.
     */
    public byte[] generateReturnQrImage(Long orderId, String studentId) {
        String content = QrCodeUtil.buildReturnContent(orderId, studentId, System.currentTimeMillis());
        return QrCodeUtil.generateQrImage(content);
    }

    /*
     * Tạo chuỗi Data URI của mã QR đơn mượn để nhúng vào thẻ img.
     */
    public String generateBorrowQrDataUri(Long orderId, String studentId) {
        return "data:image/png;base64," + generateBorrowQrBase64(orderId, studentId);
    }

    /*
     * Tạo chuỗi Data URI của mã QR phiếu hẹn trả để nhúng vào thẻ img.
     */
    public String generateReturnTicketQrDataUri(String returnTicketId, String appointmentDate, List<String> books) {
        return "data:image/png;base64," + generateReturnTicketQrBase64(returnTicketId, appointmentDate, books);
    }

    /*
     * Mã hóa nội dung văn bản bất kỳ thành chuỗi QR Base64.
     */
    public String generateQrBase64FromContent(String content) {
        return QrCodeUtil.generateQrBase64(content);
    }

    /*
     * Tạo ảnh mã QR dạng byte từ nội dung bất kỳ.
     */
    public byte[] generateQrFromContent(String content) {
        return QrCodeUtil.generateQrImage(content);
    }
}
