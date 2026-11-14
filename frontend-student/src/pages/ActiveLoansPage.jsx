import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoansTableViewPC from '../components/responsive/LoansTableViewPC';
import ReturnQrModal from '../components/common/ReturnQrModal';
import { Compass, CheckCircle2, X } from 'lucide-react';

/**
 * ActiveLoansPage - Trang quản lý tài liệu đang mượn & Phiếu mượn cho Sinh viên UTH (Desktop Web - TV3)
 */
export default function ActiveLoansPage({ onNavigateCatalog, onShowToast }) {
  const navigate = useNavigate();
  const [qrModalOrder, setQrModalOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleShowToast = (msg) => {
    if (onShowToast) {
      onShowToast(msg);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  const handleContinueBorrowing = () => {
    if (onNavigateCatalog) {
      onNavigateCatalog();
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans animate-in fade-in duration-150">
      {/* Toast thông báo cục bộ nếu chưa có Toast toàn cục */}
      {toastMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200 select-none max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 text-white p-3.5 pl-4 pr-4 shadow-2xl shadow-slate-950/40 border border-slate-700/80 backdrop-blur-md ring-1 ring-white/10 flex items-center gap-3">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400" />
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 block">Thư viện UTH</span>
              <p className="text-xs sm:text-[13px] font-bold text-white leading-snug mt-0.5">{toastMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg('')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* HERO BANNER - NỀN UTH ACADEMIC TEAL ĐẶC TRƯNG CHO HỒ SƠ MƯỢN SÁCH & GIA HẠN */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-teal-800/40 bg-gradient-to-r from-[#00383b] via-[#004e53] to-[#00282b] text-white p-6 sm:p-8 lg:p-10">
        {/* Họa tiết ánh sáng & hình học học thuật tinh tế */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden="true"
        />

        <div className="relative z-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold w-fit backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cổng Dịch Vụ Mượn Trả Trực Tuyến · Thư Viện UTH</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white leading-tight">
              Hồ Sơ Mượn Sách & Gia Hạn
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
              Quản lý chi tiết hạn hoàn trả các giáo trình đang giữ, gia hạn trực tuyến thêm 7 ngày (BR03) và nhận sách tại quầy Pick & Go.
            </p>

            <div className="flex items-center gap-4 pt-1 text-xs text-teal-200/90 flex-wrap font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                Thời hạn mượn: 14 ngày (BR02)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                Gia hạn online: 1 lần (+7 ngày) (BR03)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                Liên thông 3 cơ sở trường UTH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={handleContinueBorrowing}
              className="px-4 py-2.5 bg-white text-[#00666B] hover:bg-teal-50 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              <span>Tiếp tục tìm mượn sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung bảng quản lý mượn & Hồ sơ tài liệu Desktop */}
      <LoansTableViewPC
        onOpenQrModal={(order) => setQrModalOrder(order)}
        onShowToast={handleShowToast}
      />

      {/* Modal hiển thị mã QR tiếp nhận tại quầy (Pick & Go) */}
      <ReturnQrModal
        isOpen={Boolean(qrModalOrder)}
        onClose={() => setQrModalOrder(null)}
        order={qrModalOrder}
      />
    </div>
  );
}
