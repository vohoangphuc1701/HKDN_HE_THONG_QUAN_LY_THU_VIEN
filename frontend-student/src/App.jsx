import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          📚
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Thư viện UTH - Mobile Web
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân hệ Sinh viên trên Thiết bị Di động
          </p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs font-semibold text-emerald-700">
            ✓ Tuần 1: Khởi tạo React & Cấu hình TailwindCSS thành công
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            Breakpoints: sm (640px) | Mobile-First UI Ready
          </p>
        </div>
      </div>
    </div>
  );
}
