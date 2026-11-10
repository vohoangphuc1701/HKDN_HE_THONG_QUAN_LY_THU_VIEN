import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  Check,
  Plus,
  MapPin,
  ArrowRight,
  ChevronRight,
  Star,
  X,
  TrendingUp,
  Layers,
  Filter,
  CheckCircle2,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import BookCard from '../components/common/BookCard';
import mockMobileBooks from '../mockMobileBooks.json';

/**
 * HomePage - Trang chủ Cổng Dịch Vụ Sinh Viên Thư Viện UTH
 * Thiết kế chuẩn đa điểm ngắt (Responsive Breakpoints):
 * 1. MOBILE (Mặc định: dưới 768px): Gọn gàng, vuốt chạm mượt mà, ngón cái dễ thao tác, lưới 2 cột.
 * 2. TABLET (Từ 768px trở lên, md:): Không gian thoáng, bố cục banner 2 cột, lưới 3 cột sách, thanh tìm kiếm mở rộng.
 * 3. DESKTOP (Từ 1024px trở lên, lg:): Lưới 4-5 cột rộng rãi, tích hợp đầy đủ chi tiết học thuật.
 * 
 * Phụ trách: TV2 (Mobile Web) phối hợp TV3 (Desktop)
 */
export default function HomePage({
  onAddToCart,
  onViewDetail,
  cartItems = [],
  onNavigateTab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Danh mục chuyên ngành chuẩn UTH
  const categories = [
    { id: 'ALL', label: 'Tất cả tài liệu', count: mockMobileBooks.length },
    { id: 'CÔNG NGHỆ THÔNG TIN', label: 'Công nghệ thông tin', count: mockMobileBooks.filter(b => b.category === 'CÔNG NGHỆ THÔNG TIN').length || 4 },
    { id: 'KINH TẾ', label: 'Kinh tế & Quản trị', count: mockMobileBooks.filter(b => b.category === 'KINH TẾ').length || 3 },
    { id: 'LOGISTICS', label: 'Logistics & Vận tải', count: mockMobileBooks.filter(b => b.category === 'LOGISTICS').length || 2 },
    { id: 'XÂY DỰNG', label: 'Kỹ thuật Xây dựng', count: mockMobileBooks.filter(b => b.category === 'XÂY DỰNG').length || 2 },
  ];

  // Lọc danh sách sách
  const filteredBooks = useMemo(() => {
    return mockMobileBooks.filter((book) => {
      const matchCat = selectedCategory === 'ALL' || book.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.code && book.code.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStock = !onlyAvailable || (book.availableQuantity && book.availableQuantity > 0);
      return matchCat && matchQuery && matchStock;
    });
  }, [searchQuery, selectedCategory, onlyAvailable]);

  // Danh sách sách mới / nổi bật cho Slider
  const featuredBooks = useMemo(() => {
    return mockMobileBooks.filter(b => b.featured || b.isNew || (b.rating && b.rating >= 4.8)).slice(0, 6);
  }, []);

  const handleAdd = (book) => {
    if (onAddToCart) {
      onAddToCart(book);
    } else {
      setToastMessage(`Đã thêm "${book.title}" vào giỏ sách!`);
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  const handleDetail = (book) => {
    if (onViewDetail) {
      onViewDetail(book);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f8f7] text-slate-800 pb-28 md:pb-16 select-none">
      
      {/* =========================================================================
          KHỐI 1: HERO GREETING & BANNER ĐA THIẾT BỊ
          - Mobile (< 768px): Lời chào ấm cúng, gọn gàng, thanh search nổi bật
          - Tablet (>= 768px): Banner 2 cột thoáng đãng, thanh search kích thước lớn
          - Desktop (>= 1024px): Banner học thuật trang trọng chuẩn thương hiệu UTH
          ========================================================================= */}
      <section className="bg-gradient-to-b from-[#00666b] via-[#005458] to-[#0a4549] text-white px-4 pt-5 pb-7 sm:px-6 md:px-8 md:pt-8 md:pb-10 lg:px-12 rounded-b-3xl shadow-lg relative overflow-hidden">
        {/* Họa tiết trang trí nền */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Lời chào & Huy hiệu */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold text-teal-100 border border-white/20 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Thư viện Số UTH · Cổng Sinh Viên</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Mượn sách trực tuyến,<br className="hidden sm:inline" /> Nhận tại quầy <span className="text-amber-300">dưới 30 giây</span>.
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-teal-100/90 max-w-xl leading-relaxed">
                Khám phá kho giáo trình, đặt lịch hẹn lấy và gia hạn trực tuyến dễ dàng mọi lúc mọi nơi.
              </p>
            </div>

            {/* Khối cam kết 3 tiêu chí dịch vụ (Đồng bộ icon chuẩn Lucide như Desktop) */}
            <div className="hidden md:flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="flex items-center gap-2 text-xs font-medium text-teal-50">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span>Hẹn lấy &lt; 30 giây</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-teal-50">
                <div className="w-6 h-6 rounded-lg bg-teal-400/20 text-teal-200 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span>Tối đa 5 cuốn</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-teal-50">
                <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>Mượn 14 ngày</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              THANH TÌM KIẾM THÔNG MINH (RESPONSIVE SEARCH BAR)
              ========================================================================= */}
          <div className="mt-5 md:mt-7 max-w-3xl">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-teal-100 p-1 sm:p-1.5 transition-all focus-within:ring-3 focus-within:ring-teal-300">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên giáo trình, tác giả, mã môn học (VD: Python, Kinh tế...)"
                className="w-full text-slate-800 placeholder:text-slate-400 px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
                  title="Xoá tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                className="bg-[#00666b] hover:bg-[#005458] text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Tìm kiếm
              </button>
            </div>
            
            {/* Cam kết nhỏ gọn dạng pill trên Mobile (Icon chuẩn Lucide) */}
            <div className="flex md:hidden items-center justify-between text-[11px] text-teal-100/90 mt-2 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Quét QR lấy sách tức thì</span>
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Hạn mượn 14 ngày</span>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          NỘI DUNG CHÍNH TRANG CHỦ (MAIN WRAPPER THEO BREAKPOINTS)
          - Tràn toàn màn hình w-full trên Mobile & Tablet (< 1024px)
          - Đệm lề responsive: px-3.5 (mobile), px-6 (sm/tablet), px-8 (desktop)
          - Giới hạn tối đa max-w-7xl trên màn hình lớn Desktop
          ========================================================================= */}
      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 mt-4 sm:mt-6 space-y-6">

        {/* =========================================================================
            KHỐI 2: DẢI CHUYÊN NGÀNH (CATEGORY CHIPS / PILLS)
            - Mobile: Vuốt ngang no-scrollbar
            - Tablet & Desktop: Trải đều dạng hàng ngang đẹp mắt
            ========================================================================= */}
        <section aria-label="Danh mục chuyên ngành">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#00666b]" />
              <span>Chuyên ngành đào tạo</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {categories.length} nhóm ngành
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs md:flex-wrap">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#00666b] text-white shadow-md shadow-teal-900/10 scale-102 ring-2 ring-teal-600/30'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            KHỐI 3: SLIDER SÁCH MỚI & NỔI BẬT (SLIDER VUỐT NGANG - ĐẶC TẢ TV2 BUỔI 5)
            - Vuốt mượt trên điện thoại, phím cuộn trên máy tính bảng
            ========================================================================= */}
        {(!searchQuery && selectedCategory === 'ALL') && (
          <section aria-label="Sách mới & Nổi bật" className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                    Tài liệu mới &amp; Mượn nhiều nhất
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500">Giáo trình cập nhật năm học 2026</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tuyển chọn</span>
              </span>
            </div>

            {/* Dải cuộn ngang Carousel */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1">
              {featuredBooks.map((book) => {
                const inCart = cartItems.some((c) => c.id === book.id);
                return (
                  <div
                    key={`featured-${book.id}`}
                    onClick={() => handleDetail(book)}
                    className="w-36 sm:w-44 md:w-48 shrink-0 bg-[#f8faf9] rounded-2xl border border-slate-200 hover:border-teal-500 p-2.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Bìa sách 3D mini */}
                    <div
                      style={{ backgroundColor: book.coverTheme?.bg || '#00666b' }}
                      className="w-full h-28 sm:h-36 rounded-xl text-white p-2.5 flex flex-col justify-between shadow-md relative overflow-hidden group-hover:scale-102 transition-transform"
                    >
                      <div className="absolute inset-y-0 left-0 w-2 bg-black/25 border-r border-white/20" />
                      <span className="text-[8px] font-bold text-right tracking-tight opacity-90">UTH</span>
                      <h4 className="text-[9px] sm:text-[11px] font-black uppercase text-center line-clamp-3 leading-tight px-1 drop-shadow-sm">
                        {book.title}
                      </h4>
                      <span className="text-[7px] sm:text-[8px] text-center font-mono opacity-80">
                        {book.code || 'GIÁO TRÌNH'}
                      </span>
                    </div>

                    {/* Thông tin & Nút thêm nhanh */}
                    <div className="mt-2.5 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[9px] font-bold text-teal-700 uppercase tracking-wider block truncate">
                          {book.category}
                        </span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 mt-0.5" title={book.title}>
                          {book.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">{book.author}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Còn {book.availableQuantity} cuốn
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(book);
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            inCart
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-[#00666b] hover:bg-[#005458] text-white shadow-xs'
                          }`}
                          title="Thêm vào giỏ sách"
                        >
                          {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            KHỐI 4: LƯỚI DANH SÁCH SÁCH CHÍNH (MAIN BOOK CATALOG GRID)
            - Mobile (< 768px): 2 cột (grid-cols-2 gap-3)
            - Tablet (768px - 1023px, md:): 3 cột (md:grid-cols-3 md:gap-4.5)
            - Desktop (>= 1024px, lg:): 4 cột (lg:grid-cols-4 lg:gap-6)
            ========================================================================= */}
        <section aria-label="Danh sách tài liệu học tập">
          
          {/* Thanh tiêu đề & Bộ lọc tình trạng kho */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#00666b]" />
                <span>
                  {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Tất cả tài liệu thư viện'}
                </span>
                <span className="text-teal-700 font-bold">({filteredBooks.length})</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500">
                Chọn tài liệu vào giỏ mượn để hẹn giờ lấy tại quầy
              </p>
            </div>

            {/* Checkbox lọc nhanh sách sẵn sàng */}
            <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-fit">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#00666b] focus:ring-[#00666b] border-slate-300"
              />
              <span>Chỉ hiện sách còn sẵn</span>
            </label>
          </div>

          {/* Lưới hiển thị danh sách sách */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {filteredBooks.map((book) => {
                const inCart = cartItems.some((c) => c.id === book.id);
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={() => handleAdd(book)}
                    onViewDetail={() => handleDetail(book)}
                    isInCart={inCart}
                  />
                );
              })}
            </div>
          ) : (
            /* Trạng thái không tìm thấy (Icon chuẩn Lucide) */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Không tìm thấy tài liệu phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Vui lòng thử tìm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục sách thư viện.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setOnlyAvailable(false);
                }}
                className="px-4 py-2 bg-[#00666b] text-white text-xs font-bold rounded-xl hover:bg-[#005458] transition-colors cursor-pointer"
              >
                Xem tất cả sách
              </button>
            </div>
          )}
        </section>

        {/* =========================================================================
            KHỐI 5: HƯỚNG DẪN 3 BƯỚC MƯỢN TRẢ PICK & GO NHANH CHÓNG (ICONS CHUẨN DESKTOP)
            ========================================================================= */}
        <section aria-label="Quy trình mượn sách" className="bg-gradient-to-r from-teal-50 via-emerald-50/50 to-teal-50 p-4 sm:p-6 rounded-2xl border border-teal-200/80">
          <div className="text-center max-w-md mx-auto mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-800">Quy trình đơn giản</span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">3 Bước nhận sách siêu tốc tại quầy</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">1. Thêm vào giỏ &amp; Đặt hẹn</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Chọn tối đa 5 cuốn và chọn ngày hẹn đến lấy.</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">2. Thủ thư soạn sẵn sách</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Nhận email thông báo khi sách đã sẵn sàng tại quầy.</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">3. Quét QR nhận sách &lt; 30s</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Mở điện thoại xuất trình mã QR và mang sách về.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Toast thông báo nhanh (Floating Toast) */}
      {toastMessage && (
        <aside
          role="status"
          className="fixed bottom-20 md:bottom-8 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
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

