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
  Clock,
  Bookmark,
  CheckCircle2,
  FileText,
  Building2,
  Star,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import BookCard from '../components/common/BookCard';

/**
 * BookDetailPage - Giao diện Chi tiết giáo trình & Tài liệu học thuật (Mobile Web & Tablet < 1024px - TV2)
 *
 * Yêu cầu cốt lõi:
 * 1. Bố cục cuộn 1 cột (Single-column vertical scroll) tối ưu hoàn toàn cho màn hình di động 375px đến 1023px.
 * 2. Bìa sách 3D vật lý chuẩn nhận diện Thư viện UTH kết hợp thông số tài liệu tra cứu.
 * 3. Thẻ vị trí kệ sách cụ thể (Khu vực, Kệ A1-A2, Tầng) và tình trạng khả dụng liên thông 3 cơ sở UTH.
 * 4. Hệ thống 4 tab nội dung trực quan: Tổng quan, Mục lục, Bản sao tại 3 cơ sở, Đánh giá sinh viên.
 * 5. Danh mục 4 quy định cốt lõi UTH (BR01 tối đa 5 cuốn, BR02 14 ngày, BR03 gia hạn +7 ngày, BR04 phạt quá hạn).
 * 6. Khối sách cùng chuyên ngành đề xuất (Related Books).
 * 7. NÚT THÊM GIỎ MƯỢN DÍNH ĐÁY (Sticky Bottom Bar) luôn nổi ở đáy màn hình kèm nút Mượn ngay và xem giỏ.
 */
export default function BookDetailPage({
  book,
  onBack,
  onGoHome,
  onAddToCart,
  isInCart = false,
  onOpenCart,
  allBooks = [],
  onSelectBook,
  cartCount = 0,
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'toc' | 'copies' | 'reviews'
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  if (!book) {
    return (
      <div className="py-24 text-center space-y-4 px-4 select-none">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy tài liệu này</h2>
        <p className="text-xs text-slate-500">
          Giáo trình có thể đã được cập nhật hoặc không còn trong danh mục tra cứu thư viện.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00666B] text-white text-xs font-bold rounded-xl hover:bg-[#005458] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách tài liệu</span>
        </button>
      </div>
    );
  }

  // Sao chép mã tài liệu
  const handleCopyCode = () => {
    navigator.clipboard?.writeText(book.code || 'UTH-BOOK');
    setCopiedCode(true);
    showToast(`Đã sao chép mã tài liệu: ${book.code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Chia sẻ liên kết
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Đã sao chép liên kết tài liệu vào bộ nhớ tạm!');
  };

  // Lưu sách quan tâm
  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    showToast(!isBookmarked ? 'Đã thêm vào danh mục sách quan tâm!' : 'Đã bỏ lưu tài liệu.');
  };

  // Thêm vào giỏ mượn
  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(book);
    }
  };

  // Đặt mượn ngay (thêm giỏ và mở giỏ)
  const handleBorrowNow = () => {
    if (!isInCart && onAddToCart) {
      onAddToCart(book);
    }
    if (onOpenCart) {
      onOpenCart();
    }
  };

  // Dữ liệu mẫu danh sách bản sao vật lý trên kệ tại 3 cơ sở UTH
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
        'Môi trường thiết lập và công cụ thực hành chuyên ngành UTH',
      ],
    },
    {
      chapter: 'Chương 2',
      title: 'Cấu trúc nền tảng và phương pháp phân tích',
      pages: 'Trang 46 - 118',
      topics: [
        'Mô hình hóa bài toán kỹ thuật thực tế trong doanh nghiệp',
        'Các nguyên lý thiết kế và tiêu chuẩn kỹ thuật Việt Nam / Quốc tế',
        'Phương pháp đo lường, phân loại và đánh giá sai số',
      ],
    },
    {
      chapter: 'Chương 3',
      title: 'Thuật toán xử lý và quy trình tối ưu hóa',
      pages: 'Trang 119 - 210',
      topics: [
        'Quy trình triển khai từng bước có hướng dẫn chi tiết bài tập mẫu',
        'Các thuật toán trọng tâm phục vụ kỳ thi kết thúc học phần',
        'Tối ưu hóa tài nguyên và phân tích độ phức tạp thời gian/không gian',
      ],
    },
    {
      chapter: 'Chương 4',
      title: 'Case study ứng dụng thực tế & Đồ án môn học',
      pages: 'Trang 211 - 285',
      topics: [
        'Nghiên cứu dự án giao thông vận tải và công nghệ thông tin thực tế',
        'Phân tích sự cố thường gặp và bài học kinh nghiệm',
        'Đề bài tập lớn (Project) mẫu kèm barem hướng dẫn chấm điểm',
      ],
    },
    {
      chapter: 'Phụ lục',
      title: 'Tài liệu tra cứu, bảng thông số & 5 đề thi mẫu',
      pages: 'Trang 286 - 320',
      topics: [
        'Bảng mã tra cứu nhanh và công thức tổng hợp',
        'Bộ 5 đề thi kết thúc học phần các năm trước kèm lời giải gợi ý',
        'Thuật ngữ song ngữ Anh - Việt chuyên ngành',
      ],
    },
  ];

  // Dữ liệu mẫu đánh giá sinh viên UTH
  const studentReviews = [
    {
      id: 1,
      studentName: 'Trần Minh Quân',
      studentClass: 'Kỹ thuật Phần mềm K21 · UTH',
      rating: 5,
      date: '02/11/2026',
      content:
        'Giáo trình viết rất rõ ràng, ví dụ bám sát nội dung thi kết thúc môn của thầy cô bộ môn. Đề xuất các bạn nên mượn cuốn này ngay từ đầu kỳ!',
      helpfulCount: 24,
    },
    {
      id: 2,
      studentName: 'Lê Thảo My',
      studentClass: 'Kinh tế Vận tải K22 · UTH',
      rating: 5,
      date: '28/10/2026',
      content:
        'Sách in đẹp, giấy dày dặn, hình vẽ sơ đồ rất trực quan. Các case study ở Chương 4 giải quyết đúng bài tập lớn nhóm mình đang làm.',
      helpfulCount: 16,
    },
    {
      id: 3,
      studentName: 'Nguyễn Văn Đạt',
      studentClass: 'Logistics & Chuỗi cung ứng K20 · UTH',
      rating: 4,
      date: '15/10/2026',
      content:
        'Kiến thức chuẩn xác. Phần bài tập có lời giải chi tiết giúp tự học hiệu quả. Thư viện có nhiều bản sao nên đặt mượn rất nhanh.',
      helpfulCount: 9,
    },
  ];

  // Lọc sách liên quan cùng chuyên ngành
  const relatedBooks = allBooks
    .filter((b) => b.id !== book.id && (b.category === book.category || !book.category))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800 select-none pb-28">
      {/* Toast thông báo nhanh */}
      {toastMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 select-none max-w-xs w-full px-4"
        >
          <div className="rounded-2xl bg-slate-900/95 text-white p-3 shadow-xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{toastMsg}</span>
          </div>
        </aside>
      )}

      {/* HEADER ĐIỀU HƯỚNG TRÊN CÙNG (Sticky Header) */}
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-3.5 sm:px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 text-white cursor-pointer transition-colors"
            title="Quay lại danh sách"
            aria-label="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onGoHome || onBack}
            className="text-xs font-bold text-white truncate cursor-pointer rounded-lg px-1.5 py-1 hover:bg-white/10 active:scale-95 transition-all"
            title="Về trang chủ"
            aria-label="Về trang chủ"
          >
            Chi tiết tài liệu UTH
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Lưu sách quan tâm"
            aria-label="Lưu sách quan tâm"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Chia sẻ tài liệu"
            aria-label="Chia sẻ tài liệu"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-xs"
              title="Mở giỏ mượn"
              aria-label="Mở giỏ mượn"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* THÂN TRANG: BỐ CỤC 1 CỘT CUỘN DỌC MƯỢT MÀ */}
      <main className="flex-1 p-3.5 sm:p-6 max-w-xl mx-auto w-full space-y-4">
        {/* 1. KHỐI BÌA SÁCH 3D & THÔNG TIN CHÍNH */}
        <section
          aria-label="Bìa sách và Thông tin cơ bản"
          className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4"
        >
          {/* Khung trưng bày bìa sách 3D trung tâm */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/70 p-6 flex items-center justify-center overflow-hidden border border-slate-200">
            {/* Quầng sáng nền */}
            <div className="absolute inset-0 bg-radial from-teal-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Bìa sách 3D vật lý */}
            <div
              style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
              className="w-36 h-52 sm:w-44 sm:h-64 rounded-r-xl rounded-l-xs text-white p-3 flex flex-col justify-between shadow-2xl relative transition-transform hover:scale-102"
            >
              {/* Gáy sách dập nổi */}
              <div className="absolute inset-y-0 left-0 w-3 bg-black/30 rounded-l-xs border-r border-white/20 shadow-inner" />
              <div className="absolute inset-y-0 left-3 w-0.5 bg-white/20" />

              <div className="pl-3 space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-teal-200/90 block">
                  UTH LIBRARY
                </span>
                <span className="text-[8px] font-mono opacity-80 block uppercase">
                  {book.coverTheme?.series || 'TỦ SÁCH CHÍNH QUY'}
                </span>
              </div>

              <div className="pl-3 py-1">
                <h2 className="text-xs sm:text-sm font-black uppercase line-clamp-3 leading-snug drop-shadow-md text-white">
                  {book.title}
                </h2>
              </div>

              <div className="pl-3 flex items-center justify-between text-[8px] font-mono opacity-90 border-t border-white/20 pt-1.5">
                <span className="truncate max-w-[80px]">{book.author}</span>
                <span>{book.publishYear || '2024'}</span>
              </div>
            </div>
          </div>

          {/* Cụm thông tin chi tiết tài liệu */}
          <div className="space-y-2.5">
            {/* Chips thể loại và chuyên ngành */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00666B] text-white shadow-2xs">
                {book.type || 'Giáo trình chính quy'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00666B] border border-teal-200">
                {book.category || 'CHUYÊN NGÀNH'}
              </span>
              {book.isNew && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Mới</span>
                </span>
              )}
            </div>

            {/* Tiêu đề sách */}
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {book.title}
            </h1>

            {/* Tác giả & Nhà xuất bản */}
            <div className="text-xs text-slate-600 space-y-0.5">
              <p>
                <span className="text-slate-400 font-medium">Tác giả: </span>
                <strong className="text-slate-800">{book.author}</strong>
              </p>
              <p>
                <span className="text-slate-400 font-medium">Nhà xuất bản: </span>
                <strong className="text-slate-800">{book.publisher || 'Đại học GTVT TP.HCM'}</strong>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="text-slate-400 font-medium">Năm: </span>
                <strong className="text-slate-800">{book.publishYear || '2024'}</strong>
              </p>
            </div>

            {/* Đánh giá sao & Mã tài liệu có nút Copy */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <strong className="font-bold text-slate-800 font-mono">
                  {book.rating || '4.9'}
                </strong>
                <span className="text-slate-400 text-[11px]">(128 lượt đánh giá)</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 font-mono">MÃ:</span>
                <span className="text-xs font-mono font-bold text-slate-800">{book.code}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-1 text-slate-500 hover:text-[#00666b] cursor-pointer"
                  title="Sao chép mã sách"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THẺ VỊ TRÍ KỆ SÁCH & TÌNH TRẠNG KHO */}
        <section
          aria-label="Tình trạng kho và Vị trí kệ"
          className="bg-white rounded-2xl p-4 border border-teal-200/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#00666B] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Khả dụng tại Thư viện UTH</span>
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sẵn sàng trên kệ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Số lượng còn lại:</span>
              <strong className="text-sm font-black text-slate-900 font-mono">
                {book.availableQuantity || 0} / {book.quantity || 0} cuốn
              </strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Hạn mức mượn BR01:</span>
              <strong className="text-sm font-black text-[#00666B] font-mono">5 cuốn / SV</strong>
            </div>
          </div>

          <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-100 flex items-start gap-2 text-xs text-teal-900">
            <MapPin className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Vị trí lưu trữ thực tế:</span>
              <span className="text-teal-800 font-medium">
                {book.location || 'Khu Chuyên Ngành · Kệ A2 · Tầng 2 (Cơ sở 1 UTH)'}
              </span>
            </div>
          </div>
        </section>

        {/* 3. QUY ĐỊNH MƯỢN TRẢ UTH (4 Quy tắc cốt lõi BR01 - BR04) */}
        <section aria-label="Quy định mượn trả" className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00666B]" />
            <span>Quy định mượn tài liệu UTH</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Thời hạn (BR02)</span>
              </div>
              <strong className="block text-slate-900 font-black">14 ngày</strong>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Áp dụng cho mọi giáo trình chính quy.
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Gia hạn (BR03)</span>
              </div>
              <strong className="block text-slate-900 font-black">+7 ngày (1 lần)</strong>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Gia hạn trực tuyến trước hạn trả 1 ngày.
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pick & Go UTH</span>
              </div>
              <strong className="block text-slate-900 font-black">&lt; 30 giây</strong>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Nhận sách nhanh tại quầy với mã QR.
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Phí trễ (BR04)</span>
              </div>
              <strong className="block text-rose-600 font-black">5.000đ/ngày</strong>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Tính trên mỗi cuốn sách quá hạn.
              </span>
            </div>
          </div>
        </section>

        {/* 4. HỆ THỐNG 4 TAB NỘI DUNG (Tabs System) */}
        <section aria-label="Nội dung chi tiết" className="space-y-3">
          {/* Thanh chuyển Tab cuộn ngang */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-200/70 p-1 rounded-2xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'overview'
                  ? 'bg-white text-[#00666B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng quan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('toc')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'toc'
                  ? 'bg-white text-[#00666B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mục lục ({tableOfContents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('copies')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'copies'
                  ? 'bg-white text-[#00666B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bản sao ({physicalCopies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'reviews'
                  ? 'bg-white text-[#00666B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đánh giá ({studentReviews.length})
            </button>
          </div>

          {/* TAB 1: TỔNG QUAN & THÔNG SỐ */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5 text-[#00666B]" />
                  <span>Tóm tắt nội dung giáo trình</span>
                </h4>
                <p className="text-slate-600 leading-relaxed font-normal">
                  {book.description ||
                    'Giáo trình cung cấp nền tảng kiến thức học thuật chuyên sâu, bám sát khung chương trình đào tạo của Trường Đại học Giao thông Vận tải TP.HCM. Tài liệu phục vụ hiệu quả cho việc tự học, chuẩn bị bài thi và triển khai đồ án học phần.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Thông số kỹ thuật tài liệu:</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Số trang:</span>
                    <strong className="text-slate-800 font-mono">{book.pages || 320} trang</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Ngôn ngữ:</span>
                    <strong className="text-slate-800">{book.language || 'Tiếng Việt'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Khổ sách:</span>
                    <strong className="text-slate-800">16 x 24 cm (Bìa mềm)</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block">Lượt mượn tích lũy:</span>
                    <strong className="text-slate-800 font-mono">
                      {book.borrowCount || 142} lượt
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MỤC LỤC BÀI GIẢNG */}
          {activeTab === 'toc' && (
            <div className="space-y-2 text-xs">
              {tableOfContents.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-teal-800">
                    <span className="font-bold text-[11px] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {item.chapter}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.pages}</span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">{item.title}</h5>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pt-1">
                    {item.topics.map((t, tidx) => (
                      <li key={tidx} className="leading-snug">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DANH SÁCH BẢN SAO TẠI 3 CƠ SỞ */}
          {activeTab === 'copies' && (
            <div className="space-y-2 text-xs">
              {physicalCopies.map((copy) => (
                <div
                  key={copy.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {copy.barcode}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                        {copy.callNumber}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-[#00666B]">{copy.campus}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{copy.location}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 ${
                      copy.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : copy.status === 'REFERENCE_ONLY'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {copy.statusText}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: ĐÁNH GIÁ CỦA SINH VIÊN */}
          {activeTab === 'reviews' && (
            <div className="space-y-2.5 text-xs">
              {studentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="block font-bold text-slate-900">{rev.studentName}</strong>
                      <span className="text-[10px] text-slate-400">{rev.studentClass}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed font-normal">{rev.content}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">{rev.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. SÁCH CÙNG CHUYÊN NGÀNH ĐỀ XUẤT (Related Books) */}
        {relatedBooks.length > 0 && (
          <section aria-label="Tài liệu liên quan" className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <BookOpen className="w-3.5 h-3.5 text-[#00666B]" />
              <span>Tài liệu cùng chuyên ngành</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 [&_button+button]:hidden">
              {relatedBooks.map((relBook) => (
                <BookCard
                  key={relBook.id}
                  book={relBook}
                  onAddToCart={onAddToCart}
                  onViewDetail={(item) => onSelectBook && onSelectBook(item || relBook)}
                  isInCart={isInCart}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 6. NÚT THÊM GIỎ MƯỢN DÍNH ĐÁY (Sticky Bottom Bar) */}
      <footer
        role="region"
        aria-label="Thanh thao tác mượn sách dính đáy"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:px-6 select-none"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Cột trái: Tình trạng & Phí mượn */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900 truncate font-mono">
                Còn {book.availableQuantity || 0} cuốn
              </span>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 block mt-0.5">
              Miễn phí / Sinh viên UTH
            </span>
          </div>

          {/* Cụm nút hành động bên phải */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Nút chính: Thêm vào giỏ */}
            <button
              type="button"
              onClick={handleAdd}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                isInCart
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#00666b] text-white hover:bg-[#005458] active:scale-95'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã trong giỏ</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Thêm giỏ mượn</span>
                </>
              )}
            </button>

            {/* Nút phụ: Mượn ngay */}
            <button
              type="button"
              onClick={handleBorrowNow}
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Mượn ngay
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
