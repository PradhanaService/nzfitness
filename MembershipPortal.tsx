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
const PORTAL_TIME_SLOTS = {
  morning: ['5:30 AM - 6:30 AM', '6:30 AM - 7:30 AM', '7:30 AM - 8:30 AM'],
  evening: ['5:30 PM - 6:30 PM', '6:30 PM - 7:30 PM', '7:30 PM - 8:30 PM'],
};

const handlePortalWhatsApp = (message: string) => {
  const target = Math.random() > 0.5 ? WHATSAPP_1 : WHATSAPP_2;
  window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, '_blank');
};

const openPortalWhatsAppNumber = (plan?: MembershipPlan | null) => {
  const savedSlot = sessionStorage.getItem('noize_selected_slot');
  const savedSlotType = sessionStorage.getItem('noize_slot_type');

  if (plan && savedSlot && (savedSlotType === 'online' || savedSlotType === 'home')) {
    const message = `Hi NOIZE Team! \uD83D\uDC4B

I'd like to confirm my membership:

\uD83C\uDFCB\uFE0F Training Type: ${savedSlotType === 'online' ? 'Online Training' : 'Home Training'}
\u23F0 Preferred Slot: ${savedSlot}

\uD83D\uDCCB Plan: ${plan.name}
\uD83D\uDCB0 Price: \u20B9${plan.price}
\u23F3 Duration: ${plan.duration}

Please confirm my booking. Thank you!`;

    handlePortalWhatsApp(message);
    return;
  }

  window.open(`https://wa.me/${WHATSAPP_1}`, '_blank');
};

const openPortalWhatsAppForPlan = (plan: MembershipPlan) => {
  const savedSlot = sessionStorage.getItem('noize_selected_slot');
  const message =
    `Hi NOIZE Team! \uD83D\uDC4B\n\n` +
    `Membership Confirmation:\n\n` +
    `\uD83C\uDFCB\uFE0F Plan: ${plan.name}\n` +
    `\uD83D\uDCB0 Price: \u20B9${plan.price.toLocaleString()}\n` +
    `\u23F3 Duration: ${plan.duration}\n` +
    (savedSlot ? `\u23F0 Preferred Slot: ${savedSlot}\n` : '') +
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
  const existingSlot = sessionStorage.getItem('noize_selected_slot') || '';
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [activeCategory, setActiveCategory] = useState<MembershipCategory>(
    (tabFromUrl as MembershipCategory) || 'offline'
  );
  const [portalSlotModal, setPortalSlotModal] = useState<'online' | 'home_workout' | null>(null);
  const [pendingPlan, setPendingPlan] = useState<MembershipPlan | null>(null);
  const [portalSelectedSlot, setPortalSelectedSlot] = useState(existingSlot);
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

  const sendPlanWhatsApp = (plan: MembershipPlan) => {
    if (plan.category === 'offline') {
      openPortalWhatsAppForPlan(plan);
      return;
    }

    const savedSlot = sessionStorage.getItem('noize_selected_slot') || '';
    const slotType = sessionStorage.getItem('noize_slot_type') || '';
    const message =
      `Hi NOIZE Team! \uD83D\uDC4B\n\n` +
      `Membership Enquiry:\n\n` +
      `\uD83C\uDFCB\uFE0F Plan: ${plan.name}\n` +
      `\uD83D\uDCC2 Type: ${slotType === 'online' ? 'Online Training' : 'Home Training'}\n` +
      `\uD83D\uDCB0 Price: \u20B9${plan.price.toLocaleString()}\n` +
      `\u23F3 Duration: ${plan.duration}\n` +
      `\u23F0 Preferred Slot: ${savedSlot}\n\n` +
      `Please confirm my booking. Thank you!`;

    handlePortalWhatsApp(message);
  };

  const handlePlanWhatsAppClick = (plan: MembershipPlan) => {
    if (plan.category === 'offline') {
      sendPlanWhatsApp(plan);
      return;
    }

    const savedSlot = sessionStorage.getItem('noize_selected_slot');
    if (savedSlot) {
      sendPlanWhatsApp(plan);
      return;
    }

    setPendingPlan(plan);
    setPortalSlotModal(plan.category);
  };

  const handlePortalSlotConfirm = () => {
    if (!portalSlotModal || !portalSelectedSlot || !pendingPlan) {
      return;
    }

    sessionStorage.setItem('noize_selected_slot', portalSelectedSlot);
    sessionStorage.setItem('noize_slot_type', portalSlotModal === 'online' ? 'online' : 'home');
    setPortalSlotModal(null);
    sendPlanWhatsApp(pendingPlan);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-10 md:px-8 md:py-16">
      <style>{`
        @keyframes offersShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-0.5px) rotate(-0.8deg); }
          40% { transform: translateX(0.6px) rotate(0.8deg); }
          60% { transform: translateX(-0.4px) rotate(-0.6deg); }
          80% { transform: translateX(0.5px) rotate(0.6deg); }
        }
      `}</style>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition-all hover:border-gold/40 hover:text-gold"
          >
            Back To Home
          </button>
          {isOfflineUser && (
            <button
              onClick={() => navigate('/?exclusiveOffers=1')}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-gold transition-all duration-300 hover:border-gold/50"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
              <span>EXCLUSIVE</span>
              <span className="inline-block text-gold" style={{ animation: 'offersShake 1.15s ease-in-out infinite' }}>
                OFFERS
              </span>
            </button>
          )}
        </div>
        <div className="mb-8 text-center md:mb-10">
          <p className="mb-3 inline-flex rounded-full border border-gold/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-gold">
            Live from Admin Portal
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white md:text-5xl">
            Membership <span className="text-gold">Plans</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400">
            Choose your training style, compare plans clearly, and complete your membership in one place.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:mb-10 md:grid-cols-2 md:gap-6">
          <div className="rounded-[20px] border border-white/10 bg-[#121212]/60 p-5 md:p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-gold">Exclusive Offers Portal</p>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">Executive Offer Access</h3>
            <p className="mt-3 text-sm text-neutral-400">
              Open the verified offer portal from here and continue through the existing login flow before unlocking offers.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={openExclusiveOffersLogin}
                className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:border-gold/40 hover:text-gold"
              >
                {isOfflineUser ? 'Re-Login Portal' : 'Login To Offers'}
              </button>
              {isOfflineUser && (
                <button
                  onClick={() => navigate('/offline-offers')}
                  className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:border-gold/40 hover:text-gold"
                >
                  Open Offer Portal
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-[#121212]/60 p-5 md:p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-gold">4 / 4 Chance Portal</p>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">Mystery Chances</h3>
            <p className="mt-3 text-sm text-neutral-400">
              Members can use the protected mystery portal here too. If they are not verified yet, we send them through the same OTP login first.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={openMysteryOffersPortal}
                className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:border-gold/40 hover:text-gold"
              >
                {isOfflineUser ? 'Open 4/4 Chances' : 'Login For 4/4 Chances'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gold animate-pulse text-center py-20 font-bold">Synchronizing with NOIZE database...</div>
        ) : plans.length === 0 ? (
          <div className="rounded-[20px] border border-white/10 p-5 text-center md:p-12">
            <p className="text-xl font-black uppercase tracking-tight text-neutral-300 md:text-2xl">No plans available till now.</p>
            <p className="text-sm text-neutral-500 mt-3">Add a membership plan in the Admin Portal and mark it active. It will show here automatically.</p>
          </div>
        ) : (
          <div className="animate-fade-in-up flex flex-col gap-6 md:gap-8">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {MEMBERSHIP_TYPE_SECTIONS.map((section) => (
                <button
                  key={section.category}
                  onClick={() => setActiveCategory(section.category)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300 ease-out sm:text-xs ${
                    activeCategory === section.category
                      ? 'gold-gradient text-black'
                      : 'border border-white/20 bg-transparent text-white hover:border-gold/40 hover:text-gold'
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
                <div className="space-y-6 md:space-y-8">
                  <div className="border-b border-white/10 pb-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div className="border-l border-gold pl-4">
                        <div className="mb-2 inline-flex items-center gap-2 text-gold">
                          <TabIcon icon={activeSection.icon} />
                          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em]">{activeSection.tabLabel} Portal</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white md:text-4xl">{activeSection.title}</h3>
                        <p className="mt-3 max-w-2xl text-sm text-neutral-400">{activeSection.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => smoothScrollToId('portal-plan-list')}
                          className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-all hover:border-gold/40 hover:text-gold sm:text-xs"
                        >
                          View Plans
                        </button>
                        <button
                          onClick={openPortalWhatsAppNumber}
                          className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-all hover:border-gold/40 hover:text-gold sm:text-xs"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  {visiblePlans.length === 0 ? (
                    <div className="rounded-[20px] border border-white/10 p-5 text-center text-sm text-neutral-400 md:p-8">
                      No active plans available for this tab right now.
                    </div>
                  ) : (
                    <div id="portal-plan-list" className="flex flex-col gap-4 md:gap-6">
                      {visiblePlans.map((plan) => (
                        <div key={plan.id} className="grid gap-4 border-b border-white/5 pb-4 last:border-b-0 md:gap-6 md:pb-6 lg:grid-cols-[1.1fr_0.9fr]">
                          <div className="flex h-full flex-col rounded-[20px] border border-white/10 bg-[#121212]/50 p-5 transition-all duration-300 hover:border-gold/30 md:p-8">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h4 className="text-xl font-black uppercase leading-tight tracking-tight text-white md:text-3xl">{plan.name}</h4>
                              </div>
                              {plan.is_popular && (
                                <span className="w-fit rounded-full border border-gold/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-gold">
                                  Most Popular
                                </span>
                              )}
                            </div>

                            <div className="mb-5">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Price</p>
                              <p className="mt-1 text-3xl font-black leading-none text-gold md:text-4xl">{'\u20B9'} {plan.price.toLocaleString()}</p>
                              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">{plan.duration}</p>
                            </div>

                            <p className="mb-6 text-sm font-bold uppercase tracking-[0.12em] text-neutral-300">
                              {plan.tagline}
                            </p>

                            <button
                              onClick={() => openPaymentModal(plan)}
                              className="mt-auto w-full rounded-full gold-gradient px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition-all hover:scale-[1.01]"
                            >
                              Complete Payment
                            </button>
                          </div>

                          <div className="flex h-full flex-col rounded-[20px] border border-white/10 bg-[#121212]/40 p-5 transition-all duration-300 hover:border-gold/30 md:p-8">
                            <h5 className="mb-5 border-l border-gold pl-3 text-xl font-black uppercase tracking-tight text-white md:text-xl">Plan Details</h5>
                            {!Array.isArray(plan.features) || plan.features.length === 0 ? (
                              <div className="flex-grow rounded-2xl border border-white/10 p-4 text-sm text-neutral-400">
                                No features described for this plan yet.
                              </div>
                            ) : (
                              <ul className="space-y-3 flex-grow">
                                {plan.features.map((feature, index) => (
                                  <li key={`${plan.id}-${index}`} className="flex items-start gap-3 text-sm text-neutral-300">
                                    <span className="mt-0.5 text-gold">âœ¦</span>
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

      {portalSlotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 px-4 backdrop-blur-md" onClick={() => { setPortalSlotModal(null); setPendingPlan(null); setPortalSelectedSlot(''); }}>
          <div className="w-full max-w-md rounded-[20px] border border-white/10 bg-[#121212] p-5 md:p-8" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 border-l border-gold pl-3 text-[10px] font-black uppercase tracking-[0.18em] text-gold">
              {portalSlotModal === 'online' ? 'Online Training' : 'Home Training'}
            </p>
            <h2 className="mb-1 text-xl font-black text-white md:text-2xl">
              Choose Your Batch
            </h2>
            <p className="mb-6 text-sm text-neutral-400">
              Select a preferred time slot to continue
            </p>

            <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-3">Morning Batch</p>
            <div className="flex flex-col gap-3 mb-6">
              {PORTAL_TIME_SLOTS.morning.map(slot => (
                <button
                  key={slot}
                  onClick={() => setPortalSelectedSlot(slot)}
                  className={`w-full rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${portalSelectedSlot === slot
                    ? 'gold-gradient text-black'
                    : 'border border-white/20 text-white hover:border-gold/40 hover:text-gold'
                    }`}
                >{slot}</button>
              ))}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-3">Evening Batch</p>
            <div className="flex flex-col gap-3 mb-8">
              {PORTAL_TIME_SLOTS.evening.map(slot => (
                <button
                  key={slot}
                  onClick={() => setPortalSelectedSlot(slot)}
                  className={`w-full rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${portalSelectedSlot === slot
                    ? 'gold-gradient text-black'
                    : 'border border-white/20 text-white hover:border-gold/40 hover:text-gold'
                    }`}
                >{slot}</button>
              ))}
            </div>

            <button
              disabled={!portalSelectedSlot}
              onClick={handlePortalSlotConfirm}
              className="w-full rounded-full gold-gradient py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm Slot & View Plans â†’
            </button>

            <button
              onClick={() => { setPortalSlotModal(null); setPendingPlan(null); setPortalSelectedSlot(''); }}
              className="mt-4 w-full rounded-full border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:border-gold/40 hover:text-gold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" onClick={closePaymentModal}>
          <div className="relative max-h-[90vh] w-full max-w-[320px] overflow-y-auto rounded-[20px] border border-white/10 bg-[#121212] p-4 sm:max-w-[360px] md:max-w-[390px] md:p-5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePaymentModal}
              className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full border border-white/15 text-xs text-white transition-all hover:border-gold/40 hover:text-gold"
            >
              X
            </button>
            <p className="mb-1.5 border-l border-gold pl-3 text-[9px] font-black uppercase tracking-[0.18em] text-gold sm:text-[10px]">Scan And Pay</p>
            <h3 className="mb-1.5 pr-8 text-xl font-black uppercase tracking-tight text-white md:text-2xl">{selectedPlan.name}</h3>
            <p className="mb-3 text-sm leading-relaxed text-neutral-400">
              Scan this QR code to pay for <span className="text-white font-bold">{selectedPlan.name}</span>. Amount: <span className="font-bold text-gold">{'\u20B9'} {selectedPlan.price.toLocaleString()}</span>
            </p>
            <div className="mb-3 overflow-hidden rounded-[16px] border border-white/10 bg-white p-2">
              <img src={PAYMENT_QR_IMAGE} alt="NOIZE payment QR code" className="w-full h-auto max-h-[42vh] object-contain rounded-[14px]" />
            </div>
            <div className="mb-3 w-full rounded-2xl border border-white/10 p-3 sm:p-4">
              <p className="text-center text-xs font-bold leading-relaxed text-neutral-300 sm:text-sm">
                NOTE: After payment, send the payment screenshot to WhatsApp number {PAYMENT_WHATSAPP_NUMBER}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => handlePlanWhatsAppClick(selectedPlan)}
                className="flex-1 rounded-full gold-gradient px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-black transition-all hover:scale-[1.01]"
              >
                Open WhatsApp
              </button>
              <button
                onClick={closePaymentModal}
                className="flex-1 rounded-full border border-white/20 px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-all hover:border-gold/40 hover:text-gold"
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
