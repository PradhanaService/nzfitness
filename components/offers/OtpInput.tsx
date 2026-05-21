'use client';

import { ClipboardEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
}

const OTP_LENGTH = 6;

export default function OtpInput({ value, onChange }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? ''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');
    setDigits(nextDigits);
  }, [value]);

  const combinedValue = useMemo(() => digits.join(''), [digits]);

  useEffect(() => {
    if (combinedValue !== value) {
      onChange(combinedValue);
    }
  }, [combinedValue, onChange, value]);

  const updateDigits = (nextDigits: string[]) => {
    setDigits(nextDigits);
    onChange(nextDigits.join(''));
  };

  const handleDigitChange = (index: number, rawValue: string) => {
    const nextValue = rawValue.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    updateDigits(nextDigits);

    if (nextValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] ?? '');
    updateDigits(nextDigits);

    const focusIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          onChange={(event) => handleDigitChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="h-[60px] w-[52px] rounded-2xl border border-white bg-[#111111] text-center text-2xl font-semibold text-white focus:border-white focus:outline-none"
        />
      ))}
    </div>
  );
}
