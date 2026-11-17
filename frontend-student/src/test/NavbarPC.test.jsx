import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import NavbarPC from '../components/layout/NavbarPC';

describe('NavbarPC Component (TV3 Desktop Web)', () => {
  it('hiển thị logo Thư viện UTH và các liên kết điều hướng chính', () => {
    const setActiveTab = vi.fn();

    render(
      <BrowserRouter>
        <NavbarPC
          activeTab="home"
          setActiveTab={setActiveTab}
          cartCount={2}
          searchQuery=""
          setSearchQuery={() => {}}
        />
      </BrowserRouter>
    );

    // Kiểm tra logo và chữ nhận diện UTH
    expect(screen.getByText('Thư viện')).toBeInTheDocument();
    expect(screen.getByText('UTH')).toBeInTheDocument();

    // Kiểm tra các nhãn điều hướng
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Kho sách')).toBeInTheDocument();
    expect(screen.getByText('Đang mượn')).toBeInTheDocument();
    expect(screen.getByText('Lịch sử')).toBeInTheDocument();

    // Kiểm tra hiển thị số lượng giỏ mượn
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('gọi hàm setActiveTab khi click vào nút điều hướng', () => {
    const setActiveTab = vi.fn();

    render(
      <BrowserRouter>
        <NavbarPC
          activeTab="home"
          setActiveTab={setActiveTab}
          cartCount={0}
          searchQuery=""
          setSearchQuery={() => {}}
        />
      </BrowserRouter>
    );

    const catalogBtn = screen.getByTitle('Kho sách & Giáo trình');
    fireEvent.click(catalogBtn);

    expect(setActiveTab).toHaveBeenCalledWith('catalog');
  });

  it('cho phép nhập từ khóa tìm kiếm và xóa từ khóa', () => {
    const setSearchQuery = vi.fn();

    render(
      <BrowserRouter>
        <NavbarPC
          activeTab="catalog"
          setActiveTab={() => {}}
          cartCount={1}
          searchQuery="Lập trình Python"
          setSearchQuery={setSearchQuery}
        />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('Tìm sách, tài liệu...');
    expect(input).toHaveValue('Lập trình Python');

    // Nút xóa tìm kiếm (X)
    const clearBtn = screen.getByTitle('Xóa tìm kiếm');
    fireEvent.click(clearBtn);

    expect(setSearchQuery).toHaveBeenCalledWith('');
  });
});
