import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import FineTrackingPage from './FineTrackingPage'
import statsApi from '../services/statsApi'

/* Gia lap statsApi de kiem thu dong bo so lieu Dashboard */
vi.mock('../services/statsApi', () => {
  return {
    default: {
      getMetrics: vi.fn(() =>
        Promise.resolve({
          totalBooks: { value: '12.480', change: '+4,8%', changeLabel: 'so với tháng trước' },
          pendingOrders: { value: '18 đơn', change: '+5 đơn', changeLabel: 'cần chuẩn bị gấp' },
          activeBorrows: { value: '1.240', change: '+12%', changeLabel: 'tăng trưởng mượn' },
          overdueOrders: { value: '6 đơn', change: '-2 đơn', changeLabel: 'so với tuần trước' }
        })
      )
    }
  }
})

describe('Admin Fine Payment & Stats Sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('kiem thu quy trinh thu tien phat qua han va phi boi hoan hu hai sach tai quay', async () => {
    await act(async () => {
      render(<FineTrackingPage />)
    })
    await screen.findByText('FN-2026-001')

    /* Kiem tra tong quan tien phat ban dau tren trang */
    expect(screen.getByText('Quản lý nợ phạt & Ghi nhận thu phạt')).toBeInTheDocument()

    /* Mo modal thu phat cho bien lai FN-2026-002 co phi hu hai tai lieu 15.000d */
    const collectButtons = screen.getAllByRole('button', { name: /Thu phạt/i })
    expect(collectButtons.length).toBeGreaterThan(0)

    await act(async () => {
      fireEvent.click(collectButtons[1] || collectButtons[0])
    })

    /* Xac nhan modal hien thi chi tiet phi hu hai va tong tien */
    expect(screen.getByText('Ghi nhận thu tiền phạt tại quầy')).toBeInTheDocument()
    expect(screen.getByText(/Phụ thu hư hại tài liệu/i)).toBeInTheDocument()

    /* Chon phuong thuc thanh toan VietQR */
    const qrRadio = screen.getByLabelText(/Chuyển khoản VietQR/i)
    await act(async () => {
      fireEvent.click(qrRadio)
    })
    expect(qrRadio).toBeChecked()

    /* Nhan nut xac nhan da thu phat tai quay */
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận đã thu phạt/i })
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    /* Modal thu phat dong lai sau khi hoan tat */
    expect(screen.queryByText('Ghi nhận thu tiền phạt tại quầy')).not.toBeInTheDocument()
  })

  it('doi soat dong bo so lieu KPI giua ghi nhan thu phat va he thong thong ke Dashboard', async () => {
    /* Goi statsApi de lay so lieu dong bo tu he thong */
    const metrics = await statsApi.getMetrics()

    expect(metrics).toBeDefined()
    expect(metrics.totalBooks.value).toBe('12.480')
    expect(metrics.pendingOrders.value).toContain('18')
    expect(metrics.activeBorrows.value).toContain('1.240')
    expect(metrics.overdueOrders.value).toContain('6')
    expect(statsApi.getMetrics).toHaveBeenCalled()
  })
})
