import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ Lý Ảo VinFast Auto. Tôi có thể giúp gì cho bạn? (Ví dụ: Tư vấn xe cho gia đình 5 người, bảng giá, hoặc thông số VF 3, VF 8...)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Dynamic VinFast AI Answer Engine (Simulating local NLP)
  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Recommendation for 5 people
    if (q.includes('5 người') || q.includes('gia đình 5') || q.includes('5 chỗ')) {
      return 'Dành cho gia đình 5 người, VinFast có các lựa chọn tối ưu sau:\n\n' +
        '1. **VF 5 Plus** (A-SUV): Gọn gàng, kinh tế, giá từ 468tr. Đi được 326 km/sạc.\n' +
        '2. **VF 6** (B-SUV): Rộng rãi hơn, trang bị ADAS thông minh, giá từ 675tr. Tầm di chuyển 399 km.\n' +
        '3. **VF 7** (C-SUV): Thiết kế đột phá, phong cách thể thao phi đối xứng, động cơ cực mạnh 349hp, giá từ 850tr. Tầm di chuyển 431 km.\n' +
        '4. **VF 8** (D-SUV): Dòng xe toàn cầu cao cấp, cực kỳ rộng rãi và an toàn đạt chuẩn 5 sao, giá từ 1,09 tỷ. Tầm di chuyển 471 km.\n\n' +
        '👉 Nếu kinh phí vừa phải, chọn **VF 5/VF 6**. Nếu cần sự đẳng cấp và công nghệ tối tân, chọn **VF 7/VF 8**!';
    }

    // 2. Recommend for 7 people
    if (q.includes('7 người') || q.includes('gia đình đông') || q.includes('7 chỗ')) {
      return 'Dành cho nhu cầu 7 người di chuyển sang trọng, mẫu xe đầu bảng **VinFast VF 9** là lựa chọn tuyệt vời nhất:\n\n' +
        '- **Phân khúc**: E-SUV (Full-size cao cấp)\n' +
        '- **Tầm di chuyển**: Lên tới 626 km sau một lần sạc đầy.\n' +
        '- **Tiện nghi**: Ghế thương gia tích hợp massage/sưởi/thông gió, màn hình HUD phi thuyền, trần kính toàn cảnh.\n' +
        '- **Giá bán**: Từ 1,56 tỷ đồng.\n\n' +
        '👉 Ngoài ra, dòng mini-car **VF 3** (4 chỗ) và SUV cỡ nhỏ khác đều chỉ hỗ trợ tối đa 4-5 chỗ.';
    }

    // 3. Price checks
    if (q.includes('bảng giá') || q.includes('giá bao nhiêu') || q.includes('giá xe') || q.includes('giá bán')) {
      return 'Bảng giá niêm yết (chưa bao gồm khuyến mãi/voucher) của các dòng ô tô điện VinFast:\n\n' +
        '1. **VF 3**: Từ 322.000.000đ (Dòng Mini-SUV gọn nhẹ)\n' +
        '2. **VF 5 Plus**: Từ 468.000.000đ (A-SUV đô thị)\n' +
        '3. **VF 6**: Từ 675.000.000đ (B-SUV gia đình)\n' +
        '4. **VF 7**: Từ 850.000.000đ (C-SUV thể thao)\n' +
        '5. **VF 8**: Từ 1.090.000.000đ (D-SUV toàn cầu)\n' +
        '6. **VF 9**: Từ 1.560.000.000đ (E-SUV hạng sang)\n\n' +
        '👉 Đặt cọc online hôm nay để nhận voucher giảm thêm tới 10-50 triệu đồng và ưu đãi sạc pin!';
    }

    // 4. VF 3 specifications
    if (q.includes('vf 3') || q.includes('vf3')) {
      return '🤖 **Thông số VinFast VF 3**:\n' +
        '- Phân khúc: SUV cỡ nhỏ (Mini-SUV)\n' +
        '- Giá bán: 322 triệu đồng (chưa kèm pin)\n' +
        '- Quãng đường: ~210 km / lần sạc đầy\n' +
        '- Số chỗ ngồi: 4 chỗ\n' +
        '- Pin: LFP dung lượng 18.6 kWh\n' +
        '- Thiết kế: Vuông vắn, hầm hố, cá tính với nhiều màu sắc trẻ trung.';
    }

    // 5. VF 8 specs
    if (q.includes('vf 8') || q.includes('vf8')) {
      return '🤖 **Thông số VinFast VF 8**:\n' +
        '- Phân khúc: SUV điện cỡ D (D-SUV)\n' +
        '- Giá bán: Từ 1,09 tỷ đồng\n' +
        '- Công suất: Lên tới 402 mã lực, dẫn động 4 bánh toàn thời gian (AWD)\n' +
        '- Quãng đường: 471 km / lần sạc đầy\n' +
        '- Hệ thống an toàn: 11 túi khí, đạt chuẩn NHTSA 5 sao\n' +
        '- Trợ lý ảo: VinFast thông minh, điều khiển bằng giọng nói tiếng Việt.';
    }

    // 6. Charging and stations
    if (q.includes('trạm sạc') || q.includes('sạc pin') || q.includes('sạc nhanh')) {
      return 'VinFast sở hữu mạng lưới trạm sạc lớn nhất Việt Nam với hơn 150.000 cổng sạc trên 63 tỉnh thành:\n\n' +
        '- **Sạc tại nhà**: Sử dụng bộ sạc di động 2.2kW hoặc bộ sạc treo tường thông minh 7.4kW.\n' +
        '- **Sạc siêu nhanh công cộng**: Cổng sạc siêu nhanh 150kW - 250kW giúp sạc 10% lên 70% chỉ từ **24 - 36 phút** tùy dòng xe.';
    }

    // 7. Battery rental policy
    if (q.includes('thuê pin') || q.includes('gói pin')) {
      return 'Chính sách thuê pin độc đáo của VinFast giúp giảm giá mua xe ban đầu đáng kể. Chi phí thuê pin hàng tháng dao động:\n\n' +
        '- **VF 3**: 900.000đ/tháng\n' +
        '- **VF 5**: 1.600.000đ/tháng\n' +
        '- **VF 6**: 1.800.000đ/tháng\n' +
        '- **VF 8**: 2.900.000đ/tháng\n\n' +
        '👉 VinFast cam kết bảo hành và thay thế pin miễn phí trọn đời khi dung lượng pin tối đa xuống dưới 70%.';
    }

    // 8. General fallback
    return 'Cảm ơn câu hỏi của bạn. Để được tư vấn chi tiết nhất, bạn có thể:\n' +
      '1. Truy cập mục **Dòng xe** để so sánh thông số.\n' +
      '2. Chọn tính năng **Tính trả góp** để lập kế hoạch tài chính vay ngân hàng.\n' +
      '3. Hoặc nhấn **Đăng ký lái thử** để trải nghiệm thực tế xe tại Showroom gần nhất.';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: Message = {
        sender: 'bot',
        text: getAIResponse(userMessage.text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-electric-gradient text-white rounded-full shadow-glow-blue hover:shadow-glow-cyan hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-50 animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] rounded-2xl bg-vinfast-carbon-900 border border-white/10 shadow-premium flex flex-col z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-electric-gradient px-4 py-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-vinfast-cyan" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  Trợ Lý Ảo VinFast
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                </h4>
                <span className="text-[10px] text-vinfast-cyan-light">Hỗ trợ trả lời tự động 24/7</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-vinfast-cyan transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-vinfast-carbon-950/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-vinfast-blue text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-vinfast-carbon-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-vinfast-carbon-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 border-t border-white/5 bg-vinfast-carbon-900/80 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
            <button
              onClick={() => handleQuickQuestion('Xe nào phù hợp gia đình 5 người?')}
              className="text-[11px] bg-white/5 border border-white/10 hover:border-vinfast-cyan/40 px-2.5 py-1 rounded-full text-vinfast-carbon-300 hover:text-white transition-all"
            >
              Gia đình 5 người?
            </button>
            <button
              onClick={() => handleQuickQuestion('Bảng giá xe mới nhất')}
              className="text-[11px] bg-white/5 border border-white/10 hover:border-vinfast-cyan/40 px-2.5 py-1 rounded-full text-vinfast-carbon-300 hover:text-white transition-all"
            >
              Bảng giá xe 💰
            </button>
            <button
              onClick={() => handleQuickQuestion('Chính sách thuê pin thế nào?')}
              className="text-[11px] bg-white/5 border border-white/10 hover:border-vinfast-cyan/40 px-2.5 py-1 rounded-full text-vinfast-carbon-300 hover:text-white transition-all"
            >
              Thuê pin 🔋
            </button>
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-vinfast-carbon-900 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-vinfast-carbon-950 border border-white/5 focus:border-vinfast-cyan/50 text-white rounded-xl px-4 py-2 text-sm focus:outline-none placeholder-vinfast-carbon-500"
            />
            <button
              onClick={handleSend}
              className="bg-electric-gradient text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
