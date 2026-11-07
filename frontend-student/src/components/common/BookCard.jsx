import React from 'react';
import { Plus, Eye, Check } from 'lucide-react';

/**
 * Component BookCard - Thiết kế nổi bật đẳng cấp:
 * - Shadow nổi khối đa tầng (ambient teal shadow) giúp card tách hẳn khỏi nền trang.
 * - Khung trưng bày bìa sách 3D có vầng sáng tâm điểm (spotlight) và bóng đổ chân đế (pedestal shadow).
 * - Bìa sách 3D vật lý với gáy sách sắc nét, ánh sáng phản chiếu bóng bẩy.
 * - Huy hiệu chuyên ngành & nhãn nổi bật dạng pill nổi trên góc bìa.
 * - Thông số đánh giá, tựa sách đậm nét (text-base font-black), tác giả và huy hiệu kho khả dụng.
 * - Cụm nút bấm nổi khối với đổ bóng xúc giác: "Thêm vào giỏ" và "Xem chi tiết".
 */
const BookCard = ({ book, onAddToCart, onViewDetail, isInCart = false, badge }) => {
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
                    {/* Dòng đánh giá sao & lượt mượn */}
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
                        className={`w-full h-11 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                            isInCart
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
