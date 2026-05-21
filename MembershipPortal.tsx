import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, MembershipPlan, MembershipCategory } from './supabaseClient';

const smoothScrollToId = (id: string, offset = 96, duration = 700) => {
  const element = document.getElementById(id);
  if (!element) return;

  const startY = window.scrollY;
  const targetY = Math.max(0, element.getBoundingClientRect().top + window.scrollY - offset);
  const distance = targetY - startY;
  const startTime = performance.now();
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

const MEMBERSHIP_TYPE_SECTIONS: {
  category: MembershipCategory;
  title: string;
  description: string;
  tabLabel: string;
  icon: string;
}[] = [
  {
    category: 'offline',
    title: 'Offline Membership Plans',
    description: 'Gym floor access, in-person coaching, and on-site transformation support.',
    tabLabel: 'Offline',
    icon: 'DUMBBELL',
  },
  {
    category: 'online',
    title: 'Online Membership Plans',
    description: 'Live remote coaching and structured online guidance from anywhere.',
    tabLabel: 'Online',
    icon: 'LIVE',
  },
  {
    category: 'home_workout',
    title: 'Home Workout Plans',
    description: 'Flexible plans designed for training at home with your available setup.',
    tabLabel: 'Home Workout',
    icon: 'HOME',
  },
];

const getPreferredActiveTab = (plans: MembershipPlan[], currentTab: MembershipCategory): MembershipCategory => {
  const categoriesWithPlans = new Set(
    plans.map((plan) => normalizeMembershipCategory(plan.category)),
  );

  if (categoriesWithPlans.has(currentTab)) {
    return currentTab;
  }

  for (const section of MEMBERSHIP_TYPE_SECTIONS) {
    if (categoriesWithPlans.has(section.category)) {
      return section.category;
    }
  }

  return currentTab;
};

const normalizeMembershipCategory = (category?: string | null): MembershipCategory => {
  if (category === 'online' || category === 'home_workout') {
    return category;
  }
  return 'offline';
};

// Parallel WhatsApp Logic using your numbers
const WHATSAPP_1 = "918122390693";
const WHATSAPP_2 = "918296890693";
const PAYMENT_QR_IMAGE = "/images/payment-qr.jpg";
const PAYMENT_WHATSAPP_NUMBER = "+91 81223 90693";

const handlePortalWhatsApp = (message: string) => {
  const target = Math.random() > 0.5 ? WHATSAPP_1 : WHATSAPP_2;
  window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, '_blank');
};

const openPortalWhatsAppNumber = (plan?: MembershipPlan | null) => {
  const savedSlot = sessionStorage.getItem('noize_selected_slot');
  const savedSlotType = sessionStorage.getItem('noize_slot_type');

  if (plan && savedSlot && (savedSlotType === 'online' || savedSlotType === 'home')) {
    const message = `Hi NOIZE Team! 👋

I'd like to confirm my membership:

🏋️ Training Type: ${savedSlotType === 'online' ? 'Online Training' : 'Home Training'}
⏰ Preferred Slot: ${savedSlot}

📋 Plan: ${plan.name}
💰 Price: ₹${plan.price}
⏳ Duration: ${plan.duration}

Please confirm my booking. Thank you!`;

    handlePortalWhatsApp(message);
    return;
  }

  window.open(`https://wa.me/${WHATSAPP_1}`, '_blank');
};

const openPortalWhatsAppForPlan = (plan: MembershipPlan) => {
  const savedSlot = sessionStorage.getItem('noize_selected_slot');
  const message =
    `Hi NOIZE Team! 👋\n\n` +
    `Membership Confirmation:\n\n` +
    `🏋️ Plan: ${plan.name}\n` +
    `💰 Price: ₹${plan.price.toLocaleString()}\n` +
    `⏳ Duration: ${plan.duration}\n` +
    (savedSlot ? `⏰ Preferred Slot: ${savedSlot}\n` : '') +
    `\nPlease confirm my booking. Thank you!`;

  handlePortalWhatsApp(message);
};

const OFFLINE_PORTAL_ACCESS_KEY = 'noize_offline_portal_access';

const TabIcon: React.FC<{ icon: string }> = ({ icon }) => {
  if (icon === 'DUMBBELL') {
    return (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10v4M7 8v8M17 8v8M20 10v4M7 12h10" />
      </svg>
    );
  }

  if (icon === 'LIVE') {
    return (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 19h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11.5 12 4l9 7.5M5 10v9h14v-9M9 19v-5h6v5" />
    </svg>
  );
};

const MembershipPortal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [activeCategory, setActiveCategory] = useState<MembershipCategory>(
    (tabFromUrl as MembershipCategory) || 'offline'
  );
  const isOfflineUser = !!sessionStorage.getItem(OFFLINE_PORTAL_ACCESS_KEY);

  const openExclusiveOffersLogin = () => {
    window.location.href = '/?exclusiveOffers=1';
  };

  const openMysteryOffersPortal = () => {
    if (sessionStorage.getItem(OFFLINE_PORTAL_ACCESS_KEY)) {
      navigate('/offline-offers');
      return;
    }

    openExclusiveOffersLogin();
  };

  useEffect(() => {
    const fetchLivePlans = async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setPlans(data);
        setActiveCategory((currentTab) => getPreferredActiveTab(data, currentTab));
      }
      setLoading(false);
    };

    void fetchLivePlans();

    const subscription = supabase
      .channel('plan-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membership_plans' }, fetchLivePlans)
      .subscribe();

    const handleWindowFocus = () => {
      void fetchLivePlans();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchLivePlans();
      }
    };

    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchLivePlans();
      }
    }, 10000);

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (tabFromUrl === 'offline' || tabFromUrl === 'online' || tabFromUrl === 'home_workout') {
      setActiveCategory(tabFromUrl);
    }
  }, [tabFromUrl]);

  const openPaymentModal = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
  };

  const closePaymentModal = () => {
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] pb-16 px-4 md:px-8">
      <style>{`
        @keyframes offersShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-0.5px) rotate(-0.8deg); }
          40% { transform: translateX(0.6px) rotate(0.8deg); }
          60% { transform: translateX(-0.4px) rotate(-0.6deg); }
          80% { transform: translateX(0.5px) rotate(0.6deg); }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-white/10 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:border-gold/40 hover:text-gold"
          >
            Back To Home
          </button>
          {isOfflineUser && (
            <button
              onClick={() => navigate('/?exclusiveOffers=1')}
              className="flex items-center gap-3 rounded-full border border-white/40 bg-black px-6 py-3 text-xs font-black uppercase tracking-[0.22em] text-[#b79a61] transition-all duration-300 hover:border-gold hover:text-gold shadow-[0_0_15px_rgba(229,192,123,0.22),inset_0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-[0_0_30px_rgba(229,192,123,0.45)] animate-pulse"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse"></span>
              <span>EXCLUSIVE</span>
              <span className="inline-block text-gold" style={{ animation: 'offersShake 1.15s ease-in-out infinite' }}>
                OFFERS
              </span>
            </button>
          )}
        </div>
        <div className="mb-12 text-center md:text-left">
          <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-3">Live from Admin Portal</p>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Membership <span className="text-gold">Plans</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-neutral-400 md:mx-0">
            Choose your training style, compare plans clearly, and complete your membership in one place.
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-gold/20 bg-gradient-to-br from-[#17140f] to-[#0f0f0f] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-gold">Exclusive Offers Portal</p>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Executive Offer Access</h3>
            <p className="mt-3 text-sm text-neutral-400">
              Open the verified offer portal from here and continue through the existing login flow before unlocking offers.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={openExclusiveOffersLogin}
                className="rounded-full border border-gold/30 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-gold transition-all hover:bg-gold hover:text-black"
              >
                {isOfflineUser ? 'Re-Login Portal' : 'Login To Offers'}
              </button>
              {isOfflineUser && (
                <button
                  onClick={() => navigate('/offline-offers')}
                  className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:border-gold/40 hover:text-gold"
                >
                  Open Offer Portal
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-gold">4 / 4 Chance Portal</p>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Mystery Chances</h3>
            <p className="mt-3 text-sm text-neutral-400">
              Members can use the protected mystery portal here too. If they are not verified yet, we send them through the same OTP login first.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={openMysteryOffersPortal}
                className="gold-gradient rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition-all hover:shadow-[0_0_30px_rgba(229,192,123,0.4)]"
              >
                {isOfflineUser ? 'Open 4/4 Chances' : 'Login For 4/4 Chances'}
              </button>
            </div>
          </div>
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
            <div className="flex flex-wrap gap-3">
              {MEMBERSHIP_TYPE_SECTIONS.map((section) => (
                <button
                  key={section.category}
                  onClick={() => setActiveCategory(section.category)}
                  className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] transition-all duration-300 ease-out sm:text-sm ${
                    activeCategory === section.category
                      ? 'gold-gradient text-black font-black rounded-full px-6 py-3'
                      : 'border border-white/15 text-white bg-transparent rounded-full px-6 py-3'
                  }`}
                >
                  <TabIcon icon={section.icon} />
                  <span>{section.tabLabel}</span>
                </button>
              ))}
            </div>

            {(() => {
              const activeSection = MEMBERSHIP_TYPE_SECTIONS.find((section) => section.category === activeCategory) || MEMBERSHIP_TYPE_SECTIONS[0];
              const visiblePlans = plans.filter(
                (plan) => plan.category === activeCategory
              );

              return (
                <div className="space-y-8">
                  <div className="border-b border-white/10 pb-4 space-y-4">
                    <div>
                      <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-2">Membership Type</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 text-gold mb-2">
                          <TabIcon icon={activeSection.icon} />
                          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em]">{activeSection.tabLabel} Portal</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white md:text-4xl">{activeSection.title}</h3>
                        <p className="mt-3 max-w-2xl text-sm text-neutral-400">{activeSection.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => smoothScrollToId('portal-plan-list')}
                          className="px-4 py-2 rounded-full border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] hover:border-gold/40 hover:text-gold transition-all"
                        >
                          View Plans
                        </button>
                        <button
                          onClick={openPortalWhatsAppNumber}
                          className="px-4 py-2 rounded-full border border-gold/30 text-gold text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] hover:bg-gold hover:text-black transition-all"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  {visiblePlans.length === 0 ? (
                    <div className="glass rounded-[28px] border border-white/10 p-8 text-center text-neutral-400">
                      No active plans available for this tab right now.
                    </div>
                  ) : (
                    <div id="portal-plan-list" className="flex flex-col gap-10">
                      {visiblePlans.map((plan) => (
                        <div key={plan.id} className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 items-start border-b border-white/5 pb-10 last:border-b-0">
                          <div className="glass rounded-[28px] border border-gold/30 border-t-2 border-t-gold p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold/20 md:p-10">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                              <div>
                                <h4 className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">{plan.name}</h4>
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
                                <p className="text-2xl font-black text-white"><span className="text-gold">₹</span> {plan.price.toLocaleString()}</p>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">Duration</p>
                                <p className="text-white text-lg font-black">{plan.duration}</p>
                              </div>
                            </div>

                            <p className="text-gold text-sm md:text-base font-bold uppercase tracking-wider mb-8">
                              {plan.tagline}
                            </p>

                            <button
                              onClick={() => openPaymentModal(plan)}
                              className="w-full sm:w-auto py-4 px-10 rounded-full font-black text-sm gold-gradient text-black hover:scale-[1.02] transition-all uppercase shadow-lg shadow-gold/20"
                            >
                              Complete Payment
                            </button>
                          </div>

                          <div className="glass flex h-full flex-col rounded-[28px] border border-white/10 border-t-2 border-t-gold p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold/20 md:p-8">
                            <h5 className="mb-6 text-lg font-black uppercase tracking-tight text-white md:text-xl">Plan Details</h5>
                            {!Array.isArray(plan.features) || plan.features.length === 0 ? (
                              <div className="flex-grow rounded-2xl border border-white/10 p-5 text-sm text-neutral-400">
                                No features described for this plan yet.
                              </div>
                            ) : (
                              <ul className="space-y-3 flex-grow">
                                {plan.features.map((feature, index) => (
                                  <li key={`${plan.id}-${index}`} className="flex items-start gap-3 text-sm text-neutral-300 md:text-base">
                                    <span className="mt-0.5 text-gold">✦</span>
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
              );
            })()}
          </div>
        )}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={closePaymentModal}>
          <div className="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[390px] max-h-[90vh] overflow-y-auto glass rounded-[24px] border border-gold/30 p-3 sm:p-4 md:p-5 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePaymentModal}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/5 text-white hover:bg-red-500/20 hover:text-red-400 transition-all text-xs"
            >
              X
            </button>
            <p className="text-gold text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Scan And Pay</p>
            <h3 className="mb-1.5 pr-8 text-lg font-black uppercase tracking-tight text-white sm:text-xl md:text-2xl">{selectedPlan.name}</h3>
            <p className="mb-3 text-sm leading-relaxed text-neutral-400">
              Scan this QR code to pay for <span className="text-white font-bold">{selectedPlan.name}</span>. Amount: <span className="font-bold text-gold">₹ {selectedPlan.price.toLocaleString()}</span>
            </p>
            <div className="rounded-[20px] overflow-hidden border border-white/10 bg-white p-2 mb-3">
              <img src={PAYMENT_QR_IMAGE} alt="NOIZE payment QR code" className="w-full h-auto max-h-[42vh] object-contain rounded-[14px]" />
            </div>
            <div className="w-full rounded-2xl border border-gold/30 bg-gold/15 p-3 sm:p-4 mb-3">
              <p className="text-white text-xs sm:text-sm md:text-base font-black leading-relaxed text-center">
                NOTE: After payment, send the payment screenshot to WhatsApp number {PAYMENT_WHATSAPP_NUMBER}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => openPortalWhatsAppForPlan(selectedPlan)}
                className="flex-1 py-2.5 px-3 rounded-full gold-gradient text-black font-black text-[9px] sm:text-[10px] uppercase tracking-[0.08em] hover:scale-[1.02] transition-all"
              >
                Open WhatsApp
              </button>
              <button
                onClick={closePaymentModal}
                className="flex-1 py-2.5 px-3 rounded-full border border-white/10 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.08em] hover:bg-white/5 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPortal;
