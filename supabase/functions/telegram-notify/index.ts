import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyRequest {
  orderId: string;
  customerTelegram: string;
  customerName?: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    app: string;
  }>;
  status: 'new' | 'paid' | 'completed' | 'cancelled' | 'status_update';
  action?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: NotifyRequest = await req.json();
    const { orderId, customerTelegram, customerName, totalAmount, items, status, action } = body;

    console.log('Telegram notify request:', { orderId, status, action });

    // First try environment secrets
    let botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    let chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    // If not in env, try database settings
    if (!botToken || !chatId) {
      const { data: settings } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['telegram_bot_token', 'telegram_chat_id']);

      if (settings) {
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => {
          settingsMap[s.key] = s.value || '';
        });
        
        if (!botToken) botToken = settingsMap.telegram_bot_token;
        if (!chatId) chatId = settingsMap.telegram_chat_id;
      }
    }

    if (!botToken || !chatId) {
      console.log('Telegram bot not configured, skipping notification');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build message based on status
    let emoji = '📦';
    let title = 'New Order';
    
    switch (status) {
      case 'new':
        emoji = '🛒';
        title = 'NEW ORDER';
        break;
      case 'paid':
        emoji = '💰';
        title = 'PAYMENT CONFIRMED';
        break;
      case 'completed':
        emoji = '✅';
        title = 'ORDER COMPLETED';
        break;
      case 'cancelled':
        emoji = '❌';
        title = 'ORDER CANCELLED';
        break;
      case 'status_update':
        emoji = '🔄';
        title = 'ORDER UPDATED';
        break;
    }

    const itemsList = items.map(item => 
      `  • ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const telegramHandle = customerTelegram?.startsWith('@') 
      ? customerTelegram 
      : `@${customerTelegram}`;

    // Get full order details from database for email/phone
    let customerEmail = '';
    let customerPhone = '';
    let customerNotes = '';
    
    if (orderId) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('guest_email, guest_phone, guest_notes, account_email')
        .eq('id', orderId)
        .single();
      
      if (orderData) {
        customerEmail = orderData.guest_email || '';
        customerPhone = orderData.guest_phone || '';
        customerNotes = orderData.guest_notes || '';
      }
    }

    const message = `${emoji} *${title}*

📋 Order: \`${orderId.slice(0, 8)}\`
👤 Customer: ${customerName || 'Guest'}
📱 Telegram: ${telegramHandle}${customerEmail ? `\n📧 Email: ${customerEmail}` : ''}${customerPhone ? `\n📞 Phone: ${customerPhone}` : ''}
💵 Total: *$${totalAmount.toFixed(2)}*

🛍️ Items:
${itemsList}
${customerNotes ? `\n📝 Notes: ${customerNotes}` : ''}
${status === 'new' ? '⏳ Awaiting payment verification...' : ''}
${status === 'paid' ? '🎉 Payment verified! Ready to fulfill.' : ''}`;

    // Create inline keyboard for pending orders
    const inlineKeyboard = status === 'new' ? {
      inline_keyboard: [
        [
          { text: '✅ Confirm Paid', callback_data: `confirm_${orderId}` },
          { text: '❌ Reject', callback_data: `reject_${orderId}` }
        ],
        [
          { text: '🔍 Check Bank', callback_data: `check_${orderId}` },
          { text: '📋 View Details', url: `https://tephhshop.lovable.app/#/admin` }
        ]
      ]
    } : undefined;

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: inlineKeyboard,
        }),
      }
    );

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ success: false, error: telegramResult.description }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram notification sent successfully');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Telegram notify error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
