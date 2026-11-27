import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ManualSearchModal from './ManualSearchModal'

// Gia lap orderApi de kiem thu modal tra cuu thu cong
vi.mock('../../services/orderApi', () => {
  return {
    default: {
      getAll: vi.fn(() =>
        Promise.resolve([
          {
            id: 1001,
            orderCode: 'ORD-2026-1001',
            studentId: '2251120145',
            studentName: 'Nguyễn Văn An',
            studentPhone: '0912345671',
            pickupDate: '2026-03-02',
            pickupSlot: '09:00 - 10:30',
            status: 'READY_FOR_PICKUP',
            statusLabel: 'Sẵn sàng lấy sách',
            items: [
              {
                title: 'Kỹ thuật lập trình Java nâng cao',
                code: 'UTH-CNTT-0101',
                shelfLocation: 'Kệ A-02-03'
              }
            ]
          }
        ])
      ),
      handoverBooks: vi.fn(() => Promise.resolve({ success: true })),
      returnBooks: vi.fn(() => Promise.resolve({ success: true }))
    }
  }
})

describe('ManualSearchModal', () => {
  it('hien thi dung giao dien tra cuu thu cong khi isOpen la true', async () => {
    await act(async () => {
      render(<ManualSearchModal isOpen={true} onClose={() => {}} />)
    })

    expect(screen.getByText('Tra cứu đơn mượn thủ công')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Nhập MSSV/i)).toBeInTheDocument()
    expect(screen.getByText('ORD-2026-1001')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
  })

  it('cho phep chon don va hien thi khung xac thuc thu cong', async () => {
    await act(async () => {
      render(<ManualSearchModal isOpen={true} onClose={() => {}} />)
    })

    const selectBtn = screen.getByRole('button', { name: /Chọn xử lý/i })
    await act(async () => {
      fireEvent.click(selectBtn)
    })

    expect(screen.getByText(/Đang chuẩn bị xác thực thủ công cho đơn/i)).toBeInTheDocument()
    expect(screen.getByText('Xác nhận bàn giao sách')).toBeInTheDocument()
  })
})
