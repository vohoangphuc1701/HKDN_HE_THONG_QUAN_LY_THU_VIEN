import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ArrowRight,
  GripHorizontal,
} from 'lucide-react';
import { sendMessageToAI } from '../../services/aiChatService';
import { QUICK_SUGGESTIONS, BOT_NAME } from '../../data/chatbotKnowledge';

const BUTTON_SIZE = 58; // Đường kính nút tròn (px)
const PADDING = 20; // Khoảng cách an toàn so với mép màn hình

export default function ChatBotWidget({ onNavigateToBook, onNavigateToTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: `Dạ chào bạn! 👋 Mình là **${BOT_NAME}**.\n\nMình có thể hỗ trợ bạn tìm kiếm giáo trình, giải đáp quy định mượn trả (BR01-BR08), giờ mở cửa 3 cơ sở đào tạo, hoặc quy trình nhận sách Pick & Go trong 30 giây.\n\nBạn đang cần hỗ trợ điều gì hôm nay?`,
      timestamp: new Date(),
    },
  ]);

  // Vị trí kéo thả (tọa độ left, top tuyệt đối trên viewport)
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);

  // Khởi tạo vị trí mặc định ở góc dưới bên trái màn hình
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initX = PADDING + 12;
      const initY = Math.max(PADDING, window.innerHeight - BUTTON_SIZE - PADDING - 12);
      setPosition({ x: initX, y: initY });

      const handleResize = () => {
        setPosition((prev) => {
          if (!prev) return { x: initX, y: initY };
          const screenMidX = window.innerWidth / 2;
          const snapToLeft = prev.x + BUTTON_SIZE / 2 < screenMidX;
          const snapX = snapToLeft ? PADDING : window.innerWidth - BUTTON_SIZE - PADDING;
          const maxY = window.innerHeight - BUTTON_SIZE - PADDING;
          return {
            x: snapX,
            y: Math.min(Math.max(PADDING, prev.y), Math.max(PADDING, maxY)),
          };
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  // ==================== LOGIC KÉO THẢ (DRAG & DROP) ====================
  const handleDragStart = (clientX, clientY) => {
    if (!position) return;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleDragMove = useCallback(
    (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
        dragRef.current.hasMoved = true;
      }

      if (dragRef.current.hasMoved) {
        const maxX = window.innerWidth - BUTTON_SIZE - PADDING;
        const maxY = window.innerHeight - BUTTON_SIZE - PADDING;

        const nextX = Math.min(Math.max(PADDING, dragRef.current.initialX + dx), maxX);
        const nextY = Math.min(Math.max(PADDING, dragRef.current.initialY + dy), maxY);

        setPosition({ x: nextX, y: nextY });
      }
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    // Khi người dùng thả chuột/tay: Tự động đẩy sát vào mép trái hoặc phải (Snap to Edge)
    if (dragRef.current.hasMoved) {
      setPosition((prev) => {
        if (!prev) return prev;
        const screenMidX = window.innerWidth / 2;
        const snapToLeft = prev.x + BUTTON_SIZE / 2 < screenMidX;
        const snapX = snapToLeft ? PADDING : window.innerWidth - BUTTON_SIZE - PADDING;

        return {
          x: snapX,
          y: prev.y,
        };
      });
    }
  }, []);

  // Lắng nghe sự kiện chuột toàn cục khi đang kéo
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Xử lý click nút (chỉ mở chat nếu không phải là thao tác kéo)
  const handleButtonClick = () => {
    if (!dragRef.current.hasMoved) {
      setIsOpen((prev) => !prev);
    }
  };

  // ==================== XỬ LÝ CHAT ====================
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await sendMessageToAI(conversationHistory, text);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: response.text,
        matchedBooks: response.matchedBooks,
        isFallback: response.isFallback,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: 'Xin lỗi bạn, có sự cố tạm thời khi xử lý tin nhắn. Bạn thử lại giúp mình nhé! 🙏',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Dạ chào bạn! 👋 Mình là **${BOT_NAME}**.\n\nMình có thể hỗ trợ bạn tìm kiếm giáo trình, giải đáp quy chế mượn trả hoặc tra cứu thông tin 3 cơ sở UTH. Bạn cần hỗ trợ gì ạ?`,
        timestamp: new Date(),
      },
    ]);
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const displayLine = isBullet ? trimmed.slice(2) : line;

      const parts = displayLine.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <span
          key={idx}
          className={`block leading-relaxed ${
            isBullet
              ? 'pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-[#00666B] before:font-bold'
              : ''
          } ${trimmed === '' ? 'h-2' : 'min-h-[1.25rem]'}`}
        >
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-teal-950">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code
                  key={pIdx}
                  className="bg-teal-100/70 text-[#00666B] px-1 py-0.5 rounded text-[11px] font-mono font-semibold"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  // Tính toán bên trái hay bên phải dựa trên vị trí nút
  const isRightSide = position ? position.x > window.innerWidth / 2 : false;

  return (
    <>
      {/* ================= NÚT CHATBOT HÌNH TRÒN KÉO THẢ (KHI ĐÓNG) ================= */}
      {!isOpen && (
        <div
          ref={widgetRef}
          className={`fixed z-50 print:hidden font-sans select-none ${
            !isDragging ? 'transition-[left] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]' : ''
          }`}
          style={{
            left: position ? `${position.x}px` : '20px',
            top: position ? `${position.y}px` : 'auto',
            bottom: position ? 'auto' : '32px',
            touchAction: 'none',
          }}
        >
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              handleDragStart(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              if (e.touches && e.touches[0]) {
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onClick={handleButtonClick}
            className={`group relative w-[58px] h-[58px] rounded-full bg-gradient-to-br from-[#00666B] via-[#007b82] to-[#004e52] text-white shadow-xl hover:shadow-2xl hover:shadow-[#00666B]/30 flex items-center justify-center border-2 border-white/50 transition-transform ${
              isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-108 active:scale-95'
            }`}
            title="Kéo thả để di chuyển · Click để trò chuyện với Thủ thư số UTH"
            role="button"
            tabIndex={0}
          >
            {/* Hiệu ứng tỏa ra nhỏ và tinh tế (subtle pulse ripple) */}
            <span className="absolute -inset-1 rounded-full bg-teal-400/25 animate-pulse pointer-events-none" />
            <span className="absolute -inset-1.5 rounded-full border border-teal-300/30 animate-ping [animation-duration:3s] pointer-events-none opacity-30" />

            {/* Icon Robot ở giữa */}
            <Bot className="w-7 h-7 text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />

            {/* Huy hiệu chữ 'AI' nhỏ gọn ở góc */}
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] font-black rounded-full shadow-md uppercase border-2 border-white tracking-wider">
              AI
            </span>
          </div>
        </div>
      )}

      {/* ================= CỬA SỔ CHAT MODAL (KHI MỞ) ================= */}
      {/* Định vị độc lập fixed trên màn hình để không bao giờ bị tràn mép */}
      {isOpen && (
        <div
          className={`fixed z-50 print:hidden font-sans bottom-6 sm:bottom-8 ${
            isRightSide ? 'right-6 sm:right-8' : 'left-6 sm:left-8'
          } w-[360px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-80px)] bg-white rounded-3xl shadow-2xl border border-teal-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        >
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-[#00666B] via-[#007379] to-[#005155] p-3.5 sm:p-4 text-white flex items-center justify-between shadow-md relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#00666B]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">{BOT_NAME}</h3>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md border border-white/30 uppercase">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sẵn sàng giải đáp & tư vấn giáo trình
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Bắt đầu lại cuộc trò chuyện"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Thu nhỏ cửa sổ chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-teal-50/30 via-slate-50/50 to-white text-xs select-text">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                      isUser
                        ? 'bg-[#00666B] text-white rounded-br-xs font-medium'
                        : 'bg-white border border-teal-100/80 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {isUser ? msg.text : renderFormattedText(msg.text)}

                    {/* Hiển thị sách gợi ý nếu có */}
                    {!isUser && msg.matchedBooks && msg.matchedBooks.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-teal-100 space-y-1.5">
                        <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#00666B]" /> Sách gợi ý trong thư viện:
                        </p>
                        {msg.matchedBooks.map((book) => (
                          <div
                            key={book.id}
                            onClick={() => {
                              if (onNavigateToBook) {
                                onNavigateToBook(book.id);
                                setIsOpen(false);
                              }
                            }}
                            className="bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 rounded-xl p-2 flex items-center justify-between transition-colors cursor-pointer group"
                          >
                            <div className="min-w-0 pr-2">
                              <h4 className="font-bold text-slate-900 truncate text-[11px] group-hover:text-[#00666B]">
                                {book.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">
                                {book.location} • Còn {book.availableQuantity} cuốn
                              </p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00666B] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Hiệu ứng đang gõ */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 bg-white border border-teal-100 rounded-2xl px-4 py-2.5 w-fit shadow-xs">
                <Bot className="w-4 h-4 text-[#00666B] animate-spin" />
                <span className="text-[11px] font-medium text-slate-600">Thủ thư số đang soạn câu trả lời...</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00666B] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00666B] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00666B] animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Các nút gợi ý câu hỏi nhanh (Quick suggestions) */}
          <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {QUICK_SUGGESTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSendMessage(item.label.replace(/^.*? /, ''))}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 border border-teal-200/80 text-[11px] font-semibold text-slate-700 hover:text-[#00666B] shrink-0 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Ô nhập tin nhắn */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-teal-100 flex items-center gap-2 select-text"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Hỏi về sách, quy định, 3 cơ sở UTH..."
              disabled={isLoading}
              className="flex-1 bg-slate-100/80 focus:bg-white border border-transparent focus:border-[#00666B] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#00666B] hover:bg-[#004f53] disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer watermark */}
          <div className="py-1 bg-slate-100/60 text-center text-[10px] text-slate-400 font-medium">
            Thủ thư số UTH · Hỗ trợ sinh viên 24/7
          </div>
        </div>
      )}
    </>
  );
}
