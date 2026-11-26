import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
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
            title: 'Kỹ thuật lập trình Java nâng cao',
            author: 'Trần Minh Quân',
            category: 'Công nghệ thông tin',
            shelfLocation: 'Kệ A-02-03',
            coverImage: 'https://picsum.photos/400/600?random=1',
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

    // Kiem tra form: co o hinh anh sach, khong con ISBN, tieu de muc 3 mau xanh
    expect(screen.getByText('Hình ảnh bìa sách')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/dán URL ảnh bìa/i)).toBeInTheDocument()
    expect(screen.queryByText('Mã chuẩn ISBN')).not.toBeInTheDocument()

    const section3Title = screen.getByText(/3\. Quản lý số lượng & Cập nhật kho/i)
    expect(section3Title).toBeInTheDocument()
    expect(section3Title).toHaveStyle({ color: '#2563eb' })
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

  it('mo modal quan ly the loai va them the loai moi thanh cong', async () => {
    await act(async () => {
      render(<InventoryManagementPage />)
    })

    // Mo modal Quan ly the loai
    const categoryBtn = screen.getByRole('button', { name: /Quản lý thể loại/i })
    await act(async () => {
      fireEvent.click(categoryBtn)
    })

    expect(screen.getByText('Quản lý thể loại sách')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nhập tên thể loại mới...')).toBeInTheDocument()

    // Them the loai moi
    const inputNewCat = screen.getByPlaceholderText('Nhập tên thể loại mới...')
    const submitBtn = screen.getByRole('button', { name: /Thêm thể loại/i })

    await act(async () => {
      fireEvent.change(inputNewCat, { target: { value: 'Khoa học Không gian' } })
      fireEvent.click(submitBtn)
    })

    expect(screen.getAllByText('Khoa học Không gian').length).toBeGreaterThan(0)
  })
})
