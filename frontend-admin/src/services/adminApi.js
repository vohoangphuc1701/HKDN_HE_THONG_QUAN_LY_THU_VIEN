import axiosClient from './axiosClient'

/* Dữ liệu mẫu danh mục sách trong kho thư viện UTH */
const initialInventory = [
  {
    id: 1,
    code: 'UTH-CNTT-0101',
    isbn: '978-604-0-12345-1',
    title: 'Kỹ thuật lập trình Java nâng cao',
    author: 'Trần Minh Quân',
    category: 'Công nghệ thông tin',
    shelfLocation: 'Kệ A-02-03',
    totalCopies: 15,
    availableCopies: 10,
    status: 'AVAILABLE',
  },
  {
    id: 2,
    code: 'UTH-CNTT-0102',
    isbn: '978-604-0-12346-8',
    title: 'Thiết kế hệ thống vi dịch vụ với Spring Boot',
    author: 'Lê Hồng Phúc',
    category: 'Công nghệ thông tin',
    shelfLocation: 'Kệ A-04-01',
    totalCopies: 12,
    availableCopies: 5,
    status: 'AVAILABLE',
  },
  {
    id: 3,
    code: 'UTH-CSDL-0205',
    isbn: '978-604-0-23456-2',
    title: 'Nhập môn Cơ sở dữ liệu và MySQL',
    author: 'Phạm Văn Tuấn',
    category: 'Công nghệ thông tin',
    shelfLocation: 'Kệ B-01-02',
    totalCopies: 20,
    availableCopies: 14,
    status: 'AVAILABLE',
  },
  {
    id: 4,
    code: 'UTH-LOG-0301',
    isbn: '978-604-0-34567-3',
    title: 'Quản trị chuỗi cung ứng và logistics cảng biển',
    author: 'Đỗ Mạnh Hùng',
    category: 'Logistics & Cảng biển',
    shelfLocation: 'Kệ C-02-05',
    totalCopies: 18,
    availableCopies: 8,
    status: 'AVAILABLE',
  },
  {
    id: 5,
    code: 'UTH-LUAT-0302',
    isbn: '978-604-0-34568-0',
    title: 'Luật Hàng hải quốc tế',
    author: 'Nguyễn Thu Hương',
    category: 'Logistics & Cảng biển',
    shelfLocation: 'Kệ C-03-02',
    totalCopies: 10,
    availableCopies: 0,
    status: 'OUT_OF_STOCK',
  },
  {
    id: 6,
    code: 'UTH-CAUDUONG-0401',
    isbn: '978-604-0-45678-4',
    title: 'Thiết kế cầu đường hiện đại',
    author: 'Hoàng Văn Đức',
    category: 'Kỹ thuật Cầu đường',
    shelfLocation: 'Kệ D-01-04',
    totalCopies: 14,
    availableCopies: 6,
    status: 'AVAILABLE',
  },
  {
    id: 7,
    code: 'UTH-TOAN-0501',
    isbn: '978-604-0-56789-5',
    title: 'Giải tích toán học dành cho kỹ sư',
    author: 'Vũ Đình Cự',
    category: 'Khoa học cơ bản',
    shelfLocation: 'Kệ E-01-01',
    totalCopies: 25,
    availableCopies: 21,
    status: 'AVAILABLE',
  },
  {
    id: 8,
    code: 'UTH-CNTT-0105',
    isbn: '978-604-0-12349-9',
    title: 'Kiến trúc máy tính và Hợp ngữ',
    author: 'Nguyễn Thanh Hải',
    category: 'Công nghệ thông tin',
    shelfLocation: 'Kệ A-01-02',
    totalCopies: 8,
    availableCopies: 0,
    status: 'OUT_OF_STOCK',
  },
]

let localInventory = [...initialInventory]

/*
 * Dịch vụ API quản lý danh mục và kho sách dành cho thủ thư.
 * Cung cấp chức năng tra cứu, thêm mới, cập nhật số lượng tổng và số lượng khả dụng.
 */
const adminApi = {
  /*
   * Lấy danh sách đầu sách trong kho có hỗ trợ tìm kiếm và lọc theo thể loại.
   */
  async getInventory(params = {}) {
    try {
      return await axiosClient.get('/admin/inventory', { params })
    } catch (error) {
      console.warn('Sử dụng dữ liệu mẫu cho danh mục kho sách:', error.message)
      let list = [...localInventory]

      if (params.category && params.category !== 'ALL') {
        list = list.filter((item) => item.category === params.category)
      }

      if (params.search) {
        const keyword = params.search.toLowerCase()
        list = list.filter(
          (item) =>
            item.title.toLowerCase().includes(keyword) ||
            item.author.toLowerCase().includes(keyword) ||
            item.code.toLowerCase().includes(keyword) ||
            item.shelfLocation.toLowerCase().includes(keyword)
        )
      }

      if (params.status && params.status !== 'ALL') {
        list = list.filter((item) => item.status === params.status)
      }

      return list
    }
  },

  /*
   * Lấy thông tin chi tiết một đầu sách theo ID.
   */
  async getBookById(id) {
    try {
      return await axiosClient.get(`/admin/inventory/${id}`)
    } catch (error) {
      const found = localInventory.find((item) => String(item.id) === String(id))
      if (!found) throw new Error('Không tìm thấy sách trong kho')
      return found
    }
  },

  /*
   * Thêm đầu sách mới vào kho tài liệu.
   */
  async createBook(bookData) {
    try {
      return await axiosClient.post('/admin/inventory', bookData)
    } catch (error) {
      console.warn('Mô phỏng thêm đầu sách mới:', error.message)
      const newBook = {
        id: Date.now(),
        code: bookData.code || `UTH-BOOK-${Math.floor(1000 + Math.random() * 9000)}`,
        isbn: bookData.isbn || 'N/A',
        title: bookData.title,
        author: bookData.author || 'Chưa rõ',
        category: bookData.category || 'Công nghệ thông tin',
        shelfLocation: bookData.shelfLocation || 'Kệ A-01-01',
        totalCopies: Number(bookData.totalCopies) || 1,
        availableCopies: Number(bookData.availableCopies) || Number(bookData.totalCopies) || 1,
        status: (Number(bookData.availableCopies) || Number(bookData.totalCopies)) > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
      }
      localInventory = [newBook, ...localInventory]
      return newBook
    }
  },

  /*
   * Cập nhật thông tin đầu sách, vị trí kệ và số lượng trong kho.
   */
  async updateBook(id, updateData) {
    try {
      return await axiosClient.put(`/admin/inventory/${id}`, updateData)
    } catch (error) {
      console.warn(`Mô phỏng cập nhật đầu sách #${id}:`, error.message)
      localInventory = localInventory.map((item) => {
        if (String(item.id) === String(id)) {
          const total = updateData.totalCopies !== undefined ? Number(updateData.totalCopies) : item.totalCopies
          const available = updateData.availableCopies !== undefined ? Number(updateData.availableCopies) : item.availableCopies
          return {
            ...item,
            ...updateData,
            totalCopies: total,
            availableCopies: available,
            status: available > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
          }
        }
        return item
      })
      return localInventory.find((item) => String(item.id) === String(id))
    }
  },

  /*
   * Cập nhật số lượng nhập kho cho một đầu sách (cộng thêm số bản sách nhập mới).
   */
  async stockInBook(id, { quantity, note = '' }) {
    try {
      return await axiosClient.post(`/admin/inventory/${id}/stock-in`, { quantity, note })
    } catch (error) {
      console.warn(`Mô phỏng nhập kho đầu sách #${id}:`, error.message)
      const book = localInventory.find((item) => String(item.id) === String(id))
      if (!book) throw new Error('Không tìm thấy đầu sách')
      const added = Number(quantity) || 0
      const newTotal = (Number(book.totalCopies) || 0) + added
      const newAvailable = (Number(book.availableCopies) || 0) + added
      return this.updateBook(id, {
        totalCopies: newTotal,
        availableCopies: newAvailable,
        lastStockInNote: note,
        lastStockInDate: new Date().toLocaleDateString('vi-VN'),
      })
    }
  },

  /*
   * Xóa một đầu sách khỏi danh mục kho.
   */
  async deleteBook(id) {
    try {
      return await axiosClient.delete(`/admin/inventory/${id}`)
    } catch (error) {
      console.warn(`Mô phỏng xóa đầu sách #${id}:`, error.message)
      localInventory = localInventory.filter((item) => String(item.id) !== String(id))
      return { success: true, message: 'Đã xóa đầu sách thành công' }
    }
  },

  /*
   * Lấy danh sách các thể loại sách phục vụ bộ lọc.
   */
  async getCategories() {
    return [
      'Công nghệ thông tin',
      'Logistics & Cảng biển',
      'Kỹ thuật Cầu đường',
      'Khoa học cơ bản',
      'Kinh tế vận tải',
    ]
  },
}

export default adminApi
