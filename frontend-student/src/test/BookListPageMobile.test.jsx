import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookListPageMobile from '../pages/BookListPageMobile';
import { bookApi } from '../services/bookApi';
import mockPCBooks from '../mockPCBooks.json';

vi.mock('../services/bookApi', () => ({
  bookApi: {
    getBooks: vi.fn(),
  },
}));

describe('BookListPageMobile Component (TV2 Mobile Web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders BookCardSkeleton while loading and falls back to mockPCBooks on API failure', async () => {
    bookApi.getBooks.mockRejectedValueOnce(new Error('Network offline'));

    const { container } = render(
      <BookListPageMobile
        onAddToCart={vi.fn()}
        onViewDetail={vi.fn()}
        cartItems={[]}
      />
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText(mockPCBooks[0].title)).toBeInTheDocument();
    });
  });

  it('supports Vietnamese accent-insensitive smart search (matchBookSmart)', async () => {
    bookApi.getBooks.mockResolvedValueOnce({ content: mockPCBooks });

    render(
      <BookListPageMobile
        onAddToCart={vi.fn()}
        onViewDetail={vi.fn()}
        cartItems={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockPCBooks[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm tên giáo trình/i);
    fireEvent.change(searchInput, { target: { value: 'lap trinh python' } });

    expect(
      screen.getByText(/Lập trình Python từ cơ bản đến nâng cao/i)
    ).toBeInTheDocument();
  });
});
