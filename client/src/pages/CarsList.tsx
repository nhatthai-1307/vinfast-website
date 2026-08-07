import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Zap } from 'lucide-react';
import api from '../services/api';

export default function CarsList() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [seats, setSeats]         = useState('');
  const [minPrice, setMinPrice]   = useState('');
  const [maxPrice, setMaxPrice]   = useState('');
  const [sortBy, setSortBy]       = useState('name');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search)   p.append('search', search);
      if (category) p.append('category', category);
      if (seats)    p.append('seats', seats);
      if (minPrice) p.append('minPrice', minPrice);
      if (maxPrice) p.append('maxPrice', maxPrice);
      if (sortBy)   p.append('sortBy', sortBy);
      const res = await api.get(`/cars?${p.toString()}`);
      setCars(res.data.cars);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, [category, seats, minPrice, maxPrice, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchCars(); };
  const handleClearFilters = () => { setSearch(''); setCategory(''); setSeats(''); setMinPrice(''); setMaxPrice(''); setSortBy('name'); };

  const vnd = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const selectClass = "w-full bg-white border border-[#DDE0EA] rounded-xl px-3 py-2.5 text-sm text-[#3D4356] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <div style={{ backgroundColor: '#F5F6FA' }} className="min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-[#E8EAF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Danh sách xe</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1D23] tracking-tight">Dòng Xe Điện VinFast</h1>
          <p className="text-[#6B7280] mt-2 text-base">Khám phá hệ sinh thái xe điện thông minh đa phân khúc từ mini-SUV đến SUV hạng sang.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E8EAF0] shadow-sm p-6 space-y-6 sticky top-24">
              <div className="flex justify-between items-center pb-4 border-b border-[#E8EAF0]">
                <h3 className="font-bold text-[#1A1D23] flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Bộ Lọc
                </h3>
                <button onClick={handleClearFilters} className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Xóa tất cả
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearchSubmit}>
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Tìm kiếm</label>
                <div className="relative">
                  <input type="text" placeholder="Ví dụ: VF 3..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-[#DDE0EA] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#3D4356] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                </div>
              </form>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Phân khúc</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Mini">Mini SUV</option>
                  <option value="A-SUV">Crossover A</option>
                  <option value="B-SUV">Crossover B</option>
                  <option value="C-SUV">Crossover C</option>
                  <option value="D-SUV">SUV hạng D</option>
                  <option value="E-SUV">SUV hạng E</option>
                </select>
              </div>

              {/* Seats */}
              <div>
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Số chỗ</label>
                <select value={seats} onChange={e => setSeats(e.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="4">4 chỗ</option>
                  <option value="5">5 chỗ</option>
                  <option value="7">7 chỗ</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Giá (VNĐ)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Từ" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    className="w-1/2 bg-white border border-[#DDE0EA] rounded-xl px-3 py-2.5 text-sm text-[#3D4356] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  <input type="number" placeholder="Đến" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    className="w-1/2 bg-white border border-[#DDE0EA] rounded-xl px-3 py-2.5 text-sm text-[#3D4356] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E8EAF0] shadow-sm px-5 py-3.5">
              <p className="text-sm text-[#6B7280]">
                <span className="font-bold text-[#1A1D23]">{cars.length}</span> xe được tìm thấy
              </p>
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-4 h-4 text-[#9CA3AF]" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-sm text-[#3D4356] bg-transparent focus:outline-none font-medium cursor-pointer">
                  <option value="name">Tên A–Z</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-[380px] rounded-2xl skeleton" />)}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-[#E8EAF0]">
                <div className="w-16 h-16 bg-[#EAECF3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-[#6B7280] text-sm">Không tìm thấy xe phù hợp.</p>
                <button onClick={handleClearFilters} className="text-blue-600 hover:underline mt-3 text-sm font-bold">
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map(car => {
                  const img = car.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                  return (
                    <div key={car._id}
                      className="bg-white rounded-2xl border border-[#E8EAF0] shadow-sm overflow-hidden hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1.5 transition-all duration-300 group card-glow">
                      {/* Image */}
                      <div className="relative h-48 bg-[#EAECF3] overflow-hidden">
                        <img src={img} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent" />
                        {car.isNewest && (
                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">MỚI</span>
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-700 text-[9px] font-bold px-2.5 py-1 rounded-full">
                          {car.category}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-lg font-black text-[#1A1D23] group-hover:text-blue-600 transition-colors">{car.name}</h3>
                          <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">{car.category} Segment</p>
                        </div>

                        <div className="grid grid-cols-3 border border-[#E8EAF0] rounded-xl overflow-hidden">
                          {[{v:car.seats, l:'Chỗ ngồi'},{v:`${car.range} km`,l:'Tầm chạy'},{v:`${car.power||43} hp`,l:'Động cơ'}].map((s,i) => (
                            <div key={i} className={`text-center py-2.5 bg-[#F5F6FA] ${i>0?'border-l border-[#E8EAF0]':''}`}>
                              <p className="text-xs font-bold text-[#1A1D23]">{s.v}</p>
                              <p className="text-[9px] text-[#9CA3AF] mt-0.5">{s.l}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <p className="text-[9px] text-[#9CA3AF] uppercase font-bold tracking-wider">Giá xe</p>
                            <p className="text-base font-black text-blue-600">{vnd(car.price)}</p>
                          </div>
                          <Link to={`/cars/${car.slug}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                            Xem chi tiết →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
