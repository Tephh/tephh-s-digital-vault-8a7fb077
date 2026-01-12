import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateOrderItem = {
  product_id: string | null;
  product_name: string;
  product_app: string;
  product_category: string;
  product_duration: string | null;
  quantity: number;
  unit_price: number;
};

type CreateOrderBody = {
  user_id: string | null;
  guest_name: string | null;
  guest_telegram: string;
  guest_email: string | null;
  guest_phone: string | null;
  guest_notes: string | null;
  account_email: string | null;
  account_password: string | null;
  total_amount: number;
  discount_amount: number | null;
  coupon_code: string | null;
  payment_md5: string;
  status?: string;
  items: CreateOrderItem[];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateOrderBody = await req.json();

    if (!body.guest_telegram || !body.guest_telegram.trim()) {
      return new Response(JSON.stringify({ error: "guest_telegram is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "items are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("create-order request", {
      user_id: body.user_id,
      guest_telegram: body.guest_telegram,
      total_amount: body.total_amount,
      items_count: body.items.length,
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: body.user_id,
        guest_name: body.guest_name,
        guest_telegram: body.guest_telegram,
        guest_email: body.guest_email,
        guest_phone: body.guest_phone,
        guest_notes: body.guest_notes,
        account_email: body.account_email,
        account_password: body.account_password,
        total_amount: body.total_amount,
        discount_amount: body.discount_amount,
        coupon_code: body.coupon_code,
        payment_md5: body.payment_md5,
        status: body.status ?? "pending",
      })
      .select("*")
      .single();

    if (orderError || !order) {
      console.error("create-order: failed to create order", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = body.items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_app: i.product_app,
      product_category: i.product_category,
      product_duration: i.product_duration,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("create-order: failed to create order_items", itemsError);
      // best-effort rollback
      await supabase.from("orders").delete().eq("id", order.id);

      return new Response(JSON.stringify({ error: "Failed to create order items" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, order }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("create-order error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
