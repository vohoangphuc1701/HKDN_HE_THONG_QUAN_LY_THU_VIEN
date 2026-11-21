import { useEffect, useRef, useState, useId } from 'react'
import {
  AlertCircle,
  Barcode,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Flashlight,
  History,
  QrCode,
  RotateCw,
  Send,
  Volume2,
  VolumeX,
  X
} from 'lucide-react'
import scanApi from '../../services/scanApi'

/*
  Component MobileScanCompanion
  Thanh phan dieu khien camera va bo nhan dien ma vach / ma QR tren dien thoai di dong.
  Ho tro phan hoi rung (haptic vibration), am thanh tieng bip khi quet trung,
  tu dong gui ket qua quet ve phien lam viec tren laptop qua scanApi va WebSocket.
*/
export default function MobileScanCompanion({ sessionToken, onScanSuccess, stationInfo }) {
  const [scanning, setScanning] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [scanHistory, setScanHistory] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [torchOn, setTorchOn] = useState(false)
  const [facingMode, setFacingMode] = useState('environment') /* 'environment' (cam sau) hoac 'user' (cam truoc) */
  const [lastScanned, setLastScanned] = useState(null)
  const [sending, setSending] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const manualInputId = useId()

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  /* Phat am thanh bip ngan khi quet thanh cong */
  function playBeep() {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime) /* Not La A5 */
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.15)
    } catch {
      /* Bo qua neu trinh duyet chan AudioContext */
    }
  }

  /* Rung dien thoai khi quet trung ma */
  function triggerHaptic() {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 40, 60])
      }
    } catch {
      /* Bo qua tren thiet bi khong ho tro rung */
    }
  }

  /* Hien thi thong bao tam thoi tren giao dien */
  function showToast(text, type = 'success') {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  /* Gui ma quet toi may tinh tram quay */
  async function transmitCode(codeToTransmit) {
    if (!codeToTransmit || !codeToTransmit.trim()) return
    const cleanCode = codeToTransmit.trim()

    setSending(true)
    playBeep()
    triggerHaptic()

    let detectedType = 'UNKNOWN'
    const upper = cleanCode.toUpperCase()
    if (upper.startsWith('OD-') || upper.startsWith('ORD-')) detectedType = 'BORROW_ORDER'
    else if (upper.startsWith('RT-') || upper.startsWith('RET-')) detectedType = 'RETURN_TICKET'
    else if (upper.startsWith('UTH-') || upper.startsWith('BK-')) detectedType = 'BOOK_BARCODE'

    const scanRecord = {
      id: Date.now(),
      code: cleanCode,
      type: detectedType,
      time: new Date().toLocaleTimeString('vi-VN')
    }

    setLastScanned(scanRecord)
    setScanHistory((prev) => [scanRecord, ...prev.slice(0, 19)])

    try {
      await scanApi.sendScanResult(sessionToken, cleanCode, detectedType)
      showToast(`Đã gửi: ${cleanCode}`, 'success')
      if (onScanSuccess) {
        onScanSuccess(scanRecord)
      }
    } catch (err) {
      showToast(`Lỗi truyền mã: ${err.message}`, 'error')
    } finally {
      setSending(false)
    }
  }

  /* Xu ly nhap ma thu cong khi camera khong quet duoc */
  function handleManualSubmit(e) {
    e?.preventDefault()
    if (!manualCode.trim()) return
    transmitCode(manualCode)
    setManualCode('')
  }

  /* Danh sach cac ma mau de thu nghiem nhanh */
  const quickTestCodes = [
    { label: 'Đơn mượn ORD-2026-1001', code: 'ORD-2026-1001' },
    { label: 'Phiếu trả RT-2026-001', code: 'RT-2026-001' },
    { label: 'Mã sách UTH-CNTT-0101', code: 'UTH-CNTT-0101' }
  ]

  return (
    <div className="mobile-companion" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Thong bao toast phan hoi nhanh */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '8px 16px',
            background: toastMessage.type === 'error' ? '#dc2626' : '#16a34a',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Khung ngam camera quet ma tren dien thoai */}
      <div
        className="card"
        style={{
          padding: '0',
          overflow: 'hidden',
          background: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Hieu ung khung ngam ngam laser do tim ma */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* 4 goc khung ngam */}
            <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderTopLeftRadius: '12px' }} />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderTopRightRadius: '12px' }} />
            <span style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderBottomLeftRadius: '12px' }} />
            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderBottomRightRadius: '12px' }} />

            {/* Tia laser quet chay len xuong */}
            <div
              style={{
                position: 'absolute',
                left: '6px',
                right: '6px',
                height: '2px',
                background: '#38bdf8',
                boxShadow: '0 0 10px #38bdf8, 0 0 20px #38bdf8',
                animation: 'scanLaser 2.2s infinite ease-in-out'
              }}
            />

            <Camera size={38} color="rgba(255,255,255,0.25)" />
          </div>

          {/* Thanh cong cu dieu khien camera tren dau */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10
            }}
          >
            <div
              style={{
                padding: '4px 10px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '12px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              Camera đang hoạt động
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="icon-button"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white', width: '32px', height: '32px' }}
                onClick={() => setSoundEnabled((v) => !v)}
                title={soundEnabled ? 'Tắt tiếng bip' : 'Bật tiếng bip'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                className="icon-button"
                style={{
                  background: torchOn ? '#f59e0b' : 'rgba(0,0,0,0.6)',
                  color: 'white',
                  width: '32px',
                  height: '32px'
                }}
                onClick={() => setTorchOn((v) => !v)}
                title="Bật/Tắt đèn pin"
              >
                <Flashlight size={16} />
              </button>

              <button
                type="button"
                className="icon-button"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white', width: '32px', height: '32px' }}
                onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
                title="Đổi camera trước/sau"
              >
                <RotateCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Ma vua quet gan nhat */}
        {lastScanned && (
          <div
            style={{
              padding: '12px 16px',
              background: '#1e293b',
              borderTop: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Mã vừa quét thành công:</div>
              <strong style={{ fontSize: '14px', color: '#38bdf8', letterSpacing: '0.5px' }}>
                {lastScanned.code}
              </strong>
            </div>
            <span
              style={{
                padding: '2px 8px',
                background: '#0284c7',
                color: 'white',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 600
              }}
            >
              {lastScanned.type}
            </span>
          </div>
        )}
      </div>

      {/* O nhap ma thu cong khi camera khong doc duoc */}
      <div className="card" style={{ padding: '16px' }}>
        <form onSubmit={handleManualSubmit}>
          <label
            htmlFor={manualInputId}
            style={{ display: 'block', margin: '0 0 6px', fontSize: '12px', color: '#334155', fontWeight: 600 }}
          >
            Hoặc nhập mã đơn / mã phiếu / mã vạch thủ công:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id={manualInputId}
              type="text"
              className="date-input"
              style={{ flex: 1, textTransform: 'uppercase', fontSize: '13px' }}
              placeholder="VD: ORD-2026-1001 hoặc RT-2026-001..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              className="button button--primary"
              disabled={!manualCode.trim() || sending}
            >
              <Send size={14} /> Gửi
            </button>
          </div>
        </form>

        {/* Nut quet nhanh cho thu nghiem */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
            Mã thử nghiệm nhanh:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickTestCodes.map((item) => (
              <button
                key={item.code}
                type="button"
                className="button button--secondary"
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={() => transmitCode(item.code)}
                disabled={sending}
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sach lich su cac ma da quet trong phien */}
      {scanHistory.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} color="#2563eb" />
              <strong style={{ fontSize: '12px', color: '#1e293b' }}>
                Lịch sử quét ({scanHistory.length})
              </strong>
            </div>
            <button
              type="button"
              className="icon-button"
              style={{ fontSize: '10px', color: '#64748b' }}
              onClick={() => setScanHistory([])}
            >
              Xóa lịch sử
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {scanHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}
              >
                <div>
                  <strong style={{ color: '#0f172a' }}>{item.code}</strong>
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>({item.type})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <time style={{ color: '#94a3b8' }}>{item.time}</time>
                  <button
                    type="button"
                    className="icon-button"
                    style={{ width: '22px', height: '22px' }}
                    onClick={() => transmitCode(item.code)}
                    title="Gửi lại mã này"
                  >
                    <Send size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
