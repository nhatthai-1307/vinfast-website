import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'shipping', label: 'Đang bàn giao', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'completed', label: 'Hoàn thành', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getStatusStyle = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color || 'bg-gray-500/10 text-gray-400';
  };
  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
  };

  const filteredOrders = filterStatus ? orders.filter((o) => o.orderStatus === filterStatus) : orders;

  return (
    <div className="text-gray-900 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" /> QUẢN LÝ ĐƠN ĐẶT CỌC
          </h2>
          <p className="text-xs text-gray-500 mt-1">Theo dõi và cập nhật trạng thái đơn cọc xe của khách hàng.</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 uppercase text-[10px]">
                  <th className="px-5 py-4">Mã đơn hàng</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Dòng xe đặt cọc</th>
                  <th className="px-5 py-4">Tiền cọc</th>
                  <th className="px-5 py-4">Ngày đặt</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-blue-600 font-bold">{ord.orderNumber}</td>
                      <td className="px-5 py-4">
                        <p className="text-gray-900 font-semibold">{ord.customerInfo?.name}</p>
                        <p className="text-[10px] text-gray-400">{ord.customerInfo?.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-900 font-semibold">{ord.car?.name}</p>
                        <p className="text-[10px] text-gray-500">{ord.selectedColor}</p>
                      </td>
                      <td className="px-5 py-4 text-green-400 font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.depositAmount)}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(ord.orderStatus)}`}>
                          {getStatusLabel(ord.orderStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
