import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  RotateCcw,
  Printer,
  Download,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ArrowUpDown,
  ChevronDown,
  X,
  Receipt,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  CreditCard,
  Check
} from 'lucide-react';

/**
 * Dữ liệu lịch sử mượn trả & đối soát nợ phạt mẫu chuẩn cho Sinh viên UTH (TV3 - Desktop)
 * Tuân thủ đầy đủ quy tắc nghiệp vụ:
 * - BR02: Thời gian mượn tiêu chuẩn 14 ngày.
 * - BR04: Phạt trễ hạn 5.000 VNĐ / ngày / cuốn.
 * - Đối soát minh bạch 100% kèm mã biên lai giao dịch quầy.
 */
const MOCK_HISTORY_RECORDS = [
  {
    id: 'H-01',
    orderCode: 'PM-UTH-2026-061',
    receiptCode: 'BL-UTH-26-8812',
    title: 'Giải tích 1 - Giáo trình Đại học Giao thông Vận tải',
    code: 'CB-GT1-012',
    author: 'TS. Đặng Văn Minh',
    category: 'CƠ BẢN',
    semester: 'HK1 (2026 - 2027)',
    borrowDate: '10/10/2026',
    dueDate: '24/10/2026',
    actualReturnDate: '23/10/2026',
    campusCode: 'CS1',
    campus: 'Cơ sở 1 (Bình Thạnh)',
    deskCounter: 'Quầy Pick & Go · Tầng trệt Tòa H1',
    librarian: 'Nguyễn Thị Mai (Mã: TT-04)',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'ON_TIME', // ON_TIME | LATE | CANCELLED
    bookCondition: 'Sách hoàn hảo, nguyên vẹn tem mã vạch',
    note: 'Sinh viên hoàn trả trước hạn 1 ngày tại trạm quét quầy CS1.',
  },
  {
    id: 'H-02',
    orderCode: 'PM-UTH-2026-048',
    receiptCode: 'BL-UTH-26-8204',
    title: 'Cơ sở dữ liệu phân tán & SQL Server chuyên sâu',
    code: 'CNTT-DB-009',
    author: 'ThS. Hoàng Anh Tuấn',
    category: 'CÔNG NGHỆ THÔNG TIN',
    semester: 'HK1 (2026 - 2027)',
    borrowDate: '22/09/2026',
    dueDate: '06/10/2026',
    actualReturnDate: '09/10/2026',
    campusCode: 'CS1',
    campus: 'Cơ sở 1 (Bình Thạnh)',
    deskCounter: 'Quầy tiếp nhận trung tâm · Tòa H1',
    librarian: 'Trần Văn Hùng (Mã: TT-02)',
    overdueDays: 3,
    fineAmount: 15000, // 3 ngày * 5.000 VNĐ (BR04)
    finePaid: true,
    paymentMethod: 'Chuyển khoản VietQR',
    status: 'LATE',
    bookCondition: 'Tốt, không gãy gáy, trang sách sạch sẽ',
    note: 'Quá hạn 3 ngày theo quy định BR04 (5.000đ/ngày). Đã thanh toán và xóa nợ phạt trên hệ thống.',
  },
  {
    id: 'H-03',
    orderCode: 'PM-UTH-2026-035',
    receiptCode: 'BL-UTH-26-7641',
    title: 'Vận tải đa phương thức & Khai thác Cảng biển hiện đại',
    code: 'LG-VT-015',
    author: 'PGS.TS Nguyễn Hữu Phước',
    category: 'LOGISTICS & VẬN TẢI',
    semester: 'HK1 (2026 - 2027)',
    borrowDate: '05/09/2026',
    dueDate: '19/09/2026',
    actualReturnDate: '18/09/2026',
    campusCode: 'CS2',
    campus: 'Cơ sở 2 (Thủ Đức)',
    deskCounter: 'Quầy Giáo trình Kỹ thuật · Tòa D',
    librarian: 'Lê Hoàng Yến (Mã: TT-07)',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'ON_TIME',
    bookCondition: 'Nguyên bản, đầy đủ đĩa CD đính kèm',
    note: 'Trả đúng hạn tại Cơ sở 2, hoàn tất thủ tục trong 20 giây.',
  },
  {
    id: 'H-04',
    orderCode: 'DH-UTH-2026-029',
    receiptCode: '—',
    title: 'Kinh tế vận tải biển quốc tế & Incoterms',
    code: 'KT-VTB-007',
    author: 'TS. Vũ Thị Lan',
    category: 'KINH TẾ',
    semester: 'HK1 (2026 - 2027)',
    borrowDate: '28/08/2026',
    dueDate: '—',
    actualReturnDate: '—',
    campusCode: 'CS3',
    campus: 'Cơ sở 3 (Quận 12)',
    deskCounter: 'Phòng đọc số · Tòa đa năng',
    librarian: '—',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'CANCELLED',
    bookCondition: '—',
    note: 'Sinh viên hủy lịch hẹn mượn trước giờ lấy sách, kho đã hoàn trả tồn kho tự động.',
  },
  {
    id: 'H-05',
    orderCode: 'PM-UTH-2026-018',
    receiptCode: 'BL-UTH-26-6910',
    title: 'Lập trình Web với ReactJS, NodeJS & REST API',
    code: 'CNTT-WEB-021',
    author: 'ThS. Đỗ Quang Hưng',
    category: 'CÔNG NGHỆ THÔNG TIN',
    semester: 'HK2 (2025 - 2026)',
    borrowDate: '14/05/2026',
    dueDate: '28/05/2026',
    actualReturnDate: '27/05/2026',
    campusCode: 'CS1',
    campus: 'Cơ sở 1 (Bình Thạnh)',
    deskCounter: 'Quầy Pick & Go · Tòa H1',
    librarian: 'Nguyễn Thị Mai (Mã: TT-04)',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'ON_TIME',
    bookCondition: 'Tốt, không ghi chú bẩn vào sách',
    note: 'Trả đúng hạn tại quầy tự động.',
  },
  {
    id: 'H-06',
    orderCode: 'PM-UTH-2026-004',
    receiptCode: 'BL-UTH-26-5992',
    title: 'Tiếng Anh chuyên ngành Kỹ thuật & Giao thông Vận tải',
    code: 'NN-TA-003',
    author: 'ThS. Nguyễn Thị Thu Trang',
    category: 'NGOẠI NGỮ',
    semester: 'HK2 (2025 - 2026)',
    borrowDate: '02/04/2026',
    dueDate: '23/04/2026', // Đã gia hạn 1 lần 7 ngày (14 + 7 = 21 ngày)
    actualReturnDate: '25/04/2026',
    campusCode: 'CS1',
    campus: 'Cơ sở 1 (Bình Thạnh)',
    deskCounter: 'Quầy tiếp nhận trung tâm · Tòa H1',
    librarian: 'Trần Văn Hùng (Mã: TT-02)',
    overdueDays: 2,
    fineAmount: 10000, // 2 ngày * 5.000 VNĐ
    finePaid: true,
    paymentMethod: 'Ví MoMo / Quét QR',
    status: 'LATE',
    bookCondition: 'Tốt, có gia hạn trực tuyến 1 lần trước đó',
    note: 'Sách đã gia hạn 1 lần (+7 ngày theo BR03). Quá hạn 2 ngày tính từ hạn gia hạn, đã đối soát.',
  },
  {
    id: 'H-07',
    orderCode: 'PM-UTH-2025-112',
    receiptCode: 'BL-UTH-25-4310',
    title: 'Quản trị Logistics chuỗi cung ứng hàng lạnh',
    code: 'LG-SCM-008',
    author: 'TS. Lê Hoàng Nam',
    category: 'LOGISTICS & VẬN TẢI',
    semester: 'HK1 (2025 - 2026)',
    borrowDate: '15/11/2025',
    dueDate: '29/11/2025',
    actualReturnDate: '28/11/2025',
    campusCode: 'CS3',
    campus: 'Cơ sở 3 (Quận 12)',
    deskCounter: 'Quầy tiếp nhận Cơ sở 3',
    librarian: 'Phạm Minh Trí (Mã: TT-09)',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: 'ON_TIME',
    bookCondition: 'Tốt, sách bao bọc kỹ',
    note: 'Hoàn trả đúng hẹn.',
  },
];

const STATUS_CONFIG = {
  ALL: { label: 'Tất cả trạng thái' },
  ON_TIME: {
    label: 'Trả đúng hạn',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  LATE: {
    label: 'Trả trễ hạn (Có phí phạt)',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: 'Đã hủy đơn',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: XCircle,
  },
};

const SEMESTERS = [
  'Tất cả học kỳ',
  'HK1 (2026 - 2027)',
  'HK2 (2025 - 2026)',
  'HK1 (2025 - 2026)',
];

const CAMPUSES = [
  { code: 'ALL', label: 'Tất cả 3 cơ sở UTH' },
  { code: 'CS1', label: 'Cơ sở 1 (Bình Thạnh)' },
  { code: 'CS2', label: 'Cơ sở 2 (Thủ Đức)' },
  { code: 'CS3', label: 'Cơ sở 3 (Quận 12)' },
];

/**
 * Component Bảng Lịch sử Mượn trả & Đối soát nợ phạt cho Desktop (TV3)
 */
export default function LoanHistoryTableViewPC({ onBorrowAgain, onShowToast }) {
  const [historyList] = useState(MOCK_HISTORY_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('Tất cả học kỳ');
  const [selectedCampus, setSelectedCampus] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null); // Bản ghi đang xem biên nhận
  const [sortField, setSortField] = useState('borrowDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Thống kê nhanh chỉ số học thuật
  const stats = useMemo(() => {
    const total = historyList.length;
    const onTime = historyList.filter((item) => item.status === 'ON_TIME').length;
    const late = historyList.filter((item) => item.status === 'LATE').length;
    const totalFinePaid = historyList.reduce((acc, cur) => acc + (cur.fineAmount || 0), 0);
    const onTimeRate = total > 0 ? Math.round((onTime / (total - 1)) * 100) : 100;

    return { total, onTime, late, totalFinePaid, onTimeRate };
  }, [historyList]);

  // Bộ lọc dữ liệu
  const filteredList = useMemo(() => {
    return historyList.filter((item) => {
      // 1. Lọc theo trạng thái
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      // 2. Lọc theo học kỳ
      if (selectedSemester !== 'Tất cả học kỳ' && item.semester !== selectedSemester) return false;

      // 3. Lọc theo cơ sở
      if (selectedCampus !== 'ALL' && item.campusCode !== selectedCampus) return false;

      // 4. Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchOrder = item.orderCode.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        const matchReceipt = item.receiptCode.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchOrder && !matchAuthor && !matchReceipt) {
          return false;
        }
      }

      return true;
    });
  }, [historyList, selectedStatus, selectedSemester, selectedCampus, searchQuery]);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. HERO BANNER HỌC THUẬT & ĐỐI SOÁT UTH */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-teal-800/40 bg-gradient-to-r from-[#00383b] via-[#004e53] to-[#00282b] text-white p-6 sm:p-8 lg:p-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden="true"
        />

        <div className="relative z-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold backdrop-blur-md">
              <History className="w-3.5 h-3.5 text-teal-300" />
              <span>Hồ Sơ Mượn Trả Toàn Khóa · Thư Viện Đại Học GTVT TP.HCM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight leading-tight">
              Lịch Sử Mượn Trả & Đối Soát Nợ Phạt
            </h1>
            <p className="text-sm text-teal-100/90 leading-relaxed font-medium">
              Theo dõi chi tiết các đợt mượn tài liệu, kiểm tra đối soát phí phạt quá hạn theo quy định BR04 (5.000đ/ngày) và lưu trữ biên nhận điện tử tại quầy tiếp nhận UTH.
            </p>
          </div>

          {/* Cụm KPI Badge nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
              <span className="text-[11px] font-bold text-teal-200 block uppercase tracking-wider">Lượt mượn</span>
              <span className="text-2xl font-black text-white mt-0.5 block">{stats.total}</span>
              <span className="text-[10px] text-teal-300">Hoàn tất thủ tục</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
              <span className="text-[11px] font-bold text-emerald-300 block uppercase tracking-wider">Đúng hạn</span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{stats.onTimeRate}%</span>
              <span className="text-[10px] text-teal-300">Đạt chuẩn KPI</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center col-span-2 sm:col-span-1 min-w-[130px]">
              <span className="text-[11px] font-bold text-teal-200 block uppercase tracking-wider">Dư nợ phạt</span>
              <span className="text-2xl font-black text-white mt-0.5 block">0 đ</span>
              <span className="text-[10px] text-emerald-300 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Đủ điều kiện BR01
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC ĐA CHIỀU (DESKTOP CONTROLS) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Ô tìm kiếm thông minh */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên giáo trình, tác giả, mã sách, mã đơn (PM-...) hoặc mã biên lai..."
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] bg-slate-50/60 hover:bg-white transition-all font-medium placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Các bộ lọc chuyên nghiệp */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lọc theo Học kỳ */}
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00666B]/20 cursor-pointer shadow-2xs"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Lọc theo Cơ sở UTH */}
            <div className="relative">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00666B]/20 cursor-pointer shadow-2xs"
              >
                {CAMPUSES.map((cam) => (
                  <option key={cam.code} value={cam.code}>{cam.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Lọc theo Trạng thái mượn trả */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00666B]/20 cursor-pointer shadow-2xs"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ON_TIME">Trả đúng hạn</option>
                <option value="LATE">Trả trễ hạn</option>
                <option value="CANCELLED">Đã hủy đơn</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Nút đặt lại bộ lọc */}
            {(searchQuery || selectedStatus !== 'ALL' || selectedSemester !== 'Tất cả học kỳ' || selectedCampus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('ALL');
                  setSelectedSemester('Tất cả học kỳ');
                  setSelectedCampus('ALL');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                title="Đặt lại toàn bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Tóm tắt số lượng kết quả */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Tìm thấy <strong>{filteredList.length}</strong> hồ sơ mượn trả phù hợp.
          </span>
          <span className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dữ liệu đã đối soát 100% với hệ thống máy chủ thư viện
          </span>
        </div>
      </section>

      {/* 3. BẢNG DỮ LIỆU ĐỐI SOÁT CHUẨN DESKTOP (DATA TABLE) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#00666B] flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy hồ sơ mượn trả nào</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có kết quả khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Thử chọn "Tất cả học kỳ" hoặc xóa từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200/80">
                  <th className="py-4 px-4 sm:px-6">Mã Giao Dịch</th>
                  <th className="py-4 px-4">Tài Liệu Giáo Trình</th>
                  <th className="py-4 px-4">Tiến Độ Mượn - Trả</th>
                  <th className="py-4 px-4">Điểm Phục Vụ</th>
                  <th className="py-4 px-4">Đối Soát Phạt (BR04)</th>
                  <th className="py-4 px-4 text-center">Trạng Thái</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredList.map((record) => {
                  const statusInfo = STATUS_CONFIG[record.status] || STATUS_CONFIG.ALL;
                  const StatusIcon = statusInfo.icon || CheckCircle2;

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-teal-50/30 transition-colors group"
                    >
                      {/* Cột 1: Mã đơn & Mã biên nhận */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-[#00666B] transition-colors block text-xs">
                            {record.orderCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Học kỳ: {record.semester}
                          </span>
                          {record.receiptCode !== '—' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded">
                              <Receipt className="w-3 h-3" /> {record.receiptCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 2: Tên sách & Tác giả */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#00666B] bg-[#e0eff0] px-2 py-0.5 rounded-full border border-teal-200/60 inline-block">
                            {record.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2">
                            {record.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>Tác giả: <strong className="text-slate-700">{record.author}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{record.code}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 3: Quá trình Mượn - Trả */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>Mượn: <strong className="text-slate-800 font-mono">{record.borrowDate}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Hạn trả: <strong className="text-slate-800 font-mono">{record.dueDate}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Trả thực tế: <strong className="text-emerald-700 font-mono">{record.actualReturnDate}</strong></span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: Cơ sở & Thủ thư */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-[#00666B] shrink-0" />
                            <span>{record.campus}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {record.deskCounter}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Thủ thư: {record.librarian}
                          </span>
                        </div>
                      </td>

                      {/* Cột 5: Đối soát tiền phạt */}
                      <td className="py-4 px-4 align-top">
                        {record.status === 'LATE' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-xs">
                              Quá hạn {record.overdueDays} ngày
                            </span>
                            <div className="font-bold text-xs text-rose-600">
                              {record.fineAmount.toLocaleString('vi-VN')} VNĐ
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã nộp ({record.paymentMethod})
                            </span>
                          </div>
                        ) : record.status === 'CANCELLED' ? (
                          <span className="text-slate-400 text-xs italic">Không phát sinh</span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-emerald-700 font-bold text-xs">0 VNĐ</span>
                            <span className="text-[10px] text-slate-400 block">Không quá hạn</span>
                          </div>
                        )}
                      </td>

                      {/* Cột 6: Trạng thái */}
                      <td className="py-4 px-4 align-top text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Cột 7: Thao tác */}
                      <td className="py-4 px-4 sm:px-6 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Xem biên nhận */}
                          {record.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(record)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#00666B] hover:border-teal-300 hover:bg-teal-50/60 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                              title="Xem chi tiết biên nhận điện tử"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Biên lai</span>
                            </button>
                          )}

                          {/* Nút Mượn lại */}
                          {onBorrowAgain && record.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => onBorrowAgain(record)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#00666B] text-white hover:bg-[#005256] font-bold text-xs transition-colors cursor-pointer shadow-xs"
                              title="Thêm cuốn sách này vào giỏ mượn để mượn lại"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Mượn lại</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. MODAL BIÊN LAI ĐỐI SOÁT ĐIỆN TỬ (RECEIPT MODAL) - Portal phủ 100% viewport */}
      {selectedReceipt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none animate-in fade-in duration-150">
          {/* Lớp nền click outside để đóng */}
          <div
            className="fixed inset-0"
            onClick={() => setSelectedReceipt(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[92vh]">
            {/* Header Biên lai */}
            <div className="bg-[#00666B] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Biên Nhận Mượn Trả Tài Liệu</h3>
                  <p className="text-[11px] text-teal-200">Thư viện Đại học Giao thông Vận tải TP.HCM (UTH)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung Biên lai mô phỏng hóa đơn đối soát thực tế - cuộn mượt khi màn hình nhỏ */}
            <div className="p-6 space-y-5 text-xs text-slate-700 bg-white overflow-y-auto flex-1">
              {/* Thẻ mã biên lai & thời gian */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">MÃ BIÊN LAI</span>
                  <span className="text-sm font-black font-mono text-slate-900">{selectedReceipt.receiptCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">MÃ ĐƠN MƯỢN</span>
                  <span className="text-xs font-bold font-mono text-[#00666B]">{selectedReceipt.orderCode}</span>
                </div>
              </div>

              {/* Thông tin sinh viên & thủ thư */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sinh viên:</span>
                  <span className="font-bold text-slate-800">Nguyễn Thành Luân (MSSV: 2251120000)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Điểm tiếp nhận:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.campus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quầy thủ thư:</span>
                  <span className="font-medium text-slate-700">{selectedReceipt.deskCounter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thủ thư bàn giao:</span>
                  <span className="font-medium text-slate-700">{selectedReceipt.librarian}</span>
                </div>
              </div>

              {/* Chi tiết tài liệu */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Chi tiết tài liệu</span>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                  <div className="w-8 h-10 rounded bg-[#00666B] text-white flex items-center justify-center text-[8px] font-black shrink-0 shadow-xs">
                    UTH
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">{selectedReceipt.title}</h5>
                    <p className="text-[11px] text-slate-500">{selectedReceipt.author} • Mã: {selectedReceipt.code}</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">Tình trạng: {selectedReceipt.bookCondition}</p>
                  </div>
                </div>
              </div>

              {/* Tiến độ và Tiền phạt đối soát */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Ngày mượn:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.borrowDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hạn trả quy định (BR02):</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.dueDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ngày hoàn trả thực tế:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedReceipt.actualReturnDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Số ngày trễ hạn:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.overdueDays} ngày</span>
                </div>
                <div className="flex justify-between text-slate-900 pt-2 border-t border-slate-200 text-sm font-bold">
                  <span>Tiền phạt đối soát (BR04):</span>
                  <span className={selectedReceipt.fineAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    {selectedReceipt.fineAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                {selectedReceipt.fineAmount > 0 && (
                  <div className="text-right text-[11px] text-emerald-700 font-bold">
                    ✓ Đã thanh toán đầy đủ ({selectedReceipt.paymentMethod})
                  </div>
                )}
              </div>

              {/* Nút Thao tác in & tải */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00666B] text-white hover:bg-[#005458] font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In biên nhận</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
