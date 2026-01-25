import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckPaymentRequest {
  orderId: string;
  md5Hash: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, md5Hash }: CheckPaymentRequest = await req.json();
    
    console.log('Checking payment status for order:', orderId);

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw new Error('Failed to fetch order');
    }

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If order is already paid, return success
    if (order.status === 'paid') {
      return new Response(
        JSON.stringify({ 
          status: 'paid', 
          verified: true,
          payment_verified_at: order.payment_verified_at 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check with Bakong API if token is available
    const bakongToken = Deno.env.get('BAKONG_API_TOKEN');
    
    if (bakongToken) {
      try {
        console.log('Checking payment with Bakong API...');
        
        // Call Bakong API to check transaction by MD5
        const bakongResponse = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bakongToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ md5: md5Hash }),
        });

        if (bakongResponse.ok) {
          const bakongData = await bakongResponse.json();
          console.log('Bakong API response:', JSON.stringify(bakongData));
          
          // Check if transaction exists and is successful
          if (bakongData.responseCode === 0 && bakongData.data) {
            const transaction = bakongData.data;
            
            // Verify amount matches (with 1 cent tolerance for rounding)
            if (Math.abs(order.total_amount - transaction.amount) <= 0.01) {
              // Update order as paid
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  payment_verified_at: new Date().toISOString(),
                  status: 'paid'
                })
                .eq('id', orderId);

              if (updateError) {
                console.error('Error updating order:', updateError);
                throw updateError;
              }

              // Send Telegram notification
              const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
              const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

              if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                const message = `💰 *PAYMENT VERIFIED*\n\n` +
                  `📋 Order: \`${order.id}\`\n` +
                  `👤 Customer: @${order.guest_telegram?.replace('@', '') || 'N/A'}\n` +
                  `💵 Amount: $${order.total_amount.toFixed(2)}\n` +
                  `✅ Auto-verified via Bakong API`;

                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                  })
                }).catch(err => console.error('Telegram notification failed:', err));
              }

              return new Response(
                JSON.stringify({ 
                  status: 'paid', 
                  verified: true,
                  payment_verified_at: new Date().toISOString()
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } else {
          console.log('Bakong API returned non-OK status:', bakongResponse.status);
        }
      } catch (bakongError) {
        console.error('Bakong API error:', bakongError);
        // Continue with pending status if Bakong API fails
      }
    } else {
      console.log('BAKONG_API_TOKEN not configured, skipping API check');
    }

    // Return current order status
    return new Response(
      JSON.stringify({ 
        status: order.status || 'pending', 
        verified: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Check payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
