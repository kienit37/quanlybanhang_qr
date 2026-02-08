import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as API from '../services/api';
import { supabase } from '../services/supabase';
import { Product, Order, OrderStatus, Category, SalesStats, Table, Staff, SystemSettings, ActionLog } from '../types';
import { 
  LayoutDashboard, ClipboardList, UtensilsCrossed, Bell, 
  Check, X, Clock, ChefHat, Trash2, Plus, Edit2, DollarSign, TrendingUp,
  Settings, Users, User as UserIcon, History, QrCode, Layers, RefreshCw, LogOut, Lock, PieChart as PieChartIcon, Upload, Image as ImageIcon,
  CheckCircle, AlertCircle, Printer, Calendar, Eye, EyeOff, ShieldCheck, Menu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

// --- Shared Styles ---
const INPUT_STYLE = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200";

// --- Types for Notification ---
type NotificationType = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  type: NotificationType;
}

// --- Components ---

// 1. Toast Container Component
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'bg-white border-green-100 text-green-700' : 
            toast.type === 'error' ? 'bg-white border-red-100 text-red-700' : 
            'bg-white border-blue-100 text-blue-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
          
          <span className="font-semibold text-sm">{toast.message}</span>
          
          <button onClick={() => removeToast(toast.id)} className="ml-2 p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
};

// --- Login Component ---
const LoginScreen = ({ onLogin, notify }: { onLogin: (user: Staff) => void, notify: (m: string, t: NotificationType) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const user = await API.login(username, password);
    
    if (user) {
      setSuccess(true);
      setTimeout(() => {
        notify(`Xin chào, ${user.name}!`, 'success');
        onLogin(user);
      }, 1500);
    } else {
      setLoading(false);
      notify('Sai tên đăng nhập hoặc mật khẩu!', 'error');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
           </div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập thành công!</h2>
           <p className="text-gray-500">Đang chuyển hướng vào hệ thống quản trị...</p>
           <div className="mt-8 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
           </div>
           <p className="mt-12 text-xs text-gray-400 font-medium tracking-widest uppercase">
              Phát Triển Bởi Trung Tâm Công Nghệ Thông Tin Kiencode.io.vn
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-100 relative z-10 transition-all">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300">
             <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Đăng Nhập Quản Trị</h2>
          <p className="text-gray-500 mt-2 font-medium">Hệ thống quản lý nhà hàng</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Tên đăng nhập</label>
            <input type="text" className={INPUT_STYLE} placeholder="Nhập username..." value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`${INPUT_STYLE} pr-12`} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Đang xác thực...
              </>
            ) : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
             Phát Triển Bởi Trung Tâm Công Nghệ Thông Tin<br/>
             <a href="https://kiencode.io.vn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Kiencode.io.vn</a>
           </p>
        </div>
      </div>
    </div>
  );
};

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, user, orders, isCollapsed, setIsCollapsed }: { 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  onLogout: () => void, 
  user: Staff, 
  orders: Order[],
  isCollapsed: boolean,
  setIsCollapsed: (v: boolean) => void
}) => {
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;

  const menu = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'orders', label: 'Đơn Hàng', icon: ClipboardList, badge: pendingCount },
    { id: 'menu', label: 'Món Ăn', icon: UtensilsCrossed },
    { id: 'categories', label: 'Danh Mục', icon: Layers },
    { id: 'tables', label: 'Bàn & QR', icon: QrCode },
    { id: 'stats', label: 'Thống Kê', icon: TrendingUp },
    { id: 'staff', label: 'Nhân Viên', icon: Users },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
    { id: 'logs', label: 'Lịch Sử', icon: History },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#1E293B] text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-20 transition-all duration-300`}>
      <div className={`p-6 border-b border-slate-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
             Dashboard Pro
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Quản Lý Nhà Hàng</p>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg text-blue-400 transition-colors"
          title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menu.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : ""}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3'} rounded-xl transition-all duration-300 font-medium group relative ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
               {React.createElement(item.icon, { className: `transition-all duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}` })}
               {!isCollapsed && <span className="animate-in fade-in duration-300">{item.label}</span>}
            </div>
            
            {item.badge ? (
              <span className={`bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse transition-all duration-300 ${isCollapsed ? 'absolute -top-1 -right-1 px-1.5 py-0.5' : 'px-2 py-0.5'}`}>
                {item.badge}
              </span>
            ) : null}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-slate-700 z-[100]">
                {item.label}
                {item.badge ? ` (${item.badge})` : ''}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t border-slate-700 bg-[#0F172A] space-y-3 transition-all duration-300 overflow-hidden`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-3 py-2 bg-slate-800/50 rounded-xl'}`}>
           <div className="w-10 h-10 rounded-xl bg-blue-500 overflow-hidden flex items-center justify-center font-bold text-sm border-2 border-white/20 shadow-md flex-shrink-0">
             {user.avatarUrl ? (
               <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
             ) : (
               user.name.charAt(0)
             )}
           </div>
           {!isCollapsed && (
             <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role}</p>
             </div>
           )}
        </div>
        <button 
          onClick={onLogout} 
          title={isCollapsed ? "Đăng xuất" : ""}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm group relative`}
        >
          <LogOut className={`transition-all duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} /> 
          {!isCollapsed && <span>Đăng Xuất</span>}
          
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-[100]">
              Đăng Xuất
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// --- Module: Dashboard ---
const DashboardModule = ({ stats, orders, tables }: { stats: SalesStats, orders: Order[], tables: Table[] }) => {
  const [revenueView, setRevenueView] = useState<'hour' | 'day' | 'month' | 'year'>('hour');
  const [lookupDate, setLookupDate] = useState(new Date().toISOString().split('T')[0]);
  const [lookupMode, setLookupMode] = useState<'date' | 'month' | 'year'>('date');

  const pending = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const occupiedTables = tables.filter(t => t.isOccupied).length;

  const categoryRevenue = React.useMemo(() => {
    const data: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status !== OrderStatus.CANCELLED) {
        order.items.forEach(item => {
           data[item.category] = (data[item.category] || 0) + (item.price * item.quantity);
        });
      }
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const chartData = useMemo(() => {
    switch(revenueView) {
      case 'hour': return { data: stats.revenueByHour, key: 'hour', color: '#2563EB' };
      case 'day': return { data: stats.revenueByDay, key: 'date', color: '#16A34A' };
      case 'month': return { data: stats.revenueByMonth, key: 'month', color: '#F59E0B' };
      case 'year': return { data: stats.revenueByYear, key: 'year', color: '#EF4444' };
      default: return { data: stats.revenueByHour, key: 'hour', color: '#2563EB' };
    }
  }, [revenueView, stats]);

  const lookupStats = useMemo(() => {
    const filtered = orders.filter(o => {
      if (o.status === OrderStatus.CANCELLED) return false;
      const d = new Date(o.createdAt);
      if (lookupMode === 'date') return d.toLocaleDateString('en-CA') === lookupDate;
      if (lookupMode === 'month') return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}` === lookupDate.slice(0, 7);
      if (lookupMode === 'year') return d.getFullYear().toString() === lookupDate.slice(0, 4);
      return false;
    });
    const rev = filtered.reduce((s, o) => s + o.totalAmount, 0);
    return { revenue: rev, count: filtered.length };
  }, [orders, lookupDate, lookupMode]);

  const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Doanh thu hôm nay</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {(stats.revenueByDay.find(r => r.date === new Date().toLocaleDateString('vi-VN'))?.amount || 0).toLocaleString()}đ
            </h3>
          </div>
          <div className="p-4 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
          <div><p className="text-gray-500 text-sm font-medium mb-1">Đơn hàng hôm nay</p><h3 className="text-2xl font-bold text-gray-800">{orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</h3></div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><ClipboardList className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
           <div><p className="text-gray-500 text-sm font-medium mb-1">Bàn đang có khách</p><h3 className="text-2xl font-bold text-gray-800">{occupiedTables} / {tables.length}</h3></div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition relative overflow-hidden">
           {pending > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-2 animate-ping"></span>}
           <div><p className="text-gray-500 text-sm font-medium mb-1">Đơn đang chờ</p><h3 className={`text-2xl font-bold ${pending > 0 ? 'text-red-600' : 'text-gray-800'}`}>{pending}</h3></div>
          <div className={`p-4 rounded-xl ${pending > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}><Bell className="w-6 h-6"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-gray-800 text-lg">Biểu đồ doanh thu</h3>
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setRevenueView('hour')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${revenueView === 'hour' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Giờ</button>
                <button onClick={() => setRevenueView('day')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${revenueView === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Ngày</button>
                <button onClick={() => setRevenueView('month')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${revenueView === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tháng</button>
                <button onClick={() => setRevenueView('year')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${revenueView === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Năm</button>
             </div>
           </div>
           <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData.data}>
                   <defs>
                     <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={chartData.color} stopOpacity={0.3}/>
                       <stop offset="95%" stopColor={chartData.color} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                   <XAxis dataKey={chartData.key} fontSize={12} tickLine={false} axisLine={false} dy={10} stroke="#9CA3AF" />
                   <YAxis fontSize={12} tickLine={false} axisLine={false} dx={-10} stroke="#9CA3AF" tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}Tr` : v >= 1000 ? `${v/1000}k` : v} />
                   <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [value.toLocaleString() + 'đ', 'Doanh thu']} />
                   <Area type="monotone" dataKey="amount" stroke={chartData.color} strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" dot={{ r: 4, fill: chartData.color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
           <h3 className="font-bold mb-4 text-gray-800 text-lg flex items-center gap-2">Tra cứu doanh thu</h3>
           <div className="space-y-4">
              <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                <button onClick={() => setLookupMode('date')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${lookupMode === 'date' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Ngày</button>
                <button onClick={() => setLookupMode('month')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${lookupMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Tháng</button>
                <button onClick={() => setLookupMode('year')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${lookupMode === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Năm</button>
              </div>
              
              <input 
                type={lookupMode === 'date' ? 'date' : lookupMode === 'month' ? 'month' : 'number'} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                value={lookupMode === 'year' ? lookupDate.slice(0, 4) : lookupDate}
                onChange={(e) => setLookupDate(e.target.value)}
                min={lookupMode === 'year' ? "2020" : undefined}
                max={lookupMode === 'year' ? "2030" : undefined}
              />

              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl text-white shadow-lg shadow-blue-100">
                 <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Kết quả tra cứu</p>
                 <h4 className="text-2xl font-black mb-1">{lookupStats.revenue.toLocaleString()}đ</h4>
                 <div className="flex justify-between items-center text-xs text-blue-100 mt-4 pt-4 border-t border-blue-500/30">
                    <span>Tổng số đơn:</span>
                    <span className="font-bold text-white text-sm">{lookupStats.count} đơn</span>
                 </div>
              </div>
           </div>
           
           <h3 className="font-bold mb-4 mt-8 text-gray-800 text-lg flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-gray-400" />Tỷ trọng</h3>
           <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                     {categoryRevenue.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     formatter={(value: number) => value.toLocaleString() + 'đ'} 
                   />
                 </PieChart>
              </ResponsiveContainer>
              {categoryRevenue.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>}
           </div>

           {/* Legend for Pie Chart */}
           <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4 border-t border-gray-50 pt-6">
              {categoryRevenue.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                   <span className="text-xs text-gray-600 font-medium truncate">{entry.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold mb-6 text-gray-800 text-lg">Top 5 Món Bán Chạy</h3>
        <div className="space-y-4">
          {stats.topSelling.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
              <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-white border text-gray-500 shadow-sm'}`}>{idx === 0 ? '👑' : idx + 1}</div>
                  <span className="font-semibold text-gray-700">{item.name}</span>
              </div>
              <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">{item.quantity} bán</span>
            </div>
          ))}
          {stats.topSelling.length === 0 && <p className="text-gray-500 text-center py-4">Chưa có dữ liệu bán hàng.</p>}
        </div>
      </div>
    </div>
  );
};
// --- Module: Orders ---
const OrdersModule = ({ orders, notify, refresh }: { orders: Order[], notify: (m: string, t: NotificationType) => void, refresh: () => void }) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterMode, setFilterMode] = useState<'date' | 'month' | 'year'>('date');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filter === 'ALL' || o.status === filter;
    if (!selectedDate) return matchesStatus;

    const d = new Date(o.createdAt);
    if (filterMode === 'date') {
      const orderDate = d.toISOString().split('T')[0];
      return matchesStatus && orderDate === selectedDate;
    } else if (filterMode === 'month') {
      const orderMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      return matchesStatus && orderMonth === selectedDate.slice(0, 7);
    } else {
      const orderYear = d.getFullYear().toString();
      return matchesStatus && orderYear === selectedDate.slice(0, 4);
    }
  }).sort((a,b) => b.createdAt - a.createdAt);
  
  const displayedOrders = showAll ? filteredOrders : filteredOrders.slice(0, 10);
  
  const STATUS_MAP: Record<string, string> = {
    [OrderStatus.PENDING]: 'Chờ xác nhận',
    [OrderStatus.CONFIRMED]: 'Đã xác nhận',
    [OrderStatus.PREPARING]: 'Đang chế biến',
    [OrderStatus.COMPLETED]: 'Đã hoàn thành',
    [OrderStatus.CANCELLED]: 'Đã hủy',
    'ALL': 'Tất cả'
  };

  const statusBadge = (s: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 border border-blue-200',
      [OrderStatus.PREPARING]: 'bg-orange-100 text-orange-700 border border-orange-200',
      [OrderStatus.COMPLETED]: 'bg-green-100 text-green-700 border border-green-200',
      [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${colors[s]}`}>{STATUS_MAP[s]}</span>;
  }

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const success = await API.updateOrderStatus(orderId, status);
    if (success) {
      notify(`Đã cập nhật đơn hàng #${orderId.slice(-4)} thành ${STATUS_MAP[status]}`, 'success');
      if (status === OrderStatus.COMPLETED) {
        const order = orders.find(o => o.id === orderId);
        if (order) await API.updateTableStatus(order.tableId, false);
      }
      setSelectedOrder(null);
      refresh();
    } else {
      notify('Lỗi cập nhật trạng thái!', 'error');
    }
  };
  const handlePrint = async (order: Order) => {
    const settings = await API.getSettings();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px dashed #ddd;">
        <td style="padding: 8px 0; vertical-align: top;">
          <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
          ${item.note ? `<div style="font-size: 11px; color: #666; font-style: italic;">* ${item.note}</div>` : ''}
        </td>
        <td style="padding: 8px 0; text-align: center; vertical-align: top;">${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; vertical-align: top; font-weight: bold;">${(item.price * item.quantity).toLocaleString()}đ</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn - #${order.id.slice(-4)}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 10mm 4mm;
              color: #000;
              background: #fff;
              font-size: 13px;
              line-height: 1.4;
            }
            .text-center { text-align: center; }
            .header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .restaurant-name { font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase; }
            .info { font-size: 12px; margin: 2px 0; }
            .bill-title { font-size: 18px; font-weight: bold; margin: 15px 0 5px 0; letter-spacing: 2px; }
            .order-meta { font-size: 12px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { border-bottom: 1px solid #000; padding: 5px 0; text-align: left; font-size: 11px; }
            .total-section { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
            .grand-total { font-size: 18px; font-weight: 900; margin-top: 8px; border-top: 1px dashed #000; padding-top: 8px; }
            .footer { margin-top: 30px; font-size: 11px; line-height: 1.6; }
            .signature { margin-top: 20px; display: flex; justify-content: space-around; font-style: italic; font-size: 12px; }
            @media print {
              body { width: 72mm; padding: 5mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <h1 class="restaurant-name">${settings.restaurantName}</h1>
            <p class="info">${settings.address}</p>
            <p class="info">Hotline: ${settings.phone}</p>
          </div>

          <div class="text-center">
            <h2 class="bill-title">PHIẾU TẠM TÍNH</h2>
            <div class="order-meta">
              <p class="info">Mã: <strong>#${order.id.slice(-4)}</strong> | Bàn: <strong>${order.tableId}</strong></p>
              <p class="info">Khách: ${order.customerName}</p>
              <p class="info">Ngày: ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Tên món</th>
                <th style="width: 15%; text-align: center;">SL</th>
                <th style="width: 35%; text-align: right;">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Tổng cộng:</span>
              <span>${order.totalAmount.toLocaleString()}đ</span>
            </div>
            <div class="total-row grand-total">
              <span>THÀNH TIỀN:</span>
              <span>${order.totalAmount.toLocaleString()}đ</span>
            </div>
          </div>

          <div class="signature">
            <span>Khách hàng</span>
            <span>Nhân viên</span>
          </div>

          <div class="footer text-center">
            <p>Cảm ơn Quý khách. Hẹn gặp lại!</p>
            <p style="border-top: 1px dotted #ccc; pt-2; mt-2; font-size: 10px;">thiết kế bởi : kiencode.io.vn</p>
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['ALL', ...Object.values(OrderStatus)].map(s => (
            <button key={s} onClick={() => { setFilter(s as any); setShowAll(false); }} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === s ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {s === 'ALL' ? 'Tất cả' : STATUS_MAP[s]}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full xl:w-auto border-t xl:border-t-0 pt-4 xl:pt-0">
          <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
            <button onClick={() => setFilterMode('date')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${filterMode === 'date' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>NGÀY</button>
            <button onClick={() => setFilterMode('month')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${filterMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>THÁNG</button>
            <button onClick={() => setFilterMode('year')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${filterMode === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>NĂM</button>
          </div>

          <div className="relative flex-1 md:flex-initial">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
             <input 
               type={filterMode === 'date' ? 'date' : filterMode === 'month' ? 'month' : 'number'} 
               className={`${INPUT_STYLE} pl-10 py-2 text-sm !w-full`} 
               value={filterMode === 'year' ? selectedDate.slice(0, 4) : selectedDate} 
               onChange={(e) => setSelectedDate(e.target.value)} 
               placeholder={filterMode === 'year' ? "Nhập năm..." : ""}
             />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => { setSelectedDate(''); setFilterMode('date'); }} 
              className="text-xs font-bold text-gray-400 hover:text-blue-600 transition"
            >
              Xóa lọc
            </button>
            <div className="text-gray-500 text-sm font-medium whitespace-nowrap border-l pl-3">
              {displayedOrders.length}/{filteredOrders.length} đơn
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="p-5 font-semibold text-gray-600">Mã Đơn</th>
              <th className="p-5 font-semibold text-gray-600">Bàn</th>
              <th className="p-5 font-semibold text-gray-600">Khách Hàng</th>
              <th className="p-5 font-semibold text-gray-600">Thời gian</th>
              <th className="p-5 font-semibold text-gray-600">Tổng tiền</th>
              <th className="p-5 font-semibold text-gray-600">Trạng Thái</th>
              <th className="p-5 font-semibold text-gray-600 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-mono text-gray-500">#{order.id.slice(-4)}</td>
                <td className="p-5 font-bold text-gray-800">Bàn {order.tableId}</td>
                <td className="p-5 text-gray-700">{order.customerName}</td>
                <td className="p-5 text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</td>
                <td className="p-5 font-bold text-blue-600">{order.totalAmount.toLocaleString()}đ</td>
                <td className="p-5">{statusBadge(order.status)}</td>
                <td className="p-5 text-right">
                  <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length > 10 && (
          <div className="p-4 bg-gray-50 border-t flex justify-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition py-2 px-4 rounded-lg hover:bg-blue-100"
            >
              {showAll ? (
                <>Thu gọn <X className="w-4 h-4"/></>
              ) : (
                <>Xem tất cả ({filteredOrders.length} đơn) <Plus className="w-4 h-4"/></>
              )}
            </button>
          </div>
        )}
      </div>

      {selectedOrder && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl scale-100 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-800">Đơn hàng #{selectedOrder.id.slice(-4)}</h3>
                  <button 
                    onClick={() => handlePrint(selectedOrder)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                    title="In hóa đơn"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-6 h-6 text-gray-400"/></button>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl mb-6 space-y-3 border border-blue-100">
               <div className="flex justify-between text-sm"><span className="text-blue-800/70">Khách hàng</span> <span className="font-bold text-blue-900">{selectedOrder.customerName}</span></div>
               <div className="flex justify-between text-sm"><span className="text-blue-800/70">Vị trí</span> <span className="font-bold text-blue-900">Bàn {selectedOrder.tableId}</span></div>
            </div>

            <div className="max-h-64 overflow-y-auto border-y border-gray-100 py-4 mb-4 space-y-4 pr-2 custom-scrollbar">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex gap-4"><span className="font-bold text-gray-800 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-lg text-sm">{item.quantity}x</span><div><p className="font-semibold text-gray-800">{item.name}</p>{item.note && <p className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded mt-1 inline-block">Ghi chú: {item.note}</p>}</div></div>
                  <span className="font-medium text-gray-600">{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold mb-8 pt-2"><span>Tổng tiền</span><span className="text-blue-600 text-2xl">{selectedOrder.totalAmount.toLocaleString()}đ</span></div>

            <div className="grid grid-cols-2 gap-4">
               {selectedOrder.status === OrderStatus.PENDING && (
                 <>
                   <button onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.CANCELLED)} className="px-4 py-3 border-2 border-red-100 text-red-600 rounded-xl hover:bg-red-50 font-bold transition">Hủy đơn</button>
                   <button onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.CONFIRMED)} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition">Xác nhận đơn</button>
                 </>
               )}
               {selectedOrder.status === OrderStatus.CONFIRMED && (
                 <button onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.PREPARING)} className="col-span-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition"><ChefHat className="w-5 h-5"/> Chuyển sang Chế Biến</button>
               )}
               {selectedOrder.status === OrderStatus.PREPARING && (
                 <button onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.COMPLETED)} className="col-span-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition"><Check className="w-5 h-5"/> Hoàn thành đơn</button>
               )}
               {selectedOrder.status === OrderStatus.COMPLETED && <div className="col-span-2 text-center text-green-600 font-bold bg-green-50 py-3 rounded-xl border border-green-100">Đơn hàng đã hoàn thành</div>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// --- Module: Menu & Categories ---
const MenuModule = ({ products, categories, notify, refresh }: { products: Product[], categories: Category[], notify: (m: string, t: NotificationType) => void, refresh: () => void }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [filterCat, setFilterCat] = useState('ALL');
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => prev ? ({ ...prev, image: reader.result as string }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await API.saveProduct(editingProduct as Product);
    if (success) {
      notify(editingProduct?.id ? 'Đã cập nhật món ăn!' : 'Đã thêm món mới!', 'success');
      setEditingProduct(null);
      refresh();
    } else {
      notify('Lỗi khi lưu món! Vui lòng kiểm tra kết nối.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Xóa món này?')) {
      const success = await API.deleteProduct(id);
      if (success) {
        notify('Đã xóa món ăn!', 'info');
        refresh();
      } else {
        notify('Lỗi khi xóa món!', 'error');
      }
    }
  };

  const handleToggle = async (p: Product) => {
    const success = await API.saveProduct({ ...p, available: !p.available });
    if (success) {
      notify(`Đã ${p.available ? 'tắt' : 'bật'} trạng thái món!`, 'info');
      refresh();
    } else {
      notify('Lỗi cập nhật trạng thái!', 'error');
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Quản Lý Thực Đơn</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Danh sách món ăn & đồ uống</p>
          </div>
        </div>

        <div className="flex gap-4">
          <select 
            className={`${INPUT_STYLE} !w-48`} 
            value={filterCat} 
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button 
            onClick={() => setEditingProduct({ id: '', name: '', price: 0, category: categories[0]?.name || 'Món chính', available: true, description: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' })}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            THÊM MÓN MỚI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.filter(p => filterCat === 'ALL' || p.category === filterCat).map(p => (
          <div key={p.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group relative">
            <div className="relative h-56 w-full rounded-[2rem] overflow-hidden mb-5">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-gray-800 shadow-sm border border-white/20">
                  {p.category}
                </span>
              </div>
              <button 
                onClick={() => handleToggle(p)}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md shadow-lg transition-all ${p.available ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}
              >
                {p.available ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
            </div>

            <div className="px-2 pb-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-black text-gray-800 leading-tight">{p.name}</h4>
                <p className="text-xl font-black text-blue-600 tracking-tighter">
                  {p.price.toLocaleString()}<span className="text-[10px] ml-0.5">đ</span>
                </p>
              </div>
              <p className="text-gray-400 text-xs font-medium line-clamp-2 mb-6 h-8">{p.description || 'Chưa có mô tả cho món ăn này.'}</p>
              
              <div className="flex gap-2 pt-2 border-t border-gray-50">
                 <button onClick={() => setEditingProduct(p)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                   <Edit2 className="w-4 h-4" /> SỬA
                 </button>
                 <button onClick={() => handleDelete(p.id)} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300">
                   <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">{editingProduct.id ? 'Sửa Món Ăn' : 'Thêm Món Mới'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên món ăn</label>
                  <input required className={INPUT_STYLE} value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="Ví dụ: Phở Bò" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán (VNĐ)</label>
                    <input type="number" required className={INPUT_STYLE} value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                    <select className={INPUT_STYLE} value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả món ăn</label>
                  <textarea className={INPUT_STYLE} rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Thành phần, hương vị..." />
               </div>
               
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh món ăn</label>
                  <div className="space-y-3">
                    {editingProduct.image && (
                      <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setEditingProduct({...editingProduct, image: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600" title="Xóa ảnh"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition text-gray-600 font-medium group">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                        <span className="group-hover:text-blue-600 transition">Tải ảnh từ máy tính</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ImageIcon className="h-5 w-5 text-gray-400" /></div>
                      <input className={`${INPUT_STYLE} pl-10`} value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="Hoặc dán link ảnh (URL) tại đây..." />
                    </div>
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                 <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition">Hủy bỏ</button>
                 <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition">Lưu Món Ăn</button>
               </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const CategoriesModule = ({ categories, notify, refresh }: { categories: Category[], notify: (m: string, t: NotificationType) => void, refresh: () => void }) => {
  const [newCat, setNewCat] = useState('');
  
  const handleAdd = async () => {
    if(newCat) { 
      const success = await API.saveCategory({ id: '', name: newCat, order: categories.length + 1 }); 
      if (success) {
        setNewCat('');
        notify('Đã thêm danh mục mới!', 'success');
        refresh();
      } else {
        notify('Lỗi thêm danh mục!', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Xóa danh mục này?')) {
       const success = await API.deleteCategory(id);
       if (success) {
         notify('Đã xóa danh mục!', 'info');
         refresh();
       } else {
         notify('Lỗi xóa danh mục!', 'error');
       }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Quản Lý Danh Mục</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Phân loại thực đơn nhà hàng</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              className={`${INPUT_STYLE} pl-11`} 
              placeholder="Nhập tên danh mục mới..." 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
            />
          </div>
          <button 
            onClick={handleAdd} 
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95 whitespace-nowrap"
          >
            THÊM MỚI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {categories.map((cat, idx) => (
          <div key={cat.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col items-center text-center">
            {/* Index Decoration */}
            <div className="absolute -left-2 -top-2 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 font-black text-xs rotate-12 group-hover:bg-blue-50 group-hover:text-blue-200 transition-colors">
              {String(idx + 1).padStart(2, '0')}
            </div>

            <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-500 shadow-inner">
              <Layers className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>

            <h4 className="font-black text-gray-800 text-lg mb-6 leading-tight">{cat.name}</h4>

            <button 
              onClick={() => handleDelete(cat.id)} 
              className="mt-auto w-full py-2.5 bg-red-50 text-red-500 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              XÓA
            </button>
          </div>
        ))}
      </div>
    </div>
  )
};

const TablesModule = ({ tables, notify, refresh }: { tables: Table[], notify: (m: string, t: NotificationType) => void, refresh: () => void }) => {
  const [newTableName, setNewTableName] = useState('');

  const handleAdd = async () => {
    if(newTableName) { 
      const success = await API.saveTable({ id: Date.now().toString(), name: newTableName, isOccupied: false }); 
      if (success) {
        setNewTableName('');
        notify('Đã thêm bàn mới!', 'success');
        refresh();
      } else {
        notify('Lỗi thêm bàn!', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Xóa bàn này?')) {
      const success = await API.deleteTable(id);
      if (success) {
        notify('Đã xóa bàn!', 'info');
        refresh();
      } else {
        notify('Lỗi xóa bàn!', 'error');
      }
    }
  };

  const handleReset = async (id: string) => {
    const success = await API.updateTableStatus(id, false);
    if (success) {
      notify('Đã làm trống bàn!', 'info');
      refresh();
    } else {
      notify('Lỗi cập nhật trạng thái bàn!', 'error');
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Quản Lý Bàn & QR</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Sơ đồ nhà hàng & mã QR gọi món</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <input className={`${INPUT_STYLE} md:w-64`} placeholder="Tên bàn (VD: Bàn 10)" value={newTableName} onChange={e => setNewTableName(e.target.value)} />
          <button onClick={handleAdd} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95 whitespace-nowrap">THÊM BÀN</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {tables.map(table => (
           <div key={table.id} className={`p-6 rounded-[2.5rem] border-2 bg-white flex flex-col items-center justify-between min-h-[220px] hover:shadow-2xl transition-all duration-300 group ${table.isOccupied ? 'border-red-500 shadow-lg shadow-red-50' : 'border-gray-50 hover:border-blue-300 shadow-sm'}`}>
              <div className="text-center w-full">
                <div className="flex justify-between items-center w-full mb-3">
                  <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">#{table.id.slice(-4)}</span>
                  <button onClick={() => handleDelete(table.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
                <h3 className="font-black text-2xl text-gray-800 tracking-tighter">{table.name}</h3>
                <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-3 shadow-sm border ${table.isOccupied ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {table.isOccupied ? 'Có Khách' : 'Trống'}
                </span>
              </div>
              <div className="my-5 bg-white p-2 rounded-2xl shadow-inner border border-gray-50 flex items-center justify-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/?table=' + table.id)}`} alt="QR" className="w-24 h-24 mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              {table.isOccupied && <button onClick={() => handleReset(table.id)} className="w-full text-[10px] font-black bg-gray-50 text-gray-400 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest leading-none">Làm Trống Bàn</button>}
           </div>
        ))}
      </div>
    </div>
  );
};

// --- Module: Staff ---
const StaffModule = ({ notify }: { notify: (m: string, t: NotificationType) => void }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState<Partial<Staff> | null>(null);

  const fetchStaff = async () => {
    setStaff(await API.getStaff());
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSave = async () => {
    if(form?.name && form?.username) { 
      const success = await API.saveStaff(form as Staff); 
      if (success) {
        setForm(null);
        notify('Đã lưu thông tin nhân viên!', 'success');
        fetchStaff(); // Refresh list
      } else {
        notify('Lỗi lưu nhân viên!', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Xóa nhân viên này?')) {
      const success = await API.deleteStaff(id);
      if (success) {
        notify('Đã xóa nhân viên!', 'info');
        fetchStaff(); // Refresh list
      } else {
        notify('Lỗi xóa nhân viên!', 'error');
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div>
           <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <Users className="w-8 h-8 text-blue-600" />
             Quản lý nhân sự
           </h3>
           <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">Hệ thống đội ngũ vận hành</p>
         </div>
         <button 
           onClick={() => setForm({ username: '', name: '', role: 'STAFF' })} 
           className="bg-blue-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 group"
         >
           <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
             <Plus className="w-5 h-5"/>
           </div>
           THÊM NHÂN VIÊN MỚI
         </button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {staff.map(s => (
           <div key={s.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group relative overflow-hidden">
             {/* Decorative Background Element */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0"></div>
             
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                 <div className="relative">
                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-lg border-4 border-white">
                      {s.avatarUrl ? (
                         <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                         s.name.charAt(0)
                      )}
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${s.role === 'ADMIN' ? 'bg-purple-500' : 'bg-green-500'}`} title={s.role}>
                      {s.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3 text-white" /> : <CheckCircle className="w-3 h-3 text-white" />}
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setForm(s)} className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition shadow-inner">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition shadow-inner">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <h4 className="text-xl font-black text-gray-800 tracking-tight leading-none mb-1">{s.name}</h4>
                   <p className="text-sm font-bold text-blue-600/70 lowercase tracking-wider">@{s.username}</p>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      s.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {s.role}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase">Hoạt Động</span>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>

        {form && createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="bg-blue-600 p-6 flex items-center gap-4 text-white">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <UserIcon className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold">{form.id ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
                   <p className="text-blue-100 text-xs">Cung cấp quyền truy cập hệ thống</p>
                 </div>
               </div>

               <div className="p-8 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tên hiển thị</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        className={`${INPUT_STYLE} pl-11`} 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                        placeholder="Nguyễn Văn A" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tên đăng nhập</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        className={`${INPUT_STYLE} pl-11`} 
                        value={form.username} 
                        onChange={e => setForm({...form, username: e.target.value})} 
                        placeholder="staff1" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mật khẩu</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        className={`${INPUT_STYLE} pl-11`} 
                        type="password" 
                        value={form.password || ''} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Vai trò hệ thống</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-gray-400" />
                      </div>
                      <select 
                        className={`${INPUT_STYLE} pl-11 appearance-none`} 
                        value={form.role} 
                        onChange={e => setForm({...form, role: e.target.value as any})}
                      >
                        <option value="STAFF">Nhân Viên</option>
                        <option value="ADMIN">Quản Lý (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                     <button 
                       onClick={() => setForm(null)} 
                       className="flex-1 px-4 py-3.5 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100"
                     >
                       Hủy bỏ
                     </button>
                     <button 
                       onClick={handleSave} 
                       className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
                     >
                       <CheckCircle className="w-5 h-5" />
                       Lưu thông tin
                     </button>
                  </div>
               </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
};

// --- Module: Settings ---
const SettingsModule = ({ user, notify, onUpdateUser }: { user: Staff, notify: (m: string, t: NotificationType) => void, onUpdateUser: (u: Staff) => void }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    restaurantName: '',
    address: '',
    phone: '',
    wifiPass: '',
    taxRate: 0,
  });

  const [profile, setProfile] = useState({
    name: user.name,
    avatarUrl: user.avatarUrl || ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setSettings(await API.getSettings());
    };
    fetchSettings();
  }, []);

  const handleChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    const success = await API.saveSettings(settings);
    if (success) {
      notify('Đã cập nhật cài đặt hệ thống!', 'success');
    } else {
      notify('Lỗi cập nhật cài đặt!', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        notify('Ảnh quá lớn! Vui lòng chọn ảnh dưới 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const updatedUser = { ...user, name: profile.name, avatarUrl: profile.avatarUrl };
    const success = await API.saveStaff(updatedUser);
    if (success) {
      onUpdateUser(updatedUser);
      // Update session data in Cookie and SessionStorage
      const sessionData = JSON.stringify(updatedUser);
      API.setCookie(API.COOKIE_NAME, sessionData, 1);
      sessionStorage.setItem(API.COOKIE_NAME, sessionData);
      notify('Đã cập nhật thông tin cá nhân!', 'success');
    } else {
      notify('Lỗi cập nhật thông tin!', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Personal Profile Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-800 border-b pb-4"><UserIcon className="w-6 h-6 text-blue-600"/> Thông Tin Cá Nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-4">
             <div className="relative group w-32 h-32">
                <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-blue-600">{profile.name.charAt(0)}</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                   <Upload className="w-6 h-6" />
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
             </div>
             <p className="text-xs text-gray-500">Click để thay đổi ảnh đại diện</p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Họ Tên Quản Lý</label>
              <input className={INPUT_STYLE} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Đăng Nhập</label>
              <input className={`${INPUT_STYLE} bg-gray-50 opacity-70`} value={user.username} disabled />
              <p className="text-[10px] text-gray-400 mt-1">Tên đăng nhập không thể thay đổi</p>
            </div>
            <div className="pt-4 border-t">
              <button onClick={handleSaveProfile} className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition">Cập Nhật Hồ Sơ</button>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-800 border-b pb-4"><Settings className="w-6 h-6 text-blue-600"/> Cài Đặt Hệ Thống</h3>
        <div className="space-y-6">
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tên Quán</label><input className={INPUT_STYLE} value={settings.restaurantName} onChange={e => handleChange('restaurantName', e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Địa Chỉ</label><input className={INPUT_STYLE} value={settings.address} onChange={e => handleChange('address', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Số Điện Thoại</label><input className={INPUT_STYLE} value={settings.phone} onChange={e => handleChange('phone', e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu Wifi</label><input className={INPUT_STYLE} value={settings.wifiPass} onChange={e => handleChange('wifiPass', e.target.value)} /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Thuế / Phí (%)</label><input type="number" className={INPUT_STYLE} value={settings.taxRate} onChange={e => handleChange('taxRate', Number(e.target.value))} /></div>
          <div className="pt-6 border-t mt-6">
            <button onClick={handleSaveSettings} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Lưu Cài Đặt Hệ Thống</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Module: Logs ---
const LogsModule = () => {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  
  const fetchLogs = async () => {
    setLogs(await API.getLogs());
  };

  useEffect(() => { 
    fetchLogs(); 
  }, []);

  return (
     <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
       <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
         <h3 className="font-bold text-gray-800">Nhật Ký Hoạt Động</h3>
         <button onClick={fetchLogs} className="text-sm text-blue-600 font-semibold flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"><RefreshCw className="w-4 h-4"/> Làm mới</button>
       </div>
       <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
         {logs.map(log => (
           <div key={log.id} className="p-5 flex gap-6 text-sm hover:bg-gray-50 transition">
             <div className="text-gray-400 font-mono text-xs w-24 pt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
             <div className="flex-1"><p className="font-bold text-gray-800 text-base mb-1">{log.action}</p><p className="text-gray-500">{log.details}</p></div>
             <div className="flex flex-col items-end"><span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{log.user}</span><span className="text-[10px] text-gray-300 mt-1">{new Date(log.timestamp).toLocaleDateString()}</span></div>
           </div>
         ))}
       </div>
     </div>
  );
};

// --- Main Admin Component ---
const AdminApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<SalesStats>({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    avgOrderValue: 0, 
    topSelling: [], 
    revenueByDay: [], 
    revenueByHour: [],
    revenueByMonth: [],
    revenueByYear: []
  });
  
  // Notification State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: NotificationType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Remove after 4 seconds
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Audio for notifications (Orders) - Use a more reliable and clearer bell/notification sound
  const notificationSound = useMemo(() => {
    // Elegant digital notification sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.preload = 'auto';
    return audio;
  }, []);
  
  const prevPendingCount = React.useRef(-1);

  useEffect(() => {
    const user = API.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      const allOrders = await API.getOrders();
      setOrders(allOrders);
      setProducts(await API.getProducts());
      setCategories(await API.getCategories());
      setTables(await API.getTables());
      setStats(await API.getStats());
    };
    fetchData();
    
    // Subscribe to updates and track connection status
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData();
      })
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, refreshTrigger]);



  const lastOrderIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser || orders.length === 0) return;
    
    // Sort orders by creation time to find the newest one
    const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);
    const newestOrder = sortedOrders[0];
    
    // If it's the first load, just store the newest order ID and don't play sound
    if (lastOrderIdRef.current === null) {
      lastOrderIdRef.current = newestOrder.id;
      return;
    }
    
    // If we have a new order that we haven't seen before
    if (newestOrder.id !== lastOrderIdRef.current) {
       lastOrderIdRef.current = newestOrder.id;
       
       // Only play sound if the newest order is PENDING (to avoid sound when admin updates something else)
       if (newestOrder.status === OrderStatus.PENDING) {
         notificationSound.currentTime = 0; 
         notificationSound.play().catch(e => {
           console.warn('Audio play failed:', e);
           addToast('Có đơn hàng mới! (Vui lòng click vào trang để kích hoạt âm thanh)', 'info');
         });
         
         addToast(` Đơn mới từ Bàn ${newestOrder.tableId}!`, 'info');
       }
    }
  }, [orders, currentUser, notificationSound]);

  const handleLogout = () => {
    API.logout();
    setCurrentUser(null);
    addToast('Đã đăng xuất thành công', 'info');
  };

  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    API.checkConnection().then(setIsConnected);
  }, []);

  if (!currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        {/* Connection Warning on Login Screen too */}
        {isConnected === false && (
         <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[200] px-4 py-2 text-center font-bold flex items-center justify-center gap-2 shadow-lg">
           <AlertCircle className="w-5 h-5"/>
           Hệ thống chưa kết nối được Cơ sở dữ liệu! Vui lòng kiểm tra file .env.local
         </div>
         )}
        <LoginScreen onLogin={setCurrentUser} notify={addToast} />
      </>
    );
  }

  /* End of Login Guard */

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardModule stats={stats} orders={orders} tables={tables} />;
      case 'orders': return <OrdersModule orders={orders} notify={addToast} refresh={triggerRefresh} />;
      case 'menu': return <MenuModule products={products} categories={categories} notify={addToast} refresh={triggerRefresh} />;
      case 'categories': return <CategoriesModule categories={categories} notify={addToast} refresh={triggerRefresh} />;
      case 'tables': return <TablesModule tables={tables} notify={addToast} refresh={triggerRefresh} />;
      case 'staff': return <StaffModule notify={addToast} />;
      case 'settings': return currentUser && <SettingsModule user={currentUser} notify={addToast} onUpdateUser={setCurrentUser} />;
      case 'logs': return <LogsModule />;
      case 'stats': return <DashboardModule stats={stats} orders={orders} tables={tables} />;
      default: return <div>Không tìm thấy phân hệ</div>;
    }
  };


  return (
    <div className="min-h-screen bg-[#F4F6F8] flex font-sans text-[#111827]">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Connection Warning Banner */}
      {isConnected === false && (
         <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[200] px-4 py-2 text-center font-bold flex items-center justify-center gap-2 shadow-lg">
           <AlertCircle className="w-5 h-5"/>
           Hệ thống chưa kết nối được Cơ sở dữ liệu! Vui lòng kiểm tra file .env.local
         </div>
      )}
      
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        user={currentUser} 
        orders={orders} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <main className={`flex-1 p-8 overflow-y-auto h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} ${isConnected === false ? 'mt-10' : ''}`}>
        <header className="flex justify-between items-center mb-10">
          <div>
             <h2 className="text-3xl font-bold text-gray-800 capitalize tracking-tight">
               {activeTab === 'dashboard' ? 'Tổng Quan' : 
                activeTab === 'orders' ? 'Quản Lý Đơn Hàng' :
                activeTab === 'menu' ? 'Quản Lý Món Ăn' :
                activeTab === 'categories' ? 'Quản Lý Danh Mục' :
                activeTab === 'tables' ? 'Sơ Đồ Bàn' :
                activeTab === 'staff' ? 'Nhân Sự' :
                activeTab === 'settings' ? 'Cài Đặt Hệ Thống' :
                activeTab === 'stats' ? 'Báo Cáo Thống Kê' :
                activeTab === 'logs' ? 'Nhật Ký Hoạt Động' : 'Quản Trị'}
             </h2>
             <p className="text-gray-500 text-sm mt-1">Hệ thống quản lý nhà hàng QR Dine</p>
          </div>
          <div className="flex items-center gap-4">
             {/* Realtime Status */}
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isRealtimeConnected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
                {isRealtimeConnected ? 'Trực tiếp' : 'Đang kết nối...'}
             </div>
             
             <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{currentUser.name}</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">● {currentUser.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-blue-600">{currentUser.name.charAt(0)}</span>
                  )}
                </div>
             </div>
          </div>
        </header>

        <div className="animate-in fade-in zoom-in-95 duration-300">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminApp;