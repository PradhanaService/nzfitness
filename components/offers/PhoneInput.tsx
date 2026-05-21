'use client';

import { FormEvent } from 'react';

interface PhoneInputProps {
  value: string;
  error: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
}

export default function PhoneInput({
  value,
  error,
  loading,
  onChange,
  onSubmit,
}: PhoneInputProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <label className="block text-left">
        <span className="mb-2 block text-sm font-medium text-white/70">Email Address</span>
        <div className="rounded-full border border-white/60 bg-[#111111] px-5 py-4">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Your email ID"
            className="w-full bg-transparent text-lg text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-white px-6 py-4 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending OTP...' : 'Send OTP ->'}
      </button>
    </form>
  );
}
