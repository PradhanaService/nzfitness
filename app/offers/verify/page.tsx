'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput from '@/components/offers/OtpInput';
import { offerStore } from '@/lib/offerStore';

const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 5;

export default function OffersVerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [contact, setContact] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const savedContact = offerStore.getContact();
    if (!savedContact) {
      router.replace('/offers');
      return;
    }

    setContact(savedContact);
  }, [router]);

  useEffect(() => {
    if (timer <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setTimer((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [timer]);

  const attemptsUsed = useMemo(() => MAX_ATTEMPTS - attemptsLeft, [attemptsLeft]);

  const handleVerify = async () => {
    if (!contact) return;

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact, token: otp }),
      });
      const data = await res.json();

      if (data.success) {
        offerStore.setVerified(true);
        offerStore.setOfferIndex(0);
        router.push('/offers/portal');
        return;
      }

      if (data.code === 'otp_expired') {
        setError('OTP expired. Please resend.');
        return;
      }

      if (data.code === 'otp_attempts_exceeded') {
        setBlocked(true);
        return;
      }

      if (data.code === 'email_already_used') {
        setError('This email is already verified.');
        return;
      }

      if (data.code === 'otp_invalid') {
        const nextAttempts = data.attempts_left ?? attemptsLeft - 1;
        setAttemptsLeft(nextAttempts);
        if (nextAttempts <= 0) {
          setBlocked(true);
          return;
        }
        setError(`Wrong OTP. ${nextAttempts} attempts left.`);
        return;
      }

      setError(data.error || 'Verification failed.');
    } catch {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!contact) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to resend OTP.');
        return;
      }

      setAttemptsLeft(MAX_ATTEMPTS);
      setBlocked(false);
      setTimer(RESEND_SECONDS);
    } catch {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-10 text-white">
        <div className="max-w-sm text-center">
          <h1 className="text-3xl font-semibold">Too many wrong attempts.</h1>
          <p className="mt-4 text-base leading-7 text-white/65">Please contact the gym desk.</p>
          <Link
            href="/membership"
            className="mt-10 inline-flex rounded-full bg-white px-6 py-4 text-base font-semibold text-black"
          >
            Go to Membership
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-12 self-start text-sm font-medium text-white/70"
        >
          {'<- Back'}
        </button>

        <div className="flex flex-1 flex-col justify-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Enter your OTP</h1>
          <p className="mt-4 break-all text-base leading-7 text-white/65">Sent to {contact || 'your email ID'}</p>

          <div className="mt-10">
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (error) setError('');
              }}
            />
          </div>

          {error ? <p className="mt-5 text-sm text-red-400">{error}</p> : null}

          {attemptsUsed > 0 && attemptsLeft > 0 ? (
            <p className="mt-4 text-sm text-white/50">{attemptsLeft} of {MAX_ATTEMPTS} attempts remaining</p>
          ) : null}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="mt-8 w-full rounded-full bg-white px-6 py-4 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP ->'}
          </button>

          <div className="mt-6 space-y-3 text-sm">
            {timer > 0 ? (
              <p className="text-white/50">Resend OTP in {timer}s</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-white underline underline-offset-4 disabled:opacity-60"
              >
                Resend OTP
              </button>
            )}
            <p className="text-white/40">Check your inbox for the 6-digit code and enter it here.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
