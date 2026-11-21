import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RemoteScannerPage from './RemoteScannerPage'

vi.mock('../services/scanApi', () => {
  return {
    default: {
      pairDevice: vi.fn((token) =>
        Promise.resolve({
          sessionToken: token,
          stationName: 'Trạm quét quầy 1',
          status: 'CONNECTED',
          deviceName: 'Apple iPhone'
        })
      ),
      sendScanResult: vi.fn(() => Promise.resolve({ success: true })),
      disconnectDevice: vi.fn(() => Promise.resolve({ success: true }))
    }
  }
})

describe('RemoteScannerPage', () => {
  it('hien thi dung man hinh nhap ma phien ghep doi khi chua co tham so tren URL', () => {
    render(
      <MemoryRouter initialEntries={['/scanner-remote']}>
        <RemoteScannerPage />
      </MemoryRouter>
    )

    expect(screen.getByText('UTH Remote Scanner')).toBeInTheDocument()
    expect(screen.getByText('Nhập mã phiên ghép đôi')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/VD: SCAN-8A2F9C/i)).toBeInTheDocument()
  })

  it('tu dong ket noi vao phien khi co query param session tren URL', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/scanner-remote?session=SCAN-TEST99']}>
          <RemoteScannerPage />
        </MemoryRouter>
      )
    })

    expect(screen.getByText('Đã ghép đôi')).toBeInTheDocument()
    expect(screen.getByText('Trạm quét quầy 1')).toBeInTheDocument()
    expect(screen.getByText('Camera đang hoạt động')).toBeInTheDocument()
  })
})
