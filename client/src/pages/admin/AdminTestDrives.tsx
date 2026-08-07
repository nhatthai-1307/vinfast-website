import React, { useState, useEffect } from 'react';
import { Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DRIVE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'approved', label: 'Đã duyệt lịch', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'completed', label: 'Đã lái thử xong', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'cancelled', label: 'Đã hủy lịch', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function AdminTestDrives() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/test-drives');
      setDrives(res.data.drives);
    } catch (err) {
      toast.error('Không thể tải danh sách lịch lái thử');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleUpdateStatus = async (driveId: string, newStatus: string) => {
    try {
      await api.put(`/test-drives/${driveId}/status`, { status: newStatus });
      toast.success('Cập nhật trạng thái lịch lái thử thành công!');
      fetchDrives();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const getStatusStyle = (status: string) => DRIVE_STATUS_OPTIONS.find((s) => s.value === status)?.color || '';
  const getStatusLabel = (status: string) => DRIVE_STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

  const filteredDrives = filterStatus ? drives.filter((d) => d.status === filterStatus) : drives;

  return (
    <div className="text-gray-900 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> QUẢN LÝ LỊCH LÁI THỬ
          </h2>
          <p className="text-xs text-gray-500 mt-1">Xem xét, phê duyệt và chỉ định nhân viên cho các buổi lái thử xe.</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          {DRIVE_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Dòng xe lái thử</th>
                  <th className="px-5 py-4">Ngày & Giờ hẹn</th>
                  <th className="px-5 py-4">Showroom tiếp đón</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Không có lịch đăng ký lái thử nào.
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drv) => (
                    <tr key={drv._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-gray-900 font-semibold">{drv.customerInfo?.name}</p>
                        <p className="text-[10px] text-gray-500">{drv.customerInfo?.phone}</p>
                        <p className="text-[10px] text-gray-400">{drv.customerInfo?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-900 font-semibold">{drv.car?.name}</p>
                        <p className="text-[10px] text-blue-600">{drv.car?.category}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-900 font-bold">{new Date(drv.date).toLocaleDateString('vi-VN')}</p>
                        <p className="text-[10px] text-gray-500">{drv.timeSlot}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-[180px]">
                        <p className="truncate">{drv.showroom}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(drv.status)}`}>
                          {getStatusLabel(drv.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <select
                          value={drv.status}
                          onChange={(e) => handleUpdateStatus(drv._id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {DRIVE_STATUS_OPTIONS.map((s) => (
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
