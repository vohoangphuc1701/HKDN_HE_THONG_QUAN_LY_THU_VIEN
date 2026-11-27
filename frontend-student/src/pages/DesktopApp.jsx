import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Check,
  X,
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
import StudentLayout from '../components/layout/StudentLayout';
import BookCard from '../components/common/BookCard';
import CartDrawer from '../components/common/CartDrawer';
import ReturnQrModal from '../components/common/ReturnQrModal';
import FilterSidebarPC from '../components/responsive/FilterSidebarPC';
import BookDetailPage from '../components/pages/BookDetailPage';
import LoansTableViewPC from '../components/responsive/LoansTableViewPC';
import LoanHistoryTableViewPC from '../components/responsive/LoanHistoryTableViewPC';
import BookListPage from './BookListPage';
import CheckoutSchedulePage from './CheckoutSchedulePage';
import bookApi from '../services/bookApi';
import { loadCartItems, saveCartItems } from '../utils/studentSession';
import mockBooks from '../mockPCBooks.json';
import campusesData from '../data/campusesData';
import CampusExplorerSection from '../components/pages/sections/CampusExplorerSection';
import AcademicServicesSection from '../components/pages/sections/AcademicServicesSection';
export default function DesktopApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeBookId } = useParams();

  // Xác định tab trực tiếp từ URL path
  const activeTab =
    location.pathname === '/books' || location.pathname === '/catalog' || location.pathname.startsWith('/books/')
      ? 'catalog'
      : location.pathname === '/loans'
        ? 'loans'
        : location.pathname === '/history'
          ? 'history'
          : location.pathname === '/checkout'
            ? 'checkout'
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

  // Tự động cuộn lên đầu trang khi chuyển trang hoặc đổi tab (tránh bị nhảy xuống đáy trang)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, activeTab]);

  // Quản lý Modal & Drawer & Trang Chi tiết sách
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState(null);
  const [qrModalOrder, setQrModalOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Danh sách giáo trình động từ API (fallback sang mockBooks khi Backend offline)
  const [books, setBooks] = useState(mockBooks);
  useEffect(() => {
    let cancelled = false;
    bookApi
      .getBooks({ size: 50 })
      .then((res) => {
        if (!cancelled && Array.isArray(res?.content) && res.content.length > 0 && !res.isFallback) {
          setBooks(res.content);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Cuốn sách đang xem chi tiết (ưu tiên id trên URL /books/:id hoặc state)
  const viewingBook = routeBookId
    ? books.find((b) => String(b.id) === String(routeBookId)) || selectedBookDetail
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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (tab === 'home' && location.pathname !== '/') {
      navigate('/');
    } else if (tab === 'catalog' && (location.pathname !== '/books' || routeBookId)) {
      navigate('/books');
    } else if (tab === 'loans' && location.pathname !== '/loans') {
      navigate('/loans');
    } else if (tab === 'history' && location.pathname !== '/history') {
      navigate('/history');
    } else if (tab === 'checkout' && location.pathname !== '/checkout') {
      navigate('/checkout');
    }
  };

  // Giỏ mượn sách khởi tạo: Tự động khôi phục từ localStorage dùng chung giữa Mobile & Desktop
  const [cartItems, setCartItems] = useState(() =>
    loadCartItems([mockBooks[0], mockBooks[1]])
  );

  // Tự động đồng bộ giỏ mượn vào localStorage khi có thay đổi
  useEffect(() => {
    saveCartItems(cartItems);
  }, [cartItems]);

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
  const newBooks = books
    .filter((b) => b.isNew || (b.publishYear && b.publishYear >= 2023))
    .sort((a, b) => (b.publishYear || 0) - (a.publishYear || 0))
    .slice(0, 4);

  const featuredBook = newBooks[0];
  const otherNewBooks = newBooks.slice(1, 4);

  // Sách đề xuất trên Trang Chủ (lọc theo tab chuyên ngành, sắp xếp theo lượt mượn & đánh giá)
  const recommendedBooks = books
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
          allBooks={books}
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
                        Gia hạn online: 2 lần (+7 ngày) (BR03)
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

          {/* 2. MÀN HÌNH LỊCH SỬ MƯỢN TRẢ & ĐỐI SOÁT PHÍ PHẠT (BR04 - DESKTOP TV3) */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <LoanHistoryTableViewPC
                onBorrowAgain={(book) => {
                  handleAddToCart(book);
                  showToast(`Đã thêm tài liệu "${book.title}" vào giỏ mượn!`);
                }}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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
                <span>Xem tất cả sách mới ({books.filter((b) => b.isNew || (b.publishYear && b.publishYear >= 2023)).length})</span>
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

                  <div className="pt-5 mt-4 border-t border-white/15 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(featuredBook)}
                      className="flex-1 min-w-[130px] bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cartItems.some(i => i.id === featuredBook.id) ? 'Đã trong giỏ' : 'Thêm vào giỏ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewBookDetail(featuredBook)}
                      className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/15 transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {/* 3 cuốn sách mới đi kèm */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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

          {/* MỤC: HỆ THỐNG THƯ VIỆN 3 CƠ SỞ UTH */}
          <CampusExplorerSection
            onSelectCampusCatalog={(campusCode) => {
              setActiveTab('catalog');
            }}
          />

          {/* MỤC: HỆ SINH THÁI DỊCH VỤ HỌC THUẬT UTH */}
          <AcademicServicesSection
            onOpenCatalog={() => setActiveTab('catalog')}
            onOpenChatbot={() => {
              const chatBtn =
                document.querySelector('button[aria-label="Mở Trợ lý ảo AI Thư viện UTH"]') ||
                Array.from(document.querySelectorAll('button')).find(
                  (b) => b.title && b.title.includes('Trợ lý ảo')
                );
              if (chatBtn) chatBtn.click();
            }}
          />

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

      {/* 3. MÀN HÌNH KHO SÁCH (ĐÃ TÁCH THÀNH COMPONENT RIÊNG BOOKLISTPAGE - SESSION 7) */}
      {activeTab === 'catalog' && (
        <BookListPage
          books={books}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onViewDetail={handleViewBookDetail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onlyAvailable={onlyAvailable}
          setOnlyAvailable={setOnlyAvailable}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          onNavigateHome={() => setActiveTab('home')}
        />
      )}

      {/* 4. MÀN HÌNH XÁC NHẬN ĐƠN MƯỢN & ĐẶT LỊCH HẸN (SESSION 9 - TV3 DESKTOP) */}
      {activeTab === 'checkout' && (
        <CheckoutSchedulePage
          cartItems={cartItems}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={() => setCartItems([])}
          onCheckoutSuccess={handleCheckoutSuccess}
          onBackToCatalog={() => setActiveTab('catalog')}
          onOpenQrModal={(order) => setQrModalOrder(order)}
        />
      )}
        </>
      )}

      {/* 5. CÁC MODAL & DRAWER TƯƠNG TÁC (Đã bỏ BookDetailModal dạng popup theo yêu cầu) */}
      {/* Drawer Giỏ mượn sách & Lên lịch hẹn */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleCheckoutSuccess}
        onOpenFullCheckout={() => {
          setIsCartOpen(false);
          setActiveTab('checkout');
        }}
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
          className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200 select-none max-w-sm"
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
