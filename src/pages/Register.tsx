import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, UserPlus, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  telegram: z.string().min(2, 'Telegram username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { user, signUp, isLoading: loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    telegram: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      registerSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.name,
        telegram_username: formData.telegram,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        setIsRegistered(true);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
          <div className="max-w-md mx-auto">
            <div className="glass-card p-8 space-y-8">
              {!isRegistered ? (
                <>
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">
                      <span className="text-gradient-primary">Create Account</span>
                    </h1>
                    <p className="text-muted-foreground">
                      Join K'TEPHH Shop today
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">Member benefits:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Track your order history
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Faster checkout
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Exclusive discounts
                      </li>
                    </ul>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Username *</Label>
                      <Input
                        id="telegram"
                        name="telegram"
                        type="text"
                        placeholder="@yourusername"
                        value={formData.telegram}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll deliver your products via Telegram
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="rounded border-input mt-1" required />
                      <span className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <Link to="/policy" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/policy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full btn-gold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary font-semibold hover:underline">
                        Login
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                /* Registration Success */
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Account Created!</h2>
                    <p className="text-muted-foreground">
                      Your account has been created successfully.
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg text-left">
                    <p className="text-sm font-medium mb-2">📧 Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification link to <strong>{formData.email}</strong>. 
                      The link expires in 12 hours.
                    </p>
                  </div>
                  <Link to="/login">
                    <Button className="w-full btn-gold">
                      Continue to Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
