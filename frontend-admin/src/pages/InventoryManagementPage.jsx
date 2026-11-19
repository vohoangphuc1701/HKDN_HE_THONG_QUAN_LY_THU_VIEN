import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Boxes,
  Check,
  CheckCircle2,
  Edit2,
  MapPin,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  X,
  Layers,
  Building2,
  Calendar,
  Barcode
} from 'lucide-react'
import adminApi from '../services/adminApi'

/*
  Trang quan ly kho sach thu vien UTH.
  Bao gom tra cuu danh muc, thiet ke modal form them/sua dau sach
  va modal cap nhat so luong nhap kho nhanh cho tung dau sach.
*/
export default function InventoryManagementPage() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  /* Thong bao toast phan hoi thao tac */
  const [toastMessage, setToastMessage] = useState(null)

  /* Trang thai modal them/sua dau sach */
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    code: '',
    isbn: '',
    category: 'Công nghệ thông tin',
    shelfLocation: 'Kệ A-01-01',
    publisher: 'NXB Giao thông Vận tải',
    publishYear: 2024,
    totalCopies: 10,
    availableCopies: 10,
    addStockCopies: 0,
    condition: 'Mới 100%'
  })
  const [formErrors, setFormErrors] = useState({})

  /* Trang thai modal nhap kho nhanh */
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [stockTargetBook, setStockTargetBook] = useState(null)
  const [stockInQuantity, setStockInQuantity] = useState(5)
  const [stockInNote, setStockInNote] = useState('Nhập bổ sung học kỳ mới')
  const [stockInSubmitting, setStockInSubmitting] = useState(false)

  /* Hien thi thong bao phan hoi trong 3 giay */
  function showToast(text, type = 'success') {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  useEffect(() => {
    loadCategories()
    fetchBooks()
  }, [])

  /* Tai danh sach the loai sach */
  async function loadCategories() {
    try {
      const cats = await adminApi.getCategories()
      setCategories(cats)
    } catch (err) {
      console.error('Lỗi khi tải danh mục thể loại:', err)
    }
  }

  /* Tai danh sach sach tu API */
  async function fetchBooks() {
    setLoading(true)
    try {
      const data = await adminApi.getInventory({
        search: searchKeyword,
        category: selectedCategory,
        status: selectedStatus
      })
      setBooks(data)
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sách:', err)
    } finally {
      setLoading(false)
    }
  }

  /* Kich hoat tim kiem khi submit form bo loc */
  function handleFilterSubmit(e) {
    if (e) e.preventDefault()
    fetchBooks()
  }

  /* Mo modal them moi dau sach */
  function handleOpenCreateModal() {
    setEditingBook(null)
    setFormErrors({})
    setFormData({
      title: '',
      author: '',
      code: `UTH-${Math.floor(1000 + Math.random() * 9000)}`,
      isbn: '978-604-0-' + Math.floor(10000 + Math.random() * 90000) + '-0',
      category: categories[0] || 'Công nghệ thông tin',
      shelfLocation: 'Kệ A-01-01',
      publisher: 'NXB Giao thông Vận tải',
      publishYear: new Date().getFullYear(),
      totalCopies: 10,
      availableCopies: 10,
      addStockCopies: 0,
      condition: 'Mới 100%'
    })
    setIsBookModalOpen(true)
  }

  /* Mo modal chinh sua dau sach */
  function handleOpenEditModal(book) {
    setEditingBook(book)
    setFormErrors({})
    setFormData({
      title: book.title || '',
      author: book.author || '',
      code: book.code || '',
      isbn: book.isbn || '',
      category: book.category || (categories[0] || 'Công nghệ thông tin'),
      shelfLocation: book.shelfLocation || 'Kệ A-01-01',
      publisher: book.publisher || 'NXB Giao thông Vận tải',
      publishYear: book.publishYear || 2024,
      totalCopies: Number(book.totalCopies) || 0,
      availableCopies: Number(book.availableCopies) || 0,
      addStockCopies: 0,
      condition: book.condition || 'Mới 100%'
    })
    setIsBookModalOpen(true)
  }

  /* Kiem tra tinh hop le cua du lieu truoc khi luu */
  function validateForm() {
    const errors = {}
    if (!formData.title.trim()) {
      errors.title = 'Tên đầu sách không được để trống'
    }
    if (!formData.author.trim()) {
      errors.author = 'Tác giả không được để trống'
    }
    if (!formData.code.trim()) {
      errors.code = 'Mã tài liệu không được để trống'
    }
    if (Number(formData.totalCopies) < 0) {
      errors.totalCopies = 'Tổng số lượng không thể là số âm'
    }
    if (Number(formData.availableCopies) < 0) {
      errors.availableCopies = 'Số lượng khả dụng không thể là số âm'
    }
    if (Number(formData.availableCopies) > Number(formData.totalCopies)) {
      errors.availableCopies = 'Số lượng khả dụng không được lớn hơn tổng số lượng'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* Luu thong tin sach (them moi hoac cap nhat) */
  async function handleSaveBook(e) {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editingBook) {
        // Neu co nhap them so luong trong form sua
        const extra = Number(formData.addStockCopies) || 0
        const finalTotal = Number(formData.totalCopies) + extra
        const finalAvailable = Number(formData.availableCopies) + extra

        const payload = {
          ...formData,
          totalCopies: finalTotal,
          availableCopies: finalAvailable
        }
        delete payload.addStockCopies

        await adminApi.updateBook(editingBook.id, payload)
        showToast(
          extra > 0
            ? `Đã cập nhật sách và nhập thêm +${extra} bản vào kho thành công!`
            : `Đã cập nhật thông tin đầu sách "${formData.title}" thành công!`
        )
      } else {
        const payload = {
          ...formData,
          totalCopies: Number(formData.totalCopies),
          availableCopies: Number(formData.availableCopies)
        }
        delete payload.addStockCopies

        await adminApi.createBook(payload)
        showToast(`Đã thêm mới đầu sách "${formData.title}" vào kho thư viện!`)
      }
      setIsBookModalOpen(false)
      fetchBooks()
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu: ' + err.message)
    }
  }

  /* Mo modal cap nhat so luong nhap kho */
  function handleOpenStockInModal(book) {
    setStockTargetBook(book)
    setStockInQuantity(5)
    setStockInNote('Nhập bổ sung đợt mới')
    setIsStockModalOpen(true)
  }

  /* Xac nhan cap nhat so luong nhap kho */
  async function handleConfirmStockIn(e) {
    e.preventDefault()
    if (!stockTargetBook) return

    const qty = Number(stockInQuantity)
    if (qty <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0')
      return
    }

    setStockInSubmitting(true)
    try {
      await adminApi.stockInBook(stockTargetBook.id, {
        quantity: qty,
        note: stockInNote
      })
      showToast(
        `Đã nhập thêm +${qty} cuốn vào kho cho sách "${stockTargetBook.title}"!`
      )
      setIsStockModalOpen(false)
      fetchBooks()
    } catch (err) {
      alert('Không thể cập nhật số lượng nhập kho: ' + err.message)
    } finally {
      setStockInSubmitting(false)
    }
  }

  /* Xoa dau sach */
  async function handleDeleteBook(id, title) {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đầu sách "${title}" khỏi kho?`)) {
      try {
        await adminApi.deleteBook(id)
        showToast(`Đã xóa đầu sách "${title}" khỏi hệ thống!`, 'info')
        fetchBooks()
      } catch (err) {
        alert('Không thể xóa đầu sách: ' + err.message)
      }
    }
  }

  /* Tinh toan so lieu thong ke nhanh o dau trang */
  const totalTitles = books.length
  const sumTotalCopies = books.reduce((acc, cur) => acc + (Number(cur.totalCopies) || 0), 0)
  const sumAvailableCopies = books.reduce((acc, cur) => acc + (Number(cur.availableCopies) || 0), 0)
  const outOfStockCount = books.filter((b) => (Number(b.availableCopies) || 0) <= 0).length

  return (
    <div className="inventory-page">
      {/* Thong bao toast noi */}
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
            background: toastMessage.type === 'info' ? '#1e293b' : '#15803d',
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

      {/* Thanh cong cu va tieu de */}
      <div className="page-actions" style={{ marginBottom: '16px' }}>
        <div>
          <p className="page-description">
            Quản lý danh mục đầu sách, vị trí kệ và kiểm soát số lượng tổng và số lượng khả dụng trong kho.
          </p>
        </div>
        <div>
          <button type="button" className="button button--primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Thêm đầu sách
          </button>
        </div>
      </div>

      {/* The thong ke nhanh so luong trong kho */}
      <div className="metric-grid" style={{ marginBottom: '16px' }}>
        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--blue">
            <BookOpen size={20} />
          </span>
          <div className="metric-card__body">
            <p>Tổng số đầu sách</p>
            <strong>{totalTitles}</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--green">
            <Boxes size={20} />
          </span>
          <div className="metric-card__body">
            <p>Tổng số bản sách</p>
            <strong>{sumTotalCopies}</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--orange">
            <Check size={20} />
          </span>
          <div className="metric-card__body">
            <p>Sách khả dụng (sẵn sàng mượn)</p>
            <strong>{sumAvailableCopies}</strong>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card__icon metric-card__icon--violet">
            <AlertTriangle size={20} />
          </span>
          <div className="metric-card__body">
            <p>Đầu sách hết hàng</p>
            <strong>{outOfStockCount}</strong>
          </div>
        </div>
      </div>

      {/* Bang danh sach sach kem bo loc */}
      <div className="panel">
        <div className="panel__header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Danh mục sách trong kho</h2>
            <p>Danh sách chi tiết vị trí kệ và số lượng từng đầu sách</p>
          </div>

          <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label className="filter-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Tìm tên sách, tác giả, mã, vị trí kệ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </label>

            <select
              className="date-input"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
              }}
            >
              <option value="ALL">Tất cả thể loại</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="date-input"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="AVAILABLE">Còn sách</option>
              <option value="OUT_OF_STOCK">Hết sách</option>
            </select>

            <button type="submit" className="button button--secondary">
              Lọc
            </button>
          </form>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#667085' }}>
              Đang tải danh mục sách...
            </div>
          ) : books.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#667085' }}>
              Không tìm thấy đầu sách nào phù hợp với điều kiện tìm kiếm.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>MÃ TÀI LIỆU</th>
                  <th>TÊN ĐẦU SÁCH & TÁC GIẢ</th>
                  <th>THỂ LOẠI</th>
                  <th>VỊ TRÍ KỆ</th>
                  <th style={{ textAlign: 'center' }}>TỔNG SỐ LƯỢNG</th>
                  <th style={{ textAlign: 'center' }}>KHẢ DỤNG</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const isAvailable = Number(book.availableCopies) > 0
                  return (
                    <tr key={book.id}>
                      <td>
                        <strong>{book.code}</strong>
                        <div style={{ fontSize: '10px', color: '#98a2b3' }}>ISBN: {book.isbn}</div>
                      </td>
                      <td>
                        <strong>{book.title}</strong>
                        <div style={{ color: '#667085', fontSize: '11px' }}>{book.author}</div>
                      </td>
                      <td>{book.category}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1d4ed8' }}>
                          <MapPin size={13} /> {book.shelfLocation}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{book.totalCopies}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={isAvailable ? 'quantity' : 'quantity quantity--empty'}>
                          {book.availableCopies}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${isAvailable ? 'status--giao' : 'status--gom'}`}>
                          {isAvailable ? 'Còn sách' : 'Hết sách'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {/* Nut nhap kho nhanh */}
                        <button
                          type="button"
                          className="icon-button"
                          title="Cập nhật số lượng nhập kho"
                          style={{ color: '#16a34a', marginRight: '4px' }}
                          onClick={() => handleOpenStockInModal(book)}
                        >
                          <PackagePlus size={16} />
                        </button>

                        {/* Nut chinh sua thong tin sach */}
                        <button
                          type="button"
                          className="icon-button"
                          title="Chỉnh sửa đầu sách"
                          onClick={() => handleOpenEditModal(book)}
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Nut xoa sach */}
                        <button
                          type="button"
                          className="icon-button"
                          title="Xóa đầu sách"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleDeleteBook(book.id, book.title)}
                        >
                          <Trash2 size={15} />
                        </button>
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
      {/* MODAL 1: Form Thêm / Chỉnh sửa đầu sách                                   */}
      {/* ========================================================================= */}
      {isBookModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '640px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
          >
            {/* Tieu de modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '14px',
                borderBottom: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#172033' }}>
                    {editingBook ? 'Chỉnh sửa đầu sách' : 'Thêm đầu sách mới vào kho'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {editingBook
                      ? `Cập nhật thông tin chi tiết cho mã tài liệu #${editingBook.code}`
                      : 'Khai báo thông tin ấn phẩm và số lượng bản sách nhập kho ban đầu'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsBookModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Nhom 1: Thong tin an pham */}
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '10px'
                  }}
                >
                  <Layers size={14} /> 1. Thông tin xuất bản & Tài liệu
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '5px'
                      }}
                    >
                      Tên đầu sách <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="date-input"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        borderColor: formErrors.title ? '#ef4444' : undefined
                      }}
                      placeholder="Ví dụ: Lập trình ứng dụng Web với React và Spring Boot"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value })
                        if (formErrors.title) setFormErrors({ ...formErrors, title: null })
                      }}
                    />
                    {formErrors.title && (
                      <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                        {formErrors.title}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '5px'
                        }}
                      >
                        Tác giả <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="date-input"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          borderColor: formErrors.author ? '#ef4444' : undefined
                        }}
                        placeholder="Tên tác giả hoặc nhóm biên soạn"
                        value={formData.author}
                        onChange={(e) => {
                          setFormData({ ...formData, author: e.target.value })
                          if (formErrors.author) setFormErrors({ ...formErrors, author: null })
                        }}
                      />
                      {formErrors.author && (
                        <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                          {formErrors.author}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '5px'
                        }}
                      >
                        Thể loại
                      </label>
                      <select
                        className="date-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '5px'
                        }}
                      >
                        Mã tài liệu / Mã sách <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="date-input"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          borderColor: formErrors.code ? '#ef4444' : undefined
                        }}
                        placeholder="Ví dụ: UTH-CNTT-0108"
                        value={formData.code}
                        onChange={(e) => {
                          setFormData({ ...formData, code: e.target.value })
                          if (formErrors.code) setFormErrors({ ...formErrors, code: null })
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '5px'
                        }}
                      >
                        Mã chuẩn ISBN
                      </label>
                      <input
                        type="text"
                        className="date-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        placeholder="978-604-0-..."
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '5px'
                        }}
                      >
                        Nhà xuất bản
                      </label>
                      <input
                        type="text"
                        className="date-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        placeholder="Ví dụ: NXB Giao thông Vận tải"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '5px'
                        }}
                      >
                        Năm xuất bản
                      </label>
                      <input
                        type="number"
                        min="1900"
                        max="2099"
                        className="date-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        value={formData.publishYear}
                        onChange={(e) => setFormData({ ...formData, publishYear: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nhom 2: Vi tri luu kho va Tinh trang */}
              <div style={{ paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '10px'
                  }}
                >
                  <MapPin size={14} /> 2. Vị trí lưu kho & Phân bổ
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '5px'
                      }}
                    >
                      Vị trí kệ sách thư viện
                    </label>
                    <input
                      type="text"
                      className="date-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="Ví dụ: Kệ A-02-04"
                      value={formData.shelfLocation}
                      onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '5px'
                      }}
                    >
                      Tình trạng sách
                    </label>
                    <select
                      className="date-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="Mới 100%">Mới 100%</option>
                      <option value="Tốt (90-95%)">Tốt (90-95%)</option>
                      <option value="Bình thường (75-89%)">Bình thường (75-89%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nhom 3: Quan ly so luong va Nhap kho */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}
                >
                  <Boxes size={14} /> 3. Quản lý số lượng & Cập nhật kho
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '5px'
                      }}
                    >
                      Tổng số lượng hiện tại
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="date-input"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        borderColor: formErrors.totalCopies ? '#ef4444' : undefined
                      }}
                      value={formData.totalCopies}
                      onChange={(e) => {
                        const total = Number(e.target.value)
                        setFormData({
                          ...formData,
                          totalCopies: total,
                          availableCopies: Math.min(formData.availableCopies, total)
                        })
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '5px'
                      }}
                    >
                      Số lượng khả dụng
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={formData.totalCopies}
                      className="date-input"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        borderColor: formErrors.availableCopies ? '#ef4444' : undefined
                      }}
                      value={formData.availableCopies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availableCopies: Number(e.target.value)
                        })
                      }
                    />
                    {formErrors.availableCopies && (
                      <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                        {formErrors.availableCopies}
                      </span>
                    )}
                  </div>
                </div>

                {/* Neu dang chinh sua: Co them o nhap them so luong truc tiep */}
                {editingBook && (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1'
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#16a34a',
                        marginBottom: '6px'
                      }}
                    >
                      <PackagePlus size={15} /> Nhập thêm số lượng vào kho (+ bản sách)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        className="date-input"
                        style={{ width: '130px' }}
                        value={formData.addStockCopies}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            addStockCopies: Math.max(0, Number(e.target.value))
                          })
                        }
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        (Tổng sau nhập: <strong>{Number(formData.totalCopies) + (Number(formData.addStockCopies) || 0)}</strong>, Khả dụng:{' '}
                        <strong>{Number(formData.availableCopies) + (Number(formData.addStockCopies) || 0)}</strong>)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Nut hanh dong modal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setIsBookModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="button button--primary">
                  {editingBook ? 'Cập nhật đầu sách' : 'Thêm mới vào kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Cập nhật số lượng nhập kho nhanh (Stock-In Modal)                */}
      {/* ========================================================================= */}
      {isStockModalOpen && stockTargetBook && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Header modal nhap kho */}
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
                  <PackagePlus size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#172033' }}>
                    Cập nhật số lượng nhập kho
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Bổ sung số bản sách mới vào kho lưu trữ
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsStockModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmStockIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Thong tin tom tat sach can nhap */}
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', marginBottom: '4px' }}>
                  {stockTargetBook.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Mã: <strong>{stockTargetBook.code}</strong></span>
                  <span>Vị trí: <strong>{stockTargetBook.shelfLocation}</strong></span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px dashed #cbd5e1'
                  }}
                >
                  <span>Hiện tại trong kho:</span>
                  <span>
                    Tổng: <strong>{stockTargetBook.totalCopies}</strong> | Khả dụng:{' '}
                    <strong style={{ color: '#16a34a' }}>{stockTargetBook.availableCopies}</strong>
                  </span>
                </div>
              </div>

              {/* O nhap so luong nhap kho */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px'
                  }}
                >
                  Số lượng nhập thêm vào kho <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    required
                    className="date-input"
                    style={{ flex: 1 }}
                    value={stockInQuantity}
                    onChange={(e) => setStockInQuantity(Math.max(1, Number(e.target.value)))}
                  />
                  {/* Cac nut chon nhanh so luong */}
                  {[5, 10, 20, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStockInQuantity(preset)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: stockInQuantity === preset ? '#eff6ff' : '#ffffff',
                        borderColor: stockInQuantity === preset ? '#2563eb' : '#cbd5e1',
                        color: stockInQuantity === preset ? '#2563eb' : '#475569',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>

                {/* Xem truoc ket qua sau khi nhap */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    color: '#1e40af',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <span>Dự kiến sau khi nhập:</span>
                  <span>
                    Tổng mới: {Number(stockTargetBook.totalCopies) + Number(stockInQuantity)} | Khả dụng mới:{' '}
                    {Number(stockTargetBook.availableCopies) + Number(stockInQuantity)}
                  </span>
                </div>
              </div>

              {/* Ghi chu / Chung tu nhap kho */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '5px'
                  }}
                >
                  Nguồn nhập / Lý do / Ghi chú chứng từ
                </label>
                <input
                  type="text"
                  className="date-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="Ví dụ: Mua bổ sung đợt 2 theo đề xuất Khoa CNTT"
                  value={stockInNote}
                  onChange={(e) => setStockInNote(e.target.value)}
                />
              </div>

              {/* Nut xac nhan nhap kho */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '8px',
                  paddingTop: '14px',
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={stockInSubmitting}
                  onClick={() => setIsStockModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="button button--primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  disabled={stockInSubmitting}
                >
                  {stockInSubmitting ? 'Đang cập nhật...' : 'Xác nhận nhập kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
