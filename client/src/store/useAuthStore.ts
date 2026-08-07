import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
  avatar?: string;
  isEmailConfirmed?: boolean;
}

interface RegisterResult {
  success: boolean;
  requireOtp?: boolean;
  email?: string;
  otpCode?: string;
  message?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<{ success: boolean; requireOtp?: boolean; email?: string; otpCode?: string }>;
  register: (userData: any) => Promise<RegisterResult>;
  verifyOtp: (payload: { email: string; otpCode: string }) => Promise<boolean>;
  resendOtp: (email: string) => Promise<{ success: boolean; otpCode?: string; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (details: any) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Read initial values from localStorage
  const initialUser = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')!) 
    : null;
  const initialToken = localStorage.getItem('accessToken');

  // Listen to auth-expired event from API interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-expired', () => {
      set({ user: null, accessToken: null, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    });
  }

  return {
    user: initialUser,
    accessToken: initialToken,
    loading: false,
    error: null,

    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post('/auth/login', credentials);
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, accessToken, loading: false });
        return { success: true };
      } catch (err: any) {
        if (err.response?.data?.requireOtp) {
          set({ loading: false, error: err.response.data.message });
          return {
            success: false,
            requireOtp: true,
            email: err.response.data.email,
            otpCode: err.response.data.otpCode,
          };
        }
        const errMsg = err.response?.data?.message || 'Đăng nhập thất bại';
        set({ error: errMsg, loading: false });
        return { success: false };
      }
    },

    register: async (userData) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post('/auth/register', userData);
        set({ loading: false });
        return {
          success: true,
          requireOtp: res.data.requireOtp,
          email: res.data.email,
          otpCode: res.data.otpCode,
          message: res.data.message,
        };
      } catch (err: any) {
        const errMsg = err.response?.data?.message || 'Đăng ký thất bại';
        set({ error: errMsg, loading: false });
        return { success: false, message: errMsg };
      }
    },

    verifyOtp: async ({ email, otpCode }) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post('/auth/verify-otp', { email, otpCode });
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, accessToken, loading: false });
        return true;
      } catch (err: any) {
        const errMsg = err.response?.data?.message || 'Xác thực mã OTP thất bại';
        set({ error: errMsg, loading: false });
        return false;
      }
    },

    resendOtp: async (email) => {
      set({ error: null });
      try {
        const res = await api.post('/auth/resend-otp', { email });
        return {
          success: true,
          otpCode: res.data.otpCode,
          message: res.data.message,
        };
      } catch (err: any) {
        const errMsg = err.response?.data?.message || 'Gửi lại mã OTP thất bại';
        set({ error: errMsg });
        return { success: false, message: errMsg };
      }
    },

    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        // Ignore logout errors, clear state anyway
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, accessToken: null });
      }
    },

    updateProfile: async (details) => {
      set({ loading: true, error: null });
      try {
        const res = await api.put('/auth/update-details', details);
        const { user } = res.data;
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, loading: false });
        return true;
      } catch (err: any) {
        const errMsg = err.response?.data?.message || 'Cập nhật thất bại';
        set({ error: errMsg, loading: false });
        return false;
      }
    },

    clearError: () => set({ error: null }),
  };
});
