import axiosClient from './axiosClient';

/**
 * Service API Quy trình Trả Sách, Lên Lịch Hẹn & Gia Hạn Trực Tuyến (TV3 - Desktop & Mobile)
 * Kết nối REST API sang Spring Boot:
 * - Gia hạn sách trực tuyến: POST /api/borrows/{id}/renew (hoặc /api/borrows/renew/{id})
 *   + Tối đa gia hạn 2 lần, mỗi lần +7 ngày theo quy định BR03
 *   + Chặn gia hạn nếu sách đã quá hạn trả (buộc mang lên quầy)
 * - Tạo phiếu hẹn trả sách sớm: POST /api/returns/create-ticket
 *   + Xuất mã QR phiếu hẹn trả (RT-...) để thủ thư quét đối soát nhanh < 30s
 * - Lấy danh sách phiếu hẹn trả: GET /api/returns/my-tickets
 * - Tính toán số ngày trễ hạn và ước tính tiền phạt: 5.000 VNĐ / ngày / cuốn (BR04)
 */

export const LATE_FINE_PER_DAY = 5000; // Quy định BR04: 5.000 VNĐ/ngày/cuốn
export const MAX_RENEWALS_ALLOWED = 2; // Quy định BR03: Tối đa 2 lần gia hạn
export const RENEWAL_DAYS = 7;         // Quy định BR03: Mỗi lần +7 ngày

export const returnApi = {
  /**
   * Gia hạn sách trực tuyến thêm 7 ngày (BR03)
   * @param {number|string} borrowDetailId - ID bản ghi chi tiết mượn sách
   * @returns {Promise<Object>} Thông tin hạn trả mới và số lần đã gia hạn
   */
  async renewBook(borrowDetailId) {
    if (!borrowDetailId) {
      throw new Error('Mã định danh chi tiết mượn sách không hợp lệ');
    }

    try {
      // 1. Thử gọi endpoint chuẩn REST của Spring Boot
      let response;
      try {
        response = await axiosClient.post(`/borrows/${borrowDetailId}/renew`);
      } catch (err) {
        // Fallback thử cấu hình alias /api/borrows/renew/{id}
        if (err?.response?.status === 404) {
          response = await axiosClient.post(`/borrows/renew/${borrowDetailId}`);
        } else {
          throw err;
        }
      }

      const result = response?.data || response;
      return {
        success: true,
        borrowDetailId: result.borrowDetailId || borrowDetailId,
        oldDueDate: result.oldDueDate,
        newDueDate: result.newDueDate,
        renewalCount: result.renewalCount,
        message: result.message || 'Gia hạn sách trực tuyến thành công thêm 7 ngày!',
      };
    } catch (error) {
      console.warn(`[returnApi.renewBook] Lỗi khi gia hạn sách #${borrowDetailId}:`, error.message || error);

      // Nếu là lỗi nghiệp vụ từ backend (đã quá hạn, quá số lần), quăng lỗi ra UI
      if (error?.message && !error.message.includes('kết nối đến máy chủ')) {
        throw error;
      }

      // Chế độ mô phỏng khi Backend Spring Boot chưa chạy
      const now = new Date();
      now.setDate(now.getDate() + 14); // 7 ngày gia hạn tiếp
      const newDueDateStr = now.toISOString().split('T')[0];

      return {
        success: true,
        borrowDetailId,
        oldDueDate: new Date().toISOString().split('T')[0],
        newDueDate: newDueDateStr,
        renewalCount: 1,
        isOfflineSimulation: true,
        message: 'Đã gia hạn trực tuyến thêm +7 ngày (Chế độ mô phỏng dữ liệu)',
      };
    }
  },

  /**
   * Tạo phiếu hẹn trả sách kèm mã QR đối soát tại quầy (ReturnTicket Flow)
   * @param {Object} data - Dữ liệu yêu cầu tạo phiếu trả
   * @param {Array<number>} data.borrowDetailIds - Danh sách ID các chi tiết mượn sách cần trả
   * @param {string} data.scheduledReturnDate - Ngày hẹn mang sách lên quầy (YYYY-MM-DD)
   * @returns {Promise<Object>} Phiếu hẹn trả kèm mã QR
   */
  async createReturnTicket(data) {
    const { borrowDetailIds = [], scheduledReturnDate } = data;

    if (!Array.isArray(borrowDetailIds) || borrowDetailIds.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 cuốn sách để tạo phiếu hẹn trả');
    }

    if (!scheduledReturnDate) {
      throw new Error('Vui lòng chọn ngày hẹn đem sách lên quầy thư viện');
    }

    const payload = {
      borrowDetailIds: borrowDetailIds.map((id) => Number(id)),
      scheduledReturnDate,
    };

    try {
      const response = await axiosClient.post('/returns/create-ticket', payload);
      const result = response?.data || response;
      return {
        success: true,
        ticketId: result.ticketId,
        ticketCode: result.ticketCode,
        scheduledReturnDate: result.scheduledReturnDate || scheduledReturnDate,
        status: result.status || 'PENDING_RETURN',
        qrCodeBase64: result.qrCodeBase64,
        books: result.books || [],
        message: result.message || 'Tạo phiếu hẹn trả sách thành công! Vui lòng xuất trình mã QR khi đến quầy.',
      };
    } catch (error) {
      console.warn('[returnApi.createReturnTicket] Lỗi từ Backend, xử lý chế độ dự phòng:', error.message || error);

      if (error?.message && !error.message.includes('kết nối đến máy chủ')) {
        throw error;
      }

      // Mô phỏng tạo phiếu hẹn trả khi máy chủ chưa khởi động
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const mockTicketCode = `RT-${datePart}-${randomPart}`;

      return {
        success: true,
        ticketId: Date.now(),
        ticketCode: mockTicketCode,
        scheduledReturnDate,
        status: 'PENDING_RETURN',
        qrCodeBase64: null,
        books: borrowDetailIds.map((id) => ({ borrowDetailId: id })),
        isOfflineSimulation: true,
        message: 'Đã tạo phiếu hẹn trả sách (Chế độ mô phỏng dữ liệu)',
      };
    }
  },

  /**
   * Lấy danh sách toàn bộ các phiếu hẹn trả sách của sinh viên
   */
  async getMyReturnTickets() {
    try {
      const response = await axiosClient.get('/returns/my-tickets');
      const list = response?.data || response;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch (error) {
      console.warn('[returnApi.getMyReturnTickets] Fallback danh sách rỗng:', error.message);
      return [];
    }
  },

  /**
   * Tiện ích tính toán số ngày quá hạn và ước tính tiền phạt phát sinh (BR04)
   * @param {string|Date} dueDate - Hạn trả của cuốn sách
   * @param {string|Date} [returnDate=new Date()] - Ngày trả thực tế hoặc dự kiến
   * @returns {{ isOverdue: boolean, overdueDays: number, fineAmount: number, formattedFine: string }}
   */
  calculateEstimatedFine(dueDate, returnDate = new Date()) {
    if (!dueDate) {
      return { isOverdue: false, overdueDays: 0, fineAmount: 0, formattedFine: '0 đ' };
    }

    const due = new Date(dueDate);
    const ret = new Date(returnDate);

    // Chuẩn hóa về 00:00:00 để so sánh số ngày nguyên vẹn
    due.setHours(0, 0, 0, 0);
    ret.setHours(0, 0, 0, 0);

    const diffTime = ret.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const fineAmount = diffDays * LATE_FINE_PER_DAY;
      return {
        isOverdue: true,
        overdueDays: diffDays,
        fineAmount,
        formattedFine: `${fineAmount.toLocaleString('vi-VN')} đ`,
      };
    }

    return {
      isOverdue: false,
      overdueDays: 0,
      fineAmount: 0,
      formattedFine: '0 đ',
    };
  },
};

export default returnApi;
