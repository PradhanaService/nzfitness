'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OfferCard from '@/components/offers/OfferCard';
import { offerStore } from '@/lib/offerStore';
import { supabase } from '@/supabaseClient';
import { Offer } from '@/types/offers';

const TOTAL_OFFERS = 4;

export default function OffersPortalPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const storedVerified = offerStore.isVerified();
      const storedContact = offerStore.getContact();
      const savedIndex = offerStore.getOfferIndex();

      if (!storedVerified) {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;

        if (!sessionUser) {
          router.replace('/offers');
          return;
        }

        offerStore.setVerified(true);
        offerStore.setContact(sessionUser.email ?? storedContact);
      }

      setContact(offerStore.getContact());
      setCurrentIndex(savedIndex);

      const { data, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true })
        .limit(TOTAL_OFFERS);

      if (offersError) {
        setError('Unable to load offers right now.');
        setLoading(false);
        return;
      }

      setOffers((data ?? []) as Offer[]);
      setLoading(false);
      requestAnimationFrame(() => setIsVisible(true));
    };

    void bootstrap();
  }, [router]);

  useEffect(() => {
    if (!loading && offers.length > 0 && currentIndex >= offers.length) {
      router.replace('/membership');
    }
  }, [currentIndex, loading, offers.length, router]);

  const advanceOffer = () => {
    const nextIndex = currentIndex + 1;
    offerStore.setOfferIndex(nextIndex);

    if (nextIndex >= offers.length || nextIndex >= TOTAL_OFFERS) {
      router.push('/membership');
      return;
    }

    setIsVisible(false);
    window.setTimeout(() => {
      setCurrentIndex(nextIndex);
      setFlashMessage('');
      requestAnimationFrame(() => setIsVisible(true));
    }, 180);
  };

  const saveClaim = async (payload: { claimed?: boolean; skipped?: boolean }) => {
    const offer = offers[currentIndex];
    if (!offer || !contact) return;

    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('offer_claims').insert({
      phone: contact,
      offer_id: offer.id,
      claimed: payload.claimed ?? false,
      skipped: payload.skipped ?? false,
    });

    setSubmitting(false);

    if (insertError) {
      setError('We could not save your response. Please try again.');
      return;
    }

    if (payload.claimed) {
      setFlashMessage('Offer claimed!');
      window.setTimeout(() => {
        advanceOffer();
      }, 1000);
      return;
    }

    advanceOffer();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">
        <p className="text-sm text-white/65">Loading your offers...</p>
      </main>
    );
  }

  if (error && offers.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">
        <div className="max-w-sm text-center">
          <p className="text-base text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  const activeOffer = offers[currentIndex];

  if (!activeOffer) {
    return null;
  }

  return (
    <div
      className="transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      }}
    >
      <OfferCard
        offer={activeOffer}
        currentIndex={currentIndex}
        totalOffers={Math.min(offers.length, TOTAL_OFFERS)}
        onClaim={() => {
          void saveClaim({ claimed: true });
        }}
        onSkip={() => {
          void saveClaim({ skipped: true });
        }}
        isSubmitting={submitting}
        flashMessage={flashMessage || error}
      />
    </div>
  );
}
