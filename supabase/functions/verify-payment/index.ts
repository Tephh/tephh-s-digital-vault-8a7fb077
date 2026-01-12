import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentVerification {
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

    const body: PaymentVerification = await req.json();
    console.log('Payment verification request:', body);

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', body.orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already verified
    if (order.payment_verified_at) {
      return new Response(
        JSON.stringify({ success: true, message: 'Payment already verified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order with payment verification
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_md5: body.md5Hash,
        payment_verified_at: new Date().toISOString(),
        status: 'paid'
      })
      .eq('id', body.orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    // Send Telegram notification
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `💰 *PAYMENT VERIFIED*\n\n` +
        `📋 Order: \`${body.orderId}\`\n` +
        `👤 Customer: @${order.guest_telegram?.replace('@', '') || 'N/A'}\n` +
        `💵 Amount: $${order.total_amount.toFixed(2)}\n` +
        `🔐 MD5: \`${body.md5Hash}\`\n\n` +
        `✅ Please deliver the products!`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
