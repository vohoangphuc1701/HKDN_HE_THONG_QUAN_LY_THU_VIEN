import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Zap,
  ShieldCheck,
  Info,
  X,
  QrCode,
} from 'lucide-react';

/**
 * CheckoutSchedulePage – Trang lên lịch hẹn nhận / trả sách (TV2 · Mobile Web)
 * Mục đích: Sinh viên chọn ngày hẹn nhận sách (Pick & Go) hoặc hẹn trả sớm.
 * Phạm vi: 375px – 1023px · Không chỉnh sửa code Desktop TV3 / Admin TV6 / Backend TV4-5.
 * Quy tắc nghiệp vụ:
 *   BR01 – Tối đa 5 cuốn / lần mượn.
 *   BR02 – Thời hạn mượn 14 ngày kể từ khi nhận tại quầy.
 *   BR05 – Hệ thống tự động hủy đơn và phục hồi kho sau 48h không đến lấy.
 */

/* ─── Hằng số cơ sở ─────────────────────────────────────────── */
const CAMPUSES = [
  {
    id: 'CS1',
    code: 'CS1',
    name: 'Cơ sở 1 – Trụ sở chính',
    address: 'Số 2 Võ Oanh, P.25, Bình Thạnh',
    badge: 'Quầy trung tâm',
    hours: '07:30 – 20:30',
    colorClass: 'bg-teal-600',
  },
  {
    id: 'CS2',
    code: 'CS2',
    name: 'Cơ sở 2 – Kỹ thuật',
    address: 'Số 10 Đường 12, P. An Khánh, TP. Thủ Đức',
    badge: 'Khuôn viên xanh',
    hours: '07:30 – 17:00',
    colorClass: 'bg-blue-600',
  },
  {
    id: 'CS3',
    code: 'CS3',
    name: 'Cơ sở 3 – CNTT & Kinh tế',
    address: 'Số 70 Tô Ký, P. Trung Mỹ Tây, Quận 12',
    badge: 'Phòng đọc số',
    hours: '07:30 – 17:00',
    colorClass: 'bg-purple-600',
  },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Buổi Sáng', time: '08:00 – 11:30', desc: 'Thủ thư soạn từ 07:30' },
  { id: 'afternoon', label: 'Buổi Chiều', time: '13:30 – 17:00', desc: 'Lấy trước giờ tan học' },
  { id: 'evening', label: 'Buổi Tối', time: '17:30 – 20:00', desc: 'Chỉ áp dụng CS1' },
];

/* Lấy ngày tối thiểu hợp lệ (ngày mai) dạng yyyy-mm-dd */
function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/* Lấy ngày tối đa hợp lệ (ngày mai + 1 ngày = trong 48h = BR05) */
function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

/* Định dạng ngày yyyy-mm-dd → dd/mm/yyyy */
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, day] = iso.split('-');
  return `${day}/${m}/${y}`;
}

/* ─── Component chính ───────────────────────────────────────── */
export default function CheckoutSchedulePage({
  cartItems = [],
  mode = 'pickup', // 'pickup' | 'return'
  onBack,
  onConfirm,
  onShowToast,
}) {
  /* ── State lịch hẹn ── */
  const [selectedCampus, setSelectedCampus] = useState('CS1');
  const [pickupDate, setPickupDate] = useState(getTomorrow());
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0].id);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const campusObj = useMemo(
    () => CAMPUSES.find((c) => c.id === selectedCampus) || CAMPUSES[0],
    [selectedCampus]
  );
  const slotObj = useMemo(
    () => TIME_SLOTS.find((s) => s.id === selectedSlot) || TIME_SLOTS[0],
    [selectedSlot]
  );

  const isReturn = mode === 'return';
  const pageTitle = isReturn ? 'Đặt lịch hẹn trả sách' : 'Lên lịch hẹn nhận sách';
  const ctaLabel = isReturn ? 'XÁC NHẬN HẸN TRẢ & TẠO MÃ QR' : 'XÁC NHẬN HẸN LẤY & TẠO MÃ QR';

  const bookCount = cartItems.length;
  const isValid = bookCount > 0 && pickupDate;

  /* ── Xử lý xác nhận ── */
  const handleConfirm = () => {
    if (!isValid) {
      if (onShowToast) onShowToast('Vui lòng chọn ngày và khung giờ hợp lệ!');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const prefix = isReturn ? 'PT' : 'DH';
      const code = `${prefix}-UTH-2026-${Math.floor(100 + Math.random() * 900)}`;
      const order = {
        code,
        campus: `${campusObj.name} – ${campusObj.address}`,
        pickupDate: `${formatDate(pickupDate)} (${slotObj.time})`,
        dueDate: isReturn ? '' : '14 ngày kể từ khi nhận sách tại quầy',
        books: cartItems,
        status: isReturn ? 'PENDING_VERIFICATION' : 'READY_FOR_PICKUP',
        note: note || (isReturn
          ? 'Quét mã tại quầy tiếp nhận để hoàn tất trả sách trong 30 giây.'
          : 'Xuất trình mã QR tại quầy Pick & Go để nhận sách.'),
      };
      setIsSubmitting(false);
      setConfirmedOrder(order);
      if (onConfirm) onConfirm(order);
      if (onShowToast) onShowToast(`Đã tạo ${isReturn ? 'phiếu hẹn trả' : 'đơn mượn'}: ${code}`);
    }, 600);
  };

  /* ── Màn hình xác nhận thành công ── */
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f4f8f7] flex flex-col select-none">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold leading-tight">Đặt lịch thành công!</h1>
            <p className="text-[10px] text-teal-100/80">Thư viện UTH · Pick & Go</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-5 space-y-5">
          {/* Badge thành công */}
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-slate-900">
              {isReturn ? 'Phiếu hẹn trả đã tạo!' : 'Đơn mượn đã được xác nhận!'}
            </h2>
            <p className="text-xs text-slate-500">
              {isReturn
                ? 'Mang theo mã QR khi đến trả sách tại quầy.'
                : 'Thủ thư sẽ gom sách trước giờ bạn đến. Xuất trình mã QR tại quầy.'}
            </p>
          </div>

          {/* Card thông tin đơn */}
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header card */}
            <div className="bg-gradient-to-r from-[#00383b] to-[#00666b] text-white px-4 py-3 flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-teal-200 shrink-0" />
              <div>
                <p className="text-[10px] text-teal-100">Mã đơn</p>
                <p className="text-sm font-black font-mono">{confirmedOrder.code}</p>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Điểm hẹn */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00666b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-400">{isReturn ? 'Điểm trả sách' : 'Điểm nhận sách'}</p>
                  <p className="font-bold text-slate-800 leading-snug">{confirmedOrder.campus}</p>
                </div>
              </div>
              {/* Thời gian */}
              <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-100">
                <Clock className="w-4 h-4 text-[#00666b] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-400">Thời gian hẹn</p>
                  <p className="font-bold text-slate-800">{confirmedOrder.pickupDate}</p>
                </div>
              </div>
              {/* Danh sách sách */}
              <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-100">
                <BookOpen className="w-4 h-4 text-[#00666b] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400">Tài liệu ({confirmedOrder.books.length})</p>
                  <ul className="mt-1 space-y-0.5">
                    {confirmedOrder.books.map((b, idx) => (
                      <li key={b.id || idx} className="font-semibold text-slate-800 truncate">
                        • {b.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Lưu ý */}
              {confirmedOrder.note && (
                <div className="pt-2.5 border-t border-slate-100">
                  <p className="text-[11px] text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 leading-relaxed">
                    💡 {confirmedOrder.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Nút quay lại */}
          <button
            type="button"
            onClick={onBack}
            className="w-full max-w-sm py-3.5 rounded-2xl bg-[#00666b] hover:bg-[#005458] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>
        </main>
      </div>
    );
  }

  /* ── Màn hình nhập liệu chính ── */
  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col select-none">
      {/* Header sticky */}
      <header className="sticky top-0 z-30 bg-[#00666b] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold leading-tight truncate">{pageTitle}</h1>
          <p className="text-[10px] text-teal-100/80">Thư viện UTH · Pick & Go</p>
        </div>
        {/* Badge BR05 */}
        {!isReturn && (
          <span className="shrink-0 text-[10px] font-bold text-amber-900 bg-amber-300 px-2 py-0.5 rounded-full">
            Giữ 48h (BR05)
          </span>
        )}
      </header>

      {/* Nội dung cuộn */}
      <main className="flex-1 overflow-y-auto p-4 pb-32 space-y-4 max-w-lg mx-auto w-full">

        {/* ── 1. Giỏ sách / sách trả ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#003b3e] to-[#00666b] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-200 shrink-0" />
              <h2 className="text-xs font-bold">
                {isReturn ? 'Sách cần trả' : 'Tài liệu trong đơn'}
              </h2>
            </div>
            {/* Thanh slot BR01 */}
            {!isReturn && (
              <span className="text-[10px] font-mono font-bold text-amber-300">
                {bookCount} / 5 cuốn
              </span>
            )}
          </div>

          {bookCount === 0 ? (
            <div className="p-6 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                {isReturn ? 'Chưa chọn sách nào để trả.' : 'Giỏ sách đang trống.'}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-[#00666b] underline cursor-pointer"
              >
                Quay lại để chọn sách
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cartItems.map((book, idx) => (
                <li key={book.id || idx} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-10 h-12 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-xs"
                    style={{ backgroundColor: book.coverTheme?.bg || '#0f4c81' }}
                  >
                    {(book.code || 'BK').split('-')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                      {book.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {book.author} · <span className="font-mono">{book.code}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── 2. Chọn cơ sở UTH ── */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 px-0.5">
            <MapPin className="w-4 h-4 text-[#00666b]" />
            {isReturn ? 'Chọn điểm trả sách' : 'Chọn điểm nhận sách'}
          </h2>

          <div className="space-y-2">
            {CAMPUSES.map((campus) => {
              const isSelected = selectedCampus === campus.id;
              return (
                <button
                  key={campus.id}
                  type="button"
                  onClick={() => setSelectedCampus(campus.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-[#00666b] ring-2 ring-[#00666b]/15 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Badge cơ sở */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${
                      isSelected ? campus.colorClass : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {campus.code}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {campus.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200/60 rounded shrink-0">
                        {campus.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{campus.address}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00666b]" />
                      {campus.hours}
                    </p>
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[#00666b] bg-[#00666b]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 3. Chọn ngày hẹn ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00666b]" />
              Ngày hẹn {isReturn ? 'trả' : 'nhận'} sách
            </h2>
            {!isReturn && (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Tối đa 48h (BR05)
              </span>
            )}
          </div>

          {/* Datepicker ngày */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00666b]" />
              Ngày hẹn:
            </label>
            <input
              type="date"
              value={pickupDate}
              min={getTomorrow()}
              max={!isReturn ? getMaxDate() : undefined}
              onChange={(e) => setPickupDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#00666b] focus:ring-2 focus:ring-[#00666b]/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold cursor-pointer transition-all"
            />
            {!isReturn && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Info className="w-3 h-3 shrink-0" />
                Chỉ hẹn được trong vòng 48h (BR05). Hủy tự động nếu không đến lấy.
              </p>
            )}
          </div>

          {/* Chọn khung giờ tiếp nhận */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00666b]" />
              Khung giờ tiếp nhận tại quầy:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isActive = selectedSlot === slot.id;
                /* Khung Tối chỉ CS1 */
                const isDisabled = slot.id === 'evening' && selectedCampus !== 'CS1';
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedSlot(slot.id)}
                    className={`min-h-[64px] p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isDisabled
                        ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                        : isActive
                        ? 'bg-[#00666b] text-white border-[#00666b] shadow-xs'
                        : 'bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-tight">{slot.label}</span>
                    <span
                      className={`text-[10px] font-mono mt-0.5 ${
                        isActive ? 'text-teal-100' : isDisabled ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {slot.time}
                    </span>
                    {isDisabled && (
                      <span className="text-[9px] text-slate-400 mt-0.5">CS1 only</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. Ghi chú (tuỳ chọn) ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00666b]" />
            Ghi chú {isReturn ? 'tình trạng sách khi trả' : '(tuỳ chọn)'}
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isReturn
                ? 'Ví dụ: Sách nguyên vẹn, còn đủ phụ lục và bìa bọc...'
                : 'Ví dụ: Sinh viên có thể đến muộn 15 phút, xin thủ thư chờ...'
            }
            className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00666b] focus:bg-white transition-all resize-none"
          />
        </section>

        {/* ── 5. Cam kết UTH ── */}
        <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 p-4 space-y-2 text-xs text-teal-900">
          <div className="flex items-center gap-1.5 font-bold text-[#00666b]">
            <ShieldCheck className="w-4 h-4" />
            Cam kết chuẩn vận hành Thư viện UTH
          </div>
          <ul className="space-y-1 text-[11px] text-teal-900/90 leading-relaxed">
            {!isReturn ? (
              <>
                <li>
                  •{' '}
                  <strong>Bàn giao nhanh:</strong> Thủ thư gom sẵn tài liệu vào khay chờ trước giờ bạn tới.
                </li>
                <li>
                  • <strong>Thời hạn mượn (BR02):</strong> 14 ngày kể từ khi nhận tại quầy.
                </li>
                <li>
                  • <strong>Bảo lưu đơn (BR05):</strong> Hủy tự động & phục hồi kho sau 48h không đến lấy.
                </li>
                <li>
                  • <strong>Gia hạn (BR03):</strong> Tối đa 1 lần (+7 ngày) trực tuyến trên hệ thống.
                </li>
              </>
            ) : (
              <>
                <li>
                  • <strong>Trả nhanh:</strong> Quét mã QR tại quầy, thủ thư xác nhận trong dưới 30 giây.
                </li>
                <li>
                  • <strong>Phí trễ hạn (BR04):</strong> 5.000 VNĐ / ngày / cuốn, tính tự động trên hệ thống.
                </li>
                <li>
                  • <strong>Phong toả (BR06):</strong> Tài khoản bị khoá nếu còn phí chưa thanh toán.
                </li>
              </>
            )}
          </ul>
        </section>
      </main>

      {/* ── Sticky Bottom CTA ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] px-4 py-3 max-w-lg mx-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        {/* Tóm tắt nhanh */}
        {bookCount > 0 && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5 px-0.5">
            <span>
              <strong className="text-slate-800">{campusObj.code}</strong> · {formatDate(pickupDate)} · {slotObj.time}
            </span>
            <span>
              <strong className="text-[#00666b]">{bookCount}</strong> tài liệu
            </span>
          </div>
        )}

        {/* Nút CTA chính */}
        <button
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={handleConfirm}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer active:scale-[0.98] ${
            isValid && !isSubmitting
              ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 ring-2 ring-amber-400/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              <span>Đang tạo lịch hẹn & mã QR...</span>
            </span>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="tracking-tight">{ctaLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Cảnh báo giỏ trống */}
        {bookCount === 0 && (
          <p className="text-[10px] text-center text-rose-500 mt-1.5 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {isReturn ? 'Chưa chọn sách nào để đặt lịch trả.' : 'Giỏ sách đang trống – quay lại chọn sách.'}
          </p>
        )}
      </div>
    </div>
  );
}
