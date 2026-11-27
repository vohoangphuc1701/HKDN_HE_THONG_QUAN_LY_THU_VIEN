import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import OrderWorkflowPage from './OrderWorkflowPage'
import orderApi from '../services/orderApi'

/* Gia lap orderApi cho moi truong test */
vi.mock('../services/orderApi', () => {
  return {
    default: {
      getAll: vi.fn(() =>
        Promise.resolve([
          {
            id: 1001,
            orderCode: 'ORD-2026-1001',
            studentId: '2251120145',
            studentName: 'Nguyễn Văn An',
            pickupDate: '2026-03-02',
            pickupSlot: '09:00 - 10:30',
            status: 'PENDING',
            statusLabel: 'Chờ soạn sách',
            items: [
              {
                bookId: 'B-0101',
                title: 'Kỹ thuật lập trình Java nâng cao',
                code: 'UTH-CNTT-0101',
                shelfLocation: 'Kệ A-02-03',
                quantity: 1
              }
            ]
          },
          {
            id: 1002,
            orderCode: 'ORD-2026-1002',
            studentId: '2251120032',
            studentName: 'Trần Thị Mai',
            pickupDate: '2026-03-02',
            pickupSlot: '13:30 - 15:00',
            status: 'READY_FOR_PICKUP',
            statusLabel: 'Sẵn sàng lấy sách',
            items: []
          }
        ])
      ),
      updateStatus: vi.fn(() => Promise.resolve({ success: true })),
      verifyPickupQr: vi.fn(() => Promise.resolve({ success: true, message: 'Xác thực thành công' }))
    }
  }
})

describe('OrderWorkflowPage', () => {
  it('hien thi dung cac cot Kanban va the don muon', async () => {
    await act(async () => {
      render(<OrderWorkflowPage />)
    })

    /* Kiem tra tieu de cac cot Kanban */
    expect(screen.getByRole('heading', { name: 'Chờ soạn sách' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sẵn sàng lấy sách' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Đang mượn' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quá hạn / Hoàn tất' })).toBeInTheDocument()

    /* Kiem tra thong tin the don */
    expect(screen.getByText('ORD-2026-1001')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByText('Kệ A-02-03')).toBeInTheDocument()
  })

  it('mo modal chi tiet don khi click nut Chi tiet', async () => {
    await act(async () => {
      render(<OrderWorkflowPage />)
    })

    const detailButtons = screen.getAllByRole('button', { name: /Chi tiết/i })
    await act(async () => {
      fireEvent.click(detailButtons[0])
    })

    expect(screen.getByText('CHI TIẾT ĐƠN MƯỢN SÁCH')).toBeInTheDocument()
    const studentIdMatches = screen.getAllByText(/2251120145/)
    expect(studentIdMatches.length).toBeGreaterThan(0)
  })

  it('kiem thu quy trinh doi trang thai don tren Kanban: Don moi -> Cho gom -> San sang', async () => {
    await act(async () => {
      render(<OrderWorkflowPage />)
    })

    /* Buoc 1: Chuyen don tu Don moi sang Cho gom */
    const choGomBtn = screen.getByRole('button', { name: /Chờ gom/i })
    expect(choGomBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(choGomBtn)
    })

    /* Xac nhan da goi API updateStatus voi trang thai PROCESSING (Cho gom) */
    expect(orderApi.updateStatus).toHaveBeenCalledWith(1001, 'PROCESSING')

    /* Buoc 2: Chuyen don sang San sang lay sach */
    const readyBtn = screen.getByRole('button', { name: /Soạn xong/i })
    expect(readyBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(readyBtn)
    })

    /* Xac nhan da goi API updateStatus voi trang thai READY_FOR_PICKUP (San sang) */
    expect(orderApi.updateStatus).toHaveBeenCalledWith(1001, 'READY_FOR_PICKUP')
  })
})
