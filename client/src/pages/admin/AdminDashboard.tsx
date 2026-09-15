import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Car, ShoppingCart, Calendar, TrendingUp, DollarSign, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const COLORS = ['#103F91', '#00F2FE', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentDrives, setRecentDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setRecentOrders(res.data.recentOrders);
        setRecentDrives(res.data.recentTestDrives);
      } catch (err) {
        console.error('Error fetching admin dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // KPI Card data
  const kpiCards = [
    {
      label: 'Tổng doanh thu cọc',
      value: formatCurrency(stats?.totalDepositRevenue || 0),
      icon: DollarSign,
      iconBg: 'bg-green-500/15 border-green-500/25',
      iconColor: 'text-green-500',
      link: '/admin/orders',
    },
    {
      label: 'Đơn đặt cọc xe',
      value: `${stats?.totalOrders || 0} đơn`,
      icon: ShoppingCart,
      iconBg: 'bg-blue-50 border-blue-500/25',
      iconColor: 'text-blue-600',
      link: '/admin/orders',
    },
    {
      label: 'Khách hàng đăng ký',
      value: `${stats?.totalUsers || 0} tài khoản`,
      icon: Users,
      iconBg: 'bg-purple-500/15 border-purple-500/25',
      iconColor: 'text-purple-500',
      link: '/admin/users',
    },
    {
      label: 'Yêu cầu lái thử',
      value: `${stats?.totalTestDrives || 0} lượt hẹn`,
      icon: Calendar,
      iconBg: 'bg-yellow-500/15 border-yellow-500/25',
      iconColor: 'text-yellow-500',
      link: '/admin/test-drives',
    },
  ];

  return (
    <div className="space-y-8 text-gray-900">
      {/* 1. KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.link)}
            className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center justify-between shadow-md cursor-pointer hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">{card.label}</span>
              <span className="text-xl font-extrabold text-gray-900">{card.value}</span>
              <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Xem chi tiết <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className={`w-12 h-12 ${card.iconBg} border rounded-xl flex items-center justify-center ${card.iconColor}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Recharts Area & Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Revenue over time (Col span 2) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Doanh Thu Đặt Cọc Theo Tháng (VNĐ)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#103F91" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={(tick) => `${tick / 1000000}tr`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#00F2FE" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Car Model Distribution (Col span 1) */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Tỷ Lệ Mẫu Xe Đặt Mua
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.carSalesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts?.carSalesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Recent bookings & Test drives list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Đơn Đặt Cọc Gần Đây
          </h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Chưa có đơn cọc nào.</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-gray-900 font-bold">{ord.customerInfo.name}</p>
                    <p className="text-[10px] text-gray-500">Đặt xe: {ord.car?.name} - {new Date(ord.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <span className="font-extrabold text-blue-600">
                    {formatCurrency(ord.depositAmount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Test drive bookings */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Lịch Hẹn Lái Thử Mới Đăng Ký
          </h3>
          <div className="space-y-3">
            {recentDrives.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Chưa có lịch đăng ký lái thử nào.</p>
            ) : (
              recentDrives.map((drv) => (
                <div key={drv._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-gray-900 font-bold">{drv.customerInfo.name} ({drv.customerInfo.phone})</p>
                    <p className="text-[10px] text-gray-500">Đăng ký: {drv.car?.name} tại {drv.showroom.replace('VinFast Showroom ', '')}</p>
                  </div>
                  <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                    {new Date(drv.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
