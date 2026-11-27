package com.library.service;

import com.library.common.exception.BadRequestException;
import com.library.common.exception.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/*
  Dich vu quan ly phien ghep doi giua may tinh tram quet tai quay va dien thoai thong minh.
  Tao ma phien Session Token, xac thuc ghep doi thiet bi di dong,
  truyen nhan du lieu ma vach va QR thoi gian thuc qua WebSocket STOMP.
*/
@Service
@RequiredArgsConstructor
@Slf4j
public class ScannerSessionService {

    private final SimpMessagingTemplate messagingTemplate;

    /*
      Cau truc luu tru thong tin mot phien ghep doi may quet.
    */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScannerSession {
        private String sessionToken;
        private String stationId;
        private String stationName;
        private String deviceId;
        private String deviceName;
        private String status; /* WAITING_FOR_PAIRING, CONNECTED, DISCONNECTED, EXPIRED */
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
        private LocalDateTime pairedAt;
        private LocalDateTime lastActivityAt;
        private String lastScannedCode;
        private String lastScanType;
        private LocalDateTime lastScannedAt;
        private int totalScannedCount;
    }

    /*
      Bang anh xa luu tru cac phien quet dang hoat dong trong bo nho may chu.
    */
    private final Map<String, ScannerSession> activeSessions = new ConcurrentHashMap<>();

    private static final int DEFAULT_EXPIRY_MINUTES = 30;

    /*
      Tao moi mot phien quet cho tram quay tren laptop hoac may tinh ban.
    */
    public ScannerSession createSession(String stationId, String stationName, Integer customExpiryMinutes) {
        cleanExpiredSessions();

        int expiryMinutes = (customExpiryMinutes != null && customExpiryMinutes > 0)
                ? customExpiryMinutes
                : DEFAULT_EXPIRY_MINUTES;

        String sessionToken = generateSessionToken();
        LocalDateTime now = LocalDateTime.now();

        ScannerSession session = ScannerSession.builder()
                .sessionToken(sessionToken)
                .stationId(stationId != null ? stationId.trim() : "STATION-DESK-01")
                .stationName(stationName != null ? stationName.trim() : "Trạm quét quầy 1")
                .status("WAITING_FOR_PAIRING")
                .createdAt(now)
                .expiresAt(now.plusMinutes(expiryMinutes))
                .lastActivityAt(now)
                .totalScannedCount(0)
                .build();

        activeSessions.put(sessionToken, session);
        log.info("Đã khởi tạo phiên quét mới: token={}, station={}", sessionToken, session.getStationName());
        return session;
    }

    /*
      Lay thong tin chi tiet cua mot phien quet theo ma sessionToken.
    */
    public ScannerSession getSession(String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank()) {
            throw new BadRequestException("Mã phiên quét sessionToken không được để trống");
        }

        ScannerSession session = activeSessions.get(sessionToken.trim());
        if (session == null) {
            throw new ResourceNotFoundException("Phiên quét máy tính", "sessionToken", sessionToken);
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setStatus("EXPIRED");
            throw new BadRequestException("Phiên quét đã hết hạn sử dụng. Vui lòng tạo mã phiên mới tại quầy.");
        }

        return session;
    }

    /*
      Thuc hien ghep doi dien thoai vao phien quet cua tram quay.
    */
    public ScannerSession pairDevice(String sessionToken, String deviceId, String deviceName) {
        ScannerSession session = getSession(sessionToken);

        LocalDateTime now = LocalDateTime.now();
        session.setDeviceId(deviceId != null ? deviceId.trim() : UUID.randomUUID().toString().substring(0, 8));
        session.setDeviceName(deviceName != null ? deviceName.trim() : "Điện thoại thông minh");
        session.setStatus("CONNECTED");
        session.setPairedAt(now);
        session.setLastActivityAt(now);

        /* Ban su kien ghep doi thanh cong qua WebSocket STOMP */
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("event", "DEVICE_PAIRED");
        event.put("sessionToken", session.getSessionToken());
        event.put("deviceName", session.getDeviceName());
        event.put("deviceId", session.getDeviceId());
        event.put("status", "CONNECTED");
        event.put("pairedAt", now.toString());

        broadcastSessionEvent(session.getSessionToken(), event);

        log.info("Ghép đôi thành công: token={}, device={}", sessionToken, session.getDeviceName());
        return session;
    }

    /*
      Gui du lieu ma QR hoac ma vach vua quet tu dien thoai ve may tinh tram quay.
    */
    public Map<String, Object> sendScanData(String sessionToken, String scanCode, String scanType) {
        ScannerSession session = getSession(sessionToken);

        if (!"CONNECTED".equalsIgnoreCase(session.getStatus())) {
            throw new BadRequestException("Phiên quét chưa được ghép đôi với thiết bị hoặc đã bị ngắt kết nối");
        }

        if (scanCode == null || scanCode.isBlank()) {
            throw new BadRequestException("Nội dung mã quét không được để trống");
        }

        LocalDateTime now = LocalDateTime.now();
        String trimmedCode = scanCode.trim();
        String detectedType = detectScanType(trimmedCode, scanType);

        session.setLastScannedCode(trimmedCode);
        session.setLastScanType(detectedType);
        session.setLastScannedAt(now);
        session.setLastActivityAt(now);
        session.setTotalScannedCount(session.getTotalScannedCount() + 1);

        /* Dong goi su kien du lieu quet truyen qua WebSocket */
        Map<String, Object> scanEvent = new LinkedHashMap<>();
        scanEvent.put("event", "SCAN_DATA_RECEIVED");
        scanEvent.put("sessionToken", session.getSessionToken());
        scanEvent.put("code", trimmedCode);
        scanEvent.put("scanType", detectedType);
        scanEvent.put("timestamp", now.toString());
        scanEvent.put("deviceName", session.getDeviceName());
        scanEvent.put("sequence", session.getTotalScannedCount());

        broadcastSessionEvent(session.getSessionToken(), scanEvent);

        log.info("Nhận mã quét từ điện thoại: token={}, code={}, type={}", sessionToken, trimmedCode, detectedType);
        return scanEvent;
    }

    /*
      Ngat ket noi dien thoai khoi phien quet hien tai.
    */
    public void disconnectDevice(String sessionToken) {
        ScannerSession session = activeSessions.get(sessionToken);
        if (session != null) {
            session.setStatus("DISCONNECTED");
            session.setLastActivityAt(LocalDateTime.now());

            Map<String, Object> event = new LinkedHashMap<>();
            event.put("event", "DEVICE_DISCONNECTED");
            event.put("sessionToken", sessionToken);
            event.put("status", "DISCONNECTED");

            broadcastSessionEvent(sessionToken, event);
            log.info("Đã ngắt kết nối thiết bị khỏi phiên: {}", sessionToken);
        }
    }

    /*
      Huy hoac dong phien quet khi thu thu ket thuc ca lam viec.
    */
    public void closeSession(String sessionToken) {
        ScannerSession session = activeSessions.remove(sessionToken);
        if (session != null) {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("event", "SESSION_CLOSED");
            event.put("sessionToken", sessionToken);
            broadcastSessionEvent(sessionToken, event);
            log.info("Đã đóng phiên quét: {}", sessionToken);
        }
    }

    /*
      Kiem tra phien co con hieu luc va dang ket noi hay khong.
    */
    public boolean isSessionActiveAndPaired(String sessionToken) {
        if (sessionToken == null) return false;
        ScannerSession session = activeSessions.get(sessionToken);
        if (session == null) return false;
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) return false;
        return "CONNECTED".equalsIgnoreCase(session.getStatus());
    }

    /*
      Phat su kien thoi gian thuc den cac kenh lang nghe tuong ung.
    */
    private void broadcastSessionEvent(String sessionToken, Map<String, Object> payload) {
        try {
            /* Gui toi kenh rieng cua phien quet */
            messagingTemplate.convertAndSend("/topic/scanner/" + sessionToken, payload);
            /* Gui toi kenh chung cua toan bo tram quet tai quay */
            messagingTemplate.convertAndSend("/topic/scan-station", payload);
        } catch (Exception ex) {
            log.warn("Không thể gửi thông điệp WebSocket cho phiên {}: {}", sessionToken, ex.getMessage());
        }
    }

    /*
      Tu dong nhan dien loai ma quet dua vao tien to ma hoac dinh dang.
    */
    private String detectScanType(String code, String fallbackType) {
        if (fallbackType != null && !fallbackType.isBlank()) {
            return fallbackType.toUpperCase();
        }
        String upper = code.toUpperCase();
        if (upper.startsWith("OD-") || upper.startsWith("ORD-")) {
            return "BORROW_ORDER";
        }
        if (upper.startsWith("RT-") || upper.startsWith("RET-") || upper.startsWith("TK-")) {
            return "RETURN_TICKET";
        }
        if (upper.startsWith("ST-") || upper.length() == 10 && upper.matches("\\d+")) {
            return "STUDENT_CARD";
        }
        if (upper.startsWith("UTH-") || upper.startsWith("BK-") || upper.matches("\\d{10,13}")) {
            return "BOOK_BARCODE";
        }
        return "UNKNOWN";
    }

    /*
      Sinh ma phien ngau nhien 8 ky tu de nhap tren dien thoai.
    */
    private String generateSessionToken() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder("SCAN-");
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /*
      Don dep cac phien quet da het han khoi bo nho he thong.
    */
    public void cleanExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        activeSessions.entrySet().removeIf(entry -> entry.getValue().getExpiresAt().isBefore(now));
    }
}
