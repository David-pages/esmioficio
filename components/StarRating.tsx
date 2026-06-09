import React from 'react';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  sizeClass?: string;
  showValue?: boolean;
  showReviews?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviews,
  sizeClass = 'text-sm',
  showValue = true,
  showReviews = true
}) => {
  const safeRating = Math.max(0, Math.min(5, rating || 0));
  const label = `${safeRating.toFixed(1)} de 5`;
  const stars = Array.from({ length: 5 }, (_, index) => Math.max(0, Math.min(1, safeRating - index)));

  return (
    <span className="inline-flex items-center gap-1" aria-label={label} title={label}>
      <span className={`inline-flex items-center gap-0.5 ${sizeClass}`} aria-hidden="true">
        {stars.map((fill, index) => {
          if (fill >= 0.95) {
            return <span key={index} className="inline-block leading-none">⭐</span>;
          }

          if (fill <= 0.05) {
            return <span key={index} className="inline-block leading-none text-gray-600">☆</span>;
          }

          return (
            <span key={index} className="relative inline-block w-[1em] leading-none">
              <span className="inline-block text-gray-600">☆</span>
              <span
                className="absolute left-0 top-0 inline-block overflow-hidden whitespace-nowrap leading-none"
                style={{ width: `${fill * 100}%` }}
              >
                <span className="inline-block w-[1em] leading-none">⭐</span>
              </span>
            </span>
          );
        })}
      </span>
      {showValue && <span className="text-white font-bold">{safeRating.toFixed(1)}</span>}
      {showReviews && typeof reviews === 'number' && (
        <span className="text-gray-500">({reviews})</span>
      )}
    </span>
  );
};

export default StarRating;
