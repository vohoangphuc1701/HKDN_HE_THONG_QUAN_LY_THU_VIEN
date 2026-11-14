import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  BookOpen,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import BookCard from '../components/common/BookCard';
import FilterSidebarPC from '../components/responsive/FilterSidebarPC';
import defaultMockBooks from '../mockPCBooks.json';

/**
 * BookListPage - Trang danh mục & tra cứu giáo trình học thuật chuẩn Desktop (TV3)
 * Đáp ứng đầy đủ quy chuẩn Impeccable:
 * - Hệ thống lọc đa chiều (Khoa/Viện, Loại hình in/số, Cơ sở UTH, Tình trạng kho)
 * - Chế độ hiển thị Lưới 3D & Danh sách gọn
 * - Thanh phân trang Pagination chuyên nghiệp cho Desktop
 * - Breadcrumb, bộ từ khóa tìm nhanh và tóm tắt kết quả theo thời gian thực
 */
export default function BookListPage({
  books = defaultMockBooks,
  cartItems = [],
  onAddToCart,
  onViewDetail,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  selectedCategory: externalSelectedCategory,
  setSelectedCategory: externalSetSelectedCategory,
  onlyAvailable: externalOnlyAvailable,
  setOnlyAvailable: externalSetOnlyAvailable,
  selectedType: externalSelectedType,
  setSelectedType: externalSetSelectedType,
  selectedCampus: externalSelectedCampus,
  setSelectedCampus: externalSetSelectedCampus,
  onNavigateHome,
}) {
  // Quản lý state tìm kiếm & bộ lọc (hỗ trợ cả mode controlled từ ngoài và uncontrolled)
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalCategory, setInternalCategory] = useState('ALL');
  const [internalOnlyAvailable, setInternalOnlyAvailable] = useState(false);
  const [internalSelectedType, setInternalSelectedType] = useState('ALL');
  const [internalCampus, setInternalCampus] = useState('ALL');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;

  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalCategory;
  const setSelectedCategory = externalSetSelectedCategory || setInternalCategory;

  const onlyAvailable = externalOnlyAvailable !== undefined ? externalOnlyAvailable : internalOnlyAvailable;
  const setOnlyAvailable = externalSetOnlyAvailable || setInternalOnlyAvailable;

  const selectedType = externalSelectedType !== undefined ? externalSelectedType : internalSelectedType;
  const setSelectedType = externalSetSelectedType || setInternalSelectedType;

  const selectedCampus = externalSelectedCampus !== undefined ? externalSelectedCampus : internalCampus;
  const setSelectedCampus = externalSetSelectedCampus || setInternalCampus;

  // Chế độ xem & Sắp xếp
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'
  const [sortBy, setSortBy] = useState('relevant');

  // Phân trang Pagination (Desktop)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 8, 12, 16, 24 cuốn / trang

  // Danh mục thống kê từ kho sách
  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));
    return [
      { id: 'ALL', label: 'Tất cả chuyên ngành', count: books.length },
      ...rawCategories.map((cat) => ({
        id: cat,
        label: cat,
        count: books.filter((b) => b.category === cat).length,
      })),
    ];
  }, [books]);

  // Bộ lọc danh mục sách
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchCategory = selectedCategory === 'ALL' || book.category === selectedCategory;
        const matchType = selectedType === 'ALL' || book.type === selectedType;
        const matchAvailable = !onlyAvailable || (book.availableQuantity || 0) > 0;
        const matchCampus = selectedCampus === 'ALL' || book.campusCode === selectedCampus;

        const query = searchQuery.trim().toLowerCase();
        const matchQuery =
          !query ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.code && book.code.toLowerCase().includes(query)) ||
          (book.publisher && book.publisher.toLowerCase().includes(query));

        return matchCategory && matchType && matchAvailable && matchCampus && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.publishYear || 0) - (a.publishYear || 0);
        if (sortBy === 'available') return (b.availableQuantity || 0) - (a.availableQuantity || 0);
        if (sortBy === 'borrowCount') return (b.borrowCount || 0) - (a.borrowCount || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'vi');
        return a.id - b.id;
      });
  }, [books, selectedCategory, selectedType, onlyAvailable, selectedCampus, searchQuery, sortBy]);

  // Reset về trang 1 mỗi khi đổi điều kiện lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType, onlyAvailable, selectedCampus, sortBy, pageSize]);

  // Tính toán chỉ số phân trang
  const totalResults = filteredBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const currentBooks = useMemo(() => {
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, startIndex, endIndex]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    onlyAvailable ||
    selectedType !== 'ALL' ||
    selectedCampus !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setOnlyAvailable(false);
    setSelectedType('ALL');
    setSelectedCampus('ALL');
    setSortBy('relevant');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Tạo mảng số trang hiển thị thông minh (có dấu ...)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const quickKeywords = [
    'Lập trình Python',
    'Kinh tế vi mô',
    'Logistics & Vận tải',
    'Trí tuệ nhân tạo',
    'Cơ học ứng dụng',
    'Tiếng Anh chuyên ngành',
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* 1. HEADER KHO SÁCH HỌC THUẬT UTH */}
      <section
        className="bg-gradient-to-br from-[#002e32] via-[#00474b] to-[#002528] rounded-3xl p-5 sm:p-6 border border-teal-700/60 shadow-xl relative overflow-hidden text-white space-y-4"
        aria-label="Kho sách và tài liệu chính quy UTH"
      >
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <nav className="flex items-center gap-2 text-xs font-semibold text-teal-200/80" aria-label="Đường dẫn">
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <span className="text-teal-400/60">/</span>
              <span className="text-teal-100 font-bold">Kho giáo trình &amp; Tài liệu</span>
              {selectedCategory !== 'ALL' && (
                <>
                  <span className="text-teal-400/60">/</span>
                  <span className="text-amber-300 font-bold">{selectedCategory}</span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight drop-shadow-xs">
              Kho Sách &amp; Giáo Trình Chính Quy UTH
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed font-medium">
              Tra cứu nguồn tài liệu phục vụ giảng dạy và nghiên cứu, liên thông dữ liệu sách giữa 3 cơ sở đào tạo Thư viện Trường Đại học Giao thông Vận tải TP.HCM.
            </p>
          </div>

          {/* Chỉ số năng lực kho sách */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap relative z-10">
            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xs text-center min-w-[100px]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-200/80">Tài liệu</span>
              <span className="text-sm font-black text-white font-mono">{books.length} đầu sách</span>
            </div>
            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xs text-center min-w-[100px]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-200/80">Mạng lưới</span>
              <span className="text-sm font-black text-teal-100 font-mono">3 Cơ sở UTH</span>
            </div>
            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xs text-center min-w-[100px]">
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
          {quickKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setSearchQuery(kw)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-medium backdrop-blur-xs ${
                searchQuery === kw
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs font-black'
                  : 'bg-white/10 hover:bg-white/20 text-teal-100 border-white/15'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </section>

      {/* 2. BỐ CỤC 2 CỘT CHÍNH: BỘ LỌC BÊN TRÁI + NỘI DUNG KHO SÁCH */}
      <div className="flex items-start gap-8">
        {/* Cột trái: Bộ lọc Desktop cố định */}
        <FilterSidebarPC
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onlyAvailable={onlyAvailable}
          onToggleOnlyAvailable={(val) => setOnlyAvailable(val)}
          selectedType={selectedType}
          onSelectType={(type) => setSelectedType(type)}
          selectedCampus={selectedCampus}
          onSelectCampus={(camp) => setSelectedCampus(camp)}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalResults={totalResults}
        />

        {/* Cột phải: Thanh công cụ, Grid sách & Thanh phân trang */}
        <div className="flex-1 space-y-5 min-w-0">
          {/* Thanh các thẻ tag đang lọc */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-teal-50/70 rounded-2xl border border-teal-100 text-xs">
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
                    title="Xóa từ khóa tìm kiếm"
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
                    title="Xóa loại hình"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCampus !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-teal-200 text-slate-800 font-medium shadow-2xs">
                  <span>Cơ sở: <strong>{selectedCampus}</strong></span>
                  <button
                    type="button"
                    onClick={() => setSelectedCampus('ALL')}
                    className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                    title="Xóa cơ sở"
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

          {/* Thanh điều khiển catalog: Sắp xếp, Số lượng & View Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#e0eff0] text-[#00666B] flex items-center justify-center font-black text-xs font-mono">
                {totalResults}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Kết quả danh mục
                </span>
                <span className="text-[11px] text-slate-500">
                  {totalResults > 0 ? (
                    <>
                      Hiển thị <strong>{startIndex + 1} – {endIndex}</strong> trên tổng số <strong>{totalResults}</strong> giáo trình
                    </>
                  ) : (
                    'Không có giáo trình phù hợp'
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dropdown Sắp xếp */}
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
                  <option value="title">Tên sách (A – Z)</option>
                </select>
              </div>

              {/* Tùy chọn số lượng mỗi trang */}
              <div className="flex items-center gap-1.5 text-xs hidden md:flex">
                <span className="text-slate-500 font-medium">Hiện:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#00666B] cursor-pointer"
                >
                  <option value={8}>8 / trang</option>
                  <option value={12}>12 / trang</option>
                  <option value={16}>16 / trang</option>
                  <option value={24}>24 / trang</option>
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

          {/* 3. DANH SÁCH GIÁO TRÌNH HOẶC EMPTY STATE */}
          {currentBooks.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'
                  : 'space-y-3.5'
              }
            >
              {currentBooks.map((book) => {
                const isInCart = cartItems.some((item) => item.id === book.id);
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={onAddToCart}
                    onViewDetail={onViewDetail}
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
                  Không có giáo trình nào khớp với từ khóa "{searchQuery}" hoặc tiêu chí lọc hiện tại. Bạn có thể xóa bộ lọc hoặc tìm bằng từ khóa khác.
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

          {/* 4. THANH PHÂN TRANG CHUẨN DESKTOP (PAGINATION BAR) */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 px-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                Trang <strong className="text-slate-800 font-bold">{safeCurrentPage}</strong> / <strong>{totalPages}</strong> (Tổng {totalResults} tài liệu)
              </div>

              <div className="flex items-center gap-1" aria-label="Điều hướng phân trang">
                {/* Về trang đầu */}
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={safeCurrentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-50 hover:text-[#00666B] hover:border-teal-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Về trang đầu"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Trang trước */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-50 hover:text-[#00666B] hover:border-teal-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Các nút số trang */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-xs select-none">
                          ...
                        </span>
                      );
                    }
                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00666B] text-white shadow-xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-[#00666B] hover:border-teal-200'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Trang kế tiếp */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-50 hover:text-[#00666B] hover:border-teal-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Đến trang cuối */}
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-50 hover:text-[#00666B] hover:border-teal-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Đến trang cuối"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 5. TÓM TẮT DỮ LIỆU CHÂN TRANG */}
          {totalResults > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
              <span>
                Đang hiển thị toàn bộ <strong>{totalResults}</strong> giáo trình trên hệ thống Thư viện UTH.
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">Dữ liệu thời gian thực · Liên thông 3 cơ sở</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
