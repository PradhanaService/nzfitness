import React, { useState, useEffect, useRef, useContext } from 'react';
import { ClipboardCheck, Dumbbell, Heart, Leaf, Lock, PartyPopper, Phone, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PORTAL_CONTENT, PROGRAMS, TRANSFORMATIONS, REVIEWS, TRAINING_TYPES } from './constants';
import { PortalContentSection, Program, Transformation, Review } from './types';
import { supabase, MembershipPlan, Offer, AppImage, PortalContent, MembershipCategory } from './supabaseClient';

export const SiteImagesContext = React.createContext<Record<string, string>>({});

const FeatureBulletIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} text-gold flex-none`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7" />
  </svg>
);

const ModalBackIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const WHY_CHOOSE_US_ITEMS = [
  {
    title: 'Certified Coaches',
    icon: <Users className="text-[#C9A84C] w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />,
  },
  {
    title: 'Women-Friendly',
    icon: <Heart className="text-[#C9A84C] w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />,
  },
  {
    title: 'Premium Gear',
    icon: <Dumbbell className="text-[#C9A84C] w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />,
  },
  {
    title: 'Lifestyle Focus',
    icon: <Zap className="text-[#C9A84C] w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />,
  },
  {
    title: 'Free Assessments',
    icon: <ClipboardCheck className="text-[#C9A84C] w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />,
  },
  {
    title: 'Free Diet Plan',
    icon: <Leaf className="text-[#C9A84C] w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />,
  },
];

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

const PORTAL_CONTENT_DEFAULT_MAP = DEFAULT_PORTAL_CONTENT.reduce<Record<string, PortalContentSection>>((acc, section) => {
  acc[section.section_key] = section;
  return acc;
}, {});

const portalSectionIcons = {
  offline_workout: TRAINING_TYPES[0].icon,
  online_workout: TRAINING_TYPES[1].icon,
  home_workout: TRAINING_TYPES[2].icon,
};

const MEMBERSHIP_SECTION_CONFIG: {
  category: MembershipCategory;
  typeId: 'offline' | 'online' | 'home';
  sectionKey: keyof typeof portalSectionIcons;
}[] = [
  { category: 'offline', typeId: 'offline', sectionKey: 'offline_workout' },
  { category: 'online', typeId: 'online', sectionKey: 'online_workout' },
  { category: 'home_workout', typeId: 'home', sectionKey: 'home_workout' },
];

const normalizeMembershipCategory = (category?: string | null): MembershipCategory => {
  if (category === 'online' || category === 'home_workout') {
    return category;
  }
  return 'offline';
};

const buildTrainingTypes = (portalContent: Record<string, PortalContentSection>) => [
  {
    id: 'offline',
    title: portalContent.offline_workout.title,
    description: portalContent.offline_workout.description,
    features: portalContent.offline_workout.features,
    icon: portalSectionIcons.offline_workout,
  },
  {
    id: 'online',
    title: portalContent.online_workout.title,
    description: portalContent.online_workout.description,
    features: portalContent.online_workout.features,
    icon: portalSectionIcons.online_workout,
  },
  {
    id: 'home',
    title: portalContent.home_workout.title,
    description: portalContent.home_workout.description,
    features: portalContent.home_workout.features,
    icon: portalSectionIcons.home_workout,
  },
];

// --- Helper for Dual WhatsApp Logic ---
// Helper for TRUE Parallel WhatsApp Messaging
const WHATSAPP_1 = "918122390693";
const WHATSAPP_2 = "918296890693";
const handleWhatsApp = (message: string) => {
  const target = Math.random() > 0.5 ? WHATSAPP_1 : WHATSAPP_2;
  const popup = window.open(`https://wa.me/${target}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  if (popup) {
    popup.opener = null;
  }
};
// --- Components ---

const HERO_MEDIA_DEFAULT = [
  { type: 'image', src: '/images/bodybuilding.jpg', alt: 'Heavy strength training at NOIZE' },
  { type: 'video', src: '/images/gallery-6.mp4', alt: 'NOIZE live training session' },
  { type: 'image', src: '/images/crossfit.jpg', alt: 'Crossfit training at NOIZE' },
  { type: 'video', src: '/images/gallery-7.mp4', alt: 'NOIZE workout floor energy' },
  { type: 'image', src: '/images/functional-training.jpg', alt: 'Functional training at NOIZE' }
];

const GYM_MEDIA_DEFAULT = [
  { type: 'image', src: '/images/gallery-1.jpg', alt: 'NOIZE training floor' },
  { type: 'image', src: '/images/gallery-2.jpg', alt: 'NOIZE gym equipment' },
  { type: 'video', src: '/images/gallery-8.mp4', alt: 'NOIZE coaching session' },
  { type: 'image', src: '/images/gallery-5.jpg', alt: 'NOIZE gym atmosphere' }
];

const Navbar: React.FC<{ onJoinNow: () => void }> = ({ onJoinNow }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${isScrolled ? 'py-2 md:py-4 glass shadow-2xl' : 'py-3 md:py-6 bg-transparent'}`}>
        <div className="container mx-auto px-3 md:px-6 flex justify-between items-center">
          <a href="#home" className="flex items-center gap-2 md:gap-3">
            <img
              src="/images/logo.png"
              alt="NOIZE Fitness"
              className="h-6 md:h-10 w-auto"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <span className="text-lg md:text-2xl font-black tracking-tighter text-gold drop-shadow-[0_2px_8px_rgba(229,192,123,0.5)]">NOIZE</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-neutral-300">
            <a href="#home" className="hover:text-gold transition-colors">Home</a>
            <a href="#training-types" className="hover:text-gold transition-colors">Training Types</a>
            <a href="#programs" className="hover:text-gold transition-colors">Programs</a>
            <a href="/offers" className="hover:text-gold transition-colors">Offers</a>
            <a href="/portal" className="hover:text-gold transition-colors">Membership</a>
            <a href="#transformations" className="hover:text-gold transition-colors">Transformations</a>
            <a href="#gallery" className="hover:text-gold transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={onJoinNow}
              className="gold-gradient text-black font-bold min-h-0 py-1.5 md:py-2 px-3 md:px-6 rounded-full text-[10px] sm:text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_12px_rgba(201,168,76,0.3)] md:shadow-none"
            >
              JOIN NOW
            </button>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <input
                type="checkbox"
                id="mobile-menu-toggle"
                className="hidden peer"
                checked={isMobileMenuOpen}
                onChange={toggleMenu}
              />
              <label
                htmlFor="mobile-menu-toggle"
                className="flex min-h-10 min-w-10 flex-col items-center justify-center gap-1.5 cursor-pointer p-2"
              >
                <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </label>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" onClick={closeMenu}></div>
        <div className={`absolute top-16 right-3 w-[calc(100%-1.5rem)] glass rounded-2xl p-5 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col gap-3">
            <a href="#home" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Home</a>
            <a href="#training-types" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Training Types</a>
            <a href="#programs" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Programs</a>
            <a href="/offers" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Offers</a>
            <a href="/portal" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Membership</a>
            <a href="#transformations" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Transformations</a>
            <a href="#gallery" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Gallery</a>
            <a href="#contact" onClick={closeMenu} className="flex min-h-10 items-center border-l-[3px] border-transparent pl-2 text-base font-bold text-white hover:text-gold focus:text-gold transition-colors uppercase tracking-wide focus:border-[#C9A84C] active:border-[#C9A84C]">Contact</a>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                onJoinNow();
              }}
              className="gold-gradient text-black font-bold min-h-0 py-2 px-4 rounded-full text-xs hover:scale-105 transition-transform mt-3 text-center block w-full shadow-[0_0_12px_rgba(201,168,76,0.3)]"
            >
              JOIN NOW
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Hero: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [activeMedia, setActiveMedia] = useState(0);
  const siteImages = useContext(SiteImagesContext);

  // Dynamic Gallery Constructor
  const customKeys = Object.keys(siteImages).filter(k => k.startsWith('hero_media_')).sort();
  const heroMedia = customKeys.length > 0
    ? customKeys.map(k => ({
      type: siteImages[k].startsWith('data:video/') ? 'video' : 'image',
      src: siteImages[k],
      alt: 'NOIZE Custom Hero Media'
    }))
    : HERO_MEDIA_DEFAULT;

  // Legacy fallback support for users switching from Single Image Override
  if (siteImages['hero_background'] && customKeys.length === 0) {
    heroMedia.length = 0;
    heroMedia.push({
      type: siteImages['hero_background'].startsWith('data:video/') ? 'video' : 'image',
      src: siteImages['hero_background'],
      alt: 'NOIZE Custom Hero Background'
    });
  }

  useEffect(() => {
    setActiveMedia(0); // Reset to 0 when gallery changes
  }, [heroMedia.length]);

  useEffect(() => {
    if (heroMedia.length <= 1) return; // No need to cycle if only 1 slide
    const timer = window.setInterval(() => {
      setActiveMedia((current) => (current + 1) % heroMedia.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [heroMedia.length]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 md:pt-0 bg-[#050505] border-b border-[#C9A84C]/20">
      <div className="absolute inset-0 z-0">
        {heroMedia.map((media, index) => (
          <div
            key={media.src}
            className={`absolute inset-0 transition-opacity duration-1000 ${activeMedia === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {media.type === 'video' ? (
              <video
                src={activeMedia === index ? media.src : undefined}
                className="w-full h-full object-cover brightness-[0.32] contrast-[0.95] saturate-[0.7] scale-[1.02]"
                autoPlay={activeMedia === index}
                muted
                loop
                playsInline
                preload={activeMedia === index ? 'metadata' : 'none'}
                aria-label={media.alt}
              />
            ) : (
              <img
                src={media.src}
                alt={media.alt}
                className="w-full h-full object-cover brightness-[0.38] contrast-[0.92] saturate-[0.72] transition-transform duration-[10000ms] transform-gpu will-change-transform"
                style={{ transform: activeMedia === index ? 'scale(1.05)' : 'scale(1)' }}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}
          </div>
        ))}
        {/* Black Glass Themed Filter */}
        <div className="absolute inset-0 z-[1] bg-black/88 md:bg-black/78 backdrop-blur-[8px] md:backdrop-blur-[5px] pointer-events-none"></div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/72 via-black/55 to-black/20 pointer-events-none"></div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#050505] via-black/60 to-black/65 pointer-events-none"></div>
        <div className="absolute inset-0 z-[1] bg-black/20 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 z-[1] gym-line-grid dark-precision-grid opacity-25 pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center py-10 md:py-0 flex items-center justify-center">
        <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col items-center justify-center -translate-y-4 rounded-[24px] bg-black/28 px-3 py-6 backdrop-blur-[2px] md:min-h-0 md:translate-y-0 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-0">
        <div className="inline-flex items-center justify-center gap-2 mb-3 md:mb-6 px-3 md:px-4 py-1.5 md:py-2 border border-gold/20 bg-black/50 backdrop-blur-md rounded-full shadow-lg animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          <span className="w-2 h-2 rounded-full bg-gold/80"></span>
          <span className="text-[11px] md:text-sm font-bold tracking-[0.22em] text-gold uppercase">Train Hard. Move Loud.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-3 md:mb-6 animate-fade-in-down" style={{ animationDelay: '0.3s' }}>
          <span className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-[0.14em] text-[#EAEAEA]">NOIZE</span>
          <span className="text-lg sm:text-2xl md:text-4xl font-light tracking-[0.14em] text-[#CCCCCC] uppercase">Fitness & Lifestyle</span>
        </div>
        <h1 className="max-w-5xl text-[2rem] sm:text-4xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-6 tracking-tight leading-[1.03] px-1 md:px-2 animate-fade-in-up drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]" style={{ animationDelay: '0.4s' }}>
          JUST BE <span className="text-gold">QUIET</span>,<br />
          LET THE RESULTS MAKE A <span className="text-gold" style={{ animationDelay: '0.2s' }}>NOIZE</span>
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-neutral-200 max-w-xl mx-auto mb-5 md:mb-10 font-light tracking-wide px-2 md:px-4 animate-fade-in opacity-95 drop-shadow-[0_6px_20px_rgba(0,0,0,0.8)]" style={{ animationDelay: '0.6s' }}>
          Premium Fitness • Real Transformations • Lifestyle Training
          <br />
          <span className="text-[11px] sm:text-sm mt-2 block text-neutral-300">Train in a high-energy, women-friendly, results-driven fitness environment.</span>
        </p>

        <div className="flex w-full max-w-xl flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 px-1 md:px-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          {/* Rectified: Opens Global Auth Flow */}
          <button
            onClick={onStart}
            className="gold-gradient text-black font-bold py-3 md:py-4 px-8 md:px-10 rounded-full text-sm md:text-base tracking-widest uppercase w-full sm:w-auto shadow-lg shadow-gold/20 hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)] hover:-translate-y-1 transition-all duration-300 text-center"
          >
            GET STARTED
          </button>
          <button
            onClick={() => handleWhatsApp("Hi, I'm interested in joining NOIZE Fitness & Lifestyle. Please share more details.")}
            className="glass shadow-lg border border-white/10 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded-full text-sm md:text-base tracking-widest uppercase w-full sm:w-auto flex items-center justify-center gap-3 hover:bg-white/5 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
          >
            <svg className="w-5 h-5 md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp Enquiry
          </button>
        </div>
        {heroMedia.length > 1 && (
          <div className="mt-10 flex justify-center gap-2" aria-label="Hero media selector">
            {heroMedia.map((media, index) => (
              <button
                key={media.src}
                type="button"
                onClick={() => setActiveMedia(index)}
                className={`h-1.5 rounded-full transition-all ${activeMedia === index ? 'w-10 bg-gold' : 'w-5 bg-white/30 hover:bg-white/60'}`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};

const TrainingBookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedType: string | null;
  trainingTypes: ReturnType<typeof buildTrainingTypes>;
}> = ({ isOpen, onClose, selectedType, trainingTypes }) => {
  const [step, setStep] = useState<'time' | 'form'>('time');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM'
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('time');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTime('');
      setStep('time');
      setFormData({ name: '', phone: '', email: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTypeObj = trainingTypes.find(t => t.id === selectedType);
    const message = `Hi, I'm interested in ${selectedTypeObj?.title}%0A%0APreferred Time: ${selectedTime}%0A%0AName: ${formData.name}%0APhone: ${formData.phone}%0AEmail: ${formData.email}%0A%0APlease share more details about this training option.`;

    handleWhatsApp(message);
    onClose();
  };

  if (!isOpen) return null;

  const currentType = trainingTypes.find(t => t.id === selectedType);

  return (
    <div
      className="fixed inset-0 z-[110] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
      style={{ WebkitOverflowScrolling: 'touch' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="fixed left-4 top-4 z-[111] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black"
        aria-label="Close booking modal"
      >
        <ModalBackIcon />
      </button>
      <div
        className="relative mx-auto my-16 w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto glass rounded-3xl border-2 border-gold/40 shadow-2xl shadow-gold/20 animate-fade-in-up"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-110 hover:rotate-90 duration-300 group shadow-lg"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-10">
          {step === 'time' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{currentType?.icon}</span>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white">
                    {currentType?.title}
                  </h3>
                  <p className="text-gold text-sm md:text-base font-bold">Select Your Preferred Time</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 md:p-4 rounded-2xl border-2 font-bold text-xs md:text-base transition-all hover:scale-105 ${selectedTime === time
                      ? 'border-gold bg-gold/10 text-gold shadow-lg shadow-gold/30'
                      : 'border-white/10 text-white hover:border-gold/50 hover:bg-gold/5'
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'form' && (
            <div>
              <button
                onClick={() => setStep('time')}
                className="text-neutral-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Change Time
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{currentType?.icon}</span>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white">
                    Complete Your Booking
                  </h3>
                  <p className="text-neutral-400 text-sm md:text-base">
                    {currentType?.title}
                  </p>
                  <p className="text-gold font-bold text-sm md:text-base">
                    Time: {selectedTime}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white font-bold mb-2 text-sm md:text-base">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2 text-sm md:text-base">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2 text-sm md:text-base">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full gold-gradient text-black font-black py-4 px-8 rounded-full text-base md:text-lg hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all flex items-center justify-center gap-3 group"
                >
                  Send Enquiry via WhatsApp
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TrainingTypes: React.FC<{ onTypeSelect: (typeId: string) => void; trainingTypes: ReturnType<typeof buildTrainingTypes> }> = ({ onTypeSelect, trainingTypes }) => {
  const navigate = useNavigate();
  const [slotModal, setSlotModal] = useState<'online' | 'home' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const TIME_SLOTS = {
    morning: [
      '5:30 AM - 6:30 AM',
      '6:30 AM - 7:30 AM',
      '7:30 AM - 8:30 AM',
    ],
    evening: [
      '5:30 PM - 6:30 PM',
      '6:30 PM - 7:30 PM',
      '7:30 PM - 8:30 PM',
    ],
  };

  const handleSlotModalOpen = (type: 'online' | 'home') => {
    setSelectedSlot('');
    setSlotModal(type);
  };

  const handleSlotConfirm = () => {
    if (!slotModal || !selectedSlot) return;

    const tabMap = { online: 'online', home: 'home_workout' } as const;
    const tab = tabMap[slotModal];
    sessionStorage.setItem('noize_selected_slot', selectedSlot);
    sessionStorage.setItem('noize_slot_type', slotModal);
    setSlotModal(null);
    setSelectedSlot('');
    navigate(`/portal?tab=${tab}`);
  };

  useEffect(() => {
    if (!slotModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSlotModal(null);
        setSelectedSlot('');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [slotModal]);

  return (
    <section id="training-types" className="py-10 md:py-24 relative overflow-hidden border-b border-[#C9A84C]/20">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/gallery-1.jpg"
          alt="Training Background"
          className="w-full h-full object-cover brightness-[0.2] blur-sm scale-110 transform-gpu"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/80 pointer-events-none"></div>
        <div className="absolute inset-0 gym-line-grid dark-precision-grid opacity-20 pointer-events-none"></div>
      </div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <h2 className="text-3xl md:text-5xl lg:text-5xl font-black mb-4 md:mb-6 tracking-tight">
            CHOOSE YOUR <span className="text-gold">TRAINING TYPE</span>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto font-light">
            Select the training style that fits your lifestyle and schedule
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {trainingTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => onTypeSelect(type.id)}
              className="glass mx-auto flex h-full min-h-[360px] md:min-h-[420px] w-full flex-col rounded-3xl border border-white/5 bg-[#121212]/80 p-5 md:p-6 transition-all duration-500 hover:-translate-y-2 hover:border-gold/30 hover:shadow-[0_12px_45px_rgba(229,192,123,0.15)] cursor-pointer group"
            >
              <div className="mx-auto mb-5 md:mb-8 w-fit rounded-2xl border border-white/10 bg-[#1a1a1a] p-3 md:p-4 transition-all duration-500 group-hover:border-gold/30 group-hover:bg-gold/10">
                {type.icon}
              </div>
              <h3 className="mb-3 text-center text-xl font-black tracking-wide text-white transition-colors duration-300 group-hover:text-gold md:text-2xl">
                {type.title}
              </h3>
              <p className="mb-6 flex-grow text-center text-sm font-light leading-relaxed text-neutral-400 md:text-base">
                {type.description}
              </p>
              <ul className="space-y-3 mb-8">
                {type.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-neutral-300 font-light">
                    <FeatureBulletIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  if (type.id === 'online') {
                    handleSlotModalOpen('online');
                    return;
                  }

                  if (type.id === 'home') {
                    handleSlotModalOpen('home');
                    return;
                  }

                  onTypeSelect('offline');
                }}
                className="w-full mt-auto bg-transparent border-2 border-gold/40 text-gold font-black py-4 px-6 rounded-full transition-all duration-300 uppercase tracking-widest text-sm hover:border-gold hover:bg-gold/10 hover:text-gold hover:shadow-[0_0_20px_rgba(229,192,123,0.25)] hover:-translate-y-0.5 active:scale-95"
              >
                Select Option
              </button>
            </div>
          ))}
        </div>

        {slotModal && (
          <div
            className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 px-4 backdrop-blur-md"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={() => {
              setSlotModal(null);
              setSelectedSlot('');
            }}
          >
            <button
              onClick={() => {
                setSlotModal(null);
                setSelectedSlot('');
              }}
              className="fixed left-4 top-4 z-[201] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black"
              aria-label="Close time slot modal"
            >
              <ModalBackIcon />
            </button>
            <div
              className="mx-auto my-16 w-full max-w-md overflow-y-auto glass rounded-[32px] border border-gold/20 p-8"
              style={{ WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100vh - 4rem)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold mb-2">
                {slotModal === 'online' ? 'Online Training' : 'Home Training'}
              </p>
              <h2 className="text-2xl font-black text-white mb-1">
                Choose Your Batch
              </h2>
              <p className="text-neutral-400 text-sm mb-8">
                Select a preferred time slot to continue
              </p>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-black text-gold">Morning Batch</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {TIME_SLOTS.morning.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${
                          selectedSlot === slot
                            ? 'gold-gradient text-black shadow-[0_0_20px_rgba(229,192,123,0.3)]'
                            : 'border border-white/10 bg-white/5 text-white hover:border-gold/40'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-black text-gold">Evening Batch</p>
                  <div className="flex flex-col gap-3 mb-8">
                    {TIME_SLOTS.evening.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${
                          selectedSlot === slot
                            ? 'gold-gradient text-black shadow-[0_0_20px_rgba(229,192,123,0.3)]'
                            : 'border border-white/10 bg-white/5 text-white hover:border-gold/40'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!selectedSlot}
                onClick={handleSlotConfirm}
                className="w-full gold-gradient text-black font-black py-4 rounded-full text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(229,192,123,0.4)] transition-all"
              >
                Confirm Slot & View Plans</button>

              <button
                onClick={() => { setSlotModal(null); setSelectedSlot(''); }}
                className="w-full mt-4 text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Module-level guard to prevent double-rotation in React Strict Mode during development
let offerRotatedInThisSession = false;

const SpecialOffers: React.FC<{ sectionContent: PortalContentSection; onUnlockExclusiveOffers: () => void }> = ({ sectionContent, onUnlockExclusiveOffers }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('festive_offers')
          .select('*')
          .eq('is_active', true)
          .gte('valid_till', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          const storageKey = 'noize_last_offer_index';
          const lastIndexStr = localStorage.getItem(storageKey);
          let currentIndex = 0;

          if (lastIndexStr !== null) {
            currentIndex = parseInt(lastIndexStr, 10);
          }

          // Only rotate once per page load/refresh
          if (!offerRotatedInThisSession) {
            const nextIndex = (currentIndex + 1) % data.length;
            setOffers([data[nextIndex]]);
            localStorage.setItem(storageKey, nextIndex.toString());
            offerRotatedInThisSession = true;
          } else {
            // If already rotated (e.g. Strict Mode second run), just show the current one
            setOffers([data[currentIndex % data.length]]);
          }
        } else {
          setOffers([]);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
    
    // Reset the guard when the component unmounts (optional, but good for HMR)
    return () => {
      // We don't reset it on unmount because a refresh is a full reload anyway.
      // But for HMR it might be better to stay true.
    };
  }, []);

  if (loading) {
    return null;
  }

  if (offers.length === 0) {
    return (
      <section id="offers" className="py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50"></div>
            <span className="text-gold font-bold text-sm uppercase tracking-[0.3em]">
              Festive Deals
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            FESTIVE / SEASONAL <span className="text-gold">OFFERS</span>
          </h2>
          <div className="mt-10 glass rounded-[32px] border border-white/10 p-12 md:p-16 flex flex-col items-center gap-5">
            <PartyPopper className="text-[#C9A84C] w-12 h-12" aria-hidden="true" />
            <h3 className="text-xl font-black text-white uppercase tracking-wide">
              No Ongoing Offers Right Now
            </h3>
            <p className="text-neutral-400 text-sm md:text-base max-w-md leading-relaxed">
              We're cooking up something special! Check back soon for
              exclusive festive and seasonal deals.
            </p>
            <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5">
              <span className="h-2 w-2 rounded-full bg-gold/60 animate-pulse"></span>
              <span className="text-gold text-xs font-black uppercase tracking-widest">
                New offers dropping soon
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/images/crossfit.jpg" alt="Offers Background" className="w-full h-full object-cover brightness-[0.2] blur-md scale-110 transform-gpu" />
        <div className="absolute inset-0 bg-black/80 pointer-events-none"></div>
      </div>
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="text-center mb-12 md:mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-gold/50"></div>
            <div className="flex items-center gap-2">
              <span className="text-gold font-bold text-sm uppercase tracking-[0.3em]">Festive Deals</span>
            </div>
            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-gold/50"></div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 text-white tracking-tight">
            FESTIVE / SEASONAL OFFERS
          </h2>
          <p className="text-neutral-400 text-base md:text-xl max-w-2xl mx-auto font-light">
            {sectionContent.description}
          </p>
          {sectionContent.features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {sectionContent.features.map((feature, index) => (
                <span key={`${feature}-${index}`} className="px-4 py-2 rounded-full glass border border-gold/20 text-xs md:text-sm text-neutral-200 uppercase tracking-wider">
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:gap-10 max-w-5xl mx-auto">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative glass rounded-3xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(229,192,123,0.15)] bg-[#121212]/90 backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                <div className="absolute top-6 -right-12 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-xs font-black px-16 py-2 shadow-2xl rotate-45 z-20 tracking-wider">
                  LIMITED OFFER
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-8 p-8 md:p-10 lg:p-12">
                  <div className="flex-1 lg:pr-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gold shadow-[0_0_10px_rgba(229,192,123,0.8)]"></span>
                      </span>
                      <span className="text-gold font-black text-sm uppercase tracking-[0.25em]">Exclusive Offer</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black text-white mb-5 group-hover:text-gold transition-colors duration-300 leading-[1.1]">
                      {offer.title}
                    </h3>
                    <p className="text-neutral-300 text-base md:text-lg leading-relaxed mb-6">
                      {offer.description}
                    </p>

                  </div>

                  <div className="lg:min-w-[340px] flex flex-col justify-center gap-6 lg:border-l lg:border-white/10 lg:pl-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gold/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-[#1A1A1A] rounded-2xl p-8 md:p-10 border border-gold/30 shadow-lg transform group-hover:scale-[1.02] transition-all duration-300">
                        <div className="text-center">
                          <p className="text-gold/80 text-xs font-bold uppercase tracking-wider mb-1">Special Price</p>
                          <p className="text-white font-black text-4xl md:text-5xl tracking-tight leading-none">
                            {offer.price_text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rectified Parallel WhatsApp */}
                    <button
                      onClick={() => handleWhatsApp(`Hi, I want to claim your offer and join the gym!\n\nOffer: ${offer.title}\nPrice: ${offer.price_text}\n\nPlease share more details.`)}
                      className="group/btn relative w-full bg-gold text-black font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-[0_8px_30px_rgba(229,192,123,0.3)] hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-3 overflow-hidden text-sm uppercase tracking-widest"
                    >
                      <span className="relative z-10 tracking-wide uppercase">Claim Now!</span>
                      <svg className="relative z-10 w-7 h-7 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                    <button
                      onClick={onUnlockExclusiveOffers}
                      className="mt-4 w-full rounded-full border border-gold/30 bg-gold/5 text-gold font-black py-3 px-6 text-xs uppercase tracking-widest hover:bg-gold/10 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Lock className="text-[#C9A84C] w-6 h-6" aria-hidden="true" />
                        Unlock Exclusive Mystery Offers
                      </span>
                    </button>
                  </div>
                </div>

                {/* T&C Notification */}
                <div className="px-8 pb-4 border-t border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold py-3 text-center">
                    * Terms & Conditions Apply
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BrandStory: React.FC = () => {
  const [activeMedia, setActiveMedia] = useState(0);
  const siteImages = useContext(SiteImagesContext);

  // Dynamic Gallery Constructor
  const customKeys = Object.keys(siteImages).filter(k => k.startsWith('gym_media_')).sort();
  const gymMedia = customKeys.length > 0
    ? customKeys.map(k => ({
      type: siteImages[k].startsWith('data:video/') ? 'video' : 'image',
      src: siteImages[k],
      alt: 'NOIZE Custom Gym Media'
    }))
    : GYM_MEDIA_DEFAULT;

  useEffect(() => {
    setActiveMedia(0);
  }, [gymMedia.length]);

  useEffect(() => {
    if (gymMedia.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveMedia((current) => (current + 1) % gymMedia.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [gymMedia.length]);

  const media = gymMedia[activeMedia];

  return (
    <section className="py-10 md:py-24 relative overflow-hidden border-b border-[#C9A84C]/20">
      <div className="absolute inset-0 z-0">
        <img src={siteImages['bg_philosophy'] || "/images/gallery-5.jpg"} alt="Brand Background" className="w-full h-full object-cover brightness-[0.2] blur-sm scale-110 transform-gpu" />
        <div className="absolute inset-0 bg-black/85 pointer-events-none"></div>
      </div>
      <div className="container mx-auto px-6 md:px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
        <div className="relative group">
          <div className="relative rounded-3xl overflow-hidden h-[340px] md:h-[540px] w-full border border-white/10 bg-[#121212] shadow-2xl">
            {media.type === 'video' ? (
              <video
                src={media.src}
                className="w-full h-full object-cover brightness-[0.78] saturate-[1.15]"
                muted
                loop
                playsInline
                preload="none"
                aria-label={media.alt}
              />
            ) : (
              <img
                src={media.src}
                alt={media.alt}
                className="w-full h-full object-cover brightness-[0.78] saturate-[1.12] animate-media-drift"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute top-4 left-4 flex gap-2">
              {gymMedia.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setActiveMedia(index)}
                  className={`h-1.5 rounded-full transition-all ${activeMedia === index ? 'w-9 bg-gold' : 'w-4 bg-white/35 hover:bg-white/70'}`}
                  aria-label={`Show element ${index}`}
                />
              ))}
            </div>
            <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-full border border-gold/20">
              <span className="text-gold text-xs font-black uppercase tracking-[0.22em]">Dynamic Gym Feed</span>
            </div>
          </div>
          <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 glass p-3 md:p-5 rounded-xl md:rounded-2xl max-w-[180px] md:max-w-[240px] transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 border border-gold/20 backdrop-blur-xl bg-gradient-to-br from-gold/20 to-transparent">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gold rounded-full blur opacity-50"></div>
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full gold-gradient flex items-center justify-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gold font-black text-xl md:text-2xl leading-none">90%</p>
                <p className="text-gold/80 font-bold text-[10px] md:text-xs uppercase tracking-wider">Success</p>
              </div>
            </div>
            <p className="text-neutral-200 text-[10px] md:text-xs leading-relaxed">Systematic training & diet for lifestyle changes.</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-8 leading-tight tracking-tight">THE NOIZE <br /><span className="text-gold">PHILOSOPHY</span></h2>
          <p className="text-neutral-400 text-base md:text-lg mb-6 md:mb-8 font-light leading-relaxed">
            Noize Fitness & Lifestyle is not just a gym, it's a movement. We blend bodybuilding, crossfit, and functional lifestyle training to create real transformations for every body type.
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {WHY_CHOOSE_US_ITEMS.map((item, idx) => (
              <div key={idx} className="glass flex min-h-[100px] md:min-h-[132px] flex-col gap-2 md:gap-3 rounded-2xl border border-white/5 p-3 md:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 active:border-[#C9A84C] active:shadow-[0_0_8px_rgba(201,168,76,0.4)]">
                <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl md:rounded-2xl bg-[#1a1a1a] text-[#C9A84C]">
                  {item.icon}
                </div>
                <h4 className="font-bold text-white text-sm md:text-base tracking-wide">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProgramsGrid: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeModalSlide, setActiveModalSlide] = useState(0);
  const siteImages = useContext(SiteImagesContext);

  const activeGallery = React.useMemo(() => {
    if (!selectedProgram) return null;
    const prefix = `program_${selectedProgram.id.toLowerCase()}_`;
    const customKeys = Object.keys(siteImages).filter(k => k.startsWith(prefix)).sort();
    return customKeys.length > 0 ? customKeys.map(k => siteImages[k]) : selectedProgram.gallery;
  }, [selectedProgram, siteImages]);

  useEffect(() => {
    if (selectedProgram) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProgram]);

  useEffect(() => {
    setActiveModalSlide(0);
    let timer: number;
    if (activeGallery && activeGallery.length > 1) {
      timer = window.setInterval(() => {
        setActiveModalSlide((prev) => (prev + 1) % activeGallery.length);
      }, 4000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [activeGallery]);

  return (
    <>
      <section id="programs" className="py-10 md:py-24 relative overflow-hidden border-b border-[#C9A84C]/20">
        <div className="absolute inset-0 z-0">
          <img src={siteImages['bg_programs'] || "/images/bodybuilding.jpg"} alt="Programs Background" className="w-full h-full object-cover brightness-[0.2] blur-md scale-110 transform-gpu" />
          <div className="absolute inset-0 bg-black/85 pointer-events-none"></div>
        </div>
        <div className="absolute inset-0 gym-line-grid opacity-10 z-0"></div>
        <div className="container mx-auto px-6 md:px-6 relative z-10">
          <div className="relative text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-gold/20 bg-[#111111] shadow-sm">
              <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">Strength. Sweat. Skill.</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 tracking-tight">TRAINING <span className="text-gold">UNIVERSE</span></h2>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto px-4 font-light">From high-intensity CrossFit to calming Yoga, we offer a diverse range of programs tailored for your goals. Click a program to learn more.</p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {PROGRAMS.map((program) => {
              const prefix = `program_${program.id.toLowerCase()}_`;
              const legacyKey = `program_${program.id.toLowerCase()}`;
              const customKeys = Object.keys(siteImages).filter(k => k.startsWith(prefix)).sort();
              const thumbnail = customKeys.length > 0 ? siteImages[customKeys[0]] : (siteImages[legacyKey] || program.imageUrl);

              return (
                <div
                  key={program.id}
                  onClick={() => setSelectedProgram(program)}
                  className="group glass rounded-3xl overflow-hidden border border-white/10 hover:border-gold/50 cursor-pointer hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(229,192,123,0.2)] transition-all duration-500 bg-[#121212]/90 flex flex-col h-full"
                >
                  <div className="h-52 md:h-48 relative overflow-hidden">
                    <img src={thumbnail} alt={program.title} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-gold/30">
                      <span className="text-gold text-[10px] font-bold uppercase tracking-widest">View Details</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-grow flex flex-col pointer-events-none">
                    <div className="text-gold mb-3 opacity-90 group-hover:opacity-100 transition-opacity">{program.icon}</div>
                    <h3 className="text-lg md:text-xl font-bold mb-3 tracking-wide group-hover:text-gold transition-colors">{program.title}</h3>
                    <p className="text-neutral-400 text-sm font-light leading-relaxed flex-grow">{program.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full-Screen Detailed Overlay */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 md:bg-black/80 backdrop-blur-xl animate-fade-in p-0 md:p-8"
          onClick={() => setSelectedProgram(null)}
        >
          <button
            onClick={() => setSelectedProgram(null)}
            className="absolute top-3 left-3 z-[110] flex min-h-11 min-w-11 items-center gap-2 rounded-full bg-black/60 px-3 text-white md:hidden"
            aria-label="Back"
          >
            <ModalBackIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <button
            onClick={() => setSelectedProgram(null)}
            className="absolute top-3 right-3 z-[110] flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-all duration-300 md:top-10 md:right-10 md:h-auto md:w-auto md:bg-white/5 md:p-4 md:hover:bg-gold md:hover:text-black shadow-2xl border border-white/10 md:hover:border-gold opacity-100 md:opacity-80 md:hover:opacity-100 group"
            aria-label="Close details"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[24px] md:rounded-[2rem] border border-white/5 bg-[#1a1a1a] md:bg-[#0E0E0E] shadow-[0_0_80px_rgba(229,192,123,0.15)] animate-fade-in-up md:h-[80vh] md:max-h-none md:flex-row pb-[env(safe-area-inset-bottom)] md:pb-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 max-h-56 w-full flex-none overflow-hidden rounded-t-[24px] bg-[#111111] md:h-full md:max-h-none md:w-1/2 md:rounded-none group">
              {activeGallery ? (
                activeGallery.map((imgSrc, slideIdx) => (
                  <img
                    key={slideIdx}
                    src={imgSrc}
                    alt={`${selectedProgram.title} slide ${slideIdx + 1}`}
                    className={`absolute inset-0 h-full w-full object-contain md:object-cover transition-opacity duration-1000 ${activeModalSlide === slideIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                  />
                ))
              ) : (
                <img
                  src={selectedProgram.imageUrl}
                  alt={selectedProgram.title}
                  className="h-full w-full object-contain md:object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/45 via-transparent to-transparent md:bg-gradient-to-r md:from-[#0E0E0E] md:via-[#0E0E0E]/40 md:to-transparent z-10"></div>
              <div className="absolute inset-0 border-r border-white/5 hidden md:block z-20"></div>

              {activeGallery && activeGallery.length > 1 && (
                <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                  {activeGallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveModalSlide(idx)}
                      className={`h-1.5 transition-all duration-300 rounded-full ${activeModalSlide === idx ? 'w-8 bg-gold' : 'w-3 bg-white/40 hover:bg-white/80'
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex w-full flex-1 flex-col overflow-y-auto p-4 md:w-1/2 md:justify-center md:p-16 [webkit-overflow-scrolling:touch]">
              <span className="mb-6 hidden h-14 w-14 text-gold opacity-90 md:block">{selectedProgram.icon}</span>
              <h3 className="mb-4 text-xl font-bold tracking-tight text-white md:mb-6 md:text-5xl lg:text-6xl md:font-black md:drop-shadow-md">
                {selectedProgram.title}
              </h3>
              <p className="mb-6 text-base font-light leading-relaxed text-neutral-300 md:mb-10 md:text-xl">
                {selectedProgram.description}
              </p>

              <div className="mb-6 space-y-0 md:mb-12">
                <div className="flex items-start gap-4 border-b border-white/5 py-4 text-neutral-400 md:pb-4 md:pt-0 font-light">
                  <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(229,192,123,0.8)]"></div>
                  <p className="tracking-wide">Deep, comprehensive routines tailored specifically to your goals.</p>
                </div>
                <div className="flex items-start gap-4 border-b border-white/5 py-4 text-neutral-400 font-light">
                  <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(229,192,123,0.8)]"></div>
                  <p className="tracking-wide">Interactive coaching led directly by certified Noize fitness professionals.</p>
                </div>
                <div className="flex items-start gap-4 border-b border-white/5 py-4 text-neutral-400 font-light">
                  <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(229,192,123,0.8)]"></div>
                  <p className="tracking-wide">Join a community focused on dynamic, lifestyle recovery and movement.</p>
                </div>
              </div>

              <div className="mt-auto sticky bottom-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-transparent pt-4 md:static md:bg-none md:pt-0">
                <button
                  onClick={() => handleWhatsApp(`Hi, I'm highly interested in joining the ${selectedProgram.title} program. Please share the details!`)}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-gold px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-400 hover:shadow-[0_0_40px_rgba(229,192,123,0.4)] md:w-auto"
                >
                  Enquire About {selectedProgram.title}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Membership: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MembershipCategory>('offline');
  const [slotModal, setSlotModal] = useState<'online' | 'home' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const TIME_SLOTS = {
    morning: ['5:30 AM – 6:30 AM', '6:30 AM – 7:30 AM', '7:30 AM – 8:30 AM'],
    evening: ['5:30 PM – 6:30 PM', '6:30 PM – 7:30 PM', '7:30 PM – 8:30 PM'],
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        if (data) setPlans(data);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section id="membership" className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-6">
          <div className="text-center text-neutral-400 py-12">Loading membership plans...</div>
        </div>
      </section>
    );
  }

  if (error || plans.length === 0) {
    return null;
  }

  const groupedPlans = MEMBERSHIP_SECTION_CONFIG.map((section) => ({
    ...section,
    content: PORTAL_CONTENT_DEFAULT_MAP[section.sectionKey],
    plans: plans.filter((plan) => normalizeMembershipCategory(plan.category) === section.category),
  })).filter((section) => section.plans.length > 0);
  const visiblePlans = groupedPlans.filter(
    section => section.category === activeCategory
  );

  return (
    <section id="membership" className="py-16 md:py-24">
      <div className="container relative z-[1] mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4">FLEXIBLE <span className="text-gold">PLANS</span></h2>
          <p className="text-neutral-400 text-sm md:text-base px-4">Maximum results with membership options for offline, online, and home workout goals.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <button
              onClick={() => setActiveCategory('offline')}
              className={`min-h-11 whitespace-nowrap rounded-full px-5 py-2 text-sm md:px-5 md:py-3 md:text-sm uppercase tracking-widest transition-all ${activeCategory === 'offline'
                ? 'gold-gradient text-black font-black'
                : 'border border-white/15 text-white bg-transparent'
              }`}
            >
              Offline
            </button>
            <button
              onClick={() => setActiveCategory('online')}
              className={`min-h-11 whitespace-nowrap rounded-full px-5 py-2 text-sm md:px-5 md:py-3 md:text-sm uppercase tracking-widest transition-all ${activeCategory === 'online'
                ? 'gold-gradient text-black font-black'
                : 'border border-white/15 text-white bg-transparent'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setActiveCategory('home_workout')}
              className={`min-h-11 whitespace-nowrap rounded-full px-5 py-2 text-sm md:px-5 md:py-3 md:text-sm uppercase tracking-widest transition-all ${activeCategory === 'home_workout'
                ? 'gold-gradient text-black font-black'
                : 'border border-white/15 text-white bg-transparent'
              }`}
            >
              Home Workout
            </button>
            <button
              onClick={() => window.location.href = '/portal'}
              className="w-full md:w-auto px-6 py-3.5 md:py-3 rounded-xl md:rounded-full gold-gradient text-black text-base md:text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              Membership Details
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {visiblePlans.map((section) => (
            <div key={section.category} id={`membership-${section.category}`} className="space-y-6 scroll-mt-32">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-2">Membership Type</p>
                  <h3 className="text-2xl md:text-4xl font-black text-white">{section.content.title}</h3>
                  <p className="text-neutral-400 text-sm md:text-base mt-2 max-w-2xl">{section.content.description}</p>
                </div>
                <button
                  onClick={() => window.location.href = '/portal'}
                  className="w-full md:w-auto py-3 px-7 rounded-full font-black text-xs md:text-sm gold-gradient text-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                >
                  View {section.content.title}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 overflow-x-hidden">
                {section.plans.map((plan) => (
                  <div key={plan.id} className={`relative flex w-full min-w-0 flex-col p-6 md:p-10 rounded-[24px] md:rounded-[32px] border ${plan.is_popular ? 'border-gold bg-gold/5' : 'border-white/10 glass'} transition-all hover:translate-y-[-10px] overflow-hidden`}>
                    {plan.is_popular && (
                      <span className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-black py-1.5 px-4 md:px-4 rounded-full uppercase tracking-widest">
                        Most Popular
                      </span>
                    )}
                    <h4 className="text-2xl md:text-2xl font-black mb-2">{plan.name}</h4>
                    <p className="text-gold text-sm md:text-sm font-bold mb-6 md:mb-6">{plan.tagline}</p>
                    <div className="mb-8 md:mb-8 flex flex-col gap-2">
                      <div className="text-4xl md:text-4xl font-black break-words">{'\u20B9'}{plan.price.toLocaleString()}<span className="text-sm font-light text-neutral-400">/-</span></div>
                      <p className="text-neutral-400 text-xs block">{plan.duration}</p>
                    </div>

                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-10 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 md:gap-3 text-neutral-300 text-xs md:text-sm min-w-0">
                          <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span className="block">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (plan.category === 'offline') {
                          window.location.href = '/portal';
                          return;
                        }

                        const tab = plan.category === 'online' ? 'online' : 'home_workout';
                        const saved = sessionStorage.getItem('noize_selected_slot');
                        if (saved) {
                          window.location.href = `/portal?tab=${tab}`;
                        } else {
                          setSlotModal(plan.category === 'online' ? 'online' : 'home');
                        }
                      }}
                      className={`w-full py-3 md:py-4 rounded-full font-black text-xs md:text-sm transition-all text-center block ${plan.is_popular ? 'gold-gradient text-black hover:shadow-lg' : 'glass text-white hover:bg-white/10'}`}
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {false && plans.map((plan) => (
            <div key={plan.id} className={`relative flex flex-col p-8 md:p-10 rounded-[24px] md:rounded-[32px] border ${plan.is_popular ? 'border-gold bg-gold/5' : 'border-white/10 glass'} transition-all hover:translate-y-[-10px]`}>
              {plan.is_popular && (
                <span className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-black py-1.5 px-4 md:px-4 rounded-full uppercase tracking-widest">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl md:text-2xl font-black mb-2">{plan.name}</h3>
              <p className="text-gold text-sm md:text-sm font-bold mb-6 md:mb-6">{plan.tagline}</p>
              <div className="text-4xl md:text-4xl font-black mb-8 md:mb-8">{'\u20B9'}{plan.price.toLocaleString()}<span className="text-sm font-light text-neutral-400">/-</span></div>
              <p className="text-neutral-400 text-xs mb-4">{plan.duration}</p>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 md:gap-3 text-neutral-300 text-xs md:text-sm">
                    <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => window.location.href = '/portal'}
                className={`w-full py-3 md:py-4 rounded-full font-black text-xs md:text-sm transition-all text-center block ${plan.is_popular ? 'gold-gradient text-black hover:shadow-lg' : 'glass text-white hover:bg-white/10'}`}
              >
                SELECT PLAN
              </button>
            </div>
          ))}
        </div>
      </div>

      {slotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div className="w-full max-w-md glass rounded-[32px] border border-gold/20 p-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gold mb-2">
              {slotModal === 'online' ? 'Online Training' : 'Home Training'}
            </p>
            <h2 className="text-2xl font-black text-white mb-1">
              Choose Your Batch
            </h2>
            <p className="text-neutral-400 text-sm mb-8">
              Select a preferred time slot to continue
            </p>

            <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-3">Morning Batch</p>
            <div className="flex flex-col gap-3 mb-6">
              {TIME_SLOTS.morning.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${selectedSlot === slot
                    ? 'gold-gradient text-black shadow-[0_0_20px_rgba(229,192,123,0.3)]'
                    : 'border border-white/10 bg-white/5 text-white hover:border-gold/40'
                    }`}
                >{slot}</button>
              ))}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-3">Evening Batch</p>
            <div className="flex flex-col gap-3 mb-8">
              {TIME_SLOTS.evening.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${selectedSlot === slot
                    ? 'gold-gradient text-black shadow-[0_0_20px_rgba(229,192,123,0.3)]'
                    : 'border border-white/10 bg-white/5 text-white hover:border-gold/40'
                    }`}
                >{slot}</button>
              ))}
            </div>

            <button
              disabled={!selectedSlot}
              onClick={() => {
                const tab = slotModal === 'online' ? 'online' : 'home_workout';
                sessionStorage.setItem('noize_selected_slot', selectedSlot);
                sessionStorage.setItem('noize_slot_type', slotModal === 'online' ? 'online' : 'home');
                setSlotModal(null);
                setSelectedSlot('');
                window.location.href = `/portal?tab=${tab}`;
              }}
              className="w-full gold-gradient text-black font-black py-4 rounded-full text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(229,192,123,0.4)] transition-all"
            >
              Confirm Slot & View Plans</button>

            <button
              onClick={() => { setSlotModal(null); setSelectedSlot(''); }}
              className="w-full mt-4 text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

const TransformationCard: React.FC<{ t: any, index: number }> = ({ t, index }) => {
  const [showAfter, setShowAfter] = useState(false);
  const siteImages = useContext(SiteImagesContext);

  const prefix = `transformation_${index + 1}_`;
  const legacyKey = `transformation_${index + 1}`;

  const customKeys = Object.keys(siteImages).filter(k => k.startsWith(prefix)).sort();

  const beforeImage = customKeys.length > 0 ? siteImages[customKeys[0]] : (siteImages[`${legacyKey}_before`] || siteImages[legacyKey] || t.beforeImg);
  const afterImage = customKeys.length > 1 ? siteImages[customKeys[1]] : (siteImages[`${legacyKey}_after`] || siteImages[legacyKey] || t.afterImg);

  useEffect(() => {
    if (beforeImage !== afterImage) {
      const interval = setInterval(() => setShowAfter(prev => !prev), 3500);
      return () => clearInterval(interval);
    }
  }, [beforeImage, afterImage]);

  return (
    <div className="glass rounded-[24px] md:rounded-[36px] overflow-hidden border border-white/10 shadow-2xl flex flex-col relative group">
      <div className="w-full relative bg-[#0a0a0a] flex items-center justify-center">

        {/* Before Image */}
        <img
          src={beforeImage}
          alt={`${t.name} Before`}
          className="w-full h-auto max-h-[600px] object-contain transition-opacity duration-1000 ease-in-out"
          style={{ opacity: showAfter ? 0 : 1 }}
          loading="lazy"
        />

        {/* After Image */}
        {beforeImage !== afterImage && (
          <img
            src={afterImage}
            alt={`${t.name} After`}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out"
            style={{ opacity: showAfter ? 1 : 0 }}
            loading="lazy"
          />
        )}

        {/* Automated Badge */}
        {beforeImage !== afterImage && (
          <div className="absolute top-6 right-6 z-20">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg transition-all duration-1000 ${showAfter ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,192,123,0.5)]' : 'glass text-white'}`}>
              {showAfter ? 'AFTER' : 'BEFORE'}
            </span>
          </div>
        )}
      </div>


    </div>
  );
};

const Transformations: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TRANSFORMATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="transformations" className="py-10 md:py-24 bg-[#050505] relative overflow-hidden border-b border-[#C9A84C]/20">
      <div className="absolute inset-0 gym-line-grid opacity-10"></div>
      <div className="container mx-auto px-6 md:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-gold/20 bg-[#111111] shadow-sm">
            <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">Real Results</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 tracking-tight">TRANSFORMATION <span className="text-gold">ZONE</span></h2>
          <p className="text-neutral-400 text-sm md:text-base px-4 font-light max-w-xl mx-auto">Real people. Real results. Check out the drastic changes achieved by trusting the Noize movement.</p>
        </div>

        <div className="max-w-4xl mx-auto relative group">
          <div className="overflow-hidden p-2">
            <div
              className="flex transition-transform duration-[1.2s] ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TRANSFORMATIONS.map((t, index) => (
                <div key={t.id} className="w-full flex-shrink-0 px-2 md:px-4">
                  <TransformationCard t={t} index={index} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8 relative z-20">
            {TRANSFORMATIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-10 h-1.5 bg-gold shadow-[0_0_10px_rgba(229,192,123,0.5)]' : 'w-2 h-1.5 bg-white/20 hover:bg-white/50'
                  }`}
                aria-label={`Show transformation ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const OnlineClasses: React.FC<{ sectionContent: PortalContentSection }> = ({ sectionContent }) => (
  <section id="online-classes" className="py-10 md:py-24 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 relative overflow-hidden border-b border-[#C9A84C]/20">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjksMTkyLDEyMywwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI2MAlSIIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

    <div className="container mx-auto px-6 md:px-6 relative z-10">
      <div className="text-center mb-10 md:mb-16">
        <div className="inline-flex items-center gap-2 mb-4 glass px-4 py-2 rounded-full border border-gold/20">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-gold font-bold text-sm uppercase tracking-wider">Live & On-Demand</span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-4 px-4">
          TRAIN FROM <span className="text-gold">ANYWHERE</span>
        </h2>
        <p className="text-base md:text-base px-6 max-w-2xl mx-auto text-neutral-300">
          {sectionContent.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-10 md:mb-16">
        <div
          onClick={() => window.location.href = '/portal'}
          className="glass rounded-[24px] p-6 md:p-8 border border-white/10 hover:border-gold/30 transition-all group hover:scale-105 duration-500 cursor-pointer"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full gold-gradient flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 text-white">Live Sessions</h3>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            {sectionContent.features[0] || 'Join interactive live classes with real-time feedback from certified trainers'}
          </p>
        </div>

        <div
          onClick={() => {
            smoothScrollToId('programs');
          }}
          className="glass rounded-[24px] p-6 md:p-8 border border-white/10 hover:border-gold/30 transition-all group hover:scale-105 duration-500 cursor-pointer"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full gold-gradient flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 text-white">All Programs</h3>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            {sectionContent.features[1] || 'Choose from Transformation, CrossFit, Zumba, Yoga & Functional Training'}
          </p>
        </div>
      </div>

      <div className="glass rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-gold/20 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3 bg-gold/10 px-3 py-1.5 rounded-full">
              <span className="text-gold text-xs md:text-sm font-bold uppercase tracking-wider">Included in Membership</span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-3 text-white">
              Get Access to <span className="text-gold">{sectionContent.title}</span>
            </h3>
            <p className="text-neutral-400 text-sm md:text-base mb-4 md:mb-0">
              {sectionContent.features[2] || 'Available with all membership plans - no extra charges'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => handleWhatsApp("Hi, I'm interested in joining NOIZE online classes. Please share more details about the schedule and how to get started.")}
              className="gold-gradient text-black font-black py-3 md:py-4 px-8 md:px-10 rounded-full text-base md:text-lg hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all inline-flex items-center gap-3 group"
            >
              <span>Start Online Training</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Gallery: React.FC = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  const siteImages = useContext(SiteImagesContext);

  const customImageKeys = Object.keys(siteImages).filter(k => k.startsWith('gallery_image_')).sort();
  const images = customImageKeys.length > 0
    ? customImageKeys.map(k => siteImages[k])
    : [
      '/images/gallery-1.jpg',
      '/images/gallery-2.jpg',
      '/images/gallery-3.jpg',
      '/images/gallery-4.jpg',
      '/images/gallery-5.jpg'
    ];

  const customVideoKeys = Object.keys(siteImages).filter(k => k.startsWith('gallery_video_')).sort();
  const videos = customVideoKeys.length > 0
    ? customVideoKeys.map(k => siteImages[k])
    : [
      '/images/gallery-6.mp4',
      '/images/gallery-7.mp4',
      '/images/gallery-8.mp4'
    ];

  const mediaWall = [
    ...images.map((src) => ({ type: 'image' as const, src })),
    ...videos.map((src) => ({ type: 'video' as const, src }))
  ];

  return (
    <section id="gallery" className="py-10 md:py-24 gym-surface relative overflow-hidden border-b border-[#C9A84C]/20">
      <div className="absolute inset-0 gym-line-grid opacity-25"></div>
      <div className="container mx-auto px-6 md:px-6">
        <div className="mb-16 md:mb-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-4">THE <span className="text-gold">VIBE</span></h2>
            <p className="text-base md:text-base px-6 text-neutral-300">Step inside the most premium fitness facility.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[210px] gap-3 md:gap-5 mb-10 md:mb-14">
            {mediaWall.map((item, i) => (
              <div
                key={`wall-${item.src}`}
                className={`relative overflow-hidden rounded-[18px] md:rounded-[24px] border border-white/10 bg-black group ${i === 0 || i === 5 ? 'md:row-span-2' : ''} ${i === 2 ? 'md:col-span-2' : ''}`}
              >
                {item.type === 'video' ? (
                  <video
                    ref={(el) => (videoRefs.current[i + 6] = el)}
                    src={item.src}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={`NOIZE media ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.18em]">
                    {item.type === 'video' ? 'Training Clip' : 'Gym Moment'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${item.type === 'video' ? 'bg-red-500 animate-pulse' : 'bg-gold'}`}></span>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden overflow-x-auto scrollbar-hide -mx-6 px-6">
            <div className="flex gap-4 pb-4">
              {images.map((img, i) => (
                <div key={`mobile-${i}`} className="flex-shrink-0 w-[80vw] aspect-square rounded-[20px] overflow-hidden glass">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block overflow-hidden relative">
            <div className="flex gap-6 animate-scroll-desktop">
              {[...images, ...images, ...images].map((img, i) => (
                <div key={`desktop-${i}`} className="flex-shrink-0 w-[280px] lg:w-[320px] aspect-square rounded-[24px] overflow-hidden glass group">
                  <img src={img} alt={`Gallery ${(i % images.length) + 1}`} className="w-full h-full object-cover transition-all duration-500 scale-100 group-hover:scale-110" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </div>
              <span className="text-gold font-bold text-xs md:text-sm uppercase tracking-wider">Live Training Sessions</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4">
              <span className="text-gold">ACTION</span> MOMENTS
            </h2>
            <p className="text-neutral-400 text-sm md:text-base px-4 max-w-2xl mx-auto">
              Experience the intensity, energy, and transformation happening every day at NOIZE.
            </p>
          </div>

          <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 pb-4">
              {videos.map((video, i) => (
                <div key={i} className="relative flex-shrink-0 w-[85vw] aspect-[9/16] rounded-[20px] overflow-hidden glass border border-white/10 group">
                  <video
                    ref={(el) => (videoRefs.current[i] = el)}
                    src={video}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Live Session</span>
                      </div>
                      <p className="text-white/80 text-xs">Swipe to see more â†’</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {videos.map((video, i) => (
              <div key={i} className="relative aspect-[9/16] rounded-[24px] overflow-hidden glass border border-white/10 group hover:border-gold/30 transition-all hover:scale-105 duration-500">
                <video
                  ref={(el) => (videoRefs.current[i + 3] = el)}
                  src={video}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-6 left-4 right-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-bold uppercase tracking-wider">Session {i + 1}</span>
                      </div>
                      <div className="glass px-3 py-1.5 rounded-full inline-flex items-center gap-2 w-fit">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-bold">LIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyChooseUs: React.FC = () => (
  <section className="py-10 md:py-24 border-b border-[#C9A84C]/20">
    <div className="container mx-auto px-4 md:px-6">
      <div className="glass p-6 md:p-12 rounded-[24px] md:rounded-[40px] border border-white/5 relative overflow-hidden bg-black/60">
        <div
          className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block z-0 mix-blend-screen opacity-90 animate-pulse"
          style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 65%)', maskImage: 'radial-gradient(circle at center, black 35%, transparent 65%)' }}
        >
          <img
            src="/images/back-muscle.png"
            alt="Noize Golden Muscle"
            className="w-[500px] h-[500px] object-cover"
            style={{ clipPath: 'inset(0 0 35% 0)' }}
          />
        </div>
        <div className="max-w-2xl relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6">WHY <span className="text-gold drop-shadow-md">NOIZE?</span></h2>
          <ul className="grid md:grid-cols-2 gap-4 md:gap-8 relative z-10">
            {[
              "Premium Brand Experience",
              "Safe & Comfortable for Women",
              "Real Transformations",
              "Diet + Workout Support",
              "Weekend Outdoor Activities",
              "Community Lifestyle",
              "Free Assessments",
              "Free Diet Plan"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 md:gap-4 group">
                <span className="w-7 h-7 md:w-8 md:h-8 rounded-full gold-gradient flex-shrink-0 flex items-center justify-center text-black text-xs font-bold">{i + 1}</span>
                <span className="text-neutral-300 text-sm md:text-base font-bold group-hover:text-gold transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const WeeklyHighlights: React.FC = () => {
  const siteImages = useContext(SiteImagesContext);
  return (
    <section className="py-10 md:py-24 bg-[#0A0A0A] border-b border-[#C9A84C]/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 uppercase">Weekly <span className="text-gold">Highlights</span></h2>
          <p className="text-neutral-400 text-sm md:text-base px-4">Our lifestyle goes beyond the weights.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {[
            {
              day: "MONDAY & FRIDAY",
              title: "ZUMBA PARTY",
              color: "from-pink-600/40",
              image: siteImages['highlight_1'] || "/images/zumba-yog.jpg",
              icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            },
            {
              day: "SATURDAY",
              title: "BADMINTON",
              color: "from-green-500/40",
              image: siteImages['highlight_2'] || "/images/gallery-2.jpg",
              icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            },
            {
              day: "SUNDAY",
              title: "RECOVERY",
              color: "from-blue-600/40",
              image: siteImages['highlight_3'] || "/images/gallery-4.jpg",
              icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          ].map((activity, idx) => (
            <div key={idx} className={`group relative glass rounded-[24px] md:rounded-[32px] border border-white/10 hover:border-white/30 overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 min-h-[220px] md:min-h-[280px] flex flex-col justify-end cursor-pointer`}>
              <div className="absolute inset-0 z-0 bg-[#0A0A0A]">
                <img src={activity.image} alt={activity.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} via-black/80 to-black mix-blend-overlay group-hover:opacity-80 transition-opacity`}></div>
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent`}></div>
              </div>

              <div className="relative z-10 p-6 md:p-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                <div className="mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all origin-left duration-500">
                  {activity.icon}
                </div>
                <span className="text-gold font-black text-xs md:text-sm tracking-[0.2em] uppercase block mb-1 drop-shadow-md">{activity.day}</span>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white group-hover:tracking-wider transition-all duration-300 drop-shadow-lg uppercase">{activity.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>(REVIEWS);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews(REVIEWS);
      }
    };

    fetchReviews();

    const channel = supabase.channel('public:reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="py-10 md:py-24 bg-gold/5 border-b border-[#C9A84C]/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4 glass px-4 py-2 rounded-full border border-gold/20">
            <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gold font-bold text-sm uppercase tracking-wider">100% Verified Reviews</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4">
            WHAT OUR <span className="text-gold">MEMBERS</span> SAY
          </h2>
          <p className="text-neutral-400 text-sm md:text-base px-4">Real results, real stories from our NOIZE community.</p>
        </div>

        <div className="relative overflow-hidden group py-4">
          {/* Gradient overlays to hide edges */}
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-[#121212] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none"></div>

          <div className="flex gap-4 md:gap-8 w-max animate-auto-scroll scrollbar-hide px-4 md:px-0 hover:[animation-play-state:paused]">
            {[...reviews, ...reviews].map((review, index) => (
              <div key={`${review.id || index}-${index}`} className="w-[280px] md:w-[400px] flex-shrink-0 glass p-5 md:p-8 rounded-[20px] md:rounded-[28px] border border-gold/20 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-3 md:mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 md:w-5 md:h-5 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-neutral-300 italic mb-4 md:mb-6 text-sm md:text-base">"{review.text}"</p>
                </div>
                <p className="text-gold font-black uppercase text-xs md:text-sm">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact: React.FC = () => (
  <section id="contact" className="py-10 md:py-24 bg-[#0A0A0A] border-b border-[#C9A84C]/20">
    <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 md:gap-16">
      <div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-8 tracking-tight">LET'S <span className="text-gold">TALK</span></h2>
        <p className="text-neutral-400 mb-6 md:mb-10 text-sm md:text-base lg:text-lg">Ready to start your transformation? Drop us a message or visit us in person. Our lifestyle consultants are ready to help you.</p>

        <div className="space-y-4 md:space-y-6">
          <a href="https://maps.app.goo.gl/2sPmY1cgU7zBWpIk9" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 md:gap-6 glass p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 hover:border-gold/30 transition-all group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full gold-gradient flex items-center justify-center text-black flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Our Location</p>
              <p className="text-white font-bold text-sm md:text-base group-hover:text-gold transition-colors">No 93/1d Selvanayaki Complex, Vilankurichi Road, Saravanampatti, Coimbatore, Tamil Nadu 641035</p>
            </div>
          </a>
          <a href="tel:+918296890693" className="flex items-center gap-4 md:gap-6 glass p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 hover:border-gold/30 transition-all group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full gold-gradient flex items-center justify-center text-black flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Phone Number</p>
              <p className="text-white font-bold text-sm md:text-base group-hover:text-gold transition-colors">+91 82968 90693 / 81223 90693</p>
            </div>
          </a>
        </div>
      </div>

      <div className="glass p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-white/5 shadow-2xl">
        <form className="space-y-4 md:space-y-6" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const message = `Hi! I'm ${formData.get('name')}\nPhone: ${formData.get('phone')}\nGoal: ${formData.get('goal')}\nMessage: ${formData.get('message')}`;
          handleWhatsApp(message);
        }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Name</label>
              <input name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-white text-sm md:text-base focus:outline-none focus:border-gold transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Phone</label>
              <input name="phone" type="tel" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-white text-sm md:text-base focus:outline-none focus:border-gold transition-all" placeholder="+91 1234567890" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Fitness Goal</label>
            <select name="goal" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-white text-sm md:text-base focus:outline-none focus:border-gold transition-all appearance-none">
              <option className="bg-[#1A1A1A]">Weight Loss</option>
              <option className="bg-[#1A1A1A]">Muscle Gain</option>
              <option className="bg-[#1A1A1A]">Lifestyle / Health</option>
              <option className="bg-[#1A1A1A]">CrossFit / Athlethic</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Message</label>
            <textarea name="message" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-white text-sm md:text-base focus:outline-none focus:border-gold transition-all h-24 md:h-32" placeholder="Tell us about your goals..."></textarea>
          </div>
          <button type="submit" className="w-full gold-gradient text-black font-black py-3 md:py-5 rounded-full text-base md:text-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            SUBMIT ENQUIRY
          </button>
        </form>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="py-8 pb-[calc(92px+env(safe-area-inset-bottom))] md:py-20 md:pb-20 border-t border-[#C9A84C]/20 relative overflow-hidden">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid md:grid-cols-4 gap-6 md:gap-12 mb-8 md:mb-20">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <img src="/images/logo.png" alt="NOIZE Fitness" className="h-8 md:h-14 w-auto" />
            <span className="text-xl md:text-4xl font-black tracking-tighter text-gold drop-shadow-[0_2px_8px_rgba(229,192,123,0.5)]">NOIZE</span>
          </div>
          <p className="text-neutral-500 text-xs md:text-base max-w-sm mb-4 md:mb-8 leading-relaxed">
            Revolutionizing the fitness industry with a lifestyle-first approach. Premium equipment, expert coaching, and a supportive community for all.
          </p>
          <div className="flex gap-2 md:gap-4">
            <a href="https://www.instagram.com/noize_fitness_/" target="_blank" rel="noopener noreferrer" className="flex min-h-11 min-w-11 w-11 h-11 md:w-10 md:h-10 rounded-full glass border border-white/10 items-center justify-center hover:border-gold hover:text-gold transition-all cursor-pointer">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@noizefitness/" target="_blank" rel="noopener noreferrer" className="flex min-h-11 min-w-11 w-11 h-11 md:w-10 md:h-10 rounded-full glass border border-white/10 items-center justify-center hover:border-gold hover:text-gold transition-all cursor-pointer">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs md:text-base mb-3 md:mb-6">QUICK LINKS</h4>
          <ul className="space-y-3 md:space-y-4 text-neutral-500 text-xs md:text-sm">
            <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#programs" className="hover:text-white transition-colors">Programs</a></li>
            <li><a href="/portal" className="hover:text-white transition-colors">Membership</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs md:text-base mb-3 md:mb-6">TIMINGS</h4>
          <ul className="space-y-3 md:space-y-4 text-neutral-500 text-xs md:text-sm">
            <li className="flex justify-between gap-2"><span>Mon - Sun:</span> <span className="text-neutral-300">5:30 AM - 10:00 PM</span></li>
            <li className="flex justify-between gap-2"><span>Festival Day:</span> <span className="text-neutral-300">Holiday</span></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center pt-6 md:pt-10 border-t border-white/5 text-[10px] md:text-xs font-bold text-neutral-600 tracking-widest text-center">
        <p className="px-4">{'\u00A9'} 2026 NOIZE FITNESS & LIFESTYLE. ALL RIGHTS RESERVED.</p>
      </div>

      <div className="text-center mt-4 md:mt-6 text-[10px] text-neutral-700">
        <p>Developed by <a href="https://pradhana.in" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-gold transition-colors">Pradhana.in</a></p>
      </div>
    </div>
  </footer>
);

type OfflineCustomerProfile = {
  fullName: string;
  age: string;
  dob: string;
  email: string;
  phoneNumber: string;
};

const OFFLINE_EMAIL_PENDING_KEY = 'noize_offline_email_pending';
const OFFLINE_PORTAL_CUSTOMER_KEY = 'noize_offline_portal_customer';
const OFFLINE_PORTAL_ACCESS_KEY = 'noize_offline_portal_access';
const OFFLINE_EMAIL_COOLDOWN_KEY = 'noize_offline_email_cooldown_until';
const OFFLINE_EMAIL_ERROR_KEY = 'noize_offline_email_error';

const OfflineLoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: OfflineCustomerProfile, repeatVisits: number) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<OfflineCustomerProfile>({
    fullName: '',
    age: '',
    dob: '',
    email: '',
    phoneNumber: ''
  });
  const [emailCode, setEmailCode] = useState('');
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [emailCooldownSeconds, setEmailCooldownSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const savedProfile = sessionStorage.getItem(OFFLINE_EMAIL_PENDING_KEY);
      const savedEmailError = sessionStorage.getItem(OFFLINE_EMAIL_ERROR_KEY);
      if (!savedProfile) {
        supabase.auth.clearEmailOtpSession();
        sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
      }
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile) as OfflineCustomerProfile;
          setFormData((current) => ({
            ...current,
            ...parsedProfile,
          }));
          setIsEmailCodeSent(true);
          setInfoMessage((current) => current || `Continue verifying ${parsedProfile.email.trim().toLowerCase()} to unlock the offline portal.`);
        } catch {
          sessionStorage.removeItem(OFFLINE_EMAIL_PENDING_KEY);
        }
      }
      if (savedEmailError) {
        setError(savedEmailError);
        sessionStorage.removeItem(OFFLINE_EMAIL_ERROR_KEY);
      }
    } else {
      document.body.style.overflow = 'unset';
      setFormData({
        fullName: '',
        age: '',
        dob: '',
        email: '',
        phoneNumber: ''
      });
      setEmailCode('');
      setIsEmailCodeSent(false);
      setIsEmailVerified(false);
      setError(null);
      setInfoMessage(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setEmailCooldownSeconds(0);
      return;
    }

    const getRemainingSeconds = () => {
      const cooldownUntil = Number(sessionStorage.getItem(OFFLINE_EMAIL_COOLDOWN_KEY) || '0');
      if (!cooldownUntil) return 0;
      return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    };

    setEmailCooldownSeconds(getRemainingSeconds());

    const interval = window.setInterval(() => {
      const remaining = getRemainingSeconds();
      setEmailCooldownSeconds(remaining);
      if (remaining <= 0) {
        sessionStorage.removeItem(OFFLINE_EMAIL_COOLDOWN_KEY);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isOpen]);

  const startEmailCooldown = () => {
    const cooldownUntil = Date.now() + 60_000;
    sessionStorage.setItem(OFFLINE_EMAIL_COOLDOWN_KEY, cooldownUntil.toString());
    setEmailCooldownSeconds(60);
  };

  const handleInputChange = (field: keyof OfflineCustomerProfile, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: field === 'email' ? value.trimStart() : value
    }));
  };

  const handleSendEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailCooldownSeconds > 0) {
      setError('Too many email requests. Please wait 1 minute and try again.');
      setInfoMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const email = formData.email.trim().toLowerCase();
      supabase.auth.clearEmailOtpSession();
      sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
      sessionStorage.setItem(
        OFFLINE_EMAIL_PENDING_KEY,
        JSON.stringify({
          ...formData,
          email,
        }),
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/?offlineEmail=1`,
        },
      });

      if (error) throw error;

      setIsEmailCodeSent(true);
      startEmailCooldown();
      setInfoMessage(`Verification OTP sent to ${email}. Enter the 6-digit code below to continue to the special offers portal.`);
    } catch (err: any) {
      const normalizedMessage = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
      if (normalizedMessage.includes('email rate limit exceeded') || normalizedMessage.includes('rate limit')) {
        startEmailCooldown();
        setError('Too many email requests. Please wait 1 minute and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const email = formData.email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: emailCode,
        type: 'email',
      });

      if (error) throw error;

      const memberKey = email;
      const localLoginKey = `noize_offline_login_${memberKey}`;
      const previousVisits = parseInt(localStorage.getItem(localLoginKey) || '0', 10);
      const repeatVisits = previousVisits + 1;
      localStorage.setItem(localLoginKey, repeatVisits.toString());

      try {
        await supabase.from('offline_members').upsert([{
          phone_number: memberKey,
          full_name: formData.fullName.trim(),
          age: Number(formData.age),
          dob: formData.dob,
          email,
          email_verified_at: new Date().toISOString(),
          login_count: repeatVisits,
          last_login_at: new Date().toISOString()
        }], { onConflict: 'phone_number' });
      } catch (persistError) {
        console.warn('Offline member persistence unavailable, continuing with local storage only.', persistError);
      }

      setIsEmailVerified(true);
      setIsEmailCodeSent(true);
      setInfoMessage(`Email ${email} verified. Opening the special offers portal now.`);
      sessionStorage.removeItem(OFFLINE_EMAIL_PENDING_KEY);
      sessionStorage.setItem(
        OFFLINE_PORTAL_ACCESS_KEY,
        JSON.stringify({
          email,
          verifiedAt: new Date().toISOString(),
        }),
      );

      onSuccess(
        {
          ...formData,
          email,
          phoneNumber: '',
        },
        repeatVisits
      );
    } catch (err: any) {
      const errorCode = typeof err?.code === 'string' ? err.code : '';

      if (errorCode === 'otp_invalid') {
        setError('Invalid OTP. Please try again.');
        setEmailCode('');
      } else if (errorCode === 'otp_expired') {
        supabase.auth.clearEmailOtpSession();
        sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
        setIsEmailCodeSent(false);
        setIsEmailVerified(false);
        setEmailCode('');
        sessionStorage.removeItem(OFFLINE_EMAIL_PENDING_KEY);
        setError('OTP expired. Resend OTP.');
      } else if (errorCode === 'otp_attempts_exceeded') {
        supabase.auth.clearEmailOtpSession();
        sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
        setIsEmailCodeSent(false);
        setIsEmailVerified(false);
        setEmailCode('');
        sessionStorage.removeItem(OFFLINE_EMAIL_PENDING_KEY);
        setError('Too many wrong attempts. Please request a new OTP.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-md glass rounded-[32px] border border-white/10 p-8 md:p-10 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Offline <span className="text-gold">Login Portal</span></h2>
          <p className="text-neutral-400 text-sm">Enter member details, verify your email OTP, then unlock the special offers portal.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl text-gold text-xs font-bold">
            {infoMessage}
          </div>
        )}

        {!isEmailCodeSent ? (
          <form onSubmit={handleSendEmailVerification} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-[0.2em] ml-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-[0.2em] ml-1">Age</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="100"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-[0.2em] ml-1">DOB</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-[0.2em] ml-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || emailCooldownSeconds > 0}
              className="w-full gold-gradient text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(229,192,123,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'SENDING...' : emailCooldownSeconds > 0 ? `Resend in ${emailCooldownSeconds}s` : 'SEND EMAIL OTP'}
            </button>
          </form>
        ) : !isEmailVerified ? (
          <form onSubmit={handleVerifyEmailCode} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-neutral-500 uppercase mb-2 tracking-[0.2em] ml-1">Email OTP</label>
              <input
                type="text"
                required
                pattern="[0-9]{6}"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all text-center text-2xl tracking-[0.5em] font-black"
                placeholder="000000"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
                Enter the 6-digit OTP sent to your email. After the OTP matches, you will continue to the special offers flow.
              </p>
              <button
                type="button"
                onClick={() => {
                  supabase.auth.clearEmailOtpSession();
                  sessionStorage.removeItem(OFFLINE_PORTAL_ACCESS_KEY);
                  setIsEmailCodeSent(false);
                  setIsEmailVerified(false);
                  setEmailCode('');
                  setInfoMessage(null);
                  sessionStorage.removeItem(OFFLINE_EMAIL_PENDING_KEY);
                }}
                className="text-xs text-gold font-bold mt-4 block mx-auto hover:underline"
              >
                Change Email Address?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(229,192,123,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'VERIFYING...' : 'VERIFY EMAIL OTP'}
            </button>
          </form>
        ) : null}

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest leading-relaxed">
            By continuing, you agree to our <br/>
            <span className="text-neutral-400">Terms of Service</span> & <span className="text-neutral-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const FloatingButtons: React.FC = () => (
  <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-4 z-[999] flex flex-col gap-3">
    <a
      href="tel:+918296890693"
      aria-label="Call us"
      className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-110 group md:h-14 md:w-14 md:shadow-2xl"
    >
      <Phone className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
    </a>
    <a
      href={`https://wa.me/${WHATSAPP_2}?text=${encodeURIComponent("Hi! I'm interested in NOIZE Fitness.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-110 group md:h-14 md:w-14 md:shadow-2xl"
      aria-label="Chat on WhatsApp"
    >
      <svg className="h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  </div>
);

const OffersListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  customerName: string;
  customerPhone: string;
  repeatVisits: number;
}> = ({ isOpen, onClose, onContinue, customerName, customerPhone, repeatVisits }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchOffers = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('offers')
            .select('*')
            .eq('is_active', true)
            .order('valid_till', { ascending: true })
            .gte('valid_till', new Date().toISOString().split('T')[0]);

          if (!error && data) {
            setOffers(data);
          }
        } catch (err) {
          console.error('Error fetching offers:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOffers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-2xl glass rounded-[40px] border-2 border-gold/40 p-8 md:p-12 animate-fade-in-up shadow-[0_0_100px_rgba(229,192,123,0.2)]" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gold font-bold animate-pulse">Loading your available offers...</p>
          </div>
        ) : offers.length > 0 ? (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Authenticated Offline Offers</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Welcome, <span className="text-gold">{customerName}</span>
              </h2>
              <p className="text-neutral-400 text-lg">
                {repeatVisits > 1
                  ? `Returning member login detected. This is visit ${repeatVisits}, so we are showing the latest active offers without creating duplicate customer records.`
                  : 'Your phone number is verified. Here are the active offers available for offline gym workouts.'}
              </p>
            </div>

            <div className="grid gap-4 mb-8 max-h-[50vh] overflow-y-auto pr-1">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white/5 border border-gold/20 rounded-3xl p-6 md:p-7">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-gold text-[10px] font-black uppercase tracking-[0.25em] mb-2">Limited Offer</p>
                      <h3 className="text-2xl font-black text-white mb-2">{offer.title}</h3>
                      <p className="text-neutral-300 mb-4">{offer.description}</p>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
                        Valid till {new Date(offer.valid_till).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <div className="text-3xl font-black text-gold mb-4">{offer.price_text}</div>
                      <button
                        onClick={() => handleWhatsApp(`Hi NOIZE Team! \uD83D\uDC4B\n\nI'd like to claim this exclusive offer:\n\n\uD83D\uDCCC Offer: ${offer.title}\n\uD83D\uDCB0 Price: \u20B9${offer.price_text}\n\n\uD83D\uDC64 Name: ${customerName}\n\uD83D\uDCE7 Email: ${customerName}\n\nPlease assist me. Thank you!`)}
                        className="gold-gradient text-black font-black py-3 px-6 rounded-full text-xs uppercase tracking-widest hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)] transition-all"
                      >
                        Claim Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onContinue}
                className="flex-1 gold-gradient text-black font-black py-4 px-8 rounded-full text-sm uppercase tracking-widest hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)] hover:-translate-y-1 transition-all"
              >
                Continue to Membership
              </button>
              <button
                onClick={onClose}
                className="flex-1 glass text-white font-black py-4 px-8 rounded-full text-sm uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all"
              >
                Close Offers
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-black mb-4">NO ACTIVE <span className="text-gold">OFFERS</span></h2>
            <p className="text-neutral-400 mb-8">Your login is verified. There are no live offers right now, so you can continue directly to membership plans.</p>
            <button
              onClick={onContinue}
              className="gold-gradient text-black font-black py-4 px-12 rounded-full text-sm uppercase tracking-widest hover:shadow-[0_8px_30px_rgba(229,192,123,0.4)] transition-all"
            >
              Continue to Membership
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [portalContent, setPortalContent] = useState<Record<string, PortalContentSection>>(PORTAL_CONTENT_DEFAULT_MAP);
  const [user, setUser] = useState<any>(null);
  
  // Modal Flow State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingType, setSelectedBookingType] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [slotModal, setSlotModal] = useState<'online' | 'home' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [offlineCustomer, setOfflineCustomer] = useState<OfflineCustomerProfile | null>(null);
  const [offlineRepeatVisits, setOfflineRepeatVisits] = useState(0);
  const trainingTypes = buildTrainingTypes(portalContent);
  const TIME_SLOTS = {
    morning: [
      '5:30 AM – 6:30 AM',
      '6:30 AM – 7:30 AM',
      '7:30 AM – 8:30 AM',
    ],
    evening: [
      '5:30 PM – 6:30 PM',
      '6:30 PM – 7:30 PM',
      '7:30 PM – 8:30 PM',
    ],
  };

  const handleGetStarted = () => {
    setIsOptionsModalOpen(true);
  };

  const openExclusiveMysteryOffers = () => {
    setPendingType('offline');
    setIsOptionsModalOpen(false);
    setIsBookingModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const openOfflineOffersPortal = (profile: OfflineCustomerProfile) => {
    sessionStorage.setItem(OFFLINE_PORTAL_CUSTOMER_KEY, JSON.stringify(profile));
    setIsOptionsModalOpen(false);
    setIsAuthModalOpen(false);
    setIsBookingModalOpen(false);
    navigate('/offline-offers');
  };

  const handleAuthSuccess = (profile: OfflineCustomerProfile, repeatVisits: number) => {
    setIsAuthModalOpen(false);
    setOfflineCustomer(profile);
    setOfflineRepeatVisits(repeatVisits);

    if (pendingType === 'offline') {
      setPendingType(null);
      openOfflineOffersPortal(profile);
      return;
    }

    setPendingType(null);
    setIsBookingModalOpen(true);
  };

  const handleOfflineEmailCallbackState = () => {
    const pendingProfile = sessionStorage.getItem(OFFLINE_EMAIL_PENDING_KEY);
    if (!pendingProfile) {
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(window.location.search);
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');
    const hasOfflineFlag = searchParams.get('offlineEmail') === '1';

    if (errorCode && hasOfflineFlag) {
      let nextError = decodeURIComponent(errorDescription || 'Email verification failed. Please request a new link.');
      if (errorCode === 'otp_expired') {
        nextError = 'This email verification link is invalid or expired. Please request a new link and use it within 1 minute.';
      }

      sessionStorage.setItem(OFFLINE_EMAIL_ERROR_KEY, nextError);
      setPendingType('offline');
      setIsAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (hasOfflineFlag) {
      setPendingType('offline');
      setIsAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleExclusiveOffersEntryState = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldOpenExclusiveOffers = searchParams.get('exclusiveOffers') === '1';

    if (!shouldOpenExclusiveOffers) {
      return;
    }

    setPendingType('offline');
    setIsOptionsModalOpen(false);
    setIsBookingModalOpen(false);
    setIsAuthModalOpen(true);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleOptionSelect = (typeId: string) => {
    setSelectedBookingType(typeId);
    setIsOptionsModalOpen(false);
    
    if (typeId === 'offline') {
      setIsBookingModalOpen(false);
      setPendingType('offline');
      setIsAuthModalOpen(true);
    } else if (typeId === 'online') {
      smoothScrollToId('online-classes');
    } else if (typeId === 'home') {
      smoothScrollToId('programs');
    } else {
      setIsBookingModalOpen(true);
    }
  };

  useEffect(() => {
    handleOfflineEmailCallbackState();
    handleExclusiveOffersEntryState();
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (slotModal) {
        setSlotModal(null);
        setSelectedSlot('');
        return;
      }

      if (isOptionsModalOpen) {
        setIsOptionsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOptionsModalOpen, slotModal]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('section_images').select('section_key, image_data');
      if (data) {
        const imageMap: Record<string, string> = {};
        data.forEach((img: any) => {
          imageMap[img.section_key] = img.image_data;
        });
        setSiteImages(imageMap);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const fetchPortalContent = async () => {
      const { data, error } = await supabase
        .from('portal_content')
        .select('section_key, title, description, features');

      if (error) {
        console.warn('portal_content table is unavailable. Falling back to default portal content.', error.message);
        setPortalContent(PORTAL_CONTENT_DEFAULT_MAP);
        return;
      }

      if (data && data.length > 0) {
        const nextPortalContent = { ...PORTAL_CONTENT_DEFAULT_MAP };
        data.forEach((section: PortalContent) => {
          nextPortalContent[section.section_key] = {
            section_key: section.section_key,
            title: section.title,
            description: section.description,
            features: Array.isArray(section.features) ? section.features : [],
          };
        });
        setPortalContent(nextPortalContent);
      } else {
        setPortalContent(PORTAL_CONTENT_DEFAULT_MAP);
      }
    };

    fetchPortalContent();

    const channel = supabase
      .channel('public:portal_content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_content' }, () => {
        fetchPortalContent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const stages = [
      { progress: 25, delay: 0 },
      { progress: 50, delay: 350 },
      { progress: 73, delay: 800 },
      { progress: 100, delay: 1250 }
    ];

    stages.forEach(({ progress, delay }) => {
      setTimeout(() => {
        setLoadingProgress(progress);
      }, delay);
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 1450);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8 animate-pulse">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl md:text-6xl font-black tracking-tighter text-white">NOIZE</span>
              <span className="w-3 h-3 rounded-full bg-gold"></span>
            </div>
            <p className="text-gold text-lg md:text-xl font-bold uppercase tracking-wider">Fitness & Lifestyle</p>
          </div>
          <div className="w-64 md:w-80 mx-auto">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="h-full gold-gradient transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-neutral-400 text-sm">Loading your experience... {Math.round(loadingProgress)}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SiteImagesContext.Provider value={siteImages}>
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar onJoinNow={handleGetStarted} />
        <main className="pb-[100px] md:pb-0">
          <Hero onStart={handleGetStarted} />
          <TrainingTypes onTypeSelect={handleOptionSelect} trainingTypes={trainingTypes} />
          <BrandStory />
          <ProgramsGrid />
          <WhyChooseUs />
          <Transformations />
          <OnlineClasses sectionContent={portalContent.online_workout} />
          <WeeklyHighlights />
          <Gallery />
          <Testimonials />
          <Contact />
        </main>
        <Footer />

        <FloatingButtons />

        <OfflineLoginModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        <TrainingBookingModal 
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          selectedType={selectedBookingType}
          trainingTypes={trainingTypes}
        />

        {/* Re-using Options Modal from Hero logic but controlled globally */}
        {isOptionsModalOpen && (
          <div
            className="fixed inset-0 z-[140] overflow-y-auto bg-black/90 p-4 backdrop-blur-xl animate-fade-in"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={() => setIsOptionsModalOpen(false)}
          >
            <button
              onClick={() => setIsOptionsModalOpen(false)}
              className="fixed left-4 top-4 z-[141] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black"
              aria-label="Close Get Started modal"
            >
              <ModalBackIcon />
            </button>
            <div className="relative mx-auto my-16 w-full max-w-5xl overflow-y-auto glass rounded-[40px] border border-white/10 p-8 md:p-12 animate-fade-in-up shadow-[0_0_100px_rgba(229,192,123,0.15)]" style={{ WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100vh - 4rem)' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="mb-6 flex min-h-11 min-w-11 items-center gap-2 rounded-full bg-[#0d0d0d] px-3 text-white font-medium md:hidden"
              >
                <ModalBackIcon className="w-4 h-4" />
                <span>&larr; Back</span>
              </button>

              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-black mb-4">CHOOSE YOUR <span className="text-gold">FITNESS PATH</span></h2>
                <p className="text-neutral-400 text-lg">Choose offline, online, or home workout to continue</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'offline',
                    title: portalContent.offline_workout.title,
                    description: portalContent.offline_workout.description,
                    icon: portalSectionIcons.offline_workout
                  },
                  {
                    id: 'online',
                    title: portalContent.online_workout.title,
                    description: portalContent.online_workout.description,
                    icon: portalSectionIcons.online_workout
                  },
                  {
                    id: 'home',
                    title: portalContent.home_workout.title,
                    description: portalContent.home_workout.description,
                    icon: portalSectionIcons.home_workout
                  }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      if (type.id === 'offline') {
                        setIsOptionsModalOpen(false);
                        setPendingType('offline');
                        setIsAuthModalOpen(true);
                        return;
                      }

                      setIsOptionsModalOpen(false);
                      setSelectedSlot('');
                      setSlotModal(type.id === 'online' ? 'online' : 'home');
                    }}
                    className="glass group mx-auto w-full rounded-3xl border border-white/5 p-6 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-gold/50 hover:shadow-[0_20px_50px_rgba(229,192,123,0.1)] flex flex-col items-center text-center"
                  >
                    <div className="mb-6 flex w-fit items-center justify-center rounded-2xl bg-[#1a1a1a] p-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-gold/10">
                      <span className="text-gold transform scale-125">{type.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-gold transition-colors">{type.title}</h3>
                    <p className="text-neutral-500 text-sm mb-6 leading-relaxed">{type.description}</p>
                    <span className="gold-gradient text-black text-xs font-black py-3 px-8 rounded-full opacity-100 md:opacity-90 md:group-hover:opacity-100 transition-all duration-500 tracking-widest">
                      GET STARTED
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {slotModal && (
          <div
            className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 px-4 backdrop-blur-md"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={() => {
              setSlotModal(null);
              setSelectedSlot('');
            }}
          >
            <button
              onClick={() => {
                setSlotModal(null);
                setSelectedSlot('');
              }}
              className="fixed left-4 top-4 z-[201] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black"
              aria-label="Close slot selection modal"
            >
              <ModalBackIcon />
            </button>
            <div
              className="mx-auto my-16 w-full max-w-md overflow-y-auto glass rounded-[32px] border border-gold/20 p-8"
              style={{ WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100vh - 4rem)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold mb-2">
                {slotModal === 'online' ? '🖥 Online Training' : '🏠 Home Training'}
              </p>
              <h2 className="text-2xl font-black text-white mb-1">
                Choose Your Batch
              </h2>
              <p className="text-neutral-400 text-sm mb-8">
                Select a preferred time slot to continue to membership
              </p>

              <p className="text-[10px] font-black uppercase tracking-widest text-gold/70 mb-3">Morning Batch</p>
              <div className="flex flex-col gap-3 mb-6">
                {TIME_SLOTS.morning.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${selectedSlot === slot
                      ? 'gold-gradient text-black shadow-[0_0_20px_rgba(229,192,123,0.3)]'
                      : 'border border-white/10 bg-white/5 text-white hover:border-gold/40'
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-gold/70 mb-3">Evening Batch</p>
              <div className="flex flex-col gap-3 mb-8">
                {TIME_SLOTS.evening.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${selectedSlot === slot
                      ? 'gold-gradient text-black shadow-[0_0_20px_rgba(229,192,123,0.3)]'
                      : 'border border-white/10 bg-white/5 text-white hover:border-gold/40'
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedSlot}
                onClick={() => {
                  const tab = slotModal === 'online' ? 'online' : 'home_workout';
                  sessionStorage.setItem('noize_selected_slot', selectedSlot);
                  sessionStorage.setItem('noize_slot_type', slotModal);
                  setSlotModal(null);
                  setSelectedSlot('');
                  window.location.href = `/portal?tab=${tab}`;
                }}
                className="w-full gold-gradient text-black font-black py-4 rounded-full text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(229,192,123,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Slot & View Plans</button>

              <button
                onClick={() => {
                  setSlotModal(null);
                  setSelectedSlot('');
                }}
                className="w-full mt-4 text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                ← Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </SiteImagesContext.Provider>
  );
};

export default App;




