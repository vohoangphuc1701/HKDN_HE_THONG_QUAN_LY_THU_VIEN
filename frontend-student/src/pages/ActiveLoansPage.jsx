import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoansTableViewPC from '../components/responsive/LoansTableViewPC';
import ReturnQrModal from '../components/common/ReturnQrModal';
import { Compass, ShieldCheck } from 'lucide-react';

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
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
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
