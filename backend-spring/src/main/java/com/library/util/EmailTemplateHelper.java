package com.library.util;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

/*
 * Lớp tiện ích hỗ trợ đọc và tạo nội dung email HTML từ mẫu có sẵn.
 */
@Component
public class EmailTemplateHelper {

    private static final String TEMPLATE_PATH_PRIMARY = "templates/email-notice.html";
    private static final String TEMPLATE_PATH_FALLBACK = "email-notice.html";

    /*
     * Đối tượng đại diện cho một đầu sách trong đơn mượn trả.
     */
    public static class BookItem {
        private final String title;
        private final String code;
        private final int quantity;

        public BookItem(String title, String code, int quantity) {
            this.title = title;
            this.code = code;
            this.quantity = quantity;
        }

        public BookItem(String title) {
            this(title, "N/A", 1);
        }

        public String getTitle() {
            return title;
        }

        public String getCode() {
            return code;
        }

        public int getQuantity() {
            return quantity;
        }
    }

    /*
     * Đọc nội dung file mẫu HTML từ thư mục tài nguyên.
     */
    public String loadTemplate() {
        try {
            return readClasspathFile(TEMPLATE_PATH_PRIMARY);
        } catch (Exception e) {
            try {
                return readClasspathFile(TEMPLATE_PATH_FALLBACK);
            } catch (Exception fallbackException) {
                throw new IllegalStateException("Không tìm thấy file mẫu email-notice.html", fallbackException);
            }
        }
    }

    /*
     * Tạo nội dung email HTML thông báo đơn mượn sách đã chuẩn bị sẵn sàng lấy tại quầy.
     */
    public String buildOrderReadyNoticeHtml(
            String studentName,
            String studentId,
            Long orderId,
            String pickupDeadline,
            List<BookItem> books,
            String qrDataUri) {

        String template = loadTemplate();
        String bookRows = buildBookRows(books);
        String qrSection = buildQrSection(qrDataUri);
        String noteInfo = "<div class=\"note-box\"><strong>Lưu ý:</strong> Vui lòng đến nhận sách tại Quầy tiếp nhận Thư viện UTH trước hạn chót. Khi đến nhận sách chỉ cần đưa mã QR trên màn hình điện thoại để thủ thư quét bàn giao trong vòng 30 giây.</div>";

        return template
                .replace("{{EMAIL_TITLE}}", "Đơn mượn sách #" + orderId + " đã sẵn sàng - Thư viện UTH")
                .replace("{{BADGE_TEXT}}", "ĐƠN MƯỢN ĐÃ SẴN SÀNG")
                .replace("{{BADGE_BG_COLOR}}", "#10b981")
                .replace("{{BADGE_TEXT_COLOR}}", "#ffffff")
                .replace("{{STUDENT_NAME}}", escapeHtml(studentName))
                .replace("{{STUDENT_ID}}", escapeHtml(studentId))
                .replace("{{ORDER_ID}}", String.valueOf(orderId))
                .replace("{{MESSAGE}}", "Thủ thư đã chuẩn bị sẵn các tài liệu theo đơn mượn của bạn tại quầy tiếp nhận. Vui lòng xuất trình mã QR bên dưới khi đến nhận sách.")
                .replace("{{DATE_LABEL}}", "Hạn chót nhận sách")
                .replace("{{DATE_VALUE}}", escapeHtml(pickupDeadline))
                .replace("{{BOOK_ITEMS}}", bookRows)
                .replace("{{QR_SECTION}}", qrSection)
                .replace("{{EXTRA_INFO}}", noteInfo);
    }

    /*
     * Tạo nội dung email HTML thông báo đơn mượn sách (tương thích ngược).
     */
    public String buildBorrowNoticeHtml(
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            List<BookItem> books,
            String qrDataUri) {
        return buildOrderReadyNoticeHtml(studentName, studentId, orderId, dueDate, books, qrDataUri);
    }

    /*
     * Tạo nội dung email HTML nhắc nhở hạn trả sách sắp đến hạn.
     */
    public String buildDueReminderHtml(
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            int daysRemaining,
            List<BookItem> books) {

        String template = loadTemplate();
        String bookRows = buildBookRows(books);
        String reminderMessage = daysRemaining > 0
                ? "Đơn mượn sách của bạn sẽ đến hạn trả trong vòng " + daysRemaining + " ngày tới. Vui lòng sắp xếp trả sách đúng hạn hoặc thực hiện gia hạn trực tuyến."
                : "Hôm nay là ngày đến hạn trả sách của bạn. Vui lòng mang sách đến quầy tiếp nhận Thư viện UTH để hoàn tất thủ tục trả.";

        String noteInfo = "<div class=\"note-box\"><strong>Quy định trả sách:</strong> Vui lòng hoàn trả sách trước hoặc đúng ngày hẹn để tránh phát sinh phí phạt trễ hạn theo quy chế Thư viện UTH. Bạn cũng có thể gia hạn trực tuyến nếu sách chưa có người đặt trước.</div>";

        return template
                .replace("{{EMAIL_TITLE}}", "Nhắc nhở hạn trả sách đơn #" + orderId + " - Thư viện UTH")
                .replace("{{BADGE_TEXT}}", "NHẮC NHỞ HẠN TRẢ SÁCH")
                .replace("{{BADGE_BG_COLOR}}", "#f59e0b")
                .replace("{{BADGE_TEXT_COLOR}}", "#ffffff")
                .replace("{{STUDENT_NAME}}", escapeHtml(studentName))
                .replace("{{STUDENT_ID}}", escapeHtml(studentId))
                .replace("{{ORDER_ID}}", String.valueOf(orderId))
                .replace("{{MESSAGE}}", reminderMessage)
                .replace("{{DATE_LABEL}}", "Hạn chót trả sách")
                .replace("{{DATE_VALUE}}", escapeHtml(dueDate))
                .replace("{{BOOK_ITEMS}}", bookRows)
                .replace("{{QR_SECTION}}", "")
                .replace("{{EXTRA_INFO}}", noteInfo);
    }

    /*
     * Tạo nội dung email HTML cảnh báo sách đã quá hạn trả.
     */
    public String buildOverdueReminderHtml(
            String studentName,
            String studentId,
            Long orderId,
            String dueDate,
            int overdueDays,
            long estimatedFine,
            List<BookItem> books) {

        String template = loadTemplate();
        String bookRows = buildBookRows(books);
        String formattedFine = String.format("%,d VNĐ", estimatedFine);

        String extraInfo = "<div class=\"note-box\" style=\"background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;\">" +
                "<strong>Cảnh báo quá hạn:</strong> Đơn sách đã quá hạn " + overdueDays + " ngày.<br/>" +
                "<strong>Phí trễ hạn tạm tính:</strong> " + formattedFine + "<br/>" +
                "Vui lòng mang tài liệu đến quầy tiếp nhận để hoàn trả ngay hôm nay." +
                "</div>";

        return template
                .replace("{{EMAIL_TITLE}}", "CẢNH BÁO QUÁ HẠN: Đơn mượn sách #" + orderId + " - Thư viện UTH")
                .replace("{{BADGE_TEXT}}", "ĐƠN MƯỢN ĐÃ QUÁ HẠN")
                .replace("{{BADGE_BG_COLOR}}", "#dc2626")
                .replace("{{BADGE_TEXT_COLOR}}", "#ffffff")
                .replace("{{STUDENT_NAME}}", escapeHtml(studentName))
                .replace("{{STUDENT_ID}}", escapeHtml(studentId))
                .replace("{{ORDER_ID}}", String.valueOf(orderId))
                .replace("{{MESSAGE}}", "Đơn mượn sách của bạn đã quá thời hạn trả quy định. Vui lòng nhanh chóng hoàn trả sách cho thư viện.")
                .replace("{{DATE_LABEL}}", "Ngày hết hạn")
                .replace("{{DATE_VALUE}}", escapeHtml(dueDate))
                .replace("{{BOOK_ITEMS}}", bookRows)
                .replace("{{QR_SECTION}}", "")
                .replace("{{EXTRA_INFO}}", extraInfo);
    }

    /*
     * Tạo nội dung email HTML xác nhận sinh viên đã trả sách thành công.
     */
    public String buildReturnNoticeHtml(
            String studentName,
            String studentId,
            Long orderId,
            String returnDate,
            List<BookItem> books,
            long fineAmount,
            String fineReason) {

        String template = loadTemplate();
        String bookRows = buildBookRows(books);

        String extraInfo;
        if (fineAmount > 0) {
            String formattedFine = String.format("%,d VNĐ", fineAmount);
            extraInfo = "<div class=\"note-box\" style=\"background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;\">" +
                    "<strong>Khoản phạt phát sinh:</strong> " + formattedFine + "<br/>" +
                    "<strong>Lý do:</strong> " + escapeHtml(fineReason != null ? fineReason : "Quá hạn hoặc hư hỏng tài liệu") + "<br/>" +
                    "Khoản phạt đã được ghi nhận vào lịch sử tài khoản của bạn." +
                    "</div>";
        } else {
            extraInfo = "<div class=\"note-box\" style=\"background-color: #f0fdf4; border-left-color: #22c55e; color: #166534;\">" +
                    "<strong>Tình trạng:</strong> Trả sách đúng hạn và tài liệu nguyên vẹn. Cảm ơn bạn đã sử dụng dịch vụ Thư viện UTH!" +
                    "</div>";
        }

        return template
                .replace("{{EMAIL_TITLE}}", "Xác nhận trả sách thành công #" + orderId + " - Thư viện UTH")
                .replace("{{BADGE_TEXT}}", "ĐÃ TRẢ SÁCH THÀNH CÔNG")
                .replace("{{BADGE_BG_COLOR}}", "#2563eb")
                .replace("{{BADGE_TEXT_COLOR}}", "#ffffff")
                .replace("{{STUDENT_NAME}}", escapeHtml(studentName))
                .replace("{{STUDENT_ID}}", escapeHtml(studentId))
                .replace("{{ORDER_ID}}", String.valueOf(orderId))
                .replace("{{MESSAGE}}", "Thư viện UTH xác nhận bạn đã hoàn tất thủ tục trả sách cho đơn mượn #" + orderId + ". Dưới đây là thông tin chi tiết các tài liệu đã nhận lại.")
                .replace("{{DATE_LABEL}}", "Thời điểm trả sách")
                .replace("{{DATE_VALUE}}", escapeHtml(returnDate))
                .replace("{{BOOK_ITEMS}}", bookRows)
                .replace("{{QR_SECTION}}", "")
                .replace("{{EXTRA_INFO}}", extraInfo);
    }

    /*
     * Sinh các hàng HTML tương ứng với từng cuốn sách trong bảng.
     */
    public String buildBookRows(List<BookItem> books) {
        if (books == null || books.isEmpty()) {
            return "<tr><td colspan=\"3\" style=\"text-align: center; color: #9ca3af; padding: 16px;\">Không có thông tin sách</td></tr>";
        }

        StringBuilder rows = new StringBuilder();
        for (BookItem book : books) {
            rows.append("<tr>")
                .append("<td style=\"font-weight: 500; color: #111827;\">").append(escapeHtml(book.getTitle())).append("</td>")
                .append("<td style=\"color: #6b7280; font-family: monospace;\">").append(escapeHtml(book.getCode())).append("</td>")
                .append("<td style=\"text-align: center; font-weight: 600;\">").append(book.getQuantity()).append("</td>")
                .append("</tr>");
        }
        return rows.toString();
    }

    /*
     * Sinh khối HTML hiển thị mã QR nếu có dữ liệu ảnh.
     */
    private String buildQrSection(String qrDataUri) {
        if (qrDataUri == null || qrDataUri.isBlank()) {
            return "";
        }
        return "<div class=\"qr-box\">" +
                "<img src=\"" + qrDataUri + "\" alt=\"Mã QR đơn mượn\" />" +
                "<p>Xuất trình mã QR này tại quầy tiếp nhận để lấy sách nhanh chóng (dưới 30 giây)</p>" +
                "</div>";
    }

    /*
     * Đọc tập tin trong classpath thành chuỗi văn bản.
     */
    private String readClasspathFile(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    /*
     * Xử lý ký tự đặc biệt để an toàn khi chèn vào văn bản HTML.
     */
    private String escapeHtml(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
