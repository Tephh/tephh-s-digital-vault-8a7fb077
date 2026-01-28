import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ImageUpload from '@/components/ImageUpload';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut,
  Loader2,
  Save,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getAppIcon } from '@/lib/appIcons';
import { useWishlist } from '@/hooks/useWishlist';
import { useProducts } from '@/hooks/useProducts';

type Tab = 'orders' | 'wishlist' | 'profile' | 'settings';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string | null;
  order_items: Array<{
    product_name: string;
    product_app: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  telegram_username: string | null;
  avatar_url: string | null;
  address: string | null;
  phone: string | null;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    telegram_username: '',
    avatar_url: '',
    address: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { wishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { data: allProducts } = useProducts({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            product_app,
            quantity,
            unit_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          telegram_username: profileData.telegram_username || '',
          avatar_url: profileData.avatar_url || '',
          address: profileData.address || '',
          phone: profileData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          telegram_username: profile.telegram_username,
          avatar_url: profile.avatar_url,
          address: profile.address,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
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

  // Get wishlist products
  const wishlistProducts = allProducts?.filter(p => 
    wishlist.some(w => w.product_id === p.id)
  ) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-32">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {profile.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold">{profile.full_name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'wishlist' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab('wishlist')}
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                    {wishlist.length > 0 && (
                      <Badge className="ml-auto" variant="secondary">{wishlist.length}</Badge>
                    )}
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">My Orders</h2>
                      
                      {orders.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
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
                                  ⏳ Awaiting payment verification. Estimated delivery: 1-3 hours after confirmation.
                                </div>
                              )}
                              {order.status === 'paid' && (
                                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-sm text-blue-600 dark:text-blue-400">
                                  ✅ Payment confirmed! Your order is being processed. You'll receive it via Telegram soon.
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wishlist Tab */}
                  {activeTab === 'wishlist' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">My Wishlist</h2>
                      
                      {wishlistProducts.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Wishlist is empty</h3>
                          <p className="text-muted-foreground mb-6">Save products you like for later</p>
                          <Link to="/shop">
                            <Button className="btn-gold">
                              Browse Products
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {wishlistProducts.map(product => (
                            <div key={product.id} className="glass-card p-4 flex gap-4">
                              <img 
                                src={product.image_url || getAppIcon(product.app)} 
                                alt={product.name}
                                className="w-20 h-20 rounded-xl object-cover bg-muted"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.duration}</p>
                                <p className="text-lg font-bold text-gradient-gold mt-1">
                                  ${product.price.toFixed(2)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => removeFromWishlist(product.id)}
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">My Profile</h2>
                      
                      <div className="glass-card p-6 space-y-6">
                        <div className="flex flex-col items-center gap-4">
                          <ImageUpload
                            value={profile.avatar_url || ''}
                            onChange={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
                            folder="avatars"
                            className="w-32"
                            placeholder="Upload avatar"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={profile.full_name || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={profile.email || ''}
                              disabled
                              className="opacity-60"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Telegram Username</Label>
                            <Input
                              value={profile.telegram_username || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, telegram_username: e.target.value }))}
                              placeholder="@username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={profile.phone || ''}
                              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+855 XX XXX XXXX"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Address
                          </Label>
                          <Textarea
                            value={profile.address || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Your delivery address (optional)"
                            rows={3}
                          />
                        </div>

                        <Button className="w-full btn-gold" onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Profile
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">Settings</h2>
                      
                      <div className="glass-card p-6 space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Account</h3>
                          <p className="text-sm text-muted-foreground">
                            Email: {user?.email}
                          </p>
                        </div>

                        <div className="pt-4 border-t">
                          <h3 className="font-semibold mb-2 text-destructive">Danger Zone</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Contact support via Telegram @tephh to delete your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
