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

import java.util.List;

/*
 * Dịch vụ gửi email thông báo và xác nhận cho hệ thống thư viện.
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
     * Gửi email HTML bất đồng bộ đến người nhận.
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
     * Gửi thông báo mượn sách kèm mã QR cho sinh viên.
     */
    public void sendBorrowNotice(
            String toEmail,
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            List<EmailTemplateHelper.BookItem> books,
            String qrDataUri) {

        String subject = "Thông báo đơn mượn sách #" + orderId + " - Thư viện UTH";
        String html = emailTemplateHelper.buildBorrowNoticeHtml(
                studentName, studentId, orderId, dueDate, books, qrDataUri);

        sendHtmlEmail(toEmail, subject, html);
    }

    /*
     * Gửi email xác nhận sinh viên đã hoàn tất thủ tục trả sách.
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
}
