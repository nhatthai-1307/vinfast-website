import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      toast.success('Đăng nhập thành công! Chào mừng quay trở lại.');
      // Direct users based on role
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        navigate('/');
      }
    } else {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      {/* Return home link */}
      <Link to="/" className="absolute top-6 left-6 text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
      </Link>

      <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl space-y-6 shadow-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm shadow-blue-100">
            <span className="text-white font-extrabold text-2xl tracking-tighter">V</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-wider text-gray-900">ĐĂNG NHẬP VINFAST</h2>
          <p className="text-xs text-gray-500">
            Truy cập để quản lý đơn cọc xe điện và theo dõi các lịch hẹn lái thử.
          </p>
        </div>

        {/* Local Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 block uppercase">Địa chỉ email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                placeholder="Ví dụ: customer@gmail.com"
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 block uppercase">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick password actions */}
          <div className="text-right">
            <a href="#" className="text-[10px] text-blue-600 hover:underline font-bold">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-electric w-full py-3 text-xs font-bold uppercase tracking-wider"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Chưa có tài khoản VinFast? 
            <Link to="/register" className="text-blue-600 hover:underline font-bold ml-1.5">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
