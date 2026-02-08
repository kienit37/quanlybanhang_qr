import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerApp from './components/CustomerApp';
import AdminApp from './components/AdminApp';
import { QrCode, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4 overflow-hidden">
      {/* Background Image with Blur and Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.5)'
        }}
      />

      <div className="relative z-10 text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-200 to-red-600 text-transparent bg-clip-text drop-shadow-2xl light-sweep-container">
          Hệ Thống Gọi Món QR Realtime
        </h1>
        <p className="text-gray-300 text-lg font-medium tracking-wide t">giải pháp công nghệ tối ưu hóa quy trình phục vụ và nâng cao trải nghiệm khách hàng.</p>
      </div>

      <div className="relative z-10 grid md:grid-cols-2 gap-8 w-full max-w-4xl animate-in zoom-in-95 duration-1000">
        <Link to="/?table=1" className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-orange-500/50 transition-all hover:scale-[1.02] active:scale-95 group text-center shadow-2xl">
          <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 group-hover:rotate-12 transition-all duration-300 shadow-inner">
             <QrCode className="w-10 h-10 text-orange-500 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Khách Hàng</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Quét mã QR tại bàn để xem thực đơn và gọi món ngay lập tức.</p>
        </Link>

        <Link to="/admin" className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-95 group text-center shadow-2xl">
           <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:-rotate-12 transition-all duration-300 shadow-inner">
             <ShieldCheck className="w-10 h-10 text-blue-500 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Trang Quản Trị</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Quản lý đơn hàng, thực đơn và theo dõi doanh thu theo thời gian thực.</p>
        </Link>
      </div>
      
      <div className="relative z-10 mt-16 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/5 text-xs text-gray-500 font-medium">
        Phát Triển Bởi Trung Tâm Công Nghệ Thông Tin - <a style={{color: "#fff"}} href="https://kiencode.io.vn" target="_blank" rel="noopener noreferrer">KIENCODE.IO.VN</a>
      </div>
    </div>
  );
};

// Wrapper to decide if we show Landing, Customer or Admin based on Route
const AppRoutes = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tableId = searchParams.get('table');

  // If path is root '/', check if table param exists.
  // If ?table=X exists -> Customer App
  // If not -> Landing Page
  if (location.pathname === '/' && tableId) {
    return <CustomerApp />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminApp />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;