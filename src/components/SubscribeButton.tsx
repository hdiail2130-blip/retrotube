import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface SubscribeButtonProps {
  channel: User;
  currentUser: User;
  onToggleSubscribe: (channelId: string) => void;
  onSetNotificationPref?: (channelId: string, pref: 'all' | 'personalized' | 'none') => void;
  size?: 'normal' | 'compact';
  showCount?: boolean;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  channel,
  currentUser,
  onToggleSubscribe,
  onSetNotificationPref,
  size = 'normal',
  showCount = true,
}) => {
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSubscribed = currentUser.subscriptions?.includes(channel.id);
  const isOwner = channel.id === currentUser.id;
  const currentPref = currentUser.notificationPreferences?.[channel.id] || 'personalized';

  // Format subscriber count (e.g. 14,200 or 14.2K)
  const formatSubCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 10000) return (count / 1000).toFixed(1) + 'K';
    return count.toLocaleString();
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowBellMenu(false);
      }
    };
    if (showBellMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBellMenu]);

  if (isOwner) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSubscribed) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
    onToggleSubscribe(channel.id);
  };

  const handleSelectPref = (pref: 'all' | 'personalized' | 'none') => {
    if (onSetNotificationPref) {
      onSetNotificationPref(channel.id, pref);
    }
    setShowBellMenu(false);
  };

  const bellIcons = {
    all: '🔔',
    personalized: '🔕',
    none: '🚫',
  };

  return (
    <div className="relative inline-flex items-center select-none" ref={menuRef}>
      {/* Floating Celebration Sparkle */}
      {showCelebration && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md animate-bounce whitespace-nowrap z-30 border border-amber-600">
          🎉 +1 Subscribed!
        </div>
      )}

      {/* Main Subscribe Button Group */}
      <div className="inline-flex rounded shadow-xs overflow-hidden border border-amber-600/80">
        <button
          type="button"
          onClick={handleClick}
          className={`cursor-pointer font-bold tracking-tight transition-all duration-150 flex items-center gap-1.5 ${
            size === 'compact' ? 'px-2 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
          } ${
            isSubscribed
              ? 'bg-gradient-to-b from-[#e8e8e8] to-[#cecece] text-gray-700 hover:bg-gradient-to-b hover:from-[#f5f5f5] hover:to-[#dbdbdb] border-r border-gray-300'
              : 'bg-gradient-to-b from-[#fee082] via-[#f7b729] to-[#e49608] text-gray-900 hover:brightness-105 active:brightness-95 text-shadow-sm'
          }`}
          title={isSubscribed ? 'Click to unsubscribe' : `Subscribe to ${channel.username}`}
        >
          {isSubscribed ? (
            <>
              <span className="text-green-700 font-black text-sm">✓</span>
              <span>Subscribed</span>
            </>
          ) : (
            <>
              <span className="text-red-700 font-black">▶</span>
              <span>Subscribe</span>
            </>
          )}

          {/* Sub Count Badge */}
          {showCount && (
            <span
              className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isSubscribed
                  ? 'bg-black/10 text-gray-600'
                  : 'bg-amber-900/15 text-amber-950 font-black'
              }`}
            >
              {formatSubCount(channel.subscribers)}
            </span>
          )}
        </button>

        {/* Notification Bell Toggle (Visible when Subscribed) */}
        {isSubscribed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowBellMenu(!showBellMenu);
            }}
            className={`cursor-pointer px-2 transition-colors bg-gradient-to-b from-[#e8e8e8] to-[#cecece] hover:from-[#f5f5f5] hover:to-[#dbdbdb] text-gray-700 ${
              size === 'compact' ? 'text-xs' : 'text-sm'
            }`}
            title="Notification preferences"
          >
            {bellIcons[currentPref]}
          </button>
        )}
      </div>

      {/* Bell Notification Options Dropdown */}
      {showBellMenu && isSubscribed && (
        <div className="absolute top-full mt-1.5 right-0 w-56 bg-white border-2 border-gray-400 rounded shadow-xl z-50 p-1.5 text-xs text-left">
          <div className="text-[10px] font-bold uppercase text-gray-500 px-2 py-1 border-b border-gray-200">
            🔔 Notification Settings
          </div>

          <button
            type="button"
            onClick={() => handleSelectPref('all')}
            className={`w-full flex items-start gap-2 p-1.5 rounded hover:bg-amber-50 cursor-pointer ${
              currentPref === 'all' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-800'
            }`}
          >
            <span className="text-base leading-none">🔔</span>
            <div className="text-[11px] leading-tight">
              <div className="font-bold">All</div>
              <div className="text-[9px] text-gray-500 font-normal">
                Receive alerts for every new upload and stream.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPref('personalized')}
            className={`w-full flex items-start gap-2 p-1.5 rounded hover:bg-amber-50 cursor-pointer ${
              currentPref === 'personalized'
                ? 'bg-amber-100 font-bold text-amber-900'
                : 'text-gray-800'
            }`}
          >
            <span className="text-base leading-none">🔕</span>
            <div className="text-[11px] leading-tight">
              <div className="font-bold">Personalized</div>
              <div className="text-[9px] text-gray-500 font-normal">
                Recommended highlights and updates.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPref('none')}
            className={`w-full flex items-start gap-2 p-1.5 rounded hover:bg-amber-50 cursor-pointer ${
              currentPref === 'none' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-800'
            }`}
          >
            <span className="text-base leading-none">🚫</span>
            <div className="text-[11px] leading-tight">
              <div className="font-bold">None</div>
              <div className="text-[9px] text-gray-500 font-normal">
                No alerts; videos only appear in your feed.
              </div>
            </div>
          </button>

          <div className="border-t border-gray-200 mt-1 pt-1 text-center">
            <button
              type="button"
              onClick={handleClick}
              className="text-red-600 hover:underline text-[10px] font-bold py-0.5"
            >
              Unsubscribe from {channel.username}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
