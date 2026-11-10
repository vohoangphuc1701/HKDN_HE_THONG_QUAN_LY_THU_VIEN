package com.library.service;

import com.library.util.EmailTemplateHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/*
 * Dịch vụ gửi email thông báo và nhắc nhở mượn trả sách cho hệ thống thư viện.
 * Cung cấp chức năng gửi mail thông báo đơn sẵn sàng lấy tại quầy và mail nhắc trả sách.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final EmailTemplateHelper emailTemplateHelper;

    @Value("${spring.mail.username:thuvien@ut.edu.vn}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender, EmailTemplateHelper emailTemplateHelper) {
        this.mailSender = mailSender;
        this.emailTemplateHelper = emailTemplateHelper;
    }

    /*
     * Gửi email HTML bất đồng bộ đến địa chỉ người nhận.
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email thành công tới: {}", to);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email tới {}: {}", to, e.getMessage());
        }
    }

    /*
     * Gửi mail thông báo đơn mượn sách đã được thủ thư soạn sẵn sàng để sinh viên đến nhận.
     */
    public void sendOrderReadyNotice(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String pickupDeadline,
            List<EmailTemplateHelper.BookItem> books,
            String qrDataUri) {

        String subject = "Đơn mượn sách #" + orderId + " đã sẵn sàng nhận tại quầy - Thư viện UTH";
        String html = emailTemplateHelper.buildOrderReadyNoticeHtml(
                studentName, studentId, orderId, pickupDeadline, books, qrDataUri);

        sendHtmlEmail(toEmail, subject, html);
    }

    /*
     * Gửi mail thông báo đơn sẵn sàng nhận sách với danh sách tên sách đơn giản.
     */
    public void sendOrderReadyNoticeSimple(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String pickupDeadline,
            List<String> bookTitles,
            String qrDataUri) {

        List<EmailTemplateHelper.BookItem> books = convertToBookItems(bookTitles);
        sendOrderReadyNotice(toEmail, studentName, studentId, orderId, pickupDeadline, books, qrDataUri);
    }

    /*
     * Gửi mail nhắc nhở khi đơn mượn sách sắp đến hạn trả.
     */
    public void sendDueReminder(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            int daysRemaining,
            List<EmailTemplateHelper.BookItem> books) {

        String subject = "Nhắc nhở: Sắp đến hạn trả sách đơn #" + orderId + " - Thư viện UTH";
        String html = emailTemplateHelper.buildDueReminderHtml(
                studentName, studentId, orderId, dueDate, daysRemaining, books);

        sendHtmlEmail(toEmail, subject, html);
    }

    /*
     * Gửi mail nhắc nhở hạn trả với danh sách tên sách đơn giản.
     */
    public void sendDueReminderSimple(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            int daysRemaining,
            List<String> bookTitles) {

        List<EmailTemplateHelper.BookItem> books = convertToBookItems(bookTitles);
        sendDueReminder(toEmail, studentName, studentId, orderId, dueDate, daysRemaining, books);
    }

    /*
     * Gửi mail cảnh báo sách đã quá hạn trả và thông báo tiền phạt phát sinh.
     */
    public void sendOverdueReminder(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            int overdueDays,
            long estimatedFine,
            List<EmailTemplateHelper.BookItem> books) {

        String subject = "CẢNH BÁO QUÁ HẠN: Vui lòng hoàn trả sách đơn #" + orderId + " - Thư viện UTH";
        String html = emailTemplateHelper.buildOverdueReminderHtml(
                studentName, studentId, orderId, dueDate, overdueDays, estimatedFine, books);

        sendHtmlEmail(toEmail, subject, html);
    }

    /*
     * Gửi thông báo mượn sách (tương thích phương thức cũ).
     */
    public void sendBorrowNotice(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            List<EmailTemplateHelper.BookItem> books,
            String qrDataUri) {

        sendOrderReadyNotice(toEmail, studentName, studentId, orderId, dueDate, books, qrDataUri);
    }

    /*
     * Gửi email xác nhận sinh viên đã hoàn tất thủ tục trả sách tại quầy.
     */
    public void sendReturnConfirmation(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String returnDate,
            List<EmailTemplateHelper.BookItem> books,
            long fineAmount,
            String fineReason) {

        String subject = "Xác nhận trả sách thành công #" + orderId + " - Thư viện UTH";
        String html = emailTemplateHelper.buildReturnNoticeHtml(
                studentName, studentId, orderId, returnDate, books, fineAmount, fineReason);

        sendHtmlEmail(toEmail, subject, html);
    }

    /*
     * Chuyển đổi danh sách tiêu đề sách thành danh sách đối tượng BookItem.
     */
    private List<EmailTemplateHelper.BookItem> convertToBookItems(List<String> bookTitles) {
        if (bookTitles == null || bookTitles.isEmpty()) {
            return Collections.emptyList();
        }
        return bookTitles.stream()
                .map(EmailTemplateHelper.BookItem::new)
                .toList();
    }
}
