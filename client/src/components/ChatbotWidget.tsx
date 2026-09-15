import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là **Trợ Lý Ảo AI VinFast Auto** ⚡\n\nTôi có thể tư vấn dòng xe phù hợp, bảng giá, thông số kỹ thuật, chính sách thuê pin hoặc đăng ký lái thử cho bạn.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    const userMessage: Message = {
      sender: 'user',
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { prompt: userQuery });
      const aiReply = res.data.reply || 'Cảm ơn bạn, hệ thống VinFast luôn sẵn sàng hỗ trợ!';

      const botResponse: Message = {
        sender: 'bot',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch {
      const fallback: Message = {
        sender: 'bot',
        text: 'Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau giây lát!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[400px] h-[540px] rounded-2xl bg-white flex flex-col z-50 overflow-hidden"
          style={{
            boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  Trợ Lý Ảo AI VinFast
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </h4>
                <span className="text-[11px] text-blue-200">Tư vấn xe & Báo giá 24/7</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ background: '#2563eb' }}
                  >
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}
                    style={
                      msg.sender === 'user'
                        ? { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }
                        : { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                    }
                  >
                    {msg.sender === 'bot' ? (
                      <div className="chatbot-md">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-start">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#2563eb' }}
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-gray-400 ml-2">AI đang trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 border-t border-gray-100 bg-white flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {[
              { label: '🚗 Cho 5 người?', q: 'Gia đình 5 người nên chọn xe nào?' },
              { label: '💰 Bảng giá', q: 'Bảng giá xe VinFast mới nhất' },
              { label: '🔋 Thuê pin', q: 'Chính sách thuê pin như thế nào?' },
              { label: '📊 So sánh', q: 'So sánh các dòng xe VinFast' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickQuestion(item.q)}
                className="text-[11px] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full text-blue-700 font-medium transition-colors whitespace-nowrap border border-blue-100"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI tư vấn xe, thông số, giá..."
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-blue-400 text-gray-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none placeholder-gray-400 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="text-white p-2.5 rounded-xl transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inline styles for chatbot markdown & animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatbot-md p { margin: 0 0 6px 0; }
        .chatbot-md p:last-child { margin-bottom: 0; }
        .chatbot-md strong { font-weight: 700; color: #1e40af; }
        .chatbot-md ul, .chatbot-md ol { margin: 4px 0; padding-left: 18px; }
        .chatbot-md li { margin: 2px 0; }
        .chatbot-md table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 11px; }
        .chatbot-md th { background: #eff6ff; color: #1e40af; font-weight: 600; text-align: left; padding: 5px 8px; border: 1px solid #dbeafe; }
        .chatbot-md td { padding: 4px 8px; border: 1px solid #e5e7eb; }
        .chatbot-md tr:nth-child(even) td { background: #f8fafc; }
        .chatbot-md h1, .chatbot-md h2, .chatbot-md h3 { font-size: 13px; font-weight: 700; margin: 6px 0 4px; color: #1e3a8a; }
      `}</style>
    </>
  );
}
