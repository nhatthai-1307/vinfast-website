import React, { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Save, Calendar, Percent, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountAmount: '',
    discountPercentage: '',
    expiryDate: '',
    description: '',
    isActive: true,
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data.promotions);
    } catch (err) {
      toast.error('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenAdd = () => {
    setEditingPromotion(null);
    setForm({
      code: '',
      discountAmount: '',
      discountPercentage: '',
      expiryDate: '',
      description: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (promo: any) => {
    setEditingPromotion(promo);
    // Format date string to fit <input type="date"> (YYYY-MM-DD)
    const rawDate = new Date(promo.expiryDate);
    const dateStr = rawDate.toISOString().split('T')[0];

    setForm({
      code: promo.code,
      discountAmount: promo.discountAmount?.toString() || '',
      discountPercentage: promo.discountPercentage?.toString() || '',
      expiryDate: dateStr,
      description: promo.description,
      isActive: promo.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã khuyến mãi "${code}" không?`)) return;
    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Xóa mã khuyến mãi thành công');
      fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleToggleActive = async (promo: any) => {
    try {
      await api.put(`/promotions/${promo._id}`, { isActive: !promo.isActive });
      toast.success(`Đã ${!promo.isActive ? 'kích hoạt' : 'tạm dừng'} mã "${promo.code}"`);
      fetchPromotions();
    } catch (err: any) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.expiryDate || !form.description) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (!form.discountAmount && !form.discountPercentage) {
      toast.error('Vui lòng nhập giá trị giảm giá (số tiền hoặc phần trăm)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code,
        discountAmount: form.discountAmount ? Number(form.discountAmount) : 0,
        discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : 0,
        expiryDate: form.expiryDate,
        description: form.description,
        isActive: form.isActive,
      };

      if (editingPromotion) {
        await api.put(`/promotions/${editingPromotion._id}`, payload);
        toast.success('Cập nhật mã khuyến mãi thành công!');
      } else {
        await api.post('/promotions', payload);
        toast.success('Thêm mã khuyến mãi thành công!');
      }
      setShowModal(false);
      fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-gray-900 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Tag className="w-6 h-6 text-blue-600" /> QUẢN LÝ MÃ KHUYẾN MÃI / VOUCHER
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý, tạo mới và kích hoạt các mã giảm giá áp dụng khi khách hàng đặt mua hoặc thuê xe.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-electric flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-lg"
        >
          <Plus className="w-4 h-4" /> Thêm Mã Khuyến Mãi
        </button>
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
                  <th className="px-5 py-4">Mã Code</th>
                  <th className="px-5 py-4">Mô tả chương trình</th>
                  <th className="px-5 py-4">Giá trị giảm giá</th>
                  <th className="px-5 py-4">Ngày hết hạn</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Không có mã khuyến mãi nào tồn tại.
                    </td>
                  </tr>
                ) : (
                  promotions.map((promo) => {
                    const isExpired = new Date(promo.expiryDate) < new Date();
                    return (
                      <tr key={promo._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-blue-600 text-sm tracking-wider">{promo.code}</p>
                          <p className="text-[10px] text-gray-400">ID: {promo._id.slice(-6)}</p>
                        </td>
                        <td className="px-5 py-4 max-w-[200px] truncate text-gray-600">
                          {promo.description}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {promo.discountPercentage > 0 ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <Percent className="w-4 h-4" /> Giảm {promo.discountPercentage}%
                            </span>
                          ) : (
                            <span className="text-blue-600">Giảm {fmt(promo.discountAmount)}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className={`font-semibold ${isExpired ? 'text-red-400' : 'text-gray-900'}`}>
                            {new Date(promo.expiryDate).toLocaleDateString('vi-VN')}
                          </p>
                          {isExpired && (
                            <span className="text-[9px] text-red-500 font-bold uppercase flex items-center gap-0.5 mt-0.5">
                              <AlertCircle className="w-3 h-3" /> Đã Hết Hạn
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleActive(promo)}
                            disabled={isExpired}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              isExpired
                                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                : promo.isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                            }`}
                          >
                            {isExpired ? 'Hết hạn' : promo.isActive ? 'Đang chạy' : 'Tạm dừng'}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(promo)}
                              className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(promo._id, promo.code)}
                              className="p-1.5 bg-red-500/15 hover:bg-red-500/30 rounded border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== FORM MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                {editingPromotion ? `Cập Nhật Mã: ${editingPromotion.code}` : 'Thêm Mã Khuyến Mãi Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Mã Code *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: VINFAST10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  disabled={!!editingPromotion}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 uppercase focus:outline-none focus:border-blue-500 disabled:opacity-55"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Giảm giá (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ví dụ: 10"
                    value={form.discountPercentage}
                    onChange={(e) => setForm({ ...form, discountPercentage: e.target.value, discountAmount: '' })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Giảm số tiền cố định (đ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 10000000"
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: e.target.value, discountPercentage: '' })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">
                * Lưu ý: Nhập phần trăm hoặc số tiền giảm giá. Khi điền ô này, ô kia sẽ tự động được làm trống.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Ngày hết hạn *</label>
                <input
                  type="date"
                  required
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Mô tả chương trình *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Nhập nội dung mô tả cho chương trình voucher..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-blue-600 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs text-gray-600 cursor-pointer">
                  Kích hoạt mã giảm giá ngay lập tức
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-electric flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu Lại'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-50 border border-gray-200 hover:bg-gray-100 px-5 rounded-lg text-xs font-bold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
