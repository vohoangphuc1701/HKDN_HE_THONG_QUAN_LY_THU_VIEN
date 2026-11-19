package com.library.service;

import com.library.entity.Book;
import com.library.entity.BorrowDetail;
import com.library.entity.BorrowOrder;
import com.library.entity.User;
import com.library.enums.BorrowDetailStatus;
import com.library.enums.BorrowOrderStatus;
import com.library.repository.BookRepository;
import com.library.repository.BorrowDetailRepository;
import com.library.repository.BorrowOrderRepository;
import com.library.util.EmailTemplateHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/*
  Lop ReminderScheduler
  Thuc hien cron job tu dong quet cac don muon sach den han hoac qua han de gui email thong bao.
  Dong thoi tu dong huy cac don cho nhan sach qua 48h de hoan tra sach vao kho.
*/
@Component
@EnableScheduling
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    /* Don gia tien phat tre han moi cuon sach theo ngay (5.000 dong moi ngay) */
    private static final long FINE_PER_DAY = 5000L;

    private final EmailService emailService;
    private final BorrowOrderRepository borrowOrderRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BookRepository bookRepository;

    @Value("${library.schedule.days-before:1}")
    private int daysBeforeDue;

    @Value("${library.schedule.pickup-expiry-hours:48}")
    private int pickupExpiryHours;

    public ReminderScheduler(
            EmailService emailService,
            BorrowOrderRepository borrowOrderRepository,
            BorrowDetailRepository borrowDetailRepository,
            BookRepository bookRepository) {
        this.emailService = emailService;
        this.borrowOrderRepository = borrowOrderRepository;
        this.borrowDetailRepository = borrowDetailRepository;
        this.bookRepository = bookRepository;
    }

    /*
      Cron job quet va gui email nhac nho han tra sach vao luc 08:00 sang moi ngay.
      Mac dinh quet cac cuon sach con 1 ngay nua den han tra va cac cuon den han dung ngay hom nay.
    */
    @Scheduled(cron = "${library.schedule.reminder-cron:0 0 8 * * ?}")
    public void scheduleDailyDueReminders() {
        log.info("Khoi dong cron job quet han tra sach luc 08:00 sang...");
        LocalDate today = LocalDate.now();

        // Quet sach den han trong ngay mai va ngay hom nay
        int sentCount = 0;
        sentCount += processDueRemindersForDate(today.plusDays(daysBeforeDue), daysBeforeDue);
        sentCount += processDueRemindersForDate(today, 0);

        log.info("Hoan tat tien trinh nhac nho han tra sach luc 08:00 sang. Tong so email da gui: {}", sentCount);
    }

    /*
      Cron job quet cac don muon sach da qua han vao luc 08:30 sang moi ngay.
      Cap nhat trang thai sang OVERDUE, tinh tien phat uoc tinh va gui email canh bao cho sinh vien.
    */
    @Scheduled(cron = "${library.schedule.overdue-cron:0 30 8 * * ?}")
    @Transactional
    public void scheduleDailyOverdueAlerts() {
        log.info("Khoi dong cron job quet sach qua han va tinh phat...");
        LocalDate today = LocalDate.now();

        int overdueCount = processOverdueBooks(today);
        int cancelledOrdersCount = cancelExpiredReadyOrders(today);

        log.info("Hoan tat quet qua han: {} cuon sach qua han da xu ly, {} don qua 48h da tu dong huy.",
                overdueCount, cancelledOrdersCount);
    }

    /*
      Xu ly quet va gui email nhac nho cho cac cuon sach co han tra tai mot ngay cu the.
      Gom nhom cac cuon sach theo don muon de gui mot email tong hop cho sinh vien.
    */
    public int processDueRemindersForDate(LocalDate targetDate, int daysRemaining) {
        try {
            List<BorrowDetail> details = borrowDetailRepository.findByStatusAndDueDate(
                    BorrowDetailStatus.BORROWING, targetDate);

            if (details == null || details.isEmpty()) {
                log.info("Khong co cuon sach nao den han tra vao ngay {}", targetDate);
                return 0;
            }

            // Gom nhom sach theo don muon
            Map<BorrowOrder, List<BorrowDetail>> orderMap = details.stream()
                    .filter(d -> d.getBorrowOrder() != null && d.getBorrowOrder().getUser() != null)
                    .collect(Collectors.groupingBy(BorrowDetail::getBorrowOrder));

            int successCount = 0;
            for (Map.Entry<BorrowOrder, List<BorrowDetail>> entry : orderMap.entrySet()) {
                BorrowOrder order = entry.getKey();
                List<BorrowDetail> orderDetails = entry.getValue();
                User student = order.getUser();

                if (student.getEmail() == null || student.getEmail().isBlank()) {
                    log.warn("Bo qua don muon #{} vi sinh vien khong co dia chi email", order.getId());
                    continue;
                }

                try {
                    List<EmailTemplateHelper.BookItem> bookItems = orderDetails.stream()
                            .map(d -> {
                                Book book = d.getBook();
                                String title = book != null ? book.getTitle() : "Tài liệu thư viện";
                                String code = book != null && book.getDocumentCode() != null ? book.getDocumentCode() : "N/A";
                                return new EmailTemplateHelper.BookItem(title, code, 1);
                            })
                            .toList();

                    emailService.sendDueReminder(
                            student.getEmail(),
                            student.getFullName(),
                            student.getUsername(),
                            order.getId(),
                            targetDate.toString(),
                            daysRemaining,
                            bookItems
                    );

                    successCount++;
                    log.info("Da phat email nhac tra sach cho sinh vien {} (Don #{})",
                            student.getEmail(), order.getId());
                } catch (Exception ex) {
                    log.error("Loi khi gui email nhac tra don #{}: {}", order.getId(), ex.getMessage());
                }
            }

            return successCount;
        } catch (Exception ex) {
            log.error("Loi trong qua trinh quet nhac nho han tra ngay {}: {}", targetDate, ex.getMessage());
            return 0;
        }
    }

    /*
      Quet cac cuon sach dang muon co han tra truoc ngay hom nay (qua han).
      Chuyen trang thai sang OVERDUE va gui email canh bao kem so tien phat tam tinh.
    */
    public int processOverdueBooks(LocalDate today) {
        try {
            List<BorrowDetail> overdueList = borrowDetailRepository.findByStatusAndDueDateBefore(
                    BorrowDetailStatus.BORROWING, today);

            if (overdueList == null || overdueList.isEmpty()) {
                log.info("Khong co cuon sach nao bi qua han truoc ngay {}", today);
                return 0;
            }

            // Cap nhat trang thai sang OVERDUE
            for (BorrowDetail detail : overdueList) {
                detail.setStatus(BorrowDetailStatus.OVERDUE);
            }
            borrowDetailRepository.saveAll(overdueList);

            // Gom nhom de gui email canh bao tong hop
            Map<BorrowOrder, List<BorrowDetail>> orderMap = overdueList.stream()
                    .filter(d -> d.getBorrowOrder() != null && d.getBorrowOrder().getUser() != null)
                    .collect(Collectors.groupingBy(BorrowDetail::getBorrowOrder));

            int alertedCount = 0;
            for (Map.Entry<BorrowOrder, List<BorrowDetail>> entry : orderMap.entrySet()) {
                BorrowOrder order = entry.getKey();
                List<BorrowDetail> details = entry.getValue();
                User student = order.getUser();

                if (student.getEmail() == null || student.getEmail().isBlank()) {
                    continue;
                }

                try {
                    // Tinh so ngay qua han lon nhat trong danh sach sach
                    int maxOverdueDays = 1;
                    LocalDate oldestDueDate = today;
                    for (BorrowDetail d : details) {
                        if (d.getDueDate() != null) {
                            int days = (int) ChronoUnit.DAYS.between(d.getDueDate(), today);
                            if (days > maxOverdueDays) {
                                maxOverdueDays = days;
                            }
                            if (d.getDueDate().isBefore(oldestDueDate)) {
                                oldestDueDate = d.getDueDate();
                            }
                        }
                    }

                    long estimatedFine = (long) maxOverdueDays * FINE_PER_DAY * details.size();

                    List<EmailTemplateHelper.BookItem> bookItems = details.stream()
                            .map(d -> {
                                Book book = d.getBook();
                                String title = book != null ? book.getTitle() : "Tài liệu thư viện";
                                String code = book != null && book.getDocumentCode() != null ? book.getDocumentCode() : "N/A";
                                return new EmailTemplateHelper.BookItem(title, code, 1);
                            })
                            .toList();

                    emailService.sendOverdueReminder(
                            student.getEmail(),
                            student.getFullName(),
                            student.getUsername(),
                            order.getId(),
                            oldestDueDate.toString(),
                            maxOverdueDays,
                            estimatedFine,
                            bookItems
                    );

                    alertedCount++;
                    log.warn("Da gui canh bao qua han don #{} cho sinh vien {}. So ngay tre: {}, Tien phat tam tinh: {}d",
                            order.getId(), student.getEmail(), maxOverdueDays, estimatedFine);
                } catch (Exception ex) {
                    log.error("Loi gui mail canh bao qua han don #{}: {}", order.getId(), ex.getMessage());
                }
            }

            return alertedCount;
        } catch (Exception ex) {
            log.error("Loi trong qua trinh xu ly sach qua han: {}", ex.getMessage());
            return 0;
        }
    }

    /*
      Tu dong huy cac don o trang thai READY_FOR_PICKUP qua thoi han quy dinh ma sinh vien khong den nhan.
      Hoan tra so luong sach kha dung vao kho cho nguoi khac muon.
    */
    public int cancelExpiredReadyOrders(LocalDate today) {
        try {
            LocalDateTime threshold = LocalDateTime.now().minusHours(pickupExpiryHours);
            List<BorrowOrder> expiredOrders = borrowOrderRepository.findByStatusAndUpdatedAtBefore(
                    BorrowOrderStatus.READY_FOR_PICKUP, threshold);

            if (expiredOrders == null || expiredOrders.isEmpty()) {
                return 0;
            }

            int cancelledCount = 0;
            for (BorrowOrder order : expiredOrders) {
                order.setStatus(BorrowOrderStatus.CANCELLED);
                order.setNote((order.getNote() != null ? order.getNote() + " | " : "") +
                        "Tự động hủy đơn do quá " + pickupExpiryHours + " giờ không đến nhận sách");

                // Hoan lai so luong kha dung vao kho sach
                if (order.getBorrowDetails() != null) {
                    for (BorrowDetail detail : order.getBorrowDetails()) {
                        Book book = detail.getBook();
                        if (book != null) {
                            int currentAvail = book.getAvailableQuantity() != null ? book.getAvailableQuantity() : 0;
                            book.setAvailableQuantity(currentAvail + 1);
                            bookRepository.save(book);
                        }
                    }
                }

                borrowOrderRepository.save(order);
                cancelledCount++;
                log.info("Da tu dong huy don #{} vi qua thoi han lay sach tai quay", order.getOrderCode());
            }

            return cancelledCount;
        } catch (Exception ex) {
            log.error("Loi khi tu dong huy don giu cho qua han: {}", ex.getMessage());
            return 0;
        }
    }
}
