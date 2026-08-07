import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/useAuthStore';

export default function RealtimeNotificationListener() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Connect to Socket.io server
    const socket = io('/', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to realtime Socket server');
    });

    // 1. Listen for new order notifications (for Admins / Staff)
    socket.on('newOrder', (data) => {
      if (user && (user.role === 'admin' || user.role === 'staff')) {
        toast.success(
          `🔔 Đơn cọc mới! Khách hàng ${data.customerName} đã đặt cọc xe ${data.carName}. Số tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.depositAmount)}`,
          { autoClose: 8000, position: 'top-right' }
        );
      }
    });

    // 2. Listen for new test drive registrations (for Admins / Staff)
    socket.on('newTestDrive', (data) => {
      if (user && (user.role === 'admin' || user.role === 'staff')) {
        toast.info(
          `📅 Lịch lái thử mới! ${data.customerName} đăng ký lái thử xe ${data.carName} tại showroom ${data.showroom} vào ngày ${data.date} lúc ${data.timeSlot}`,
          { autoClose: 8000, position: 'top-right' }
        );
      }
    });

    // 3. Listen for order status updates (for Customers)
    socket.on('orderStatusUpdated', (data) => {
      if (user && user.id === data.userId) {
        let statusText = 'đang xử lý';
        if (data.status === 'confirmed') statusText = 'đã xác nhận';
        if (data.status === 'shipping') statusText = 'đang bàn giao showroom';
        if (data.status === 'completed') statusText = 'đã hoàn thành nhận xe';
        if (data.status === 'cancelled') statusText = 'đã hủy';

        toast.info(
          `🚗 Đơn hàng cọc ${data.orderNumber} của quý khách ${statusText.toUpperCase()}`,
          { autoClose: 10000, position: 'top-left' }
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return null; // Component does not render any visual UI directly
}
