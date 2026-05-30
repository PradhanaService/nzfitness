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
\u23F3 Duration: ${plan.duration}`;

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
    (savedSlot ? `\u23F0 Preferred Slot: ${savedSlot}\n` : '');

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
  const [viewPlan, setViewPlan] = useState<MembershipPlan | null>(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MembershipCategory>(
    (tabFromUrl as MembershipCategory) || 'offline'
  );
  const [portalSlotModal, setPortalSlotModal] = useState<'online' | 'home_workout' | null>(null);
  const [pendingPlan, setPendingPlan] = useState<MembershipPlan | null>(null);
  const [portalSelectedSlot, setPortalSelectedSlot] = useState(existingSlot);
  const isOfflineUser = !!sessionStorage.getItem(OFFLINE_PORTAL_ACCESS_KEY);
  const [showMysteryPopup, setShowMysteryPopup] = useState(false);

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
    if (activeCategory !== 'offline') {
      return;
    }

    if (
      sessionStorage.getItem('mysteryPopupShown') === 'true' ||
      sessionStorage.getItem('mysteryClaimed') === 'true' ||
      localStorage.getItem('mysteryClaimed') === 'true'
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc('increment_and_check_mystery_popup');
        if (error) {
          console.error('Error checking mystery eligibility:', error);
          return;
        }

        if (data && (data as any).showPopup === true) {
          sessionStorage.setItem('mysteryPopupShown', 'true');
          setShowMysteryPopup(true);
        }
      } catch (err) {
        console.error('Unexpected error checking mystery eligibility:', err);
      }
    }, 4000); // 4 seconds of surfing offline category

    return () => {
      clearTimeout(timer);
    };
  }, [activeCategory]);

  const handleRevealMysteryOffer = () => {
    sessionStorage.setItem('mysteryClaimed', 'true');
    localStorage.setItem('mysteryClaimed', 'true');
    setShowMysteryPopup(false);
    openMysteryOffersPortal();
  };

  const handleDismissMysteryPopup = () => {
    sessionStorage.setItem('mysteryClaimed', 'true');
    localStorage.setItem('mysteryClaimed', 'true');
    setShowMysteryPopup(false);
  };


  useEffect(() => {
    if (tabFromUrl === 'offline' || tabFromUrl === 'online' || tabFromUrl === 'home_workout') {
      setActiveCategory(tabFromUrl);
    }
  }, [tabFromUrl]);

  const openPaymentModal = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setShowPaymentQR(false);
  };

  const closePaymentModal = () => {
    setSelectedPlan(null);
    setShowPaymentQR(false);
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
      `\u23F0 Preferred Slot: ${savedSlot}`;

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
            className="group inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-black hover:shadow-[0_0_15px_rgba(201,168,76,0.4)]"
            aria-label="Back to home"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1 text-sm font-black">←</span>
            <span>Back to Home</span>
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
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white md:text-5xl">
            Membership <span className="text-gold">Portal</span>
          </h2>
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

                    </div>
                  </div>

                  {visiblePlans.length === 0 ? (
                    <div className="rounded-[20px] border border-white/10 p-5 text-center text-sm text-neutral-400 md:p-8">
                      No active plans available for this tab right now.
                    </div>
                  ) : (
                    <div id="portal-plan-list" className="flex flex-col gap-4 md:gap-6">
                      {visiblePlans.map((plan) => (
                        <div key={plan.id} className="portal-plan-grid grid gap-4 border-b border-white/5 pb-4 last:border-b-0 md:gap-6 md:pb-6 lg:grid-cols-[1.1fr_0.9fr]">
                          <div className="portal-plan-card relative flex h-full flex-col rounded-[20px] border border-white/10 bg-[#121212]/50 p-5 transition-all duration-300 hover:border-gold/30 md:p-8">
                            {plan.is_popular && (
                              <span className="absolute top-[-10px] md:top-[-14px] right-4 md:right-8 rounded-full gold-gradient px-3 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-[0.16em] text-black shadow-md z-10">
                                Most Popular
                              </span>
                            )}
                            <div className="portal-plan-info">
                              <div className="portal-plan-title-row mb-5">
                                <h4 className="portal-plan-title text-xl font-black uppercase leading-tight tracking-tight text-white md:text-3xl pr-24">
                                  {plan.name}
                                </h4>
                              </div>
                              <p className="portal-plan-tagline mb-6 text-sm font-bold uppercase tracking-[0.12em] text-neutral-300">
                                {plan.tagline}
                              </p>
                              <div className="portal-plan-meta-row mb-5">
                                <p className="portal-plan-price-label text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Price</p>
                                <p className="portal-plan-price mt-1 text-3xl font-black leading-none text-gold md:text-4xl">{'\u20B9'} {plan.price.toLocaleString()}</p>
                                <div className="portal-plan-duration-subtitle">
                                  <span className="portal-plan-duration mt-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">{plan.duration}</span>
                                  <span className="portal-plan-separator hidden"> • </span>
                                  <span className="portal-plan-subtitle hidden">{plan.tagline}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setViewPlan(plan)}
                              className="portal-plan-button mt-auto w-full rounded-full border border-gold/40 bg-gold/10 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-gold transition-all hover:bg-gold/20 hover:border-gold/70"
                            >
                              View Details
                            </button>
                          </div>

                          <div className="portal-plan-features-panel flex h-full flex-col rounded-[20px] border border-white/10 bg-[#121212]/40 p-5 transition-all duration-300 hover:border-gold/30 md:p-8">
                            <h5 className="mb-5 border-l border-gold pl-3 text-xl font-black uppercase tracking-tight text-white md:text-xl">Plan Details</h5>
                            {!Array.isArray(plan.features) || plan.features.length === 0 ? (
                              <div className="flex-grow rounded-2xl border border-white/10 p-4 text-sm text-neutral-400">
                                No features described for this plan yet.
                              </div>
                            ) : (
                              <ul className="space-y-3 flex-grow">
                                {plan.features.map((feature, index) => (
                                  <li key={`${plan.id}-${index}`} className="flex items-start gap-3 text-sm text-neutral-300">
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

      {/* ── Plan Details Modal ── */}
      {viewPlan && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
          onClick={() => setViewPlan(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[370px] overflow-y-auto rounded-[20px] border border-white/10 bg-[#121212] p-5 md:max-w-[420px] md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setViewPlan(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs font-black text-white transition-all hover:border-gold/40 hover:text-gold"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Header */}
            <p className="mb-1 border-l border-gold pl-3 text-[9px] font-black uppercase tracking-[0.2em] text-gold">
              Plan Details
            </p>
            <h3 className="mb-3 pr-8 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              {viewPlan.name}
            </h3>

            {/* Price */}
            <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-500">Price</p>
              <p className="mt-0.5 text-3xl font-black leading-none text-gold">
                ₹ {viewPlan.price.toLocaleString()}
                <span className="ml-2 text-sm font-bold uppercase tracking-widest text-neutral-400">
                  / {viewPlan.duration}
                </span>
              </p>
            </div>

            {/* Tagline box */}
            {viewPlan.tagline && (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/4 px-4 py-3">
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-neutral-500">Tagline</p>
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-neutral-200">
                  {viewPlan.tagline}
                </p>
              </div>
            )}

            {/* Features */}
            {Array.isArray(viewPlan.features) && viewPlan.features.length > 0 && (
              <div className="mb-5">
                <p className="mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gold">
                  What's Included
                </p>
                <ul className="space-y-2.5">
                  {viewPlan.features.map((feature, index) => (
                    <li key={`vp-${viewPlan.id}-${index}`} className="flex items-start gap-3 text-sm text-neutral-300">
                      <span className="mt-0.5 flex-shrink-0 text-gold">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Enquiry on WhatsApp — gold palette, wired to existing handlePlanWhatsAppClick */}
              <button
                onClick={() => {
                  setViewPlan(null);
                  handlePlanWhatsAppClick(viewPlan);
                }}
                className="w-full rounded-full border border-gold/40 bg-gold/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-gold transition-all hover:bg-gold/20 hover:border-gold/60 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Enquiry on WhatsApp
              </button>

              {/* Complete Payment — opens QR modal, closes detail modal first */}
              <button
                onClick={() => {
                  setViewPlan(null);
                  openPaymentModal(viewPlan);
                }}
                className="w-full rounded-full gold-gradient px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-black transition-all hover:scale-[1.01]"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" onClick={closePaymentModal}>
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px]" onClick={(e) => e.stopPropagation()}>
            {/* Close button is a sibling of the scrollable card container to ensure it is always clickable on all mobile devices */}
            <button
              onClick={closePaymentModal}
              className="absolute right-4 top-4 z-[180] flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-xs text-white transition-all hover:border-gold/40 hover:text-gold"
              aria-label="Close"
            >
              X
            </button>

            <div className="max-h-[90vh] w-full overflow-y-auto rounded-[24px] border border-white/10 bg-[#121212] p-6 pr-4">
              {!showPaymentQR ? (
                /* State 1: Details View */
                <div className="animate-fade-in pr-6">
                  <p className="mb-2 border-l border-gold pl-3 text-[10px] font-black uppercase tracking-[0.18em] text-gold sm:text-[11px]">Plan Details</p>
                  <h3 className="mb-2 pr-4 text-xl font-black uppercase tracking-tight text-white md:text-3xl">{selectedPlan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500 block">Price</span>
                    <span className="text-3xl font-black leading-none text-gold md:text-4xl">₹ {selectedPlan.price.toLocaleString()}</span>
                    <span className="ml-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">/ {selectedPlan.duration}</span>
                  </div>

                  <div className="mb-5 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-neutral-200 mb-2">Tagline</p>
                    <p className="text-sm leading-relaxed text-neutral-300 font-light">{selectedPlan.tagline}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-gold mb-3">What's Included</p>
                    {!Array.isArray(selectedPlan.features) || selectedPlan.features.length === 0 ? (
                      <p className="text-sm text-neutral-500">No specific features listed for this plan.</p>
                    ) : (
                      <ul className="space-y-2.5">
                        {selectedPlan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-neutral-300">
                            <span className="mt-0.5 text-gold text-xs">✦</span>
                            <span className="leading-relaxed font-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={() => setShowPaymentQR(true)}
                    className="w-full rounded-full gold-gradient py-3.5 text-xs font-black uppercase tracking-[0.14em] text-black transition-all hover:scale-[1.01] hover:shadow-lg shadow-[0_0_20px_rgba(229,192,123,0.2)]"
                  >
                    COMPLETE PAYMENT
                  </button>
                </div>
              ) : (
                /* State 2: QR Payment View */
                <div className="animate-fade-in pr-6">
                  <p className="mb-2 border-l border-gold pl-3 text-[10px] font-black uppercase tracking-[0.18em] text-gold sm:text-[11px]">Scan And Pay</p>
                  <h3 className="mb-2 pr-4 text-xl font-black uppercase tracking-tight text-white md:text-3xl">{selectedPlan.name}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-neutral-400 font-light">
                    Scan this QR code to pay for <span className="text-white font-bold">{selectedPlan.name}</span>. Amount: <span className="font-bold text-gold">₹ {selectedPlan.price.toLocaleString()}</span>
                  </p>
                  
                  <div className="mb-4 overflow-hidden rounded-[16px] border border-white/10 bg-white p-2 flex items-center justify-center">
                    <img src={PAYMENT_QR_IMAGE} alt="NOIZE payment QR code" className="w-full h-auto max-h-[35vh] object-contain rounded-[14px]" />
                  </div>
                  
                  <div className="mb-5 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
                    <p className="text-xs font-bold leading-relaxed text-neutral-300 sm:text-sm">
                      NOTE: After payment, send the payment screenshot to WhatsApp number {PAYMENT_WHATSAPP_NUMBER}.
                  </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handlePlanWhatsAppClick(selectedPlan)}
                      className="flex-grow rounded-full gold-gradient py-3 text-xs font-black uppercase tracking-[0.12em] text-black transition-all hover:scale-[1.01]"
                    >
                      Open WhatsApp
                    </button>
                    <button
                      onClick={() => setShowPaymentQR(false)}
                      className="flex-grow rounded-full border border-white/20 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition-all hover:border-gold/40 hover:text-gold"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMysteryPopup && (
        <>
          <style>{`
            @keyframes mpOverlay { from{opacity:0} to{opacity:1} }
            @keyframes mpCardPop {
              0%{opacity:0;transform:scale(0.88) translateY(18px)}
              65%{opacity:1;transform:scale(1.02) translateY(-4px)}
              100%{opacity:1;transform:scale(1) translateY(0)}
            }
            @keyframes mpIconPulse {
              0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(229,192,123,0)}
              50%{transform:scale(1.06);box-shadow:0 0 22px 4px rgba(229,192,123,0.28)}
            }
            @keyframes mpShimmer {
              0%{transform:translateX(-160%) skewX(-18deg);opacity:0}
              20%{opacity:0.55}
              100%{transform:translateX(160%) skewX(-18deg);opacity:0}
            }
            .mp-overlay {
              position:fixed;inset:0;z-index:200;
              display:flex;align-items:center;justify-content:center;
              padding:1rem;
              background:rgba(0,0,0,0.80);
              backdrop-filter:blur(6px);
              animation:mpOverlay 0.25s ease-out;
            }
            .mp-card {
              position:relative;width:100%;max-width:320px;
              background:#0e0e0e;
              border:1px solid rgba(229,192,123,0.22);
              border-radius:20px;
              padding:1.85rem 1.75rem 1.65rem;
              text-align:center;overflow:hidden;
              animation:mpCardPop 0.4s ease-out;
            }
            .mp-glow {
              pointer-events:none;position:absolute;inset:0;border-radius:20px;
              background:radial-gradient(ellipse at 50% 0%,rgba(229,192,123,0.13) 0%,transparent 68%);
            }
            .mp-shimmer {
              pointer-events:none;position:absolute;inset-y:0;left:-30%;width:40%;
              background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
              animation:mpShimmer 3.2s ease-in-out 1.2s infinite;
            }
            .mp-icon {
              width:2.6rem;height:2.6rem;border-radius:50%;
              background:linear-gradient(135deg,#E5C07B 0%,#C9993E 100%);
              display:flex;align-items:center;justify-content:center;
              margin:0 auto 1.1rem;
              animation:mpIconPulse 2s ease-in-out infinite;
            }
            .mp-eyebrow {
              font-size:0.6rem;font-weight:900;letter-spacing:0.28em;
              text-transform:uppercase;color:#E5C07B;margin-bottom:0.3rem;
            }
            .mp-title {
              font-size:1.3rem;font-weight:900;letter-spacing:-0.01em;
              text-transform:uppercase;color:#fff;margin-bottom:0.6rem;
            }
            .mp-body {
              font-size:0.75rem;color:rgba(255,255,255,0.4);
              line-height:1.65;margin-bottom:1.4rem;padding:0 0.25rem;
            }
            .mp-reveal-btn {
              width:100%;padding:0.9rem 1rem;border-radius:12px;border:none;
              background:linear-gradient(135deg,#E5C07B 0%,#C9993E 100%);
              color:#000;font-size:0.68rem;font-weight:900;
              letter-spacing:0.18em;text-transform:uppercase;
              cursor:pointer;transition:opacity 0.2s,transform 0.15s;
              margin-bottom:0.85rem;
            }
            .mp-reveal-btn:hover{opacity:0.88;transform:scale(1.015);}
            .mp-later {
              background:none;border:none;font-size:0.68rem;
              color:rgba(255,255,255,0.3);cursor:pointer;
              transition:color 0.2s;padding:0.2rem;
            }
            .mp-later:hover{color:rgba(255,255,255,0.6);}
          `}</style>

          <div className="mp-overlay" onClick={() => setShowMysteryPopup(false)}>
            <div className="mp-card" onClick={(e) => e.stopPropagation()}>
              <div className="mp-glow" />
              <div className="mp-shimmer" />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="mp-icon">
                  <svg width="20" height="20" fill="none" stroke="#000"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z"/>
                  </svg>
                </div>

                <p className="mp-eyebrow">You Got Lucky</p>
                <h3 className="mp-title">Mystery Chance</h3>
                <p className="mp-body">
                  A special opportunity just unlocked for you.
                  Tap below to reveal your 4/4 mystery offer.
                </p>

                <button
                  className="mp-reveal-btn"
                  onClick={() => {
                    setShowMysteryPopup(false);
                    openMysteryOffersPortal();
                  }}
                >
                  Reveal My Offer
                </button>
                <br />
                <button
                  className="mp-later"
                  onClick={() => setShowMysteryPopup(false)}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MembershipPortal;
