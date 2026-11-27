import { useState, useEffect } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  Phone,
  Search,
  User,
  X
} from 'lucide-react'
import orderApi from '../../services/orderApi'

/*
  Component ManualSearchModal
  Modal tra cuu thu cong ma sinh vien hoac ma don muon khi ma QR bi hong,
  dien thoai het pin hoac camera may quet khong doc duoc.
  Cho phep thu thu tim kiem, doi chieu thong tin va xac nhan don xu ly tai quay.
*/
export default function ManualSearchModal({
  isOpen = false,
  onClose,
  onSelectOrder,
  onConfirmOrder,
  initialSearch = '',
  mode = 'ALL'
}) {
  const [keyword, setKeyword] = useState(initialSearch)
  const [filterStatus, setFilterStatus] = useState(mode)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [manualReason, setManualReason] = useState('Mã QR trên màn hình điện thoại bị mờ/hỏng')
  const [hasSearched, setHasSearched] = useState(false)

  // Dong bo tu khoa tim kiem ban dau khi modal mo
  useEffect(() => {
    if (isOpen) {
      setKeyword(initialSearch)
      setSelectedOrder(null)
      setHasSearched(false)
      if (initialSearch.trim()) {
        executeSearch(initialSearch, filterStatus)
      } else {
        // Tai mac dinh danh sach don can xu ly
        executeSearch('', filterStatus)
      }
    }
  }, [isOpen, initialSearch])

  // Dong modal khi nhan phim Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Thuc hien tim kiem don muon
  async function executeSearch(searchVal = keyword, statusVal = filterStatus) {
    setLoading(true)
    setHasSearched(true)
    try {
      const data = await orderApi.getAll({
        search: searchVal.trim(),
        status: statusVal !== 'ALL' ? statusVal : undefined
      })
      setOrders(data || [])
    } catch (err) {
      console.error('Lỗi tra cứu đơn mượn thủ công:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Xu ly submit form tim kiem
  function handleSubmitSearch(e) {
    if (e) e.preventDefault()
    executeSearch(keyword, filterStatus)
  }

  // Chon mot don de xem chi tiet va xac nhan
  function handleSelectOrder(order) {
    setSelectedOrder(order)
    if (onSelectOrder) {
      onSelectOrder(order)
    }
  }

  // Xac nhan xu ly don thu cong tai quay
  async function handleConfirmAction(order) {
    try {
      if (onConfirmOrder) {
        await onConfirmOrder(order, manualReason)
      } else {
        // Neu khong truyen onConfirmOrder thi tu dong cap nhat theo trang thai hien tai
        if (order.status === 'READY_FOR_PICKUP' || order.status === 'PENDING') {
          await orderApi.handoverBooks(order.id, `Xác thực thủ công: ${manualReason}`)
        } else if (order.status === 'BORROWED' || order.status === 'OVERDUE') {
          await orderApi.returnBooks(order.id, `Xác thực thủ công: ${manualReason}`)
        }
      }

      if (onClose) {
        onClose()
      }
    } catch (err) {
      alert('Không thể xác nhận đơn: ' + err.message)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 80,
        padding: '16px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #edf2f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Search size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#172033' }}>
                Tra cứu đơn mượn thủ công
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                Nhập mã sinh viên (MSSV) hoặc mã đơn khi QR bị hỏng hoặc điện thoại hết pin
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Thanh tim kiem va bo loc */}
        <div
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #edf2f7'
          }}
        >
          <form onSubmit={handleSubmitSearch} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px'
              }}
            >
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                autoFocus
                placeholder="Nhập MSSV (225112...), mã đơn (ORD-...), hoặc họ tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#1e293b'
                }}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('')
                    executeSearch('', filterStatus)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="button button--primary"
              style={{
                padding: '0 18px',
                height: '42px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Search size={16} /> Tra cứu
            </button>
          </form>

          {/* Cac the loc nhanh trang thai */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Tất cả trạng thái' },
              { id: 'READY_FOR_PICKUP', label: 'Sẵn sàng lấy sách' },
              { id: 'BORROWED', label: 'Đang mượn (Trả sách)' },
              { id: 'PENDING', label: 'Chờ soạn sách' },
              { id: 'OVERDUE', label: 'Quá hạn' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterStatus(tab.id)
                  executeSearch(keyword, tab.id)
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: filterStatus === tab.id ? '#2563eb' : '#e2e8f0',
                  background: filterStatus === tab.id ? '#eff6ff' : '#ffffff',
                  color: filterStatus === tab.id ? '#2563eb' : '#64748b'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vung noi dung danh sach ket qua */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Đang tra cứu dữ liệu...</div>
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1'
              }}
            >
              <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                {hasSearched ? 'Không tìm thấy đơn mượn nào phù hợp' : 'Chưa có dữ liệu'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
                Vui lòng kiểm tra lại mã số sinh viên, mã đơn mượn hoặc chọn tab trạng thái khác.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Tìm thấy <strong>{orders.length}</strong> đơn mượn phù hợp:
              </div>

              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid',
                      borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                      background: isSelected ? '#f0f7ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#1e40af',
                            fontFamily: 'monospace'
                          }}
                        >
                          {order.orderCode}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background:
                              order.status === 'READY_FOR_PICKUP'
                                ? '#dbeafe'
                                : order.status === 'BORROWED'
                                ? '#dcfce7'
                                : order.status === 'OVERDUE'
                                ? '#fee2e2'
                                : '#fef3c7',
                            color:
                              order.status === 'READY_FOR_PICKUP'
                                ? '#1d4ed8'
                                : order.status === 'BORROWED'
                                ? '#15803d'
                                : order.status === 'OVERDUE'
                                ? '#b91c1c'
                                : '#b45309'
                          }}
                        >
                          {order.statusLabel || order.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {order.status === 'BORROWED' ? (
                          <span>
                            Hạn trả: <strong style={{ color: '#16a34a' }}>{order.dueDate}</strong>
                          </span>
                        ) : (
                          <span>
                            Hẹn lấy: <strong>{order.pickupDate}</strong> ({order.pickupSlot})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Thong tin sinh vien */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '8px',
                        fontSize: '12px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
                        <User size={14} color="#64748b" />
                        <strong>{order.studentName}</strong>
                      </div>
                      <div style={{ color: '#475569' }}>
                        MSSV: <strong>{order.studentId}</strong>
                      </div>
                      {order.studentPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                          <Phone size={13} /> {order.studentPhone}
                        </div>
                      )}
                    </div>

                    {/* Danh sach tai lieu trong don */}
                    <div
                      style={{
                        background: isSelected ? '#ffffff' : '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #eef2f6',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                        Tài liệu yêu cầu ({order.items?.length || 0}):
                      </div>
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#334155',
                            marginBottom: '2px'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{item.title}</span>
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>
                            {item.shelfLocation || item.code}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Nut chon don */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '10px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectOrder(order)
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isSelected ? '#2563eb' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1'
                        }}
                      >
                        {isSelected ? <Check size={14} /> : <ArrowRight size={14} />}
                        {isSelected ? 'Đang chọn đơn này' : 'Chọn xử lý'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Khung xac nhan khi da chon don */}
        {selectedOrder && (
          <div
            style={{
              padding: '16px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '12px',
                color: '#1e293b'
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" />
              <span>
                Đang chuẩn bị xác thực thủ công cho đơn: <strong>{selectedOrder.orderCode}</strong> (Sinh viên:{' '}
                <strong>{selectedOrder.studentName}</strong> - MSSV: <strong>{selectedOrder.studentId}</strong>)
              </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475467',
                  marginBottom: '4px'
                }}
              >
                Lý do xác thực thủ công:
              </label>
              <select
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12px',
                  color: '#334155'
                }}
              >
                <option value="Mã QR trên màn hình điện thoại bị mờ/hỏng">
                  Mã QR trên màn hình điện thoại bị mờ/hỏng
                </option>
                <option value="Điện thoại sinh viên hết pin tại quầy">
                  Điện thoại sinh viên hết pin tại quầy
                </option>
                <option value="Camera máy quét không nhận diện được">
                  Camera máy quét không nhận diện được
                </option>
                <option value="Sinh viên xuất trình thẻ sinh viên vật lý thay thế">
                  Sinh viên xuất trình thẻ sinh viên vật lý thay thế
                </option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedOrder(null)}
                style={{ fontSize: '12px' }}
              >
                Hủy chọn
              </button>

              <button
                type="button"
                className="button button--primary"
                onClick={() => handleConfirmAction(selectedOrder)}
                style={{
                  fontSize: '12px',
                  background:
                    selectedOrder.status === 'READY_FOR_PICKUP' || selectedOrder.status === 'PENDING'
                      ? '#16a34a'
                      : '#2563eb',
                  borderColor:
                    selectedOrder.status === 'READY_FOR_PICKUP' || selectedOrder.status === 'PENDING'
                      ? '#16a34a'
                      : '#2563eb'
                }}
              >
                {selectedOrder.status === 'READY_FOR_PICKUP' || selectedOrder.status === 'PENDING'
                  ? 'Xác nhận bàn giao sách'
                  : 'Xác nhận nhận trả sách'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
