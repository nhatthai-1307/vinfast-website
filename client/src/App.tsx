import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import CarsList from './pages/CarsList';
import CarDetail from './pages/CarDetail';
import CompareCars from './pages/CompareCars';
import InstallmentCalc from './pages/InstallmentCalc';
import ShowroomsMap from './pages/ShowroomsMap';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileDashboard from './pages/ProfileDashboard';
import CarRental from './pages/CarRental';
import PaymentResult from './pages/PaymentResult';
import PaymentSuccess from './pages/PaymentSuccess';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCars from './pages/admin/AdminCars';
import AdminOrders from './pages/admin/AdminOrders';
import AdminTestDrives from './pages/admin/AdminTestDrives';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRentals from './pages/admin/AdminRentals';
import AdminPromotions from './pages/admin/AdminPromotions';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== Customer Routes ==================== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarsList />} />
          <Route path="/cars/:slug" element={<CarDetail />} />
          <Route path="/compare" element={<CompareCars />} />
          <Route path="/installment" element={<InstallmentCalc />} />
          <Route path="/showrooms" element={<ShowroomsMap />} />
          <Route path="/rental" element={<CarRental />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<ProfileDashboard />} />
        </Route>

        {/* Auth Routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==================== Admin Routes ==================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="cars" element={<AdminCars />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="test-drives" element={<AdminTestDrives />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="rentals" element={<AdminRentals />} />
          <Route path="promotions" element={<AdminPromotions />} />
        </Route>

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-vinfast-carbon-950 flex flex-col items-center justify-center text-white text-center p-4">
              <h1 className="text-6xl font-black text-vinfast-cyan mb-4">404</h1>
              <p className="text-xl font-bold mb-2">Trang không tìm thấy</p>
              <p className="text-vinfast-carbon-400 mb-8 text-sm">Đường dẫn bạn nhập không tồn tại trong hệ thống.</p>
              <a href="/" className="btn-electric px-8 py-3 text-sm">Quay về Trang Chủ</a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
