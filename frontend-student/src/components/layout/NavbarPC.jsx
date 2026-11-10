import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Bell,
  BookOpen,
  Home,
  Compass,
  BookMarked,
  ChevronDown,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut
} from 'lucide-react';

const NavbarPC = ({
  activeTab = 'catalog',
  setActiveTab,
  cartCount = 0,
  onOpenCart,
  searchQuery = '',
  setSearchQuery
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setActiveTab) {
      setActiveTab('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#00666B] text-white border-b border-[#005256] shadow-sm select-none">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

        {/* CỤM TRÁI: Logo UTH & Main Navigation */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0 min-w-0">
          {/* Logo Thư viện UTH */}
          <div
            onClick={() => setActiveTab && setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            title="Trường Đại học Giao thông Vận tải TP.HCM - Thư viện UTH"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00666B] shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-4 h-4 text-[#00666B]" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-white tracking-tight font-heading">
                  Thư viện
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/20 text-white uppercase tracking-wider">
                  UTH
                </span>
              </div>
              <span className="text-[10px] font-medium text-teal-200 tracking-tight hidden sm:inline mt-0.5">
                Cổng sinh viên trực tuyến
              </span>
            </div>
          </div>

          {/* Navigation Links phẳng, sắc nét */}
          <nav className="hidden md:flex items-center space-x-1 shrink-0" aria-label="Điều hướng chính">
            {/* 1. Trang chủ */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>

            {/* 2. Kho sách */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Kho sách & Giáo trình</span>
            </button>

            {/* 3. Đang mượn */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('loans')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'loans'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Sách đang mượn</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded">
                3
              </span>
            </button>
          </nav>
        </div>

        {/* CỤM GIỮA: Thanh tìm kiếm nhanh */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-[140px] max-w-sm lg:max-w-md relative"
        >
          <div className="flex items-center w-full bg-white/15 hover:bg-white/20 focus-within:bg-white focus-within:text-slate-800 rounded-lg border border-white/20 focus-within:border-white focus-within:shadow-sm px-3 py-1.5 transition-all text-white">
            <Search className="w-3.5 h-3.5 text-teal-100 focus-within:text-slate-500 shrink-0 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Tìm tên sách, giáo trình, môn học..."
              className="w-full bg-transparent text-xs placeholder:text-teal-100/70 focus:placeholder:text-slate-400 focus:text-slate-800 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="p-0.5 text-teal-200 hover:text-white focus-within:text-slate-400 focus-within:hover:text-slate-600 rounded cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-teal-200/90 bg-white/10 rounded pointer-events-none shrink-0">
                Ctrl K
              </span>
            )}
          </div>
        </form>

        {/* CỤM PHẢI: Thông báo, Giỏ mượn & Hồ sơ Sinh viên */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* 1. Nút Thông báo (Bell) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative border cursor-pointer ${
                showNotifications
                  ? 'bg-white/25 border-white text-white'
                  : 'border-white/15 text-teal-100 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Thông báo thư viện"
              title="Thông báo thư viện"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#00666B]"></span>
            </button>

            {/* Dropdown Thông báo */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Thông báo thư viện
                    </h4>
                    <span className="bg-[#e0eff0] text-[#00666B] text-[10px] font-bold px-1.5 py-0.2 rounded">
                      2 mới
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-[#00666B] hover:underline font-medium cursor-pointer"
                  >
                    Đã đọc
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      if (setActiveTab) setActiveTab('loans');
                    }}
                    className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Sách sắp đến hạn trả hôm nay!
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Cuốn "Lập trình Python" đến hạn trả. Bấm để gia hạn trực tuyến.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">10 phút trước</span>
                    </div>
                  </div>

                  <div className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer">
                    <div className="w-6 h-6 rounded-md bg-[#e0eff0] text-[#00666B] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Đơn mượn sẵn sàng tại quầy
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Thủ thư đã gom xong tài liệu. Nhận tại quầy tiếp nhận trước 17:30.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">1 giờ trước</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Nút Giỏ mượn sách Pick & Go nổi bật */}
          <button
            type="button"
            onClick={onOpenCart}
            className={`h-9 px-3.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer font-heading select-none ${
              cartCount > 0
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black shadow-md hover:shadow-lg hover:from-amber-300 hover:to-amber-200 ring-2 ring-amber-400/40 active:scale-95'
                : 'border border-white/20 bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Giỏ mượn sách"
            title="Mở giỏ mượn sách Pick & Go"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className={`w-4 h-4 ${cartCount > 0 ? 'text-slate-950 stroke-[2.4]' : 'text-white'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-amber-400 animate-pulse" />
              )}
            </div>
            <span className={`text-xs ${cartCount > 0 ? 'font-black tracking-tight' : 'font-bold hidden lg:inline'}`}>
              Giỏ mượn
            </span>
            <span
              className={`text-[11px] font-black h-5 min-w-[22px] px-1.5 flex items-center justify-center rounded-lg shadow-2xs font-mono ${
                cartCount > 0
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-white/20 text-white'
              }`}
            >
              {cartCount}
            </span>
          </button>

          {/* Đường phân cách */}
          <div className="w-px h-6 bg-white/20 hidden sm:block"></div>

          {/* 3. Hồ sơ Sinh viên */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all border cursor-pointer ${
                showProfile
                  ? 'bg-white/25 border-white text-white shadow-sm'
                  : 'border-white/15 hover:bg-white/10 text-white'
              }`}
              aria-label="Tài khoản sinh viên UTH"
            >
              <div className="w-7 h-7 bg-white text-[#00666B] rounded-lg flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-xs">
                VA
              </div>
              <div className="hidden xl:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  Nguyễn Văn A
                </span>
                <span className="text-[10px] text-teal-200 font-mono mt-0.5">
                  2151053001
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-teal-200 shrink-0" />
            </button>

            {/* Dropdown Profile - Nâng cấp cỡ chữ lớn, rõ nét và dễ đọc */}
            {showProfile && (
              <div className="absolute right-0 mt-2.5 w-84 sm:w-88 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in duration-150 overflow-hidden divide-y divide-slate-100">
                {/* Header người dùng */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00666B] to-[#00474b] text-white flex items-center justify-center font-heading font-extrabold text-base shadow-sm shrink-0 ring-2 ring-white">
                      VA
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          Nguyễn Văn A
                        </h4>
                        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded shrink-0">
                          2151053001
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                        Khoa Công nghệ Thông tin · UTH
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Thẻ sinh viên hợp lệ</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chỉ số nhanh thư viện */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/70 text-center">
                    <div className="bg-white rounded-xl py-2 px-1 sm:px-2 border border-slate-100 shadow-2xs">
                      <span className="block text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">Đang mượn</span>
                      <strong className="block text-sm font-bold text-slate-900 mt-0.5 tabular-nums">3 cuốn</strong>
                    </div>
                    <div className="bg-white rounded-xl py-2 px-1 sm:px-2 border border-slate-100 shadow-2xs">
                      <span className="block text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">Hạn gần nhất</span>
                      <strong className="block text-sm font-bold text-amber-700 mt-0.5 tabular-nums">15/11</strong>
                    </div>
                    <div className="bg-white rounded-xl py-2 px-1 sm:px-2 border border-slate-100 shadow-2xs">
                      <span className="block text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">Phí phạt</span>
                      <strong className="block text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">0đ</strong>
                    </div>
                  </div>
                </div>

                {/* Danh sách hành động với chữ to rõ, khoảng cách thoải mái */}
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false);
                      if (setActiveTab) setActiveTab('loans');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00666B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-sm font-bold text-slate-800 group-hover:text-[#00666B] leading-snug">
                        Sách đang mượn & Gia hạn
                      </strong>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Quản lý 3 tài liệu và gia hạn trực tuyến
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false);
                      if (setActiveTab) setActiveTab('loans');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-sm font-bold text-slate-800 group-hover:text-[#00666B] leading-snug">
                        Lịch sử mượn trả & Phí phạt
                      </strong>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Xem chi tiết các lượt mượn đã hoàn tất
                      </span>
                    </div>
                  </button>
                </div>

                {/* Đăng xuất */}
                <div className="p-2 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

export default NavbarPC;
