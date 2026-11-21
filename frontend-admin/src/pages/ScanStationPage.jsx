import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  Keyboard,
  Layers,
  MapPin,
  PackageCheck,
  QrCode,
  RefreshCw,
  Search,
  Smartphone,
  User,
  Wifi,
  X
} from 'lucide-react'
import scanApi from '../services/scanApi'
import socketClient from '../services/socketClient'
import Html5QrScanner from '../components/scanner/Html5QrScanner'
import ManualSearchModal from '../components/scanner/ManualSearchModal'
import PairingQrModal from '../components/scanner/PairingQrModal'
import ReturnVerificationView from '../components/scanner/ReturnVerificationView'

/*
  Trang ScanStationPage
  Tram quet ma QR va barcode tai quay danh cho thu thu thu vien UTH.
  Ket noi dong bo voi dien thoai qua PairingQrModal,
  ho tro quet QR ban giao sach muon (< 30 giay)
  va doi soat chi tiet phieu tra sach qua ReturnVerificationView.
*/
export default function ScanStationPage() {
  const [activeTab, setActiveTab] = useState('ALL') /* ALL, BORROW, RETURN */
  const [cameraActive, setCameraActive] = useState(true)
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [pairedDevice, setPairedDevice] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  /* Du lieu doi soat hoan tra sach */
  const [verificationData, setVerificationData] = useState(null)

  /* Du lieu don muon cho ban giao tai quay */
  const [pendingHandoverOrder, setPendingHandoverOrder] = useState(null)
  const [handoverSubmitting, setHandoverSubmitting] = useState(false)
  const [handoverSuccess, setHandoverSuccess] = useState(null)

  /* Lich su cac luot quet tai quay trong ca */
  const [stationLog, setStationLog] = useState([
    {
      id: 1,
      code: 'ORD-2026-1001',
      type: 'BORROW_ORDER',
      label: 'Bàn giao đơn mượn',
      student: 'Nguyễn Văn An (2251120145)',
      time: '10:15',
      status: 'SUCCESS'
    },
    {
      id: 2,
      code: 'RT-2026-001',
      type: 'RETURN_TICKET',
      label: 'Đối soát nhận trả sách',
      student: 'Trần Thị Mai (2251120032)',
      time: '09:42',
      status: 'SUCCESS'
    }
  ])

  function showToast(text, type = 'success') {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  /* Lang nghe su kien truyen ma tu dien thoai hoac qua kenh WebSocket tram quet */
  useEffect(() => {
    const unsubscribe = socketClient.subscribe('/topic/scan-station', (event) => {
      if (event?.event === 'DEVICE_PAIRED') {
        setPairedDevice(event)
        showToast(`Đã ghép đôi với điện thoại: ${event.deviceName}`, 'success')
      } else if (event?.event === 'SCAN_DATA_RECEIVED' && event?.code) {
        handleProcessScannedCode(event.code, event.scanType)
      } else if (event?.event === 'DEVICE_DISCONNECTED') {
        setPairedDevice(null)
        showToast('Điện thoại đã ngắt kết nối', 'info')
      }
    })

    return () => unsubscribe()
  }, [])

  /* Xu ly ma sau khi quet qua camera hoac nhap thu cong */
  async function handleProcessScannedCode(scannedCode, suggestedType) {
    if (!scannedCode || !scannedCode.trim()) return
    const code = scannedCode.trim()

    let detectedType = suggestedType || 'UNKNOWN'
    const upper = code.toUpperCase()
    if (upper.startsWith('RT-') || upper.startsWith('RET-') || upper.startsWith('TK-')) {
      detectedType = 'RETURN_TICKET'
    } else if (upper.startsWith('OD-') || upper.startsWith('ORD-')) {
      detectedType = 'BORROW_ORDER'
    }

    /* Neu la ma phieu tra sach -> Goi doi soat phieu tra */
    if (detectedType === 'RETURN_TICKET') {
      try {
        const verifyResult = await scanApi.verifyReturnQr(code)
        setVerificationData(verifyResult)
        setPendingHandoverOrder(null)
        setHandoverSuccess(null)
        showToast(`Đã nhận diện phiếu trả: ${code}`, 'success')
        recordLog(code, 'RETURN_TICKET', 'Đối soát nhận trả sách')
      } catch (err) {
        showToast(`Lỗi đối soát: ${err.message}`, 'error')
      }
      return
    }

    /* Neu la ma don muon sach -> Chuyen sang giao dien xac nhan ban giao */
    if (detectedType === 'BORROW_ORDER') {
      setPendingHandoverOrder({
        orderCode: code,
        studentName: 'Nguyễn Văn An',
        studentId: '2251120145',
        phone: '0912345678',
        books: [
          { title: 'Kỹ thuật lập trình Java nâng cao', shelfLocation: 'Kệ A-01-01' },
          { title: 'Cơ sở dữ liệu và MySQL', shelfLocation: 'Kệ B-02-03' }
        ],
        pickupSlot: '09:00 - 10:30'
      })
      setVerificationData(null)
      setHandoverSuccess(null)
      showToast(`Đã quét đơn mượn: ${code}`, 'success')
      recordLog(code, 'BORROW_ORDER', 'Quét đơn mượn tại quầy')
      return
    }

    /* Truong hop ma vach sach */
    showToast(`Đã nhận diện mã: ${code}`, 'info')
    recordLog(code, 'UNKNOWN', 'Nhận diện mã vạch')
  }

  /* Ghi lai nhat ky quet tai quay */
  function recordLog(code, type, label) {
    const newRecord = {
      id: Date.now(),
      code,
      type,
      label,
      student: 'Sinh viên tại quầy',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS'
    }
    setStationLog((prev) => [newRecord, ...prev.slice(0, 14)])
  }

  /* Xac nhan ban giao sach cho sinh vien tai quay (< 30 giay) */
  async function handleConfirmHandover() {
    if (!pendingHandoverOrder) return
    setHandoverSubmitting(true)
    try {
      const res = await scanApi.handoverBorrowOrder(pendingHandoverOrder.orderCode)
      setHandoverSuccess(res)
      showToast(`Bàn giao thành công đơn ${pendingHandoverOrder.orderCode}!`, 'success')
      setPendingHandoverOrder(null)
    } catch (err) {
      showToast(`Lỗi bàn giao: ${err.message}`, 'error')
    } finally {
      setHandoverSubmitting(false)
    }
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast thong bao phan hoi */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            padding: '12px 20px',
            background: toastMessage.type === 'error' ? '#dc2626' : '#16a34a',
            color: 'white',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Thanh header trang tram quet */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>
            Trạm quét QR tại quầy
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Xử lý bàn giao đơn mượn trực tuyến và đối soát nhận trả sách sớm qua mã QR
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Nut ghep doi dien thoai lam tay quet */}
          <button
            type="button"
            className={`button ${pairedDevice ? 'button--secondary' : 'button--primary'}`}
            style={{
              borderColor: pairedDevice ? '#22c55e' : undefined,
              color: pairedDevice ? '#15803d' : undefined
            }}
            onClick={() => setIsPairingModalOpen(true)}
          >
            <Smartphone size={15} />
            {pairedDevice ? `Đã nối: ${pairedDevice.deviceName}` : 'Ghép đôi điện thoại'}
          </button>

          {/* Nut nhap ma thu cong khi QR hong */}
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Keyboard size={15} /> Nhập mã thủ công
          </button>
        </div>
      </div>

      {/* Vung hien thi doi soat phieu tra sach (ReturnVerificationView) */}
      {verificationData && (
        <ReturnVerificationView
          verificationData={verificationData}
          onComplete={(res) => {
            showToast('Hoàn tất nhận trả sách và cập nhật tồn kho thành công!', 'success')
            setVerificationData(null)
          }}
          onCancel={() => setVerificationData(null)}
        />
      )}

      {/* Vung xac nhan ban giao don muon (Handover) */}
      {pendingHandoverOrder && (
        <div
          className="card"
          style={{
            padding: '24px',
            border: '2px solid #3b82f6',
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <PackageCheck size={24} />
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#1e3a8a' }}>
                    Xác nhận Bàn giao sách tại quầy
                  </h3>
                  <strong style={{ padding: '2px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '4px', fontSize: '12px' }}>
                    {pendingHandoverOrder.orderCode}
                  </strong>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Sinh viên: <strong>{pendingHandoverOrder.studentName}</strong> ({pendingHandoverOrder.studentId}) - SĐT: {pendingHandoverOrder.phone}
                </p>
              </div>
            </div>

            <button className="icon-button" onClick={() => setPendingHandoverOrder(null)}>
              <X size={18} />
            </button>
          </div>

          <div style={{ margin: '16px 0' }}>
            <div style={{ fontSize: '12px', color: '#475467', marginBottom: '8px', fontWeight: 600 }}>
              Sách cần bàn giao:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pendingHandoverOrder.books.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 14px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>{b.title}</strong>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {b.shelfLocation}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setPendingHandoverOrder(null)}
              disabled={handoverSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              className="button button--primary"
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
              onClick={handleConfirmHandover}
              disabled={handoverSubmitting}
            >
              <Check size={15} />
              {handoverSubmitting ? 'Đang bàn giao...' : 'Xác nhận Bàn giao sách (< 30s)'}
            </button>
          </div>
        </div>
      )}

      {/* Ket qua ban giao thanh cong */}
      {handoverSuccess && (
        <div className="card" style={{ padding: '20px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac' }}>
          <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 8px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#166534' }}>
            Đã bàn giao sách thành công!
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#15803d' }}>
            Hạn trả mới đã được thiết lập: 14 ngày tới. Trạng thái đơn mượn đã chuyển sang Đang mượn.
          </p>
          <button className="button button--primary" onClick={() => setHandoverSuccess(null)}>
            Tiếp tục quét đơn khác
          </button>
        </div>
      )}

      {/* Luoi giao dien quet camera va nhat ky thao tac */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Vung camera quet tren laptop */}
        <div className="card" style={{ padding: '20px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={16} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>
                Camera quét trực tiếp tại quầy
              </h3>
            </div>
            <button
              type="button"
              className="button button--secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => setCameraActive((v) => !v)}
            >
              {cameraActive ? 'Tắt camera' : 'Bật camera'}
            </button>
          </header>

          {cameraActive ? (
            <Html5QrScanner
              onScanSuccess={(decodedText) => handleProcessScannedCode(decodedText)}
            />
          ) : (
            <div className="empty-state" style={{ minHeight: '260px' }}>
              <span className="empty-state__icon"><Camera size={24} /></span>
              <h4 style={{ margin: '12px 0 6px', fontSize: '14px' }}>Camera đang tắt</h4>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Bật lại camera hoặc dùng điện thoại ghép đôi để quét mã không dây.
              </p>
            </div>
          )}

          {/* Phim tat quet thu nghiem nhanh */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
              Thử nghiệm nhanh mã QR mẫu:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                className="button button--secondary"
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={() => handleProcessScannedCode('RT-2026-001', 'RETURN_TICKET')}
              >
                + Phiếu trả RT-2026-001
              </button>
              <button
                type="button"
                className="button button--secondary"
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={() => handleProcessScannedCode('ORD-2026-1001', 'BORROW_ORDER')}
              >
                + Đơn mượn ORD-2026-1001
              </button>
            </div>
          </div>
        </div>

        {/* Nhat ky quet tai quay */}
        <div className="card" style={{ padding: '20px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>
                Nhật ký quét trong ca trực ({stationLog.length})
              </h3>
            </div>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {stationLog.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#0f172a' }}>{log.code}</strong>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 600,
                        background: log.type === 'RETURN_TICKET' ? '#ecfdf5' : '#eff6ff',
                        color: log.type === 'RETURN_TICKET' ? '#047857' : '#1d4ed8'
                      }}
                    >
                      {log.label}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>{log.student}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <time style={{ color: '#94a3b8' }}>{log.time}</time>
                  <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '10px' }}>✓ Thành công</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal ghep doi dien thoai */}
      <PairingQrModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        onDevicePaired={(device) => {
          setPairedDevice(device)
          showToast(`Đã ghép đôi thành công với ${device.deviceName}!`, 'success')
        }}
      />

      {/* Modal nhap ma thu cong */}
      <ManualSearchModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSelect={(selected) => {
          setIsManualModalOpen(false)
          handleProcessScannedCode(selected.orderCode || selected.studentId || selected.id)
        }}
      />
    </div>
  )
}
