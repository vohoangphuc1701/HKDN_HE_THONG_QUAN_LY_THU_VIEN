import React from 'react';

/**
 * LoanCardSkeleton - Khung xương Shimmer cho thẻ sách đang mượn (TV2 Mobile)
 * Dùng animate-pulse của Tailwind, không cần CSS ngoài.
 */
export default function LoanCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-xs animate-pulse flex flex-col gap-3">
      {/* Header: checkbox + mã đơn + badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
          <div className="w-32 h-5 rounded-lg bg-slate-200" />
        </div>
        <div className="w-16 h-5 rounded-full bg-slate-200" />
      </div>

      {/* Thông tin sách: cover mini + text */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-14 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
      </div>

      {/* Thanh tiến độ */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-slate-200 rounded w-16" />
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full" />
        <div className="flex justify-between">
          <div className="h-2.5 bg-slate-200 rounded w-20" />
          <div className="h-2.5 bg-slate-200 rounded w-16" />
        </div>
      </div>

      {/* 3 nút thao tác */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="h-10 rounded-xl bg-slate-200" />
        <div className="h-10 rounded-xl bg-slate-200" />
        <div className="h-10 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
