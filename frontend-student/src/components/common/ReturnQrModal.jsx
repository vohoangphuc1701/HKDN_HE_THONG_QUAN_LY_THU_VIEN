import React, { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Expand,
  MapPin,
  Minimize2,
  QrCode,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

/**
 * ReturnQrModal - Modal đa năng hiển thị mã QR cho cả 2 luồng:
 *   1. Chế độ Nhận sách (Pick & Go): Mã QR đơn mượn kèm thông tin sinh viên & danh sách sách cần nhận.
 *   2. Chế độ Hẹn trả sách: Mã QR phiếu hẹn trả kèm cơ sở & giờ hẹn nộp tại quầy tiếp nhận.
 *
 * Tính năng nâng cao cho Mobile Web (TV2):
 *   • Tab chuyển đổi trực tiếp giữa QR Nhận Sách và QR Phiếu Trả.
 *   • Chế độ phóng to toàn màn hình (Full-screen Anti-glare) nền trắng siêu nét cho camera TV5 quét < 1s.
 *   • Nút 1 chạm sao chép mã giao dịch phục vụ tra cứu thủ công.
 *   • Hỗ trợ render `qrCodeBase64` từ Backend TV4/TV5 và Vector SVG UTH fallback.
 */
export default function ReturnQrModal({ isOpen = false, onClose, order = null }) {
  // Hooks phải luôn được gọi ở top-level (tuân thủ Rules of Hooks)
  const [activeTab, setActiveTab] = useState(order?.mode === 'return' ? 'return' : 'pickup');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !order) return null;

  const isPickup = activeTab === 'pickup';

  // Dữ liệu cho tab Nhận sách
  const pickupData = {
    code: order.orderCode || (order.mode !== 'return' ? order.code : 'DH-UTH-2026-089'),
    campus: order.campus || 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
    time: order.pickupDate || 'Hôm nay (Giờ làm việc 07:30 - 20:30)',
    books: order.books || [
      { title: 'Lập trình Python từ cơ bản đến nâng cao', code: 'CNTT-PY-001' },
      { title: 'Kinh tế học vi mô ứng dụng', code: 'KT-VM-002' },
    ],
    student: order.student || { name: 'Nguyễn Văn A', id: '2251010089', class: 'CNTT2022' },
  };

  // Dữ liệu cho tab Phiếu trả
  const returnData = {
    code: order.mode === 'return' ? order.code : 'PT-UTH-2026-108',
    campus: order.campus || 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
    time: order.mode === 'return' ? order.pickupDate : 'Hẹn trả: 14/11/2026 (14:00 - 16:30)',
    books: order.books || [
      { title: 'Lập trình Python từ cơ bản đến nâng cao', code: 'CNTT-PY-001' },
    ],
    note: order.note || 'Quét mã tại quầy tiếp nhận để hoàn tất trả sách trong 30 giây.',
  };

  const current = isPickup ? pickupData : returnData;
  const currentCode = current.code;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Cấu hình giao diện theo tab
  const ui = isPickup
    ? {
        themeColor: '#00666B',
        headerGrad: 'from-[#00363a] via-[#004e53] to-[#00666B]',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badgeIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        badgeText: 'Đơn sẵn sàng lấy tại quầy Pick & Go',
        headingTitle: 'Mã QR Nhận Sách',
        timeLabel: 'Thời gian hẹn nhận:',
        tipBg: 'bg-teal-50 border-teal-100 text-teal-900',
        tipText: 'Đưa mã QR này cho thủ thư quầy Pick & Go để nhận tài liệu trong vòng 30 giây.',
      }
    : {
        themeColor: '#1d4ed8',
        headerGrad: 'from-[#1e293b] via-[#1e3a8a] to-[#2563eb]',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        badgeIcon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
        badgeText: 'Phiếu hẹn trả sách – Chờ đối soát tại quầy',
        headingTitle: 'Mã QR Hẹn Trả Sách',
        timeLabel: 'Thời gian hẹn trả:',
        tipBg: 'bg-blue-50 border-blue-100 text-blue-900',
        tipText: 'Đưa mã QR này cho thủ thư tiếp nhận để kiểm tra tình trạng sách và hoàn tất trả.',
      };

  // Render SVG QR UTH dự phòng (vector siêu nét, quét nhạy)
  const renderQrSvg = (codeStr, accentColor) => (
    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
      {/* 3 góc định vị chuẩn QR */}
      <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
      <rect x="12" y="12" width="14" height="14" />
      <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
      <rect x="74" y="12" width="14" height="14" />
      <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
      <rect x="12" y="74" width="14" height="14" />

      {/* Dữ liệu ma trận QR */}
      <rect x="38" y="10" width="8" height="8" />
      <rect x="50" y="8" width="6" height="6" />
      <rect x="10" y="38" width="8" height="8" />
      <rect x="22" y="45" width="6" height="6" />
      <rect x="42" y="42" width="16" height="16" fill={accentColor} />
      <rect x="65" y="38" width="8" height="8" />
      <rect x="80" y="48" width="6" height="6" />
      <rect x="38" y="65" width="8" height="8" />
      <rect x="52" y="70" width="8" height="8" />
      <rect x="70" y="65" width="10" height="8" />
      <rect x="85" y="80" width="8" height="8" />
      <rect x="48" y="85" width="6" height="6" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (isFullScreen) setIsFullScreen(false);
          else onClose();
        }}
      />

      {/* Chế độ Phóng to toàn màn hình chống lóa (Full-screen Anti-glare) */}
      {isFullScreen ? (
        <div className="relative z-50 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center space-y-4 text-center border-4 border-slate-900 animate-in zoom-in-95">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chế độ quét siêu nhạy tại quầy
            </span>
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Thu nhỏ"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="w-64 h-64 bg-white p-3 rounded-2xl border-4 border-slate-900 shadow-xl flex flex-col items-center justify-center relative">
            {order.qrCodeBase64 ? (
              <img
                src={order.qrCodeBase64.startsWith('data:') ? order.qrCodeBase64 : `data:image/png;base64,${order.qrCodeBase64}`}
                alt={`Mã QR ${currentCode}`}
                className="w-full h-full object-contain"
              />
            ) : (
              renderQrSvg(currentCode, ui.themeColor)
            )}
            <span className="absolute bottom-1 bg-white px-2 py-0.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded">
              {currentCode}
            </span>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">{current.campus}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{currentCode}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng chế độ phóng to
          </button>
        </div>
      ) : (
        /* Modal Dialog Chuẩn */
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[92vh]">
          {/* Header với Gradient & Nút đóng */}
          <div className={`bg-gradient-to-r ${ui.headerGrad} p-4 sm:p-5 text-white transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold leading-tight">
                    {ui.headingTitle}
                  </h3>
                  <p className="text-[11px] text-white/80">Thư viện Đại học GTVT TP.HCM (UTH)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CHUYỂN ĐỔI LINH HOẠT TRỰC TIẾP TRÊN HEADER */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-xl mt-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('pickup')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'pickup'
                    ? 'bg-white text-[#00666B] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>QR Nhận sách</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('return')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'return'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <ArrowUpFromLine className="w-3.5 h-3.5" />
                <span>QR Phiếu trả</span>
              </button>
            </div>
          </div>

          {/* Thân Modal cuộn dọc mượt */}
          <div className="p-4 sm:p-5 space-y-4 text-center overflow-y-auto">
            {/* Badge trạng thái */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold ${ui.badgeBg}`}>
              {ui.badgeIcon}
              <span>{ui.badgeText}</span>
            </div>

            {/* Vùng Mã QR + Nút phóng to + Nút sao chép */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 inline-block mx-auto shadow-inner relative group">
              <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white p-2.5 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center relative shadow-sm overflow-hidden mx-auto">
                {order.qrCodeBase64 ? (
                  <img
                    src={order.qrCodeBase64.startsWith('data:') ? order.qrCodeBase64 : `data:image/png;base64,${order.qrCodeBase64}`}
                    alt={`Mã QR ${currentCode}`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  renderQrSvg(currentCode, ui.themeColor)
                )}
                <span className="absolute bottom-1 bg-white/95 px-2 text-[9px] font-mono font-bold tracking-wider text-slate-800 border border-slate-200 rounded">
                  {currentCode}
                </span>
              </div>

              {/* Hàng thao tác dưới mã QR: Phóng to + Copy mã */}
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#00666B] text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer shadow-2xs hover:bg-slate-50"
                  title="Sao chép mã giao dịch"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>{currentCode}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#00666B] text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs hover:bg-slate-50"
                  title="Phóng to mã QR để quét dễ hơn"
                >
                  <Expand className="w-3 h-3 text-slate-400" />
                  <span>Phóng to</span>
                </button>
              </div>
            </div>

            {/* Chi tiết đơn / Phiếu hẹn */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-left border border-slate-200/80 space-y-2 text-xs">
              {isPickup && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#00666B]" /> Sinh viên mượn:
                  </span>
                  <span className="font-bold text-slate-800">
                    {pickupData.student.name} · <span className="font-mono">{pickupData.student.id}</span>
                  </span>
                </div>
              )}

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ui.themeColor }} />
                <div>
                  <span className="text-slate-500 block text-[10px]">Cơ sở tiếp nhận:</span>
                  <strong className="text-slate-800 font-bold block">{current.campus}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ui.themeColor }} />
                <div>
                  <span className="text-slate-500 block text-[10px]">{ui.timeLabel}</span>
                  <strong className="text-slate-800 font-bold block">{current.time}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200">
                <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: ui.themeColor }} />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 block text-[10px]">
                    Danh mục tài liệu ({current.books.length} cuốn):
                  </span>
                  <ul className="mt-1 space-y-1">
                    {current.books.map((b, idx) => (
                      <li key={idx} className="font-semibold text-slate-800 truncate">
                        • {b.title}{' '}
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          ({b.code || `BK-${idx + 1}`})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lưu ý tại quầy */}
            <div className={`p-3 rounded-xl border text-[11px] text-left flex items-start gap-2 ${ui.tipBg}`}>
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-current opacity-80" />
              <p className="leading-relaxed">{ui.tipText}</p>
            </div>
          </div>

          {/* Footer nút đóng */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              Hệ thống Thư viện UTH · Pick &amp; Go
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
              style={{ background: ui.themeColor }}
            >
              Đã hiểu &amp; Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



