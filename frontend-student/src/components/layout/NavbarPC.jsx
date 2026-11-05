import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifRef = useRef(null);
    const cartRef = useRef(null);
    const profileRef = useRef(null);
    const searchInputRef = useRef(null);

    // Dữ liệu giỏ sách mẫu hiển thị badge 2 cuốn theo
    const [cartItems, setCartItems] = useState([
        { id: 1, title: 'Lập trình Python cơ bản', code: 'CNTT-PY-001' },
        { id: 2, title: 'Kinh tế học vi mô', code: 'KT-VM-002' }
    ]);

    // Đóng dropdown khi click bên ngoài
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

    // Phím tắt Ctrl + K để focus ô tìm kiếm
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

    return (
        <header className="sticky top-0 z-40 bg-[#00666B] text-white border-b border-[#005256] shadow-sm select-none">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">

                {/* CỤM TRÁI: Logo UTH & Navigation Links */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0 min-w-0">
                    {/* Logo Thư viện UTH */}
                    <Link
                        to="/"
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
                    </Link>

                    {/* Navigation Links phẳng, sắc nét */}
                    <nav className="hidden md:flex items-center space-x-1 shrink-0">
                        {/* 1. Trang chủ */}
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${isActive
                                    ? 'bg-white/20 text-white shadow-xs'
                                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                                }`
                            }
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Trang chủ</span>
                        </NavLink>

                        {/* 2. Khám phá sách */}
                        <NavLink
                            to="/books"
                            className={({ isActive }) =>
                                `px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${isActive
                                    ? 'bg-white/20 text-white shadow-xs'
                                    : 'text