import React, { useState } from 'react';

/**
 * BottomNavMobile - Thanh điều hướng cố định chân trang cho Mobile Web
 * Phụ trách: Thành viên 2 (TV2 - Mobile)
 * Đáp ứng đặc tả:
 * - 5 nút bấm ngón cái: Trang chủ, Tìm kiếm, Đang mượn, Lịch sử, Cá nhân
 * - Badge cảnh báo số lượng sách đang mượn
 * - Ngăn menu trượt Drawer (Slide-over drawer) cho thông tin cá nhân & lối tắt
 * - Tự động ẩn trên màn hình lớn (md:hidden) để nhường không gian cho NavbarPC của TV3
 */
export default function BottomNavMobile({
  activeTab = 'home',
  onTabChange,
  activeLoanCount = 2, 
  hasOverdueWarning = false, 
  user = {
    name: 'Nguyễn Văn A',
    studentId: '2151050001',
    email: '2151050001@ut.edu.vn',
    major: 'Công nghệ thông tin',
    cardStatus: 'Hoạt động'
  }
}) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
    if (tabId === 'profile') {
      setIsDrawerOpen(true);
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
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
      label: 'Tìm sách',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    },
    {
      id: 'loans',
      label: 'Đang mượn',
      badge: activeLoanCount,
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
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
          className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
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
      label: 'Cá nhân',
      icon: (active) => (
        <svg
          className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
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
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden transition-all duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`group relative flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 select-none ${
                  isActive
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {/* Thanh chỉ báo active ở mép trên tab */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-sky-600 rounded-b-full transition-all duration-200" />
                )}

                {/* Khối Icon + Badge */}
                <div className="relative flex items-center justify-center">
                  {item.icon(isActive)}

                  {/* Badge số lượng sách đang mượn */}
                  {item.badge > 0 && (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
                        hasOverdueWarning ? 'bg-rose-500 animate-pulse' : 'bg-sky-600'
                      }`}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Nhãn chữ dưới icon */}
                <span
                  className={`text-[11px] mt-1 leading-none transition-colors ${
                    isActive ? 'text-sky-600 font-medium' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==================== 2. NGĂN MENU TRƯỢT DRAWER (CÁ NHÂN) ==================== */}
      {/* Lớp nền mờ Backdrop */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Drawer trượt từ dưới lên (Bottom Sheet) hoặc trượt từ phải */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 flex flex-col md:hidden transform transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        {/* Nút thanh trượt kéo nhỏ ở đỉnh drawer */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3" />

        {/* Header Drawer */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Tài khoản Sinh viên</h2>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Đóng menu"
          >
            ✕
          </button>
        </div>

        {/* Nội dung bên trong Drawer */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Card thông tin sinh viên */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">{user.name}</h3>
              <p className="text-xs text-slate-500">MSSV: {user.studentId}</p>
              <p className="text-[11px] text-sky-700 truncate">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full self-start">
              {user.cardStatus}
            </span>
          </div>

          {/* Nhóm lối tắt thao tác nhanh */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Lối tắt & Tiện ích
            </p>

            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                handleTabClick('loans');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-semibold">
                  📖
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-700">Sách đang mượn & Phiếu QR</div>
                  <div className="text-xs text-slate-400">Xem hạn trả, gia hạn online</div>
                </div>
              </div>
              <span className="text-slate-400">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                handleTabClick('history');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                  🕒
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-700">Lịch sử mượn & Tiền phạt</div>
                  <div className="text-xs text-slate-400">Tra cứu phí phạt trễ hạn</div>
                </div>
              </div>
              <span className="text-slate-400">›</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-semibold">
                  📜
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-700">Nội quy & Hướng dẫn mượn sách</div>
                  <div className="text-xs text-slate-400">Quy định hẹn lấy sách dưới 30s</div>
                </div>
              </div>
              <span className="text-slate-400">›</span>
            </button>
          </div>

          {/* Nút Đăng xuất */}
          <div className="pt-2">
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất khỏi Cổng Thư Viện
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
