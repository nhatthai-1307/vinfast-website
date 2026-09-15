import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCompareStore } from '../store/useCompareStore';
import { Car, User, LogOut, Menu, X, BarChart3, Shield, ChevronDown, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Navbar() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [carsOpen, setCarsOpen]   = useState(false);

  const carsRef    = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const { comparedCars } = useCompareStore();
  const location         = useLocation();
  const navigate         = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setCarsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (carsRef.current    && !carsRef.current.contains(e.target as Node))    setCarsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  const navLinks = [
    { name: 'Trang chủ',      path: '/' },
    { name: 'So sánh xe',     path: '/compare' },
    { name: 'Tính trả góp',   path: '/installment' },
    { name: 'Showroom & Sạc', path: '/showrooms' },
    { name: 'Thuê xe',        path: '/rental', isNew: true },
  ];

  const carMenu = [
    { name: 'VF 3', slug: 'vf-3', label: 'Mini EV', price: 'Từ 322 tr', color: 'bg-sky-100 text-sky-700' },
    { name: 'VF 5', slug: 'vf-5', label: 'A-SUV',   price: 'Từ 468 tr', color: 'bg-blue-100 text-blue-700' },
    { name: 'VF 6', slug: 'vf-6', label: 'B-SUV',   price: 'Từ 675 tr', color: 'bg-teal-100 text-teal-700' },
    { name: 'VF 7', slug: 'vf-7', label: 'C-SUV',   price: 'Từ 850 tr', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'VF 8', slug: 'vf-8', label: 'D-SUV',   price: 'Từ 1.09 tỷ', color: 'bg-amber-100 text-amber-700' },
    { name: 'VF 9', slug: 'vf-9', label: 'E-SUV',   price: 'Từ 1.56 tỷ', color: 'bg-violet-100 text-violet-700' },
  ];

  const active = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-200/50'
        : 'bg-white/70 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="leading-none">
              <span className="block text-base font-black text-slate-900 tracking-tight">VINFAST</span>
              <span className="block text-[9px] text-blue-600 font-bold tracking-[0.2em] uppercase mt-0.5">Electric Auto</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">

            {/* Dòng xe dropdown */}
            <div ref={carsRef} className="relative">
              <button
                onClick={() => { setCarsOpen(o => !o); setProfileOpen(false); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active('/cars') || location.pathname.startsWith('/cars/')
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Car className="w-4 h-4" />
                Dòng xe
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${carsOpen ? 'rotate-180' : ''}`} />
              </button>

              {carsOpen && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/80 p-3 z-50 animate-fadeInUp">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Chọn dòng xe để xem chi tiết</p>
                  <div className="grid grid-cols-2 gap-2">
                    {carMenu.map((item) => (
                      <Link
                        key={item.name}
                        to={`/cars/${item.slug}`}
                        onClick={() => setCarsOpen(false)}
                        className="flex flex-col gap-1 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                      >
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md w-fit ${item.color}`}>{item.label}</span>
                        <span className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</span>
                        <span className="text-xs text-slate-400">{item.price}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <Link to="/cars" onClick={() => setCarsOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      Xem tất cả dòng xe →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active(link.path)
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.name}
                {link.isNew && (
                  <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/compare" className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <BarChart3 className="w-4 h-4" />
              {comparedCars.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {comparedCars.length}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => { setProfileOpen(o => !o); setCarsOpen(false); }}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&bold=true`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-sm font-semibold text-slate-800 max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/80 p-2 z-50 animate-fadeInUp">
                    <div className="px-3 py-2.5 mb-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1.5 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {user.role}
                      </span>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                        <Shield className="w-4 h-4 text-blue-500" /> Trang quản trị
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                      <User className="w-4 h-4 text-slate-400" /> Trang cá nhân
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  Đăng nhập
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            <Link to="/cars" className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${active('/cars') ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Car className="w-4 h-4" /> Dòng xe
            </Link>
            {navLinks.map(link => (
              <Link key={link.name} to={link.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${active(link.path) ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                {link.name}
                {link.isNew && <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 px-4 py-4">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div><div className="text-sm font-bold text-slate-900">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></div>
                </div>
                {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50"><Shield className="w-4 h-4" /> Quản trị</Link>}
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"><User className="w-4 h-4" /> Trang cá nhân</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Đăng xuất</button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50">Đăng nhập</Link>
                <Link to="/register" className="block text-center py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700">Đăng ký ngay</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
