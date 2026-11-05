import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from './components/layout/StudentLayout';
import BottomNavMobile from './components/layout/BottomNavMobile';
import BookCard from './components/common/BookCard';
import mockBooks from './mockPCBooks.json';
import { SlidersHorizontal, Check, X, MapPin, Plus, Search, ArrowUpRight } from 'lucide-react';

function MobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
      {/* ==================== TOPBAR MOBILE ==================== */}
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner">
            📖
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight flex items-center gap-1.5">
              Thư viện <span className="text-[10px] text-teal-200 px-1 py-0.2 bg-white/15 rounded">UTH</span>
            </h1>
            <p className="text-[10px] text-teal-100/80">Cổng Sinh Viên (Mobile)</p>
          </div>
        </div>

        {/* Tiện ích: Giỏ sách & Avatar sinh viên */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Giỏ sách"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-amber-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center shadow">
              2
            </span>
          </button>

          {/* Bấm vào avatar trên header để mở Drawer tài khoản */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-teal-800 border border-teal-300/40 text-teal-100 flex items-center justify-center text-xs font-bold shadow-sm hover:ring-2 hover:ring-white transition-all cursor-pointer"
            title="Tài khoản sinh viên"
          >
            NL
          </button>
        </div>
      </header>

      {/* ==================== VÙNG NỘI DUNG CHÍNH (SẴN SÀNG CHO CÁC TRANG TIẾP THEO) ==================== */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full pb-20">
        {/* Nơi hiển thị các trang nghiệp vụ tiếp theo của TV2 (HomePage, BookListPage, v.v.) */}
      </main>

      {/* ==================== THANH ĐIỀU HƯỚNG CHÂN TRANG MOBILE ==================== */}
      <BottomNavMobile
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'profile') {
            setIsDrawerOpen(true);
          }
        }}
        isDrawerOpen={isDrawerOpen}
        onDrawerOpen={() => setIsDrawerOpen(true)}
        onDrawerClose={() => setIsDrawerOpen(false)}
        activeLoanCount={2}
      />
    </div>
  );
}

/**
 * Màn hình hiển thị danh mục sách Desktop Web
 * Bố cục Grid 4-5 cột (Node 4:3929 - Thư viện sinh viên · Máy tính)
 */
function DesktopBookCatalog() {
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('relevant');
    const [toastMessage, setToastMessage] = useState('');
    const [selectedBookDetail, setSelectedBookDetail] = useState(null);

    const handleAddToCart = (book) => {
        setToastMessage(`Đã thêm "${book.title}" vào giỏ sách thành công!`);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Lọc sách theo chuyên ngành
    const filteredBooks = mockBooks.filter((book) => {
        if (selectedCategory === 'ALL') return true;
        return book.category === selectedCategory;
    }).sort((a, b) => {
        if (sortBy === 'newest') return b.publishYear - a.publishYear;
        if (sortBy === 'available') return b.availableQuantity - a.availableQuantity;
        return a.id - b.id;
    });

    const categories = [
        { key: 'ALL', label: 'Tất cả chuyên ngành', count: 916 },
        { key: 'CÔNG NGHỆ THÔNG TIN', label: 'Công nghệ thông tin', count: 428 },
        { key: 'KINH TẾ', label: 'Kinh tế', count: 315 },
        { key: 'NGOẠI NGỮ', label: 'Ngoại ngữ', count: 173 }
    ];

    return (
        <div className="space-y-8 select-none">
            {/* 1. HERO BANNER: Nền xanh nhạt, chữ tối, ảnh sách bên phải */}
            <div
                className="rounded-2xl overflow-hidden flex items-stretch shadow-sm border border-[#c5e8df]"
                style={{ backgroundColor: '#e8f5f0', minHeight: '340px' }}
            >
                {/* Cột trái: Nội dung văn bản */}
                <div className="flex-1 px-8 py-10 flex flex-col justify-center max-w-xl">
                    {/* Badge nhỏ */}
                    <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase mb-4">
                        THƯ VIỆN UTH · KHÔNG GIAN TRI THỨC CỦA BẠN
                    </span>

                    {/* Tiêu đề lớn, chữ đậm, màu tối */}
                    <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-[1.15] text-slate-900">
                        Mở trang sách mới,<br />đi xa hơn mỗi ngày.
                    </h1>

                    {/* Mô tả ngắn */}
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm">
                        Tìm giáo trình, khám phá ý tưởng và kết nối với nguồn tài liệu cho hành trình học tập tại UTH.
                    </p>

                    {/* Thanh tìm kiếm nội tuyến màu trắng */}
                    <div className="mt-6 flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-md">
                        <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder="Bạn đang tìm cuốn sách nào?"
                            className="flex-1 px-3 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                        <button
                            type="button"
                            className="bg-[#00666B] hover:bg-[#005256] text-white text-sm font-semibold px-5 py-3 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    {/* Gợi ý tìm kiếm nhanh */}
                    <div className="mt-3 text-xs text-slate-500">
                        <span className="font-medium">Gợi ý: </span>
                        <button type="button" className="hover:text-teal-700 hover:underline cursor-pointer transition-colors">Python</button>
                        {' · '}
                        <button type="button" className="hover:text-teal-700 hover:underline cursor-pointer transition-colors">Kinh tế vi mô</button>
                        {' · '}
                        <button type="button" className="hover:text-teal-700 hover:underline cursor-pointer transition-colors">Tiếng Anh giao tiếp</button>
                    </div>
                </div>

                {/* Cột phải: Ảnh góc đọc sách */}
                <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 relative">
                    <img
                        src="/assets/hero-books.jpg"
                        alt="Góc đọc sách thư viện UTH"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            {/* 2. THANH CHÀO SINH VIÊN */}
            <div className="flex items-center justify-between gap-4 px-1">
                <p className="text-sm text-slate-600">
                    Chào <span className="font-semibold text-slate-900">Luân</span>, hôm nay bạn muốn khám phá điều gì?
                </p>
                <a
                    href="#loans"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#00666B] hover:underline whitespace-nowrap transition-colors"
                >
                    Bạn đang giữ 3 cuốn sách
                    <span className="text-slate-400">→</span>
                    <span>Xem phiếu mượn</span>
                </a>
            </div>

            {/* 3. KHÁM PHÁ THEO CHUYÊN NGÀNH */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold font-heading text-slate-900 tracking-tight">Khám phá theo chuyên ngành</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Nguồn tài liệu thiết thực cho từng môn học.</p>
                    </div>
                    <button type="button" className="flex items-center gap-1 text-xs font-semibold text-[#00666B] hover:underline cursor-pointer">
                        Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* CNTT */}
                    <div className="rounded-xl p-5 flex items-center justify-between gap-3 border border-blue-100 cursor-pointer hover:shadow-md transition-shadow" style={{ backgroundColor: '#EFF6FF' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <span className="text-blue-600 font-mono font-bold text-sm">&lt;/&gt;</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Công nghệ thông tin</p>
                                <p className="text-xs text-slate-500">428 đầu sách</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-blue-400 shrink-0" />
                    </div>
                    {/* Kinh tế */}
                    <div className="rounded-xl p-5 flex items-center justify-between gap-3 border border-orange-100 cursor-pointer hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFF7ED' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold text-lg">📈</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Kinh tế</p>
                                <p className="text-xs text-slate-500">315 đầu sách</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-orange-400 shrink-0" />
                    </div>
                    {/* Ngoại ngữ */}
                    <div className="rounded-xl p-5 flex items-center justify-between gap-3 border border-teal-100 cursor-pointer hover:shadow-md transition-shadow" style={{ backgroundColor: '#F0FDFA' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                                <span className="text-teal-600 font-bold text-base">文A</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Ngoại ngữ</p>
                                <p className="text-xs text-slate-500">173 đầu sách</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                </div>
            </div>

            {/* 4. THANH LỌC CHUYÊN NGÀNH & SẮP XẾP */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Tabs chuyên ngành */}
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            type="button"
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${selectedCategory === cat.key
                                    ? 'bg-[#00666B] text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span>{cat.label}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${selectedCategory === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sắp xếp */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Sắp xếp:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-[#00666B] cursor-pointer"
                    >
                        <option value="relevant">Liên quan nhất</option>
                        <option value="newest">Năm xuất bản mới nhất</option>
                        <option value="available">Số lượng khả dụng nhiều nhất</option>
                    </select>
                </div>
            </div>

            {/* 5. TIÊU ĐỀ KHU VỰC SÁCH */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
                        Những cuốn sách đáng đọc
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Hiển thị {filteredBooks.length} đầu sách phù hợp · Tổng 916 đầu sách trong thư viện
                    </p>
                </div>
            </div>

            {/* 6. LƯỚI GRID 4-5 CỘT DESKTOP WEB HIỂN THỊ BOOKCARD (Theo đặc tả TV3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onAddToCart={handleAddToCart}
                        onViewDetail={(item) => setSelectedBookDetail(item)}
                    />
                ))}
            </div>

            {/* 7. PHÂN TRANG (Pagination -) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                    Hiển thị 1–{filteredBooks.length} trong 916 đầu sách
                </span>
                <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-md bg-[#00666B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        1
                    </button>
                    <button className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center">
                        2
                    </button>
                    <button className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center">
                        3
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
                    <button className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center">
                        115
                    </button>
                </div>
            </div>

            {/* 8. MODAL XEM CHI TIẾT SÁCH (KHI BẤM NÚT "XEM CHI TIẾT") */}
            {selectedBookDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden">
                        {/* Nút đóng */}
                        <button
                            type="button"
                            onClick={() => setSelectedBookDetail(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                            {/* Cột trái: Bìa sách */}
                            <div className="sm:col-span-5 flex flex-col items-center">
                                <div
                                    style={{ backgroundColor: selectedBookDetail.coverTheme?.bg || '#00666B' }}
                                    className="w-40 h-52 rounded-r-lg rounded-l-xs text-white p-4 flex flex-col justify-between shadow-2xl relative"
                                >
                                    <div className="absolute inset-y-0 left-0 w-3 bg-black/25 rounded-l-xs border-r border-white/10" />
                                    <div className="text-center pl-2 pr-1">
                                        <p className="text-[10px] font-medium text-white/90 truncate">
                                            {selectedBookDetail.coverTheme?.author || selectedBookDetail.author}
                                        </p>
                                    </div>
                                    <div className="text-center px-1 my-auto">
                                        <h4 className="text-xs font-black uppercase tracking-tight leading-snug whitespace-pre-line text-white">
                                            {selectedBookDetail.coverTheme?.title || selectedBookDetail.title}
                                        </h4>
                                    </div>
                                    <div className="text-center pt-1 border-t border-white/20 pl-2 pr-1">
                                        <span className="text-[8px] font-bold tracking-wider uppercase text-white/80">
                                            {selectedBookDetail.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC'}
                                        </span>
                                    </div>
                                </div>

                                {/* Vị trí kệ sách */}
                                <div className="mt-4 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        <MapPin className="w-3.5 h-3.5 text-[#00666B]" />
                                        <span>Vị trí tại thư viện</span>
                                    </div>
                                    <p className="text-xs font-bold text-[#00666B]">
                                        {selectedBookDetail.location}
                                    </p>
                                </div>
                            </div>

                            {/* Cột phải: Thông số chi tiết */}
                            <div className="sm:col-span-7 space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00666B] bg-[#e0eff0] px-2 py-0.5 rounded">
                                        {selectedBookDetail.category}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-1.5 leading-snug">
                                        {selectedBookDetail.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Tác giả: <span className="font-semibold text-slate-800">{selectedBookDetail.author}</span>
                                    </p>
                                </div>

                                {/* Lưới thông số */}
                                <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mã tài liệu</span>
                                        <span className="font-mono font-bold text-slate-800">{selectedBookDetail.code}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nhà xuất bản</span>
                                        <span className="font-semibold text-slate-800 truncate block">{selectedBookDetail.publisher}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Năm xuất bản</span>
                                        <span className="font-semibold text-slate-800">{selectedBookDetail.publishYear}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Số trang / Ngôn ngữ</span>
                                        <span className="font-semibold text-slate-800">{selectedBookDetail.pages} trang ({selectedBookDetail.language})</span>
                                    </div>
                                </div>

                                {/* Trạng thái kho & Nút Thêm vào giỏ bự */}
                                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>{selectedBookDetail.statusText || `Còn ${selectedBookDetail.availableQuantity} cuốn sẵn sàng`}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        handleAddToCart(selectedBookDetail);
                                        setSelectedBookDetail(null);
                                    }}
                                    className="w-full h-11 bg-[#00666B] hover:bg-[#004f53] active:bg-[#00383b] text-white text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                                >
                                    <Plus className="w-5 h-5 stroke-[2.5]" />
                                    <span>Thêm vào giỏ mượn</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 9. TOAST THÔNG BÁO KHI BẤM THÊM VÀO GIỎ */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}

/**
 * Cấu hình App.jsx (React Router Web) cho TV3 Desktop Web
 */
function App() {
    return (
        <BrowserRouter>
            <>
                <div className="lg:hidden">
                    <MobileApp />
                </div>
                <div className="hidden lg:block">
                    <StudentLayout>
                        <Routes>
                            <Route path="/" element={<DesktopBookCatalog />} />
                            <Route path="/books" element={<DesktopBookCatalog />} />
                            <Route path="/home" element={<Navigate to="/" replace />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </StudentLayout>
                </div>
            </>
        </BrowserRouter>
    );
}

export default App;
