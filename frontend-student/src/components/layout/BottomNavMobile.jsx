import React, { useState } from 'react';

/**
 * BottomNavMobile - Thanh điều hướng cố định chân trang cho Mobile Web
 * Đồng bộ màu sắc & thành phần theo bản thiết kế Figma FE-PC:
 * - Tone màu chủ đạo: Xanh mòng két #00666b (uth-primary)
 * - 5 nút ngón cái: Trang chủ, Danh mục, Phiếu mượn, Lịch sử, Tài khoản
 * - Ngăn menu trượt Drawer tài khoản sinh viên "Nguyễn Thành Lâm"
 * - Hoạt động trơn tru cả trên thiết bị di động thật và chế độ xem trên PC/Laptop
 */
export default function BottomNavMobile({
  activeTab = 'home',
  onTabChange,
  activeLoanCount = 2,
  hasOverdueWarning = false,
  isDrawerOpen: controlledDrawerOpen,
  onDrawerOpen,
  onDrawerClose,
  user = {
    name: 'Nguyễn Thành Lâm',
    studentId: '2151050123',
    email: 'lam.nt@ut.edu.vn',
    major: 'Công nghệ thông tin',
    cardStatus: 'Đang hoạt động'
  }
}) {
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  
  // Hỗ trợ cả điều khiển từ bên ngoài (controlled) và state nội bộ (uncontrolled)
  const isDrawerOpen = controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;

  const openDrawer = () => {
    if (onDrawerOpen) onDrawerOpen();
    setInternalDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (onDrawerClose) onDrawerClose();
    setInternalDrawerOpen(false);
  };

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    // Khi bấm vào tab Tài khoản (hoặc profile) -> mở Drawer
    if (tabId === 'profile') {
      openDrawer();
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.4' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      id: 'search',
      label: 'Danh mục',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.4' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="7" height="7" x="3" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="14" rx="1.5" />
          <rect width="7" height="7" x="3" y="14" rx="1.5" />
        </svg>
      )
    },
    {
      id: 'loans',
      label: 'Phiếu mượn',
      badge: activeLoanCount,
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.4' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      )
    },
    {
      id: 'history',
      label: 'Lịch sử',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.4' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Tài khoản',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.4' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* ==================== 1. THANH ĐIỀU HƯỚNG CỐ ĐỊNH CHÂN TRANG ==================== */}
      <nav
        aria-label="Thanh điều hướng di động"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] transition-all duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`group relative flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 select-none cursor-pointer ${
                  isActive
                    ? 'text-[#00666b] font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {/* Thanh chỉ báo active ở mép trên tab */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-[#00666b] rounded-b-full transition-all duration-200 shadow-sm" />
                )}

                {/* Khối Icon + Badge */}
                <div className="relative flex items-center justify-center">
                  {item.icon(isActive)}

                  {/* Badge số lượng sách mượn */}
                  {item.badge > 0 && (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
                        hasOverdueWarning ? 'bg-rose-500 animate-pulse' : 'bg-[#00666b]'
                      }`}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Nhãn chữ dưới icon */}
                <span
                  className={`text-[11px] mt-1 leading-none transition-colors ${
                    isActive ? 'text-[#00666b] font-semibold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==================== 2. NGĂN MENU TRƯỢT DRAWER (TÀI KHOẢN) ==================== */}
      {/* Lớp nền Backdrop mờ */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isDrawerOpen}
      />

      {/* Khung Drawer trượt từ dưới lên (Bottom Sheet) */}
      <aside
        aria-label="Thông tin tài khoản sinh viên"
        className={`fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto max-h-[85vh] bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 flex flex-col transform transition-all duration-300 ease-out ${
          isDrawerOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      >
        {/* Handle kéo nhỏ ở đỉnh */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 cursor-pointer" onClick={closeDrawer} />

        {/* Header Drawer */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00666b]" />
            <h2 className="text-base font-bold text-slate-800">Tài khoản Thư viện</h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all text-sm font-bold cursor-pointer"
            aria-label="Đóng ngăn tài khoản"
          >
            ✕
          </button>
        </div>

        {/* Nội dung sinh viên (Nguyễn Thành Lâm theo thiết kế Figma) */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Card hồ sơ */}
          <div className="flex items-center gap-3 p-3.5 bg-[#eaf3f0] border border-[#d1e5e0] rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#00666b] text-white flex items-center justify-center font-bold text-base shadow-sm">
              NL
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{user.name}</h3>
              <p className="text-xs text-slate-600">MSSV: {user.studentId}</p>
              <p className="text-[11px] text-[#00666b] font-medium truncate">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#00666b]/10 text-[#00666b] rounded-full self-start">
              {user.cardStatus}
            </span>
          </div>

          {/* Lối tắt quản lý mượn trả */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Quản lý mượn trả sách
            </p>

            <button
              type="button"
              onClick={() => {
                closeDrawer();
                handleTabClick('loans');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#eaf3f0] text-[#00666b] flex items-center justify-center text-sm font-semibold">
                  📋
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-800">Phiếu mượn của bạn</div>
                  <div className="text-xs text-slate-500">Xem hạn trả, gia hạn online & QR nhận sách</div>
                </div>
              </div>
              <span className="text-slate-400 font-bold">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                closeDrawer();
                handleTabClick('history');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-semibold">
                  🕒
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-800">Lịch sử mượn & Tiền phạt</div>
                  <div className="text-xs text-slate-500">Tra cứu phí phạt trễ hạn minh bạch 100%</div>
                </div>
              </div>
              <span className="text-slate-400 font-bold">›</span>
            </button>

            <button
              type="button"
              onClick={closeDrawer}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-semibold">
                  📜
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-800">Nội quy & Hướng dẫn</div>
                  <div className="text-xs text-slate-500">Quy định hẹn lấy sách quầy &lt; 30 giây</div>
                </div>
              </div>
              <span className="text-slate-400 font-bold">›</span>
            </button>
          </div>

          {/* Đăng xuất */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => alert('Đã đăng xuất')}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
