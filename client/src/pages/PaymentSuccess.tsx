import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2, ShieldCheck, Printer, Home,
  ArrowRight, FileText, Calendar, Building2, Car, CreditCard,
  PhoneCall, Check
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const orderNumber = searchParams.get('orderNumber') || searchParams.get('orderId') || 'VF-892147';
  const carName = searchParams.get('car') || 'VinFast VF 8 Plus';
  const color = searchParams.get('color') || 'Xanh Deep Ocean';
  const rawAmount = searchParams.get('amount');
  const amount = rawAmount ? Number(rawAmount) : 10000000;
  const showroom = searchParams.get('showroom') || 'VinFast Showroom Landmark 81, TP.HCM';
  const paymentMethod = searchParams.get('method') || 'Chuyển khoản VietQR (Ngân hàng TMCP Ngoại Thương Việt Nam)';
  const customerName = searchParams.get('customer') || user?.name || 'Nguyễn Văn An';
  const customerPhone = searchParams.get('phone') || user?.phone || '0912 345 678';
  const transactionId = searchParams.get('transactionId') || 'TRX-89302194';

  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Top Celebration Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />

          <div className="w-24 h-24 bg-emerald-50 border-4 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 animate-pulse" />
          </div>

          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Giao dịch thanh toán hoàn tất
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            XÁC NHẬN ĐẶT CỌC THÀNH CÔNG!
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
            Hệ thống VinFast đã ghi nhận khoản tiền đặt cọc của bạn. Hóa đơn điện tử và hợp đồng nguyên tắc đã được gửi tới hòm thư điện tử của bạn.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 max-w-sm mx-auto flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Số tiền đã thanh toán:</span>
            <span className="text-xl font-black text-blue-600">{fmt(amount)}</span>
          </div>
        </div>

        {/* Detailed Receipt Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                CHI TIẾT ĐƠN HÀNG & THANH TOÁN
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Biên nhận giao dịch điện tử chính thức</p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-xl border border-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" /> In biên lai
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-xs text-gray-400 font-medium">Mã đơn hàng</span>
              <p className="font-mono font-extrabold text-blue-600 text-base">{orderNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-xs text-gray-400 font-medium">Mã đối soát / Giao dịch</span>
              <p className="font-mono font-bold text-gray-800 text-base">{transactionId}</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm divide-y divide-gray-100">
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500 flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-400" /> Dòng xe lựa chọn:
              </span>
              <span className="font-bold text-gray-900 text-right">{carName} ({color})</span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-500 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" /> Showroom nhận xe:
              </span>
              <span className="font-semibold text-gray-800 text-right max-w-[280px] truncate">{showroom}</span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" /> Phương thức:
              </span>
              <span className="font-semibold text-gray-800 text-right">{paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Thời gian giao dịch:
              </span>
              <span className="font-mono text-gray-700 font-medium">
                {new Date().toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-500 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-gray-400" /> Khách hàng:
              </span>
              <span className="font-bold text-gray-900 text-right">{customerName} - {customerPhone}</span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-500 font-semibold">Trạng thái:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs">
                <Check className="w-3.5 h-3.5" /> ĐÃ THANH TOÁN THÀNH CÔNG
              </span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              📌 Các bước tiếp theo:
            </p>
            <p className="text-amber-700 leading-relaxed">
              1. Chuyên viên tư vấn VinFast sẽ gọi điện thoại xác nhận đơn cọc xe của bạn trong vòng 24 giờ.
              <br />
              2. Quý khách vui lòng mang theo CCCD/CMND khi đến nhận xe tại Showroom đã chọn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-3.5 px-4 rounded-xl border border-gray-200 transition-all text-center"
            >
              <Home className="w-4 h-4" /> Về trang chủ
            </Link>
            <Link
              to="/profile"
              className="flex-1 btn-electric py-3.5 text-xs font-bold text-center inline-flex items-center justify-center gap-2"
            >
              Xem đơn hàng trong hồ sơ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
