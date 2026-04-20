import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1"

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const payloadText = await req.text();
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error("Webhook secret not configured.");
    }

    // Verify signature using standard Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadText));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (expectedSignature !== signature) {
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(payloadText);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      // 1. Initialize Supabase (Using Service Role key to bypass RLS for secure background update)
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // 2. Update database
      const { error } = await supabaseClient
        .from('transactions')
        .update({ 
          status: 'successful',
          razorpay_payment_id: paymentId,
          verified: true
        })
        .eq('razorpay_order_id', orderId);

      if (error) {
        console.error("Failed to update db", error);
        throw error;
      }
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})
