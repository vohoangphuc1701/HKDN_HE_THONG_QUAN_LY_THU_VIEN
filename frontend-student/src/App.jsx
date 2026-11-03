import React, { useState } from 'react';
import BottomNavMobile from './components/layout/BottomNavMobile';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const tabDescriptions = {
    home: 'Trang chủ - Danh sách sách nổi bật & banner sự kiện thư viện UTH',
    search: 'Tìm kiếm - Tra cứu tài liệu theo môn học, chuyên ngành, tên tác giả',
    loans: 'Đang mượn - Quản lý 2 cuốn sách đang mượn, hạn trả & mã QR nhận sách',
    history: 'Lịch sử - Lịch sử các lần mượn, trả sách & tra cứu tiền phạt quá hạn',
    profile: 'Cá nhân - Thông tin sinh viên, thẻ thư viện điện tử & cài đặt'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-20">
      {/* Top Header Mobile */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Thư viện UTH</h1>
            <p className="text-[11px] text-slate-500">Cổng Sinh Viên (Mobile)</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold rounded-full border border-sky-100">
          TV2 - Tuần 2
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">
            📱
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              BottomNavMobile Component
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thanh điều hướng 5 nút ngón cái + Drawer menu trượt
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5">
            <div className="text-xs font-semibold text-slate-600">Tab đang kích hoạt:</div>
            <div className="text-sm font-bold text-sky-700 uppercase tracking-wide">
              {activeTab}
            </div>
            <p className="text-xs text-slate-500">
              {tabDescriptions[activeTab]}
            </p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <span>✓</span> Tuần 2 - Buổi 2 hoàn thành
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">
              • 5 nút ngón cái cố định chân trang (Trang chủ, Tìm sách, Đang mượn, Lịch sử, Cá nhân)<br />
              • Badge thông báo số lượng sách đang mượn<br />
              • Drawer trượt từ dưới lên khi bấm "Cá nhân"
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavMobile
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeLoanCount={2}
      />
    </div>
  );
}
