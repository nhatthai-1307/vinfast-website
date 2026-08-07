import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Lock, Phone, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Register() {
  // Step 1 Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2 OTP States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { register, verifyOtp, resendOtp, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: any;
    if (isOtpStep && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, countdown]);

  // Validate phone format (10 digits starting with 0)
  const isPhoneValid = phone === '' || /^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone);
  // Validate email format
  const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Check password match
  const isPasswordMatch = confirmPassword === '' || password === confirmPassword;

  // Handle Step 1: Submit Registration
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ tất cả các trường thông tin');
      return;
    }

    if (!isEmailValid) {
      toast.error('Địa chỉ email không đúng định dạng');
      return;
    }

    if (!isPhoneValid) {
      toast.error('Số điện thoại không hợp lệ (phải gồm 10 chữ số bắt đầu bằng 0)');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không trùng khớp');
      return;
    }

    const res = await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
    if (res.success) {
      if (res.requireOtp) {
        setPendingEmail(res.email || email.trim());
        setIsOtpStep(true);
        setCountdown(60);
        setCanResend(false);
        toast.info(`Mã xác thực OTP đã được gửi đến email ${res.email}. Vui lòng kiểm tra hộp thư.`, { autoClose: 5000 });
      } else {
        toast.success('Đăng ký tài khoản thành công!');
        navigate('/profile');
      }
    } else {
      toast.error(res.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    }
  };

  // Handle Step 2: Submit OTP Verification
  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error('Vui lòng nhập đầy đủ 6 chữ số mã OTP');
      return;
    }

    const success = await verifyOtp({ email: pendingEmail, otpCode: otpCode.trim() });
    if (success) {
      toast.success('Xác thực Email thành công! Tài khoản của bạn đã được kích hoạt.');
      navigate('/profile');
    } else {
      toast.error('Mã OTP không chính xác hoặc đã hết hạn.');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    const res = await resendOtp(pendingEmail);
    if (res.success) {
      setCountdown(60);
      setCanResend(false);
      toast.info(`Mã OTP mới đã được gửi đến email ${pendingEmail}.`, { autoClose: 5000 });
    } else {
      toast.error(res.message || 'Không thể gửi lại mã OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Return home link */}
      <Link to="/" className="absolute top-6 left-6 text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
      </Link>

      <div className="w-full max-w-md bg-white border border-gray-100 shadow-md rounded-3xl p-8 space-y-5 my-8">
        
        {/* ================= STEP 2: OTP VERIFICATION FORM ================= */}
        {isOtpStep ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-wider text-gray-900">XÁC THỰC MÃ OTP</h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                Mã xác thực 6 chữ số đã được gửi đến email:<br />
                <strong className="text-blue-600 font-bold">{pendingEmail}</strong>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-center text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmitOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-gray-600 font-semibold block uppercase text-center">
                  Nhập mã xác thực 6 chữ số
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                      clearError();
                    }}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-50 border border-gray-200 text-gray-900 text-center font-mono font-black text-2xl tracking-[0.4em] placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl py-3"
                  />
                  <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                </div>
              </div>

              {/* Submit OTP Button */}
              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="btn-electric w-full py-3.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận & Kích hoạt tài khoản'}
              </button>
            </form>

            {/* Resend & Back actions */}
            <div className="space-y-3 pt-2 text-center border-t border-gray-100">
              <div>
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Gửi lại mã OTP mới
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 font-medium">
                    Gửi lại mã OTP sau: <strong className="text-gray-700 font-bold">{countdown}s</strong>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setOtpCode('');
                  clearError();
                }}
                className="text-xs text-gray-500 hover:text-gray-900 underline font-medium block mx-auto"
              >
                ← Quay lại chỉnh sửa thông tin đăng ký
              </button>
            </div>
          </div>
        ) : (

          /* ================= STEP 1: REGISTRATION FORM ================= */
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-200">
                <span className="text-white font-extrabold text-2xl tracking-tighter">V</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-wider text-gray-900">ĐĂNG KÝ HỘI VIÊN</h2>
              <p className="text-xs text-gray-500">
                Khởi đầu hành trình di chuyển thông minh cùng ô tô điện VinFast ngay hôm nay.
              </p>
            </div>

            {/* Local Error notification */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-center text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600 font-semibold block uppercase">Họ và tên</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError();
                    }}
                    placeholder="Ví dụ: Trần Văn A"
                    className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600 font-semibold block uppercase">Số điện thoại</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError();
                    }}
                    placeholder="Ví dụ: 0912345678"
                    className={`w-full bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 rounded-xl pl-10 pr-4 py-2.5 text-xs ${
                      !isPhoneValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                {!isPhoneValid && (
                  <p className="text-[10px] text-red-500 mt-0.5">Số điện thoại không hợp lệ (10 chữ số)</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs text-gray-600 font-semibold block uppercase">Địa chỉ email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    placeholder="Ví dụ: hotro@gmail.com"
                    className={`w-full bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 rounded-xl pl-10 pr-4 py-2.5 text-xs ${
                      !isEmailValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                {!isEmailValid && (
                  <p className="text-[10px] text-red-500 mt-0.5">Email không đúng định dạng</p>
                )}
              </div>

              {/* Passwords grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 font-semibold block uppercase">Mật khẩu</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError();
                      }}
                      placeholder="Từ 6 ký tự"
                      className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-9 pr-9 py-2.5 text-xs"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-gray-400 hover:text-blue-600 focus:outline-none p-1 rounded transition-colors"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600 font-semibold block uppercase">Xác nhận</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError();
                      }}
                      placeholder="Nhập lại"
                      className={`w-full bg-white border text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 rounded-xl pl-9 pr-9 py-2.5 text-xs ${
                        !isPasswordMatch ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 text-gray-400 hover:text-blue-600 focus:outline-none p-1 rounded transition-colors"
                      title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password match status indicators */}
              {confirmPassword && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  {isPasswordMatch ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu xác nhận trùng khớp
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Mật khẩu xác nhận chưa khớp
                    </span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-electric w-full py-3 text-xs font-bold uppercase tracking-wider"
              >
                {loading ? 'Đang gửi mã OTP...' : 'Đăng ký thành viên'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Đã có tài khoản VinFast? 
                <Link to="/login" className="text-blue-600 hover:underline font-bold ml-1.5">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
