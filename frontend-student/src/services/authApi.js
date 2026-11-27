import axiosClient from './axiosClient';
import { saveAuthSession, clearAuthSession, DEFAULT_STUDENT_PROFILE } from '../utils/studentSession';

/**
 * Service Xác thực & Tài khoản Sinh viên (kết nối /api/auth/* của Spring Boot TV4)
 * Tự động fallback sang phiên demo cục bộ khi Backend chưa khởi động.
 */
export const authApi = {
  /**
   * Đăng nhập bằng MSSV / Username hoặc Email
   * @param {{ username: string, password: string }} credentials
   */
  async login({ username, password }) {
    const cleanUsername = (username || '').trim();
    if (!cleanUsername || !password) {
      throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    }

    try {
      const response = await axiosClient.post('/auth/login', {
        username: cleanUsername,
        password,
      });
      const data = response?.data || response;
      if (data?.token) {
        saveAuthSession(data.token, data.user);
      }
      return {
        success: true,
        token: data?.token,
        user: data?.user,
        isOfflineDemo: false,
      };
    } catch (error) {
      // Lỗi nghiệp vụ từ Backend (sai mật khẩu, tài khoản bị khóa) -> ném lỗi ra UI
      if (error?.message && !error.message.includes('kết nối đến máy chủ')) {
        throw new Error(error.message);
      }

      // Fallback demo khi Backend chưa chạy
      const demoUser = {
        ...DEFAULT_STUDENT_PROFILE,
        username: cleanUsername,
        studentId: cleanUsername,
        fullName: cleanUsername === 'sv2026' ? 'Võ Hoàng Phúc' : DEFAULT_STUDENT_PROFILE.fullName,
        email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@ut.edu.vn`,
      };
      const demoToken = 'demo-offline-jwt-token';
      saveAuthSession(demoToken, demoUser);

      return {
        success: true,
        token: demoToken,
        user: demoUser,
        isOfflineDemo: true,
      };
    }
  },

  /**
   * Đăng ký tài khoản Sinh viên mới
   * @param {{ username: string, password: string, fullName: string, email: string, phone?: string }} payload
   */
  async register({ username, password, fullName, email, phone = '' }) {
    try {
      const response = await axiosClient.post('/auth/register', {
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
      });
      const data = response?.data || response;
      if (data?.token) {
        saveAuthSession(data.token, data.user);
      }
      return {
        success: true,
        token: data?.token,
        user: data?.user,
        isOfflineDemo: false,
      };
    } catch (error) {
      if (error?.message && !error.message.includes('kết nối đến máy chủ')) {
        throw new Error(error.message);
      }

      const demoUser = {
        ...DEFAULT_STUDENT_PROFILE,
        username: username.trim(),
        studentId: username.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      };
      saveAuthSession('demo-offline-jwt-token', demoUser);
      return {
        success: true,
        token: 'demo-offline-jwt-token',
        user: demoUser,
        isOfflineDemo: true,
      };
    }
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ JWT Token
   */
  async getMe() {
    const response = await axiosClient.get('/auth/me');
    const user = response?.data || response;
    if (user) {
      saveAuthSession(null, user);
    }
    return user;
  },

  logout() {
    clearAuthSession();
  },
};

export default authApi;
