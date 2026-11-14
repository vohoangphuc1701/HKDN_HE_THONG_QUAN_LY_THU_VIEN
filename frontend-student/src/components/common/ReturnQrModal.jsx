import React from 'react';
import { X, QrCode, CheckCircle2, Clock, MapPin, BookOpen, AlertCircle, Download, Printer } from 'lucide-react';

/**
 * ReturnQrModal - Modal hiển thị mã QR Đơn mượn sách hoặc Phiếu hẹn trả sách
 * Dành cho sinh viên quét nhận tài liệu nhanh chóng tại quầy tiếp nhận UTH.
 */
export default function ReturnQrModal({ isOpen = false, onClose, order = null }) {
  if (!isOpen || !order) return null;

  const orderCode = order.code || 'DH-UTH-2026-089';
  const campus = order.campus || 'Cơ sở 1 - Võ Oanh (Bình Thạnh)';
  const pickupDate = order.pickupDate || 'Hôm nay - Trong giờ hành chính';
  const books = order.books || [
    { title: 'Lập trình Python cơ bản', code: 'CNTT-PY-001' },
    { title: 'Kinh tế học vi mô', code: 'KT-VM-002' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00363a] to-[#00666B] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Mã QR Tiếp Nhận Tại Quầy</h3>
              <p className="text-[11px] text-teal-100/80">Thư viện Đại học GTVT TP.HCM (UTH)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-6 space-y-5 text-center">
          {/* Trạng thái đơn */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đơn sách sẵn sàng lấy (Pick & Go)</span>
          </div>

          {/* Vùng Mã QR Độ tương phản cao */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 inline-block mx-auto shadow-inner">
            <div className="w-48 h-48 bg-white p-3 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center relative shadow-sm">
              {/* SVG QR Code minh họa chuẩn mực với logo UTH ở trung tâm */}
              <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                {/* 3 góc định vị chuẩn QR */}
                <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
                <rect x="12" y="12" width="14" height="14" />
                <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
                <rect x="74" y="12" width="14" height="14" />
                <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
                <rect x="12" y="74" width="14" height="14" />

                {/* Dữ liệu pixel ma trận QR */}
                <rect x="38" y="10" width="8" height="8" />
                <rect x="50" y="8" width="6" height="6" />
                <rect x="10" y="38" width="8" height="8" />
                <rect x="22" y="45" width="6" height="6" />
                <rect x="42" y="42" width="16" height="16" fill="#00666B" />
                <rect x="65" y="38" width="8" height="8" />
                <rect x="80" y="48" width="6" height="6" />
                <rect x="38" y="65" width="8" height="8" />
                <rect x="52" y="70" width="8" height="8" />
                <rect x="70" y="65" width="10" height="8" />
                <rect x="85" y="80" width="8" height="8" />
                <rect x="48" y="85" width="6" height="6" />
              </svg>
              <span className="absolute bottom-1 bg-white/95 px-2 text-[9px] font-mono font-bold tracking-wider text-slate-800 border border-slate-200 rounded">
                {orderCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Mã giao dịch: <strong className="text-[#00666B]">{orderCode}</strong>
            </p>
          </div>

          {/* Chi tiết đơn */}
          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block text-[11px]">Điểm hẹn nhận sách:</span>
                <strong className="text-slate-900 font-bold block">{campus}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
              <Clock className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block text-[11px]">Thời gian hẹn lấy:</span>
                <strong className="text-slate-900 font-bold block">{pickupDate}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
              <BookOpen className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-slate-500 block text-[11px]">Tài liệu trong đơn ({books.length}):</span>
                <ul className="mt-1 space-y-1">
                  {books.map((b, idx) => (
                    <li key={idx} className="font-semibold text-slate-800 truncate">
                      • {b.title} <span className="text-[10px] text-slate-400 font-mono font-normal">({b.code || `BK-${idx+1}`})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Hướng dẫn quầy */}
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-[11px] text-teal-900 text-left">
            <strong className="block text-[#00666B] mb-0.5">💡 Lưu ý tại quầy:</strong>
            Mở mã QR này trên điện thoại khi tới quầy. Thủ thư sẽ quét mã để bàn giao tài liệu cho bạn nhanh chóng!
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#00666B] hover:bg-[#005458] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

