import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planId, price, userName, userPhone } = await req.json()

    // 1. Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 2. Validate Razorpay Keys
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay keys not configured.");
    }

    // 3. Create Order in Razorpay
    const authHeaders = `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`;
    
    // Amount must be in paise (smallest currency unit: price * 100)
    const amountInPaise = price * 100;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeaders
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      })
    });

    const orderData = await orderRes.json();

    if (!orderData.id) {
       throw new Error(`Failed to create Razorpay order: ${JSON.stringify(orderData)}`);
    }

    // 4. Save to our database as 'created'
    const { error: dbError } = await supabaseClient
      .from('transactions')
      .insert([
        {
          user_name: userName,
          user_phone: userPhone,
          plan_id: planId,
          amount: price,
          razorpay_order_id: orderData.id,
          status: 'created'
        }
      ]);

    if (dbError) throw dbError;

    // 5. Send orderData back to Frontend
    return new Response(JSON.stringify(orderData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
