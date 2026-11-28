import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  ShoppingBag,
  Check,
  Plus,
  RotateCcw,
  ChevronDown,
  Loader2,
  Compass,
} from 'lucide-react';
import borrowApi from '../../services/borrowApi';

const CAMPUSES = [
  {
    id: 'CS1',
    code: 'CS1',
    shortName: 'Bình Thạnh',
    name: 'Cơ sở 1 · Bình Thạnh',
    address: 'Số 2 Võ Oanh, P.25, Q. Bình Thạnh',
    hours: '07:30 – 20:30',
  },
  {
    id: 'CS2',
    code: 'CS2',
    shortName: 'TP. Thủ Đức',
    name: 'Cơ sở 2 · TP. Thủ Đức',
    address: 'Số 10 Đường 12, P. An Khánh, TP. Thủ Đức',
    hours: '07:30 – 17:00',
  },
  {
    id: 'CS3',
    code: 'CS3',
    shortName: 'Quận 12',
    name: 'Cơ sở 3 · Quận 12',
    address: 'Số 70 Tô Ký, P. Trung Mỹ Tây, Quận 12',
    hours: '07:30 – 17:00',
  },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Buổi Sáng', short: 'Sáng', time: '08:00 – 11:30' },
  { id: 'afternoon', label: 'Buổi Chiều', short: 'Chiều', time: '13:30 – 17:00' },
  { id: 'evening', label: 'Buổi Tối', short: 'Tối (CS1)', time: '17:30 – 20:00' },
];

const COVER_BG_CLASSES = [
  'bg-[#00595e]',
  'bg-[#0f4c81]',
  'bg-[#065f46]',
  'bg-[#1e3a8a]',
  'bg-[#4c1d95]',
  'bg-[#7c2d12]',
];

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function buildQuickDates() {
  const list = [];
  const base = new Date();
  for (let offset = 0; offset < 5; offset += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + offset);
    const iso = d.toISOString().split('T')[0];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    let dayLabel = WEEKDAY_SHORT[d.getDay()];
    if (offset === 0) dayLabel = 'Hôm nay';
    if (offset === 1) dayLabel = 'Ngày mai';
    list.push({
      iso,
      dayLabel,
      dateLabel: `${dd}/${mm}`,
    });
  }
  return list;
}

function formatShortViDate(isoStr) {
  if (!isoStr) return '';
  const parts = String(isoStr).split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * CartDrawerMobile - Giỏ mượn giáo trình dạng Bottom Sheet 2 bước chuyên biệt cho Điện thoại (TV2)
 * - Giải phóng diện tích màn hình nhỏ: Bước 1 (Quản lý sách + Hoàn tác xóa + Gợi ý mượn kèm) & Bước 2 (Chọn Cơ sở + Chip ngày nhanh + Ca nhận)
 * - 100% Tailwind v3.4 thuần, không dùng inline style, không đụng chạm CartDrawer.jsx của Desktop (TV3)
 */
export default function CartDrawerMobile({
  isOpen = false,
  onClose,
  cartItems = [],
  onRemoveItem,
  onAddItem,
  onClearCart,
  onCheckoutSuccess,
  onOpenSchedulePage,
  onBrowseCatalog,
  onSelectBook,
  allBooks = [],
}) {
  const [activeStep, setActiveStep] = useState('books'); // 'books' | 'schedule'
  const [selectedCampus, setSelectedCampus] = useState('CS1');
  const [quickDates] = useState(() => buildQuickDates());
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('08:00 – 11:30');
  const [showRules, setShowRules] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [lastRemovedBook, setLastRemovedBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const undoTimerRef = useRef(null);
  const orderSeqRef = useRef(101);

  const [minDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [maxDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Khóa cuộn nền & hỗ trợ phím Escape khi mở Bottom Sheet trên điện thoại
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const maxSlots = 5;
  const currentCount = cartItems.length;
  const remainingSlots = Math.max(0, maxSlots - currentCount);
  // Khi giỏ trống luôn hiển thị khung Bước 1 (trạng thái giỏ rỗng + gợi ý sách)
  const effectiveStep = currentCount === 0 ? 'books' : activeStep;

  const selectedCampusObj = CAMPUSES.find((c) => c.id === selectedCampus) || CAMPUSES[0];

  // Lọc 3 cuốn giáo trình còn sẵn chưa nằm trong giỏ để gợi ý mượn kèm nhanh
  const suggestedBooks = Array.isArray(allBooks)
    ? allBooks
        .filter(
          (b) =>
            b &&
            (b.availableQuantity ?? 1) > 0 &&
            !cartItems.some((item) => item.id === b.id)
        )
        .slice(0, 3)
    : [];

  const handleSelectCampus = (campusId) => {
    setSelectedCampus(campusId);
    if (campusId !== 'CS1' && pickupTime === '17:30 – 20:00') {
      setPickupTime('08:00 – 11:30');
    }
  };

  const handleRemoveWithUndo = (book) => {
    if (!book || !onRemoveItem) return;
    onRemoveItem(book.id);
    setLastRemovedBook(book);
    setConfirmClear(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = setTimeout(() => {
      setLastRemovedBook(null);
    }, 4500);
  };

  const handleUndoRemove = () => {
    if (lastRemovedBook && onAddItem && currentCount < maxSlots) {
      onAddItem(lastRemovedBook);
      setLastRemovedBook(null);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    }
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    if (onClearCart) {
      onClearCart();
    } else if (onRemoveItem) {
      cartItems.forEach((b) => onRemoveItem(b.id));
    }
    setConfirmClear(false);
    setLastRemovedBook(null);
    setActiveStep('books');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (currentCount === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const eligibility = await borrowApi.checkStudentBorrowEligibility({
        addingCount: currentCount,
      });
      if (!eligibility.eligible && eligibility.reason) {
        setErrorMsg(eligibility.reason);
        setIsSubmitting(false);
        return;
      }

      const res = await borrowApi.createBorrowOrder({
        bookIds: cartItems.map((b) => Number(b.id || b.bookId)),
        pickupDate,
        note: `${selectedCampusObj.name} (${pickupTime})`,
      });

      orderSeqRef.current += 1;
      const orderCode = res?.orderCode || `DH-UTH-2026-${orderSeqRef.current}`;
      const newOrder = {
        code: orderCode,
        orderCode,
        orderId: res?.orderId,
        pickupDate: `${pickupDate} (${pickupTime})`,
        dueDate: '14 ngày kể từ khi nhận sách tại quầy',
        campus: `${selectedCampusObj.name} - ${selectedCampusObj.address}`,
        books: cartItems,
        status: res?.status || 'READY_FOR_PICKUP',
        qrCodeBase64: res?.qrCodeBase64 || null,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };

      setIsSubmitting(false);
      setActiveStep('books');
      if (onCheckoutSuccess) {
        onCheckoutSuccess(newOrder);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Không thể tạo đơn mượn sách. Vui lòng thử lại!');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Giỏ mượn giáo trình di động"
      className="fixed inset-0 z-50 flex flex-col justify-end select-none"
    >
      {/* Lớp nền mờ toàn màn hình */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* KHUNG BOTTOM SHEET TỐI ƯU NGÓN CÁI TRÊN ĐIỆN THOẠI */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t border-teal-500/30">
        {/* ================= 1. HEADER GỌN GÀNG UTH TEAL ================= */}
        <div className="bg-gradient-to-r from-[#00383b] via-[#005559] to-[#00666b] text-white px-4 pt-2.5 pb-3.5 shrink-0 relative overflow-hidden">
          {/* Thanh nắm kéo đặc trưng Mobile Sheet */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Thu gọn giỏ mượn"
            className="w-10 h-1 rounded-full bg-white/30 hover:bg-white/50 mx-auto mb-2.5 block cursor-pointer"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm shrink-0">
                <ShoppingBag className="w-[18px] h-[18px] stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black font-heading tracking-tight text-white truncate">
                    Giỏ Mượn Giáo Trình
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold text-amber-300 tabular-nums shrink-0">
                    {currentCount}/{maxSlots}
                  </span>
                </div>
                <p className="text-[11px] text-teal-100/90 truncate">
                  {currentCount === 0
                    ? 'Tối đa 5 cuốn/đợt · Miễn phí cho sinh viên UTH'
                    : remainingSlots > 0
                    ? `Còn thêm được ${remainingSlots} cuốn · Giữ đơn 48h tại quầy`
                    : 'Đã đạt hạn mức tối đa 5 cuốn (Quy định BR01)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {currentCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  onBlur={() => setConfirmClear(false)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                    confirmClear
                      ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-teal-100 border-white/15'
                  }`}
                >
                  {confirmClear ? 'Xác nhận xóa?' : 'Xóa hết'}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng giỏ sách"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thanh 5 vạch hạn mức BR01 siêu gọn (tiết kiệm 70px chiều cao so với bản PC) */}
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx < currentCount ? 'bg-amber-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= 2. THANH CHUYỂN BƯỚC (STEPPER TABS) ================= */}
        {currentCount > 0 && (
          <div className="px-4 py-2 bg-[#f4f8f7] border-b border-slate-200/80 shrink-0">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveStep('books');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveStep === 'books'
                    ? 'bg-[#00666b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center tabular-nums ${
                    effectiveStep === 'books'
                      ? 'bg-white text-[#00666b]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  1
                </span>
                <span>Sách đã chọn ({currentCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStep('schedule');
                  setConfirmClear(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  effectiveStep === 'schedule'
                    ? 'bg-[#00666b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center tabular-nums ${
                    effectiveStep === 'schedule'
                      ? 'bg-white text-[#00666b]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  2
                </span>
                <span>Hẹn nhận ({selectedCampus})</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. VÙNG CUỘN NỘI DUNG RỘNG RÃI ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 bg-[#f8faf9]">
          {/* Thanh hoàn tác nhanh nếu lỡ tay bấm xóa trên điện thoại */}
          {lastRemovedBook && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs shadow-md">
              <span className="truncate text-slate-200">
                Đã xóa <strong className="text-white">{lastRemovedBook.title}</strong>
              </span>
              {currentCount < maxSlots && onAddItem && (
                <button
                  type="button"
                  onClick={handleUndoRemove}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-[11px] shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hoàn tác</span>
                </button>
              )}
            </div>
          )}

          {/* TRẠNG THÁI GIỎ TRỐNG */}
          {currentCount === 0 ? (
            <div className="space-y-4 py-3">
              <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-[#00666b] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">Giỏ mượn đang trống</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Chọn tối đa 5 cuốn giáo trình để đặt lịch nhận nhanh Pick &amp; Go tại quầy thư viện UTH.
                  </p>
                </div>
                {onBrowseCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      onBrowseCatalog();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00666b] hover:bg-[#005458] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Khám phá kho giáo trình</span>
                  </button>
                )}
              </div>

              {/* Gợi ý thêm nhanh ngay khi giỏ trống */}
              {suggestedBooks.length > 0 && onAddItem && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block px-0.5">
                    Giáo trình phổ biến sẵn có tại quầy
                  </span>
                  <div className="space-y-2">
                    {suggestedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{book.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {book.author} · Còn {book.availableQuantity ?? 4} bản
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddItem(book)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-[#00666b] text-[#00666b] hover:text-white border border-teal-200 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : effectiveStep === 'books' ? (
            /* ================= BƯỚC 1: DANH SÁCH SÁCH TRONG GIỎ ================= */
            <div className="space-y-3">
              <div className="space-y-2.5">
                {cartItems.map((book, index) => {
                  const coverClass =
                    COVER_BG_CLASSES[Number(book.id || index) % COVER_BG_CLASSES.length];
                  return (
                    <div
                      key={book.id || index}
                      className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3"
                    >
                      {/* Bìa thu nhỏ gọn đẹp không dùng inline style */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectBook) {
                            if (onClose) onClose();
                            onSelectBook(book);
                          }
                        }}
                        className={`w-12 h-16 rounded-lg ${coverClass} text-white p-1.5 flex flex-col justify-between shrink-0 shadow-xs relative overflow-hidden text-left cursor-pointer`}
                        title="Xem chi tiết sách"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-black/25" />
                        <span className="text-[7px] font-extrabold uppercase tracking-wider text-white/80 pl-1">
                          UTH
                        </span>
                        <span className="text-[8px] font-bold leading-tight line-clamp-2 pl-1">
                          {book.title}
                        </span>
                      </button>

                      {/* Thông tin sách */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-extrabold text-[#00666b] bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded uppercase truncate max-w-[130px]">
                            {book.category || 'Giáo trình'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {book.code || `UTH-${book.id}`}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {book.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="truncate max-w-[140px]">{book.author}</span>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold shrink-0 inline-flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Còn {book.availableQuantity ?? 4}</span>
                          </span>
                        </div>
                      </div>

                      {/* Nút xóa vùng chạm 36x36px chuẩn ngón tay */}
                      <button
                        type="button"
                        onClick={() => handleRemoveWithUndo(book)}
                        aria-label={`Xóa ${book.title} khỏi giỏ`}
                        className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/70 hover:border-rose-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Nút chọn thêm tài liệu khi chưa chạm trần 5 cuốn */}
              {remainingSlots > 0 && onBrowseCatalog && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    onBrowseCatalog();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 bg-teal-50/40 hover:bg-teal-50 text-[#00666b] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Chọn thêm sách khác (còn {remainingSlots} suất mượn)</span>
                </button>
              )}

              {/* Dải gợi ý mượn kèm ngang 1 chạm */}
              {remainingSlots > 0 && suggestedBooks.length > 0 && onAddItem && (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Gợi ý mượn kèm nhanh
                    </span>
                    <span className="text-[10px] text-slate-400">Vuốt ngang</span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {suggestedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="min-w-[210px] max-w-[220px] p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between gap-2 shrink-0"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {book.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {book.author}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-semibold text-emerald-700">
                            Còn {book.availableQuantity ?? 4} bản
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddItem(book)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-[#00666b] text-[#00666b] hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= BƯỚC 2: CHỌN ĐIỂM & GIỜ HẸN NHẬN PICK & GO ================= */
            <div className="space-y-3.5">
              {/* 2.1. Chọn Cơ sở dạng 3 Tab ngang gọn + 1 thẻ địa chỉ chi tiết */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00666b]" />
                    <span>Cơ sở nhận tài liệu</span>
                  </span>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    Liên thông 3 cơ sở
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {CAMPUSES.map((c) => {
                    const isSelected = selectedCampus === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCampus(c.id)}
                        className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00666b] text-white border-[#00666b] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="block text-xs font-black font-mono">{c.code}</span>
                        <span
                          className={`block text-[10px] truncate mt-0.5 ${
                            isSelected ? 'text-teal-100 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {c.shortName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#f4f8f7] border border-teal-100 text-[11px]">
                  <span className="text-slate-700 font-medium truncate">
                    {selectedCampusObj.address}
                  </span>
                  <span className="font-mono font-bold text-[#00666b] shrink-0">
                    {selectedCampusObj.hours}
                  </span>
                </div>
              </div>

              {/* 2.2. Chọn Ngày nhận sách bằng Chip 1 chạm + Lịch tùy chọn */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#00666b]" />
                    <span>Ngày hẹn đến quầy</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Giữ đơn 48h (BR05)
                  </span>
                </div>

                {/* Dải 5 ngày tiếp theo bấm chọn 1 chạm */}
                <div className="grid grid-cols-5 gap-1.5">
                  {quickDates.map((d) => {
                    const isSelected = pickupDate === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setPickupDate(d.iso)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00666b] text-white border-[#00666b] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className={`block text-[10px] font-bold truncate ${
                            isSelected ? 'text-teal-100' : 'text-slate-500'
                          }`}
                        >
                          {d.dayLabel}
                        </span>
                        <span className="block text-xs font-black font-mono mt-0.5 tabular-nums">
                          {d.dateLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Ô chọn ngày cụ thể nếu muốn đổi ngoài 5 chip */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <label htmlFor="mobileCartPickupDate" className="text-[11px] font-semibold text-slate-500">
                    Hoặc chọn ngày khác:
                  </label>
                  <input
                    id="mobileCartPickupDate"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#00666b] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 cursor-pointer focus:outline-none"
                  />
                </div>
              </div>

              {/* 2.3. Chọn Khung giờ tiếp nhận */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00666b]" />
                  <span>Khung giờ nhận sách</span>
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = pickupTime === slot.time;
                    const isDisabled = slot.id === 'evening' && selectedCampus !== 'CS1';
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setPickupTime(slot.time)}
                        className={`py-2 px-2 rounded-xl border text-center transition-all ${
                          isDisabled
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#00666b] text-white border-[#00666b] shadow-xs cursor-pointer'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">{slot.short}</span>
                        <span
                          className={`block text-[10px] font-mono mt-0.5 tabular-nums ${
                            isDisabled
                              ? 'text-slate-300'
                              : isSelected
                              ? 'text-teal-100'
                              : 'text-slate-500'
                          }`}
                        >
                          {slot.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2.4. Quy định tóm tắt dạng Accordion thu gọn (không chiếm chỗ cố định) */}
              <div className="rounded-2xl bg-teal-50/70 border border-teal-200/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowRules((prev) => !prev)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left text-xs font-bold text-[#00666b] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    <span>Quyền lợi Pick &amp; Go: Mượn 14 ngày · Gia hạn 2 lần</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      showRules ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {showRules && (
                  <div className="px-3.5 pb-3 pt-1 text-[11px] text-teal-950/90 space-y-1 border-t border-teal-200/50">
                    <p>• Thủ thư soạn sẵn sách vào khay chờ trước khung giờ hẹn.</p>
                    <p>• Thời hạn mượn tiêu chuẩn 14 ngày, gia hạn online tối đa 2 lần (+7 ngày/lần).</p>
                    <p>• Đơn tự động hủy để hoàn kho nếu quá 48h không đến nhận (BR05).</p>
                  </div>
                )}
              </div>

              {/* Tùy chọn mở trang đặt lịch đầy đủ nếu sinh viên cần ghi chú chi tiết */}
              {onOpenSchedulePage && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    onOpenSchedulePage(cartItems);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-600 hover:text-[#00666b] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#00666b]" />
                  <span>Mở biểu mẫu đặt lịch &amp; ghi chú toàn màn hình</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================= 4. STICKY FOOTER GỌN TRONG TẦM NGÓN CÁI ================= */}
        {currentCount > 0 && (
          <div className="px-4 pt-3 pb-4 bg-white border-t border-slate-200 shadow-lg shrink-0 space-y-2.5">
            {errorMsg && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium leading-snug">{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  aria-label="Đóng lỗi"
                  className="text-rose-400 hover:text-rose-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {effectiveStep === 'books' ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-[11px] text-slate-500 font-medium">
                    Tổng cộng ({currentCount}/{maxSlots} cuốn)
                  </span>
                  <span className="block text-xs font-extrabold text-slate-900 truncate">
                    Mượn 14 ngày · <span className="text-emerald-600">Miễn phí</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep('schedule')}
                  className="px-5 h-11 rounded-xl bg-[#00666b] hover:bg-[#005458] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <span>Chọn điểm &amp; giờ nhận</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Tóm tắt 1 dòng cực gọn trước khi chốt */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 px-0.5">
                  <span className="font-semibold text-slate-800 truncate">
                    {selectedCampusObj.name} · {formatShortViDate(pickupDate)} ({pickupTime})
                  </span>
                  <strong className="text-[#00666b] font-extrabold shrink-0 tabular-nums">
                    {currentCount} cuốn
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep('books')}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Sách</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCheckout}
                    className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo mã QR...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.8]" />
                        <span>Xác nhận &amp; Tạo mã QR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
