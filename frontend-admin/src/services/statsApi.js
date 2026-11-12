import axiosClient from './axiosClient'

/*
 * Dịch vụ cung cấp dữ liệu thống kê tổng quan và số liệu biểu đồ cho bảng điều khiển Dashboard.
 * Tự động cung cấp dữ liệu mẫu trực quan khi chưa kết nối máy chủ backend.
 */
const statsApi = {
  /*
   * Lấy các chỉ số thống kê quan trọng ở đầu trang Dashboard.
   */
  async getMetrics() {
    try {
      return await axiosClient.get('/stats/overview')
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho chỉ số tổng quan:', error.message)
      return {
        totalBooks: { value: '12.480', change: '+4,8%', changeLabel: 'so với tháng trước' },
        pendingOrders: { value: '18 đơn', change: '+5 đơn', changeLabel: 'cần gom sách gấp' },
        activeBorrows: { value: '1.240', change: '+12%', changeLabel: 'tăng trưởng mượn' },
        overdueOrders: { value: '6 đơn', change: '-2 đơn', changeLabel: 'so với tuần trước' },
      }
    }
  },

  /*
   * Lấy số liệu lưu lượng mượn và trả sách theo từng ngày trong tuần cho biểu đồ Chart.js.
   */
  async getWeeklyActivity() {
    try {
      return await axiosClient.get('/stats/weekly-activity')
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho lưu lượng tuần:', error.message)
      return {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        borrowed: [45, 62, 58, 80, 95, 70, 30],
        returned: [38, 48, 52, 65, 82, 60, 25],
      }
    }
  },

  /*
   * Lấy tỷ lệ phân bổ các danh mục sách mượn nhiều nhất cho biểu đồ tròn Chart.js.
   */
  async getCategoryShare() {
    try {
      return await axiosClient.get('/stats/category-share')
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho tỷ lệ danh mục:', error.message)
      return {
        labels: ['Công nghệ thông tin', 'Logistics & Cảng biển', 'Kỹ thuật Cầu đường', 'Kinh tế vận tải', 'Khác'],
        datasets: [38, 26, 18, 12, 6],
      }
    }
  },

  /*
   * Lấy danh sách các đơn mượn mới nhất cần thủ thư xử lý tại quầy.
   */
  async getRecentOrders() {
    try {
      return await axiosClient.get('/stats/recent-orders')
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho danh sách đơn gần đây:', error.message)
      return [
        {
          id: 'ORD-1001',
          student: 'Nguyễn Văn An (2251120145)',
          bookTitle: 'Lập trình Java nâng cao',
          pickupTime: '09:00 - 10:30',
          status: 'Sẵn sàng',
          statusClass: 'status--giao',
        },
        {
          id: 'ORD-1002',
          student: 'Trần Thị Mai (2251120032)',
          bookTitle: 'Cơ sở dữ liệu và MySQL',
          pickupTime: '13:30 - 15:00',
          status: 'Chờ gom',
          statusClass: 'status--gom',
        },
        {
          id: 'ORD-1003',
          student: 'Lê Hoàng Nam (2151140088)',
          bookTitle: 'Logistics cảng biển',
          pickupTime: '10:30 - 11:30',
          status: 'Đang mượn',
          statusClass: 'status--giao',
        },
        {
          id: 'ORD-1004',
          student: 'Phạm Quốc Bảo (2051150012)',
          bookTitle: 'Thiết kế cầu đường hiện đại',
          pickupTime: 'Quá hạn 3 ngày',
          status: 'Quá hạn',
          statusClass: 'status--gom',
        },
      ]
    }
  },
}

export default statsApi
