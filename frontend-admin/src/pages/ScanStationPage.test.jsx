import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ScanStationPage from './ScanStationPage'

describe('ScanStationPage', () => {
  it('hien thi dung bo cuc khung quet ScanStationPage va san sang nhan ma', async () => {
    await act(async () => {
      render(<ScanStationPage />)
    })

    expect(screen.getByText('Trạm quét QR tại quầy')).toBeInTheDocument()
    expect(screen.getByText('Khung quét mã trực tiếp tại quầy')).toBeInTheDocument()
    expect(screen.getByText('Khung quét sẵn sàng nhận mã')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/VD: 2251120145 hoặc ORD-2026-1001/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tra cứu/i })).toBeInTheDocument()
    expect(screen.getByText(/Lịch sử quét trong ca trực/i)).toBeInTheDocument()
  })

  it('thiet ke giao dien the sinh vien (Student Info Card) sau khi quet ma QR thanh cong', async () => {
    await act(async () => {
      render(<ScanStationPage />)
    })

    /* Mo phong quet thanh cong ma sinh vien 2251120145 */
    const quickBtn = screen.getByRole('button', { name: /\+ SV Nguyễn Văn An/i })
    await act(async () => {
      fireEvent.click(quickBtn)
    })

    /* Kiem tra giao dien the sinh vien hien thi day du cac truong thong tin */
    expect(screen.getAllByText('Nguyễn Văn An').length).toBeGreaterThan(0)
    expect(screen.getByText(/MSSV: 2251120145/i)).toBeInTheDocument()
    expect(screen.getByText('Khoa Công nghệ Thông tin')).toBeInTheDocument()
    expect(screen.getByText('an.nguyen@uth.edu.vn')).toBeInTheDocument()
    expect(screen.getByText('Thẻ hợp lệ')).toBeInTheDocument()
    expect(screen.getByText('2 / 5 cuốn')).toBeInTheDocument()
    expect(screen.getByText(/Không nợ phạt thư viện/i)).toBeInTheDocument()

    /* Kiem tra thong tin don muon lien quan */
    expect(screen.getByText(/Đơn mượn đang chờ nhận: #ORD-2026-1001/i)).toBeInTheDocument()
    expect(screen.getByText('Kỹ thuật lập trình Java nâng cao')).toBeInTheDocument()
    expect(screen.getByText('Kệ A-01-01')).toBeInTheDocument()

    /* Kiem tra cac nut hanh dong tai quay */
    expect(screen.getByRole('button', { name: /Xác nhận bàn giao sách/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /In phiếu hẹn/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Quét thẻ khác/i })).toBeInTheDocument()
  })

  it('xac nhan ban giao sach cho sinh vien tai quay trong vong 30 giay', async () => {
    await act(async () => {
      render(<ScanStationPage />)
    })

    /* Quet the sinh vien */
    const quickBtn = screen.getByRole('button', { name: /\+ SV Nguyễn Văn An/i })
    await act(async () => {
      fireEvent.click(quickBtn)
    })

    /* Nhan nut xac nhan ban giao sach */
    const handoverBtn = screen.getByRole('button', { name: /Xác nhận bàn giao sách/i })
    await act(async () => {
      fireEvent.click(handoverBtn)
    })

    /* Hien thi thong bao ban giao thanh cong */
    expect(screen.getByText('Đã bàn giao sách cho sinh viên thành công!')).toBeInTheDocument()
    expect(screen.getByText(/Hạn trả mới: 14 ngày tới/i)).toBeInTheDocument()
  })

  it('canh bao no phat tren the sinh vien khi sinh vien co sach qua han chua nop phat', async () => {
    await act(async () => {
      render(<ScanStationPage />)
    })

    /* Quet the sinh vien co no phat 2251120032 */
    const quickBtn = screen.getByRole('button', { name: /\+ SV Trần Thị Mai/i })
    await act(async () => {
      fireEvent.click(quickBtn)
    })

    expect(screen.getAllByText('Trần Thị Mai').length).toBeGreaterThan(0)
    expect(screen.getByText('25.000 đ')).toBeInTheDocument()
    expect(screen.getByText(/Có sách trễ hạn chưa nộp phạt/i)).toBeInTheDocument()
  })
})
