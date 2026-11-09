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
  Sparkles,
  ChevronRight,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import BookCard from '../common/BookCard';

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

  if (!book) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy tài liệu này</h2>
        <p className="text-sm text-slate-500">Giáo trình có thể đã được cập nhật hoặc không còn trong danh mục.</p>
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
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBorrowNow = () => {
    if (!isInCart && onAddToCart) {
      onAddToCart(book);
    }
    if (onOpenCart) {
      onOpenCart();
    }
  };

  // Lấy các sách liên quan cùng chuyên ngành
  const relatedBooks = allBooks
    .filter((b) => b.id !== book.id && (b.category === book.category || !book.category))
    .slice(0, 4);

  return (
    <div className="space-y-8 select-none animate-in fade-in duration-200">
      {/* 1. THANH ĐIỀU HƯỚNG VÀ BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
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
            <span className="hover:text-slate-800 cursor-pointer" onClick={onBack}>Kho sách & Giáo trình</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">{book.category}</span>
          </nav>
        </div>

        {/* Nút tác vụ phụ */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
            title="Sao chép mã tài liệu"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã chép mã</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Mã: {book.code || 'TL-UTH'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. KHỐI NỘI DUNG CHI TIẾT SÁCH: 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI (5 Cột): Bìa 3D, Kho phòng & Vị trí kệ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Khung trưng bày bìa sách 3D kích thước lớn */}
          <div className="bg-gradient-to-b from-[#cdede5] to-[#daf1ea] rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center border border-teal-200/80 shadow-xs relative overflow-hidden">
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666B] bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-2xs border border-teal-200/60">
                {book.category}
              </span>
            </div>

            {/* Bìa sách 3D */}
            <div
              style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
              className="w-52 h-72 sm:w-56 sm:h-80 rounded-r-2xl rounded-l-xs text-white p-5 flex flex-col justify-between shadow-2xl relative transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* Gáy sách vật lý */}
              <div className="absolute inset-y-0 left-0 w-3.5 bg-black/25 rounded-l-xs border-r border-white/10" />

              {/* Tác giả */}
              <div className="text-center pl-3 pr-1">
                <p className="text-xs font-medium text-white/90 truncate tracking-wide">
                  {book.coverTheme?.author || book.author}
                </p>
              </div>

              {/* Tựa sách */}
              <div className="text-center px-2 my-auto">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight leading-snug whitespace-pre-line text-white drop-shadow-md">
                  {book.coverTheme?.title || book.title}
                </h2>
              </div>

              {/* Nhãn loại sách */}
              <div className="text-center pt-2 border-t border-white/20 pl-3 pr-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/85">
                  {book.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM'}
                </span>
              </div>
            </div>

            {/* Trạng thái tồn kho tổng quan */}
            <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-teal-200 text-teal-900 text-xs font-bold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{book.statusText || `Còn ${book.availableQuantity} cuốn sẵn sàng trên kệ`}</span>
            </div>
          </div>

          {/* Vị trí trên kệ sách thực tế */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-[#00666B]">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#00666B]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Vị trí trên kệ sách
                </h4>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {book.location || 'Khu Công nghệ thông tin · Kệ A2 · Tầng 2'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Sinh viên có thể đến trực tiếp kệ sách theo mã phân loại <strong className="text-slate-800 font-mono">{book.code}</strong> để đọc tại chỗ hoặc thêm vào Giỏ mượn để nhận tại quầy Pick & Go.
            </p>
          </div>

          {/* Tình trạng khả dụng tại 3 Cơ sở UTH - Có nền thiết kế đồng bộ */}
          <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-slate-50 rounded-2xl p-5 border border-teal-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Khả dụng tại 3 Cơ sở UTH
              </h4>
              <span className="text-[11px] font-semibold text-[#00666B] bg-white border border-teal-200/70 px-2.5 py-0.5 rounded shadow-2xs">
                Liên thông toàn trường
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-teal-100/90 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Cơ sở 1 (Bình Thạnh)</span>
                </div>
                <span className="font-bold text-emerald-700">6 cuốn có sẵn</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-teal-100/90 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Cơ sở 2 (Thủ Đức)</span>
                </div>
                <span className="font-bold text-emerald-700">4 cuốn có sẵn</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-teal-100/90 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Cơ sở 3 (Quận 12)</span>
                </div>
                <span className="font-bold text-emerald-700">2 cuốn có sẵn</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 Cột): Thông tin chi tiết, Nút mượn, Bảng thông số & Nội dung */}
        <div className="lg:col-span-7 space-y-6">
          {/* Nhóm tiêu đề & Tác giả */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00666B] bg-[#e0eff0] px-3 py-1 rounded-md">
                {book.category}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                Mã: {book.code}
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                ★ {book.rating || 4.9} ({book.borrowCount || 140} lượt mượn)
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-slate-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
                Tác giả: <strong className="text-slate-900 font-bold">{book.author}</strong>
              </p>
            </div>

            {/* CỤM NÚT HÀNH ĐỘNG MƯỢN SÁCH */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Nút Thêm vào giỏ */}
                <button
                  type="button"
                  disabled={isInCart}
                  onClick={() => {
                    if (onAddToCart && !isInCart) {
                      onAddToCart(book);
                    }
                  }}
                  className={`flex-1 h-12 px-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    isInCart
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                      : 'bg-[#00666B] hover:bg-[#005458] active:bg-[#00383b] text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span>Đã có trong giỏ mượn</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                      <span>Thêm vào giỏ mượn sách</span>
                    </>
                  )}
                </button>

                {/* Nút Mượn ngay & Nhận tại quầy */}
                <button
                  type="button"
                  onClick={handleBorrowNow}
                  className="h-12 px-5 rounded-xl font-bold text-sm sm:text-base bg-white border border-[#00666B] text-[#00666B] hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Mượn ngay (Xem giỏ)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-teal-900 font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-[#00666B] shrink-0" />
                <span>Miễn phí mượn 100% cho sinh viên UTH · Nhận sách nhanh tại quầy Pick & Go</span>
              </div>
            </div>

            {/* BẢNG THÔNG SỐ HỌC THUẬT */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Thông số giáo trình & Xuất bản
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Nhà xuất bản</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.publisher || 'ĐH Quốc Gia'}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Năm xuất bản</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.publishYear || 2023}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Số trang</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.pages || 320} trang</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Ngôn ngữ</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.language || 'Tiếng Việt'}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Hình thức tài liệu</span>
                  <strong className="text-slate-800 font-bold block mt-1">{book.type || 'Giáo trình in'}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Mã định danh UTH</span>
                  <strong className="text-[#00666B] font-mono font-bold block mt-1">{book.code}</strong>
                </div>
              </div>
            </div>

            {/* TÓM TẮT NỘI DUNG VÀ MỤC TIÊU HỌC PHẦN */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Giới thiệu nội dung tài liệu
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100 font-normal">
                {book.description ||
                  'Tài liệu học tập tiêu chuẩn phục vụ chương trình đào tạo chính quy tại Trường Đại học Giao thông Vận tải TP.HCM. Cung cấp hệ thống kiến thức lý thuyết nền tảng, các case study chuyên ngành thực tế và bộ câu hỏi ôn tập, bài tập ứng dụng bám sát chuẩn đầu ra học phần.'}
              </p>
            </div>

            {/* CHÍNH SÁCH MƯỢN TRẢ & GIA HẠN DÀNH CHO SINH VIÊN */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Chính sách mượn trả tại UTH
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Thời hạn mượn: 14 ngày</strong>
                    <span className="text-[11px] text-slate-500">Kể từ khi nhận tại quầy</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Gia hạn: Tối đa 2 lần</strong>
                    <span className="text-[11px] text-slate-500">Thực hiện trực tuyến 24/7</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#00666B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Trả sách linh hoạt</strong>
                    <span className="text-[11px] text-slate-500">Tại bất kỳ cơ sở nào</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TÀI LIỆU CÙNG CHUYÊN NGÀNH GỢI Ý */}
      {relatedBooks.length > 0 && (
        <section className="pt-6 border-t border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black font-heading text-slate-900 tracking-tight">
                Tài liệu cùng chuyên ngành bạn có thể quan tâm
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Các giáo trình được sinh viên khối ngành {book.category} mượn nhiều nhất.
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
    </div>
  );
}

