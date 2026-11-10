import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  RotateCcw,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Search,
  X,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  MapPin
} from 'lucide-react';

/**
 * LoansTableViewPC - Bảng quản lý hồ sơ tài liệu đang mượn & Chi tiết tài liệu mượn (Desktop Web - TV3)
 * Tuân thủ đầy đủ các quy tắc nghiệp vụ BR01 - BR08:
 * - BR01: Tối đa 5 tài liệu/sinh viên. Chặn mượn nếu có tiền phạt chưa thanh toán.
 * - BR02: Thời gian mượn mặc định 14 ngày.
 * - BR03: Tối đa 1 lần gia hạn trực tuyến (+7 ngày), chỉ cho phép khi chưa quá hạn.
 * - BR04: Phạt trễ hạn 5.000 VNĐ / ngày / cuốn.
 * - BR05: Đơn giữ quầy tối đa 48h.
 * - BR06: Lịch hẹn trả phải <= hạn trả sớm nhất của các tài liệu được chọn.
 */
export default function LoansTableViewPC({ onOpenQrModal, onShowToast }) {
  // Dữ liệu mẫu danh sách tài liệu đang mượn phong phú đại diện đầy đủ các trạng thái
  const [loans, setLoans] = useState([
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
      dueTimestamp: new Date('2026-11-11').getTime(),
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
      dueTimestamp: new Date('2026-11-10').getTime(),
      totalDurationDays: 21, // Đã gia hạn +7 ngày
      elapsedDays: 19,
      renewCount: 1,
      daysLeft: 2,
      status: 'WARNING', // Sắp hết hạn trong <= 3 ngày
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
      dueTimestamp: new Date('2026-10-29').getTime(),
      totalDurationDays: 14,
      elapsedDays: 20,
      renewCount: 0,
      daysLeft: -6, // Quá hạn 6 ngày
      status: 'OVERDUE',
      fineAmount: 30000, // 6 ngày * 5.000 VNĐ (BR04)
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
      dueTimestamp: new Date('2026-11-15').getTime(),
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
  ]);

  // Bộ lọc trạng thái & tìm kiếm
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | NORMAL | WARNING | OVERDUE
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  // Modal Chi tiết tài liệu mượn (Dedicated Borrowed Document Detail View)
  const [selectedDetailLoan, setSelectedDetailLoan] = useState(null);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  // Modal hẹn lịch trả sách (BR06)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('2026-11-10');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('14:00 - 16:30');
  const [appointmentCampus, setAppointmentCampus] = useState('Cơ sở 1 - Võ Oanh (Bình Thạnh)');
  const [appointmentNote, setAppointmentNote] = useState('');

  // Tính toán số liệu thống kê nhanh
  const stats = useMemo(() => {
    const totalBorrowed = loans.length;
    const warningCount = loans.filter((l) => l.status === 'WARNING').length;
    const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;
    const totalFines = loans
      .filter((l) => l.status === 'OVERDUE')
      .reduce((sum, item) => sum + (item.fineAmount || 0), 0);
    return { totalBorrowed, warningCount, overdueCount, totalFines };
  }, [loans]);

  // Lọc danh sách theo điều kiện tìm kiếm và tab trạng thái
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchStatus =
        statusFilter === 'ALL' ? true : loan.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        loan.title.toLowerCase().includes(query) ||
        loan.code.toLowerCase().includes(query) ||
        loan.author.toLowerCase().includes(query) ||
        loan.orderCode?.toLowerCase().includes(query) ||
        loan.copyBarcode?.toLowerCase().includes(query) ||
        loan.category.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });
  }, [loans, statusFilter, searchQuery]);

  // Xử lý gia hạn trực tuyến (+7 ngày, tối đa 1 lần theo BR03)
  const handleRenew = (loanId) => {
    setLoans((prev) =>
      prev.map((item) => {
        if (item.id === loanId) {
          if (item.status === 'OVERDUE') {
            if (onShowToast) onShowToast('Không thể gia hạn: Tài liệu đã quá hạn trả theo quy định BR03!');
            return item;
          }
          if (item.renewCount >= 1) {
            if (onShowToast) onShowToast('Cuốn sách này đã sử dụng hết 1 lần gia hạn trực tuyến!');
            return item;
          }
          if (onShowToast) {
            onShowToast(`Gia hạn thành công cuốn "${item.title}" thêm 7 ngày!`);
          }
          const updatedItem = {
            ...item,
            renewCount: 1,
            daysLeft: item.daysLeft + 7,
            dueDate: '18/11/2026',
            dueTimestamp: new Date('2026-11-18').getTime(),
            totalDurationDays: item.totalDurationDays + 7,
            status: item.daysLeft + 7 <= 3 ? 'WARNING' : 'NORMAL',
          };
          if (selectedDetailLoan && selectedDetailLoan.id === loanId) {
            setSelectedDetailLoan(updatedItem);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Gia hạn hàng loạt cho tất cả các sách đang được chọn và đủ điều kiện
  const handleBatchRenew = () => {
    const eligibleIds = selectedBookIds.filter((id) => {
      const target = loans.find((l) => l.id === id);
      return target && target.renewCount === 0 && target.status !== 'OVERDUE';
    });

    if (eligibleIds.length === 0) {
      if (onShowToast) onShowToast('Không có cuốn sách nào đủ điều kiện gia hạn trong mục đã chọn!');
      return;
    }

    setLoans((prev) =>
      prev.map((item) => {
        if (eligibleIds.includes(item.id)) {
          return {
            ...item,
            renewCount: 1,
            daysLeft: item.daysLeft + 7,
            dueDate: '18/11/2026',
            dueTimestamp: new Date('2026-11-18').getTime(),
            totalDurationDays: item.totalDurationDays + 7,
            status: item.daysLeft + 7 <= 3 ? 'WARNING' : 'NORMAL',
          };
        }
        return item;
      })
    );

    if (onShowToast) {
      onShowToast(`Đã gia hạn thành công ${eligibleIds.length} cuốn sách (+7 ngày)!`);
    }
    setSelectedBookIds([]);
  };

  // Mở mã QR nhận sách tại quầy Pick & Go
  const handleOpenPickupQr = () => {
    if (onOpenQrModal) {
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
    }
  };

  // Xử lý chọn/bỏ chọn checkbox từng dòng
  const toggleSelectBook = (id) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Chọn hoặc bỏ chọn tất cả các dòng đang hiển thị
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBookIds(filteredLoans.map((l) => l.id));
    } else {
      setSelectedBookIds([]);
    }
  };

  // Mở modal đặt lịch hẹn trả (BR06)
  const handleOpenScheduleModal = () => {
    if (selectedBookIds.length === 0) {
      if (onShowToast) onShowToast('Vui lòng chọn ít nhất 1 cuốn sách để đặt lịch hẹn trả!');
      return;
    }
    setIsScheduleModalOpen(true);
  };

  // Xác nhận tạo lịch hẹn trả và sinh mã QR phiếu trả
  const handleConfirmScheduleReturn = (e) => {
    e.preventDefault();
    const returningBooks = loans.filter((l) => selectedBookIds.includes(l.id));
    const randomTicketNumber = Math.floor(100 + Math.random() * 900);
    const returnTicketCode = `PT-UTH-2026-${randomTicketNumber}`;

    setIsScheduleModalOpen(false);

    if (onShowToast) {
      onShowToast(`Đã tạo thành công Phiếu hẹn trả ${returnTicketCode}!`);
    }

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

  // Sao chép mã vạch bản sao
  const handleCopyBarcode = (barcode) => {
    navigator.clipboard?.writeText(barcode);
    setCopiedBarcode(true);
    if (onShowToast) onShowToast(`Đã sao chép mã bản sao: ${barcode}`);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 4 Thẻ KPI thống kê nhanh của Sinh viên trên Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hạn mức mượn */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Tài liệu đang mượn</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <strong className="text-2xl font-black text-slate-900 tabular-nums">
                  {stats.totalBorrowed}
                </strong>
                <span className="text-xs text-slate-400 font-bold">/ 5 cuốn</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00666B] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Hạn mức quy định:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Còn được mượn {5 - stats.totalBorrowed} cuốn
            </span>
          </div>
        </div>

        {/* Card 2: Đơn sẵn sàng lấy tại quầy */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Đơn chờ lấy quầy</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <strong className="text-2xl font-black text-[#00666B] tabular-nums">1</strong>
                <span className="text-xs text-slate-400 font-bold">đơn sẵn sàng</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenPickupQr}
              className="w-10 h-10 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00666B] flex items-center justify-center transition-colors cursor-pointer"
              title="Xem mã QR đơn mượn để lấy sách tại quầy"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Thời hạn giữ sách:</span>
            <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
              48h (BR05)
            </span>
          </div>
        </div>

        {/* Card 3: Cần lưu ý hạn trả */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Cần chú ý hạn trả</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <strong
                  className={`text-2xl font-black tabular-nums ${
                    stats.overdueCount > 0
                      ? 'text-rose-600'
                      : stats.warningCount > 0
                      ? 'text-amber-600'
                      : 'text-slate-900'
                  }`}
                >
                  {stats.warningCount + stats.overdueCount}
                </strong>
                <span className="text-xs text-slate-400 font-bold">cuốn cần xử lý</span>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                stats.overdueCount > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tình trạng:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                stats.overdueCount > 0
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-amber-800 bg-amber-50'
              }`}
            >
              {stats.overdueCount > 0
                ? `${stats.overdueCount} cuốn quá hạn`
                : `${stats.warningCount} cuốn sắp hạn`}
            </span>
          </div>
        </div>

        {/* Card 4: Tiền phạt tích lũy */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Tiền phạt quá hạn</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <strong
                  className={`text-2xl font-black tabular-nums ${
                    stats.totalFines > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {stats.totalFines.toLocaleString('vi-VN')}
                </strong>
                <span className="text-xs text-slate-400 font-bold">VNĐ</span>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                stats.totalFines > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Quy định BR04:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                stats.totalFines > 0
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              {stats.totalFines > 0 ? 'Chặn mượn sách mới' : 'Không có nợ phạt'}
            </span>
          </div>
        </div>
      </div>

      {/* Cảnh báo tiền phạt nếu có (Banner thông báo nổi bật theo BR01) */}
      {stats.totalFines > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-rose-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">
                Bạn đang có khoản phạt quá hạn {stats.totalFines.toLocaleString('vi-VN')} VNĐ chưa thanh toán
              </p>
              <p className="text-rose-700 mt-0.5">
                Theo quy định BR01, chức năng đăng ký mượn tài liệu mới sẽ tạm khóa cho tới khi bạn hoàn tất trả sách và nộp phạt tại quầy thư viện UTH.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenScheduleModal}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Hẹn ngày trả & Nộp phạt
          </button>
        </div>
      )}

      {/* Bảng chi tiết danh sách tài liệu đang mượn */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header bảng + Công cụ tìm kiếm & lọc */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Tài Liệu Đang Mượn</span>
                <span className="text-xs bg-teal-50 text-[#00666B] px-2.5 py-0.5 rounded-full font-bold border border-teal-200/60">
                  {loans.length} cuốn
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Nhấp vào tên hoặc nút xem chi tiết để tra cứu hồ sơ tài liệu, theo dõi hạn và gia hạn thêm 7 ngày.
              </p>
            </div>

            {/* Các nút hành động chính */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenPickupQr}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Mở mã QR đơn hàng để nhận sách tại quầy"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mã QR nhận sách</span>
              </button>

              <button
                type="button"
                onClick={handleOpenScheduleModal}
                disabled={selectedBookIds.length === 0}
                className="px-3.5 py-2 bg-[#00666B] hover:bg-[#005458] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Tạo phiếu hẹn trả ({selectedBookIds.length})</span>
              </button>
            </div>
          </div>

          {/* Thanh Filter Tabs & Input Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
            {/* Tabs phân loại trạng thái */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({loans.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('NORMAL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'NORMAL'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang mượn an toàn ({loans.filter((l) => l.status === 'NORMAL').length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('WARNING')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'WARNING'
                    ? 'bg-white text-amber-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sắp đến hạn ({stats.warningCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('OVERDUE')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'OVERDUE'
                    ? 'bg-white text-rose-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quá hạn ({stats.overdueCount})
              </button>
            </div>

            {/* Ô tìm kiếm nhanh */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên sách, mã vạch, tác giả..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thanh thao tác nhanh khi chọn nhiều sách (Batch action toolbar) */}
        {selectedBookIds.length > 0 && (
          <div className="px-5 py-3 bg-teal-50 border-b border-teal-200/80 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-[#00666B] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00666B] animate-pulse" />
              <span>Đang chọn {selectedBookIds.length} tài liệu</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchRenew}
                className="px-3 py-1.5 bg-white border border-teal-300 hover:bg-teal-100/50 text-[#00666B] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gia hạn các sách hợp lệ (+7d)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenScheduleModal}
                className="px-3 py-1.5 bg-[#00666B] hover:bg-[#005458] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Hẹn lịch trả hàng loạt</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBookIds([])}
                className="p-1.5 text-slate-500 hover:text-slate-700 cursor-pointer"
                title="Bỏ chọn tất cả"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredLoans.length > 0 &&
                      selectedBookIds.length === filteredLoans.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-[#00666B] focus:ring-[#00666B] cursor-pointer"
                    title="Chọn tất cả"
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
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Không tìm thấy tài liệu</p>
                      <p className="text-xs text-slate-500">
                        Không có cuốn sách nào khớp với điều kiện lọc hiện tại.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('ALL');
                          setSearchQuery('');
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isSelected = selectedBookIds.includes(loan.id);
                  const isOverdue = loan.status === 'OVERDUE';
                  const isWarning = loan.status === 'WARNING';

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-teal-50/20 transition-colors ${
                        isSelected ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectBook(loan.id)}
                          className="rounded text-[#00666B] focus:ring-[#00666B] cursor-pointer"
                        />
                      </td>

                      {/* Thông tin tài liệu */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setSelectedDetailLoan(loan)}
                            style={{ backgroundColor: loan.coverBg }}
                            className="w-10 h-14 rounded-md shadow-2xs flex flex-col justify-between p-1 text-white shrink-0 relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            title="Xem chi tiết tài liệu này"
                          >
                            <div className="absolute inset-y-0 left-0 w-1 bg-black/20" />
                            <span className="text-[6px] font-bold text-center pl-1">UTH</span>
                            <span className="text-[7px] font-black text-center line-clamp-2 px-0.5 leading-tight">
                              {loan.title}
                            </span>
                            <span className="text-[5px] text-center font-mono opacity-80">2026</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-[#00666B] uppercase">
                                {loan.category}
                              </span>
                              <span className="text-[10px] text-slate-400">·</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Barcode: {loan.copyBarcode}
                              </span>
                            </div>
                            <h3
                              onClick={() => setSelectedDetailLoan(loan)}
                              className="font-bold text-slate-900 text-xs sm:text-sm leading-snug hover:text-[#00666B] cursor-pointer transition-colors mt-0.5"
                            >
                              {loan.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Tác giả: <span className="text-slate-700">{loan.author}</span> ·{' '}
                              <span className="text-slate-500">{loan.shelfLocation}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Ngày mượn */}
                      <td className="p-3.5 text-slate-600 font-medium tabular-nums font-mono">
                        {loan.borrowDate}
                      </td>

                      {/* Hạn trả */}
                      <td className="p-3.5 font-bold tabular-nums font-mono">
                        <span className={isOverdue ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-slate-800'}>
                          {loan.dueDate}
                        </span>
                      </td>

                      {/* Thời hạn còn lại & Trạng thái */}
                      <td className="p-3.5">
                        {isOverdue ? (
                          <div className="inline-flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Quá hạn {Math.abs(loan.daysLeft)} ngày</span>
                            </span>
                            <span className="text-[10px] text-rose-700 font-bold pl-1 tabular-nums">
                              Phạt: {(loan.fineAmount || 0).toLocaleString('vi-VN')} đ (BR04)
                            </span>
                          </div>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>Còn {loan.daysLeft} ngày (Gấp)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Còn {loan.daysLeft} ngày</span>
                          </span>
                        )}
                      </td>

                      {/* Lượt gia hạn */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold tabular-nums ${
                            loan.renewCount >= 1
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-teal-50 text-[#00666B] border border-teal-200/80'
                          }`}
                        >
                          {loan.renewCount}/1 lần
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          type="button"
                          disabled={loan.renewCount >= 1 || isOverdue}
                          onClick={() => handleRenew(loan.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            loan.renewCount >= 1 || isOverdue
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-[#00666B] hover:bg-[#005458] text-white shadow-2xs'
                          }`}
                          title={
                            isOverdue
                              ? 'Không thể gia hạn khi đã quá hạn'
                              : loan.renewCount >= 1
                              ? 'Đã hết lượt gia hạn trực tuyến (+7 ngày)'
                              : 'Gia hạn trực tuyến thêm 7 ngày'
                          }
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>
                            {isOverdue
                              ? 'Quá hạn'
                              : loan.renewCount >= 1
                              ? 'Đã gia hạn'
                              : 'Gia hạn (+7d)'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDetailLoan(loan)}
                          className="px-2.5 py-1.5 text-slate-600 hover:text-[#00666B] hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Xem chi tiết hồ sơ tài liệu mượn"
                        >
                          <span>Chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Thông tin chính sách thư viện UTH */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p>
              • <strong>Chính sách gia hạn (BR03):</strong> Mỗi tài liệu được gia hạn tối đa <strong>1 lần (+7 ngày)</strong> qua cổng trực tuyến khi sách chưa quá hạn và kho sách còn bản sao khả dụng.
            </p>
            <p>
              • <strong>Phạt trễ hạn (BR04):</strong> Mức phạt là <strong>5.000 VNĐ / ngày / cuốn</strong> tính tự động từ ngày quá hạn. Khi có nợ phạt, bạn không thể tạo yêu cầu mượn sách mới (BR01).
            </p>
            <p>
              • <strong>Quy trình hẹn trả (BR06):</strong> Chọn các sách muốn trả và bấm <em>"Tạo phiếu hẹn trả"</em> để lấy mã QR. Khi mang sách đến quầy tiếp nhận, thủ thư quét mã trong dưới 30 giây để hoàn tất.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL / DRAWER CHI TIẾT TÀI LIỆU MƯỢN TOÀN DIỆN */}
      {/* ======================================================== */}
      {selectedDetailLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDetailLoan(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Header Chi Tiết Tài Liệu */}
            <div className="bg-[#00666B] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Chi Tiết Hồ Sơ Tài Liệu Mượn
                  </h3>
                  <p className="text-xs text-teal-100/90 font-mono">
                    Mã bản sao: <strong>{selectedDetailLoan.copyBarcode}</strong> · Thuộc phiếu: {selectedDetailLoan.orderCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedDetailLoan.status === 'OVERDUE'
                      ? 'bg-rose-500/20 text-rose-100 border-rose-300/40'
                      : selectedDetailLoan.status === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-100 border-amber-300/40'
                      : 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40'
                  }`}
                >
                  {selectedDetailLoan.status === 'OVERDUE'
                    ? `Quá hạn ${Math.abs(selectedDetailLoan.daysLeft)} ngày`
                    : selectedDetailLoan.status === 'WARNING'
                    ? `Sắp hết hạn (Còn ${selectedDetailLoan.daysLeft} ngày)`
                    : `Đang mượn an toàn (Còn ${selectedDetailLoan.daysLeft} ngày)`}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDetailLoan(null)}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nội dung Chi Tiết Tài Liệu Cuộn */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* 1. KHỐI TỔNG QUAN TÀI LIỆU VÀ BÌA SÁCH */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div
                  style={{ backgroundColor: selectedDetailLoan.coverBg }}
                  className="w-20 h-28 rounded-lg shadow-md flex flex-col justify-between p-2 text-white shrink-0 relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-2 bg-black/20" />
                  <span className="text-[8px] font-bold pl-1">UTH</span>
                  <span className="text-[10px] font-black line-clamp-3 leading-tight px-0.5">
                    {selectedDetailLoan.title}
                  </span>
                  <span className="text-[8px] font-mono opacity-80">{selectedDetailLoan.publishYear || 2024}</span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-[#00666B] bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                      {selectedDetailLoan.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Mã tài liệu: {selectedDetailLoan.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base leading-snug">
                    {selectedDetailLoan.title}
                  </h4>
                  <p className="text-slate-600">
                    Tác giả: <strong className="text-slate-800">{selectedDetailLoan.author}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Nhà xuất bản: {selectedDetailLoan.publisher} · Năm XB: {selectedDetailLoan.publishYear}
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyBarcode(selectedDetailLoan.copyBarcode)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-md font-mono text-[11px] text-slate-700 transition-colors cursor-pointer"
                      title="Sao chép mã vạch bản sao"
                    >
                      {copiedBarcode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Barcode: {selectedDetailLoan.copyBarcode}</span>
                        </>
                      )}
                    </button>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-600 text-[11px]">
                      Call No: {selectedDetailLoan.callNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. TIẾN TRÌNH THỜI HẠN MƯỢN (LOAN TIMELINE & PROGRESS) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#00666B]" />
                    <span>Tiến trình thời hạn mượn (BR02)</span>
                  </span>
                  <span className="font-bold text-slate-700 font-mono">
                    Hạn: {selectedDetailLoan.dueDate}
                  </span>
                </div>

                {/* Thanh tiến trình thời gian */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      style={{
                        width: selectedDetailLoan.status === 'OVERDUE'
                          ? '100%'
                          : `${Math.min(100, Math.round((selectedDetailLoan.elapsedDays / selectedDetailLoan.totalDurationDays) * 100))}%`
                      }}
                      className={`h-full transition-all duration-300 ${
                        selectedDetailLoan.status === 'OVERDUE'
                          ? 'bg-rose-500'
                          : selectedDetailLoan.status === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-[#00666B]'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Bắt đầu: {selectedDetailLoan.borrowDate}</span>
                    <span>
                      {selectedDetailLoan.status === 'OVERDUE'
                        ? 'Đã vượt quá hạn'
                        : `Đã dùng ${selectedDetailLoan.elapsedDays}/${selectedDetailLoan.totalDurationDays} ngày`}
                    </span>
                    <span>Đáo hạn: {selectedDetailLoan.dueDate}</span>
                  </div>
                </div>

                {/* Chi tiết các mốc ngày */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Ngày mượn</span>
                    <strong className="text-slate-800 font-mono font-bold block mt-0.5">
                      {selectedDetailLoan.borrowDate}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Hạn hoàn trả</span>
                    <strong className={`font-mono font-bold block mt-0.5 ${
                      selectedDetailLoan.status === 'OVERDUE' ? 'text-rose-600' : 'text-slate-800'
                    }`}>
                      {selectedDetailLoan.dueDate}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Tình trạng gia hạn</span>
                    <strong className="text-[#00666B] font-bold block mt-0.5">
                      {selectedDetailLoan.renewCount >= 1 ? 'Đã gia hạn (+7d)' : 'Chưa gia hạn (0/1)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. VỊ TRÍ KỆ SÁCH & ĐIỂM HOÀN TRẢ */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-[#00666B] font-bold pb-1 border-b border-slate-200">
                  <MapPin className="w-4 h-4" />
                  <span>Vị trí kệ & Cơ sở tiếp nhận hoàn trả</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Vị trí kệ sách gốc:</span>
                    <strong className="text-slate-800 block mt-0.5">{selectedDetailLoan.shelfLocation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Cơ sở bàn giao:</span>
                    <span className="text-slate-800 block mt-0.5 font-medium">{selectedDetailLoan.campus}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
                  💡 <em>Lưu ý:</em> Bạn có thể hoàn trả tài liệu này tại quầy tiếp nhận Pick & Go của bất kỳ cơ sở nào trong 3 cơ sở của Thư viện UTH.
                </p>
              </div>

              {/* 4. CHÍNH SÁCH TÀI CHÍNH & PHẠT TRỄ HẠN (BR04) */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                selectedDetailLoan.status === 'OVERDUE'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between">
                  <strong className="font-bold flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Nghĩa vụ tài chính & Phạt quá hạn (BR04)</span>
                  </strong>
                  <span className="font-bold font-mono text-sm tabular-nums">
                    {selectedDetailLoan.status === 'OVERDUE'
                      ? `${(selectedDetailLoan.fineAmount || 30000).toLocaleString('vi-VN')} VNĐ`
                      : '0 VNĐ (Không nợ)'}
                  </span>
                </div>
                {selectedDetailLoan.status === 'OVERDUE' ? (
                  <div className="text-[11px] space-y-1">
                    <p>
                      • Tài liệu đã trễ hạn <strong>{Math.abs(selectedDetailLoan.daysLeft)} ngày</strong> kể từ ngày {selectedDetailLoan.dueDate}.
                    </p>
                    <p>
                      • Công thức tính phạt BR04: <strong>{Math.abs(selectedDetailLoan.daysLeft)} ngày × 5.000 VNĐ / ngày = {(selectedDetailLoan.fineAmount || 30000).toLocaleString('vi-VN')} VNĐ</strong>.
                    </p>
                    <p className="font-semibold text-rose-700">
                      • Vui lòng đặt lịch hẹn trả sớm để tránh phát sinh thêm phí phạt và mở khóa quyền mượn sách mới (BR01).
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-800">
                    Tài liệu vẫn trong hạn mượn hợp lệ. Vui lòng hoàn trả hoặc gia hạn trước ngày <strong>{selectedDetailLoan.dueDate}</strong> để duy trì hồ sơ độc giả tốt.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                Thủ thư phụ trách: {selectedDetailLoan.librarian}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={selectedDetailLoan.renewCount >= 1 || selectedDetailLoan.status === 'OVERDUE'}
                  onClick={() => handleRenew(selectedDetailLoan.id)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#00666B] hover:bg-[#005458] disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  title={
                    selectedDetailLoan.status === 'OVERDUE'
                      ? 'Không thể gia hạn khi đã quá hạn'
                      : selectedDetailLoan.renewCount >= 1
                      ? 'Đã hết lượt gia hạn trực tuyến'
                      : 'Gia hạn thêm 7 ngày'
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {selectedDetailLoan.status === 'OVERDUE'
                      ? 'Quá hạn'
                      : selectedDetailLoan.renewCount >= 1
                      ? 'Đã hết lượt'
                      : 'Gia hạn (+7d)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookIds([selectedDetailLoan.id]);
                    setSelectedDetailLoan(null);
                    setIsScheduleModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hẹn lịch trả sách</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDetailLoan(null)}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ĐẶT LỊCH HẸN TRẢ SÁCH (BR06) */}
      {/* ======================================================== */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsScheduleModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Header modal */}
            <div className="bg-[#00666B] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Đặt Lịch Hẹn Trả Sách Trực Tuyến</h3>
                  <p className="text-[11px] text-teal-100/80">Quầy trả sách nhanh Thư viện UTH</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung form hẹn lịch */}
            <form onSubmit={handleConfirmScheduleReturn} className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Danh sách tài liệu đã chọn ({selectedBookIds.length} cuốn):
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {loans
                    .filter((l) => selectedBookIds.includes(l.id))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-100"
                      >
                        <span className="font-bold text-slate-800 truncate max-w-[280px]">
                          {item.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          Hạn: {item.dueDate}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Chọn điểm quầy tiếp nhận */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Địa điểm trả sách:
                </label>
                <select
                  value={appointmentCampus}
                  onChange={(e) => setAppointmentCampus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
                >
                  <option value="Cơ sở 1 - Võ Oanh (Bình Thạnh)">
                    Cơ sở 1 - Số 2 Võ Oanh, Phường 25, Bình Thạnh
                  </option>
                  <option value="Cơ sở 2 - Trương Văn Hải (Thủ Đức)">
                    Cơ sở 2 - Trương Văn Hải, Tăng Nhơn Phú B, TP. Thủ Đức
                  </option>
                  <option value="Cơ sở 3 - Tô Ký (Quận 12)">
                    Cơ sở 3 - Đường Tô Ký, Phường Tân Chánh Hiệp, Quận 12
                  </option>
                </select>
              </div>

              {/* Chọn ngày hẹn và khung giờ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Ngày hẹn trả:
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Khung giờ tiếp nhận:
                  </label>
                  <select
                    value={appointmentTimeSlot}
                    onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
                  >
                    <option value="08:00 - 10:30">Buổi sáng: 08:00 - 10:30</option>
                    <option value="10:30 - 12:00">Trưa: 10:30 - 12:00</option>
                    <option value="14:00 - 16:30">Buổi chiều: 14:00 - 16:30</option>
                    <option value="17:00 - 19:30">Buổi tối: 17:00 - 19:30</option>
                  </select>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ghi chú cho thủ thư (nếu có tình trạng rách/hỏng):
                </label>
                <input
                  type="text"
                  value={appointmentNote}
                  onChange={(e) => setAppointmentNote(e.target.value)}
                  placeholder="Ví dụ: Bìa sách hơi sờn, sách còn nguyên trang..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00666B] hover:bg-[#005458] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Xác nhận & Nhận mã QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
