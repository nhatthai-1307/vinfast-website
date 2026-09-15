import { Request, Response, NextFunction } from 'express';

// ==========================================
// VinFast Full Knowledge Base for AI Engine
// ==========================================
const VINFAST_KNOWLEDGE: Record<string, { keywords: string[]; answer: string }> = {
  vf3_specs: {
    keywords: ['vf 3', 'vf3', 'mini suv'],
    answer: `⚡ **Thông số kỹ thuật VinFast VF 3**

| Thông số | Chi tiết |
|----------|---------|
| Phân khúc | Mini-SUV (A-Segment) |
| Giá bán | Từ 322 triệu đồng |
| Số chỗ ngồi | 4 chỗ |
| Kích thước (DxRxC) | 3.190 x 1.678 x 1.560 mm |
| Trục cơ sở | 2.000 mm |
| Tải trọng | ~300 kg |
| Động cơ | Motor điện 1 cầu trước |
| Công suất | 95 mã lực (71 kW) |
| Mô-men xoắn | 135 Nm |
| Pin | LFP 18.6 kWh |
| Quãng đường | ~210 km / lần sạc |
| Tốc độ tối đa | 120 km/h |
| Sạc nhanh DC | 10% → 70% trong ~36 phút |
| Thiết kế | Vuông vắn, cá tính, nhiều màu thời trang |`
  },
  vf5_specs: {
    keywords: ['vf 5', 'vf5', 'vf 5 plus'],
    answer: `⚡ **Thông số kỹ thuật VinFast VF 5 Plus**

| Thông số | Chi tiết |
|----------|---------|
| Phân khúc | A-SUV đô thị |
| Giá bán | Từ 468 triệu đồng |
| Số chỗ ngồi | 5 chỗ |
| Kích thước (DxRxC) | 4.000 x 1.760 x 1.588 mm |
| Trục cơ sở | 2.513 mm |
| Tải trọng | ~410 kg |
| Khoảng sáng gầm | 180 mm |
| Công suất | 134 mã lực (100 kW) |
| Mô-men xoắn | 135 Nm |
| Dẫn động | Cầu trước (FWD) |
| Pin | Lithium 37.23 kWh |
| Quãng đường | ~326 km / lần sạc |
| Tốc độ tối đa | 150 km/h |
| Sạc nhanh DC | 10% → 70% trong ~24 phút |
| ADAS | Cảnh báo va chạm, giữ làn, đèn tự động |
| Cốp xe | 373 lít |`
  },
  vf6_specs: {
    keywords: ['vf 6', 'vf6'],
    answer: `⚡ **Thông số kỹ thuật VinFast VF 6**

| Thông số | Chi tiết |
|----------|---------|
| Phân khúc | B-SUV gia đình |
| Giá bán | Từ 675 triệu đồng |
| Số chỗ ngồi | 5 chỗ |
| Kích thước (DxRxC) | 4.238 x 1.820 x 1.594 mm |
| Trục cơ sở | 2.730 mm |
| Tải trọng | ~470 kg |
| Khoảng sáng gầm | 190 mm |
| Công suất | 201 mã lực (150 kW) |
| Mô-men xoắn | 310 Nm |
| Pin | 59.6 kWh |
| Quãng đường | ~399 km / lần sạc |
| Tốc độ tối đa | 175 km/h |
| ADAS | Level 2: Tự lái thích ứng, giữ làn, phanh tự động |
| Cốp xe | 422 lít |`
  },
  vf7_specs: {
    keywords: ['vf 7', 'vf7'],
    answer: `⚡ **Thông số kỹ thuật VinFast VF 7**

| Thông số | Chi tiết |
|----------|---------|
| Phân khúc | C-SUV thể thao |
| Giá bán | Từ 850 triệu đồng |
| Số chỗ ngồi | 5 chỗ |
| Kích thước (DxRxC) | 4.545 x 1.890 x 1.636 mm |
| Trục cơ sở | 2.840 mm |
| Tải trọng | ~530 kg |
| Khoảng sáng gầm | 195 mm |
| Công suất | 349 mã lực (260 kW) |
| Mô-men xoắn | 500 Nm |
| Dẫn động | AWD 4 bánh toàn thời gian |
| Pin | 75.3 kWh |
| Quãng đường | ~431 km / lần sạc |
| Tốc độ tối đa | 200 km/h |
| 0-100 km/h | ~5.8 giây |
| ADAS | Level 2+: Tự lái highway, đỗ xe tự động |
| Thiết kế | Phi đối xứng độc đáo |`
  },
  vf8_specs: {
    keywords: ['vf 8', 'vf8'],
    answer: `⚡ **Thông số kỹ thuật VinFast VF 8**

| Thông số | Chi tiết |
|----------|---------|
| Phân khúc | D-SUV hạng sang toàn cầu |
| Giá bán | Từ 1,09 tỷ đồng |
| Số chỗ ngồi | 5 chỗ |
| Kích thước (DxRxC) | 4.750 x 1.934 x 1.667 mm |
| Trục cơ sở | 2.950 mm |
| Tải trọng | ~590 kg |
| Khoảng sáng gầm | 200 mm |
| Công suất | 402 mã lực (300 kW) |
| Mô-men xoắn | 620 Nm |
| Dẫn động | AWD 4 bánh toàn thời gian |
| Pin | 87.7 kWh |
| Quãng đường | ~471 km / lần sạc |
| Tốc độ tối đa | 200 km/h |
| 0-100 km/h | ~5.5 giây |
| An toàn | 11 túi khí, 5 sao NHTSA |
| ADAS | Level 2+: Highway Assist, đỗ xe tự động |`
  },
  vf9_specs: {
    keywords: ['vf 9', 'vf9'],
    answer: `⚡ **Thông số kỹ thuật VinFast VF 9**

| Thông số | Chi tiết |
|----------|---------|
| Phân khúc | E-SUV Full-size cao cấp nhất |
| Giá bán | Từ 1,56 tỷ đồng |
| Số chỗ ngồi | 6-7 chỗ (3 hàng ghế) |
| Kích thước (DxRxC) | 5.120 x 2.000 x 1.721 mm |
| Trục cơ sở | 3.150 mm |
| Tải trọng | ~680 kg |
| Khoảng sáng gầm | 205 mm |
| Công suất | 402 mã lực (300 kW) |
| Mô-men xoắn | 620 Nm |
| Dẫn động | AWD 4 bánh toàn thời gian |
| Pin | 123 kWh |
| Quãng đường | ~626 km / lần sạc |
| Tốc độ tối đa | 200 km/h |
| 0-100 km/h | ~6.5 giây |
| Tiện nghi | Ghế massage/sưởi/thông gió, trần kính toàn cảnh, HUD |`
  },
  price_table: {
    keywords: ['bảng giá', 'giá xe', 'giá bán', 'nhiêu tiền', 'bao nhiêu', 'giá cọc'],
    answer: `💰 **Bảng giá niêm yết các dòng xe điện VinFast**

| Dòng xe | Phân khúc | Giá bán |
|---------|-----------|---------|
| VF 3 | Mini-SUV | 322.000.000đ |
| VF 5 Plus | A-SUV | 468.000.000đ |
| VF 6 | B-SUV | 675.000.000đ |
| VF 7 | C-SUV | 850.000.000đ |
| VF 8 | D-SUV | 1.090.000.000đ |
| VF 9 | E-SUV | 1.560.000.000đ |

🎁 Đặt cọc 10 triệu online để nhận voucher giảm thêm tới 50 triệu & ưu đãi sạc pin!`
  },
  family_5: {
    keywords: ['5 người', '5 chỗ', 'gia đình 5', 'gia dinh 5'],
    answer: `🚗 **Gợi ý xe 5 chỗ cho gia đình**

1. **VF 5 Plus** – Gọn gàng, kinh tế, giá từ 468tr. Tầm chạy 326 km.
2. **VF 6** – Rộng rãi, ADAS thông minh, giá từ 675tr. Tầm chạy 399 km.
3. **VF 7** – Thể thao, động cơ 349hp mạnh mẽ, giá từ 850tr.
4. **VF 8** – Hạng sang 402hp AWD, an toàn 5 sao, giá từ 1,09 tỷ.

👉 Ngân sách dưới 700tr → chọn **VF 5/VF 6**. Muốn đẳng cấp → **VF 7/VF 8**!`
  },
  family_7: {
    keywords: ['7 người', '7 chỗ', 'gia đình đông', 'đông người'],
    answer: `👑 **VinFast VF 9 – SUV 7 chỗ cao cấp nhất**

- Phân khúc E-SUV Full-size, 3 hàng ghế rộng rãi
- Quãng đường: Lên tới 626 km / lần sạc
- Ghế thương gia massage/sưởi/thông gió
- Trần kính toàn cảnh, màn hình HUD
- Giá bán: Từ 1,56 tỷ đồng

Đây là lựa chọn duy nhất 7 chỗ trong dòng VinFast hiện tại!`
  },
  battery_rental: {
    keywords: ['thuê pin', 'gói pin', 'pin bao lâu', 'bảo hành pin'],
    answer: `🔋 **Chính sách Thuê pin VinFast**

| Dòng xe | Phí thuê/tháng |
|---------|---------------|
| VF 3 | 900.000đ |
| VF 5 | 1.600.000đ |
| VF 6 | 1.800.000đ |
| VF 7 | 2.400.000đ |
| VF 8 | 2.900.000đ |
| VF 9 | 3.200.000đ |

✅ Cam kết: Thay thế pin mới **miễn phí trọn đời** khi dung lượng pin dưới 70%!`
  },
  charging: {
    keywords: ['trạm sạc', 'sạc pin', 'sạc ở đâu', 'sạc nhanh', 'sạc bao lâu'],
    answer: `🔌 **Hệ thống trạm sạc VinFast**

- Hơn **150.000 cổng sạc** trên 63 tỉnh thành Việt Nam
- Sạc siêu nhanh 150kW–250kW: Từ 10% lên 70% chỉ **24–36 phút**
- Sạc tại nhà: Bộ sạc di động 2.2kW hoặc treo tường 7.4kW
- Miễn phí sạc 1 năm đầu cho khách đặt cọc sớm!`
  },
  installment: {
    keywords: ['trả góp', 'vay ngân hàng', 'vay mua xe', 'trả trước', 'lãi suất'],
    answer: `🏦 **Chương trình Vay trả góp VinFast**

- Tỉ lệ vay: 20% – 80% giá trị xe
- Kỳ hạn: 12 – 96 tháng (tối đa 8 năm)
- Lãi suất ưu đãi: Từ 7.5%/năm
- Trả trước tối thiểu: 20% giá xe
- Ngân hàng hỗ trợ: Vietcombank, Techcombank, TPBank, VPBank...

👉 Dùng công cụ **Tính trả góp** trên website để biết số tiền trả hàng tháng!`
  },
  test_drive: {
    keywords: ['lái thử', 'test drive', 'trải nghiệm', 'showroom'],
    answer: `🏎️ **Đăng ký lái thử miễn phí tại Showroom VinFast**

- Thời gian: Thứ 2 – Chủ nhật, 8:00 – 17:00
- Địa điểm: Tất cả Showroom VinFast trên toàn quốc
- Yêu cầu: Có bằng lái B2 còn hiệu lực, CMND/CCCD

👉 Đăng ký ngay trên website hoặc gọi hotline!`
  },
  adas: {
    keywords: ['adas', 'trợ lái', 'tự lái', 'an toàn', 'túi khí', 'phanh tự động'],
    answer: `🛡️ **Hệ thống ADAS & An toàn trên xe VinFast**

- **Phanh khẩn cấp tự động (AEB)**: Tự phanh khi phát hiện vật cản
- **Cảnh báo điểm mù (BSM)**: Cảnh báo xe ở vùng khuất
- **Giữ làn đường (LKA)**: Tự lái giữ xe trong làn
- **Kiểm soát hành trình thích ứng (ACC)**: Tự điều chỉnh tốc độ
- **Camera 360°**: Quan sát toàn cảnh xung quanh xe
- **Đỗ xe tự động**: Hỗ trợ đỗ xe song song & vuông góc
- Trang bị từ 6–11 túi khí tùy dòng xe

VF 8 đạt chuẩn **5 sao an toàn NHTSA** (Mỹ)!`
  },
  weight_load: {
    keywords: ['tải trọng', 'trọng tải', 'nặng bao nhiêu', 'trọng lượng', 'cân nặng'],
    answer: `⚖️ **Tải trọng & Trọng lượng các dòng xe VinFast**

| Dòng xe | Trọng lượng không tải | Tải trọng cho phép |
|---------|----------------------|-------------------|
| VF 3 | ~920 kg | ~300 kg |
| VF 5 Plus | ~1.490 kg | ~410 kg |
| VF 6 | ~1.690 kg | ~470 kg |
| VF 7 | ~1.935 kg | ~530 kg |
| VF 8 | ~2.155 kg | ~590 kg |
| VF 9 | ~2.660 kg | ~680 kg |

📌 *Tải trọng bao gồm hành khách + hành lý + phụ kiện lắp thêm.*`
  },
  range: {
    keywords: ['quãng đường', 'đi được bao xa', 'tầm chạy', 'km', 'đi xa', 'pin hết'],
    answer: `🔋 **Quãng đường di chuyển sau 1 lần sạc đầy**

| Dòng xe | Pin | Quãng đường |
|---------|-----|-------------|
| VF 3 | 18.6 kWh | ~210 km |
| VF 5 Plus | 37.23 kWh | ~326 km |
| VF 6 | 59.6 kWh | ~399 km |
| VF 7 | 75.3 kWh | ~431 km |
| VF 8 | 87.7 kWh | ~471 km |
| VF 9 | 123 kWh | ~626 km |

Số liệu theo tiêu chuẩn WLTP, thực tế có thể ±10% tùy điều kiện.`
  },
  rental: {
    keywords: ['thuê xe', 'cho thuê', 'tự lái', 'thuê ngày', 'rent'],
    answer: `🚙 **Dịch vụ Thuê xe VinFast tự lái**

| Dòng xe | Giá thuê/ngày |
|---------|--------------|
| VF 5 Plus | 800.000đ |
| VF 6 | 1.200.000đ |
| VF 7 | 1.600.000đ |
| VF 8 | 2.000.000đ |
| VF 9 | 2.500.000đ |

- Đặt cọc thuê: 5 triệu đồng
- Yêu cầu: CMND/CCCD + Bằng lái B2
- Bao gồm bảo hiểm xe & hỗ trợ cứu hộ 24/7

👉 Đặt thuê xe ngay tại mục **Thuê xe** trên website!`
  },
  compare: {
    keywords: ['so sánh', 'khác gì', 'hơn gì', 'chọn xe nào'],
    answer: `📊 **So sánh nhanh các dòng xe VinFast**

| Tiêu chí | VF 5 | VF 6 | VF 7 | VF 8 | VF 9 |
|----------|------|------|------|------|------|
| Giá | 468tr | 675tr | 850tr | 1,09tỷ | 1,56tỷ |
| Chỗ ngồi | 5 | 5 | 5 | 5 | 7 |
| Tầm chạy | 326km | 399km | 431km | 471km | 626km |
| Công suất | 134hp | 201hp | 349hp | 402hp | 402hp |
| Dẫn động | FWD | FWD | AWD | AWD | AWD |

👉 Dùng công cụ **So sánh xe** trên website để xem chi tiết hơn!`
  },
};

// System prompt for Gemini API
const VINFAST_SYSTEM_PROMPT = `Bạn là Trợ Lý Ảo AI cao cấp của hệ thống thương mại điện tử VinFast Electric Auto Việt Nam.
Nhiệm vụ: Tư vấn thân thiện, chuyên nghiệp, chính xác cho khách hàng về các dòng ô tô điện VinFast.

Dữ liệu các dòng xe:
- VF 3: Mini-SUV 4 chỗ, 322 triệu, pin LFP 18.6kWh, ~210km/sạc, 95hp, tải trọng ~300kg
- VF 5 Plus: A-SUV 5 chỗ, 468 triệu, pin 37.23kWh, 326km/sạc, 134hp, tải trọng ~410kg
- VF 6: B-SUV 5 chỗ, từ 675 triệu, pin 59.6kWh, 399km/sạc, 201hp, ADAS Level 2, tải trọng ~470kg
- VF 7: C-SUV 5 chỗ thể thao, từ 850 triệu, pin 75.3kWh, 431km/sạc, 349hp AWD, tải trọng ~530kg
- VF 8: D-SUV 5 chỗ hạng sang, từ 1.09 tỷ, pin 87.7kWh, 471km/sạc, 402hp AWD, 11 túi khí 5 sao NHTSA, tải trọng ~590kg
- VF 9: E-SUV 7 chỗ thương gia, từ 1.56 tỷ, pin 123kWh, 626km/sạc, 402hp AWD, ghế massage, tải trọng ~680kg

Dịch vụ: Thuê pin (900k-3.2tr/tháng), Trạm sạc (150.000+ cổng, sạc nhanh 24-36 phút), Vay trả góp (20-80% giá trị, 12-96 tháng), Thuê xe tự lái (800k-2.5tr/ngày), Lái thử miễn phí.

Quy tắc: Trả lời bằng tiếng Việt, ngắn gọn, dùng markdown bảng/bullet points rõ ràng, thêm emoji phù hợp. Nếu khách hỏi ngoài phạm vi xe VinFast, nhẹ nhàng hướng dẫn về chủ đề xe.`;

// Smart local engine - searches knowledge base
function localAIEngine(prompt: string): string {
  const q = prompt.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove diacritics for better matching
    .replace(/[^a-z0-9\s]/g, '');
  
  const qOriginal = prompt.toLowerCase();

  let bestMatch = '';
  let bestScore = 0;

  for (const [key, entry] of Object.entries(VINFAST_KNOWLEDGE)) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '');
      if (qOriginal.includes(kw) || q.includes(kwNorm)) {
        score += kw.length * 2; // Longer keyword = higher relevance
      }
    }
    // Bonus: if query mentions a specific car model AND matches this entry's car-specific keywords
    const carModels = ['vf 3', 'vf3', 'vf 5', 'vf5', 'vf 6', 'vf6', 'vf 7', 'vf7', 'vf 8', 'vf8', 'vf 9', 'vf9'];
    const mentionsCar = carModels.some(m => qOriginal.includes(m) || q.includes(m.replace(/\s/g, '')));
    if (mentionsCar && key.includes('specs')) {
      score += 50; // Strong preference for car-specific spec entries
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry.answer;
    }
  }

  if (bestMatch) return bestMatch;

  // Generic fallback
  return `Cảm ơn câu hỏi của bạn! ⚡

Tôi có thể hỗ trợ bạn về:
- 📋 **Thông số** từng dòng xe (VF 3, VF 5, VF 6, VF 7, VF 8, VF 9)
- 💰 **Bảng giá** và chương trình khuyến mãi
- 🔋 **Thuê pin** và trạm sạc
- 🏦 **Trả góp** và tài chính
- 🚙 **Thuê xe** tự lái
- 📊 **So sánh** các dòng xe

Hãy hỏi cụ thể hơn để tôi tư vấn chính xác nhé!`;
}

// @desc    Chat with VinFast AI Assistant
// @route   POST /api/ai/chat
// @access  Public
export const chatWithAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu hỏi' });
    }

    // 1. Try Google Gemini API if key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: VINFAST_SYSTEM_PROMPT }] },
            contents: [
              { role: 'user', parts: [{ text: prompt }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        });

        const data: any = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.json({
            success: true,
            reply: data.candidates[0].content.parts[0].text,
            source: 'gemini-ai',
          });
        }
      } catch (err) {
        console.warn('[AI] Gemini API failed, falling back to local engine');
      }
    }

    // 2. Smart Local Engine Fallback
    const reply = localAIEngine(prompt);
    res.json({ success: true, reply, source: 'vinfast-ai-engine' });
  } catch (error) {
    next(error);
  }
};
