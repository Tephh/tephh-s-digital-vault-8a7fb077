import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Copy, 
  Check, 
  Loader2,
  QrCode,
  Send,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateKHQR, MERCHANT_CONFIG } from '@/lib/khqr';
import { getAppIcon } from '@/lib/appIcons';

type CheckoutStep = 'info' | 'payment' | 'complete';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cart, getTotalPrice, getDiscountedPrice, couponCode, couponDiscount, clearCart } = useCart();
  
  const [step, setStep] = useState<CheckoutStep>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'paid'>('pending');
  
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    telegram: profile?.telegram_username || '',
    email: profile?.email || '',
    phone: '',
    notes: '',
    accountEmail: '',
    accountPassword: '',
  });

  // Check if cart needs account credentials
  const needsAccountCredentials = cart.some(item => item.category === 'topup');

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        telegram: profile.telegram_username || prev.telegram,
        email: profile.email || prev.email,
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.telegram.trim()) {
      toast.error('Telegram username is required');
      return;
    }

    if (needsAccountCredentials && (!formData.accountEmail || !formData.accountPassword)) {
      toast.error('Account credentials are required for top-up orders');
      return;
    }

    setIsLoading(true);
    setOrderError(null);

    try {
      const totalAmount = getDiscountedPrice();
      const discountAmount = getTotalPrice() - totalAmount;

      // Validate amount before KHQR generation
      if (totalAmount <= 0) {
        throw new Error('Invalid order amount. Cart total must be greater than $0.');
      }

      // Generate KHQR with validated amount
      const billNumber = `ORD-${Date.now()}`;
      let khqrResult;
      try {
        khqrResult = generateKHQR({
          bakongAccount: MERCHANT_CONFIG.bakongAccount,
          merchantName: MERCHANT_CONFIG.merchantName,
          merchantCity: MERCHANT_CONFIG.merchantCity,
          terminalLabel: MERCHANT_CONFIG.terminalLabel,
          currency: 'USD',
          amount: totalAmount,
          billNumber,
          storeLabel: 'Tephh Shop',
        });
      } catch (khqrError: any) {
        console.error('KHQR generation failed:', khqrError);
        throw new Error(`Payment QR generation failed: ${khqrError.message}`);
      }

      setQrData(khqrResult);

      // Create order via backend function (avoids client-side RLS issues)
      const orderItems = cart.map(item => ({
        product_id: item.id.includes('-') ? null : item.id,
        product_name: item.name,
        product_app: item.app,
        product_category: item.category,
        product_duration: item.duration || null,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { data: createData, error: createError } = await supabase.functions.invoke('create-order', {
        body: {
          user_id: user?.id || null,
          guest_name: formData.name || null,
          guest_telegram: formData.telegram,
          guest_email: formData.email || null,
          guest_phone: formData.phone || null,
          guest_notes: formData.notes || null,
          account_email: formData.accountEmail || null,
          account_password: formData.accountPassword || null,
          total_amount: totalAmount,
          discount_amount: discountAmount > 0 ? discountAmount : null,
          coupon_code: couponCode,
          payment_md5: khqrResult.md5,
          status: 'pending',
          items: orderItems,
        }
      });

      if (createError) {
        console.error('Edge function error:', JSON.stringify(createError, null, 2));
        throw new Error(createError.message || 'Failed to create order - network error');
      }
      
      if (!createData?.order?.id) {
        console.error('Invalid response from create-order:', createData);
        throw new Error('Failed to create order - invalid server response');
      }

      const order = createData.order as { id: string };
      setOrderId(order.id);
      setOrderError(null);

      // Send Telegram notification (non-blocking)
      supabase.functions.invoke('telegram-notify', {
        body: {
          orderId: order.id,
          customerTelegram: formData.telegram,
          customerName: formData.name,
          totalAmount,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            app: item.app,
          })),
          status: 'new',
        }
      }).catch(notifyError => {
        console.error('Failed to send Telegram notification:', notifyError);
      });

      setStep('payment');
      toast.success('Order created! Please complete payment.');

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create order. Please try again.';
      console.error('Error creating order:', error);
      setOrderError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMD5 = () => {
    if (qrData?.md5) {
      navigator.clipboard.writeText(qrData.md5);
      setCopied(true);
      toast.success('MD5 copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Real-time payment status polling
  useEffect(() => {
    if (step !== 'payment' || !orderId || !qrData) return;

    const checkPaymentStatus = async () => {
      try {
        setIsCheckingPayment(true);
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { orderId, md5Hash: qrData.md5 }
        });

        if (error) {
          console.error('Payment check error:', error);
          return;
        }

        if (data?.status === 'paid' || data?.verified) {
          setPaymentStatus('paid');
          clearCart();
          setStep('complete');
          toast.success('🎉 Payment verified automatically! Thank you for your order.');
          return;
        }
      } catch (err) {
        console.error('Payment polling error:', err);
      } finally {
        setIsCheckingPayment(false);
      }
    };

    // Initial check
    checkPaymentStatus();

    // Poll every 5 seconds
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [step, orderId, qrData, clearCart]);

  const handleConfirmPayment = async () => {
    if (!orderId || !qrData) return;

    setIsLoading(true);

    try {
      // Verify payment
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          orderId,
          md5Hash: qrData.md5,
        }
      });

      if (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed. Please wait for auto-verification or contact support.');
        return;
      }

      clearCart();
      setStep('complete');
      toast.success('Payment confirmed! Thank you for your order.');

    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment. We will verify it automatically.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && step !== 'complete') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <Link to="/shop">
              <Button className="btn-gold">Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-4">
              {['info', 'payment', 'complete'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${step === s ? 'bg-primary text-primary-foreground' : 
                        ['info', 'payment', 'complete'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                      {['info', 'payment', 'complete'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="hidden sm:inline capitalize">{s === 'info' ? 'Information' : s}</span>
                  </div>
                  {i < 2 && <div className="w-12 h-0.5 bg-muted" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step: Information */}
          {step === 'info' && (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Checkout Information</h2>
                
                <form onSubmit={handleSubmitInfo} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Username *</Label>
                      <Input
                        id="telegram"
                        name="telegram"
                        value={formData.telegram}
                        onChange={handleChange}
                        placeholder="@yourusername"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="855 12 345 678"
                      />
                    </div>
                  </div>

                  {needsAccountCredentials && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Account Credentials Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        For top-up orders, we need your account credentials to add the subscription.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountEmail">Account Email *</Label>
                          <Input
                            id="accountEmail"
                            name="accountEmail"
                            type="email"
                            value={formData.accountEmail}
                            onChange={handleChange}
                            placeholder="account@email.com"
                            required={needsAccountCredentials}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountPassword">Account Password *</Label>
                          <Input
                            id="accountPassword"
                            name="accountPassword"
                            type="password"
                            value={formData.accountPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required={needsAccountCredentials}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions..."
                      rows={3}
                    />
                  </div>

                  {/* Error Banner */}
                  {orderError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-destructive">Order Creation Failed</p>
                        <p className="text-sm text-destructive/80">{orderError}</p>
                        <p className="text-xs text-muted-foreground mt-1">Please try again or contact support via Telegram @tephh</p>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold">Order Summary</h3>
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 text-sm p-3 bg-muted/30 rounded-lg">
                        <img 
                          src={getAppIcon(item.app)} 
                          alt={item.app}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-muted-foreground text-xs">{item.duration} × {item.quantity}</p>
                        </div>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-500">
                          <span>Discount ({couponCode} - {couponDiscount}%)</span>
                          <span>-${(getTotalPrice() - getDiscountedPrice()).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-gradient-gold">${getDiscountedPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link to="/cart" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                      </Button>
                    </Link>
                    <Button type="submit" className="flex-1 btn-gold" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && qrData && (
            <div className="max-w-lg mx-auto">
              <div className="glass-card p-6 md:p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Scan to Pay</h2>
                <p className="text-muted-foreground mb-6">
                  Scan the KHQR code with your banking app
                </p>

                {/* Real-time Payment Status Banner */}
                <div className={`mb-6 p-4 rounded-lg flex items-center justify-center gap-3 ${
                  isCheckingPayment 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}>
                  {isCheckingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-blue-500 font-medium">Checking payment status...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">Waiting for payment...</span>
                    </>
                  )}
                </div>

                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl inline-block mb-6">
                  <QRCodeSVG
                    value={qrData.qrString}
                    size={250}
                    level="H"
                    includeMargin
                  />
                </div>

                {/* Payment Details */}
                <div className="text-left space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-2xl font-bold text-gradient-gold">
                      ${getDiscountedPrice().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Merchant</span>
                    <span className="font-medium">{MERCHANT_CONFIG.merchantName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-sm">{orderId?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      paymentStatus === 'paid' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">MD5 Hash</span>
                      <Button variant="ghost" size="sm" onClick={handleCopyMD5}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <code className="text-xs break-all block">{qrData.md5}</code>
                  </div>
                </div>

                <Button 
                  className="w-full btn-gold text-lg py-6"
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      I've Paid - Submit for Verification
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
                  💡 After clicking, an admin will verify your payment and confirm your order. 
                  Please wait for confirmation via Telegram.
                </p>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="max-w-lg mx-auto text-center">
              <div className="glass-card p-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Order Submitted!</h2>
                <p className="text-muted-foreground mb-4">
                  Thank you for your purchase! Your order has been submitted for verification.
                </p>
                
                {/* Delivery Time Notice */}
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg mb-6">
                  <div className="flex items-center justify-center gap-2 text-primary mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Estimated Delivery: 1-3 Hours</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    An admin will verify your payment and deliver your products via Telegram. 
                    Please ensure your Telegram username is correct.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg text-left mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono">{orderId}</p>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-left mb-6">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ If you don't receive confirmation within 3 hours, please contact us via Telegram @tephh
                  </p>
                </div>

                <div className="flex gap-4">
                  <Link to="/shop" className="flex-1">
                    <Button variant="outline" className="w-full">Continue Shopping</Button>
                  </Link>
                  {user && (
                    <Link to="/dashboard" className="flex-1">
                      <Button className="w-full btn-gold">View Orders</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
