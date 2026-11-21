import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ScanStationPage from './ScanStationPage'

vi.mock('../components/scanner/Html5QrScanner', () => {
  return {
    default: () => <div data-testid="mock-html5-scanner">Mock Camera Scanner</div>
  }
})

vi.mock('../services/scanApi', () => {
  return {
    default: {
      createSession: vi.fn(() =>
        Promise.resolve({
          sessionToken: 'SCAN-8A2F9C',
          stationId: 'STATION-DESK-01',
          stationName: 'Trạm quét quầy 1',
          status: 'WAITING_FOR_PAIRING'
        })
      ),
      getSession: vi.fn(() =>
        Promise.resolve({
          sessionToken: 'SCAN-8A2F9C',
          status: 'WAITING_FOR_PAIRING'
        })
      ),
      verifyReturnQr: vi.fn(() =>
        Promise.resolve({
          scanType: 'RETURN_TICKET',
          ticketId: 101,
          ticketCode: 'RT-2026-001',
          ticketStatus: 'PENDING_RETURN',
          scheduledReturnDate: '2026-03-05',
          student: {
            fullName: 'Trần Thị Mai',
            username: '2251120032'
          },
          items: [],
          totalBooks: 0,
          totalOverdueFine: 0,
          totalDamageFee: 0,
          totalFineAmount: 0
        })
      ),
      handoverBorrowOrder: vi.fn(() =>
        Promise.resolve({
          orderCode: 'ORD-2026-1001',
          status: 'BORROWED'
        })
      )
    }
  }
})

describe('ScanStationPage', () => {
  it('hien thi dung tieu de tram quet va cac nut chuc nang', () => {
    render(<ScanStationPage />)

    expect(screen.getByText('Trạm quét QR tại quầy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ghép đôi điện thoại/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nhập mã thủ công/i })).toBeInTheDocument()
    expect(screen.getByText('Camera quét trực tiếp tại quầy')).toBeInTheDocument()
  })

  it('mo modal ghep doi dien thoai khi nhan nut Ghep doi', async () => {
    render(<ScanStationPage />)

    const pairBtn = screen.getByRole('button', { name: /Ghép đôi điện thoại/i })
    await act(async () => {
      fireEvent.click(pairBtn)
    })

    expect(screen.getByText('Ghép đôi điện thoại làm máy quét')).toBeInTheDocument()
  })
})
