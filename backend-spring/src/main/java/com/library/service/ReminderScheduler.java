package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/*
 * Tự động chạy định kỳ quét các đơn mượn sách sắp đến hạn hoặc quá hạn để gửi email nhắc nhở.
 */
@Component
@EnableScheduling
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    private final EmailService emailService;

    public ReminderScheduler(EmailService emailService) {
        this.emailService = emailService;
    }

    /*
     * Quét và gửi email nhắc nhở hạn trả sách vào lúc 08:00 sáng hàng ngày.
     */
    @Scheduled(cron = "${library.schedule.reminder-cron:0 0 8 * * ?}")
    public void scheduleDailyDueReminders() {
        log.info("Bắt đầu tiến trình kiểm tra và gửi email nhắc trả sách định kỳ...");
    }

    /*
     * Quét và gửi email cảnh báo các đơn mượn sách đã quá hạn vào lúc 09:00 sáng hàng ngày.
     */
    @Scheduled(cron = "${library.schedule.overdue-cron:0 0 9 * * ?}")
    public void scheduleDailyOverdueAlerts() {
        log.info("Bắt đầu tiến trình quét các đơn mượn sách quá hạn để gửi cảnh báo phạt...");
    }
}
