import axiosClient from './axiosClient';

/**
 * Service API Quản lý Mượn Sách & Quy tắc Nghiệp vụ BR01 - BR08 (TV3 - Desktop & Mobile)
 * Kết nối REST API sang Spring Boot:
 * - Gọi API tạo đơn mượn: POST /api/borrows/create
 * - Kiểm tra điều kiện nợ phạt (BR01) & hạn mức 5 cuốn: GET /api/operations/fines/my-fines & GET /api/borrows/my-loans
 * - Khóa tồn kho bi quan PESSIMISTIC_WRITE đảm bảo không bị quá bán khi đồng thời đặt mượn
 * - Sinh mã QR nhận sách quầy Pick & Go trong thời hạn giữ chỗ 48h (BR05)
 * - Tra cứu hồ sơ mượn hiện hành: GET /api/borrows/my-loans & GET /api/borrows/my-orders
 * - Hủy đơn mượn khi chưa nhận sách: POST /api/borrows/{orderId}/cancel
 */

export const MAX_BOOKS_PER_STUDENT = 5; // Quy định BR01

export const borrowApi = {
  /**
   * Tạo đơn đặt mượn sách trực tuyến mới
   * Backend Spring Boot xử lý:
   * - Kiểm tra nợ phạt UNPAID (chặn nếu vi phạm BR01)
   * - Khóa bi quan PESSIMISTIC_WRITE trừ tồn kho availableQuantity
   * - Sinh mã QR Base64 để quét tại quầy Pick & Go
   * 
   * @param {Object} data - Dữ liệu yêu cầu đặt mượn
   * @param {Array<number>} data.bookIds - Danh sách ID các cuốn sách
   * @param {string} data.pickupDate - Ngày hẹn lấy sách (YYYY-MM-DD)
   * @param {string} [data.note] - Ghi chú sinh viên (ví dụ cơ sở hẹn lấy)
   * @returns {Promise<Object>} Chi tiết đơn mượn kèm mã QR
   */
  async createBorrowOrder(data) {
    const { bookIds = [], pickupDate, note = '' } = data;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 cuốn sách vào giỏ mượn');
    }

    if (bookIds.length > MAX_BOOKS_PER_STUDENT) {
      throw new Error(`Vượt quá hạn mức mượn tối đa ${MAX_BOOKS_PER_STUDENT} cuốn / sinh viên (Quy định BR01)`);
    }

    if (!pickupDate) {
      throw new Error('Vui lòng chọn ngày hẹn nhận tài liệu tại quầy');
    }

    const payload = {
      bookIds: bookIds.map((id) => Number(id)),
      pickupDate,
      note: note.trim(),
    };

    try {
      const response = await axiosClient.post('/borrows/create', payload);
      const result = response?.data || response;
      return {
        success: true,
        orderId: result.orderId,
        orderCode: result.orderCode,
        status: result.status || 'NEW',
        pickupDate: result.pickupDate || pickupDate,
        qrCodeBase64: result.qrCodeBase64,
        books: result.books || [],
        message: result.message || 'Đặt mượn sách thành công! Vui lòng lưu mã QR để nhận sách tại quầy.',
      };
    } catch (error) {
      console.warn('[borrowApi.createBorrowOrder] Lỗi từ Backend, xử lý chế độ dự phòng:', error.message || error);

      // Nếu lỗi trả về từ máy chủ là lỗi nghiệp vụ (ví dụ có nợ phạt hoặc hết sách), quăng lỗi ra UI
      if (error?.message && !error.message.includes('kết nối đến máy chủ')) {
        throw error;
      }

      // Mô phỏng tạo đơn mượn thành công khi Backend Spring Boot chưa chạy (Chế độ mô phỏng sinh viên)
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const mockOrderCode = `OD-${datePart}-${randomPart}`;

      return {
        success: true,
        orderId: Date.now(),
        orderCode: mockOrderCode,
        status: 'NEW',
        pickupDate,
        note,
        qrCodeBase64: null, // Sẽ render bằng thư viện SVG/Canvas trên UI nếu chưa có base64
        books: bookIds.map((id) => ({ id })),
        isOfflineSimulation: true,
        message: 'Đã tạo đơn mượn Pick & Go (Chế độ mô phỏng dữ liệu cục bộ)',
      };
    }
  },

  /**
   * Kiểm tra điều kiện đủ điều kiện mượn sách của sinh viên theo quy định BR01:
   * 1. Không có biên lai phạt trễ hạn chưa nộp (UNPAID)
   * 2. Tổng số sách đang giữ + đang đặt chưa vượt quá 5 cuốn
   * 
   * @param {Object} [options]
   * @param {number} [options.addingCount=0] - Số cuốn dự kiến mượn thêm
   * @returns {Promise<{ eligible: boolean, unpaidFines: Array, activeBorrowCount: number, remainingQuota: number, reason?: string }>}
   */
  async checkStudentBorrowEligibility(options = {}) {
    const { addingCount = 0 } = options;

    let unpaidFines = [];
    let activeLoans = [];

    try {
      // 1. Kiểm tra nợ phạt sinh viên
      const fineResponse = await axiosClient.get('/operations/fines/my-fines');
      const fineData = fineResponse?.data || fineResponse;
      if (Array.isArray(fineData)) {
        unpaidFines = fineData.filter((f) => f.status === 'UNPAID');
      }
    } catch (error) {
      console.warn('[borrowApi.checkEligibility] Không thể lấy danh sách phạt:', error.message);
    }

    try {
      // 2. Kiểm tra các cuốn đang mượn
      const loansResponse = await axiosClient.get('/borrows/my-loans');
      const loansData = loansResponse?.data || loansResponse;
      if (Array.isArray(loansData)) {
        activeLoans = loansData.filter((l) => l.status === 'BORROWING' || l.status === 'OVERDUE');
      }
    } catch (error) {
      console.warn('[borrowApi.checkEligibility] Không thể lấy danh sách mượn:', error.message);
    }

    const activeBorrowCount = activeLoans.length;
    const remainingQuota = Math.max(0, MAX_BOOKS_PER_STUDENT - activeBorrowCount);

    // Kiểm tra nợ phạt
    if (unpaidFines.length > 0) {
      const totalUnpaid = unpaidFines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      return {
        eligible: false,
        unpaidFines,
        activeBorrowCount,
        remainingQuota,
        reason: `Bạn có ${unpaidFines.length} khoản phạt chưa thanh toán (${totalUnpaid.toLocaleString('vi-VN')} đ). Vui lòng hoàn tất nộp phạt trước khi mượn sách mới (BR01).`,
      };
    }

    // Kiểm tra vượt hạn mức
    if (activeBorrowCount + addingCount > MAX_BOOKS_PER_STUDENT) {
      return {
        eligible: false,
        unpaidFines: [],
        activeBorrowCount,
        remainingQuota,
        reason: `Vượt hạn mức mượn sách tối đa ${MAX_BOOKS_PER_STUDENT} cuốn. Hiện bạn đang giữ ${activeBorrowCount} cuốn, chỉ có thể mượn thêm tối đa ${remainingQuota} cuốn (BR01).`,
      };
    }

    return {
      eligible: true,
      unpaidFines: [],
      activeBorrowCount,
      remainingQuota,
    };
  },

  /**
   * Lấy danh sách các cuốn sách sinh viên hiện đang mượn
   * @returns {Promise<Array>} Danh sách sách kèm trạng thái gia hạn (canRenew, renewalCount, dueDate)
   */
  async getMyLoans() {
    try {
      const response = await axiosClient.get('/borrows/my-loans');
      const list = response?.data || response;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch (error) {
      console.warn('[borrowApi.getMyLoans] Fallback dữ liệu rỗng:', error.message);
      return [];
    }
  },

  /**
   * Lấy lịch sử các đơn đặt mượn của sinh viên
   */
  async getMyOrders() {
    try {
      const response = await axiosClient.get('/borrows/my-orders');
      const list = response?.data || response;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch (error) {
      console.warn('[borrowApi.getMyOrders] Fallback dữ liệu rỗng:', error.message);
      return [];
    }
  },

  /**
   * Hủy đơn mượn khi chưa nhận sách (Backend tự động cộng hoàn lại số lượng khả dụng vào kho)
   * @param {number|string} orderId - ID đơn mượn
   */
  async cancelBorrowOrder(orderId) {
    try {
      const response = await axiosClient.post(`/borrows/${orderId}/cancel`);
      return response?.data || response;
    } catch (error) {
      console.warn(`[borrowApi.cancelBorrowOrder] Lỗi khi hủy đơn #${orderId}:`, error.message);
      throw error;
    }
  },
};

export default borrowApi;
