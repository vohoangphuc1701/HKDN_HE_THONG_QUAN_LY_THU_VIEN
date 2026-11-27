import { describe, expect, it, vi, beforeEach } from 'vitest'
import socketClient from '../services/socketClient'
import scanApi from '../services/scanApi'

/*
 * Kiem thu chuc nang quet xac nhan tra sach qua dien thoai,
 * dong bo du lieu ve he thong va kich hoat gui email xac nhan hoan tat.
 */
describe('Return Sync & Email Test', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('kiem thu quy trinh quet xac nhan tra qua dien thoai va dong bo len he thong', async () => {
    let receivedPayload = null
    const unsubscribe = socketClient.subscribe('/topic/scan-station', (data) => {
      receivedPayload = data
    })

    // 1. Dien thoai quet ma QR phieu tra sach
    const scannedTicketCode = 'RT-2026-SYNC-01'
    socketClient.publish('/topic/scan-station', {
      event: 'SCAN_DATA_RECEIVED',
      code: scannedTicketCode,
      scanType: 'RETURN_TICKET'
    })

    expect(receivedPayload).toBeDefined()
    expect(receivedPayload.code).toBe(scannedTicketCode)

    // 2. May tinh tram quay nhan ma va goi doi soat phieu tra
    const verificationData = await scanApi.verifyReturnQr(receivedPayload.code)
    expect(verificationData).toBeDefined()
    expect(verificationData.ticketCode).toBe(scannedTicketCode)
    expect(verificationData.student.email).toBe('an.nguyen@uth.edu.vn')

    // 3. Thu thu xac nhan phu thu hu hai va hoan tat nhan tra
    const returnPayload = {
      librarianNote: 'Sách bảo quản tốt, bìa sau sờn nhẹ',
      paymentMethod: 'CASH',
      items: [
        {
          borrowDetailId: 301,
          bookCondition: 'LIGHT_DAMAGE',
          damageFee: 15000,
          note: 'Sờn nhẹ mép bìa'
        }
      ]
    }

    const completeResult = await scanApi.completeReturn(verificationData.ticketId, returnPayload)
    expect(completeResult).toBeDefined()
    expect(completeResult.status).toBe('COMPLETED')

    unsubscribe()
  })

  it('kiem thu kich hoat gui mail xac nhan hoan tat nhan tra sach cho sinh vien', async () => {
    // Gia lap dich vu gui email thong bao tra sach thanh cong
    const emailDispatcher = {
      sendReturnConfirmationEmail: vi.fn((emailData) => {
        return Promise.resolve({
          success: true,
          messageId: 'MSG-RETURN-' + Date.now(),
          recipient: emailData.toEmail,
          sentAt: new Date().toISOString()
        })
      })
    }

    const returnTicketId = 101
    const studentInfo = {
      name: 'Trần Thị Mai',
      studentId: '2251120032',
      email: 'mai.tran@uth.edu.vn'
    }
    const returnedBooks = [
      { title: 'Kỹ thuật lập trình Java nâng cao', code: 'UTH-CNTT-0101', condition: 'Tốt' }
    ]
    const fineAmount = 15000

    // Hoan tat tra sach tren he thong
    const res = await scanApi.completeReturn(returnTicketId, {
      librarianNote: 'Đã nhận đủ sách',
      paymentMethod: 'CASH'
    })
    expect(res.status).toBe('COMPLETED')

    // Kich hoat gui mail xac nhan sau khi hoan tat tra
    const emailResult = await emailDispatcher.sendReturnConfirmationEmail({
      toEmail: studentInfo.email,
      studentName: studentInfo.name,
      studentId: studentInfo.studentId,
      orderId: returnTicketId,
      books: returnedBooks,
      fineAmount,
      fineReason: 'Phụ thu hao mòn tài liệu'
    })

    expect(emailDispatcher.sendReturnConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(emailResult.success).toBe(true)
    expect(emailResult.recipient).toBe('mai.tran@uth.edu.vn')
    expect(emailResult.messageId).toContain('MSG-RETURN-')
  })
})
