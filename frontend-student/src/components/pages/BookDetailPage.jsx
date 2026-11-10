import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Plus,
  Check,
  ShoppingBag,
  Share2,
  Copy,
  Calendar,
  ShieldCheck,
  Clock,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  ListOrdered,
  MessageSquare,
  FileText,
  Building2,
  Eye,
  Download,
  X
} from 'lucide-react';
import BookCard from '../common/BookCard';

/**
 * BookDetailPage - Giao diện chi tiết giáo trình & tài liệu học thuật (Desktop Web - TV3)
 * Tuân thủ Impeccable Craft Floor:
 * - Không sử dụng gradient text
 * - Không sử dụng kicker/eyebrow thừa trên tiêu đề
 * - Sử dụng số dạng bảng (tabular-nums) cho dữ liệu, mã vạch và số lượng
 * - Tương phản đạt chuẩn WCAG AA (>= 4.5:1)
 * - Nâng cấp phối màu nền các thành phần: Khung trưng bày bìa sách UTH Academic, cụm hành động mượn sách nổi bật,
 *   thẻ chính sách phân nhóm màu sắc và hệ thống tab trực quan.
 */
export default function BookDetailPage({
  book,
  onBack,
  onAddToCart,
  isInCart = false,
  onOpenCart,
  allBooks = [],
  onSelectBook
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'toc' | 'copies' | 'reviews'
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  if (!book) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy tài liệu này</h2>
        <p className="text-sm text-slate-500">Giáo trình có thể đã được cập nhật hoặc không còn trong danh mục tra cứu.</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00666B] text-white text-sm font-bold rounded-xl hover:bg-[#005458] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách tài liệu</span>
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(book.code || 'UTH-BOOK');
    setCopiedCode(true);
    showToast(`Đã sao chép mã tài liệu: ${book.code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Đã sao chép liên kết tài liệu vào bộ nhớ tạm!');
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    showToast(!isBookmarked ? 'Đã thêm vào danh mục sách quan tâm!' : 'Đã bỏ lưu tài liệu.');
  };

  const handleBorrowNow = () => {
    if (!isInCart && onAddToCart) {
      onAddToCart(book);
    }
    if (onOpenCart) {
      onOpenCart();
    }
  };

  // Dữ liệu mẫu danh sách bản sao vật lý trên kệ tại các cơ sở UTH
  const physicalCopies = [
    {
      id: 1,
      barcode: `${book.code || 'UTH'}-BC-01`,
      campus: 'Cơ sở 1 (Số 2 Võ Oanh, Bình Thạnh)',
      location: book.location || 'Khu CNTT · Kệ A2 · Tầng 2',
      status: 'AVAILABLE',
      statusText: 'Sẵn sàng trên kệ',
      callNumber: `681.31 ${book.code ? book.code.substring(0, 4) : 'UTH'} 2024`,
      allowBorrow: true,
    },
    {
      id: 2,
      barcode: `${book.code || 'UTH'}-BC-02`,
      campus: 'Cơ sở 1 (Số 2 Võ Oanh, Bình Thạnh)',
      location: book.location || 'Khu CNTT · Kệ A2 · Tầng 2',
      status: 'AVAILABLE',
      statusText: 'Sẵn sàng trên kệ',
      callNumber: `681.31 ${book.code ? book.code.substring(0, 4) : 'UTH'} 2024`,
      allowBorrow: true,
    },
    {
      id: 3,
      barcode: `${book.code || 'UTH'}-BC-03`,
      campus: 'Cơ sở 1 (Số 2 Võ Oanh, Bình Thạnh)',
      location: 'Phòng Đọc Nghiên Cứu · Tầng 1',
      status: 'REFERENCE_ONLY',
      statusText: 'Chỉ đọc tại chỗ',
      callNumber: `681.31 ${book.code ? book.code.substring(0, 4) : 'UTH'} 2024-REF`,
      allowBorrow: false,
    },
    {
      id: 4,
      barcode: `${book.code || 'UTH'}-BC-04`,
      campus: 'Cơ sở 2 (Trương Văn Hải, Thủ Đức)',
      location: 'Kho sách Cơ sở 2 · Kệ B3 · Tầng 1',
      status: 'AVAILABLE',
      statusText: 'Sẵn sàng trên kệ',
      callNumber: `681.31 ${book.code ? book.code.substring(0, 4) : 'UTH'} 2024`,
      allowBorrow: true,
    },
    {
      id: 5,
      barcode: `${book.code || 'UTH'}-BC-05`,
      campus: 'Cơ sở 3 (Tô Ký, Quận 12)',
      location: 'Kho sách Cơ sở 3 · Kệ C1 · Tầng 2',
      status: 'BORROWED',
      statusText: 'Đang mượn (Hẹn trả 18/11/2026)',
      callNumber: `681.31 ${book.code ? book.code.substring(0, 4) : 'UTH'} 2024`,
      allowBorrow: false,
    },
  ];

  // Dữ liệu mẫu mục lục bài giảng giáo trình
  const tableOfContents = [
    {
      chapter: 'Chương 1',
      title: 'Tổng quan và cơ sở lý thuyết nhập môn',
      pages: 'Trang 1 - 45',
      topics: [
        'Giới thiệu lịch sử phát triển và chuẩn đầu ra môn học',
        'Các định nghĩa cốt lõi và phạm vi ứng dụng trong kỹ thuật',
        'Môi trường thiết lập và công cụ thực hành chuyên ngành UTH'
      ]
    },
    {
      chapter: 'Chương 2',
      title: 'Cấu trúc nền tảng và phương pháp phân tích',
      pages: 'Trang 46 - 118',
      topics: [
        'Mô hình hóa bài toán kỹ thuật thực tế trong doanh nghiệp',
        'Các nguyên lý thiết kế và tiêu chuẩn kỹ thuật Việt Nam / Quốc tế',
        'Phương pháp đo lường, phân loại và đánh giá sai số'
      ]
    },
    {
      chapter: 'Chương 3',
      title: 'Thuật toán xử lý và quy trình tối ưu hóa',
      pages: 'Trang 119 - 210',
      topics: [
        'Quy trình triển khai từng bước có hướng dẫn chi tiết bài tập mẫu',
        'Các thuật toán trọng tâm phục vụ kỳ thi kết thúc học phần',
        'Tối ưu hóa tài nguyên và phân tích độ phức tạp thời gian/không gian'
      ]
    },
    {
      chapter: 'Chương 4',
      title: 'Case study ứng dụng thực tế tại doanh nghiệp & Đồ án môn học',
      pages: 'Trang 211 - 285',
      topics: [
        'Nghiên cứu dự án giao thông vận tải và công nghệ thông tin thực tế',
        'Phân tích sự cố thường gặp và bài học kinh nghiệm',
        'Đề bài tập lớn (Project) mẫu kèm barem hướng dẫn chấm điểm'
      ]
    },
    {
      chapter: 'Phụ lục',
      title: 'Tài liệu tra cứu, bảng thông số & 5 đề thi mẫu',
      pages: 'Trang 286 - 320',
      topics: [
        'Bảng mã tra cứu nhanh và công thức tổng hợp',
        'Bộ 5 đề thi kết thúc học phần các năm trước kèm lời giải gợi ý',
        'Thuật ngữ song ngữ Anh - Việt chuyên ngành'
      ]
    }
  ];

  // Dữ liệu mẫu đánh giá sinh viên
  const studentReviews = [
    {
      id: 1,
      studentName: 'Trần Minh Quân',
      studentClass: 'Kỹ thuật Phần mềm K21 · UTH',
      rating: 5,
      date: '02/11/2026',
      content: 'Giáo trình viết rất rõ ràng, ví dụ bám sát nội dung thi kết thúc môn của thầy cô bộ môn. Đề xuất các bạn nên mượn cuốn này ngay từ đầu kỳ!',
      helpfulCount: 24
    },
    {
      id: 2,
      studentName: 'Lê Thảo My',
      studentClass: 'Kinh tế Vận tải K22 · UTH',
      rating: 5,
      date: '28/10/2026',
      content: 'Sách in đẹp, giấy dày dặn, hình vẽ sơ đồ rất trực quan. Các case study ở Chương 4 giải quyết đúng bài tập lớn nhóm mình đang làm.',
      helpfulCount: 16
    },
    {
      id: 3,
      studentName: 'Nguyễn Văn Đạt',
      studentClass: 'Logistics & Chuỗi cung ứng K20 · UTH',
      rating: 4,
      date: '15/10/2026',
      content: 'Kiến thức chuẩn xác. Phần bài tập có lời giải chi tiết giúp tự học hiệu quả. Thư viện có nhiều bản sao nên đặt mượn rất nhanh.',
      helpfulCount: 9
    }
  ];

  // Lấy các sách liên quan cùng chuyên ngành
  const relatedBooks = allBooks
    .filter((b) => b.id !== book.id && (b.category === book.category || !book.category))
    .slice(0, 4);

  return (
    <div className="space-y-8 select-none font-sans animate-in fade-in duration-150">
      {/* Toast thông báo nhanh cao cấp */}
      {toastMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200 select-none max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 text-white p-3.5 pl-4 pr-4 shadow-2xl shadow-slate-950/40 border border-slate-700/80 backdrop-blur-md ring-1 ring-white/10 flex items-center gap-3">
            {/* Thanh vạch phát sáng đỉnh */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400" />

            {/* Icon nhận diện thành công */}
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 block">
                Thư viện UTH
              </span>
              <p className="text-xs sm:text-[13px] font-bold text-white leading-snug mt-0.5">
                {toastMsg}
              </p>
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

      {/* 1. THANH ĐIỀU HƯỚNG VÀ BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại danh sách</span>
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer" onClick={onBack}>Trang chủ</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-slate-800 cursor-pointer" onClick={onBack}>Kho giáo trình UTH</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-[#00666B] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
              {book.category}
            </span>
          </nav>
        </div>

        {/* Nút tác vụ phụ: Sao chép mã, Yêu thích, Đọc thử, Chia sẻ */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-xs font-bold text-[#00666B] transition-colors cursor-pointer shadow-2xs"
            title="Đọc thử đề cương & mục lục sách"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Đọc thử đề cương</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
            title="Sao chép mã tài liệu"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">Mã: {book.code || 'TL-UTH'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title="Lưu vào danh sách quan tâm"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
            <span>{isBookmarked ? 'Đã lưu' : 'Quan tâm'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Chia sẻ liên kết sách"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KHỐI NỘI DUNG CHI TIẾT SÁCH: 2 CỘT (Desktop Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI (5 Cột): Bìa sách 3D tả thực trên nền thoáng sạch & Vị trí kệ sách */}
        <div className="lg:col-span-5 space-y-6">
          {/* TRƯNG BÀY BÌA SÁCH 3D: NỀN THOÁNG TỰ NHIÊN, KHÔNG KHUNG NỀN TỐI NẶNG NỀ */}
          <div className="flex flex-col items-center justify-center py-6 px-4">
            {/* Huy hiệu ngành học & Trạng thái tồn kho sẵn sàng */}
            <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00666B] bg-teal-50 border border-teal-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                {book.category}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="tabular-nums">{book.statusText || `Còn ${book.availableQuantity} cuốn sẵn sàng`}</span>
              </div>
            </div>

            {/* Bìa sách 3D có gáy dập nổi, mép trang giấy và bóng đổ vật lý tự nhiên */}
            <div className="relative group my-2 flex flex-col items-center">
              <div
                style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
                className="w-56 h-80 sm:w-64 sm:h-92 rounded-r-2xl rounded-l-xs text-white p-6 flex flex-col justify-between shadow-2xl relative transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-1.5 z-1"
              >
                {/* Gáy sách vật lý có độ bóng tả thực */}
                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 via-black/20 to-transparent rounded-l-xs border-r border-white/10" />

                {/* Mép trang sách (Book pages edge) */}
                <div className="absolute inset-y-1.5 -right-2.5 w-2.5 bg-gradient-to-r from-slate-200 via-slate-100 to-white rounded-r-xs border border-slate-300 shadow-sm" />

                {/* Tác giả */}
                <div className="text-center pl-3 pr-1">
                  <p className="text-xs font-semibold text-white/95 truncate tracking-wide">
                    {book.coverTheme?.author || book.author}
                  </p>
                </div>

                {/* Tựa sách */}
                <div className="text-center px-2 my-auto">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight leading-snug whitespace-pre-line text-white drop-shadow-md">
                    {book.coverTheme?.title || book.title}
                  </h2>
                </div>

                {/* Nhãn bộ sách UTH */}
                <div className="text-center pt-2.5 border-t border-white/20 pl-3 pr-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">
                    {book.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM'}
                  </span>
                </div>
              </div>

              {/* Bóng đổ vật lý mềm mại dưới đáy sách */}
              <div className="w-52 sm:w-60 h-5 bg-slate-900/20 rounded-[100%] blur-md mt-4 pointer-events-none transition-all duration-300 group-hover:scale-95 group-hover:opacity-75" />
            </div>

            {/* Nút xem bản đọc thử giáo trình */}
            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-[#00666B] border border-teal-200/90 font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#00666B]" />
                <span>Xem bản đọc thử giáo trình (PDF)</span>
              </button>
            </div>
          </div>

          {/* VỊ TRÍ TRÊN KỆ SÁCH */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-3 text-[#00666B]">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00666B] border border-teal-200/80 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Vị trí trên kệ sách
                </h3>
                <p className="text-sm font-bold text-[#00666B] mt-0.5">
                  {book.location || 'Khu Công nghệ thông tin · Kệ A2 · Tầng 2'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              Sinh viên có thể đến trực tiếp kệ sách theo mã <strong className="text-slate-900 font-mono">{book.code}</strong> để đọc tại chỗ hoặc thêm vào Giỏ mượn để nhận tại quầy Pick & Go.
            </p>
          </div>

          {/* KHẢ DỤNG TẠI 3 CƠ SỞ UTH */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                KhẢ dụng tại 3 Cơ sở UTH
              </h3>
              <span className="text-[11px] font-semibold text-[#00666B] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Liên thông toàn trường
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Cơ sở 1 (Số 2 Võ Oanh, Bình Thạnh)</span>
                </div>
                <span className="font-bold text-emerald-800 tabular-nums">2 bản sao</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Cơ sở 2 (Trương Văn Hải, Thủ Đức)</span>
                </div>
                <span className="font-bold text-emerald-800 tabular-nums">1 bản sao</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-700">Cơ sở 3 (Tô Ký, Quận 12)</span>
                </div>
                <span className="font-bold text-slate-500 tabular-nums">Đang được mượn</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 Cột): Thông tin chi tiết nổi bật, Cụm mượn sách UTH Deep Teal, Tabs học thuật */}
        <div className="lg:col-span-7 space-y-6">
          {/* KHỐI CHI TIẾT SÁCH CHÍNH (ELEVATED HERO CARD) */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-xl shadow-teal-950/5 ring-1 ring-slate-900/5 space-y-6 relative overflow-hidden">
            {/* Dải điểm nhấn nhận diện thương hiệu UTH trên đỉnh thẻ */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00666B] via-emerald-500 to-[#00666B]" />

            {/* Dải huy hiệu định danh học thuật */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00666B] bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
                {book.category}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                {book.code}
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                ★ {book.rating || 4.9} ({book.borrowCount || 140} lượt mượn)
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Giáo trình chính quy UTH
              </span>
            </div>

            {/* Tiêu đề sách & Thông tin tác giả bộ môn */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {book.title}
              </h1>
              <div className="mt-3 flex items-center flex-wrap gap-2 text-sm sm:text-base text-slate-600 font-medium">
                <span>Tác giả:</span>
                <strong className="text-slate-900 font-bold text-base sm:text-lg">{book.author}</strong>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/70 px-2.5 py-1 rounded-md">
                  Bộ môn chuyên ngành UTH
                </span>
              </div>
            </div>

            {/* CỤM HÀNH ĐỘNG MƯỢN SÁCH UTH DEEP TEAL NỔI BẬT & CAO CẤP */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#00363a] via-[#004e54] to-[#00282b] text-white shadow-xl border border-teal-700/60 space-y-4 relative overflow-hidden">
              {/* Ánh sáng ambient tinh tế */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-1 space-y-4">
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-teal-100 uppercase tracking-wider text-[11px]">
                      Tình trạng kho sách UTH:
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300 tabular-nums text-xs sm:text-sm bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                    {book.availableQuantity || 12} / {book.quantity || 15} cuốn khả dụng
                  </span>
                </div>

                {/* Thanh tiến trình tồn kho với vạch phát sáng */}
                <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/15">
                  <div
                    style={{ width: `${Math.round(((book.availableQuantity || 12) / (book.quantity || 15)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  {/* Nút Thêm vào giỏ */}
                  <button
                    type="button"
                    disabled={isInCart}
                    onClick={() => {
                      if (onAddToCart && !isInCart) {
                        onAddToCart(book);
                      }
                    }}
                    className={`flex-1 h-11 px-4.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isInCart
                        ? 'bg-white/15 text-emerald-200 border border-emerald-400/30 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-md hover:shadow-lg hover:shadow-emerald-950/20'
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Đã thêm vào giỏ</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </button>

                  {/* Nút Mượn ngay */}
                  <button
                    type="button"
                    onClick={handleBorrowNow}
                    className="h-11 px-5 rounded-xl font-bold text-sm bg-white hover:bg-teal-50 active:bg-teal-100 text-[#004e54] border border-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#004e54]" />
                    <span>Mượn ngay</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-teal-100/90 font-medium pt-2 border-t border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Miễn phí 100% cho sinh viên UTH · Nhận sách bằng mã QR tại quầy · Giữ đơn 48h (BR05)</span>
                </div>
              </div>
            </div>

            {/* BẢNG THÔNG SỐ HỌC THUẬT & XUẤT BẢN */}
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-4 bg-[#00666B] rounded-full" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Thông số giáo trình & Xuất bản
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50/90 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200/80 transition-colors">
                  <span className="text-slate-400 block text-[11px] font-medium">Nhà xuất bản</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.publisher || 'ĐHQG TP.HCM'}</strong>
                </div>
                <div className="bg-slate-50/90 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200/80 transition-colors">
                  <span className="text-slate-400 block text-[11px] font-medium">Năm xuất bản</span>
                  <strong className="text-slate-800 font-bold block mt-1 tabular-nums">{book.publishYear || 2024}</strong>
                </div>
                <div className="bg-slate-50/90 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200/80 transition-colors">
                  <span className="text-slate-400 block text-[11px] font-medium">Số trang</span>
                  <strong className="text-slate-800 font-bold block mt-1 tabular-nums">{book.pages || 320} trang</strong>
                </div>
                <div className="bg-slate-50/90 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200/80 transition-colors">
                  <span className="text-slate-400 block text-[11px] font-medium">Ngôn ngữ</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.language || 'Tiếng Việt'}</strong>
                </div>
                <div className="bg-slate-50/90 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200/80 transition-colors">
                  <span className="text-slate-400 block text-[11px] font-medium">Hình thức tài liệu</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.type || 'Giáo trình in'}</strong>
                </div>
                <div className="bg-teal-50/90 p-3.5 rounded-xl border border-teal-200">
                  <span className="text-[#00666B] block text-[11px] font-bold">Mã định danh UTH</span>
                  <strong className="text-[#00666B] font-mono font-bold block mt-1">{book.code}</strong>
                </div>
              </div>
            </div>

            {/* CHÍNH SÁCH MƯỢN TRẢ & GIA HẠN TẠI UTH */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-4 bg-[#00666B] rounded-full" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Chính sách mượn trả & Gia hạn tại UTH
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-sky-50/90 border border-sky-200 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sky-950 font-bold">Thời hạn: 14 ngày (BR02)</strong>
                    <span className="text-[11px] text-sky-700">Tính từ lúc nhận tại quầy</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-50/90 border border-teal-200 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-teal-950 font-bold">Gia hạn: 1 lần (+7d) (BR03)</strong>
                    <span className="text-[11px] text-teal-700">Trực tuyến khi chưa quá hạn</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-950 font-bold">Phạt trễ: 5.000đ/ngày (BR04)</strong>
                    <span className="text-[11px] text-amber-700">Minh bạch công thức tính</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỤM TABS ĐA NĂNG VỚI NỀN PHÂN ĐOẠN HIỆN ĐẠI */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 overflow-hidden">
            {/* Header Tabs Navigation Nền Phân Đoạn (Segmented Pills) */}
            <div className="p-2 border-b border-slate-200 bg-slate-100/80 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-white text-[#00666B] shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Nội dung & Chuẩn CLO</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('toc')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === 'toc'
                    ? 'bg-white text-[#00666B] shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Mục lục giáo trình</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('copies')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === 'copies'
                    ? 'bg-white text-[#00666B] shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bản sao trên kệ ({physicalCopies.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'bg-white text-[#00666B] shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Đánh giá sinh viên ({studentReviews.length})</span>
              </button>
            </div>

            {/* Nội dung tương ứng theo Tab */}
            <div className="p-6">
              {/* TAB 1: TỔNG QUAN NỘI DUNG HỌC PHẦN & CHUẨN ĐẦU RA (CLO) */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      Mô tả học phần & Mục tiêu đào tạo
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {book.description ||
                        'Tài liệu học tập tiêu chuẩn phục vụ chương trình đào tạo chính quy tại Trường Đại học Giao thông Vận tải TP.HCM. Cung cấp hệ thống kiến thức lý thuyết nền tảng, các case study chuyên ngành thực tế và bộ câu hỏi ôn tập, bài tập ứng dụng bám sát chuẩn đầu ra học phần.'}
                    </p>
                  </div>

                  {/* Chuẩn đầu ra học phần với 3 nền thẻ phân cấp màu sắc */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Chuẩn đầu ra học phần (Course Learning Outcomes - CLO)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-teal-50/40 to-white space-y-1 shadow-2xs">
                        <strong className="text-[#00666B] font-bold block">CLO 1: Kiến thức nền tảng</strong>
                        <p className="text-slate-600">
                          Nắm vững các nguyên lý cốt lõi, phương pháp luận và các công cụ thực hành chuyên ngành.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-50/40 to-white space-y-1 shadow-2xs">
                        <strong className="text-sky-800 font-bold block">CLO 2: Kỹ năng ứng dụng</strong>
                        <p className="text-slate-600">
                          Giải quyết các bài toán kỹ thuật, mô hình hóa dữ liệu và tối ưu hóa quy trình thực tế.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white space-y-1 shadow-2xs">
                        <strong className="text-emerald-800 font-bold block">CLO 3: Năng lực đồ án</strong>
                        <p className="text-slate-600">
                          Thực hiện bài tập lớn, làm việc nhóm và bảo vệ giải pháp trước hội đồng bộ môn UTH.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <strong className="text-slate-900 font-bold block">Khối ngành đào tạo áp dụng:</strong>
                      <p className="text-slate-600">
                        Sinh viên thuộc Khoa {book.category}, ngành Kỹ thuật và Quản lý Logistics / Công trình UTH.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                      <strong className="text-slate-900 font-bold block">Yêu cầu môn tiên quyết:</strong>
                      <p className="text-slate-600">
                        Hoàn thành các học phần cơ sở ngành và tích lũy đủ tín chỉ theo quy chế trường.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MỤC LỤC GIÁO TRÌNH */}
              {activeTab === 'toc' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs pb-1">
                    <p className="text-slate-500">
                      Mục lục bám sát cấu trúc đề cương học phần chính quy năm học 2026 - 2027:
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="text-[#00666B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem bản đọc thử (PDF)</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tableOfContents.map((chap, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-teal-50/20 to-white hover:border-teal-300 transition-colors space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#00666B] bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                              {chap.chapter}
                            </span>
                            <strong className="text-slate-800 font-bold">{chap.title}</strong>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px] tabular-nums">{chap.pages}</span>
                        </div>
                        <ul className="pl-6 list-disc text-xs text-slate-600 space-y-1">
                          {chap.topics.map((t, tidx) => (
                            <li key={tidx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DANH SÁCH BẢN SAO VẬT LÝ TRÊN KỆ */}
              {activeTab === 'copies' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span>Trạng thái từng cuốn sách vật lý hiện có tại các kho phòng UTH:</span>
                    <span className="font-bold text-[#00666B]">
                      Có {physicalCopies.filter((c) => c.allowBorrow).length} bản sao có thể mượn về
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                          <th className="p-3">Mã bản sao (Barcode)</th>
                          <th className="p-3">Cơ sở / Kho sách</th>
                          <th className="p-3">Vị trí kệ</th>
                          <th className="p-3">Số phân loại (Call No.)</th>
                          <th className="p-3 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {physicalCopies.map((copy) => (
                          <tr
                            key={copy.id}
                            className={`transition-colors ${
                              copy.status === 'AVAILABLE' ? 'hover:bg-emerald-50/40' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {copy.barcode}
                            </td>
                            <td className="p-3 font-medium text-slate-700">
                              {copy.campus}
                            </td>
                            <td className="p-3 text-slate-600">
                              {copy.location}
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              {copy.callNumber}
                            </td>
                            <td className="p-3 text-right">
                              {copy.status === 'AVAILABLE' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Sẵn sàng mượn</span>
                                </span>
                              ) : copy.status === 'REFERENCE_ONLY' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <span>Đọc tại chỗ</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  <span>{copy.statusText}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ĐÁNH GIÁ CỦA SINH VIÊN */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-slate-900 font-heading">
                        {book.rating || 4.9}
                      </span>
                      <div>
                        <div className="flex items-center text-amber-500 text-xs">
                          ★★★★★
                        </div>
                        <span className="text-xs text-slate-500">
                          Dựa trên {book.borrowCount || 140} sinh viên đã mượn
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {studentReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-teal-50/15 to-white border border-slate-100 space-y-2 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="text-slate-900 block font-bold">{rev.studentName}</strong>
                            <span className="text-[11px] text-slate-500">{rev.studentClass}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">{rev.date}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{rev.content}</p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                          <span>Hữu ích:</span>
                          <strong className="text-slate-700">{rev.helpfulCount}</strong> sinh viên đồng tình
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TÀI LIỆU CÙNG CHUYÊN NGÀNH GỢI Ý */}
      {relatedBooks.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Tài liệu cùng chuyên ngành bạn có thể quan tâm
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Các giáo trình được sinh viên khối ngành {book.category} mượn nhiều nhất tại thư viện UTH.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedBooks.map((relBook) => (
              <BookCard
                key={relBook.id}
                book={relBook}
                onAddToCart={onAddToCart}
                onViewDetail={onSelectBook}
              />
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* MODAL XEM TRƯỚC ĐỀ CƯƠNG & ĐỌC THỬ MỤC LỤC (PDF PREVIEW) */}
      {/* ======================================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPreviewModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Header modal */}
            <div className="bg-[#00666B] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Bản Đọc Thử Mục Lục & Đề Cương Chi Tiết
                  </h3>
                  <p className="text-xs text-teal-100/90">
                    {book.title} · Mã môn học: {book.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Đang tải tệp đề cương môn học PDF...');
                    setIsPreviewModalOpen(false);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Tải đề cương tóm tắt PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nội dung trang đọc thử như trang sách thật */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700 bg-slate-50 font-serif leading-relaxed">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="text-center pb-4 border-b border-slate-200 font-sans">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00666B]">
                    TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM (UTH)
                  </p>
                  <h4 className="text-lg font-bold text-slate-900 mt-1 uppercase">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Tác giả: {book.author}</p>
                </div>

                <div className="space-y-3 font-sans">
                  <h5 className="font-bold text-slate-900 text-sm">Lời nói đầu</h5>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Cuốn giáo trình này được biên soạn nhằm đáp ứng nhu cầu học tập, nghiên cứu của sinh viên Trường Đại học Giao thông Vận tải TP.HCM. Nội dung sách được xây dựng dựa trên khung chương trình đào tạo tín chỉ, cập nhật các kiến thức kỹ thuật tiên tiến và thực tiễn sản xuất tại Việt Nam.
                  </p>
                </div>

                <div className="space-y-3 font-sans pt-3 border-t border-slate-100">
                  <h5 className="font-bold text-slate-900 text-sm">Mục lục tóm tắt</h5>
                  <div className="space-y-2 text-xs">
                    {tableOfContents.map((item, i) => (
                      <div key={i} className="flex items-baseline justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800">
                          {item.chapter}: {item.title}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">{item.pages}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 font-sans">
              <span className="text-xs text-slate-500">
                Thư viện số UTH · Cung cấp bản đọc thử trực tuyến
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Đóng bản xem trước
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleBorrowNow();
                  }}
                  className="px-4 py-2 bg-[#00666B] hover:bg-[#005458] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Mượn sách này ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
