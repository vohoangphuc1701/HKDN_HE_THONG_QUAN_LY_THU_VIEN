import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import StudentLayout from './components/layout/StudentLayout';
import BookCard from './components/common/BookCard';
import BookDetailPage from './components/pages/BookDetailPage';
import CartDrawer from './components/common/CartDrawer';
import ReturnQrModal from './components/common/ReturnQrModal';
import FilterSidebarPC from './components/responsive/FilterSidebarPC';
import LoansTableViewPC from './components/responsive/LoansTableViewPC';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import mockBooks from './mockPCBooks.json';
import mockMobileBooks from './mockMobileBooks.json';
import {
  Search,
  Check,
  X,
  ArrowLeft,
  Clock,
  Zap,
  ShieldCheck,
  LayoutGrid,
  List,
  RotateCcw,
  BookOpen,
  Compass,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Code2,
  LineChart,
  Languages,
  ArrowUpRight,
  Boxes,
  Laptop,
  Users,
  FileText,
  Headphones,
  MapPin,
  Phone,
  ShoppingBag,
  Menu,
  Home,
  BookMarked,
  History,
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  QrCode,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

/* ==================== PHẦN 1: GIAO DIỆN MOBILE WEB (TV2) ==================== */
function MobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cartCount, setCartCount] = useState(2);
  const [toastMessage, setToastMessage] = useState('');
  const [mobileDetailBook, setMobileDetailBook] = useState(null);

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

  if (mobileDetailBook) {
    return (
      <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
        <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileDetailBook(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold truncate">Chi tiết tài liệu UTH</h1>
          </div>
        </header>
        <main className="flex-1 p-3.5 max-w-md mx-auto w-full pb-20">
          <BookDetailPage
            book={mobileDetailBook}
            onBack={() => setMobileDetailBook(null)}
            onAddToCart={handleAddToCart}
            isInCart={false}
            onOpenCart={() => {
              setMobileDetailBook(null);
              setActiveTab('loans');
            }}
            allBooks={mockMobileBooks}
            onSelectBook={setMobileDetailBook}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight flex items-center gap-1.5">
              Thư viện <span className="text-[10px] text-teal-200 px-1 py-0.2 bg-white/15 rounded">UTH</span>
            </h1>
            <p className="text-[10px] text-teal-100/80">Cổng Sinh Viên (Mobile & Tablet)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* VỊ TRÍ 3 TỪ PHẢI: Nút Menu ☰ – Mở thanh điều hướng */}
          <button
            type="button"
            onClick={() => {
              setIsMenuSheetOpen((prev) => !prev);
              setIsDrawerOpen(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border ${
              isMenuSheetOpen
                ? 'bg-white text-[#00666b] border-white shadow-md scale-95'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            aria-label="Thanh điều hướng"
            title="Thanh điều hướng"
          >
            {isMenuSheetOpen
              ? <X className="w-4.5 h-4.5" />
              : <Menu className="w-4.5 h-4.5" />
            }
          </button>

          {/* VỊ TRÍ 2 TỪ PHẢI: Nút giỏ sách / Phiếu mượn */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('loans');
              setIsMenuSheetOpen(false);
              setIsDrawerOpen(false);
            }}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Phiếu mượn"
            title="Giỏ mượn sách"
          >
            <ShoppingBag className="w-4 h-4 text-white stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-amber-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          {/* VỊ TRÍ 1 TỪ PHẢI (ngoài cùng): Avatar User – Mở thông tin tài khoản & đăng xuất */}
          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen((prev) => !prev);
              setIsMenuSheetOpen(false);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer border ${
              isDrawerOpen
                ? 'bg-white text-[#00666b] border-white ring-2 ring-white/50 shadow-md'
                : 'bg-teal-800 border-teal-300/40 text-teal-100 hover:ring-2 hover:ring-white shadow-sm'
            }`}
            title="Tài khoản sinh viên & Đăng xuất"
            aria-label="Tài khoản sinh viên"
          >
            NL
          </button>
        </div>
      </header>

      {/* TAB TRANG CHỦ: SỬ DỤNG HOMEPAGE CHUẨN RESPONSIVE 3 BREAKPOINTS (MOBILE, TABLET, DESKTOP) */}
      {activeTab === 'home' && (
        <HomePage
          onAddToCart={handleAddToCart}
          onViewDetail={(item) => setMobileDetailBook(item)}
          cartItems={Array(cartCount).fill({ id: 999 })}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* CÁC TAB KHÁC: GIAO DIỆN CO GIÃN TỰ ĐỘNG THEO TABLET VÀ MOBILE */}
      {activeTab !== 'home' && (
        <main className="flex-1 p-3.5 sm:p-6 max-w-md md:max-w-3xl mx-auto w-full pb-28 space-y-3.5">
          {activeTab === 'search' && (
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
                    type="button"
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
                    type="button"
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
                  <BookOpen className="w-3.5 h-3.5 text-[#00666B]" />
                  <span>Kết quả tra cứu ({filteredBooks.length})</span>
                </h2>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                  Hẹn lấy nhanh
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                    onViewDetail={(item) => setMobileDetailBook(item || book)}
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
                  type="button"
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
                  type="button"
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
      )}

      {/* ============================================================
          FOOTER – THÔNG TIN LIÊN HỆ & BẢN QUYỀN THƯ VIỆN UTH
      ============================================================ */}
      {activeTab === 'home' && (
        <footer className="bg-[#00444a] text-white mt-2 pb-6">
          {/* Dải màu phân cách */}
          <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500" />

          <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

            {/* Logo + Mô tả */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  Thư viện Đại học Giao thông Vận tải TP.HCM
                </h3>
                <p className="text-teal-300/80 text-[11px] mt-0.5 leading-relaxed">
                  Hệ thống mượn trả sách trực tuyến · Pick &amp; Go nhận sách &lt; 30 giây
                </p>
              </div>
            </div>

            {/* Lưới liên kết + liên hệ */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cột: Điều hướng */}
              <div>
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-2">Điều hướng</p>
                <ul className="space-y-1.5">
                  {[
                    { label: 'Trang chủ',     tab: 'home'    },
                    { label: 'Danh mục sách', tab: 'search'  },
                    { label: 'Phiếu mượn',    tab: 'loans'   },
                    { label: 'Lịch sử mượn',  tab: 'history' },
                  ].map((link) => (
                    <li key={link.tab}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(link.tab)}
                        className="text-[12px] text-teal-100/70 hover:text-white transition-colors cursor-pointer text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cột: Liên hệ */}
              <div>
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-2">Liên hệ</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-teal-400 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-teal-100/70 leading-tight">
                      Số 2, Võ Oanh, Bình Thạnh, TP.HCM
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-teal-400 shrink-0" />
                    <span className="text-[11px] text-teal-100/70">(028) 3899 2862</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Headphones className="w-3 h-3 text-teal-400 shrink-0" />
                    <span className="text-[11px] text-teal-100/70">thuvien@ut.edu.vn</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quy tắc nhanh */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Quy định nhanh</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-teal-100/70">
                <span>📚 Tối đa <strong className="text-white">5 cuốn</strong>/lần</span>
                <span>⏱ Mượn tối đa <strong className="text-white">14 ngày</strong></span>
                <span>🔄 Gia hạn <strong className="text-white">1 lần</strong> (+7 ngày)</span>
                <span>💰 Phạt <strong className="text-white">5.000đ</strong>/ngày/cuốn</span>
              </div>
            </div>

            {/* Phân cách + Bản quyền */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-teal-100/40">
                © 2026 Thư viện UTH · v1.0.0
              </span>
              <span className="text-[10px] text-teal-100/40">
                Đồ án HKDN · Nhóm 6 TV
              </span>
            </div>
          </div>
        </footer>
      )}

      {/* BACKDROP mờ khi sheet mở */}
      <div
        onClick={() => setIsMenuSheetOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      {/* BOTTOM SHEET – trượt lên từ dưới */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 transform transition-transform duration-300 ease-out ${
          isMenuSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        {/* Handle kéo */}
        <div
          className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 cursor-pointer"
          onClick={() => setIsMenuSheetOpen(false)}
        />

        {/* Tiêu đề Thanh Điều Hướng */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00666b]" />
            <h2 className="text-base font-bold text-slate-800">Thanh điều hướng hệ thống</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Lưới 4 nút điều hướng chính */}
        <div className="px-4 pt-3.5 pb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Các chuyên mục chính</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'home',    icon: Home,       label: 'Trang chủ',      desc: 'Kho sách, sách mới & nổi bật', color: 'bg-teal-50 text-teal-700 border-teal-200/60',    activeBg: 'bg-[#00666b] text-white border-[#00666b]'   },
              { id: 'search',  icon: Compass,    label: 'Danh mục sách',  desc: 'Tìm kiếm, lọc môn học UTH',    color: 'bg-blue-50 text-blue-700 border-blue-200/60',      activeBg: 'bg-blue-600 text-white border-blue-600'   },
              { id: 'loans',   icon: BookMarked, label: 'Phiếu mượn',     desc: `${cartCount} đơn đang hoạt động`,color: 'bg-amber-50 text-amber-700 border-amber-200/60', activeBg: 'bg-amber-600 text-white border-amber-600', badge: cartCount },
              { id: 'history', icon: History,    label: 'Lịch sử & Phạt', desc: 'Nhật ký mượn & đối soát phạt', color: 'bg-purple-50 text-purple-700 border-purple-200/60',activeBg: 'bg-purple-600 text-white border-purple-600' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setActiveTab(item.id); setIsMenuSheetOpen(false); }}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                    isActive ? item.activeBg + ' shadow-md' : item.color
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-white shadow-xs'}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    {item.badge > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lối tắt tiện ích nhanh */}
        <div className="px-4 pt-1 pb-2">
          <button
            type="button"
            onClick={() => { setActiveTab('loans'); setIsMenuSheetOpen(false); }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <QrCode className="w-5 h-5" />
              </span>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  Mã QR đơn mượn Pick &amp; Go
                  <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full">&lt; 30s</span>
                </div>
                <div className="text-[10px] text-teal-100 mt-0.5">Mở sẵn mã QR để quét nhận sách tại quầy</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* ============================================================
          2. THÔNG TIN SINH VIÊN & ĐĂNG XUẤT (Khi ấn Avatar User "NL")
      ============================================================ */}
      {/* Backdrop mờ cho User Drawer */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      {/* Sheet Thông Tin Sinh Viên */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 transform transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
          isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      >
        {/* Handle kéo */}
        <div
          className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2 cursor-pointer"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Tiêu đề Drawer */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h2 className="text-base font-bold text-slate-800">Thông tin tài khoản</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Thân Drawer cuộn được */}
        <div className="overflow-y-auto px-4 py-3.5 space-y-3.5">
          {/* Card Thẻ Sinh Viên UTH */}
          <div className="p-4 bg-gradient-to-br from-[#00666b] via-teal-700 to-teal-800 text-white rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/20 border-2 border-white/30 text-white flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                NL
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold truncate">Nguyễn Thành Lâm</h3>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-400 text-slate-900 rounded-full shrink-0">
                    Thẻ hoạt động
                  </span>
                </div>
                <p className="text-teal-200 text-xs mt-0.5">MSSV: <span className="font-semibold text-white">2151050123</span></p>
                <p className="text-teal-100/80 text-[11px] truncate">lam.nt@ut.edu.vn • CNTT</p>
              </div>
            </div>

            {/* Chỉ số theo quy tắc nghiệp vụ BR01 & BR04 */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/15 text-center">
              <div className="bg-white/10 rounded-xl py-1.5 px-1">
                <div className="text-[10px] text-teal-200">Đang mượn</div>
                <div className="text-xs font-bold text-white mt-0.5">{cartCount} / 5 cuốn</div>
              </div>
              <div className="bg-white/10 rounded-xl py-1.5 px-1">
                <div className="text-[10px] text-teal-200">Tiền phạt</div>
                <div className="text-xs font-bold text-emerald-300 mt-0.5">0 VNĐ</div>
              </div>
              <div className="bg-white/10 rounded-xl py-1.5 px-1">
                <div className="text-[10px] text-teal-200">Cơ sở chính</div>
                <div className="text-xs font-bold text-white mt-0.5">Cơ sở 1</div>
              </div>
            </div>
          </div>

          {/* Tiện ích tài khoản & Quy định */}
          <div className="space-y-1 bg-slate-50 rounded-2xl p-2 border border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                alert('Quy định Thư viện UTH:\n- Tối đa: 5 cuốn/sinh viên\n- Thời hạn: 14 ngày (gia hạn 1 lần +7 ngày)\n- Phạt quá hạn: 5.000đ/ngày/cuốn\n- Lấy sách nhanh tại quầy Pick & Go < 30 giây');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white active:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Nội quy &amp; Hướng dẫn mượn trả</div>
                  <div className="text-[10px] text-slate-500">Quy định hạn mức sách &amp; đối soát phạt</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                alert('Thông báo nhắc hạn trả sách đã được kích hoạt qua email lam.nt@ut.edu.vn (nhắc trước 2 ngày).');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white active:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Thông báo nhắc hạn qua Email</div>
                  <div className="text-[10px] text-slate-500">Đang bật (Nhắc trước hạn 2 ngày)</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Nút Đăng xuất */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                alert('Đã đăng xuất khỏi Cổng Dịch Vụ Sinh Viên Thư Viện UTH.');
              }}
              className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 left-4 right-4 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm mx-auto">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

/* ==================== DANH MỤC THÔNG TIN 3 CƠ SỞ ĐÀO TẠO UTH ==================== */
const campusesData = [
  {
    id: 1,
    name: 'Cơ sở 1',
    address: 'Số 2, Đường Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM',
    image: '/assets/campus-co-so-1.jpg',
    hours: '07:30 – 20:30',
    schedule: 'Thứ 2 – Thứ 7',
    seats: '180 chỗ ngồi',
    desc: 'Tòa nhà điều hành trung tâm khang trang và hiện đại. Bố trí 4 tầng phòng đọc máy lạnh, khu máy tính tra cứu số, phòng thảo luận nhóm và quầy Pick & Go nhận tài liệu nhanh chóng.',
    phone: '(028) 3899 2862 - Nhánh 104',
    code: 'CS1',
  },
  {
    id: 2,
    name: 'Cơ sở 2',
    address: 'Số 10, Đường số 12, P. An Khánh, TP. Thủ Đức, TP.HCM',
    image: '/assets/campus-co-so-2.jpg',
    hours: '07:30 – 17:00',
    schedule: 'Thứ 2 – Thứ 7',
    seats: '120 chỗ ngồi',
    desc: 'Khuôn viên xanh thoáng đãng hướng tầm nhìn Landmark 81. Chuyên sâu về kho tài liệu Kỹ thuật công trình, Cơ khí ô tô, Hàng hải và Logistics vận tải, tích hợp không gian mở nghiên cứu sáng tạo.',
    phone: '(028) 3899 2862 - Nhánh 106',
    code: 'CS2',
  },
  {
    id: 3,
    name: 'Cơ sở 3',
    address: 'Số 70, Đường Tô Ký, P. Trung Mỹ Tây, Quận 12, TP.HCM',
    image: '/assets/campus-co-so-3.jpg',
    hours: '07:30 – 17:00',
    schedule: 'Thứ 2 – Thứ 7',
    seats: '150 chỗ ngồi',
    desc: 'Tòa nhà giảng đường đa năng với các dãy phòng tự học hiện đại. Chuyên sâu kho tài liệu Công nghệ thông tin, Viễn thông, Ngoại ngữ và Kinh tế số, phục vụ đông đảo sinh viên học tập.',
    phone: '(028) 3899 2862 - Nhánh 108',
    code: 'CS3',
  },
];

/* ==================== PHẦN 2: GIAO DIỆN DESKTOP WEB NÂNG CẤP IMPECCABLE ==================== */
function DesktopApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeBookId } = useParams();

  // Xác định tab trực tiếp từ URL path
  const activeTab =
    location.pathname === '/books' || location.pathname === '/catalog' || location.pathname.startsWith('/books/')
      ? 'catalog'
      : location.pathname === '/loans'
        ? 'loans'
        : 'home';
  const [heroCampus, setHeroCampus] = useState(1); // 1: Cơ sở 1, 2: Cơ sở 2, 3: Cơ sở 3
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('relevant');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'

  // Tab lọc đề xuất nhanh trên Trang Chủ
  const [recommendCategory, setRecommendCategory] = useState('ALL');

  // Tính năng chuyển ảnh 3 cơ sở tự động mỗi 3 giây liên tục
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroCampus((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Quản lý Modal & Drawer & Trang Chi tiết sách
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState(null);
  const [qrModalOrder, setQrModalOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Cuốn sách đang xem chi tiết (ưu tiên id trên URL /books/:id hoặc state)
  const viewingBook = routeBookId
    ? mockBooks.find((b) => String(b.id) === String(routeBookId)) || selectedBookDetail
    : null;

  const handleViewBookDetail = (book) => {
    if (!book) return;
    setSelectedBookDetail(book);
    navigate(`/books/${book.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedBookDetail(null);
    navigate('/books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Đồng bộ tab và URL khi đổi tab
  const setActiveTab = (tab) => {
    setSelectedBookDetail(null);
    if (tab === 'home' && location.pathname !== '/') {
      navigate('/');
    } else if (tab === 'catalog' && (location.pathname !== '/books' || routeBookId)) {
      navigate('/books');
    } else if (tab === 'loans' && location.pathname !== '/loans') {
      navigate('/loans');
    }
  };

  // Giỏ mượn sách khởi tạo mẫu
  const [cartItems, setCartItems] = useState([
    mockBooks[0], // Python
    mockBooks[1], // Kinh tế vi mô
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const handleAddToCart = (book) => {
    if (cartItems.some((item) => item.id === book.id)) {
      showToast(`Cuốn "${book.title}" đã có sẵn trong giỏ mượn!`);
      return;
    }
    if (cartItems.length >= 5) {
      showToast('Giỏ mượn đã đạt tối đa 5 cuốn theo quy định thư viện UTH.');
      return;
    }
    setCartItems((prev) => [...prev, book]);
    showToast(`Đã thêm "${book.title}" vào giỏ mượn thành công!`);
  };

  const handleRemoveCartItem = (id) => {
    setCartItems((prev) => prev.filter((b) => b.id !== id));
  };

  const handleCheckoutSuccess = (newOrder) => {
    setCartItems([]);
    setQrModalOrder(newOrder);
    showToast(`Đặt mượn thành công! Đơn hàng: ${newOrder.code}`);
  };

  // Danh mục chuyên ngành UTH cho bộ lọc catalog
  const categories = [
    { key: 'ALL', label: 'Tất cả chuyên ngành', count: mockBooks.length },
    {
      key: 'CÔNG NGHỆ THÔNG TIN',
      label: 'Công nghệ thông tin',
      count: mockBooks.filter((b) => b.category === 'CÔNG NGHỆ THÔNG TIN').length,
    },
    {
      key: 'KINH TẾ',
      label: 'Kinh tế & Quản trị',
      count: mockBooks.filter((b) => b.category === 'KINH TẾ').length,
    },
    {
      key: 'LOGISTICS & VẬN TẢI',
      label: 'Logistics & Vận tải',
      count: mockBooks.filter((b) => b.category === 'LOGISTICS & VẬN TẢI').length,
    },
    {
      key: 'NGOẠI NGỮ',
      label: 'Ngoại ngữ chuyên ngành',
      count: mockBooks.filter((b) => b.category === 'NGOẠI NGỮ').length,
    },
  ];

  // Tab lọc đề xuất nhanh trên Trang Chủ
  const recommendTabs = [
    { key: 'ALL', label: 'Tất cả đề xuất' },
    { key: 'CÔNG NGHỆ THÔNG TIN', label: 'Công nghệ thông tin' },
    { key: 'KINH TẾ', label: 'Kinh tế & Quản trị' },
    { key: 'LOGISTICS & VẬN TẢI', label: 'Logistics & Vận tải' },
    { key: 'NGOẠI NGỮ', label: 'Ngoại ngữ' },
  ];

  // Sách mới (isNew hoặc xuất bản năm 2023 trở lại đây)
  const newBooks = mockBooks
    .filter((b) => b.isNew || (b.publishYear && b.publishYear >= 2023))
    .sort((a, b) => (b.publishYear || 0) - (a.publishYear || 0))
    .slice(0, 4);

  const featuredBook = newBooks[0];
  const otherNewBooks = newBooks.slice(1, 4);

  // Sách đề xuất trên Trang Chủ (lọc theo tab chuyên ngành, sắp xếp theo lượt mượn & đánh giá)
  const recommendedBooks = mockBooks
    .filter((b) => {
      if (recommendCategory === 'ALL') return true;
      return b.category === recommendCategory;
    })
    .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
    .slice(0, 4);

  // Lọc và sắp xếp sách cho trang Kho sách
  const filteredBooks = mockBooks
    .filter((book) => {
      const matchCat = selectedCategory === 'ALL' || book.category === selectedCategory;
      const matchType = selectedType === 'ALL' || book.type === selectedType;
      const matchAvailable = !onlyAvailable || book.availableQuantity > 0;
      const matchSearch =
        !searchQuery.trim() ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.code && book.code.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchType && matchAvailable && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.publishYear || 0) - (a.publishYear || 0);
      if (sortBy === 'available') return (b.availableQuantity || 0) - (a.availableQuantity || 0);
      if (sortBy === 'borrowCount') return (b.borrowCount || 0) - (a.borrowCount || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return a.id - b.id;
    });

  const hasActiveFilters =
    selectedCategory !== 'ALL' || onlyAvailable || selectedType !== 'ALL' || searchQuery !== '';

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setOnlyAvailable(false);
    setSelectedType('ALL');
    setSearchQuery('');
  };

  const handleSearchFromHero = (e) => {
    e.preventDefault();
    setActiveTab('catalog');
  };

  const currentCampus = campusesData.find((c) => c.id === heroCampus) || campusesData[0];

  return (
    <StudentLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      cartCount={cartItems.length}
      onOpenCart={() => setIsCartOpen(true)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {/* NẾU ĐANG XEM TRANG CHI TIẾT SÁCH (Hiển thị trang riêng biệt theo URL /books/:id, không dùng popup) */}
      {viewingBook ? (
        <BookDetailPage
          book={viewingBook}
          onBack={handleBackFromDetail}
          onAddToCart={handleAddToCart}
          isInCart={cartItems.some((item) => item.id === viewingBook.id)}
          onOpenCart={() => setIsCartOpen(true)}
          allBooks={mockBooks}
          onSelectBook={handleViewBookDetail}
        />
      ) : (
        <>
          {/* 1. MÀN HÌNH SÁCH ĐANG MƯỢN */}
          {activeTab === 'loans' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* HERO BANNER - NỀN UTH ACADEMIC TEAL ĐẶC TRƯNG CHO HỒ SƠ MƯỢN SÁCH & GIA HẠN */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-teal-800/40 bg-gradient-to-r from-[#00383b] via-[#004e53] to-[#00282b] text-white p-6 sm:p-8 lg:p-10">
                {/* Họa tiết ánh sáng & hình học học thuật tinh tế */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
                  aria-hidden="true"
                />

                <div className="relative z-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold w-fit backdrop-blur-md shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Cổng Dịch Vụ Mượn Trả Trực Tuyến · Thư Viện UTH</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white leading-tight">
                      Hồ Sơ Mượn Sách & Gia Hạn
                    </h1>

                    <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
                      Quản lý chi tiết hạn hoàn trả các giáo trình đang giữ, gia hạn trực tuyến thêm 7 ngày (BR03) và nhận sách tại quầy Pick & Go.
                    </p>

                    <div className="flex items-center gap-4 pt-1 text-xs text-teal-200/90 flex-wrap font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                        Thời hạn mượn: 14 ngày (BR02)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                        Gia hạn online: 1 lần (+7 ngày) (BR03)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                        Liên thông 3 cơ sở trường UTH
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalog')}
                      className="px-4 py-2.5 bg-white text-[#00666B] hover:bg-teal-50 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 hover:-translate-y-0.5"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Tiếp tục tìm mượn sách</span>
                    </button>
                  </div>
                </div>
              </div>

              <LoansTableViewPC
                onOpenQrModal={(order) => setQrModalOrder(order)}
                onShowToast={showToast}
              />
            </div>
          )}

      {/* 2. MÀN HÌNH TRANG CHỦ: KHÔNG HIỆN BỘ LỌC, HIỆN SÁCH MỚI & ĐỀ XUẤT */}
      {activeTab === 'home' && (
        <div className="space-y-12 select-none">
          {/* HERO BANNER - Nền UTH Deep Academic Teal sang trọng, nổi bật và đẳng cấp */}
          <section
            className="rounded-3xl overflow-hidden shadow-2xl border border-teal-700/60 relative bg-gradient-to-br from-[#00383b] via-[#00474b] to-[#002629] text-white"
            aria-label="Giới thiệu Thư viện UTH"
          >
            {/* Họa tiết ánh sáng & hình học học thuật tinh tế */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-1/3 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[500px] relative z-1">
              {/* Cột trái: Thông điệp, tìm kiếm & cam kết */}
              <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold mb-5 w-fit backdrop-blur-md shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Đại học Giao thông Vận tải TP.HCM · Cổng Thư Viện Số</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-[1.14] text-white drop-shadow-xs">
                  Mở trang sách mới,<br className="hidden sm:inline" /> dẫn lối tương lai học thuật.
                </h1>
                <p className="mt-4 text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-xl font-medium">
                  Tra cứu giáo trình chính quy UTH, chọn tài liệu vào Giỏ mượn trực tuyến và đến quầy nhận sách nhanh chóng với mã QR.
                </p>

                {/* Thanh tìm kiếm nhanh trên Hero - bấm tìm sẽ chuyển sang Kho sách */}
                <form
                  onSubmit={handleSearchFromHero}
                  className="mt-7 flex items-center bg-white rounded-2xl shadow-xl overflow-hidden max-w-xl border-2 border-white/20 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-500/30 transition-all p-1"
                >
                  <Search className="w-5 h-5 text-[#00666B] ml-3.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bạn đang tìm cuốn sách, tác giả hay giáo trình nào?"
                    className="flex-1 px-3.5 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#00666B] hover:bg-[#005256] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
                  >
                    Tìm kiếm
                  </button>
                </form>

                {/* Gợi ý từ khóa tìm nhanh trực tiếp vào Kho sách */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-teal-200 shrink-0">Tìm nhanh:</span>
                  {['Lập trình Python', 'Trí tuệ nhân tạo', 'Chuỗi cung ứng', 'Kinh tế vi mô', 'Tiếng Anh giao tiếp'].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setSearchQuery(kw);
                        setActiveTab('catalog');
                      }}
                      className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-teal-100 px-3 py-1 rounded-lg border border-white/15 backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>

                {/* 3 Cam kết tốc độ Pick & Go của UTH */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-white/15 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-white leading-tight">Nhận sách tại quầy</strong>
                      <span className="text-[11px] text-teal-200/80">Quy trình Pick & Go</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-white/15 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-200 border border-teal-400/30 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-white leading-tight">Thủ thư gom trước</strong>
                      <span className="text-[11px] text-teal-200/80">Sắp sẵn ra khay chờ</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-white/15 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-white leading-tight">Minh bạch hạn trả</strong>
                      <span className="text-[11px] text-teal-200/80">Gia hạn online 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Hình ảnh 3 Cơ sở UTH tự động chuyển đổi mỗi 3s */}
              <div
                className="lg:col-span-5 relative overflow-hidden group min-h-[380px] lg:min-h-full"
                role="region"
                aria-label="Hình ảnh 3 cơ sở thư viện UTH tự động chuyển đổi"
              >
                {/* Lớp hiển thị 3 hình ảnh cơ sở với hiệu ứng crossfade mượt mà mỗi 3s */}
                {campusesData.map((campus) => {
                  const isActive = heroCampus === campus.id;
                  return (
                    <img
                      key={campus.id}
                      src={campus.image}
                      alt={campus.name}
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out ${
                        isActive
                          ? 'opacity-100 scale-100 z-1'
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    />
                  );
                })}

                {/* Lớp phủ chuyển sắc bảo vệ tương phản nội dung */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/25 to-black/10 pointer-events-none z-2" />

                {/* Bộ 3 nút chuyển đổi cơ sở ngay trên Hero */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
                  {campusesData.map((campus) => {
                    const isActive = heroCampus === campus.id;
                    return (
                      <button
                        key={campus.id}
                        type="button"
                        onClick={() => setHeroCampus(campus.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#00666B] text-white shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                        title={`Xem ${campus.name}`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        )}
                        <span>{campus.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Huy hiệu thông tin khuôn viên trường UTH */}
                <div className="absolute bottom-5 left-5 right-5 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white flex items-center justify-between shadow-xl z-10 transition-all duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#00666B] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold block text-white leading-tight truncate">
                        {currentCampus.name}
                      </span>
                      <span className="text-[11px] text-teal-200/90 block mt-0.5 truncate">
                        {currentCampus.address}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#00666B] text-white px-2.5 py-1 rounded-md border border-white/20 shrink-0 ml-2">
                    {currentCampus.code}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* DẢI TRẠNG THÁI & CHỈ SỐ HOẠT ĐỘNG THƯ VIỆN THỜI GIAN THỰC */}
          <section className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 sm:px-6 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-slate-900">Thư viện đang mở cửa:</span>
              <span className="text-slate-600">07:30 – 20:30 (Thứ 2 – Thứ 7)</span>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-4 h-4 text-[#00666B]" />
                <span>Giáo trình & Tài liệu in: <strong className="text-slate-900">50.000+</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Laptop className="w-4 h-4 text-[#00666B]" />
                <span>E-Book & Luận văn số: <strong className="text-slate-900">120.000+</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-[#00666B]" />
                <span>Mạng lưới phục vụ: <strong className="text-slate-900">3 Cơ sở UTH</strong></span>
              </div>
            </div>
          </section>

          {/* MỤC: KHÁM PHÁ THEO CHUYÊN NGÀNH */}
          <section className="space-y-4" aria-labelledby="heading-departments">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 id="heading-departments" className="text-2xl font-black text-slate-900 font-heading tracking-tight">
                  Khám phá theo chuyên ngành
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Nguồn tài liệu thiết thực cho từng môn học theo chương trình đào tạo UTH.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setActiveTab('catalog');
                }}
                className="text-xs sm:text-sm font-bold text-[#00666B] hover:text-[#004f53] flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>Xem tất cả chuyên ngành</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Công nghệ thông tin */}
              <div
                onClick={() => {
                  setSelectedCategory('CÔNG NGHỆ THÔNG TIN');
                  setActiveTab('catalog');
                }}
                className="bg-gradient-to-br from-[#e8f7f3] via-[#f0faf7] to-white border border-teal-200/90 hover:border-[#00666B] hover:shadow-lg transition-all rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100/80 border border-teal-200 text-[#00666B] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Code2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-800 bg-white/80 px-2.5 py-1 rounded-md border border-teal-200/60 shadow-2xs">
                    428 đầu sách
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#00666B] transition-colors">
                    Công nghệ thông tin
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    AI · Lập trình Web · An toàn mạng
                  </p>
                </div>
                <div className="pt-2 border-t border-teal-100 flex items-center justify-between text-xs font-semibold text-[#00666B]">
                  <span>Vào kho tài liệu</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* 2. Kinh tế & Quản trị */}
              <div
                onClick={() => {
                  setSelectedCategory('KINH TẾ');
                  setActiveTab('catalog');
                }}
                className="bg-gradient-to-br from-[#fdf4ed] via-[#fef7f2] to-white border border-amber-200/90 hover:border-amber-600 hover:shadow-lg transition-all rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <LineChart className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 bg-white/80 px-2.5 py-1 rounded-md border border-amber-200/60 shadow-2xs">
                    315 đầu sách
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-800 transition-colors">
                    Kinh tế & Quản trị
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Tài chính · Marketing · Quản trị
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>Vào kho tài liệu</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* 3. Logistics & Vận tải */}
              <div
                onClick={() => {
                  setSelectedCategory('LOGISTICS & VẬN TẢI');
                  setActiveTab('catalog');
                }}
                className="bg-gradient-to-br from-[#eaf4f6] via-[#f2f8fa] to-white border border-cyan-200/90 hover:border-cyan-600 hover:shadow-lg transition-all rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100/80 border border-cyan-200 text-cyan-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Boxes className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-800 bg-white/80 px-2.5 py-1 rounded-md border border-cyan-200/60 shadow-2xs">
                    264 đầu sách
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-cyan-800 transition-colors">
                    Logistics & Vận tải
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Chuỗi cung ứng · Cảng biển · Vận tải
                  </p>
                </div>
                <div className="pt-2 border-t border-cyan-100 flex items-center justify-between text-xs font-semibold text-cyan-800">
                  <span>Vào kho tài liệu</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* 4. Ngoại ngữ chuyên ngành */}
              <div
                onClick={() => {
                  setSelectedCategory('NGOẠI NGỮ');
                  setActiveTab('catalog');
                }}
                className="bg-gradient-to-br from-[#eef4fb] via-[#f5f8fc] to-white border border-blue-200/90 hover:border-blue-600 hover:shadow-lg transition-all rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100/80 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Languages className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-800 bg-white/80 px-2.5 py-1 rounded-md border border-blue-200/60 shadow-2xs">
                    173 đầu sách
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-800 transition-colors">
                    Ngoại ngữ chuyên ngành
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Tiếng Anh kỹ thuật · IELTS · Thương mại
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs font-semibold text-blue-800">
                  <span>Vào kho tài liệu</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* MỤC 1: TIÊU ĐIỂM & SÁCH MỚI CẬP NHẬT */}
          <section className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs backdrop-blur-xs space-y-6" aria-labelledby="heading-new-books">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e0eff0] text-[#00666B] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="heading-new-books" className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                    Tiêu Điểm & Sách Mới Cập Nhật
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tài liệu và giáo trình vừa bổ sung vào kho thư viện UTH trong học kỳ hiện tại
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('catalog');
                  setSortBy('newest');
                }}
                className="text-xs font-bold text-[#00666B] hover:text-[#004f53] flex items-center gap-1.5 transition-colors cursor-pointer group shrink-0"
              >
                <span>Xem tất cả sách mới ({mockBooks.filter((b) => b.isNew || (b.publishYear && b.publishYear >= 2023)).length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Thẻ Tiêu Điểm Sách Mới (Spotlight) */}
              {featuredBook && (
                <div className="lg:col-span-5 bg-gradient-to-br from-[#00363a] via-[#00474b] to-[#002b2e] rounded-2xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-teal-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Ấn bản tiêu điểm 2024</span>
                      </span>
                      <span className="text-xs font-bold text-amber-300 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
                        ★ {featuredBook.rating || '4.9'}
                      </span>
                    </div>

                    {/* Bìa 3D sách trung tâm */}
                    <div
                      onClick={() => handleViewBookDetail(featuredBook)}
                      className="bg-black/20 rounded-xl p-4 mb-4 flex items-center justify-center cursor-pointer border border-white/10 hover:border-teal-300/40 transition-all group/cover"
                      title="Nhấn để xem thông tin chi tiết"
                    >
                      <div
                        style={{ backgroundColor: featuredBook.coverTheme?.bg || '#0f4c81' }}
                        className="w-32 h-44 rounded-r-md rounded-l-xs text-white p-3 flex flex-col justify-between shadow-2xl relative transition-transform duration-300 group-hover/cover:scale-105"
                      >
                        <div className="absolute inset-y-0 left-0 w-2.5 bg-black/25 rounded-l-xs border-r border-white/10" />
                        <div className="text-center pl-2 pr-1">
                          <p className="text-[9px] font-medium text-white/90 truncate tracking-wide">
                            {featuredBook.coverTheme?.author || featuredBook.author}
                          </p>
                        </div>
                        <div className="text-center px-1 my-auto">
                          <h4 className="text-[10px] font-black uppercase tracking-tight leading-snug whitespace-pre-line text-white drop-shadow-xs">
                            {featuredBook.coverTheme?.title || featuredBook.title}
                          </h4>
                        </div>
                        <div className="text-center pt-1 border-t border-white/20 pl-2 pr-1">
                          <span className="text-[8px] font-bold tracking-wider uppercase text-white/80">
                            {featuredBook.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wide">
                        {featuredBook.category}
                      </span>
                      <h3
                        onClick={() => handleViewBookDetail(featuredBook)}
                        className="text-lg sm:text-xl font-bold font-heading text-white hover:text-teal-200 transition-colors cursor-pointer leading-snug"
                      >
                        {featuredBook.title}
                      </h3>
                      <p className="text-xs text-slate-300">
                        Tác giả: <strong className="text-white">{featuredBook.author}</strong> · Năm {featuredBook.publishYear}
                      </p>
                      <p className="text-xs text-teal-100/80 leading-relaxed line-clamp-2 pt-1">
                        {featuredBook.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/15 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(featuredBook)}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{cartItems.some(i => i.id === featuredBook.id) ? 'Đã trong giỏ' : 'Thêm vào giỏ mượn'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewBookDetail(featuredBook)}
                      className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/15 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 3 cuốn sách mới đi kèm */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
                {otherNewBooks.map((book) => {
                  const isInCart = cartItems.some((item) => item.id === book.id);
                  return (
                    <BookCard
                      key={book.id}
                      book={book}
                      onAddToCart={handleAddToCart}
                      onViewDetail={(item) => handleViewBookDetail(item || book)}
                      isInCart={isInCart}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* MỤC 2: ĐỀ XUẤT CHO BẠN TRONG KHUNG PANEL CAO CẤP */}
          <section className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs backdrop-blur-xs space-y-6" aria-labelledby="heading-recommended-books">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <TrendingUp className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h2 id="heading-recommended-books" className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                    Đề Xuất Cho Bạn
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Những đầu sách được sinh viên UTH mượn nhiều nhất và có phản hồi học tập tích cực
                  </p>
                </div>
              </div>

              {/* Bộ lọc chuyên ngành nhanh cho Đề xuất ngay trên Trang chủ */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {recommendTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRecommendCategory(tab.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      recommendCategory === tab.key
                        ? 'bg-[#00666B] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedBooks.map((book) => {
                const isInCart = cartItems.some((item) => item.id === book.id);
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                    onViewDetail={(item) => handleViewBookDetail(item || book)}
                    isInCart={isInCart}
                  />
                );
              })}
            </div>
          </section>

          {/* DẢI QUY TRÌNH PICK & GO 3 BƯỚC */}
          <section className="bg-gradient-to-r from-[#00383b] via-[#004f54] to-[#00383b] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-teal-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-md space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                  Đặc quyền sinh viên UTH
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white leading-tight">
                  Mượn giáo trình tiện lợi với Pick & Go
                </h3>
                <p className="text-xs text-teal-100/80 pt-1 leading-relaxed">
                  Thủ thư gom sẵn sách lên khay giữ chỗ trước khi bạn đến quầy. Tiết kiệm tối đa thời gian trong giờ cao điểm học kỳ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/25 text-teal-200 flex items-center justify-center text-xs font-bold font-mono">
                    01
                  </div>
                  <strong className="block text-sm font-bold text-white">Thêm vào giỏ mượn</strong>
                  <p className="text-[11px] text-teal-200/80 leading-normal">
                    Chọn tối đa 5 đầu sách trực tuyến mọi lúc.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/25 text-teal-200 flex items-center justify-center text-xs font-bold font-mono">
                    02
                  </div>
                  <strong className="block text-sm font-bold text-white">Chọn lịch hẹn nhận</strong>
                  <p className="text-[11px] text-teal-200/80 leading-normal">
                    Thủ thư gom sẵn ra khay tiếp nhận riêng.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/25 text-teal-200 flex items-center justify-center text-xs font-bold font-mono">
                    03
                  </div>
                  <strong className="block text-sm font-bold text-white">Quét QR & Nhận ngay</strong>
                  <p className="text-[11px] text-teal-200/80 leading-normal">
                    Xác thực tức thì tại quầy tiếp nhận 3 cơ sở.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* MỤC: HỆ THỐNG THƯ VIỆN 3 CƠ SỞ UTH - Có nền thiết kế đồng bộ nhận diện UTH */}
          <section
            className="bg-gradient-to-b from-[#eaf5f2] via-[#f0f8f5] to-[#e6f3ee] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#b8dfd5] shadow-xs relative overflow-hidden space-y-6"
            aria-labelledby="heading-campuses"
          >
            {/* Họa tiết quầng sáng trang trí nền */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#cce8df] relative z-1">
              <div>
                <h2 id="heading-campuses" className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
                  Hệ thống Thư viện 3 Cơ sở UTH
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                  Không gian học tập, phòng đọc hiện đại và quầy nhận sách Pick & Go tại các cơ sở đào tạo của trường.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/95 border border-teal-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#00666B]" />
                <span>3 Cơ sở liên thông dữ liệu sách</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-1">
              {campusesData.map((campus) => (
                <div
                  key={campus.id}
                  className="bg-white rounded-3xl border border-teal-200/90 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                    <img
                      src={campus.image}
                      alt={campus.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/25 to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-4 bg-[#00666B] text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md border border-white/20">
                      {campus.name}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold leading-snug drop-shadow-xs">{campus.name}</h3>
                      <p className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                        <span className="truncate">{campus.address}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-gradient-to-b from-white to-slate-50/70">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100/90 space-y-1">
                        <span className="text-slate-500 font-semibold block text-[11px]">Giờ mở cửa:</span>
                        <strong className="text-slate-900 block font-bold">{campus.hours}</strong>
                        <span className="text-[11px] text-teal-800 font-semibold block">{campus.schedule}</span>
                      </div>
                      <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100/90 space-y-1">
                        <span className="text-slate-500 font-semibold block text-[11px]">Không gian học tập:</span>
                        <strong className="text-slate-900 block font-bold">{campus.seats}</strong>
                        <span className="text-[11px] text-teal-800 font-semibold block">Trang bị máy lạnh & Wifi</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-slate-100">
                      {campus.desc}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Phone className="w-3.5 h-3.5 text-[#00666B]" />
                        <span>{campus.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('catalog');
                        }}
                        className="text-xs font-bold text-[#00666B] hover:text-[#004f53] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Tra cứu {campus.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MỤC 3: HỆ SINH THÁI DỊCH VỤ HỌC THUẬT UTH */}
          <section className="space-y-4" aria-labelledby="heading-services">
            <div className="pb-1">
              <h2 id="heading-services" className="text-2xl font-black text-slate-900 font-heading tracking-tight">
                Hệ sinh thái dịch vụ học thuật UTH
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Các tiện ích số hóa hỗ trợ sinh viên xuyên suốt quá trình học tập và nghiên cứu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => setActiveTab('catalog')}
                className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-[#00666B] hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#00666B] border border-teal-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#00666B] transition-colors">
                    Phòng Tự Học & Thảo Luận
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Trang bị máy lạnh, màn hình tương tác, wifi tốc độ cao và nguồn sạc tại từng bàn học.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00666B]">
                  <span>Xem không gian</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('catalog')}
                className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                    Giáo Trình Số & E-Book
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Truy cập hơn 120.000 đầu sách điện tử, giáo trình số hóa đọc trực tuyến 24/7 không giới hạn.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Tra cứu E-Book</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('catalog')}
                className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-500 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                    Kho Luận Văn & Khóa Luận
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tra cứu các công trình nghiên cứu khoa học, luận văn thạc sĩ và khóa luận tốt nghiệp đạt điểm cao.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>Tra cứu đề tài</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('catalog')}
                className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-[#00666B] hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#00666B] border border-teal-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#00666B] transition-colors">
                    Hỗ Trợ Thủ Thư Trực Tuyến
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tư vấn tìm kiếm tài liệu chuyên sâu, trích dẫn chuẩn APA/IEEE và giải đáp thắc mắc qua chat.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00666B]">
                  <span>Gửi yêu cầu hỗ trợ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* BANNER ĐIỀU HƯỚNG SANG KHO SÁCH ĐẦY ĐỦ */}
          <div className="p-8 sm:p-10 bg-gradient-to-r from-[#002b2e] via-[#00383b] to-[#002b2e] rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-teal-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 text-center sm:text-left z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                Kho tài liệu đào tạo chính quy 2026
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                Bạn cần tìm giáo trình chuyên ngành cụ thể?
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
                Khám phá kho tài liệu đầy đủ với các bộ lọc chuyên sâu theo chuyên ngành Công nghệ thông tin, Kinh tế, Logistics và Ngoại ngữ cùng tình trạng còn sẵn tại quầy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className="px-7 py-4 bg-white text-[#00666B] hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2.5 cursor-pointer shrink-0 active:scale-95 z-10"
            >
              <Compass className="w-4 h-4 text-[#00666B]" />
              <span>Đến Kho Sách & Bộ Lọc Nâng Cao</span>
              <ArrowRight className="w-4 h-4 text-[#00666B]" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MÀN HÌNH KHO SÁCH (CÓ BỘ LỌC SIDEBAR FILTER CHUYÊN NGHIỆP - TV3 DESKTOP) */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 select-none">
          {/* Header Kho sách với Nền UTH Deep Academic Teal sang trọng và chỉ số năng lực */}
          <div className="bg-gradient-to-br from-[#002e32] via-[#00474b] to-[#002528] rounded-3xl p-6 sm:p-8 border border-teal-700/60 shadow-xl relative overflow-hidden text-white space-y-5">
            {/* Họa tiết quầng sáng học thuật & ma trận điểm */}
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
              aria-hidden="true"
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-200/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Trang chủ
                  </button>
                  <span className="text-teal-400/60">/</span>
                  <span className="text-teal-100 font-bold">Kho giáo trình & Tài liệu học thuật</span>
                  {selectedCategory !== 'ALL' && (
                    <>
                      <span className="text-teal-400/60">/</span>
                      <span className="text-amber-300 font-bold">{selectedCategory}</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight drop-shadow-xs">
                  Kho Sách & Giáo Trình Chính Quy UTH
                </h1>

                <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed font-medium">
                  Tra cứu nguồn tài liệu phục vụ giảng dạy và nghiên cứu, liên thông dữ liệu sách giữa 3 cơ sở đào tạo Thư viện Đại học Giao thông Vận tải TP.HCM.
                </p>
              </div>

              {/* Chỉ số năng lực thư viện UTH */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap relative z-10">
                <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-sm text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-200/80">Tài liệu</span>
                  <span className="text-sm font-black text-white font-mono">50.000+ cuốn</span>
                </div>
                <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-sm text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-200/80">Mạng lưới</span>
                  <span className="text-sm font-black text-teal-100 font-mono">3 Cơ sở UTH</span>
                </div>
                <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-sm text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-300">Hạn mức BR01</span>
                  <span className="text-sm font-black text-amber-300 font-mono">5 cuốn / SV</span>
                </div>
              </div>
            </div>

            {/* Dải gợi ý từ khóa tìm nhanh */}
            <div className="pt-4 border-t border-white/15 flex items-center gap-2 flex-wrap relative z-10">
              <span className="text-xs font-bold text-teal-200 flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Tìm nhanh:</span>
              </span>
              {[
                'Lập trình Python',
                'Kinh tế vi mô',
                'Logistics & Vận tải',
                'Trí tuệ nhân tạo',
                'Tiếng Anh chuyên ngành',
              ].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSearchQuery(kw)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-medium backdrop-blur-xs ${
                    searchQuery === kw
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                      : 'bg-white/10 hover:bg-white/20 text-teal-100 border-white/15'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* BỐ CỤC 2 CỘT: CỘT BỘ LỌC + CỘT GRID SÁCH */}
          <div className="flex items-start gap-8">
            {/* Cột trái: Bộ lọc Desktop chuyên nghiệp */}
            <FilterSidebarPC
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onlyAvailable={onlyAvailable}
              onToggleOnlyAvailable={(val) => setOnlyAvailable(val)}
              selectedType={selectedType}
              onSelectType={(type) => setSelectedType(type)}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              totalResults={filteredBooks.length}
            />

            {/* Cột phải: Thanh công cụ Catalog & Grid danh mục sách */}
            <div className="flex-1 space-y-5 min-w-0">
              {/* Thanh các thẻ lọc đang áp dụng */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs">
                  <span className="font-bold text-[#00666B] text-[11px] uppercase tracking-wider">
                    Đang lọc:
                  </span>

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-teal-200 text-slate-800 font-medium shadow-2xs">
                      <span>Từ khóa: <strong>"{searchQuery}"</strong></span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Xóa tìm kiếm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-teal-200 text-slate-800 font-medium shadow-2xs">
                      <span>Ngành: <strong>{selectedCategory}</strong></span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('ALL')}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Xóa chuyên ngành"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {onlyAvailable && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-teal-200 text-emerald-800 font-medium shadow-2xs">
                      <span>Chỉ sách còn sẵn</span>
                      <button
                        type="button"
                        onClick={() => setOnlyAvailable(false)}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Bỏ lọc còn sẵn"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedType !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-teal-200 text-slate-800 font-medium shadow-2xs">
                      <span>Loại: <strong>{selectedType === 'PRINT' ? 'Sách in tại quầy' : 'E-Book / Số'}</strong></span>
                      <button
                        type="button"
                        onClick={() => setSelectedType('ALL')}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Xóa lọc loại hình"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="ml-auto text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}

              {/* Thanh điều khiển catalog */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#e0eff0] text-[#00666B] flex items-center justify-center font-black text-xs font-mono">
                    {filteredBooks.length}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Kết quả danh mục
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Hiển thị <strong>{filteredBooks.length}</strong> giáo trình đào tạo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sắp xếp */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-medium hidden sm:inline">Sắp xếp:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00666B] cursor-pointer"
                    >
                      <option value="relevant">Phù hợp nhất</option>
                      <option value="newest">Mới nhất (Năm xuất bản)</option>
                      <option value="available">Còn sẵn nhiều nhất</option>
                      <option value="borrowCount">Lượt mượn nhiều nhất</option>
                      <option value="title">Tên sách (A - Z)</option>
                    </select>
                  </div>

                  {/* Chuyển chế độ xem */}
                  <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                        viewMode === 'grid'
                          ? 'bg-white text-[#00666B] shadow-2xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Xem dạng lưới 3D"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Lưới 3D</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('compact')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                        viewMode === 'compact'
                          ? 'bg-white text-[#00666B] shadow-2xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Xem dạng danh sách gọn"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Danh sách</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid sách hoặc Danh sách gọn */}
              {filteredBooks.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-3.5'
                  }
                >
                  {filteredBooks.map((book) => {
                    const isInCart = cartItems.some((item) => item.id === book.id);
                    return (
                      <BookCard
                        key={book.id}
                        book={book}
                        onAddToCart={handleAddToCart}
                        onViewDetail={(item) => handleViewBookDetail(item || book)}
                        isInCart={isInCart}
                        viewMode={viewMode}
                      />
                    );
                  })}
                </div>
              ) : (
                /* Empty state khi không tìm thấy kết quả */
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#00666B] flex items-center justify-center mx-auto shadow-xs">
                    <Search className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Không tìm thấy tài liệu phù hợp</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mt-1">
                      Không có giáo trình nào khớp với từ khóa "{searchQuery}" hoặc các tiêu chí lọc đang chọn. Bạn có thể xóa bộ lọc hoặc tìm kiếm bằng từ khóa khác.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00666B] hover:bg-[#005458] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xóa toàn bộ bộ lọc</span>
                  </button>
                </div>
              )}

              {/* Tóm tắt chân trang kho sách */}
              {filteredBooks.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
                  <span>
                    Đang hiển thị toàn bộ <strong>{filteredBooks.length}</strong> giáo trình trên hệ thống Thư viện UTH.
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700">Dữ liệu thời gian thực</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 4. CÁC MODAL & DRAWER TƯƠNG TÁC (Đã bỏ BookDetailModal dạng popup theo yêu cầu) */}
      {/* Drawer Giỏ mượn sách & Lên lịch hẹn */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Modal Mã QR Đơn mượn / Trả sách */}
      <ReturnQrModal
        isOpen={Boolean(qrModalOrder)}
        onClose={() => setQrModalOrder(null)}
        order={qrModalOrder}
      />

      {/* Floating Cart Quick Access Pill (Desktop) */}
      {cartItems.length > 0 && !isCartOpen && (
        <aside
          aria-label="Xem giỏ mượn nhanh"
          className="fixed bottom-8 right-8 z-40 hidden lg:block animate-in fade-in slide-in-from-bottom duration-300 select-none"
        >
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="group flex items-center gap-3 bg-gradient-to-r from-[#002b2e] to-[#00474b] hover:from-[#002022] hover:to-[#00383b] text-white p-2.5 pl-4 pr-4 rounded-2xl shadow-2xl border-2 border-teal-400/40 hover:border-amber-400 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-black/10"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:rotate-6 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
                  Pick & Go · UTH
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-black tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>Giỏ mượn:</span>
                <span className="text-amber-300 font-mono text-sm">{cartItems.length}/5</span>
                <span>cuốn</span>
              </div>
            </div>
            <div className="ml-1 w-8 h-8 rounded-xl bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </aside>
      )}

      {/* Toast thông báo Desktop cao cấp (Impeccable Floating Toast) */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 text-white p-3.5 pl-4 pr-4 shadow-2xl shadow-slate-950/40 border border-slate-700/80 backdrop-blur-md ring-1 ring-white/10 flex items-center gap-3">
            {/* Thanh vạch phát sáng đỉnh */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400" />

            {/* Icon nhận diện thành công */}
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Check className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 block">
                Thư viện UTH
              </span>
              <p className="text-xs sm:text-[13px] font-bold text-white leading-snug mt-0.5">
                {toastMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </StudentLayout>
  );
}

/* ==================== PHẦN 3: APP ROUTER ĐIỀU HƯỚNG TỔNG THỂ ==================== */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang Đăng nhập & Đăng ký theo mẫu thiết kế UTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Các màn hình ứng dụng thư viện */}
        <Route
          path="/*"
          element={
            <>
              {/* Màn hình nhỏ dưới lg (dưới 1024px) hiển thị Mobile */}
              <div className="lg:hidden">
                <MobileApp />
              </div>

              {/* Màn hình máy tính từ lg (1024px trở lên) hiển thị Desktop */}
              <div className="hidden lg:block">
                <Routes>
                  <Route path="/" element={<DesktopApp />} />
                  <Route path="/books" element={<DesktopApp />} />
                  <Route path="/books/:id" element={<DesktopApp />} />
                  <Route path="/loans" element={<DesktopApp />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
