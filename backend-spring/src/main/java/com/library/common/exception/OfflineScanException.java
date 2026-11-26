package com.library.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/*
 * Ngoai le xu ly khi quet ma QR bi mat ket noi mang hoac he thong ngoai tuyen.
 * Cho phep luu vet ma quet va ho tro co che luu dem ngoai tuyen (Offline Queue).
 */
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class OfflineScanException extends RuntimeException {

    private final String scannedCode;
    private final String sessionToken;
    private final String scanType;
    private final long timestamp;

    public OfflineScanException(String message, String scannedCode, String sessionToken, String scanType) {
        super(message);
        this.scannedCode = scannedCode;
        this.sessionToken = sessionToken;
        this.scanType = scanType;
        this.timestamp = System.currentTimeMillis();
    }

    public OfflineScanException(String message, String scannedCode) {
        this(message, scannedCode, null, "UNKNOWN");
    }

    public String getScannedCode() {
        return scannedCode;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public String getScanType() {
        return scanType;
    }

    public long getTimestamp() {
        return timestamp;
    }
}
