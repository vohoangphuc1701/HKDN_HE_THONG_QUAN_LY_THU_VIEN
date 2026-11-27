import { useState, useId } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck2,
  HelpCircle,
  MapPin,
  Printer,
  Receipt,
  RotateCcw,
  ShieldAlert,
  User,
  X
} from 'lucide-react'
import scanApi from '../../services/scanApi'

/*
  Bang danh gia tinh trang sach thuc te tai quay va muc phi den bu tuong ung.
*/
const CONDITION_OPTIONS = [
  { value: 'NORMAL', label: 'Nguyên vẹn (Tốt)', fee: 0, badgeClass: 'status--sàng' },
  { value: 'TORN', label: 'Rách mép / Bẩn nhẹ', fee: 20000, badgeClass: 'status--gom' },
  { value: 'DAMAGED', label: 'Hỏng nặng / Mất trang', fee: 50000, badgeClass: 'status--hủy' },
  { value: 'LOST', label: 'Làm mất sách hoàn toàn', fee: 120000, badgeClass: 'status--hủy' }
]

/*
  Component ReturnVerificationView
  Bang doi soat danh sach sach khi quet ma QR phieu hen tra sach tai quay thu vien.
  Ho tro thu thu kiem tra tinh trang sach, tinh toan tien phat qua han (5.000d/ngay)
  va xac nhan hoan tat nhan tra de tu dong cap nhat lai so luong ton kho.
*/
export default function ReturnVerificationView({ verificationData, onComplete, onCancel }) {
  const [data, setData] = useState(() => {
    if (!verificationData) return null
    return {
      ...verificationData,
      items: (verificationData.items || []).map((item) => ({
        ...item,
        condition: item.bookCondition || 'NORMAL',
        damageFee: item.damageFee || 0,
        inspectorNote: item.note || ''
      }))
    }
  })

  const [paymentMethod, setPaymentMethod] = useState('CASH') /* CASH, TRANSFER, LATER */
  const [librarianSummaryNote, setLibrarianSummaryNote] = useState('Đã đối soát sách vật lý tại quầy')
  const [submitting, setSubmitting] = useState(false)
  const [successResult, setSuccessResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const noteInputId = useId()

  if (!data) {
    return (
      <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
        <AlertCircle size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
        <h3>Chưa có dữ liệu đối soát</h3>
        <p style={{ color: '#667085', fontSize: '13px' }}>
          Vui lòng quét mã QR phiếu trả sách hoặc nhập mã phiếu để tiến hành kiểm tra.
        </p>
        {onCancel && (
          <button className="button button--secondary" onClick={onCancel} style={{ marginTop: '16px' }}>
            <ArrowLeft size={14} /> Quay lại
          </button>
        )}
      </div>
    )
  }

  /* Thay doi tinh trang thuc te cua mot cuon sach */
  function handleConditionChange(detailId, newCondition) {
    const selected = CONDITION_OPTIONS.find((c) => c.value === newCondition)
    const suggestedFee = selected ? selected.fee : 0

    setData((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.detailId === detailId || item.borrowDetailId === detailId) {
          return {
            ...item,
            condition: newCondition,
            damageFee: suggestedFee
          }
        }
        return item
      })
      return recalculateTotals(prev, newItems)
    })
  }

  /* Thay doi tien den bu hu hai do thu thu nhap thu cong */
  function handleDamageFeeChange(detailId, newFee) {
    const parsedFee = Math.max(0, parseInt(newFee, 10) || 0)
    setData((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.detailId === detailId || item.borrowDetailId === detailId) {
          return {
            ...item,
            damageFee: parsedFee
          }
        }
        return item
      })
      return recalculateTotals(prev, newItems)
    })
  }

  /* Cap nhat ghi chu tung cuon sach */
  function handleItemNoteChange(detailId, note) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.detailId === detailId || item.borrowDetailId === detailId) {
          return { ...item, inspectorNote: note }
        }
        return item
      })
    }))
  }

  /* Tinh toan lai tong hop tien phat va phi hu hai */
  function recalculateTotals(prev, items) {
    const totalOverdueFine = items.reduce((sum, item) => sum + (item.overdueFine || 0), 0)
    const totalDamageFee = items.reduce((sum, item) => sum + (item.damageFee || 0), 0)
    const totalFineAmount = totalOverdueFine + totalDamageFee

    return {
      ...prev,
      items,
      totalOverdueFine,
      totalDamageFee,
      totalFineAmount
    }
  }

  /* Xac nhan hoan tat nhan tra sach tai quay */
  async function handleConfirmReturn() {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const payload = {
        librarianNote: librarianSummaryNote,
        paymentMethod: data.totalFineAmount > 0 ? paymentMethod : null,
        items: data.items.map((it) => ({
          borrowDetailId: it.borrowDetailId,
          bookCondition: it.condition,
          damageFee: it.damageFee,
          note: it.inspectorNote
        }))
      }

      const res = await scanApi.completeReturn(data.ticketId || 1, payload)
      setSuccessResult(res)
      if (onComplete) {
        onComplete(res)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi hoàn tất trả sách. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  /* Hien thi ket qua sau khi hoan tat thanh cong */
  if (successResult) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ecfdf3',
            color: '#15803d',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 16px'
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontSize: '18px', color: '#172033', margin: '0 0 8px' }}>
          Hoàn tất trả sách thành công!
        </h2>
        <p style={{ color: '#667085', fontSize: '13px', margin: '0 0 20px' }}>
          Đã nhận lại đủ {data.items?.length || 0} cuốn sách từ sinh viên {data.student?.fullName}.
          Số lượng tồn khả dụng trong kho đã được cập nhật tự động.
        </p>

        {data.totalFineAmount > 0 && (
          <div
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              Biên nhận thanh toán tiền phạt:
            </div>
            <strong style={{ fontSize: '16px', color: '#dc2626' }}>
              {data.totalFineAmount?.toLocaleString('vi-VN')} VNĐ
            </strong>
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>
              ({paymentMethod === 'CASH' ? 'Tiền mặt tại quầy' : paymentMethod === 'TRANSFER' ? 'Chuyển khoản VietQR' : 'Ghi nợ tài khoản'})
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="button button--secondary" onClick={() => window.print()}>
            <Printer size={14} /> In biên lai
          </button>
          {onCancel && (
            <button className="button button--primary" onClick={onCancel}>
              <Check size={14} /> Tiếp tục quét mã mới
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="return-verification" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Thanh header tieu de va ma phieu */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          borderColor: '#bfdbfe'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#2563eb',
              color: 'white',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <FileCheck2 size={22} />
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
                Đối soát Phiếu hẹn trả sách
              </h2>
              <strong
                style={{
                  padding: '2px 8px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                {data.ticketCode}
              </strong>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              Quét mã QR tại quầy lúc {new Date().toLocaleTimeString('vi-VN')} - Ngày hẹn trả:{' '}
              <strong>{data.scheduledReturnDate}</strong>
            </p>
          </div>
        </div>

        {onCancel && (
          <button className="button button--secondary" onClick={onCancel}>
            <X size={14} /> Đóng bảng
          </button>
        )}
      </div>

      {/* Thong tin sinh vien muon tra sach */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User size={18} color="#2563eb" />
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Sinh viên</div>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>
              {data.student?.fullName || 'N/A'}
            </strong>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Mã số sinh viên (MSSV)</div>
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>
            {data.student?.username || 'N/A'}
          </strong>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Số điện thoại</div>
          <span style={{ fontSize: '13px', color: '#334155' }}>
            {data.student?.phone || 'Chưa cập nhật'}
          </span>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Trạng thái nợ cũ</div>
          {data.unpaidPreviousFines > 0 ? (
            <span
              style={{
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AlertTriangle size={13} /> Nợ {data.unpaidPreviousFines.toLocaleString('vi-VN')} đ
            </span>
          ) : (
            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '12px' }}>
              ✓ Không có nợ phạt cũ
            </span>
          )}
        </div>
      </div>

      {/* Bang doi soat tung cuon sach */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <header
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '13px', color: '#1e293b' }}>
              Danh sách sách cần kiểm tra ({data.items?.length || 0} cuốn)
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            * Phí quá hạn áp dụng 5.000 VNĐ / ngày / cuốn
          </span>
        </header>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 16px' }}>Đầu sách & Vị trí</th>
                <th style={{ padding: '10px 16px' }}>Hạn trả gốc</th>
                <th style={{ padding: '10px 16px' }}>Quá hạn</th>
                <th style={{ padding: '10px 16px' }}>Tình trạng vật lý tại quầy</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Phí hư hại (đ)</th>
                <th style={{ padding: '10px 16px' }}>Ghi chú kiểm tra</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((item, idx) => (
                <tr
                  key={item.detailId || idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: item.overdueDays > 0 ? '#fffbeb' : 'white'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '2px' }}>
                      {item.title}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748b' }}>
                      <span>{item.author}</span>
                      {item.shelfLocation && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <MapPin size={11} /> {item.shelfLocation}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#64748b" />
                      <span>{item.dueDate || 'Theo phiếu'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {item.overdueDays > 0 ? (
                      <div>
                        <span
                          style={{
                            color: '#b45309',
                            background: '#fef3c7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          +{item.overdueDays} ngày
                        </span>
                        <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>
                          +{item.overdueFine?.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: 600 }}>
                        Đúng hạn
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <select
                      className="date-input"
                      style={{ padding: '6px 8px', fontSize: '11px', width: '160px' }}
                      value={item.condition}
                      onChange={(e) => handleConditionChange(item.detailId, e.target.value)}
                    >
                      {CONDITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <input
                      type="number"
                      className="date-input"
                      style={{ padding: '6px 8px', fontSize: '11px', width: '100px', textAlign: 'right' }}
                      min="0"
                      step="5000"
                      value={item.damageFee}
                      onChange={(e) => handleDamageFeeChange(item.detailId, e.target.value)}
                    />
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="text"
                      className="date-input"
                      style={{ padding: '6px 8px', fontSize: '11px', width: '150px' }}
                      placeholder="Ghi chú thêm..."
                      value={item.inspectorNote}
                      onChange={(e) => handleItemNoteChange(item.detailId, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tong ket tai chinh va hanh dong xac nhan */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* Phan tong ket tien phat */}
        <div>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#1e293b' }}>
            Tổng hợp tiền phạt & bồi hoàn
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475467', marginBottom: '6px' }}>
            <span>Phí quá hạn ({data.totalOverdueDays || 0} ngày):</span>
            <strong>{(data.totalOverdueFine || 0).toLocaleString('vi-VN')} đ</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475467', marginBottom: '8px' }}>
            <span>Phí sách hư hại / mất:</span>
            <strong>{(data.totalDamageFee || 0).toLocaleString('vi-VN')} đ</strong>
          </div>

          <div
            style={{
              paddingTop: '8px',
              borderTop: '1px dashed #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>Tổng tiền phải nộp:</strong>
            <strong style={{ fontSize: '18px', color: data.totalFineAmount > 0 ? '#dc2626' : '#16a34a' }}>
              {(data.totalFineAmount || 0).toLocaleString('vi-VN')} VNĐ
            </strong>
          </div>

          {data.totalFineAmount > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                Phương thức thu tiền phạt:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`button ${paymentMethod === 'CASH' ? 'button--primary' : 'button--secondary'}`}
                  style={{ flex: 1, fontSize: '10px', padding: '6px' }}
                  onClick={() => setPaymentMethod('CASH')}
                >
                  Tiền mặt
                </button>
                <button
                  type="button"
                  className={`button ${paymentMethod === 'TRANSFER' ? 'button--primary' : 'button--secondary'}`}
                  style={{ flex: 1, fontSize: '10px', padding: '6px' }}
                  onClick={() => setPaymentMethod('TRANSFER')}
                >
                  VietQR
                </button>
                <button
                  type="button"
                  className={`button ${paymentMethod === 'LATER' ? 'button--primary' : 'button--secondary'}`}
                  style={{ flex: 1, fontSize: '10px', padding: '6px' }}
                  onClick={() => setPaymentMethod('LATER')}
                >
                  Ghi nợ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Phan ghi chu va nut xac nhan */}
        <div>
          <label htmlFor={noteInputId} style={{ display: 'block', margin: '0 0 6px', fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>
            Ghi chú tổng kết của thủ thư:
          </label>
          <input
            id={noteInputId}
            type="text"
            className="date-input"
            style={{ width: '100%', marginBottom: '14px', boxSizing: 'border-box' }}
            value={librarianSummaryNote}
            onChange={(e) => setLibrarianSummaryNote(e.target.value)}
          />

          {errorMessage && (
            <div
              style={{
                padding: '8px 12px',
                background: '#fef2f2',
                color: '#dc2626',
                borderRadius: '6px',
                fontSize: '11px',
                marginBottom: '12px'
              }}
            >
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {onCancel && (
              <button
                type="button"
                className="button button--secondary"
                style={{ flex: 1 }}
                onClick={onCancel}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="button"
              className="button button--primary"
              style={{ flex: 2, background: '#16a34a', borderColor: '#16a34a' }}
              onClick={handleConfirmReturn}
              disabled={submitting}
            >
              <Check size={14} />
              {submitting ? 'Đang hoàn tất...' : 'Xác nhận hoàn tất trả sách & Nhập kho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
