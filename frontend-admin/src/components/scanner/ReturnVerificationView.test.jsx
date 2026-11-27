import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ReturnVerificationView from './ReturnVerificationView'

const sampleVerificationData = {
  scanType: 'RETURN_TICKET',
  ticketId: 101,
  ticketCode: 'RT-2026-001',
  ticketStatus: 'PENDING_RETURN',
  scheduledReturnDate: '2026-03-05',
  student: {
    studentId: 15,
    fullName: 'Nguyễn Văn An',
    username: '2251120145',
    email: 'an.nguyen@uth.edu.vn',
    phone: '0912345678'
  },
  items: [
    {
      detailId: 201,
      borrowDetailId: 301,
      bookId: 10,
      title: 'Kỹ thuật lập trình Java nâng cao',
      author: 'Nguyễn Văn A',
      isbn: '978-604-01-2345-1',
      shelfLocation: 'Kệ A-01-01',
      dueDate: '2026-03-04',
      overdueDays: 1,
      overdueFine: 5000,
      bookCondition: 'NORMAL',
      damageFee: 0,
      itemTotalFine: 5000,
      note: 'Sách bảo quản tốt'
    }
  ],
  totalBooks: 1,
  totalOverdueDays: 1,
  totalOverdueFine: 5000,
  totalDamageFee: 0,
  totalFineAmount: 5000,
  unpaidPreviousFines: 0
}

describe('ReturnVerificationView', () => {
  it('hien thi dung thong tin phieu hen tra, sinh vien va danh sach sach doi soat', () => {
    render(<ReturnVerificationView verificationData={sampleVerificationData} />)

    expect(screen.getByText('Đối soát Phiếu hẹn trả sách')).toBeInTheDocument()
    expect(screen.getByText('RT-2026-001')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByText('2251120145')).toBeInTheDocument()
    expect(screen.getByText('Kỹ thuật lập trình Java nâng cao')).toBeInTheDocument()
    expect(screen.getByText('+1 ngày')).toBeInTheDocument()
  })

  it('tinh toan lai tong tien phat khi dieu chinh phi hu hai sach', async () => {
    render(<ReturnVerificationView verificationData={sampleVerificationData} />)

    const damageInput = screen.getByDisplayValue('0')
    await act(async () => {
      fireEvent.change(damageInput, { target: { value: '25000' } })
    })

    /* Tong tien phat = 5.000 qua han + 25.000 hu hai = 30.000 VND */
    expect(screen.getByText('30.000 VNĐ')).toBeInTheDocument()
  })
})
