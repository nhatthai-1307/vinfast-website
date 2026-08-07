import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingBag, Calendar, Heart, User, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function ProfileDashboard() {
  const { user, updateProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'drives'>('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const ordersRes = await api.get('/orders/my-orders');
          setOrders(ordersRes.data.orders);

          const drivesRes = await api.get('/test-drives/my-drives');
          setDrives(drivesRes.data.drives);
        } catch (err) {
          console.error('Error fetching profile dashboard lists:', err);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const success = await updateProfile({ name, phone, avatar });
      if (success) {
        toast.success('Cập nhật hồ sơ thành công!');
      } else {
        toast.error('Cập nhật thất bại, vui lòng kiểm tra lại');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 mb-8">Bạn cần có tài khoản để truy cập trang cá nhân.</p>
        <a href="/login" className="btn-electric px-8 py-3">Đăng nhập tài khoản</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Tabs Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-2xl h-fit space-y-6">
          <div className="text-center space-y-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={user.name}
              className="w-20 h-20 rounded-full border border-blue-500 mx-auto object-cover shadow-sm"
            />
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">{user.name}</h3>
              <p className="text-[10px] text-blue-600 uppercase font-bold">{user.role} Account</p>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold w-full transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" /> Hồ sơ cá nhân
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold w-full transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Đơn đặt cọc ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('drives')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold w-full transition-all ${
                activeTab === 'drives'
                  ? 'bg-blue-600 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" /> Hẹn lái thử ({drives.length})
            </button>
          </nav>
        </div>

        {/* Right Side: Tab Viewports (Col span 3) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab 1: Profile form */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-blue-600 border-b border-gray-100 pb-3">HỒ SƠ CÁ NHÂN</h3>
              
              <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Địa chỉ email (Không thể thay đổi)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-gray-100 border border-gray-100 text-gray-400 rounded-lg px-3 py-2 text-xs cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại di động"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold block uppercase">Đường dẫn ảnh đại diện (Avatar URL)</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="URL liên kết hình ảnh avatar"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-electric py-2.5 px-6 text-xs font-bold uppercase"
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Orders list */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-blue-600 border-b border-gray-100 pb-3">ĐƠN ĐẶT CỌC XE ĐIỆN</h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Bạn chưa thực hiện giao dịch đặt cọc nào trực tuyến. 
                  <a href="/cars" className="text-blue-600 hover:underline font-bold block mt-2">Xem dòng xe điện ngay</a>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => {
                    let statusColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                    let statusText = 'Chờ xử lý';
                    
                    if (ord.orderStatus === 'confirmed') {
                      statusColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      statusText = 'Đã xác nhận cọc';
                    } else if (ord.orderStatus === 'shipping') {
                      statusColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                      statusText = 'Đang bàn giao showroom';
                    } else if (ord.orderStatus === 'completed') {
                      statusColor = 'bg-green-500/10 text-green-400 border-green-500/20';
                      statusText = 'Đã nhận xe';
                    } else if (ord.orderStatus === 'cancelled') {
                      statusColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                      statusText = 'Đã hủy cọc';
                    }

                    return (
                      <div key={ord._id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3 text-xs">
                          <div>
                            <p className="text-gray-900 font-bold">Mã đơn hàng: {ord.orderNumber}</p>
                            <p className="text-[10px] text-gray-400">Ngày đặt cọc: {new Date(ord.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                            {statusText.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-gray-400 text-[10px] uppercase font-bold block">Thông tin dòng xe</span>
                            <span className="text-gray-900 font-bold">{ord.car?.name} ({ord.selectedColor})</span>
                            <span className="text-[10px] text-gray-500 block">{ord.purchaseOption === 'buy-battery' ? 'Đã kèm pin' : 'Thuê pin hàng tháng'}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 text-[10px] uppercase font-bold block">Thanh toán cọc</span>
                            <span className="text-blue-600 font-bold block">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.depositAmount)}
                            </span>
                            <span className="text-[10px] text-green-400 font-semibold block uppercase">Thanh toán thành công</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-gray-400 text-[10px] uppercase font-bold block">Showroom nhận bàn giao</span>
                            <span className="text-gray-900 flex items-start gap-1 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                              {ord.showroom}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Test drives schedule */}
          {activeTab === 'drives' && (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-blue-600 border-b border-gray-100 pb-3">LỊCH HẸN LÁI THỬ XE</h3>
              
              {drives.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Bạn chưa đăng ký lịch hẹn lái thử xe nào. 
                  <a href="/cars" className="text-blue-600 hover:underline font-bold block mt-2">Đăng ký lái thử ngay</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {drives.map((drv) => {
                    let badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                    let statusLabel = 'Chờ xác nhận';
                    if (drv.status === 'approved') {
                      badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      statusLabel = 'Đã phê duyệt lịch';
                    } else if (drv.status === 'completed') {
                      badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
                      statusLabel = 'Đã lái thử xong';
                    } else if (drv.status === 'cancelled') {
                      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                      statusLabel = 'Lịch hẹn đã hủy';
                    }

                    return (
                      <div key={drv._id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2 text-xs">
                          <h4 className="font-extrabold text-gray-900">Lái thử: {drv.car?.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border ${badgeColor}`}>
                            {statusLabel.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 text-[10px]">Thời gian hẹn:</p>
                            <p className="text-gray-900 font-bold">{new Date(drv.date).toLocaleDateString('vi-VN')} ({drv.timeSlot})</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-[10px]">Showroom tiếp đón:</p>
                            <p className="text-gray-900 font-bold">{drv.showroom}</p>
                          </div>
                        </div>

                        {drv.assignedStaff && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Nhân viên hỗ trợ: <strong>{drv.assignedStaff.name}</strong> (Hotline: {drv.assignedStaff.phone || '1900 23 23 89'})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
