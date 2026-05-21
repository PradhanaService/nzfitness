'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/offers/PhoneInput';
import { offerStore } from '@/lib/offerStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OffersEntryPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to send OTP. Try again.');
        return;
      }

      offerStore.setContact(normalizedEmail);
      offerStore.setVerified(false);
      offerStore.setOfferIndex(0);
      router.push('/offers/verify');
    } catch {
      setError('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-white/70">NOIZE</p>
        <h1 className="text-4xl font-semibold tracking-tight">Exclusive Member Offers</h1>
        <p className="mt-4 text-base leading-7 text-white/65">Enter your email ID to unlock your offers</p>

        <div className="mt-10">
          <PhoneInput
            value={email}
            error={error}
            loading={loading}
            onChange={(value) => {
              setEmail(value);
              if (error) setError('');
            }}
            onSubmit={handleSubmit}
          />
        </div>

        <p className="mt-5 text-sm text-white/45">4 exclusive offers waiting for you</p>
      </div>
    </main>
  );
}
