import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  Printer,
  Receipt,
  Search,
  User,
  X
} from 'lucide-react'
import axiosClient from '../services/axiosClient'

/* Danh sach bien lai phat mau dung khi chua ket noi du lieu may chu */
const initialFines = [
  {
    id: 1,
    fineCode: 'FN-2026-001',
    studentName: 'Phạm Quốc Bảo',
    studentId: '2051150012',
    studentPhone: '0933123456',
    orderCode: 'ORD-2026-1004',
    bookTitle: 'Thiết kế cầu đường hiện đại',
    bookCode: 'UTH-CAUDUONG-0401',
    overdueDays: 4,
    lateFee: 20000,
    damageFee: 0,
    totalAmount: 20000,
    status: 'UNPAID',
    statusLabel: 'Chưa thanh toán',
    createdAt: '2026-03-05',
    paymentDate: null,
    paymentMethod: null,
    note: 'Trễ hạn 4 ngày (5.000đ/ngày)'
  },
  {
    id: 2,
    fineCode: 'FN-2026-002',
    studentName: 'Lê Hoàng Nam',
    studentId: '2151140088',
    studentPhone: '0977889900',
    orderCode: 'ORD-2026-1003',
    bookTitle: 'Quản trị chuỗi cung ứng và logistics cảng biển',
    bookCode: 'UTH-LOG-0301',
    overdueDays: 2,
    lateFee: 10000,
    damageFee: 15000,
    totalAmount: 25000,
    status: 'UNPAID',
    statusLabel: 'Chưa thanh toán',
    createdAt: '2026-03-04',
    paymentDate: null,
    paymentMethod: null,
    note: 'Trễ 2 ngày kèm bìa sách bị rách nhẹ'
  },
  {
    id: 3,
    fineCode: 'FN-2026-003',
    studentName: 'Nguyễn Thị Hoa',
    studentId: '2351120099',
    studentPhone: '0901234888',
    orderCode: 'ORD-2026-1008',
    bookTitle: 'Giải tích toán học dành cho kỹ sư',
    bookCode: 'UTH-TOAN-0501',
    overdueDays: 6,
    lateFee: 30000,
    damageFee: 0,
    totalAmount: 30000,
    status: 'PAID',
    statusLabel: 'Đã thanh toán',
    createdAt: '2026-03-01',
    paymentDate: '2026-03-02',
    paymentMethod: 'TRANSFER',
    note: 'Thanh toán chuyển khoản qua VietQR tại quầy'
  },
  {
    id: 4,
    fineCode: 'FN-2026-004',
    studentName: 'Trần Văn Kiên',
    studentId: '2251120340',
    studentPhone: '0944556677',
    orderCode: 'ORD-2026-1011',
    bookTitle: 'Kiến trúc máy tính và Hợp ngữ',
    bookCode: 'UTH-CNTT-0105',
    overdueDays: 1,
    lateFee: 5000,
    damageFee: 0,
    totalAmount: 5000,
    status: 'WAIVED',
    statusLabel: 'Được miễn giảm',
    createdAt: '2026-02-28',
    paymentDate: '2026-02-28',
    paymentMethod: null,
    note: 'Có giấy xác nhận nằm viện điều trị đột xuất'
  }
]

let localFinesData = [...initialFines]

/*
  Component FineTrackingPage
  Quan ly danh sach no phat tre han, hu hong sach va ghi nhan thu phat truc tiep tai quay thu vien.
*/
export default function FineTrackingPage() {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [toastMessage, setToastMessage] = useState(null)

  /* Modal ghi nhan thu phat */
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false)
  const [collectingFine, setCollectingFine] = useState(null)
  const [collectAmount, setCollectAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [transactionNote, setTransactionNote] = useState('Thu tiền phạt trễ hạn tại quầy tiếp nhận')

  /* Modal xem bien nhan chi tiet */
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  function showToast(text, type = 'success') {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3200)
  }

  /* Tai danh sach cac khoan phat */
  async function fetchFines() {
    setLoading(true)
    try {
      let res = await axiosClient.get('/admin/fines', {
        params: {
          search: searchKeyword,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined
        }
      })
      if (res && res.data) res = res.data
      setFines(Array.isArray(res) ? res : localFinesData)
    } catch (err) {
      console.warn('Su dung du lieu mau danh sach no phat:', err.message)
      let list = [...localFinesData]

      if (selectedStatus !== 'ALL') {
        list = list.filter((item) => item.status === selectedStatus)
      }

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase()
        list = list.filter(
          (item) =>
            item.fineCode?.toLowerCase().includes(kw) ||
            item.studentName?.toLowerCase().includes(kw) ||
            item.studentId?.includes(kw) ||
            item.bookTitle?.toLowerCase().includes(kw)
        )
      }

      setFines(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFines()
  }, [])

  /* Mo modal thu phat cho mot bien lai */
  function handleOpenCollectModal(fine) {
    setCollectingFine(fine)
    setCollectAmount(fine.totalAmount)
    setPaymentMethod('CASH')
    setTransactionNote(`Thu tiền phạt mã đơn #${fine.orderCode}`)
    setIsCollectModalOpen(true)
  }

  /* Xac nhan thu phat */
  async function handleConfirmCollection(e) {
    e.preventDefault()
    if (!collectingFine) return

    try {
      // Cap nhat du lieu qua API hoac bo nho cuc bo
      localFinesData = localFinesData.map((f) => {
        if (f.id === collectingFine.id) {
          return {
            ...f,
            status: 'PAID',
            statusLabel: 'Đã thanh toán',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod,
            note: transactionNote
          }
        }
        return f
      })

      showToast(
        `Đã ghi nhận thu phạt thành công ${Number(collectAmount).toLocaleString('vi-VN')} đ cho biên lai #${collectingFine.fineCode}!`
      )
      setIsCollectModalOpen(false)
      fetchFines()
    } catch (err) {
      alert('Không thể ghi nhận thu tiền: ' + err.message)
    }
  }

  /* Tinh toan cac chi so tong hop */
  const unpaidList = fines.filter((f) => f.status === 'UNPAID')
  const paidList = fines.filter((f) => f.status === 'PAID')

  const totalUnpaidAmount = unpaidList.reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
  const totalPaidAmount = paidList.reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
  const unpaidStudentsCount = new Set(unpaidList.map((f) => f.studentId)).size

  return (
    <div className="fine-tracking-page">
      {/* Toast thong bao noi */}
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
            background: '#15803d',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Thanh tieu de va hanh dong */}
      <div className="page-actions" style={{ marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#172033' }}>
            Quản lý nợ phạt & Ghi nhận thu phạt
          </h2>
          <p className="page-description">
            Theo dõi danh sách nợ phạt trễ hạn, phụ thu hư hỏng tài liệu và ghi nhận phiếu thu tại quầy.
          </p>
        </div>
      </div>

      {/* Bang 3 the thong ke tong hop su dung fine-summary */}
      <div className="fine-summary" style={{ marginBottom: '16px' }}>
        <div>
          <span>
            <AlertCircle size={22} />
          </span>
          <div>
            <p>Tổng tiền nợ phạt (chưa thu)</p>
            <strong style={{ color: '#dc2626' }}>
              {totalUnpaidAmount.toLocaleString('vi-VN')} đ
            </strong>
          </div>
        </div>

        <div>
          <span style={{ color: '#16a34a', background: '#f0fdf4' }}>
            <DollarSign size={22} />
          </span>
          <div>
            <p>Tổng tiền phạt đã thu thành công</p>
            <strong style={{ color: '#16a34a' }}>
              {totalPaidAmount.toLocaleString('vi-VN')} đ
            </strong>
          </div>
        </div>

        <div>
          <span style={{ color: '#2563eb', background: '#eff6ff' }}>
            <User size={22} />
          </span>
          <div>
            <p>Sinh viên còn tồn đọng nợ phạt</p>
            <strong>{unpaidStudentsCount} sinh viên</strong>
          </div>
        </div>
      </div>

      {/* Bo loc va tim kiem */}
      <div className="panel">
        <div className="panel__header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Danh sách biên lai nợ phạt</h2>
            <p>Tra cứu theo mã số sinh viên, tên hoặc mã biên lai thu tiền</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label className="filter-search" style={{ width: '280px' }}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Tìm MSSV, tên sinh viên, mã biên lai..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchFines()
                }}
              />
            </label>

            <select
              className="date-input"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="WAIVED">Được miễn giảm</option>
            </select>

            <button type="button" className="button button--secondary" onClick={fetchFines}>
              <Filter size={14} /> Lọc
            </button>
          </div>
        </div>

        {/* Bang danh sach bien lai */}
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              Đang tải danh sách nợ phạt...
            </div>
          ) : fines.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Không tìm thấy biên lai nợ phạt nào phù hợp.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>MÃ BIÊN LAI</th>
                  <th>SINH VIÊN</th>
                  <th>TÀI LIỆU QUÁ HẠN</th>
                  <th style={{ textAlign: 'center' }}>SỐ NGÀY TRỄ</th>
                  <th style={{ textAlign: 'right' }}>PHÍ TRỄ HẠN</th>
                  <th style={{ textAlign: 'right' }}>PHỤ THU</th>
                  <th style={{ textAlign: 'right' }}>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => {
                  const isUnpaid = fine.status === 'UNPAID'
                  return (
                    <tr key={fine.id}>
                      <td>
                        <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>
                          {fine.fineCode}
                        </strong>
                        <div style={{ fontSize: '10px', color: '#98a2b3' }}>Đơn: {fine.orderCode}</div>
                      </td>
                      <td>
                        <strong>{fine.studentName}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          MSSV: {fine.studentId}
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fine.bookTitle}>
                          {fine.bookTitle}
                        </div>
                        <div style={{ fontSize: '10px', color: '#98a2b3' }}>Mã: {fine.bookCode}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: fine.overdueDays > 0 ? '#fee2e2' : '#f1f5f9',
                            color: fine.overdueDays > 0 ? '#b91c1c' : '#64748b'
                          }}
                        >
                          {fine.overdueDays} ngày
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {Number(fine.lateFee || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ textAlign: 'right', color: fine.damageFee > 0 ? '#ea580c' : '#64748b' }}>
                        {Number(fine.damageFee || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isUnpaid ? '#dc2626' : '#15803d' }}>
                        {Number(fine.totalAmount).toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background:
                              fine.status === 'PAID'
                                ? '#ecfdf3'
                                : fine.status === 'UNPAID'
                                ? '#fef3f2'
                                : '#f3f4f6',
                            color:
                              fine.status === 'PAID'
                                ? '#15803d'
                                : fine.status === 'UNPAID'
                                ? '#b42318'
                                : '#475467'
                          }}
                        >
                          {fine.statusLabel || fine.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isUnpaid ? (
                          <button
                            type="button"
                            className="button button--primary"
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              background: '#16a34a',
                              borderColor: '#16a34a'
                            }}
                            onClick={() => handleOpenCollectModal(fine)}
                          >
                            <Banknote size={13} /> Thu phạt
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="icon-button"
                            title="Xem biên nhận"
                            onClick={() => setSelectedReceipt(fine)}
                          >
                            <Eye size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL GHI NHAN THU PHAT TAI QUAY                                          */}
      {/* ========================================================================= */}
      {isCollectModalOpen && collectingFine && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
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
              maxWidth: '500px',
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
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #edf2f7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '9px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <Receipt size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#172033' }}>
                    Ghi nhận thu tiền phạt tại quầy
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Biên lai: #{collectingFine.fineCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsCollectModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCollection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Thong tin tom tat khoang phat */}
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Sinh viên nộp phạt:</span>
                  <strong>{collectingFine.studentName} ({collectingFine.studentId})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Tài liệu quá hạn:</span>
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{collectingFine.bookTitle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Số ngày trễ:</span>
                  <span>{collectingFine.overdueDays} ngày (x 5.000 đ/ngày)</span>
                </div>
                {collectingFine.damageFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#ea580c' }}>
                    <span>Phụ thu hư hại tài liệu:</span>
                    <strong>{Number(collectingFine.damageFee).toLocaleString('vi-VN')} đ</strong>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px dashed #cbd5e1',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#172033' }}>Tổng số tiền cần thu:</span>
                  <strong style={{ color: '#dc2626', fontSize: '16px' }}>
                    {Number(collectingFine.totalAmount).toLocaleString('vi-VN')} đ
                  </strong>
                </div>
              </div>

              {/* Phuong thuc thanh toan */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Phương thức thanh toán:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: paymentMethod === 'CASH' ? '#16a34a' : '#cbd5e1',
                      background: paymentMethod === 'CASH' ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={() => setPaymentMethod('CASH')}
                    />
                    <Banknote size={16} color="#16a34a" /> Tiền mặt tại quầy
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: paymentMethod === 'TRANSFER' ? '#2563eb' : '#cbd5e1',
                      background: paymentMethod === 'TRANSFER' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="TRANSFER"
                      checked={paymentMethod === 'TRANSFER'}
                      onChange={() => setPaymentMethod('TRANSFER')}
                    />
                    <CreditCard size={16} color="#2563eb" /> Chuyển khoản VietQR
                  </label>
                </div>
              </div>

              {/* Ghi chu / Ma giao dich */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Ghi chú thu phí / Mã giao dịch ngân hàng:
                </label>
                <input
                  type="text"
                  className="date-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                />
              </div>

              {/* Nut xac nhan */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setIsCollectModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="button button--primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                >
                  Xác nhận đã thu phạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL XEM CHI TIET BIEN NHAN THU PHAT                                     */}
      {/* ========================================================================= */}
      {selectedReceipt && (
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
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#172033' }}>
                  Biên nhận thu phạt #{selectedReceipt.fineCode}
                </h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedReceipt(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Người nộp:</span>
                <strong>{selectedReceipt.studentName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>MSSV:</span>
                <strong>{selectedReceipt.studentId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Tài liệu trễ hạn:</span>
                <span>{selectedReceipt.bookTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Ngày thu:</span>
                <span>{selectedReceipt.paymentDate || selectedReceipt.createdAt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Hình thức:</span>
                <span>{selectedReceipt.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: 700 }}>Tổng tiền:</span>
                <strong style={{ color: '#16a34a', fontSize: '15px' }}>
                  {Number(selectedReceipt.totalAmount).toLocaleString('vi-VN')} đ
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedReceipt(null)}
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
