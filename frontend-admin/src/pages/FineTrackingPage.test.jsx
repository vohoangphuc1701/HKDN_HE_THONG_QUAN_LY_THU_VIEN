import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import FineTrackingPage from './FineTrackingPage'

describe('FineTrackingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('hien thi dung cac the thong ke tien phat va danh sach bien lai', async () => {
    await act(async () => {
      render(<FineTrackingPage />)
    })

    expect(screen.getByText('Quản lý nợ phạt & Ghi nhận thu phạt')).toBeInTheDocument()
    expect(screen.getByText('Tổng tiền nợ phạt (chưa thu)')).toBeInTheDocument()
    expect(screen.getByText('Tổng tiền phạt đã thu thành công')).toBeInTheDocument()
    expect(await screen.findByText('FN-2026-001')).toBeInTheDocument()
    expect(screen.getByText('Phạm Quốc Bảo')).toBeInTheDocument()
  })

  it('mo modal ghi nhan thu phat khi nhan nut Thu phat', async () => {
    await act(async () => {
      render(<FineTrackingPage />)
    })
    await screen.findByText('FN-2026-001')

    const collectButtons = screen.getAllByRole('button', { name: /Thu phạt/i })
    await act(async () => {
      fireEvent.click(collectButtons[0])
    })

    expect(screen.getByText('Ghi nhận thu tiền phạt tại quầy')).toBeInTheDocument()
    expect(screen.getByText('Xác nhận đã thu phạt')).toBeInTheDocument()
  })

  it('kiem thu quy trinh xac nhan thu tien phat va phi hu hai sach tai quay thanh cong', async () => {
    await act(async () => {
      render(<FineTrackingPage />)
    })
    await screen.findByText('FN-2026-001')

    /* Chon thu phat bien lai FN-2026-002 co ca phi hu hai sach 15.000d */
    const collectButtons = screen.getAllByRole('button', { name: /Thu phạt/i })
    await act(async () => {
      fireEvent.click(collectButtons[1] || collectButtons[0])
    })

    expect(screen.getByText('Ghi nhận thu tiền phạt tại quầy')).toBeInTheDocument()

    /* Chon phuong thuc thanh toan VietQR */
    const transferRadio = screen.getByLabelText(/Chuyển khoản VietQR/i)
    await act(async () => {
      fireEvent.click(transferRadio)
    })
    expect(transferRadio).toBeChecked()

    /* Nhan nut xac nhan thu phat */
    const submitBtn = screen.getByRole('button', { name: /Xác nhận đã thu phạt/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    /* Modal dong lai va hien thi thong bao thanh cong */
    expect(screen.queryByText('Ghi nhận thu tiền phạt tại quầy')).not.toBeInTheDocument()
  })

  it('kiem thu quy trinh xem bien nhan va in bien lai thu phat (Receipt printing)', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    await act(async () => {
      render(<FineTrackingPage />)
    })
    await screen.findByText('FN-2026-001')

    /* Tim va nhan nut In bien lai tren danh sach bien lai da thanh toan */
    const printReceiptButtons = screen.getAllByRole('button', { name: /In biên lai/i })
    await act(async () => {
      fireEvent.click(printReceiptButtons[0])
    })

    /* Kiem tra giao dien modal bien lai hien thi day du thong tin */
    expect(screen.getByText(/Biên nhận thu phạt/i)).toBeInTheDocument()
    expect(screen.getByText('Thư viện ĐH Giao thông Vận tải TP.HCM (UTH)')).toBeInTheDocument()
    expect(screen.getByText('Người nộp phạt:')).toBeInTheDocument()
    expect(screen.getByText('Mã số sinh viên (MSSV):')).toBeInTheDocument()
    expect(screen.getByText('Tổng số tiền đã thu:')).toBeInTheDocument()

    /* Nhan nut In bien lai trong modal */
    const allPrintBtns = screen.getAllByRole('button', { name: /In biên lai/i })
    const printBtnInModal = allPrintBtns[allPrintBtns.length - 1]
    await act(async () => {
      fireEvent.click(printBtnInModal)
    })

    /* Xac nhan da goi ham window.print() de in bien lai cho sinh vien */
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })
})
