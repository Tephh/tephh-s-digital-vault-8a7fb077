import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  app: string;
  duration: string | null;
  duration_months: number | null;
  stock: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = (filters?: { category?: string; app?: string }) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('app')
        .order('duration_months');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.app && filters.app !== 'all') {
        query = query.eq('app', filters.app);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as DatabaseProduct[];
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data as DatabaseProduct;
    },
    enabled: !!productId,
  });
};

export const useProductsByApp = (app: string) => {
  return useQuery({
    queryKey: ['products', 'app', app],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('app', app)
        .eq('is_active', true)
        .order('category')
        .order('duration_months');
      
      if (error) throw error;
      return data as DatabaseProduct[];
    },
    enabled: !!app,
  });
};
