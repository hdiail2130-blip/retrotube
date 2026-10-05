import React from 'react';
import { Video, User } from '../types';

interface OfflineVaultViewProps {
  offlineSavedVideoIds: string[];
  videos: Video[];
  users: User[];
  isOnline: boolean;
  onNavigateVideo: (id: string) => void;
  onNavigateChannel: (channelId: string) => void;
  onToggleOfflineSave: (videoId: string) => void;
  onSaveAllSpotlightOffline: () => void;
  onClearOfflineVault: () => void;
}

export const OfflineVaultView: React.FC<OfflineVaultViewProps> = ({
  offlineSavedVideoIds,
  videos,
  users,
  isOnline,
  onNavigateVideo,
  onNavigateChannel,
  onToggleOfflineSave,
  onSaveAllSpotlightOffline,
  onClearOfflineVault,
}) => {
  const videoMap = new Map<string, Video>();
  videos.forEach((v) => videoMap.set(v.id, v));

  const userMap = new Map<string, User>();
  users.forEach((u) => userMap.set(u.id, u));

  const savedVideos = offlineSavedVideoIds
    .map((id) => videoMap.get(id))
    .filter((v): v is Video => v != null);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-neutral-900 text-white p-4 rounded shadow-sm border border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💾</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight">Offline Video Vault</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                isOnline ? 'bg-green-600 text-white' : 'bg-amber-500 text-black'
              }`}>
                {isOnline ? 'Online (Ready to Cache)' : 'Offline Mode Active'}
              </span>
            </div>
            <p className="text-[11px] text-blue-200 mt-0.5">
              These videos are stored locally and will play smoothly anytime, even when your PC has zero internet connection!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onSaveAllSpotlightOffline}
            className="btn btn-primary text-xs py-1.5 px-3 font-bold bg-blue-600 hover:bg-blue-700 text-white border-blue-800 cursor-pointer shadow-xs flex items-center gap-1"
          >
            <span>📥</span>
            <span>Save All Videos for Offline</span>
          </button>
          {savedVideos.length > 0 && (
            <button
              type="button"
              onClick={onClearOfflineVault}
              className="btn text-xs py-1.5 px-2.5 font-bold bg-neutral-800 hover:bg-red-900 text-gray-200 hover:text-white border-neutral-700 cursor-pointer transition-colors"
            >
              <span>🗑️ Clear Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      {savedVideos.length === 0 ? (
        <div className="bg-white border border-[#ccc] rounded p-8 text-center space-y-3">
          <div className="text-4xl">✈️</div>
          <div className="font-extrabold text-sm text-gray-800">Your Offline Vault is Empty</div>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            You haven&apos;t saved any videos for offline playback yet. Click &ldquo;Save for Offline&rdquo; on any video or click the button below to pre-cache the entire original RetroTube library!
          </p>
          <button
            type="button"
            onClick={onSaveAllSpotlightOffline}
            className="btn btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>📥</span>
            <span>Pre-Cache All Videos for Offline Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {savedVideos.map((video) => {
            const author = userMap.get(video.authorId);
            return (
              <div
                key={video.id}
                className="bg-white border border-gray-300 rounded p-2 shadow-xs hover:border-blue-500 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => onNavigateVideo(video.id)}
                    className="relative aspect-video bg-black rounded overflow-hidden cursor-pointer group"
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
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black shadow-xs flex items-center gap-0.5">
                      <span>✓</span>
                      <span>Offline Ready</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => onNavigateVideo(video.id)}
                    className="font-bold text-xs text-gray-900 hover:text-blue-700 cursor-pointer mt-2 line-clamp-2 leading-snug"
                  >
                    {video.title}
                  </h3>

                  {author && (
                    <div
                      onClick={() => onNavigateChannel(author.id)}
                      className="text-[11px] text-gray-600 hover:text-gray-900 cursor-pointer mt-1 font-semibold truncate"
                    >
                      {author.username}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigateVideo(video.id)}
                    className="btn btn-primary text-[11px] py-1 px-3 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>▶️ Play Offline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleOfflineSave(video.id)}
                    className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-bold cursor-pointer"
                    title="Remove from offline vault"
                  >
                    Remove
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
