import React from 'react';
import { Check, CheckCircle2, Filter, RotateCcw, X } from 'lucide-react';

/**
 * FilterModalMobile - Bottom Sheet / Modal bộ lọc nâng cao cho Mobile & Tablet (TV2)
 * Tham khảo các tiêu chí lọc từ FilterSidebarPC (TV3): chuyên ngành, tình trạng sẵn sàng, loại tài liệu & sắp xếp.
 */
const DOCUMENT_TYPES = [
  { key: 'ALL', label: 'Tất cả loại hình' },
  { key: 'Giáo trình chính', label: 'Giáo trình chính' },
  { key: 'Sách tham khảo', label: 'Sách tham khảo' },
  { key: 'Sách chuyên ngành', label: 'Sách chuyên ngành' },
];

const SORT_OPTIONS = [
  { key: 'default', label: 'Mặc định' },
  { key: 'borrowCount', label: 'Mượn nhiều nhất' },
  { key: 'newest', label: 'Mới xuất bản' },
  { key: 'available', label: 'Còn nhiều bản' },
  { key: 'title', label: 'Tên sách A–Z' },
];

export default function FilterModalMobile({
  isOpen = false,
  onClose,
  categories = [],
  selectedCategory = 'ALL',
  onSelectCategory,
  onlyAvailable = false,
  onToggleOnlyAvailable,
  selectedType = 'ALL',
  onSelectType,
  sortBy = 'default',
  onChangeSortBy,
  onResetFilters,
  hasActiveFilters = false,
  totalResults = 0,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden
      />

      {/* Bottom Sheet (Mobile) / Modal (Tablet) */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-100 max-h-[88vh] flex flex-col overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Handle kéo trên Mobile */}
        <div
          className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden cursor-pointer"
          onClick={onClose}
        />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#e0eff0] text-[#00666b] flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bộ lọc &amp; Sắp xếp</h3>
              <p className="text-[11px] text-slate-500">Hiện có {totalResults} tài liệu phù hợp</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold cursor-pointer hover:bg-rose-100"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa lọc</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              aria-label="Đóng bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nội dung cuộn */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* 1. Tình trạng kho */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
              Tình trạng kho sách
            </span>
            <button
              type="button"
              onClick={() => onToggleOnlyAvailable && onToggleOnlyAvailable(!onlyAvailable)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                onlyAvailable
                  ? 'bg-teal-50/70 border-[#00666b] text-[#00666b]'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className={`w-4 h-4 ${onlyAvailable ? 'text-[#00666b]' : 'text-slate-400'}`} />
                <span>Chỉ hiện sách đang còn sẵn tại quầy</span>
              </span>
              <span
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  onlyAvailable ? 'bg-[#00666b] justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
              </span>
            </button>
          </div>

          {/* 2. Chuyên ngành UTH */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
              Chuyên ngành đào tạo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00666b] text-white border-[#00666b] font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Loại hình tài liệu */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
              Loại hình tài liệu
            </span>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_TYPES.map((typeItem) => {
                const isSelected = selectedType === typeItem.key;
                return (
                  <button
                    key={typeItem.key}
                    type="button"
                    onClick={() => onSelectType && onSelectType(typeItem.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-[#00666b] text-[#00666b] font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{typeItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sắp xếp kết quả */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
              Sắp xếp theo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onChangeSortBy && onChangeSortBy(opt.key)}
                    className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-[#00666b] text-[#00666b] font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-100"
          >
            Đặt lại
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#00666b] hover:bg-[#005458] text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            Xem {totalResults} tài liệu
          </button>
        </div>
      </div>
    </div>
  );
}

