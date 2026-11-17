import axiosClient from './axiosClient'
import mockOrders from '../data/mockOrders.json'

/* Danh sach don muon mau duoc luu trong bo nho de ho tro cap nhat trang thai Kanban */
let localOrders = [...mockOrders]

/* Bang anh xa nhan trang thai don muon sach */
const statusLabels = {
  PENDING: 'Chờ soạn sách',
  PROCESSING: 'Đang gom sách',
  READY_FOR_PICKUP: 'Sẵn sàng lấy sách',
  BORROWED: 'Đang mượn',
  RETURNED: 'Đã trả sách',
  OVERDUE: 'Quá hạn',
  CANCELLED: 'Đã hủy'
}

/*
  Dich vu goi API quan ly luong don muon tra sach danh cho thu thu.
  Ho tro tu dong dung du lieu mau mockOrders khi chua ket noi may chu backend.
*/
const orderApi = {
  /*
    Lay danh sach toan bo don muon sach co ho tro bo loc trang thai va tim kiem.
  */
  async getAll(params = {}) {
    try {
      return await axiosClient.get('/orders', { params })
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho danh sách đơn:', error.message)
      let list = [...localOrders]

      if (params.status && params.status !== 'ALL') {
        list = list.filter((item) => item.status === params.status)
      }

      if (params.search) {
        const keyword = params.search.toLowerCase()
        list = list.filter(
          (item) =>
            item.orderCode?.toLowerCase().includes(keyword) ||
            item.studentName?.toLowerCase().includes(keyword) ||
            item.studentId?.includes(keyword) ||
            item.studentPhone?.includes(keyword)
        )
      }

      if (params.pickupDate) {
        list = list.filter((item) => item.pickupDate === params.pickupDate)
      }

      return list
    }
  },

  /*
    Lay thong tin chi tiet mot don muon theo ma dinh danh.
  */
  async getById(id) {
    try {
      return await axiosClient.get(`/orders/${id}`)
    } catch (error) {
      console.warn(`Sử dụng dữ liệu mẫu cho đơn #${id}:`, error.message)
      const found = localOrders.find((item) => String(item.id) === String(id) || item.orderCode === id)
      if (!found) {
        throw new Error('Không tìm thấy đơn mượn')
      }
      return found
    }
  },

  /*
    Cap nhat trang thai xu ly cua don muon (duyet, soan xong, ban giao, tra sach).
  */
  async updateStatus(id, status, notes = '') {
    try {
      return await axiosClient.patch(`/orders/${id}/status`, { status, notes })
    } catch (error) {
      console.warn(`Mô phỏng cập nhật trạng thái đơn #${id}:`, error.message)
      localOrders = localOrders.map((order) => {
        if (String(order.id) === String(id) || order.orderCode === id) {
          return {
            ...order,
            status,
            statusLabel: statusLabels[status] || status,
            notes: notes || order.notes,
            updatedAt: new Date().toISOString()
          }
        }
        return order
      })
      const updated = localOrders.find((item) => String(item.id) === String(id) || item.orderCode === id)
      return (
        updated || {
          id,
          status,
          notes,
          updatedAt: new Date().toISOString(),
          message: 'Cập nhật trạng thái thành công (chế độ mẫu)'
        }
      )
    }
  },

  /*
    Xac nhan quet ma QR nhan sach tai quay.
  */
  async verifyPickupQr(orderId, studentId) {
    try {
      return await axiosClient.post('/orders/verify-pickup', { orderId, studentId })
    } catch (error) {
      console.warn('Mô phỏng xác thực QR nhận sách:', error.message)
      localOrders = localOrders.map((order) => {
        if (String(order.id) === String(orderId) || order.orderCode === orderId) {
          return {
            ...order,
            status: 'BORROWED',
            statusLabel: statusLabels.BORROWED,
            notes: 'Đã nhận sách tại quầy qua xác thực QR',
            updatedAt: new Date().toISOString()
          }
        }
        return order
      })
      return {
        success: true,
        orderId,
        studentId,
        message: 'Xác thực mã QR thành công, sẵn sàng bàn giao sách'
      }
    }
  },

  /*
    Chuyen don sang trang thai san sang lay sach.
  */
  async markReady(id, notes = '') {
    return this.updateStatus(id, 'READY_FOR_PICKUP', notes)
  },

  /*
    Ban giao sach cho sinh vien (chuyen sang dang muon).
  */
  async handoverBooks(id, notes = '') {
    return this.updateStatus(id, 'BORROWED', notes)
  },

  /*
    Xac nhan sinh vien da hoan tat tra toan bo sach trong don.
  */
  async returnBooks(id, notes = '') {
    return this.updateStatus(id, 'RETURNED', notes)
  },

  /*
    Huy don muon sach voi ly do cu the.
  */
  async cancelOrder(id, reason = '') {
    return this.updateStatus(id, 'CANCELLED', reason)
  }
}

export default orderApi
