import React from 'react';
import { User, Video } from '../types';
import { CompactStarRating } from './StarRatingWidget';

interface HomeViewProps {
  videos: Video[];
  users: User[];
  headerText: string;
  searchQuery?: string | null;
  promotedVideoIds: string[];
  onNavigateVideo: (id: string) => void;
  onNavigateChannel: (id: string) => void;
  onClearSearch: () => void;
  onAddToQueue: (videoId: string) => void;
  onToggleWatchLater: (videoId: string) => void;
  isWatchLater: (videoId: string) => boolean;
  onOpenAddToPlaylist?: (video: Video) => void;
  onOpenAdjustViews?: (video: Video) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  videos,
  users,
  headerText,
  searchQuery,
  promotedVideoIds,
  onNavigateVideo,
  onNavigateChannel,
  onClearSearch,
  onAddToQueue,
  onToggleWatchLater,
  isWatchLater,
  onOpenAddToPlaylist,
  onOpenAdjustViews,
}) => {
  // Find sponsored promoted videos
  const promotedVideos = promotedVideoIds
    .map((pid) => videos.find((v) => v.id === pid))
    .filter(Boolean) as Video[];

  return (
    <div className="space-y-4">
      {/* Sponsored Creator Spotlight (Shop Purchases) */}
      {promotedVideos.length > 0 && (
        <div className="bg-cyan-50/70 border-2 border-cyan-400 rounded-md p-3 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-cyan-600 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wide">
              Featured
            </span>
            <span className="text-xs font-bold text-cyan-900">
              Creator Spotlight Slots (Retro Shop Purchases)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {promotedVideos.map((pVid) => {
              const pAuthor = users.find((u) => u.id === pVid.authorId);
              return (
                <div
                  key={`promo-${pVid.id}`}
                  className="bg-white border border-cyan-200 rounded p-2 flex gap-2.5 items-center hover:border-cyan-500 transition-colors shadow-2xs group cursor-pointer"
                  onClick={() => onNavigateVideo(pVid.id)}
                >
                  <div className="relative w-28 aspect-video bg-black rounded overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={pVid.thumb} alt={pVid.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                      {pVid.time}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-blue-700 truncate group-hover:underline">
                      {pVid.title}
                    </div>
                    <div
                      className="text-[10px] text-gray-500 hover:text-blue-700 truncate cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pAuthor) onNavigateChannel(pAuthor.id);
                      }}
                    >
                      {pAuthor?.username}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                      <span>{pVid.views.toLocaleString()} views</span>
                      <CompactStarRating ratingSum={pVid.ratingSum} ratingCount={pVid.ratingCount} />
                    </div>
                    <div className="text-[9px] text-cyan-700 font-extrabold mt-0.5">
                      ⭐ High-Res Stream
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Section Header */}
      <div className="section-header flex items-center justify-between border-b border-gray-300 pb-1.5 mb-3 select-none">
        <span className="text-base font-bold text-gray-800">{headerText}</span>
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs text-blue-600 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500 text-xs shadow-2xs">
          <p className="text-lg mb-1">📹</p>
          <p className="font-bold text-gray-700">No videos found in this view.</p>
          <p className="text-gray-400 mt-1">Try switching categories or uploading a new video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {videos.map((vid) => {
            const author = users.find((u) => u.id === vid.authorId);
            const authorBorder = author?.activeBorder ? 'ring-2 ring-cyan-400' : '';
            const collabPartner = users.find(
              (u) => u.id === (vid.collabChannelId || vid.collaboration?.channelId)
            );

            return (
              <div key={vid.id} className="video-card w-full group">
                {/* Video Thumbnail */}
                <div className={`video-thumb relative ${authorBorder}`}>
                  <img
                    src={vid.thumb}
                    alt={vid.title}
                    onClick={() => onNavigateVideo(vid.id)}
                    className="w-full h-full object-cover"
                  />
                  <div className="video-time">{vid.time}</div>

                  {collabPartner && (
                    <span
                      className="absolute top-1 left-1 bg-emerald-900/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs border border-emerald-500/50 flex items-center gap-0.5"
                      title={`Official Collaboration with ${collabPartner.username}`}
                    >
                      <span>🤝</span>
                      <span>Collab</span>
                    </span>
                  )}

                  {/* Hover Quick Actions */}
                  <div className="thumb-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(vid.id);
                      }}
                      className="action-icon-btn"
                      title="Add to queue"
                    >
                      ➕ Queue
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchLater(vid.id);
                      }}
                      className="action-icon-btn"
                      title="Watch later"
                    >
                      {isWatchLater(vid.id) ? '✓ Saved' : '🕒 Later'}
                    </button>
                    {onOpenAddToPlaylist && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddToPlaylist(vid);
                        }}
                        className="action-icon-btn"
                        title="Add to playlist"
                      >
                        📁 +List
                      </button>
                    )}
                    {onOpenAdjustViews && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAdjustViews(vid);
                        }}
                        className="action-icon-btn text-amber-300 hover:text-amber-100"
                        title="Adjust views (God Mode)"
                      >
                        ⚡ Views
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Title */}
                <div
                  className="video-title text-xs font-bold text-blue-700 hover:underline mt-1 line-clamp-2 leading-tight cursor-pointer"
                  onClick={() => onNavigateVideo(vid.id)}
                  title={vid.title}
                >
                  {vid.title}
                </div>

                {/* Channel & Views */}
                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                  <div
                    className="video-meta video-meta-link text-[11px] text-gray-600 hover:text-blue-700 cursor-pointer"
                    onClick={() => author && onNavigateChannel(author.id)}
                  >
                    {author?.username}
                  </div>
                  {collabPartner && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateChannel(collabPartner.id);
                      }}
                      className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded hover:bg-emerald-100 cursor-pointer flex items-center gap-0.5"
                      title={`Official Collaboration with ${collabPartner.username} (${vid.collaboration?.role || vid.collabRole || 'Collab'})`}
                    >
                      <span>🤝</span>
                      <span className="truncate max-w-[85px]">{collabPartner.username}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[11px] text-gray-500">
                  <span>{vid.views.toLocaleString()} views</span>
                  <CompactStarRating ratingSum={vid.ratingSum} ratingCount={vid.ratingCount} />
                </div>
                <div className="video-meta text-[10px] text-gray-400">
                  {vid.date}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
