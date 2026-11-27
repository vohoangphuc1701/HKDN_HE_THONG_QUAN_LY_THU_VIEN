import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import borrowApi from '../../services/borrowApi';
import { getStoredStudentProfile, clearAuthSession, mapLoanFromApi } from '../../utils/studentSession';
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
  History,
  LogOut
} from 'lucide-react';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'default-due',
    type: 'warning',
    title: 'Sách sắp đến hạn trả hôm nay!',
    message: 'Cuốn "Lập trình Python" đến hạn trả. Bấm để gia hạn trực tuyến.',
    time: '10 phút trước',
    tab: 'loans',
  },
  {
    id: 'default-ready',
    type: 'info',
    title: 'Đơn mượn sẵn sàng tại quầy',
    message: 'Thủ thư đã gom xong tài liệu. Nhận tại quầy tiếp nhận trước 17:30.',
    time: '1 giờ trước',
    tab: 'loans',
  },
];

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
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [loanSummary, setLoanSummary] = useState({
    activeCount: 3,
    nearestDue: '15/11',
    totalFine: 0,
    notifications: DEFAULT_NOTIFICATIONS,
  });
  const navigate = useNavigate();
  const studentProfile = getStoredStudentProfile();

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Nạp trạng thái sách đang mượn & thông báo động khi sinh viên đã đăng nhập
  useEffect(() => {
    const token =
      typeof window !== 'undefined' &&
      (localStorage.getItem('token') || localStorage.getItem('accessToken'));
    if (!token) return;

    let cancelled = false;
    borrowApi
      .getMyLoans()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;
        const mapped = list.map(mapLoanFromApi).filter(Boolean);
        const activeLoans = mapped.filter((l) => l.status !== 'RETURNED');
        const totalFine = mapped.reduce((sum, l) => sum + (Number(l.fineAmount) || 0), 0);

        const datedLoans = activeLoans
          .map((l) => ({ ...l, _dueMs: Date.parse(l.dueDate) }))
          .filter((l) => Number.isFinite(l._dueMs))
          .sort((a, b) => a._dueMs - b._dueMs);

        const nearestDue = datedLoans.length
          ? new Date(datedLoans[0]._dueMs).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
            })
          : 'Không có';

        const dynamicAlerts = activeLoans
          .filter((l) => l.status === 'OVERDUE' || l.status === 'WARNING')
          .slice(0, 4)
          .map((l) => ({
            id: `loan-${l.id}`,
            type: 'warning',
            title:
              l.status === 'OVERDUE'
                ? `Quá hạn trả ${Math.abs(l.daysRemaining || 0)} ngày`
                : 'Sách sắp đến hạn trả!',
            message: `Cuốn "${l.bookTitle}" — bấm để xem chi tiết hoặc gia hạn trực tuyến.`,
            time: `Hạn: ${l.dueDate || 'Đang cập nhật'}`,
            tab: 'loans',
          }));

        setLoanSummary({
          activeCount: activeLoans.length,
          nearestDue,
          totalFine,
          notifications: dynamicAlerts,
        });
      })
      .catch(() => {
        // Giữ fallback khi kết nối Backend tạm thời gián đoạn
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  // Listen for Ctrl+K shortcut to focus search input and Escape to close dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfile(false);
      }
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
      <div className="max-w-[1560px] mx-auto px-3 sm:px-4 md:px-5 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-2 sm:gap-3 md:gap-3 lg:gap-4">

        {/* CỤM TRÁI: Logo UTH & Main Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0 min-w-0">
          {/* Logo Thư viện UTH */}
          <div
            onClick={() => setActiveTab && setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
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
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
                  UTH
                </span>
              </div>
              <span className="text-[10px] font-medium text-teal-200 tracking-tight hidden xl:inline mt-0.5">
                Cổng sinh viên trực tuyến
              </span>
            </div>
          </div>

          {/* Navigation Links phẳng, sắc nét */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 shrink-0" aria-label="Điều hướng chính">
            {/* 1. Trang chủ */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('home')}
              title="Trang chủ"
              className={`px-2.5 py-1.5 lg:px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Trang chủ</span>
            </button>

            {/* 2. Kho sách */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('catalog')}
              title="Kho sách & Giáo trình"
              className={`px-2.5 py-1.5 lg:px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Kho sách &amp; Giáo trình</span>
              <span className="hidden lg:inline xl:hidden">Kho sách</span>
            </button>

            {/* 3. Đang mượn */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('loans')}
              title={`Sách đang mượn (${loanSummary.activeCount} cuốn)`}
              className={`px-2.5 py-1.5 lg:px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'loans'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Sách đang mượn</span>
              <span className="hidden lg:inline xl:hidden">Đang mượn</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded tabular-nums">
                {loanSummary.activeCount}
              </span>
            </button>

            {/* 4. Lịch sử mượn trả */}
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('history')}
              title="Lịch sử mượn trả"
              className={`px-2.5 py-1.5 lg:px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Lịch sử mượn trả</span>
              <span className="hidden lg:inline xl:hidden">Lịch sử</span>
            </button>
          </nav>
        </div>

        {/* CỤM GIỮA: Thanh tìm kiếm nhanh */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-[110px] max-w-xs md:max-w-sm lg:max-w-md relative"
        >
          <div className="group/search flex items-center w-full bg-white/15 hover:bg-white/20 focus-within:bg-white focus-within:text-slate-800 rounded-lg border border-white/20 focus-within:border-white focus-within:shadow-sm px-2.5 sm:px-3 py-1.5 transition-all text-white">
            <Search className="w-3.5 h-3.5 text-teal-100 group-focus-within/search:text-slate-500 shrink-0 mr-1.5 sm:mr-2 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Tìm sách, tài liệu..."
              className="w-full bg-transparent text-xs placeholder:text-teal-100/70 focus:placeholder:text-slate-400 focus:text-slate-800 focus:outline-none truncate"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="p-0.5 text-teal-200 hover:text-white group-focus-within/search:text-slate-400 group-focus-within/search:hover:text-slate-600 rounded cursor-pointer transition-colors"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-teal-200/90 bg-white/10 group-focus-within/search:bg-slate-100 group-focus-within/search:text-slate-500 rounded pointer-events-none shrink-0 transition-colors">
                Ctrl K
              </span>
            )}
          </div>
        </form>

        {/* CỤM PHẢI: Thông báo, Giỏ mượn & Hồ sơ Sinh viên */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">

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
              aria-expanded={showNotifications}
              aria-haspopup="true"
              aria-label="Thông báo thư viện"
              title="Thông báo thư viện"
            >
              <Bell className="w-4 h-4" />
              {!notificationsRead && loanSummary.notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#00666B]"></span>
              )}
            </button>

            {/* Dropdown Thông báo */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Thông báo thư viện
                    </h4>
                    <span className="bg-[#e0eff0] text-[#00666B] text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {notificationsRead ? '0' : loanSummary.notifications.length} mới
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsRead(true);
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-[#00666B] hover:underline font-medium cursor-pointer"
                  >
                    Đã đọc
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {loanSummary.notifications.length > 0 ? (
                    loanSummary.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotificationsRead(true);
                          setShowNotifications(false);
                          if (setActiveTab) setActiveTab(notif.tab || 'loans');
                        }}
                        className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-[#e0eff0] text-[#00666B]'
                          }`}
                        >
                          {notif.type === 'warning' ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Không có tài liệu sắp đến hạn trả.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Nút Giỏ mượn sách Pick & Go nổi bật */}
          <button
            type="button"
            onClick={onOpenCart}
            className={`h-9 px-2.5 sm:px-3 lg:px-3.5 rounded-xl flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 transition-all cursor-pointer font-heading select-none ${
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
            <span className={`text-xs hidden xl:inline ${cartCount > 0 ? 'font-black tracking-tight' : 'font-bold'}`}>
              Giỏ mượn
            </span>
            <span
              className={`text-[11px] font-black h-5 min-w-[20px] sm:min-w-[22px] px-1.5 flex items-center justify-center rounded-lg shadow-2xs font-mono ${
                cartCount > 0
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-white/20 text-white'
              }`}
            >
              {cartCount}
            </span>
          </button>

          {/* Đường phân cách */}
          <div className="w-px h-6 bg-white/20 hidden md:block"></div>

          {/* 3. Hồ sơ Sinh viên */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 p-1.5 sm:px-2.5 lg:px-3 sm:py-2 rounded-xl transition-all border cursor-pointer select-none ${
                showProfile
                  ? 'bg-white/25 border-white text-white shadow-sm'
                  : 'border-white/15 hover:bg-white/10 text-white'
              }`}
              aria-expanded={showProfile}
              aria-haspopup="true"
              aria-label="Tài khoản sinh viên UTH"
            >
              <div className="w-7 h-7 bg-white text-[#00666B] rounded-lg flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-xs">
                {studentProfile.initials}
              </div>
              <div className="hidden xl:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {studentProfile.fullName}
                </span>
                <span className="text-[10px] text-teal-200 font-mono mt-0.5">
                  {studentProfile.studentId}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-teal-200 shrink-0 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Profile - Nâng cấp cỡ chữ lớn, rõ nét và dễ đọc */}
            {showProfile && (
              <div className="absolute right-0 mt-2.5 w-84 sm:w-88 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 z-50 animate-in fade-in duration-150 overflow-hidden divide-y divide-slate-100">
                {/* Header người dùng */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00666B] to-[#00474b] text-white flex items-center justify-center font-heading font-extrabold text-base shadow-sm shrink-0 ring-2 ring-white">
                      {studentProfile.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {studentProfile.fullName}
                        </h4>
                        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded shrink-0">
                          {studentProfile.studentId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                        {studentProfile.major}
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
                      <strong className="block text-sm font-bold text-slate-900 mt-0.5 tabular-nums">{loanSummary.activeCount} cuốn</strong>
                    </div>
                    <div className="bg-white rounded-xl py-2 px-1 sm:px-2 border border-slate-100 shadow-2xs">
                      <span className="block text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">Hạn gần nhất</span>
                      <strong className="block text-sm font-bold text-amber-700 mt-0.5 tabular-nums">{loanSummary.nearestDue}</strong>
                    </div>
                    <div className="bg-white rounded-xl py-2 px-1 sm:px-2 border border-slate-100 shadow-2xs">
                      <span className="block text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">Phí phạt</span>
                      <strong
                        className={`block text-sm font-bold mt-0.5 tabular-nums ${
                          loanSummary.totalFine > 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {loanSummary.totalFine.toLocaleString('vi-VN')}đ
                      </strong>
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
                        Quản lý {loanSummary.activeCount} tài liệu và gia hạn trực tuyến
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false);
                      if (setActiveTab) setActiveTab('history');
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
                      clearAuthSession();
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
