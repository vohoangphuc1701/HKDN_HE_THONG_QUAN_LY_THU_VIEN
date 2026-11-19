import { useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileText,
  Filter,
  Layers,
  List,
  MapPin,
  Package,
  Receipt,
  Search,
  Shield,
  User,
  X
} from 'lucide-react'
import axiosClient from '../services/axiosClient'

/* Du lieu mau nhat ky hoat dong he thong cua nhan vien thu vien */
const initialAuditLogs = [
  {
    id: 'LOG-1008',
    timestamp: '2026-03-05 10:15:32',
    date: '2026-03-05',
    time: '10:15',
    librarianName: 'Lê Văn Hùng',
    librarianRole: 'Thủ thư quầy 1',
    action: 'HANDOVER_BOOK',
    actionLabel: 'Bàn giao sách tại quầy',
    badgeColor: '#16a34a',
    target: 'Đơn #ORD-2026-1001',
    studentId: '2251120145',
    channel: 'Máy quét QR tại quầy',
    ipAddress: '192.168.1.15',
    description: 'Xác thực mã QR thành công, đã bàn giao 02 cuốn sách cho sinh viên Nguyễn Văn An.'
  },
  {
    id: 'LOG-1007',
    timestamp: '2026-03-05 09:42:10',
    date: '2026-03-05',
    time: '09:42',
    librarianName: 'Trần Thị Thu',
    librarianRole: 'Thủ thư kho sách',
    action: 'STOCK_IN',
    actionLabel: 'Nhập kho sách bổ sung',
    badgeColor: '#2563eb',
    target: 'Đầu sách #UTH-CNTT-0101',
    studentId: 'N/A',
    channel: 'Web Admin',
    ipAddress: '192.168.1.20',
    description: 'Nhập bổ sung +10 bản sách "Kỹ thuật lập trình Java nâng cao". Tổng số lượng kho tăng lên 25 bản.'
  },
  {
    id: 'LOG-1006',
    timestamp: '2026-03-05 09:10:45',
    date: '2026-03-05',
    time: '09:10',
    librarianName: 'Lê Văn Hùng',
    librarianRole: 'Thủ thư quầy 1',
    action: 'COLLECT_FINE',
    actionLabel: 'Thu tiền phạt trễ hạn',
    badgeColor: '#dc2626',
    target: 'Biên lai #FN-2026-003',
    studentId: '2351120099',
    channel: 'Web Admin',
    ipAddress: '192.168.1.15',
    description: 'Ghi nhận thu 30.000 VNĐ tiền phạt quá hạn 6 ngày qua phương thức Chuyển khoản VietQR.'
  },
  {
    id: 'LOG-1005',
    timestamp: '2026-03-05 08:35:18',
    date: '2026-03-05',
    time: '08:35',
    librarianName: 'Trần Thị Thu',
    librarianRole: 'Thủ thư kho sách',
    action: 'PREPARE_ORDER',
    actionLabel: 'Soạn xong đơn mượn',
    badgeColor: '#f59e0b',
    target: 'Đơn #ORD-2026-1002',
    studentId: '2251120032',
    channel: 'Web Admin',
    ipAddress: '192.168.1.20',
    description: 'Gom đủ 01 cuốn từ Kệ B-01-02, chuyển trạng thái đơn sang Sẵn sàng lấy sách tại Ngăn B2.'
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-03-04 16:20:05',
    date: '2026-03-04',
    time: '16:20',
    librarianName: 'Nguyễn Minh Quân',
    librarianRole: 'Quản trị viên hệ thống',
    action: 'UPDATE_BOOK',
    actionLabel: 'Cập nhật thông tin sách',
    badgeColor: '#7c3aed',
    target: 'Đầu sách #UTH-LOG-0301',
    studentId: 'N/A',
    channel: 'Web Admin',
    ipAddress: '192.168.1.10',
    description: 'Điều chỉnh vị trí kệ lưu trữ từ Kệ C-01 sang Kệ C-02-05 theo sơ đồ quy hoạch kho mới.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-03-04 14:05:50',
    date: '2026-03-04',
    time: '14:05',
    librarianName: 'Lê Văn Hùng',
    librarianRole: 'Thủ thư quầy 1',
    action: 'RETURN_BOOK',
    actionLabel: 'Xác nhận trả sách',
    badgeColor: '#16a34a',
    target: 'Đơn #ORD-2026-0995',
    studentId: '2151120450',
    channel: 'Máy quét QR tại quầy',
    ipAddress: '192.168.1.15',
    description: 'Nhận trả nguyên vẹn 02 cuốn giáo trình, hoàn tất cập nhật số lượng khả dụng vào kho.'
  }
]

/*
  Component AuditLogPage
  Bang theo doi lich su thao tac, nhat ky kiem toan hoat dong cua nhan vien thu vien.
  Ho tro loc theo hanh dong, nguoi thuc hien va xem o 2 che do: Dang Bang hoac Dong thoi gian (Timeline).
*/
export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedAction, setSelectedAction] = useState('ALL')
  const [viewMode, setViewMode] = useState('TABLE') // 'TABLE' hoac 'TIMELINE'
  const [selectedLog, setSelectedLog] = useState(null)

  /* Tai danh sach nhat ky hoat dong */
  async function fetchAuditLogs() {
    setLoading(true)
    try {
      let res = await axiosClient.get('/admin/audit-logs', {
        params: {
          search: searchKeyword,
          action: selectedAction !== 'ALL' ? selectedAction : undefined
        }
      })
      if (res && res.data) res = res.data
      setLogs(Array.isArray(res) ? res : initialAuditLogs)
    } catch (err) {
      console.warn('Su dung du lieu mau nhat ky kiem toan:', err.message)
      let list = [...initialAuditLogs]

      if (selectedAction !== 'ALL') {
        list = list.filter((item) => item.action === selectedAction)
      }

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase()
        list = list.filter(
          (item) =>
            item.librarianName?.toLowerCase().includes(kw) ||
            item.target?.toLowerCase().includes(kw) ||
            item.studentId?.includes(kw) ||
            item.description?.toLowerCase().includes(kw)
        )
      }

      setLogs(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  /* Thong ke nhanh */
  const totalLogs = logs.length
  const handoverLogsCount = logs.filter((l) => l.action === 'HANDOVER_BOOK' || l.action === 'RETURN_BOOK').length
  const stockLogsCount = logs.filter((l) => l.action === 'STOCK_IN' || l.action === 'UPDATE_BOOK').length
  const fineLogsCount = logs.filter((l) => l.action === 'COLLECT_FINE').length

  return (
    <div className="audit-log-page">
      {/* Thanh hanh dong va tieu de */}
      <div className="page-actions" style={{ marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#172033' }}>
            Nhật ký hoạt động & Kiểm toán thao tác (Audit Log)
          </h2>
          <p className="page-description">
            Giám sát toàn bộ thao tác duyệt đơn, xuất/nhập kho, bàn giao sách và thu phí phạt của nhân viên.
          </p>
        </div>

        {/* Chuyen doi giua Dang Bang va Dong thoi gian */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={viewMode === 'TABLE' ? 'button button--primary' : 'button button--secondary'}
            onClick={() => setViewMode('TABLE')}
            style={{ fontSize: '12px' }}
          >
            <List size={14} /> Dạng bảng
          </button>
          <button
            type="button"
            className={viewMode === 'TIMELINE' ? 'button button--primary' : 'button button--secondary'}
            onClick={() => setViewMode('TIMELINE')}
            style={{ fontSize: '12px' }}
          >
            <Clock size={14} /> Dòng thời gian
          </button>
        </div>
      </div>

      {/* 4 the thong ke chi so nhanh */}
      <div className="metric-grid" style={{ marginBottom: '16px' }}>
        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--blue">
            <Activity size={20} />
          </span>
          <div className="metric-card__body">
            <p>Tổng số thao tác ghi nhận</p>
            <strong>{totalLogs} thao tác</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--green">
            <CheckCircle2 size={20} />
          </span>
          <div className="metric-card__body">
            <p>Bàn giao & Nhận trả sách</p>
            <strong>{handoverLogsCount} lượt</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--orange">
            <Archive size={20} />
          </span>
          <div className="metric-card__body">
            <p>Nhập kho & Cập nhật sách</p>
            <strong>{stockLogsCount} lượt</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--violet">
            <Receipt size={20} />
          </span>
          <div className="metric-card__body">
            <p>Ghi nhận thu tiền phạt</p>
            <strong>{fineLogsCount} phiếu</strong>
          </div>
        </div>
      </div>

      {/* Bo loc va tim kiem */}
      <div className="panel">
        <div className="panel__header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Lịch sử thao tác nhân viên</h2>
            <p>Dữ liệu được ghi nhận tự động theo thời gian thực</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label className="filter-search" style={{ width: '280px' }}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Tìm nhân viên, mã đơn, MSSV, nội dung..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchAuditLogs()
                }}
              />
            </label>

            <select
              className="date-input"
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value)
              }}
            >
              <option value="ALL">Tất cả hành động</option>
              <option value="HANDOVER_BOOK">Bàn giao sách</option>
              <option value="RETURN_BOOK">Xác nhận trả sách</option>
              <option value="PREPARE_ORDER">Soạn đơn mượn</option>
              <option value="STOCK_IN">Nhập kho bổ sung</option>
              <option value="UPDATE_BOOK">Cập nhật sách</option>
              <option value="COLLECT_FINE">Thu tiền phạt</option>
            </select>

            <button type="submit" className="button button--secondary" onClick={fetchAuditLogs}>
              <Filter size={14} /> Lọc
            </button>
          </div>
        </div>

        {/* Hien thi Che do DANG BANG (Table View) */}
        {viewMode === 'TABLE' ? (
          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                Đang tải nhật ký thao tác...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Không tìm thấy bản ghi nhật ký nào phù hợp.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>THỜI GIAN</th>
                    <th>NHÂN VIÊN THỰC HIỆN</th>
                    <th>LOẠI HÀNH ĐỘNG</th>
                    <th>ĐỐI TƯỢNG TÁC ĐỘNG</th>
                    <th>KÊNH / THIẾT BỊ</th>
                    <th>CHI TIẾT THAO TÁC</th>
                    <th style={{ textAlign: 'right' }}>XEM</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <strong>{log.time}</strong>
                        <div style={{ fontSize: '10px', color: '#98a2b3' }}>{log.date}</div>
                      </td>
                      <td>
                        <strong>{log.librarianName}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{log.librarianRole}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: log.badgeColor + '18',
                            color: log.badgeColor
                          }}
                        >
                          {log.actionLabel}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#1e40af', fontFamily: 'monospace' }}>
                          {log.target}
                        </strong>
                        {log.studentId !== 'N/A' && (
                          <div style={{ fontSize: '10px', color: '#64748b' }}>MSSV: {log.studentId}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', color: '#475569' }}>{log.channel}</span>
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: '280px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '12px',
                            color: '#334155'
                          }}
                          title={log.description}
                        >
                          {log.description}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="icon-button"
                          title="Xem chi tiết thao tác"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* Hien thi Che do DONG THOI GIAN (Timeline View) su dung lop .timeline co san */
          <ul className="timeline">
            {logs.map((log) => (
              <li key={log.id}>
                <span className="timeline__icon" style={{ color: log.badgeColor }}>
                  <Shield size={16} />
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <strong>
                      {log.librarianName} ({log.librarianRole}) -{' '}
                      <span style={{ color: log.badgeColor }}>{log.actionLabel}</span>
                    </strong>
                    <time>{log.timestamp}</time>
                  </div>
                  <p>{log.description}</p>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                    Đối tượng: <strong>{log.target}</strong> | Kênh: {log.channel} | IP: {log.ipAddress}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL XEM CHI TIET BAN GHI NHAT KY                                        */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 65,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#172033' }}>
                  Chi tiết bản ghi nhật ký #{selectedLog.id}
                </h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Thời gian ghi nhận:</span>
                <strong>{selectedLog.timestamp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Nhân viên thực hiện:</span>
                <strong>{selectedLog.librarianName} ({selectedLog.librarianRole})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Loại hành động:</span>
                <span style={{ fontWeight: 700, color: selectedLog.badgeColor }}>{selectedLog.actionLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Đối tượng tác động:</span>
                <strong>{selectedLog.target}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kênh thực hiện:</span>
                <span>{selectedLog.channel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Địa chỉ IP máy trạm:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedLog.ipAddress}</span>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Chi tiết nội dung:</span>
                <div style={{ color: '#1e293b', lineHeight: 1.5 }}>{selectedLog.description}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedLog(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
