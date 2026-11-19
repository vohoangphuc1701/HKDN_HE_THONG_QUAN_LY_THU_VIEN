import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import InventoryManagementPage from './InventoryManagementPage'

// Gia lap adminApi de kiem thu giao dien va modal form
vi.mock('../services/adminApi', () => {
  return {
    default: {
      getCategories: vi.fn(() => Promise.resolve(['Công nghệ thông tin', 'Logistics'])),
      getInventory: vi.fn(() =>
        Promise.resolve([
          {
            id: 1,
            code: 'UTH-CNTT-0101',
            isbn: '978-604-0-12345-1',
            title: 'Kỹ thuật lập trình Java nâng cao',
            author: 'Trần Minh Quân',
            category: 'Công nghệ thông tin',
            shelfLocation: 'Kệ A-02-03',
            totalCopies: 15,
            availableCopies: 10,
            status: 'AVAILABLE'
          }
        ])
      ),
      createBook: vi.fn((data) => Promise.resolve({ id: 2, ...data })),
      updateBook: vi.fn((id, data) => Promise.resolve({ id, ...data })),
      stockInBook: vi.fn((id, data) => Promise.resolve({ id, ...data })),
      deleteBook: vi.fn(() => Promise.resolve({ success: true }))
    }
  }
})

describe('InventoryManagementPage', () => {
  it('hien thi dung danh muc va mo modal them dau sach', async () => {
    await act(async () => {
      render(<InventoryManagementPage />)
    })

    // Kiem tra tieu de va the thong ke
    expect(screen.getByText('Tổng số đầu sách')).toBeInTheDocument()
    expect(screen.getByText('Kỹ thuật lập trình Java nâng cao')).toBeInTheDocument()

    // Mo modal them dau sach
    const createBtn = screen.getByRole('button', { name: /Thêm đầu sách/i })
    await act(async () => {
      fireEvent.click(createBtn)
    })

    expect(screen.getByText('Thêm đầu sách mới vào kho')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Lập trình ứng dụng Web/i)).toBeInTheDocument()
  })

  it('mo modal cap nhat so luong nhap kho', async () => {
    await act(async () => {
      render(<InventoryManagementPage />)
    })

    // Mo modal nhap kho qua nut hanh dong tren dong sach
    const stockInBtn = screen.getByTitle('Cập nhật số lượng nhập kho')
    await act(async () => {
      fireEvent.click(stockInBtn)
    })

    expect(screen.getByText('Cập nhật số lượng nhập kho')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xác nhận nhập kho/i })).toBeInTheDocument()
  })
})
