import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Footer, SpecialOffers, OfflineLoginModal } from './App';

const OFFLINE_PORTAL_CUSTOMER_KEY = 'noize_offline_customer';

const PublicOffersPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAuthSuccess = (profile: any, repeatVisits: number) => {
    setIsAuthModalOpen(false);
    sessionStorage.setItem(OFFLINE_PORTAL_CUSTOMER_KEY, JSON.stringify(profile));
    navigate('/offline-offers');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar onJoinNow={() => window.location.href = '/#contact'} />
      
      <main className="flex-1 pt-24 pb-[100px] md:pb-0">
        <div className="container mx-auto px-4 md:px-6 pt-8 relative z-20">
          <button 
            onClick={() => navigate('/')} 
            className="group inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-black hover:shadow-[0_0_15px_rgba(201,168,76,0.4)]"
            aria-label="Back to home"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1 text-sm font-black">←</span>
            <span>Back to Home</span>
          </button>
        </div>
        <SpecialOffers 
          sectionContent={{ 
            section_key: 'special_offers',
            title: 'Offers', 
            description: 'Exclusive seasonal deals for our members.', 
            features: [] 
          } as any} 
          onUnlockExclusiveOffers={() => setIsAuthModalOpen(true)} 
        />
      </main>

      <Footer />

      <OfflineLoginModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default PublicOffersPage;
