import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_telegram: string;
  guest_email: string | null;
  guest_notes: string | null;
  total_amount: number;
  discount_amount: number | null;
  coupon_code: string | null;
  status: string | null;
  payment_md5: string | null;
  payment_verified_at: string | null;
  account_email: string | null;
  account_password: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_app: string;
  product_category: string;
  product_duration: string | null;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface CreateOrderData {
  guest_name?: string;
  guest_telegram: string;
  guest_email?: string;
  guest_notes?: string;
  account_email?: string;
  account_password?: string;
  total_amount: number;
  discount_amount?: number;
  coupon_code?: string;
  items: {
    product_id?: string;
    product_name: string;
    product_app: string;
    product_category: string;
    product_duration?: string;
    quantity: number;
    unit_price: number;
  }[];
}

export const useUserOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          guest_name: orderData.guest_name,
          guest_telegram: orderData.guest_telegram,
          guest_email: orderData.guest_email,
          guest_notes: orderData.guest_notes,
          account_email: orderData.account_email,
          account_password: orderData.account_password,
          total_amount: orderData.total_amount,
          discount_amount: orderData.discount_amount,
          coupon_code: orderData.coupon_code,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_app: item.product_app,
        product_category: item.product_category,
        product_duration: item.product_duration,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
