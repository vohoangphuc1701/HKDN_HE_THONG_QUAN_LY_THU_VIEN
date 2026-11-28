import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckoutSchedulePageMobile from '../pages/CheckoutSchedulePageMobile';

describe('CheckoutSchedulePageMobile Component (TV2 Mobile Web)', () => {
  const sampleItems = [
    {
      id: 1,
      title: 'Lập trình Python từ cơ bản đến nâng cao',
      author: 'TS. Nguyễn Văn A',
      code: 'CNTT-PY-001',
    },
  ];

  it('renders pickup schedule flow with 3 UTH campuses without crashing', () => {
    render(
      <CheckoutSchedulePageMobile
        cartItems={sampleItems}
        mode="pickup"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
        onShowToast={vi.fn()}
      />
    );

    expect(screen.getByText(/Cơ sở 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Cơ sở 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Cơ sở 3/i)).toBeInTheDocument();
    expect(
      screen.getByText('Lập trình Python từ cơ bản đến nâng cao')
    ).toBeInTheDocument();
  });

  it('renders return schedule mode cleanly', () => {
    render(
      <CheckoutSchedulePageMobile
        cartItems={sampleItems}
        mode="return"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
        onShowToast={vi.fn()}
      />
    );

    expect(screen.getByText(/Đặt lịch hẹn trả sách/i)).toBeInTheDocument();
  });
});
