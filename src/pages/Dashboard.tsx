import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Package, 
  Settings, 
  LogOut, 
  Loader2,
  Edit2,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserOrders } from '@/hooks/useOrders';
import { getAppIcon } from '@/lib/appIcons';
import { format } from 'date-fns';

type Tab = 'orders' | 'profile' | 'settings';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, isLoading: loading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useUserOrders();
  
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    telegram_username: profile?.telegram_username || '',
  });

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        telegram_username: profile.telegram_username || '',
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Profile updated!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-500 border-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-500 border-red-500"><AlertCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="text-gradient-primary">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'User'}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b">
              <button
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Orders
              </button>
              <button
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="glass-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'PPp')}
                          </p>
                        </div>
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className="text-xl">{getAppIcon(item.product_app)}</span>
                            <span className="flex-1">{item.product_name}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                            <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-medium">Total</span>
                        <span className="text-lg font-bold text-gradient-gold">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Link to="/shop">
                      <Button className="btn-gold">Start Shopping</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" className="btn-gold" onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram_username">Telegram Username</Label>
                    <Input
                      id="telegram_username"
                      value={formData.telegram_username}
                      onChange={(e) => setFormData(prev => ({ ...prev, telegram_username: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Telegram Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive order updates via Telegram</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
