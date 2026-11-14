import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  Menu,
  Search,
} from 'lucide-react'
import Sidebar from './Sidebar'

const pageTitles = {
  '/dashboard': 'Tổng quan thư viện',
  '/inventory': 'Quản lý kho sách',
  '/orders': 'Quản lý đơn mượn',
  '/scan-station': 'Trạm quét tại quầy',
  '/fines': 'Quản lý tiền phạt',
  '/audit-logs': 'Nhật ký hoạt động',
}

/**
 * Khung bố cục chính cho trang Admin / Thủ thư.
 * Bao gồm Sidebar bên trái, thanh topbar và vùng nội dung chính.
 *
 * @author TV6
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Quản trị thư viện'
  const currentDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="admin-shell">
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <header className="topbar">
          <div className="topbar__title">
            <button className="icon-button menu-button" aria-label="Mở menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
            <div><h1>{title}</h1><p>{currentDate}</p></div>
          </div>
          <div className="topbar__actions">
            <label className="search-box">
              <Search size={17} />
              <span className="sr-only">Tìm kiếm</span>
              <input type="search" placeholder="Tìm sách, đơn mượn..." />
            </label>
            <button className="icon-button notification-button" aria-label="Thông báo"><Bell size={20} /><span aria-hidden="true" /></button>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
