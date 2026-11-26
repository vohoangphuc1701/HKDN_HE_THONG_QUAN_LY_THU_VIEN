import axiosClient from './axiosClient'

/*
  Du lieu mau cho phien ghep doi may quet khi chua co backend.
*/
let mockLocalSession = {
  sessionToken: 'SCAN-8A2F9C',
  stationId: 'STATION-DESK-01',
  stationName: 'Trạm quét quầy 1',
  status: 'WAITING_FOR_PAIRING',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  totalScannedCount: 0
}

/*
  Du lieu mau doi soat phieu tra sach cho ReturnVerificationView.
*/
const mockReturnVerification = {
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
      note: 'Sách bảo quản tốt, quá hạn 1 ngày'
    },
    {
      detailId: 202,
      borrowDetailId: 302,
      bookId: 12,
      title: 'Cơ sở dữ liệu và SQL Server',
      author: 'Trần Thị B',
      isbn: '978-604-01-2346-8',
      shelfLocation: 'Kệ B-02-03',
      dueDate: '2026-03-05',
      overdueDays: 0,
      overdueFine: 0,
      bookCondition: 'NORMAL',
      damageFee: 0,
      itemTotalFine: 0,
      note: 'Đúng hạn trả'
    }
  ],
  totalBooks: 2,
  totalOverdueDays: 1,
  totalOverdueFine: 5000,
  totalDamageFee: 0,
  totalFineAmount: 5000,
  unpaidPreviousFines: 0
}

/*
  Dich vu API ho tro ket noi phien may quet, ghep doi thiet bi
  va doi soat nghiep vu muon tra sach tai quay.
*/
const scanApi = {
  /*
    Khoi tao phien ghep doi may quet moi.
  */
  async createSession(params = {}) {
    try {
      const res = await axiosClient.post('/scanner/session', params)
      return res?.data || res
    } catch (err) {
      console.warn('Su dung du lieu mau cho phien ghep doi:', err.message)
      const token = 'SCAN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      mockLocalSession = {
        sessionToken: token,
        stationId: params.stationId || 'STATION-DESK-01',
        stationName: params.stationName || 'Trạm quét quầy 1',
        status: 'WAITING_FOR_PAIRING',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        totalScannedCount: 0
      }
      return mockLocalSession
    }
  },

  /*
    Lay thong tin chi tiet phien quet theo sessionToken.
  */
  async getSession(sessionToken) {
    try {
      const res = await axiosClient.get(`/scanner/session/${sessionToken}`)
      return res?.data || res
    } catch (err) {
      console.warn('Su dung du lieu phien cuc bo:', err.message)
      return mockLocalSession
    }
  },

  /*
    Dien thoai di dong goi API de ghep doi voi may tinh tram quay.
  */
  async pairDevice(sessionToken, deviceId, deviceName) {
    try {
      const res = await axiosClient.post('/scanner/pair', { sessionToken, deviceId, deviceName })
      return res?.data || res
    } catch (err) {
      console.warn('Ghep doi phien cuc bo:', err.message)
      mockLocalSession = {
        ...mockLocalSession,
        sessionToken,
        deviceId: deviceId || 'DEV-MOBILE',
        deviceName: deviceName || 'Điện thoại di động',
        status: 'CONNECTED',
        pairedAt: new Date().toISOString()
      }
      return mockLocalSession
    }
  },

  /*
    Gui ma vach hoac ma QR tu dien thoai ve may tinh tram quay.
  */
  async sendScanResult(sessionToken, code, scanType = 'UNKNOWN') {
    try {
      const res = await axiosClient.post('/scanner/scan', { sessionToken, code, scanType })
      return res?.data || res
    } catch (err) {
      console.warn('Gui ma quet cuc bo:', err.message)
      mockLocalSession.totalScannedCount = (mockLocalSession.totalScannedCount || 0) + 1
      mockLocalSession.lastScannedCode = code
      mockLocalSession.lastScanType = scanType
      return {
        event: 'SCAN_DATA_RECEIVED',
        sessionToken,
        code,
        scanType,
        timestamp: new Date().toISOString()
      }
    }
  },

  /*
    Ngat ket noi dien thoai khoi phien quet.
  */
  async disconnectDevice(sessionToken) {
    try {
      const res = await axiosClient.post(`/scanner/disconnect?sessionToken=${sessionToken}`)
      return res?.data || res
    } catch (err) {
      mockLocalSession.status = 'DISCONNECTED'
      return { status: 'DISCONNECTED', sessionToken }
    }
  },

  /*
    Doi soat ma QR phieu hen tra sach tai quay.
  */
  async verifyReturnQr(code) {
    try {
      const res = await axiosClient.post('/operations/verify-return-qr', { code })
      return res?.data || res
    } catch (err) {
      console.warn('Su dung du lieu mau cho doi soat phieu tra:', err.message)
      return {
        ...mockReturnVerification,
        ticketCode: code || 'RT-2026-001'
      }
    }
  },

  /*
    Ban giao sach tai quay sau khi quet ma QR don muon.
  */
  async handoverBorrowOrder(orderCode) {
    try {
      const res = await axiosClient.post(`/operations/handover?orderCode=${orderCode}`)
      return res?.data || res
    } catch (err) {
      console.warn('Xac nhan ban giao mau:', err.message)
      return {
        orderCode,
        status: 'BORROWED',
        actualPickupDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  },

  /*
    Xac nhan hoan tat nhan tra sach tai quay va cap nhat kho.
  */
  async completeReturn(ticketId, payload = {}) {
    try {
      const res = await axiosClient.post(`/returns/${ticketId}/complete`, payload)
      return res?.data || res
    } catch (err) {
      console.warn('Hoan tat tra sach mau:', err.message)
      return {
        ticketId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        message: 'Hoàn tất nhận trả sách và cập nhật số lượng tồn kho thành công'
      }
    }
  },

  /*
    Luu ma quet vao bo nho dem ngoai tuyen (Offline Queue) khi mat ket noi mang.
  */
  saveOfflineScan(code, scanType = 'UNKNOWN') {
    const queueKey = 'library_offline_scan_queue'
    const existing = this.getOfflineQueue()
    const scanItem = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      code,
      scanType,
      timestamp: new Date().toISOString()
    }
    const updated = [...existing, scanItem]
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(queueKey, JSON.stringify(updated))
    }
    return scanItem
  },

  /*
    Lay danh sach ma quet ngoai tuyen dang cho dong bo.
  */
  getOfflineQueue() {
    const queueKey = 'library_offline_scan_queue'
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(queueKey)
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }
    return []
  },

  /*
    Xoa sach danh sach hang doi ngoai tuyen sau khi da dong bo.
  */
  clearOfflineQueue() {
    const queueKey = 'library_offline_scan_queue'
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(queueKey)
    }
  },

  /*
    Dong bo hang doi ngoai tuyen len may chu khi mang duoc phuc hoi.
  */
  async syncOfflineQueue() {
    const queue = this.getOfflineQueue()
    if (!queue || queue.length === 0) return { syncedCount: 0 }

    const results = []
    for (const item of queue) {
      try {
        const res = await this.sendScanResult(mockLocalSession.sessionToken, item.code, item.scanType)
        results.push(res)
      } catch (err) {
        console.warn('Loi dong bo ma quet offline:', item.code, err.message)
      }
    }
    this.clearOfflineQueue()
    return { syncedCount: results.length, items: results }
  }
}

export default scanApi
