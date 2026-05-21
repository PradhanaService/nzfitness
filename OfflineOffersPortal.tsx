import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Offer, supabase } from './supabaseClient';

type OfflinePortalCustomer = {
  fullName: string;
  age: string;
  dob: string;
  email: string;
  phoneNumber: string;
};

type RevealState = 'idle' | 'unwrapping' | 'revealed';

const OFFLINE_PORTAL_CUSTOMER_KEY = 'noize_offline_portal_customer';
const OFFLINE_PORTAL_ACCESS_KEY = 'noize_offline_portal_access';
const MAX_OFFER_CHANCES = 4;
const WHATSAPP_NUMBER = '918122390693';

const OfflineOffersPortal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'admin';
  const [customer, setCustomer] = useState<OfflinePortalCustomer | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedChances, setUsedChances] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [revealState, setRevealState] = useState<RevealState>('idle');
  const [activeChance, setActiveChance] = useState<number | null>(null);
  const [revealedOffer, setRevealedOffer] = useState<Offer | null>(null);

  const chancesRemaining = Math.max(MAX_OFFER_CHANCES - usedChances, 0);
  const allChancesUsed = usedChances >= MAX_OFFER_CHANCES;

  useEffect(() => {
    if (isPreviewMode) {
      setCustomer({
        fullName: 'Admin Preview',
        age: '25',
        dob: '2000-01-01',
        email: 'admin-preview@noize.local',
        phoneNumber: '',
      });
      return;
    }

    const savedCustomer = sessionStorage.getItem(OFFLINE_PORTAL_CUSTOMER_KEY);
    const savedAccess = sessionStorage.getItem(OFFLINE_PORTAL_ACCESS_KEY);
    if (!savedCustomer || !savedAccess) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const parsedCustomer = JSON.parse(savedCustomer) as OfflinePortalCustomer;
      const parsedAccess = JSON.parse(savedAccess) as { email?: string };
      if (!parsedAccess?.email || parsedAccess.email.trim().toLowerCase() !== parsedCustomer.email.trim().toLowerCase()) {
        sessionStorage.removeItem(OFFLINE_PORTAL_CUSTOMER_KEY);
        sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
        navigate('/', { replace: true });
        return;
      }
      setCustomer(parsedCustomer);
    } catch {
      sessionStorage.removeItem(OFFLINE_PORTAL_CUSTOMER_KEY);
      sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
      navigate('/', { replace: true });
    }
  }, [isPreviewMode, navigate]);

  useEffect(() => {
    if (!customer) return;

    const bootPortal = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        if (!isPreviewMode) {
          const memberKey = customer.email.trim().toLowerCase();
          let { data, error } = await supabase
            .from('user_offer_stats')
            .select('offer_view_count')
            .eq('phone_number', memberKey)
            .single();

          if (error && error.code === 'PGRST116') {
            await supabase.from('user_offer_stats').insert([{ phone_number: memberKey, offer_view_count: 0 }]);
            data = { offer_view_count: 0 };
          } else if (error) {
            throw error;
          }

          setUsedChances(data?.offer_view_count || 0);
        } else {
          setUsedChances(0);
        }

        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .order('valid_till', { ascending: true })
          .gte('valid_till', new Date().toISOString().split('T')[0]);

        if (offerError) throw offerError;

        setOffers(offerData || []);
      } catch (error: any) {
        setErrorMessage(error?.message || 'Failed to load the mystery offers portal.');
      } finally {
        setLoading(false);
      }
    };

    void bootPortal();
  }, [customer, isPreviewMode]);

  const consumeChance = async (nextCount: number) => {
    if (isPreviewMode || !customer) {
      setUsedChances(nextCount);
      return true;
    }

    const memberKey = customer.email.trim().toLowerCase();
    const { error } = await supabase
      .from('user_offer_stats')
      .update({
        offer_view_count: nextCount,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('phone_number', memberKey);

    if (error) {
      setErrorMessage(error.message || 'Failed to save your chance usage.');
      return false;
    }

    setUsedChances(nextCount);
    return true;
  };

  const handleRevealChance = async (chanceNumber: number) => {
    if (loading || revealState === 'unwrapping' || allChancesUsed || offers.length === 0) return;
    if (chanceNumber !== usedChances + 1) return;

    setErrorMessage('');
    setActiveChance(chanceNumber);
    setRevealState('unwrapping');

    const nextCount = usedChances + 1;
    const persisted = await consumeChance(nextCount);
    if (!persisted) {
      setRevealState('idle');
      setActiveChance(null);
      return;
    }

    const nextOffer = offers[(chanceNumber - 1) % offers.length] || null;

    window.setTimeout(() => {
      setRevealedOffer(nextOffer);
      setRevealState('revealed');
    }, 1400);
  };

  const closeReveal = () => {
    setRevealState('idle');
    setActiveChance(null);
    setRevealedOffer(null);
  };

  const claimOffer = (offer: Offer) => {
    if (!customer) return;
    const message = `Hi, I am ${customer.fullName}. I want to claim the mystery offline offer: ${offer.title} (${offer.price_text}). My verified email is ${customer.email}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white md:px-8 md:py-12">
      <style>{`
        @keyframes giftPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(229,192,123,0); }
          50% { transform: scale(1.03); box-shadow: 0 0 40px rgba(229,192,123,0.22); }
        }
        @keyframes unwrapLid {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-42px) rotate(-10deg); opacity: 0; }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-160%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(160%); opacity: 0; }
        }
        @keyframes revealRise {
          0% { transform: translateY(24px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes overlayFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalPop {
          0% { transform: scale(0.82) translateY(24px); opacity: 0; }
          65% { transform: scale(1.02) translateY(-6px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes burstOrbit {
          0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
        @keyframes sparkleBlink {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes lidPop {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-48px) rotate(-12deg); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-8">
        <div className="glass rounded-[36px] border border-gold/20 p-6 md:p-10">
          <div className="mb-5 flex justify-end">
            <button
              onClick={() => navigate('/logout')}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
            >
              Logout
            </button>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-gold">Mystery Offline Access</p>
              <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
                Tap To <span className="text-gold">Unwrap</span>
              </h1>
              <p className="mt-4 max-w-3xl text-sm text-neutral-400 md:text-base">
                {isPreviewMode
                  ? 'Admin preview mode for the mystery reveal flow.'
                  : `Welcome ${customer.fullName}. You have 4 mystery chances. Every tap unwraps one hidden offer. After all 4 chances are used, only membership remains claimable.`}
              </p>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-3 lg:w-auto lg:min-w-[620px]">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Member</p>
                <p className="truncate font-bold text-white">{customer.fullName}</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Verified Email</p>
                <p className="truncate text-sm font-bold text-white md:text-base">{customer.email}</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Chances</p>
                <p className="text-xl font-black text-gold">{usedChances}/{MAX_OFFER_CHANCES}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="glass rounded-[32px] border border-white/10 p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
            <p className="font-bold text-gold">Loading the mystery offers portal...</p>
          </div>
        ) : errorMessage ? (
          <div className="glass rounded-[32px] border border-red-500/30 p-8 text-center text-red-400">
            {errorMessage}
          </div>
        ) : offers.length === 0 ? (
          <div className="glass rounded-[32px] border border-white/10 p-12 text-center">
            <h2 className="mb-4 text-2xl font-black text-white">No Active Mystery Offers</h2>
            <p className="mb-8 text-neutral-400">There are no active offers right now, so membership is the only claimable path.</p>
            <button
              onClick={() => navigate('/portal')}
              className="gold-gradient rounded-full px-10 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)]"
            >
              Go To Membership
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass rounded-[32px] border border-white/10 p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-gold">Mystery Chances</p>
                  <h2 className="text-2xl font-black text-white">Tap Boxes</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-300">
                  {chancesRemaining} Left
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: MAX_OFFER_CHANCES }, (_, index) => {
                  const chanceNumber = index + 1;
                  const isOpened = chanceNumber < usedChances + (revealState === 'idle' ? 1 : 0);
                  const isCurrent = activeChance === chanceNumber;
                  const isNext = chanceNumber === usedChances + 1 && !allChancesUsed && revealState !== 'unwrapping';
                  const isLocked = chanceNumber > usedChances + 1 || allChancesUsed;

                  return (
                    <button
                      key={chanceNumber}
                      type="button"
                      onClick={() => void handleRevealChance(chanceNumber)}
                      disabled={!isNext}
                      className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition-all ${
                        isCurrent
                          ? 'border-gold bg-gold/10'
                          : isOpened
                            ? 'border-white/10 bg-white/5'
                            : isNext
                              ? 'border-gold/40 bg-[#17130b] hover:border-gold hover:bg-gold/10'
                              : 'border-white/10 bg-[#101010] opacity-70'
                      }`}
                      style={isCurrent ? { animation: 'giftPulse 1.15s ease-in-out infinite' } : undefined}
                    >
                      <div
                        className="pointer-events-none absolute inset-y-0 left-[-30%] w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={isCurrent ? { animation: 'shimmerSweep 1.25s ease-in-out infinite' } : undefined}
                      />
                      <div className="relative z-10">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">Chance {chanceNumber}</p>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-4xl">{isOpened ? '✓' : '🎁'}</div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                            isCurrent
                              ? 'bg-gold text-black'
                              : isOpened
                                ? 'bg-white/10 text-neutral-300'
                                : isNext
                                  ? 'bg-gold/20 text-gold'
                                  : 'bg-white/5 text-neutral-500'
                          }`}>
                            {isCurrent ? 'Unwrapping' : isOpened ? 'Opened' : isNext ? 'Tap Now' : 'Locked'}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                          <p
                            className="text-sm font-semibold text-white/85"
                            style={isCurrent ? { animation: 'unwrapLid 1.1s ease-in forwards' } : undefined}
                          >
                            {isOpened
                              ? 'This mystery chance has already been used.'
                              : isNext
                                ? 'Tap to open a hidden gift offer.'
                                : 'Unlock previous chances first.'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border border-gold/20 bg-gold/10 p-5">
                <p className="text-sm leading-relaxed text-white">
                  {allChancesUsed
                    ? 'All 4 mystery chances are finished. Offer taps are now closed and only the membership portal can be claimed.'
                    : `Each tap uses exactly 1 chance. You have ${chancesRemaining} mystery ${chancesRemaining === 1 ? 'chance' : 'chances'} remaining.`}
                </p>
              </div>
            </div>

            <div className={`glass rounded-[32px] border border-gold/20 p-6 transition-all md:p-8 ${revealState !== 'idle' ? 'opacity-35 blur-[2px]' : ''}`}>
              {allChancesUsed ? (
                <div className="space-y-6 text-center" style={{ animation: 'revealRise 0.5s ease-out' }}>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">Mystery Ended</p>
                  <h2 className="text-3xl font-black text-white md:text-4xl">4/4 Chances Used</h2>
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                    <p className="text-lg leading-relaxed text-neutral-300">
                      The mystery offers are now closed for this member. Only membership plans can be claimed from here.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/portal')}
                    className="gold-gradient w-full rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)]"
                  >
                    Go To Membership
                  </button>
                </div>
              ) : revealState === 'idle' || !revealedOffer ? (
                <div className="space-y-6 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">Hidden Reward</p>
                  <div className="rounded-[32px] border border-dashed border-gold/30 bg-[#14110a] px-6 py-14">
                    <div className="mb-5 text-6xl">🎁</div>
                    <h2 className="mb-3 text-3xl font-black text-white">Tap A Gift To Reveal</h2>
                    <p className="mx-auto max-w-xl text-neutral-400">
                      Every mystery tap opens one hidden offer. When the reveal appears here, the member can either claim it or close it and save the rest of the journey for the next chance.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/portal')}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                  >
                    Skip To Membership
                  </button>
                </div>
              ) : revealState === 'unwrapping' ? (
                <div className="space-y-6 text-center" style={{ animation: 'giftPulse 1.15s ease-in-out infinite' }}>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">Gift Unwrapping</p>
                  <div className="rounded-[32px] border border-gold/40 bg-[#17130b] px-6 py-16">
                    <div className="mb-5 text-7xl">🎁</div>
                    <h2 className="mb-3 text-3xl font-black text-white">Opening Chance {activeChance}</h2>
                    <p className="text-neutral-300">Your mysterious offer is being unwrapped...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6" style={{ animation: 'revealRise 0.5s ease-out' }}>
                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-gold">Mystery Revealed</p>
                    <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">{revealedOffer.title}</h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Price</p>
                      <p className="text-2xl font-black text-gold">{revealedOffer.price_text}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Valid Till</p>
                      <p className="text-lg font-black text-white">{new Date(revealedOffer.valid_till).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6">
                    <p className="leading-relaxed text-neutral-300">{revealedOffer.description}</p>
                  </div>

                  <div className="rounded-3xl border border-gold/20 bg-gold/10 p-5">
                    <p className="text-sm leading-relaxed text-white">
                      Chance <span className="font-black text-gold">{usedChances}/{MAX_OFFER_CHANCES}</span> is now used.
                      {usedChances < MAX_OFFER_CHANCES
                        ? ` You can close this and tap the next gift later, or claim this offer right now.`
                        : ' This was your final mystery reveal, so the next step is membership only.'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      onClick={() => claimOffer(revealedOffer)}
                      className="gold-gradient flex-1 rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)]"
                    >
                      Claim Offer
                    </button>
                    {usedChances < MAX_OFFER_CHANCES ? (
                      <button
                        onClick={closeReveal}
                        className="flex-1 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/portal')}
                        className="flex-1 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                      >
                        Go To Membership
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {revealState !== 'idle'  ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-md"
          style={{ animation: 'overlayFade 0.28s ease-out' }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[
              ['-26%', '-18%'],
              ['28%', '-22%'],
              ['34%', '6%'],
              ['18%', '24%'],
              ['-18%', '26%'],
              ['-34%', '4%'],
              ['-10%', '-28%'],
              ['12%', '-32%'],
            ].map(([tx, ty], index) => (
              <span
                key={`${tx}-${ty}`}
                className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-gold/80 shadow-[0_0_18px_rgba(229,192,123,0.55)]"
                style={{
                  ['--tx' as '--tx']: tx,
                  ['--ty' as '--ty']: ty,
                  animation: `burstOrbit ${0.8 + index * 0.08}s ease-out ${index * 0.04}s infinite`,
                }}
              />
            ))}
            {Array.from({ length: 14 }, (_, index) => (
              <span
                key={`spark-${index}`}
                className="absolute rounded-full bg-white/80"
                style={{
                  width: `${4 + (index % 3) * 2}px`,
                  height: `${4 + (index % 3) * 2}px`,
                  left: `${12 + index * 6}%`,
                  top: `${18 + (index % 5) * 13}%`,
                  animation: `sparkleBlink ${1.1 + index * 0.06}s ease-in-out ${index * 0.08}s infinite`,
                }}
              />
            ))}
          </div>

          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-gold/30 bg-[radial-gradient(circle_at_top,_rgba(229,192,123,0.18),_rgba(12,12,12,0.96)_42%,_rgba(6,6,6,0.98)_100%)] p-6 shadow-[0_28px_120px_rgba(0,0,0,0.68)] md:p-10"
            style={{ animation: 'modalPop 0.42s ease-out' }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%,transparent_70%,rgba(229,192,123,0.08))]" />
            <div className="relative z-10">
              {revealState === 'unwrapping' ? (
                <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-gold">Boop Pop Bang</p>
                  <div className="relative mb-10 h-48 w-48">
                    <div className="absolute left-6 right-6 top-10 h-16 rounded-[18px] border border-gold/50 bg-gold/25" style={{ animation: 'lidPop 0.9s ease-in-out infinite alternate' }} />
                    <div className="absolute bottom-4 left-4 right-4 h-28 rounded-[28px] border border-gold/50 bg-gradient-to-b from-[#3a2b0f] to-[#1a1409] shadow-[0_0_30px_rgba(229,192,123,0.25)]" />
                    <div className="absolute left-1/2 top-2 h-36 w-4 -translate-x-1/2 rounded-full bg-gold/90" />
                    <div className="absolute left-6 right-6 top-[4.4rem] h-4 rounded-full bg-gold/90" />
                  </div>
                  <h2 className="mb-3 text-4xl font-black text-white md:text-6xl">Unwrapping Chance {activeChance}</h2>
                  <p className="max-w-2xl text-lg text-neutral-300">Little pops, small bursts, and a full-screen gift reveal opening now.</p>
                </div>
              ) : revealedOffer ? (
                <div className="flex min-h-[70vh] flex-col justify-center">
                  <div className="mb-6 text-center">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-gold">Mystery Revealed</p>
                    <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">{revealedOffer.title}</h2>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-5 rounded-[30px] border border-white/10 bg-black/30 p-6 md:p-8">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Price</p>
                          <p className="text-2xl font-black text-gold">{revealedOffer.price_text}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">Valid Till</p>
                          <p className="text-lg font-black text-white">{new Date(revealedOffer.valid_till).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
                        <p className="leading-relaxed text-neutral-300">{revealedOffer.description}</p>
                      </div>

                      <div className="rounded-3xl border border-gold/20 bg-gold/10 p-5">
                        <p className="text-sm leading-relaxed text-white">
                          Chance <span className="font-black text-gold">{usedChances}/{MAX_OFFER_CHANCES}</span> is now used.
                          {usedChances < MAX_OFFER_CHANCES
                            ? ' Close this full-screen card and come back later for the next mystery tap, or claim this offer right now.'
                            : ' This was the final reveal. After this, only membership remains.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-[30px] border border-gold/20 bg-[linear-gradient(180deg,rgba(229,192,123,0.14),rgba(20,20,20,0.3))] p-6 md:p-8">
                      <div>
                        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-gold">Special Moment</p>
                        <h3 className="mb-4 text-3xl font-black text-white">Tap. Pop. Reveal.</h3>
                        <p className="text-neutral-300">
                          This reveal now takes the whole screen so it feels like opening a real gift. Claim it now, or close it and save the next surprise for later.
                        </p>
                      </div>

                      <div className="mt-8 flex flex-col gap-4">
                        <button
                          onClick={() => claimOffer(revealedOffer)}
                          className="gold-gradient rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)]"
                        >
                          Claim Offer
                        </button>
                        <button
                          onClick={closeReveal}
                          className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineOffersPortal;
