import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Đã cập nhật vai trò người dùng');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật vai trò');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${userName}"?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Đã xóa người dùng');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi xóa người dùng');
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return 'bg-red-50 text-red-600 border border-red-200';
    if (role === 'staff') return 'bg-blue-50 text-blue-600 border border-blue-200';
    return 'bg-green-50 text-green-600 border border-green-200';
  };
  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'staff') return 'Nhân viên tư vấn';
    return 'Khách hàng';
  };

  const filteredUsers = filterRole ? users.filter((u) => u.role === filterRole) : users;

  return (
    <div className="text-gray-900 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> QUẢN LÝ NGƯỜI DÙNG
          </h2>
          <p className="text-xs text-gray-500 mt-1">Tổng cộng {users.length} tài khoản trong hệ thống.</p>
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="admin">Quản trị viên</option>
          <option value="staff">Nhân viên</option>
          <option value="customer">Khách hàng</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-xl text-center shadow-sm">
          <p className="text-xl font-extrabold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Quản trị viên</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-xl text-center shadow-sm">
          <p className="text-xl font-extrabold text-blue-600">{users.filter(u => u.role === 'staff').length}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Nhân viên tư vấn</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-xl text-center shadow-sm">
          <p className="text-xl font-extrabold text-green-600">{users.filter(u => u.role === 'customer').length}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Khách hàng</p>
        </div>
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
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Điện thoại</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4 text-center">Đơn cọc</th>
                  <th className="px-5 py-4">Ngày đăng ký</th>
                  <th className="px-5 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      Không có người dùng nào.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u._id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="text-gray-900 font-semibold block">{u.name}</span>
                            {u.isEmailConfirmed && (
                              <span className="text-[9px] text-green-500 font-medium">✓ Đã xác thực</span>
                            )}
                            {!u.isEmailConfirmed && (
                              <span className="text-[9px] text-orange-500 font-medium">⏳ Chưa xác thực</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{u.email}</td>
                      <td className="px-5 py-4 text-gray-600">{u.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer focus:outline-none ${getRoleBadge(u.role)}`}
                        >
                          <option value="customer">Khách hàng</option>
                          <option value="staff">Nhân viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-900 font-bold">{u.ordersCount || 0}</td>
                      <td className="px-5 py-4 text-gray-500 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
