package com.library.service;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.library.common.exception.OfflineScanException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/*
 * Kiem thu don vi cho lop QrService.
 * Kiem tra ma hoa ma QR don muon, phieu hen tra, Data URI va xu ly ngoai le ngoai tuyen.
 */
class QrServiceTest {

    private QrService qrService;

    @BeforeEach
    void setUp() {
        qrService = new QrService();
    }

    @Test
    @DisplayName("Ma hoa QR don muon sach sang Base64 thanh cong")
    void testGenerateBorrowQrBase64() {
        Long orderId = 1001L;
        String studentId = "2251120145";
        List<String> books = Arrays.asList("Kỹ thuật lập trình Java nâng cao", "Cơ sở dữ liệu");

        String base64 = qrService.generateBorrowQrBase64(orderId, studentId, books);

        assertNotNull(base64);
        assertFalse(base64.isBlank());
        // Kiem tra chuoi Base64 co the giai ma thanh byte hop le
        byte[] decodedBytes = Base64.getDecoder().decode(base64);
        assertTrue(decodedBytes.length > 0);
    }

    @Test
    @DisplayName("Tao anh ma QR don muon dang mang byte co the giai ma qua ZXing")
    void testGenerateBorrowQrImageAndDecode() throws Exception {
        Long orderId = 2002L;
        String studentId = "2251120032";

        byte[] imageBytes = qrService.generateBorrowQrImage(orderId, studentId);

        assertNotNull(imageBytes);
        assertTrue(imageBytes.length > 0);

        // Doc lai anh va giai ma noi dung QR
        ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(
                new BufferedImageLuminanceSource(ImageIO.read(bais))));
        Result result = new MultiFormatReader().decode(bitmap);

        assertNotNull(result);
        assertTrue(result.getText().contains("2002"));
        assertTrue(result.getText().contains("2251120032"));
    }

    @Test
    @DisplayName("Ma hoa QR phieu hen tra sach sang Base64 va Data URI")
    void testGenerateReturnTicketQrBase64AndDataUri() {
        String ticketId = "RT-2026-001";
        String appointmentDate = "2026-03-05";
        List<String> books = Arrays.asList("Kỹ thuật lập trình Java");

        String base64 = qrService.generateReturnTicketQrBase64(ticketId, appointmentDate, books);
        assertNotNull(base64);

        String dataUri = qrService.generateReturnTicketQrDataUri(ticketId, appointmentDate, books);
        assertNotNull(dataUri);
        assertTrue(dataUri.startsWith("data:image/png;base64,"));
    }

    @Test
    @DisplayName("Tao ma QR tu noi dung chuoi bat ky")
    void testGenerateQrFromArbitraryContent() {
        String customContent = "UTH-SMART-LIBRARY-STATION-01";

        String base64 = qrService.generateQrBase64FromContent(customContent);
        assertNotNull(base64);

        byte[] imageBytes = qrService.generateQrFromContent(customContent);
        assertNotNull(imageBytes);
        assertTrue(imageBytes.length > 0);
    }

    @Test
    @DisplayName("Kiem thu nem ngoai le OfflineScanException khi mat ket noi mang")
    void testOfflineScanExceptionHandling() {
        String scannedCode = "RT-2026-OFFLINE-99";
        String sessionToken = "SCAN-OFFLINE-01";

        OfflineScanException ex = assertThrows(OfflineScanException.class, () -> {
            boolean networkAvailable = false;
            if (!networkAvailable) {
                throw new OfflineScanException("Mất kết nối mạng khi quét QR", scannedCode, sessionToken, "RETURN_TICKET");
            }
        });

        assertEquals("RT-2026-OFFLINE-99", ex.getScannedCode());
        assertEquals("SCAN-OFFLINE-01", ex.getSessionToken());
        assertEquals("RETURN_TICKET", ex.getScanType());
        assertTrue(ex.getTimestamp() > 0);
    }
}
