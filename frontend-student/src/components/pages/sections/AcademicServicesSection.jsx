import React from 'react';
import { Users, Laptop, ShoppingBag, Headphones, ArrowRight } from 'lucide-react';

/**
 * AcademicServicesSection - Khối hệ sinh thái dịch vụ học thuật UTH
 */
export default function AcademicServicesSection({ onOpenCatalog, onOpenChatbot }) {
  return (
    <section className="space-y-4" aria-labelledby="heading-services">
      <div className="pb-1">
        <h2 id="heading-services" className="text-2xl font-black text-slate-900 font-heading tracking-tight">
          Hệ sinh thái dịch vụ học thuật UTH
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
          Các tiện ích số hóa hỗ trợ sinh viên xuyên suốt quá trình học tập và nghiên cứu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <div
          onClick={onOpenCatalog}
          className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-[#00666B] hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#00666B] border border-teal-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#00666B] transition-colors">
              Phòng Tự Học & Thảo Luận
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Trang bị máy lạnh, màn hình tương tác, wifi tốc độ cao và nguồn sạc tại từng bàn học.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00666B]">
            <span>Xem không gian</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={onOpenCatalog}
          className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
              Giáo Trình Số & E-Book
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Truy cập hàng ngàn đầu tài liệu điện tử, luận văn và bài báo khoa học chất lượng cao.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Tra cứu E-Book</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={onOpenCatalog}
          className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-500 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
              Nhận Nhanh Pick & Go
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Đặt mượn trực tuyến trước, thủ thư chuẩn bị sẵn ra khay riêng, nhận sách dưới 30 giây.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Xem quy trình</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={onOpenChatbot || onOpenCatalog}
          className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-purple-500 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer space-y-3"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
              Hỗ Trợ Học Thuật AI
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Trợ lý ảo AI túc trực 24/7 giải đáp thắc mắc tài liệu, nội quy thư viện và hướng dẫn nghiên cứu.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>Hỏi Trợ lý AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
}
