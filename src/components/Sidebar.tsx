import React from 'react';
import { Playlist, SubSpace, Video } from '../types';

interface SidebarProps {
  categories: string[];
  activeCategory: string | null;
  activeFeed: string | null;
  activeSubSpaceId: string | null;
  activePlaylistId: string | null;
  playlists: Playlist[];
  subSpaces: SubSpace[];
  queue: string[];
  videos: Video[];
  onSelectCategory: (cat: string | null) => void;
  onSelectFeed: (feed: string | null) => void;
  onSelectSubSpace: (id: string | null) => void;
  onSelectPlaylist: (id: string | null) => void;
  onCreatePlaylist?: () => void;
  onCreateSubSpace: () => void;
  onManageSubSpace: (id: string) => void;
  onNavigateVideo: (id: string) => void;
  onClearQueue: () => void;
  onRemoveFromQueue: (id: string) => void;
  onNavigate?: (route: string, params?: Record<string, any>) => void;
  onOpenCreateChannel?: () => void;
  customAdEnabled?: boolean;
  onOpenAdSettings?: () => void;
  historyCount?: number;
  offlineCount?: number;
  activeRouteName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategory,
  activeFeed,
  activeSubSpaceId,
  activePlaylistId,
  playlists,
  subSpaces,
  queue,
  videos,
  onSelectCategory,
  onSelectFeed,
  onSelectSubSpace,
  onSelectPlaylist,
  onCreatePlaylist,
  onCreateSubSpace,
  onManageSubSpace,
  onNavigateVideo,
  onClearQueue,
  onRemoveFromQueue,
  onNavigate,
  onOpenCreateChannel,
  customAdEnabled,
  onOpenAdSettings,
  historyCount = 0,
  offlineCount = 0,
  activeRouteName,
}) => {
  const isAllActive = !activeCategory && !activeFeed && !activeSubSpaceId && !activePlaylistId && activeRouteName === 'home';

  return (
    <aside className="w-full md:w-[210px] flex-shrink-0 space-y-4 select-none text-xs">
      {/* Creator Tools & MCN Simulator */}
      {onNavigate && (
        <div className="bg-linear-to-b from-neutral-900 to-neutral-800 text-white rounded p-2.5 shadow-2xs border border-neutral-700 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-gray-300 border-b border-neutral-700 pb-1">
            <span>Creator Hub</span>
            <span className="text-[9px] bg-red-600 text-white px-1 py-0.2 rounded font-bold">2011</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="w-full text-left px-2 py-1.5 rounded font-bold text-white hover:bg-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🎬</span>
            <span>Creator Studio</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('mcn')}
            className="w-full text-left px-2 py-1.5 rounded font-bold text-amber-300 hover:bg-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🏢</span>
            <span>MCN Simulator</span>
          </button>
          {onOpenAdSettings && (
            <button
              type="button"
              onClick={onOpenAdSettings}
              className="w-full text-left px-2 py-1.5 rounded font-bold text-yellow-300 hover:bg-neutral-700 flex items-center justify-between transition-colors cursor-pointer"
              title="Custom Video Ads & Timestamp Cues"
            >
              <div className="flex items-center gap-1.5">
                <span>🟡</span>
                <span>Custom Ads</span>
              </div>
              <span className={`text-[9px] px-1 py-0.2 rounded font-black ${customAdEnabled ? 'bg-amber-400 text-black' : 'bg-neutral-700 text-gray-300'}`}>
                {customAdEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          )}
          {onOpenCreateChannel && (
            <button
              type="button"
              onClick={onOpenCreateChannel}
              className="w-full text-left px-2 py-1.5 rounded font-bold text-red-300 hover:bg-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📺</span>
              <span>+ Create Channel</span>
            </button>
          )}
        </div>
      )}

      {/* Main Categories Navigation */}
      <div className="bg-white border border-[#ccc] rounded p-2 shadow-2xs">
        <div className="font-bold text-gray-500 uppercase tracking-wider text-[10px] px-2 py-1 mb-1 border-b border-gray-100">
          Explore & Feeds
        </div>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`w-full text-left px-2 py-1.5 rounded font-medium cursor-pointer transition-colors ${
                isAllActive ? 'bg-[#f1f1f1] font-bold text-[#cc181e]' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📺 All Videos (Spotlight)
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectFeed('subscriptions')}
              className={`w-full text-left px-2 py-1.5 rounded font-medium cursor-pointer transition-colors ${
                activeFeed === 'subscriptions'
                  ? 'bg-[#f1f1f1] font-bold text-[#cc181e]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔔 Subscriptions Feed
            </button>
          </li>
          {onNavigate && (
            <>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className={`w-full text-left px-2 py-1.5 rounded font-medium cursor-pointer transition-colors flex items-center justify-between ${
                    activeRouteName === 'history'
                      ? 'bg-[#f1f1f1] font-bold text-[#cc181e]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>📜</span>
                    <span>Watch History</span>
                  </div>
                  {historyCount > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded-full font-bold">
                      {historyCount}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('offline_vault')}
                  className={`w-full text-left px-2 py-1.5 rounded font-medium cursor-pointer transition-colors flex items-center justify-between ${
                    activeRouteName === 'offline_vault'
                      ? 'bg-[#f1f1f1] font-bold text-[#cc181e]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>💾</span>
                    <span>Offline Vault</span>
                  </div>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">
                    OFFLINE
                  </span>
                </button>
              </li>
            </>
          )}

          {categories.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`w-full text-left px-2 py-1 rounded font-medium cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#f1f1f1] font-bold text-[#cc181e]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                • {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Curated Sub Spaces */}
      <div className="bg-white border border-[#ccc] rounded p-2 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1 border-b border-gray-100">
          <span>Curated Subspaces</span>
          <button
            type="button"
            onClick={onCreateSubSpace}
            className="text-red-700 hover:underline font-extrabold cursor-pointer"
          >
            + Add
          </button>
        </div>
        <ul className="space-y-0.5">
          {subSpaces.map((space) => (
            <li key={space.id} className="flex items-center justify-between group">
              <button
                type="button"
                onClick={() => onSelectSubSpace(space.id)}
                className={`flex-1 text-left px-2 py-1 rounded font-medium truncate cursor-pointer transition-colors ${
                  activeSubSpaceId === space.id
                    ? 'bg-[#f1f1f1] font-bold text-[#cc181e]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📁 {space.name}
              </button>
              <button
                type="button"
                onClick={() => onManageSubSpace(space.id)}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-gray-800 px-1.5"
                title="Edit space members"
              >
                ⚙
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Playlists & Library */}
      <div className="bg-white border border-[#ccc] rounded p-2 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1 border-b border-gray-100">
          <span>Library & Playlists</span>
          {onCreatePlaylist && (
            <button
              type="button"
              onClick={onCreatePlaylist}
              className="text-red-700 hover:underline font-extrabold cursor-pointer"
              title="Create new playlist"
            >
              + New
            </button>
          )}
        </div>
        <ul className="space-y-0.5">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button
                type="button"
                onClick={() => onSelectPlaylist(pl.id)}
                className={`w-full text-left px-2 py-1.5 rounded font-medium flex items-center justify-between cursor-pointer transition-colors ${
                  activePlaylistId === pl.id
                    ? 'bg-[#f1f1f1] font-bold text-[#cc181e]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{pl.name}</span>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1 rounded">
                  {pl.videoIds.length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Active Play Queue Mini-Dock */}
      {queue.length > 0 && (
        <div className="bg-red-50/50 border border-red-300 rounded p-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-dashed border-red-200 pb-1.5 mb-2">
            <span className="font-bold text-red-800 flex items-center gap-1">
              <span>📺 Live Queue</span>
              <span className="bg-red-600 text-white text-[9px] px-1 rounded-full font-black">
                {queue.length}
              </span>
            </span>
            <button
              type="button"
              onClick={onClearQueue}
              className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
            {queue.map((vidId, idx) => {
              const qVid = videos.find((v) => v.id === vidId);
              if (!qVid) return null;
              return (
                <div
                  key={vidId}
                  className="flex items-center gap-2 p-1 rounded bg-white border border-red-100 hover:border-red-400 group cursor-pointer shadow-2xs"
                >
                  <span className="font-bold text-gray-400 text-[10px] w-3 text-center">{idx + 1}</span>
                  <img
                    src={qVid.thumb}
                    alt={qVid.title}
                    className="w-10 h-6 object-cover rounded border border-gray-300 flex-shrink-0"
                    onClick={() => onNavigateVideo(qVid.id)}
                  />
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => onNavigateVideo(qVid.id)}
                  >
                    <div className="text-[11px] font-bold text-blue-700 truncate group-hover:underline">
                      {qVid.title}
                    </div>
                    <div className="text-[9px] text-gray-500">{qVid.time}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromQueue(vidId);
                    }}
                    className="text-gray-400 hover:text-red-700 text-xs px-1 font-bold"
                    title="Remove from queue"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Spotlight Badge */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded p-2.5 text-center shadow-2xs">
        <div className="text-[10px] font-black text-red-700 uppercase tracking-wide mb-1">
          🚀 2026 Engine Update
        </div>
        <p className="text-[10px] text-gray-600 leading-tight">
          High-definition YouTube 1080p streaming with instant buffer & variable speeds (up to 3x).
        </p>
      </div>
    </aside>
  );
};
