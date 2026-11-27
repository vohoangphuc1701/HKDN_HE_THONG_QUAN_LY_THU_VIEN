import mockBooks from '../mockPCBooks.json';
import campusesData from '../data/campusesData';
import { SYSTEM_PROMPT, findInstantAnswer } from '../data/chatbotKnowledge';

/**
 * Service kết nối Chatbot AI với Google Gemini API (Giai đoạn 2)
 * Model: gemini-3.5-flash-lite (tốc độ cao, tối ưu chi phí, hiểu tiếng Việt xuất sắc)
 */

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const getGeminiEndpoint = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Chuẩn bị ngữ cảnh tóm tắt kho sách và cơ sở để đưa vào System Instruction (RAG gọn nhẹ)
 */
function buildLibraryContext() {
  const booksSummary = mockBooks
    .slice(0, 25)
    .map(
      (b) =>
        `- [Mã: ${b.code}] "${b.title}" (Tác giả: ${b.author}, Ngành: ${b.category}, Còn: ${b.availableQuantity}/${b.quantity} cuốn, Vị trí: ${b.location})`
    )
    .join('\n');

  const campusesSummary = campusesData
    .map(
      (c) =>
        `- ${c.name} (${c.code}): ${c.address} | Giờ: ${c.hours} (${c.schedule}) | ĐT: ${c.phone} | ${c.desc}`
    )
    .join('\n');

  return `
DƯỚI ĐÂY LÀ DỮ LIỆU THỰC TẾ TRONG HỆ THỐNG THƯ VIỆN UTH:

1. DANH MỤC GIÁO TRÌNH TIÊU BIỂU ĐANG CÓ TRÊN KỆ:
${booksSummary}

2. DANH SÁCH 3 CƠ SỞ ĐÀO TẠO UTH:
${campusesSummary}

HƯỚNG DẪN BỔ SUNG:
- Khi sinh viên hỏi về một ngành học hoặc chủ đề chung (ví dụ: 'sách kinh tế', 'sách cntt', 'sách logistics'), hãy tra cứu danh mục sách UTH ở trên, liệt kê đầy đủ từng cuốn sách phù hợp (gồm: Tên sách, Tác giả, Mã sách, Vị trí kệ và Số lượng còn sẵn).
- Khi sinh viên hỏi về một cuốn sách cụ thể, nếu có trong danh sách trên, hãy trích dẫn đúng Tên, Tác giả, Vị trí kệ và số lượng còn sẵn.
- Luôn hoàn thành trọn vẹn câu trả lời, không dừng lửng giữa chừng.
- Nếu sinh viên hỏi về mượn sách, hãy nhắc đến quy tắc BR01 (tối đa 5 cuốn), BR02 (14 ngày), BR03 (gia hạn 1 lần +7 ngày tại /loans), BR04 (phạt trễ 5.000đ/ngày/cuốn).
- Hướng dẫn sinh viên dùng phím tắt Ctrl+K để tra cứu toàn bộ kho sách.
`.trim();
}

/**
 * Gửi tin nhắn đến Gemini API và nhận phản hồi từ AI
 * @param {Array<{role: 'user'|'model', text: string}>} conversationHistory - Lịch sử trò chuyện
 * @param {string} userMessage - Tin nhắn mới của sinh viên
 * @returns {Promise<{text: string, matchedBooks: Array, isFallback: boolean}>}
 */
export async function sendMessageToAI(conversationHistory = [], userMessage) {
  if (!userMessage || !userMessage.trim()) {
    throw new Error('Tin nhắn không được để trống.');
  }

  // 1. Chuẩn bị payload theo định dạng Gemini API
  const fullSystemInstruction = `${SYSTEM_PROMPT}\n\n${buildLibraryContext()}`;

  // Lọc lịch sử hội thoại: Bắt buộc lượt đầu tiên gửi lên Gemini phải là 'user'
  // (Loại bỏ tin nhắn chào mừng ban đầu của model để tránh lỗi cắt cụt câu trả lời)
  const validHistory = [];
  let foundFirstUser = false;
  for (const item of conversationHistory) {
    if (item.role === 'user') {
      foundFirstUser = true;
    }
    if (foundFirstUser && item.text && item.text.trim()) {
      validHistory.push(item);
    }
  }

  // Lấy tối đa 8 lượt gần nhất và đảm bảo luân phiên user/model
  const recentHistory = validHistory.slice(-8);
  const contents = [];
  let lastRole = null;

  for (const item of recentHistory) {
    const role = item.role === 'user' ? 'user' : 'model';
    if (role !== lastRole) {
      contents.push({
        role,
        parts: [{ text: item.text }],
      });
      lastRole = role;
    }
  }

  // Đính kèm tin nhắn mới nhất của user
  if (lastRole === 'user') {
    // Nếu tin trước đó cũng là user thì gộp lại hoặc thay thế
    contents[contents.length - 1] = {
      role: 'user',
      parts: [{ text: userMessage.trim() }],
    };
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: userMessage.trim() }],
    });
  }

  const payload = {
    system_instruction: {
      parts: [{ text: fullSystemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(getGeminiEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API call returned non-200:', response.status, errorData);
      throw new Error(errorData.error?.message || `Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('Mô hình không trả về nội dung.');
    }

    // Tìm các sách liên quan được nhắc tới trong câu trả lời
    const matchedBooks = extractRelatedBooks(replyText, userMessage);

    return {
      text: replyText,
      matchedBooks,
      isFallback: false,
    };
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API, chuyển sang chế độ dự phòng Offline:', error);

    // Cơ chế Fallback: Tìm câu trả lời tức thì từ FAQ Knowledge Base
    const fallbackAnswer =
      findInstantAnswer(userMessage) ||
      `Dạ chào bạn, hiện kết nối tới hệ thống AI đang tạm thời gián đoạn. Tuy nhiên bạn có thể:
- Nhấn tổ hợp phím **Ctrl + K** để tra cứu sách.
- Vào mục **Danh mục sách** (/books) để xem giáo trình còn sẵn.
- Xem quy định: Mượn tối đa 5 cuốn trong 14 ngày, phạt trễ 5.000đ/ngày/cuốn.
Bạn vui lòng thử nhắn lại sau ít phút nhé!`;

    const matchedBooks = extractRelatedBooks(fallbackAnswer, userMessage);

    return {
      text: fallbackAnswer,
      matchedBooks,
      isFallback: true,
      errorMessage: error.message,
    };
  }
}

/**
 * Bóc tách các sách phù hợp từ kho dữ liệu dựa trên câu trả lời hoặc câu hỏi
 * @param {string} text
 * @param {string} query
 * @returns {Array}
 */
function extractRelatedBooks(text = '', query = '') {
  const combined = `${text} ${query}`.toLowerCase();
  return mockBooks
    .filter((b) => {
      const titleLower = b.title.toLowerCase();
      const codeLower = b.code.toLowerCase();
      return combined.includes(titleLower) || combined.includes(codeLower);
    })
    .slice(0, 3);
}

export default {
  sendMessageToAI,
  GEMINI_API_KEY,
};
