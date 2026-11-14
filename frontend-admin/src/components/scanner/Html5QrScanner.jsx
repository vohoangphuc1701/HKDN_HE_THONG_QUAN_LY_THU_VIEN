import { useEffect, useRef, useState, useId } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  Camera,
  CameraOff,
  Play,
  Square,
  Pause,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ScanLine
} from 'lucide-react'

/*
  Ham phan tich noi dung ma QR thanh thong tin co cau truc.
  Ho tro dinh dang gach dung (BORROW|id|sv|time), JSON hoac van ban thuan.
*/
function parseQrData(rawText) {
  if (!rawText) return null
  const text = rawText.trim()

  // Dinh dang chuoi tach bang dau gach dung
  if (text.includes('|')) {
    const parts = text.split('|')
    const actionType = parts[0]?.toUpperCase()
    return {
      raw: text,
      format: 'PIPELINE',
      type: actionType === 'BORROW' ? 'Mượn sách' : actionType === 'RETURN' ? 'Trả sách' : actionType,
      badgeColor: actionType === 'BORROW' ? '#2563eb' : actionType === 'RETURN' ? '#16a34a' : '#ea580c',
      id: parts[1] || '---',
      studentId: parts[2] || '---',
      timestamp: parts[3] || '---'
    }
  }

  // Dinh dang chuoi JSON
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text)
      return {
        raw: text,
        format: 'JSON',
        type: parsed.type || 'Dữ liệu JSON',
        badgeColor: '#7c3aed',
        id: parsed.orderId || parsed.ticketId || parsed.id || '---',
        studentId: parsed.studentId || parsed.userId || '---',
        timestamp: parsed.createdAt || parsed.timestamp || '---',
        details: parsed
      }
    } catch {
      // Xu ly nhu van ban thuan neu khong phai JSON hop le
    }
  }

  // Dinh dang van ban thuan
  return {
    raw: text,
    format: 'PLAIN_TEXT',
    type: 'Mã văn bản',
    badgeColor: '#64748b',
    id: text,
    studentId: '---',
    timestamp: new Date().toLocaleTimeString('vi-VN')
  }
}

/*
  Component Html5QrScanner
  Prototype quet ma QR truc tiep qua camera trinh duyet bang thu vien html5-qrcode.
  Cung cap cac dieu khien bat/tat, tam dung, chon camera va tai anh len de quet.
*/
export default function Html5QrScanner({
  onScanSuccess,
  onScanError,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
  autoStart = false,
  showControls = true
}) {
  const rawId = useId()
  const readerElementId = 'qr-reader-' + rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const fileInputRef = useRef(null)
  const scannerRef = useRef(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [statusMessage, setStatusMessage] = useState('Camera chưa kích hoạt')
  const [errorMessage, setErrorMessage] = useState('')
  const [scannedResult, setScannedResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [scanCount, setScanCount] = useState(0)

  // Khoi tao va lay danh sach thiet bi camera co san
  useEffect(() => {
    let isMounted = true

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMounted) return
        if (devices && devices.length > 0) {
          setCameras(devices)
          // Uu tien chon camera sau neu co
          const backCam = devices.find((cam) =>
            cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('sau')
          )
          setSelectedCameraId(backCam ? backCam.id : devices[0].id)
        } else {
          setStatusMessage('Không tìm thấy camera trên thiết bị')
        }
      })
      .catch((err) => {
        if (!isMounted) return
        console.warn('Lỗi kiểm tra danh sách camera:', err)
        setStatusMessage('Chưa cấp quyền truy cập camera')
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Giai phong tai nguyen camera khi component unmount
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      if (scanner) {
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => {
              try {
                scanner.clear()
              } catch (e) {
                console.warn('Lỗi xóa vùng quét:', e)
              }
            })
            .catch(() => {
              try {
                scanner.clear()
              } catch (e) {
                console.warn('Lỗi xóa vùng quét:', e)
              }
            })
        } else {
          try {
            scanner.clear()
          } catch (e) {
            console.warn('Lỗi xóa vùng quét:', e)
          }
        }
      }
    }
  }, [])

  // Xu ly khi quet thanh cong ma QR
  const handleSuccess = (decodedText, decodedResult) => {
    const parsed = parseQrData(decodedText)
    setScannedResult(parsed)
    setScanCount((prev) => prev + 1)
    setStatusMessage('Đã nhận diện mã thành công')
    setErrorMessage('')

    if (onScanSuccess) {
      onScanSuccess(decodedText, decodedResult, parsed)
    }
  }

  // Xu ly loi doc ma trong qua trinh quet
  const handleError = (error) => {
    // Khong hien thi loi doc frame binh thuong de tranh spam giao dien
    if (onScanError) {
      onScanError(error)
    }
  }

  // Bat dau quet camera
  const startScanning = async () => {
    try {
      setErrorMessage('')
      setStatusMessage('Đang kết nối camera...')

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId)
      }

      const scanner = scannerRef.current

      // Neu dang quet thi dung truoc khi bat lai
      if (scanner.isScanning) {
        await scanner.stop()
      }

      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' }

      const scanConfig = {
        fps: fps,
        qrbox: typeof qrbox === 'number' ? { width: qrbox, height: qrbox } : qrbox,
        aspectRatio: aspectRatio
      }

      await scanner.start(cameraConfig, scanConfig, handleSuccess, handleError)

      setIsScanning(true)
      setIsPaused(false)
      setStatusMessage('Đang quét trực tiếp từ camera...')
    } catch (err) {
      console.error('Lỗi khởi động camera:', err)
      setIsScanning(false)
      setIsPaused(false)
      const errStr = String(err?.message || err)
      if (errStr.includes('NotAllowedError') || errStr.includes('Permission')) {
        setErrorMessage('Trình duyệt chưa được cấp quyền dùng camera. Vui lòng kiểm tra quyền trên thanh địa chỉ.')
      } else if (errStr.includes('NotFoundError')) {
        setErrorMessage('Không tìm thấy thiết bị camera hợp lệ.')
      } else {
        setErrorMessage('Không thể khởi động camera: ' + errStr)
      }
      setStatusMessage('Lỗi kết nối camera')
    }
  }

  // Dung hoan toan camera va tat den bao
  const stopScanning = async () => {
    try {
      const scanner = scannerRef.current
      if (scanner && scanner.isScanning) {
        await scanner.stop()
      }
      setIsScanning(false)
      setIsPaused(false)
      setStatusMessage('Đã dừng camera')
    } catch (err) {
      console.warn('Lỗi khi dừng camera:', err)
      setIsScanning(false)
      setIsPaused(false)
    }
  }

  // Tam dung hoac tiep tuc quet
  const togglePause = () => {
    const scanner = scannerRef.current
    if (!scanner || !scanner.isScanning) return

    try {
      if (isPaused) {
        scanner.resume()
        setIsPaused(false)
        setStatusMessage('Đang quét trực tiếp từ camera...')
      } else {
        scanner.pause(true)
        setIsPaused(true)
        setStatusMessage('Đã tạm dừng khung hình')
      }
    } catch (err) {
      console.warn('Lỗi tạm dừng/tiếp tục:', err)
    }
  }

  // Quet ma QR tu tep anh nguoi dung tai len
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setErrorMessage('')
      setStatusMessage('Đang phân tích hình ảnh...')

      // Dung camera neu dang bat
      if (isScanning) {
        await stopScanning()
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId)
      }

      const decodedText = await scannerRef.current.scanFile(file, true)
      handleSuccess(decodedText, { result: decodedText })
      setStatusMessage('Đã đọc mã từ tệp ảnh thành công')
    } catch (err) {
      console.warn('Lỗi đọc ảnh QR:', err)
      setErrorMessage('Không tìm thấy mã QR hợp lệ trong hình ảnh đã chọn.')
      setStatusMessage('Đọc tệp thất bại')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Sao chep noi dung ma vao clipboard
  const handleCopy = () => {
    if (!scannedResult?.raw) return
    navigator.clipboard?.writeText(scannedResult.raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tu dong bat dau quet neu duoc cau hinh autoStart
  useEffect(() => {
    if (autoStart) {
      startScanning()
    }
  }, [autoStart])

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '720px',
        margin: '0 auto'
      }}
    >
      {/* Tieu de va trang thai */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #edf2f7'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <ScanLine size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
              Máy quét mã QR trực tuyến
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Thử nghiệm quét QR qua camera trình duyệt hoặc tải tệp ảnh
            </p>
          </div>
        </div>

        {/* Huy hieu trang thai hoat dong */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            background: isScanning ? (isPaused ? '#fef3c7' : '#dcfce7') : '#f1f5f9',
            color: isScanning ? (isPaused ? '#b45309' : '#15803d') : '#64748b'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isScanning ? (isPaused ? '#f59e0b' : '#22c55e') : '#94a3b8'
            }}
          />
          {statusMessage}
        </div>
      </div>

      {/* Khu vuc khung quet camera */}
      <div
        style={{
          position: 'relative',
          background: '#0f172a',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '340px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #334155'
        }}
      >
        {/* Phan tu DOM chua video cua thu vien html5-qrcode */}
        <div
          id={readerElementId}
          style={{
            width: '100%',
            height: '100%',
            display: isScanning ? 'block' : 'none'
          }}
        />

        {/* Khung giao dien cho khi camera chua bat */}
        {!isScanning && (
          <div
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              padding: '40px 20px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                color: '#cbd5e1'
              }}
            >
              <Camera size={32} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
              Camera đang ở trạng thái nghỉ
            </p>
            <p style={{ margin: 0, fontSize: '13px', maxWidth: '320px', lineHeight: 1.5 }}>
              Nhấn nút "Bắt đầu quét" bên dưới hoặc tải ảnh chứa mã QR để kiểm tra.
            </p>
          </div>
        )}

        {/* Hieu ung tia quet khi camera dang hoat dong */}
        {isScanning && !isPaused && (
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              right: '15%',
              bottom: '15%',
              border: '2px solid rgba(59, 130, 246, 0.6)',
              borderRadius: '12px',
              pointerEvents: 'none',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                boxShadow: '0 0 8px #38bdf8'
              }}
            />
          </div>
        )}
      </div>

      {/* Thong bao loi neu co */}
      {errorMessage && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bang dieu khien camera */}
      {showControls && (
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Nhom nut hanh dong chinh */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {!isScanning ? (
              <button
                type="button"
                onClick={startScanning}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Play size={16} /> Bắt đầu quét
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopScanning}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Square size={16} /> Dừng camera
                </button>

                <button
                  type="button"
                  onClick={togglePause}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                </button>
              </>
            )}

            {/* Nut tai anh len quet */}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Upload size={16} /> Tải ảnh QR
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Chon thiet bi camera neu co nhieu camera */}
          {cameras.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="cameraSelect" style={{ fontSize: '12px', color: '#64748b' }}>
                Camera:
              </label>
              <select
                id="cameraSelect"
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value)
                  if (isScanning) {
                    // Khoi dong lai voi camera moi
                    setTimeout(() => startScanning(), 100)
                  }
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12px',
                  color: '#334155',
                  outline: 'none'
                }}
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || 'Camera ' + cam.id.substring(0, 5)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Hop ket qua quet duoc */}
      {scannedResult && (
        <div
          style={{
            marginTop: '24px',
            padding: '18px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                Kết quả quét gần nhất (Lần #{scanCount})
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#2563eb',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>

              <button
                type="button"
                onClick={() => setScannedResult(null)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Chi tiet phan tich noi dung ma */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              background: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #edf2f7',
              marginBottom: '10px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Loại tác vụ</span>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: scannedResult.badgeColor + '18',
                  color: scannedResult.badgeColor
                }}
              >
                {scannedResult.type}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Mã phiếu / Đơn</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{scannedResult.id}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Mã sinh viên</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{scannedResult.studentId}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Thời gian ghi nhận</span>
              <span style={{ fontSize: '12px', color: '#475569' }}>{scannedResult.timestamp}</span>
            </div>
          </div>

          {/* Chuoi du lieu tho */}
          <div
            style={{
              fontSize: '12px',
              color: '#334155',
              wordBreak: 'break-all',
              background: '#ffffff',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px dashed #cbd5e1',
              fontFamily: 'monospace'
            }}
          >
            <span style={{ color: '#94a3b8', marginRight: '6px' }}>Chuỗi thô:</span>
            {scannedResult.raw}
          </div>
        </div>
      )}
    </div>
  )
}
