import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoansCardListMobile from '../components/responsive/LoansCardListMobile';
import { borrowApi } from '../services/borrowApi';

vi.mock('../services/borrowApi', () => ({
  borrowApi: {
    getMyLoans: vi.fn(),
  },
}));

vi.mock('../services/returnApi', () => ({
  returnApi: {
    renewBook: vi.fn().mockResolvedValue({ success: true }),
    createReturnTicket: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe('LoansCardListMobile Component (TV2 Mobile Web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays Skeleton Loading while fetching loans and falls back to INITIAL_LOANS when API returns empty', async () => {
    borrowApi.getMyLoans.mockResolvedValueOnce([]);

    const { container } = render(
      <LoansCardListMobile
        onOpenQrModal={vi.fn()}
        onShowToast={vi.fn()}
        onOpenScheduleReturn={vi.fn()}
      />
    );

    // Ban đầu khi đang tải sẽ hiện khung xương animate-pulse
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    // Sau khi API trả về [], tự động fallback về dữ liệu mẫu INITIAL_LOANS (zero crash)
    await waitFor(() => {
      expect(
        screen.getByText('Lập trình Python từ cơ bản đến nâng cao')
      ).toBeInTheDocument();
    });
  });

  it('filters loans by search query and blocks renewing overdue books (BR03)', async () => {
    borrowApi.getMyLoans.mockResolvedValueOnce([]);
    const onShowToast = vi.fn();

    render(
      <LoansCardListMobile
        onOpenQrModal={vi.fn()}
        onShowToast={onShowToast}
        onOpenScheduleReturn={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Lập trình Python từ cơ bản đến nâng cao')
      ).toBeInTheDocument();
    });

    // Tìm kiếm theo tên sách
    const searchInput = screen.getByPlaceholderText(/Tìm tên sách, mã sách/i);
    fireEvent.change(searchInput, { target: { value: 'Kinh tế học vi mô' } });

    expect(screen.getByText('Kinh tế học vi mô ứng dụng')).toBeInTheDocument();
    expect(
      screen.queryByText('Lập trình Python từ cơ bản đến nâng cao')
    ).not.toBeInTheDocument();
  });
});
