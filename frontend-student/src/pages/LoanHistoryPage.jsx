import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  MapPin,
  Receipt,
  RotateCcw,
  Search,
  X,
  XCircle,
} from 'lucide-react';

/**
 * LoanHistoryPage - Trang Lịch sử mượn trả & Đối soát tiền phạt cho Mobile/Tablet (TV2)
 * Đồng bộ quy tắc nghiệp vụ UTH (BR02 14 ngày, BR04 phạt 5.000đ/ngày) và bảng màu #00666b.
 */
const INITIAL_HISTORY = [
  {
    id: 'H-01',
    orderCode: 'PM-UTH-2026-061',
    title: 'Giải tích 1 - Giáo trình Đại học GTVT',
    code: 'CB-GT1-012',
    author: 'TS. Đặng Văn Minh',
    category: 'CƠ BẢN',
    borrowDate: '10/10/2026',
    dueDate: '24/10/2026',
    actualReturnDate: '23/10/2026',
    campus: 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'ON_TIME', // ON_TIME | LATE | CANCELLED
    note: 'Tình trạng sách nguyên vẹn khi trả tại quầy Pick & Go.',
  },
  {
    id: 'H-02',
    orderCode: 'PM-UTH-2026-048',
    title: 'Cơ sở dữ liệu phân tán & SQL Server',
    code: 'CNTT-DB-009',
    author: 'ThS. Hoàng Anh Tuấn',
    category: 'CÔNG NGHỆ THÔNG TIN',
    borrowDate: '22/09/2026',
    dueDate: '06/10/2026',
    actualReturnDate: '09/10/2026',
    campus: 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
    overdueDays: 3,
    fineAmount: 15000, // 3 ngày * 5.000đ (BR04)
    finePaid: true,
    paymentMethod: 'Chuyển khoản QR',
    status: 'LATE',
    note: 'Trễ 3 ngày theo quy định BR04 (5.000đ/ngày), đã hoàn tất đối soát.',
  },
  {
    id: 'H-03',
    orderCode: 'PM-UTH-2026-035',
    title: 'Vận tải đa phương thức và Cảng biển',
    code: 'LG-VT-015',
    author: 'PGS.TS Nguyễn Hữu Phước',
    category: 'LOGISTICS',
    borrowDate: '05/09/2026',
    dueDate: '19/09/2026',
    actualReturnDate: '18/09/2026',
    campus: 'Cơ sở 2 - Thủ Đức',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'ON_TIME',
    note: 'Trả đúng hạn tại quầy tiếp nhận Cơ sở 2.',
  },
  {
    id: 'H-04',
    orderCode: 'DH-UTH-2026-029',
    title: 'Kinh tế vận tải biển quốc tế',
    code: 'KT-VTB-007',
    author: 'TS. Vũ Thị Lan',
    category: 'KINH TẾ',
    borrowDate: '28/08/2026',
    dueDate: '—',
    actualReturnDate: '—',
    campus: 'Cơ sở 3 - Quận 12',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'CANCELLED',
    note: 'Sinh viên hủy đơn đặt trước giờ hẹn lấy tại quầy.',
  },
];

const HISTORY_FILTERS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'ON_TIME', label: 'Đúng hạn' },
  { id: 'LATE', label: 'Trả trễ' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

const HISTORY_BADGE_MAP = {
  ON_TIME: {
    label: 'Trả đúng hạn',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  LATE: {
    label: 'Trả trễ hạn',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: 'Đã hủy đơn',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
  },
};

export default function LoanHistoryPage({ onBorrowAgain, onShowToast }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const summary = useMemo(() => {
    const total = INITIAL_HISTORY.length;
    const onTime = INITIAL_HISTORY.filter((h) => h.status === 'ON_TIME').length;
    const late = INITIAL_HISTORY.filter((h) => h.status === 'LATE').length;
    const totalFine = INITIAL_HISTORY.reduce((sum, h) => sum + (h.fineAmount || 0), 0);
    return { total, onTime, late, totalFine };
  }, []);

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return INITIAL_HISTORY.filter((item) => {
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.orderCode.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });
  }, [statusFilter, searchQuery]);

  const handleBorrowAgain = (item) => {
    if (onBorrowAgain) {
      onBorrowAgain({
        id: item.code,
        title: item.title,
        author: item.author,
        category: item.category,
      });
      return;
    }
    if (onShowToast) {
      onShowToast(`Đã thêm "${item.title}" vào giỏ mượn!`);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Header giới thiệu */}
      <div className="rounded-2xl bg-gradient-to-r from-[#00383b] via-[#005458] to-[#00666b] text-white p-4 shadow-sm border border-teal-700/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-200 mb-1">
              <History className="w-3.5 h-3.5" />
              <span>Nhật ký giao dịch thư viện UTH</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold">Lịch sử mượn trả &amp; Đối soát phạt</h2>
            <p className="text-[11px] text-teal-100/90 mt-0.5">
              Minh bạch công thức phạt trễ hạn 5.000đ/ngày/cuốn theo quy định BR04.
            </p>
          </div>
        </div>
      </div>

      {/* Thống kê tổng quan 2x2 trên Mobile, 4 cột trên Tablet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Tổng lượt giao dịch</span>
          <strong className="text-lg font-black text-slate-900 tabular-nums mt-1 block">
            {summary.total}
          </strong>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Trả đúng hạn</span>
          <strong className="text-lg font-black text-emerald-600 tabular-nums mt-1 block">
            {summary.onTime}
          </strong>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Lượt trả trễ</span>
          <strong className="text-lg font-black text-amber-600 tabular-nums mt-1 block">
            {summary.late}
          </strong>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Tổng phạt đã nộp</span>
          <strong className="text-base sm:text-lg font-black text-[#00666b] tabular-nums mt-1 block truncate">
            {summary.totalFine.toLocaleString('vi-VN')}đ
          </strong>
        </div>
      </div>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả, mã đơn..."
            className="w-full bg-white text-slate-800 placeholder-slate-400 pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00666b] shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {HISTORY_FILTERS.map((filter) => {
            const count =
              filter.id === 'ALL'
                ? INITIAL_HISTORY.length
                : INITIAL_HISTORY.filter((h) => h.status === filter.id).length;
            const isActive = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#00666b] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách thẻ lịch sử (1 cột Mobile, 2 cột Tablet) */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Chưa có bản ghi lịch sử phù hợp.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#00666b] underline cursor-pointer"
          >
            Hiển thị tất cả lịch sử
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredHistory.map((item) => {
            const badge = HISTORY_BADGE_MAP[item.status] || HISTORY_BADGE_MAP.ON_TIME;
            const BadgeIcon = badge.icon;

            return (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#00666b] truncate">
                    {item.orderCode}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${badge.badgeClass}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {item.author} • <span className="font-mono">{item.code}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#00666b] shrink-0" />
                    <span className="truncate">{item.campus}</span>
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Ngày mượn
                    </span>
                    <strong className="text-slate-700 block mt-0.5">{item.borrowDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hạn trả
                    </span>
                    <strong className="text-slate-700 block mt-0.5">{item.dueDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Thực tế trả</span>
                    <strong className="text-slate-800 block mt-0.5">{item.actualReturnDate}</strong>
                  </div>
                </div>

                {/* Khối đối soát tiền phạt */}
                <div
                  className={`rounded-xl p-2.5 border text-[11px] flex items-center justify-between gap-2 ${
                    item.fineAmount > 0
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Receipt className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {item.fineAmount > 0
                        ? `Trễ ${item.overdueDays} ngày (${item.paymentMethod || 'Đã nộp'})`
                        : 'Phí phạt: 0 VNĐ'}
                    </span>
                  </div>
                  <strong className="font-bold shrink-0">
                    {item.fineAmount.toLocaleString('vi-VN')} VNĐ
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="text-[10px] text-slate-400 line-clamp-1 flex-1">{item.note}</p>
                  <button
                    type="button"
                    onClick={() => handleBorrowAgain(item)}
                    className="shrink-0 min-h-[38px] px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00666b] border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Mượn lại</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

