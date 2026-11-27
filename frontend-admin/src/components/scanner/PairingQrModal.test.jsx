import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PairingQrModal from './PairingQrModal'

vi.mock('../../services/scanApi', () => {
  return {
    default: {
      createSession: vi.fn(() =>
        Promise.resolve({
          sessionToken: 'SCAN-8A2F9C',
          stationId: 'STATION-DESK-01',
          stationName: 'Trạm quét quầy 1',
          status: 'WAITING_FOR_PAIRING',
          createdAt: new Date().toISOString()
        })
      ),
      getSession: vi.fn(() =>
        Promise.resolve({
          sessionToken: 'SCAN-8A2F9C',
          status: 'WAITING_FOR_PAIRING'
        })
      )
    }
  }
})

describe('PairingQrModal', () => {
  it('khoi tao va hien thi ma QR ghep doi tren laptop khi isOpen la true', async () => {
    await act(async () => {
      render(<PairingQrModal isOpen={true} onClose={() => {}} />)
    })

    expect(screen.getByText('Ghép đôi điện thoại làm máy quét')).toBeInTheDocument()
    expect(screen.getByText('SCAN-8A2F9C')).toBeInTheDocument()
    expect(screen.getByText('Đang chờ điện thoại kết nối...')).toBeInTheDocument()
  })

  it('khong render giao dien khi isOpen la false', () => {
    const { container } = render(<PairingQrModal isOpen={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
