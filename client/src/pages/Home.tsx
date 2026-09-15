import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, Fuel, Compass, ChevronRight,
  Calculator, Star, ArrowRight, BadgeCheck, Leaf
} from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carPrice, setCarPrice] = useState(468000000);
  const [prepaidPercent, setPrepaidPercent] = useState(20);
  const [loanMonths, setLoanMonths] = useState(60);
  const interestRate = 0.08;

  useEffect(() => {
    api.get('/cars?isFeatured=true')
      .then(r => setFeaturedCars(r.data.cars))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const prepaidAmount   = (carPrice * prepaidPercent) / 100;
  const loanAmount      = carPrice - prepaidAmount;
  const r               = interestRate / 12;
  const monthlyPayment  = (loanAmount * r * Math.pow(1+r, loanMonths)) / (Math.pow(1+r, loanMonths) - 1);
  const vnd = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const values = [
    { icon: ShieldCheck, title: 'Bảo Hành 10 Năm',   desc: 'Cam kết bảo hành dài hạn nhất phân khúc.',        bg: 'bg-blue-50',   ic: 'text-blue-600'   },
    { icon: Zap,         title: 'Trạm Sạc Phủ Khắp', desc: 'Hơn 150.000 cổng sạc trên 63 tỉnh thành.',       bg: 'bg-sky-50',    ic: 'text-sky-600'    },
    { icon: Fuel,        title: 'Thuê Pin Độc Đáo',   desc: 'Giảm giá thành xe, bảo dưỡng pin trọn đời.',     bg: 'bg-indigo-50', ic: 'text-indigo-600' },
    { icon: Compass,     title: 'ADAS Cực Đỉnh',      desc: 'Hệ thống hỗ trợ lái tự động cấp độ 2.',          bg: 'bg-violet-50', ic: 'text-violet-600' },
  ];

  const testimonials = [
    { stars: 5, name: 'Anh Nguyễn Hoàng Nam', role: 'Chủ xe VF 3 — Hà Nội',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      text: '"Xe đi phố nhỏ gọn, thiết kế thể thao không chê vào đâu. Sạc pin 30 phút thoải mái đi cả tuần."' },
    { stars: 5, name: 'Chị Phạm Minh Hằng', role: 'Chủ xe VF 8 — TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      text: '"VF 8 là bạn đồng hành đắc lực cho chuyến du lịch xa. Tự lái giữ khoảng cách an toàn rất tốt."' },
    { stars: 5, name: 'Anh Trần Tiến Dũng', role: 'Chủ xe VF 5 — Đà Nẵng',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      text: '"Chi phí vận hành siêu tiết kiệm, không lo khói bụi. Tôi đã bỏ hẳn xe xăng."' },
  ];

  return (
    <div style={{ backgroundColor: '#F5F6FA' }}>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 hero-gradient" />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-40" />
        {/* Color blobs */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
              <div className="flex items-center gap-2">
                <span className="section-badge">
                  <Leaf className="w-3 h-3" /> Kiến Tạo Tương Lai Xanh
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-black text-[#1A1D23] leading-[1.1] tracking-tight">
                Thế Hệ Ô Tô<br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  Điện VinFast
                </span>
              </h1>

              <p className="text-lg text-[#6B7280] leading-relaxed max-w-lg">
                Trải nghiệm công nghệ ADAS thông minh, trợ lý ảo tiếng Việt và bảo hành 10 năm vượt trội — thương hiệu Việt tự hào toàn cầu.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/cars" className="btn-primary text-base px-7 py-3.5">
                  Khám Phá Dòng Xe <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/rental" className="btn-white text-base px-7 py-3.5">
                  Thuê Xe Thử Ngay
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  Bảo hành 10 năm
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  150.000+ cổng sạc
                </div>
              </div>
            </motion.div>

            {/* Right: hero image */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative">
              {/* Main image card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50">
                <img
                  src="/assets/cars/hero_vinfast.jpg"
                  alt="VinFast VF 8 Electric SUV"
                  className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>

              {/* Stat card — bottom left */}
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl shadow-slate-200 px-5 py-4 border border-[#E8EAF0] flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] font-medium">Tầm hoạt động</p>
                  <p className="text-sm font-black text-[#1A1D23]">Lên đến 680 km</p>
                </div>
              </motion.div>

              {/* Stat card — top right */}
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl shadow-slate-200 px-5 py-4 border border-[#E8EAF0] flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] font-medium">Bảo hành</p>
                  <p className="text-sm font-black text-[#1A1D23]">10 năm / Pin trọn đời</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ BRAND VALUES ═══ */}
      <section className="py-20 bg-white border-t border-[#E8EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge mb-4 inline-flex">Cam kết VinFast</span>
            <h2 className="section-title">Vì Sao Chọn VinFast?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, bg, ic }) => (
              <div key={title} className="group p-6 rounded-2xl border border-[#E8EAF0] bg-white hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${ic}`} />
                </div>
                <h3 className="text-base font-bold text-[#1A1D23] mb-2">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED CARS ═══ */}
      <section className="py-24 bg-[#F5F6FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="section-badge mb-3 inline-flex">Sản phẩm nổi bật</span>
              <h2 className="section-title">Dòng Xe Nổi Bật</h2>
              <p className="section-sub">Lựa chọn mẫu xe xanh phù hợp nhất với phong cách của bạn</p>
            </div>
            <Link to="/cars" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-[380px] rounded-2xl skeleton" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCars.slice(0,3).map((car, idx) => {
                const img = car.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                return (
                  <motion.div key={car._id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl border border-[#E8EAF0] shadow-sm hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-2 overflow-hidden transition-all duration-300 group card-glow"
                  >
                    <div className="relative h-52 bg-[#EAECF3] overflow-hidden">
                      <img src={img} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                      {car.isNewest && (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">MỚI</span>
                      )}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {car.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <h3 className="text-lg font-black text-[#1A1D23]">{car.name}</h3>

                      <div className="grid grid-cols-3 gap-0 border border-[#E8EAF0] rounded-xl overflow-hidden">
                        {[
                          { val: `${car.seats} chỗ`, lbl: 'Ghế ngồi' },
                          { val: `${car.range} km`, lbl: 'Quãng đường' },
                          { val: `${car.power || 43} hp`, lbl: 'Công suất' },
                        ].map((s, i) => (
                          <div key={i} className={`text-center py-3 ${i > 0 ? 'border-l border-[#E8EAF0]' : ''} bg-[#F5F6FA]`}>
                            <p className="text-sm font-bold text-[#1A1D23]">{s.val}</p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{s.lbl}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[10px] text-[#9CA3AF] uppercase font-medium">Giá chỉ từ</p>
                          <p className="text-lg font-black text-blue-600">{vnd(car.price)}</p>
                        </div>
                        <Link to={`/cars/${car.slug}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/30 transition-all hover:shadow-md hover:shadow-blue-500/40">
                          Đặt ngay →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══ INSTALLMENT CALC ═══ */}
      <section className="py-24 bg-white border-t border-[#E8EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-7">
              <div>
                <span className="section-badge mb-4 inline-flex"><Calculator className="w-3.5 h-3.5" /> Tài chính</span>
                <h2 className="section-title">Mua Xe Trả Góp<br />Dễ Dàng</h2>
                <p className="section-sub">Hợp tác với BIDV, VietinBank, Techcombank — gói vay lãi suất cố định thấp nhất.</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[{l:'VF 3 — 322 tr', v:322000000},{l:'VF 5 — 468 tr', v:468000000},{l:'VF 8 — 1.09 tỷ', v:1090000000}].map(({l,v}) => (
                  <button key={v} onClick={() => setCarPrice(v)}
                    className={`px-4 py-2.5 text-sm rounded-xl font-semibold border transition-all ${carPrice===v ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-white text-[#3D4356] border-[#DDE0EA] hover:border-blue-300 hover:text-blue-600'}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="space-y-5 bg-[#F5F6FA] rounded-2xl p-5 border border-[#E8EAF0]">
                <div>
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-[#5A6278] font-medium">Trả trước ({prepaidPercent}%)</span>
                    <span className="font-bold text-[#1A1D23]">{vnd(prepaidAmount)}</span>
                  </div>
                  <input type="range" min="20" max="80" step="10" value={prepaidPercent}
                    onChange={e => setPrepaidPercent(+e.target.value)}
                    className="w-full h-2 bg-[#DDE0EA] rounded-full appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-[#5A6278] font-medium">Thời hạn ({loanMonths} tháng)</span>
                    <span className="font-bold text-[#1A1D23]">{Math.round(loanMonths/12)} năm</span>
                  </div>
                  <input type="range" min="12" max="96" step="12" value={loanMonths}
                    onChange={e => setLoanMonths(+e.target.value)}
                    className="w-full h-2 bg-[#DDE0EA] rounded-full appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
            </div>

            {/* Result card */}
            <div className="bg-white rounded-3xl border border-[#E8EAF0] shadow-xl shadow-slate-200/50 p-8 space-y-6">
              <h3 className="font-bold text-[#1A1D23] text-base">Ước tính thanh toán</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F5F6FA] rounded-2xl p-4 border border-[#E8EAF0]">
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">Trả trước</p>
                  <p className="text-sm font-black text-[#1A1D23] mt-1">{vnd(prepaidAmount)}</p>
                </div>
                <div className="bg-[#F5F6FA] rounded-2xl p-4 border border-[#E8EAF0]">
                  <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">Cần vay</p>
                  <p className="text-sm font-black text-[#1A1D23] mt-1">{vnd(loanAmount)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-7 text-center text-white shadow-lg shadow-blue-500/30">
                <p className="text-xs font-bold opacity-75 uppercase tracking-widest">Trả góp hàng tháng</p>
                <p className="text-4xl font-black mt-2 leading-none">{vnd(monthlyPayment)}</p>
                <p className="text-xs opacity-50 mt-3">* Lãi suất ưu đãi 8%/năm</p>
              </div>

              <Link to="/installment" className="btn-outline w-full py-3 text-sm">
                Xem chi tiết lịch trả góp <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 bg-[#F5F6FA] border-t border-[#E8EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge mb-4 inline-flex">Đánh giá</span>
            <h2 className="section-title">Khách Hàng Nói Gì?</h2>
            <p className="section-sub max-w-xl mx-auto">Hàng vạn khách hàng đã tin tưởng VinFast trên hành trình xanh</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-[#E8EAF0] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#5A6278] leading-relaxed italic mb-5">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E8EAF0]">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                  <div>
                    <p className="text-sm font-bold text-[#1A1D23]">{t.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient-blue" />
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">Sẵn sàng lái thử<br />miễn phí hôm nay?</h2>
          <p className="text-blue-100 text-lg">Đăng ký tại showroom VinFast gần nhất — không ràng buộc, không phí.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/cars" className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2">
              Xem Dòng Xe <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/rental" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 backdrop-blur-sm transition-colors">
              Thuê Xe Tự Lái
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
