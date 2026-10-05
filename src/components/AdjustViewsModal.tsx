import React, { useState } from 'react';
import { Video } from '../types';

interface AdjustViewsModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveViews: (videoId: string, newViews: number, ratingCount?: number, ratingSum?: number) => void;
}

export const AdjustViewsModal: React.FC<AdjustViewsModalProps> = ({
  video,
  isOpen,
  onClose,
  onSaveViews,
}) => {
  if (!isOpen || !video) return null;

  const [views, setViews] = useState<number>(video.views);
  const [ratingCount, setRatingCount] = useState<number>(video.ratingCount);
  const [ratingSum, setRatingSum] = useState<number>(video.ratingSum);
  const [includeRating, setIncludeRating] = useState<boolean>(false);

  const avgStars =
    ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '5.0';

  const handleAddViews = (amount: number) => {
    setViews((prev) => Math.max(0, prev + amount));
  };

  const handlePreset = (presetViews: number) => {
    setViews(presetViews);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (includeRating) {
      onSaveViews(video.id, views, ratingCount, ratingSum);
    } else {
      onSaveViews(video.id, views);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-white border-2 border-[#cc181e] rounded shadow-2xl max-w-md w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#cc181e] to-[#990000] text-white px-3 py-2 flex items-center justify-between font-bold">
          <div className="flex items-center gap-1.5">
            <span>⚡</span>
            <span>Adjust Video Views & Performance (God Mode)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 text-sm font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Target Video Summary */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 rounded">
            <img
              src={video.thumb}
              alt={video.title}
              className="w-16 h-10 object-cover rounded border border-gray-300 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-gray-900 truncate">{video.title}</div>
              <div className="text-[11px] text-gray-500">
                Current: <span className="font-bold text-red-700">{video.views.toLocaleString()}</span> views
              </div>
            </div>
          </div>

          {/* View Count Input */}
          <div className="bg-red-50/60 border border-red-200 p-3 rounded space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-red-900 text-xs">Total Views Count:</label>
              <span className="font-mono text-xs font-black text-red-700">
                {views.toLocaleString()} views
              </span>
            </div>

            <input
              type="number"
              min="0"
              value={views}
              onChange={(e) => setViews(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full text-base font-black font-mono p-2 border-2 border-red-300 rounded bg-white text-gray-900 focus:outline-none focus:border-red-600"
            />

            {/* Quick Increment Chips */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Instant Boost Buttons:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddViews(1000)}
                  className="btn text-[11px] py-1 px-2 font-bold hover:bg-red-100"
                >
                  +1,000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddViews(10000)}
                  className="btn text-[11px] py-1 px-2 font-bold hover:bg-red-100"
                >
                  +10,000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddViews(50000)}
                  className="btn text-[11px] py-1 px-2 font-bold hover:bg-red-100"
                >
                  +50,000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddViews(100000)}
                  className="btn text-[11px] py-1 px-2 font-bold hover:bg-red-100"
                >
                  +100,000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddViews(1000000)}
                  className="btn text-[11px] py-1 px-2 font-bold text-red-700 bg-red-100 hover:bg-red-200"
                >
                  🚀 +1,000,000 Viral Boost!
                </button>
              </div>
            </div>

            {/* Cultural Era Presets */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Era Milestones:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePreset(4250)}
                  className="btn text-[10px] py-1 px-1.5 text-left truncate hover:bg-gray-100"
                >
                  🌱 Modest Underground (4,250)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(154000)}
                  className="btn text-[10px] py-1 px-1.5 text-left truncate hover:bg-gray-100"
                >
                  📼 2007 Front Page (154k)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(2850000)}
                  className="btn text-[10px] py-1 px-1.5 text-left truncate hover:bg-gray-100"
                >
                  🏆 2010 Viral Legend (2.85M)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(25000000)}
                  className="btn text-[10px] py-1 px-1.5 text-left truncate hover:bg-gray-100"
                >
                  👑 Global Mega-Hit (25M)
                </button>
              </div>
            </div>
          </div>

          {/* Optional Ratings Tuner */}
          <div className="border border-gray-200 rounded p-2.5 bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer mb-2 font-bold text-gray-800">
              <input
                type="checkbox"
                checked={includeRating}
                onChange={(e) => setIncludeRating(e.target.checked)}
              />
              <span>Also Tune 5-Star Ratings?</span>
            </label>

            {includeRating && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    Rating Votes Count:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ratingCount}
                    onChange={(e) => {
                      const c = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setRatingCount(c);
                      // keep sum reasonable
                      setRatingSum(Math.round(c * 4.8));
                    }}
                    className="w-full p-1 border rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    Target Average Stars:
                  </label>
                  <select
                    value={avgStars}
                    onChange={(e) => {
                      const stars = parseFloat(e.target.value);
                      setRatingSum(Math.round(ratingCount * stars));
                    }}
                    className="w-full p-1 border rounded bg-white font-bold"
                  >
                    <option value="5.0">⭐⭐⭐⭐⭐ 5.0 (Flawless)</option>
                    <option value="4.8">⭐⭐⭐⭐⭐ 4.8 (Beloved)</option>
                    <option value="4.2">⭐⭐⭐⭐ 4.2 (Great)</option>
                    <option value="3.5">⭐⭐⭐ 3.5 (Average)</option>
                    <option value="2.0">⭐⭐ 2.0 (Controversial)</option>
                    <option value="1.0">⭐ 1.0 (Disliked)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn py-1 px-3 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary py-1 px-4 font-bold text-xs shadow-xs"
            >
              Apply Views Update ⚡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
