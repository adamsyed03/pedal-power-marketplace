import { Star } from 'lucide-react';

export function ProductRatingStars({ rating, className = 'size-4' }: { rating: number; className?: string }) {
  const fillWidth = `${Math.max(0, Math.min(100, (rating / 5) * 100))}%`;

  return (
    <span className="relative inline-flex" role="img" aria-label={`${rating} / 5`}>
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`${className} fill-black/10 stroke-black/25`} />)}
      </span>
      <span className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden" style={{ width: fillWidth }} aria-hidden="true">
        <span className="flex w-max gap-1">
          {Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`${className} fill-[#7fff00] stroke-black`} />)}
        </span>
      </span>
    </span>
  );
}
