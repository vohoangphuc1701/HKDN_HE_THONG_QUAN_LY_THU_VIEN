import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Boxes,
  Check,
  Edit2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import adminApi from '../services/adminApi'

/*
 * Trang quản lý kho sách: tra cứu danh mục, kiểm soát số lượng tổng và số lượng khả dụng.
 */
export default function InventoryManagementPage() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  /* Trạng thái modal thêm/sửa sách */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    code: '',
    isbn: '',
    category: 'Công nghệ thông tin',
    shelfLocation: '',
    totalCopies: 1,
    availableCopies: 1,
  })

  useEffect(() => {
    loadCategories()
    fetchBooks()
  }, [])

  /* Tải danh sách thể loại sách */
  async function loadCategories() {
    try {
      const cats = await adminApi.getCategories()
      setCategories(cats)
    } catch (err) {
      console.error('Lỗi khi tải danh mục thể loại:', err)
    }
  }

  /* Tải danh sách sách từ API */
  async function fetchBooks() {
    setLoading(true)
    try {
      const data = await adminApi.getInventory({
        search: searchKeyword,
        category: selectedCategory,
        status: selectedStatus,
      })
      setBooks(data)
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sách:', err)
    } finally {
      setLoading(false)
    }
  }

  /* Kích hoạt tìm kiếm khi nhấn Enter hoặc thay đổi bộ lọc */
  function handleFilterSubmit(e) {
    if (e) e.preventDefault()
    fetchBooks()
  }

  /* Mở modal thêm mới sách */
  function handleOpenCreateModal() {
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      code: `UTH-${Math.floor(1000 + Math.random() * 9000)}`,
      isbn: '978-604-0-00000-0',
      category: categories[0] || 'Công nghệ thông tin',
      shelfLocation: 'Kệ A-01-01',
      totalCopies: 10,
      availableCopies: 10,
    })
    setIsModalOpen(true)
  }

  /* Mở modal chỉnh sửa đầu sách */
  function handleOpenEditModal(book) {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      code: book.code,
      isbn: book.isbn,
      category: book.category,
      shelfLocation: book.shelfLocation,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    })
    setIsModalOpen(true)
  }

  /* Lưu thông tin sách (thêm mới hoặc cập nhật) */
  async function handleSaveBook(e) {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên đầu sách')
      return
    }

    try {
      if (editingBook) {
        await adminApi.updateBook(editingBook.id, formData)
      } else {
        await adminApi.createBook(formData)
      }
      setIsModalOpen(false)
      fetchBooks()
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu: ' + err.message)
    }
  }

  /* Xóa đầu sách */
  async function handleDeleteBook(id, title) {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đầu sách "${title}" khỏi kho?`)) {
      try {
        await adminApi.deleteBook(id)
        fetchBooks()
      } catch (err) {
        alert('Không thể xóa đầu sách: ' + err.message)
      }
    }
  }

  /* Tính toán số liệu thống kê nhanh ở đầu bảng */
  const totalTitles = books.length
  const sumTotalCopies = books.reduce((acc, cur) => acc + (Number(cur.totalCopies) || 0), 0)
  const sumAvailableCopies = books.reduce((acc, cur) => acc + (Number(cur.availableCopies) || 0), 0)
  const outOfStockCount = books.filter((b) => (Number(b.availableCopies) || 0) <= 0).length

  return (
    <div className="inventory-page">
      {/* Thanh công cụ và tiêu đề */}
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

      {/* Thẻ thống kê nhanh số lượng trong kho */}
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

      {/* Bảng danh sách sách kèm bộ lọc */}
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
                <option key={c} value={c}>{c}</option>
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
                  <th style="text-align: center;">TỔNG SỐ LƯỢNG</th>
                  <th style="text-align: center;">KHẢ DỤNG</th>
                  <th>TRẠNG THÁI</th>
                  <th style="text-align: right;">THAO TÁC</th>
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
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>
                        {book.totalCopies}
                      </td>
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
                        <button
                          type="button"
                          className="icon-button"
                          title="Chỉnh sửa"
                          onClick={() => handleOpenEditModal(book)}
                        >
                          <Edit2 size={15} />
                        </button>
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

      {/* Modal Thêm / Chỉnh sửa sách */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#172033' }}>
                {editingBook ? 'Chỉnh sửa đầu sách' : 'Thêm đầu sách mới vào kho'}
              </h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                  Tên đầu sách *
                </label>
                <input
                  type="text"
                  required
                  className="date-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="Ví dụ: Kỹ thuật lập trình Java nâng cao"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                    Tác giả
                  </label>
                  <input
                    type="text"
                    className="date-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="Tên tác giả"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                    Mã tài liệu
                  </label>
                  <input
                    type="text"
                    className="date-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="Ví dụ: UTH-CNTT-0101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                    Thể loại
                  </label>
                  <select
                    className="date-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                    Vị trí kệ sách
                  </label>
                  <input
                    type="text"
                    className="date-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="Ví dụ: Kệ A-02-03"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                    Tổng số lượng trong kho
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="date-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={formData.totalCopies}
                    onChange={(e) => {
                      const total = Number(e.target.value)
                      setFormData({
                        ...formData,
                        totalCopies: total,
                        availableCopies: Math.min(formData.availableCopies, total),
                      })
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475467', marginBottom: '5px' }}>
                    Số lượng khả dụng
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalCopies}
                    className="date-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={formData.availableCopies}
                    onChange={(e) => setFormData({ ...formData, availableCopies: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="button button--primary">
                  {editingBook ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
