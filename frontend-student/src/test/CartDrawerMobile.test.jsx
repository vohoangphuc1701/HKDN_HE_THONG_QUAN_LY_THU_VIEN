import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartDrawerMobile from '../components/responsive/CartDrawerMobile';
import borrowApi from '../services/borrowApi';

vi.mock('../services/borrowApi', () => ({
  default: {
    checkStudentBorrowEligibility: vi.fn(),
    createBorrowOrder: vi.fn(),
  },
}));

const MOCK_ITEMS = [
  {
    id: 1,
    title: 'Nhập môn Trí tuệ nhân tạo',
    author: 'TS. Nguyễn Văn A',
    category: 'CNTT',
    code: 'CNTT-AI-001',
    availableQuantity: 5,
  },
  {
    id: 2,
    title: 'Cấu trúc dữ liệu & Giải thuật',
    author: 'PGS. Trần Thị B',
    category: 'KTPM',
    code: 'CNTT-DSA-002',
    availableQuantity: 3,
  },
];

describe('CartDrawerMobile Component (TV2 Mobile Bottom Sheet)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders books in Step 1 and shows Undo banner after removing an item', () => {
    const onRemoveItem = vi.fn();
    const onAddItem = vi.fn();

    render(
      <CartDrawerMobile
        isOpen
        onClose={vi.fn()}
        cartItems={MOCK_ITEMS}
        onRemoveItem={onRemoveItem}
        onAddItem={onAddItem}
      />
    );

    expect(screen.getByText('Giỏ Mượn Giáo Trình')).toBeInTheDocument();
    expect(screen.getByText('2/5')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', {
      name: /Xóa Nhập môn Trí tuệ nhân tạo khỏi giỏ/i,
    });
    fireEvent.click(removeBtn);

    expect(onRemoveItem).toHaveBeenCalledWith(1);
    expect(screen.getByText(/Đã xóa/i)).toBeInTheDocument();

    const undoBtn = screen.getByRole('button', { name: /Hoàn tác/i });
    fireEvent.click(undoBtn);
    expect(onAddItem).toHaveBeenCalledWith(MOCK_ITEMS[0]);
  });

  it('navigates to Step 2, selects campus and submits borrow order', async () => {
    borrowApi.checkStudentBorrowEligibility.mockResolvedValueOnce({ eligible: true });
    borrowApi.createBorrowOrder.mockResolvedValueOnce({
      orderCode: 'DH-UTH-2026-888',
      status: 'READY_FOR_PICKUP',
    });

    const onCheckoutSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <CartDrawerMobile
        isOpen
        onClose={onClose}
        cartItems={MOCK_ITEMS}
        onRemoveItem={vi.fn()}
        onCheckoutSuccess={onCheckoutSuccess}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Chọn điểm & giờ nhận/i }));

    expect(screen.getByText('Cơ sở nhận tài liệu')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /CS2/i }));
    fireEvent.click(screen.getByRole('button', { name: /Chiều/i }));

    fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Tạo mã QR/i }));

    await waitFor(() => {
      expect(borrowApi.checkStudentBorrowEligibility).toHaveBeenCalledWith({ addingCount: 2 });
      expect(borrowApi.createBorrowOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          bookIds: [1, 2],
          note: expect.stringContaining('Cơ sở 2'),
        })
      );
      expect(onCheckoutSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
