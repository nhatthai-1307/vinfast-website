import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calculator, ArrowRight, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-toastify';

export default function InstallmentCalc() {
  const navigate = useNavigate();
  const { setBookingCar, setPaymentMethod, setInstallmentDetails } = useCartStore();

  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  
  // Calculator inputs
  const [carPrice, setCarPrice] = useState(468000000);
  const [prepaidPercent, setPrepaidPercent] = useState(20);
  const [loanMonths, setLoanMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(8); // Annual interest in %

  // Modal states
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');

  const handleApplyInstallment = () => {
    if (!selectedCar) {
      toast.warning('Vui lòng chọn xe');
      return;
    }
    setBookingCar(selectedCar);
    setPaymentMethod('installment');
    setInstallmentDetails({
      prepaidPercent,
      months: loanMonths,
      bank: 'BIDV',
    });
    toast.success(`Đã chọn gói trả góp cho ${selectedCar.name}! Đang chuyển đến đặt cọc...`);
    navigate('/booking');
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultName || !consultPhone) {
      toast.error('Vui lòng nhập đầy đủ họ tên và số điện thoại');
      return;
    }
    setShowConsultModal(false);
    toast.success(`Cảm ơn ${consultName}! Chuyên viên VinFast sẽ liên hệ số ${consultPhone} trong 15 phút.`);
    setConsultName('');
    setConsultPhone('');
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get('/cars');
        setCars(res.data.cars);
        if (res.data.cars.length > 0) {
          setSelectedCar(res.data.cars[0]);
          setCarPrice(res.data.cars[0].price);
        }
      } catch (err) {
        console.error('Error loading cars for calculator:', err);
      }
    };
    fetchCars();
  }, []);

  const handleCarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const carId = e.target.value;
    const car = cars.find((c) => c._id === carId);
    if (car) {
      setSelectedCar(car);
      setCarPrice(car.price);
    }
  };

  // Math variables
  const prepaidAmount = (carPrice * prepaidPercent) / 100;
  const loanAmount = carPrice - prepaidAmount;
  const monthlyInterestRate = (interestRate / 100) / 12;
  
  // PMT formula: Monthly Payment
  const monthlyPayment =
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanMonths)) /
    (Math.pow(1 + monthlyInterestRate, loanMonths) - 1);

  const totalPayment = monthlyPayment * loanMonths;
  const totalInterest = totalPayment - loanAmount;

  // Generate detailed first 12 months amortization schedule
  const generateSchedule = () => {
    const list = [];
    const monthlyPrincipal = loanAmount / loanMonths;
    let remainingBalance = loanAmount;

    for (let i = 1; i <= Math.min(12, loanMonths); i++) {
      const interest = remainingBalance * monthlyInterestRate;
      const total = monthlyPrincipal + interest;
      remainingBalance -= monthlyPrincipal;
      
      list.push({
        month: i,
        principal: monthlyPrincipal,
        interest: interest,
        total: total,
        balance: Math.max(0, remainingBalance),
      });
    }
    return list;
  };

  const schedule = generateSchedule();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900">
        {/* Title */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 text-gray-900">
            <Calculator className="w-10 h-10 text-blue-600" />
            CÔNG CỤ TÍNH TRẢ GÓP VINFAST
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-xs">
            Hoạch định tài chính mua xe điện VinFast thông minh. Tính toán số tiền gốc, tiền lãi chi tiết mỗi tháng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form controls (Col span 1) */}
          <div className="lg:col-span-1 bg-white border border-gray-100 shadow-sm p-6 rounded-2xl space-y-6 h-fit">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">THÔNG TIN GÓI VAY</h3>

            {/* Car selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-600 font-bold uppercase block">Chọn dòng xe VinFast</label>
              <select
                onChange={handleCarChange}
                value={selectedCar?._id || ''}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {cars.map((car) => (
                  <option key={car._id} value={car._id}>{car.name}</option>
                ))}
              </select>
            </div>

            {/* Car price direct input override */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-600 font-bold uppercase block">Giá bán xe (VNĐ)</label>
              <input
                type="number"
                value={carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Prepaid percent slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Trả trước: {prepaidPercent}%</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prepaidAmount)}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="10"
                value={prepaidPercent}
                onChange={(e) => setPrepaidPercent(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Term months slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Thời hạn vay: {loanMonths} tháng</span>
                <span className="font-bold text-gray-900">{Math.round(loanMonths / 12)} năm</span>
              </div>
              <input
                type="range"
                min="12"
                max="96"
                step="12"
                value={loanMonths}
                onChange={(e) => setLoanMonths(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Annual Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Lãi suất năm: {interestRate}%</span>
                <span className="font-bold text-gray-900">Cố định</span>
              </div>
              <input
                type="range"
                min="4"
                max="15"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            {/* Consultation & Loan Application Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <button
                onClick={handleApplyInstallment}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Tiến hành mua trả góp</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowConsultModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Đăng ký tư vấn hồ sơ vay miễn phí</span>
              </button>
              
              <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                Hỗ trợ duyệt vay nhanh trong 15 phút qua các ngân hàng đối tác liên kết: BIDV, Vietcombank, Techcombank, VPBank.
              </p>
            </div>
          </div>

          {/* Right Output Panel (Col span 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 shadow-sm p-5 rounded-xl text-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Gốc cần vay</span>
                <span className="text-lg font-black text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(loanAmount)}
                </span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-5 rounded-xl text-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tổng tiền lãi phải trả</span>
                <span className="text-lg font-black text-red-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInterest)}
                </span>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-5 rounded-xl text-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tổng tiền gốc + lãi</span>
                <span className="text-lg font-black text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPayment)}
                </span>
              </div>
            </div>

            {/* Large Monthly Repayment callout */}
            <div className="bg-blue-600 text-white p-8 rounded-2xl text-center space-y-2 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">TRẢ GÓP HÀNG THÁNG ƯỚC TÍNH (TRUNG BÌNH)</h3>
              <p className="text-4xl sm:text-5xl font-black text-white">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(monthlyPayment)}
                <span className="text-base font-normal"> / tháng</span>
              </p>
              <p className="text-[11px] text-white/80 max-w-md mx-auto">
                * Tính toán dựa trên dư nợ giảm dần đều (PMT). Lãi suất thực tế được áp dụng theo chương trình ưu đãi của ngân hàng tại thời điểm ký kết hợp đồng.
              </p>
            </div>

            {/* Breakdown schedule of first 12 months */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">LỊCH TRÌNH TRẢ NỢ CHI TIẾT (12 THÁNG ĐẦU)</h3>
                <button
                  onClick={handleApplyInstallment}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  <span>Nộp hồ sơ ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                      <th className="px-4 py-3 text-center">Kỳ hạn</th>
                      <th className="px-4 py-3">Tiền gốc hàng tháng</th>
                      <th className="px-4 py-3">Tiền lãi giảm dần</th>
                      <th className="px-4 py-3 font-bold text-blue-600">Tổng gốc + lãi</th>
                      <th className="px-4 py-3">Dư nợ gốc còn lại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 text-center text-gray-900 font-bold">Tháng {row.month}</td>
                        <td className="px-4 py-3.5 text-gray-700">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.principal)}
                        </td>
                        <td className="px-4 py-3.5 text-red-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.interest)}
                        </td>
                        <td className="px-4 py-3.5 text-blue-600 font-bold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.total)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Đăng Ký Tư Vấn Hồ Sơ Vay</h3>
              </div>
              <button
                onClick={() => setShowConsultModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Chuyên viên tài chính VinFast sẽ liên hệ trong vòng 15 phút để tư vấn gói vay ưu đãi nhất cho mẫu xe <strong className="text-gray-900">{selectedCar?.name || 'VinFast'}</strong>.
            </p>

            <form onSubmit={handleConsultSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={consultName}
                  onChange={(e) => setConsultName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Số điện thoại nhận tư vấn *</label>
                <input
                  type="tel"
                  required
                  value={consultPhone}
                  onChange={(e) => setConsultPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2.5 rounded-lg text-center">
                  <span className="text-[10px] text-gray-500 block">Số tiền vay</span>
                  <span className="font-bold text-xs text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(loanAmount)} đ
                  </span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg text-center">
                  <span className="text-[10px] text-gray-500 block">Thời hạn</span>
                  <span className="font-bold text-xs text-gray-900">{loanMonths} tháng</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConsultModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  Xác nhận gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
