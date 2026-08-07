import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCompareStore } from '../store/useCompareStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { BarChart3, Zap, Calendar, Heart, Share2, Shield, Battery, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function CarDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeColor, setActiveColor] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // 360 Spin Viewer state
  const [spinIndex, setSpinIndex] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);

  // Test Drive Modal state
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [testDriveName, setTestDriveName] = useState('');
  const [testDriveEmail, setTestDriveEmail] = useState('');
  const [testDrivePhone, setTestDrivePhone] = useState('');
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveSlot, setTestDriveSlot] = useState('08:00 - 10:00');
  const [testDriveShowroom, setTestDriveShowroom] = useState('VinFast Showroom Ocean Park, Hà Nội');

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  
  // Zustand hook actions
  const { user } = useAuthStore();
  const addCarToCompare = useCompareStore((state) => state.addCar);
  const setBookingCar = useCartStore((state) => state.setBookingCar);

  useEffect(() => {
    const fetchCarAndReviews = async () => {
      setLoading(true);
      try {
        const carRes = await api.get(`/cars/${slug}`);
        const carData = carRes.data.car;
        setCar(carData);
        if (carData.colors && carData.colors.length > 0) {
          setActiveColor(carData.colors[0]);
          setSelectedImage(carData.colors[0].images[0]);
        }
        
        // Fetch reviews
        const reviewsRes = await api.get(`/reviews/${carData._id}`);
        setReviews(reviewsRes.data.reviews);
      } catch (err) {
        console.error('Error fetching car details:', err);
        toast.error('Không tìm thấy dòng xe này');
      } finally {
        setLoading(false);
      }
    };
    fetchCarAndReviews();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy xe</h2>
        <Link to="/cars" className="btn-electric">Quay về danh sách xe</Link>
      </div>
    );
  }

  // 360 viewer mouse actions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !car.images360 || car.images360.length === 0) return;
    const diff = e.clientX - startX.current;
    
    // Rotate every 15 pixels dragged
    if (Math.abs(diff) > 15) {
      const step = diff > 0 ? 1 : -1;
      let nextIndex = spinIndex + step;
      if (nextIndex < 0) nextIndex = car.images360.length - 1;
      if (nextIndex >= car.images360.length) nextIndex = 0;
      
      setSpinIndex(nextIndex);
      startX.current = e.clientX;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Compare activation
  const handleAddToCompare = () => {
    const success = addCarToCompare(car);
    if (success) {
      toast.success(`Đã thêm ${car.name} vào danh sách so sánh`);
    } else {
      toast.warning('Danh sách so sánh đầy (Tối đa 3 xe). Hãy dọn bớt xe cũ.');
    }
  };

  // Deposit checkout activation
  const handleBookNow = () => {
    setBookingCar(car);
    navigate('/booking');
  };

  // Test Drive schedule request
  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDriveName || !testDrivePhone || !testDriveDate || !testDriveEmail) {
      toast.error('Vui lòng điền đầy đủ các thông tin đăng ký');
      return;
    }

    try {
      const res = await api.post('/test-drives', {
        customerInfo: {
          name: testDriveName,
          email: testDriveEmail,
          phone: testDrivePhone,
        },
        carId: car._id,
        date: testDriveDate,
        timeSlot: testDriveSlot,
        showroom: testDriveShowroom,
      });

      if (res.data.success) {
        toast.success(`Đăng ký lái thử thành công! Email hẹn đã được gửi.`);
        setShowTestDriveModal(false);
        // Clear inputs
        setTestDriveName('');
        setTestDriveEmail('');
        setTestDrivePhone('');
        setTestDriveDate('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    }
  };

  // Review submission request
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Vui lòng viết bình luận đánh giá');
      return;
    }

    try {
      const res = await api.post('/reviews', {
        carId: car._id,
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        toast.success('Đã gửi đánh giá thành công! Cảm ơn bạn.');
        setReviews([res.data.review, ...reviews]);
        setNewComment('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng đánh giá thất bại');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-6 flex gap-2">
          <Link to="/" className="hover:underline">Trang chủ</Link> / 
          <Link to="/cars" className="hover:underline">Dòng xe</Link> / 
          <span className="text-gray-900">{car.name}</span>
        </div>

        {/* Hero Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column: Premium Interactive Spin/Gallery */}
          <div className="space-y-6">
            {/* Visualizer Block */}
            <div className="relative bg-white border border-gray-100 rounded-3xl overflow-hidden h-[420px] flex items-center justify-center shadow-md">
              {is360Mode && car.images360 && car.images360.length > 0 ? (
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="w-full h-full flex flex-col items-center justify-center p-4 cursor-grab select-none active:cursor-grabbing"
                >
                  <img
                    src={car.images360[spinIndex]}
                    alt={`${car.name} rotation ${spinIndex}`}
                    className="max-h-[300px] object-contain pointer-events-none"
                  />
                  <div className="absolute bottom-6 flex flex-col items-center space-y-2">
                    <span className="text-[10px] text-blue-600 font-bold tracking-widest bg-blue-50 px-3 py-1 rounded-full uppercase">
                      Xoay 360 độ (Kéo chuột trái để xoay)
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={car.images360.length - 1}
                      value={spinIndex}
                      onChange={(e) => setSpinIndex(Number(e.target.value))}
                      className="w-48 h-1 accent-blue-600 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={selectedImage}
                    alt={car.name}
                    className="max-h-[300px] object-contain animate-fadeIn"
                  />
                </div>
              )}

              {/* Mode Toggler */}
              {car.images360 && car.images360.length > 0 && (
                <button
                  onClick={() => setIs360Mode(!is360Mode)}
                  className="absolute top-4 right-4 bg-gray-50 border border-gray-200 hover:border-blue-300 text-xs px-3 py-1.5 rounded-full font-bold transition-all text-gray-900 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  {is360Mode ? 'Xem ảnh thường' : 'Xem xoay 360°'}
                </button>
              )}
            </div>

            {/* Thumbnail color selector */}
            {!is360Mode && activeColor && (
              <div className="flex gap-3 justify-center">
                {activeColor.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border transition-all ${
                      selectedImage === img ? 'border-blue-500 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Purchase options */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Phân khúc {car.category} SUV
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-3">{car.name}</h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{car.description}</p>
            </div>

            {/* Pricing Card */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 shadow-md">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Giá xe niêm yết</p>
                  <p className="text-3xl font-black text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.price)}
                  </p>
                </div>
                {car.batteryRentPrice > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase">Thuê pin hàng tháng</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.batteryRentPrice)} / tháng
                    </p>
                  </div>
                )}
              </div>

              {/* Warranty policies */}
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4 text-xs text-gray-600">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Bảo hành chính hãng <strong>10 năm</strong> hoặc <strong>200.000 km</strong> tùy điều kiện nào đến trước.</span>
              </div>
            </div>

            {/* Color selection buttons */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase block">Chọn màu ngoại thất</label>
              <div className="flex gap-4">
                {car.colors.map((color: any) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setActiveColor(color);
                      setSelectedImage(color.images[0]);
                      setIs360Mode(false);
                    }}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      activeColor?.name === color.name 
                        ? 'border-blue-500 scale-110 shadow-sm' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.code === '#FFFFFF' ? '#F9FAFB' : color.code }}
                  >
                    {activeColor?.name === color.name && (
                      <span className={`w-2 h-2 rounded-full ${color.code === '#FFFFFF' ? 'bg-black' : 'bg-white'}`}></span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 italic">Màu sắc đang chọn: <strong>{activeColor?.name}</strong></p>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
              <button onClick={handleBookNow} className="btn-electric flex-1 py-4 text-sm font-bold uppercase tracking-wider">
                Đặt cọc online (Từ 10tr)
              </button>
              
              <button
                onClick={() => setShowTestDriveModal(true)}
                className="btn-outline border-gray-200 hover:border-blue-500 hover:bg-gray-50 text-gray-900 flex-1 py-4 text-sm font-bold uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4 text-blue-600" /> Đăng ký lái thử
              </button>
            </div>

            {/* Compare and share buttons */}
            <div className="flex gap-4 text-xs text-gray-600">
              <button
                onClick={handleAddToCompare}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" /> So sánh thông số xe
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Heart className="w-4 h-4" /> Lưu yêu thích
              </button>
            </div>
          </div>
        </div>

        {/* Technical Specs Tab */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">THÔNG SỐ KỸ THUẬT CHI TIẾT</h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Động cơ (Engine)</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.engine || 'Động cơ điện'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Loại pin</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.batteryType || 'LFP'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Dung lượng pin</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.batteryCapacity || '37.23 kWh'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Quãng đường di chuyển (Range)</th>
                  <td className="px-6 py-4 text-gray-900 font-bold text-blue-600">{car.range} km (sau một lần sạc đầy)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Công suất cực đại</th>
                  <td className="px-6 py-4 text-gray-900">{car.power || 43} hp (mã lực)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Mô-men xoắn</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.torque || '135 Nm'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Thời gian sạc nhanh</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.chargingTime || '30 phút (10-70%)'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Kích thước DxRxC</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.dimensions || 'Thông số đang cập nhật'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Số chỗ ngồi</th>
                  <td className="px-6 py-4 text-gray-900">{car.seats} chỗ</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Số túi khí an toàn</th>
                  <td className="px-6 py-4 text-gray-900">{car.specs.airbags || 1} túi khí</td>
                </tr>
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 w-1/3 bg-gray-50">Hệ thống trợ lái ADAS thông minh</th>
                  <td className="px-6 py-4 text-gray-900 text-xs">
                    <div className="flex flex-wrap gap-2">
                      {car.specs.adas && car.specs.adas.map((feature: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-medium border border-vinfast-blue/20">
                          {feature}
                        </span>
                      )) || 'Cơ bản'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">ĐÁNH GIÁ TỪ CỘNG ĐỒNG SỬ DỤNG ({reviews.length})</h2>
          
          {/* Write a review (Only if logged in) */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm">GỬI ĐÁNH GIÁ CỦA BẠN</h3>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">Đánh giá sao:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-xl focus:outline-none ${newRating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Hãy chia sẻ trải nghiệm thực tế về mức tiêu thụ điện, sạc pin, nội thất hoặc dịch vụ bảo hành của xe..."
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-300 text-xs text-gray-900 p-3 rounded-lg focus:outline-none"
                />
              </div>

              <button type="submit" className="btn-electric py-2.5 px-6 text-xs font-bold">
                Gửi bình luận
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center text-xs text-gray-500">
              Bạn vui lòng <Link to="/login" className="text-blue-600 hover:underline font-bold">đăng nhập</Link> để viết đánh giá cho dòng xe này.
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500">Chưa có đánh giá nào cho dòng xe này. Hãy là người đầu tiên!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={rev.user?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{rev.user?.name || 'Khách hàng ẩn danh'}</p>
                        <p className="text-[9px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-yellow-400 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Test Drive Scheduling Overlay Modal */}
      {showTestDriveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-md overflow-hidden p-6 space-y-6 animate-fadeIn text-gray-900">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-blue-600">ĐĂNG KÝ HẸN LÁI THỬ XE</h3>
              <button onClick={() => setShowTestDriveModal(false)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleTestDriveSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold block uppercase">Họ và tên khách hàng</label>
                <input
                  type="text"
                  required
                  value={testDriveName}
                  onChange={(e) => setTestDriveName(e.target.value)}
                  placeholder="Ví dụ: Trần Văn A"
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={testDrivePhone}
                    onChange={(e) => setTestDrivePhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={testDriveEmail}
                    onChange={(e) => setTestDriveEmail(e.target.value)}
                    placeholder="Ví dụ: user@gmail.com"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Ngày hẹn</label>
                  <input
                    type="date"
                    required
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Khung giờ sạc</label>
                  <select
                    value={testDriveSlot}
                    onChange={(e) => setTestDriveSlot(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="08:00 - 10:00">08:00 - 10:00</option>
                    <option value="10:00 - 12:00">10:00 - 12:00</option>
                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                    <option value="16:00 - 18:00">16:00 - 18:00</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold block uppercase">Showroom tiếp nhận</label>
                <select
                  value={testDriveShowroom}
                  onChange={(e) => setTestDriveShowroom(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                >
                  <option value="VinFast Showroom Ocean Park, Hà Nội">VinFast Showroom Ocean Park, Hà Nội</option>
                  <option value="VinFast Showroom Smart City, Hà Nội">VinFast Showroom Smart City, Hà Nội</option>
                  <option value="VinFast Showroom Landmark 81, TP.HCM">VinFast Showroom Landmark 81, TP.HCM</option>
                  <option value="VinFast Showroom Nguyễn Văn Linh, Đà Nẵng">VinFast Showroom Nguyễn Văn Linh, Đà Nẵng</option>
                </select>
              </div>

              <p className="text-[10px] text-red-400 italic">
                * Quý khách lưu ý mang theo bằng lái xe ô tô (hạng B1 hoặc B2) còn thời hạn khi đến tham gia lái thử.
              </p>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-electric flex-1 py-2.5 text-xs font-bold uppercase">
                  Gửi yêu cầu hẹn
                </button>
                <button
                  type="button"
                  onClick={() => setShowTestDriveModal(false)}
                  className="bg-gray-50 border border-gray-200 hover:bg-gray-100 px-5 rounded-lg text-xs font-bold"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
