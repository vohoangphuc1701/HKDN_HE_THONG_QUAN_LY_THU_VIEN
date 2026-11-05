import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from './components/layout/StudentLayout';
import BottomNavMobile from './components/layout/BottomNavMobile';
import BookCard from './components/common/BookCard';
import mockBooks from './mockPCBooks.json';
import mockMobileBooks from './mockMobileBooks.json';
import { SlidersHorizontal, Check, X, MapPin, Plus, Search, ArrowUpRight } from 'lucide-react';

/* ==================== PHẦN 1: GIAO DIỆN MOBILE WEB (TV2) ==================== */
function MobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cartCount, setCartCount] = useState(2);
  const [toastMessage, setToastMessage] = useState('');

  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'CNTT', label: 'CNTT' },
    { id: 'KINH_TE', label: 'Kinh tế' },
    { id: 'LOGISTICS', label: 'Logistics' },
    { id: 'XAY_DUNG', label: 'Xây dựng' },
  ];

  const handleAddToCart = (book) => {
    setCartCount((prev) => prev + 1);
    setToastMessage(`Đã thêm "${book.title}" vào giỏ sách!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const filteredBooks = mockMobileBooks.filter((book) => {
    const matchCat = selectedCategory === 'ALL' || book.category === selectedCategory;
    const matchSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
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
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-amber-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

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

      <main className="flex-1 p-3.5 max-w-md mx-auto w-full pb-24 space-y-3.5">
        {(activeTab === 'home' || activeTab === 'search') && (
          <>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên sách, tác giả, môn học..."
                className="w-full bg-white text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00666b] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#00666b] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📚</span> {activeTab === 'home' ? 'Kho tài liệu nổi bật' : 'Kết quả tra cứu'} ({filteredBooks.length})
              </h2>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                Hẹn lấy &lt; 30s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  onViewDetail={() => alert(`Xem chi tiết: ${book.title}\nVị trí: ${book.location || 'Khu A - Kệ 03'}`)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'loans' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-800 mb-1">Phiếu mượn của bạn</h2>
              <p className="text-xs text-slate-500">Mã đơn: <strong className="text-[#00666b]">DH-UTH-2026-089</strong></p>
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-semibold">Trạng thái: Đang mượn</span>
                <span className="text-emerald-700 font-bold">2 cuốn</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">Lập trình Python cơ bản</div>
                  <div className="text-[11px] text-slate-500">Mã: CNTT-PY-001 | Hạn trả: 15/11/2026</div>
                </div>
                <button
                  onClick={() => alert('Đã gửi yêu cầu gia hạn trực tuyến!')}
                  className="px-2.5 py-1 bg-[#00666b] text-white text-[11px] font-semibold rounded-lg"
                >
                  Gia hạn
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Kinh tế học vi mô</div>
                  <div className="text-[11px] text-slate-500">Mã: KT-VM-002 | Hạn trả: 18/11/2026</div>
                </div>
                <button
                  onClick={() => alert('Đã gửi yêu cầu gia hạn trực tuyến!')}
                  className="px-2.5 py-1 bg-[#00666b] text-white text-[11px] font-semibold rounded-lg"
                >
                  Gia hạn
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Lịch sử mượn trả</h2>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="text-xs font-bold text-slate-700">Giải tích 1 - Đã trả đúng hạn</div>
              <div className="text-[11px] text-slate-500">Ngày mượn: 10/10/2026 • Ngày trả: 24/10/2026</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Phí phạt: 0 VNĐ</div>
            </div>
          </div>
        )}
      </main>

      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm mx-auto">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
        activeLoanCount={cartCount}
      />
    </div>
  );
}

/* ==================== PHẦN 2: GIAO DIỆN DESKTOP WEB (TV3) ==================== */
function DesktopBookCatalog() {
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('relevant');
    const [toastMessage, setToastMessage] = useState('');
    const [selectedBookDetail, setSelectedBookDetail] = useState(null);

    const handleAddToCart = (book) => {
        setToastMessage(`Đã thêm "${book.title}" vào giỏ sách thành công!`);
        setTimeout(() => setToastMessage(''), 3000);
    };

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
            <div
                className="rounded-2xl overflow-hidden flex items-stretch shadow-sm border border-[#c5e8df]"
                style={{ backgroundColor: '#e8f5f0', minHeight: '340px' }}
            >
                <div className="flex-1 px-8 py-10 flex flex-col justify-center max-w-xl">
                    <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase mb-4">
                        THƯ VIỆN UTH · KHÔNG GIAN TRI THỨC CỦA BẠN
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-[1.15] text-slate-900">
                        Mở trang sách mới,<br />đi xa hơn mỗi ngày.
                    </h1>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm">
                        Tìm giáo trình, khám phá ý tưởng và kết nối với nguồn tài liệu cho hành trình học tập tại UTH.
                    </p>
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
                </div>
                <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 relative">
                    <img
                        src="/assets/hero-books.jpg"
                        alt="Góc đọc sách thư viện UTH"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>
            </div>

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
        </div>
    );
}

/* ==================== PHẦN 3: APP RESPONSIVE ROUTER ==================== */
function App() {
    return (
        <BrowserRouter>
            <>
                {/* Màn hình nhỏ dưới lg (dưới 1024px) hiển thị Mobile */}
                <div className="lg:hidden">
                    <MobileApp />
                </div>
                {/* Màn hình máy tính từ lg (1024px trở lên) hiển thị Desktop */}
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