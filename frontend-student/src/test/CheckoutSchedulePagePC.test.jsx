import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckoutSchedulePagePC from '../pages/CheckoutSchedulePagePC';

describe('CheckoutSchedulePagePC Component (TV3 Desktop Web)', () => {
  const mockCartItems = [
    {
      id: 1,
      title: 'Lập trình Python từ cơ bản đến nâng cao',
      author: 'Nguyễn Văn A',
      code: 'CNTT-PY-001',
      category: 'CÔNG NGHỆ THÔNG TIN',
      location: 'Khu CNTT · Kệ A2',
      availableQuantity: 4,
    },
  ];

  it('renders correctly when cartItems is empty without crashing or white screen', () => {
    const onBackToCatalog = vi.fn();
    render(
      <CheckoutSchedulePagePC
        cartItems={[]}
        onBackToCatalog={onBackToCatalog}
      />
    );

    expect(screen.getByText('Giỏ Mượn Của Bạn Đang Trống')).toBeInTheDocument();
    expect(screen.getByText('Khám phá kho giáo trình UTH ngay')).toBeInTheDocument();
  });

  it('renders correctly when cartItems has books without crashing or white screen', () => {
    const onCheckoutSuccess = vi.fn();
    const onOpenQrModal = vi.fn();
    const onBackToCatalog = vi.fn();

    render(
      <CheckoutSchedulePagePC
        cartItems={mockCartItems}
        onCheckoutSuccess={onCheckoutSuccess}
        onOpenQrModal={onOpenQrModal}
        onBackToCatalog={onBackToCatalog}
      />
    );

    // Kiểm tra tiêu đề chính
    expect(screen.getByText(/Xác Nhận Đơn Mượn & Lên Lịch Pick & Go/i)).toBeInTheDocument();

    // Kiểm tra hiển thị 3 cơ sở (không còn phụ chú hay badge)
    expect(screen.getByText('Cơ sở 1')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 2')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 3')).toBeInTheDocument();

    // Kiểm tra không có nút Hôm nay / Ngày mai / Ngày mốt
    expect(screen.queryByRole('button', { name: 'Hôm nay' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ngày mai' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ngày mốt' })).not.toBeInTheDocument();

    // Kiểm tra ô chọn ngày tồn tại
    const dateInput = document.getElementById('pickup-date-input');
    expect(dateInput).toBeInTheDocument();

    // Kiểm tra nút xác nhận đặt mượn
    expect(screen.getByText(/Xác nhận đặt mượn & Xuất mã QR/i)).toBeInTheDocument();
  });
});
