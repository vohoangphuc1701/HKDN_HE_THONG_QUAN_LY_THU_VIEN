import axiosClient from './axiosClient';
import mockPCBooks from '../mockPCBooks.json';

/**
 * Service API Kho Sách & Giáo Trình Học Thuật UTH (TV3 - Desktop & Mobile)
 * Kết nối REST API sang Spring Boot (/api/books):
 * - Tìm kiếm toàn văn (search / keyword)
 * - Phân trang chuẩn máy tính (page, size)
 * - Lọc đa chiều: Chuyên ngành (category), Vị trí kệ (shelfLocation), Tình trạng tồn kho (onlyAvailable)
 * - Sắp xếp đa tiêu chí: Mới nhất, còn sẵn nhiều nhất, mượn nhiều nhất, tên sách
 * - Cơ chế Fallback tự động sang mockPCBooks khi Backend chưa khởi động
 */

// Hàm chuẩn hóa dữ liệu đầu sách từ Backend sang giao diện UI
export const normalizeBook = (book) => {
  if (!book) return null;
  return {
    id: book.id,
    title: book.title || 'Chưa có tiêu đề',
    author: book.author || 'Chưa rõ tác giả',
    category: book.category || 'TỔNG HỢP',
    type: book.type || (book.isEbook ? 'EBOOK' : 'PRINT'),
    code: book.documentCode || book.code || `UTH-BK-${book.id}`,
    documentCode: book.documentCode || book.code || `UTH-BK-${book.id}`,
    totalQuantity: book.totalQuantity ?? 1,
    availableQuantity: book.availableQuantity ?? 1,
    coverImage:
      book.coverImage ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    publishYear: book.publishYear || 2024,
    publisher: book.publisher || 'NXB Đại học Giao thông Vận tải',
    shelfLocation: book.shelfLocation || 'CS1_A1_01',
    description: book.description || 'Tài liệu giáo trình chính quy phục vụ đào tạo tại Thư viện UTH.',
    borrowCount: book.borrowCount || 0,
    pageCount: book.pageCount || 250,
    campus: book.campus || 'CS1',
    isNew: book.isNew ?? (book.publishYear >= 2023),
  };
};

export const bookApi = {
  /**
   * Lấy danh sách sách có phân trang và bộ lọc nâng cao
   * @param {Object} params - Tham số truy vấn (search, category, onlyAvailable, page, size, sortBy, sortDir)
   * @returns {Promise<{ content: Array, page: number, size: number, totalElements: number, totalPages: number }>}
   */
  async getBooks(params = {}) {
    const {
      search = '',
      keyword = '',
      category = 'ALL',
      shelfLocation,
      onlyAvailable = false,
      page = 0,
      size = 12,
      sortBy = 'id',
      sortDir = 'desc',
    } = params;

    // Chuẩn bị query params gửi lên Spring Boot
    const queryParams = {
      page: Math.max(0, page),
      size: Math.max(1, size),
      sortBy,
      sortDir,
    };

    const effectiveSearch = (search || keyword || '').trim();
    if (effectiveSearch) {
      queryParams.search = effectiveSearch;
    }

    if (category && category !== 'ALL') {
      queryParams.category = category;
    }

    if (shelfLocation && shelfLocation !== 'ALL') {
      queryParams.shelfLocation = shelfLocation;
    }

    if (onlyAvailable) {
      queryParams.onlyAvailable = true;
    }

    try {
      const response = await axiosClient.get('/books', { params: queryParams });
      
      // Backend bọc trong ApiResponse<Map<String, Object>>
      const data = response?.data || response;
      if (data && Array.isArray(data.content)) {
        return {
          content: data.content.map(normalizeBook),
          page: data.page ?? page,
          size: data.size ?? size,
          totalElements: data.totalElements ?? data.content.length,
          totalPages: data.totalPages ?? Math.ceil((data.totalElements || data.content.length) / size),
        };
      }
      
      if (Array.isArray(data)) {
        return {
          content: data.map(normalizeBook),
          page: 0,
          size: data.length,
          totalElements: data.length,
          totalPages: 1,
        };
      }

      throw new Error('Dữ liệu trả về từ máy chủ không đúng định dạng');
    } catch (error) {
      console.warn('[bookApi.getBooks] Dùng dữ liệu fallback mockPCBooks:', error.message);

      // Xử lý bộ lọc trên mockPCBooks khi offline
      let filtered = [...mockPCBooks];

      if (effectiveSearch) {
        const kw = effectiveSearch.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title?.toLowerCase().includes(kw) ||
            b.author?.toLowerCase().includes(kw) ||
            b.code?.toLowerCase().includes(kw) ||
            b.documentCode?.toLowerCase().includes(kw)
        );
      }

      if (category && category !== 'ALL') {
        filtered = filtered.filter((b) => b.category === category);
      }

      if (onlyAvailable) {
        filtered = filtered.filter((b) => (b.availableQuantity ?? 0) > 0);
      }

      // Sắp xếp
      filtered.sort((a, b) => {
        if (sortBy === 'newest') return (b.publishYear || 0) - (a.publishYear || 0);
        if (sortBy === 'available') return (b.availableQuantity || 0) - (a.availableQuantity || 0);
        if (sortBy === 'borrowCount') return (b.borrowCount || 0) - (a.borrowCount || 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        return sortDir === 'asc' ? a.id - b.id : b.id - a.id;
      });

      const totalElements = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const startIndex = page * size;
      const pagedContent = filtered.slice(startIndex, startIndex + size).map(normalizeBook);

      return {
        content: pagedContent,
        page,
        size,
        totalElements,
        totalPages,
      };
    }
  },

  /**
   * Lấy chi tiết một cuốn sách theo ID
   * @param {number|string} id - Mã định danh sách
   */
  async getBookById(id) {
    try {
      const response = await axiosClient.get(`/books/${id}`);
      const rawBook = response?.data || response;
      return normalizeBook(rawBook);
    } catch (error) {
      console.warn(`[bookApi.getBookById] Dùng mock cho sách ID #${id}:`, error.message);
      const found = mockPCBooks.find((b) => String(b.id) === String(id));
      if (!found) {
        throw new Error(`Không tìm thấy cuốn sách có mã #${id}`);
      }
      return normalizeBook(found);
    }
  },

  /**
   * Lấy danh sách toàn bộ các chuyên ngành đào tạo UTH
   */
  async getCategories() {
    try {
      const response = await axiosClient.get('/books/categories');
      const list = response?.data || response;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
      throw new Error('Danh mục chuyên ngành rỗng');
    } catch (error) {
      console.warn('[bookApi.getCategories] Dùng mock categories:', error.message);
      const uniqueCats = Array.from(new Set(mockPCBooks.map((b) => b.category).filter(Boolean)));
      return uniqueCats.length > 0
        ? uniqueCats
        : ['CÔNG NGHỆ THÔNG TIN', 'KINH TẾ', 'LOGISTICS & VẬN TẢI', 'NGOẠI NGỮ'];
    }
  },

  /**
   * Lấy danh sách toàn bộ mã vị trí kệ sách (ShelfLocation)
   */
  async getShelves() {
    try {
      const response = await axiosClient.get('/books/shelves');
      return response?.data || response;
    } catch (error) {
      console.warn('[bookApi.getShelves] Dùng mock shelves:', error.message);
      return [
        { code: 'CS1_A1_01', description: 'Cơ sở 1 - Tầng 1 - Kệ A1 (CNTT & Phần mềm)' },
        { code: 'CS1_B2_03', description: 'Cơ sở 1 - Tầng 2 - Kệ B2 (Kinh tế & Quản trị)' },
        { code: 'CS2_C1_05', description: 'Cơ sở 2 - Tầng 1 - Kệ C1 (Kỹ thuật & Cơ khí)' },
        { code: 'CS3_D2_02', description: 'Cơ sở 3 - Tầng 2 - Kệ D2 (Logistics & Đa phương tiện)' },
      ];
    }
  },

  /**
   * Tìm kiếm nhanh tài liệu theo từ khóa
   */
  async search(keyword, extraParams = {}) {
    return this.getBooks({ ...extraParams, search: keyword });
  },
};

export default bookApi;
