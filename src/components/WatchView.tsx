import React, { useState } from 'react';
import { MediaSkin, User, Video, VideoQuality, CustomAdSettings, Annotation } from '../types';
import { RetroPlayer } from './RetroPlayer';
import { RichTextRenderer } from './RichTextRenderer';
import { MediaBar } from './MediaBar';
import { DEFAULT_AVATAR } from '../data/initialData';
import { SubscribeButton } from './SubscribeButton';
import { StarRatingWidget } from './StarRatingWidget';
import { getEffectiveVideoAd, getVideoAdStatus } from '../utils/adResolver';
import { getChannelWallpaperStyle, getChannelFontClass, hexToRgba } from '../utils/channelThemes';
import { WaybackEmbedModal } from './WaybackEmbedModal';

interface WatchViewProps {
  video: Video;
  videos: Video[];
  author: User;
  currentUser: User;
  users: User[];
  skin: MediaSkin;
  defaultSpeed: number;
  defaultQuality: VideoQuality;
  customAd?: CustomAdSettings;
  onToggleCustomAd?: (enabled: boolean) => void;
  onOpenAdSettings?: () => void;
  onOpenVideoAdSelector?: (video: Video) => void;
  onToggleVideoAdSelection?: (videoId: string, enabled: boolean) => void;
  annotationsEnabled?: boolean;
  onToggleAnnotations?: (enabled: boolean) => void;
  onOpenAnnotationsModal?: (video: Video) => void;
  onOpenCollabModal?: (video: Video) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onToggleSubscribe: (channelId: string) => void;
  onOpenSuperChat: (videoId: string) => void;
  onOpenMembershipModal: (channelId: string) => void;
  onOpenEmojiSizer: (src: string) => void;
  onPostComment: (videoId: string, text: string) => void;
  onPostReply: (videoId: string, commentId: string, text: string) => void;
  onLikeComment: (videoId: string, commentId: string) => void;
  onRateVideo: (videoId: string, rating: number) => void;
  onAddToQueue: (videoId: string) => void;
  onToggleWatchLater: (videoId: string) => void;
  onSetNotificationPref?: (channelId: string, pref: 'all' | 'personalized' | 'none') => void;
  onVideoEnd?: () => void;
  isWatchLater: boolean;
  autoplay?: boolean;
  onToggleAutoplay?: (enabled: boolean) => void;
  onOpenAdjustViews?: (video: Video) => void;
  onOpenAddToPlaylist?: (video: Video) => void;
  onSkinChange?: (skin: MediaSkin) => void;
  waybackPlaybackEngine?: 'high_performance' | 'wayback_embed' | 'youtube';
  onEngineChange?: (engine: 'high_performance' | 'wayback_embed' | 'youtube') => void;
  isSavedOffline?: boolean;
  onToggleOfflineSave?: (videoId: string) => void;
  onLogHistory?: (videoId: string, positionSeconds?: number, durationSeconds?: number) => void;
  initialSeekSeconds?: number;
}

export const WatchView: React.FC<WatchViewProps> = ({
  video,
  videos,
  author,
  currentUser,
  users,
  skin,
  defaultSpeed,
  defaultQuality,
  customAd,
  onToggleCustomAd,
  onOpenAdSettings,
  onOpenVideoAdSelector,
  onToggleVideoAdSelection,
  annotationsEnabled = true,
  onToggleAnnotations,
  onOpenAnnotationsModal,
  onOpenCollabModal,
  onNavigate,
  onToggleSubscribe,
  onOpenSuperChat,
  onOpenMembershipModal,
  onOpenEmojiSizer,
  onPostComment,
  onPostReply,
  onLikeComment,
  onRateVideo,
  onAddToQueue,
  onToggleWatchLater,
  onSetNotificationPref,
  onVideoEnd,
  isWatchLater,
  autoplay = true,
  onToggleAutoplay,
  onOpenAdjustViews,
  onOpenAddToPlaylist,
  onSkinChange,
  waybackPlaybackEngine,
  onEngineChange,
  isSavedOffline,
  onToggleOfflineSave,
  onLogHistory,
  initialSeekSeconds,
}) => {
  React.useEffect(() => {
    if (onLogHistory && video?.id) {
      onLogHistory(video.id, initialSeekSeconds || 0, 0);
    }
  }, [video?.id, onLogHistory, initialSeekSeconds]);

  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [hiddenReplies, setHiddenReplies] = useState<Record<string, boolean>>({});
  const [isWaybackEmbedModalOpen, setIsWaybackEmbedModalOpen] = useState(false);

  const retroSkins: { id: MediaSkin; label: string; icon: string; title: string }[] = [
    { id: 'youtube_2008', label: 'YouTube 2008', icon: '🔴', title: 'Old YouTube 2008 Golden Era Player (Dark gradient, red scrubber, HQ button)' },
    { id: 'wmp11', label: 'WMP 11', icon: '🔵', title: 'Windows Media Player 11 (Obsidian glass, neon blue radial button)' },
    { id: 'classic_flash', label: '2006 Flash', icon: '⚡', title: 'Classic 2006 Flash Player (Blocky gray, red progress, bevel play)' },
    { id: 'winamp_classic', label: 'Winamp 2.x', icon: '📻', title: 'Winamp 2.x Classic (Green LED LCD, animated EQ visualizer, ribbed metal transport)' },
    { id: 'vlc_classic', label: 'VLC Classic', icon: '🚧', title: 'VLC Media Player 2000s (Classic silver toolbar, traffic cone, bevel sliders)' },
    { id: 'realplayer_g2', label: 'RealPlayer G2', icon: '🌀', title: 'RealPlayer G2 / RealOne (Curved aqua chassis, cyan LED clip status)' },
    { id: 'crt_tv_retro', label: 'Retro CRT TV', icon: '📺', title: 'Retro 90s/2000s CRT TV & VCR (Woodgrain bezel, green OSD phosphor, scanlines)' },
    { id: 'quicktime', label: 'QuickTime 7', icon: '🍏', title: 'QuickTime 7 Player (Metallic brushed silver, square play, blue seek)' },
  ];

  const isSubscribed = currentUser.subscriptions?.includes(author.id);
  const isOwner = author.id === currentUser.id;

  // Channel Collaboration resolution
  const collabChannelId = video.collabChannelId || video.collaboration?.channelId;
  const collabUser = users.find((u) => u.id === collabChannelId);
  const collabRole = video.collaboration?.role || video.collabRole || 'Featured Collaborator';
  const collabSplit = video.collaboration?.splitPercentage ?? 50;
  const collabNotes = video.collaboration?.notes;

  // Channel Wallpaper & Branding Framing
  const isChannelWallpaperActive = author.bgWallpaperScope === 'channel_and_videos';
  const watchWallpaperStyle = isChannelWallpaperActive ? getChannelWallpaperStyle(author) : {};
  const authorFontClass = isChannelWallpaperActive && author.fontFamily ? getChannelFontClass(author.fontFamily) : '';
  const authorOpacity = author.channelOpacity ? author.channelOpacity / 100 : 0.95;

  const avgRating =
    video.ratingCount === 0 ? 0 : Math.round((video.ratingSum / video.ratingCount) * 10) / 10;
  const fullStars = Math.round(avgRating);

  const handleSeekTimestamp = (seconds: number) => {
    if (typeof (window as any).jumpToTime === 'function') {
      (window as any).jumpToTime(seconds);
    }
  };

  const submitMainComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onPostComment(video.id, commentInput.trim());
    setCommentInput('');
  };

  const submitReply = (commentId: string) => {
    const text = replyInputs[commentId]?.trim();
    if (!text) return;
    onPostReply(video.id, commentId, text);
    setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
  };

  // Render individual comment item (recursive)
  const renderCommentNode = (c: any, depth = 0) => {
    const cUser: User = users.find((u) => u.id === c.userId) || {
      id: c.userId || 'unknown',
      username: 'Unknown User',
      bio: '',
      subscribers: 0,
      bgColor: '#ffffff',
      subscriptions: [],
      balance: 0,
      memberships: {},
      avatarBase64: DEFAULT_AVATAR,
    };

    const hasReplies = c.replies && c.replies.length > 0;
    const areRepliesHidden = hiddenReplies[c.id];

    // Check membership tier badge
    let memberBadge: React.ReactNode = null;
    if (cUser.memberships && cUser.memberships[author.id] !== undefined) {
      const tierIdx = cUser.memberships[author.id];
      const tier = author.membershipSettings?.tiers?.[tierIdx];
      if (tier) {
        memberBadge = (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white shadow-2xs"
            style={{ backgroundColor: tier.badgeColor || '#444' }}
            title={`${tier.name} Channel Member`}
          >
            {tier.name}
          </span>
        );
      }
    }

    // Super Chat Banner
    if (c.isSuperChat) {
      const amt = c.scAmount || 2.0;
      let gradient = 'bg-[#00E5FF] text-black';
      if (amt >= 50.0) gradient = 'bg-[#E91E63] text-white';
      else if (amt >= 20.0) gradient = 'bg-[#FF5722] text-white';
      else if (amt >= 10.0) gradient = 'bg-[#FFEB3B] text-black';
      else if (amt >= 5.0) gradient = 'bg-[#00E676] text-black';

      return (
        <div key={c.id} className="border border-cyan-400 rounded overflow-hidden mb-3 shadow-sm">
          <div className={`${gradient} px-3 py-1 font-bold text-xs flex justify-between items-center`}>
            <span>💸 Super Chat Tip from {cUser.username}</span>
            <span className="font-mono text-sm">${amt.toFixed(2)}</span>
          </div>
          <div className="bg-white p-3 flex gap-3">
            <img
              src={cUser.avatarBase64 || DEFAULT_AVATAR}
              alt={cUser.username}
              className="w-8 h-8 rounded border border-gray-300 object-cover cursor-pointer"
              onClick={() => onNavigate('channel', { id: cUser.id })}
            />
            <div className="flex-1">
              <RichTextRenderer
                text={c.text}
                users={users}
                onSeek={handleSeekTimestamp}
                onEmojiClick={onOpenEmojiSizer}
                className="font-bold text-gray-800 text-xs"
              />
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                <button
                  type="button"
                  onClick={() => onLikeComment(video.id, c.id)}
                  className="hover:text-green-700 font-bold cursor-pointer"
                >
                  👍 {c.likes || 0}
                </button>
                <span>{c.date}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={c.id}
        className={`flex gap-2.5 pt-2.5 pb-2 ${depth > 0 ? 'ml-6 border-l-2 border-dashed border-gray-200 pl-3' : 'border-b border-gray-100'}`}
      >
        <img
          src={cUser.avatarBase64 || DEFAULT_AVATAR}
          alt={cUser.username}
          className="w-9 h-9 rounded border border-gray-300 object-cover cursor-pointer flex-shrink-0"
          onClick={() => onNavigate('channel', { id: cUser.id })}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              onClick={() => onNavigate('channel', { id: cUser.id })}
              className="font-bold text-blue-700 hover:underline cursor-pointer text-xs"
            >
              {cUser.username}
            </span>
            {memberBadge}
            <span className="text-[10px] text-gray-400">{c.date}</span>
          </div>

          <RichTextRenderer
            text={c.text}
            users={users}
            onSeek={handleSeekTimestamp}
            onEmojiClick={onOpenEmojiSizer}
            className="text-xs text-gray-800 mb-1.5"
          />

          <div className="flex items-center gap-3 text-[11px] text-gray-600 select-none">
            <button
              type="button"
              onClick={() => onLikeComment(video.id, c.id)}
              className="text-green-700 font-bold hover:underline cursor-pointer"
            >
              👍 {c.likes || 0}
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveReplyId(activeReplyId === c.id ? null : c.id)
              }
              className="hover:text-blue-700 cursor-pointer font-medium"
            >
              Reply
            </button>

            {hasReplies && (
              <button
                type="button"
                onClick={() =>
                  setHiddenReplies((prev) => ({
                    ...prev,
                    [c.id]: !prev[c.id],
                  }))
                }
                className="text-red-700 font-bold hover:underline cursor-pointer text-[10px]"
              >
                {areRepliesHidden
                  ? `[+] Show Replies (${c.replies.length})`
                  : `[-] Hide Replies (${c.replies.length})`}
              </button>
            )}
          </div>

          {/* Reply input box */}
          {activeReplyId === c.id && (
            <div className="mt-2 bg-gray-50 border border-gray-300 rounded p-2">
              <MediaBar
                textareaId={`reply-input-${c.id}`}
                channelId={author.id}
                currentUser={currentUser}
                users={users}
                onInsertText={(token) =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [c.id]: (prev[c.id] || '') + token,
                  }))
                }
                onOpenEmojiSizer={onOpenEmojiSizer}
              />
              <div className="flex gap-2">
                <input
                  id={`reply-input-${c.id}`}
                  type="text"
                  value={replyInputs[c.id] || ''}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [c.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && submitReply(c.id)}
                  placeholder={`Reply to ${cUser.username}...`}
                  className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                />
                <button
                  type="button"
                  onClick={() => submitReply(c.id)}
                  className="btn btn-primary text-xs py-1 px-3"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Nested child replies */}
          {hasReplies && !areRepliesHidden && (
            <div className="mt-2 space-y-1">
              {c.replies.map((reply: any) => renderCommentNode(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isTheaterMode ? 'max-w-[1080px]' : 'max-w-[1020px]'
      } mx-auto ${
        isChannelWallpaperActive ? 'p-2 sm:p-4 rounded-xl mb-8 relative shadow-2xl border border-black/20' : ''
      }`}
      style={isChannelWallpaperActive ? watchWallpaperStyle : undefined}
    >
      {/* Channel Partner Wallpaper Header Banner for Watch Page */}
      {isChannelWallpaperActive && (
        <div className="mb-3 bg-black/85 text-white px-3 py-1.5 rounded flex items-center justify-between text-xs border border-white/20 backdrop-blur-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-black animate-pulse">🎬 CHANNEL PARTNER BACKGROUND</span>
            <span className="text-gray-300 hidden sm:inline">• Framed by {author.username}&apos;s Custom 3D Wallpaper</span>
          </div>
          <div className="flex items-center gap-2">
            {author.partnerBadgeType && author.partnerBadgeType !== 'none' && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white font-mono uppercase">
                {author.partnerBadgeType}
              </span>
            )}
            <button
              type="button"
              onClick={() => onNavigate('channel', { id: author.id })}
              className="text-[10px] text-blue-300 hover:text-white underline font-bold cursor-pointer"
            >
              Visit Channel ↗
            </button>
          </div>
        </div>
      )}

      <div className="flex items-stretch gap-2.5">
        {/* Left 3D Gutter Rail Framing Watch Page */}
        {isChannelWallpaperActive && author.borderGutterStyle && author.borderGutterStyle !== 'none' && (
          <div className="hidden xl:flex flex-col items-center justify-between py-6 px-1.5 w-11 rounded-l-lg select-none flex-shrink-0 bg-black/80 border-y-2 border-l-2 border-white/20 backdrop-blur-md shadow-2xl text-[8px] font-black tracking-widest uppercase text-white">
            <span className="text-base animate-pulse">⚡</span>
            <div className="[writing-mode:vertical-rl] rotate-180 truncate py-6 text-red-400">
              {author.leftGutterText || 'MACHINIMA PARTNER • 1080p'}
            </div>
            <div className="text-[7px] bg-red-600 text-white px-1 py-0.5 rounded font-mono font-bold">
              3D FX
            </div>
          </div>
        )}

        <div className={`flex-1 min-w-0 ${authorFontClass}`}>
          {/* Active Video Player */}
          <div className="flex flex-col items-center">
        <RetroPlayer
          video={video}
          skin={skin}
          isTheaterMode={isTheaterMode}
          onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
          onVideoEnd={() => {
            if (autoplay && onVideoEnd) {
              onVideoEnd();
            }
          }}
          defaultSpeed={defaultSpeed}
          defaultQuality={defaultQuality}
          customAd={customAd}
          onToggleCustomAd={onToggleCustomAd}
          onOpenAdSettings={onOpenAdSettings}
          annotations={video.annotations}
          annotationsEnabled={annotationsEnabled}
          onToggleAnnotations={onToggleAnnotations}
          onOpenAnnotationsEditor={() => onOpenAnnotationsModal && onOpenAnnotationsModal(video)}
          onNavigate={onNavigate}
          waybackPlaybackEngine={waybackPlaybackEngine}
          onEngineChange={onEngineChange}
        />

        {/* Quick Retro Player Skin Switcher Toolbar */}
        <div
          className={`w-full ${
            isTheaterMode ? 'max-w-[980px]' : 'max-w-[640px]'
          } mb-2.5 px-2.5 py-1.5 bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] border border-[#ced4da] rounded shadow-xs flex flex-wrap items-center justify-between gap-1.5 select-none`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <span className="text-sm">🎛️</span>
            <span>Player Skin:</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap overflow-x-auto">
            {retroSkins.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSkinChange && onSkinChange(s.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                  skin === s.id
                    ? 'bg-[#cc181e] text-white border-[#991116] font-black shadow-xs ring-1 ring-red-400'
                    : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                }`}
                title={s.title}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Video Ad Selection & Commercial Break Toolbar */}
        {(() => {
          const effective = getEffectiveVideoAd(video, customAd);
          const adStatus = getVideoAdStatus(video, customAd);
          const isSelected = adStatus.isEnabled;

          return (
            <div
              className={`w-full ${
                isTheaterMode ? 'max-w-[980px]' : 'max-w-[640px]'
              } mb-2 px-3 py-2 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-300 rounded shadow-xs flex flex-wrap items-center justify-between gap-2 select-none text-xs`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base flex-shrink-0">🟡</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-amber-950">Video Commercials:</span>
                    <span
                      className={`font-black text-[10px] px-1.5 py-0.5 rounded shadow-2xs border ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-500 shadow-[0_0_8px_rgba(251,192,45,0.7)]'
                          : 'bg-gray-200 text-gray-700 border-gray-300'
                      }`}
                    >
                      {isSelected ? 'SELECTED (ON)' : 'UNSELECTED (OFF)'}
                    </span>

                    {/* Mode pill */}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border truncate max-w-[170px] ${adStatus.badgeClass}`}
                    >
                      {adStatus.badgeText}
                    </span>

                    {effective?.fileName && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded truncate max-w-[130px]">
                        📹 {effective.fileName}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-amber-900/80 truncate">
                    {isSelected && effective
                      ? `Iconic yellow lines set at ${effective.timestamps?.map((t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`).join(', ')} • ${effective.skipCountdownSeconds}s skip button`
                      : 'Ads are unselected for this video. Toggle ON to activate yellow line cues and skip button.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Per-video ad toggle */}
                {onToggleVideoAdSelection && (
                  <button
                    type="button"
                    onClick={() => onToggleVideoAdSelection(video.id, !isSelected)}
                    className={`btn text-xs py-1 px-3 font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
                      isSelected
                        ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    }`}
                    title={
                      isSelected
                        ? 'Deselect this video (Make ad-free with no commercial interruptions)'
                        : 'Point & select this video to show iconic yellow timeline cues and commercials'
                    }
                  >
                    <span>{isSelected ? '✕' : '🟡'}</span>
                    <span>{isSelected ? 'Deselect Video (Ad-Free)' : 'Point & Select for Ads'}</span>
                  </button>
                )}

                {/* Specific Ad Video Selector modal button */}
                {onOpenVideoAdSelector && (
                  <button
                    type="button"
                    onClick={() => onOpenVideoAdSelector(video)}
                    className="btn text-xs py-1 px-2.5 font-bold bg-purple-600 hover:bg-purple-700 text-white border-purple-800 cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Select or import a specific MP4 ad file or custom commercial preset for this video"
                  >
                    <span>📹</span>
                    <span>Select Specific Ad Video</span>
                  </button>
                )}

                {/* Global Ad Settings */}
                {onOpenAdSettings && (
                  <button
                    type="button"
                    onClick={onOpenAdSettings}
                    className="btn text-xs py-1 px-2 font-bold bg-white text-gray-800 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Open Platform Global Ad Manager"
                  >
                    <span>⚙️</span>
                    <span className="hidden sm:inline">Global Ads</span>
                  </button>
                )}

                {/* Test Ad Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof (window as any).triggerAdBreak === 'function') {
                      (window as any).triggerAdBreak(effective?.timestamps?.[0] || 12);
                    }
                  }}
                  className="btn text-xs py-1 px-2 font-bold bg-amber-500 hover:bg-amber-400 text-black border-amber-600 cursor-pointer shadow-2xs flex items-center gap-1"
                  title="Preview custom ad break right now with skip button"
                >
                  <span>▶ Test Ad</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Classic YouTube Annotations Toolbar */}
        <div
          className={`w-full ${
            isTheaterMode ? 'max-w-[980px]' : 'max-w-[640px]'
          } mb-3.5 px-3 py-1.5 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border border-red-200 rounded shadow-xs flex flex-wrap items-center justify-between gap-2 select-none text-xs`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">💬</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-red-950">Classic Annotations:</span>
                <span
                  className={`font-black text-[10px] px-1.5 py-0.5 rounded shadow-2xs border ${
                    annotationsEnabled
                      ? 'bg-red-600 text-white border-red-700 shadow-[0_0_8px_rgba(204,24,30,0.6)]'
                      : 'bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {annotationsEnabled ? 'ACTIVE (SHOWN)' : 'OFF (HIDDEN)'}
                </span>

                <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-300 px-1.5 py-0.2 rounded">
                  {(video.annotations || []).length} on this video
                </span>
              </div>
              <div className="text-[10px] text-red-900/70 truncate">
                Interactive speech bubbles, yellow notes, spotlights, and titles with clickable timestamp links!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onToggleAnnotations && (
              <button
                type="button"
                onClick={() => onToggleAnnotations(!annotationsEnabled)}
                className={`btn text-xs py-1 px-2.5 font-bold cursor-pointer transition-all ${
                  annotationsEnabled
                    ? 'bg-red-100 hover:bg-red-200 text-red-950 border-red-300'
                    : 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-2xs'
                }`}
                title={annotationsEnabled ? 'Hide annotations' : 'Show annotations'}
              >
                {annotationsEnabled ? 'Turn Annotations OFF' : 'Turn Annotations ON'}
              </button>
            )}

            {onOpenAnnotationsModal && (
              <button
                type="button"
                onClick={() => onOpenAnnotationsModal(video)}
                className="btn text-xs py-1 px-2.5 font-bold bg-white text-gray-800 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-2xs flex items-center gap-1"
                title="Open Annotations Editor to add or edit speech bubbles, notes, spotlights, and titles"
              >
                <span>✏️</span>
                <span>Edit / Add Annotations</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column: Video Info & Comments */}
        <div className="flex-1 min-w-0">
          {/* Video Metadata Box */}
          <div
            className="rounded p-3.5 shadow-2xs mb-4 transition-all"
            style={{
              backgroundColor: isChannelWallpaperActive && author.boxFillColor
                ? hexToRgba(author.boxFillColor, authorOpacity)
                : '#ffffff',
              borderColor: isChannelWallpaperActive && author.borderColor ? author.borderColor : '#cccccc',
              borderWidth: '1px',
              borderStyle: isChannelWallpaperActive && author.borderStyle ? author.borderStyle : 'solid',
              color: isChannelWallpaperActive && author.textColor ? author.textColor : '#1f2937',
              backdropFilter: isChannelWallpaperActive ? 'blur(3px)' : undefined,
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{video.title}</h1>
              <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                {onOpenCollabModal && (
                  <button
                    type="button"
                    onClick={() => onOpenCollabModal(video)}
                    className="btn text-xs py-1 px-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800 cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Manage or add channel collaboration on this video"
                  >
                    <span>🤝</span>
                    <span>{collabUser ? 'Manage Collab' : '+ Collab'}</span>
                  </button>
                )}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => onNavigate('edit_video', { id: video.id })}
                    className="btn text-xs py-1 px-2.5 flex-shrink-0"
                  >
                    Edit Video
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row: Classic 5-Star Ratings + Views */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-2.5 mb-3">
              <StarRatingWidget
                video={video}
                userRating={currentUser.userRatings?.[video.id]}
                onRate={(rating) => onRateVideo(video.id, rating)}
              />

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-2xl font-extrabold text-gray-700 font-sans">
                    {video.views.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">views</span>
                </div>
                {onOpenAdjustViews && (
                  <button
                    type="button"
                    onClick={() => onOpenAdjustViews(video)}
                    className="btn text-xs py-1 px-2 font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 cursor-pointer shadow-2xs"
                    title="Adjust Views (God Mode)"
                  >
                    ⚡ Adjust
                  </button>
                )}
              </div>
            </div>

            {/* Author Section & Creator Program Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-3">
              {collabUser ? (
                /* Dual-Channel Collaboration Co-Author Header */
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Primary Creator */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 shadow-2xs">
                    <img
                      src={author.avatarBase64 || DEFAULT_AVATAR}
                      alt={author.username}
                      className="w-9 h-9 rounded border border-gray-300 object-cover cursor-pointer hover:border-red-600"
                      onClick={() => onNavigate('channel', { id: author.id })}
                    />
                    <div>
                      <div
                        onClick={() => onNavigate('channel', { id: author.id })}
                        className="font-bold text-xs text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{author.username}</span>
                        <span className="text-[9px] bg-gray-200 text-gray-700 px-1 rounded font-normal">Uploader</span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {author.subscribers.toLocaleString()} subs
                      </div>
                    </div>
                    <SubscribeButton
                      channel={author}
                      currentUser={currentUser}
                      onToggleSubscribe={onToggleSubscribe}
                      onSetNotificationPref={onSetNotificationPref}
                    />
                  </div>

                  {/* Collab Indicator */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <span className="text-lg leading-none">🤝</span>
                    <span className="text-[8px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1 py-0.2 rounded uppercase">
                      Collab
                    </span>
                  </div>

                  {/* Collaborator Channel */}
                  <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-300 rounded px-2.5 py-1.5 shadow-2xs">
                    <img
                      src={collabUser.avatarBase64 || DEFAULT_AVATAR}
                      alt={collabUser.username}
                      className="w-9 h-9 rounded border border-emerald-400 object-cover cursor-pointer hover:border-emerald-700"
                      onClick={() => onNavigate('channel', { id: collabUser.id })}
                    />
                    <div>
                      <div
                        onClick={() => onNavigate('channel', { id: collabUser.id })}
                        className="font-bold text-xs text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{collabUser.username}</span>
                        <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 rounded font-normal truncate max-w-[120px]">
                          {collabRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {collabUser.subscribers.toLocaleString()} subs
                      </div>
                    </div>
                    <SubscribeButton
                      channel={collabUser}
                      currentUser={currentUser}
                      onToggleSubscribe={onToggleSubscribe}
                      onSetNotificationPref={onSetNotificationPref}
                    />
                  </div>
                </div>
              ) : (
                /* Classic Solo Creator Header */
                <div className="flex items-center gap-3">
                  <img
                    src={author.avatarBase64 || DEFAULT_AVATAR}
                    alt={author.username}
                    className="w-11 h-11 rounded border border-gray-300 object-cover cursor-pointer hover:border-red-600 shadow-2xs"
                    onClick={() => onNavigate('channel', { id: author.id })}
                  />
                  <div>
                    <div
                      onClick={() => onNavigate('channel', { id: author.id })}
                      className="font-bold text-sm text-blue-700 hover:underline cursor-pointer"
                    >
                      {author.username}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {author.subscribers.toLocaleString()} subscribers
                    </div>
                  </div>
                  <SubscribeButton
                    channel={author}
                    currentUser={currentUser}
                    onToggleSubscribe={onToggleSubscribe}
                    onSetNotificationPref={onSetNotificationPref}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {!isOwner && author.membershipSettings?.enabled && (
                  <button
                    type="button"
                    onClick={() => onOpenMembershipModal(author.id)}
                    className="btn btn-join-member text-xs py-1.5 px-3 font-bold"
                  >
                    Join Member
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenSuperChat(video.id)}
                  className="btn btn-primary text-xs py-1.5 px-3 font-bold shadow-sm"
                >
                  💸 Tip / Super Chat
                </button>

                {onOpenAddToPlaylist && (
                  <button
                    type="button"
                    onClick={() => onOpenAddToPlaylist(video)}
                    className="btn text-xs py-1.5 px-2.5 font-bold cursor-pointer"
                    title="Add video to a playlist"
                  >
                    📁 + Playlist
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onAddToQueue(video.id)}
                  className="btn text-xs py-1.5 px-2.5 font-bold"
                  title="Add to autoplay queue"
                >
                  ➕ Queue
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWatchLater(video.id)}
                  className={`btn text-xs py-1.5 px-2.5 font-bold ${
                    isWatchLater ? 'bg-green-100 text-green-800' : ''
                  }`}
                >
                  {isWatchLater ? '✓ Saved' : '🕒 Later'}
                </button>

                {onToggleOfflineSave && (
                  <button
                    type="button"
                    onClick={() => onToggleOfflineSave(video.id)}
                    className={`btn text-xs py-1.5 px-2.5 font-bold cursor-pointer ${
                      isSavedOffline
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-extrabold'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                    title={isSavedOffline ? 'Video is saved for offline playback' : 'Save this video to Offline Vault'}
                  >
                    <span>{isSavedOffline ? '✓ Saved Offline' : '💾 Save Offline'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 🤝 Channel Collaboration Spotlight Box */}
            {collabUser && (
              <div className="mb-3 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-300 rounded shadow-2xs select-none">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤝</span>
                    <div>
                      <div className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5 flex-wrap">
                        <span>Official Channel Collaboration:</span>
                        <span
                          className="text-blue-700 hover:underline cursor-pointer font-bold"
                          onClick={() => onNavigate('channel', { id: author.id })}
                        >
                          {author.username}
                        </span>
                        <span>×</span>
                        <span
                          className="text-emerald-700 hover:underline cursor-pointer font-bold"
                          onClick={() => onNavigate('channel', { id: collabUser.id })}
                        >
                          {collabUser.username}
                        </span>
                        <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                          {collabRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-0.5">
                        {collabSplit > 0
                          ? `💰 ${100 - collabSplit}% / ${collabSplit}% Ad & Tip Revenue Share Split`
                          : '⭐ Official Credit Recognition'}
                        {collabNotes && ` • "${collabNotes}"`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onNavigate('channel', { id: collabUser.id })}
                      className="btn text-xs py-1 px-2.5 font-bold bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 cursor-pointer shadow-2xs"
                    >
                      Visit {collabUser.username} ↗
                    </button>
                    {onOpenCollabModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCollabModal(video)}
                        className="btn text-xs py-1 px-2 font-bold text-emerald-800 bg-white border-emerald-300 hover:bg-emerald-50 cursor-pointer shadow-2xs flex items-center gap-1"
                        title="Edit collaboration settings"
                      >
                        <span>⚙️ Collab Settings</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description Box with Timestamps & Category */}
            <div className="bg-[#f5f5f5] border border-[#e5e5e5] rounded p-3 text-xs leading-relaxed">
              <div className="font-bold text-gray-700 mb-1">
                Uploaded on {video.date}
              </div>
              <RichTextRenderer
                text={video.desc}
                users={users}
                onSeek={handleSeekTimestamp}
                onEmojiClick={onOpenEmojiSizer}
                className="text-gray-800"
              />
              <div className="mt-3 pt-2 border-t border-gray-200 text-gray-500 flex items-center justify-between">
                <span>
                  Category:{' '}
                  <span className="font-bold text-blue-700 cursor-pointer hover:underline">
                    {video.category}
                  </span>
                </span>
                {video.youtubeId && (
                  <span className="text-[10px] text-red-700 font-bold">
                    YouTube Stream ID: {video.youtubeId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Wayback Machine & Internet Archive Historical Record */}
          {video.waybackUrl && (
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-300 rounded p-3 mb-4 shadow-xs">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <div>
                    <div className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5 flex-wrap">
                      <span>Wayback Machine & Internet Archive Preserved Video</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold font-mono">
                        Historical Snapshot
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Preserved historical snapshot from <strong className="text-black">{video.waybackSnapshotDate || 'Internet Archive Records'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {video.waybackHighPerformanceUrl && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                      <span>⚡</span>
                      <span>High-Performance Direct Stream (60fps)</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsWaybackEmbedModalOpen(true)}
                    className="btn text-[11px] py-1 px-2.5 font-bold bg-amber-600 hover:bg-amber-500 text-white border-amber-700 shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Generate & copy Wayback Machine embed code (IFrame, Flash 2008 object, or HTML5 video)"
                  >
                    <span>📋</span>
                    <span>Embed Video Code</span>
                  </button>
                  <a
                    href={video.waybackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn text-[11px] py-1 px-2.5 font-bold bg-white text-gray-800 border-amber-400 hover:bg-amber-100 shadow-2xs flex items-center gap-1"
                  >
                    <span>Open on Wayback Machine</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <div className="text-[10px] text-amber-900/80 font-mono break-all pt-1 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-1">
                <span className="truncate max-w-md">Archive Source: {video.waybackUrl}</span>
                {video.waybackTimestamp && (
                  <span className="font-bold flex-shrink-0">Snapshot ID: {video.waybackTimestamp}</span>
                )}
              </div>
            </div>
          )}

          {/* Comments & Discussions */}
          <div className="bg-white border border-[#ccc] rounded p-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
              <span className="font-bold text-sm text-gray-800">
                Comments & Discussions ({video.comments.length})
              </span>
              <span className="text-[11px] text-gray-500">
                Supports timestamps like <span className="font-bold text-blue-600">0:05</span>, GIFs & Emojis!
              </span>
            </div>

            {/* Post Comment Input */}
            <form onSubmit={submitMainComment} className="mb-4">
              <div className="flex gap-2.5">
                <img
                  src={currentUser.avatarBase64 || DEFAULT_AVATAR}
                  alt={currentUser.username}
                  className="w-10 h-10 rounded border border-gray-300 object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <MediaBar
                    textareaId="main-comment-textarea"
                    channelId={author.id}
                    currentUser={currentUser}
                    users={users}
                    onInsertText={(token) => setCommentInput((prev) => prev + token)}
                    onOpenEmojiSizer={onOpenEmojiSizer}
                  />
                  <textarea
                    id="main-comment-textarea"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Leave a comment... (Try 0:05 to link directly to that moment!)"
                    rows={2}
                    className="w-full text-xs p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-red-600"
                  />
                  <div className="text-right mt-1.5">
                    <button type="submit" className="btn btn-primary text-xs py-1.5 px-4 font-bold">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-1">
              {video.comments.length === 0 ? (
                <div className="text-gray-500 text-xs italic py-4 text-center">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                video.comments.map((c) => renderCommentNode(c, 0))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations & Creator Videos */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4 select-none">
          {/* Autoplay Up Next Header */}
          <div className="bg-[#f8f8f8] border border-gray-300 rounded p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-gray-800">Up Next</span>
              <span className="text-[10px] text-gray-500 ml-1.5 hidden sm:inline">
                {autoplay ? '(Auto-advance ON)' : '(Paused at end)'}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <span className="text-[11px]">Autoplay</span>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => onToggleAutoplay && onToggleAutoplay(e.target.checked)}
                className="cursor-pointer h-4 w-4 text-blue-600 rounded"
              />
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  autoplay
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-gray-200 text-gray-600 border border-gray-300'
                }`}
              >
                {autoplay ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>

          <div className="bg-white border border-[#ccc] rounded p-3 shadow-2xs">
            <div className="font-bold text-xs text-gray-800 border-b border-gray-200 pb-1.5 mb-2.5">
              More from {author.username}
            </div>
            <div className="space-y-2.5">
              {videos
                .filter((v) => v.authorId === author.id && v.id !== video.id)
                .slice(0, 5)
                .map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onNavigate('watch', { id: v.id })}
                    className="flex gap-2.5 cursor-pointer group"
                  >
                    <div className="relative w-28 aspect-video bg-black rounded border border-gray-300 overflow-hidden flex-shrink-0">
                      <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                        {v.time}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-blue-700 group-hover:underline line-clamp-2 leading-tight">
                        {v.title}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{v.views.toLocaleString()} views</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white border border-[#ccc] rounded p-3 shadow-2xs">
            <div className="font-bold text-xs text-gray-800 border-b border-gray-200 pb-1.5 mb-2.5">
              Related Nostalgic Hits 🌟
            </div>
            <div className="space-y-2.5">
              {videos
                .filter((v) => v.id !== video.id && v.authorId !== author.id)
                .slice(0, 6)
                .map((v) => {
                  const vAuthor = users.find((u) => u.id === v.authorId);
                  return (
                    <div
                      key={v.id}
                      onClick={() => onNavigate('watch', { id: v.id })}
                      className="flex gap-2.5 cursor-pointer group"
                    >
                      <div className="relative w-28 aspect-video bg-black rounded border border-gray-300 overflow-hidden flex-shrink-0">
                        <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                          {v.time}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-blue-700 group-hover:underline line-clamp-2 leading-tight">
                          {v.title}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{vAuthor?.username}</div>
                        <div className="text-[10px] text-gray-500">{v.views.toLocaleString()} views</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
        </div>

        {/* Right 3D Gutter Rail Framing Watch Page */}
        {isChannelWallpaperActive && author.borderGutterStyle && author.borderGutterStyle !== 'none' && (
          <div className="hidden xl:flex flex-col items-center justify-between py-6 px-1.5 w-11 rounded-r-lg select-none flex-shrink-0 bg-black/80 border-y-2 border-r-2 border-white/20 backdrop-blur-md shadow-2xl text-[8px] font-black tracking-widest uppercase text-white">
            <span className="text-base animate-pulse">🎮</span>
            <div className="[writing-mode:vertical-rl] rotate-180 truncate py-6 text-cyan-400">
              {author.rightGutterText || 'CLAN ROSTER • SPONSORS'}
            </div>
            <div className="text-[7px] bg-cyan-600 text-white px-1 py-0.5 rounded font-mono font-bold">
              HD
            </div>
          </div>
        )}
      </div>

      {/* Wayback Machine & Archive Embed Code Modal */}
      <WaybackEmbedModal
        video={video}
        isOpen={isWaybackEmbedModalOpen}
        onClose={() => setIsWaybackEmbedModalOpen(false)}
      />
    </div>
  );
};
