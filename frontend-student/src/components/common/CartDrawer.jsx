import React, { useState } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ShoppingBag,
  Info,
  Check,
} from 'lucide-react';

/**
 * CartDrawer - Ngăn kéo giỏ mượn sách & Lên lịch hẹn nhận tài liệu Pick & Go
 * Thiết kế chuẩn Impeccable Bolder: Nổi khối xúc giác, đồng bộ nhận diện UTH Academic Teal,
 * trực quan hóa hạn mức 5 cuốn (BR01), cam kết quầy nhanh chóng và bộ chọn cơ sở tương tác cao.
 */
export default function CartDrawer({
  isOpen = false,
  onClose,
  cartItems = [],
  onRemoveItem,
  onCheckoutSuccess,
  onOpenFullCheckout,
}) {
  const [selectedCampus, setSelectedCampus] = useState('CS1');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('08:00 - 11:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const campuses = [
    {
      id: 'CS1',
      code: 'CS1',
      name: 'Cơ sở 1 (Trụ sở chính)',
      address: 'Số 2 Võ Oanh, P.25, Bình Thạnh',
      badge: 'Quầy trung tâm',
      hours: '07:30 – 20:30',
    },
    {
      id: 'CS2',
      code: 'CS2',
      name: 'Cơ sở 2 (Kỹ thuật)',
      address: 'Số 10 Đường 12, P. An Khánh, TP. Thủ Đức',
      badge: 'Khuôn viên xanh',
      hours: '07:30 – 17:00',
    },
    {
      id: 'CS3',
      code: 'CS3',
      name: 'Cơ sở 3 (CNTT & Kinh tế)',
      address: 'Số 70 Tô Ký, P. Trung Mỹ Tây, Quận 12',
      badge: 'Phòng đọc số',
      hours: '07:30 – 17:00',
    },
  ];

  const timeSlots = [
    { id: 'morning', label: 'Buổi Sáng', time: '08:00 - 11:30', desc: 'Thủ thư soạn từ 07:30' },
    { id: 'afternoon', label: 'Buổi Chiều', time: '13:30 - 17:00', desc: 'Lấy trước giờ tan học' },
    { id: 'evening', label: 'Buổi Tối', time: '17:30 - 20:00', desc: 'Chỉ áp dụng CS1' },
  ];

  const maxSlots = 5;
  const currentCount = cartItems.length;
  const isFull = currentCount >= maxSlots;

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const orderCode = `DH-UTH-2026-${Math.floor(100 + Math.random() * 900)}`;
      const campusObj = campuses.find((c) => c.id === selectedCampus);

      const newOrder = {
        code: orderCode,
        pickupDate: `${pickupDate} (${pickupTime})`,
        dueDate: '14 ngày kể từ khi nhận sách tại quầy',
        campus: `${campusObj?.name} - ${campusObj?.address}`,
        books: cartItems,
        status: 'READY_FOR_PICKUP',
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };

      setIsSubmitting(false);
      if (onCheckoutSuccess) {
        onCheckoutSuccess(newOrder);
      }
      if (onClose) {
        onClose();
      }
    }, 500);
  };

  const selectedCampusObj = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Lớp mờ nền (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Khung Drawer chính */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-[0_0_50px_rgba(0,40,45,0.35)] flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-teal-900/30">
        
        {/* ================= HEADER ĐẲNG CẤP VỚI UTH DEEP TEAL ================= */}
        <div className="bg-gradient-to-br from-[#002b2e] via-[#00474b] to-[#00383b] text-white p-6 relative overflow-hidden shadow-lg border-b border-teal-600/40">
          {/* Họa tiết quầng sáng học thuật */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-md font-black shrink-0 ring-4 ring-white/10">
                <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-200 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/10">
                    Pick & Go · UTH Library
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <Zap className="w-3 h-3 fill-amber-300" />
                    <span>Nhận nhanh tại quầy</span>
                  </span>
                </div>
                <h2 className="text-xl font-black font-heading tracking-tight text-white mt-1">
                  Giỏ Mượn Giáo Trình
                </h2>
                <p className="text-xs text-teal-100/90 mt-0.5">
                  Thủ thư gom sẵn trước giờ hẹn · Quét QR nhận tức thì
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer border border-white/10"
              title="Đóng giỏ sách"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* THANH ĐO HẠN MỨC 5 CUỐN (SLOT ALLOCATION METER - BR01) */}
          <div className="mt-5 pt-4 border-t border-white/15 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-teal-100 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Hạn mức mượn đồng thời (BR01):</span>
              </span>
              <span className="font-mono text-xs">
                <strong className="text-amber-300 text-sm">{currentCount}</strong>
                <span className="text-teal-200/80"> / {maxSlots} cuốn</span>
              </span>
            </div>

            {/* 5 Ô Slot Trực quan */}
            <div className="grid grid-cols-5 gap-2">
              {[...Array(maxSlots)].map((_, i) => {
                const isFilled = i < currentCount;
                const bookInSlot = cartItems[i];
                return (
                  <div
                    key={i}
                    className={`h-9 rounded-xl border flex items-center justify-center text-[11px] font-bold transition-all relative overflow-hidden ${
                      isFilled
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                        : 'bg-white/10 text-teal-200/60 border-dashed border-white/25'
                    }`}
                    title={bookInSlot ? bookInSlot.title : `Slot ${i + 1}: Còn trống`}
                  >
                    {isFilled ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="font-mono">#{i + 1}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono opacity-60">+{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {isFull && (
              <p className="text-[11px] text-amber-200 font-semibold mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Đã đạt tối đa 5 cuốn theo quy định thư viện UTH.</span>
              </p>
            )}
          </div>
        </div>

        {/* ================= THÂN DRAWER: CUỘN NỘI DUNG ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/60">

          {/* 1. DANH SÁCH TÀI LIỆU TRONG GIỎ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00666B]" />
                <span>Tài liệu đã chọn ({currentCount})</span>
              </h3>
              {currentCount > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Tồn kho khả dụng 100%
                </span>
              )}
            </div>

            {currentCount === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-2xs space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-[#00666B] flex items-center justify-center mx-auto shadow-xs">
                  <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Giỏ mượn đang trống</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Khám phá kho giáo trình UTH và thêm tài liệu vào giỏ để hẹn lấy nhanh tại quầy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((book, index) => (
                  <div
                    key={book.id || index}
                    className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#00666B]/50 hover:shadow-md transition-all flex items-start gap-3.5 group relative"
                  >
                    {/* Bìa sách 3D mô phỏng vật lý chân thực */}
                    <div
                      style={{ backgroundColor: book.coverTheme?.bg || '#0f4c81' }}
                      className="w-14 h-20 rounded-r-lg rounded-l-xs shadow-md flex flex-col justify-between p-1.5 text-white shrink-0 relative overflow-hidden group-hover:scale-102 transition-transform"
                    >
                      {/* Gáy sách dập nổi */}
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/25 rounded-l-xs border-r border-white/10" />
                      
                      <div className="text-center pl-1.5 pr-0.5">
                        <span className="text-[7px] font-black tracking-widest text-white/80 block">
                          UTH
                        </span>
                      </div>

                      <div className="text-center px-1 my-auto">
                        <h5 className="text-[8px] font-black uppercase tracking-tight leading-tight line-clamp-3 text-white drop-shadow-xs">
                          {book.title}
                        </h5>
                      </div>

                      <div className="text-center pt-0.5 border-t border-white/20 pl-1.5">
                        <span className="text-[6px] font-mono text-white/80 block">
                          {book.publishYear || '2024'}
                        </span>
                      </div>
                    </div>

                    {/* Thông tin tài liệu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-teal-800 bg-[#e0eff0] px-2 py-0.5 rounded uppercase tracking-wider">
                          {book.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {book.code || `UTH-BK-${book.id}`}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {book.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-0.5">
                        Tác giả: <strong className="text-slate-800 font-semibold">{book.author}</strong>
                      </p>

                      <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kho còn {book.availableQuantity ?? 4} cuốn</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium">
                          Mượn: <strong className="text-slate-700">14 ngày</strong>
                        </span>
                      </div>
                    </div>

                    {/* Nút xóa khỏi giỏ */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem && onRemoveItem(book.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0 border border-transparent hover:border-rose-200"
                      title="Xóa tài liệu khỏi giỏ mượn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. CHỌN CƠ SỞ NHẬN SÁCH (3 CARD TƯƠNG TÁC XÚC GIÁC) */}
          {currentCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00666B]" />
                  <span>Chọn Cơ Sở Nhận Tài Liệu</span>
                </h3>
                <span className="text-[11px] text-teal-800 font-semibold">Liên thông 3 cơ sở</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {campuses.map((campus) => {
                  const isSelected = selectedCampus === campus.id;
                  return (
                    <div
                      key={campus.id}
                      onClick={() => setSelectedCampus(campus.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#e6f4f1] to-white border-[#00666B] ring-2 ring-[#00666B]/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs font-mono shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#00666B] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {campus.code}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {campus.name}
                            </h4>
                            <span className="text-[9px] font-bold px-2 py-0.2 bg-teal-50 text-teal-800 rounded border border-teal-200/60 shrink-0">
                              {campus.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {campus.address}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 block">
                          {campus.hours}
                        </span>
                        <div className="flex justify-end mt-1">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#00666B] bg-[#00666B] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. LÊN LỊCH HẸN NHẬN SÁCH & KHUNG GIỜ PICK & GO */}
          {currentCount > 0 && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00666B]" />
                  <span>Thời Gian Hẹn Lấy Sách Tại Quầy</span>
                </h3>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Giữ tối đa 48h (BR05)
                </span>
              </div>

              {/* Ngày hẹn lấy */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00666B]" />
                  <span>Ngày hẹn nhận sách:</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#00666B] focus:ring-2 focus:ring-[#00666B]/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold cursor-pointer transition-all"
                />
              </div>

              {/* Chọn Ca / Khung giờ tiếp nhận */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00666B]" />
                  <span>Khung giờ tiếp nhận tại quầy:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = pickupTime === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPickupTime(slot.time)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00666B] text-white border-[#00666B] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">{slot.label}</span>
                        <span
                          className={`block text-[10px] font-mono mt-0.5 ${
                            isSelected ? 'text-teal-100' : 'text-slate-500'
                          }`}
                        >
                          {slot.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cam kết tiêu chuẩn chất lượng Pick & Go UTH */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50/60 rounded-xl border border-teal-200/80 text-xs text-teal-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#00666B]">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>Cam kết chuẩn vận hành Thư viện UTH</span>
                </div>
                <p className="text-[11px] text-teal-900/90 leading-relaxed">
                  • <strong>Bàn giao nhanh chóng:</strong> Thủ thư gom sẵn tài liệu vào khay chờ trước giờ bạn tới.
                </p>
                <p className="text-[11px] text-teal-900/90 leading-relaxed">
                  • <strong>Thời hạn mượn:</strong> 14 ngày (gia hạn trực tuyến 1 lần +7 ngày trên hệ thống).
                </p>
                <p className="text-[11px] text-teal-900/90 leading-relaxed">
                  • <strong>Bảo lưu đơn:</strong> Hệ thống tự động hủy và phục hồi kho nếu sau 48h không đến lấy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER DRAWER: CTA HÀNH ĐỘNG MẠNH MẼ ================= */}
        {currentCount > 0 && (
          <div className="p-5 sm:p-6 bg-white border-t border-slate-200 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] space-y-3.5">
            {/* Tóm tắt nhanh thông số */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Điểm nhận:</span>
                <strong className="text-slate-900 font-bold block truncate max-w-[240px]">
                  {selectedCampusObj.name}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Số lượng mượn:</span>
                <span className="text-base font-black text-[#00666B] font-mono">
                  {currentCount} <span className="text-xs font-bold text-slate-500">cuốn</span>
                </span>
              </div>
            </div>

            {/* Nút bấm Bolder hành động quyết định */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full py-4 px-5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 ring-2 ring-amber-400/30 group"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang khởi tạo đơn mượn & mã QR...</span>
                </span>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="tracking-tight">
                    XÁC NHẬN HẸN LẤY & TẠO MÃ QR NHẬN SÁCH
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Tùy chọn chuyển sang trang toàn màn hình CheckoutSchedulePage (Desktop) */}
            {onOpenFullCheckout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullCheckout();
                }}
                className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100/80 text-[#00666B] text-xs font-bold rounded-xl border border-teal-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Mở trang đối soát &amp; lên lịch chi tiết (Desktop)</span>
              </button>
            )}

            <p className="text-[10px] text-center text-slate-500">
              Miễn phí mượn dành riêng cho sinh viên chính quy UTH · Quét QR tại quầy tiếp nhận
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
