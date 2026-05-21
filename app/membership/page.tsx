'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { offerStore } from '@/lib/offerStore';

export default function MembershipPage() {
  useEffect(() => {
    offerStore.clear();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-semibold tracking-tight">You&apos;re all set!</h1>
        <p className="mt-4 text-base leading-7 text-white/70">Check your offers at the front desk.</p>
        <p className="mt-2 text-base leading-7 text-white/55">Explore our membership plans below</p>

        <Link
          href="/#membership"
          className="mt-10 inline-flex rounded-full bg-white px-6 py-4 text-base font-semibold text-black"
        >
          {'View Memberships ->'}
        </Link>
      </div>
    </main>
  );
}
