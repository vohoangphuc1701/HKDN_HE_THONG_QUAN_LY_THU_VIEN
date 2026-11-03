import React, { useState } from 'react';
import BottomNavMobile from './components/layout/BottomNavMobile';

/**
 * App.jsx - Phân hệ Sinh viên trên Thiết bị Di động (Mobile Web)
 * Phụ trách: Thành viên 2 (TV2 - Mobile)
 * Nhánh làm việc: feature/tv2-mobile
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const tabLabels = {
    home: 'Trang chủ',
    search: 'Danh mục sách',
    loans: 'Phiếu mượn',
    history: 'Lịch sử',
    profile: 'Tài khoản'
  };

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
      {/* ==================== TOPBAR MOBILE (CHUẨN TONE MÀU FIGMA #00666b) ==================== */}
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg">
            📖
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight flex items-center gap-1.5">
              Thư viện <span className="text-[10px] text-teal-200 px-1 py-0.2 bg-white/15 rounded">UTH</span>
            </h1>
            <p className="text-[10px] text-teal-100/80">Cổng Sinh Viên (Mobile)</p>
          </div>
        </div>

        {/* Cụm tiện ích Mobile: Giỏ sách & Avatar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Giỏ sách"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-amber-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          <div className="w-8 h-8 rounded-full bg-teal-800 border border-teal-300/40 text-teal-100 flex items-center justify-center text-xs font-bold shadow-sm">
            NL
          </div>
        </div>
      </header>

      {/* ==================== VÙNG NỘI DUNG MOBILE TEST ==================== */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full pb-24">
        {/* Banner giới thiệu */}
        <div className="bg-white rounded-2xl border border-[#d1e5e0] shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#00666b] uppercase tracking-wider bg-[#eaf3f0] px-2.5 py-0.5 rounded-full">
              TV2 — Phân hệ Mobile Web
            </span>
            <span className="text-xs text-slate-400 font-medium">Tuần 2 - Buổi 2</span>
          </div>

          <h2 className="text-base font-bold text-slate-900 mb-1">
            BottomNavMobile Component
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thanh điều hướng cố định chân trang tối ưu thao tác ngón cái trên di động, đồng bộ tone màu xanh mòng két <strong className="text-[#00666b]">#00666b</strong> từ thiết kế Figma.
          </p>

          <div className="mt-3 p-3 bg-[#f4f8f7] rounded-xl border border-[#d1e5e0]/60 flex items-center justify-between">
            <div className="text-xs text-slate-600">Tab hiện tại:</div>
            <div className="text-xs font-bold text-[#00666b] bg-white px-2 py-1 rounded-md border border-[#d1e5e0]">
              {tabLabels[activeTab]} ({activeTab})
            </div>
          </div>
        </div>

        {/* Hướng dẫn thao tác */}
        <div className="bg-[#eaf3f0] border border-[#d1e5e0] rounded-2xl p-4 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-[#00666b] flex items-center gap-1.5">
            <span>💡</span> Tính năng kiểm thử:
          </div>
          <div>• Bấm vào các nút ở đáy màn hình để chuyển tab.</div>
          <div>• Bấm nút <strong>"Tài khoản"</strong> để mở ngăn Drawer trượt từ dưới lên xem thông tin sinh viên Nguyễn Thành Lâm.</div>
        </div>
      </main>

      {/* ==================== THANH MENU CỐ ĐỊNH CHÂN TRANG MOBILE ==================== */}
      <BottomNavMobile
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeLoanCount={2}
      />
    </div>
  );
}
