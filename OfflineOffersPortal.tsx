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
  const [unwrapping, setUnwrapping] = useState(false);
  const [popup, setPopup] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const totalChances = MAX_OFFER_CHANCES;
  const opened = usedChances;
  const allUsed = opened >= totalChances;
  const remaining = Math.max(totalChances - opened, 0);

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

  const spawnParticles = (el: HTMLElement) => {
    const PCOLORS = ["#E5C07B", "#C9993E", "#ffffff", "#52C27A", "#EF9F27"];
    for (let p = 0; p < 14; p++) {
      const d = document.createElement('div');
      d.className = 'particle go';
      const a = (p / 14) * 360;
      const dist = 55 + Math.random() * 40;
      d.style.cssText = `background:${PCOLORS[p % 5]};--tx:${Math.cos(a * Math.PI / 180) * dist}px;--ty:${Math.sin(a * Math.PI / 180) * dist}px;left:-3px;top:-3px;animation-delay:${Math.random() * 0.15}s;`;
      el.appendChild(d);
      setTimeout(() => d.remove(), 900);
    }
  };

  const handleShowGiftPopup = (idx: number) => {
    if (unwrapping) return;
    setPopup(idx);
    setIsRevealed(false);
  };

  const doUnwrap = async () => {
    if (unwrapping || popup === null) return;
    setUnwrapping(true);

    // Apply CSS animations to components
    ['wt', 'wb', 'rh', 'rv'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('off');
    });

    const ptsEl = document.getElementById('pts');
    if (ptsEl) spawnParticles(ptsEl);

    const nextCount = usedChances + 1;
    const persisted = await consumeChance(nextCount);

    if (!persisted) {
      ['wt', 'wb', 'rh', 'rv'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('off');
      });
      setUnwrapping(false);
      return;
    }

    window.setTimeout(() => {
      setUnwrapping(false);
      setIsRevealed(true);
    }, 630);
  };

  const handleClosePopup = () => {
    setPopup(null);
    setIsRevealed(false);
  };

  const handleOpenWhatsApp = (offer: Offer) => {
    if (!customer) return;
    const valueText = offer.price_text || 'Exclusive Rate';
    const message = `Hi NOIZE! I want to claim my Mystery Offer: ${offer.title} (${valueText}) for member ${customer.fullName}. My verified email is ${customer.email}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatus = (i: number) => {
    if (i < usedChances) return 'opened';
    if (i === usedChances && !allUsed) return 'tappable';
    return 'locked';
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white w-full overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --gold:#E5C07B;--gold-d:#C9993E;--bdr:rgba(229,192,123,0.22);
          --bg:#0e0e0e;--card:#141414;
          --text:#ffffff;--dim:rgba(255,255,255,0.55);--muted:rgba(255,255,255,0.28);
          --green:#52C27A;--ff:'Bebas Neue',sans-serif;--fb:'DM Sans',sans-serif;
        }
        @keyframes shimmer{0%{transform:translateX(-160%) skewX(-18deg);opacity:0}20%{opacity:.5}100%{transform:translateX(160%) skewX(-18deg);opacity:0}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(229,192,123,0)}50%{box-shadow:0 0 16px 3px rgba(229,192,123,0.28)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes overlayIn{from{opacity:0}to{opacity:1}}
        @keyframes wrapTopOff{0%{transform:translateY(0) scaleY(1);opacity:1}60%{transform:translateY(-140%) scaleY(0.6);opacity:.4}100%{transform:translateY(-180%) scaleY(0);opacity:0}}
        @keyframes wrapBotOff{0%{transform:translateY(0) scaleY(1);opacity:1}60%{transform:translateY(140%) scaleY(0.6);opacity:.4}100%{transform:translateY(180%) scaleY(0);opacity:0}}
        @keyframes ribbonH{0%{transform:scaleX(1);opacity:1}100%{transform:scaleX(0);opacity:0}}
        @keyframes ribbonV{0%{transform:scaleY(1);opacity:1}100%{transform:scaleY(0);opacity:0}}
        @keyframes particleFly{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0)}}
        @keyframes iconBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        .offline-offers-body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--fb);
          -webkit-font-smoothing: antialiased;
        }
        .page{min-height:100vh;padding:16px 14px 40px;}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .brand{font-family:var(--ff);font-size:22px;letter-spacing:3px;color:var(--gold);}
        .logout-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);color:var(--dim);font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;padding:7px 14px;border-radius:100px;cursor:pointer;}
        .intro{border-radius:16px;padding:18px 18px 16px;margin-bottom:14px;position:relative;overflow:hidden;background:var(--bg);border:1px solid var(--bdr);}
        .intro::before{content:'';pointer-events:none;position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(229,192,123,0.12) 0%,transparent 65%);}
        .shimmer-el{pointer-events:none;position:absolute;inset-y:0;left:-30%;width:40%;background:gradient;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent);animation:shimmer 4s ease-in-out 1s infinite;}
        .eyebrow{font-size:9px;font-weight:900;letter-spacing:2.8px;text-transform:uppercase;color:var(--gold);margin-bottom:5px;position:relative;}
        .intro-title{font-family:var(--ff);font-size:clamp(28px,7vw,40px);letter-spacing:2px;line-height:1;position:relative;}
        .intro-title span{color:var(--gold);}
        .intro-desc{font-size:12px;color:var(--dim);margin-top:7px;line-height:1.6;position:relative;}
        .intro-bottom{display:flex;gap:8px;margin-top:14px;position:relative;}
        .stat{border-radius:10px;padding:10px 14px;flex:1;text-align:center;background:var(--card);border:1px solid rgba(255,255,255,0.07);min-width: 0;}
        .stat.g{border-color:var(--bdr);background:rgba(229,192,123,0.07);}
        .stat-lbl{font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:3px;}
        .stat-val{font-family:var(--ff);font-size:20px;letter-spacing:1px;line-height:1;}
        .stat-val.gold{color:var(--gold);}
        .stat-val.sm{font-family:var(--fb);font-size:14px;font-weight:500;letter-spacing:0;}
        .panel{border-radius:16px;padding:18px 16px;background:var(--bg);border:1px solid var(--bdr);position:relative;overflow:hidden;}
        .panel::before{content:'';pointer-events:none;position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(229,192,123,0.08) 0%,transparent 60%);}
        .panel-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;position:relative;}
        .panel-title{font-family:var(--ff);font-size:22px;letter-spacing:1.5px;}
        .badge-pill{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 12px;border-radius:100px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--muted);}
        .badge-pill.active{border-color:var(--bdr);color:var(--gold);background:rgba(229,192,123,0.10);}
        .chances-list{display:flex;flex-direction:column;gap:8px;position:relative;}
        .chance-row{display:flex;align-items:center;gap:12px;border-radius:10px;padding:11px 14px;background:var(--card);border:1px solid rgba(255,255,255,0.07);cursor:default;transition:border-color .2s,background .2s,transform .1s;position:relative;overflow:hidden;width: 100%;text-align: left;}
        .chance-row.tappable{border-color:rgba(229,192,123,0.45);cursor:pointer;}
        .chance-row.tappable::after{content:'';pointer-events:none;position:absolute;inset-y:0;left:-30%;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);animation:shimmer 3s ease-in-out 0.5s infinite;}
        .chance-row.tappable:active{transform:scale(0.985);}
        .chance-row.opened{opacity:.6;}
        .row-icon{width:30px;height:30px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
        .row-icon.tap{background:linear-gradient(135deg,var(--gold),var(--gold-d));color:#000;animation:pulse 2s ease-in-out infinite;}
        .row-icon.done{background:rgba(82,194,122,0.15);color:var(--green);}
        .row-icon.lock{background:rgba(255,255,255,0.05);color:var(--muted);}
        .row-meta{flex:1;min-width:0;}
        .row-num{font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:2px;}
        .row-txt{font-size:12px;line-height:1.4;}
        .row-txt.tap-t{color:rgba(229,192,123,0.85);font-style:italic;}
        .row-txt.lock-t{color:var(--muted);}
        .row-txt.offer-t{color:var(--dim);}
        .row-txt.offer-t strong{color:var(--gold);font-weight:600;}
        .row-badge{font-size:8px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;padding:3px 9px;border-radius:100px;flex-shrink:0;}
        .row-badge.done{background:rgba(82,194,122,0.10);color:var(--green);border:1px solid rgba(82,194,122,0.20);}
        .row-badge.tap{background:rgba(229,192,123,0.12);color:var(--gold);border:1px solid var(--bdr);animation:blink 2s infinite;}
        .row-badge.lock{background:rgba(255,255,255,0.04);color:var(--muted);border:1px solid rgba(255,255,255,0.07);}
        .panel-note{margin-top:12px;border-radius:10px;padding:11px 14px;font-size:12px;color:var(--dim);line-height:1.6;background:var(--card);border:1px solid rgba(255,255,255,0.07);position:relative;}
        .panel-note strong{color:var(--gold);font-weight:500;}
        .ended-panel{border-radius:16px;padding:22px 16px;background:var(--bg);border:1px solid var(--bdr);position:relative;overflow:hidden;text-align:center;margin-top:16px;}
        .ended-panel::before{content:'';pointer-events:none;position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(229,192,123,0.10) 0%,transparent 65%);}
        .ended-ey{font-size:9px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);margin-bottom:10px;position:relative;}
        .ended-cnt{font-family:var(--ff);font-size:42px;letter-spacing:2px;line-height:1;margin-bottom:4px;position:relative;}
        .ended-sub{font-size:12px;color:var(--muted);margin-bottom:16px;position:relative;}
        .ended-box{border-radius:10px;padding:14px;font-size:12px;color:var(--dim);line-height:1.65;margin-bottom:18px;background:var(--card);border:1px solid rgba(255,255,255,0.07);position:relative;}
        .cta{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--gold),var(--gold-d));color:#000;font-family:var(--fb);font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;cursor:pointer;position:relative;transition:opacity 0.2s;}
        .cta:hover{opacity:0.9;}

        /* OVERLAY */
        .overlay{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:20px;animation:overlayIn .22s ease;backdrop-filter:blur(5px);}
        .overlay-inner{width:100%;max-width:340px;position:relative;}
        .gift-box{position:relative;width:110px;height:110px;margin:0 auto 0;cursor:pointer;}
        .gift-wrap-top{position:absolute;top:0;left:0;right:0;height:50%;background:rgba(229,192,123,0.14);border:1px solid rgba(229,192,123,0.35);border-bottom:none;border-radius:10px 10px 0 0;transform-origin:top center;transition:transform 0.4s;}
        .gift-wrap-bot{position:absolute;bottom:0;left:0;right:0;height:50%;background:rgba(229,192,123,0.10);border:1px solid rgba(229,192,123,0.28);border-top:none;border-radius:0 0 10px 10px;transform-origin:bottom center;transition:transform 0.4s;}
        .ribbon-h{position:absolute;top:50%;left:0;right:0;height:2px;background:var(--gold);transform:translateY(-50%);transform-origin:center;}
        .ribbon-v{position:absolute;top:0;bottom:0;left:50%;width:2px;background:var(--gold);transform:translateX(-50%);transform-origin:center;}
        .ribbon-bow{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:26px;height:14px;pointer-events:none;}
        .bow-left{position:absolute;left:0;top:2px;width:11px;height:11px;border:2.5px solid var(--gold);border-radius:50% 50% 0 50%;transform:rotate(-30deg);}
        .bow-right{position:absolute;right:0;top:2px;width:11px;height:11px;border:2.5px solid var(--gold);border-radius:50% 50% 50% 0;transform:rotate(30deg);}
        .bow-center{position:absolute;left:50%;top:4px;transform:translateX(-50%);width:6px;height:6px;background:var(--gold);border-radius:50%;}
        .gift-emoji{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:30px;opacity:0.6;animation:iconBounce 1.8s ease-in-out infinite;}
        .gift-hint{font-size:10px;color:rgba(229,192,123,0.7);text-align:center;margin-top:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;animation:blink 1.8s infinite;}
        .gift-sub{margin-top:6px;font-size:11px;color:rgba(255,255,255,0.22);text-align:center;font-weight:600;letter-spacing:1px;}
        .gift-wrap-top.off{animation:wrapTopOff .55s cubic-bezier(.4,0,.2,1) forwards;}
        .gift-wrap-bot.off{animation:wrapBotOff .55s cubic-bezier(.4,0,.2,1) .05s forwards;}
        .ribbon-h.off{animation:ribbonH .35s ease forwards;}
        .ribbon-v.off{animation:ribbonV .35s ease forwards;}
        .particles{position:absolute;top:50%;left:50%;width:0;height:0;pointer-events:none;}
        .particle{position:absolute;width:6px;height:6px;border-radius:50%;opacity:0;}
        .particle.go{animation:particleFly .7s ease-out forwards;}
        .offer-card{background:#0e0e0e;border:1px solid var(--bdr);border-radius:20px;padding:24px 20px 20px;position:relative;overflow:hidden;}
        .offer-card::before{content:'';pointer-events:none;position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(229,192,123,0.13) 0%,transparent 65%);}
        .offer-card-shimmer{pointer-events:none;position:absolute;inset-y:0;left:-30%;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);animation:shimmer 3.5s ease-in-out .8s infinite;}
        .offer-icon{width:2.5rem;height:2.5rem;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-d));display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:19px;color:#000;animation:iconBounce 2s ease-in-out infinite;}
        .offer-eyebrow{font-size:9px;font-weight:900;letter-spacing:2.8px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:4px;position:relative;}
        .offer-title{font-family:var(--ff);font-size:24px;letter-spacing:2px;color:var(--text);text-align:center;margin-bottom:16px;position:relative;}
        .offer-value{background:#141414;border:1px solid rgba(229,192,123,0.22);border-radius:12px;padding:14px 16px;margin-bottom:10px;animation:slideUp .25s ease;position:relative;text-align: left;}
        .offer-value-lbl{font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
        .offer-value-txt{font-size:15px;font-weight:700;color:var(--gold);}
        .offer-desc{background:#141414;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 16px;animation:slideUp .32s ease;position:relative;text-align: left;}
        .offer-desc-lbl{font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
        .offer-desc-txt{font-size:12.5px;color:var(--dim);line-height:1.6;}
        .offer-actions{display:flex;flex-direction:column;gap:8px;margin-top:16px;position:relative;}
        .btn-wa{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--gold) 0%,var(--gold-d) 100%);color:#000000;font-family:var(--fb);font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s,transform .15s;box-shadow:0 0 24px rgba(229,192,123,0.25);}
        .btn-wa:hover{opacity:.88;}
        .btn-wa:active{transform:scale(0.97);}
        .btn-close{width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.04);color:var(--dim);font-family:var(--fb);font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:background 0.2s;}
        .btn-close:hover{background:rgba(255,255,255,0.08);}
      `}</style>

      <div className="page offline-offers-body">
        <div className="topbar">
          <div className="brand">NOIZE</div>
          <button onClick={() => navigate('/logout')} className="logout-btn">
            Logout
          </button>
        </div>

        {loading ? (
          <div className="intro text-center py-20">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
            <p className="font-bold text-gold">Synchronizing with NOIZE database...</p>
          </div>
        ) : errorMessage ? (
          <div className="intro text-center text-red-400 p-8">
            {errorMessage}
          </div>
        ) : offers.length === 0 ? (
          <div className="intro text-center p-12">
            <h2 className="mb-4 text-2xl font-black text-white">No Active Mystery Offers</h2>
            <p className="mb-8 text-neutral-400">There are no active offers right now, so membership is the only claimable path.</p>
            <button
              onClick={() => navigate('/portal')}
              className="cta"
              style={{ maxWidth: '320px', margin: '0 auto' }}
            >
              Go To Membership
            </button>
          </div>
        ) : (
          <>
            <div className="intro">
              <div className="shimmer-el"></div>
              <div className="eyebrow">Mystery Offline Access</div>
              <div className="intro-title">TAP TO <span>UNWRAP</span></div>
              <div className="intro-desc">Welcome {customer.fullName}. You have {totalChances} mystery chances. Every tap unwraps one hidden offer.</div>
              <div className="intro-bottom">
                <div className="stat">
                  <div className="stat-lbl">Member</div>
                  <div className="stat-val sm">{customer.fullName}</div>
                </div>
                <div className="stat g">
                  <div className="stat-lbl">Chances</div>
                  <div className="stat-val gold">{opened}/{totalChances}</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-hdr">
                <div>
                  <div className="eyebrow" style={{ marginBottom: '3px' }}>Mystery Chances</div>
                  <div className="panel-title">Tap Boxes</div>
                </div>
                <div className={`badge-pill ${remaining > 0 ? 'active' : ''}`}>{remaining} Left</div>
              </div>

              <div className="chances-list">
                {Array.from({ length: totalChances }).map((_, i) => {
                  const s = getStatus(i);
                  const iconCls = s === 'opened' ? 'done' : s === 'tappable' ? 'tap' : 'lock';
                  const icon = s === 'opened' ? '✓' : s === 'tappable' ? '✦' : '○';
                  
                  // Safely fetch offer details
                  const offerForChance = offers[i % offers.length];

                  let txt = s === 'opened'
                    ? `<div class="row-txt offer-t"><strong>Offer:</strong> ${offerForChance ? (offerForChance.price_text || offerForChance.title) : ''}</div>`
                    : s === 'tappable'
                    ? `<div class="row-txt tap-t">Tap to reveal hidden offer</div>`
                    : `<div class="row-txt lock-t">Locked</div>`;

                  return (
                    <button
                      key={i}
                      disabled={s !== 'tappable'}
                      className={`chance-row ${s === 'tappable' ? 'tappable' : s === 'opened' ? 'opened' : ''}`}
                      onClick={() => handleShowGiftPopup(i)}
                      style={{ border: 'none', font: 'inherit', color: 'inherit' }}
                    >
                      <div className={`row-icon ${iconCls}`}>{icon}</div>
                      <div className="row-meta">
                        <div className="row-num">Chance {i + 1}</div>
                        <div dangerouslySetInnerHTML={{ __html: txt }} />
                      </div>
                      <div className={`row-badge ${s === 'opened' ? 'done' : s === 'tappable' ? 'tap' : 'lock'}`}>
                        {s === 'opened' ? 'Done' : s === 'tappable' ? 'Tap' : 'Lock'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="panel-note">
                {!allUsed ? (
                  <>
                    You have <strong>{remaining} chance{remaining !== 1 ? 's' : ''} remaining</strong>. Tap the glowing row to unwrap your next offer.
                  </>
                ) : (
                  'All 4 mystery chances are finished. Only the membership portal can now be claimed.'
                )}
              </div>
            </div>

            {allUsed && (
              <div className="overlay" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 9999 }}>
                <div className="overlay-inner" style={{ maxWidth: '400px' }}>
                  <div className="ended-panel" style={{ marginTop: 0, padding: '32px 24px', background: '#0e0e0e', border: '1px solid rgba(229,192,123,0.3)' }}>
                    <div className="ended-ey">Mystery Ended</div>
                    <div className="ended-cnt" style={{ fontSize: '48px', marginBottom: '8px' }}>{opened}/{totalChances} Used</div>
                    <div className="ended-sub" style={{ fontSize: '13px', marginBottom: '20px' }}>All chances exhausted</div>
                    <div className="ended-box" style={{ fontSize: '13px', marginBottom: '24px', textAlign: 'center', background: '#141414' }}>
                      The mystery offers are now closed. Only membership plans can be claimed from here.
                    </div>
                    <button className="cta" onClick={() => navigate('/portal')} style={{ padding: '16px', fontSize: '12px' }}>
                      Go to Membership
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* GIFT POPUP OVERLAY */}
      {popup !== null && (
        <div id="overlay" className="overlay" onClick={(e) => { if (e.target === document.getElementById('overlay')) handleClosePopup(); }}>
          <div className="overlay-inner">
            {!isRevealed ? (
              <div style={{ textAlign: 'center' }}>
                <div className="gift-box" id="gbox" onClick={doUnwrap}>
                  <div className="gift-emoji">🎁</div>
                  <div className="gift-wrap-top" id="wt">
                    <div className="ribbon-h" id="rh"></div>
                  </div>
                  <div className="gift-wrap-bot" id="wb"></div>
                  <div className="ribbon-v" id="rv"></div>
                  <div className="ribbon-bow">
                    <div className="bow-left"></div>
                    <div className="bow-right"></div>
                    <div className="bow-center"></div>
                  </div>
                  <div className="particles" id="pts"></div>
                </div>
                <div className="gift-hint">Tap to unwrap</div>
                <div className="gift-sub">Chance {popup + 1} of {totalChances}</div>
              </div>
            ) : (
              (() => {
                const currentOffer = offers[popup % offers.length];
                if (!currentOffer) return null;
                return (
                  <div className="offer-card">
                    <div className="offer-card-shimmer"></div>
                    <div className="offer-icon">★</div>
                    <div className="offer-eyebrow">Mystery Unlocked</div>
                    <div className="offer-title">{currentOffer.title}</div>
                    <div className="offer-value">
                      <div className="offer-value-lbl">Your Offer</div>
                      <div className="offer-value-txt">{currentOffer.price_text || 'Exclusive Offer'}</div>
                    </div>
                    <div className="offer-desc">
                      <div className="offer-desc-lbl">Details</div>
                      <div className="offer-desc-txt">{currentOffer.description}</div>
                    </div>
                    <div className="offer-actions">
                      <button className="btn-wa" onClick={() => handleOpenWhatsApp(currentOffer)}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Confirm on WhatsApp
                      </button>
                      <button className="btn-close" onClick={handleClosePopup}>
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineOffersPortal;
