/**
 * Service Tìm kiếm Thông minh Bằng AI & Fuzzy Matching (Phương án 1)
 * Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH)
 * 
 * Khả năng:
 * 1. Chống lỗi gõ tiếng Việt không dấu (Accent-insensitive)
 * 2. Khoan dung lỗi chính tả / gõ nhầm phím (Typo-tolerant Fuzzy Matching qua Damerau-Levenshtein)
 * 3. Tìm kiếm theo ngôn ngữ tự nhiên / Ý định (AI Semantic Query Expansion qua Gemini API)
 */

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Tập từ dừng phổ biến trong ngữ cảnh tìm kiếm sách thư viện
export const VIETNAMESE_STOP_WORDS = new Set([
  'sach', 'giao', 'trinh', 'tai', 'lieu', 've', 'hoc', 'cho', 'cua', 'nhung', 'cac', 'va', 'tap', 'mon', 'nguoi', 'moi', 'can', 'tim'
]);

/**
 * Loại bỏ dấu tiếng Việt chuẩn Unicode (NFD)
 * Ví dụ: "Lập trình Python" -> "lap trinh python"
 */
export function removeVietnameseAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Tính khoảng cách Damerau-Levenshtein (xử lý cả phép hoán vị 2 ký tự liền kề như 'phyton' <-> 'python')
 */
export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Xóa
        dp[i][j - 1] + 1,      // Chèn
        dp[i - 1][j - 1] + cost // Thay thế
      );

      // Hoán vị 2 ký tự liền kề (Transposition: 'hy' <-> 'yh')
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
      }
    }
  }

  return dp[m][n];
}

/**
 * Kiểm tra xem một từ khóa tìm kiếm (queryToken) có khớp mờ với bất kỳ từ nào trong mục tiêu (targetText)
 * @param {string} queryToken - Từ khóa truy vấn (đã bỏ dấu, lowercase)
 * @param {string} targetText - Văn bản đối chiếu (đã bỏ dấu, lowercase)
 * @returns {boolean}
 */
export function isTokenMatch(queryToken, targetText) {
  if (!queryToken || !targetText) return false;
  
  // 1. Khớp chuỗi con chính xác
  if (targetText.includes(queryToken)) return true;

  // 2. Tách từ trong văn bản để kiểm tra khoảng cách Damerau-Levenshtein (khoan dung sai chính tả)
  const targetWords = targetText.split(/\s+/).filter(Boolean);
  
  for (const word of targetWords) {
    if (word === queryToken) return true;
    if (word.startsWith(queryToken) && queryToken.length >= 3) return true;

    const len = Math.max(queryToken.length, word.length);
    const dist = levenshteinDistance(queryToken, word);

    // Cho phép sai 1 ký tự với từ ngắn 3-4 ký tự
    if (len <= 4 && dist <= 1) {
      return true;
    }
    // Cho phép sai tối đa 2 ký tự với từ >= 5 ký tự (ví dụ: "phyton" vs "python", "logictis" vs "logistics")
    if (len >= 5 && dist <= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Thuật toán so khớp thông minh một cuốn sách với truy vấn tìm kiếm
 * @param {Object} book - Đối tượng sách
 * @param {string} query - Chuỗi tìm kiếm của người dùng
 * @returns {{matched: boolean, score: number}}
 */
export function matchBookSmart(book, query) {
  if (!query || !query.trim()) return { matched: true, score: 100 };

  const rawQuery = query.trim().toLowerCase();
  const cleanQuery = removeVietnameseAccents(rawQuery);
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  const rawTitle = (book.title || '').toLowerCase();
  const cleanTitle = removeVietnameseAccents(book.title || '');
  const cleanAuthor = removeVietnameseAccents(book.author || '');
  const cleanCode = removeVietnameseAccents(book.code || '');
  const cleanPublisher = removeVietnameseAccents(book.publisher || '');
  const cleanCategory = removeVietnameseAccents(book.category || '');
  const cleanDesc = removeVietnameseAccents(book.description || '');

  // Cụm văn bản tổng hợp của cuốn sách
  const combinedTarget = `${cleanTitle} ${cleanAuthor} ${cleanCode} ${cleanPublisher} ${cleanCategory} ${cleanDesc}`;

  // Tầng 1: Khớp chính xác cả cụm từ có dấu hoặc không dấu trong Tiêu đề / Mã sách (Điểm cao nhất)
  if (rawTitle.includes(rawQuery) || cleanTitle.includes(cleanQuery)) {
    return { matched: true, score: 95 };
  }
  if (cleanCode.includes(cleanQuery)) {
    return { matched: true, score: 90 };
  }
  if (combinedTarget.includes(cleanQuery)) {
    return { matched: true, score: 85 };
  }

  // Tầng 2: So khớp theo từ khóa mang nghĩa (Lọc bỏ từ dừng như "sách", "giáo trình", "học", "cho")
  const significantTokens = queryTokens.filter((t) => !VIETNAMESE_STOP_WORDS.has(t));
  const tokensToCheck = significantTokens.length > 0 ? significantTokens : queryTokens;

  let matchedTokens = 0;
  for (const token of tokensToCheck) {
    if (isTokenMatch(token, combinedTarget)) {
      matchedTokens++;
    }
  }

  // Khớp 100% các từ khóa mang nghĩa
  if (matchedTokens === tokensToCheck.length) {
    return { matched: true, score: 80 };
  }

  // Khớp >= 60% các từ khóa mang nghĩa nếu câu truy vấn tự nhiên dài
  if (tokensToCheck.length >= 3 && matchedTokens >= Math.ceil(tokensToCheck.length * 0.6)) {
    return { matched: true, score: 65 };
  }

  // Tầng 3: Nếu chỉ gõ 1 từ sai chính tả (ví dụ "phyton")
  if (queryTokens.length === 1 && isTokenMatch(queryTokens[0], combinedTarget)) {
    return { matched: true, score: 70 };
  }

  return { matched: false, score: 0 };
}

/**
 * Bộ từ điển suy diễn ý định cục bộ (Fallback Offline Intent Rules)
 */
const INTENT_RULES = [
  {
    pattern: /(web|frontend|html|css|javascript|react|lam web)/i,
    correctedQuery: 'Lập trình Web & Frontend',
    keywords: ['Web', 'HTML', 'CSS', 'JavaScript', 'Python'],
    category: 'CÔNG NGHỆ THÔNG TIN',
    explanation: 'Tìm kiếm các giáo trình Lập trình Web, Frontend và Công nghệ thông tin',
  },
  {
    pattern: /(python|phyton|pyton|lap trinh co ban|code)/i,
    correctedQuery: 'Lập trình Python',
    keywords: ['Python', 'Lập trình'],
    category: 'CÔNG NGHỆ THÔNG TIN',
    explanation: 'Đã tự động sửa lỗi chính tả thành: Lập trình Python',
  },
  {
    pattern: /(tau|cang|hang hai|hang quan|duong thuy|container)/i,
    correctedQuery: 'Hàng hải & Khai thác Cảng biển',
    keywords: ['Cảng', 'Hàng hải', 'Vận tải', 'Tàu'],
    category: 'LOGISTICS & VẬN TẢI',
    explanation: 'Tìm kiếm giáo trình Quản trị Cảng biển, Vận tải biển và Logistics UTH',
  },
  {
    pattern: /(logistics|logictis|kho bai|chuoi cung ung|supply chain)/i,
    correctedQuery: 'Logistics & Chuỗi cung ứng',
    keywords: ['Logistics', 'Chuỗi cung ứng', 'Vận tải'],
    category: 'LOGISTICS & VẬN TẢI',
    explanation: 'Tìm kiếm giáo trình Logistics và Quản trị chuỗi cung ứng',
  },
  {
    pattern: /(kinh te|vi mo|vi mo|marketing|quan tri|tai chinh)/i,
    correctedQuery: 'Kinh tế & Quản trị kinh doanh',
    keywords: ['Kinh tế', 'Kinh tế vi mô', 'Marketing', 'Quản trị'],
    category: 'KINH TẾ',
    explanation: 'Tìm kiếm sách chuyên ngành Kinh tế, Quản trị và Marketing',
  },
  {
    pattern: /(tieng anh|toeic|ielts|ngoai ngu|english)/i,
    correctedQuery: 'Ngoại ngữ chuyên ngành',
    keywords: ['Tiếng Anh', 'Ngoại ngữ', 'Giao tiếp'],
    category: 'NGOẠI NGỮ',
    explanation: 'Tìm kiếm tài liệu Ngoại ngữ và Tiếng Anh chuyên ngành',
  },
];

/**
 * Mở rộng câu truy vấn bằng AI (Gemini 2.0 Flash hoặc Offline Rules)
 * Phân tích câu hỏi tự nhiên hoặc sửa lỗi chính tả nặng
 * 
 * @param {string} userQuery - Câu truy vấn của sinh viên
 * @returns {Promise<{
 *   success: boolean,
 *   originalQuery: string,
 *   correctedQuery: string,
 *   keywords: string[],
 *   category: string,
 *   explanation: string,
 *   isAiGenerated: boolean
 * }>}
 */
// Bộ nhớ đệm In-Memory Cache (LRU tối đa 100 truy vấn) giúp phản hồi tức thì 0ms
// và tiết kiệm hạn mức gọi Google Gemini API
const aiSearchCache = new Map();
const MAX_CACHE_SIZE = 100;

function getCachedResult(key) {
  if (aiSearchCache.has(key)) {
    const val = aiSearchCache.get(key);
    aiSearchCache.delete(key);
    aiSearchCache.set(key, val);
    return val;
  }
  return null;
}

function setCachedResult(key, val) {
  if (aiSearchCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = aiSearchCache.keys().next().value;
    aiSearchCache.delete(oldestKey);
  }
  aiSearchCache.set(key, val);
}

export async function expandQueryWithAI(userQuery) {
  const query = userQuery?.trim();
  if (!query) {
    return {
      success: false,
      originalQuery: '',
      correctedQuery: '',
      keywords: [],
      category: 'ALL',
      explanation: '',
      isAiGenerated: false,
    };
  }

  // 0. Kiểm tra bộ nhớ đệm Cache
  const cacheKey = query.toLowerCase();
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Thử gọi Google Gemini API nếu có API key
  if (GEMINI_API_KEY && query.length >= 3) {
    try {
      const prompt = `
Bạn là AI chuyên gia Phân tích Ý định Tìm kiếm (Search Intent & Typo Correction) của Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH).
Sinh viên đang tìm kiếm với truy vấn: "${query}".

Hãy phân tích và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json):
{
  "correctedQuery": "Từ khóa chuẩn sau khi sửa lỗi chính tả / viết hoa / có dấu (nếu người dùng gõ sai)",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"],
  "category": "CÔNG NGHỆ THÔNG TIN" | "KINH TẾ" | "LOGISTICS & VẬN TẢI" | "NGOẠI NGỮ" | "ALL",
  "explanation": "Câu giải thích ngắn gọn 1 câu về ý định tìm kiếm của sinh viên"
}
`.trim();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 250,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Làm sạch JSON
        const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        const aiResult = {
          success: true,
          originalQuery: query,
          correctedQuery: parsed.correctedQuery || query,
          keywords: Array.isArray(parsed.keywords) && parsed.keywords.length > 0 ? parsed.keywords : [parsed.correctedQuery || query],
          category: parsed.category || 'ALL',
          explanation: parsed.explanation || `AI đã tối ưu tìm kiếm cho: "${parsed.correctedQuery || query}"`,
          isAiGenerated: true,
        };

        setCachedResult(cacheKey, aiResult);
        return aiResult;
      }
    } catch (err) {
      console.warn('[aiSearchService.expandQueryWithAI] Fallback về bộ quy tắc nội bộ:', err.message);
    }
  }

  // 2. Fallback: Dùng bộ quy tắc nội bộ (Rule-based Intent)
  for (const rule of INTENT_RULES) {
    if (rule.pattern.test(query)) {
      const fallbackResult = {
        success: true,
        originalQuery: query,
        correctedQuery: rule.correctedQuery,
        keywords: rule.keywords,
        category: rule.category,
        explanation: rule.explanation,
        isAiGenerated: false,
      };
      setCachedResult(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // Mặc định nếu không trùng quy tắc nào đặc biệt
  const defaultResult = {
    success: false,
    originalQuery: query,
    correctedQuery: query,
    keywords: [query],
    category: 'ALL',
    explanation: `Tìm kiếm theo từ khóa "${query}"`,
    isAiGenerated: false,
  };
  setCachedResult(cacheKey, defaultResult);
  return defaultResult;
}

export default {
  removeVietnameseAccents,
  levenshteinDistance,
  isTokenMatch,
  matchBookSmart,
  expandQueryWithAI,
};
