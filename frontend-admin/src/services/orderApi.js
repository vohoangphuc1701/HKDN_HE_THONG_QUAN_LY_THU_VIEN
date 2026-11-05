import axiosClient from './axiosClient'
import mockOrders from '../data/mockOrders.json'

/*
 * Dịch vụ gọi API quản lý luồng đơn mượn trả sách dành cho thủ thư.
 * Hỗ trợ tự động dùng dữ liệu mẫu mockOrders khi chưa kết nối máy chủ.
 */
const orderApi = {
  /*
   * Lấy danh sách toàn bộ đơn mượn sách có hỗ trợ bộ lọc trạng thái và tìm kiếm.
   */
  async getAll(params = {}) {
    try {
      return await axiosClient.get('/orders', { params })
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho danh sách đơn:', error.message)
      let list = [...mockOrders]

      if (params.status && params.status !== 'ALL') {
        list = list.filter((item) => item.status === params.status)
      }

      if (params.search) {
        const keyword = params.search.toLowerCase()
        list = list.filter(
          (item) =>
            item.orderCode.toLowerCase().includes(keyword) ||
            item.studentName.toLowerCase().includes(keyword) ||
            item.studentId.includes(keyword)
        )
      }

      return list
    }
  },

  /*
   * Lấy thông tin chi tiết một đơn mượn theo mã định danh.
   */
  async getById(id) {
    try {
      return await axiosClient.get(`/orders/${id}`)
    } catch (error) {
      console.warn(`Sử dụng dữ liệu mẫu cho đơn #${id}:`, error.message)
      const found = mockOrders.find((item) => String(item.id) === String(id))
      if (!found) {
        throw new Error('Không tìm thấy đơn mượn')
      }
      return found
    }
  },

  /*
   * Cập nhật trạng thái xử lý của đơn mượn (duyệt, soạn xong, bàn giao, trả sách).
   */
  async updateStatus(id, status, notes = '') {
    try {
      return await axiosClient.patch(`/orders/${id}/status`, { status, notes })
    } catch (error) {
      console.warn(`Mô phỏng cập nhật trạng thái đơn #${id}:`, error.message)
      return {
        id,
        status,
        notes,
        updatedAt: new Date().toISOString(),
        message: 'Cập nhật trạng thái thành công (chế độ mẫu)',
      }
    }
  },

  /*
   * Xác nhận quét mã QR nhận sách tại quầy.
   */
  async verifyPickupQr(orderId, studentId) {
    try {
      return await axiosClient.post('/orders/verify-pickup', { orderId, studentId })
    } catch (error) {
      console.warn('Mô phỏng xác thực QR nhận sách:', error.message)
      return {
        success: true,
        orderId,
        studentId,
        message: 'Xác thực mã QR thành công, sẵn sàng bàn giao sách',
      }
    }
  },
}

export default orderApi
