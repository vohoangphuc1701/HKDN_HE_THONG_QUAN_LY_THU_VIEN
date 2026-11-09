import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  RotateCcw,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';

/**
 * LoansTableViewPC - Bảng quản lý hồ sơ tài liệu đang mượn & gia hạn trực tuyến cho Desktop
 * Tuân thủ đầy đủ các quy tắc nghiệp vụ BR01 - BR08.
 */
export default function LoansTableViewPC({ onOpenQrModal, onShowToast }) {
  // Dữ liệu mẫu danh sách sách đang mượn của sinh viên
  const [loans, setLoans] = useState([
    {
      id: 1,
      bookId: 101,
      title: 'Lập trình Python từ cơ bản đến nâng cao',
      code: 'CNTT-PY-001',
      author: 'TS. Nguyễn Văn A',
      category: 'CÔNG NGHỆ THÔNG TIN',
      borrowDate: '28/10/2026',
      dueDate: '11/11/2026',
      renewCount: 0,
      daysLeft: 8,
      status: 'NORMAL', // NORMAL | WARNING | OVERDUE
      campus: 'Cơ sở 1 (Võ Oanh)',
      coverBg: '#0f4c81',
    },
    {
      id: 2,
      bookId: 102,
      title: 'Kinh tế học vi mô ứng dụng',
      code: 'KT-VM-002',
      author: 'PGS.TS Trần Thị B',
      category: 'KINH TẾ',
      borrowDate: '25/10/2026',
      dueDate: '08/11/2026',
      renewCount: 1,
      daysLeft: 2,
      status: 'WARNING',
      campus: 'Cơ sở 1 (Võ Oanh)',
      coverBg: '#d97706',
    },
  ]);

  const [selectedBookIds, setSelectedBookIds] = useState([]);

  // Xử lý gia hạn trực tuyến (+7 ngày, tối đa 1 lần theo BR03)
  const handleRenew = (loanId) => {
    setLoans((prev) =>
      prev.map((item) => {
        if (item.id === loanId) {
          if (item.renewCount >= 1) {
            if (onShowToast) onShowToast('Cuốn sách này đã sử dụng hết 1 lần gia hạn trực tuyến!');
            return item;
          }
          if (onShowToast) {
            onShowToast(`Gia hạn thành công cuốn "${item.title}" thêm 7 ngày!`);
          }
          return {
            ...item,
            renewCount: 1,
            daysLeft: item.daysLeft + 7,
            dueDate: '18/11/2026',
            status: 'NORMAL',
          };
        }
        return item;
      })
    );
  };

  // Mở mã QR nhận sách / trả sách tại quầy
  const handleOpenPickupQr = () => {
    if (onOpenQrModal) {
      onOpenQrModal({
        code: 'DH-UTH-2026-089',
        campus: 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
        pickupDate: 'Hôm nay (Giờ làm việc 07:30 - 20:30)',
        books: loans,
        status: 'READY_FOR_PICKUP',
      });
    }
  };

  const toggleSelectBook = (id) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateReturnAppointment = () => {
    if (selectedBookIds.length === 0) {
      if (onShowToast) onShowToast('Vui lòng chọn ít nhất 1 cuốn sách để đặt lịch hẹn trả!');
      return;
    }
    const returningBooks = loans.filter((l) => selectedBookIds.includes(l.id));
    if (onOpenQrModal) {
      onOpenQrModal({
        code: `PT-UTH-2026-${Math.floor(100 + Math.random() * 900)}`,
        campus: 'Cơ sở 1 - Quầy trả sách Pick & Go',
        pickupDate: 'Hẹn trả: 10/11/2026 (Khung giờ: 14:00 - 16:30)',
        books: returningBooks,
        status: 'PENDING_VERIFICATION',
      });
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* 4 Thẻ KPI thống kê nhanh của Sinh viên */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Sách đang mượn</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-2xl font-black text-slate-900 font-heading">{loans.length}</strong>
              <span className="text-xs text-slate-400 font-bold">/ 5 cuốn</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Hạn mức BR01 hợp lệ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00666B] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Đơn chờ lấy quầy</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-2xl font-black text-[#00666B] font-heading">1</strong>
              <span className="text-xs text-slate-400 font-bold">đơn hẹn</span>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold">Giữ tối đa 48h (BR05)</span>
          </div>
          <button
            type="button"
            onClick={handleOpenPickupQr}
            className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Xem mã QR lấy sách"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Tiền phạt tồn đọng</span>
            <div className="flex items-baseline gap-1 mt-1">
              <strong className="text-2xl font-black text-slate-900 font-heading">0</strong>
              <span className="text-xs text-slate-400 font-bold">VNĐ</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Không có khoản nợ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Tài khoản thư viện</span>
            <strong className="text-base font-bold text-slate-900 block mt-1">Nguyễn Thành Lâm</strong>
            <span className="text-[10px] text-teal-700 font-semibold">MSSV: 2151050123</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            UTH
          </div>
        </div>
      </div>

      {/* Bảng chi tiết danh sách sách đang mượn */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Danh Sách Giáo Trình Đang Mượn</span>
              <span className="text-xs bg-[#e0eff0] text-[#00666B] px-2.5 py-0.5 rounded-full font-bold">
                {loans.length} cuốn
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn sách để tạo mã hẹn trả trực tuyến hoặc gia hạn thêm thời gian mượn.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCreateReturnAppointment}
              disabled={selectedBookIds.length === 0}
              className="px-3.5 py-2 bg-[#00666B] hover:bg-[#005458] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Tạo phiếu hẹn trả ({selectedBookIds.length})</span>
            </button>
            <button
              type="button"
              onClick={handleOpenPickupQr}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mã QR đơn mượn</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedBookIds.length === loans.length && loans.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBookIds(loans.map((l) => l.id));
                      } else {
                        setSelectedBookIds([]);
                      }
                    }}
                    className="rounded text-[#00666B] focus:ring-[#00666B] cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Thông tin tài liệu</th>
                <th className="p-3.5">Ngày mượn</th>
                <th className="p-3.5">Hạn trả</th>
                <th className="p-3.5">Thời hạn còn lại</th>
                <th className="p-3.5 text-center">Lượt gia hạn</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((loan) => {
                const isSelected = selectedBookIds.includes(loan.id);
                return (
                  <tr
                    key={loan.id}
                    className={`hover:bg-teal-50/30 transition-colors ${
                      isSelected ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectBook(loan.id)}
                        className="rounded text-[#00666B] focus:ring-[#00666B] cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: loan.coverBg }}
                          className="w-10 h-14 rounded shadow-2xs flex flex-col justify-between p-1 text-white shrink-0 relative overflow-hidden"
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-black/20" />
                          <span className="text-[6px] font-bold text-center pl-1">UTH</span>
                          <span className="text-[7px] font-black text-center line-clamp-2 px-0.5 leading-tight">
                            {loan.title}
                          </span>
                          <span className="text-[5px] text-center font-mono opacity-80">2024</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#00666B] uppercase block">
                            {loan.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                            {loan.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Tác giả: {loan.author} · <span className="font-mono text-slate-600">Mã: {loan.code}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {loan.borrowDate}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {loan.dueDate}
                    </td>
                    <td className="p-3.5">
                      {loan.daysLeft <= 3 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Còn {loan.daysLeft} ngày (Sắp hết hạn)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Còn {loan.daysLeft} ngày</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          loan.renewCount >= 1
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-teal-50 text-[#00666B] border border-teal-200'
                        }`}
                      >
                        {loan.renewCount}/1 lần
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        disabled={loan.renewCount >= 1}
                        onClick={() => handleRenew(loan.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          loan.renewCount >= 1
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-[#00666B] hover:bg-[#005458] text-white shadow-2xs'
                        }`}
                        title={loan.renewCount >= 1 ? 'Đã hết lượt gia hạn' : 'Gia hạn thêm 7 ngày'}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{loan.renewCount >= 1 ? 'Đã gia hạn' : 'Gia hạn (+7d)'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Thông tin chính sách thư viện */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p>
              • Theo quy định thư viện UTH (BR03), mỗi tài liệu được gia hạn tối đa <strong>1 lần (+7 ngày)</strong> khi còn sách khả dụng trong kho.
            </p>
            <p>
              • Phạt trễ hạn (BR04): <strong>5.000 VNĐ / ngày / cuốn</strong> tính tự động từ sau ngày hết hạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

