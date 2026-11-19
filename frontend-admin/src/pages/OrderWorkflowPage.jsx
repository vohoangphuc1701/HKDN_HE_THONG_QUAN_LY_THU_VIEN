import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MapPin,
  PackageCheck,
  QrCode,
  RefreshCw,
  Search,
  Send,
  User,
  X,
  XCircle
} from 'lucide-react'
import orderApi from '../services/orderApi'

/*
  Dinh nghia 4 cot quy trinh Kanban theo tien trinh don muon sach.
*/
const KANBAN_COLUMNS = [
  {
    id: 'PENDING',
    title: 'Chờ soạn sách',
    dotClass: 'kanban-dot--orange',
    badgeColor: '#f59e0b',
    description: 'Đơn mới gửi trực tuyến, thủ thư cần gom sách từ kệ'
  },
  {
    id: 'READY_FOR_PICKUP',
    title: 'Sẵn sàng lấy sách',
    dotClass: 'kanban-dot',
    badgeColor: '#2563eb',
    description: 'Đã gom xong sách tại quầy, chờ sinh viên đến nhận'
  },
  {
    id: 'BORROWED',
    title: 'Đang mượn',
    dotClass: 'kanban-dot--green',
    badgeColor: '#16a34a',
    description: 'Đã bàn giao sách, sinh viên đang trong thời hạn mượn'
  },
  {
    id: 'COMPLETED_OR_OVERDUE',
    title: 'Quá hạn / Hoàn tất',
    dotClass: 'kanban-dot--violet',
    badgeColor: '#8b5cf6',
    description: 'Đơn quá hạn cần đôn đốc hoặc đã hoàn tất trả sách'
  }
]

/*
  Trang OrderWorkflowPage
  Giao dien Kanban board theo doi va dieu phoi tien trinh don muon sach.
*/
export default function OrderWorkflowPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('ALL')

  /* Toast phan hoi */
  const [toastMessage, setToastMessage] = useState(null)

  /* Modal chi tiet don */
  const [selectedOrder, setSelectedOrder] = useState(null)

  /* Modal ban giao nhanh bang ma QR */
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [qrInputCode, setQrInputCode] = useState('')

  /* Hien thi thong bao toast */
  function showToast(text, type = 'success') {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  /* Tai danh sach don muon tu orderApi */
  async function fetchOrders() {
    setLoading(true)
    try {
      const data = await orderApi.getAll({
        search: searchKeyword,
        pickupDate: selectedDate || undefined
      })
      setOrders(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn mượn:', err)
      showToast('Không thể tải danh sách đơn mượn', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  /* Loc don theo ca nhan sach */
  const filteredOrders = orders.filter((order) => {
    if (selectedSlot !== 'ALL' && order.pickupSlot !== selectedSlot) {
      return false
    }
    return true
  })

  /* Chuyen trang thai don muon sach */
  async function handleAdvanceStatus(order, newStatus, actionName) {
    try {
      await orderApi.updateStatus(order.id, newStatus)
      showToast(`Đã chuyển đơn #${order.orderCode} sang trạng thái ${actionName}`)
      fetchOrders()
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus
        })
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đơn: ' + err.message)
    }
  }

  /* Xu ly ban giao nhanh qua nhap ma QR */
  async function handleQuickVerifyQr(e) {
    e.preventDefault()
    if (!qrInputCode.trim()) return

    try {
      // Phan tich chuoi QR BORROW|orderId|studentId|timestamp
      let orderIdToVerify = qrInputCode.trim()
      let studentId = ''

      if (qrInputCode.includes('|')) {
        const parts = qrInputCode.split('|')
        orderIdToVerify = parts[1] || orderIdToVerify
        studentId = parts[2] || ''
      }

      const res = await orderApi.verifyPickupQr(orderIdToVerify, studentId)
      showToast(res.message || 'Xác thực nhận sách thành công!')
      setIsQrModalOpen(false)
      setQrInputCode('')
      fetchOrders()
    } catch (err) {
      alert('Không thể xác thực mã QR: ' + err.message)
    }
  }

  /* Phan loai don vao cac cot Kanban */
  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING')
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY_FOR_PICKUP')
  const borrowedOrders = filteredOrders.filter((o) => o.status === 'BORROWED')
  const overdueOrReturnedOrders = filteredOrders.filter(
    (o) => o.status === 'OVERDUE' || o.status === 'RETURNED' || o.status === 'CANCELLED'
  )

  const columnMap = {
    PENDING: pendingOrders,
    READY_FOR_PICKUP: readyOrders,
    BORROWED: borrowedOrders,
    COMPLETED_OR_OVERDUE: overdueOrReturnedOrders
  }

  return (
    <div className="order-workflow-page">
      {/* Toast phan hoi noi o goc tren */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: toastMessage.type === 'error' ? '#dc2626' : '#15803d',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Thanh hanh dong va tieu de */}
      <div className="page-actions" style={{ marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#172033' }}>
            Bảng điều phối đơn mượn (Kanban Board)
          </h2>
          <p className="page-description">
            Theo dõi tiến trình từ khâu gom sách, sẵn sàng tại quầy, bàn giao đến khi hoàn tất trả sách.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setIsQrModalOpen(true)}
            title="Nhập hoặc quét chuỗi QR để bàn giao nhanh"
          >
            <QrCode size={15} /> Quét nhận sách
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={fetchOrders}
            title="Tải lại danh sách đơn"
          >
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>
      </div>

      {/* Cac the thong ke nhanh */}
      <div className="metric-grid" style={{ marginBottom: '16px' }}>
        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--orange">
            <Clock size={20} />
          </span>
          <div className="metric-card__body">
            <p>Chờ soạn từ kệ</p>
            <strong>{pendingOrders.length} đơn</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--blue">
            <PackageCheck size={20} />
          </span>
          <div className="metric-card__body">
            <p>Sẵn sàng tại quầy</p>
            <strong>{readyOrders.length} đơn</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--green">
            <BookOpen size={20} />
          </span>
          <div className="metric-card__body">
            <p>Sinh viên đang mượn</p>
            <strong>{borrowedOrders.length} đơn</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--violet">
            <AlertCircle size={20} />
          </span>
          <div className="metric-card__body">
            <p>Quá hạn / Hoàn tất</p>
            <strong>{overdueOrReturnedOrders.length} đơn</strong>
          </div>
        </div>
      </div>

      {/* Thanh tim kiem va bo loc */}
      <div
        className="panel"
        style={{
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <label className="filter-search" style={{ minWidth: '260px' }}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Tìm theo mã đơn, tên sinh viên, MSSV..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchOrders()
              }}
            />
          </label>

          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Lọc theo ngày hẹn lấy sách"
          />

          <select
            className="date-input"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            title="Lọc theo ca nhận sách"
          >
            <option value="ALL">Tất cả ca nhận</option>
            <option value="08:00 - 09:30">08:00 - 09:30</option>
            <option value="09:00 - 10:30">09:00 - 10:30</option>
            <option value="10:00 - 11:30">10:00 - 11:30</option>
            <option value="13:30 - 15:00">13:30 - 15:00</option>
            <option value="15:00 - 16:30">15:00 - 16:30</option>
          </select>

          <button type="button" className="button button--secondary" onClick={fetchOrders}>
            <Filter size={14} /> Áp dụng
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Hiển thị <strong>{filteredOrders.length}</strong> đơn mượn
        </div>
      </div>

      {/* Bang Kanban 4 cot */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#667085' }}>
          Đang tải dữ liệu tiến trình đơn mượn...
        </div>
      ) : (
        <div className="kanban">
          {KANBAN_COLUMNS.map((column) => {
            const list = columnMap[column.id] || []
            return (
              <div key={column.id} className="kanban-column">
                <header>
                  <span className={`kanban-dot ${column.dotClass}`} />
                  <h2>{column.title}</h2>
                  <strong>{list.length}</strong>
                </header>

                <div className="kanban-list">
                  {list.length === 0 ? (
                    <div
                      style={{
                        padding: '24px 12px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '11px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1'
                      }}
                    >
                      Không có đơn nào trong giai đoạn này
                    </div>
                  ) : (
                    list.map((order) => (
                      <div key={order.id} className="order-card" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        {/* Header the: Ma don va trang thai */}
                        <div>
                          <strong>{order.orderCode}</strong>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background:
                                order.status === 'OVERDUE'
                                  ? '#fee2e2'
                                  : order.status === 'RETURNED'
                                  ? '#f0fdf4'
                                  : '#eff6ff',
                              color:
                                order.status === 'OVERDUE'
                                  ? '#b91c1c'
                                  : order.status === 'RETURNED'
                                  ? '#15803d'
                                  : '#1d4ed8'
                            }}
                          >
                            {order.statusLabel || order.status}
                          </span>
                        </div>

                        {/* Thong tin nguoi muon */}
                        <h3>{order.studentName}</h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0 8px' }}>
                          <User size={12} color="#94a3b8" /> MSSV: <strong>{order.studentId}</strong>
                        </p>

                        {/* Danh sach sach can gom (toi da 2 quyen) */}
                        <div
                          style={{
                            background: '#f8fafc',
                            padding: '8px',
                            borderRadius: '6px',
                            marginBottom: '10px',
                            border: '1px solid #f1f5f9'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#64748b',
                              fontWeight: 600,
                              marginBottom: '4px',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span>Tài liệu ({order.items?.length || 0})</span>
                            <span style={{ color: '#2563eb' }}>Vị trí kệ</span>
                          </div>
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                gap: '8px',
                                marginBottom: '2px'
                              }}
                            >
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: '#334155'
                                }}
                                title={item.title}
                              >
                                {item.title}
                              </span>
                              <span
                                style={{
                                  flexShrink: 0,
                                  fontWeight: 600,
                                  color: '#1d4ed8',
                                  fontSize: '10px',
                                  background: '#eff6ff',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}
                              >
                                {item.shelfLocation || 'Chưa định vị'}
                              </span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                              +{order.items.length - 2} tài liệu khác...
                            </div>
                          )}
                        </div>

                        {/* Thoi gian hen va ngay het han */}
                        <span>
                          <Calendar size={12} />
                          {order.status === 'BORROWED' ? (
                            <span>
                              Hạn trả: <strong style={{ color: '#16a34a' }}>{order.dueDate}</strong>
                            </span>
                          ) : (
                            <span>
                              Hẹn nhận: <strong>{order.pickupDate}</strong> ({order.pickupSlot})
                            </span>
                          )}
                        </span>

                        {/* Ghi chu neu co */}
                        {order.notes && (
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#64748b',
                              marginTop: '6px',
                              background: '#fffbeb',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              borderLeft: '2px solid #f59e0b'
                            }}
                          >
                            {order.notes}
                          </div>
                        )}

                        {/* Nut thao tac truc tiep tren the */}
                        <div
                          style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid #f0f2f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px'
                          }}
                        >
                          <button
                            type="button"
                            className="text-button"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={12} /> Chi tiết
                          </button>

                          {/* Cac nut hanh dong theo tung giai doan */}
                          {order.status === 'PENDING' && (
                            <button
                              type="button"
                              className="button button--primary"
                              style={{ padding: '4px 8px', fontSize: '10px' }}
                              onClick={() => handleAdvanceStatus(order, 'READY_FOR_PICKUP', 'Sẵn sàng')}
                            >
                              Soạn xong <ArrowRight size={12} />
                            </button>
                          )}

                          {order.status === 'READY_FOR_PICKUP' && (
                            <button
                              type="button"
                              className="button button--primary"
                              style={{ padding: '4px 8px', fontSize: '10px', background: '#16a34a', borderColor: '#16a34a' }}
                              onClick={() => handleAdvanceStatus(order, 'BORROWED', 'Đang mượn')}
                            >
                              Bàn giao <Check size={12} />
                            </button>
                          )}

                          {order.status === 'BORROWED' && (
                            <button
                              type="button"
                              className="button button--secondary"
                              style={{ padding: '4px 8px', fontSize: '10px' }}
                              onClick={() => handleAdvanceStatus(order, 'RETURNED', 'Đã trả sách')}
                            >
                              Nhận trả <Check size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Chi tiet don muon sach                                           */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 60,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '620px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Header modal chi tiet */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #edf2f7'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    letterSpacing: '0.5px'
                  }}
                >
                  CHI TIẾT ĐƠN MƯỢN SÁCH
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: '#172033' }}>
                  {selectedOrder.orderCode}
                </h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Thong tin nguoi muon */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                padding: '14px',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '16px'
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Họ và tên:</span>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px' }}>
                  {selectedOrder.studentName}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Mã số sinh viên (MSSV):</span>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px' }}>
                  {selectedOrder.studentId}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Email:</span>
                <div style={{ color: '#334155' }}>{selectedOrder.studentEmail || 'Chưa cập nhật'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Số điện thoại:</span>
                <div style={{ color: '#334155' }}>{selectedOrder.studentPhone || '0912345671'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Ngày hẹn nhận:</span>
                <strong style={{ display: 'block', color: '#2563eb' }}>
                  {selectedOrder.pickupDate} ({selectedOrder.pickupSlot})
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Hạn trả dự kiến:</span>
                <strong style={{ display: 'block', color: '#16a34a' }}>
                  {selectedOrder.dueDate || '14 ngày kể từ khi nhận'}
                </strong>
              </div>
            </div>

            {/* Danh sach sach muon trong don */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BookOpen size={14} color="#2563eb" /> Danh sách tài liệu yêu cầu (
                {selectedOrder.items?.length || 0})
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '12px' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>TÊN ĐẦU SÁCH</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>MÃ TÀI LIỆU</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>VỊ TRÍ KỆ</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>SL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <strong>{item.title}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.author}</div>
                        </td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{item.code}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#1d4ed8',
                              fontWeight: 600
                            }}
                          >
                            <MapPin size={12} /> {item.shelfLocation}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity || 1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Thong tin ma QR don muon */}
            {selectedOrder.qrCode && (
              <div
                style={{
                  padding: '12px',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px dashed #bfdbfe',
                  marginBottom: '16px',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <QrCode size={14} /> Dữ liệu mã QR bàn giao sách
                </div>
                <div style={{ fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>
                  {selectedOrder.qrCode}
                </div>
              </div>
            )}

            {/* Nut chuyen trang thai trong modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '8px',
                paddingTop: '14px',
                borderTop: '1px solid #edf2f7'
              }}
            >
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>

              {selectedOrder.status === 'PENDING' && (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => handleAdvanceStatus(selectedOrder, 'READY_FOR_PICKUP', 'Sẵn sàng')}
                >
                  Xác nhận đã soạn xong
                </button>
              )}

              {selectedOrder.status === 'READY_FOR_PICKUP' && (
                <button
                  type="button"
                  className="button button--primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleAdvanceStatus(selectedOrder, 'BORROWED', 'Đang mượn')}
                >
                  Xác nhận bàn giao sách
                </button>
              )}

              {selectedOrder.status === 'BORROWED' && (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => handleAdvanceStatus(selectedOrder, 'RETURNED', 'Đã trả sách')}
                >
                  Xác nhận nhận trả sách
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Ban giao nhanh bang nhap ma QR                                   */}
      {/* ========================================================================= */}
      {isQrModalOpen && (
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
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#172033' }}>
                  Xác thực nhận sách qua mã QR
                </h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsQrModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickVerifyQr} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Nhập mã đơn hoặc dán chuỗi quét QR từ máy quét tại quầy để xác nhận bàn giao:
              </p>

              <div>
                <input
                  type="text"
                  required
                  className="date-input"
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace' }}
                  placeholder="Ví dụ: BORROW|1001|2251120145|... hoặc ORD-2026-1001"
                  value={qrInputCode}
                  onChange={(e) => setQrInputCode(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setIsQrModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="button button--primary">
                  Xác nhận bàn giao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
