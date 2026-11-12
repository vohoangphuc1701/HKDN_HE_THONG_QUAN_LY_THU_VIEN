import axios from 'axios'

/*
 * Cấu hình phiên bản Axios dùng chung cho toàn bộ giao diện quản trị Admin.
 * Tự động gắn token xác thực vào header và chuẩn hóa kết quả phản hồi từ API.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/*
 * Bộ đón tiếp yêu cầu: Tự động đính kèm JWT token từ bộ nhớ cục bộ nếu có.
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/*
 * Bộ đón tiếp kết quả: Trả về trực tiếp dữ liệu hoặc xử lý lỗi khi hết phiên đăng nhập.
 */
axiosClient.interceptors.response.use(
  (response) => response.data ?? response,
  (error) => {
    const status = error.response ? error.response.status : null

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('admin_token')
    }

    return Promise.reject(error)
  }
)

export default axiosClient
