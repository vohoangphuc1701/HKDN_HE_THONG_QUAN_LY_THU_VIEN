/**
 * Tiện ích quản lý phiên sinh viên, giỏ mượn đồng bộ giữa Mobile (TV2) & Desktop (TV3),
 * và chuyển đổi (mapper) dữ liệu từ Backend Spring Boot (TV4) sang giao diện UI.
 */

export const CART_STORAGE_KEY = 'uth_library_cart';
const LEGACY_CART_KEY = 'uth_library_cart_tv3';

export const DEFAULT_STUDENT_PROFILE = {
  id: 1,
  username: '2151053001',
  studentId: '2151053001',
  fullName: 'Nguyễn Văn A',
  name: 'Nguyễn Văn A',
  initials: 'VA',
  email: '2151053001@ut.edu.vn',
  major: 'Công nghệ thông tin · UTH',
  cardStatus: 'Thẻ hoạt động',
  role: 'STUDENT',
};

const COVER_PALETTE = ['#0f4c81', '#065f46', '#991b1b', '#0e7490', '#4c1d95', '#0f766e'];

/**
 * Lấy chữ cái viết tắt từ họ tên sinh viên (vd: "Nguyễn Văn A" -> "VA")
 */
export function getInitials(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return DEFAULT_STUDENT_PROFILE.initials;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Đọc thông tin sinh viên đang đăng nhập từ localStorage (fallback về mẫu thống nhất)
 */
export function getStoredStudentProfile() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.fullName || parsed.name || parsed.username)) {
        const fullName = parsed.fullName || parsed.name || parsed.username;
        const studentId = parsed.studentId || parsed.username || DEFAULT_STUDENT_PROFILE.studentId;
        return {
          ...DEFAULT_STUDENT_PROFILE,
          ...parsed,
          studentId,
          fullName,
          name: fullName,
          initials: getInitials(fullName),
          email: parsed.email || `${studentId}@ut.edu.vn`,
        };
      }
    }
  } catch (err) {
    console.warn('[studentSession] Không thể đọc thông tin user từ localStorage:', err);
  }
  return DEFAULT_STUDENT_PROFILE;
}

/**
 * Lưu phiên đăng nhập (JWT token & thông tin user)
 */
export function saveAuthSession(token, user) {
  try {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
    }
    if (user) {
      const normalized = {
        ...user,
        studentId: user.studentId || user.username,
        name: user.fullName || user.name || user.username,
      };
      localStorage.setItem('user', JSON.stringify(normalized));
    }
  } catch (err) {
    console.warn('[studentSession] Không thể lưu phiên đăng nhập:', err);
  }
}

/**
 * Xóa phiên đăng nhập khi đăng xuất
 */
export function clearAuthSession() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  } catch (err) {
    console.warn('[studentSession] Không thể xóa phiên đăng nhập:', err);
  }
}

/**
 * Đọc giỏ mượn từ localStorage (tương thích cả key cũ uth_library_cart_tv3)
 */
export function loadCartItems(fallbackItems = []) {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[studentSession] Lỗi đọc giỏ mượn từ localStorage:', err);
  }
  return fallbackItems;
}

/**
 * Lưu giỏ mượn vào localStorage dùng chung giữa Mobile & Desktop
 */
export function saveCartItems(items) {
  try {
    const serialized = JSON.stringify(Array.isArray(items) ? items : []);
    localStorage.setItem(CART_STORAGE_KEY, serialized);
    localStorage.setItem(LEGACY_CART_KEY, serialized);
  } catch (err) {
    console.warn('[studentSession] Lỗi ghi giỏ mượn vào localStorage:', err);
  }
}

function formatIsoDateVi(dateStr) {
  if (!dateStr) return '—';
  const str = String(dateStr).slice(0, 10);
  const parts = str.split('-');
  if (parts.length !== 3) return String(dateStr);
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Chuẩn hóa bản ghi sách đang mượn từ API /api/borrows/my-loans sang định dạng UI TV2 & TV3
 */
export function mapLoanFromApi(raw) {
  if (!raw) return null;
  if (raw.copyBarcode && raw.daysLeft !== undefined && raw.borrowDate?.includes('/')) {
    return raw; // Đã ở định dạng UI mẫu
  }

  const id = raw.borrowDetailId ?? raw.id;
  const dueIso = raw.dueDate ? String(raw.dueDate).slice(0, 10) : null;
  const borrowIso = raw.borrowDate ? String(raw.borrowDate).slice(0, 10) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueObj = dueIso ? new Date(dueIso) : new Date(Date.now() + 14 * 86400000);
  dueObj.setHours(0, 0, 0, 0);

  const daysLeft = Math.round((dueObj.getTime() - today.getTime()) / 86400000);
  const renewCount = raw.renewalCount ?? raw.renewCount ?? 0;

  let status = 'NORMAL';
  if (raw.status === 'OVERDUE' || daysLeft < 0) {
    status = 'OVERDUE';
  } else if (daysLeft <= 3) {
    status = 'WARNING';
  }

  const overdueDays = daysLeft < 0 ? Math.abs(daysLeft) : 0;
  const totalDurationDays = 14 + renewCount * 7;
  const elapsedDays = Math.max(0, totalDurationDays - Math.max(0, daysLeft));
  const code = raw.documentCode || raw.code || `UTH-BK-${raw.bookId || id}`;

  return {
    id,
    borrowDetailId: id,
    bookId: raw.bookId || id,
    orderCode: raw.orderCode || `OD-UTH-${id}`,
    title: raw.title || 'Tài liệu thư viện UTH',
    code,
    author: raw.author || 'Giảng viên UTH',
    category: raw.category || 'GIÁO TRÌNH UTH',
    publisher: raw.publisher || 'NXB Giao thông Vận tải',
    publishYear: raw.publishYear || 2024,
    borrowDate: formatIsoDateVi(borrowIso),
    dueDate: formatIsoDateVi(dueIso),
    dueTimestamp: dueObj.getTime(),
    totalDurationDays,
    elapsedDays,
    renewCount,
    daysLeft,
    status,
    fineAmount: raw.fineAmount ?? overdueDays * 5000,
    campus: raw.campus || 'Cơ sở 1 (Số 2 Võ Oanh, P.25, Bình Thạnh)',
    shelfLocation: raw.shelfLocation || 'Khu Giáo trình · Cơ sở 1',
    callNumber: raw.callNumber || `UTH ${code}`,
    coverBg: raw.coverBg || COVER_PALETTE[Number(id || 0) % COVER_PALETTE.length],
    copyBarcode: raw.copyBarcode || `UTH-BC-${id}`,
    librarian: raw.librarian || 'Thủ thư trực quầy UTH',
    canRenew: raw.canRenew ?? (status !== 'OVERDUE' && renewCount < 2),
  };
}

/**
 * Chuẩn hóa bản ghi đơn hàng từ API /api/borrows/my-orders sang định dạng lịch sử UI TV2 & TV3
 */
export function mapOrderHistoryFromApi(order) {
  if (!order) return null;
  if (order.actualReturnDate && order.title && order.orderCode) {
    return order; // Đã ở định dạng UI mẫu
  }

  const details = Array.isArray(order.borrowDetails) ? order.borrowDetails : [];
  const firstDetail = details[0] || {};
  const book = firstDetail.book || {};

  const statusMap = {
    CANCELLED: 'CANCELLED',
    RETURNED: firstDetail.status === 'OVERDUE' ? 'LATE' : 'ON_TIME',
  };
  const uiStatus = statusMap[order.status] || 'ON_TIME';

  return {
    id: `ORD-${order.id}`,
    orderCode: order.orderCode || `OD-${order.id}`,
    receiptCode: uiStatus === 'CANCELLED' ? '—' : `BL-UTH-${order.id}`,
    title:
      details.length > 1
        ? `${book.title || 'Giáo trình UTH'} (+${details.length - 1} cuốn)`
        : book.title || order.title || 'Đơn mượn tài liệu UTH',
    code: book.documentCode || book.code || `UTH-${order.id}`,
    author: book.author || 'Thư viện UTH',
    category: book.category || 'GIÁO TRÌNH UTH',
    semester: 'HK1 (2026 - 2027)',
    borrowDate: formatIsoDateVi(order.actualPickupDate || order.pickupDate || order.createdAt),
    dueDate: uiStatus === 'CANCELLED' ? '—' : formatIsoDateVi(firstDetail.dueDate),
    actualReturnDate:
      uiStatus === 'CANCELLED' ? '—' : formatIsoDateVi(firstDetail.actualReturnDate || order.updatedAt),
    campusCode: 'CS1',
    campus: 'Cơ sở 1 - Võ Oanh (Bình Thạnh)',
    deskCounter: 'Quầy Pick & Go · Tầng trệt Tòa H1',
    librarian: 'Thủ thư trực quầy UTH',
    overdueDays: 0,
    fineAmount: 0,
    finePaid: true,
    status: uiStatus,
    bookCondition: 'Đã đối soát tại quầy',
    note: order.note || 'Giao dịch được đồng bộ từ hệ thống thư viện UTH.',
  };
}
