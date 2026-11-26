package com.library.service;

import com.library.util.EmailTemplateHelper;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/*
 * Kiem thu don vi cho EmailService.
 * Kiem tra quy trinh gui email thong bao san sang lay sach, nhac hen tra,
 * va email xac nhan hoan tat nhan tra sach tai quay.
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailTemplateHelper emailTemplateHelper;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailTemplateHelper = new EmailTemplateHelper();
        emailService = new EmailService(mailSender, emailTemplateHelper);
        // Tra ve MimeMessage hop le khi goi createMimeMessage
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    @DisplayName("Gui mail thong bao don muon san sang lay sach tai quay")
    void testSendOrderReadyNotice() {
        String toEmail = "sinhvien@uth.edu.vn";
        String studentName = "Nguyen Van An";
        String studentId = "2251120145";
        Long orderId = 1001L;
        String pickupDeadline = "2026-03-05 17:00";
        List<EmailTemplateHelper.BookItem> books = Arrays.asList(
                new EmailTemplateHelper.BookItem("Ky thuat lap trinh Java nang cao", "UTH-CNTT-01", 1)
        );
        String qrDataUri = "data:image/png;base64,mockQrCodeData";

        emailService.sendOrderReadyNotice(toEmail, studentName, studentId, orderId, pickupDeadline, books, qrDataUri);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Gui email xac nhan hoan tat thu tuc tra sach tai quay kem phu thu")
    void testSendReturnConfirmation() {
        String toEmail = "sinhvien@uth.edu.vn";
        String studentName = "Tran Thi Mai";
        String studentId = "2251120032";
        Long orderId = 2002L;
        String returnDate = "2026-03-04 10:30";
        List<EmailTemplateHelper.BookItem> books = Arrays.asList(
                new EmailTemplateHelper.BookItem("Co so du lieu va MySQL", "UTH-CNTT-02", 1)
        );
        long fineAmount = 20000L;
        String fineReason = "Tre han 1 ngay (5.000d) + Gay sach son nhe (15.000d)";

        emailService.sendReturnConfirmation(
                toEmail,
                studentName,
                studentId,
                orderId,
                returnDate,
                books,
                fineAmount,
                fineReason
        );

        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());
        assertNotNull(messageCaptor.getValue());
    }

    @Test
    @DisplayName("Gui mail nhac nho han tra sach va canh bao qua han")
    void testSendDueAndOverdueReminder() {
        String toEmail = "student@uth.edu.vn";
        String studentName = "Le Van Hung";
        String studentId = "2251120099";
        Long orderId = 3003L;
        String dueDate = "2026-03-10";
        List<EmailTemplateHelper.BookItem> books = Arrays.asList(
                new EmailTemplateHelper.BookItem("Mang may tinh", "UTH-MMT-01", 1)
        );

        // Nhac sap den han
        emailService.sendDueReminder(toEmail, studentName, studentId, orderId, dueDate, 2, books);

        // Canh bao qua han kem uoc tinh tien phat
        emailService.sendOverdueReminder(toEmail, studentName, studentId, orderId, dueDate, 3, 15000L, books);

        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }
}
