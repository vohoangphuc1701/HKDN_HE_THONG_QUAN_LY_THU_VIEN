import React from 'react';
import { Plus, Eye, Check, MapPin, BookOpen, Star, Calendar, Layers, CheckCircle2 } from 'lucide-react';

/**
 * Component BookCard - Thiết kế chuẩn Impeccable cho Desktop (TV3):
 * - Hỗ trợ cả 2 chế độ hiển thị: 'grid' (Lưới 3D nổi bật) và 'compact' (Danh sách ngang giàu thông tin).
 * - Bìa sách 3D vật lý với gáy dập nổi và vầng sáng spotlight.
 * - Hiển thị vị trí kệ sách cụ thể (Khu vực, Kệ A1-A2) hỗ trợ tìm kiếm thực tế.
 * - Trạng thái kho khả dụng với hiệu ứng chấm xanh ngọc bích.
 * - Nút bấm xúc giác với trạng thái "Đã trong giỏ" và "Xem chi tiết".
 */
const BookCard = ({
    book,
    onAddToCart,
    onViewDetail,
    isInCart = false,
    viewMode = 'grid',
    badge
}) => {
    if (!book) return null;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(book);
        }
    };

    const handleDetail = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onViewDetail) {
            onViewDetail(book);
        }
    };

    /* ==================== 1. CHẾ ĐỘ XEM DANH SÁCH GỌN (COMPACT LIST VIEW) ==================== */
    if (viewMode === 'compact') {
        return (
            <div
                onClick={handleDetail}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#00666B]/60 shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none cursor-pointer relative"
            >
                {/* Khối bên trái: Bìa sách mini + Thông tin chi tiết */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Bìa sách 3D thu nhỏ */}
                    <div
                        style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
                        className="w-16 h-22 rounded-r-md rounded-l-xs text-white p-1.5 flex flex-col justify-between shadow-md relative shrink-0 group-hover:scale-105 transition-transform overflow-hidden"
                    >
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-black/25 rounded-l-xs border-r border-white/20" />
                        <span className="text-[7px] font-bold text-center block pl-1 tracking-tight">UTH</span>
                        <h5 className="text-[8px] font-black uppercase text-center line-clamp-2 px-0.5 leading-tight text-white drop-shadow-xs">
                            {book.title}
                        </h5>
                        <span className="text-[6px] font-mono text-center opacity-80 block">{book.publishYear || '2023'}</span>
                    </div>

                    {/* Cột thông tin chi tiết */}
                    <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00666B] bg-[#e0eff0] px-2.5 py-0.5 rounded-full border border-teal-200/60">
                                {book.category}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">
                                {book.code}
                            </span>
                            {book.isNew && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full border border-amber-200">
                                    Ấn bản mới
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-base text-slate-900 group-hover:text-[#00666B] transition-colors truncate">
                            {book.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span>Tác giả: <strong className="text-slate-800 font-semibold">{book.author}</strong></span>
                            <span className="text-slate-300">•</span>
                            <span>Năm: <strong className="text-slate-700">{book.publishYear}</strong></span>
                            {book.publisher && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span className="truncate max-w-[200px] text-slate-500">{book.publisher}</span>
                                </>
                            )}
                        </div>

                        {/* Vị trí kệ & Tình trạng kho */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{book.statusText || `Còn ${book.availableQuantity} cuốn sẵn sàng`}</span>
                            </div>

                            {book.location && (
                                <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-[#00666B] shrink-0" />
                                    <span>{book.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Khối bên phải: Đánh giá & Các nút thao tác */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{book.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal text-[11px]">({book.borrowCount || 100})</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={isInCart}
                            className={`h-9 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${isInCart
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                    : 'bg-[#00666B] hover:bg-[#005458] text-white shadow-xs'
                                }`}
                        >
                            {isInCart ? (
                                <>
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Đã chọn</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Thêm vào giỏ</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDetail}
                            className="h-9 px-3 bg-slate-50 hover:bg-teal-50 hover:text-[#00666B] text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                            title="Xem chi tiết tài liệu"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chi tiết</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ==================== 2. CHẾ ĐỘ XEM LƯỚI 3D (GRID VIEW - MẶC ĐỊNH) ==================== */
    return (
        <div className="group bg-white rounded-3xl border-2 border-slate-100 hover:border-teal-400/80 shadow-[0_8px_24px_-4px_rgba(0,56,59,0.12),0_4px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(0,56,59,0.22),0_8px_20px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden select-none relative">
            {/* 1. KHU TRƯNG BÀY BÌA SÁCH 3D CÓ SPOTLIGHT VÀ BÓNG CHÂN ĐẾ */}
            <div
                onClick={handleDetail}
                className="bg-gradient-to-b from-[#bfe7de] via-[#ccede5] to-[#dcf3ed] h-60 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer"
                title="Nhấn để xem chi tiết tài liệu"
            >
                {/* Vầng sáng tâm điểm (Spotlight) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.75)_0%,transparent_65%)] pointer-events-none" />

                {/* Huy hiệu chuyên ngành góc trái */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00666B] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-teal-200/80">
                        {book.category}
                    </span>
                </div>

                {/* Khối sách vật lý 3D nổi bật */}
                <div
                    style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
                    className="w-36 h-48 rounded-r-lg rounded-l-xs text-white p-3.5 flex flex-col justify-between shadow-[0_16px_32px_-4px_rgba(0,0,0,0.42)] relative transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 z-1"
                >
                    {/* Ánh sáng phản chiếu mặt bìa bóng */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-r-lg pointer-events-none" />

                    {/* Gáy sách bên trái có chiều sâu */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-black/30 rounded-l-xs border-r border-white/20" />

                    {/* Tác giả trên bìa */}
                    <div className="text-center pl-2 pr-1">
                        <p className="text-[10px] font-medium text-white/95 truncate tracking-wide drop-shadow-xs">
                            {book.coverTheme?.author || book.author}
                        </p>
                    </div>

                    {/* Tựa sách trên bìa */}
                    <div className="text-center px-1 my-auto">
                        <h4 className="text-[11px] font-black uppercase tracking-tight leading-snug whitespace-pre-line text-white drop-shadow-md">
                            {book.coverTheme?.title || book.title}
                        </h4>
                    </div>

                    {/* Nhãn loại tài liệu dưới chân bìa */}
                    <div className="text-center pt-1.5 border-t border-white/25 pl-2 pr-1">
                        <span className="text-[8px] font-bold tracking-wider uppercase text-white/85">
                            {book.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC'}
                        </span>
                    </div>
                </div>

                {/* Bóng tiếp đất chân đế của cuốn sách (Pedestal shadow) */}
                <div className="w-32 h-3 bg-teal-950/25 rounded-[100%] blur-[3px] mt-1 group-hover:scale-110 group-hover:opacity-60 transition-all duration-300" />
            </div>

            {/* 2. THÔNG TIN SÁCH */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
                <div className="space-y-1.5">
                    {/* Dòng đánh giá sao & mã sách */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                            ★ {book.rating || 4.9}
                            <span className="text-slate-400 font-normal">({book.borrowCount || 120})</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 font-medium">
                            {book.code}
                        </span>
                    </div>

                    {/* Tên sách nổi bật */}
                    <h3
                        onClick={handleDetail}
                        className="font-black text-base text-slate-900 group-hover:text-[#00666B] line-clamp-1 transition-colors leading-snug cursor-pointer pt-0.5"
                        title={book.title}
                    >
                        {book.title}
                    </h3>

                    {/* Tác giả & Năm */}
                    <p className="text-xs text-slate-500 truncate font-medium">
                        Tác giả: <span className="text-slate-700 font-semibold">{book.author}</span>
                    </p>

                    {/* Vị trí kệ sách */}
                    {book.location && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#00666B] shrink-0" />
                            <span className="truncate">{book.location}</span>
                        </p>
                    )}

                    {/* Tình trạng khả dụng với huy hiệu xanh ngọc nổi bật */}
                    <div className="pt-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>{book.statusText || `Còn ${book.availableQuantity} cuốn sẵn sàng`}</span>
                        </div>
                    </div>
                </div>

                {/* 3. CÁC NÚT THAO TÁC NỔI BẬT */}
                <div className="pt-2 space-y-2 border-t border-slate-100">
                    {/* Nút Thêm vào giỏ */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={isInCart}
                        className={`w-full h-11 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${isInCart
                                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-bold cursor-default shadow-xs'
                                : 'bg-[#00666B] hover:bg-[#005458] text-white shadow-md hover:shadow-lg active:bg-[#00383b]'
                            }`}
                        title={isInCart ? 'Sách đã có trong giỏ mượn' : 'Thêm sách vào giỏ mượn'}
                    >
                        {isInCart ? (
                            <>
                                <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                                <span>Đã có trong giỏ mượn</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                                <span>Thêm vào giỏ mượn</span>
                            </>
                        )}
                    </button>

                    {/* Nút Xem chi tiết */}
                    <button
                        type="button"
                        onClick={handleDetail}
                        className="w-full h-9 bg-slate-50 hover:bg-teal-50 hover:text-[#00666B] hover:border-teal-300 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Xem thông tin chi tiết cuốn sách"
                    >
                        <Eye className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-[#00666B]" />
                        <span>Xem chi tiết tài liệu</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
