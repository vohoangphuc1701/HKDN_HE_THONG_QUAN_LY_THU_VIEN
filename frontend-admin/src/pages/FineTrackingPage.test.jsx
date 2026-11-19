import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FineTrackingPage from './FineTrackingPage'

describe('FineTrackingPage', () => {
  it('hien thi dung cac the thong ke tien phat va danh sach bien lai', async () => {
    await act(async () => {
      render(<FineTrackingPage />)
    })

    expect(screen.getByText('Quản lý nợ phạt & Ghi nhận thu phạt')).toBeInTheDocument()
    expect(screen.getByText('Tổng tiền nợ phạt (chưa thu)')).toBeInTheDocument()
    expect(screen.getByText('Tổng tiền phạt đã thu thành công')).toBeInTheDocument()
    expect(screen.getByText('FN-2026-001')).toBeInTheDocument()
    expect(screen.getByText('Phạm Quốc Bảo')).toBeInTheDocument()
  })

  it('mo modal ghi nhan thu phat khi nhan nut Thu phat', async () => {
    await act(async () => {
      render(<FineTrackingPage />)
    })

    const collectButtons = screen.getAllByRole('button', { name: /Thu phạt/i })
    await act(async () => {
      fireEvent.click(collectButtons[0])
    })

    expect(screen.getByText('Ghi nhận thu tiền phạt tại quầy')).toBeInTheDocument()
    expect(screen.getByText('Xác nhận đã thu phạt')).toBeInTheDocument()
  })
})
