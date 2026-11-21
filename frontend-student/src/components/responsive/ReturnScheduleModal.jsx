import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X, QrCode } from 'lucide-react';

/**
 * ReturnScheduleModal - Modal đặt lịch hẹn trả sách (BR06)
 * Ràng buộc: Ngày hẹn trả <= hạn trả lớn nhất của các tài liệu được chọn.
 * Sử dụng React Portal để overlay phủ kín 100% viewport, không bị che bởi navbar.
 */
export default function ReturnScheduleModal({
  isOpen,
  onClose,
  selectedLoans,
  appointmentCampus,
  setAppointmentCampus,
  appointmentDate,
  setAppointmentDate,
  maxAllowedDueDate,
  appointmentTimeSlot,
  setAppointmentTimeSlot,
  appointmentNote,
  setAppointmentNote,
  onConfirm,
}) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header modal */}
        <div className="bg-[#00666B] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Đặt Lịch Hẹn Trả Sách Trực Tuyến</h3>
              <p className="text-[11px] text-teal-100/80">Quầy trả sách nhanh Thư viện UTH</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung form hẹn lịch */}
        <form onSubmit={onConfirm} className="p-6 space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Danh sách tài liệu đã chọn ({selectedLoans.length} cuốn):
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {selectedLoans.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-100"
                >
                  <span className="font-bold text-slate-800 truncate max-w-[280px]">
                    {item.title}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Hạn: {item.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chọn điểm quầy tiếp nhận */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Địa điểm trả sách:
            </label>
            <select
              value={appointmentCampus}
              onChange={(e) => setAppointmentCampus(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
            >
              <option value="Cơ sở 1 - Võ Oanh (Bình Thạnh)">
                Cơ sở 1 - Số 2 Võ Oanh, Phường 25, Bình Thạnh
              </option>
              <option value="Cơ sở 2 - Trương Văn Hải (Thủ Đức)">
                Cơ sở 2 - Trương Văn Hải, Tăng Nhơn Phú B, TP. Thủ Đức
              </option>
              <option value="Cơ sở 3 - Tô Ký (Quận 12)">
                Cơ sở 3 - Đường Tô Ký, Phường Tân Chánh Hiệp, Quận 12
              </option>
            </select>
          </div>

          {/* Chọn ngày hẹn và khung giờ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ngày hẹn trả:
              </label>
              <input
                type="date"
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                max={maxAllowedDueDate ? maxAllowedDueDate.toISOString().split('T')[0] : undefined}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
                required
              />
              {maxAllowedDueDate && (
                <span className="text-[10px] text-amber-700 block mt-1 font-medium">
                  • BR06: Tối đa đến {maxAllowedDueDate.toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Khung giờ tiếp nhận:
              </label>
              <select
                value={appointmentTimeSlot}
                onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
              >
                <option value="08:00 - 10:30">Buổi sáng: 08:00 - 10:30</option>
                <option value="10:30 - 12:00">Trưa: 10:30 - 12:00</option>
                <option value="14:00 - 16:30">Buổi chiều: 14:00 - 16:30</option>
                <option value="17:00 - 19:30">Buổi tối: 17:00 - 19:30</option>
              </select>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ghi chú cho thủ thư (nếu có tình trạng rách/hỏng):
            </label>
            <input
              type="text"
              value={appointmentNote}
              onChange={(e) => setAppointmentNote(e.target.value)}
              placeholder="Ví dụ: Bìa sách hơi sờn, sách còn nguyên trang..."
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#00666B]/30 focus:border-[#00666B] outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00666B] hover:bg-[#005458] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Xác nhận & Nhận mã QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
