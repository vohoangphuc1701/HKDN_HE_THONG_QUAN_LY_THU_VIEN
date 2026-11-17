import React from 'react';
import {
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Compass,
  BookMarked,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  History
} from 'lucide-react';

export default function FooterPC({ setActiveTab, onOpenCart }) {
  const handleNav = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#00282b] text-slate-200 border-t border-[#00383d] mt-16 select-none" aria-label="Chân trang Thư viện UTH">
      {/* 1. Dải cam kết & Giá trị nổi bật */}
      <div className="border-b border-teal-900/60 bg-[#001f22]">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800/60 border border-teal-600/40 text-teal-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-white font-semibold">Quy trình Pick & Go</strong>
                <span className="text-teal-200/80 text-[11px]">Nhận sách nhanh tại quầy</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800/60 border border-teal-600/40 text-teal-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-white font-semibold">50.000+ Đầu sách</strong>
                <span className="text-teal-200/80 text-[11px]">Giáo trình chính quy & tham khảo</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800/60 border border-teal-600/40 text-teal-300 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-white font-semibold">Gia hạn trực tuyến</strong>
                <span className="text-teal-200/80 text-[11px]">Thao tác 1 chạm mọi lúc 24/7</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800/60 border border-teal-600/40 text-teal-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-white font-semibold">Minh bạch 100%</strong>
                <span className="text-teal-200/80 text-[11px]">Thông báo hạn trả tự động</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lưới nội dung chân trang 4 cột */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* CỘT 1: THƯ VIỆN UTH */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#00666B] shadow-sm shrink-0">
                <BookOpen className="w-5 h-5 text-[#00666B]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-heading tracking-tight leading-none">
                  Thư viện <span className="text-teal-300">UTH</span>
                </h3>
                <p className="text-[10px] text-teal-200/80 mt-1">Đại học Giao thông Vận tải TP.HCM</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cổng thư viện số thông minh phục vụ học tập, nghiên cứu và sáng tạo cho toàn thể giảng viên, học viên và sinh viên trường Đại học Giao thông Vận tải TP.HCM.
            </p>

            <div className="pt-2 border-t border-teal-900/60 space-y-1.5 text-xs text-teal-100/90">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Thứ 2 – Thứ 7:</span> 07:30 – 20:30
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Chủ nhật:</span> 08:00 – 17:00
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 2: TRA CỨU & DỊCH VỤ TRỰC TUYẾN */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Tra Cứu & Dịch Vụ
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Trang chủ sinh viên</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('catalog')}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Compass className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Kho Sách & Giáo Trình Chính Quy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('loans')}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <BookMarked className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Hồ sơ mượn & Gia hạn trực tuyến</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('history')}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <History className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Lịch sử mượn trả & Đối soát phạt</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCart && onOpenCart()}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ShoppingBag className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Giỏ mượn sách hẹn trước (Pick & Go)</span>
                </button>
              </li>
              <li>
                <a
                  href="#csdl"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('catalog');
                  }}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Cơ sở dữ liệu khoa học số (IEEE, Springer)</span>
                </a>
              </li>
              <li>
                <a
                  href="#luanvan"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('catalog');
                  }}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Luận văn & Đề tài nghiên cứu tốt nghiệp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HƯỚNG DẪN & QUY ĐỊNH */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Hướng Dẫn & Quy Định
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('loans')}
                  className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Quy trình quét mã QR nhận tài liệu</span>
                </button>
              </li>
              <li>
                <span className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Thời hạn mượn: Tối đa 5 cuốn / 14 ngày</span>
                </span>
              </li>
              <li>
                <span className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Chính sách gia hạn trực tuyến thêm 7 ngày</span>
                </span>
              </li>
              <li>
                <span className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Quy định bảo quản giáo trình & bồi hoàn</span>
                </span>
              </li>
              <li>
                <span className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Nội quy phòng đọc & khu tự học thông minh</span>
                </span>
              </li>
              <li>
                <span className="hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Câu hỏi thường gặp dành cho tân sinh viên (FAQ)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* CỘT 4: CƠ SỞ & THÔNG TIN LIÊN HỆ */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Hệ Thống Cơ Sở & Liên Hệ
            </h4>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-medium">Cơ sở 1:</strong>
                  <span>Số 2, Đường Võ Oanh, P.25, Q. Bình Thạnh, TP.HCM</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-medium">Cơ sở 2:</strong>
                  <span>Số 10, Đường số 12, P. An Khánh, TP. Thủ Đức, TP.HCM</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-medium">Cơ sở 3:</strong>
                  <span>Số 70, Đường Tô Ký, P. Trung Mỹ Tây, Quận 12, TP.HCM</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Tổng đài hỗ trợ mượn trả:</span>
                  <a href="tel:02838992862" className="text-white hover:text-teal-300 font-bold transition-colors">
                    (028) 3899 2862 - Nhánh 104
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Hộp thư giải đáp trực tuyến:</span>
                  <a href="mailto:thuvien@ut.edu.vn" className="text-white hover:text-teal-300 font-medium transition-colors">
                    thuvien@ut.edu.vn
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Dải bản quyền & Tiêu chuẩn hệ thống dưới cùng */}
      <div className="border-t border-teal-900/60 bg-[#001c1e] text-[11px] text-slate-400">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-center md:text-left flex-wrap">
            <span className="font-bold text-slate-200">
              &copy; 2026 Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH).
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span>Bảo lưu mọi quyền.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-center flex-wrap">
            <span className="hover:text-slate-200 cursor-pointer">Quy chế Thư viện</span>
            <span>·</span>
            <span className="hover:text-slate-200 cursor-pointer">Chính sách bảo mật</span>
            <span>·</span>
            <span className="hover:text-slate-200 cursor-pointer">Tiêu chuẩn phục vụ nhanh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

