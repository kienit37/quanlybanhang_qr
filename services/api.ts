import { Product, Order, Table, Category, OrderStatus, SalesStats, Staff, SystemSettings, ActionLog, CartItem } from '../types';
import { supabase } from './supabase';

// --- CONNECTION CHECK ---
export const checkConnection = async (): Promise<boolean> => {
  const { error } = await supabase.from('settings').select('id').limit(1).single();
  // It's ok if error is 'PGRST116' (no rows) - that means connection worked but table empty
  // Real connection error usually has no code or network code
  if (error && error.code !== 'PGRST116') { 
    console.error('Connection check failed:', error);
    return false; 
  }
  return true;
};

// --- REALTIME HELPERS ---
export const subscribeToUpdates = (callback: () => void) => {
  // Subscribe to all changes in the database
  const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      callback();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// --- AUTHENTICATION HELPERS (Cookie & Session) ---
export const COOKIE_NAME = 'QR_DINE_SESSION';

export const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/; SameSite=Lax";
};

export const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

export const eraseCookie = (name: string) => {
  document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
};

// --- AUTHENTICATION ---
export const login = async (username: string, password: string): Promise<Staff | null> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('username', username)
    .single();

  if (data && data.password === password) { 
    const user = { ...data, avatarUrl: data.avatar_url };
    
    // Lưu vào Cookie (hết hạn sau 1 ngày) và SessionStorage
    const sessionData = JSON.stringify(user);
    setCookie(COOKIE_NAME, sessionData, 1);
    sessionStorage.setItem(COOKIE_NAME, sessionData);
    
    await addLog('Đăng nhập', 'Đăng nhập vào hệ thống', user.name);
    return user;
  }
  return null;
};

export const logout = async () => {
  const user = getCurrentUser();
  if (user) {
    await addLog('Đăng xuất', 'Đăng xuất khỏi hệ thống', user.name);
  }
  // Xóa cả Cookie và SessionStorage
  eraseCookie(COOKIE_NAME);
  sessionStorage.removeItem(COOKIE_NAME);
};

export const getCurrentUser = (): Staff | null => {
  // Ưu tiên lấy từ SessionStorage (nhanh hơn), nếu không có thì lấy từ Cookie
  const session = sessionStorage.getItem(COOKIE_NAME) || getCookie(COOKIE_NAME);
  if (session) {
    try {
      const user = JSON.parse(session);
      // Nếu có trong Cookie mà chưa có trong SessionStorage thì đồng bộ lại
      if (!sessionStorage.getItem(COOKIE_NAME)) {
        sessionStorage.setItem(COOKIE_NAME, session);
      }
      return user;
    } catch (e) {
      console.error("Lỗi parse session:", e);
      return null;
    }
  }
  return null;
};

// --- LOGGING ---
export const addLog = async (action: string, details: string, user: string = 'Hệ thống') => {
  const currentUser = getCurrentUser();
  const { error } = await supabase.from('logs').insert({
    action,
    details,
    user: currentUser ? currentUser.name : user,
    timestamp: new Date().toISOString()
  });
  if (error) console.error('Error logging:', error);
};

export const getLogs = async (): Promise<ActionLog[]> => {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  return (data || []).map(l => ({ ...l, timestamp: new Date(l.timestamp).getTime() }));
};

// --- PRODUCTS ---
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
};

export const saveProduct = async (product: Product): Promise<boolean> => {
  const isNew = !product.id || product.id === '';
  const productToSave = { ...product };
  if (isNew) delete (productToSave as any).id;

  const { error } = await supabase.from('products').upsert(productToSave);
  if (error) {
    console.error('Error saving product:', error);
    return false;
  }
  await addLog(isNew ? 'Thêm món mới' : 'Cập nhật món', `Món: ${product.name}`);
  return true;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  await addLog('Xóa món', `ID: ${id}`);
  return true;
};

// --- CATEGORIES ---
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
};

export const saveCategory = async (cat: Category): Promise<boolean> => {
  const isNew = !cat.id || cat.id === '';
  const catToSave = { ...cat };
  if (isNew) delete (catToSave as any).id;

  const { error } = await supabase.from('categories').upsert(catToSave);
  if (error) {
    console.error('Error saving category:', error);
    return false;
  }
  await addLog('Quản lý danh mục', `Lưu danh mục: ${cat.name}`);
  return true;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }
  await addLog('Quản lý danh mục', `Xóa danh mục ID: ${id}`);
  return true;
};

// --- ORDERS ---
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []).map(o => ({
    id: o.id,
    tableId: o.table_id,
    customerName: o.customer_name,
    totalAmount: o.total_amount,
    status: o.status,
    items: o.order_items,
    createdAt: new Date(o.created_at).getTime()
  }));
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order | null> => {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_id: order.tableId,
      customer_name: order.customerName,
      total_amount: order.totalAmount,
      status: OrderStatus.PENDING
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return null;
  }

  const itemsToInsert = order.items.map(item => ({
    order_id: orderData.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    note: item.note,
    category: item.category
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return null;
  }

  await updateTableStatus(order.tableId, true);
  return {
    ...orderData,
    items: order.items,
    createdAt: new Date(orderData.created_at).getTime(),
    tableId: orderData.table_id,
    customerName: orderData.customer_name,
    totalAmount: orderData.total_amount
  };
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating status:', error);
    return false;
  }
  await addLog('Cập nhật đơn hàng', `Đơn #${orderId.slice(-4)} -> ${status}`);
  return true;
};

// --- TABLES ---
export const getTables = async (): Promise<Table[]> => {
  const { data, error } = await supabase.from('tables').select('*').order('id', { ascending: true });
  if (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
  return (data || []).map(t => ({ ...t, isOccupied: t.is_occupied }));
};

export const saveTable = async (table: Table): Promise<boolean> => {
  const { error } = await supabase.from('tables').upsert({
    id: table.id,
    name: table.name,
    is_occupied: table.isOccupied
  });
  if (error) {
    console.error('Error saving table:', error);
    return false;
  }
  return true;
};

export const deleteTable = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) {
    console.error('Error deleting table:', error);
    return false;
  }
  return true;
};

export const updateTableStatus = async (tableId: string, isOccupied: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('tables')
    .update({ is_occupied: isOccupied })
    .eq('id', tableId);
  if (error) {
    console.error('Error updating table status:', error);
    return false;
  }
  return true;
};

// --- STAFF ---
export const getStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
  return (data || []).map(s => ({ 
    ...s, 
    avatarUrl: s.avatar_url 
  }));
};

export const saveStaff = async (staff: Staff): Promise<boolean> => {
  const isNew = !staff.id || staff.id === '';
  const staffToSave = { 
    ...staff,
    avatar_url: staff.avatarUrl
  };
  if (isNew) delete (staffToSave as any).id;
  delete (staffToSave as any).avatarUrl;

  const { error } = await supabase.from('staff').upsert(staffToSave);
  if (error) {
    console.error('Error saving staff:', error);
    return false;
  }
  await addLog('Quản lý nhân viên', `${isNew ? 'Thêm' : 'Sửa'} nhân viên: ${staff.username}`);
  return true;
};

export const deleteStaff = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) {
    console.error('Error deleting staff:', error);
    return false;
  }
  return true;
};

// --- SETTINGS ---
export const getSettings = async (): Promise<SystemSettings> => {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 'system').single();
  if (error) {
    console.error('Error fetching settings:', error);
    return {
      restaurantName: 'Nhà Hàng QR Dine',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0909 123 456',
      wifiPass: '88888888',
      taxRate: 8,
    };
  }
  return {
    restaurantName: data.restaurant_name,
    address: data.address,
    phone: data.phone,
    wifiPass: data.wifi_pass,
    taxRate: data.tax_rate,
  };
};

export const saveSettings = async (settings: SystemSettings): Promise<boolean> => {
  const { error } = await supabase.from('settings').upsert({
    id: 'system',
    restaurant_name: settings.restaurantName,
    address: settings.address,
    phone: settings.phone,
    wifi_pass: settings.wifiPass,
    tax_rate: settings.taxRate,
    updated_at: new Date().toISOString()
  });
  if (error) {
    console.error('Error saving settings:', error);
    return false;
  }
  await addLog('Cài đặt', 'Cập nhật cấu hình hệ thống');
  return true;
};

// --- STATS ---
export const getStats = async (): Promise<SalesStats> => {
  const orders = await getOrders();
  const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
  
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  
  const productCount: Record<string, number> = {};
  validOrders.forEach(order => {
    order.items.forEach(item => {
      productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
    });
  });
  
  const topSelling = Object.entries(productCount)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const revenueMap: Record<string, number> = {};
  const hourMap: Record<string, number> = {};
  const monthMap: Record<string, number> = {};
  const yearMap: Record<string, number> = {};

  validOrders.forEach(order => {
    const d = new Date(order.createdAt);
    
    // Day
    const date = d.toLocaleDateString('vi-VN');
    revenueMap[date] = (revenueMap[date] || 0) + order.totalAmount;

    // Hour
    const hour = d.getHours() + ':00';
    hourMap[hour] = (hourMap[hour] || 0) + order.totalAmount;

    // Month
    const month = (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
    monthMap[month] = (monthMap[month] || 0) + order.totalAmount;

    // Year
    const year = d.getFullYear().toString();
    yearMap[year] = (yearMap[year] || 0) + order.totalAmount;
  });
  
  const revenueByDay = Object.entries(revenueMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/').map(Number);
      const [d2, m2, y2] = b.date.split('/').map(Number);
      return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
    });

  const revenueByHour = Object.entries(hourMap)
    .map(([hour, amount]) => ({ hour, amount }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  const revenueByMonth = Object.entries(monthMap)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => {
      const [m1, y1] = a.month.split('/').map(Number);
      const [m2, y2] = b.month.split('/').map(Number);
      return new Date(y1, m1 - 1).getTime() - new Date(y2, m2 - 1).getTime();
    });

  const revenueByYear = Object.entries(yearMap)
    .map(([year, amount]) => ({ year, amount }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return {
    totalRevenue,
    totalOrders: validOrders.length,
    avgOrderValue,
    topSelling,
    revenueByDay,
    revenueByHour,
    revenueByMonth,
    revenueByYear
  };
};