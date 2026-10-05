import React, { useState } from 'react';
import { Video } from '../types';

interface StarRatingWidgetProps {
  video: Video;
  userRating?: number;
  onRate: (rating: number) => void;
  onClearRating?: () => void;
}

export const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({
  video,
  userRating,
  onRate,
  onClearRating,
}) => {
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalRatings = Math.max(video.ratingCount || 0, 1);
  const avgRating =
    video.ratingCount === 0 ? 0 : Math.round((video.ratingSum / video.ratingCount) * 10) / 10;

  // Star labels
  const starLabels: Record<number, string> = {
    1: 'Poor (1/5)',
    2: 'Below Average (2/5)',
    3: 'Average (3/5)',
    4: 'Good (4/5)',
    5: 'Awesome! (5/5)',
  };

  // Generate simulated breakdown based on average rating
  const generateDistribution = () => {
    // Generate realistic weights based on avgRating
    const weights: Record<number, number> = {
      5: Math.max(0.1, avgRating >= 4 ? 0.75 : 0.2),
      4: Math.max(0.05, avgRating >= 3.5 ? 0.15 : 0.2),
      3: Math.max(0.05, 0.05),
      2: Math.max(0.02, 0.03),
      1: Math.max(0.02, avgRating < 2.5 ? 0.5 : 0.02),
    };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    return [5, 4, 3, 2, 1].map((stars) => {
      const pct = Math.round((weights[stars] / totalWeight) * 100);
      const count = Math.round((pct / 100) * totalRatings);
      return { stars, pct, count };
    });
  };

  const distribution = generateDistribution();
  const displayedScore = hoverStar !== null ? hoverStar : avgRating;

  return (
    <div className="relative inline-block select-none text-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Interactive 5-Star Row */}
        <div className="flex items-center gap-1 bg-[#fff8e7] border border-[#f0c36d] px-2.5 py-1 rounded shadow-2xs">
          <div
            className="flex text-2xl cursor-pointer select-none leading-none"
            onMouseLeave={() => setHoverStar(null)}
          >
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled =
                hoverStar !== null ? starVal <= hoverStar : starVal <= Math.round(avgRating);
              const isUserSelected = userRating === starVal;

              return (
                <button
                  key={starVal}
                  type="button"
                  onMouseEnter={() => setHoverStar(starVal)}
                  onClick={() => onRate(starVal)}
                  className={`p-0.5 transition-all duration-100 transform hover:scale-130 active:scale-95 cursor-pointer ${
                    isFilled ? 'text-[#f59e0b] drop-shadow-[0_1px_2px_rgba(245,158,11,0.5)]' : 'text-gray-300'
                  } ${isUserSelected ? 'ring-1 ring-amber-500 rounded-xs' : ''}`}
                  title={starLabels[starVal]}
                >
                  ★
                </button>
              );
            })}
          </div>

          {/* Dynamic Hover / Average Label */}
          <div className="ml-1 text-xs">
            {hoverStar !== null ? (
              <span className="font-bold text-amber-900 animate-pulse">
                {starLabels[hoverStar]}
              </span>
            ) : (
              <span className="font-extrabold text-gray-800">
                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
                <span className="text-[10px] text-gray-500 font-normal ml-1">
                  / 5.0 ({video.ratingCount.toLocaleString()})
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Toggle Button */}
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-blue-700 hover:underline text-[11px] font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>📊 Breakdown</span>
          <span className="text-[9px]">{showBreakdown ? '▲' : '▼'}</span>
        </button>

        {/* User Rating Indicator */}
        {userRating && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-300 text-green-800 px-2 py-0.5 rounded text-[11px] font-bold">
            <span>You rated: {userRating} ★</span>
            {onClearRating && (
              <button
                type="button"
                onClick={onClearRating}
                className="text-gray-400 hover:text-red-600 ml-1 text-xs cursor-pointer"
                title="Clear rating"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Classic YouTube 5-Star Distribution Popover */}
      {showBreakdown && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white border-2 border-gray-400 rounded-md shadow-2xl p-3 z-50 text-xs">
          <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 mb-2">
            <span className="font-bold text-gray-800">Classic Star Rating Breakdown</span>
            <button
              type="button"
              onClick={() => setShowBreakdown(false)}
              className="text-gray-400 hover:text-black font-bold cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="space-y-1.5">
            {distribution.map(({ stars, pct, count }) => (
              <div key={stars} className="flex items-center gap-2 text-[11px]">
                <span className="w-12 text-gray-700 font-bold flex items-center justify-end gap-0.5">
                  {stars} <span className="text-amber-500 text-xs">★</span>
                </span>

                <div className="flex-1 bg-gray-200 h-3 rounded-xs overflow-hidden border border-gray-300">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-16 text-right text-gray-500 font-mono text-[10px]">
                  {pct}% ({count.toLocaleString()})
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between text-[11px] text-gray-600">
            <span>Total Ratings: <strong>{video.ratingCount.toLocaleString()}</strong></span>
            <span>Average: <strong className="text-amber-700">{avgRating.toFixed(2)} / 5</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact 5-Star Display for Video Cards / Feeds
export const CompactStarRating: React.FC<{
  ratingSum: number;
  ratingCount: number;
}> = ({ ratingSum, ratingCount }) => {
  const avg = ratingCount === 0 ? 4.5 : Math.round((ratingSum / ratingCount) * 10) / 10;
  const fullStars = Math.round(avg);

  return (
    <div className="inline-flex items-center gap-1 text-[10px] text-amber-500 select-none">
      <span className="tracking-tighter">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= fullStars ? 'text-amber-500' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </span>
      <span className="text-gray-500 font-bold text-[9px]">{avg.toFixed(1)}</span>
    </div>
  );
};
