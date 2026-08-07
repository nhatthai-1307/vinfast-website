import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Car, ShoppingCart, Calendar, Users, LogOut, Home, ArrowLeft, KeyRound, Tag } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import RealtimeNotificationListener from '../components/RealtimeNotificationListener';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Route protection
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-vinfast-carbon-950 flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/30 flex items-center justify-center mb-6 text-red-500">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">QUYỀN TRUY CẬP BỊ TỪ CHỐI</h1>
        <p className="text-vinfast-carbon-400 max-w-md mb-8">
          Trang này chỉ dành cho Quản trị viên của VinFast. Vui lòng đăng nhập với tài khoản hợp lệ.
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="btn-electric py-2 px-6">
            Đăng nhập ngay
          </Link>
          <Link to="/" className="btn-outline py-2 px-6">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  const adminMenu = [
    { name: 'Thống kê chung',        path: '/admin',              icon: LayoutDashboard },
    { name: 'Quản lý dòng xe',       path: '/admin/cars',         icon: Car },
    { name: 'Quản lý đơn cọc/mua',  path: '/admin/orders',       icon: ShoppingCart },
    { name: 'Quản lý thuê xe',       path: '/admin/rentals',      icon: KeyRound, isNew: true },
    { name: 'Quản lý lịch lái thử', path: '/admin/test-drives',  icon: Calendar },
    { name: 'Quản lý khách hàng',   path: '/admin/users',        icon: Users },
    { name: 'Quản lý Khuyến mãi',    path: '/admin/promotions',   icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-vinfast-carbon-950 text-white flex flex-col md:flex-row">
      <RealtimeNotificationListener />
      <ToastContainer theme="dark" />

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-vinfast-carbon-900 border-r border-white/5 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-electric-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">V</span>
              </div>
              <span className="font-extrabold text-lg tracking-wider">VF ADMIN</span>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-vinfast-cyan object-cover"
            />
            <div>
              <div className="text-sm font-semibold text-white truncate max-w-[120px]">{user.name}</div>
              <div className="text-[10px] text-vinfast-cyan uppercase font-bold">{user.role} Portal</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-electric-gradient text-white font-bold shadow-glow-blue'
                      : 'text-vinfast-carbon-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-vinfast-carbon-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Về Trang Khách Hàng
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-white/5 bg-vinfast-carbon-900/50 flex items-center px-8 justify-between">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            {adminMenu.find(item => item.path === location.pathname)?.name || 'Trang Quản Trị'}
          </h2>
          <div className="text-xs text-vinfast-carbon-400">
            Hệ Thống Trực Tuyến VinFast - Local Time: 2026
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
