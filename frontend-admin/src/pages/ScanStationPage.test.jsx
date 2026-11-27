import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ScanStationPage from './ScanStationPage'
import socketClient from '../services/socketClient'
import scanApi from '../services/scanApi'

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
      verifyReturnQr: vi.fn((code) =>
        Promise.resolve({
          scanType: 'RETURN_TICKET',
          ticketId: 101,
          ticketCode: code || 'RT-2026-001',
          ticketStatus: 'PENDING_RETURN',
          scheduledReturnDate: '2026-03-05',
          student: {
            fullName: 'Trần Thị Mai',
            username: '2251120032'
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
        })
      ),
      completeReturn: vi.fn(() =>
        Promise.resolve({
          ticketId: 101,
          status: 'COMPLETED',
          message: 'Hoàn tất nhận trả sách và cập nhật số lượng tồn kho thành công'
        })
      ),
      handoverBorrowOrder: vi.fn(() =>
        Promise.resolve({
          orderCode: 'ORD-2026-1001',
          status: 'BORROWED'
        })
      ),
      saveOfflineScan: vi.fn((code, scanType) => ({
        id: 'offline-01',
        code,
        scanType,
        timestamp: new Date().toISOString()
      })),
      getOfflineQueue: vi.fn(() => []),
      clearOfflineQueue: vi.fn(),
      syncOfflineQueue: vi.fn(() => Promise.resolve({ syncedCount: 1 }))
    }
  }
})

describe('ScanStationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('ket noi socketClient: dien thoai quet ma -> laptop hien thi tuc thi ReturnVerificationView', async () => {
    render(<ScanStationPage />)

    // Dien thoai di dong ban su kien SCAN_DATA_RECEIVED qua WebSocket socketClient
    await act(async () => {
      socketClient.publish('/topic/scan-station', {
        event: 'SCAN_DATA_RECEIVED',
        code: 'RT-2026-001',
        scanType: 'RETURN_TICKET'
      })
    })

    // Laptop lap tuc hien thi giao dien doi soat phieu tra ReturnVerificationView
    expect(scanApi.verifyReturnQr).toHaveBeenCalledWith('RT-2026-001')
    expect(await screen.findByText('Đối soát Phiếu hẹn trả sách')).toBeInTheDocument()
    expect(screen.getAllByText('RT-2026-001').length).toBeGreaterThan(0)
    expect(screen.getByText('Trần Thị Mai')).toBeInTheDocument()
  })

  it('ket noi socketClient: ghep doi dien thoai thanh cong va hien thi thong bao thiet bi', async () => {
    render(<ScanStationPage />)

    await act(async () => {
      socketClient.publish('/topic/scan-station', {
        event: 'DEVICE_PAIRED',
        deviceName: 'iPhone 15 Pro Max',
        sessionToken: 'SCAN-8A2F9C'
      })
    })

    expect(await screen.findByText(/Đã ghép đôi với điện thoại: iPhone 15 Pro Max/i)).toBeInTheDocument()
  })

  it('xu ly ngoai le mat mang khi quet QR va luu vao bo nho dem ngoai tuyen (Offline Queue)', async () => {
    // Gia lap trang thai mat mang ngoai tuyen
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    render(<ScanStationPage />)

    await act(async () => {
      socketClient.publish('/topic/scan-station', {
        event: 'SCAN_DATA_RECEIVED',
        code: 'RT-2026-OFFLINE-01',
        scanType: 'RETURN_TICKET'
      })
    })

    // Kiem tra ham saveOfflineScan da duoc kich hoat de luu vao offline queue
    expect(scanApi.saveOfflineScan).toHaveBeenCalledWith('RT-2026-OFFLINE-01', 'RETURN_TICKET')
    expect(await screen.findByText(/Mất mạng! Mã RT-2026-OFFLINE-01 đã lưu vào bộ nhớ đệm ngoại tuyến/i)).toBeInTheDocument()

    // Khoi phuc lai gia tri ban dau
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
  })
})
