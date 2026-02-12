import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { getAppIcon } from '@/lib/appIcons';

const STORAGE_KEY = 'guest_telegram';

interface OrderItem {
  product_name: string;
  product_app: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string | null;
  guest_name: string | null;
  guest_telegram: string;
  order_items: OrderItem[];
}

const TrackOrder: React.FC = () => {
  const [telegram, setTelegram] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load saved telegram on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTelegram(saved);
      // Auto-fetch orders
      fetchOrders(saved);
    }
  }, []);

  // Realtime subscription for order updates
  useEffect(() => {
    if (orders.length === 0) return;

    const channel = supabase
      .channel('guest-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders(prev =>
            prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orders.length]);

  const fetchOrders = async (tg: string) => {
    const cleanTg = tg.trim().replace(/^@/, '');
    if (!cleanTg) return;

    setIsLoading(true);
    setHasSearched(true);

    // Save to localStorage for device memory
    localStorage.setItem(STORAGE_KEY, cleanTg);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, total_amount, status, guest_name, guest_telegram,
        order_items (product_name, product_app, quantity, unit_price)
      `)
      .or(`guest_telegram.eq.${cleanTg},guest_telegram.eq.@${cleanTg}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    }

    setOrders((data as Order[]) || []);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(telegram);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTelegram('');
    setOrders([]);
    setHasSearched(false);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/50"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-500 border-green-500/50"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-500 border-red-500/50"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Package className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your Telegram username to view your orders</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="glass-card p-6 mb-8">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="telegram">Telegram Username</Label>
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="yourusername"
                  className="text-lg"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={isLoading || !telegram.trim()}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="ml-2 hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
            {localStorage.getItem(STORAGE_KEY) && (
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>🔒 Device remembered — auto-loading your orders</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
                  Forget Device
                </Button>
              </div>
            )}
          </form>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : hasSearched && orders.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                No orders found for this Telegram username. Make sure you entered it correctly.
              </p>
              <Link to="/shop">
                <Button className="btn-gold">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-lg">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'PPp')}
                      </p>
                      {order.guest_name && (
                        <p className="text-sm text-muted-foreground mt-1">👤 {order.guest_name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-xl font-bold mt-2 text-gradient-gold">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.order_items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm p-2 bg-muted/30 rounded">
                        <img
                          src={getAppIcon(item.product_app)}
                          alt={item.product_app}
                          className="w-8 h-8 rounded-lg object-contain bg-muted/50"
                        />
                        <span className="flex-1">{item.product_name}</span>
                        <span>x{item.quantity}</span>
                        <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                      ⏳ Awaiting admin confirmation. Estimated delivery: 1-3 hours after confirmation.
                    </div>
                  )}
                  {order.status === 'paid' && (
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-sm text-blue-600 dark:text-blue-400">
                      ✅ Payment confirmed! Your order is being processed.
                    </div>
                  )}

                  {/* Contact Admin */}
                  <div className="mt-4 flex justify-end">
                    <a href="https://t.me/tephh" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Admin
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
