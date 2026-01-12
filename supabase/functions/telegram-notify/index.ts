import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotification {
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
  status: 'new' | 'paid' | 'completed' | 'cancelled';
  paymentMd5?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram configuration');
      return new Response(
        JSON.stringify({ error: 'Telegram not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: OrderNotification = await req.json();
    console.log('Received notification request:', body);

    let message = '';
    const emoji = {
      new: '🆕',
      paid: '💰',
      completed: '✅',
      cancelled: '❌'
    };

    if (body.status === 'new') {
      message = `${emoji.new} *NEW ORDER*\n\n`;
      message += `📋 Order ID: \`${body.orderId}\`\n`;
      message += `👤 Customer: ${body.customerName || 'Guest'}\n`;
      message += `📱 Telegram: @${body.customerTelegram.replace('@', '')}\n\n`;
      message += `📦 *Items:*\n`;
      body.items.forEach(item => {
        message += `  • ${item.name} (${item.app}) x${item.quantity} - $${item.price.toFixed(2)}\n`;
      });
      message += `\n💵 *Total: $${body.totalAmount.toFixed(2)}*\n`;
      message += `\n⏳ Awaiting payment...`;
    } else if (body.status === 'paid') {
      message = `${emoji.paid} *PAYMENT RECEIVED*\n\n`;
      message += `📋 Order ID: \`${body.orderId}\`\n`;
      message += `👤 Customer: @${body.customerTelegram.replace('@', '')}\n`;
      message += `💵 Amount: $${body.totalAmount.toFixed(2)}\n`;
      if (body.paymentMd5) {
        message += `🔐 MD5: \`${body.paymentMd5}\`\n`;
      }
      message += `\n✅ Please deliver the order to the customer!`;
    } else if (body.status === 'completed') {
      message = `${emoji.completed} *ORDER COMPLETED*\n\n`;
      message += `📋 Order ID: \`${body.orderId}\`\n`;
      message += `👤 Customer: @${body.customerTelegram.replace('@', '')}\n`;
    } else if (body.status === 'cancelled') {
      message = `${emoji.cancelled} *ORDER CANCELLED*\n\n`;
      message += `📋 Order ID: \`${body.orderId}\`\n`;
      message += `👤 Customer: @${body.customerTelegram.replace('@', '')}\n`;
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram response:', telegramResult);

    if (!telegramResponse.ok) {
      throw new Error(`Telegram API error: ${JSON.stringify(telegramResult)}`);
    }

    return new Response(
      JSON.stringify({ success: true, telegramResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
