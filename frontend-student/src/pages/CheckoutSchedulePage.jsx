import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Info,
  Trash2,
  ArrowLeft,
  QrCode,
  AlertTriangle,
  Phone,
  Building,
  User,
  Check,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import borrowApi from '../services/borrowApi';

/**
 * CheckoutSchedulePage - Màn hình Xác nhận Đơn mượn & Đặt lịch hẹn Pick & Go (TV3 - Desktop)
 * Tuân thủ đầy đủ các quy tắc nghiệp vụ BR01 - BR08 của Thư viện UTH:
 * - BR01: Quản lý hạn mức tối đa 5 cuốn / sinh viên. Chặn nếu có nợ phạt.
 * - BR02: Thời hạn mượn mặc định 14 ngày kể từ khi nhận sách tại quầy.
 * - BR03: Quy định gia hạn online 1 lần (+7 ngày).
 * - BR04: Minh bạch tiền phạt 5.000 VNĐ / ngày / cuốn nếu trễ hạn.
 * - BR05: Cảnh báo thời gian giữ sách tối đa 48 giờ tại quầy trước khi tự động hủy.
 * - Bảng tóm tắt tài liệu, chọn 3 cơ sở đào tạo UTH, chọn ngày & khung giờ hẹn nhận, và xuất mã QR.
 */
export default function CheckoutSchedulePage({
  cartItems = [],
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  onBackToCatalog,
  onOpenQrModal
}) {
  // 1. Chọn cơ sở nhận sách
  const [selectedCampus, setSelectedCampus] = useState('CS1');

  // 2. Chọn ngày nhận sách (Mặc định ngày mai)
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // 3. Chọn khung giờ nhận sách
  const [pickupTimeSlot, setPickupTimeSlot] = useState('morning');
  const [studentNote, setStudentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Danh mục 3 Cơ sở đào tạo UTH
  const campuses = [
    {
      id: 'CS1',
      code: 'CS1',
      name: 'Cơ sở 1 (Trụ sở chính)',
      address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
      counter: 'Quầy tiếp nhận Pick & Go · Tầng trệt Tòa H1',
      hours: '07:30 – 20:30 (Thứ 2 – Thứ 7)',
      phone: '(028) 3899 2862 - Nhánh 104',
      badge: 'Trụ sở chính',
      allowsEvening: true,
    },
    {
      id: 'CS2',
      code: 'CS2',
      name: 'Cơ sở 2 (Khuôn viên Kỹ thuật)',
      address: 'Số 10 Đường 12, P. An Khánh, TP. Thủ Đức, TP.HCM',
      counter: 'Quầy Giáo trình & Tài liệu Kỹ thuật · Tòa D',
      hours: '07:30 – 17:00 (Thứ 2 – Thứ 6)',
      phone: '(028) 3899 2862 - Nhánh 106',
      badge: 'Khoa Kỹ thuật',
      allowsEvening: false,
    },
    {
      id: 'CS3',
      code: 'CS3',
      name: 'Cơ sở 3 (CNTT & Kinh tế số)',
      address: 'Số 70 Tô Ký, P. Trung Mỹ Tây, Quận 12, TP.HCM',
      counter: 'Phòng đọc số & Bàn giao tài liệu · Tòa đa năng',
      hours: '07:30 – 17:00 (Thứ 2 – Thứ 7)',
      phone: '(028) 3899 2862 - Nhánh 108',
      badge: 'Khoa CNTT & KT',
      allowsEvening: false,
    },
  ];

  // Khung giờ hẹn lấy
  const timeSlots = [
    {
      id: 'morning',
      label: 'Buổi Sáng',
      time: '08:00 – 11:30',
      desc: 'Thủ thư soạn sẵn từ 07:30',
      badge: 'Đông sinh viên',
    },
    {
      id: 'afternoon',
      label: 'Buổi Chiều',
      time: '13:30 – 17:00',
      desc: 'Lấy trước giờ tan học ca 2',
      badge: 'Nhanh nhất',
    },
    {
      id: 'evening',
      label: 'Buổi Tối',
      time: '17:30 – 20:00',
      desc: 'Dành cho sinh viên học ca tối (Chỉ CS1)',
      badge: 'Áp dụng CS1',
    },
  ];

  const selectedCampusObj = campuses.find((c) => c.id === selectedCampus) || campuses[0];
  const selectedTimeSlotObj = timeSlots.find((t) => t.id === pickupTimeSlot) || timeSlots[0];

  // Tính toán ngày mượn hợp lệ (từ hôm nay đến 7 ngày tới)
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setPickupDate(d.toISOString().split('T')[0]);
  };

  // Xử lý xác nhận đặt mượn
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Kiểm tra quy định BR01 (Chặn nếu có nợ phạt hoặc vượt hạn mức 5 cuốn)
      const eligibility = await borrowApi.checkStudentBorrowEligibility({
        addingCount: cartItems.length,
      });

      if (!eligibility.eligible && eligibility.reason) {
        setErrorMessage(eligibility.reason);
        setIsSubmitting(false);
        return;
      }

      // 2. Gửi yêu cầu đặt mượn lên Spring Boot (/api/borrows/create)
      const result = await borrowApi.createBorrowOrder({
        bookIds: cartItems.map((b) => b.id),
        pickupDate,
        note: `Cơ sở ${selectedCampusObj.code} - ${selectedTimeSlotObj.time}${studentNote ? ' - ' + studentNote : ''}`,
      });

      const orderCode = result.orderCode || `OD-UTH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        code: orderCode,
        orderId: result.orderId || Math.floor(100 + Math.random() * 900),
        pickupDate: `${pickupDate} (${selectedTimeSlotObj.time})`,
        pickupCampus: selectedCampusObj.name,
        pickupAddress: selectedCampusObj.address,
        pickupCounter: selectedCampusObj.counter,
        dueDate: '14 ngày kể từ khi ký nhận tại quầy (BR02)',
        books: [...cartItems],
        totalBooks: cartItems.length,
        status: result.status || 'NEW',
        studentNote: studentNote.trim(),
        createdAt: new Date().toLocaleDateString('vi-VN'),
        expireTime48h: '48 giờ sau khi đơn được soạn sẵn (BR05)',
        qrCodeBase64: result.qrCodeBase64,
      };

      setIsSubmitting(false);
      setConfirmedOrder(newOrder);

      if (onCheckoutSuccess) {
        onCheckoutSuccess(newOrder);
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error?.message || 'Không thể tạo đơn đặt mượn sách. Vui lòng kiểm tra lại!');
    }
  };

  /* ==================== TRƯỜNG HỢP 1: ĐÃ XÁC NHẬN THÀNH CÔNG VÀ XUẤT MÃ QR ==================== */
  if (confirmedOrder) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 select-none animate-in fade-in zoom-in-95 duration-300">
        {/* Banner Chúc mừng & Mã đơn */}
        <div className="bg-gradient-to-br from-[#00383b] via-[#00474b] to-[#00282b] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-teal-700/60 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Đặt mượn thành công trên hệ thống UTH</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
                Đơn Mượn Pick &amp; Go: <span className="text-amber-300 font-mono">{confirmedOrder.code}</span>
              </h1>
              <p className="text-sm text-teal-100 max-w-2xl leading-relaxed">
                Thủ thư tại <strong>{confirmedOrder.pickupCampus}</strong> đang tiến hành gom sách vào khay chờ. Bạn chỉ cần mở mã QR này tại quầy tiếp nhận để hoàn tất thủ tục trong dưới 30 giây!
              </p>
            </div>
          </div>
        </div>

        {/* Khối Thẻ QR Code & Hướng dẫn nhận sách */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Cột trái: Mã QR Code để quét tại quầy */}
          <div className="md:col-span-5 bg-white rounded-3xl border-2 border-slate-200/90 p-6 shadow-md text-center space-y-4">
            <div className="p-2 bg-gradient-to-b from-teal-50 to-emerald-50/40 rounded-2xl border border-teal-100 inline-block">
              {/* Giả lập khung QR Code UTH độ tương phản cao */}
              <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-inner flex flex-col items-center justify-center relative">
                {/* SVG QR Code minh họa thực tế */}
                <div className="w-48 h-48 bg-slate-950 rounded-lg p-2.5 flex items-center justify-center relative">
                  <div className="absolute inset-2 bg-white rounded flex items-center justify-center p-2">
                    <div className="w-full h-full border-4 border-slate-900 flex flex-col justify-between p-1.5 relative">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                        <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="w-7 h-7 rounded-md bg-[#00666B] text-white flex items-center justify-center font-black text-[9px]">
                          UTH
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                        <div className="w-10 h-3 bg-slate-900 rounded-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-slate-500 block">Mã xác thực đơn</span>
              <strong className="text-base font-black text-slate-900 font-mono tracking-wider">{confirmedOrder.code}</strong>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-1">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Quy định giữ chỗ 48h (BR05)</span>
              </span>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                Đơn hàng được giữ tại quầy tối đa <strong>48 giờ</strong>. Sau thời gian này, sách sẽ được tự động hoàn về kho để phục vụ bạn đọc khác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>In phiếu nhận</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenQrModal) onOpenQrModal(confirmedOrder);
                }}
                className="flex-1 py-2.5 px-3 bg-[#00666B] hover:bg-[#005458] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Xem toàn màn hình</span>
              </button>
            </div>
          </div>

          {/* Cột phải: Chi tiết phiếu hẹn & Danh mục tài liệu */}
          <div className="md:col-span-7 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00666B]" />
                <span>Thông Tin Lịch Hẹn Đã Xác Nhận</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Cơ sở bàn giao:</span>
                  <strong className="text-slate-800 text-sm font-bold block mt-0.5">{confirmedOrder.pickupCampus}</strong>
                  <span className="text-slate-500 text-[11px] block mt-0.5">{confirmedOrder.pickupAddress}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Thời gian hẹn lấy:</span>
                  <strong className="text-emerald-700 text-sm font-bold block mt-0.5">{confirmedOrder.pickupDate}</strong>
                  <span className="text-slate-500 text-[11px] block mt-0.5">Thời hạn mượn: 14 ngày (BR02)</span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium block">Vị trí quầy bàn giao:</span>
                  <p className="text-slate-800 font-semibold mt-0.5 text-xs">{confirmedOrder.pickupCounter}</p>
                </div>
              </div>
            </div>

            {/* Danh mục sách trong đơn */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
              <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Danh mục {confirmedOrder.books.length} cuốn giáo trình</span>
                <span className="text-xs font-mono text-[#00666B] font-bold">Hạn mức BR01: Đạt yêu cầu</span>
              </h4>

              <div className="divide-y divide-slate-100">
                {confirmedOrder.books.map((book, idx) => (
                  <div key={book.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-[#00666B] font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-900 truncate">{book.title}</h5>
                        <p className="text-[11px] text-slate-500 font-mono">{book.code} · Kệ: {book.location || 'Khu A'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                      Sẵn sàng
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút quay lại trang chủ hoặc kho sách */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToCatalog}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tiếp tục tìm mượn sách khác</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== TRƯỜNG HỢP 2: GIỎ SÁCH ĐANG TRỐNG ==================== */
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 select-none animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-teal-50 text-[#00666B] flex items-center justify-center mx-auto shadow-sm border border-teal-100">
          <ShoppingBag className="w-9 h-9 stroke-[1.8]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Giỏ Mượn Của Bạn Đang Trống
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Bạn chưa chọn cuốn sách nào vào giỏ mượn Pick &amp; Go. Hãy khám phá kho giáo trình UTH để chọn tối đa 5 đầu sách mượn về nhà.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#00666B] hover:bg-[#005458] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          <span>Khám phá kho giáo trình UTH ngay</span>
        </button>
      </div>
    );
  }

  /* ==================== TRƯỜNG HỢP 3: MÀN HÌNH XÁC NHẬN ĐƠN VÀ LÊN LỊCH ==================== */
  return (
    <div className="space-y-8 select-none animate-in fade-in duration-200">
      {/* 1. Header Trang Đặt lịch hẹn */}
      <div className="bg-gradient-to-br from-[#002e32] via-[#00474b] to-[#002528] rounded-3xl p-6 sm:p-8 border border-teal-700/60 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-200/80">
              <button
                type="button"
                onClick={onBackToCatalog}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kho giáo trình</span>
              </button>
              <span className="text-teal-400/60">/</span>
              <span className="text-teal-100 font-bold">Xác nhận đơn mượn</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight drop-shadow-xs">
              Xác Nhận Đơn Mượn &amp; Lên Lịch Pick &amp; Go
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              Thủ thư sẽ gom sẵn tài liệu ra khay tiếp nhận riêng tại cơ sở đào tạo bạn chọn. Nhận sách bằng mã QR tại quầy trong dưới 30 giây.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200/80 block">Số lượng</span>
              <strong className="text-sm font-black text-amber-300 font-mono">{cartItems.length} / 5 cuốn (BR01)</strong>
            </div>
            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200/80 block">Thời hạn</span>
              <strong className="text-sm font-black text-white font-mono">14 ngày (BR02)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BỐ CỤC 2 CỘT: CỘT BẢNG TÀI LIỆU (TRÁI) + CỘT CHỌN LỊCH HẸN & CƠ SỞ (PHẢI) */}
      <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= CỘT TRÁI (7 CỘT): BẢNG TÓM TẮT TÀI LIỆU ================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00666B] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 font-heading">
                    Danh Sách Giáo Trình Mượn ({cartItems.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kiểm tra vị trí kệ và thông tin ấn bản trước khi gửi đơn
                  </p>
                </div>
              </div>

              {onClearCart && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  Xóa toàn bộ giỏ
                </button>
              )}
            </div>

            {/* Bảng tóm tắt tài liệu */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3.5 px-4 pl-6">STT</th>
                    <th className="py-3.5 px-4">Tài liệu / Giáo trình</th>
                    <th className="py-3.5 px-4">Chuyên ngành</th>
                    <th className="py-3.5 px-4">Vị trí kệ sách</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái kho</th>
                    <th className="py-3.5 px-4 pr-6 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cartItems.map((book, idx) => (
                    <tr key={book.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 pl-6 font-mono text-slate-400 font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-start gap-3">
                          <div
                            style={{ backgroundColor: book.coverTheme?.bg || '#00666B' }}
                            className="w-9 h-12 rounded-md text-white p-1 flex flex-col justify-between shrink-0 shadow-xs"
                          >
                            <span className="text-[6px] font-bold text-center block">UTH</span>
                            <span className="text-[5px] font-black uppercase text-center line-clamp-1">
                              {book.title}
                            </span>
                            <span className="text-[5px] text-center opacity-80 block">{book.publishYear || '2024'}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 line-clamp-1 leading-snug">
                              {book.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              Tác giả: <span className="font-semibold text-slate-700">{book.author}</span>
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              Mã: {book.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#00666B] border border-teal-200/60">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <MapPin className="w-3 h-3 text-[#00666B] shrink-0" />
                          <span>{book.location || 'Khu CNTT · Kệ A2'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Sẵn sàng gom</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 pr-6 text-center whitespace-nowrap">
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(book.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa tài liệu khỏi đơn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Thông tin chính sách mượn trả rõ ràng */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thời hạn mượn: <strong>14 ngày</strong> (BR02)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00666B] shrink-0" />
                <span>Gia hạn trực tuyến: <strong>+7 ngày</strong> (BR03)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Phạt quá hạn: <strong>5.000đ/ngày</strong> (BR04)</span>
              </div>
            </div>
          </div>

          {/* Khối Ghi chú của sinh viên */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
            <label htmlFor="student-note" className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ghi chú cho thủ thư soạn sách (Tùy chọn)
            </label>
            <textarea
              id="student-note"
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Ví dụ: Em muốn lấy thêm đĩa CD kèm theo cuốn Lập trình Python, hoặc nhờ thủ thư kiểm tra năm xuất bản mới nhất..."
              rows={2}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00666B] focus:border-transparent placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ================= CỘT PHẢI (5 CỘT): CHỌN CƠ SỞ & LÊN LỊCH HẸN ================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md space-y-6 sticky top-24">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00666B]" />
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Lên Lịch Hẹn Nhận Sách
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Chọn cơ sở, ngày và khung giờ bạn sẽ đến quét QR nhận tài liệu
              </p>
            </div>

            {/* 1. Chọn Cơ sở UTH */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>1. Chọn Cơ sở thư viện UTH</span>
                <span className="text-[10px] text-teal-700 font-mono font-bold">3 Cơ sở</span>
              </label>

              <div className="space-y-2.5">
                {campuses.map((campus) => {
                  const isSelected = selectedCampus === campus.id;
                  return (
                    <div
                      key={campus.id}
                      onClick={() => setSelectedCampus(campus.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#00666B] bg-teal-50/50 shadow-xs ring-2 ring-[#00666B]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campus"
                        checked={isSelected}
                        onChange={() => setSelectedCampus(campus.id)}
                        className="mt-1 text-[#00666B] focus:ring-[#00666B] cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <strong className="text-xs font-bold text-slate-900">{campus.name}</strong>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                            {campus.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{campus.address}</p>
                        <span className="text-[10px] font-mono text-[#00666B] block mt-1 font-semibold">
                          Giờ phục vụ: {campus.hours}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Chọn Ngày nhận sách */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label htmlFor="pickup-date-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>2. Ngày hẹn lấy sách</span>
                <span className="text-[10px] text-slate-400 font-medium">Tối đa trong 7 ngày</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                    pickupDate === minDate
                      ? 'bg-[#00666B] text-white border-[#00666B]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                    pickupDate === (() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      return d.toISOString().split('T')[0];
                    })()
                      ? 'bg-[#00666B] text-white border-[#00666B]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(2)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                    pickupDate === (() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 2);
                      return d.toISOString().split('T')[0];
                    })()
                      ? 'bg-[#00666B] text-white border-[#00666B]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Ngày mốt
                </button>
              </div>

              <div className="relative">
                <input
                  id="pickup-date-input"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full text-xs font-bold font-mono p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00666B] cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* 3. Chọn Khung giờ nhận */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Khung giờ tiếp nhận Pick &amp; Go
              </label>

              <div className="space-y-2">
                {timeSlots.map((slot) => {
                  const isSelected = pickupTimeSlot === slot.id;
                  const isEveningDisabled = slot.id === 'evening' && !selectedCampusObj.allowsEvening;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        if (!isEveningDisabled) setPickupTimeSlot(slot.id);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isEveningDisabled
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                          : isSelected
                          ? 'border-[#00666B] bg-teal-50/60 shadow-xs cursor-pointer'
                          : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={isSelected}
                          disabled={isEveningDisabled}
                          onChange={() => setPickupTimeSlot(slot.id)}
                          className="text-[#00666B] focus:ring-[#00666B] cursor-pointer"
                        />
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{slot.label} ({slot.time})</strong>
                          <span className="text-[11px] text-slate-500 block">{slot.desc}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {slot.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Cảnh báo cam kết giữ chỗ 48h (BR05) */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/90 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Lưu ý quan trọng về đơn mượn (BR05)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Đơn hàng sẽ được tự động hủy và sách chuyển lại về kho chung nếu bạn không đến quét QR nhận sách trong vòng <strong>48 giờ</strong> kể từ thời điểm hẹn.
              </p>
            </div>

            {/* Thông báo lỗi nghiệp vụ BR01 nếu có */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Không thể tạo đơn mượn</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* 5. Nút Xác nhận tạo đơn */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isSubmitting
                    ? 'bg-slate-400 text-white cursor-wait'
                    : 'bg-[#00666B] hover:bg-[#005458] text-white hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Đang tạo đơn &amp; mã QR...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 stroke-[2.2]" />
                    <span>Xác nhận đặt mượn &amp; Xuất mã QR</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToCatalog}
                className="w-full py-2.5 text-xs text-slate-600 hover:text-slate-900 font-bold hover:underline cursor-pointer"
              >
                Quay lại kho sách để chọn thêm
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
