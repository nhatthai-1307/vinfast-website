import { create } from 'zustand';

interface Car {
  _id: string;
  name: string;
  slug: string;
  price: number;
  batteryRentPrice: number;
  category: string;
  seats: number;
  range: number;
  power?: number;
  colors: Array<{ name: string; code: string; images: string[] }>;
  specs: {
    engine?: string;
    batteryType?: string;
    batteryCapacity?: string;
    chargingTime?: string;
    torque?: string;
    acceleration?: string;
    airbags?: number;
    adas?: string[];
    dimensions?: string;
    groundClearance?: string;
  };
}

interface CompareState {
  comparedCars: Car[];
  addCar: (car: Car) => boolean;
  removeCar: (carId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  comparedCars: [],
  
  addCar: (car) => {
    const list = get().comparedCars;
    // Limit to 3 cars maximum
    if (list.length >= 3) {
      return false;
    }
    // Avoid duplicates
    if (list.some((item) => item._id === car._id)) {
      return true;
    }
    set({ comparedCars: [...list, car] });
    return true;
  },

  removeCar: (carId) => {
    set({
      comparedCars: get().comparedCars.filter((car) => car._id !== carId),
    });
  },

  clearCompare: () => {
    set({ comparedCars: [] });
  },
}));
export default useCompareStore;
