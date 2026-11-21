package com.library.controller;

import com.library.common.response.ApiResponse;
import com.library.service.ScannerSessionService;
import com.library.service.ScannerSessionService.ScannerSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/*
  Controller dieu phoi cac phien ghep doi may quet giua laptop va dien thoai.
  Ho tro ca REST API de thiet bi di dong de dang truy cap
  lan WebSocket MessageMapping de dong bo hai chieu tuc thi.
*/
@RestController
@RequestMapping("/api/scanner")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ScannerWsController {

    private final ScannerSessionService scannerSessionService;

    @Data
    public static class CreateSessionRequest {
        private String stationId;
        private String stationName;
        private Integer expiryMinutes;
    }

    @Data
    public static class PairDeviceRequest {
        private String sessionToken;
        private String deviceId;
        private String deviceName;
    }

    @Data
    public static class ScanDataRequest {
        private String sessionToken;
        private String code;
        private String scanType;
    }

    /*
      Khoi tao phien quet moi cho may tinh tram quay tren giao dien web admin.
    */
    @PostMapping("/session")
    public ResponseEntity<ApiResponse<ScannerSession>> createSession(@RequestBody(required = false) CreateSessionRequest request) {
        String stationId = (request != null) ? request.getStationId() : null;
        String stationName = (request != null) ? request.getStationName() : null;
        Integer expiry = (request != null) ? request.getExpiryMinutes() : 30;

        ScannerSession session = scannerSessionService.createSession(stationId, stationName, expiry);
        return ResponseEntity.ok(ApiResponse.success("Tạo phiên ghép đôi máy quét thành công", session));
    }

    /*
      Tra cuu trang thai cua mot phien quet theo ma sessionToken.
    */
    @GetMapping("/session/{sessionToken}")
    public ResponseEntity<ApiResponse<ScannerSession>> getSession(@PathVariable String sessionToken) {
        ScannerSession session = scannerSessionService.getSession(sessionToken);
        return ResponseEntity.ok(ApiResponse.success("Thông tin phiên quét", session));
    }

    /*
      Dien thoai di dong goi API xac thuc de ghep doi voi phien quet cua laptop.
    */
    @PostMapping("/pair")
    public ResponseEntity<ApiResponse<ScannerSession>> pairDevice(@RequestBody PairDeviceRequest request) {
        ScannerSession session = scannerSessionService.pairDevice(
                request.getSessionToken(),
                request.getDeviceId(),
                request.getDeviceName()
        );
        return ResponseEntity.ok(ApiResponse.success("Ghép đôi thiết bị thành công", session));
    }

    /*
      Dien thoai di dong truyen ma barcode hoac QR vua quet ve may tinh tram quay.
    */
    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitScanData(@RequestBody ScanDataRequest request) {
        Map<String, Object> result = scannerSessionService.sendScanData(
                request.getSessionToken(),
                request.getCode(),
                request.getScanType()
        );
        return ResponseEntity.ok(ApiResponse.success("Đã gửi mã quét tới trạm quầy", result));
    }

    /*
      Dien thoai thuc hien ngat ket noi khoi phien lam viec.
    */
    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<String>> disconnectDevice(@RequestParam String sessionToken) {
        scannerSessionService.disconnectDevice(sessionToken);
        return ResponseEntity.ok(ApiResponse.success("Đã ngắt kết nối thiết bị", sessionToken));
    }

    /*
      Xu ly thong diep STOMP WebSocket tu may khach gui len qua kenh /app/scanner/pair.
    */
    @MessageMapping("/scanner/pair")
    public void handleWsPair(@Payload PairDeviceRequest request) {
        try {
            scannerSessionService.pairDevice(
                    request.getSessionToken(),
                    request.getDeviceId(),
                    request.getDeviceName()
            );
        } catch (Exception ex) {
            log.error("Lỗi khi xử lý WebSocket pair: {}", ex.getMessage());
        }
    }

    /*
      Xu ly thong diep STOMP WebSocket tu dien thoai gui len qua kenh /app/scanner/scan.
    */
    @MessageMapping("/scanner/scan")
    public void handleWsScan(@Payload ScanDataRequest request) {
        try {
            scannerSessionService.sendScanData(
                    request.getSessionToken(),
                    request.getCode(),
                    request.getScanType()
            );
        } catch (Exception ex) {
            log.error("Lỗi khi xử lý WebSocket scan: {}", ex.getMessage());
        }
    }
}
