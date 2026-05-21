'use client';

interface OfferProgressProps {
  total: number;
  current: number;
}

export default function OfferProgress({ total, current }: OfferProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;

        return (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              isActive ? 'bg-white' : 'bg-white/30'
            }`}
          />
        );
      })}
    </div>
  );
}
