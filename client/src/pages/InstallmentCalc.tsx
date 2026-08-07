import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calculator } from 'lucide-react';

export default function InstallmentCalc() {
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  
  // Calculator inputs
  const [carPrice, setCarPrice] = useState(468000000);
  const [prepaidPercent, setPrepaidPercent] = useState(20);
  const [loanMonths, setLoanMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(8); // Annual interest in %

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
            <div className="bg-blue-600 text-gray-900 p-8 rounded-2xl text-center space-y-2 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900/90">TRẢ GÓP HÀNG THÁNG ƯỚC TÍNH (TRUNG BÌNH)</h3>
              <p className="text-4xl sm:text-5xl font-black text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(monthlyPayment)}
                <span className="text-base font-normal"> / tháng</span>
              </p>
              <p className="text-[10px] text-gray-900/75 max-w-md mx-auto">
                * Tính toán dựa trên dư nợ giảm dần đều (PMT). Lãi suất thật tế có thể được điều chỉnh tùy thuộc vào chính sách liên kết của từng ngân hàng tại thời điểm nhận bàn giao xe.
              </p>
            </div>

            {/* Breakdown schedule of first 12 months */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">LỊCH TRÌNH TRẢ NỢ CHI TIẾT (12 THÁNG ĐẦU)</h3>
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
    </div>
  );
}
