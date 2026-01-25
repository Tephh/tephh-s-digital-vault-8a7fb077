import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getAppIcon } from '@/lib/appIcons';

type Tab = 'dashboard' | 'products' | 'orders' | 'settings';

interface Product {
  id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price: number;
  original_price: number | null;
  app: string;
  category: string;
  duration: string | null;
  duration_months: number | null;
  stock: number | null;
  is_active: boolean | null;
  image_url: string | null;
}

interface Order {
  id: string;
  created_at: string;
  guest_name: string | null;
  guest_telegram: string;
  guest_email: string | null;
  total_amount: number;
  status: string | null;
  payment_md5: string | null;
  payment_verified_at: string | null;
  order_items: Array<{
    product_name: string;
    product_app: string;
    quantity: number;
    unit_price: number;
  }>;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, isLoading: loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    merchantName: 'Tephh So Tuf',
    bakongAccount: 'sin_soktep@bkrt',
    machineId: '005927335',
  });

  // Product form state
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    long_description: '',
    price: 0,
    original_price: null,
    app: 'spotify',
    category: 'account',
    duration: '',
    duration_months: null,
    stock: 0,
    is_active: true,
    image_url: '',
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      setProducts(productsData || []);

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
        .order('created_at', { ascending: false });
      
      setOrders(ordersData || []);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*');
      
      if (settingsData) {
        const settingsMap: Record<string, string> = {};
        settingsData.forEach(s => {
          settingsMap[s.key] = s.value || '';
        });
        setSettings({
          merchantName: settingsMap.merchant_name || settings.merchantName,
          bakongAccount: settingsMap.bakong_account || settings.bakongAccount,
          machineId: settingsMap.machine_id || settings.machineId,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productForm)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        // Create new product - ensure required fields are present
        const newProduct = {
          name: productForm.name || '',
          price: productForm.price || 0,
          app: productForm.app || 'spotify',
          category: productForm.category || 'account',
          description: productForm.description,
          long_description: productForm.long_description,
          original_price: productForm.original_price,
          duration: productForm.duration,
          duration_months: productForm.duration_months,
          stock: productForm.stock,
          is_active: productForm.is_active,
          image_url: productForm.image_url,
        };
        const { error } = await supabase
          .from('products')
          .insert(newProduct);
        
        if (error) throw error;
        toast.success('Product created!');
      }
      
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Product deleted!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success('Order status updated!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'merchant_name', value: settings.merchantName },
        { key: 'bakong_account', value: settings.bakongAccount },
        { key: 'machine_id', value: settings.machineId },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      toast.success('Settings saved!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      long_description: '',
      price: 0,
      original_price: null,
      app: 'spotify',
      category: 'account',
      duration: '',
      duration_months: null,
      stock: 0,
      is_active: true,
      image_url: '',
    });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsProductDialogOpen(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    resetProductForm();
    setIsProductDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-blue-500"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-500"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status === 'completed' || o.status === 'paid').reduce((sum, o) => sum + o.total_amount, 0);
  const activeProducts = products.filter(p => p.is_active).length;

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gradient-primary">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">K'TEPHH Shop</p>
        </div>
        
        <nav className="px-4 space-y-1">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveTab('products')}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart className="w-5 h-5" />
            Orders
            {pendingOrders > 0 && (
              <Badge className="ml-auto bg-yellow-500">{pendingOrders}</Badge>
            )}
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <p className="text-muted-foreground text-sm">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{totalOrders}</p>
              </div>
              <div className="glass-card p-6">
                <p className="text-muted-foreground text-sm">Pending Orders</p>
                <p className="text-3xl font-bold mt-2 text-yellow-500">{pendingOrders}</p>
              </div>
              <div className="glass-card p-6">
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-gradient-gold">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="glass-card p-6">
                <p className="text-muted-foreground text-sm">Active Products</p>
                <p className="text-3xl font-bold mt-2">{activeProducts}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">@{order.guest_telegram}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total_amount.toFixed(2)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Products</h2>
              <Button className="btn-gold" onClick={openNewProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="grid gap-4">
              {products.map(product => (
                <div key={product.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="text-3xl">{getAppIcon(product.app)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {!product.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.category} • {product.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditProduct(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Dialog */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>App</Label>
                      <Select
                        value={productForm.app}
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, app: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spotify">Spotify</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="capcut">CapCut</SelectItem>
                          <SelectItem value="alight">Alight Motion</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={productForm.category}
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="topup">Top-up</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={productForm.duration || ''}
                        onChange={(e) => setProductForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 1 Month"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Original Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.original_price || ''}
                        onChange={(e) => setProductForm(prev => ({ ...prev, original_price: parseFloat(e.target.value) || null }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={productForm.stock || 0}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Textarea
                      value={productForm.description || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Long Description</Label>
                    <Textarea
                      value={productForm.long_description || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, long_description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productForm.is_active || false}
                      onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <Label>Active (visible in shop)</Label>
                  </div>

                  <Button className="w-full btn-gold" onClick={handleSaveProduct} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Orders</h2>
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

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

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{order.guest_name || 'Guest'}</p>
                      <p className="text-sm">@{order.guest_telegram}</p>
                      {order.guest_email && <p className="text-sm">{order.guest_email}</p>}
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Payment</p>
                      {order.payment_md5 ? (
                        <>
                          <p className="text-sm font-mono break-all">{order.payment_md5}</p>
                          {order.payment_verified_at && (
                            <p className="text-xs text-green-500 mt-1">
                              Verified: {format(new Date(order.payment_verified_at), 'PPp')}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-yellow-500">Not verified</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Items:</p>
                    {order.order_items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm p-2 bg-muted/30 rounded">
                        <span className="text-xl">{getAppIcon(item.product_app)}</span>
                        <span className="flex-1">{item.product_name}</span>
                        <span>x{item.quantity}</span>
                        <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Update status:</span>
                    <Select
                      value={order.status || 'pending'}
                      onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold">Settings</h2>

            <div className="glass-card p-6 space-y-6">
              <h3 className="text-lg font-semibold">KHQR Payment Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Merchant Name</Label>
                  <Input
                    value={settings.merchantName}
                    onChange={(e) => setSettings(prev => ({ ...prev, merchantName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bakong Account</Label>
                  <Input
                    value={settings.bakongAccount}
                    onChange={(e) => setSettings(prev => ({ ...prev, bakongAccount: e.target.value }))}
                    placeholder="username@bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Machine ID / Terminal</Label>
                  <Input
                    value={settings.machineId}
                    onChange={(e) => setSettings(prev => ({ ...prev, machineId: e.target.value }))}
                  />
                </div>
              </div>

              <Button className="btn-gold" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Telegram Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Telegram notifications are configured via environment secrets. 
                Contact the developer to update the bot token or chat ID.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
