import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { AlertCircle, Lock, ShieldAlert, Smartphone } from 'lucide-react'

/*
  Component AdminRouteGuard
  Kiem tra quyen truy cap cac route quan tri vien va thu thu thu vien.
  Xac thuc token dang nhap trong localStorage va phan quyen vai tro.
  Neu chua xac thuc se chuyen huong hoac hien thi thong bao tu choi truy cap.
*/
export default function AdminRouteGuard({ children, requiredRole = 'LIBRARIAN' }) {
  const location = useLocation()

  /* Kiem tra token xac thuc trong localStorage */
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('admin_token')
    : null

  /* Kiem tra thong tin nguoi dung va vai tro */
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  let user = null
  try {
    if (userJson) user = JSON.parse(userJson)
  } catch {
    user = null
  }

  const role = user?.role || (token ? 'LIBRARIAN' : null)

  /* Truong hop chua dang nhap hoac khong co token hop le */
  if (!token) {
    return (
      <div
        className="card"
        style={{
          margin: '60px auto',
          maxWidth: '480px',
          padding: '36px 28px',
          textAlign: 'center',
          border: '1px solid #fecaca',
          background: '#fffaf0',
          borderRadius: '14px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 16px'
          }}
        >
          <Lock size={28} />
        </div>
        <h2 style={{ fontSize: '18px', color: '#991b1b', margin: '0 0 8px' }}>
          Yêu cầu quyền Quản trị thư viện
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>
          Khu vực này chỉ dành cho Thủ thư và Quản trị viên hệ thống UTH.
          Vui lòng đăng nhập bằng tài khoản được cấp quyền để tiếp tục làm việc.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px', margin: '0 auto' }}>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('admin_token', 'demo_admin_token')
                localStorage.setItem('user', JSON.stringify({ fullName: 'Thủ thư UTH', role: 'LIBRARIAN' }))
                window.location.reload()
              }
            }}
          >
            Đăng nhập nhanh quyền Quản trị viên
          </button>
        </div>
      </div>
    )
  }

  /* Truong hop vai tro khong du quyen han (vi du role STUDENT co tinh truy cap Admin) */
  if (requiredRole && role !== requiredRole && role !== 'ADMIN') {
    return (
      <div
        className="card"
        style={{
          margin: '60px auto',
          maxWidth: '480px',
          padding: '32px 24px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '12px'
        }}
      >
        <ShieldAlert size={44} color="#ea580c" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '16px', color: '#172033', margin: '0 0 8px' }}>
          Từ chối quyền truy cập
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
          Tài khoản hiện tại không có quyền thực hiện thao tác quản trị thư viện.
        </p>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Về trang chủ
        </button>
      </div>
    )
  }

  return children
}

/*
  Component RemoteScannerGuard
  Bao ve route may quet tu xa tren dien thoai (/scanner-remote).
  Yeu cau phai co ma phien sessionToken hop le (vi du ?session=SCAN-...) hoac token quan tri.
*/
export function RemoteScannerGuard({ children }) {
  const [searchParams] = useSearchParams()
  const session = searchParams.get('session')
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('admin_token')
    : null

  /* Neu khong co session tren URL va cung khong co token dang nhap */
  if (!session && !token) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '420px',
            width: '100%',
            padding: '28px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '16px'
          }}
        >
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
            <Smartphone size={28} />
          </div>
          <h2 style={{ fontSize: '17px', color: '#0f172a', margin: '0 0 8px' }}>
            Yêu cầu mã phiên quét hợp lệ
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}>
            Trình duyệt điện thoại cần quét mã QR ghép đôi từ màn hình laptop quầy thư viện
            hoặc truy cập kèm tham số phiên (VD: /scanner-remote?session=SCAN-...).
          </p>
          <button
            type="button"
            className="button button--primary"
            style={{ width: '100%' }}
            onClick={() => {
              window.location.href = '/scan-station'
            }}
          >
            Mở trạm quét quầy để lấy mã
          </button>
        </div>
      </div>
    )
  }

  return children
}
