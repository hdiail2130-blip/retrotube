import React, { useState, useEffect } from 'react';
import { User, Video } from '../types';
import { processAndResizeImage } from '../utils/text';
import {
  PRESENT_CHANNEL_TOPICS,
  PRESET_AVATARS,
  PRESET_CHANNEL_STYLES,
  PRESET_YOUTUBE_CHANNELS,
  PresetYouTubeChannel,
  parseYouTubeChannelInput,
} from '../data/channelPresets';
import { extractYouTubeId } from '../utils/youtube';
import { resolveYouTubeChannelMetadata, ResolvedYouTubeChannel } from '../utils/youtubeChannelResolver';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  existingUsers: User[];
  onCreateChannel: (
    newChannel: Partial<User>,
    initialVideos?: Array<Partial<Video>>,
    switchImmediately?: boolean
  ) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  existingUsers,
  onCreateChannel,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'normal' | 'embed_youtube'>('normal');

  // Common Fields
  const [channelName, setChannelName] = useState('');
  const [topicMode, setTopicMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetTopic, setSelectedPresetTopic] = useState(PRESENT_CHANNEL_TOPICS[0].name);
  const [customTopic, setCustomTopic] = useState('');
  const [bio, setBio] = useState('Welcome to my official RetroTube broadcast channel! Rate 5 stars and subscribe!');
  const [subscribers, setSubscribers] = useState(0);

  // Appearance
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [customAvatarBase64, setCustomAvatarBase64] = useState<string | null>(null);
  const [customAvatarUrlInput, setCustomAvatarUrlInput] = useState('');
  const [avatarInputMode, setAvatarInputMode] = useState<'preset' | 'upload' | 'url'>('preset');

  const [selectedStyleId, setSelectedStyleId] = useState(PRESET_CHANNEL_STYLES[0].id);
  const [headerColor, setHeaderColor] = useState(PRESET_CHANNEL_STYLES[0].headerColor);
  const [accentColor, setAccentColor] = useState(PRESET_CHANNEL_STYLES[0].accentColor);
  const [bgColor, setBgColor] = useState(PRESET_CHANNEL_STYLES[0].bgColor);
  const [bgPattern, setBgPattern] = useState(PRESET_CHANNEL_STYLES[0].bgPattern);

  // YouTube Channel Embed Mode Fields
  const [ytLinkInput, setYtLinkInput] = useState('');
  const [ytChannelHandle, setYtChannelHandle] = useState('@');
  const [ytChannelUrl, setYtChannelUrl] = useState('');
  const [ytBannerUrl, setYtBannerUrl] = useState('');
  const [ytVideosText, setYtVideosText] = useState('');
  // Video Import Strategy: 'all' | 'top' | 'none'
  const [videoImportStrategy, setVideoImportStrategy] = useState<'all' | 'top' | 'none'>('all');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [activePresetMatch, setActivePresetMatch] = useState<PresetYouTubeChannel | null>(null);
  const [resolvedChannelData, setResolvedChannelData] = useState<ResolvedYouTubeChannel | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataFeedback, setMetadataFeedback] = useState<string | null>(null);
  const [showManualVideoEditor, setShowManualVideoEditor] = useState(false);

  // Status and Validation Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Apply a style preset
  const handleSelectStyle = (styleId: string) => {
    const style = PRESET_CHANNEL_STYLES.find((s) => s.id === styleId);
    if (!style) return;
    setSelectedStyleId(styleId);
    setHeaderColor(style.headerColor);
    setAccentColor(style.accentColor);
    setBgColor(style.bgColor);
    setBgPattern(style.bgPattern);
  };

  // Avatar upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processAndResizeImage(file, 200, 200);
        setCustomAvatarBase64(base64);
        setAvatarInputMode('upload');
      } catch (err) {
        setErrorMsg('Could not process avatar image.');
      }
    }
  };

  // YouTube Link parser handler
  const handleYtInputChange = (input: string) => {
    setYtLinkInput(input);
    setErrorMsg(null);
    setMetadataFeedback(null);

    const parsed = parseYouTubeChannelInput(input);
    setYtChannelHandle(parsed.normalizedHandle);
    setYtChannelUrl(parsed.channelUrl);

    if (parsed.matchedPreset) {
      setActivePresetMatch(parsed.matchedPreset);
      applyYouTubePreset(parsed.matchedPreset);
    } else {
      setActivePresetMatch(null);
      if (!channelName || channelName === 'New Channel' || channelName.startsWith('@')) {
        setChannelName(parsed.inferredName);
      }
    }
  };

  // 1-Click Apply YouTube Preset Channel
  const applyYouTubePreset = (preset: PresetYouTubeChannel) => {
    setActivePresetMatch(preset);
    setYtLinkInput(preset.url);
    setYtChannelHandle(preset.handle);
    setYtChannelUrl(preset.url);
    setChannelName(preset.name);
    setBio(preset.bio);
    setSubscribers(preset.subscribers);
    setSelectedAvatarUrl(preset.avatarUrl);
    setCustomAvatarBase64(null);
    setAvatarInputMode('preset');
    setYtBannerUrl(preset.bannerUrl);
    setHeaderColor(preset.headerColor);
    setAccentColor(preset.accentColor);

    // Topic
    setSelectedPresetTopic(preset.topic);
    setTopicMode('preset');

    // Initial Videos
    const videosListString = preset.videos
      .map((v) => `${v.youtubeId} | ${v.title}`)
      .join('\n');
    setYtVideosText(videosListString);
    setSelectedVideoIds(preset.videos.map((v) => v.youtubeId));
    setResolvedChannelData({
      name: preset.name,
      handle: preset.handle,
      url: preset.url,
      channelId: preset.channelId,
      avatarUrl: preset.avatarUrl,
      bannerUrl: preset.bannerUrl,
      bio: preset.bio,
      subscribers: preset.subscribers,
      topic: preset.topic,
      videos: preset.videos.map((v) => ({ ...v, thumb: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` })),
      source: 'preset',
      statusMessage: `Loaded official channel profile for ${preset.name}!`,
    });
    setMetadataFeedback(`Imported verified preset metadata for ${preset.name} (${preset.videos.length} videos available)!`);
  };

  // Live Deep Metadata Fetch for YouTube Links (Avatar, Bio, Handle, Videos)
  const handleFetchYouTubeMetadata = async () => {
    if (!ytLinkInput.trim()) {
      setMetadataFeedback('Please enter a YouTube link or handle first.');
      return;
    }

    setIsFetchingMetadata(true);
    setMetadataFeedback('Resolving native YouTube channel profile & avatar...');
    try {
      const res = await resolveYouTubeChannelMetadata(ytLinkInput);
      setResolvedChannelData(res);
      setChannelName(res.name);
      setYtChannelHandle(res.handle);
      setYtChannelUrl(res.url);
      setSelectedAvatarUrl(res.avatarUrl);
      setCustomAvatarBase64(null);
      setAvatarInputMode('preset');
      setBio(res.bio);
      setSubscribers(res.subscribers);
      if (res.bannerUrl) setYtBannerUrl(res.bannerUrl);

      // Prepopulate video list & selected IDs
      if (res.videos.length > 0) {
        const vText = res.videos.map((v) => `${v.youtubeId} | ${v.title}`).join('\n');
        setYtVideosText(vText);
        setSelectedVideoIds(res.videos.map((v) => v.youtubeId));
      }

      setMetadataFeedback(`✨ ${res.statusMessage}`);
    } catch {
      setMetadataFeedback('Link registered! You can finish customizing your profile details below.');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Live auto-detection when user pastes a YouTube channel link or handle
  useEffect(() => {
    if (mode !== 'embed_youtube' || !ytLinkInput.trim() || isFetchingMetadata) return;
    const clean = ytLinkInput.trim();
    if (resolvedChannelData && (clean === resolvedChannelData.url || clean === resolvedChannelData.handle)) return;

    const timer = setTimeout(() => {
      if (
        clean.length >= 3 &&
        (clean.includes('youtube.com') ||
          clean.includes('youtu.be') ||
          clean.startsWith('@') ||
          clean.startsWith('UC') ||
          clean.length === 11)
      ) {
        handleFetchYouTubeMetadata();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [ytLinkInput, mode]);

  // Active Effective Topic
  const effectiveTopic = topicMode === 'custom' ? (customTopic.trim() || 'General') : selectedPresetTopic;

  // Active Effective Avatar
  const effectiveAvatar =
    avatarInputMode === 'upload' && customAvatarBase64
      ? customAvatarBase64
      : avatarInputMode === 'url' && customAvatarUrlInput.trim()
      ? customAvatarUrlInput.trim()
      : selectedAvatarUrl;

  // Form Submit Handler
  const handleSubmit = (switchImmediately: boolean) => {
    const trimmedName = channelName.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter a channel name.');
      return;
    }

    // Check duplicate name
    const exists = existingUsers.some(
      (u) => u.username.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      setErrorMsg(`A channel named "${trimmedName}" already exists. Please choose a distinct name or handle.`);
      return;
    }

    const isYoutube = mode === 'embed_youtube';

    // Prepare initial videos based on chosen strategy
    const initialVideos: Array<Partial<Video>> = [];

    if (isYoutube && videoImportStrategy !== 'none') {
      let candidateVideos: Array<{
        title: string;
        desc?: string;
        category?: string;
        youtubeId: string;
        views?: number;
        time?: string;
      }> = [];

      // Source 1: Check if user edited text in ytVideosText
      if (ytVideosText.trim()) {
        const lines = ytVideosText.split('\n').map((l) => l.trim()).filter(Boolean);
        lines.forEach((line, index) => {
          const parts = line.split('|');
          const rawIdOrUrl = parts[0].trim();
          const customTitle = parts[1]?.trim() || `Upload #${index + 1}`;
          const id = extractYouTubeId(rawIdOrUrl);
          if (id) {
            candidateVideos.push({
              title: customTitle,
              desc: `Official video from ${trimmedName}'s YouTube channel.`,
              category: effectiveTopic.split('&')[0].trim() || 'Entertainment',
              youtubeId: id,
              views: Math.floor(Math.random() * 5000) + 120,
              time: '3:30',
            });
          }
        });
      } else if (resolvedChannelData && resolvedChannelData.videos.length > 0) {
        candidateVideos = resolvedChannelData.videos;
      } else if (activePresetMatch) {
        candidateVideos = activePresetMatch.videos;
      }

      // Filter based on strategy ('all' vs 'top')
      let targetVideos: typeof candidateVideos = [];
      if (videoImportStrategy === 'top') {
        targetVideos = candidateVideos.slice(0, 3);
      } else {
        // 'all' strategy: respect user's selected video checkboxes if available
        if (selectedVideoIds.length > 0 && !showManualVideoEditor) {
          const selectedSet = new Set(selectedVideoIds);
          targetVideos = candidateVideos.filter((v) => selectedSet.has(v.youtubeId));
        } else {
          targetVideos = candidateVideos;
        }
      }

      targetVideos.forEach((v) => {
        initialVideos.push({
          title: v.title,
          desc: v.desc || `Official video from ${trimmedName}'s YouTube channel.`,
          category: v.category || effectiveTopic.split('&')[0].trim() || 'Entertainment',
          youtubeId: v.youtubeId,
          views: v.views ?? (Math.floor(Math.random() * 8500) + 240),
          time: v.time || '3:45',
          thumb: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
        });
      });
    }

    const newChannelData: Partial<User> = {
      username: trimmedName,
      bio: bio.trim(),
      subscribers: Number(subscribers) || 0,
      topic: effectiveTopic,
      customTopic: topicMode === 'custom' ? customTopic.trim() : undefined,
      avatarBase64: effectiveAvatar,
      bannerBase64: ytBannerUrl.trim() || undefined,
      headerColor,
      accentColor,
      bgColor,
      bgPattern: bgPattern as any,
      isYoutubeImported: isYoutube,
      youtubeChannelUrl: isYoutube ? (ytChannelUrl.trim() || `https://www.youtube.com/${ytChannelHandle}`) : undefined,
      youtubeChannelHandle: isYoutube ? ytChannelHandle : undefined,
      youtubeChannelId: isYoutube ? (resolvedChannelData?.channelId || activePresetMatch?.channelId) : undefined,
      channelType: isYoutube ? 'personal' : 'personal',
      joinedDate: 'Joined ' + new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      balance: 100.0,
      subscriptions: [currentUser.id],
      memberships: {},
    };

    onCreateChannel(newChannelData, initialVideos, switchImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#f4f4f4] border-2 border-[#999] rounded shadow-2xl max-w-2xl w-full my-auto text-xs font-sans text-gray-800 flex flex-col max-h-[92vh]">
        
        {/* Retro Dialog Header */}
        <div className="bg-gradient-to-r from-[#cc181e] via-[#e62117] to-[#991b1b] text-white px-4 py-2.5 flex items-center justify-between shadow-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-base">📺</span>
            <span className="font-extrabold text-sm tracking-wide">
              {mode === 'normal' ? 'Create a New RetroTube Channel' : 'Import YouTube Channel From Link'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold text-sm px-1.5 py-0.5 rounded hover:bg-black/20 cursor-pointer"
            title="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-gray-300 bg-[#e9e9e9] px-3 pt-2 gap-1 text-xs select-none">
          <button
            type="button"
            onClick={() => {
              setMode('normal');
              setErrorMsg(null);
            }}
            className={`py-2 px-3.5 rounded-t font-bold transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              mode === 'normal'
                ? 'bg-[#f4f4f4] border-gray-400 border-b-[#f4f4f4] text-[#cc181e] -mb-[1px] shadow-xs'
                : 'bg-gray-200 border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>👤</span>
            <span>Normal Channel Create</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('embed_youtube');
              setErrorMsg(null);
            }}
            className={`py-2 px-3.5 rounded-t font-bold transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              mode === 'embed_youtube'
                ? 'bg-[#f4f4f4] border-gray-400 border-b-[#f4f4f4] text-[#cc181e] -mb-[1px] shadow-xs'
                : 'bg-gray-200 border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🔗</span>
            <span>Import Channel from YouTube</span>
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black ml-1">
              NEW
            </span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-2.5 bg-red-100 border border-red-400 rounded text-red-700 font-bold text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ===================== MODE 2: IMPORT YOUTUBE CHANNEL ===================== */}
          {mode === 'embed_youtube' && (
            <div className="bg-white border border-gray-300 rounded p-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                    <span>📺</span>
                    <span>Link Official YouTube Channel</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Paste any YouTube channel link, handle, or select a verified classic preset to import into RetroTube.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                  YouTube Sync
                </span>
              </div>

              {/* YouTube Link / Handle Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  YouTube Channel URL or Handle <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={ytLinkInput}
                    onChange={(e) => handleYtInputChange(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/@LofiGirl or @RickAstleyVEVO"
                    className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded bg-white font-mono focus:outline-none focus:border-red-600 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleFetchYouTubeMetadata}
                    disabled={isFetchingMetadata || !ytLinkInput.trim()}
                    className="btn py-1.5 px-3 font-bold text-xs bg-red-600 text-white hover:bg-red-700 border-red-700 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                    title="Resolve metadata via YouTube link"
                  >
                    {isFetchingMetadata ? 'Fetching...' : '🔍 Fetch Info'}
                  </button>
                </div>
                {metadataFeedback && (
                  <p className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                    <span>ℹ️</span>
                    <span>{metadataFeedback}</span>
                  </p>
                )}
              </div>

              {/* Detected Native Profile Card */}
              {resolvedChannelData && (
                <div className="bg-red-50 border border-red-300 rounded p-3 flex flex-col sm:flex-row items-center sm:items-start gap-3 shadow-inner">
                  <div className="relative">
                    <img
                      src={resolvedChannelData.avatarUrl}
                      alt={resolvedChannelData.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-md bg-white"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1 rounded-full border border-white">
                      ▶
                    </span>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <strong className="text-sm text-gray-900 font-black">{resolvedChannelData.name}</strong>
                      <span className="text-red-700 font-mono text-[11px] font-bold">{resolvedChannelData.handle}</span>
                      <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                        ✓ Verified YouTube Profile
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 italic line-clamp-2 mt-0.5">
                      &quot;{resolvedChannelData.bio}&quot;
                    </p>
                    <div className="text-[10px] text-gray-500 mt-1 font-bold">
                      Est. {resolvedChannelData.subscribers.toLocaleString()} subscribers • {resolvedChannelData.videos.length} videos detected • Source: {resolvedChannelData.source}
                    </div>
                  </div>
                </div>
              )}

              {/* 1-Click Preset YouTube Channels */}
              <div>
                <span className="text-[11px] font-bold text-gray-600 mb-1 block">
                  ⚡ Or click a verified 1-Click Preset to test immediately:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-gray-200 rounded">
                  {PRESET_YOUTUBE_CHANNELS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyYouTubePreset(preset)}
                      className={`px-2 py-1 rounded text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        activePresetMatch?.id === preset.id
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                      }`}
                    >
                      <img
                        src={preset.avatarUrl}
                        alt={preset.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{preset.handle}</span>
                      <span className="text-[9px] opacity-75">({preset.videos.length} vids)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Import Strategy Selection (All Videos vs Channel Only) */}
              <div className="bg-gray-50 border border-gray-300 rounded p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                  <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                    <span>🎬</span>
                    <span>Video Import Options (Catalog or Channel Only)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowManualVideoEditor(!showManualVideoEditor)}
                    className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    {showManualVideoEditor ? 'Hide Video Editor ▲' : 'Edit Video IDs / URLs ▼'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`border rounded p-2.5 cursor-pointer flex flex-col justify-between transition-all ${
                      videoImportStrategy === 'all'
                        ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-400 font-bold'
                        : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="videoImportStrategy"
                        checked={videoImportStrategy === 'all'}
                        onChange={() => setVideoImportStrategy('all')}
                      />
                      <span className="font-extrabold text-xs">Import All Videos</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Imports all detected/preset videos ({resolvedChannelData?.videos.length || activePresetMatch?.videos.length || 'Full'} videos) with retro player skin support.
                    </p>
                  </label>

                  <label
                    className={`border rounded p-2.5 cursor-pointer flex flex-col justify-between transition-all ${
                      videoImportStrategy === 'top'
                        ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-400 font-bold'
                        : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="videoImportStrategy"
                        checked={videoImportStrategy === 'top'}
                        onChange={() => setVideoImportStrategy('top')}
                      />
                      <span className="font-extrabold text-xs">Top 3 Videos Only</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Imports only the top 3 flagship uploads as featured streams.
                    </p>
                  </label>

                  <label
                    className={`border rounded p-2.5 cursor-pointer flex flex-col justify-between transition-all ${
                      videoImportStrategy === 'none'
                        ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-400 font-bold'
                        : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="videoImportStrategy"
                        checked={videoImportStrategy === 'none'}
                        onChange={() => setVideoImportStrategy('none')}
                      />
                      <span className="font-extrabold text-xs">Channel Profile Only</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      0 videos imported initially. Native YouTube avatar, bio, and badge ready for new uploads!
                    </p>
                  </label>
                </div>

                {/* Interactive Video Catalog Selector (When videos detected and strategy is 'all') */}
                {videoImportStrategy === 'all' && resolvedChannelData && resolvedChannelData.videos.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black text-gray-700">
                        Select Videos to Import ({selectedVideoIds.length} of {resolvedChannelData.videos.length} selected):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedVideoIds(resolvedChannelData.videos.map((v) => v.youtubeId))}
                          className="text-[10px] text-blue-700 hover:underline font-bold"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedVideoIds([])}
                          className="text-[10px] text-gray-500 hover:underline"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-1 p-1 bg-white border border-gray-200 rounded">
                      {resolvedChannelData.videos.map((vid) => {
                        const isSelected = selectedVideoIds.includes(vid.youtubeId);
                        return (
                          <label
                            key={vid.youtubeId}
                            className={`flex items-center gap-2 p-1.5 rounded border transition-colors cursor-pointer text-xs ${
                              isSelected ? 'bg-red-50/70 border-red-200' : 'bg-gray-50 border-gray-200 opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedVideoIds((prev) =>
                                  prev.includes(vid.youtubeId)
                                    ? prev.filter((id) => id !== vid.youtubeId)
                                    : [...prev, vid.youtubeId]
                                );
                              }}
                              className="accent-red-600"
                            />
                            <img
                              src={vid.thumb || `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                              alt={vid.title}
                              className="w-12 h-8 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 truncate">{vid.title}</div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                <span>⏱️ {vid.time}</span>
                                <span>•</span>
                                <span>{vid.views.toLocaleString()} views</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showManualVideoEditor && (
                  <div className="pt-2 border-t border-gray-200">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Custom Video Links / IDs (1 per line in format: <code className="font-mono">videoId | Title</code>):
                    </label>
                    <textarea
                      rows={3}
                      value={ytVideosText}
                      onChange={(e) => setYtVideosText(e.target.value)}
                      placeholder={'jfKfPfyJRdk | lofi hip hop radio - beats to relax/study to\nrUxyKA_-grg | lofi sleep radio\n(or paste YouTube URLs)'}
                      className="w-full text-xs p-2 border border-gray-300 rounded font-mono bg-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== COMMON CHANNEL IDENTITY ===================== */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
              <span>🏷️</span>
              <span>Channel Identity & Topic</span>
            </h3>

            {/* Channel Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Channel Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. RetroGamer88, MachinimaHQ, SynthVlogs..."
                className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-red-600 font-sans shadow-inner"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Channel URL: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">http://retrotube.com/user/{channelName.replace(/\s+/g, '') || 'YourChannel'}</code>
              </p>
            </div>

            {/* Topic Selection (Preset or Custom) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Channel Topic / Category <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="topicMode"
                      checked={topicMode === 'preset'}
                      onChange={() => setTopicMode('preset')}
                    />
                    <span>Choose Present Topic</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="topicMode"
                      checked={topicMode === 'custom'}
                      onChange={() => setTopicMode('custom')}
                    />
                    <span>Type Custom Topic</span>
                  </label>
                </div>
              </div>

              {topicMode === 'preset' ? (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESENT_CHANNEL_TOPICS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedPresetTopic(t.name)}
                        className={`text-left p-1.5 rounded border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          selectedPresetTopic === t.name
                            ? 'bg-red-50 border-red-600 text-red-700 shadow-2xs'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                        }`}
                        title={t.description}
                      >
                        <span className="text-sm">{t.icon}</span>
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Type your own custom topic (e.g. YTP Remasters, Speedrunning, Chiptunes, AMVs...)"
                    className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-red-600 font-sans shadow-inner"
                  />
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-600">
                    <span className="font-bold">Suggestions:</span>
                    {['YouTube Poop (YTP)', 'Speedrunning', 'Flash Cartoons', 'Vaporwave', 'Unboxings', 'Anime AMV'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setCustomTopic(sug)}
                        className="bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded border border-gray-300 cursor-pointer font-medium"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Channel Bio */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Channel Bio & About Description
                </label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setBio('Welcome to my 2000s channel! Sub for sub, rate 5 stars, leave comments!')}
                    className="text-red-700 hover:underline cursor-pointer font-bold"
                  >
                    Template 1
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setBio('Gaming walkthroughs, Machinima series, high-octane frags every week!')}
                    className="text-red-700 hover:underline cursor-pointer font-bold"
                  >
                    Template 2
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell viewers what your channel is about..."
                className="w-full text-xs p-2 border border-gray-300 rounded bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Starting Subscribers */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-2 text-xs">
              <span className="font-bold text-gray-700">Starting Subscribers</span>
              <div className="flex items-center gap-2">
                {[0, 42, 100, 1337].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSubscribers(num)}
                    className={`px-2 py-0.5 rounded text-xs font-bold border cursor-pointer ${
                      subscribers === num
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    {num.toLocaleString()}
                  </button>
                ))}
                <input
                  type="number"
                  min={0}
                  value={subscribers}
                  onChange={(e) => setSubscribers(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-20 text-xs px-2 py-0.5 border border-gray-300 rounded bg-white text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* ===================== AVATAR & RETRO THEME STYLING ===================== */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
              <span>🎨</span>
              <span>Avatar & Visual Retro Styling</span>
            </h3>

            {/* Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">Choose Avatar</label>
                <div className="flex gap-2 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAvatarInputMode('preset')}
                    className={`cursor-pointer ${avatarInputMode === 'preset' ? 'text-red-600 underline' : 'text-gray-500'}`}
                  >
                    2000s Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarInputMode('upload')}
                    className={`cursor-pointer ${avatarInputMode === 'upload' ? 'text-red-600 underline' : 'text-gray-500'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarInputMode('url')}
                    className={`cursor-pointer ${avatarInputMode === 'url' ? 'text-red-600 underline' : 'text-gray-500'}`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {avatarInputMode === 'preset' && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatarUrl(av.url);
                        setCustomAvatarBase64(null);
                      }}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all p-0.5 bg-gray-100 cursor-pointer ${
                        effectiveAvatar === av.url ? 'border-red-600 scale-105 shadow-xs' : 'border-gray-300 hover:border-gray-500'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              )}

              {avatarInputMode === 'upload' && (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                  />
                  {customAvatarBase64 && (
                    <img src={customAvatarBase64} alt="Avatar Preview" className="w-10 h-10 rounded border object-cover shadow-xs" />
                  )}
                </div>
              )}

              {avatarInputMode === 'url' && (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customAvatarUrlInput}
                    onChange={(e) => setCustomAvatarUrlInput(e.target.value)}
                    placeholder="https://example.com/my-avatar.jpg"
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                  />
                </div>
              )}
            </div>

            {/* Theme Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Channel Theme Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_CHANNEL_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStyle(st.id)}
                    className={`p-2 rounded border text-left flex items-center justify-between cursor-pointer transition-all ${
                      selectedStyleId === st.id
                        ? 'border-red-600 bg-red-50/50 shadow-xs'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-bold text-xs truncate">{st.name}</span>
                    <span
                      className="w-4 h-4 rounded-full border border-gray-400 shrink-0 ml-1.5"
                      style={{ backgroundColor: st.headerColor }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===================== LIVE CHANNEL PREVIEW CARD ===================== */}
          <div className="border-2 border-dashed border-gray-300 rounded p-3 bg-white space-y-2">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
              👀 Live Channel Preview
            </span>
            <div
              className="p-3 rounded border border-gray-300 relative overflow-hidden"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <img
                  src={effectiveAvatar}
                  alt="Channel Avatar Preview"
                  className="w-14 h-14 rounded border-2 border-white shadow object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-base text-gray-900 truncate">
                      {channelName.trim() || 'Your Channel Name'}
                    </h4>
                    {mode === 'embed_youtube' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow-2xs">
                        <span>▶</span>
                        <span>Official YouTube</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-600 flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="font-bold bg-white/80 border border-gray-300 px-1.5 py-0.2 rounded text-[10px]">
                      📁 {effectiveTopic}
                    </span>
                    <span>•</span>
                    <span>{subscribers.toLocaleString()} subscribers</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-1 italic">
                    &ldquo;{bio}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Footer Actions */}
        <div className="bg-gray-100 border-t border-gray-300 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-gray-500">
            <span>You can switch between all your channels anytime from the top bar!</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn text-xs py-1.5 px-3 font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="btn text-xs py-1.5 px-3 font-bold bg-gray-200 hover:bg-gray-300 text-gray-800"
              title="Create channel and keep your current active user"
            >
              Create Channel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="btn btn-primary text-xs py-1.5 px-4 font-black shadow-xs cursor-pointer flex items-center gap-1"
              title="Create channel and immediately switch into it"
            >
              <span>🚀</span>
              <span>Create & Switch Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
