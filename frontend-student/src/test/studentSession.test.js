import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_STUDENT_PROFILE,
  getInitials,
  getStoredStudentProfile,
  saveAuthSession,
  clearAuthSession,
  loadCartItems,
  saveCartItems,
  mapLoanFromApi,
  mapOrderHistoryFromApi,
} from '../utils/studentSession';

describe('studentSession helpers (TV2 & TV3 Sync)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('trả về profile mặc định thống nhất khi chưa đăng nhập', () => {
    const profile = getStoredStudentProfile();
    expect(profile.fullName).toBe(DEFAULT_STUDENT_PROFILE.fullName);
    expect(profile.studentId).toBe(DEFAULT_STUDENT_PROFILE.studentId);
    expect(profile.initials).toBe('VA');
  });

  it('lưu và đọc đúng phiên đăng nhập từ localStorage', () => {
    saveAuthSession('jwt-abc', {
      username: '2251050099',
      fullName: 'Trần Minh Quân',
      email: 'quantm@ut.edu.vn',
    });

    expect(localStorage.getItem('token')).toBe('jwt-abc');
    const profile = getStoredStudentProfile();
    expect(profile.fullName).toBe('Trần Minh Quân');
    expect(profile.studentId).toBe('2251050099');
    expect(getInitials('Trần Minh Quân')).toBe('MQ');

    clearAuthSession();
    expect(localStorage.getItem('token')).toBeNull();
    expect(getStoredStudentProfile().studentId).toBe(DEFAULT_STUDENT_PROFILE.studentId);
  });

  it('đồng bộ giỏ mượn giữa key chung và key legacy tv3', () => {
    const sampleCart = [{ id: 1, title: 'Lập trình Python' }];
    saveCartItems(sampleCart);

    expect(loadCartItems([])).toEqual(sampleCart);
    expect(JSON.parse(localStorage.getItem('uth_library_cart_tv3'))).toEqual(sampleCart);
  });

  it('chuẩn hóa dữ liệu sách đang mượn từ Backend BorrowService', () => {
    const futureDue = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const mapped = mapLoanFromApi({
      borrowDetailId: 201,
      orderCode: 'OD-20261127-1001',
      bookId: 1,
      title: 'Lập trình Python',
      author: 'Nguyễn Văn Hiệp',
      borrowDate: '2026-11-20',
      dueDate: futureDue,
      renewalCount: 1,
      canRenew: true,
      status: 'BORROWING',
    });

    expect(mapped.id).toBe(201);
    expect(mapped.orderCode).toBe('OD-20261127-1001');
    expect(mapped.renewCount).toBe(1);
    expect(mapped.status).toBe('NORMAL');
    expect(mapped.canRenew).toBe(true);
  });

  it('chuẩn hóa đơn hàng lịch sử từ Backend getMyOrders', () => {
    const mapped = mapOrderHistoryFromApi({
      id: 88,
      orderCode: 'OD-20261101-0088',
      status: 'RETURNED',
      pickupDate: '2026-11-01',
      updatedAt: '2026-11-10T10:00:00',
      borrowDetails: [
        {
          dueDate: '2026-11-15',
          actualReturnDate: '2026-11-10T10:00:00',
          status: 'RETURNED',
          book: {
            title: 'Kinh tế học vi mô',
            documentCode: 'KT-VM-002',
            author: 'N. Gregory Mankiw',
            category: 'KINH TẾ',
          },
        },
      ],
    });

    expect(mapped.orderCode).toBe('OD-20261101-0088');
    expect(mapped.status).toBe('ON_TIME');
    expect(mapped.title).toBe('Kinh tế học vi mô');
    expect(mapped.code).toBe('KT-VM-002');
  });
});
