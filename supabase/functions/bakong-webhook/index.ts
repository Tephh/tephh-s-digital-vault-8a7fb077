import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BakongCallback {
  md5: string;
  fromAccountId: string;
  toAccountId: string;
  currency: string;
  amount: number;
  hash: string;
  time: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BakongCallback = await req.json();
    console.log('Bakong webhook received:', JSON.stringify(body));

    // Find order by MD5 hash
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_md5', body.md5)
      .maybeSingle();

    if (orderError) {
      console.error('Error finding order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!order) {
      console.log('No order found for MD5:', body.md5);
      return new Response(
        JSON.stringify({ message: 'Order not found, but webhook received' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount matches
    if (Math.abs(order.total_amount - body.amount) > 0.01) {
      console.error('Amount mismatch:', { expected: order.total_amount, received: body.amount });
      return new Response(
        JSON.stringify({ error: 'Amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order as paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_verified_at: new Date().toISOString(),
        status: 'paid'
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order verified successfully:', order.id);

    // Send Telegram notification
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `💰 *PAYMENT RECEIVED (Bakong)*\n\n` +
        `📋 Order: \`${order.id}\`\n` +
        `👤 Customer: @${order.guest_telegram?.replace('@', '') || 'N/A'}\n` +
        `📱 Phone: ${order.guest_phone || 'N/A'}\n` +
        `💵 Amount: $${body.amount.toFixed(2)}\n` +
        `🏦 From: ${body.fromAccountId}\n` +
        `⏰ Time: ${body.time}\n` +
        `🔐 Hash: \`${body.hash.slice(0, 16)}...\`\n\n` +
        `✅ Payment auto-verified via Bakong!`;

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
      JSON.stringify({ success: true, orderId: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Bakong webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
