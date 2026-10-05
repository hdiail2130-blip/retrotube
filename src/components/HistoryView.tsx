import React, { useState } from 'react';
import { Video, WatchHistoryItem, User } from '../types';

interface HistoryViewProps {
  history: WatchHistoryItem[];
  videos: Video[];
  users: User[];
  isHistoryPaused: boolean;
  offlineSavedVideoIds: string[];
  onNavigateVideo: (id: string, startSeconds?: number) => void;
  onNavigateChannel: (channelId: string) => void;
  onRemoveHistoryItem: (historyId: string) => void;
  onClearHistory: () => void;
  onTogglePauseHistory: (paused: boolean) => void;
  onToggleOfflineSave: (videoId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  videos,
  users,
  isHistoryPaused,
  offlineSavedVideoIds,
  onNavigateVideo,
  onNavigateChannel,
  onRemoveHistoryItem,
  onClearHistory,
  onTogglePauseHistory,
  onToggleOfflineSave,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'yesterday' | 'older'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const videoMap = new Map<string, Video>();
  videos.forEach((v) => videoMap.set(v.id, v));

  const userMap = new Map<string, User>();
  users.forEach((u) => userMap.set(u.id, u));

  // Determine time bucket
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - oneDayMs;

  const enrichedHistory = history
    .map((item) => {
      const video = videoMap.get(item.videoId);
      const user = video ? userMap.get(video.authorId) : null;
      let timeBucket: 'today' | 'yesterday' | 'older' = 'older';
      if (item.watchedAt >= startOfToday) {
        timeBucket = 'today';
      } else if (item.watchedAt >= startOfYesterday) {
        timeBucket = 'yesterday';
      }
      return {
        ...item,
        video,
        user,
        timeBucket,
      };
    })
    .filter((item) => item.video != null);

  // Filter
  const filteredHistory = enrichedHistory.filter((item) => {
    if (timeFilter !== 'all' && item.timeBucket !== timeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.video?.title.toLowerCase().includes(q);
      const authorMatch = item.user?.username.toLowerCase().includes(q);
      return titleMatch || authorMatch;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-gradient-to-r from-red-800 via-neutral-900 to-black text-white p-3.5 rounded shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-red-950">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📜</span>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Watch History</h1>
            <p className="text-[11px] text-gray-300">
              {history.length} video{history.length === 1 ? '' : 's'} recorded in your personal timeline.
              {isHistoryPaused && (
                <span className="ml-2 bg-amber-500 text-black px-1.5 py-0.2 rounded font-black text-[10px]">
                  PAUSED
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onTogglePauseHistory(!isHistoryPaused)}
            className={`btn text-xs py-1 px-2.5 font-bold cursor-pointer ${
              isHistoryPaused
                ? 'bg-green-600 hover:bg-green-700 text-white border-green-800'
                : 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border-neutral-600'
            }`}
          >
            <span>{isHistoryPaused ? '▶️ Resume History' : '⏸️ Pause History'}</span>
          </button>

          {history.length > 0 && (
            <>
              {confirmClear ? (
                <div className="flex items-center gap-1.5 bg-red-900/90 px-2 py-0.5 rounded border border-red-500">
                  <span className="text-[11px] font-bold text-white">Clear all?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="btn btn-primary text-[10px] py-0.5 px-2 font-black bg-red-600 text-white"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="btn text-[10px] py-0.5 px-1.5 text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="btn text-xs py-1 px-2.5 font-bold bg-neutral-800 hover:bg-red-800 text-gray-200 hover:text-white border-neutral-600 cursor-pointer transition-colors"
                >
                  <span>🗑️ Clear History</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#ccc] rounded p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-gray-500 font-bold">Filter:</span>
          {(['all', 'today', 'yesterday', 'older'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTimeFilter(filter)}
              className={`px-2 py-1 rounded font-bold capitalize cursor-pointer transition-colors ${
                timeFilter === filter
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search in history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-[#ccc] rounded p-8 text-center space-y-3">
          <div className="text-4xl">📺</div>
          <div className="font-extrabold text-sm text-gray-800">No watch history found</div>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? `No videos in your history match "${searchQuery}". Try a different keyword.`
              : 'Your watch history is currently empty. Videos you watch on RetroTube will automatically appear here with playback progress and resume options!'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#ccc] rounded divide-y divide-gray-200">
          {filteredHistory.map((item) => {
            const video = item.video!;
            const user = item.user;
            const isSavedOffline = offlineSavedVideoIds.includes(video.id);

            // Calculate progress percentage
            const progressPercent =
              item.lastPositionSeconds && item.durationSeconds && item.durationSeconds > 0
                ? Math.min(100, Math.round((item.lastPositionSeconds / item.durationSeconds) * 100))
                : item.completed
                ? 100
                : 15;

            return (
              <div
                key={item.id}
                className="p-3 hover:bg-[#fafafa] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Thumbnail with Resume Progress Bar */}
                  <div
                    onClick={() => onNavigateVideo(video.id, item.lastPositionSeconds)}
                    className="relative w-36 h-20 sm:w-40 sm:h-24 flex-shrink-0 bg-black rounded overflow-hidden cursor-pointer shadow-xs border border-gray-300"
                  >
                    <img
                      src={video.thumb}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                      {video.time}
                    </span>

                    {/* Nostalgic Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                      <div
                        className="h-full bg-red-600 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Video Metadata */}
                  <div className="space-y-1 flex-1 min-w-0 text-xs">
                    <h3
                      onClick={() => onNavigateVideo(video.id, item.lastPositionSeconds)}
                      className="font-bold text-gray-900 hover:text-red-700 cursor-pointer line-clamp-2 leading-snug"
                    >
                      {video.title}
                    </h3>

                    {user && (
                      <div
                        onClick={() => onNavigateChannel(user.id)}
                        className="text-[11px] text-gray-600 hover:text-gray-900 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <span>👤</span>
                        <span>{user.username}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-2">
                      <span>Watched: {item.watchedDateFormatted}</span>
                      {item.lastPositionSeconds && item.lastPositionSeconds > 2 && (
                        <span className="bg-red-50 text-red-700 font-bold px-1 rounded">
                          Resume at {Math.floor(item.lastPositionSeconds / 60)}:
                          {String(Math.floor(item.lastPositionSeconds % 60)).padStart(2, '0')}
                        </span>
                      )}
                      {isSavedOffline && (
                        <span className="bg-green-100 text-green-800 font-bold px-1 rounded text-[9px]">
                          💾 Saved Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onNavigateVideo(video.id, item.lastPositionSeconds)}
                    className="btn btn-primary text-xs py-1 px-3 font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Resume watching from last timestamp"
                  >
                    <span>▶️</span>
                    <span>Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleOfflineSave(video.id)}
                    className={`btn text-xs py-1 px-2.5 font-bold cursor-pointer ${
                      isSavedOffline
                        ? 'bg-green-50 text-green-800 border-green-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                    title={isSavedOffline ? 'Remove from Offline Vault' : 'Save for offline playback'}
                  >
                    <span>{isSavedOffline ? '✓ Offline' : '💾 Save Offline'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveHistoryItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-700 cursor-pointer font-bold text-xs"
                    title="Remove from history"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
