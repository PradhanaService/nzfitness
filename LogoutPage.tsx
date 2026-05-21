import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const OFFLINE_EMAIL_PENDING_KEY = 'noize_offline_email_pending';
const OFFLINE_PORTAL_CUSTOMER_KEY = 'noize_offline_portal_customer';
const OFFLINE_EMAIL_COOLDOWN_KEY = 'noize_offline_email_cooldown_until';
const OFFLINE_EMAIL_ERROR_KEY = 'noize_offline_email_error';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      sessionStorage.removeItem(OFFLINE_EMAIL_PENDING_KEY);
      sessionStorage.removeItem(OFFLINE_PORTAL_CUSTOMER_KEY);
      sessionStorage.removeItem(OFFLINE_EMAIL_COOLDOWN_KEY);
      sessionStorage.removeItem(OFFLINE_EMAIL_ERROR_KEY);
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    };

    void logout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white md:px-8 md:py-12">
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
        <div className="glass w-full rounded-[32px] border border-gold/20 p-10 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-gold">Logging Out</p>
          <h1 className="mb-3 text-3xl font-black text-white">Returning To Home</h1>
          <p className="text-neutral-400">Clearing your session and taking you back to the homepage.</p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
