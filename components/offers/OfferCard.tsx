'use client';

import OfferProgress from '@/components/offers/OfferProgress';
import { Offer } from '@/types/offers';

interface OfferCardProps {
  offer: Offer;
  currentIndex: number;
  totalOffers: number;
  onClaim: () => void;
  onSkip: () => void;
  isSubmitting?: boolean;
  flashMessage?: string;
}

export default function OfferCard({
  offer,
  currentIndex,
  totalOffers,
  onClaim,
  onSkip,
  isSubmitting = false,
  flashMessage,
}: OfferCardProps) {
  const isLastOffer = currentIndex === totalOffers - 1;

  return (
    <div
      className="flex min-h-screen w-full flex-col justify-between px-6 py-8 transition-all duration-300"
      style={{ backgroundColor: offer.bg_color, color: offer.text_color || '#ffffff' }}
    >
      <div className="flex items-center justify-between text-sm font-medium">
        <p className="opacity-60">
          Offer {Math.min(currentIndex + 1, totalOffers)} of {totalOffers}
        </p>
        <OfferProgress total={totalOffers} current={currentIndex} />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.24em]">
          {offer.badge}
        </span>
        <h1 className="mt-6 text-[clamp(64px,12vw,140px)] font-black leading-none">{offer.discount}</h1>
        <h2 className="mt-5 text-2xl font-normal opacity-90">{offer.title}</h2>
        {offer.description ? (
          <p className="mt-4 max-w-[400px] text-sm leading-6 opacity-70">{offer.description}</p>
        ) : null}
        {flashMessage ? <p className="mt-6 text-sm font-semibold">{flashMessage}</p> : null}
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
        <button
          type="button"
          onClick={onClaim}
          disabled={isSubmitting}
          className="w-full rounded-full bg-white px-6 py-4 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Claim This Offer
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="text-sm font-medium text-current opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
        >
          {isLastOffer ? 'No thanks, go to Membership ->' : 'Skip ->'}
        </button>
      </div>
    </div>
  );
}
