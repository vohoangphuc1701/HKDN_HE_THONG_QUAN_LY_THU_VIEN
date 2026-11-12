import React from 'react';
import {
  Filter,
  RotateCcw,
  Check,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

/**
 * FilterSidebarPC - Cột bộ lọc danh mục và thuộc tính sách trên Desktop (TV3)
 * Tinh chỉnh theo quy chuẩn Impeccable:
 * - Trực quan, độ tương phản chuẩn WCAG AA.
 * - Bộ lọc chuyên ngành, tình trạng kho khả dụng, hình thức tài liệu và cơ sở phục vụ.
 */
export default function FilterSidebarPC({
  categories = [],
  selectedCategory = 'ALL',
  onSelectCategory,
  onlyAvailable = false,
  onToggleOnlyAvailable,
  selectedType = 'ALL',
  onSelectType,
  selectedCampus = 'ALL',
  onSelectCampus,
  onResetFilters,
  hasActiveFilters = false,
  totalResults = 0,
}) {
  const documentTypes = [
    { key: 'ALL', label: 'Tất cả loại hình' },
    { key: 'PRINT', label: 'Sách in tại quầy' },
    { key: 'EBOOK', label: 'E-Book / Giáo trình số' },
  ];

  const campusList = [
    { key: 'ALL', label: 'Tất cả cơ sở UTH' },
    { key: 'CS1', label: 'Cơ sở 1 (Bình Thạnh)' },
    { key: 'CS2', label: 'Cơ sở 2 (Thủ Đức)' },
    { key: 'CS3', label: 'Cơ sở 3 (Quận 12)' },
  ];

  return (
    <aside className="w-72 shrink-0 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-6 sticky top-24 select-none">
      {/* Tiêu đề & Nút đặt lại */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <div className="w-7 h-7 rounded-lg bg-[#e0eff0] text-[#00666B] flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <span>Bộ lọc nâng cao</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Xóa toàn bộ bộ lọc"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      {/* 1. Trạng thái khả dụng (Toggle Only Available) */}
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
          Tình trạng kho sách
        </label>
        <button
          type="button"
          onClick={() => onToggleOnlyAvailable && onToggleOnlyAvailable(!onlyAvailable)}
          className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-left ${
            onlyAvailable
              ? 'bg-[#e0eff0] border-[#00666B] text-[#00666B] shadow-2xs ring-2 ring-[#00666B]/20'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                onlyAvailable
                  ? 'bg-[#00666B] border-[#00666B] text-white'
                  : 'bg-white border-slate-300'
              }`}
            >
              {onlyAvailable && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs font-bold">Chỉ hiện sách còn sẵn</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* 2. Danh mục chuyên ngành */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
            Chuyên ngành đào tạo
          </label>
          <Layers className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00666B] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate pr-2">{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Phân loại hình thức tài liệu */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
          Hình thức tài liệu
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {documentTypes.map((type) => {
            const isSelected = selectedType === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => onSelectType && onSelectType(type.key)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#e0eff0] text-[#00666B] font-bold border border-[#00666B]/30'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span>{type.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#00666B]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bộ lọc cơ sở phục vụ */}
      {onSelectCampus && (
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
              Cơ sở lưu trữ
            </label>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 gap-1">
            {campusList.map((c) => {
              const isSelected = selectedCampus === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onSelectCampus(c.key)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-teal-50 text-[#00666B] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00666B]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Ghi chú quy định Pick & Go */}
      <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100/80 text-[11px] text-teal-900 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[#00666B]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Chính sách mượn UTH</span>
        </div>
        <p className="leading-relaxed text-teal-800">
          • Tối đa 5 cuốn / sinh viên (BR01).
        </p>
        <p className="leading-relaxed text-teal-800">
          • Thời hạn mượn 14 ngày (gia hạn online 1 lần +7 ngày).
        </p>
      </div>

      {/* Tóm tắt kết quả */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-500">
          Đang hiển thị <strong className="text-[#00666B] font-bold">{totalResults}</strong> giáo trình
        </p>
      </div>
    </aside>
  );
}
