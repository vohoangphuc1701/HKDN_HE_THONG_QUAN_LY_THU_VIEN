import { render, screen, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Html5QrScanner from './Html5QrScanner'

// Gia lap thu vien html5-qrcode cho moi truong kiem thu jsdom
vi.mock('html5-qrcode', () => {
  return {
    Html5Qrcode: class {
      static getCameras() {
        return Promise.resolve([
          { id: 'cam1', label: 'Camera truoc' },
          { id: 'cam2', label: 'Camera sau' }
        ])
      }
      constructor() {
        this.isScanning = false
      }
      start() {
        this.isScanning = true
        return Promise.resolve()
      }
      stop() {
        this.isScanning = false
        return Promise.resolve()
      }
      clear() {
        return Promise.resolve()
      }
      scanFile() {
        return Promise.resolve('BORROW|ORDER_99|SV12345|2026-11-14')
      }
    }
  }
})

describe('Html5QrScanner', () => {
  it('hien thi dung giao dien khoi tao va cac nut dieu khien', async () => {
    await act(async () => {
      render(<Html5QrScanner />)
    })

    expect(screen.getByText('Máy quét mã QR trực tuyến')).toBeInTheDocument()
    expect(screen.getByText('Bắt đầu quét')).toBeInTheDocument()
    expect(screen.getByText('Tải ảnh QR')).toBeInTheDocument()
    expect(screen.getByText('Camera đang ở trạng thái nghỉ')).toBeInTheDocument()
  })
})
