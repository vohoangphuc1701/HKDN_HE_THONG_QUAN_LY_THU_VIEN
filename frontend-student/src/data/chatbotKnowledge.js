/**
 * Bộ Tri thức & Prompt chuẩn cho Trợ lý ảo AI - Thư viện UTH (Giai đoạn 1)
 */

export const BOT_NAME = 'Thủ thư số UTH';

export const SYSTEM_PROMPT = `
Bạn là "Thủ thư số UTH" – Trợ lý ảo AI chính thức của Thư viện Trường Đại học Giao thông Vận tải TP.HCM (UTH).
Nhiệm vụ của bạn là đồng hành, giải đáp thắc mắc, tư vấn giáo trình và hướng dẫn sinh viên sử dụng hệ thống mượn trả sách trực tuyến.

### TÍNH CÁCH & PHONG CÁCH GIAO TIẾP:
- Thân thiện, nhã nhặn, tôn trọng, xưng "mình" hoặc "Thủ thư số UTH" và gọi người dùng là "bạn" hoặc "sinh viên".
- Câu trả lời súc tích, mạch lạc, sử dụng bullet points và in đậm các thông tin quan trọng.
- Sử dụng emoji học thuật nhẹ nhàng (📚, 📍, ⏰, 💡, 🧭, ⚠️) để tạo cảm giác gần gũi.

### NGUYÊN TẮC AN TOÀN & CHỐNG ẢO GIÁC (GUARDRAILS):
1. CHỈ trả lời các vấn đề liên quan đến:
   - Thư viện UTH (sách, mượn trả, quy định, cơ sở, giờ mở cửa, tài khoản).
   - Định hướng tài liệu học thuật theo ngành đào tạo của UTH.
2. NẾU người dùng hỏi về các chủ đề ngoài lề (chính trị, giải trí, code không liên quan, bài tập về nhà...), hãy lịch sự từ chối:
   "Dạ, mình là Thủ thư số UTH nên chỉ có thể hỗ trợ các thông tin về sách, tài liệu học thuật và quy định mượn trả của Thư viện trường thôi ạ. Bạn cần tìm giáo trình hay kiểm tra thông tin mượn sách nào không?"
3. KHÔNG BỊA ĐẶT sách hoặc quy định không có thật. Nếu không tìm thấy sách, hãy thông báo rõ:
   "Hiện kho sách thư viện chưa có đầu sách này hoặc sách đã được mượn hết. Bạn có thể nhấn Ctrl+K để tra cứu thêm trên hệ thống nhé."
4. Khi nhắc đến tiền phạt hoặc hạn trả, LUÔN dẫn chứng đúng quy định BR01 - BR08.
`.trim();

/**
 * Các nút gợi ý câu hỏi nhanh (Quick Prompts)
 */
export const QUICK_SUGGESTIONS = [
  { id: 'rules', label: '📖 Quy định mượn sách' },
  { id: 'campus', label: '📍 Giờ mở cửa 3 cơ sở' },
  { id: 'renew', label: '🔄 Cách gia hạn online' },
  { id: 'fine', label: '⚠️ Phạt trễ hạn bao nhiêu?' },
  { id: 'pickngo', label: '⚡ Lấy sách Pick & Go' },
  { id: 'it_books', label: '💻 Sách Công nghệ thông tin' },
];

/**
 * Ngân hàng câu hỏi FAQ định sẵn (Rule-based instant match)
 */
export const FAQ_DATA = [
  {
    keywords: ['quy định', 'mượn bao nhiêu', 'mượn mấy cuốn', 'hạn mức', 'br01', 'br02'],
    answer: `📚 **Quy định mượn sách Thư viện UTH:**
- **Hạn mức mượn (BR01):** Tối đa **5 cuốn sách** cùng lúc.
- **Thời hạn mượn (BR02):** **14 ngày** kể từ ngày nhận sách tại quầy.
- **Gia hạn (BR03):** Được gia hạn trực tuyến **1 lần (+7 ngày)** nếu sách chưa quá hạn.
- **Lưu ý:** Sinh viên có khoản phạt chưa thanh toán (\`UNPAID\`) sẽ bị khóa quyền mượn sách mới.`,
  },
  {
    keywords: ['cơ sở', 'ở đâu', 'địa chỉ', 'mở cửa', 'giờ làm việc', 'đóng cửa', 'cs1', 'cs2', 'cs3'],
    answer: `🏢 **Thông tin 3 Cơ sở Thư viện UTH:**
- 📍 **Cơ sở 1 (Trụ sở chính):** Số 2 Võ Oanh, P.25, Q. Bình Thạnh
  ⏰ Mở cửa: **07:30 – 20:30** (Thứ 2 – Thứ 7) | 💺 180 chỗ
- 📍 **Cơ sở 2:** Số 10, Đường số 12, P. An Khánh, TP. Thủ Đức
  ⏰ Mở cửa: **07:30 – 17:00** (Thứ 2 – Thứ 7) | 💺 120 chỗ
- 📍 **Cơ sở 3:** Số 70 Tô Ký, P. Trung Mỹ Tây, Quận 12
  ⏰ Mở cửa: **07:30 – 17:00** (Thứ 2 – Thứ 7) | 💺 150 chỗ

💡 *Bạn có thể bấm vào hình ảnh cơ sở ở Trang chủ để mở trực tiếp Google Maps chỉ đường nhé!*`,
  },
  {
    keywords: ['gia hạn', 'thêm ngày', 'hết hạn', 'br03'],
    answer: `🔄 **Hướng dẫn gia hạn sách trực tuyến (BR03):**
1. Truy cập mục **"Phiếu mượn"** (trên thanh điều hướng hoặc đường dẫn \`/loans\`).
2. Tìm cuốn sách muốn gia hạn và bấm nút **"Gia hạn (+7d)"**.
3. Hệ thống sẽ cộng thêm **7 ngày** vào hạn trả của bạn.

⚠️ **Lưu ý:**
- Mỗi cuốn sách chỉ được gia hạn **tối đa 1 lần**.
- Chỉ gia hạn được khi sách **chưa quá hạn**. Nếu sách đã quá hạn (\`OVERDUE\`), bạn cần mang đến quầy để trả và thanh toán phạt.`,
  },
  {
    keywords: ['phạt', 'trễ hạn', 'quá hạn', 'bao nhiêu tiền', '5000', 'br04'],
    answer: `⚠️ **Quy định phạt quá hạn sách (BR04):**
- Mức phí phạt: **5.000 VNĐ / ngày / mỗi cuốn sách**.
- **Công thức:** \`Tiền phạt = Số ngày trễ × 5.000 VNĐ\`.
  *(Ví dụ: Trễ 3 ngày cho 2 cuốn sách = 3 × 2 × 5.000 = 30.000 VNĐ)*.
- Bạn có thể đối soát lịch sử phạt tại mục **"Lịch sử"** (\`/history\`) và thanh toán qua chuyển khoản VietQR hoặc tại quầy tiếp nhận.`,
  },
  {
    keywords: ['pick & go', 'pick and go', 'lấy sách', 'nhận sách', 'qr', '30 giây', 'br05'],
    answer: `⚡ **Quy trình nhận sách siêu tốc Pick & Go (< 30 giây):**
1. Duyệt kho sách và thêm tối đa 5 cuốn vào **"Giỏ mượn"**.
2. Vào mục **"Hẹn lịch"** (\`/checkout\`), chọn Cơ sở và Khung giờ bạn sẽ đến lấy sách.
3. Bấm xác nhận để nhận **Mã QR Đơn mượn** (\`OD-UTH-...\`).
4. Thủ thư sẽ gom sẵn sách ra kệ chờ. Khi đến giờ hẹn, bạn chỉ cần mở điện thoại quét mã QR tại quầy tiếp nhận và nhận sách ngay!

⏰ **Lưu ý (BR05):** Đơn mượn sẵn sàng sẽ được giữ tại quầy tối đa **48 giờ** trước khi tự động hủy.`,
  },
  {
    keywords: ['tìm kiếm', 'phím tắt', 'ctrl k', 'cách tìm'],
    answer: `🔍 **Mẹo tra cứu sách nhanh:**
- Nhấn tổ hợp phím **\`Ctrl + K\`** (hoặc \`Cmd + K\` trên Mac) ở bất kỳ đâu để nhảy nhanh vào ô tìm kiếm sách.
- Vào mục **"Danh mục sách"** (\`/books\`) để sử dụng thanh lọc dính bên trái: lọc theo chuyên ngành, cơ sở lưu kho, hoặc chỉ hiện sách còn sẵn.`,
  },
  {
    keywords: ['công nghệ thông tin', 'cntt', 'lập trình', 'python', 'java', 'web'],
    answer: `💻 **Giáo trình Công nghệ thông tin nổi bật tại Thư viện UTH:**
- 📘 **Lập trình Python cơ bản** – Tác giả: Nguyễn Văn Hiệp (Khu CNTT · Kệ A2 - Còn 12 cuốn).
- 📗 **Cấu trúc dữ liệu và giải thuật** – Nền tảng cốt lõi cho kỹ sư phần mềm.
- 📙 **Lập trình Hướng đối tượng Java / Spring Boot**.

💡 Bạn có thể bấm **\`Ctrl + K\`** hoặc vào mục **Danh mục sách** chọn ngành **CÔNG NGHỆ THÔNG TIN** để xem chi tiết và thêm vào giỏ mượn nhé!`,
  },
];

/**
 * Hàm tìm kiếm câu trả lời nhanh từ tri thức có sẵn
 * @param {string} query
 * @returns {string|null}
 */
export function findInstantAnswer(query) {
  if (!query || typeof query !== 'string') return null;
  const normalized = query.toLowerCase().trim();

  for (const item of FAQ_DATA) {
    const isMatched = item.keywords.some((kw) => normalized.includes(kw));
    if (isMatched) {
      return item.answer;
    }
  }

  return null;
}
