import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

/**
 * SearchBar - Thanh tìm kiếm dùng chung cho giao diện Mobile/Tablet (TV2)
 */
export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Tìm tên sách, tác giả, mã tài liệu...',
  onOpenFilter,
  activeFilterCount = 0,
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 min-w-0 flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white text-slate-800 placeholder-slate-400 pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00666b] shadow-xs"
        />
        {value && (
          <button
            type="button"
            onClick={() => (onClear ? onClear() : onChange && onChange(''))}
            className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onOpenFilter && (
        <button
          type="button"
          onClick={onOpenFilter}
          className={`relative shrink-0 min-h-[40px] px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            activeFilterCount > 0
              ? 'bg-[#00666b] text-white border-[#00666b]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          aria-label="Mở bộ lọc nâng cao"
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">Lọc</span>
          {activeFilterCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

