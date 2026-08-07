import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCompareStore from '../store/useCompareStore';
import api from '../services/api';
import { ArrowLeft, Trash2, Plus, Zap, Scale } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CompareCars() {
  const { comparedCars, removeCar, clearCompare, addCar } = useCompareStore();
  const [allCars, setAllCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        const res = await api.get('/cars');
        setAllCars(res.data.cars);
      } catch (err) {
        console.error('Error fetching cars for comparison selector:', err);
      }
    };
    fetchAllCars();
  }, []);

  const handleSelectorAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const carId = e.target.value;
    if (!carId) return;

    const selectedCar = allCars.find((car) => car._id === carId);
    if (selectedCar) {
      const added = addCar(selectedCar);
      if (added) {
        toast.success(`Đã thêm ${selectedCar.name} vào so sánh`);
      } else {
        toast.warning('Tối đa so sánh 3 dòng xe');
      }
    }
    e.target.value = ''; // Reset select
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
        <div className="space-y-1">
          <Link to="/cars" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại dòng xe
          </Link>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 tracking-wider">
            <Scale className="w-8 h-8 text-blue-600 shadow-sm" /> SO SÁNH XE THÔNG MINH
          </h1>
        </div>

        {comparedCars.length > 0 && (
          <button
            onClick={() => {
              clearCompare();
              toast.info('Đã làm trống bảng so sánh');
            }}
            className="text-xs text-red-400 hover:text-red-300 font-bold border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors"
          >
            Làm trống tất cả
          </button>
        )}
      </div>

      {comparedCars.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl space-y-6">
          <div className="w-16 h-16 bg-blue-50 border border-blue-300 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">BẢNG SO SÁNH TRỐNG</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Vui lòng chọn các dòng xe VinFast để đặt lên bàn cân so sánh chi tiết giá bán, kích thước và thông số pin.
          </p>
          <div className="max-w-xs mx-auto">
            <select
              onChange={handleSelectorAdd}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">Chọn xe để thêm...</option>
              {allCars.map((car) => (
                <option key={car._id} value={car._id}>{car.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Select Tool for remaining slots */}
          {comparedCars.length < 3 && (
            <div className="max-w-xs bg-white border border-gray-100 p-4 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Thêm xe khác để so sánh:</span>
              <select
                onChange={handleSelectorAdd}
                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
              >
                <option value="">Chọn xe...</option>
                {allCars
                  .filter((c) => !comparedCars.some((cc) => cc._id === c._id))
                  .map((car) => (
                    <option key={car._id} value={car._id}>{car.name}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Grid Layout Comparison Matrix */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-md">
            <div className="grid grid-cols-4 border-b border-gray-100">
              {/* Row Header Label */}
              <div className="p-6 font-bold text-gray-500 text-xs bg-gray-50 flex items-center">
                MẪU XE SO SÁNH
              </div>

              {/* Columns for Cars */}
              {Array.from({ length: 3 }).map((_, idx) => {
                const car = comparedCars[idx];
                if (!car) {
                  return (
                    <div key={idx} className="p-6 border-l border-gray-100 flex flex-col items-center justify-center text-center bg-gray-100">
                      <div className="w-10 h-10 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-900/20 mb-2">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase">Trống</span>
                    </div>
                  );
                }

                const imageUrl = car.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                return (
                  <div key={car._id} className="p-6 border-l border-gray-100 space-y-4 relative group">
                    <button
                      onClick={() => removeCar(car._id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="h-28 flex items-center justify-center">
                      <img src={imageUrl} alt={car.name} className="max-h-full object-contain" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="font-extrabold text-sm text-gray-900">{car.name}</h3>
                      <p className="text-[10px] text-blue-400 font-bold uppercase">{car.category} Segment</p>
                      <p className="text-xs font-bold text-blue-600 mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Data Rows */}
            {/* 1. Seats */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Số chỗ ngồi</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900">
                  {comparedCars[idx] ? `${comparedCars[idx].seats} chỗ` : '-'}
                </div>
              ))}
            </div>

            {/* 2. Range */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Quãng đường (Range)</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900 font-bold text-blue-600">
                  {comparedCars[idx] ? `${comparedCars[idx].range} km` : '-'}
                </div>
              ))}
            </div>

            {/* 3. Power */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Công suất động cơ</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900">
                  {comparedCars[idx] ? `${comparedCars[idx].power || 43} hp (mã lực)` : '-'}
                </div>
              ))}
            </div>

            {/* 4. Battery Type */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Loại & Dung lượng pin</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900">
                  {comparedCars[idx] 
                    ? `${comparedCars[idx].specs?.batteryType || 'LFP'} (${comparedCars[idx].specs?.batteryCapacity || '37.2 kWh'})` 
                    : '-'}
                </div>
              ))}
            </div>

            {/* 5. Charging Time */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Thời gian sạc nhanh</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900">
                  {comparedCars[idx] ? comparedCars[idx].specs?.chargingTime : '-'}
                </div>
              ))}
            </div>

            {/* 6. Dimensions */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Kích thước DxRxC</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900">
                  {comparedCars[idx] ? comparedCars[idx].specs?.dimensions : '-'}
                </div>
              ))}
            </div>

            {/* 7. Ground clearance */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Khoảng sáng gầm</div>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 border-l border-gray-100 text-center text-gray-900 font-bold">
                  {comparedCars[idx] ? comparedCars[idx].specs?.groundClearance : '-'}
                </div>
              ))}
            </div>

            {/* 8. ADAS packages */}
            <div className="grid grid-cols-4 text-xs">
              <div className="p-4 font-bold text-gray-600 bg-gray-50">Công nghệ lái ADAS</div>
              {Array.from({ length: 3 }).map((_, idx) => {
                const car = comparedCars[idx];
                return (
                  <div key={idx} className="p-4 border-l border-gray-100 text-left text-[10px]">
                    {car ? (
                      <div className="flex flex-wrap gap-1">
                        {car.specs?.adas && car.specs.adas.map((ad: string, i: number) => (
                          <span key={i} className="bg-blue-50 border border-vinfast-blue/20 text-blue-400 px-2 py-0.5 rounded">
                            {ad}
                          </span>
                        )) || 'Cơ bản'}
                      </div>
                    ) : '-'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
