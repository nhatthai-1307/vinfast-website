import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, MapPin, Phone, Mail, Zap, ArrowRight } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top CTA Banner */}
        <div className="bg-blue-600 rounded-2xl p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Sẵn sàng trải nghiệm xe điện VinFast?</h3>
            <p className="text-blue-100 mt-1 text-sm">Đặt lịch lái thử miễn phí hoặc cấu hình xe ngay hôm nay.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              to="/cars"
              className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Xem dòng xe <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/rental"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm border border-blue-400"
            >
              Thuê xe ngay
            </Link>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="leading-none">
                <div className="text-lg font-extrabold text-white tracking-tight">VINFAST</div>
                <div className="text-[10px] text-blue-400 font-semibold tracking-widest">ELECTRIC AUTO</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Thương hiệu ô tô điện thông minh toàn cầu của Việt Nam. Tiên phong thúc đẩy cuộc cách mạng di chuyển xanh toàn cầu vì một tương lai bền vững.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Dòng xe */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Dòng xe</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'VinFast VF 3 — Mini EV', path: '/cars/vf-3' },
                { name: 'VinFast VF 5 Plus — A-SUV', path: '/cars/vf-5' },
                { name: 'VinFast VF 6 — B-SUV', path: '/cars/vf-6' },
                { name: 'VinFast VF 7 — C-SUV', path: '/cars/vf-7' },
                { name: 'VinFast VF 8 — D-SUV', path: '/cars/vf-8' },
                { name: 'VinFast VF 9 — E-SUV', path: '/cars/vf-9' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dịch vụ */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Dịch vụ</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Tính trả góp linh hoạt', path: '/installment' },
                { name: 'So sánh xe chi tiết', path: '/compare' },
                { name: 'Showroom & Trạm sạc', path: '/showrooms' },
                { name: 'Đăng ký lái thử', path: '/cars' },
                { name: 'Cho thuê xe tự lái', path: '/rental' },
                { name: 'Theo dõi đơn hàng', path: '/profile' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Khu Đô Thị Sinh Thái Vinhomes Ocean Park, Gia Lâm, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">Hotline: <a href="tel:19002323" className="text-white hover:text-blue-400 transition-colors">1900 23 23 89</a></span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:support@vinfastauto.com" className="text-gray-400 hover:text-blue-400 transition-colors">support@vinfastauto.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {year} VinFast Auto. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Chính sách thuê pin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
