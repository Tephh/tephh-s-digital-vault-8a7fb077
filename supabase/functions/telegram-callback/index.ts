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

    // Handle callback query (button press)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const messageId = update.callback_query.message?.message_id;
      const chatId = update.callback_query.message?.chat?.id;

      // Get bot token from settings
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

      // Parse callback data
      const [action, orderId] = callbackData.split('_');
      
      if (!orderId) {
        await answerCallback(botToken, update.callback_query.id, '❌ Invalid order');
        return new Response(JSON.stringify({ success: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let responseText = '';
      let newStatus = '';

      switch (action) {
        case 'confirm':
          newStatus = 'paid';
          responseText = '✅ Order confirmed as paid!';
          break;
        case 'reject':
          newStatus = 'cancelled';
          responseText = '❌ Order rejected!';
          break;
        case 'check':
          // Check payment via Bakong API
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
              responseText = '✅ Payment verified in Bakong!';
              newStatus = 'paid';
            } else {
              await answerCallback(botToken, update.callback_query.id, '⏳ Payment not found in Bakong yet');
              return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          } else {
            await answerCallback(botToken, update.callback_query.id, '❌ No payment hash found');
            return new Response(JSON.stringify({ success: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          break;
        default:
          await answerCallback(botToken, update.callback_query.id, '❓ Unknown action');
          return new Response(JSON.stringify({ success: false }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      // Update order status
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
          await answerCallback(botToken, update.callback_query.id, '❌ Failed to update order');
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Answer callback
        await answerCallback(botToken, update.callback_query.id, responseText);

        // Update the message to show it's been processed
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

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Telegram callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function answerCallback(botToken: string, callbackId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text: text,
      show_alert: true
    })
  });
}
