import { describe, it, expect } from 'vitest';
import { normalizeBook, bookApi } from '../services/bookApi';

describe('bookApi & normalizeBook (TV3 Student Frontend)', () => {
  it('chuẩn hóa dữ liệu sách đầy đủ các trường mặc định khi thiếu thuộc tính', () => {
    const raw = {
      id: 99,
      title: 'Giáo trình Mạng máy tính',
      author: 'TS. Nguyễn Văn B',
    };

    const book = normalizeBook(raw);

    expect(book).toBeDefined();
    expect(book.id).toBe(99);
    expect(book.title).toBe('Giáo trình Mạng máy tính');
    expect(book.author).toBe('TS. Nguyễn Văn B');
    expect(book.category).toBe('TỔNG HỢP');
    expect(book.code).toBe('UTH-BK-99');
    expect(book.availableQuantity).toBe(1);
    expect(book.type).toBe('PRINT');
  });

  it('trả về null khi truyền đối tượng rỗng hoặc null vào normalizeBook', () => {
    expect(normalizeBook(null)).toBeNull();
    expect(normalizeBook(undefined)).toBeNull();
  });

  it('lấy danh sách sách từ mock data khi backend offline', async () => {
    const res = await bookApi.getBooks({ page: 0, size: 4 });

    expect(res).toBeDefined();
    expect(Array.isArray(res.content)).toBe(true);
    expect(res.content.length).toBeLessThanOrEqual(4);
    expect(res.totalElements).toBeGreaterThan(0);
  });
});
