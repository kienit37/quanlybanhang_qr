export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Changed from Enum to string/interface to support dynamic Category management
export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string; // ID or Name
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableId: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number; // timestamp
}

export interface Table {
  id: string;
  name: string;
  isOccupied: boolean;
}

export interface Staff {
  id: string;
  username: string;
  password?: string;
  role: 'ADMIN' | 'STAFF';
  name: string;
  avatarUrl?: string;
}

export interface SystemSettings {
  restaurantName: string;
  address: string;
  phone: string;
  wifiPass: string;
  taxRate: number;
}

export interface ActionLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
  user: string;
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topSelling: { name: string; quantity: number }[];
  revenueByDay: { date: string; amount: number }[];
  revenueByHour: { hour: string; amount: number }[];
  revenueByMonth: { month: string; amount: number }[];
  revenueByYear: { year: string; amount: number }[];
}