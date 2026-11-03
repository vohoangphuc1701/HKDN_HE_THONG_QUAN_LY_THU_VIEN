import React, { useState } from 'react';
import BottomNavMobile from './components/layout/BottomNavMobile';

/**
 * App.jsx - Phân hệ Sinh viên trên Thiết bị Di động (Mobile Web)
 * Phụ trách: Thành viên 2 (TV2 - Mobile)
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
      {/* ==================== TOPBAR MOBILE ==================== */}
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner">
            📖
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight flex items-center gap-1.5">
              Thư viện <span className="text-[10px] text-teal-200 px-1 py-0.2 bg-white/15 rounded">UTH</span>
            </h1>
            <p className="text-[10px] text-teal-100/80">Cổng Sinh Viên (Mobile)</p>
          </div>
        </div>

        {/* Tiện ích: Giỏ sách & Avatar sinh viên */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Giỏ sách"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-amber-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center shadow">
              2
            </span>
          </button>

          {/* Bấm vào avatar trên header để mở Drawer tài khoản */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-teal-800 border border-teal-300/40 text-teal-100 flex items-center justify-center text-xs font-bold shadow-sm hover:ring-2 hover:ring-white transition-all cursor-pointer"
            title="Tài khoản sinh viên"
          >
            NL
          </button>
        </div>
      </header>

      {/* ==================== VÙNG NỘI DUNG CHÍNH (SẴN SÀNG CHO CÁC TRANG TIẾP THEO) ==================== */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full pb-20">
        {/* Nơi hiển thị các trang nghiệp vụ tiếp theo của TV2 (HomePage, BookListPage, v.v.) */}
      </main>

      {/* ==================== THANH ĐIỀU HƯỚNG CHÂN TRANG MOBILE ==================== */}
      <BottomNavMobile
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'profile') {
            setIsDrawerOpen(true);
          }
        }}
        isDrawerOpen={isDrawerOpen}
        onDrawerOpen={() => setIsDrawerOpen(true)}
        onDrawerClose={() => setIsDrawerOpen(false)}
        activeLoanCount={2}
      />
    </div>
  );
}
