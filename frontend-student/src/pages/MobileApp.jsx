import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Menu,
  X,
  ShoppingBag,
  MapPin,
  Phone,
  Headphones,
  Home,
  Compass,
  BookMarked,
  History,
  QrCode,
  ChevronRight,
  HelpCircle,
  Bell,
  LogOut,
  Check
} from 'lucide-react';
import BookDetailPageMobile from './BookDetailPage';
import HomePage from './HomePage';
import BookListPage from './BookListPage';
import LoansCardListMobile from '../components/responsive/LoansCardListMobile';
import LoanHistoryPage from './LoanHistoryPage';
import CartDrawer from '../components/common/CartDrawer';
import ReturnQrModal from '../components/common/ReturnQrModal';
import ChatBotWidget from '../components/common/ChatBotWidget';
import CheckoutSchedulePage from './CheckoutSchedulePage';
import bookApi from '../services/bookApi';
import {
  loadCartItems,
  saveCartItems,
  getStoredStudentProfile,
  clearAuthSession,
} from '../utils/studentSession';
import mockBooks from '../mockPCBooks.json';

export default function MobileApp() {
  const navigate = useNavigate();
  const studentProfile = getStoredStudentProfile();
  const [books, setBooks] = useState(mockBooks);
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() =>
    loadCartItems([mockBooks[0], mockBooks[1]])
  );
  const [toastMessage, setToastMessage] = useState('');
  const [mobileDetailBook, setMobileDetailBook] = useState(null);
  const [mobileQrOrder, setMobileQrOrder] = useState(null);
  const [scheduleData, setScheduleData] = useState(null); // { mode: 'pickup' | 'return', items: [] }

  // Đồng bộ giỏ mượn vào localStorage dùng chung với Desktop
  useEffect(() => {
    saveCartItems(cartItems);
  }, [cartItems]);

  // Tải danh sách sách động (fallback mockBooks khi Backend offline)
  useEffect(() => {
    let cancelled = false;
    bookApi
      .getBooks({ size: 50 })
      .then((res) => {
        if (!cancelled && Array.isArray(res?.content) && res.content.length > 0) {
          setBooks(res.content);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const showMobileToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleAddToCart = (book) => {
    if (!book) return;
    const normalizedBook =
      books.find(
        (b) => b.id === book.id || (book.code && b.code === book.code)
      ) || book;

    if (
      cartItems.some(
        (item) =>
          item.id === normalizedBook.id ||
          (normalizedBook.code && item.code === normalizedBook.code)
      )
    ) {
      showMobileToast(`"${normalizedBook.title}" đã có sẵn trong giỏ sách!`);
      return;
    }
    if (cartItems.length >= 5) {
      showMobileToast('Giỏ mượn đã đạt tối đa 5 cuốn theo quy định UTH (BR01).');
      return;
    }
    setCartItems((prev) => [...prev, normalizedBook]);
    showMobileToast(`Đã thêm "${normalizedBook.title}" vào giỏ sách!`);
  };

  const handleRemoveCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMobileCheckoutSuccess = (newOrder) => {
    setCartItems([]);
    setIsCartOpen(false);
    setMobileQrOrder(newOrder);
    showMobileToast(`Đặt mượn thành công! Mã đơn: ${newOrder.code}`);
  };

  if (mobileDetailBook) {
    return (
      <div className="min-h-screen bg-[#f4f8f7]">
        <BookDetailPageMobile
          book={mobileDetailBook}
          onBack={() => setMobileDetailBook(null)}
          onGoHome={() => {
            setMobileDetailBook(null);
            setIsCartOpen(false);
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onAddToCart={handleAddToCart}
          isInCart={cartItems.some((item) => item.id === mobileDetailBook.id)}
          onOpenCart={() => setIsCartOpen(true)}
          allBooks={books}
          onSelectBook={setMobileDetailBook}
          cartCount={cartItems.length}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onRemoveItem={handleRemoveCartItem}
          onCheckoutSuccess={handleMobileCheckoutSuccess}
          onOpenSchedulePage={(items) => {
            setIsCartOpen(false);
            setScheduleData({ mode: 'pickup', items });
          }}
        />
        <ReturnQrModal
          isOpen={Boolean(mobileQrOrder)}
          onClose={() => setMobileQrOrder(null)}
          order={mobileQrOrder}
        />
      </div>
    );
  }

  if (scheduleData) {
    return (
      <CheckoutSchedulePage
        cartItems={scheduleData.items}
        mode={scheduleData.mode}
        onBack={() => setScheduleData(null)}
        onConfirm={(order) => {
          if (scheduleData.mode === 'pickup') {
            setCartItems([]);
          }
          setScheduleData(null);
          setMobileQrOrder(order);
          setActiveTab('loans');
          showMobileToast(`Đặt lịch thành công! Mã: ${order.code}`);
        }}
        onShowToast={showMobileToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col justify-between text-slate-800">
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shadow-md">
        {/* Vùng logo góc trái: bấm để quay về Trang chủ từ bất kỳ tab nào */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('home');
            setIsMenuSheetOpen(false);
            setIsDrawerOpen(false);
            setIsCartOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left cursor-pointer rounded-xl -m-1 p-1 hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Về trang chủ"
          title="Về trang chủ"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight flex items-center gap-1.5">
              Thư viện <span className="text-[10px] text-teal-200 px-1 py-0.2 bg-white/15 rounded">UTH</span>
            </h1>
            <p className="text-[10px] text-teal-100/80">Cổng Sinh Viên (Mobile &amp; Tablet)</p>
          </div>
        </button>

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

          {/* VỊ TRÍ 2 TỪ PHẢI: Nút giỏ sách mượn */}
          <button
            type="button"
            onClick={() => {
              setIsCartOpen(true);
              setIsMenuSheetOpen(false);
              setIsDrawerOpen(false);
            }}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Giỏ mượn sách"
            title="Giỏ mượn sách"
          >
            <ShoppingBag className="w-4 h-4 text-white stroke-[2]" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-amber-400 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                {cartItems.length}
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
            {studentProfile.initials}
          </button>
        </div>
      </header>

      {/* TAB TRANG CHỦ: SỬ DỤNG HOMEPAGE CHUẨN RESPONSIVE ĐỒNG BỘ TV3 PC */}
      {activeTab === 'home' && (
        <HomePage
          onAddToCart={handleAddToCart}
          onViewDetail={(item) => setMobileDetailBook(item)}
          cartItems={cartItems}
          onNavigateTab={setActiveTab}
          onQuickSearch={(kw) => {
            setSearchQuery(kw);
            setActiveTab('search');
          }}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setActiveTab('search');
          }}
        />
      )}

      {/* CÁC TAB KHÁC: GIAO DIỆN CO GIÃN TỰ ĐỘNG THEO TABLET VÀ MOBILE */}
      {activeTab !== 'home' && (
        <main className="flex-1 p-3.5 sm:p-6 max-w-md sm:max-w-2xl md:max-w-4xl mx-auto w-full pb-20 space-y-3.5">
          {activeTab === 'search' && (
            <BookListPage
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onlyAvailable={onlyAvailable}
              onToggleOnlyAvailable={setOnlyAvailable}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              sortBy={sortBy}
              onChangeSortBy={setSortBy}
              onAddToCart={handleAddToCart}
              onViewDetail={(item) => setMobileDetailBook(item)}
              cartItems={cartItems}
              onNavigateTab={setActiveTab}
            />
          )}

        {activeTab === 'loans' && (
          <LoansCardListMobile
            onOpenQrModal={(order) => setMobileQrOrder(order)}
            onShowToast={showMobileToast}
            onOpenScheduleReturn={(books) => setScheduleData({ mode: 'return', items: books })}
          />
        )}

        {activeTab === 'history' && (
          <LoanHistoryPage
            onBorrowAgain={handleAddToCart}
            onShowToast={showMobileToast}
          />
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
                <span>🔄 Gia hạn <strong className="text-white">2 lần</strong> (+7 ngày)</span>
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
              { id: 'loans',   icon: BookMarked, label: 'Phiếu mượn',     desc: `${cartItems.length} sách trong giỏ`, color: 'bg-amber-50 text-amber-700 border-amber-200/60', activeBg: 'bg-amber-600 text-white border-amber-600', badge: cartItems.length },
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
            onClick={() => {
              setIsMenuSheetOpen(false);
              setMobileQrOrder({
                code: 'DH-UTH-2026-089',
                campus: 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
                pickupDate: 'Hôm nay (Giờ làm việc 07:30 - 20:30)',
                books: [
                  { title: 'Nhập môn Trí tuệ nhân tạo & Học máy', code: 'CNTT-AI-005' },
                  { title: 'Khai phá dữ liệu lớn với Spark', code: 'CNTT-BD-006' },
                ],
                status: 'READY_FOR_PICKUP',
              });
            }}
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
                {studentProfile.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold truncate">{studentProfile.fullName}</h3>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-400 text-slate-900 rounded-full shrink-0">
                    {studentProfile.cardStatus}
                  </span>
                </div>
                <p className="text-teal-200 text-xs mt-0.5">MSSV: <span className="font-semibold text-white">{studentProfile.studentId}</span></p>
                <p className="text-teal-100/80 text-[11px] truncate">{studentProfile.email} • {studentProfile.major}</p>
              </div>
            </div>

            {/* Chỉ số theo quy tắc nghiệp vụ BR01 & BR04 */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/15 text-center">
              <div className="bg-white/10 rounded-xl py-1.5 px-1">
                <div className="text-[10px] text-teal-200">Giỏ mượn</div>
                <div className="text-xs font-bold text-white mt-0.5">{cartItems.length} / 5 cuốn</div>
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
                showMobileToast('Quy định UTH: Tối đa 5 cuốn · 14 ngày · Gia hạn 2 lần (+7 ngày) · Phạt 5.000đ/ngày.');
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
                showMobileToast(`Đã bật nhắc hạn trả sách qua email ${studentProfile.email} (trước 2 ngày).`);
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
                clearAuthSession();
                navigate('/login');
              }}
              className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ngăn kéo Giỏ Mượn Sách & Đặt Lịch Hẹn Lấy Pick & Go trên Mobile */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleMobileCheckoutSuccess}
        onOpenSchedulePage={(items) => {
          setIsCartOpen(false);
          setScheduleData({ mode: 'pickup', items });
        }}
      />

      {/* Modal Mã QR Đơn Mượn / Phiếu Hẹn Trả trên Mobile */}
      <ReturnQrModal
        isOpen={Boolean(mobileQrOrder)}
        onClose={() => setMobileQrOrder(null)}
        order={mobileQrOrder}
      />

      {/* Trợ lý ảo Chatbot AI trên Mobile – Full-screen khi mở, kéo thả khi đóng */}
      <ChatBotWidget
        onNavigateToBook={(bookId) => {
          const book = books.find((b) => b.id === bookId);
          if (book) setMobileDetailBook(book);
        }}
        onNavigateToTab={(tab) => {
          setActiveTab(tab === 'catalog' ? 'search' : tab === 'home' ? 'home' : tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

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
