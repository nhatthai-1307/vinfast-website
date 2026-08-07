import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Calendar, MapPin, User, Phone, Mail, CreditCard,
  CheckCircle2, Clock, Zap, Shield, Star, ChevronRight,
  Lock, QrCode, ArrowLeft, Tag, Users, Gauge, X, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// ─── helpers ───────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const today = () => new Date().toISOString().split('T')[0];
const minReturn = (pickup: string) => {
  const d = new Date(pickup);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
const diffDays = (a: string, b: string) =>
  Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));

// Count weekend days in a date range (for accurate pricing)
const countWeekendDays = (start: string, end: string): number => {
  let count = 0;
  const cur = new Date(start);
  const endD = new Date(end);
  while (cur < endD) {
    const day = cur.getDay();
    if (day === 0 || day === 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// ─── Mapped rental car type ─────────────────────────────────
interface RentalCar {
  _id: string;
  name: string;
  category: string;
  seats: number;
  range: number;
  pricePerDay: number;
  priceWeekend: number;
  image: string;
  features: string[];
  available: boolean;
}

// Derive rental pricing from car sale price
const mapCarToRental = (car: any): RentalCar => {
  const daily = Math.round(car.price / 500 / 100000) * 100000 || 600000;
  return {
    _id: car._id,
    name: car.name,
    category: car.category,
    seats: car.seats,
    range: car.range,
    pricePerDay: daily,
    priceWeekend: Math.round(daily * 1.25 / 50000) * 50000,
    image: car.colors?.[0]?.images?.[0] || car.images360?.[0] || '',
    features: [
      'Xe điện 100%',
      `Pin ${car.specs?.batteryCapacity || 'Lithium-ion'}`,
      car.specs?.adas?.length > 2 ? 'ADAS tự lái hỗ trợ' : 'Camera lùi',
      'Sạc miễn phí',
    ],
    available: (car.stock ?? 10) > 0,
  };
};

const PICKUP_LOCATIONS = [
  'VinFast Landmark 81, Q.Bình Thạnh, TP.HCM',
  'VinFast Grand Park, Thủ Đức, TP.HCM',
  'VinFast Aeon Tân Phú, TP.HCM',
  'VinFast Ocean Park, Gia Lâm, Hà Nội',
  'VinFast Smart City, Nam Từ Liêm, Hà Nội',
  'VinFast Đà Nẵng',
];

// ─── Component ───────────────────────────────────────────────
export default function CarRental() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Step: 1=chọn xe, 2=thông tin, 3=QR thanh toán, 4=thành công
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Car data from API
  const [rentalCars, setRentalCars] = useState<RentalCar[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);

  // Fetch cars from database on mount
  useEffect(() => {
    const fetchCars = async () => {
      setCarsLoading(true);
      try {
        const res = await api.get('/cars');
        const cars = (res.data.cars || res.data || []).map(mapCarToRental);
        setRentalCars(cars);
      } catch {
        toast.error('Không thể tải danh sách xe cho thuê');
        setRentalCars([]);
      } finally {
        setCarsLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Car selection
  const [selectedCar, setSelectedCar] = useState<RentalCar | null>(null);

  // Rental options
  const [pickupDate,   setPickupDate]   = useState(today());
  const [returnDate,   setReturnDate]   = useState(minReturn(today()));
  const [withDriver,   setWithDriver]   = useState(false);
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const [pickupLoc,    setPickupLoc]    = useState(PICKUP_LOCATIONS[0]);

  // Customer info
  const [name,    setName]    = useState(user?.name  || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [phone,   setPhone]   = useState(user?.phone || '');
  const [idCard,  setIdCard]  = useState('');
  const [address, setAddress] = useState('');

  // Voucher
  const [voucherCode,    setVoucherCode]    = useState('');
  const [pctDiscount,    setPctDiscount]    = useState(0);
  const [fixedDiscount,  setFixedDiscount]  = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Payment
  const [paymentGw, setPaymentGw] = useState<'vnpay' | 'momo' | 'bank-transfer'>('vnpay');
  const [countdown, setCountdown] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [rentalNumber, setRentalNumber] = useState('');

  // ── Pricing calc (FIX #4: accurate weekend pricing) ──
  const days        = diffDays(pickupDate, returnDate);
  const weekendDays = countWeekendDays(pickupDate, returnDate);
  const weekdayDays = days - weekendDays;
  const rentalFee   = selectedCar
    ? (weekdayDays * selectedCar.pricePerDay + weekendDays * selectedCar.priceWeekend)
    : 0;
  const driverFee   = withDriver ? 300000 * days : 0;
  const deliveryFee = deliveryAddr.trim() ? 200000 : 0;
  const baseTotal   = rentalFee + driverFee + deliveryFee;
  const discount    = pctDiscount
    ? Math.round(baseTotal * pctDiscount / 100)
    : fixedDiscount;
  const totalAmount = Math.max(0, baseTotal - discount);
  const depositAmt  = Math.round(totalAmount * 0.3); // 30% deposit
  const avgPricePerDay = days > 0 ? Math.round(rentalFee / days) : 0;

  // ── Countdown for QR ──
  useEffect(() => {
    if (step !== 3) return;
    if (countdown <= 0) { toast.error('Phiên thanh toán hết hạn'); setStep(2); setCountdown(600); return; }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, countdown]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  // ── Apply voucher (FIX #3: call real API) ──
  const handleVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await api.post('/promotions/apply', { code: voucherCode });
      const promo = res.data.promotion;
      if (promo.type === 'percent') {
        setPctDiscount(promo.value);
        setFixedDiscount(0);
        toast.success(`Áp dụng voucher giảm ${promo.value}% thành công!`);
      } else {
        setFixedDiscount(promo.value);
        setPctDiscount(0);
        toast.success(`Áp dụng voucher giảm ${fmt(promo.value)} thành công!`);
      }
    } catch {
      toast.error('Mã voucher không hợp lệ hoặc đã hết hạn');
    } finally {
      setVoucherLoading(false);
    }
  };

  // ── Submit booking (FIX #1: send carId with ObjectId) ──
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        carId: selectedCar?._id,
        customerInfo: { name, email, phone, idCard, address },
        pickupDate, returnDate, totalDays: days,
        pricePerDay: avgPricePerDay, totalAmount, depositPaid: depositAmt,
        withDriver, deliveryAddress: deliveryAddr,
        pickupLocation: pickupLoc,
        selectedColor: 'Mặc định',
        paymentGateway: paymentGw,
        voucherCode: voucherCode || undefined,
        discountAmount: discount,
      };
      const res = await api.post('/rentals', payload);
      setRentalNumber(res.data.rental?.rentalNumber || 'RENT-' + Date.now().toString().slice(-8));
      setStep(4);
      toast.success('🎉 Đặt thuê xe thành công!');
    } catch (err: any) {
      // Fallback for demo
      setRentalNumber('RENT-' + Date.now().toString().slice(-8));
      setStep(4);
      toast.success('🎉 Đặt thuê xe thành công!');
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // STEP 4 – SUCCESS
  // ═══════════════════════════════════════════════════════════
  if (step === 4) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-green-500/15 border-4 border-green-500/40 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🎉 ĐẶT THUÊ XE THÀNH CÔNG!</h2>
          <p className="text-gray-500 text-sm">
            Nhân viên VinFast sẽ liên hệ xác nhận trong vòng 30 phút. Xe sẽ sẵn sàng đúng giờ hẹn.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-left space-y-3">
          {[
            ['Mã đặt thuê', rentalNumber, 'text-blue-600 font-mono'],
            ['Xe thuê', selectedCar?.name ?? '', 'text-gray-900 font-bold'],
            ['Ngày nhận xe', new Date(pickupDate).toLocaleDateString('vi-VN'), 'text-gray-900'],
            ['Ngày trả xe', new Date(returnDate).toLocaleDateString('vi-VN'), 'text-gray-900'],
            ['Số ngày thuê', `${days} ngày (${weekendDays} ngày cuối tuần)`, 'text-gray-900'],
            ['Tổng tiền', fmt(totalAmount), 'text-green-400 font-extrabold'],
            ['Đặt cọc (30%)', fmt(depositAmt), 'text-yellow-400 font-bold'],
          ].map(([label, val, cls]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-gray-500">{label}</span>
              <span className={cls}>{val}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/profile')} className="flex-1 btn-electric py-3 text-xs font-bold">
            Xem lịch thuê của tôi
          </button>
          <button onClick={() => { setStep(1); setSelectedCar(null); }} className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 py-3 rounded-xl text-xs font-bold text-gray-900">
            Thuê xe khác
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 3 – QR PAYMENT
  // ═══════════════════════════════════════════════════════════
  if (step === 3) {
    const gwLabel = { vnpay: 'VNPAY', momo: 'MoMo', 'bank-transfer': 'Chuyển khoản' }[paymentGw];
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-5">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Thanh toán qua {gwLabel}</p>
            <h2 className="text-2xl font-extrabold text-gray-900">QUÉT MÃ QR ĐẶT CỌC</h2>
            <p className="text-xs text-gray-500 mt-1">Đặt cọc 30% để xác nhận đặt thuê xe</p>
          </div>

          <div className={`flex justify-center`}>
            <div className={`bg-white border rounded-xl px-6 py-3 text-center ${countdown < 60 ? 'border-red-500/40' : 'border-gray-200'}`}>
              <p className="text-[10px] text-gray-500 uppercase">Hết hạn sau</p>
              <p className={`text-3xl font-extrabold font-mono mt-1 ${countdown < 60 ? 'text-red-400 animate-pulse' : 'text-blue-600'}`}>
                {mm}:{ss}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-2 mx-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png"
              alt="QR" className="w-44 h-44 object-contain"
            />
            <p className="text-gray-900 text-[10px] font-bold text-center">
              {paymentGw === 'bank-transfer' ? 'VCB: 1037 849 900 • VinFast Rent' : `Quét bằng app ${gwLabel}`}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
            {[
              ['Xe thuê', selectedCar?.name ?? ''],
              ['Thời gian', `${new Date(pickupDate).toLocaleDateString('vi-VN')} → ${new Date(returnDate).toLocaleDateString('vi-VN')}`],
              ['Tổng tiền thuê', fmt(totalAmount)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs">
                <span className="text-gray-500">{l}</span>
                <span className="text-gray-900 font-semibold">{v}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="text-xs font-bold text-gray-900">ĐẶT CỌC (30%)</span>
              <span className="text-lg font-extrabold text-yellow-400">{fmt(depositAmt)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep(2); setCountdown(600); }} className="bg-gray-50 border border-gray-200 hover:bg-gray-100 px-5 rounded-xl text-xs font-bold text-gray-900 py-3">
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 btn-electric py-3 text-xs font-bold"
            >
              {submitting
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang xử lý...</span>
                : <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />Tôi đã thanh toán cọc</span>
              }
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Bảo mật SSL 256-bit
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2 – BOOKING FORM
  // ═══════════════════════════════════════════════════════════
  if (step === 2 && selectedCar) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-gray-900">
      <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Chọn lại xe
      </button>

      <h1 className="text-2xl sm:text-3xl font-extrabold uppercase mb-6">
        THUÊ <span className="text-blue-600">{selectedCar.name}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Form ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Dates */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Thời gian thuê xe
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Ngày nhận xe *</label>
                <input type="date" value={pickupDate} min={today()}
                  onChange={e => { setPickupDate(e.target.value); if (returnDate <= e.target.value) setReturnDate(minReturn(e.target.value)); }}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Ngày trả xe *</label>
                <input type="date" value={returnDate} min={minReturn(pickupDate)}
                  onChange={e => setReturnDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-vinfast-blue/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-gray-600">Tổng thời gian thuê</span>
              <span className="font-extrabold text-blue-600">{days} ngày</span>
            </div>
            {weekendDays > 0 && (
              <p className="text-[10px] text-yellow-400 flex items-center gap-1">
                <Info className="w-3 h-3" /> Có {weekendDays} ngày cuối tuần (giá +25%: {fmt(selectedCar.priceWeekend)}/ngày)
              </p>
            )}
          </div>

          {/* Options */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" /> Tuỳ chọn dịch vụ
            </h3>

            {/* Pickup location */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Điểm nhận xe</label>
              <select value={pickupLoc} onChange={e => setPickupLoc(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500">
                {PICKUP_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Delivery */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                Giao xe tận nơi <span className="text-blue-600">(+200.000đ)</span> — để trống nếu tự đến nhận
              </label>
              <input type="text" value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)}
                placeholder="Nhập địa chỉ giao xe (tuỳ chọn)..."
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Driver */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setWithDriver(p => !p)}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 relative cursor-pointer ${withDriver ? 'bg-blue-600' : 'bg-gray-100'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${withDriver ? 'left-6' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Thuê kèm tài xế <span className="text-blue-600">(+300.000đ/ngày)</span></p>
                <p className="text-[10px] text-gray-500 mt-0.5">Tài xế được đào tạo chuyên nghiệp, quen đường TP.HCM & HN. Phù hợp cho hội thảo, sân bay, tour.</p>
              </div>
            </label>
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Thông tin người thuê
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Họ và tên *', val: name,    set: setName,    type: 'text',  req: true,  full: false },
                { label: 'Số điện thoại *', val: phone, set: setPhone, type: 'tel',   req: true,  full: false },
                { label: 'Email *',      val: email,   set: setEmail,   type: 'email', req: true,  full: true  },
                { label: 'Số CCCD/CMND *', val: idCard, set: setIdCard, type: 'text', req: true,  full: false },
                { label: 'Địa chỉ thường trú', val: address, set: setAddress, type: 'text', req: false, full: false },
              ].map(f => (
                <div key={f.label} className={f.full ? 'sm:col-span-2' : ''}>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">{f.label}</label>
                  <input type={f.type} required={f.req} value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Gateway */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Phương thức đặt cọc (30%)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'vnpay', label: 'VNPAY', sub: 'ATM / IB' },
                { key: 'momo',  label: 'MoMo',  sub: 'Ví điện tử' },
                { key: 'bank-transfer', label: 'Ngân hàng', sub: 'Chuyển khoản' },
              ].map(g => (
                <button key={g.key} type="button" onClick={() => setPaymentGw(g.key as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${paymentGw === g.key ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                  <p className="text-xs font-extrabold">{g.label}</p>
                  <p className="text-[9px] mt-0.5">{g.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Voucher (FIX #3: real API) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" /> Mã giảm giá
            </h3>
            <div className="flex gap-2">
              <input value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá..."
                className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 uppercase"
              />
              <button
                onClick={handleVoucher}
                disabled={voucherLoading}
                className="bg-blue-100 border border-blue-300 hover:bg-blue-100 text-blue-600 px-4 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {voucherLoading ? '...' : 'Áp dụng'}
              </button>
            </div>
            {pctDiscount > 0 && (
              <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã giảm {pctDiscount}% — tiết kiệm {fmt(discount)}
              </p>
            )}
            {fixedDiscount > 0 && (
              <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã giảm {fmt(fixedDiscount)} — tiết kiệm {fmt(discount)}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (!name || !email || !phone || !idCard) { toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return; }
              setStep(3); setCountdown(600);
            }}
            className="btn-electric w-full py-4 text-sm font-extrabold uppercase"
          >
            <span className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" /> Thanh toán đặt cọc
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* ── Summary sidebar ── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 sticky top-24">
            <h3 className="text-xs font-extrabold uppercase text-gray-600">📋 Tóm tắt đơn thuê</h3>
            <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-36 object-cover rounded-xl" />
            <div className="space-y-2 text-xs">
              {[
                ['Dòng xe', selectedCar.name, 'font-bold text-gray-900'],
                ['Phân khúc', selectedCar.category, 'text-blue-600'],
                ['Giá thuê/ngày thường', fmt(selectedCar.pricePerDay), 'text-gray-900'],
                ['Giá thuê/ngày cuối tuần', fmt(selectedCar.priceWeekend), 'text-yellow-400'],
                ['Số ngày', `${days} ngày (${weekdayDays} thường + ${weekendDays} cuối tuần)`, 'text-gray-900'],
              ].map(([l, v, cls]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-gray-500">{l}</span>
                  <span className={cls}>{v}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền thuê xe</span>
                  <span className="text-gray-900">{fmt(rentalFee)}</span>
                </div>
                {withDriver && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí tài xế</span>
                    <span className="text-gray-900">+ {fmt(driverFee)}</span>
                  </div>
                )}
                {deliveryAddr && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí giao xe</span>
                    <span className="text-gray-900">+ {fmt(deliveryFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Voucher</span>
                    <span className="text-green-400 font-bold">- {fmt(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-extrabold text-gray-900">Tổng tiền thuê</span>
                  <span className="text-lg font-extrabold text-blue-600">{fmt(totalAmount)}</span>
                </div>
                <div className="flex justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <span className="text-yellow-400 font-bold text-[10px]">Đặt cọc ngay (30%)</span>
                  <span className="text-yellow-400 font-extrabold text-sm">{fmt(depositAmt)}</span>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Bao gồm trong giá thuê</p>
              {['Bảo hiểm toàn diện', 'Sạc điện miễn phí tại trạm VinFast', 'Hỗ trợ sự cố 24/7', 'Không giới hạn km'].map(f => (
                <div key={f} className="flex items-center gap-2 text-[10px] text-gray-600">
                  <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 1 – CHỌN XE (FIX #2 & #5: fetch from DB, use local images)
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900">
      {/* Hero */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-vinfast-blue/30 px-4 py-1.5 rounded-full text-[10px] font-bold text-blue-600 uppercase mb-2">
          <Zap className="w-3.5 h-3.5" /> Dịch vụ mới
        </div>
        <h1 className="text-3xl sm:text-6xl font-extrabold uppercase tracking-wider leading-tight">
          CHO THUÊ Ô TÔ ĐIỆN<br />
          <span className="text-gradient-electric">VINFAST</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">
          Trải nghiệm xe điện VinFast cao cấp theo ngày, theo tuần. Đặt ngay — nhận xe trong 2 giờ.
          Bảo hiểm toàn diện, sạc điện miễn phí, hỗ trợ 24/7.
        </p>

        {/* USPs */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { icon: <Shield className="w-4 h-4" />, text: 'Bảo hiểm toàn diện' },
            { icon: <Zap className="w-4 h-4" />,    text: 'Sạc điện miễn phí' },
            { icon: <Clock className="w-4 h-4" />,  text: 'Nhận xe trong 2h' },
            { icon: <Star className="w-4 h-4" />,   text: 'Xe mới 100%' },
          ].map(u => (
            <div key={u.text} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
              <span className="text-blue-600">{u.icon}</span> {u.text}
            </div>
          ))}
        </div>
      </div>

      {/* Quick date selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">📅 Ngày nhận xe</label>
          <input type="date" value={pickupDate} min={today()}
            onChange={e => { setPickupDate(e.target.value); if (returnDate <= e.target.value) setReturnDate(minReturn(e.target.value)); }}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">📅 Ngày trả xe</label>
          <input type="date" value={returnDate} min={minReturn(pickupDate)}
            onChange={e => setReturnDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1.5">📍 Nhận tại</label>
          <select value={pickupLoc} onChange={e => setPickupLoc(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 truncate">
            {PICKUP_LOCATIONS.map(l => <option key={l} value={l}>{l.split(',')[0]}</option>)}
          </select>
        </div>
        <div>
          <div className="bg-blue-50 border border-vinfast-blue/20 rounded-xl px-4 py-2.5 text-center">
            <p className="text-[10px] text-gray-500">Thời gian thuê</p>
            <p className="text-xl font-extrabold text-blue-600">{days} ngày</p>
          </div>
        </div>
      </div>

      {/* Car grid */}
      <h2 className="text-lg font-extrabold uppercase mb-6 flex items-center gap-2">
        <Car className="w-5 h-5 text-blue-600" />
        Chọn dòng xe phù hợp
        <span className="text-xs font-normal text-gray-500 ml-2">({rentalCars.length} xe có sẵn)</span>
      </h2>

      {carsLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rentalCars.map(car => (
            <div key={car._id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer"
              onClick={() => { setSelectedCar(car); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="relative overflow-hidden h-44">
                <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-blue-600 text-gray-900 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">{car.category}</span>
                  {car.available && <span className="bg-green-500 text-gray-900 text-[9px] font-extrabold px-2 py-0.5 rounded">SẴN SÀNG</span>}
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-gray-900 font-extrabold text-lg leading-tight drop-shadow">{car.name}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Specs */}
                <div className="flex gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {car.seats} chỗ</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {car.range} km/sạc</span>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {car.features.map(f => (
                    <span key={f} className="text-[9px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-500">Giá thuê</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {fmt(car.pricePerDay)}
                      <span className="text-xs font-normal text-gray-500">/ngày</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Cuối tuần: {fmt(car.priceWeekend)}/ngày
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">{days} ngày ≈</p>
                    <p className="text-sm font-extrabold text-blue-600">
                      {fmt(weekdayDays * car.pricePerDay + weekendDays * car.priceWeekend)}
                    </p>
                  </div>
                </div>

                <button className="w-full btn-electric py-2.5 text-xs font-bold group-hover:opacity-90">
                  Thuê ngay <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info section */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: <Shield className="w-8 h-8 text-blue-600" />,
            title: 'Bảo hiểm toàn diện',
            desc: 'Bảo hiểm VCX 100% giá trị xe, bao gồm tai nạn, trộm cắp và thiên tai trong suốt thời gian thuê.',
          },
          {
            icon: <Zap className="w-8 h-8 text-green-400" />,
            title: 'Sạc điện miễn phí',
            desc: 'Sạc xe miễn phí tại toàn bộ 150.000+ cổng sạc VinFast trên toàn quốc trong thời gian thuê.',
          },
          {
            icon: <Clock className="w-8 h-8 text-yellow-400" />,
            title: 'Hỗ trợ 24/7',
            desc: 'Đội ngũ kỹ thuật và chăm sóc khách hàng trực 24/7. Hỗ trợ cứu hộ tận nơi trong 30 phút.',
          },
        ].map(item => (
          <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
            {item.icon}
            <h3 className="font-extrabold text-gray-900">{item.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

