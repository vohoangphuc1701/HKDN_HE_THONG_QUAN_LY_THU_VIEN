import { describe, it, expect } from 'vitest';
import {
  removeVietnameseAccents,
  levenshteinDistance,
  isTokenMatch,
  matchBookSmart,
  expandQueryWithAI,
} from '../services/aiSearchService';

describe('aiSearchService (Tìm kiếm Thông minh Bằng AI & Fuzzy Matching)', () => {
  const sampleBook = {
    id: 1,
    title: 'Lập trình Python từ cơ bản đến nâng cao',
    author: 'Nguyễn Văn A',
    code: 'CNTT-PY-001',
    category: 'CÔNG NGHỆ THÔNG TIN',
    description: 'Giáo trình toàn diện về ngôn ngữ lập trình Python và cấu trúc dữ liệu',
    availableQuantity: 4,
  };

  const sampleBookEconomics = {
    id: 2,
    title: 'Kinh tế học vi mô ứng dụng',
    author: 'Trần Thị B',
    code: 'KT-VM-002',
    category: 'KINH TẾ',
    description: 'Phân tích hành vi người tiêu dùng và thị trường cạnh tranh',
    availableQuantity: 3,
  };

  describe('1. Chuẩn hóa tiếng Việt không dấu (removeVietnameseAccents)', () => {
    it('loại bỏ chuẩn xác các ký tự có dấu', () => {
      expect(removeVietnameseAccents('Lập trình Python')).toBe('lap trinh python');
      expect(removeVietnameseAccents('Kinh tế vi mô')).toBe('kinh te vi mo');
      expect(removeVietnameseAccents('Đại học Giao thông Vận tải')).toBe('dai hoc giao thong van tai');
    });
  });

  describe('2. Khoảng cách Damerau-Levenshtein (levenshteinDistance)', () => {
    it('tính đúng khoảng cách chỉnh sửa giữa 2 từ', () => {
      expect(levenshteinDistance('python', 'python')).toBe(0);
      expect(levenshteinDistance('python', 'phyton')).toBe(2); // Xóa 'h' & chèn 'h' sau 't' = 2 thao tác
      expect(levenshteinDistance('logistics', 'logictis')).toBe(2);
    });
  });

  describe('3. Khớp mờ từ khóa (isTokenMatch)', () => {
    it('khớp khi từ khóa viết sai 1-2 ký tự (typo tolerance)', () => {
      expect(isTokenMatch('phyton', 'lap trinh python tu co ban')).toBe(true);
      expect(isTokenMatch('logictis', 'quan tri logistics va chuoi cung ung')).toBe(true);
      expect(isTokenMatch('vi mo', 'kinh te hoc vi mo')).toBe(true);
    });
  });

  describe('4. So khớp thông minh một cuốn sách (matchBookSmart)', () => {
    it('khớp chính xác khi người dùng gõ tiếng Việt không dấu', () => {
      const result = matchBookSmart(sampleBook, 'lap trinh python');
      expect(result.matched).toBe(true);
      expect(result.score).toBeGreaterThan(60);
    });

    it('khớp chính xác khi người dùng gõ sai chính tả (phyton)', () => {
      const result = matchBookSmart(sampleBook, 'phyton');
      expect(result.matched).toBe(true);
      expect(result.score).toBeGreaterThan(50);
    });

    it('khớp khi người dùng gõ cụm từ tự nhiên chứa từ khóa', () => {
      const result = matchBookSmart(sampleBook, 'sach hoc lap trinh python');
      expect(result.matched).toBe(true);
    });

    it('khớp đúng sách kinh tế khi gõ không dấu "kinh te vi mo"', () => {
      const result = matchBookSmart(sampleBookEconomics, 'kinh te vi mo');
      expect(result.matched).toBe(true);
    });

    it('trả về matched=false khi từ khóa hoàn toàn không liên quan', () => {
      const result = matchBookSmart(sampleBook, 'tau thuy hang hai');
      expect(result.matched).toBe(false);
    });
  });

  describe('5. Mở rộng câu truy vấn bằng AI (expandQueryWithAI)', () => {
    it('suy diễn ý định khi tìm "sách làm web"', async () => {
      const aiResult = await expandQueryWithAI('sach hoc lam web cho nguoi moi');
      expect(aiResult.success).toBe(true);
      expect(aiResult.category).toBe('CÔNG NGHỆ THÔNG TIN');
      expect(aiResult.keywords.some((k) => k.toLowerCase().includes('web') || k.toLowerCase().includes('html'))).toBe(true);
    });

    it('tự động nhận diện lỗi chính tả "phyton"', async () => {
      const aiResult = await expandQueryWithAI('phyton');
      expect(aiResult.success).toBe(true);
      expect(aiResult.correctedQuery.toLowerCase()).toContain('python');
    });
  });
});
