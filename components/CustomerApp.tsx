import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Product, CartItem, Order, Category, OrderStatus } from '../types';
import * as API from '../services/api';
import { ShoppingCart, Search, Minus, Plus, Utensils, CheckCircle, X, Trash2, MessageSquare, History as HistoryIcon } from 'lucide-react';

const CustomerApp: React.FC = () => {
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const tableId = searchParams.get('table') || '1'; // Default to table 1 if not scanning

  /* Persistence Logic */
  const SESSION_KEY = `QR_DINE_SESSION_v1_TABLE_${tableId}`;
  const NAME_STORE_KEY = 'QR_DINE_USER_NAME_PERSIST';
  const NAME_TS_KEY = 'QR_DINE_USER_NAME_TS';

  // Helper to load initial state safely with 24h expiry check
  const loadSavedSession = () => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return null;
      
      const sessionData = JSON.parse(saved);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      // If session is older than 24h, clear it
      if (sessionData.timestamp && (now - sessionData.timestamp > twentyFourHours)) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      
      return sessionData;
    } catch (e) { return null; }
  };

  // Helper to load persistent name (valid for 30 days)
  const getPersistentName = () => {
    try {
      const name = localStorage.getItem(NAME_STORE_KEY);
      const ts = localStorage.getItem(NAME_TS_KEY);
      if (!name || !ts) return '';
      
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (now - parseInt(ts) > thirtyDays) {
        localStorage.removeItem(NAME_STORE_KEY);
        localStorage.removeItem(NAME_TS_KEY);
        return '';
      }
      return name;
    } catch (e) { return ''; }
  };

  const savedSession = useMemo(() => loadSavedSession(), [tableId]);

  const [customerName, setCustomerName] = useState(savedSession?.name || getPersistentName());
  const [isJoined, setIsJoined] = useState(savedSession?.isJoined || false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>(savedSession?.cart || []);
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const allOrders = await API.getOrders();
    const myOrders = allOrders.filter(o => o.tableId === tableId && o.customerName === customerName);
    setHistoryOrders(myOrders);

    // Active order logic
    if (savedSession?.placedOrderId && savedSession.placedOrderId !== dismissedOrderId) {
      const existing = allOrders.find(o => o.id === savedSession.placedOrderId);
      if (existing) setPlacedOrder(existing);
    } else {
       const active = myOrders.find(o => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status) && o.id !== dismissedOrderId);
       if (active) setPlacedOrder(active);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setProducts(await API.getProducts());
      setCategories(await API.getCategories());
      if (customerName) await fetchOrders();
    };
    
    fetchData();
    const unsubscribe = API.subscribeToUpdates(fetchData);
    return unsubscribe;
  }, [tableId, customerName]);

  // Persist state changes
  useEffect(() => {
    if (customerName) {
      localStorage.setItem(NAME_STORE_KEY, customerName);
      if (!localStorage.getItem(NAME_TS_KEY)) {
        localStorage.setItem(NAME_TS_KEY, Date.now().toString());
      }
    }

    if (isJoined || cart.length > 0) {
      const sessionData = {
        name: customerName,
        isJoined,
        cart,
        placedOrderId: placedOrder?.id,
        timestamp: savedSession?.timestamp || Date.now() // Keep original table session timestamp
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [customerName, isJoined, cart, placedOrder, tableId]);

  // Listen for external updates (e.g. Order Status changed by Admin)
  useEffect(() => {
    const handleUpdate = async () => {
      if (placedOrder) {
        const allOrders = await API.getOrders();
        const updated = allOrders.find(o => o.id === placedOrder.id);
        if (updated && updated.status !== placedOrder.status) {
          setPlacedOrder(updated);
        }
      }
    };
    return API.subscribeToUpdates(handleUpdate);
  }, [placedOrder]);


  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, note: '' }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === productId) {
        if (item.quantity > 1) {
          acc.push({ ...item, quantity: item.quantity - 1 });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as CartItem[]));
  };

  const deleteItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateNote = (productId: string, note: string) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, note } : item));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const order = await API.createOrder({
      tableId,
      customerName,
      items: cart,
      totalAmount: cartTotal,
    });
    if (order) {
      setPlacedOrder(order);
      setDismissedOrderId(null); // Reset dismissal for new order
      setCart([]);
      setIsCartOpen(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Tất cả' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && p.available;
  });

  // Step 1: Entry Screen
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6 animate-in zoom-in duration-300">
          <div className="text-center">
            <div className="mx-auto bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Utensils className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Xin Chào!</h1>
            <p className="text-gray-500">Bạn đang ngồi tại <span className="font-bold text-orange-600">Bàn {tableId}</span></p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên của bạn</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Nhập tên để bắt đầu gọi món..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <button 
            disabled={!customerName.trim()}
            onClick={() => setIsJoined(true)}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
          >
            Bắt Đầu Gọi Món
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Order Status Screen
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 text-center space-y-6 animate-in fade-in duration-500">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${placedOrder.status === 'CANCELLED' ? 'bg-red-100' : 'bg-green-100'}`}>
            {placedOrder.status === 'CANCELLED' ? <X className="w-10 h-10 text-red-600"/> : <CheckCircle className="w-10 h-10 text-green-600" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {placedOrder.status === 'CANCELLED' ? 'Đơn Đã Hủy' : 'Đơn Hàng Của Bạn'}
            </h2>
            <p className="text-gray-500 mt-2">Mã đơn: <span className="font-mono font-bold">#{placedOrder.id.slice(-4)}</span></p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Trạng thái:</span>
              <span className={`font-bold uppercase ${
                placedOrder.status === OrderStatus.PENDING ? 'text-orange-500' : 
                placedOrder.status === OrderStatus.COMPLETED ? 'text-green-600' : 
                placedOrder.status === OrderStatus.CANCELLED ? 'text-red-600' : 
                'text-blue-600' 
              }`}>
                 {
                   placedOrder.status === OrderStatus.PENDING ? 'Đang chờ' : 
                   placedOrder.status === OrderStatus.CONFIRMED ? 'Đã xác nhận' : 
                   placedOrder.status === OrderStatus.PREPARING ? 'Đang chế biến' : 
                   placedOrder.status === OrderStatus.COMPLETED ? 'Đã hoàn thành' : 
                   placedOrder.status === OrderStatus.CANCELLED ? 'Đã hủy' : 
                   placedOrder.status
                 }
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tổng tiền:</span>
              <span className="font-bold">{placedOrder.totalAmount.toLocaleString()}đ</span>
            </div>
             <p className="text-xs text-gray-400 mt-2 pt-2 border-t text-left italic">
               *Trạng thái sẽ tự động cập nhật
             </p>
          </div>

          <button 
            onClick={() => {
              if (placedOrder) setDismissedOrderId(placedOrder.id);
              setPlacedOrder(null);
            }}
            className="w-full bg-white border-2 border-orange-600 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
          >
            {placedOrder.status === 'COMPLETED' || placedOrder.status === 'CANCELLED' ? 'Đặt Đơn Mới' : 'Gọi Thêm Món'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Menu & Cart Screen
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Vi Vu Yên Thành</h1>
            <p className="text-xs text-gray-500">Bàn {tableId} • {customerName}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 transition"
              title="Lịch sử món"
            >
              <HistoryIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-orange-100 rounded-full text-orange-600 hover:bg-orange-200 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Search & Filter */}
        <div className="px-4 pb-4 max-w-3xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm món ăn..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 scroll-smooth">
            <button 
              onClick={() => setActiveCategory('Tất cả')}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${activeCategory === 'Tất cả' ? 'bg-orange-600 text-white shadow-md transform scale-105' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${activeCategory === cat.name ? 'bg-orange-600 text-white shadow-md transform scale-105' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product Grid with Animation */}
      <main 
        key={activeCategory} // This key triggers the re-render animation when category changes
        className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex sm:flex-col hover:shadow-md transition">
            <div className="w-1/3 sm:w-full h-24 sm:h-40 bg-gray-200">
               <img src={product.image} alt={product.name} className="w-full h-full object-cover transition hover:scale-105 duration-300" />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-semibold text-orange-600">{product.price.toLocaleString()}đ</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-orange-100 text-orange-600 p-1.5 rounded-lg hover:bg-orange-200 transition active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500 animate-in fade-in">
            Không tìm thấy món ăn nào.
          </div>
        )}
      </main>

      {/* Cart Summary (Sticky Bottom) - Sliding Animation */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 transition-transform duration-300 ${cart.length > 0 && !isCartOpen ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="max-w-3xl mx-auto flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Tổng cộng ({cart.reduce((a, b) => a + b.quantity, 0)} món)</p>
                <p className="text-xl font-bold text-gray-900">{cartTotal.toLocaleString()}đ</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-700 transition active:scale-95"
              >
                Xem Giỏ Hàng
              </button>
           </div>
      </div>

      {/* Cart Modal / Sheet - Sliding Animation */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Giỏ Hàng Của Bạn</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition">
                 <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300 border-b border-gray-100 pb-4 last:border-0">
                   {/* Row 1: Image, Name, Price */}
                   <div className="flex gap-4">
                     <img src={item.image} className="w-14 h-14 rounded-lg object-cover bg-gray-100 border border-gray-100" />
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-orange-600 text-sm font-bold mt-0.5">{item.price.toLocaleString()}đ</p>
                     </div>
                   </div>

                   {/* Row 2: Note & Actions (Quantity + Delete in same row) */}
                   <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            placeholder="Ghi chú..." 
                            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition text-gray-700"
                            value={item.note || ''}
                            onChange={(e) => updateNote(item.id, e.target.value)}
                          />
                       </div>

                       <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100 shrink-0">
                          <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold w-6 text-center text-sm text-gray-800">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-7 h-7 rounded bg-orange-600 shadow-sm border border-orange-600 text-white flex items-center justify-center active:scale-95 transition">
                            <Plus className="w-3 h-3" />
                          </button>
                          
                          <div className="w-px h-4 bg-gray-300 mx-1"></div>
                          
                          <button onClick={() => deleteItem(item.id)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition active:scale-95 hover:bg-white rounded">
                              <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                   </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                   <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                   <p>Giỏ hàng trống</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Thành tiền:</span>
                <span className="text-orange-600">{cartTotal.toLocaleString()}đ</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:opacity-50 transition shadow-lg shadow-orange-200"
              >
                Xác Nhận Đặt Món
              </button>
            </div>
          </div>
        </div>
      )}
      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-blue-50">
              <h2 className="text-lg font-bold text-gray-800">Lịch Sử Gọi Món</h2>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-full transition">
                 <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {historyOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                   <HistoryIcon className="w-12 h-12 mb-2 opacity-20" />
                   <p>Bạn chưa đặt món nào</p>
                </div>
              ) : (
                historyOrders.sort((a,b) => b.createdAt - a.createdAt).map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-400">Mã đơn: #{order.id.slice(-4)}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-600' :
                        order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-600' :
                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {
                          order.status === OrderStatus.PENDING ? 'Đang chờ' : 
                          order.status === OrderStatus.CONFIRMED ? 'Đã xác nhận' : 
                          order.status === OrderStatus.PREPARING ? 'Đang chế biến' : 
                          order.status === OrderStatus.COMPLETED ? 'Đã hoàn thành' : 
                          order.status === OrderStatus.CANCELLED ? 'Đã hủy' : order.status
                        }
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}</span>
                          <span className="text-gray-500">{(item.price * item.quantity).toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-800">
                      <span>Tổng tiền</span>
                      <span className="text-blue-600">{order.totalAmount.toLocaleString()}đ</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApp;