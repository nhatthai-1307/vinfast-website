import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';
import RealtimeNotificationListener from '../components/RealtimeNotificationListener';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen text-[#1A1D23]" style={{ backgroundColor: '#F5F6FA' }}>
      {/* Realtime Socket Listener */}
      <RealtimeNotificationListener />

      {/* Toast Notifications — Light theme */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9',
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main Content — padding top matches navbar height */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
