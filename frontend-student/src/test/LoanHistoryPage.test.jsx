import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoanHistoryPage from '../pages/LoanHistoryPage';
import { borrowApi } from '../services/borrowApi';

vi.mock('../services/borrowApi', () => ({
  borrowApi: {
    getMyOrders: vi.fn(),
  },
}));

describe('LoanHistoryPage Component (TV2 Mobile Web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows Skeleton Loading initially and falls back to INITIAL_HISTORY when API returns empty', async () => {
    borrowApi.getMyOrders.mockResolvedValueOnce([]);

    const { container } = render(
      <LoanHistoryPage onBorrowAgain={vi.fn()} onShowToast={vi.fn()} />
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(
        screen.getByText('Giải tích 1 - Giáo trình Đại học GTVT')
      ).toBeInTheDocument();
    });
  });

  it('filters history records by status (LATE)', async () => {
    borrowApi.getMyOrders.mockResolvedValueOnce([]);

    render(<LoanHistoryPage onBorrowAgain={vi.fn()} onShowToast={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByText('Cơ sở dữ liệu phân tán & SQL Server')
      ).toBeInTheDocument();
    });

    const lateFilterBtn = screen.getByRole('button', { name: /Trả trễ/i });
    fireEvent.click(lateFilterBtn);

    expect(
      screen.getByText('Cơ sở dữ liệu phân tán & SQL Server')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Giải tích 1 - Giáo trình Đại học GTVT')
    ).not.toBeInTheDocument();
  });
});
