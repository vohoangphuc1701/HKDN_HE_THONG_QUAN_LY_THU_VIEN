import React from 'react';
import { Plus, Eye } from 'lucide-react';

/**
 * - Khung trưng bày bìa sách nền màu xanh nhạt (#cdede5), bìa sách nổi khối 3D với gáy và nhãn TỦ SÁCH ĐẠI HỌC
 * - Badge chuyên ngành in hoa
 * - Tên sách, tác giả, tình trạng số lượng kho khả dụng (chấm xanh ●)
 * - Nút "Thêm vào giỏ" bự hơn, nổi bật với màu thương hiệu #00666B
 * - Nút "Xem chi tiết" giúp sinh viên dễ dàng xem thông số, vị trí kệ sách và mô tả
 */
const BookCard = ({ book, onAddToCart, onViewDetail }) => {
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
        <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-[#00666B]/50 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden select-none">
            {/* 1. KHU TRƯNG BÀY BÌA SÁCH (Trưng bày bìa sách) */}
            <div
                onClick={handleDetail}
                className="bg-[#cdede5] h-56 w-full flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
                title="Nhấn để xem chi tiết"
            >
                {/* Cuốn sách vật lý 3D nổi bật */}
                <div
                    style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
                    className="w-36 h-48 rounded-r-md rounded-l-xs text-white p-3 flex flex-col justify-between shadow-2xl relative transition-transform duration-300 group-hover:scale-105"
                >
                    {/* Gáy sách bên trái (Gáy sách) */}
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-black/25 rounded-l-xs border-r border-white/10" />

                    {/* Tác giả trên bìa sách */}
                    <div className="text-center pl-2 pr-1">
                        <p className="text-[10px] font-medium text-white/90 truncate tracking-wide">
                            {book.coverTheme?.author || book.author}
                        </p>
                    </div>

                    {/* Tựa sách trên bìa viết hoa nhiều dòng */}
                    <div className="text-center px-1 my-auto">
                        <h4 className="text-[11px] font-black uppercase tracking-tight leading-snug whitespace-pre-line text-white drop-shadow-xs">
                            {book.coverTheme?.title || book.title}
                        </h4>
                    </div>

                    {/* Nhãn loại tài liệu dưới chân bìa */}
                    <div className="text-center pt-1 border-t border-white/20 pl-2 pr-1">
                        <span className="text-[8px] font-bold tracking-wider uppercase text-white/80">
                            {book.coverTheme?.series || 'TỦ SÁCH ĐẠI HỌC'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. THÔNG TIN SÁCH (Thông tin sách) */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                    {/* Badge Chuyên ngành */}
                    <div className="inline-block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00666B] bg-[#e0eff0] px-2 py-0.5 rounded">
                            {book.category}
                        </span>
                    </div>

                    {/* Tên sách */}
                    <h3
                        onClick={handleDetail}
                        className="font-bold text-[15px] text-slate-900 group-hover:text-[#00666B] line-clamp-1 transition-colors leading-snug cursor-pointer"
                        title={book.title}
                    >
                        {book.title}
                    </h3>

                    {/* Tác giả */}
                    <p className="text-xs text-slate-500 truncate">
                        {book.author}
                    </p>

                    {/* Tình trạng số lượng kho khả dụng */}
                    <div className="flex items-center gap-1.5 pt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-emerald-800">
                            {book.statusText || `Còn ${book.availableQuantity} cuốn sẵn sàng`}
                        </span>
                    </div>
                </div>

                {/* 3. CÁC NÚT THAO TÁC: NÚT THÊM VÀO GIỎ BỰ HƠN & NÚT XEM CHI TIẾT */}
                <div className="pt-2 space-y-2">
                    {/* Nút Thêm vào giỏ bự hơn, nổi bật chuẩn UX */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="w-full h-11 bg-[#00666B] hover:bg-[#004f53] active:bg-[#00383b] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
                        title="Thêm sách vào giỏ mượn"
                    >
                        <Plus className="w-5 h-5 shrink-0 stroke-[2.5]" />
                        <span>Thêm vào giỏ</span>
                    </button>

                    {/* Nút Xem chi tiết */}
                    <button
                        type="button"
                        onClick={handleDetail}
                        className="w-full h-9 bg-slate-50 hover:bg-[#e0eff0] text-slate-700 hover:text-[#00666B] border border-slate-200/90 hover:border-[#00666B]/30 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Xem thông tin chi tiết cuốn sách"
                    >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>Xem chi tiết</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookCard;