import React, { useState, useRef, useEffect } from 'react';
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

const NavbarPC = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifRef = useRef(null);
    const cartRef = useRef(null);
    const profileRef = useRef(null);
    const searchInputRef = useRef(null);

    // Mock cart items (theo đặc tả tối đa 5 cuốn mượn)
    const [cartItems, setCartItems] = useState([
        { id: 1, title: 'Kỹ thuật lập trình Web nâng cao', author: 'TS. Trần Văn Nam', code: 'CS-402', status: 'Sẵn sàng' },
        { id: 2, title: 'Hệ quản trị Cơ sở Dữ liệu', author: 'PGS. Lê Thị Mai', code: 'IT-301', status: 'Sẵn sàng' },
        { id: 3, title: 'Trí tuệ nhân tạo thực hành', author: 'TS. Nguyễn Hữu Dũng', code: 'AI-205', status: 'Chờ duyệt' },
    ]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setShowCart(false);
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

    const removeCartItem = (id, e) => {
        e.stopPropagation();
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Tìm kiếm:', searchQuery);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-[#00666B] text-white border-b border-[#005256] shadow-sm select-none">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">

                {/* CỤM TRÁI: Logo UTH & Main Navigation */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0 min-w-0">
                    {/* Logo Thư viện UTH */}
                    <div
                        onClick={() => setActiveTab('home')}
                        className="flex items-center gap-2 cursor-pointer group shrink-0"
                        title="Trường Đại học Giao thông Vận tải TP.HCM - Thư viện UTH"
                    >
                        <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-[#00666B] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                            <BookOpen className="w-4 h-4 text-[#00666B]" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <div className="flex items-center gap-1">
                                <span className="text-base sm:text-lg font-black text-white tracking-tight font-heading">
                                    Thư viện
                                </span>
                                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
                                    UTH
                                </span>
                            </div>
                            <span className="text-[9px] font-medium text-teal-200 tracking-tight hidden sm:inline mt-0.5">
                                Cổng sinh viên
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links phẳng, sắc nét, không vỡ layout */}
                    <nav className="hidden md:flex items-center space-x-1 shrink-0">
                        {/* 1. Trang chủ */}
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'home'
                                    ? 'bg-white/20 text-white shadow-xs'
                                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Trang chủ</span>
                        </button>

                        {/* 2. Kho sách */}
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'catalog'
                                    ? 'bg-white/20 text-white shadow-xs'
                                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Kho sách & Giáo trình</span>
                            <span className="lg:hidden">Kho sách</span>
                        </button>

                        {/* 3. Đang mượn */}
                        <button
                            onClick={() => setActiveTab('loans')}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'loans'
                                    ? 'bg-white/20 text-white shadow-xs'
                                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <BookMarked className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Sách đang mượn</span>
                            <span className="lg:hidden">Đang mượn</span>
                            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                3
                            </span>
                        </button>
                    </nav>
                </div>

                {/* CỤM GIỮA: Thanh tìm kiếm nhanh tinh gọn (không tràn layout) */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex-1 min-w-[120px] max-w-xs lg:max-w-sm xl:max-w-md relative"
                >
                    <div className="flex items-center w-full bg-white/15 hover:bg-white/20 focus-within:bg-white focus-within:text-slate-800 rounded-md border border-white/20 focus-within:border-white focus-within:shadow-sm px-2.5 py-1.5 transition-all text-white">
                        <Search className="w-3.5 h-3.5 text-teal-100 focus-within:text-slate-500 shrink-0 mr-2" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm sách, giáo trình..."
                            className="w-full bg-transparent text-xs placeholder:text-teal-100/70 focus:placeholder:text-slate-400 focus:text-slate-800 focus:outline-none"
                        />
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="p-0.5 text-teal-200 hover:text-white focus-within:text-slate-400 focus-within:hover:text-slate-600 rounded cursor-pointer"
                                title="Xóa"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        ) : (
                            <span className="hidden xl:inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-medium text-teal-200/90 focus-within:text-slate-400 bg-white/10 focus-within:bg-slate-100 rounded pointer-events-none shrink-0">
                                Ctrl K
                            </span>
                        )}
                    </div>
                </form>

                {/* CỤM PHẢI: Thông báo, Giỏ mượn & Hồ sơ Sinh viên */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                    {/* 1. Nút Thông báo (Bell) */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowCart(false);
                                setShowProfile(false);
                            }}
                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors relative border cursor-pointer ${showNotifications
                                    ? 'bg-white/25 border-white text-white'
                                    : 'border-white/15 text-teal-100 hover:text-white hover:bg-white/10'
                                }`}
                            aria-label="Thông báo thư viện"
                            title="Thông báo thư viện"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#00666B]"></span>
                        </button>

                        {/* Dropdown Thông báo */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                                <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-heading font-semibold text-xs text-slate-900 uppercase tracking-wider">
                                            Thông báo
                                        </h4>
                                        <span className="bg-[#e0eff0] text-[#00666B] text-[10px] font-bold px-1.5 py-0.2 rounded">
                                            2 mới
                                        </span>
                                    </div>
                                    <button className="text-[11px] text-[#00666B] hover:underline font-medium cursor-pointer">
                                        Đã đọc tất cả
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                    <div className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer">
                                        <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 truncate">
                                                Sách sắp đến hạn trả!
                                            </p>
                                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                                Cuốn "Trí tuệ nhân tạo thực hành" còn <span className="font-bold text-amber-700">2 ngày</span> (05/11/2026).
                                            </p>
                                            <span className="text-[10px] text-slate-400 mt-1 inline-block">10 phút trước</span>
                                        </div>
                                    </div>

                                    <div className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer">
                                        <div className="w-6 h-6 rounded bg-[#e0eff0] text-[#00666B] flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 truncate">
                                                Đơn mượn đã sẵn sàng
                                            </p>
                                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                                Sách "Hệ quản trị CSDL" đã gom xong. Nhận tại quầy trước 17:00 hôm nay.
                                            </p>
                                            <span className="text-[10px] text-slate-400 mt-1 inline-block">2 giờ trước</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Nút Giỏ sách thanh gọn */}
                    <div className="relative" ref={cartRef}>
                        <button
                            onClick={() => {
                                setShowCart(!showCart);
                                setShowNotifications(false);
                                setShowProfile(false);
                            }}
                            className={`h-8 px-2 sm:px-2.5 rounded-md flex items-center gap-1.5 transition-all border whitespace-nowrap cursor-pointer ${showCart
                                    ? 'bg-white/25 border-white text-white'
                                    : 'border-white/15 bg-white/10 hover:bg-white/15 text-white'
                                }`}
                            aria-label="Giỏ mượn sách"
                            title="Giỏ mượn sách"
                        >
                            <ShoppingBag className="w-3.5 h-3.5 text-white shrink-0" />
                            <span className="hidden xl:inline text-xs font-semibold">Giỏ mượn</span>
                            <span className="bg-white text-[#00666B] text-[10px] font-extrabold h-4 min-w-[16px] px-1 flex items-center justify-center rounded shadow-2xs">
                                {cartItems.length}
                            </span>
                        </button>

                        {/* Dropdown Giỏ mượn */}
                        {showCart && (
                            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in duration-100">
                                <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                                    <h4 className="font-heading font-semibold text-xs text-slate-900 uppercase tracking-wider">
                                        Giỏ tài liệu ({cartItems.length}/5)
                                    </h4>
                                    <span className="text-[11px] text-slate-500 font-medium">Tối đa 5 cuốn</span>
                                </div>

                                {cartItems.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2.5">
                                                    <div className="w-6 h-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-400 shrink-0">
                                                        <BookOpen className="w-3 h-3 text-[#00666B]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-slate-800 truncate" title={item.title}>
                                                            {item.title}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] text-slate-500 truncate">{item.author}</span>
                                                            <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-mono shrink-0">{item.code}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => removeCartItem(item.id, e)}
                                                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors shrink-0 cursor-pointer"
                                                        title="Bỏ khỏi giỏ"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                                            <button className="w-full bg-[#00666B] hover:bg-[#004f53] active:bg-[#00383b] text-white font-semibold text-xs py-1.5 px-3 rounded-md shadow-xs transition-colors text-center cursor-pointer">
                                                Đặt lịch hẹn nhận sách ({cartItems.length})
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-5 text-center text-slate-500">
                                        <BookOpen className="w-6 h-6 mx-auto text-slate-300 mb-1.5" />
                                        <p className="text-xs">Chưa có tài liệu nào trong giỏ mượn</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Đường phân cách */}
                    <div className="w-px h-5 bg-white/20 hidden sm:block"></div>

                    {/* 3. Hồ sơ Sinh viên (Capsule UTH) */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setShowProfile(!showProfile);
                                setShowNotifications(false);
                                setShowCart(false);
                            }}
                            className={`flex items-center gap-1.5 p-1 sm:pr-2 rounded-md transition-all border whitespace-nowrap cursor-pointer ${showProfile
                                    ? 'bg-white/25 border-white text-white'
                                    : 'border-white/15 hover:bg-white/10 text-white'
                                }`}
                            aria-label="Tài khoản sinh viên UTH"
                        >
                            <div className="w-6 h-6 bg-white text-[#00666B] rounded flex items-center justify-center font-heading font-extrabold text-[11px] shrink-0 shadow-xs">
                                VA
                            </div>
                            <div className="hidden lg:flex flex-col text-left leading-none">
                                <span className="text-xs font-bold text-white truncate max-w-[100px] xl:max-w-[130px]">
                                    Nguyễn Văn A
                                </span>
                                <span className="text-[9px] text-teal-200 font-mono mt-0.5 hidden xl:inline">
                                    2151053001
                                </span>
                            </div>
                            <ChevronDown className="w-3 h-3 text-teal-200 shrink-0" />
                        </button>

                        {/* Dropdown Profile */}
                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-2rem)] bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                                <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50">
                                    <p className="text-xs font-bold text-slate-900 truncate">Nguyễn Văn A</p>
                                    <p className="text-[10px] text-slate-500 font-mono truncate">MSSV: 2151053001 • UTH</p>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-[#e0eff0] text-[#00666B] rounded">
                                            STUDENT • Thẻ hợp lệ
                                        </span>
                                    </div>
                                </div>

                                <div className="py-1 text-xs text-slate-700">
                                    <a href="#loans" className="flex items-center gap-2 px-3.5 py-1.5 hover:bg-slate-50 transition-colors">
                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Lịch sử mượn & trả</span>
                                    </a>
                                    <a href="#fines" className="flex items-center gap-2 px-3.5 py-1.5 hover:bg-slate-50 transition-colors">
                                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Phiếu phạt & Nợ sách (0đ)</span>
                                    </a>
                                </div>

                                <div className="pt-1 mt-1 border-t border-slate-100">
                                    <button className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                                        <span>Đăng xuất</span>
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