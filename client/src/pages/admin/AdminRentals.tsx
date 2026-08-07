import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Chờ xác nhận',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'confirmed', label: 'Đã xác nhận',   color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'active',    label: 'Đang thuê',      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'completed', label: 'Đã trả xe',      color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'cancelled', label: 'Đã hủy',         color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function AdminRentals() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rentals');
      setRentals(res.data.rentals);
    } catch {
      // Demo data nếu API chưa có dữ liệu
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRentals(); }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/rentals/${id}/status`, { status });
      toast.success('Cập nhật trạng thái thành công!');
      fetchRentals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getStatusStyle = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.color || '';
  const getStatusLabel = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.label || s;

  const filtered = filterStatus ? rentals.filter(r => r.status === filterStatus) : rentals;

  return (
    <div className="text-gray-900 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" /> QUẢN LÝ ĐƠN THUÊ XE
          </h2>
          <p className="text-xs text-gray-500 mt-1">Theo dõi, xác nhận và cập nhật trạng thái các đơn thuê xe.</p>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {STATUS_OPTIONS.map(s => (
          <div key={s.value} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold text-gray-900">{rentals.filter(r => r.status === s.value).length}</p>
            <p className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 uppercase text-[10px]">
                  <th className="px-5 py-4">Mã thuê</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Dòng xe</th>
                  <th className="px-5 py-4">Thời gian thuê</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Tuỳ chọn</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400">
                      {rentals.length === 0 ? 'Chưa có đơn thuê xe nào. Đơn mới sẽ hiển thị ở đây.' : 'Không có đơn nào khớp bộ lọc.'}
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-blue-600 font-bold text-[10px]">{r.rentalNumber}</td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 font-semibold">{r.customerInfo?.name}</p>
                      <p className="text-[10px] text-gray-400">{r.customerInfo?.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 font-semibold">{r.car?.name || r.car}</p>
                      {r.withDriver && <span className="text-[9px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded font-bold">Có tài xế</span>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 text-[10px]">{new Date(r.pickupDate).toLocaleDateString('vi-VN')}</p>
                      <p className="text-gray-500 text-[10px]">→ {new Date(r.returnDate).toLocaleDateString('vi-VN')}</p>
                      <p className="text-blue-600 font-bold text-[10px]">{r.totalDays} ngày</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-green-400 font-bold">{fmt(r.totalAmount)}</p>
                      <p className="text-[10px] text-gray-500">Cọc: {fmt(r.depositPaid)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5 text-[9px] text-gray-500">
                        {r.withDriver && <p>🧑‍✈️ Có tài xế</p>}
                        {r.deliveryAddress && <p>🚚 Giao tận nơi</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <select
                        value={r.status}
                        onChange={e => handleUpdateStatus(r._id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
