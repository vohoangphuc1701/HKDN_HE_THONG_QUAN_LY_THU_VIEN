import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthPageMobile from '../pages/AuthPageMobile';
import authApi from '../services/authApi';

vi.mock('../services/authApi', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('AuthPageMobile Component (TV2 Mobile & Tablet)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form, fills demo account, and submits credentials', async () => {
    authApi.login.mockResolvedValueOnce({
      success: true,
      user: { fullName: 'Võ Hoàng Phúc', studentId: 'sv2026', email: 'sv2026@ut.edu.vn' },
      isOfflineDemo: false,
    });
    const onAuthSuccess = vi.fn();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthPageMobile initialMode="login" onAuthSuccess={onAuthSuccess} />
      </MemoryRouter>
    );

    expect(screen.getByText('Chào mừng bạn trở lại!')).toBeInTheDocument();

    const demoBtn = screen.getByRole('button', { name: /Võ Hoàng Phúc/i });
    fireEvent.click(demoBtn);

    const submitBtn = screen.getByRole('button', { name: /Đăng nhập thư viện/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username: 'sv2026',
        password: 'Matkhau@123',
      });
      expect(onAuthSuccess).toHaveBeenCalled();
    });
  });

  it('validates registration fields, suggests @ut.edu.vn email, and registers student', async () => {
    authApi.register.mockResolvedValueOnce({ success: true });

    render(
      <MemoryRouter initialEntries={['/register']}>
        <AuthPageMobile initialMode="register" />
      </MemoryRouter>
    );

    expect(screen.getByText('Tạo tài khoản thư viện')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Họ và tên sinh viên/i), {
      target: { value: 'Nguyễn Minh Khôi' },
    });
    fireEvent.change(screen.getByLabelText(/Mã số sinh viên/i), {
      target: { value: '2251120045' },
    });

    const emailChip = screen.getByRole('button', { name: /2251120045@ut.edu.vn/i });
    fireEvent.click(emailChip);

    fireEvent.change(screen.getByLabelText(/^Mật khẩu/i), {
      target: { value: 'Matkhau@2026' },
    });
    fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/i), {
      target: { value: 'Matkhau@2026' },
    });

    expect(screen.getByText('Mật khẩu đã khớp')).toBeInTheDocument();

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /Hoàn tất đăng ký tài khoản/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        username: '2251120045',
        password: 'Matkhau@2026',
        fullName: 'Nguyễn Minh Khôi',
        email: '2251120045@ut.edu.vn',
      });
    });
  });
});
