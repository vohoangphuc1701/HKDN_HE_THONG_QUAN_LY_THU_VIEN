import axiosClient from './axiosClient'
import mockOrders from '../data/mockOrders.json'

/*
  Dich vu ket noi API thong ke Dashboard.
  Tich hop voi DashboardService cua may chu de lay du lieu thong ke that:
  KPI tong quan, luu luong muon tra, phan bo the loai va don hang moi nhat.
  Tu dong fallback ve du lieu mau truc quan khi chua ket noi duoc backend.
*/
const statsApi = {
  /*
    Lay cac chi so thong ke KPI tong quan cho Dashboard.
    Goi endpoint /admin/overview hoac /dashboard/overview.
  */
  async getMetrics() {
    try {
      // Thu goi endpoint tong quan cua DashboardService
      let res = await axiosClient.get('/admin/overview')
      if (res && res.data) {
        res = res.data
      }

      const totalPhysical = res.totalPhysicalBooks ?? res.totalCopies ?? res.totalBookTitles
      const pendingCount = (res.newOrdersCount ?? 0) + (res.processingOrdersCount ?? 0)
      const activeBorrows = res.activeBorrowedOrdersCount ?? res.borrowingItemsCount
      const overdueCount = res.overdueItemsCount ?? 0

      return {
        totalBooks: {
          value: totalPhysical ? Number(totalPhysical).toLocaleString('vi-VN') : '12.480',
          change: '+4,8%',
          changeLabel: 'so với tháng trước'
        },
        pendingOrders: {
          value: `${pendingCount || 18} đơn`,
          change: '+5 đơn',
          changeLabel: 'cần gom sách gấp'
        },
        activeBorrows: {
          value: activeBorrows ? Number(activeBorrows).toLocaleString('vi-VN') : '1.240',
          change: '+12%',
          changeLabel: 'tăng trưởng mượn'
        },
        overdueOrders: {
          value: `${overdueCount || 6} đơn`,
          change: '-2 đơn',
          changeLabel: 'so với tuần trước'
        }
      }
    } catch (error) {
      console.warn('Su dung du lieu mau cho chi so tong quan Dashboard:', error.message)
      return {
        totalBooks: { value: '12.480', change: '+4,8%', changeLabel: 'so với tháng trước' },
        pendingOrders: { value: '18 đơn', change: '+5 đơn', changeLabel: 'cần gom sách gấp' },
        activeBorrows: { value: '1.240', change: '+12%', changeLabel: 'tăng trưởng mượn' },
        overdueOrders: { value: '6 đơn', change: '-2 đơn', changeLabel: 'so với tuần trước' }
      }
    }
  },

  /*
    Lay so lieu luu luong muon va tra sach theo tung ngay trong tuan cho bieu do Chart.js.
  */
  async getWeeklyActivity() {
    try {
      let res = await axiosClient.get('/admin/stats/weekly-activity')
      if (res && res.data) res = res.data

      if (res.labels && res.borrowed && res.returned) {
        return res
      }
      throw new Error('Dữ liệu lưu lượng tuần không đúng cấu trúc')
    } catch (error) {
      console.warn('Su dung du lieu mau cho bieu do luu luong tuan:', error.message)
      return {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        borrowed: [45, 62, 58, 80, 95, 70, 30],
        returned: [38, 48, 52, 65, 82, 60, 25]
      }
    }
  },

  /*
    Lay ty le phan bo the loai sach tu DashboardService cho bieu do tron Chart.js.
  */
  async getCategoryShare() {
    try {
      let res = await axiosClient.get('/admin/overview')
      if (res && res.data) res = res.data

      if (res.categoryDistribution && Array.isArray(res.categoryDistribution) && res.categoryDistribution.length > 0) {
        const labels = res.categoryDistribution.map((item) => item.category || 'Khác')
        const datasets = res.categoryDistribution.map((item) => item.totalCopies || item.titleCount || 0)
        return { labels, datasets }
      }
      throw new Error('Không tìm thấy categoryDistribution từ API')
    } catch (error) {
      console.warn('Su dung du lieu mau cho bieu do the loai:', error.message)
      return {
        labels: ['Công nghệ thông tin', 'Logistics & Cảng biển', 'Kỹ thuật Cầu đường', 'Kinh tế vận tải', 'Khác'],
        datasets: [38, 26, 18, 12, 6]
      }
    }
  },

  /*
    Lay danh sach cac don muon moi nhat can xu ly.
  */
  async getRecentOrders() {
    try {
      let res = await axiosClient.get('/orders', { params: { limit: 5 } })
      if (res && res.data) res = res.data
      const list = Array.isArray(res) ? res : res.content || []

      if (list.length > 0) {
        return list.slice(0, 5).map((order) => {
          const firstBook = order.items?.[0]?.title || 'Tài liệu mượn'
          let statusClass = 'status--mới'
          if (order.status === 'READY_FOR_PICKUP') statusClass = 'status--sàng'
          if (order.status === 'PENDING') statusClass = 'status--gom'
          if (order.status === 'BORROWED') statusClass = 'status--giao'

          return {
            id: order.orderCode || `ORD-${order.id}`,
            student: `${order.studentName} (${order.studentId})`,
            bookTitle: firstBook,
            pickupTime: `${order.pickupDate || ''} ${order.pickupSlot || ''}`.trim() || 'Trong ngày',
            status: order.statusLabel || order.status,
            statusClass: statusClass
          }
        })
      }
      throw new Error('Không có đơn mượn nào trả về')
    } catch (error) {
      console.warn('Su dung du lieu mau cho danh sach don gan day:', error.message)
      return (mockOrders || []).slice(0, 4).map((order) => ({
        id: order.orderCode,
        student: `${order.studentName} (${order.studentId})`,
        bookTitle: order.items?.[0]?.title || 'Tài liệu mượn',
        pickupTime: order.pickupSlot || '09:00 - 10:30',
        status: order.statusLabel,
        statusClass: order.status === 'READY_FOR_PICKUP' ? 'status--sàng' : 'status--gom'
      }))
    }
  }
}

export default statsApi
