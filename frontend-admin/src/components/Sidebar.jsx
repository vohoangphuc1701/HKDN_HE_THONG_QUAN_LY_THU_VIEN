import { NavLink } from 'react-router-dom'
import {
  BookOpen,
  Boxes,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  QrCode,
  ReceiptText,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/inventory', label: 'Kho sách', icon: Boxes },
  { to: '/orders', label: 'Luồng đơn', icon: ClipboardList },
  { to: '/scan-station', label: 'Trạm quét QR', icon: QrCode },
  { to: '/fines', label: 'Tiền phạt', icon: ReceiptText },
  { to: '/audit-logs', label: 'Nhật ký', icon: FileClock },
]

/**
 * Thanh điều hướng bên trái dành cho thủ thư / admin.
 * Hiển thị logo, menu chức năng và thông tin người dùng.
 *
 * @author TV6
 */
export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="brand">
        <span className="brand__icon"><BookOpen size={23} /></span>
        <div><strong>UTH Library</strong><span>Admin Portal</span></div>
        <button className="icon-button sidebar__close" aria-label="Đóng menu" onClick={onClose}><X size={20} /></button>
      </div>

      <nav className="sidebar__nav" aria-label="Điều hướng quản trị">
        <span className="sidebar__label">QUẢN LÝ</span>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__profile">
        <span className="avatar">LH</span>
        <div><strong>Linh Hoàng</strong><span>Thủ thư</span></div>
      </div>
    </aside>
  )
}
