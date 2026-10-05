import React, { useState } from 'react';
import { McnNetwork, Playlist, Post, User, Video } from '../types';
import { DEFAULT_AVATAR } from '../data/initialData';
import { RichTextRenderer } from './RichTextRenderer';
import { MediaBar } from './MediaBar';
import { processAndResizeImage, parseCssStringToReact } from '../utils/text';
import { SubscribeButton } from './SubscribeButton';
import { CompactStarRating } from './StarRatingWidget';
import { GiphySearchModal } from './GiphySearchModal';
import { resolveYouTubeChannelMetadata } from '../utils/youtubeChannelResolver';
import { WALLPAPER_PRESETS } from '../utils/channelThemes';

const hexToRgba = (hex: string, alpha: number) => {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(255, 255, 255, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ChannelViewProps {
  channel: User;
  currentUser: User;
  users: User[];
  videos: Video[];
  posts: Post[];
  shopInventory: any;
  customPartners: any[];
  mcns?: McnNetwork[];
  playlists?: Playlist[];
  activeTab?: string;
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onToggleSubscribe: (channelId: string) => void;
  onOpenMembershipModal: (channelId: string) => void;
  onOpenEmojiSizer: (src: string) => void;
  onVotePoll: (postId: string, optionIdx: number) => void;
  onSubmitPost: (channelId: string, postData: any) => void;
  onPostCommunityComment: (postId: string, text: string) => void;
  onBuyShopItem: (channelId: string, type: 'theme' | 'border', itemId: string) => void;
  onToggleEquipTheme: (channelId: string, themeId: string) => void;
  onToggleEquipBorder: (channelId: string, borderId: string) => void;
  onBuyVideoPromotion: (channelId: string, videoId: string) => void;
  onSignContract: (channelId: string, contractType: string) => void;
  onVoidContract: (channelId: string) => void;
  onCreateCustomMcn: (channelId: string, data: any) => void;
  onEarnFastSubs: (channelId: string) => void;
  onSaveMembershipSettings: (channelId: string, settings: any) => void;
  onUploadMemberEmoji: (channelId: string, name: string, base64: string) => void;
  onDeleteMemberEmoji: (channelId: string, index: number) => void;
  onSetNotificationPref?: (channelId: string, pref: 'all' | 'personalized' | 'none') => void;
  onAddToQueue: (videoId: string) => void;
  onToggleWatchLater: (videoId: string) => void;
  isWatchLater: (videoId: string) => boolean;
  onOpenAdjustViews?: (video: Video) => void;
  onOpenAddToPlaylist?: (video: Video) => void;
  onSelectPlaylist?: (playlistId: string) => void;
  onCreatePlaylist?: () => void;
  onOpenCreateChannel?: () => void;
  onImportVideosToChannel?: (channelId: string, newVideos: Array<Partial<Video>>) => void;
  onUpdateChannelProfile?: (channelId: string, updates: Partial<User>) => void;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channel,
  currentUser,
  users,
  videos,
  posts,
  shopInventory,
  customPartners,
  mcns = [],
  playlists = [],
  activeTab = 'videos',
  onNavigate,
  onToggleSubscribe,
  onOpenMembershipModal,
  onOpenEmojiSizer,
  onVotePoll,
  onSubmitPost,
  onPostCommunityComment,
  onBuyShopItem,
  onToggleEquipTheme,
  onToggleEquipBorder,
  onBuyVideoPromotion,
  onSignContract,
  onVoidContract,
  onCreateCustomMcn,
  onEarnFastSubs,
  onSaveMembershipSettings,
  onUploadMemberEmoji,
  onDeleteMemberEmoji,
  onSetNotificationPref,
  onAddToQueue,
  onToggleWatchLater,
  isWatchLater,
  onOpenAdjustViews,
  onOpenAddToPlaylist,
  onSelectPlaylist,
  onCreatePlaylist,
  onOpenCreateChannel,
  onImportVideosToChannel,
  onUpdateChannelProfile,
}) => {
  const isOwner = channel.id === currentUser.id;
  const isSubscribed = currentUser.subscriptions?.includes(channel.id);
  const channelVideos = videos.filter((v) => v.authorId === channel.id);
  const collabVideos = videos.filter(
    (v) =>
      v.collabChannelId === channel.id ||
      v.collaboration?.channelId === channel.id ||
      (v.authorId === channel.id && (v.collabChannelId || v.collaboration))
  );
  const channelPosts = posts.filter((p) => p.channelId === channel.id);

  // YouTube Channel Sync state
  const [isSyncingYoutube, setIsSyncingYoutube] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncFromYouTube = async (syncMode: 'all' | 'profile_only' | 'videos_only' = 'all') => {
    setIsSyncingYoutube(true);
    setSyncFeedback('Querying official YouTube gateway for channel profile & videos...');
    try {
      const query = channel.youtubeChannelUrl || channel.youtubeChannelHandle || channel.username;
      const res = await resolveYouTubeChannelMetadata(query);

      let profileUpdated = false;
      let importedVideoCount = 0;

      // 1. Sync Channel Profile (Avatar, Bio, Banner, Subscribers)
      if ((syncMode === 'all' || syncMode === 'profile_only') && onUpdateChannelProfile) {
        onUpdateChannelProfile(channel.id, {
          avatarBase64: res.avatarUrl || channel.avatarBase64,
          bio: res.bio || channel.bio,
          subscribers: res.subscribers || channel.subscribers,
          bannerBase64: res.bannerUrl || channel.bannerBase64,
          youtubeChannelHandle: res.handle || channel.youtubeChannelHandle,
          youtubeChannelId: res.channelId || channel.youtubeChannelId,
          youtubeChannelUrl: res.url || channel.youtubeChannelUrl,
        });
        profileUpdated = true;
      }

      // 2. Sync Videos Catalog
      if ((syncMode === 'all' || syncMode === 'videos_only') && res.videos.length > 0 && onImportVideosToChannel) {
        const existingYtIds = new Set(channelVideos.map((v) => v.youtubeId).filter(Boolean));
        const missing = res.videos.filter((v) => !existingYtIds.has(v.youtubeId));
        if (missing.length > 0) {
          onImportVideosToChannel(channel.id, missing);
          importedVideoCount = missing.length;
        }
      }

      if (profileUpdated && importedVideoCount > 0) {
        setSyncFeedback(`✨ Full Sync Complete: Updated profile photo, native YouTube bio, and imported ${importedVideoCount} new playable video(s)!`);
      } else if (profileUpdated) {
        setSyncFeedback(`✨ Profile Synced: Applied official YouTube avatar profile photo and native bio description!`);
      } else if (importedVideoCount > 0) {
        setSyncFeedback(`✨ Video Sync Complete: Imported ${importedVideoCount} new videos from YouTube catalog!`);
      } else {
        setSyncFeedback(`Channel is fully up to date with the official YouTube catalog (${res.videos.length} videos active).`);
      }
    } catch {
      setSyncFeedback('Could not reach YouTube metadata gateway at this moment.');
    } finally {
      setIsSyncingYoutube(false);
    }
  };

  // New post state
  const [postType, setPostType] = useState<'text' | 'poll'>('text');
  const [postContent, setPostContent] = useState('');
  const [postAuthorId, setPostAuthorId] = useState(currentUser.id);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<Array<{ text: string; image?: string }>>([
    { text: 'Option 1', image: '' },
    { text: 'Option 2', image: '' },
  ]);
  const [pollQuestionImage, setPollQuestionImage] = useState<string>('');
  const [imageSlots, setImageSlots] = useState<string[]>(['']);
  const [isPostGiphyModalOpen, setIsPostGiphyModalOpen] = useState(false);
  const [communityCommentInput, setCommunityCommentInput] = useState<Record<string, string>>({});

  // MCN custom builder state
  const [mcnName, setMcnName] = useState('');
  const [mcnSplit, setMcnSplit] = useState('25');
  const [mcnCpm, setMcnCpm] = useState('1.4');

  // Memberships configuration state
  const [msTiers, setMsTiers] = useState(
    channel.membershipSettings?.tiers || [
      { name: 'Super Supporter', price: 4.99, badgeColor: '#e6c382' },
      { name: 'Retro Champion', price: 14.99, badgeColor: '#ffd700' },
    ]
  );
  const [msEnabled, setMsEnabled] = useState(channel.membershipSettings?.enabled ?? true);
  const [newEmojiName, setNewEmojiName] = useState('');

  // Channel theme styling
  const activeBorderObj = channel.activeBorder
    ? shopInventory.borders.find((b: any) => b.id === channel.activeBorder)
    : null;

  const totalViews = channelVideos.reduce((acc, v) => acc + v.views, 0);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (postType === 'text') {
      const validImages = imageSlots.filter((img) => !!img);
      if (!postContent.trim() && validImages.length === 0) return;
      onSubmitPost(channel.id, {
        type: 'text',
        authorId: postAuthorId,
        content: postContent,
        images: validImages,
      });
      setPostContent('');
      setImageSlots(['']);
    } else {
      if (!pollQuestion.trim()) return;
      const validOptions = pollOptions.filter((o) => !!o.text.trim());
      if (validOptions.length < 2) return;
      onSubmitPost(channel.id, {
        type: 'poll',
        authorId: postAuthorId,
        content: pollQuestion,
        images: pollQuestionImage ? [pollQuestionImage] : [],
        options: validOptions.map((o) => ({
          text: o.text.trim(),
          image: o.image ? o.image.trim() : undefined,
          votes: 0,
        })),
      });
      setPollQuestion('');
      setPollQuestionImage('');
      setPollOptions([
        { text: 'Option 1', image: '' },
        { text: 'Option 2', image: '' },
      ]);
    }
  };

  const handlePollOptionImageUpload = (idx: number, file: File | undefined) => {
    if (!file) return;
    processAndResizeImage(file, 700, 700).then((base64) => {
      if (base64) {
        setPollOptions((prev) => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], image: base64 };
          return updated;
        });
      }
    });
  };

  const handlePollQuestionImageUpload = (file: File | undefined) => {
    if (!file) return;
    processAndResizeImage(file, 900, 700).then((base64) => {
      if (base64) {
        setPollQuestionImage(base64);
      }
    });
  };

  const handleImageSlotUpload = (idx: number, file: File | undefined) => {
    if (!file) return;
    processAndResizeImage(file, 900, 700).then((base64) => {
      if (base64) {
        setImageSlots((prev) => {
          const updated = [...prev];
          updated[idx] = base64;
          return updated;
        });
      }
    });
  };

  const handleBatchImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const converted = await Promise.all(
      fileArray.map((f) => processAndResizeImage(f, 900, 700))
    );
    const validBase64 = converted.filter((b): b is string => Boolean(b));
    setImageSlots((prev) => {
      const existing = prev.filter(Boolean);
      return [...existing, ...validBase64];
    });
  };

  // Channel Wallpaper & Appearance
  const getWallpaperStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      backgroundColor: channel.bgColor || '#f0f2f5',
    };

    if (channel.bgImageBase64 || channel.bgPattern === 'custom') {
      if (channel.bgImageBase64) {
        style.backgroundImage = `url(${channel.bgImageBase64})`;
      }
      style.backgroundRepeat = channel.bgRepeat || 'repeat';
      if (channel.bgFixed) style.backgroundAttachment = 'fixed';
      if (channel.bgRepeat === 'no-repeat') style.backgroundSize = 'cover';
      return style;
    }

    const preset = WALLPAPER_PRESETS.find((p) => p.id === channel.bgPattern);
    if (preset) {
      const presetStyle = preset.cssBackground(channel.bgColor || preset.defaultBgColor);
      Object.assign(style, presetStyle);
      if (channel.bgRepeat && channel.bgRepeat !== 'repeat') {
        style.backgroundRepeat = channel.bgRepeat;
      }
      if (channel.bgFixed) {
        style.backgroundAttachment = 'fixed';
      }
      return style;
    }

    switch (channel.bgPattern) {
      case 'grid':
        style.backgroundImage = 'radial-gradient(#9ca3af 1px, transparent 1px)';
        style.backgroundSize = '16px 16px';
        break;
      case 'stars':
        style.backgroundColor = '#0b0c16';
        style.backgroundImage =
          'radial-gradient(white 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)';
        style.backgroundSize = '24px 24px, 48px 48px';
        break;
      case 'clouds':
        style.backgroundImage = 'linear-gradient(180deg, #38bdf8 0%, #bae6fd 60%, #e0f2fe 100%)';
        break;
      case 'bliss':
        style.backgroundImage = 'linear-gradient(180deg, #60a5fa 0%, #93c5fd 45%, #22c55e 46%, #15803d 100%)';
        break;
      case 'matrix':
        style.backgroundColor = '#021a0e';
        style.backgroundImage =
          'linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)';
        style.backgroundSize = '20px 20px';
        break;
      case 'wood':
        style.backgroundImage = 'linear-gradient(90deg, #78350f, #92400e, #78350f)';
        break;
      case 'dots':
        style.backgroundColor = '#f3f4f6';
        style.backgroundImage = 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)';
        style.backgroundSize = '12px 12px';
        break;
      default:
        break;
    }

    if (channel.bgRepeat && channel.bgRepeat !== 'repeat') {
      style.backgroundRepeat = channel.bgRepeat;
    }
    if (channel.bgFixed) {
      style.backgroundAttachment = 'fixed';
    }
    return style;
  };

  const bannerHeightClass = {
    compact: 'h-28',
    normal: 'h-44',
    extended: 'h-72',
    panoramic: 'h-96',
  }[channel.bannerHeight || (channel.customBannerExtended ? 'extended' : 'normal')];

  const channelFontClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    impact: 'font-black tracking-tight font-sans',
    comic: 'font-sans italic',
    homebrew: 'font-mono font-bold tracking-wider',
    c4d_clan: 'font-black tracking-tight font-sans uppercase',
  }[channel.fontFamily || 'sans'];

  const containerOpacity = ((channel.channelOpacity ?? 95) / 100);
  const featuredVideo = videos.find((v) => v.id === channel.featuredVideoId);
  const channelPlaylists = (playlists || []).filter(
    (p) =>
      p.authorId === channel.id ||
      p.videoIds.some((vId) => channelVideos.some((cv) => cv.id === vId))
  );
  const featuredChannels = users.filter((u) =>
    (channel.featuredChannelIds || []).includes(u.id)
  );

  return (
    <div
      className="p-2 sm:p-4 rounded-xl transition-all duration-300 mb-8 relative select-none"
      style={getWallpaperStyle()}
    >
      <div className="flex items-stretch gap-2.5 max-w-7xl mx-auto">
        {/* Left 3D Gutter Rail (Cinema 4D / Clan Gaming / Sponsor Logos) */}
        {channel.borderGutterStyle && channel.borderGutterStyle !== 'none' && (
          <div className="hidden xl:flex flex-col items-center justify-between py-6 px-2 w-12 rounded-l-lg select-none flex-shrink-0 bg-black/75 border-y-2 border-l-2 border-white/20 backdrop-blur-md shadow-2xl text-[9px] font-black tracking-widest uppercase text-white">
            <div className="flex flex-col items-center gap-2">
              <span className="text-base animate-pulse">⚡</span>
              <div className="[writing-mode:vertical-rl] rotate-180 truncate py-6 text-red-400">
                {channel.leftGutterText || 'MACHINIMA PARTNER • 1080p'}
              </div>
            </div>
            <div className="text-[8px] bg-red-600 text-white px-1 py-0.5 rounded font-mono font-bold">
              3D FX
            </div>
          </div>
        )}

        {/* Main Channel Box Container */}
        <div
          className={`flex-1 min-w-0 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${channelFontClass}`}
          style={{
            backgroundColor: hexToRgba(channel.boxFillColor || '#ffffff', containerOpacity),
            borderColor: channel.borderColor || '#cccccc',
            borderStyle: channel.borderStyle || 'solid',
            borderWidth: channel.borderColor ? '2px' : '1px',
            color: channel.textColor || '#1f2937',
            backdropFilter: 'blur(3px)',
          }}
        >
          {/* Channel Bulletin / Announcement Bar */}
          {channel.channelBulletin && (
            <div
              className="p-2.5 px-4 text-white text-xs font-bold flex items-center justify-between shadow-xs border-b border-black/20"
              style={{ backgroundColor: channel.headerColor || '#cc181e' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base animate-pulse">📢</span>
                <span>{channel.channelBulletin}</span>
              </div>
              <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono">
                Channel Bulletin
              </span>
            </div>
          )}

          {/* Channel Banner */}
          <div
            className={`w-full transition-all duration-300 bg-cover bg-center border-b border-black relative flex flex-col justify-end p-3 sm:p-4 ${bannerHeightClass}`}
            style={{
              backgroundImage: channel.bannerBase64
                ? `url(${channel.bannerBase64})`
                : 'linear-gradient(to right, #1e293b, #0f172a)',
              ...(channel.customCssText ? parseCssStringToReact(channel.customCssText) : {}),
            }}
          >
            {/* Partner Verified Badges & Banner Height Stamp */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 flex-wrap">
              {channel.partnerBadgeType && channel.partnerBadgeType !== 'none' && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded shadow-md border ${
                    channel.partnerBadgeType === 'machinima'
                      ? 'bg-red-600 text-white border-red-800'
                      : channel.partnerBadgeType === 'homebrew'
                      ? 'bg-cyan-500 text-black border-cyan-300'
                      : channel.partnerBadgeType === 'maker'
                      ? 'bg-purple-600 text-white border-purple-800'
                      : 'bg-amber-400 text-black border-amber-500'
                  }`}
                >
                  {channel.partnerBadgeType === 'machinima' && '🔴 MACHINIMA PARTNER'}
                  {channel.partnerBadgeType === 'homebrew' && '🕹️ HOMEBREW CHANNEL'}
                  {channel.partnerBadgeType === 'maker' && '🌟 MAKER SYNDICATE'}
                  {channel.partnerBadgeType === 'director' && '🎬 YOUTUBE DIRECTOR'}
                  {channel.partnerBadgeType === 'musician' && '🎵 MUSICIAN'}
                  {channel.partnerBadgeType === 'guru' && '💡 GURU'}
                  {channel.partnerBadgeType === 'fullscreen' && '⚡ FULLSCREEN PARTNER'}
                </span>
              )}
              {channel.bannerHeight && (
                <span className="bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  {channel.bannerHeight} Layout
                </span>
              )}
            </div>

            {channel.bannerTagline && (
              <div className="bg-black/80 text-white backdrop-blur-xs px-3 py-1.5 rounded max-w-xl border-l-4 border-red-600 shadow-md">
                <div className="text-xs font-black tracking-wide uppercase text-amber-300">
                  {channel.bannerTagline}
                </div>
              </div>
            )}
          </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs font-bold text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>ℹ️</span>
              <span>{syncFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncFeedback(null)}
              className="text-gray-400 hover:text-black font-mono text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Channel Header Info */}
        <div className={`p-4 sm:p-5 bg-gradient-to-b from-white to-[#f9f9f9] border-b border-gray-200 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 ${channel.isYoutubeImported ? 'bg-red-50/20' : ''}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left flex-1">
            <div
              className={`rounded-full border-4 shadow-lg bg-white p-1 overflow-hidden flex-shrink-0 relative ${
                channel.isYoutubeImported
                  ? 'w-28 h-28 sm:w-36 sm:h-36 border-red-600 ring-4 ring-red-100'
                  : 'w-24 h-24 border-gray-300'
              }`}
              style={activeBorderObj ? parseCssStringToReact(activeBorderObj.style) : {}}
            >
              <img
                src={channel.avatarBase64 || DEFAULT_AVATAR}
                alt={channel.username}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2 flex-wrap">
                  <span>{channel.username}</span>
                  {channel.customLogoBase64 && (
                    <img
                      src={channel.customLogoBase64}
                      alt="Custom Channel Emblem"
                      className="h-7 w-7 object-contain inline-block rounded shadow-xs"
                    />
                  )}
                  {channel.customLogoType === 'homebrew' && !channel.customLogoBase64 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-cyan-500 text-black px-2 py-0.5 rounded shadow-xs border border-cyan-400">
                      <span>🕹️</span>
                      <span>HOMEBREW</span>
                    </span>
                  )}
                  {channel.customLogoType === 'machinima' && !channel.customLogoBase64 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-xs border border-red-800">
                      <span>🔴</span>
                      <span>MACHINIMA</span>
                    </span>
                  )}
                  {channel.customLogoType === 'clan_snipe' && !channel.customLogoBase64 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-orange-600 text-white px-2 py-0.5 rounded shadow-xs border border-orange-700">
                      <span>🎯</span>
                      <span>CLAN SNIPER</span>
                    </span>
                  )}
                </h1>
                {channel.isYoutubeImported && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded shadow-2xs">
                    <span className="text-red-600 font-black">✓</span>
                    <span>Verified Channel</span>
                  </span>
                )}
                {channel.topic && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded shadow-2xs">
                    <span>📁</span>
                    <span>{channel.topic}</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500 font-medium">
                <strong className="text-gray-900">{channel.subscribers.toLocaleString()}</strong> subscribers •{' '}
                <strong className="text-gray-900">{channelVideos.length}</strong> videos •{' '}
                <strong className="text-gray-900">{totalViews.toLocaleString()}</strong> views
                {channel.joinedDate && <span> • {channel.joinedDate}</span>}
              </div>

              {/* Channel Bio Card */}
              {channel.bio && (
                <div className="bg-white border border-gray-200 rounded p-2.5 shadow-2xs text-xs text-gray-700 max-w-2xl leading-relaxed">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    About Channel
                  </div>
                  <p className="whitespace-pre-line">{channel.bio}</p>
                </div>
              )}

              {/* Social Links */}
              {channel.socialLinks && channel.socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {channel.socialLinks.map((sl, i) => (
                    <a
                      key={i}
                      href={sl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] bg-white border border-gray-300 hover:border-gray-500 text-gray-700 hover:text-black px-2 py-0.5 rounded shadow-2xs font-medium transition-colors"
                    >
                      <span>🔗</span>
                      <span>{sl.platform}</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5 flex-wrap">
                <SubscribeButton
                  channel={channel}
                  currentUser={currentUser}
                  onToggleSubscribe={onToggleSubscribe}
                  onSetNotificationPref={onSetNotificationPref}
                />

                {!isOwner && channel.membershipSettings?.enabled && (
                  <button
                    type="button"
                    onClick={() => onOpenMembershipModal(channel.id)}
                    className="btn btn-join-member text-xs py-1 px-3 font-bold"
                  >
                    💰 Join Member
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            {channel.isYoutubeImported && (
              <button
                type="button"
                onClick={() => handleSyncFromYouTube('all')}
                disabled={isSyncingYoutube}
                className="btn text-xs py-1.5 px-3 font-bold text-gray-700 hover:bg-gray-100 border-gray-300 cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                title="Sync profile photo, bio, and catalog from YouTube"
              >
                <span>{isSyncingYoutube ? '⏳' : '🔄'}</span>
                <span>{isSyncingYoutube ? 'Syncing...' : 'Sync YouTube'}</span>
              </button>
            )}

            {onOpenCreateChannel && (
              <button
                type="button"
                onClick={onOpenCreateChannel}
                className="btn text-xs py-1.5 px-3 font-bold text-gray-700 hover:bg-gray-100 border-gray-300 cursor-pointer shadow-2xs flex items-center gap-1"
                title="Create a new channel or import from YouTube"
              >
                <span>+</span>
                <span>Create Channel</span>
              </button>
            )}

            {onCreatePlaylist && (
              <button
                type="button"
                onClick={onCreatePlaylist}
                className="btn text-xs py-1.5 px-3 font-bold text-red-700 hover:bg-red-50 border-red-300 cursor-pointer"
                title="Create a new playlist"
              >
                + New Playlist
              </button>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => onNavigate('edit_channel', { id: channel.id })}
                className="btn text-xs py-1.5 px-3 font-bold shadow-xs cursor-pointer"
              >
                Customize Channel (God Mode)
              </button>
            )}
          </div>
        </div>

      {/* Channel Navigation Tabs */}
      <div className="flex border-b border-gray-300 bg-gray-100 px-3 overflow-x-auto text-xs font-bold select-none">
        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'videos' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-red-600 text-red-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          Videos ({channelVideos.length})
        </button>

        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'collabs' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'collabs'
              ? 'border-emerald-600 text-emerald-700 bg-white font-black'
              : 'border-transparent text-emerald-800 hover:text-emerald-950'
          }`}
        >
          🤝 Collabs ({collabVideos.length})
        </button>

        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'playlists' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'playlists'
              ? 'border-red-600 text-red-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          📁 Playlists ({channelPlaylists.length})
        </button>

        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'community' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'community'
              ? 'border-red-600 text-red-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          Community & Polls ({channelPosts.length})
        </button>

        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'studio' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'studio'
              ? 'border-red-600 text-red-600 bg-white'
              : 'border-transparent text-red-700 hover:text-red-900'
          }`}
        >
          📊 Creator Studio
        </button>

        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'mcn' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'mcn'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-blue-700 hover:text-blue-900'
          }`}
        >
          📈 MCN Partner Program
        </button>

        <button
          type="button"
          onClick={() => onNavigate('channel', { id: channel.id, tab: 'shop' })}
          className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'shop'
              ? 'border-amber-600 text-amber-600 bg-white'
              : 'border-transparent text-amber-700 hover:text-amber-900'
          }`}
        >
          🛒 Retro Layout Shop
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={() => onNavigate('channel', { id: channel.id, tab: 'memberships' })}
            className={`py-2 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'memberships'
                ? 'border-green-600 text-green-600 bg-white'
                : 'border-transparent text-green-700 hover:text-green-900'
            }`}
          >
            ⭐ Memberships Setup
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-4">
        {/* 1. Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {/* Featured Video Spotlight Trailer */}
            {featuredVideo && (
              <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-300 shadow-xs flex flex-col md:flex-row gap-4 items-start">
                <div
                  className="relative w-full md:w-72 h-44 bg-black rounded overflow-hidden flex-shrink-0 cursor-pointer border border-gray-400 group"
                  onClick={() => onNavigate('watch', { id: featuredVideo.id })}
                >
                  <img
                    src={featuredVideo.thumb}
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform">
                      ▶
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
                    {featuredVideo.time}
                  </span>
                  <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    ⭐ FEATURED SPOTLIGHT
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                    Channel Trailer & Spotlight
                  </div>
                  <h3
                    onClick={() => onNavigate('watch', { id: featuredVideo.id })}
                    className="font-black text-sm text-gray-900 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {featuredVideo.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {featuredVideo.description || 'Check out this featured video from our channel.'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    <span>{featuredVideo.views.toLocaleString()} views</span>
                    <span>•</span>
                    <CompactStarRating ratingSum={featuredVideo.ratingSum} ratingCount={featuredVideo.ratingCount} />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('watch', { id: featuredVideo.id })}
                      className="btn btn-primary text-xs py-1 px-3 font-bold"
                    >
                      ▶ Watch Spotlight
                    </button>
                    {onOpenAdjustViews && (
                      <button
                        type="button"
                        onClick={() => onOpenAdjustViews(featuredVideo)}
                        className="btn text-xs py-1 px-2.5 text-amber-700 hover:bg-amber-50 border-amber-300"
                        title="Adjust view count"
                      >
                        ⚡ Adjust Views
                      </button>
                    )}
                    {onOpenAddToPlaylist && (
                      <button
                        type="button"
                        onClick={() => onOpenAddToPlaylist(featuredVideo)}
                        className="btn text-xs py-1 px-2.5 font-bold"
                        title="Add to playlist"
                      >
                        ➕ Playlist
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {channelVideos.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                No videos uploaded to this channel yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {channelVideos.map((vid) => (
                  <div key={vid.id} className="video-card w-full group">
                    <div className="video-thumb">
                      <img
                        src={vid.thumb}
                        alt={vid.title}
                        onClick={() => onNavigate('watch', { id: vid.id })}
                      />
                      <div className="video-time">{vid.time}</div>
                      <div className="thumb-actions">
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => onAddToQueue(vid.id)}
                        >
                          ➕ Queue
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => onToggleWatchLater(vid.id)}
                        >
                          {isWatchLater(vid.id) ? '✓ Saved' : '🕒 Later'}
                        </button>
                        {onOpenAddToPlaylist && (
                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAddToPlaylist(vid);
                            }}
                            title="Add to playlist"
                          >
                            📁 +List
                          </button>
                        )}
                        {onOpenAdjustViews && (
                          <button
                            type="button"
                            className="action-icon-btn text-amber-300 hover:text-amber-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAdjustViews(vid);
                            }}
                            title="Adjust views"
                          >
                            ⚡ Views
                          </button>
                        )}
                      </div>
                    </div>
                    <div
                      className="video-title"
                      onClick={() => onNavigate('watch', { id: vid.id })}
                    >
                      {vid.title}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>{vid.views.toLocaleString()} views</span>
                        {onOpenAdjustViews && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAdjustViews(vid);
                            }}
                            className="text-[10px] text-amber-600 hover:text-amber-800 font-bold"
                            title="Adjust views"
                          >
                            [⚡]
                          </button>
                        )}
                      </div>
                      <CompactStarRating ratingSum={vid.ratingSum} ratingCount={vid.ratingCount} />
                    </div>
                    <div className="video-meta text-[10px] text-gray-400">{vid.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🤝 Collaborations Tab */}
        {activeTab === 'collabs' && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white rounded p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤝</span>
                  <h3 className="text-base font-extrabold text-white">
                    Channel Collaborations & Co-Creations
                  </h3>
                  <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                    Partner Network
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-1 max-w-xl">
                  Dual-channel co-productions, guest cameos, and shared revenue videos featuring{' '}
                  <span className="font-bold text-white">{channel.username}</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('upload')}
                className="btn btn-primary text-xs py-1.5 px-3 font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 cursor-pointer shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>+ Upload Collab Video</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-300 rounded p-3 text-center shadow-2xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Total Collaborations
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">
                  {collabVideos.length}
                </div>
                <div className="text-[10px] text-gray-400">Co-authored videos</div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-3 text-center shadow-2xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Collab Partners
                </div>
                <div className="text-2xl font-black text-teal-700 mt-0.5">
                  {
                    new Set(
                      collabVideos.map((v) =>
                        v.authorId === channel.id
                          ? v.collabChannelId || v.collaboration?.channelId
                          : v.authorId
                      )
                    ).size
                  }
                </div>
                <div className="text-[10px] text-gray-400">Creator networks linked</div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-3 text-center shadow-2xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Combined Collab Views
                </div>
                <div className="text-2xl font-black text-cyan-700 mt-0.5">
                  {collabVideos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400">Total reach across both audiences</div>
              </div>
            </div>

            {/* Videos List */}
            {collabVideos.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500 text-xs shadow-2xs space-y-3">
                <p className="text-3xl">🤝</p>
                <div className="font-bold text-gray-800 text-sm">No Collaborations Found</div>
                <p className="text-gray-500 max-w-md mx-auto">
                  {channel.username} hasn&apos;t published or starred in any collaborative videos yet.
                  Collaborate on an upload to display dual-channel attribution, share audience reach, and split monetization revenue!
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('upload')}
                  className="btn btn-primary text-xs py-1.5 px-4 font-bold bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-900 cursor-pointer"
                >
                  Start a Collaboration Upload
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {collabVideos.map((vid) => {
                  const author = users.find((u) => u.id === vid.authorId);
                  const partnerId =
                    vid.authorId === channel.id
                      ? vid.collabChannelId || vid.collaboration?.channelId
                      : vid.authorId;
                  const partner = users.find((u) => u.id === partnerId);
                  const role =
                    vid.collaboration?.role || vid.collabRole || 'Featured Collaborator';
                  const split = vid.collaboration?.splitPercentage ?? 50;

                  return (
                    <div
                      key={`collab-${vid.id}`}
                      className="bg-white border border-emerald-300 hover:border-emerald-600 transition-colors rounded p-2.5 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div
                          className="relative aspect-video bg-black rounded overflow-hidden cursor-pointer group"
                          onClick={() => onNavigate('watch', { id: vid.id })}
                        >
                          <img
                            src={vid.thumb}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                            {vid.time}
                          </span>
                          <span className="absolute top-1 left-1 bg-emerald-900/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs border border-emerald-400/60 flex items-center gap-0.5">
                            <span>🤝</span>
                            <span>Collab</span>
                          </span>
                        </div>

                        {/* Title */}
                        <div
                          className="text-xs font-bold text-blue-700 hover:underline mt-2 line-clamp-2 cursor-pointer"
                          onClick={() => onNavigate('watch', { id: vid.id })}
                          title={vid.title}
                        >
                          {vid.title}
                        </div>

                        {/* Dual Creators Badge */}
                        <div className="mt-2 bg-emerald-50/70 border border-emerald-200 rounded p-1.5 flex items-center justify-between gap-1 text-[10px]">
                          <div
                            className="flex items-center gap-1 min-w-0 cursor-pointer hover:underline"
                            onClick={() => author && onNavigate('channel', { id: author.id })}
                          >
                            <img
                              src={author?.avatarBase64 || DEFAULT_AVATAR}
                              alt={author?.username}
                              className="w-5 h-5 rounded border border-gray-300 object-cover flex-shrink-0"
                            />
                            <span className="font-bold text-gray-800 truncate">
                              {author?.username}
                            </span>
                          </div>

                          <span className="text-emerald-700 font-extrabold flex-shrink-0">🤝</span>

                          <div
                            className="flex items-center gap-1 min-w-0 cursor-pointer hover:underline"
                            onClick={() => partner && onNavigate('channel', { id: partner.id })}
                          >
                            <img
                              src={partner?.avatarBase64 || DEFAULT_AVATAR}
                              alt={partner?.username}
                              className="w-5 h-5 rounded border border-emerald-400 object-cover flex-shrink-0"
                            />
                            <span className="font-bold text-emerald-800 truncate">
                              {partner?.username}
                            </span>
                          </div>
                        </div>

                        {/* Role & Split Info */}
                        <div className="flex items-center justify-between gap-1 mt-1.5 text-[9px]">
                          <span className="font-extrabold text-emerald-900 bg-emerald-100 px-1.5 py-0.2 rounded truncate">
                            {role}
                          </span>
                          <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                            {split > 0 ? `${split}% Split` : 'Credit Only'}
                          </span>
                        </div>

                        {vid.collaboration?.notes && (
                          <div className="text-[10px] text-gray-600 italic mt-1 line-clamp-1">
                            &ldquo;{vid.collaboration.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="border-t border-gray-100 mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">{vid.views.toLocaleString()} views</span>
                        <button
                          type="button"
                          onClick={() => onNavigate('watch', { id: vid.id })}
                          className="btn text-[10px] py-0.5 px-2 font-bold text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer"
                        >
                          Watch Video ▶
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Playlists by {channel.username}
                </h3>
                <p className="text-xs text-gray-500">
                  Custom collections and thematic video mixes
                </p>
              </div>
              {onCreatePlaylist && (
                <button
                  type="button"
                  onClick={onCreatePlaylist}
                  className="btn btn-primary text-xs py-1.5 px-3 font-bold cursor-pointer"
                >
                  + Create Playlist
                </button>
              )}
            </div>

            {channelPlaylists.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 border border-dashed rounded text-gray-500 text-xs">
                <p>No playlists found for this channel yet.</p>
                {onCreatePlaylist && (
                  <button
                    type="button"
                    onClick={onCreatePlaylist}
                    className="btn text-xs py-1 px-3 mt-3 font-bold"
                  >
                    + Create First Playlist
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {channelPlaylists.map((pl) => {
                  const firstVideo = videos.find((v) => v.id === pl.videoIds[0]);
                  const thumb =
                    pl.customCover ||
                    firstVideo?.thumb ||
                    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=480';
                  return (
                    <div
                      key={pl.id}
                      className="bg-white border border-gray-300 rounded overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div
                        className="relative h-36 bg-gray-900 cursor-pointer group"
                        onClick={() => {
                          if (firstVideo) {
                            onNavigate('watch', { id: firstVideo.id, list: pl.id });
                          } else if (onSelectPlaylist) {
                            onSelectPlaylist(pl.id);
                          }
                        }}
                      >
                        <img
                          src={thumb}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:opacity-90"
                        />
                        <div className="absolute inset-y-0 right-0 w-24 bg-black/75 text-white flex flex-col items-center justify-center gap-1 backdrop-blur-xs">
                          <span className="text-lg font-bold">{pl.videoIds.length}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300">
                            Videos
                          </span>
                          <span className="text-xs">▶</span>
                        </div>
                        {pl.isPrivate && (
                          <span className="absolute top-2 left-2 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            🔒 Private
                          </span>
                        )}
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4
                            onClick={() => {
                              if (firstVideo) {
                                onNavigate('watch', { id: firstVideo.id, list: pl.id });
                              } else if (onSelectPlaylist) {
                                onSelectPlaylist(pl.id);
                              }
                            }}
                            className="font-bold text-xs text-gray-800 hover:text-blue-700 hover:underline cursor-pointer line-clamp-1"
                          >
                            {pl.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                            {pl.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t text-[11px]">
                          <span className="text-gray-400 text-[10px]">
                            {pl.videoIds.length} videos
                          </span>
                          <div className="flex items-center gap-1.5">
                            {firstVideo && (
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigate('watch', { id: firstVideo.id, list: pl.id })
                                }
                                className="btn btn-primary text-[10px] py-0.5 px-2 font-bold"
                              >
                                ▶ Play All
                              </button>
                            )}
                            {onSelectPlaylist && (
                              <button
                                type="button"
                                onClick={() => onSelectPlaylist(pl.id)}
                                className="btn text-[10px] py-0.5 px-2"
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Community & Polls Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            {/* Post Creator Box */}
            <div className="bg-[#f9f9f9] border border-gray-300 rounded p-4 shadow-2xs">
              <h3 className="font-bold text-gray-800 text-sm mb-3">
                Post to {channel.username}&apos;s Channel Feed
              </h3>

              <div className="flex items-center gap-3 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-600">Post as:</span>
                  <select
                    value={postAuthorId}
                    onChange={(e) => setPostAuthorId(e.target.value)}
                    className="p-1 border border-gray-300 rounded bg-white text-xs font-bold"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-600">Type:</span>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as 'text' | 'poll')}
                    className="p-1 border border-gray-300 rounded bg-white text-xs font-bold"
                  >
                    <option value="text">Text + Image Gallery</option>
                    <option value="poll">Interactive Community Poll</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                {postType === 'text' ? (
                  <>
                    <MediaBar
                      textareaId="post-content-area"
                      channelId={channel.id}
                      currentUser={currentUser}
                      users={users}
                      onInsertText={(token) => setPostContent((prev) => prev + token)}
                      onOpenEmojiSizer={onOpenEmojiSizer}
                    />
                    <textarea
                      id="post-content-area"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share an update, nostalgic memories, or upload unlimited photos & artwork with no limits..."
                      rows={3}
                      className="w-full text-xs p-2 border border-gray-300 rounded bg-white"
                    />

                    {/* Image Gallery Slots (UNLIMITED - No limit) */}
                    <div className="bg-white p-3 border border-gray-200 rounded space-y-2.5">
                      <div className="text-xs font-bold text-gray-700 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-extrabold">Attach Images:</span>
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-300">
                            Unlimited Mode (No Limit) 🖼️
                          </span>
                          {imageSlots.filter(Boolean).length > 0 && (
                            <span className="text-[11px] text-gray-500 font-semibold">
                              ({imageSlots.filter(Boolean).length} image{imageSlots.filter(Boolean).length === 1 ? '' : 's'} ready)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Batch multi-file picker */}
                          <label className="btn btn-primary text-[10px] py-1 px-2.5 cursor-pointer font-bold flex items-center gap-1 shadow-2xs">
                            <span>📁 Import Local Images (Multiple)</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleBatchImageUpload(e.target.files);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setIsPostGiphyModalOpen(true)}
                            className="btn text-[10px] py-1 px-2.5 font-bold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Search live GIPHY and attach animated GIF to this post"
                          >
                            <span>🎞️ Search GIPHY</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setImageSlots((prev) => [...prev, ''])}
                            className="btn text-[10px] py-1 px-2.5 font-bold"
                            title="Add another individual image slot"
                          >
                            + Add 1 Slot
                          </button>

                          {imageSlots.filter(Boolean).length > 0 && (
                            <button
                              type="button"
                              onClick={() => setImageSlots([''])}
                              className="btn text-[10px] py-1 px-2 text-red-600 hover:bg-red-50 border-red-200"
                              title="Remove all image attachments"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-72 overflow-y-auto p-1 bg-gray-50 border border-gray-200 rounded">
                        {imageSlots.map((slotImg, sIdx) => (
                          <div
                            key={`slot-${sIdx}`}
                            className={`border rounded p-1.5 flex flex-col items-center justify-center min-h-[85px] relative group transition-colors ${
                              slotImg ? 'bg-white border-gray-300' : 'border-dashed border-gray-300 bg-white hover:border-red-400'
                            }`}
                          >
                            {slotImg ? (
                              <>
                                <img
                                  src={slotImg}
                                  alt={`Attached ${sIdx + 1}`}
                                  className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-90"
                                  onClick={() => onOpenEmojiSizer(slotImg)}
                                />
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">
                                  #{sIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageSlots((prev) => {
                                      const u = [...prev];
                                      u.splice(sIdx, 1);
                                      return u.length === 0 ? [''] : u;
                                    })
                                  }
                                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold shadow-xs"
                                  title="Remove this image"
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <label className="cursor-pointer text-center text-[10px] text-gray-500 hover:text-red-700 p-2 w-full h-full flex flex-col items-center justify-center">
                                <span className="text-base mb-0.5">🖼️</span>
                                <span className="font-bold">Slot #{sIdx + 1}</span>
                                <span className="text-[9px] text-gray-400">Click to pick</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleImageSlotUpload(sIdx, e.target.files?.[0]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 italic">
                        Tip: You can select dozens of images at once from your folder. There are no slot restrictions or artificial upload caps!
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700">Community Poll Question:</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                        ✨ Image Polls Supported
                      </span>
                    </div>

                    <input
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="Ask your community a question..."
                      className="w-full text-xs font-bold p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-red-500"
                    />

                    {/* Question Image Attachment */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-600 text-[11px] flex items-center gap-1">
                          <span>🖼️</span>
                          <span>Poll Question Image Banner (Optional):</span>
                        </span>
                        {pollQuestionImage && (
                          <button
                            type="button"
                            onClick={() => setPollQuestionImage('')}
                            className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            Remove Banner
                          </button>
                        )}
                      </div>

                      {pollQuestionImage ? (
                        <div className="relative w-full max-w-xs h-28 rounded overflow-hidden border border-gray-300 bg-black">
                          <img
                            src={pollQuestionImage}
                            alt="Poll Question Banner"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPollQuestionImage('')}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold cursor-pointer"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="btn text-xs py-1 px-2.5 font-bold cursor-pointer bg-white text-gray-800 hover:bg-gray-100 border-gray-300 shadow-2xs flex items-center gap-1">
                            <span>📁</span>
                            <span>Upload Poll Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handlePollQuestionImageUpload(e.target.files?.[0]);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <span className="text-[10px] text-gray-400">or paste image URL:</span>
                          <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                setPollQuestionImage(e.target.value.trim());
                                e.target.value = '';
                              }
                            }}
                            className="flex-1 min-w-[160px] text-xs p-1 border border-gray-300 rounded bg-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Poll Choices with Option Image Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span>Poll Choices ({pollOptions.length}/6):</span>
                        <span className="text-[10px] text-gray-500 font-normal">Click &ldquo;Photo&rdquo; to add image to choice</span>
                      </div>

                      {pollOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="bg-gray-50 border border-gray-200 rounded p-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          {/* Option Image Thumbnail or Upload Button */}
                          <div className="flex-shrink-0">
                            {opt.image ? (
                              <div className="relative w-12 h-12 rounded border border-gray-300 overflow-hidden bg-black group">
                                <img
                                  src={opt.image}
                                  alt={`Option ${oIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPollOptions((prev) => {
                                      const u = [...prev];
                                      u[oIdx] = { ...u[oIdx], image: '' };
                                      return u;
                                    })
                                  }
                                  className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 text-[10px] flex items-center justify-center font-bold cursor-pointer"
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <label
                                className="w-12 h-12 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded flex flex-col items-center justify-center cursor-pointer bg-white text-gray-500 hover:text-blue-600 transition-colors"
                                title="Upload/Import image for this choice"
                              >
                                <span className="text-sm">🖼️</span>
                                <span className="text-[8px] font-bold leading-none">Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handlePollOptionImageUpload(oIdx, e.target.files?.[0]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Option Text Input */}
                          <div className="flex-1 w-full flex items-center gap-1.5">
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPollOptions((prev) => {
                                  const u = [...prev];
                                  u[oIdx] = { ...u[oIdx], text: val };
                                  return u;
                                });
                              }}
                              className="flex-1 text-xs p-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-red-500"
                              placeholder={`Option ${oIdx + 1}`}
                            />

                            {/* Optional image URL input */}
                            {!opt.image && (
                              <input
                                type="text"
                                placeholder="Image URL..."
                                onBlur={(e) => {
                                  if (e.target.value.trim()) {
                                    const imgUrl = e.target.value.trim();
                                    setPollOptions((prev) => {
                                      const u = [...prev];
                                      u[oIdx] = { ...u[oIdx], image: imgUrl };
                                      return u;
                                    });
                                    e.target.value = '';
                                  }
                                }}
                                className="w-28 text-[10px] p-1 border border-gray-300 rounded bg-white hidden sm:block"
                                title="Or paste image URL"
                              />
                            )}

                            {pollOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPollOptions((prev) => prev.filter((_, idx) => idx !== oIdx))
                                }
                                className="btn text-xs py-1 px-2 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Remove this option"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {pollOptions.length < 6 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPollOptions((prev) => [
                              ...prev,
                              { text: `Option ${prev.length + 1}`, image: '' },
                            ])
                          }
                          className="btn text-xs py-1 px-2.5 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>+</span>
                          <span>Add Poll Choice</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-right">
                  <button type="submit" className="btn btn-primary text-xs py-1.5 px-4 font-bold">
                    Publish to Feed
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {channelPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No community updates yet on this channel.
                </div>
              ) : (
                channelPosts.map((post) => {
                  const authorUser = users.find((u) => u.id === post.authorId);
                  const totalVotes =
                    post.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

                  return (
                    <div
                      key={post.id}
                      className="bg-white border border-gray-200 rounded p-4 shadow-2xs space-y-3"
                    >
                      {/* Post Header */}
                      <div className="flex items-center gap-2.5">
                        <img
                          src={authorUser?.avatarBase64 || DEFAULT_AVATAR}
                          alt={authorUser?.username}
                          className="w-8 h-8 rounded border border-gray-300 object-cover"
                        />
                        <div>
                          <span className="font-bold text-xs text-blue-700 hover:underline cursor-pointer">
                            {authorUser?.username}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-2">{post.date}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <RichTextRenderer
                        text={post.content}
                        users={users}
                        onEmojiClick={onOpenEmojiSizer}
                        className="text-xs text-gray-800"
                      />

                      {/* Image Gallery */}
                      {post.images && post.images.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold mb-1.5">
                            <span>🖼️ Gallery ({post.images.length} image{post.images.length === 1 ? '' : 's'})</span>
                          </div>
                          <div
                            className={`grid gap-2 ${
                              post.images.length === 1
                                ? 'grid-cols-1 max-w-md'
                                : post.images.length === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                            }`}
                          >
                            {post.images.map((imgSrc, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={imgSrc}
                                  alt={`Attached ${imgIdx + 1}`}
                                  className="w-full h-32 object-cover rounded border border-gray-200 cursor-pointer hover:border-red-600 hover:shadow-2xs transition-all"
                                  onClick={() => onOpenEmojiSizer(imgSrc)}
                                  title="Click to view full size"
                                />
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
                                  #{imgIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Poll Options (Supports Image Polls & Text Polls) */}
                      {post.type === 'poll' && post.options && (
                        <div className="space-y-2.5 mt-2">
                          {(() => {
                            const hasAnyOptionImages = post.options.some((opt) => !!opt.image);

                            if (hasAnyOptionImages) {
                              return (
                                <div
                                  className={`grid gap-2.5 ${
                                    post.options.length <= 2
                                      ? 'grid-cols-1 sm:grid-cols-2'
                                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                                  }`}
                                >
                                  {post.options.map((opt, oIdx) => {
                                    const pct =
                                      totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                    return (
                                      <div
                                        key={oIdx}
                                        onClick={() => onVotePoll(post.id, oIdx)}
                                        className="relative bg-white hover:bg-blue-50/50 border-2 border-gray-300 hover:border-blue-500 rounded overflow-hidden cursor-pointer flex flex-col justify-between transition-all group shadow-2xs select-none"
                                      >
                                        {opt.image ? (
                                          <div className="relative w-full aspect-video bg-black/90 overflow-hidden">
                                            <img
                                              src={opt.image}
                                              alt={opt.text}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenEmojiSizer(opt.image!);
                                              }}
                                              title="Click to zoom image"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                            <span>📷 Option {oIdx + 1}</span>
                                          </div>
                                        )}

                                        <div className="p-2 relative bg-white">
                                          <div
                                            className="absolute inset-y-0 left-0 bg-blue-100 transition-all duration-300 pointer-events-none"
                                            style={{ width: `${pct}%` }}
                                          />
                                          <div className="relative z-10 flex items-center justify-between gap-1 text-xs">
                                            <span className="font-bold text-gray-900 leading-snug">{opt.text}</span>
                                            <span className="text-gray-600 font-mono font-bold text-[11px] whitespace-nowrap">
                                              {pct}% ({opt.votes})
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            // Standard horizontal poll options
                            return (
                              <div className="space-y-2">
                                {post.options.map((opt, oIdx) => {
                                  const pct =
                                    totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                  return (
                                    <div
                                      key={oIdx}
                                      onClick={() => onVotePoll(post.id, oIdx)}
                                      className="relative bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded p-2.5 cursor-pointer overflow-hidden text-xs flex justify-between items-center select-none"
                                    >
                                      <div
                                        className="absolute inset-y-0 left-0 bg-blue-200/50 transition-all duration-300 pointer-events-none"
                                        style={{ width: `${pct}%` }}
                                      />
                                      <div className="flex items-center gap-2 relative z-10">
                                        {opt.image && (
                                          <img
                                            src={opt.image}
                                            alt={opt.text}
                                            className="w-8 h-8 object-cover rounded border border-gray-300 flex-shrink-0 cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onOpenEmojiSizer(opt.image!);
                                            }}
                                            title="Click to zoom image"
                                          />
                                        )}
                                        <span className="font-bold text-gray-800">{opt.text}</span>
                                      </div>
                                      <span className="text-gray-500 font-mono relative z-10 text-[11px]">
                                        {pct}% ({opt.votes} votes)
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                          <div className="text-[10px] text-gray-500 font-medium">
                            {totalVotes} total vote{totalVotes === 1 ? '' : 's'} • Click any option to vote
                          </div>
                        </div>
                      )}

                      {/* Community Comments */}
                      <div className="border-t border-gray-100 pt-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={communityCommentInput[post.id] || ''}
                            onChange={(e) =>
                              setCommunityCommentInput((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const txt = communityCommentInput[post.id]?.trim();
                                if (txt) {
                                  onPostCommunityComment(post.id, txt);
                                  setCommunityCommentInput((prev) => ({ ...prev, [post.id]: '' }));
                                }
                              }
                            }}
                            placeholder="Write a comment..."
                            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const txt = communityCommentInput[post.id]?.trim();
                              if (txt) {
                                onPostCommunityComment(post.id, txt);
                                setCommunityCommentInput((prev) => ({ ...prev, [post.id]: '' }));
                              }
                            }}
                            className="btn btn-primary text-xs py-1 px-3"
                          >
                            Comment
                          </button>
                        </div>

                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {post.comments.map((cm) => {
                              const cmUser = users.find((u) => u.id === cm.userId);
                              return (
                                <div key={cm.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-100 flex gap-2">
                                  <img
                                    src={cmUser?.avatarBase64 || DEFAULT_AVATAR}
                                    alt={cmUser?.username}
                                    className="w-6 h-6 rounded border object-cover"
                                  />
                                  <div>
                                    <span className="font-bold text-blue-700 mr-2">{cmUser?.username}:</span>
                                    <span>{cm.text}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. Creator Studio Tab */}
        {activeTab === 'studio' && (
          <div className="space-y-5">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-300 rounded p-4 text-center shadow-2xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Lifetime Views</div>
                <div className="text-3xl font-black text-red-700 mt-1">{totalViews.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-300 rounded p-4 text-center shadow-2xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Subscribers</div>
                <div className="text-3xl font-black text-blue-700 mt-1">
                  {channel.subscribers.toLocaleString()}
                </div>
              </div>
              <div className="bg-white border border-gray-300 rounded p-4 text-center shadow-2xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Total Wallet Balance</div>
                <div className="text-3xl font-black text-green-700 mt-1">
                  ${(channel.balance || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Simulated Milestone Growth Visualizer */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
              <div className="text-xs font-bold text-gray-800 mb-3">
                Simulated Subscriber Milestones Progress
              </div>
              <div className="flex items-end justify-between h-32 bg-gray-50 border-b border-l border-gray-300 p-2">
                {[
                  { label: 'Week 1', subs: Math.round(channel.subscribers * 0.2) },
                  { label: 'Week 2', subs: Math.round(channel.subscribers * 0.45) },
                  { label: 'Week 3', subs: Math.round(channel.subscribers * 0.75) },
                  { label: 'Current', subs: channel.subscribers },
                ].map((item, idx) => {
                  const heightPct = Math.max(15, (item.subs / (channel.subscribers || 1)) * 100);
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <span className="text-[9px] font-bold text-gray-600 mb-1">{item.subs}</span>
                      <div
                        className="w-8 bg-red-600 rounded-t shadow-xs transition-all duration-500"
                        style={{ height: `${heightPct * 0.8}px` }}
                      />
                      <span className="text-[9px] text-gray-400 mt-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Earnings History Ledger */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
              <div className="text-xs font-bold text-gray-800 mb-2">Creator Earnings & Tipping Ledger</div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-600 border-b">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Source / Sponsor</th>
                      <th className="p-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(channel.earningsHistory || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="p-2 text-gray-400">{item.date}</td>
                        <td className="p-2 font-bold text-gray-700">{item.source}</td>
                        <td className="p-2 text-right text-green-700 font-bold">+${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Video Performance & Views Adjuster (God Mode) */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">
                    ⚡ Video Views & Ratings Adjuster (God Mode)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Directly tweak view counts, star scores, or viral reach for any uploaded video
                  </p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                  Instant Simulation
                </span>
              </div>

              {channelVideos.length === 0 ? (
                <div className="text-xs text-gray-500 py-4 text-center">
                  No channel videos to adjust. Upload a video first.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {channelVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={vid.thumb}
                          alt={vid.title}
                          className="w-16 h-10 object-cover rounded border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div
                            onClick={() => onNavigate('watch', { id: vid.id })}
                            className="font-bold text-gray-800 hover:text-blue-700 hover:underline truncate cursor-pointer"
                          >
                            {vid.title}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-gray-700">
                              {vid.views.toLocaleString()} views
                            </span>
                            <span>•</span>
                            <CompactStarRating
                              ratingSum={vid.ratingSum}
                              ratingCount={vid.ratingCount}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onOpenAdjustViews && (
                          <button
                            type="button"
                            onClick={() => onOpenAdjustViews(vid)}
                            className="btn text-xs py-1 px-2.5 font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 cursor-pointer shadow-2xs"
                          >
                            ⚡ Adjust Views
                          </button>
                        )}
                        {onOpenAddToPlaylist && (
                          <button
                            type="button"
                            onClick={() => onOpenAddToPlaylist(vid)}
                            className="btn text-xs py-1 px-2 text-gray-700 cursor-pointer shadow-2xs"
                            title="Add to playlist"
                          >
                            📁
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. MCN Partner Program */}
        {activeTab === 'mcn' && (
          <div className="space-y-5">
            <div className="bg-linear-to-r from-neutral-900 to-red-950 text-white rounded p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏢</span>
                  <h3 className="font-extrabold text-sm text-white uppercase">
                    2011 Multi-Channel Network (MCN) Hub
                  </h3>
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                    PARTNER SYSTEM
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Partner with networks like Machinima, Maker Studios, or found your own custom network with local logos and branding.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('mcn')}
                  className="btn btn-primary text-xs py-1.5 px-3 font-bold shadow-2xs"
                >
                  🚀 Open Full MCN Simulator
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('studio')}
                  className="btn text-xs py-1.5 px-3 bg-neutral-800 text-white border-neutral-600 font-bold hover:bg-neutral-700"
                >
                  🎬 Creator Studio
                </button>
              </div>
            </div>

            {/* Active Contract Status */}
            {(() => {
              const activeNet = mcns.find((m) => m.id === channel.activeContract);
              return channel.activeContract ? (
                <div className="bg-green-50 border border-green-300 rounded p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-neutral-900 flex items-center justify-center text-white font-bold overflow-hidden border border-green-300">
                      {activeNet?.logoBase64 ? (
                        <img src={activeNet.logoBase64} alt={activeNet.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>[{activeNet?.tag || 'MCN'}]</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block">Signed Network Partner</span>
                      <strong className="text-green-800 text-sm">
                        {activeNet
                          ? `${activeNet.name} (${activeNet.splitPercentage}% creator / ${100 - activeNet.splitPercentage}% MCN, ${activeNet.cpmMultiplier}x CPM)`
                          : channel.activeContract === 'machinima'
                          ? 'Machinima Classic (1.5x CPM, 40% network cut)'
                          : channel.activeContract === 'maker'
                          ? 'Maker Studios (1.2x CPM, 50% split)'
                          : `Custom Network (${channel.activeContract})`}
                      </strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onVoidContract(channel.id)}
                    className="btn text-xs text-red-700 border-red-300 hover:bg-red-50"
                  >
                    Void Contract
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs text-amber-800 font-bold flex justify-between items-center">
                  <span>⚠️ Free Agent: Sign a contract below to begin monetization splits.</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('mcn')}
                    className="btn btn-primary text-xs py-1 px-3"
                  >
                    Found Your Own Network
                  </button>
                </div>
              );
            })()}

            {/* Dynamic Networks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mcns.map((net) => {
                const isCurrent = channel.activeContract === net.id;
                return (
                  <div key={net.id} className="bg-white border rounded p-3.5 shadow-2xs space-y-2 relative">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center font-bold text-white text-[10px] overflow-hidden border">
                          {net.logoBase64 ? (
                            <img src={net.logoBase64} alt={net.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>[{net.tag}]</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-900">{net.name}</h4>
                          <span className="text-[10px] text-gray-500">[{net.tag}]</span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-300">
                          Active ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSignContract(channel.id, net.id)}
                          className="btn btn-primary text-xs py-0.5 px-2.5 font-bold"
                        >
                          Sign
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-600 line-clamp-2">{net.description}</p>

                    <div className="flex justify-between items-center text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100">
                      <span>Split: <strong>{net.splitPercentage}% / {100 - net.splitPercentage}%</strong></span>
                      <span>CPM: <strong>{net.cpmMultiplier}x</strong></span>
                      <span>Partners: <strong>{net.signedChannelIds.length}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Link to MCN Network Simulator */}
            <div className="bg-gray-50 border border-gray-300 rounded p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  🎨 Want your own custom MCN with local image import, branding & Content ID?
                </h4>
                <p className="text-xs text-gray-500">
                  Open the full MCN Simulator to import local logo/banner files, scout creators, claim brand deals, and distribute monthly royalty payouts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('mcn')}
                className="btn btn-primary text-xs py-1.5 px-4 font-bold shadow-2xs whitespace-nowrap"
              >
                Launch MCN Simulator 🏢
              </button>
            </div>
          </div>
        )}

        {/* 5. Retro Shop Tab */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 flex justify-between items-center text-xs">
              <span className="font-bold text-amber-900">
                Unlock skeuomorphic channel themes, animated avatar borders, and home spotlight bids!
              </span>
              <span className="font-extrabold text-green-700 text-sm">
                Wallet: ${(channel.balance || 0).toFixed(2)}
              </span>
            </div>

            {/* Themes */}
            <div>
              <h4 className="font-bold text-xs text-gray-700 uppercase mb-2 border-b pb-1">
                Channel Background Themes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {shopInventory.themes.map((theme: any) => {
                  const isPurchased = channel.purchasedThemes?.includes(theme.id);
                  const isEquipped = channel.activeTheme === theme.id;
                  return (
                    <div key={theme.id} className="bg-white border rounded p-3 shadow-2xs space-y-2">
                      <div className="font-bold text-xs text-gray-800">{theme.name}</div>
                      <div className="h-6 rounded border shadow-inner" style={{ background: theme.bg }} />
                      <div className="flex justify-between items-center pt-2 border-t text-xs">
                        <span className="font-bold text-green-700">${theme.price.toFixed(2)}</span>
                        {isPurchased ? (
                          <button
                            type="button"
                            onClick={() => onToggleEquipTheme(channel.id, theme.id)}
                            className="btn text-xs py-0.5 px-2"
                          >
                            {isEquipped ? 'Unequip' : 'Equip'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBuyShopItem(channel.id, 'theme', theme.id)}
                            className="btn btn-primary text-xs py-0.5 px-2"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Borders */}
            <div>
              <h4 className="font-bold text-xs text-gray-700 uppercase mb-2 border-b pb-1">
                Animated Avatar Borders
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {shopInventory.borders.map((b: any) => {
                  const isPurchased = channel.purchasedBorders?.includes(b.id);
                  const isEquipped = channel.activeBorder === b.id;
                  return (
                    <div key={b.id} className="bg-white border rounded p-3 shadow-2xs space-y-2">
                      <div className="font-bold text-xs text-gray-800">{b.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border bg-gray-100" style={parseCssStringToReact(b.style)} />
                        <span className="text-[10px] text-gray-500">Live preview style</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t text-xs">
                        <span className="font-bold text-green-700">${b.price.toFixed(2)}</span>
                        {isPurchased ? (
                          <button
                            type="button"
                            onClick={() => onToggleEquipBorder(channel.id, b.id)}
                            className="btn text-xs py-0.5 px-2"
                          >
                            {isEquipped ? 'Unequip' : 'Equip'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBuyShopItem(channel.id, 'border', b.id)}
                            className="btn btn-primary text-xs py-0.5 px-2"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Priority Slot Promotion */}
            <div className="bg-white border rounded p-4 shadow-2xs space-y-2">
              <h4 className="font-bold text-xs text-gray-800">
                🚀 Bid $25.00 for Home Spotlight Placement
              </h4>
              <p className="text-xs text-gray-500">
                Pin your video in the homepage featured section with an illuminated cyan pulse banner.
              </p>
              {channelVideos.length > 0 ? (
                <div className="flex gap-2">
                  <select id="promo-vid-select" className="flex-1 text-xs p-1.5 border rounded">
                    {channelVideos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('promo-vid-select') as HTMLSelectElement;
                      if (select?.value) onBuyVideoPromotion(channel.id, select.value);
                    }}
                    className="btn btn-primary text-xs py-1.5 px-3"
                  >
                    Promote Video ($25)
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">Upload a video first to bid for promotion.</div>
              )}
            </div>
          </div>
        )}

        {/* 6. Memberships Setup Tab (Owner only) */}
        {activeTab === 'memberships' && isOwner && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 bg-green-50 border border-green-300 p-3 rounded">
              <input
                type="checkbox"
                id="ms-enabled-chk"
                checked={msEnabled}
                onChange={(e) => setMsEnabled(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="ms-enabled-chk" className="font-bold text-green-900 text-xs cursor-pointer">
                Enable Channel Memberships program on {channel.username}
              </label>
            </div>

            {/* Tiers List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Configure Tiers & Pricing:</span>
                <button
                  type="button"
                  onClick={() =>
                    setMsTiers((prev) => [
                      ...prev,
                      { name: `VIP Tier ${prev.length + 1}`, price: 9.99, badgeColor: '#3b82f6' },
                    ])
                  }
                  className="btn text-xs py-0.5 px-2"
                >
                  + Add Tier
                </button>
              </div>

              {msTiers.map((tier, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMsTiers((prev) => {
                        const u = [...prev];
                        u[idx].name = val;
                        return u;
                      });
                    }}
                    className="flex-1 text-xs p-1 border rounded bg-white"
                    placeholder="Tier Name"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMsTiers((prev) => {
                        const u = [...prev];
                        u[idx].price = val;
                        return u;
                      });
                    }}
                    className="w-20 text-xs p-1 border rounded bg-white"
                    placeholder="Price"
                  />
                  <input
                    type="color"
                    value={tier.badgeColor || '#e6c382'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMsTiers((prev) => {
                        const u = [...prev];
                        u[idx].badgeColor = val;
                        return u;
                      });
                    }}
                    className="w-8 h-7 p-0 border rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setMsTiers((prev) => prev.filter((_, i) => i !== idx))}
                    className="btn text-xs py-1 px-2 text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Exclusive Member Emojis */}
            <div className="border-t pt-4 space-y-3">
              <div className="font-bold text-xs text-gray-700">Add Member-Exclusive Emojis:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEmojiName}
                  onChange={(e) => setNewEmojiName(e.target.value)}
                  placeholder="Emoji Code (e.g. epicWin)"
                  className="flex-1 text-xs p-1.5 border rounded bg-white"
                />
                <label className="btn text-xs py-1.5 px-3 cursor-pointer">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && newEmojiName.trim()) {
                        processAndResizeImage(file, 128, 128).then((b64) => {
                          if (b64) {
                            onUploadMemberEmoji(channel.id, newEmojiName.trim(), b64);
                            setNewEmojiName('');
                          }
                        });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {channel.membershipSettings?.emojis?.map((em, eIdx) => (
                  <div key={eIdx} className="flex items-center gap-1.5 bg-gray-100 border p-1 rounded">
                    <img src={em.base64} alt={em.name} className="h-5 w-auto" />
                    <span className="text-[10px] font-bold text-gray-700">:{em.name}:</span>
                    <button
                      type="button"
                      onClick={() => onDeleteMemberEmoji(channel.id, eIdx)}
                      className="text-red-600 text-xs px-1 hover:font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right border-t pt-3">
              <button
                type="button"
                onClick={() =>
                  onSaveMembershipSettings(channel.id, {
                    enabled: msEnabled,
                    tiers: msTiers,
                    emojis: channel.membershipSettings?.emojis || [],
                  })
                }
                className="btn btn-primary text-xs py-2 px-6 font-bold"
              >
                Save Membership Program
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Featured Channels / Friends Sub-Box */}
      {featuredChannels.length > 0 && (
        <div className="mt-4 bg-white/95 rounded-lg border border-[#ccc] p-3 shadow-sm">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between border-b pb-1">
            <span>Featured Channels & Friends</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {featuredChannels.length} in Sub-Box
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {featuredChannels.map((fc) => (
              <div
                key={fc.id}
                onClick={() => onNavigate('channel', { id: fc.id })}
                className="flex flex-col items-center text-center p-2 rounded hover:bg-gray-100 cursor-pointer group transition-colors"
              >
                <img
                  src={fc.avatarBase64 || DEFAULT_AVATAR}
                  alt={fc.username}
                  className="w-12 h-12 rounded border border-gray-300 object-cover group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-bold text-blue-700 group-hover:underline mt-1 truncate w-full">
                  {fc.username}
                </span>
                <span className="text-[10px] text-gray-400">
                  {fc.subscribers.toLocaleString()} subs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Right 3D Gutter Rail */}
      {channel.borderGutterStyle && channel.borderGutterStyle !== 'none' && (
        <div className="hidden xl:flex flex-col items-center justify-between py-6 px-2 w-12 rounded-r-lg select-none flex-shrink-0 bg-black/75 border-y-2 border-r-2 border-white/20 backdrop-blur-md shadow-2xl text-[9px] font-black tracking-widest uppercase text-white">
          <div className="flex flex-col items-center gap-2">
            <span className="text-base animate-pulse">🎮</span>
            <div className="[writing-mode:vertical-rl] rotate-180 truncate py-6 text-cyan-400">
              {channel.rightGutterText || 'CLAN ROSTER • SPONSORS'}
            </div>
          </div>
          <div className="text-[8px] bg-cyan-600 text-white px-1 py-0.5 rounded font-mono font-bold">
            HD
          </div>
        </div>
      )}
      </div>

      {/* GIPHY Search & Embed Modal for Community Post */}
      <GiphySearchModal
        isOpen={isPostGiphyModalOpen}
        onClose={() => setIsPostGiphyModalOpen(false)}
        onSelectGif={(url) => {
          setImageSlots((prev) => {
            const clean = prev.filter(Boolean);
            return [...clean, url];
          });
        }}
        targetContextDescription={`Attach animated GIF to post on ${channel.username}'s channel`}
      />
    </div>
  );
};
