import { Star } from "lucide-react";

export default function Rating({ value }: { value?: number }) {
  const rating = Number.isFinite(value) ? Math.max(0, Math.min(5, value!)) : 0;
  return (
    <div
      className="product-rating"
      aria-label={
        rating
          ? `Demo rating: ${rating.toFixed(1)} out of 5 stars`
          : "Not rated yet"
      }
    >
      <span className="rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className="rating-star" key={index}>
            <Star size={14} />
            <span
              className="star-fill"
              style={{
                width: `${Math.max(0, Math.min(1, rating - index)) * 100}%`,
              }}
            >
              <Star size={14} />
            </span>
          </span>
        ))}
      </span>
      <span>
        {rating ? `${rating.toFixed(1)} · Demo rating` : "Not rated yet"}
      </span>
    </div>
  );
}
