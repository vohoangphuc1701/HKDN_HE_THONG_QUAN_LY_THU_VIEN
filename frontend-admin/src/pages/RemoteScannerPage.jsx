import { useEffect, useState, useId } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  LogOut,
  QrCode,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react'
import scanApi from '../services/scanApi'
import MobileScanCompanion from '../components/scanner/MobileScanCompanion'

/*
  Trang RemoteScannerPage danh rieng cho trinh duyet dien thoai di dong.
  Truy cap thong qua duong dan /scanner-remote?session=SCAN-...
  Tu dong ghep doi dien thoai voi tram quay cua laptop,
  bien camera dien thoai thanh may doc barcode va QR khong day.
*/
export default function RemoteScannerPage() {
  const [searchParams] = useSearchParams()
  const initialSessionToken = searchParams.get('session') || ''

  const [sessionToken, setSessionToken] = useState(initialSessionToken.toUpperCase())
  const [inputToken, setInputToken] = useState(initialSessionToken.toUpperCase())
  const [sessionState, setSessionState] = useState(null)
  const [isPaired, setIsPaired] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const sessionInputId = useId()

  /* Tu dong thuc hien ghep doi neu tren URL da co san session token */
  useEffect(() => {
    if (initialSessionToken) {
      handleConnectSession(initialSessionToken)
    }
  }, [initialSessionToken])

  /* Ket noi va ghep doi voi phien quet tren laptop */
  async function handleConnectSession(tokenToConnect) {
    if (!tokenToConnect || !tokenToConnect.trim()) {
      setErrorMessage('Vui lòng nhập mã phiên hợp lệ')
      return
    }

    const cleanToken = tokenToConnect.trim().toUpperCase()
    setConnecting(true)
    setErrorMessage(null)

    try {
      /* Tao ten thiet bi dua tren he dieu hanh di dong */
      let deviceName = 'Điện thoại di động'
      if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent
        if (ua.includes('iPhone')) deviceName = 'Apple iPhone'
        else if (ua.includes('iPad')) deviceName = 'Apple iPad'
        else if (ua.includes('Android')) deviceName = 'Điện thoại Android'
        else if (ua.includes('Windows')) deviceName = 'Thiết bị di động'
      }

      const deviceId = 'MOB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const pairedSession = await scanApi.pairDevice(cleanToken, deviceId, deviceName)

      setSessionToken(cleanToken)
      setSessionState(pairedSession)
      setIsPaired(true)
    } catch (err) {
      setErrorMessage(err.message || 'Không thể ghép đôi với mã phiên này. Vui lòng kiểm tra lại.')
      setIsPaired(false)
    } finally {
      setConnecting(false)
    }
  }

  /* Ngat ket noi khoi phien tram quay */
  async function handleDisconnect() {
    if (sessionToken) {
      try {
        await scanApi.disconnectDevice(sessionToken)
      } catch {
        /* Bo qua */
      }
    }
    setIsPaired(false)
    setSessionState(null)
    setSessionToken('')
    setInputToken('')
  }

  /* Xu ly submit form nhap ma thu cong */
  function handleManualPairSubmit(e) {
    e?.preventDefault()
    handleConnectSession(inputToken)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Topbar chuyen biet cho dien thoai */}
      <header
        style={{
          padding: '12px 16px',
          background: '#1e293b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#2563eb',
              color: 'white',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Smartphone size={18} />
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>UTH Remote Scanner</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Tay quét không dây cho quầy</div>
          </div>
        </div>

        {isPaired && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                background: '#16a34a',
                color: 'white',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 600
              }}
            >
              <Wifi size={11} /> Đã ghép đôi
            </span>
            <button
              className="icon-button"
              style={{ color: '#cbd5e1', width: '28px', height: '28px' }}
              onClick={handleDisconnect}
              title="Ngắt kết nối"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </header>

      {/* Vung noi dung chinh */}
      <main style={{ flex: 1, padding: '16px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {!isPaired ? (
          /* Man hinh nhap ma phien ghep doi khi chua ket noi */
          <div className="card" style={{ padding: '24px 20px', textAlign: 'center', marginTop: '20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px'
              }}
            >
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 8px' }}>
              Nhập mã phiên ghép đôi
            </h2>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 20px', lineHeight: 1.5 }}>
              Xem mã phiên 8 ký tự hiển thị trên màn hình laptop quầy thư viện và nhập vào ô bên dưới:
            </p>

            <form onSubmit={handleManualPairSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label htmlFor={sessionInputId} style={{ display: 'none' }}>Mã phiên</label>
                <input
                  id={sessionInputId}
                  type="text"
                  className="date-input"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box'
                  }}
                  placeholder="VD: SCAN-8A2F9C"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                  disabled={connecting}
                />
              </div>

              {errorMessage && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    borderRadius: '6px',
                    fontSize: '12px',
                    marginBottom: '14px'
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="button button--primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                disabled={connecting || !inputToken.trim()}
              >
                {connecting ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" /> Đang kết nối...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Kết nối vào trạm quét quầy
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#94a3b8' }}>
              Hoặc dùng ứng dụng Camera gốc trên điện thoại quét trực tiếp mã QR trên laptop để tự động ghép đôi không cần nhập mã.
            </div>
          </div>
        ) : (
          /* Man hinh camera tay quet sau khi da ghep doi thanh cong */
          <div>
            {/* The thong tin tram dang ghep doi */}
            <div
              style={{
                padding: '10px 14px',
                background: 'white',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Đang kết nối tới:</span>{' '}
                <strong style={{ color: '#1e40af' }}>
                  {sessionState?.stationName || 'Trạm quét quầy 1'}
                </strong>
              </div>
              <span style={{ color: '#64748b', fontSize: '11px' }}>
                Mã: <strong>{sessionToken}</strong>
              </span>
            </div>

            {/* Nhap companion quet camera */}
            <MobileScanCompanion
              sessionToken={sessionToken}
              stationInfo={sessionState}
              onScanSuccess={(item) => {
                console.log('Quét mã thành công:', item)
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
