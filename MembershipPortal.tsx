import React, { useState, useEffect } from 'react';
import { supabase, MembershipPlan } from './supabaseClient';

// Parallel WhatsApp Logic using your numbers
const WHATSAPP_1 = "918122390693";
const WHATSAPP_2 = "918296890693";

const handlePortalWhatsApp = (message: string) => {
  const target = Math.random() > 0.5 ? WHATSAPP_1 : WHATSAPP_2;
  window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, '_blank');
};

const MembershipPortal: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{status: 'idle'|'success'|'error', message: string, planId?: string}>({status: 'idle', message: ''});

  useEffect(() => {
    const fetchLivePlans = async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setPlans(data);
      }
      setLoading(false);
    };

    fetchLivePlans();

    const subscription = supabase
      .channel('plan-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membership_plans' }, fetchLivePlans)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const handlePayment = async (plan: MembershipPlan) => {
    setProcessingPlanId(plan.id);
    setPaymentStatus({status: 'idle', message: '', planId: plan.id});
    
    // Ensure Razorpay script is completely loaded into the browser dynamically
    const loadScript = () => new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    const isLoaded = await loadScript();
    
    if (!isLoaded || !(window as any).Razorpay) {
       setProcessingPlanId(null);
       handlePortalWhatsApp(`Hi! I want to join the ${plan.name} membership plan. Price: Rs. ${plan.price}. Duration: ${plan.duration}.`);
       return;
    }

    try {
      const res = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          planId: plan.id, 
          price: plan.price,
          userName: 'Member', // Collect via prompt or input in real scenario
          userPhone: '' 
        }
      });

      if (res.error) throw res.error;
      
      const order = res.data;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Expose public key in Vite
        amount: order.amount,
        currency: order.currency,
        name: 'NOIZE Gym',
        description: `Join ${plan.name}`,
        order_id: order.id,
        handler: function (response: any) {
          setPaymentStatus({status: 'success', message: 'Payment successful! Welcome to NOIZE!', planId: plan.id});
          handlePortalWhatsApp(`Hi! I just completed my payment for the ${plan.name} plan via Razorpay! My Payment ID is: ${response.razorpay_payment_id}`);
        },
        theme: { color: "#E5C07B" }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        setPaymentStatus({status: 'error', message: `Payment failed: ${response.error.description}`, planId: plan.id});
      });
      rzp1.open();
    } catch (err: any) {
      console.error(err);
      setPaymentStatus({status: 'error', message: err?.message || 'Failed to initialize payment. Try via WhatsApp.', planId: plan.id});
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-3">Live from Admin Portal</p>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Membership <span className="text-gold">Plans</span>
          </h2>
          <p className="text-neutral-400 text-sm md:text-base mt-3 max-w-2xl mx-auto md:mx-0">
            Every active plan added in the Admin Portal appears here automatically with its price, duration, tagline, and features.
          </p>
        </div>

        {loading ? (
          <div className="text-gold animate-pulse text-center py-20 font-bold">Synchronizing with NOIZE database...</div>
        ) : plans.length === 0 ? (
          <div className="glass p-8 md:p-20 rounded-[32px] border border-white/10 text-center">
            <p className="text-neutral-300 font-black uppercase tracking-widest text-lg md:text-2xl">No plans available till now.</p>
            <p className="text-sm text-neutral-500 mt-3">Add a membership plan in the Admin Portal and mark it active. It will show here automatically.</p>
          </div>
        ) : (
          <div className="animate-fade-in-up flex flex-col gap-10">
            {plans.map((plan) => (
              <div key={plan.id} className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 items-start border-b border-white/5 pb-10 last:border-b-0">
                <div className="glass p-7 md:p-10 rounded-[28px] border border-gold/30">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight">{plan.name}</h3>
                    </div>
                    {plan.is_popular && (
                      <span className="gold-gradient text-black text-[10px] font-black px-3 py-2 rounded-md uppercase w-fit">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Price</p>
                      <p className="text-white text-2xl font-black">Rs. {plan.price.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-white text-lg font-black">{plan.duration}</p>
                    </div>
                  </div>

                  <p className="text-gold text-sm md:text-base font-bold uppercase tracking-wider mb-8">
                    {plan.tagline}
                  </p>

                  {paymentStatus.planId === plan.id && paymentStatus.status === 'success' && (
                    <div className="mb-4 p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-bold">
                      {paymentStatus.message}
                    </div>
                  )}
                  {paymentStatus.planId === plan.id && paymentStatus.status === 'error' && (
                    <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold flex flex-col gap-2">
                       <span>{paymentStatus.message}</span>
                       <button onClick={() => handlePortalWhatsApp(`Hi! My payment failed but I want to join the ${plan.name} plan.`)} className="text-white underline text-xs">Contact via WhatsApp Instead</button>
                    </div>
                  )}

                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={processingPlanId === plan.id}
                    className="w-full sm:w-auto py-4 px-10 rounded-full font-black text-sm gold-gradient text-black hover:scale-[1.02] transition-all uppercase shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPlanId === plan.id ? 'Processing...' : 'Secure Checkout via Razorpay'}
                  </button>
                </div>

                <div className="glass p-7 md:p-8 rounded-[28px] border border-white/10 h-full flex flex-col">
                  <h4 className="text-lg md:text-xl font-black text-white uppercase mb-6">Plan Details</h4>
                  {plan.features.length === 0 ? (
                    <div className="text-neutral-500 text-sm border border-white/10 rounded-2xl p-5 flex-grow">
                      No features described for this plan yet.
                    </div>
                  ) : (
                    <ul className="space-y-3 flex-grow">
                      {plan.features.map((feature, index) => (
                        <li key={`${plan.id}-${index}`} className="flex items-start gap-3 text-neutral-300 text-sm md:text-base">
                          <span className="text-gold mt-0.5">&#10003;</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPortal;
