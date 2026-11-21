import React from 'react';

/**
 * BookCardSkeleton - Khung xương Shimmer cho thẻ sách trong lưới (TV2 Mobile)
 * Tương đương kích thước BookCard viewMode="grid".
 * Dùng animate-pulse của Tailwind, không cần CSS ngoài.
 */
export default function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm animate-pulse flex flex-col overflow-hidden">
      {/* Vùng bìa sách */}
      <div className="bg-slate-200 h-48 sm:h-52 w-full flex items-center justify-center">
        <div className="w-28 h-[9.5rem] rounded-r-lg bg-slate-300" />
      </div>

      {/* Thông tin sách */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="flex justify-between">
          <div className="h-3.5 bg-slate-200 rounded w-16" />
          <div className="h-3.5 bg-slate-200 rounded w-12" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
        <div className="pt-2 space-y-2 border-t border-slate-100">
          <div className="h-10 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
