import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const update = await req.json();
    console.log('Telegram callback received:', JSON.stringify(update));

    // Get bot token
    let botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'telegram_bot_token')
        .single();
      botToken = settings?.value;
    }

    if (!botToken) {
      console.error('Bot token not configured');
      return new Response(JSON.stringify({ error: 'Bot not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get admin chat ID
    let adminChatId = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!adminChatId) {
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'telegram_chat_id')
        .single();
      adminChatId = settings?.value;
    }

    // Handle /start command - show welcome + shop
    if (update.message?.text === '/start' || update.message?.text === '/shop') {
      const chatId = update.message.chat.id;
      await showShop(supabase, botToken, chatId);
      return okResponse();
    }

    // Handle /check command - list unverified orders (admin)
    if (update.message?.text?.startsWith('/check')) {
      const chatId = update.message.chat.id;
      await handleCheckCommand(supabase, botToken, chatId);
      return okResponse();
    }

    // Handle photo messages (payment screenshot from buyer)
    if (update.message?.photo) {
      const chatId = update.message.chat.id;
      const username = update.message.from?.username || update.message.from?.first_name || 'Unknown';
      
      // Forward the photo to admin
      if (adminChatId) {
        const photo = update.message.photo[update.message.photo.length - 1]; // highest res
        const caption = update.message.caption || '';
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminChatId,
            photo: photo.file_id,
            caption: `💳 *Payment Screenshot*\n👤 From: @${username}\n${caption ? `📝 Note: ${caption}` : ''}\n\nPlease verify this payment and use /check to manage orders.`,
            parse_mode: 'Markdown'
          })
        });

        await sendMessage(botToken, chatId, '✅ Your payment screenshot has been sent to admin for verification!\n\n⏳ Please wait while we confirm your payment. You will be notified once it\'s verified.');
      } else {
        await sendMessage(botToken, chatId, '❌ Admin not configured. Please contact support.');
      }
      return okResponse();
    }

    // Handle callback query (button press)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message?.chat?.id;
      const messageId = update.callback_query.message?.message_id;

      // Shop navigation
      if (callbackData === 'shop') {
        await answerCallback(botToken, update.callback_query.id, '');
        await showShop(supabase, botToken, chatId);
        return okResponse();
      }

      // Browse by app
      if (callbackData.startsWith('app_')) {
        const app = callbackData.substring(4);
        await answerCallback(botToken, update.callback_query.id, '');
        await showAppProducts(supabase, botToken, chatId, app);
        return okResponse();
      }

      // View product detail
      if (callbackData.startsWith('product_')) {
        const productId = callbackData.substring(8);
        await answerCallback(botToken, update.callback_query.id, '');
        await showProductDetail(supabase, botToken, chatId, productId);
        return okResponse();
      }

      // Buy product - create order & show QR
      if (callbackData.startsWith('buy_')) {
        const productId = callbackData.substring(4);
        const username = update.callback_query.from?.username || update.callback_query.from?.first_name || 'Unknown';
        await answerCallback(botToken, update.callback_query.id, '🛒 Creating order...');
        await handleBuyProduct(supabase, botToken, chatId, productId, username, adminChatId);
        return okResponse();
      }

      // Admin: confirm/reject order
      if (callbackData.startsWith('confirm_') || callbackData.startsWith('reject_')) {
        await handleOrderAction(supabase, botToken, update.callback_query, callbackData, chatId, messageId);
        return okResponse();
      }

      // Admin: check bank
      if (callbackData.startsWith('check_')) {
        const orderId = callbackData.substring(6);
        await handleCheckBank(supabase, botToken, update.callback_query, orderId, chatId, messageId);
        return okResponse();
      }

      if (callbackData === 'processed') {
        await answerCallback(botToken, update.callback_query.id, '⚠️ Already processed');
        return okResponse();
      }

      await answerCallback(botToken, update.callback_query.id, '');
      return okResponse();
    }

    return okResponse();

  } catch (error: unknown) {
    console.error('Telegram callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── SHOP FUNCTIONS ───

async function showShop(supabase: any, botToken: string, chatId: number) {
  // Get distinct apps that have active products
  const { data: products } = await supabase
    .from('products')
    .select('app')
    .eq('is_active', true);

  if (!products || products.length === 0) {
    await sendMessage(botToken, chatId, '😔 No products available right now. Check back later!');
    return;
  }

  const appEmojis: Record<string, string> = {
    spotify: '🎵', youtube: '📺', capcut: '🎬',
    alight: '✨', discord: '💬', netflix: '🎬',
  };
  const appNames: Record<string, string> = {
    spotify: 'Spotify', youtube: 'YouTube', capcut: 'CapCut',
    alight: 'Alight Motion', discord: 'Discord', netflix: 'Netflix',
  };

  // Get unique apps
  const uniqueApps = [...new Set(products.map((p: any) => p.app))] as string[];

  const keyboard = {
    inline_keyboard: uniqueApps.map(app => ([{
      text: `${appEmojis[app] || '📱'} ${appNames[app] || app}`,
      callback_data: `app_${app}`
    }]))
  };

  const message = `🛍️ *Welcome to Tephh Shop!*\n\nBrowse our premium accounts & services.\nSelect a category below to get started:\n`;

  await sendMessageWithKeyboard(botToken, chatId, message, keyboard);
}

async function showAppProducts(supabase: any, botToken: string, chatId: number, app: string) {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('app', app)
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (!products || products.length === 0) {
    await sendMessage(botToken, chatId, `No products available for this app.`);
    return;
  }

  const appNames: Record<string, string> = {
    spotify: 'Spotify', youtube: 'YouTube', capcut: 'CapCut',
    alight: 'Alight Motion', discord: 'Discord', netflix: 'Netflix',
  };

  let message = `📦 *${appNames[app] || app} Products*\n\n`;
  
  const buttons: any[][] = [];
  for (const p of products) {
    const priceStr = `$${Number(p.price).toFixed(2)}`;
    const durationStr = p.duration ? ` (${p.duration})` : '';
    message += `• *${p.name}*${durationStr} — ${priceStr}\n`;
    buttons.push([{
      text: `${p.name} - ${priceStr}`,
      callback_data: `product_${p.id}`
    }]);
  }

  buttons.push([{ text: '⬅️ Back to Shop', callback_data: 'shop' }]);

  await sendMessageWithKeyboard(botToken, chatId, message, { inline_keyboard: buttons });
}

async function showProductDetail(supabase: any, botToken: string, chatId: number, productId: string) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (!product) {
    await sendMessage(botToken, chatId, '❌ Product not found or no longer available.');
    return;
  }

  const priceStr = `$${Number(product.price).toFixed(2)}`;
  const originalStr = product.original_price ? `~$${Number(product.original_price).toFixed(2)}~` : '';
  
  let message = `🏷️ *${product.name}*\n\n`;
  message += `📱 App: ${product.app}\n`;
  message += `📂 Type: ${product.category}\n`;
  if (product.duration) message += `⏰ Duration: ${product.duration}\n`;
  message += `\n💰 Price: *${priceStr}* ${originalStr}\n`;
  if (product.description) message += `\n📝 ${product.description}\n`;
  if (product.stock !== null && product.stock !== undefined) {
    message += `\n📦 Stock: ${product.stock > 0 ? product.stock : '❌ Out of stock'}`;
  }

  const keyboard = {
    inline_keyboard: [
      [{ text: `🛒 Buy Now - ${priceStr}`, callback_data: `buy_${product.id}` }],
      [{ text: `⬅️ Back to ${product.app}`, callback_data: `app_${product.app}` }],
      [{ text: '🏠 Back to Shop', callback_data: 'shop' }]
    ]
  };

  await sendMessageWithKeyboard(botToken, chatId, message, keyboard);
}

async function handleBuyProduct(supabase: any, botToken: string, chatId: number, productId: string, username: string, adminChatId: string | undefined) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (!product) {
    await sendMessage(botToken, chatId, '❌ Product not found or no longer available.');
    return;
  }

  // Create order via create-order edge function
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const orderPayload = {
    guest_name: username,
    guest_telegram: `@${username}`,
    items: [{
      product_id: product.id,
      product_name: product.name,
      product_app: product.app,
      product_category: product.category,
      product_duration: product.duration,
      quantity: 1,
      unit_price: product.price,
    }],
    total_amount: product.price,
  };

  const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(orderPayload),
  });

  const orderData = await orderRes.json();

  if (!orderRes.ok || !orderData.order) {
    console.error('Order creation failed:', orderData);
    await sendMessage(botToken, chatId, '❌ Failed to create order. Please try again later.');
    return;
  }

  const order = orderData.order;
  const qrData = orderData.qr;
  const priceStr = `$${Number(product.price).toFixed(2)}`;

  let message = `✅ *Order Created!*\n\n`;
  message += `🆔 Order: \`${order.id.slice(0, 8)}\`\n`;
  message += `🛍️ ${product.name}\n`;
  message += `💰 Total: *${priceStr}*\n\n`;

  if (qrData?.qrString) {
    // Generate QR code image via external API
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData.qrString)}`;
    
    // Send QR code as image
    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: qrImageUrl,
        caption: `${message}📱 *Scan this QR to pay via Bakong/KHQR*\n\n💡 After payment, please send a *screenshot* of your payment to this bot. We'll forward it to admin for verification.\n\n⏰ Delivery: 1-3 hours after verification.`,
        parse_mode: 'Markdown'
      })
    });
  } else {
    message += `Please contact admin for payment details.\n`;
    message += `💡 After payment, send a *screenshot* of your payment to this bot.`;
    await sendMessage(botToken, chatId, message);
  }
}

// ─── ADMIN FUNCTIONS ───

async function handleCheckCommand(supabase: any, botToken: string, chatId: number) {
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, guest_name, guest_telegram, guest_email, guest_phone, guest_notes, total_amount, status,
      order_items (product_name, quantity, unit_price)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching orders:', error);
    await sendMessage(botToken, chatId, '❌ Failed to fetch orders.');
    return;
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    await sendMessage(botToken, chatId, '✅ No pending orders! All orders are verified.');
    return;
  }

  for (const order of pendingOrders) {
    const items = (order.order_items as any[])?.map((item: any) =>
      `  • ${item.product_name} x${item.quantity} - $${(item.unit_price * item.quantity).toFixed(2)}`
    ).join('\n') || '  No items';

    const telegramHandle = order.guest_telegram?.startsWith('@')
      ? order.guest_telegram
      : `@${order.guest_telegram}`;

    const createdAt = new Date(order.created_at);
    const timeAgo = getTimeAgo(createdAt);

    const message = `📋 *Pending Order*

🆔 \`${order.id.slice(0, 8)}\`
👤 ${order.guest_name || 'Guest'}
📱 ${telegramHandle}${order.guest_email ? `\n📧 ${order.guest_email}` : ''}${order.guest_phone ? `\n📞 ${order.guest_phone}` : ''}
💵 *$${order.total_amount.toFixed(2)}*
⏰ ${timeAgo}

🛍️ Items:
${items}${order.guest_notes ? `\n\n📝 Notes: ${order.guest_notes}` : ''}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Confirm Paid', callback_data: `confirm_${order.id}` },
          { text: '❌ Reject', callback_data: `reject_${order.id}` }
        ],
        [
          { text: '🔍 Check Bank', callback_data: `check_${order.id}` }
        ]
      ]
    };

    await sendMessageWithKeyboard(botToken, chatId, message, keyboard);
  }

  await sendMessage(botToken, chatId, `📊 Total pending: *${pendingOrders.length}* order(s)`);
}

async function handleOrderAction(supabase: any, botToken: string, callbackQuery: any, callbackData: string, chatId: number, messageId: number) {
  const underscoreIndex = callbackData.indexOf('_');
  const action = callbackData.substring(0, underscoreIndex);
  const orderId = callbackData.substring(underscoreIndex + 1);

  if (!orderId) {
    await answerCallback(botToken, callbackQuery.id, '❌ Invalid order');
    return;
  }

  let responseText = '';
  let newStatus = '';

  if (action === 'confirm') {
    newStatus = 'paid';
    responseText = '✅ Order confirmed as paid!';
  } else if (action === 'reject') {
    newStatus = 'cancelled';
    responseText = '❌ Order rejected!';
  }

  if (newStatus) {
    const updateData: { status: string; payment_verified_at?: string } = { status: newStatus };
    if (newStatus === 'paid') {
      updateData.payment_verified_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order:', error);
      await answerCallback(botToken, callbackQuery.id, '❌ Failed to update order');
      return;
    }

    await answerCallback(botToken, callbackQuery.id, responseText);

    const statusEmoji = newStatus === 'paid' ? '✅' : '❌';
    const statusText = newStatus === 'paid' ? 'CONFIRMED' : 'REJECTED';
    
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: `${statusEmoji} ${statusText}`, callback_data: 'processed' }]
          ]
        }
      })
    });
  }
}

async function handleCheckBank(supabase: any, botToken: string, callbackQuery: any, orderId: string, chatId: number, messageId: number) {
  const { data: order } = await supabase
    .from('orders')
    .select('payment_md5')
    .eq('id', orderId)
    .single();

  if (order?.payment_md5) {
    const checkResult = await supabase.functions.invoke('check-payment', {
      body: { orderId, md5Hash: order.payment_md5 }
    });
    
    if (checkResult.data?.verified || checkResult.data?.status === 'paid') {
      await answerCallback(botToken, callbackQuery.id, '✅ Payment verified in Bakong!');
      
      // Auto-confirm
      await supabase.from('orders').update({ 
        status: 'paid', 
        payment_verified_at: new Date().toISOString() 
      }).eq('id', orderId);

      await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ CONFIRMED (Bank Verified)', callback_data: 'processed' }]
            ]
          }
        })
      });
    } else {
      await answerCallback(botToken, callbackQuery.id, '⏳ Payment not found in Bakong yet');
    }
  } else {
    await answerCallback(botToken, callbackQuery.id, '❌ No payment hash found');
  }
}

// ─── HELPERS ───

function okResponse() {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
  });
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

async function answerCallback(botToken: string, callbackId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text: text,
      show_alert: text.length > 0
    })
  });
}

async function sendMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}

async function sendMessageWithKeyboard(botToken: string, chatId: number, text: string, keyboard: any) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  });
}
