import axios from 'axios';

/**
 * Axios Client dùng chung cho Cổng Sinh Viên (Mobile & PC)
 * Phụ trách: TV2 (Mobile) & TV3 (PC)
 * Đáp ứng đặc tả:
 * - Tự động gắn JWT Bearer Token vào header Authorization cho mọi request
 * - Tự động bóc tách dữ liệu theo chuẩn ApiResponse của Backend Spring Boot
 * - Xử lý tập trung các lỗi HTTP phổ biến (401 Hết hạn phiên, 403, 500)
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================
// Tự động đính kèm JWT Bearer Token nếu người dùng đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
// Chuẩn hóa định dạng trả về và xử lý lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để các service không cần gọi .data nhiều lần
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Xử lý các lỗi HTTP phổ biến
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ -> Xóa token và điều hướng về đăng nhập
          console.warn('[AxiosClient] 401 Unauthorized - Hết hạn phiên đăng nhập');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          // Nếu không đang ở trang đăng nhập thì chuyển hướng
          if (!window.location.pathname.includes('/login')) {
            // window.location.href = '/login';
          }
          break;

        case 403:
          console.error('[AxiosClient] 403 Forbidden - Không có quyền truy cập');
          break;

        case 404:
          console.warn('[AxiosClient] 404 Not Found - Không tìm thấy tài nguyên:', error.config?.url);
          break;

        case 500:
          console.error('[AxiosClient] 500 Internal Server Error - Lỗi máy chủ Backend');
          break;

        default:
          console.error(`[AxiosClient] HTTP Error ${status}:`, data?.message || error.message);
      }

      // Trả về lỗi đã chuẩn hóa từ Backend nếu có
      return Promise.reject(data || error);
    }

    // Lỗi mạng hoặc server không phản hồi
    console.error('[AxiosClient] Lỗi kết nối mạng (Network Error):', error.message);
    return Promise.reject({
      success: false,
      message: 'Không thể kết nối đến máy chủ thư viện. Vui lòng kiểm tra lại đường truyền!',
    });
  }
);

export default axiosClient;
