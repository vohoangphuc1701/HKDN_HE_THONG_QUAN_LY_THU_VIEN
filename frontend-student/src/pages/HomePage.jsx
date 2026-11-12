import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Laptop,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import BookCard from '../components/common/BookCard';
import mockPCBooks from '../mockPCBooks.json';

/**
 * HomePage - Trang chủ Cổng Dịch Vụ Sinh Viên Thư Viện UTH (Mobile & Tablet < 1024px - TV2)
 * Đồng bộ 1-1 nội dung, dữ liệu sách (mockPCBooks.json), chuyên ngành và quy trình Pick & Go từ DesktopApp (TV3 PC).
 */
const HERO_CAMPUSES = [
  {
    id: 1,
    name: 'Cơ sở 1',
    address: 'Số 2, Đường Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM',
    image: '/assets/campus-co-so-1.jpg',
    code: 'CS1',
  },
  {
    id: 2,
    name: 'Cơ sở 2',
    address: 'Số 10, Đường số 12, P. An Khánh, TP. Thủ Đức, TP.HCM',
    image: '/assets/campus-co-so-2.jpg',
    code: 'CS2',
  },
  {
    id: 3,
    name: 'Cơ sở 3',
    address: 'Số 70, Đường Tô Ký, P. Trung Mỹ Tây, Quận 12, TP.HCM',
    image: '/assets/campus-co-so-3.jpg',
    code: 'CS3',
  },
];

const QUICK_KEYWORDS = [
  'Lập trình Python',
  'Trí tuệ nhân tạo',
  'Chuỗi cung ứng',
  'Kinh tế vi mô',
  'Tiếng Anh giao tiếp',
];

const RECOMMEND_TABS = [
  { key: 'ALL', label: 'Tất cả đề xuất' },
  { key: 'CÔNG NGHỆ THÔNG TIN', label: 'Công nghệ thông tin' },
  { key: 'KINH TẾ', label: 'Kinh tế & Quản trị' },
  { key: 'LOGISTICS & VẬN TẢI', label: 'Logistics & Vận tải' },
  { key: 'NGOẠI NGỮ', label: 'Ngoại ngữ' },
];

export default function HomePage({
  onAddToCart,
  onViewDetail,
  cartItems = [],
  onNavigateTab,
  onQuickSearch,
  onSelectCategory,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendCategory, setRecommendCategory] = useState('ALL');
  const [heroCampus, setHeroCampus] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroCampus((prev) => (prev === 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const categories = useMemo(
    () => [
      { id: 'ALL', label: 'Tất cả tài liệu', count: mockPCBooks.length },
      {
        id: 'CÔNG NGHỆ THÔNG TIN',
        label: 'Công nghệ thông tin',
        count: mockPCBooks.filter((b) => b.category === 'CÔNG NGHỆ THÔNG TIN').length,
      },
      {
        id: 'KINH TẾ',
        label: 'Kinh tế & Quản trị',
        count: mockPCBooks.filter((b) => b.category === 'KINH TẾ').length,
      },
      {
        id: 'LOGISTICS & VẬN TẢI',
        label: 'Logistics & Vận tải',
        count: mockPCBooks.filter((b) => b.category === 'LOGISTICS & VẬN TẢI').length,
      },
      {
        id: 'NGOẠI NGỮ',
        label: 'Ngoại ngữ chuyên ngành',
        count: mockPCBooks.filter((b) => b.category === 'NGOẠI NGỮ').length,
      },
    ],
    []
  );

  const newBooks = useMemo(
    () =>
      mockPCBooks
        .filter((b) => b.isNew || (b.publishYear && b.publishYear >= 2023))
        .sort((a, b) => (b.publishYear || 0) - (a.publishYear || 0))
        .slice(0, 4),
    []
  );

  const featuredBook = newBooks[0];
  const otherNewBooks = newBooks.slice(1, 4);

  const recommendedBooks = useMemo(
    () =>
      mockPCBooks
        .filter((b) => recommendCategory === 'ALL' || b.category === recommendCategory)
        .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
        .slice(0, 4),
    [recommendCategory]
  );

  const currentCampus = HERO_CAMPUSES.find((c) => c.id === heroCampus) || HERO_CAMPUSES[0];

  const handleAdd = (book) => {
    if (onAddToCart) {
      onAddToCart(book);
    } else {
      setToastMessage(`Đã thêm "${book.title}" vào giỏ sách!`);
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  const handleDetail = (book) => {
    if (onViewDetail) onViewDetail(book);
  };

  const triggerCatalogSearch = (keyword) => {
    if (onQuickSearch) {
      onQuickSearch(keyword);
    } else if (onNavigateTab) {
      onNavigateTab('search');
    }
  };

  const triggerCategoryOpen = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else if (onNavigateTab) {
      onNavigateTab('search');
    }
  };

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    triggerCatalogSearch(searchQuery);
  };

  return (
    <div className="w-full bg-[#f4f8f7] text-slate-800 pb-10 select-none overflow-x-hidden">
      {/* KHỐI 1: HERO BANNER - Đồng bộ thông điệp & ảnh 3 cơ sở UTH từ TV3 PC */}
      <section
        className="bg-gradient-to-br from-[#00383b] via-[#00474b] to-[#002629] text-white px-4 pt-5 pb-7 sm:px-6 md:px-8 md:pt-8 md:pb-9 rounded-b-3xl shadow-xl relative overflow-hidden"
        aria-label="Giới thiệu Thư viện UTH"
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-stretch">
          {/* Cột trái: Thông điệp, tìm kiếm & cam kết */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-200 text-[11px] font-bold mb-3 w-fit backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Đại học Giao thông Vận tải TP.HCM · Cổng Thư Viện Số</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-[1.16] text-white">
              Mở trang sách mới,<br className="hidden sm:inline" /> dẫn lối tương lai học thuật.
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-xl font-medium">
              Tra cứu giáo trình chính quy UTH, chọn tài liệu vào Giỏ mượn trực tuyến và đến quầy nhận sách nhanh chóng với mã QR.
            </p>

            {/* Form tìm kiếm nhanh trên Hero */}
            <form
              onSubmit={handleHeroSubmit}
              className="mt-4 flex items-center bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-white/20 focus-within:border-teal-300 focus-within:ring-2 focus-within:ring-teal-400/40 p-1"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#00666B] ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sách, tác giả hay giáo trình..."
                className="flex-1 min-w-0 px-2.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer shrink-0"
                  aria-label="Xóa từ khóa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#00666B] hover:bg-[#005256] text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Từ khóa tìm nhanh của TV3 PC */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 md:flex-wrap">
              <span className="text-[11px] font-semibold text-teal-200 shrink-0">Tìm nhanh:</span>
              {QUICK_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => triggerCatalogSearch(kw)}
                  className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-teal-100 px-2.5 py-1 rounded-lg border border-white/15 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* 3 Cam kết tốc độ Pick & Go */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-[11px] font-bold text-white leading-tight truncate">Nhận sách tại quầy</strong>
                  <span className="text-[10px] text-teal-200/80 block truncate">Quy trình Pick &amp; Go</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <div className="w-7 h-7 rounded-lg bg-teal-400/20 text-teal-200 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-[11px] font-bold text-white leading-tight truncate">Thủ thư gom trước</strong>
                  <span className="text-[10px] text-teal-200/80 block truncate">Sắp sẵn ra khay chờ</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-[11px] font-bold text-white leading-tight truncate">Minh bạch hạn trả</strong>
                  <span className="text-[10px] text-teal-200/80 block truncate">Gia hạn online 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Ảnh 3 Cơ sở UTH tự động chuyển đổi */}
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden min-h-[210px] sm:min-h-[250px] md:min-h-full border border-white/15 shadow-lg">
            {HERO_CAMPUSES.map((campus) => {
              const isActive = heroCampus === campus.id;
              return (
                <img
                  key={campus.id}
                  src={campus.image}
                  alt={campus.name}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                />
              );
            })}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/25 to-black/10 pointer-events-none" />

            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/20">
              {HERO_CAMPUSES.map((campus) => {
                const isActive = heroCampus === campus.id;
                return (
                  <button
                    key={campus.id}
                    type="button"
                    onClick={() => setHeroCampus(campus.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#00666B] text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    <span>{campus.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#00666B] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">{currentCampus.name}</span>
                  <span className="text-[10px] text-teal-200/90 block truncate">{currentCampus.address}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#00666B] px-2 py-0.5 rounded border border-white/20 shrink-0">
                {currentCampus.code}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* NỘI DUNG CHÍNH */}
      <main className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 mt-4 sm:mt-6 space-y-6">
        {/* DẢI TRẠNG THÁI & CHỈ SỐ THƯ VIỆN */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:px-5 shadow-xs space-y-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-bold text-slate-900">Thư viện đang mở cửa:</span>
            <span className="text-slate-600">07:30 – 20:30 (Thứ 2 – Thứ 7)</span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#00666B] shrink-0" />
              <span>Tài liệu in: <strong className="text-slate-900">50.000+</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#00666B] shrink-0" />
              <span>E-Book số: <strong className="text-slate-900">120.000+</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00666B] shrink-0" />
              <span>Phục vụ: <strong className="text-slate-900">3 Cơ sở UTH</strong></span>
            </div>
          </div>
        </section>

        {/* KHÁM PHÁ THEO CHUYÊN NGÀNH (4 nhóm ngành TV3 PC) */}
        <section aria-label="Khám phá theo chuyên ngành" className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 font-heading flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00666b]" />
                <span>Khám phá theo chuyên ngành</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nguồn tài liệu thiết thực theo chương trình đào tạo UTH.
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerCategoryOpen('ALL')}
              className="text-xs font-bold text-[#00666B] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs md:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => triggerCategoryOpen(cat.id)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200/90 hover:border-[#00666b] hover:text-[#00666b] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              >
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* TIÊU ĐIỂM & SÁCH MỚI CẬP NHẬT */}
        <section
          aria-label="Tiêu điểm và sách mới cập nhật"
          className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#e0eff0] text-[#00666B] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-slate-900 font-heading">
                  Tiêu Điểm &amp; Sách Mới Cập Nhật
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tài liệu và giáo trình vừa bổ sung vào kho thư viện UTH
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerCategoryOpen('ALL')}
              className="text-xs font-bold text-[#00666B] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Tất cả ({newBooks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spotlight sách tiêu điểm */}
          {featuredBook && (
            <div className="bg-gradient-to-br from-[#00363a] via-[#00474b] to-[#002b2e] rounded-2xl p-4 sm:p-5 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-teal-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Ấn bản tiêu điểm</span>
                </span>
                <span className="text-xs font-bold text-amber-300 bg-black/30 px-2 py-0.5 rounded-md">
                  ★ {featuredBook.rating || '4.9'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div
                  onClick={() => handleDetail(featuredBook)}
                  style={{ backgroundColor: featuredBook.coverTheme?.bg || '#0f4c81' }}
                  className="w-24 h-32 sm:w-28 sm:h-36 rounded-r-md rounded-l-xs text-white p-2.5 flex flex-col justify-between shadow-xl relative shrink-0 cursor-pointer"
                >
                  <div className="absolute inset-y-0 left-0 w-2 bg-black/25 rounded-l-xs border-r border-white/10" />
                  <p className="text-[8px] text-center text-white/90 truncate pl-1.5">
                    {featuredBook.coverTheme?.author || featuredBook.author}
                  </p>
                  <h4 className="text-[9px] font-black uppercase text-center leading-snug whitespace-pre-line my-auto pl-1">
                    {featuredBook.coverTheme?.title || featuredBook.title}
                  </h4>
                  <span className="text-[7px] text-center text-white/80 uppercase font-bold border-t border-white/20 pt-1 pl-1">
                    {featuredBook.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC'}
                  </span>
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wide block">
                    {featuredBook.category}
                  </span>
                  <h3
                    onClick={() => handleDetail(featuredBook)}
                    className="text-sm sm:text-base font-bold font-heading text-white cursor-pointer hover:text-teal-200"
                  >
                    {featuredBook.title}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Tác giả: <strong className="text-white">{featuredBook.author}</strong> · Năm {featuredBook.publishYear}
                  </p>
                  <p className="text-[11px] text-teal-100/80 line-clamp-2">
                    {featuredBook.description}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdd(featuredBook)}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {cartItems.some((i) => i.id === featuredBook.id)
                          ? 'Đã trong giỏ'
                          : 'Thêm vào giỏ mượn'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDetail(featuredBook)}
                      className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/15 cursor-pointer shrink-0"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3 cuốn sách mới đi kèm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {otherNewBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={handleAdd}
                onViewDetail={(item) => handleDetail(item || book)}
                isInCart={cartItems.some((c) => c.id === book.id)}
              />
            ))}
          </div>
        </section>

        {/* ĐỀ XUẤT CHO BẠN */}
        <section
          aria-label="Đề xuất cho bạn"
          className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4"
        >
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 font-heading">
                  Đề Xuất Cho Bạn
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Những đầu sách được sinh viên UTH mượn nhiều nhất
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 md:flex-wrap">
              {RECOMMEND_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRecommendCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    recommendCategory === tab.key
                      ? 'bg-[#00666B] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {recommendedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={handleAdd}
                onViewDetail={(item) => handleDetail(item || book)}
                isInCart={cartItems.some((c) => c.id === book.id)}
              />
            ))}
          </div>
        </section>

        {/* DẢI QUY TRÌNH PICK & GO 3 BƯỚC */}
        <section
          aria-label="Quy trình mượn sách Pick & Go"
          className="bg-gradient-to-r from-[#00383b] via-[#004f54] to-[#00383b] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md border border-teal-800 space-y-4"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
              Đặc quyền sinh viên UTH
            </span>
            <h3 className="text-base sm:text-lg font-black font-heading text-white mt-0.5">
              Mượn giáo trình tiện lợi với Pick &amp; Go
            </h3>
            <p className="text-[11px] text-teal-100/80 mt-1 leading-relaxed">
              Thủ thư gom sẵn sách lên khay giữ chỗ trước khi bạn đến quầy. Tiết kiệm tối đa thời gian trong giờ cao điểm học kỳ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-teal-500/25 text-teal-200 flex items-center justify-center text-xs font-bold font-mono">
                01
              </div>
              <strong className="block text-xs sm:text-sm font-bold text-white">Thêm vào giỏ mượn</strong>
              <p className="text-[11px] text-teal-200/80 leading-normal">
                Chọn tối đa 5 đầu sách trực tuyến mọi lúc.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-teal-500/25 text-teal-200 flex items-center justify-center text-xs font-bold font-mono">
                02
              </div>
              <strong className="block text-xs sm:text-sm font-bold text-white">Chọn lịch hẹn nhận</strong>
              <p className="text-[11px] text-teal-200/80 leading-normal">
                Thủ thư gom sẵn ra khay tiếp nhận riêng.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-teal-500/25 text-teal-200 flex items-center justify-center text-xs font-bold font-mono">
                03
              </div>
              <strong className="block text-xs sm:text-sm font-bold text-white">Quét QR &amp; Nhận ngay</strong>
              <p className="text-[11px] text-teal-200/80 leading-normal">
                Xác thực tức thì tại quầy tiếp nhận 3 cơ sở.
              </p>
            </div>
          </div>
        </section>
      </main>

      {toastMessage && (
        <aside
          role="status"
          className="fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}
    </div>
  );
}
