import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Filter,
  GraduationCap,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import BookCard from '../components/common/BookCard';
import BookCardSkeleton from '../components/common/BookCardSkeleton';
import SearchBar from '../components/common/SearchBar';
import FilterModalMobile from '../components/responsive/FilterModalMobile';
import { bookApi } from '../services/bookApi';
import { expandQueryWithAI, matchBookSmart } from '../services/aiSearchService';
import mockPCBooks from '../mockPCBooks.json';

/**
 * Danh sách từ khóa tìm nhanh đặc trưng UTH
 */
const QUICK_KEYWORDS = [
  'Lập trình Python',
  'Kinh tế vi mô',
  'Logistics & Vận tải',
  'Trí tuệ nhân tạo',
  'Tiếng Anh chuyên ngành',
];

/**
 * BookListPage - Trang Tra Cứu & Danh Sách Sách Thư Viện UTH (Mobile & Tablet < 1024px - TV2)
 *
 * Tính năng chính:
 * 1. Banner học thuật thu nhỏ đồng bộ UTH Deep Teal (#00666b) kèm các chỉ số thư viện.
 * 2. Tích hợp SearchBar với nút mở Bộ lọc nâng cao (badge đếm số bộ lọc đang chọn).
 * 3. Dải từ khóa tìm nhanh một chạm (Quick keywords).
 * 4. Thanh trượt chip chuyên ngành UTH cuộn ngang mượt mà.
 * 5. Dải tag các bộ lọc đang kích hoạt kèm nút bấm xóa nhanh từng tiêu chí và nút xóa tất cả.
 * 6. Thanh công cụ chuyển đổi hiển thị: Lưới 3D (Grid) và Danh sách gọn (Compact) + Sắp xếp nhanh.
 * 7. Lưới sách hiển thị BookCard TV3 PC co giãn chuẩn từ 375px đến 1023px.
 * 8. Trạng thái rỗng (Empty state) thân thiện khi không tìm thấy kết quả.
 * 9. Tích hợp Bottom Sheet FilterModalMobile hoàn chỉnh.
 */
export default function BookListPage({
  books: propBooks,
  searchQuery: propSearchQuery,
  onSearchChange: propOnSearchChange,
  selectedCategory: propSelectedCategory,
  onSelectCategory: propOnSelectCategory,
  onlyAvailable: propOnlyAvailable,
  onToggleOnlyAvailable: propOnToggleOnlyAvailable,
  selectedType: propSelectedType,
  onSelectType: propOnSelectType,
  sortBy: propSortBy,
  onChangeSortBy: propOnChangeSortBy,
  onAddToCart,
  onViewDetail,
  cartItems = [],
  onNavigateTab,
}) {
  // State nội bộ làm fallback khi không truyền prop từ ngoài
  const [books, setBooks] = useState(propBooks || mockPCBooks);
  const [isLoading, setIsLoading] = useState(!propBooks);

  // Kết nối API động bookApi.getBooks() + Fallback mượt mà
  useEffect(() => {
    if (propBooks) return;
    let cancelled = false;
    bookApi
      .getBooks({ size: 50 })
      .then((res) => {
        if (cancelled) return;
        const list = res?.content;
        setBooks(Array.isArray(list) && list.length > 0 ? list : mockPCBooks);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setBooks(mockPCBooks);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [propBooks]);

  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedCategory, setInternalSelectedCategory] = useState('ALL');
  const [internalOnlyAvailable, setInternalOnlyAvailable] = useState(false);
  const [internalSelectedType, setInternalSelectedType] = useState('ALL');
  const [internalSortBy, setInternalSortBy] = useState('default');

  // Quản lý Modal Bộ Lọc, AI Search Hint và Chế độ xem Lưới / Danh sách
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'
  const [aiHint, setAiHint] = useState(null);

  // Hợp nhất dữ liệu Controlled / Uncontrolled
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;
  const setSearchQuery = propOnSearchChange || setInternalSearchQuery;

  const selectedCategory =
    propSelectedCategory !== undefined ? propSelectedCategory : internalSelectedCategory;
  const setSelectedCategory = propOnSelectCategory || setInternalSelectedCategory;

  const onlyAvailable =
    propOnlyAvailable !== undefined ? propOnlyAvailable : internalOnlyAvailable;
  const setOnlyAvailable = propOnToggleOnlyAvailable || setInternalOnlyAvailable;

  const selectedType = propSelectedType !== undefined ? propSelectedType : internalSelectedType;
  const setSelectedType = propOnSelectType || setInternalSelectedType;

  const sortBy = propSortBy !== undefined ? propSortBy : internalSortBy;
  const setSortBy = propOnChangeSortBy || setInternalSortBy;

  // Tìm kiếm thông minh AI kèm bộ nhớ đệm Cache
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setAiHint(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      expandQueryWithAI(q)
        .then((res) => {
          if (cancelled) return;
          if (
            res?.success &&
            res.correctedQuery &&
            res.correctedQuery.toLowerCase() !== q.toLowerCase()
          ) {
            setAiHint({ ...res, originalQuery: q });
          } else {
            setAiHint(null);
          }
        })
        .catch(() => {
          if (!cancelled) setAiHint(null);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Danh mục chuyên ngành UTH kèm số lượng sách tương ứng
  const categories = useMemo(() => {
    return [
      { id: 'ALL', label: 'Tất cả', count: books.length },
      {
        id: 'CÔNG NGHỆ THÔNG TIN',
        label: 'CNTT',
        count: books.filter((b) => b.category === 'CÔNG NGHỆ THÔNG TIN').length,
      },
      {
        id: 'KINH TẾ',
        label: 'Kinh tế',
        count: books.filter((b) => b.category === 'KINH TẾ').length,
      },
      {
        id: 'LOGISTICS & VẬN TẢI',
        label: 'Logistics',
        count: books.filter((b) => b.category === 'LOGISTICS & VẬN TẢI').length,
      },
      {
        id: 'NGOẠI NGỮ',
        label: 'Ngoại ngữ',
        count: books.filter((b) => b.category === 'NGOẠI NGỮ').length,
      },
    ];
  }, [books]);

  // Đếm số tiêu chí lọc nâng cao đang bật
  const activeFilterCount = useMemo(() => {
    return (
      (selectedCategory !== 'ALL' ? 1 : 0) +
      (onlyAvailable ? 1 : 0) +
      (selectedType !== 'ALL' ? 1 : 0) +
      (sortBy !== 'default' ? 1 : 0)
    );
  }, [selectedCategory, onlyAvailable, selectedType, sortBy]);

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

  // Xóa toàn bộ bộ lọc về mặc định
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setOnlyAvailable(false);
    setSelectedType('ALL');
    setSortBy('default');
  };

  // Lọc và sắp xếp danh sách sách
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchCat = selectedCategory === 'ALL' || book.category === selectedCategory;
        const matchType = selectedType === 'ALL' || book.type === selectedType;
        const matchAvailable = !onlyAvailable || (book.availableQuantity || 0) > 0;
        const query = searchQuery.trim();
        const matchSearch = !query || matchBookSmart(book, query).matched;
        return matchCat && matchType && matchAvailable && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.publishYear || 0) - (a.publishYear || 0);
        if (sortBy === 'available') return (b.availableQuantity || 0) - (a.availableQuantity || 0);
        if (sortBy === 'borrowCount') return (b.borrowCount || 0) - (a.borrowCount || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return a.id - b.id;
      });
  }, [books, selectedCategory, selectedType, onlyAvailable, searchQuery, sortBy]);

  return (
    <div className="space-y-4 select-none pb-12">
      {/* 1. ACADEMIC MINI BANNER (Chuẩn nhận diện Thư viện UTH) */}
      <section
        aria-label="Giới thiệu Kho sách UTH"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002e32] via-[#00474b] to-[#002528] text-white p-4 sm:p-5 shadow-sm border border-teal-800"
      >
        {/* Họa tiết quầng sáng học thuật */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Breadcrumb nhỏ */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-200/90 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <span className="text-teal-400/60">/</span>
            <span className="text-teal-100 font-bold">Kho giáo trình & Sách UTH</span>
            {selectedCategory !== 'ALL' && (
              <>
                <span className="text-teal-400/60">/</span>
                <span className="text-amber-300 font-bold">{selectedCategory}</span>
              </>
            )}
          </div>

          <div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-300 shrink-0" />
              <span>Kho Giáo Trình & Tài Liệu UTH</span>
            </h1>
            <p className="mt-1 text-xs text-teal-100/90 leading-relaxed font-medium">
              Tra cứu nguồn tài liệu phục vụ giảng dạy, liên thông dữ liệu sách 3 cơ sở Thư viện Đại học GTVT TP.HCM.
            </p>
          </div>

          {/* 3 Chỉ số nhanh */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl py-1.5 px-2 border border-white/10">
              <span className="block text-[9px] font-bold text-teal-200 uppercase">Tài liệu</span>
              <strong className="text-xs font-black text-white font-mono">50.000+</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl py-1.5 px-2 border border-white/10">
              <span className="block text-[9px] font-bold text-teal-200 uppercase">Mạng lưới</span>
              <strong className="text-xs font-black text-teal-100 font-mono">3 Cơ sở</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl py-1.5 px-2 border border-white/10">
              <span className="block text-[9px] font-bold text-amber-300 uppercase">Hạn mức BR01</span>
              <strong className="text-xs font-black text-amber-300 font-mono">5 cuốn / SV</strong>
            </div>
          </div>

          {/* Dải từ khóa tìm kiếm nhanh */}
          <div className="pt-2 border-t border-white/15 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Tìm nhanh:</span>
            </span>
            {QUICK_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  searchQuery === kw
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-teal-100 border-white/15'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THANH TÌM KIẾM & NÚT BỘ LỌC (SearchBar) */}
      <div className="sticky top-14 z-20 bg-[#f4f8f7]/95 backdrop-blur-md pt-1 pb-2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => {
            setSearchQuery('');
            setAiHint(null);
          }}
          placeholder="Tìm tên giáo trình, tác giả, mã tài liệu UTH..."
          onOpenFilter={() => setIsFilterOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Gợi ý sửa lỗi / mở rộng từ khóa AI Search */}
        {aiHint && searchQuery.trim().length >= 3 && aiHint.originalQuery === searchQuery.trim() && (
          <div className="mt-2 px-3 py-2 rounded-xl bg-teal-50/90 border border-teal-200/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-[#00666b] shrink-0" />
              <span className="text-slate-600 truncate">
                Ý bạn là{' '}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(aiHint.correctedQuery);
                    setAiHint(null);
                  }}
                  className="font-bold text-[#00666b] underline cursor-pointer"
                >
                  {aiHint.correctedQuery}
                </button>
                ?
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAiHint(null)}
              className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
              aria-label="Ẩn gợi ý AI"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. DẢI CHIP CHUYÊN NGÀNH CUỘN NGANG (Horizontal Category Chips) */}
      <section aria-label="Lọc theo chuyên ngành đào tạo" className="space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#00666b] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. DẢI TAG CÁC TIÊU CHÍ LỌC ĐANG HOẠT ĐỘNG (Active Filter Badges) */}
      {hasActiveFilters && (
        <section
          aria-label="Các tiêu chí lọc đang áp dụng"
          className="flex flex-wrap items-center gap-1.5 p-2.5 bg-teal-50/80 rounded-xl border border-teal-200/70 text-xs"
        >
          <span className="font-bold text-[#00666B] text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Đang lọc:</span>
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-white border border-teal-300 text-teal-900 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-2xs">
              <span className="max-w-[120px] truncate">"{searchQuery}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-rose-600 cursor-pointer p-0.5"
                title="Bỏ tìm từ khóa"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-white border border-teal-300 text-teal-900 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-2xs">
              <span className="max-w-[120px] truncate">{selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="hover:text-rose-600 cursor-pointer p-0.5"
                title="Bỏ lọc ngành"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedType !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-white border border-teal-300 text-teal-900 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-2xs">
              <span>{selectedType}</span>
              <button
                type="button"
                onClick={() => setSelectedType('ALL')}
                className="hover:text-rose-600 cursor-pointer p-0.5"
                title="Bỏ lọc loại hình"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyAvailable && (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-2xs">
              <span>Còn sẵn trong kho</span>
              <button
                type="button"
                onClick={() => setOnlyAvailable(false)}
                className="hover:text-rose-600 cursor-pointer p-0.5"
                title="Bỏ lọc sẵn có"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {sortBy !== 'default' && (
            <span className="inline-flex items-center gap-1 bg-white border border-teal-300 text-teal-900 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-2xs">
              <span>
                {sortBy === 'newest' && 'Mới xuất bản'}
                {sortBy === 'available' && 'Còn nhiều bản'}
                {sortBy === 'borrowCount' && 'Mượn nhiều'}
                {sortBy === 'title' && 'Tên A-Z'}
              </span>
              <button
                type="button"
                onClick={() => setSortBy('default')}
                className="hover:text-rose-600 cursor-pointer p-0.5"
                title="Bỏ sắp xếp"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa tất cả</span>
          </button>
        </section>
      )}

      {/* 5. THANH CÔNG CỤ KẾT QUẢ & CHUYỂN ĐỔI CHẾ ĐỘ HIỂN THỊ (Result & View Toolbar) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-4 h-4 text-[#00666B] shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate">
            Kết quả tra cứu ({filteredBooks.length})
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Sort Dropdown thu nhỏ */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00666b] cursor-pointer"
            aria-label="Sắp xếp kết quả"
          >
            <option value="default">Sắp xếp: Mặc định</option>
            <option value="borrowCount">Mượn nhiều nhất</option>
            <option value="newest">Mới xuất bản</option>
            <option value="available">Còn nhiều bản</option>
            <option value="title">Tên sách A–Z</option>
          </select>

          {/* Toggle View Mode: Grid (Lưới) vs Compact (Danh sách rút gọn) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#00666b] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng lưới"
              aria-label="Xem dạng lưới"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-[#00666b] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng danh sách gọn"
              aria-label="Xem dạng danh sách gọn"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. LƯỚI SÁCH, SKELETON LOADING HOẶC TRẠNG THÁI RỖNG (Empty State) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00666B] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              Không tìm thấy tài liệu phù hợp
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Thử tìm kiếm với từ khóa khác hoặc đặt lại các tiêu chí bộ lọc để xem toàn bộ danh mục tài liệu UTH.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00666b] text-white text-xs font-bold shadow-sm hover:bg-[#005458] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại tất cả bộ lọc</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 [&_button+button]:hidden">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAddToCart={onAddToCart}
              onViewDetail={onViewDetail}
              isInCart={cartItems.some((c) => c.id === book.id)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAddToCart={onAddToCart}
              onViewDetail={onViewDetail}
              isInCart={cartItems.some((c) => c.id === book.id)}
              viewMode="compact"
            />
          ))}
        </div>
      )}

      {/* 7. BOTTOM SHEET BỘ LỌC NÂNG CAO (FilterModalMobile) */}
      <FilterModalMobile
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onlyAvailable={onlyAvailable}
        onToggleOnlyAvailable={setOnlyAvailable}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalResults={filteredBooks.length}
      />
    </div>
  );
}
