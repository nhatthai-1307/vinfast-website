import { create } from 'zustand';

interface BookingState {
  selectedCar: any | null;
  selectedColor: any | null;
  orderType: 'deposit' | 'full-purchase'; // ĐẶT CỌC hoặc MUA NGAY
  purchaseOption: 'buy-battery' | 'rent-battery';
  paymentMethod: 'full-payment' | 'installment';
  paymentGateway: 'vnpay' | 'momo' | 'bank-transfer'; // Cổng thanh toán
  installmentDetails: {
    prepaidPercent: number;
    months: number;
    bank: string;
  };
  showroom: string;
  depositAmount: number;

  setBookingCar: (car: any) => void;
  setBookingColor: (color: any) => void;
  setOrderType: (type: 'deposit' | 'full-purchase') => void;
  setPurchaseOption: (option: 'buy-battery' | 'rent-battery') => void;
  setPaymentMethod: (method: 'full-payment' | 'installment') => void;
  setPaymentGateway: (gw: 'vnpay' | 'momo' | 'bank-transfer') => void;
  setInstallmentDetails: (details: any) => void;
  setShowroom: (showroom: string) => void;
  setDepositAmount: (amount: number) => void;
  clearBooking: () => void;
}

export const useCartStore = create<BookingState>((set) => ({
  selectedCar: null,
  selectedColor: null,
  orderType: 'deposit',
  purchaseOption: 'rent-battery',
  paymentMethod: 'full-payment',
  paymentGateway: 'vnpay',
  installmentDetails: {
    prepaidPercent: 20,
    months: 60,
    bank: 'BIDV',
  },
  showroom: 'VinFast Showroom Landmark 81, TP.HCM',
  depositAmount: 10000000,

  setBookingCar: (car) =>
    set({
      selectedCar: car,
      selectedColor: car.colors && car.colors.length > 0 ? car.colors[0] : null,
      depositAmount: car.slug === 'vf-3' || car.slug === 'vf-5' ? 10000000 : 50000000,
    }),
  setBookingColor: (color) => set({ selectedColor: color }),
  setOrderType: (orderType) => set({ orderType }),
  setPurchaseOption: (purchaseOption) => set({ purchaseOption }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setPaymentGateway: (paymentGateway) => set({ paymentGateway }),
  setInstallmentDetails: (details) =>
    set((state) => ({
      installmentDetails: { ...state.installmentDetails, ...details },
    })),
  setShowroom: (showroom) => set({ showroom }),
  setDepositAmount: (depositAmount) => set({ depositAmount }),
  clearBooking: () =>
    set({
      selectedCar: null,
      selectedColor: null,
      orderType: 'deposit',
      purchaseOption: 'rent-battery',
      paymentMethod: 'full-payment',
      paymentGateway: 'vnpay',
      installmentDetails: { prepaidPercent: 20, months: 60, bank: 'BIDV' },
      showroom: 'VinFast Showroom Landmark 81, TP.HCM',
      depositAmount: 10000000,
    }),
}));

export default useCartStore;
