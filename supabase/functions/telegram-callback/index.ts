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

    let botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      const { data: settings } = await supabase.from('settings').select('value').eq('key', 'telegram_bot_token').single();
      botToken = settings?.value;
    }
    if (!botToken) {
      return new Response(JSON.stringify({ error: 'Bot not configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let adminChatId = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!adminChatId) {
      const { data: settings } = await supabase.from('settings').select('value').eq('key', 'telegram_chat_id').single();
      adminChatId = settings?.value;
    }

    // ─── TEXT COMMANDS ───
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      if (text === '/start' || text === '/shop') {
        await showMainMenu(botToken, chatId);
        return okResponse();
      }
      if (text === '/check') {
        await handleCheckCommand(supabase, botToken, chatId);
        return okResponse();
      }
      // If user sends text while we expect info (telegram username for order)
      // Check if there's a pending order state
      const stateKey = `order_state_${chatId}`;
      // We use a simple approach: check if the text looks like a telegram handle
      // This is handled by callback flow instead
    }

    // ─── PHOTO (payment screenshot) ───
    if (update.message?.photo) {
      const chatId = update.message.chat.id;
      const username = update.message.from?.username || update.message.from?.first_name || 'Unknown';
      if (adminChatId) {
        const photo = update.message.photo[update.message.photo.length - 1];
        const caption = update.message.caption || '';
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminChatId,
            photo: photo.file_id,
            caption: `💳 *Payment Screenshot*\n👤 From: @${username}\n${caption ? `📝 Note: ${caption}` : ''}\n\nUse /check to manage pending orders.`,
            parse_mode: 'Markdown'
          })
        });
        await sendMessage(botToken, chatId, '✅ Your payment screenshot has been sent to admin!\n\n⏳ Please wait for verification. You\'ll be notified once confirmed.\n\n📦 Delivery: within 1-3 hours after verification.');
      } else {
        await sendMessage(botToken, chatId, '❌ Admin not configured. Please contact support.');
      }
      return okResponse();
    }

    // ─── CALLBACK QUERIES (button presses) ───
    if (update.callback_query) {
      const data = update.callback_query.data;
      const chatId = update.callback_query.message?.chat?.id;
      const messageId = update.callback_query.message?.message_id;
      const username = update.callback_query.from?.username || update.callback_query.from?.first_name || 'Unknown';

      await answerCallback(botToken, update.callback_query.id, '');

      // ── Main Menu ──
      if (data === 'main_menu') {
        await editMainMenu(botToken, chatId, messageId);
        return okResponse();
      }

      // ── Products (show all grouped) ──
      if (data === 'products') {
        await showAllProducts(supabase, botToken, chatId, messageId);
        return okResponse();
      }

      // ── Browse by app ──
      if (data.startsWith('app_')) {
        const app = data.substring(4);
        await showAppProducts(supabase, botToken, chatId, messageId, app);
        return okResponse();
      }

      // ── Product detail ──
      if (data.startsWith('product_')) {
        const productId = data.substring(8);
        await showProductDetail(supabase, botToken, chatId, messageId, productId);
        return okResponse();
      }

      // ── Buy product ──
      if (data.startsWith('buy_')) {
        const productId = data.substring(4);
        await handleBuyProduct(supabase, botToken, chatId, messageId, productId, username, adminChatId);
        return okResponse();
      }

      // ── Order History ──
      if (data === 'history') {
        await showOrderHistory(supabase, botToken, chatId, messageId, username);
        return okResponse();
      }

      // ── Account ──
      if (data === 'account') {
        await showAccount(botToken, chatId, messageId, username);
        return okResponse();
      }

      // ── Q&A ──
      if (data === 'faq') {
        await showFAQ(botToken, chatId, messageId);
        return okResponse();
      }

      // ── Contact ──
      if (data === 'contact') {
        await showContact(botToken, chatId, messageId);
        return okResponse();
      }

      // ── Admin: confirm/reject ──
      if (data.startsWith('confirm_') || data.startsWith('reject_')) {
        await handleOrderAction(supabase, botToken, update.callback_query, data, chatId, messageId);
        return okResponse();
      }

      // ── Admin: check bank ──
      if (data.startsWith('check_')) {
        const orderId = data.substring(6);
        await handleCheckBank(supabase, botToken, update.callback_query, orderId, chatId, messageId);
        return okResponse();
      }

      if (data === 'processed') {
        await answerCallback(botToken, update.callback_query.id, '⚠️ Already processed');
        return okResponse();
      }

      return okResponse();
    }

    return okResponse();
  } catch (error: unknown) {
    console.error('Telegram callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// ═══════════════════════════════════════════════
// ─── MAIN MENU ───
// ═══════════════════════════════════════════════

async function showMainMenu(botToken: string, chatId: number) {
  const text = `🛍️ *Welcome to Pu-Tephh Digital Products!*\n\nPremium accounts & subscriptions at the best prices.\nFast delivery • Trusted service • Full warranty\n\n📱 Choose an option below:`;
  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Browse Products', callback_data: 'products' }],
      [{ text: '📋 Order History', callback_data: 'history' }, { text: '👤 Account', callback_data: 'account' }],
      [{ text: '❓ Q&A', callback_data: 'faq' }, { text: '📞 Contact', callback_data: 'contact' }],
    ]
  };
  await sendMessageWithKeyboard(botToken, chatId, text, keyboard);
}

async function editMainMenu(botToken: string, chatId: number, messageId: number) {
  const text = `🛍️ *Welcome to Pu-Tephh Digital Products!*\n\nPremium accounts & subscriptions at the best prices.\nFast delivery • Trusted service • Full warranty\n\n📱 Choose an option below:`;
  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Browse Products', callback_data: 'products' }],
      [{ text: '📋 Order History', callback_data: 'history' }, { text: '👤 Account', callback_data: 'account' }],
      [{ text: '❓ Q&A', callback_data: 'faq' }, { text: '📞 Contact', callback_data: 'contact' }],
    ]
  };
  await editMessage(botToken, chatId, messageId, text, keyboard);
}

// ═══════════════════════════════════════════════
// ─── PRODUCTS ───
// ═══════════════════════════════════════════════

async function showAllProducts(supabase: any, botToken: string, chatId: number, messageId: number) {
  const { data: products } = await supabase
    .from('products')
    .select('app')
    .eq('is_active', true);

  if (!products || products.length === 0) {
    await editMessage(botToken, chatId, messageId, '😔 No products available right now. Check back later!', {
      inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
    });
    return;
  }

  const uniqueApps = [...new Set(products.map((p: any) => p.app))] as string[];
  const appCounts: Record<string, number> = {};
  products.forEach((p: any) => { appCounts[p.app] = (appCounts[p.app] || 0) + 1; });

  const buttons = uniqueApps.map(app => [{
    text: `${getAppEmoji(app)} ${getAppName(app)} (${appCounts[app]})`,
    callback_data: `app_${app}`
  }]);
  buttons.push([{ text: '🏠 Main Menu', callback_data: 'main_menu' }]);

  await editMessage(botToken, chatId, messageId, '📦 *Product Categories*\n\nSelect an app to browse products:', {
    inline_keyboard: buttons
  });
}

async function showAppProducts(supabase: any, botToken: string, chatId: number, messageId: number, app: string) {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('app', app)
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (!products || products.length === 0) {
    await editMessage(botToken, chatId, messageId, `No products available for ${getAppName(app)}.`, {
      inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'products' }], [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
    });
    return;
  }

  let text = `${getAppEmoji(app)} *${getAppName(app)} Products*\n\n`;
  const buttons: any[][] = [];
  for (const p of products) {
    const priceStr = `$${Number(p.price).toFixed(2)}`;
    const durationStr = p.duration ? ` • ${p.duration}` : '';
    text += `• ${p.name}${durationStr} — *${priceStr}*\n`;
    buttons.push([{
      text: `${p.name} - ${priceStr}`,
      callback_data: `product_${p.id}`
    }]);
  }
  buttons.push([{ text: '⬅️ Back to Categories', callback_data: 'products' }]);
  buttons.push([{ text: '🏠 Main Menu', callback_data: 'main_menu' }]);

  await editMessage(botToken, chatId, messageId, text, { inline_keyboard: buttons });
}

async function showProductDetail(supabase: any, botToken: string, chatId: number, messageId: number, productId: string) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (!product) {
    await editMessage(botToken, chatId, messageId, '❌ Product not found or no longer available.', {
      inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'products' }]]
    });
    return;
  }

  const priceStr = `$${Number(product.price).toFixed(2)}`;
  const originalStr = product.original_price ? ` ~$${Number(product.original_price).toFixed(2)}~` : '';

  let text = `🏷️ *${product.name}*\n\n`;
  text += `${getAppEmoji(product.app)} App: ${getAppName(product.app)}\n`;
  text += `📂 Type: ${product.category}\n`;
  if (product.duration) text += `⏰ Duration: ${product.duration}\n`;
  text += `\n💰 Price: *${priceStr}*${originalStr}\n`;
  if (product.description) text += `\n📝 ${product.description}\n`;
  if (product.stock !== null && product.stock !== undefined) {
    text += `\n📦 Stock: ${product.stock > 0 ? `${product.stock} available` : '❌ Out of stock'}`;
  }

  const keyboard = {
    inline_keyboard: [
      [{ text: `🛒 Buy Now - ${priceStr}`, callback_data: `buy_${product.id}` }],
      [{ text: `⬅️ Back to ${getAppName(product.app)}`, callback_data: `app_${product.app}` }],
      [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
    ]
  };

  await editMessage(botToken, chatId, messageId, text, keyboard);
}

async function handleBuyProduct(supabase: any, botToken: string, chatId: number, messageId: number, productId: string, username: string, adminChatId: string | undefined) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (!product) {
    await editMessage(botToken, chatId, messageId, '❌ Product not found or no longer available.', {
      inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
    });
    return;
  }

  // Update the current message to show "Creating order..."
  await editMessage(botToken, chatId, messageId, '⏳ Creating your order...', { inline_keyboard: [] });

  // Create order
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
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
    body: JSON.stringify(orderPayload),
  });

  let orderData;
  const contentType = orderRes.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    orderData = await orderRes.json();
  } else {
    const text = await orderRes.text();
    console.error('Non-JSON response from create-order:', text);
    await editMessage(botToken, chatId, messageId, '❌ Failed to create order. Please try again.', {
      inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
    });
    return;
  }

  if (!orderRes.ok || !orderData.order) {
    console.error('Order creation failed:', orderData);
    await editMessage(botToken, chatId, messageId, '❌ Failed to create order. Please try again later.', {
      inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
    });
    return;
  }

  const order = orderData.order;
  const qrData = orderData.qr;
  const priceStr = `$${Number(product.price).toFixed(2)}`;

  // Update the message to show order info
  let orderMsg = `✅ *Order Created!*\n\n`;
  orderMsg += `🆔 Order: \`${order.id.slice(0, 8)}\`\n`;
  orderMsg += `🛍️ ${product.name}\n`;
  orderMsg += `💰 Total: *${priceStr}*\n\n`;

  if (qrData?.qrString) {
    // Edit current message to show order details
    await editMessage(botToken, chatId, messageId, orderMsg + '📱 Generating QR code...', { inline_keyboard: [] });

    // Send QR code as a NEW photo message (can't edit text to photo)
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData.qrString)}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: qrImageUrl,
        caption: `📱 *Scan this QR to pay via Bakong/KHQR*\n\n💵 Amount: *${priceStr}*\n\n💡 After payment, send a *screenshot* of your payment to this chat.\n\n⏰ Delivery: 1-3 hours after verification.`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Back to Main Menu', callback_data: 'main_menu' }]
          ]
        }
      })
    });
  } else {
    orderMsg += `Please contact admin for payment details.\n💡 After payment, send a *screenshot* of your payment to this chat.`;
    await editMessage(botToken, chatId, messageId, orderMsg, {
      inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
    });
  }

  // Notify admin
  if (adminChatId) {
    const adminMsg = `🛒 *New Order from Telegram Bot!*\n\n🆔 \`${order.id.slice(0, 8)}\`\n👤 @${username}\n🛍️ ${product.name}\n💰 *${priceStr}*\n\nWaiting for payment screenshot...`;
    await sendMessageWithKeyboard(botToken, parseInt(adminChatId), adminMsg, {
      inline_keyboard: [
        [{ text: '✅ Confirm Paid', callback_data: `confirm_${order.id}` }, { text: '❌ Reject', callback_data: `reject_${order.id}` }],
        [{ text: '🔍 Check Bank', callback_data: `check_${order.id}` }]
      ]
    });
  }
}

// ═══════════════════════════════════════════════
// ─── ORDER HISTORY, ACCOUNT, FAQ, CONTACT ───
// ═══════════════════════════════════════════════

async function showOrderHistory(supabase: any, botToken: string, chatId: number, messageId: number, username: string) {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, created_at, total_amount, status, order_items(product_name, quantity)')
    .or(`guest_telegram.eq.@${username},guest_telegram.eq.${username}`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!orders || orders.length === 0) {
    await editMessage(botToken, chatId, messageId, '📋 *Order History*\n\nYou have no orders yet. Start shopping! 🛒', {
      inline_keyboard: [
        [{ text: '🛒 Browse Products', callback_data: 'products' }],
        [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
      ]
    });
    return;
  }

  let text = '📋 *Your Recent Orders*\n\n';
  for (const order of orders) {
    const statusEmoji = order.status === 'completed' ? '✅' : order.status === 'paid' ? '💳' : order.status === 'cancelled' ? '❌' : '⏳';
    const items = (order.order_items as any[])?.map((i: any) => i.product_name).join(', ') || 'Unknown';
    const date = new Date(order.created_at);
    text += `${statusEmoji} \`${order.id.slice(0, 8)}\` • $${order.total_amount.toFixed(2)}\n`;
    text += `   ${items}\n`;
    text += `   ${date.toLocaleDateString()}\n\n`;
  }

  await editMessage(botToken, chatId, messageId, text, {
    inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
  });
}

async function showAccount(botToken: string, chatId: number, messageId: number, username: string) {
  const text = `👤 *Your Account*\n\n📱 Telegram: @${username}\n🆔 Chat ID: \`${chatId}\`\n\nYour orders are linked to your Telegram username. Contact us if you need help!`;
  await editMessage(botToken, chatId, messageId, text, {
    inline_keyboard: [
      [{ text: '📋 Order History', callback_data: 'history' }],
      [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
    ]
  });
}

async function showFAQ(botToken: string, chatId: number, messageId: number) {
  const text = `❓ *Frequently Asked Questions*\n\n` +
    `*Q: How long is delivery?*\nA: Usually within 1-3 hours after payment verification.\n\n` +
    `*Q: How do I pay?*\nA: We use KHQR (Bakong). Scan the QR code and send us a screenshot.\n\n` +
    `*Q: Is there a warranty?*\nA: Yes! All products come with a warranty for the full duration.\n\n` +
    `*Q: What if my account doesn't work?*\nA: Contact us immediately and we'll replace it for free.\n\n` +
    `*Q: Can I get a refund?*\nA: We offer replacements, not refunds. Contact support for help.`;

  await editMessage(botToken, chatId, messageId, text, {
    inline_keyboard: [
      [{ text: '📞 Contact Support', callback_data: 'contact' }],
      [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
    ]
  });
}

async function showContact(botToken: string, chatId: number, messageId: number) {
  const text = `📞 *Contact Us*\n\n` +
    `📱 Telegram: @tephh\n` +
    `📸 Instagram: @putephh\n` +
    `🌐 Website: tephhshop.lovable.app\n\n` +
    `💬 Feel free to message us anytime! We usually respond within minutes.`;

  await editMessage(botToken, chatId, messageId, text, {
    inline_keyboard: [[{ text: '🏠 Main Menu', callback_data: 'main_menu' }]]
  });
}

// ═══════════════════════════════════════════════
// ─── ADMIN FUNCTIONS ───
// ═══════════════════════════════════════════════

async function handleCheckCommand(supabase: any, botToken: string, chatId: number) {
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select(`id, created_at, guest_name, guest_telegram, guest_email, guest_phone, guest_notes, total_amount, status, order_items (product_name, quantity, unit_price)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    await sendMessage(botToken, chatId, '❌ Failed to fetch orders.');
    return;
  }
  if (!pendingOrders || pendingOrders.length === 0) {
    await sendMessage(botToken, chatId, '✅ No pending orders! All clear.');
    return;
  }

  for (const order of pendingOrders) {
    const items = (order.order_items as any[])?.map((item: any) =>
      `  • ${item.product_name} x${item.quantity} - $${(item.unit_price * item.quantity).toFixed(2)}`
    ).join('\n') || '  No items';

    const telegramHandle = order.guest_telegram?.startsWith('@') ? order.guest_telegram : `@${order.guest_telegram}`;
    const timeAgo = getTimeAgo(new Date(order.created_at));

    const message = `📋 *Pending Order*\n\n🆔 \`${order.id.slice(0, 8)}\`\n👤 ${order.guest_name || 'Guest'}\n📱 ${telegramHandle}${order.guest_email ? `\n📧 ${order.guest_email}` : ''}${order.guest_phone ? `\n📞 ${order.guest_phone}` : ''}\n💵 *$${order.total_amount.toFixed(2)}*\n⏰ ${timeAgo}\n\n🛍️ Items:\n${items}${order.guest_notes ? `\n\n📝 Notes: ${order.guest_notes}` : ''}`;

    await sendMessageWithKeyboard(botToken, chatId, message, {
      inline_keyboard: [
        [{ text: '✅ Confirm Paid', callback_data: `confirm_${order.id}` }, { text: '❌ Reject', callback_data: `reject_${order.id}` }],
        [{ text: '🔍 Check Bank', callback_data: `check_${order.id}` }]
      ]
    });
  }
  await sendMessage(botToken, chatId, `📊 Total pending: *${pendingOrders.length}* order(s)`);
}

async function handleOrderAction(supabase: any, botToken: string, callbackQuery: any, callbackData: string, chatId: number, messageId: number) {
  const underscoreIndex = callbackData.indexOf('_');
  const action = callbackData.substring(0, underscoreIndex);
  const orderId = callbackData.substring(underscoreIndex + 1);

  if (!orderId) { await answerCallback(botToken, callbackQuery.id, '❌ Invalid order'); return; }

  let newStatus = '';
  if (action === 'confirm') newStatus = 'paid';
  else if (action === 'reject') newStatus = 'cancelled';

  if (newStatus) {
    const updateData: any = { status: newStatus };
    if (newStatus === 'paid') updateData.payment_verified_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) {
      await answerCallback(botToken, callbackQuery.id, '❌ Failed to update order');
      return;
    }

    const statusEmoji = newStatus === 'paid' ? '✅' : '❌';
    const statusText = newStatus === 'paid' ? 'CONFIRMED' : 'REJECTED';

    await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [[{ text: `${statusEmoji} ${statusText}`, callback_data: 'processed' }]] }
      })
    });
  }
}

async function handleCheckBank(supabase: any, botToken: string, callbackQuery: any, orderId: string, chatId: number, messageId: number) {
  const { data: order } = await supabase.from('orders').select('payment_md5').eq('id', orderId).single();

  if (order?.payment_md5) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    try {
      const checkRes = await fetch(`${supabaseUrl}/functions/v1/check-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({ orderId, md5Hash: order.payment_md5 }),
      });
      
      const checkData = await checkRes.json();
      
      if (checkData?.verified || checkData?.status === 'paid') {
        await answerCallback(botToken, callbackQuery.id, '✅ Payment verified in Bakong!');
        await supabase.from('orders').update({ status: 'paid', payment_verified_at: new Date().toISOString() }).eq('id', orderId);
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [[{ text: '✅ CONFIRMED (Bank Verified)', callback_data: 'processed' }]] }
          })
        });
      } else {
        await answerCallback(botToken, callbackQuery.id, '⏳ Payment not found in Bakong yet');
      }
    } catch (e) {
      console.error('Check bank error:', e);
      await answerCallback(botToken, callbackQuery.id, '❌ Error checking bank');
    }
  } else {
    await answerCallback(botToken, callbackQuery.id, '❌ No payment hash found');
  }
}

// ═══════════════════════════════════════════════
// ─── HELPERS ───
// ═══════════════════════════════════════════════

function getAppName(app: string): string {
  const names: Record<string, string> = {
    spotify: 'Spotify', youtube: 'YouTube', capcut: 'CapCut',
    alight: 'Alight Motion', discord: 'Discord', netflix: 'Netflix',
    chatgpt: 'ChatGPT Plus', gemini: 'Gemini AI',
  };
  return names[app] || app.charAt(0).toUpperCase() + app.slice(1);
}

function getAppEmoji(app: string): string {
  const emojis: Record<string, string> = {
    spotify: '🎵', youtube: '📺', capcut: '🎬',
    alight: '✨', discord: '💬', netflix: '🎬',
    chatgpt: '🤖', gemini: '✨',
  };
  return emojis[app] || '📱';
}

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
  return `${Math.floor(diffHours / 24)}d ago`;
}

async function answerCallback(botToken: string, callbackId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: text.length > 0 })
  });
}

async function sendMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
}

async function sendMessageWithKeyboard(botToken: string, chatId: number | string, text: string, keyboard: any) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', reply_markup: keyboard })
  });
}

async function editMessage(botToken: string, chatId: number, messageId: number, text: string, keyboard: any) {
  await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  });
}
