import { useEffect, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Laptop,
  Phone,
  QrCode,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import scanApi from '../../services/scanApi'
import socketClient from '../../services/socketClient'

/*
  Component PairingQrModal
  Modal hien thi tren man hinh laptop cua thu thu de tao phien va hien thi ma QR ghep doi.
  Dien thoai thong minh quet ma QR nay se duoc ket noi thoi gian thuc va bien thanh
  tay quet barcode/QR di dong truyen du lieu ve tram quay.
*/
export default function PairingQrModal({ isOpen, onClose, onDevicePaired }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pairedDevice, setPairedDevice] = useState(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) /* 15 phut = 900s */

  /* Khoi tao phien ghep doi moi khi mo modal */
  useEffect(() => {
    if (isOpen) {
      initNewSession()
    } else {
      setSession(null)
      setPairedDevice(null)
    }
  }, [isOpen])

  /* Dem nguoc thoi gian hieu luc cua ma phien */
  useEffect(() => {
    if (!isOpen || !session || pairedDevice) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, session, pairedDevice])

  /* Lang nghe su kien ghep doi thiet bi thoi gian thuc */
  useEffect(() => {
    if (!session?.sessionToken) return

    const topic = `/topic/scanner/${session.sessionToken}`
    const unsubscribe = socketClient.subscribe(topic, (event) => {
      if (event?.event === 'DEVICE_PAIRED') {
        setPairedDevice({
          deviceName: event.deviceName || 'Điện thoại di động',
          deviceId: event.deviceId,
          pairedAt: event.pairedAt || new Date().toISOString()
        })
        if (onDevicePaired) {
          onDevicePaired(event)
        }
      } else if (event?.event === 'DEVICE_DISCONNECTED') {
        setPairedDevice(null)
      }
    })

    /* Co che polling kiem tra trang thai phong khi khong co WebSocket */
    const interval = setInterval(async () => {
      if (!pairedDevice) {
        try {
          const current = await scanApi.getSession(session.sessionToken)
          if (current?.status === 'CONNECTED' && current?.deviceName) {
            setPairedDevice({
              deviceName: current.deviceName,
              deviceId: current.deviceId,
              pairedAt: current.pairedAt
            })
            if (onDevicePaired) {
              onDevicePaired(current)
            }
          }
        } catch {
          /* Bo qua loi mang nhe */
        }
      }
    }, 2500)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [session?.sessionToken, pairedDevice, onDevicePaired])

  async function initNewSession() {
    setLoading(true)
    setPairedDevice(null)
    setTimeLeft(900)
    try {
      const data = await scanApi.createSession({
        stationId: 'STATION-DESK-01',
        stationName: 'Trạm quét quầy 1'
      })
      setSession(data)
    } catch (err) {
      console.error('Lỗi khởi tạo phiên quét:', err)
    } finally {
      setLoading(false)
    }
  }

  /* Sao chep ma sessionToken vao bo nho tam */
  function handleCopyToken() {
    if (!session?.sessionToken) return
    navigator.clipboard?.writeText(session.sessionToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* Duong dan mo tren trinh duyet dien thoai */
  const remoteUrl = session?.sessionToken
    ? `${window.location.origin}/scanner-remote?session=${session.sessionToken}`
    : ''

  /* Dinh dang phut giay dem nguoc */
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '0',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          background: 'white'
        }}
      >
        {/* Header modal */}
        <header
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Smartphone size={20} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                Ghép đôi điện thoại làm máy quét
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                Biến smartphone thành tay quét mã vạch và QR không dây tại quầy
              </p>
            </div>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </header>

        {/* Noi dung modal */}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          {loading ? (
            <div style={{ padding: '40px 0', color: '#64748b' }}>
              <RefreshCw size={28} className="spin-icon" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13px' }}>Đang khởi tạo mã phiên ghép đôi an toàn...</p>
            </div>
          ) : pairedDevice ? (
            /* Trang thai da ket noi thanh cong */
            <div style={{ padding: '16px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf3',
                  color: '#16a34a',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ margin: '0 0 6px', fontSize: '17px', color: '#0f172a' }}>
                Đã kết nối thành công!
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#475467' }}>
                Thiết bị: <strong>{pairedDevice.deviceName}</strong> đang đồng bộ trực tiếp với quầy.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#15803d',
                  marginBottom: '20px'
                }}
              >
                <Wifi size={14} /> Trực tuyến - Sẵn sàng nhận dữ liệu quét
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="button button--secondary" onClick={initNewSession}>
                  <RefreshCw size={14} /> Ghép đôi thiết bị khác
                </button>
                <button className="button button--primary" onClick={onClose}>
                  <Check size={14} /> Bắt đầu làm việc tại quầy
                </button>
              </div>
            </div>
          ) : (
            /* Trang thai cho dien thoai quet ma QR */
            <div>
              {/* Vung hien thi ma QR */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '16px',
                  background: 'white',
                  border: '2px dashed #93c5fd',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
                }}
              >
                {/* Render ma QR bang SVG mau sac sinh dong */}
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 200 200"
                  style={{ display: 'block', margin: '0 auto' }}
                >
                  <rect width="200" height="200" fill="#ffffff" rx="10" />
                  {/* Dinh vi goc tren trai */}
                  <rect x="20" y="20" width="50" height="50" rx="6" fill="#1e40af" />
                  <rect x="28" y="28" width="34" height="34" rx="3" fill="#ffffff" />
                  <rect x="36" y="36" width="18" height="18" rx="2" fill="#1e40af" />
                  {/* Dinh vi goc tren phai */}
                  <rect x="130" y="20" width="50" height="50" rx="6" fill="#1e40af" />
                  <rect x="138" y="28" width="34" height="34" rx="3" fill="#ffffff" />
                  <rect x="146" y="36" width="18" height="18" rx="2" fill="#1e40af" />
                  {/* Dinh vi goc duoi trai */}
                  <rect x="20" y="130" width="50" height="50" rx="6" fill="#1e40af" />
                  <rect x="28" y="138" width="34" height="34" rx="3" fill="#ffffff" />
                  <rect x="36" y="146" width="18" height="18" rx="2" fill="#1e40af" />
                  {/* Hoa van du lieu trung tam */}
                  <rect x="85" y="20" width="12" height="12" fill="#2563eb" />
                  <rect x="105" y="35" width="12" height="12" fill="#3b82f6" />
                  <rect x="85" y="55" width="12" height="12" fill="#1d4ed8" />
                  <rect x="80" y="80" width="40" height="40" rx="6" fill="#eff6ff" />
                  <circle cx="100" cy="100" r="14" fill="#2563eb" />
                  <path d="M95 100 L105 100 M100 95 L100 105" stroke="#ffffff" strokeWidth="3" />
                  <rect x="20" y="85" width="12" height="12" fill="#2563eb" />
                  <rect x="40" y="100" width="12" height="12" fill="#3b82f6" />
                  <rect x="140" y="85" width="12" height="12" fill="#2563eb" />
                  <rect x="160" y="100" width="12" height="12" fill="#1d4ed8" />
                  <rect x="85" y="135" width="12" height="12" fill="#2563eb" />
                  <rect x="105" y="150" width="12" height="12" fill="#3b82f6" />
                  <rect x="135" y="135" width="12" height="12" fill="#1d4ed8" />
                  <rect x="155" y="155" width="12" height="12" fill="#2563eb" />
                </svg>
              </div>

              {/* Huong dan 2 buoc */}
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#334155' }}>
                Mở camera trên điện thoại và quét mã QR ở trên để kết nối trực tiếp.
              </p>

              {/* Ma PIN nhap thu cong */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '0 auto 14px'
                }}
              >
                <span style={{ fontSize: '12px', color: '#64748b' }}>Hoặc nhập mã phiên:</span>
                <strong
                  style={{
                    padding: '4px 10px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    letterSpacing: '1px',
                    color: '#0f172a'
                  }}
                >
                  {session?.sessionToken}
                </strong>
                <button
                  className="icon-button"
                  style={{ width: '28px', height: '28px' }}
                  onClick={handleCopyToken}
                  title="Sao chép mã"
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Thoi gian con lai va trang thai lang nghe */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#64748b'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      display: 'inline-block'
                    }}
                  />
                  <span>Đang chờ điện thoại kết nối...</span>
                </div>
                <span>
                  Hiệu lực còn: <strong>{formattedTime}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                <button className="button button--secondary" onClick={initNewSession}>
                  <RefreshCw size={14} /> Tạo mã mới
                </button>
                <a
                  href={remoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button button--secondary"
                  title="Mở tab giả lập trên cùng máy"
                >
                  <ExternalLink size={14} /> Mở thử giao diện điện thoại
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
