import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Home, User, Car, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clearBooking } = useCartStore();

  const status = searchParams.get('status');
  const orderNumber = searchParams.get('orderNumber') || 'N/A';
  const amount = searchParams.get('amount');
  const transactionNo = searchParams.get('transactionNo');
  const bankCode = searchParams.get('bankCode');
  const responseCode = searchParams.get('responseCode');

  useEffect(() => {
    if (status === 'success') {
      clearBooking();
    }
  }, [status, clearBooking]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        {isSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 border-4 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Giao dịch trực tuyến hoàn tất
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                XÁC NHẬN THANH TOÁN THÀNH CÔNG!
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                Cảm ơn quý khách đã hoàn tất đặt cọc xe VinFast. Thông tin đơn hàng và biên lai điện tử đã được ghi nhận trên hệ thống.
              </p>
            </div>

            {/* Detail Receipt Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left space-y-3 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-500">Mã đơn hàng</span>
                <span className="font-mono font-extrabold text-blue-600">{orderNumber}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Mã giao dịch</span>
                <span className="font-mono font-bold text-gray-800">{transactionNo || `TRX-${Date.now().toString().slice(-8)}`}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phương thức thanh toán</span>
                <span className="font-bold text-gray-800">{bankCode || 'Chuyển khoản VietQR / MoMo'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Số tiền đặt cọc</span>
                <span className="font-extrabold text-emerald-600 text-base">{amount ? fmt(Number(amount)) : '10.000.000 ₫'}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500">Trạng thái thanh toán</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 text-xs bg-emerald-100/60 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã thanh toán thành công
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Chuyên viên tư vấn VinFast tại showroom sẽ liên hệ qua số điện thoại của quý khách trong vòng 24 giờ làm việc để chuẩn bị các thủ tục bàn giao xe.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold py-3 px-4 rounded-xl transition-all"
              >
                <Home className="w-4 h-4" /> Trang chủ
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  <User className="w-4 h-4" /> Xem đơn hàng <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/cars"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  <Car className="w-4 h-4" /> Khám phá thêm xe <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ================= FAILED STATE ================= */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 border-4 border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <div>
              <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Giao dịch chưa hoàn tất
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                THANH TOÁN THẤT BẠI
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                Giao dịch qua cổng VNPAY đã bị hủy hoặc có lỗi xảy ra trong quá trình xử lý thanh toán.
              </p>
            </div>

            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mã đơn hàng</span>
                <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
              </div>
              {responseCode && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mã phản hồi VNPAY</span>
                  <span className="font-mono text-red-600 font-bold">{responseCode} (Đã hủy giao dịch)</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold py-3 px-4 rounded-xl transition-all"
              >
                <Home className="w-4 h-4" /> Về trang chủ
              </Link>
              <Link
                to="/booking"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
              >
                Thử thanh toán lại <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
