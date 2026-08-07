import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Car } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY_CAR_FORM = {
  name: '',
  slug: '',
  price: '',
  batteryRentPrice: '',
  category: 'B-SUV',
  seats: 5,
  range: 400,
  power: 200,
  description: '',
  videoUrl: '',
  isFeatured: false,
  isNewest: false,
  stock: 10,
  colors: [] as any[],
};

export default function AdminCars() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_CAR_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cars');
      setCars(res.data.cars);
    } catch (err) {
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setForm(EMPTY_CAR_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (car: any) => {
    setEditingCar(car);
    setForm({
      name: car.name,
      slug: car.slug,
      price: car.price,
      batteryRentPrice: car.batteryRentPrice,
      category: car.category,
      seats: car.seats,
      range: car.range,
      power: car.power || 200,
      description: car.description,
      videoUrl: car.videoUrl || '',
      isFeatured: car.isFeatured,
      isNewest: car.isNewest,
      stock: car.stock,
      colors: car.colors || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (carId: string, carName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dòng xe "${carName}" không?`)) return;
    try {
      await api.delete(`/cars/${carId}`);
      toast.success(`Đã xóa dòng xe ${carName}`);
      fetchCars();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        batteryRentPrice: Number(form.batteryRentPrice),
        seats: Number(form.seats),
        range: Number(form.range),
        power: Number(form.power),
        stock: Number(form.stock),
        // Auto-generate slug from name if empty
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      };

      if (editingCar) {
        await api.put(`/cars/${editingCar._id}`, payload);
        toast.success('Cập nhật thông tin xe thành công!');
      } else {
        await api.post('/cars', payload);
        toast.success('Thêm dòng xe mới thành công!');
      }

      setShowModal(false);
      fetchCars();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-gray-900 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" /> QUẢN LÝ DANH MỤC XE ĐIỆN
          </h2>
          <p className="text-xs text-gray-500 mt-1">Thêm, sửa, xóa thông tin các dòng xe VinFast trong hệ thống.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-electric py-2.5 px-5 text-xs font-bold">
          <Plus className="w-4 h-4" /> Thêm xe mới
        </button>
      </div>

      {/* Cars Table */}
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
                  <th className="px-5 py-4">Dòng xe</th>
                  <th className="px-5 py-4">Phân khúc</th>
                  <th className="px-5 py-4">Giá bán</th>
                  <th className="px-5 py-4">Chỗ ngồi</th>
                  <th className="px-5 py-4">Tầm chạy</th>
                  <th className="px-5 py-4">Kho xe</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.colors?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=80&q=80'}
                          alt={car.name}
                          className="w-12 h-9 object-cover rounded-lg bg-gray-50"
                        />
                        <div>
                          <p className="text-gray-900 font-bold">{car.name}</p>
                          <p className="text-[10px] text-gray-400">{car.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-blue-600 font-semibold">{car.category}</td>
                    <td className="px-5 py-4 text-gray-900 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.price)}
                    </td>
                    <td className="px-5 py-4">{car.seats} chỗ</td>
                    <td className="px-5 py-4">{car.range} km</td>
                    <td className="px-5 py-4">
                      <span className={`font-bold ${car.stock > 5 ? 'text-green-400' : 'text-red-400'}`}>{car.stock} xe</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {car.isFeatured && <span className="bg-blue-50 text-blue-600 border border-vinfast-blue/30 px-2 py-0.5 rounded text-[9px] font-bold">NỔI BẬT</span>}
                        {car.isNewest && <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[9px] font-bold">MỚI</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(car)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Sửa thông tin xe"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(car._id, car.name)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
                          title="Xóa dòng xe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-2xl shadow-md p-6 space-y-5 my-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-blue-600 text-sm uppercase">
                {editingCar ? `Sửa thông tin: ${editingCar.name}` : 'Thêm dòng xe mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Tên dòng xe *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') })}
                    placeholder="VD: VinFast VF 8"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="VD: 1090000000"
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Phí thuê pin/tháng</label>
                  <input
                    type="number"
                    value={form.batteryRentPrice}
                    onChange={(e) => setForm({ ...form, batteryRentPrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Phân khúc *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    {['Mini', 'A-SUV', 'B-SUV', 'C-SUV', 'D-SUV', 'E-SUV'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Số chỗ ngồi</label>
                  <input
                    type="number"
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Quãng đường (km)</label>
                  <input
                    type="number"
                    value={form.range}
                    onChange={(e) => setForm({ ...form, range: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Công suất (hp)</label>
                  <input
                    type="number"
                    value={form.power}
                    onChange={(e) => setForm({ ...form, power: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Tồn kho</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block">Mô tả dòng xe</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-600">Xe nổi bật</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={form.isNewest}
                      onChange={(e) => setForm({ ...form, isNewest: e.target.checked })}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-600">Xe mới ra mắt</span>
                  </label>
                </div>

                {/* Color & Image Management Section */}
                <div className="col-span-2 border-t border-gray-100 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Quản lý màu sắc & Hình ảnh xe
                  </h4>

                  {/* List of existing colors */}
                  <div className="space-y-4">
                    {(form.colors || []).map((color: any, colorIdx: number) => (
                      <div key={colorIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span 
                              className="w-5 h-5 rounded-full border border-gray-200" 
                              style={{ backgroundColor: color.code }}
                            />
                            <span className="text-xs font-bold text-gray-900">{color.name} ({color.code})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newColors = form.colors.filter((_: any, idx: number) => idx !== colorIdx);
                              setForm({ ...form, colors: newColors });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-semibold"
                          >
                            Xóa màu
                          </button>
                        </div>

                        {/* List of images for this color */}
                        <div className="grid grid-cols-5 gap-2">
                          {(color.images || []).map((imgUrl: string, imgIdx: number) => (
                            <div key={imgIdx} className="relative aspect-video rounded-lg overflow-hidden bg-black/40 group border border-gray-100">
                              <img src={imgUrl} alt="Xe" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = color.images.filter((_: any, idx: number) => idx !== imgIdx);
                                  const updatedColors = form.colors.map((c: any, idx: number) => 
                                    idx === colorIdx ? { ...c, images: newImages } : c
                                  );
                                  setForm({ ...form, colors: updatedColors });
                                }}
                                className="absolute inset-0 bg-red-600/80 text-gray-900 text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                Xóa ảnh
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add image options */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          {/* File Upload Option */}
                          <div className="w-full sm:w-1/2 space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase block">Tải ảnh lên (File)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const uploadFormData = new FormData();
                                uploadFormData.append('images', file);
                                try {
                                  toast.info('Đang tải ảnh lên...');
                                  const res = await api.post('/upload', uploadFormData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                  });
                                  if (res.data.success && res.data.urls?.length > 0) {
                                    const newUrl = res.data.urls[0];
                                    const updatedColors = form.colors.map((c: any, idx: number) => 
                                      idx === colorIdx ? { ...c, images: [...c.images, newUrl] } : c
                                    );
                                    setForm({ ...form, colors: updatedColors });
                                    toast.success('Tải ảnh lên thành công!');
                                  }
                                } catch (err: any) {
                                  toast.error(err.response?.data?.message || 'Tải ảnh lên thất bại');
                                }
                              }}
                              className="w-full bg-white border border-gray-100 rounded-lg px-2 py-1 text-[11px] text-gray-500 focus:outline-none"
                            />
                          </div>

                          {/* URL Input Option */}
                          <div className="w-full sm:w-1/2 space-y-1">
                            <label className="text-[9px] text-gray-500 font-bold uppercase block">Nhập URL ảnh</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                id={`url-input-${colorIdx}`}
                                className="flex-1 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const inputEl = document.getElementById(`url-input-${colorIdx}`) as HTMLInputElement;
                                  const url = inputEl?.value.trim();
                                  if (!url) {
                                    toast.warn('Vui lòng dán URL ảnh');
                                    return;
                                  }
                                  const updatedColors = form.colors.map((c: any, idx: number) => 
                                    idx === colorIdx ? { ...c, images: [...c.images, url] } : c
                                  );
                                  setForm({ ...form, colors: updatedColors });
                                  if (inputEl) inputEl.value = '';
                                  toast.success('Đã thêm ảnh từ URL!');
                                }}
                                className="btn-electric px-3 py-1.5 text-xs font-bold whitespace-nowrap"
                              >
                                Thêm URL
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form to Add New Color */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h5 className="text-xs font-bold text-gray-900 uppercase block">Thêm màu sắc mới</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 font-bold uppercase block">Tên màu sắc *</label>
                        <input
                          type="text"
                          placeholder="VD: Trắng Bramble"
                          id="new-color-name"
                          className="w-full bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 font-bold uppercase block">Mã màu (Hex) *</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            id="new-color-picker"
                            defaultValue="#ffffff"
                            onChange={(e) => {
                              const hexInput = document.getElementById('new-color-hex') as HTMLInputElement;
                              if (hexInput) hexInput.value = e.target.value;
                            }}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-200 bg-transparent"
                          />
                          <input
                            type="text"
                            placeholder="#ffffff"
                            id="new-color-hex"
                            defaultValue="#ffffff"
                            className="flex-1 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const nameInput = document.getElementById('new-color-name') as HTMLInputElement;
                            const hexInput = document.getElementById('new-color-hex') as HTMLInputElement;
                            const name = nameInput?.value.trim();
                            const code = hexInput?.value.trim();

                            if (!name || !code) {
                              toast.warn('Vui lòng điền đủ tên và mã màu');
                              return;
                            }

                            const newColor = {
                              name,
                              code,
                              images: []
                            };

                            setForm({
                              ...form,
                              colors: [...(form.colors || []), newColor]
                            });

                            if (nameInput) nameInput.value = '';
                            if (hexInput) hexInput.value = '#ffffff';
                            const picker = document.getElementById('new-color-picker') as HTMLInputElement;
                            if (picker) picker.value = '#ffffff';
                            toast.success(`Đã thêm màu "${name}"!`);
                          }}
                          className="btn-electric w-full py-2 text-xs font-bold uppercase block text-center"
                        >
                          Thêm màu sắc
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="btn-electric flex-1 py-2.5 text-xs font-bold uppercase">
                  <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : (editingCar ? 'Cập nhật' : 'Thêm xe mới')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-50 border border-gray-200 hover:bg-gray-100 px-6 rounded-lg text-xs font-bold text-gray-900">
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
