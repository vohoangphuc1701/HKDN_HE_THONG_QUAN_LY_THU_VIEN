import { describe, expect, it, vi } from 'vitest'
import socketClient from '../services/socketClient'
import scanApi from '../services/scanApi'

/*
 * Kiem thu hieu nang toc do quet ma QR phieu tra va ty le nhan dien qua dien thoai di dong.
 * Bao gom do do tre phan hoi duoi 200ms, ty le nhan dien 100% tren nhieu ma phieu tra khac nhau,
 * va xu ly tai quet don dap (burst scanning) qua socketClient.
 */
describe('QR Scan Performance Test', () => {
  it('do do tre xu ly va doi soat ma QR phieu tra dat chuan duoi 200ms', async () => {
    const returnTicketCode = 'RT-2026-PERF-001'

    const startTime = performance.now()
    const verifyResult = await scanApi.verifyReturnQr(returnTicketCode)
    const duration = performance.now() - startTime

    expect(verifyResult).toBeDefined()
    expect(verifyResult.ticketCode).toBe(returnTicketCode)
    // Do tre xu ly phai dat duoi 200ms
    expect(duration).toBeLessThan(200)
  })

  it('ty le nhan dien thanh cong dat 100% qua danh sach cac ma phieu tra da dang', async () => {
    const ticketCodes = [
      'RT-2026-001',
      'RT-2026-002',
      'RT-2026-003',
      'RET-990011',
      'RET-990022',
      'TK-2026-UTH-01',
      'TK-2026-UTH-02',
      'RT-UTH-CNTT-05',
      'RT-UTH-LOG-12',
      'RT-UTH-CK-09'
    ]

    let recognizedCount = 0

    for (const code of ticketCodes) {
      const res = await scanApi.verifyReturnQr(code)
      if (res && res.ticketCode === code) {
        recognizedCount++
      }
    }

    const recognitionRate = (recognizedCount / ticketCodes.length) * 100
    // Ty le nhan dien phai dat 100%
    expect(recognitionRate).toBe(100)
    expect(recognizedCount).toBe(ticketCodes.length)
  })

  it('nhan dien va truyen du lieu quet tu dien thoai qua socketClient tuc thi khong co do tre', () => {
    const receivedEvents = []
    const unsubscribe = socketClient.subscribe('/topic/scan-station', (data) => {
      receivedEvents.push(data)
    })

    const mobileScans = [
      { code: 'RT-2026-M01', scanType: 'RETURN_TICKET' },
      { code: 'RT-2026-M02', scanType: 'RETURN_TICKET' },
      { code: 'RT-2026-M03', scanType: 'RETURN_TICKET' }
    ]

    const startTime = performance.now()
    mobileScans.forEach((scan) => {
      socketClient.publish('/topic/scan-station', {
        event: 'SCAN_DATA_RECEIVED',
        code: scan.code,
        scanType: scan.scanType
      })
    })
    const totalTime = performance.now() - startTime

    expect(receivedEvents.length).toBe(3)
    expect(receivedEvents[0].code).toBe('RT-2026-M01')
    expect(receivedEvents[2].code).toBe('RT-2026-M03')
    expect(totalTime).toBeLessThan(100)

    unsubscribe()
  })

  it('xu ly tai quet don dap (burst scanning) 50 ma lien tiep khong bi loi hay roi rac goi tin', () => {
    const receivedCodes = []
    const unsubscribe = socketClient.subscribe('/topic/scan-station', (data) => {
      if (data?.event === 'SCAN_DATA_RECEIVED') {
        receivedCodes.push(data.code)
      }
    })

    const totalBurstCount = 50
    for (let i = 1; i <= totalBurstCount; i++) {
      socketClient.publish('/topic/scan-station', {
        event: 'SCAN_DATA_RECEIVED',
        code: `RT-BURST-${i.toString().padStart(3, '0')}`,
        scanType: 'RETURN_TICKET'
      })
    }

    expect(receivedCodes.length).toBe(totalBurstCount)
    expect(receivedCodes[0]).toBe('RT-BURST-001')
    expect(receivedCodes[totalBurstCount - 1]).toBe('RT-BURST-050')

    unsubscribe()
  })
})
