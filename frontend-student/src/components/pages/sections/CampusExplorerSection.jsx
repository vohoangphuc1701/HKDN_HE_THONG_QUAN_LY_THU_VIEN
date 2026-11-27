import React from 'react';
import { MapPin, Phone, ArrowRight, ArrowUpRight } from 'lucide-react';
import campusesData from '../../../data/campusesData';

/**
 * CampusExplorerSection - Khối hiển thị thông tin 3 Cơ sở Thư viện UTH
 * Hỗ trợ liên kết Google Maps dẫn đường trực tiếp và tra cứu tài liệu theo cơ sở.
 */
export default function CampusExplorerSection({ onSelectCampusCatalog }) {
  return (
    <section
      className="bg-gradient-to-b from-[#eaf5f2] via-[#f0f8f5] to-[#e6f3ee] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#b8dfd5] shadow-xs relative overflow-hidden space-y-6"
      aria-labelledby="heading-campuses"
    >
      {/* Họa tiết quầng sáng trang trí nền */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#cce8df] relative z-1">
        <div>
          <h2 id="heading-campuses" className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
            Hệ thống Thư viện 3 Cơ sở UTH
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            Không gian học tập, phòng đọc hiện đại và quầy nhận sách Pick & Go tại các cơ sở đào tạo của trường.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/95 border border-teal-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-[#00666B]" />
          <span>3 Cơ sở liên thông dữ liệu sách</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-1">
        {campusesData.map((campus) => (
          <div
            key={campus.id}
            className="bg-white rounded-3xl border border-teal-200/90 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
          >
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${campus.lat},${campus.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-64 sm:h-72 w-full overflow-hidden block cursor-pointer"
              title={`Xem ${campus.name} trên Google Maps`}
            >
              <img
                src={campus.image}
                alt={campus.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/25 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-[#00666B] text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md border border-white/20">
                {campus.name}
              </div>
              {/* Icon chỉ đường Google Maps */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#00666B] text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-md border border-teal-200 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <MapPin className="w-3.5 h-3.5" />
                <span>Xem bản đồ</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg font-bold leading-snug drop-shadow-xs">{campus.name}</h3>
                <p className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span className="truncate">{campus.address}</span>
                </p>
              </div>
            </a>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-gradient-to-b from-white to-slate-50/70">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100/90 space-y-1">
                  <span className="text-slate-500 font-semibold block text-[11px]">Giờ mở cửa:</span>
                  <strong className="text-slate-900 block font-bold">{campus.hours}</strong>
                  <span className="text-[11px] text-teal-800 font-semibold block">{campus.schedule}</span>
                </div>
                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100/90 space-y-1">
                  <span className="text-slate-500 font-semibold block text-[11px]">Không gian học tập:</span>
                  <strong className="text-slate-900 block font-bold">{campus.seats}</strong>
                  <span className="text-[11px] text-teal-800 font-semibold block">Trang bị máy lạnh & Wifi</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-2xl border border-slate-100">
                {campus.desc}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#00666B]" />
                  <span>{campus.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectCampusCatalog && onSelectCampusCatalog(campus.code)}
                  className="text-xs font-bold text-[#00666B] hover:text-[#004f53] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Tra cứu {campus.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
