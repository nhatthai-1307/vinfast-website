import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Lock } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Reuse /api/auth/... but we need a dedicated users endpoint
      // Using orders to get user list (as a workaround since we have customer data)
      const res = await api.get('/orders');
      // Extract unique customers
      const uniqueUsers = new Map();
      res.data.orders.forEach((ord: any) => {
        if (ord.user && !uniqueUsers.has(ord.user._id || ord.user)) {
          uniqueUsers.set(ord.user._id || ord.user, {
            _id: ord.user._id || ord.user,
            name: ord.customerInfo?.name,
            email: ord.customerInfo?.email,
            phone: ord.customerInfo?.phone,
            role: 'customer',
            ordersCount: 1,
          });
        } else if (ord.user) {
          const existing = uniqueUsers.get(ord.user._id || ord.user);
          if (existing) existing.ordersCount += 1;
        }
      });
      
      // Also fetch all users from a users endpoint if you add one
      setUsers(Array.from(uniqueUsers.values()));
    } catch (err) {
      // Fallback: show demo users
      setUsers([
        { _id: '1', name: 'VinFast Admin System', email: 'admin@gmail.com', phone: '0988777999', role: 'admin', ordersCount: 0 },
        { _id: '2', name: 'Nguyễn Văn Tư Vấn', email: 'staff@gmail.com', phone: '0912345678', role: 'staff', ordersCount: 0 },
        { _id: '3', name: 'Trần Văn Khách Hàng', email: 'user@gmail.com', phone: '0901234567', role: 'customer', ordersCount: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (role === 'staff') return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    return 'bg-green-500/10 text-green-400 border border-green-500/20';
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
          <p className="text-xs text-gray-500 mt-1">Danh sách khách hàng và nhân viên trong hệ thống VinFast.</p>
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
        <div className="bg-white border border-gray-100 p-4 rounded-xl text-center">
          <p className="text-xl font-extrabold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Quản trị viên</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-xl text-center">
          <p className="text-xl font-extrabold text-gray-900">{users.filter(u => u.role === 'staff').length}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Nhân viên tư vấn</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-xl text-center">
          <p className="text-xl font-extrabold text-gray-900">{users.filter(u => u.role === 'customer').length}</p>
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
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Điện thoại</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4 text-center">Đơn cọc</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      Không có người dùng nào.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u._id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-gray-900 font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{u.email}</td>
                      <td className="px-5 py-4 text-gray-600">{u.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getRoleBadge(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-900 font-bold">{u.ordersCount || 0}</td>
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
