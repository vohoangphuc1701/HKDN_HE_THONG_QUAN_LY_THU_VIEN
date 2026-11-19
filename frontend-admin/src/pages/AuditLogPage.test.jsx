import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuditLogPage from './AuditLogPage'

describe('AuditLogPage', () => {
  it('hien thi dung danh sach nhat ky kiem toan thao tac nhan vien', async () => {
    await act(async () => {
      render(<AuditLogPage />)
    })

    expect(screen.getByText('Nhật ký hoạt động & Kiểm toán thao tác (Audit Log)')).toBeInTheDocument()
    expect(screen.getByText('Tổng số thao tác ghi nhận')).toBeInTheDocument()
    expect(screen.getAllByText('Lê Văn Hùng').length).toBeGreaterThan(0)
    expect(screen.getByText('Bàn giao sách tại quầy')).toBeInTheDocument()
  })

  it('chuyen doi duoc che do xem sang Dong thoi gian (Timeline View)', async () => {
    await act(async () => {
      render(<AuditLogPage />)
    })

    const timelineBtn = screen.getByRole('button', { name: /Dòng thời gian/i })
    await act(async () => {
      fireEvent.click(timelineBtn)
    })

    expect(timelineBtn).toHaveClass('button--primary')
  })
})
