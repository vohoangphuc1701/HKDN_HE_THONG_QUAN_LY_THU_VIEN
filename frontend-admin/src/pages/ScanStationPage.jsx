import { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Keyboard,
  Layers,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  X
} from 'lucide-react'

/* Du lieu mau thong tin sinh vien phuc vu hien thi Student Info Card */
const mockStudentCards = {
  '2251120145': {
    studentId: '2251120145',
    fullName: 'Nguyễn Văn An',
    faculty: 'Khoa Công nghệ Thông tin',
    academicClass: 'CNTT-K22A',
    email: 'an.nguyen@uth.edu.vn',
    phone: '0912 345 678',
    cardExpiry: '30/06/2026',
    cardStatus: 'ACTIVE',
    cardStatusLabel: 'Thẻ hợp lệ',
    currentBorrowCount: 2,
    maxBorrowLimit: 5,
    unpaidFine: 0,
    hasOverdue: false,
    activeOrder: {
      orderCode: 'ORD-2026-1001',
      pickupSlot: '09:00 - 10:30',
      status: 'READY_FOR_PICKUP',
      statusLabel: 'Sẵn sàng lấy sách',
      books: [
        {
          title: 'Kỹ thuật lập trình Java nâng cao',
          code: 'UTH-CNTT-0101',
          shelfLocation: 'Kệ A-01-01',
          author: 'Nguyễn Văn A'
        },
        {
          title: 'Cơ sở dữ liệu và MySQL',
          code: 'UTH-CNTT-0102',
          shelfLocation: 'Kệ B-02-03',
          author: 'Trần Thị B'
        }
      ]
    }
  },
  '2251120032': {
    studentId: '2251120032',
    fullName: 'Trần Thị Mai',
    faculty: 'Khoa Kinh tế Vận tải',
    academicClass: 'KTVT-K22B',
    email: 'mai.tran@uth.edu.vn',
    phone: '0922 888 999',
    cardExpiry: '30/06/2026',
    cardStatus: 'ACTIVE',
    cardStatusLabel: 'Thẻ hợp lệ',
    currentBorrowCount: 3,
    maxBorrowLimit: 5,
    unpaidFine: 25000,
    hasOverdue: true,
    activeOrder: {
      orderCode: 'ORD-2026-1002',
      pickupSlot: '13:30 - 15:00',
      status: 'READY_FOR_PICKUP',
      statusLabel: 'Sẵn sàng lấy sách',
      books: [
        {
          title: 'Quản trị chuỗi cung ứng & Logistics',
          code: 'UTH-LOG-0301',
          shelfLocation: 'Kệ C-01-02',
          author: 'Lê Hoàng C'
        }
      ]
    }
  }
}

/*
  Component ScanStationPage
  Bo cuc khung quet QR tai quay thu vien va giao dien The sinh vien (Student Info Card)
  sau khi camera quet thanh cong ma QR hoac ma the sinh vien.
*/
export default function ScanStationPage({ onScanSuccess }) {
  const [cameraActive, setCameraActive] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [scannedStudent, setScannedStudent] = useState(null)
  const [isHandoverSuccess, setIsHandoverSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')

  /* Nhat ky cac luot quet trong ca truc */
  const [stationLogs, setStationLogs] = useState([
    {
      id: 1,
      time: '10:15:30',
      code: '2251120145',
      studentName: 'Nguyễn Văn An',
      action: 'Quét thẻ sinh viên thành công',
      status: 'SUCCESS'
    },
    {
      id: 2,
      time: '09:40:12',
      code: 'ORD-2026-1004',
      studentName: 'Phạm Quốc Bảo',
      action: 'Nhận diện đơn mượn tại quầy',
      status: 'SUCCESS'
    }
  ])

  function showToast(text, type = 'success') {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  /* Xu ly sau khi quet hoac nhap ma thanh cong */
  function handleProcessScan(code) {
    if (!code || !code.trim()) return
    const cleanCode = code.trim().toUpperCase()

    /* Tim thong tin sinh vien tu kho du lieu */
    let student = mockStudentCards[cleanCode]
    if (!student) {
      if (cleanCode.includes('2251120145') || cleanCode.includes('1001')) {
        student = mockStudentCards['2251120145']
      } else if (cleanCode.includes('2251120032') || cleanCode.includes('1002')) {
        student = mockStudentCards['2251120032']
      } else {
        student = {
          studentId: cleanCode,
          fullName: 'Sinh viên UTH (Mã ' + cleanCode + ')',
          faculty: 'Khoa Công nghệ Thông tin',
          academicClass: 'K22-UTH',
          email: `${cleanCode.toLowerCase()}@uth.edu.vn`,
          phone: '0900 123 456',
          cardExpiry: '30/06/2026',
          cardStatus: 'ACTIVE',
          cardStatusLabel: 'Thẻ hợp lệ',
          currentBorrowCount: 1,
          maxBorrowLimit: 5,
          unpaidFine: 0,
          hasOverdue: false,
          activeOrder: {
            orderCode: 'ORD-' + cleanCode,
            pickupSlot: 'Trong ngày',
            status: 'READY_FOR_PICKUP',
            statusLabel: 'Sẵn sàng lấy sách',
            books: [
              {
                title: 'Giáo trình tài liệu mượn tại quầy',
                code: 'UTH-DOC-01',
                shelfLocation: 'Kệ A-01-01',
                author: 'UTH Library'
              }
            ]
          }
        }
      }
    }

    setScannedStudent(student)
    setIsHandoverSuccess(false)
    showToast(`Đã nhận diện thành công sinh viên: ${student.fullName}`, 'success')

    /* Ghi nhat ky */
    const logItem = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('vi-VN'),
      code: cleanCode,
      studentName: student.fullName,
      action: 'Nhận diện thẻ sinh viên tại quầy',
      status: 'SUCCESS'
    }
    setStationLogs((prev) => [logItem, ...prev.slice(0, 9)])

    if (onScanSuccess) {
      onScanSuccess(student)
    }
  }

  /* Xu ly submit o nhap thu cong */
  function handleManualSubmit(e) {
    e?.preventDefault()
    if (!manualCode.trim()) return
    handleProcessScan(manualCode)
    setManualCode('')
  }

  /* Xac nhan ban giao sach cho sinh vien */
  function handleConfirmHandover() {
    setIsHandoverSuccess(true)
    showToast(`Đã hoàn tất bàn giao sách cho sinh viên ${scannedStudent?.fullName}!`, 'success')
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast thong bao phan hoi */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 1000,
            padding: '10px 18px',
            background: toastMessage.type === 'error' ? '#dc2626' : '#16a34a',
            color: 'white',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Thanh header tieu de tram quet */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
              Trạm quét QR tại quầy
            </h1>
            <span
              style={{
                padding: '2px 8px',
                background: '#ecfdf3',
                color: '#15803d',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
              Sẵn sàng quét
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
            Hỗ trợ nhận diện mã QR đơn mượn, thẻ sinh viên và phiếu hẹn trả sách tại quầy thủ thư
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setCameraActive((v) => !v)}
          >
            <Camera size={14} />
            {cameraActive ? 'Tắt camera' : 'Bật camera'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GIAO DIEN THE SINH VIEN (STUDENT INFO CARD) SAU KHI QUET THANH CONG       */}
      {/* ========================================================================= */}
      {scannedStudent && (
        <div
          className="card"
          style={{
            padding: '24px',
            border: '2px solid #2563eb',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.1)',
            position: 'relative'
          }}
        >
          {/* Nut dong the sinh vien */}
          <button
            type="button"
            className="icon-button"
            style={{ position: 'absolute', top: '16px', right: '16px' }}
            onClick={() => setScannedStudent(null)}
            aria-label="Đóng thẻ sinh viên"
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'start'
            }}
          >
            {/* Cot ben trai: Thong tin the sinh vien chinh thuc UTH */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <GraduationCap size={28} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                      {scannedStudent.fullName}
                    </h2>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: '#ecfdf5',
                        color: '#059669'
                      }}
                    >
                      {scannedStudent.cardStatusLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                    MSSV: {scannedStudent.studentId} • Lớp: {scannedStudent.academicClass}
                  </div>
                </div>
              </div>

              {/* Chi tiet sinh vien */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
                  <BookOpen size={14} color="#64748b" />
                  <span>Khoa:</span>
                  <strong style={{ color: '#0f172a' }}>{scannedStudent.faculty}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
                  <Mail size={14} color="#64748b" />
                  <span>Email:</span>
                  <span style={{ color: '#0f172a' }}>{scannedStudent.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
                  <Phone size={14} color="#64748b" />
                  <span>SĐT liên hệ:</span>
                  <span style={{ color: '#0f172a' }}>{scannedStudent.phone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
                  <Calendar size={14} color="#64748b" />
                  <span>Thời hạn thẻ:</span>
                  <strong style={{ color: '#0f172a' }}>{scannedStudent.cardExpiry}</strong>
                </div>
              </div>

              {/* Chi so han muc muon sach va tinh trang no phat */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginTop: '14px'
                }}
              >
                {/* Han muc muon sach */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    Sách đang mượn
                  </div>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                    {scannedStudent.currentBorrowCount} / {scannedStudent.maxBorrowLimit} cuốn
                  </strong>
                  <div
                    style={{
                      height: '6px',
                      background: '#e2e8f0',
                      borderRadius: '3px',
                      marginTop: '6px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${(scannedStudent.currentBorrowCount / scannedStudent.maxBorrowLimit) * 100}%`,
                        height: '100%',
                        background: '#2563eb'
                      }}
                    />
                  </div>
                </div>

                {/* Tinh trang no phat */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: scannedStudent.unpaidFine > 0 ? '#fef2f2' : '#f0fdf4',
                    border: '1px solid',
                    borderColor: scannedStudent.unpaidFine > 0 ? '#fecaca' : '#bbf7d0'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    Tình trạng nợ phạt
                  </div>
                  {scannedStudent.unpaidFine > 0 ? (
                    <div>
                      <strong style={{ fontSize: '15px', color: '#dc2626' }}>
                        {scannedStudent.unpaidFine.toLocaleString('vi-VN')} đ
                      </strong>
                      <div style={{ fontSize: '10px', color: '#b91c1c', marginTop: '2px' }}>
                        ⚠️ Có sách trễ hạn chưa nộp phạt
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong style={{ fontSize: '15px', color: '#16a34a' }}>0 VNĐ</strong>
                      <div style={{ fontSize: '10px', color: '#15803d', marginTop: '2px' }}>
                        ✓ Không nợ phạt thư viện
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cot ben phai: Danh sach sach can ban giao & hanh dong xu ly */}
            <div>
              <div
                style={{
                  padding: '16px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PackageCheck size={18} color="#2563eb" />
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                      Đơn mượn đang chờ nhận: #{scannedStudent.activeOrder?.orderCode}
                    </strong>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {scannedStudent.activeOrder?.statusLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scannedStudent.activeOrder?.books.map((book, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{book.title}</strong>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>Tác giả: {book.author}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#2563eb',
                          fontWeight: 600,
                          fontSize: '11px',
                          background: '#eff6ff',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        <MapPin size={12} /> {book.shelfLocation}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={12} /> Khung giờ hẹn nhận sách: {scannedStudent.activeOrder?.pickupSlot}
                </div>
              </div>

              {/* Thong bao ban giao thanh cong */}
              {isHandoverSuccess ? (
                <div
                  style={{
                    padding: '14px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '14px'
                  }}
                >
                  <CheckCircle2 size={24} color="#16a34a" style={{ margin: '0 auto 6px' }} />
                  <strong style={{ color: '#15803d', display: 'block', fontSize: '13px' }}>
                    Đã bàn giao sách cho sinh viên thành công!
                  </strong>
                  <span style={{ fontSize: '11px', color: '#166534' }}>
                    Hạn trả mới: 14 ngày tới. Hệ thống đã cập nhật số lượng mượn.
                  </span>
                </div>
              ) : null}

              {/* Cac nut hanh dong tai quay */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button button--secondary"
                  style={{ flex: 1 }}
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> In phiếu hẹn
                </button>

                {!isHandoverSuccess && (
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ flex: 2, background: '#16a34a', borderColor: '#16a34a' }}
                    onClick={handleConfirmHandover}
                  >
                    <Check size={14} /> Xác nhận bàn giao sách (&lt; 30s)
                  </button>
                )}

                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setScannedStudent(null)}
                >
                  Quét thẻ khác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BO CUC KHUNG QUET CAMERA SCANNER TAI QUAY                                 */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Khung camera nhan scanner */}
        <div className="card" style={{ padding: '20px' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={16} color="#2563eb" />
              <h2 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>
                Khung quét mã trực tiếp tại quầy
              </h2>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Hỗ trợ Webcam laptop & Trạm quét mã
            </span>
          </header>

          {/* Khung ngam camera voi tia laser quet */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '260px',
              background: '#0f172a',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {cameraActive ? (
              <div
                style={{
                  position: 'relative',
                  width: '180px',
                  height: '180px',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* 4 goc reticle */}
                <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderTopLeftRadius: '10px' }} />
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderTopRightRadius: '10px' }} />
                <span style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderBottomLeftRadius: '10px' }} />
                <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderBottomRightRadius: '10px' }} />

                {/* Tia laser mo phong chay doc */}
                <div
                  style={{
                    position: 'absolute',
                    left: '4px',
                    right: '4px',
                    height: '2px',
                    background: '#38bdf8',
                    boxShadow: '0 0 12px #38bdf8',
                    animation: 'scanLaser 2.2s infinite ease-in-out'
                  }}
                />

                <QrCode size={44} color="rgba(255,255,255,0.2)" />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <Camera size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '12px' }}>Camera đang tắt</p>
              </div>
            )}

            {/* Nhap nhay trang thai truc tuyen */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '4px 10px',
                background: 'rgba(0,0,0,0.65)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              Khung quét sẵn sàng nhận mã
            </div>
          </div>

          {/* O nhap ma thu cong khi QR hong */}
          <form onSubmit={handleManualSubmit} style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Nhập mã thẻ sinh viên hoặc mã đơn trực tiếp:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="date-input"
                style={{ flex: 1, fontSize: '13px', textTransform: 'uppercase' }}
                placeholder="VD: 2251120145 hoặc ORD-2026-1001..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button
                type="submit"
                className="button button--primary"
                disabled={!manualCode.trim()}
              >
                <Search size={14} /> Tra cứu
              </button>
            </div>
          </form>

          {/* Phim tat quet thu nghiem nhanh */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
              Dữ liệu thử nghiệm nhanh:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                className="button button--secondary"
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={() => handleProcessScan('2251120145')}
              >
                + SV Nguyễn Văn An (2251120145)
              </button>
              <button
                type="button"
                className="button button--secondary"
                style={{ fontSize: '10px', padding: '4px 8px' }}
                onClick={() => handleProcessScan('2251120032')}
              >
                + SV Trần Thị Mai (Có nợ phạt)
              </button>
            </div>
          </div>
        </div>

        {/* Nhat ky quet tai quay */}
        <div className="card" style={{ padding: '20px' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#2563eb" />
              <h2 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>
                Lịch sử quét trong ca trực ({stationLogs.length})
              </h2>
            </div>
          </header>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '360px',
              overflowY: 'auto'
            }}
          >
            {stationLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#0f172a' }}>{log.studentName}</strong>
                    <span
                      style={{
                        padding: '1px 6px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 600
                      }}
                    >
                      {log.code}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>{log.action}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <time style={{ color: '#94a3b8' }}>{log.time}</time>
                  <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '10px' }}>
                    ✓ Thành công
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
