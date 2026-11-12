import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  MapPin,
  QrCode,
  RefreshCw,
  Search,
  UserCheck,
  X,
} from 'lucide-react';

/**
 * LoansCardListMobile - Danh sách tài liệu đang mượn & phiếu mượn dạng thẻ cho Mobile/Tablet (TV2)
 * Đồng bộ dữ liệu, quy tắc nghiệp vụ (BR01, BR02, BR03, BR04, BR06) và bảng màu #00666b với LoansTableViewPC (TV3).
 */
const INITIAL_LOANS = [
  {
    id: 1,
    bookId: 101,
    orderCode: 'PM-UTH-2026-089',
    title: 'Lập trình Python từ cơ bản đến nâng cao',
    code: 'CNTT-PY-001',
    author: 'TS. Nguyễn Văn A',
    category: 'CÔNG NGHỆ THÔNG TIN',
    publisher: 'NXB Đại học Quốc gia TP.HCM',
    publishYear: 2024,
    borrowDate: '28/10/2026',
    dueDate: '11/11/2026',
    totalDurationDays: 14,
    elapsedDays: 6,
    renewCount: 0,
    daysLeft: 8,
    status: 'NORMAL', // NORMAL | WARNING | OVERDUE
    campus: 'Cơ sở 1 (Số 2 Võ Oanh, P.25, Bình Thạnh)',
    shelfLocation: 'Khu CNTT · Kệ A2 - Tầng 3',
    callNumber: '681.31 CNTT 2024',
    coverBg: '#0f4c81',
    copyBarcode: 'UTH-BC-10101',
    librarian: 'Nguyễn Thị Mai (Mã NV: TT-04)',
  },
  {
    id: 2,
    bookId: 102,
    orderCode: 'PM-UTH-2026-089',
    title: 'Kinh tế học vi mô ứng dụng',
    code: 'KT-VM-002',
    author: 'PGS.TS Trần Thị B',
    category: 'KINH TẾ',
    publisher: 'NXB Kinh tế TP.HCM',
    publishYear: 2023,
    borrowDate: '25/10/2026',
    dueDate: '10/11/2026',
    totalDurationDays: 21,
    elapsedDays: 19,
    renewCount: 1,
    daysLeft: 2,
    status: 'WARNING',
    campus: 'Cơ sở 1 (Số 2 Võ Oanh, P.25, Bình Thạnh)',
    shelfLocation: 'Khu Kinh tế · Kệ B1 - Tầng 1',
    callNumber: '338.5 KT 2023',
    coverBg: '#065f46',
    copyBarcode: 'UTH-BC-10204',
    librarian: 'Nguyễn Thị Mai (Mã NV: TT-04)',
  },
  {
    id: 3,
    bookId: 103,
    orderCode: 'PM-UTH-2026-072',
    title: 'Quản trị Logistics và Chuỗi cung ứng toàn cầu',
    code: 'LG-SCM-003',
    author: 'TS. Lê Hoàng Nam',
    category: 'LOGISTICS',
    publisher: 'NXB Giao thông Vận tải',
    publishYear: 2024,
    borrowDate: '15/10/2026',
    dueDate: '29/10/2026',
    totalDurationDays: 14,
    elapsedDays: 20,
    renewCount: 0,
    daysLeft: -6,
    status: 'OVERDUE',
    fineAmount: 30000,
    campus: 'Cơ sở 1 (Số 2 Võ Oanh, P.25, Bình Thạnh)',
    shelfLocation: 'Khu Logistics · Kệ C3 - Tầng 2',
    callNumber: '658.7 LOG 2024',
    coverBg: '#991b1b',
    copyBarcode: 'UTH-BC-10309',
    librarian: 'Trần Văn Hùng (Mã NV: TT-02)',
  },
  {
    id: 4,
    bookId: 104,
    orderCode: 'PM-UTH-2026-089',
    title: 'Cơ học kết cấu và Kháng chấn công trình cầu',
    code: 'XD-CK-004',
    author: 'ThS. Phạm Quốc Tuấn',
    category: 'XÂY DỰNG',
    publisher: 'NXB Xây dựng',
    publishYear: 2023,
    borrowDate: '01/11/2026',
    dueDate: '15/11/2026',
    totalDurationDays: 14,
    elapsedDays: 2,
    renewCount: 0,
    daysLeft: 12,
    status: 'NORMAL',
    campus: 'Cơ sở 2 (Trương Văn Hải, Tăng Nhơn Phú B, Thủ Đức)',
    shelfLocation: 'Khu Xây dựng · Kệ D2 - Tầng 4',
    callNumber: '624.17 XD 2023',
    coverBg: '#374151',
    copyBarcode: 'UTH-BC-10402',
    librarian: 'Lê Thu Trang (Mã NV: TT-05)',
  },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'NORMAL', label: 'Trong hạn' },
  { id: 'WARNING', label: 'Sắp hết hạn' },
  { id: 'OVERDUE', label: 'Quá hạn' },
];

const STATUS_BADGE_MAP = {
  NORMAL: {
    label: 'Đang mượn',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentBorder: 'border-slate-200',
  },
  WARNING: {
    label: 'Sắp hết hạn',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    accentBorder: 'border-amber-200',
  },
  OVERDUE: {
    label: 'Quá hạn',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    accentBorder: 'border-rose-200',
  },
};

export default function LoansCardListMobile({ onOpenQrModal, onShowToast }) {
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedDetailLoan, setSelectedDetailLoan] = useState(null);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('2026-11-14');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('14:00 - 16:30');
  const [appointmentCampus, setAppointmentCampus] = useState('Cơ sở 1 - Võ Oanh (Bình Thạnh)');
  const [appointmentNote, setAppointmentNote] = useState('');

  const notify = (msg) => {
    if (onShowToast) onShowToast(msg);
  };

  const stats = useMemo(() => {
    const totalBorrowed = loans.length;
    const warningCount = loans.filter((l) => l.status === 'WARNING').length;
    const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;
    const totalFines = loans
      .filter((l) => l.status === 'OVERDUE')
      .reduce((sum, item) => sum + (item.fineAmount || 0), 0);
    return { totalBorrowed, warningCount, overdueCount, totalFines };
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return loans.filter((loan) => {
      const matchStatus = statusFilter === 'ALL' || loan.status === statusFilter;
      const matchQuery =
        !query ||
        loan.title.toLowerCase().includes(query) ||
        loan.code.toLowerCase().includes(query) ||
        loan.author.toLowerCase().includes(query) ||
        loan.orderCode.toLowerCase().includes(query) ||
        loan.copyBarcode.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });
  }, [loans, statusFilter, searchQuery]);

  const buildRenewedLoan = (item) => {
    const nextDaysLeft = item.daysLeft + 7;
    return {
      ...item,
      renewCount: 1,
      daysLeft: nextDaysLeft,
      dueDate: '18/11/2026',
      totalDurationDays: item.totalDurationDays + 7,
      status: nextDaysLeft <= 3 ? 'WARNING' : 'NORMAL',
    };
  };

  const handleRenew = (loanId) => {
    const target = loans.find((item) => item.id === loanId);
    if (!target) return;

    if (target.status === 'OVERDUE') {
      notify('Không thể gia hạn: Tài liệu đã quá hạn trả theo quy định BR03!');
      return;
    }
    if (target.renewCount >= 1) {
      notify('Cuốn sách này đã sử dụng hết 1 lần gia hạn trực tuyến!');
      return;
    }

    const updatedItem = buildRenewedLoan(target);
    setLoans((prev) => prev.map((item) => (item.id === loanId ? updatedItem : item)));
    if (selectedDetailLoan?.id === loanId) {
      setSelectedDetailLoan(updatedItem);
    }
    notify(`Gia hạn thành công "${target.title}" thêm 7 ngày!`);
  };

  const handleBatchRenew = () => {
    const eligibleIds = selectedBookIds.filter((id) => {
      const target = loans.find((l) => l.id === id);
      return target && target.renewCount === 0 && target.status !== 'OVERDUE';
    });

    if (eligibleIds.length === 0) {
      notify('Không có cuốn sách nào đủ điều kiện gia hạn trong mục đã chọn!');
      return;
    }

    setLoans((prev) =>
      prev.map((item) => (eligibleIds.includes(item.id) ? buildRenewedLoan(item) : item))
    );
    notify(`Đã gia hạn thành công ${eligibleIds.length} cuốn sách (+7 ngày)!`);
    setSelectedBookIds([]);
  };

  const toggleSelectBook = (id) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenPickupQr = () => {
    if (!onOpenQrModal) return;
    onOpenQrModal({
      code: 'DH-UTH-2026-089',
      campus: 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
      pickupDate: 'Hôm nay (Giờ làm việc 07:30 - 20:30)',
      books: [
        { title: 'Nhập môn Trí tuệ nhân tạo & Học máy', code: 'CNTT-AI-005' },
        { title: 'Khai phá dữ liệu lớn với Spark', code: 'CNTT-BD-006' },
      ],
      status: 'READY_FOR_PICKUP',
    });
  };

  const handleOpenScheduleModal = () => {
    if (selectedBookIds.length === 0) {
      notify('Vui lòng chọn ít nhất 1 cuốn sách để đặt lịch hẹn trả!');
      return;
    }
    setIsScheduleModalOpen(true);
  };

  const handleConfirmScheduleReturn = (e) => {
    e.preventDefault();
    const returningBooks = loans.filter((l) => selectedBookIds.includes(l.id));
    const randomTicketNumber = Math.floor(100 + Math.random() * 900);
    const returnTicketCode = `PT-UTH-2026-${randomTicketNumber}`;

    setIsScheduleModalOpen(false);
    notify(`Đã tạo thành công Phiếu hẹn trả ${returnTicketCode}!`);

    if (onOpenQrModal) {
      onOpenQrModal({
        code: returnTicketCode,
        campus: appointmentCampus,
        pickupDate: `Hẹn trả: ${appointmentDate} (${appointmentTimeSlot})`,
        books: returningBooks,
        status: 'PENDING_VERIFICATION',
        note: appointmentNote || 'Quét mã tại quầy tiếp nhận để hoàn tất trả sách trong 30 giây.',
      });
    }
    setSelectedBookIds([]);
  };

  const handleCopyBarcode = (barcode) => {
    navigator.clipboard?.writeText(barcode);
    setCopiedBarcode(true);
    notify(`Đã sao chép mã bản sao: ${barcode}`);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Banner Pick & Go QR nổi bật */}
      <div className="rounded-2xl bg-gradient-to-r from-[#00383b] via-[#005458] to-[#00666b] text-white p-4 shadow-sm border border-teal-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-teal-100 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đơn sẵn sàng tại quầy Pick &amp; Go (&lt; 30s)
            </div>
            <h2 className="text-sm sm:text-base font-bold leading-snug">
              Hồ sơ mượn &amp; Gia hạn trực tuyến
            </h2>
            <p className="text-[11px] text-teal-100/90 mt-0.5">
              Mã đơn: <strong className="text-white font-mono">DH-UTH-2026-089</strong> • Tối đa 5 cuốn / 14 ngày (BR02)
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenPickupQr}
            className="w-full sm:w-auto shrink-0 px-3.5 py-2.5 rounded-xl bg-white text-[#00666b] hover:bg-teal-50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Mở QR nhận sách</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ KPI co giãn 2x2 trên Mobile, 4 cột trên Tablet/Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Đang mượn</span>
            <BookOpen className="w-3.5 h-3.5 text-[#00666b]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <strong className="text-lg font-black text-slate-900 tabular-nums">{stats.totalBorrowed}</strong>
            <span className="text-[11px] text-slate-400 font-semibold">/ 5 cuốn</span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Sắp hết hạn</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <strong className="text-lg font-black text-amber-600 tabular-nums">{stats.warningCount}</strong>
            <span className="text-[11px] text-slate-400 font-semibold">cuốn (≤3 ngày)</span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Quá hạn</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <strong className="text-lg font-black text-rose-600 tabular-nums">{stats.overdueCount}</strong>
            <span className="text-[11px] text-slate-400 font-semibold">cuốn</span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Phạt tạm tính</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-1 truncate">
            <strong className={`text-base sm:text-lg font-black tabular-nums ${stats.totalFines > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stats.totalFines.toLocaleString('vi-VN')}đ
            </strong>
          </div>
        </div>
      </div>

      {/* Tìm kiếm & Bộ lọc trạng thái */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên sách, mã sách, mã đơn PM-UTH..."
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
          {STATUS_FILTERS.map((filter) => {
            const count =
              filter.id === 'ALL'
                ? loans.length
                : loans.filter((l) => l.status === filter.id).length;
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

      {/* Thanh thao tác hàng loạt khi đã chọn sách */}
      {selectedBookIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-teal-50 border border-[#00666b]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs">
            <span className="font-bold text-[#00666b]">
              Đã chọn {selectedBookIds.length} tài liệu
            </span>
            <button
              type="button"
              onClick={() => setSelectedBookIds([])}
              className="text-[11px] text-slate-500 underline hover:text-slate-700 cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchRenew}
              className="px-3 py-2 rounded-xl bg-white border border-[#00666b] text-[#00666b] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-teal-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gia hạn</span>
            </button>
            <button
              type="button"
              onClick={handleOpenScheduleModal}
              className="px-3 py-2 rounded-xl bg-[#00666b] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#005458]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hẹn trả QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Danh sách thẻ sách đang mượn (1 cột Mobile, 2 cột Tablet) */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">
            Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#00666b] underline cursor-pointer"
          >
            Xem tất cả tài liệu đang mượn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredLoans.map((loan) => {
            const badge = STATUS_BADGE_MAP[loan.status] || STATUS_BADGE_MAP.NORMAL;
            const isSelected = selectedBookIds.includes(loan.id);
            const canRenew = loan.status !== 'OVERDUE' && loan.renewCount === 0;
            const progressPct = Math.min(
              100,
              Math.max(8, Math.round((loan.elapsedDays / loan.totalDurationDays) * 100))
            );

            return (
              <article
                key={loan.id}
                className={`bg-white rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all flex flex-col justify-between gap-3 ${
                  isSelected ? 'border-[#00666b] ring-2 ring-[#00666b]/15' : badge.accentBorder
                }`}
              >
                {/* Header thẻ: Checkbox + Mã đơn + Badge trạng thái */}
                <div className="flex items-start justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectBook(loan.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#00666b] focus:ring-[#00666b] shrink-0"
                    />
                    <span className="text-[11px] font-mono font-bold text-[#00666b] truncate">
                      {loan.orderCode}
                    </span>
                  </label>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Thông tin sách */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-11 h-14 rounded-xl text-white flex items-center justify-center text-[10px] font-black tracking-tight shrink-0 shadow-xs px-1 text-center leading-tight"
                    style={{ backgroundColor: loan.coverBg }}
                  >
                    {loan.code.split('-')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {loan.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {loan.author} • <span className="font-mono">{loan.code}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#00666b] shrink-0" />
                      <span className="truncate">{loan.campus}</span>
                    </p>
                  </div>
                </div>

                {/* Hạn trả & Thanh tiến độ */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <span className="text-slate-500">
                      Hạn trả: <strong className="text-slate-800">{loan.dueDate}</strong>
                    </span>
                    {loan.status === 'OVERDUE' ? (
                      <span className="font-bold text-rose-600 shrink-0">
                        Trễ {Math.abs(loan.daysLeft)} ngày • {(loan.fineAmount || 0).toLocaleString('vi-VN')}đ
                      </span>
                    ) : (
                      <span className={`font-bold shrink-0 ${loan.status === 'WARNING' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        Còn {loan.daysLeft} ngày
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        loan.status === 'OVERDUE'
                          ? 'bg-rose-500'
                          : loan.status === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-[#00666b]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Mượn ngày {loan.borrowDate}</span>
                    <span>Gia hạn: {loan.renewCount}/1 lần</span>
                  </div>
                </div>

                {/* Nút thao tác (đủ vùng chạm >= 40px) */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailLoan(loan)}
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRenew(loan.id)}
                    disabled={!canRenew}
                    className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      canRenew
                        ? 'bg-[#00666b] hover:bg-[#005458] text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {loan.status === 'OVERDUE'
                        ? 'Khóa gia hạn'
                        : loan.renewCount >= 1
                        ? 'Đã gia hạn'
                        : 'Gia hạn +7d'}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Gợi ý đặt lịch hẹn trả */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800">Muốn trả sách nhanh tại quầy?</p>
          <p className="text-[11px] text-slate-500">Tick chọn sách ở trên rồi bấm hẹn lịch để tạo mã QR trả sách.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenScheduleModal}
          className="shrink-0 px-3 py-2 rounded-xl bg-teal-50 text-[#00666b] border border-teal-200 text-xs font-bold cursor-pointer hover:bg-teal-100"
        >
          Hẹn lịch trả
        </button>
      </div>

      {/* Modal Chi tiết tài liệu đang mượn */}
      {selectedDetailLoan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedDetailLoan(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-[#00383b] to-[#00666b] text-white px-5 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-teal-200 block">
                  {selectedDetailLoan.orderCode} • {selectedDetailLoan.code}
                </span>
                <h3 className="text-sm font-bold truncate">{selectedDetailLoan.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailLoan(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Ngày mượn</span>
                  <strong className="text-slate-800">{selectedDetailLoan.borrowDate}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Hạn trả hiện tại</span>
                  <strong className={selectedDetailLoan.status === 'OVERDUE' ? 'text-rose-600' : 'text-[#00666b]'}>
                    {selectedDetailLoan.dueDate}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Mã vạch bản sao:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyBarcode(selectedDetailLoan.copyBarcode)}
                    className="inline-flex items-center gap-1 font-mono font-bold text-[#00666b] cursor-pointer"
                  >
                    <span>{selectedDetailLoan.copyBarcode}</span>
                    {copiedBarcode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Vị trí kệ:</span>
                  <span className="font-semibold text-slate-800 text-right">{selectedDetailLoan.shelfLocation}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Ký hiệu phân loại:</span>
                  <span className="font-mono text-slate-800 text-right">{selectedDetailLoan.callNumber}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#00666b]" /> Thủ thư giao:
                  </span>
                  <span className="font-medium text-slate-700 text-right">{selectedDetailLoan.librarian}</span>
                </div>
              </div>

              {selectedDetailLoan.status === 'OVERDUE' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <strong>Phí trễ hạn tạm tính (BR04):</strong>{' '}
                  {(selectedDetailLoan.fineAmount || 0).toLocaleString('vi-VN')} VNĐ ({Math.abs(selectedDetailLoan.daysLeft)} ngày × 5.000đ/ngày).
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedDetailLoan(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleRenew(selectedDetailLoan.id)}
                disabled={selectedDetailLoan.status === 'OVERDUE' || selectedDetailLoan.renewCount >= 1}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${
                  selectedDetailLoan.status !== 'OVERDUE' && selectedDetailLoan.renewCount === 0
                    ? 'bg-[#00666b] text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Gia hạn +7 ngày
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đặt lịch hẹn trả (BR06) */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsScheduleModalOpen(false)}
          />
          <form
            onSubmit={handleConfirmScheduleReturn}
            className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
          >
            <div className="bg-gradient-to-r from-[#00383b] to-[#00666b] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Đặt lịch hẹn trả sách (Pick &amp; Go)</h3>
                <p className="text-[11px] text-teal-100">Đang chọn {selectedBookIds.length} cuốn sách</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cơ sở UTH trả sách</label>
                <select
                  value={appointmentCampus}
                  onChange={(e) => setAppointmentCampus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00666b]"
                >
                  <option>Cơ sở 1 - Võ Oanh (Bình Thạnh)</option>
                  <option>Cơ sở 2 - Đường số 12 (Thủ Đức)</option>
                  <option>Cơ sở 3 - Tô Ký (Quận 12)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày hẹn trả</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00666b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khung giờ</label>
                  <select
                    value={appointmentTimeSlot}
                    onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00666b]"
                  >
                    <option>07:30 - 11:30</option>
                    <option>14:00 - 16:30</option>
                    <option>17:00 - 20:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú tình trạng sách (nếu có)</label>
                <textarea
                  rows={2}
                  value={appointmentNote}
                  onChange={(e) => setAppointmentNote(e.target.value)}
                  placeholder="Ví dụ: Sách nguyên vẹn, trả đủ phụ lục..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00666b]"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#00666b] hover:bg-[#005458] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tạo phiếu &amp; Lấy QR</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

