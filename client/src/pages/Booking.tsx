import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  ShieldCheck, ArrowLeft, CreditCard, CheckCircle2, QrCode,
  Banknote, Smartphone, Tag, ChevronRight, AlertCircle, Car, Zap,
  Building2, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ── QR placeholder images per gateway
const QR_IMAGES: Record<string, string> = {
  vnpay: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png',
  momo:  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png',
  'bank-transfer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png',
};

const SHOWROOMS = [
  'VinFast Showroom Landmark 81, TP.HCM',
  'VinFast Showroom Grand Park, Thủ Đức, TP.HCM',
  'VinFast Showroom Ocean Park, Gia Lâm, Hà Nội',
  'VinFast Smart City Tây Mỗ, Nam Từ Liêm, Hà Nội',
  'VinFast Showroom Đà Nẵng',
  'VinFast Showroom Vincom Huế',
  'VinFast Showroom Cần Thơ',
];

export default function Booking() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedCar, selectedColor, orderType, purchaseOption, paymentMethod,
    paymentGateway, installmentDetails, showroom, depositAmount,
    setOrderType, setPurchaseOption, setPaymentMethod, setPaymentGateway,
    setInstallmentDetails, setShowroom, clearBooking,
  } = useCartStore();

  useEffect(() => {
    if (!selectedCar) {
      toast.warning('Vui lòng chọn dòng xe trước');
      navigate('/cars');
    }
  }, [selectedCar, navigate]);

  const [customerName,    setCustomerName]    = useState(user?.name  || '');
  const [customerEmail,   setCustomerEmail]   = useState(user?.email || '');
  const [customerPhone,   setCustomerPhone]   = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerIdCard,  setCustomerIdCard]  = useState('');

  const [voucherCode,    setVoucherCode]    = useState('');
  const [discount,       setDiscount]       = useState(0);
  const [pctDiscount,    setPctDiscount]    = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);

  const [step,        setStep]        = useState<1 | 2 | 3>(1);
  const [countdown,   setCountdown]   = useState(600); // 10 min
  const [submitting,  setSubmitting]  = useState(false);
  const [orderId,     setOrderId]     = useState('');

  // Car price
  const carPrice  = selectedCar?.price ?? 0;
  const isFull    = orderType === 'full-purchase';
  const baseAmount = isFull ? carPrice : depositAmount;
  const discountAmt = pctDiscount
    ? Math.round(baseAmount * pctDiscount / 100)
    : discount;
  const finalAmount = Math.max(0, baseAmount - discountAmt);

  // Countdown for payment step
  useEffect(() => {
    if (step !== 2) return;
    if (countdown <= 0) {
      toast.error('Phiên thanh toán đã hết hạn');
      setStep(1);
      setCountdown(600);
      return;
    }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, countdown]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  // ── Apply voucher
  const handleVoucher = async () => {
    if (!voucherCode) return;
    setVoucherLoading(true);
    try {
      const res = await api.post('/promotions/apply', { code: voucherCode });
      const promo = res.data.promotion;
      if (promo.type === 'percent') {
        setPctDiscount(promo.value);
        setDiscount(0);
        toast.success(`Áp dụng voucher giảm ${promo.value}% thành công!`);
      } else {
        setDiscount(promo.value);
        setPctDiscount(0);
        toast.success(`Áp dụng voucher giảm ${fmt(promo.value)} thành công!`);
      }
    } catch {
      // Demo fallback
      const DEMO: Record<string, any> = {
        'VINFAST10': { type: 'percent', value: 10 },
        'VF2026':    { type: 'fixed',   value: 50000000 },
        'KHANH2026': { type: 'fixed',   value: 20000000 },
      };
      const promo = DEMO[voucherCode.toUpperCase()];
      if (promo) {
        if (promo.type === 'percent') { setPctDiscount(promo.value); setDiscount(0); }
        else                          { setDiscount(promo.value);    setPctDiscount(0); }
        toast.success('Áp dụng voucher thành công!');
      } else {
        toast.error('Mã voucher không hợp lệ hoặc đã hết hạn');
      }
    } finally {
      setVoucherLoading(false);
    }
  };

  // ── Submit → go to QR payment
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }
    setStep(2);
    setCountdown(600);
  };

  // ── Simulate payment confirmation
  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      const payload = {
        car: selectedCar?._id,
        selectedColor: selectedColor?.name,
        orderType,
        purchaseOption,
        paymentMethod: isFull ? paymentGateway : paymentMethod,
        showroom,
        depositAmount: finalAmount,
        totalAmount: carPrice,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          idCard: customerIdCard,
        },
        installmentDetails: paymentMethod === 'installment' ? installmentDetails : undefined,
        voucherCode: voucherCode || undefined,
        discountAmount: discountAmt,
      };
      const res = await api.post('/orders', payload);
      setOrderId(res.data.order?.orderNumber || 'VF-' + Date.now());
      setStep(3);
      clearBooking();
      toast.success('🎉 Đặt hàng thành công!');
    } catch (err: any) {
      // Demo fallback
      setOrderId('VF-' + Date.now().toString().slice(-8));
      setStep(3);
      clearBooking();
      toast.success('🎉 Đặt hàng thành công!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCar) return null;

  // =========================================================
  // STEP 3 – SUCCESS
  // =========================================================
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-24 h-24 bg-green-500/15 border-4 border-green-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isFull ? '🎉 MUA XE THÀNH CÔNG!' : '✅ ĐẶT CỌC THÀNH CÔNG!'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isFull
                ? 'Cảm ơn bạn đã mua xe VinFast online. Nhân viên sẽ liên hệ xác nhận và sắp xếp giao xe trong vòng 24h.'
                : 'Cảm ơn bạn đã đặt cọc xe VinFast. Nhân viên sẽ liên hệ xác nhận lịch giao xe trong vòng 24h làm việc.'}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-extrabold text-blue-600 font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Dòng xe</span>
              <span className="font-bold text-gray-900">{selectedCar?.name ?? 'VinFast'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Hình thức</span>
              <span className={`font-bold ${isFull ? 'text-green-400' : 'text-yellow-400'}`}>
                {isFull ? 'Mua ngay (Thanh toán đầy đủ)' : 'Đặt cọc giữ xe'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Số tiền đã thanh toán</span>
              <span className="font-extrabold text-green-400 text-sm">{fmt(finalAmount)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/profile" className="flex-1 btn-electric py-3 text-xs font-bold">
              Xem đơn hàng của tôi
            </Link>
            <Link to="/cars" className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 py-3 rounded-xl text-xs font-bold text-gray-900 transition-colors text-center">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // STEP 2 – PAYMENT QR
  // =========================================================
  if (step === 2) {
    const gatewayInfo: Record<string, { name: string; color: string; icon: string; note: string }> = {
      vnpay: {
        name: 'VNPAY',
        color: 'text-blue-400',
        icon: '🏦',
        note: 'Mở app ngân hàng hoặc VNPAY và quét mã QR để thanh toán',
      },
      momo: {
        name: 'MoMo',
        color: 'text-pink-400',
        icon: '💜',
        note: 'Mở app MoMo → Quét mã → Xác nhận thanh toán',
      },
      'bank-transfer': {
        name: 'Chuyển khoản ngân hàng',
        color: 'text-green-400',
        icon: '🏧',
        note: 'Chuyển khoản theo thông tin bên dưới, nội dung ghi mã đơn hàng',
      },
    };
    const gw = gatewayInfo[paymentGateway];

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
              {gw.icon} Thanh toán qua {gw.name}
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900">QUÉT MÃ QR THANH TOÁN</h2>
            <p className={`text-xs font-semibold mt-1 ${gw.color}`}>{gw.note}</p>
          </div>

          {/* Countdown */}
          <div className="flex justify-center">
            <div className={`bg-white border rounded-xl px-6 py-3 text-center ${countdown < 60 ? 'border-red-500/40' : 'border-gray-200'}`}>
              <p className="text-[10px] text-gray-500 uppercase">Phiên thanh toán hết hạn sau</p>
              <p className={`text-3xl font-extrabold font-mono mt-1 ${countdown < 60 ? 'text-red-400 animate-pulse' : 'text-blue-600'}`}>
                {mm}:{ss}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 mx-auto max-w-xs">
            <img src={QR_IMAGES[paymentGateway]} alt="QR Code" className="w-48 h-48 object-contain" />
            <p className="text-gray-900 text-xs font-bold text-center">
              {paymentGateway === 'bank-transfer'
                ? 'VCB: 1037 849 900 • VinFast Vietnam JSC'
                : `Quét bằng app ${gw.name}`}
            </p>
          </div>

          {/* Payment summary */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Dòng xe</span>
              <span className="font-bold text-gray-900">{selectedCar?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Loại đơn hàng</span>
              <span className={`font-bold ${isFull ? 'text-green-400' : 'text-yellow-400'}`}>
                {isFull ? 'Mua ngay' : 'Đặt cọc giữ xe'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Màu xe</span>
              <span className="text-gray-900">{selectedColor?.name || '—'}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Giảm giá voucher</span>
                <span className="text-green-400 font-bold">- {fmt(discountAmt)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2.5 flex justify-between">
              <span className="text-xs font-bold text-gray-900">SỐ TIỀN THANH TOÁN</span>
              <span className="text-lg font-extrabold text-blue-600">{fmt(finalAmount)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setCountdown(600); }}
              className="bg-gray-50 border border-gray-200 hover:bg-gray-100 px-5 rounded-xl text-xs font-bold text-gray-900 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="flex-1 btn-electric py-3 text-xs font-bold"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Tôi đã thanh toán xong
                </span>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Giao dịch được mã hoá SSL 256-bit • An toàn & Bảo mật
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // STEP 1 – FORM
  // =========================================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-gray-900">
      {/* Back */}
      <Link to={`/cars/${selectedCar?.slug}`} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại chi tiết xe
      </Link>

      <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider mb-8">
        ĐẶT MUA XE <span className="text-blue-600">{selectedCar?.name}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: Form ── */}
        <form onSubmit={handleSubmitForm} className="lg:col-span-3 space-y-6">

          {/* ── ORDER TYPE PICKER ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" /> Hình thức mua xe
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Deposit */}
              <button
                type="button"
                onClick={() => setOrderType('deposit')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  orderType === 'deposit'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="text-yellow-400 font-extrabold text-sm mb-1">Đặt Cọc Giữ Xe</p>
                <p className="text-[10px] text-gray-500">
                  Thanh toán một phần ({fmt(depositAmount)}) để giữ xe, số còn lại thanh toán khi nhận xe.
                </p>
                <p className="text-[10px] text-yellow-400 font-bold mt-1.5">
                  Chỉ cần: {fmt(depositAmount)}
                </p>
              </button>
              {/* Full Purchase */}
              <button
                type="button"
                onClick={() => setOrderType('full-purchase')}
                className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                  orderType === 'full-purchase'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="absolute top-2 right-2 bg-green-500 text-gray-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded">
                  MUA NGAY
                </span>
                <p className="text-green-400 font-extrabold text-sm mb-1">Mua Trực Tuyến</p>
                <p className="text-[10px] text-gray-500">
                  Thanh toán toàn bộ giá xe online. Nhận xe tại showroom hoặc giao tận nơi (HCM & HN).
                </p>
                <p className="text-[10px] text-green-400 font-bold mt-1.5">
                  Tổng: {fmt(carPrice)}
                </p>
              </button>
            </div>

            {/* Payment gateway – chỉ hiện khi mua ngay hoặc chọn full payment */}
            {orderType === 'full-purchase' && (
              <div className="pt-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Chọn phương thức thanh toán</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'vnpay',         label: 'VNPAY',    icon: <Building2 className="w-5 h-5" />,  desc: 'ATM / Internet Banking' },
                    { key: 'momo',          label: 'MoMo',     icon: <Smartphone className="w-5 h-5" />, desc: 'Ví điện tử MoMo' },
                    { key: 'bank-transfer', label: 'Chuyển khoản', icon: <Banknote className="w-5 h-5" />, desc: 'Ngân hàng bất kỳ' },
                  ].map(gw => (
                    <button
                      key={gw.key}
                      type="button"
                      onClick={() => setPaymentGateway(gw.key as any)}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        paymentGateway === gw.key
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-100 hover:border-gray-200 text-gray-500'
                      }`}
                    >
                      {gw.icon}
                      <span className="text-[10px] font-extrabold">{gw.label}</span>
                      <span className="text-[9px] opacity-70">{gw.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderType === 'deposit' && (
              <div className="pt-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Thanh toán phần còn lại</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'full-payment',  label: '💰 Trả thẳng', desc: 'Thanh toán 1 lần khi nhận xe' },
                    { key: 'installment',   label: '📅 Trả góp',   desc: 'Vay ngân hàng theo tháng' },
                  ].map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPaymentMethod(m.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === m.key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <p className="text-xs font-bold text-gray-900">{m.label}</p>
                      <p className="text-[10px] text-gray-500">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Purchase Option (pin) ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" /> Gói pin
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'rent-battery', label: '🔋 Thuê pin', desc: `${fmt(selectedCar?.batteryRentPrice ?? 1500000)}/tháng • Mua xe giá thấp hơn` },
                { key: 'buy-battery',  label: '💎 Mua pin',  desc: 'Sở hữu hoàn toàn, không phí hàng tháng' },
              ].map(o => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setPurchaseOption(o.key as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    purchaseOption === o.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-900">{o.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Showroom ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-gray-600">📍 Chọn showroom nhận xe</h3>
            <select
              value={showroom}
              onChange={e => setShowroom(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            >
              {SHOWROOMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* ── Customer Info ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-gray-600">👤 Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Họ và tên *', val: customerName, set: setCustomerName, type: 'text', required: true },
                { label: 'Số điện thoại *', val: customerPhone, set: setCustomerPhone, type: 'tel', required: true },
                { label: 'Địa chỉ email *', val: customerEmail, set: setCustomerEmail, type: 'email', required: true, full: true },
                { label: 'Địa chỉ giao xe', val: customerAddress, set: setCustomerAddress, type: 'text', required: false, full: true },
                { label: 'CCCD / CMND', val: customerIdCard, set: setCustomerIdCard, type: 'text', required: false },
              ].map(f => (
                <div key={f.label} className={f.full ? 'sm:col-span-2' : ''}>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Voucher ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-gray-600 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" /> Mã giảm giá
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="VD: VINFAST10 / VF2026"
                className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 uppercase"
              />
              <button
                type="button"
                onClick={handleVoucher}
                disabled={voucherLoading}
                className="bg-blue-100 border border-blue-300 hover:bg-blue-100 text-blue-600 px-4 rounded-lg text-xs font-bold transition-colors"
              >
                {voucherLoading ? '...' : 'Áp dụng'}
              </button>
            </div>
            {discountAmt > 0 && (
              <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã áp dụng – giảm {fmt(discountAmt)}
              </p>
            )}
            <p className="text-[10px] text-gray-400">Demo: <span className="text-blue-600">VINFAST10</span> (10%) • <span className="text-blue-600">VF2026</span> (50 triệu) • <span className="text-blue-600">KHANH2026</span> (20 triệu)</p>
          </div>

          <button type="submit" className="btn-electric w-full py-4 text-sm font-extrabold uppercase tracking-wider">
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              {isFull ? 'Tiến hành thanh toán' : 'Xác nhận đặt cọc'}
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Bảo mật SSL 256-bit • Thông tin của bạn được mã hoá hoàn toàn
          </p>
        </form>

        {/* ── Right: Order Summary ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 sticky top-24">
            <h3 className="text-xs font-extrabold uppercase text-gray-600">📋 Tóm tắt đơn hàng</h3>

            {/* Car image */}
            <img
              src={selectedCar?.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80'}
              alt={selectedCar?.name}
              className="w-full h-36 object-cover rounded-xl"
            />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Dòng xe</span>
                <span className="font-bold text-gray-900">{selectedCar?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Màu xe</span>
                <div className="flex items-center gap-1.5">
                  {selectedColor && (
                    <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: selectedColor.code }} />
                  )}
                  <span className="text-gray-900">{selectedColor?.name || '—'}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gói pin</span>
                <span className="text-blue-600 font-bold">
                  {purchaseOption === 'buy-battery' ? 'Mua pin' : 'Thuê pin'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Showroom nhận xe</span>
                <span className="text-gray-900 text-right max-w-[160px]">{showroom.split(',')[0]}</span>
              </div>

              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá niêm yết</span>
                  <span className="text-gray-900">{fmt(carPrice)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Voucher giảm</span>
                    <span className="text-green-400 font-bold">- {fmt(discountAmt)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="font-extrabold text-gray-900">
                    {isFull ? 'Cần thanh toán ngay' : 'Số tiền đặt cọc'}
                  </span>
                  <span className={`text-xl font-extrabold ${isFull ? 'text-green-400' : 'text-yellow-400'}`}>
                    {fmt(finalAmount)}
                  </span>
                </div>
                {!isFull && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Còn lại khi nhận xe</span>
                    <span className="text-gray-600">{fmt(carPrice - finalAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-2">
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-blue-600" />, text: 'Bảo hành 10 năm' },
                { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, text: 'Sạc miễn phí 3 năm' },
                { icon: <Lock className="w-4 h-4 text-yellow-400" />, text: 'Thanh toán an toàn' },
                { icon: <AlertCircle className="w-4 h-4 text-blue-400" />, text: 'Hoàn cọc nếu hủy' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                  {b.icon} {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
