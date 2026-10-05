import React, { useState } from 'react';
import { ChannelSocialLink, User, Video } from '../types';
import { processAndResizeImage, parseCssStringToReact } from '../utils/text';
import { DEFAULT_AVATAR } from '../data/initialData';
import { PRESENT_CHANNEL_TOPICS, parseYouTubeChannelInput } from '../data/channelPresets';
import {
  WALLPAPER_PRESETS,
  HEADER_BANNER_PRESETS,
  FONT_PAIRING_PRESETS,
  HEX_COLOR_PALETTES,
  hexToRgba,
  getChannelWallpaperStyle,
  getChannelFontClass,
  WallpaperPreset,
  HeaderBannerPreset,
} from '../utils/channelThemes';

interface ChannelCustomizerViewProps {
  channel: User;
  videos: Video[];
  users: User[];
  shopInventory: any;
  onSave: (updatedChannel: Partial<User>) => void;
  onDeleteChannel: (channelId: string) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export const ChannelCustomizerView: React.FC<ChannelCustomizerViewProps> = ({
  channel,
  videos,
  users,
  shopInventory,
  onSave,
  onDeleteChannel,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'appearance' | 'content' | 'social'>('branding');

  // Form states - Branding
  const [username, setUsername] = useState(channel.username);
  const [bio, setBio] = useState(channel.bio);
  const [subscribers, setSubscribers] = useState(channel.subscribers);
  const [topicMode, setTopicMode] = useState<'preset' | 'custom'>(
    channel.customTopic ? 'custom' : 'preset'
  );
  const [selectedPresetTopic, setSelectedPresetTopic] = useState<string>(
    channel.topic || PRESENT_CHANNEL_TOPICS[0].name
  );
  const [customTopic, setCustomTopic] = useState<string>(channel.customTopic || '');
  const [isYoutubeImported, setIsYoutubeImported] = useState<boolean>(channel.isYoutubeImported || false);
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState<string>(channel.youtubeChannelUrl || '');
  const [youtubeChannelHandle, setYoutubeChannelHandle] = useState<string>(channel.youtubeChannelHandle || '');
  const [bannerHeight, setBannerHeight] = useState<'compact' | 'normal' | 'extended' | 'panoramic'>(
    channel.bannerHeight || (channel.customBannerExtended ? 'extended' : 'normal')
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgFileSizeKB, setBgFileSizeKB] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [customLogoType, setCustomLogoType] = useState<string>(channel.customLogoType || 'none');
  const [customLogoBase64, setCustomLogoBase64] = useState<string>(channel.customLogoBase64 || '');

  // Appearance & Themes
  const [bgColor, setBgColor] = useState(channel.bgColor || '#ffffff');
  const [bgPattern, setBgPattern] = useState<string>(channel.bgPattern || 'none');
  const [bgRepeat, setBgRepeat] = useState<'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'>(
    channel.bgRepeat || 'repeat'
  );
  const [bgFixed, setBgFixed] = useState(channel.bgFixed ?? true);
  const [channelOpacity, setChannelOpacity] = useState(channel.channelOpacity ?? 95);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono' | 'impact' | 'comic' | 'homebrew' | 'c4d_clan'>(
    channel.fontFamily || 'sans'
  );
  const [headerColor, setHeaderColor] = useState(channel.headerColor || '#cc181e');
  const [accentColor, setAccentColor] = useState(channel.accentColor || '#cc181e');
  const [activeTheme, setActiveTheme] = useState(channel.activeTheme || '');
  const [activeBorder, setActiveBorder] = useState(channel.activeBorder || '');

  // Wallpaper Scope & 3D Gutter states
  const [bgWallpaperScope, setBgWallpaperScope] = useState<'channel_only' | 'channel_and_videos'>(
    channel.bgWallpaperScope || 'channel_only'
  );
  const [borderGutterStyle, setBorderGutterStyle] = useState<'none' | 'c4d_metallic' | 'graffiti_fx' | 'cod_camo' | 'homebrew_matrix' | 'frutiger_gloss'>(
    channel.borderGutterStyle || 'none'
  );
  const [leftGutterText, setLeftGutterText] = useState(channel.leftGutterText || '');
  const [rightGutterText, setRightGutterText] = useState(channel.rightGutterText || '');

  // Wrapper/Box Transparency & Colors
  const [boxFillColor, setBoxFillColor] = useState(channel.boxFillColor || '#ffffff');
  const [borderColor, setBorderColor] = useState(channel.borderColor || '#cccccc');
  const [borderStyle, setBorderStyle] = useState<'solid' | 'double' | 'dashed' | 'groove' | 'ridge'>(
    channel.borderStyle || 'solid'
  );
  const [textColor, setTextColor] = useState(channel.textColor || '#1f2937');
  const [highlightColor, setHighlightColor] = useState(channel.highlightColor || '#0033cc');

  // Custom Banners, Branding Headers & Partner Badges
  const [partnerBadgeType, setPartnerBadgeType] = useState<'none' | 'machinima' | 'maker' | 'fullscreen' | 'director' | 'musician' | 'guru' | 'homebrew'>(
    channel.partnerBadgeType || 'none'
  );
  const [bannerTagline, setBannerTagline] = useState(channel.bannerTagline || '');
  const [customCssText, setCustomCssText] = useState(channel.customCssText || '');

  // Content & Features
  const [featuredVideoId, setFeaturedVideoId] = useState(channel.featuredVideoId || '');
  const [channelBulletin, setChannelBulletin] = useState(channel.channelBulletin || '');
  const [featuredChannelIds, setFeaturedChannelIds] = useState<string[]>(
    channel.featuredChannelIds || []
  );

  // Social Links
  const [socialLinks, setSocialLinks] = useState<ChannelSocialLink[]>(
    channel.socialLinks || [
      { platform: 'Twitter / X', url: 'https://twitter.com' },
      { platform: 'Discord', url: 'https://discord.gg' },
    ]
  );
  const [newPlatform, setNewPlatform] = useState('Website');
  const [newUrl, setNewUrl] = useState('');

  // Channel videos
  const myVideos = videos.filter((v) => v.authorId === channel.id);
  const otherUsers = users.filter((u) => u.id !== channel.id);

  const handleAddSocialLink = () => {
    if (!newUrl.trim()) return;
    setSocialLinks((prev) => [...prev, { platform: newPlatform, url: newUrl.trim() }]);
    setNewUrl('');
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleFeaturedChannel = (userId: string) => {
    setFeaturedChannelIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setBgFile(null);
      setBgFileSizeKB(null);
      return;
    }
    const kb = Math.round(file.size / 1024);
    setBgFileSizeKB(kb);
    setBgFile(file);
    setBgPattern('custom');
  };

  const applyWallpaperPreset = (preset: WallpaperPreset) => {
    setBgPattern(preset.id);
    setBgColor(preset.defaultBgColor);
    setBoxFillColor(preset.defaultBoxFill);
    setBorderColor(preset.defaultBorderColor);
    setHighlightColor(preset.defaultHighlightColor);
    setHeaderColor(preset.defaultHeaderColor);
    setFontFamily(preset.defaultFont);
    setChannelOpacity(preset.defaultOpacity);
    setBorderGutterStyle(preset.gutterStyle);
    if (!leftGutterText || leftGutterText === 'MACHINIMA PARTNER • 1080p') {
      setLeftGutterText(preset.leftGutterSample);
    }
    if (!rightGutterText || rightGutterText === 'CLAN ROSTER • SPONSORS') {
      setRightGutterText(preset.rightGutterSample);
    }
  };

  const applyHeaderBannerPreset = (preset: HeaderBannerPreset) => {
    setBannerHeight(preset.height);
    setPartnerBadgeType(preset.badge as any);
    setBannerTagline(preset.tagline);
    if (preset.customCss) setCustomCssText(preset.customCss);
  };

  // 1-Click Iconic Era Presets
  const applyMachinimaPreset = () => {
    setBgPattern('c4d_metal');
    setBgColor('#000000');
    setBoxFillColor('#0d0d0d');
    setBorderColor('#cc181e');
    setBorderStyle('solid');
    setHighlightColor('#ff2233');
    setHeaderColor('#b30000');
    setTextColor('#ffffff');
    setFontFamily('c4d_clan');
    setChannelOpacity(90);
    setBorderGutterStyle('c4d_metallic');
    setLeftGutterText('MACHINIMA PARTNER • 1080p HD');
    setRightGutterText('SPONSORED BY G-FUEL • TWITTER @CLAN');
    setPartnerBadgeType('machinima');
    setBannerHeight('extended');
    setBannerTagline('OFFICIAL MACHINIMA BROADCASTER • Cinema 4D Montages & Action');
    setCustomCssText('box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 4px 15px rgba(204,24,30,0.4);');
  };

  const applyHomebrewPreset = () => {
    setBgPattern('homebrew');
    setBgColor('#051824');
    setBoxFillColor('#0a2233');
    setBorderColor('#38bdf8');
    setBorderStyle('solid');
    setHighlightColor('#7dd3fc');
    setHeaderColor('#0369a1');
    setTextColor('#e0f2fe');
    setFontFamily('homebrew');
    setChannelOpacity(85);
    setBorderGutterStyle('homebrew_matrix');
    setLeftGutterText('HOMEBREW SYSTEM v1.0.8');
    setRightGutterText('CUSTOM APPS • THEME LOADER');
    setPartnerBadgeType('homebrew');
    setCustomLogoType('homebrew');
    setBannerHeight('normal');
    setBannerTagline('THE HOMEBREW CHANNEL NETWORK • Custom Firmware & Retro Emulators');
    setCustomCssText('box-shadow: inset 0 0 30px rgba(0,240,255,0.3); border-bottom: 3px solid #38bdf8;');
  };

  const applyClanGraffitiPreset = () => {
    setBgPattern('graffiti');
    setBgColor('#07090e');
    setBoxFillColor('#0e121a');
    setBorderColor('#00f0ff');
    setBorderStyle('solid');
    setHighlightColor('#00f0ff');
    setHeaderColor('#005b82');
    setTextColor('#f3f4f6');
    setFontFamily('impact');
    setChannelOpacity(85);
    setBorderGutterStyle('graffiti_fx');
    setLeftGutterText('CLAN SNIPING • MONTAGE EDITS');
    setRightGutterText('SUB 4 SUB • AIM HIGH');
    setPartnerBadgeType('director');
    setBannerHeight('panoramic');
    setBannerTagline('★ CLAN GAMING 3D MONTAGE UNIT • C4D BEVELS & GRAFFITI ART ★');
    setCustomCssText('border-bottom: 3px solid #00f0ff; box-shadow: 0 0 25px rgba(0,240,255,0.5);');
  };

  const applyCodCamoPreset = () => {
    setBgPattern('cod_camo');
    setBgColor('#0a0a0a');
    setBoxFillColor('#121212');
    setBorderColor('#f97316');
    setBorderStyle('solid');
    setHighlightColor('#fb923c');
    setHeaderColor('#c2410c');
    setTextColor('#ffffff');
    setFontFamily('c4d_clan');
    setChannelOpacity(90);
    setBorderGutterStyle('cod_camo');
    setLeftGutterText('QUICKSCOPE MONTAGE • 720p 60FPS');
    setRightGutterText('LEADERBOARD RANK #1 • FAZE CLAN');
    setPartnerBadgeType('machinima');
    setBannerHeight('extended');
    setBannerTagline('CALL OF DUTY CLAN SNIPING • Tactical Montage Unit');
    setCustomCssText('border-bottom: 3px solid #f97316; box-shadow: 0 0 20px rgba(249,115,22,0.4);');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let avatarBase64 = channel.avatarBase64;
    let bannerBase64 = channel.bannerBase64;
    let bgImageBase64 = channel.bgImageBase64;
    let savedCustomLogoBase64 = customLogoBase64;

    if (avatarFile) {
      avatarBase64 = await processAndResizeImage(avatarFile, 256, 256);
    }
    if (bannerFile) {
      bannerBase64 = await processAndResizeImage(bannerFile, 1280, 480);
    }
    if (bgFile) {
      // If image is larger than 256KB, compress & scale nicely to fit authentic tube spec
      const maxDim = (bgFileSizeKB && bgFileSizeKB > 256) ? 1440 : 1920;
      bgImageBase64 = await processAndResizeImage(bgFile, maxDim, 1080);
    }
    if (logoFile) {
      savedCustomLogoBase64 = await processAndResizeImage(logoFile, 256, 256);
    }

    const effectiveTopic = topicMode === 'custom' ? (customTopic.trim() || 'General') : selectedPresetTopic;

    onSave({
      username,
      bio,
      subscribers,
      topic: effectiveTopic,
      customTopic: topicMode === 'custom' ? customTopic.trim() : undefined,
      isYoutubeImported,
      youtubeChannelUrl: youtubeChannelUrl.trim() || undefined,
      youtubeChannelHandle: youtubeChannelHandle.trim() || undefined,
      bannerHeight,
      customBannerExtended: bannerHeight === 'extended' || bannerHeight === 'panoramic',
      bgColor,
      bgPattern: bgPattern as any,
      bgRepeat,
      bgFixed,
      channelOpacity,
      fontFamily,
      headerColor,
      accentColor,
      boxFillColor,
      borderColor,
      borderStyle,
      textColor,
      highlightColor,
      bgWallpaperScope,
      borderGutterStyle,
      leftGutterText: leftGutterText.trim() || undefined,
      rightGutterText: rightGutterText.trim() || undefined,
      partnerBadgeType,
      bannerTagline: bannerTagline.trim() || undefined,
      customCssText: customCssText.trim() || undefined,
      customLogoType: customLogoType as any,
      customLogoBase64: savedCustomLogoBase64 || undefined,
      activeTheme: activeTheme || null,
      activeBorder: activeBorder || null,
      featuredVideoId: featuredVideoId || undefined,
      channelBulletin: channelBulletin.trim() || undefined,
      featuredChannelIds,
      socialLinks,
      avatarBase64,
      bannerBase64,
      bgImageBase64,
    });
  };

  // Preview calculations
  const previewFontClass = getChannelFontClass(fontFamily);
  const containerOpacity = channelOpacity / 100;
  const previewWallpaperStyle = getChannelWallpaperStyle({
    bgColor,
    bgPattern,
    bgImageBase64: channel.bgImageBase64,
    bgRepeat,
    bgFixed,
  });

  return (
    <div className="max-w-5xl mx-auto my-4 text-xs select-none space-y-4">
      {/* Top Header Card */}
      <div className="card-panel bg-white border border-[#ccc] p-3 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎨</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm text-gray-900">
                Channel Studio: Custom Wallpapers, Banners & Theme Hex Customizer
              </h1>
              <span className="text-[10px] font-mono bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">
                NEW UPDATE
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Authentic 2008-2011 YouTube Channel Customizer: upload full-page wallpapers (up to 256KB), 3D C4D gutter framing, Machinima banners, exact hex codes, and clan font pairings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('channel', { id: channel.id })}
            className="btn text-xs py-1 px-3"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDeleteChannel(channel.id)}
            className="btn text-xs py-1 px-2.5 text-red-600 border-red-300 hover:bg-red-50"
          >
            ⚠️ Delete Channel
          </button>
        </div>
      </div>

      {/* 1-Click Iconic Era Quick Kits */}
      <div className="bg-gradient-to-r from-neutral-900 via-zinc-900 to-black text-white p-3 rounded-lg border border-neutral-700 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-black text-xs text-amber-300">
            <span>⚡</span>
            <span>1-Click Iconic Channel Layout Presets:</span>
          </div>
          <span className="text-[10px] text-neutral-400">Instantly sets wallpaper, exact hex colors, opacity & gutters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={applyMachinimaPreset}
            className="p-2 rounded bg-neutral-800 hover:bg-red-950/70 border border-red-700/60 text-left transition-all cursor-pointer group"
          >
            <div className="font-black text-xs text-red-400 group-hover:text-red-300 flex items-center gap-1">
              <span>🎮</span>
              <span>Machinima 3D Partner</span>
            </div>
            <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
              Pitch Black #000000, C4D Bevel rails, Blood Red hex & Clan fonts
            </div>
          </button>

          <button
            type="button"
            onClick={applyHomebrewPreset}
            className="p-2 rounded bg-neutral-800 hover:bg-cyan-950/70 border border-cyan-600/60 text-left transition-all cursor-pointer group"
          >
            <div className="font-black text-xs text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
              <span>🕹️</span>
              <span>Homebrew Console</span>
            </div>
            <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
              Cyan matrix #051824, Telemetry font, custom console badge & Navy box
            </div>
          </button>

          <button
            type="button"
            onClick={applyClanGraffitiPreset}
            className="p-2 rounded bg-neutral-800 hover:bg-teal-950/70 border border-teal-500/60 text-left transition-all cursor-pointer group"
          >
            <div className="font-black text-xs text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
              <span>⚡</span>
              <span>Clan 3D Graffiti FX</span>
            </div>
            <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
              Photoshop graffiti splatters, neon cyan lens flares & Impact typography
            </div>
          </button>

          <button
            type="button"
            onClick={applyCodCamoPreset}
            className="p-2 rounded bg-neutral-800 hover:bg-amber-950/70 border border-orange-600/60 text-left transition-all cursor-pointer group"
          >
            <div className="font-black text-xs text-orange-400 group-hover:text-orange-300 flex items-center gap-1">
              <span>🎯</span>
              <span>Call of Duty Clan</span>
            </div>
            <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
              Tactical camo weave, orange reticle flare & sniper roster gutters
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-300 bg-gray-100 rounded-t-md px-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`py-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'branding'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            1. Branding & Header Banners
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'appearance'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            2. Wallpapers, Colors & Clan Fonts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'content'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            3. Featured Video & Bulletins
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'social'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            4. Social Links & Sub-Box
          </button>
        </div>

        {/* Tab 1: Branding & Header Banners */}
        {activeTab === 'branding' && (
          <div className="card-panel bg-white border border-[#ccc] p-4 rounded-b-md shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Channel Profile Info */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Channel Name *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border rounded font-bold text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">About / Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell your viewers who you are, upload schedule, favorite games..."
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                </div>

                <div className="bg-red-50 border border-red-200 p-2.5 rounded">
                  <label className="font-bold text-red-900 block mb-1">
                    Subscriber Count (Adjust for fun / God Mode):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={subscribers}
                    onChange={(e) => setSubscribers(parseInt(e.target.value, 10) || 0)}
                    className="w-full font-mono font-bold text-sm p-1.5 border rounded bg-white"
                  />
                </div>

                {/* Channel Topic / Genre */}
                <div className="bg-gray-50 border border-gray-300 p-2.5 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 text-xs">Channel Topic / Category:</label>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="customizerTopicMode"
                          checked={topicMode === 'preset'}
                          onChange={() => setTopicMode('preset')}
                        />
                        <span>Preset Topic</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="customizerTopicMode"
                          checked={topicMode === 'custom'}
                          onChange={() => setTopicMode('custom')}
                        />
                        <span>Custom Topic</span>
                      </label>
                    </div>
                  </div>

                  {topicMode === 'preset' ? (
                    <select
                      value={selectedPresetTopic}
                      onChange={(e) => setSelectedPresetTopic(e.target.value)}
                      className="w-full text-xs p-1.5 border rounded bg-white font-bold"
                    >
                      {PRESENT_CHANNEL_TOPICS.map((pt) => (
                        <option key={pt.id} value={pt.name}>
                          {pt.icon} {pt.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Type custom topic (e.g. YTP Remasters, Speedruns, Vaporwave...)"
                      className="w-full text-xs p-1.5 border rounded bg-white font-medium"
                    />
                  )}
                </div>

                {/* YouTube Link */}
                <div className="bg-red-50/50 border border-red-200 p-2.5 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-red-950 text-xs flex items-center gap-1">
                      <span>📺</span>
                      <span>YouTube Channel Link & Sync</span>
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer text-red-800">
                      <input
                        type="checkbox"
                        checked={isYoutubeImported}
                        onChange={(e) => setIsYoutubeImported(e.target.checked)}
                      />
                      <span>Show Verified YouTube Badge</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={youtubeChannelUrl}
                    onChange={(e) => {
                      setYoutubeChannelUrl(e.target.value);
                      const parsed = parseYouTubeChannelInput(e.target.value);
                      setYoutubeChannelHandle(parsed.normalizedHandle);
                    }}
                    placeholder="https://www.youtube.com/@LofiGirl or @RickAstleyVEVO"
                    className="w-full text-xs p-1.5 border rounded bg-white font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Links this RetroTube channel to your official YouTube presence.</span>
                    {youtubeChannelHandle && <span className="font-bold text-red-700">{youtubeChannelHandle}</span>}
                  </div>
                </div>

                {/* Custom Logo / Emblem */}
                <div className="bg-cyan-50/60 border border-cyan-200 p-2.5 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-cyan-950 text-xs flex items-center gap-1">
                      <span>🕹️</span>
                      <span>Custom Logo & Homebrew Emblem:</span>
                    </label>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded">
                      Retro Logo Pack
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'none', label: 'Default Avatar Only' },
                      { id: 'homebrew', label: 'Homebrew Channel Console' },
                      { id: 'machinima', label: 'Machinima Partner Emblem' },
                      { id: 'clan_snipe', label: 'Clan Sniper Crosshair' },
                      { id: 'retro_tube', label: 'RetroTube Broadcast Box' },
                      { id: 'custom_upload', label: 'Upload Custom Logo' },
                    ].map((lg) => (
                      <button
                        key={lg.id}
                        type="button"
                        onClick={() => setCustomLogoType(lg.id)}
                        className={`p-1.5 rounded border text-left text-[11px] font-bold cursor-pointer transition-colors ${
                          customLogoType === lg.id
                            ? 'bg-cyan-600 text-white border-cyan-700'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-cyan-100/50'
                        }`}
                      >
                        {lg.label}
                      </button>
                    ))}
                  </div>

                  {customLogoType === 'custom_upload' && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="w-full text-xs p-1 border rounded bg-white mt-1"
                      />
                      <span className="text-[10px] text-gray-500">
                        PNG or JPEG (transparent PNG recommended) up to 256KB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Banners & Branding Headers */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Avatar Image (GIFs Supported!):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="w-full text-xs p-1 border rounded bg-white"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Square 1:1 format recommended. Animated GIFs supported for 2008 retro avatar vibes!
                  </p>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Custom Channel Header Banner:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    className="w-full text-xs p-1 border rounded bg-white"
                  />
                  <span className="text-[10px] text-gray-500">
                    Rests directly above primary video player and channel navigation tabs.
                  </span>
                </div>

                {/* Banner Height */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Banner Display Height:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'compact', label: 'Compact (110px)' },
                      { key: 'normal', label: 'Classic (160px)' },
                      { key: 'extended', label: 'Extended (260px)' },
                      { key: 'panoramic', label: 'Panoramic (320px)' },
                    ].map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setBannerHeight(b.key as any)}
                        className={`p-2 rounded border text-left cursor-pointer font-bold ${
                          bannerHeight === b.key
                            ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Header Badges */}
                <div className="bg-amber-50/70 border border-amber-300 p-2.5 rounded space-y-2">
                  <div className="font-bold text-amber-950 text-xs flex items-center justify-between">
                    <span>Verified Branding Header Badge:</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                      Prominent Networks
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'machinima', label: '🔴 Machinima Partner' },
                      { id: 'homebrew', label: '🕹️ Homebrew Channel' },
                      { id: 'maker', label: '🌟 Maker Syndicate' },
                      { id: 'director', label: '🎬 YouTube Director' },
                      { id: 'musician', label: '🎵 Musician' },
                      { id: 'guru', label: '💡 Guru' },
                      { id: 'fullscreen', label: '⚡ Fullscreen Partner' },
                    ].map((bdg) => (
                      <button
                        key={bdg.id}
                        type="button"
                        onClick={() => setPartnerBadgeType(bdg.id as any)}
                        className={`p-1.5 rounded border text-left text-[11px] font-bold cursor-pointer transition-colors ${
                          partnerBadgeType === bdg.id
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-amber-100/50'
                        }`}
                      >
                        {bdg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Tagline & Clan Subtext */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Banner Tagline / Clan Subtext:
                  </label>
                  <input
                    type="text"
                    value={bannerTagline}
                    onChange={(e) => setBannerTagline(e.target.value)}
                    placeholder="e.g. ★ CLAN GAMING 3D MONTAGE UNIT • C4D BEVELS & GRAFFITI ART ★"
                    className="w-full text-xs p-2 border rounded bg-white font-bold text-gray-900"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Rests in an authentic dark banner box with red border across the bottom of the header.
                  </p>
                </div>

                {/* Custom CSS Header Rules */}
                <div className="bg-purple-50/70 border border-purple-200 p-2.5 rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-purple-950 text-xs flex items-center gap-1">
                      <span>🎨</span>
                      <span>Custom CSS Banner Styling (box-shadow, glow, borders):</span>
                    </label>
                    <span className="text-[10px] text-purple-700 font-mono">Custom CSS Banner</span>
                  </div>
                  <input
                    type="text"
                    value={customCssText}
                    onChange={(e) => setCustomCssText(e.target.value)}
                    placeholder="e.g. box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 4px 15px rgba(204,24,30,0.4);"
                    className="w-full text-xs p-1.5 border rounded bg-white font-mono"
                  />
                  <div className="flex items-center gap-1 flex-wrap text-[10px]">
                    <span className="text-gray-500 font-bold">Quick CSS:</span>
                    <button
                      type="button"
                      onClick={() => setCustomCssText('box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 4px 15px rgba(204,24,30,0.4); border-bottom: 3px solid #cc181e;')}
                      className="bg-white border border-purple-300 hover:bg-purple-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Machinima Red Gloss
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomCssText('box-shadow: inset 0 0 30px rgba(0,240,255,0.3); border-bottom: 3px solid #38bdf8;')}
                      className="bg-white border border-purple-300 hover:bg-purple-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Homebrew Cyan Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomCssText('border-bottom: 3px solid #00f0ff; box-shadow: 0 0 25px rgba(0,240,255,0.5);')}
                      className="bg-white border border-purple-300 hover:bg-purple-100 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Clan 3D Neon
                    </button>
                  </div>
                </div>

                {/* Header Banner Presets */}
                <div className="bg-gray-50 border p-2 rounded space-y-1">
                  <label className="font-bold text-gray-700 block text-[11px]">
                    Quick Header Banner Presets:
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {HEADER_BANNER_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyHeaderBannerPreset(p)}
                        className="p-1.5 bg-white border border-gray-300 rounded text-left hover:bg-gray-100 cursor-pointer flex flex-col"
                      >
                        <span className="font-bold text-[11px] truncate text-gray-800">{p.name}</span>
                        <span className="text-[9px] text-gray-500 uppercase">{p.networkTag} Network</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wallpapers, Colors & Clan Fonts */}
        {activeTab === 'appearance' && (
          <div className="card-panel bg-white border border-[#ccc] p-4 rounded-b-md shadow-xs space-y-5">
            {/* Scope Toggle: Channel Only vs Channel + Video Player Watch Page */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 p-3.5 rounded-lg space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📺</span>
                  <div>
                    <div className="font-black text-xs text-blue-950">
                      Wallpaper & Background Display Scope:
                    </div>
                    <div className="text-[11px] text-blue-800">
                      Choose whether this wallpaper and styling frames your channel page only, or also frames the entire video player watch page!
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white font-mono uppercase">
                  {bgWallpaperScope === 'channel_and_videos' ? 'Channel + Watch Page Active' : 'Channel Only'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label
                  className={`p-2.5 rounded border-2 cursor-pointer flex items-start gap-2.5 transition-all ${
                    bgWallpaperScope === 'channel_only'
                      ? 'bg-white border-blue-600 ring-2 ring-blue-200 font-bold'
                      : 'bg-white/70 border-gray-300 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="bgWallpaperScopeRadio"
                    checked={bgWallpaperScope === 'channel_only'}
                    onChange={() => setBgWallpaperScope('channel_only')}
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900">🔒 Channel Page Only</div>
                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                      Wallpaper frames only your main channel home, videos tab, and bulletins. Video watch page uses standard retro tube theme.
                    </div>
                  </div>
                </label>

                <label
                  className={`p-2.5 rounded border-2 cursor-pointer flex items-start gap-2.5 transition-all ${
                    bgWallpaperScope === 'channel_and_videos'
                      ? 'bg-white border-red-600 ring-2 ring-red-200 font-bold'
                      : 'bg-white/70 border-gray-300 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="bgWallpaperScopeRadio"
                    checked={bgWallpaperScope === 'channel_and_videos'}
                    onChange={() => setBgWallpaperScope('channel_and_videos')}
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-red-950 flex items-center gap-1">
                      <span>🎬 Channel AND Video Watch Page</span>
                      <span className="text-[9px] bg-red-600 text-white px-1 py-0.2 rounded font-mono">POPULAR</span>
                    </div>
                    <div className="text-[10px] text-gray-600 leading-tight mt-0.5">
                      Frames the entire video player watch page with your custom wallpaper, 3D gutter rails, sponsor logos, and box styling!
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Full-Page Background Wallpaper & 3D Gutters */}
              <div className="space-y-4">
                {/* Custom Wallpaper Upload with 256KB spec */}
                <div className="bg-gray-50 border border-gray-300 p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 block text-xs">
                      Upload Custom Full-Page Wallpaper (PNG or JPEG):
                    </label>
                    <span className="text-[10px] font-mono bg-neutral-200 text-neutral-800 font-bold px-1.5 py-0.5 rounded">
                      Up to 256KB Spec
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleBgFileSelect}
                    className="w-full text-xs p-1.5 border rounded bg-white cursor-pointer"
                  />

                  {/* 256KB size indicator */}
                  {bgFileSizeKB !== null && (
                    <div
                      className={`p-2 rounded border text-xs flex items-center justify-between ${
                        bgFileSizeKB <= 256
                          ? 'bg-green-50 border-green-300 text-green-900'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{bgFileSizeKB <= 256 ? '✓' : '⚡'}</span>
                        <span>File Size: {bgFileSizeKB} KB</span>
                      </div>
                      <span className="text-[10px]">
                        {bgFileSizeKB <= 256
                          ? 'Within authentic 256KB limit'
                          : 'Over 256KB: auto-compressed on save'}
                      </span>
                    </div>
                  )}

                  <div className="text-[10px] text-gray-500 leading-tight">
                    Creators could upload custom full-page background images up to 256KB that framed the entire channel player. Gaming teams used heavy Cinema 4D and Photoshop 3D renders with graffiti art, sponsor logos, and handles mapped along the borders.
                  </div>
                </div>

                {/* 3D Gaming Wallpaper Presets */}
                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-blue-900 block text-xs">
                      Or Choose Gaming & Retro Wallpaper Preset:
                    </label>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">8 Presets</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {WALLPAPER_PRESETS.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => applyWallpaperPreset(pat)}
                        className={`p-2 rounded border text-left flex items-center gap-1.5 cursor-pointer text-[11px] transition-all ${
                          bgPattern === pat.id
                            ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-xs ring-1 ring-blue-400'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-100/50'
                        }`}
                      >
                        <span className="text-base">{pat.icon}</span>
                        <div className="min-w-0">
                          <div className="truncate font-bold">{pat.name}</div>
                          <div className="text-[9px] opacity-75 truncate">{pat.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tiling & Parallax */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 border p-2.5 rounded">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Wallpaper Tiling:</label>
                    <select
                      value={bgRepeat}
                      onChange={(e) => setBgRepeat(e.target.value as any)}
                      className="w-full p-1.5 border rounded bg-white text-xs font-medium"
                    >
                      <option value="repeat">Tile Both (Repeat X & Y)</option>
                      <option value="repeat-x">Repeat Horizontally (X)</option>
                      <option value="repeat-y">Repeat Vertically (Y)</option>
                      <option value="no-repeat">Center / Stretch (Cover)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Attachment:</label>
                    <label className="flex items-center gap-2 p-1.5 border rounded bg-white cursor-pointer h-8">
                      <input
                        type="checkbox"
                        checked={bgFixed}
                        onChange={(e) => setBgFixed(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-gray-800">
                        Fixed Parallax
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3D Gutter Rails Framing */}
                <div className="bg-neutral-900 text-white border border-neutral-700 p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>3D Gutter Rails Framing Channel Player:</span>
                    </label>
                    <span className="text-[9px] bg-red-600 text-white font-mono px-1 py-0.2 rounded font-bold">
                      C4D 3D FX
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'c4d_metallic', label: 'C4D Metallic Rails' },
                      { id: 'graffiti_fx', label: '3D Graffiti Art' },
                      { id: 'cod_camo', label: 'Tactical Camo' },
                      { id: 'homebrew_matrix', label: 'Homebrew Cyan' },
                      { id: 'frutiger_gloss', label: 'Frutiger Glass' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setBorderGutterStyle(g.id as any)}
                        className={`p-1.5 rounded border text-center text-[10px] font-bold cursor-pointer transition-colors ${
                          borderGutterStyle === g.id
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-neutral-800 text-gray-300 border-neutral-700 hover:bg-neutral-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-0.5">
                        Left Border Gutter (Sponsor Logos & Handles):
                      </label>
                      <input
                        type="text"
                        value={leftGutterText}
                        onChange={(e) => setLeftGutterText(e.target.value)}
                        placeholder="e.g. MACHINIMA PARTNER • 1080p HD • SPONSORED BY G-FUEL"
                        className="w-full text-xs p-1.5 rounded bg-neutral-800 border border-neutral-600 text-red-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-300 font-bold block mb-0.5">
                        Right Border Gutter (Social Handles & Clan Roster):
                      </label>
                      <input
                        type="text"
                        value={rightGutterText}
                        onChange={(e) => setRightGutterText(e.target.value)}
                        placeholder="e.g. TWITTER @CLAN • SUB 4 SUB • AIM HIGH"
                        className="w-full text-xs p-1.5 rounded bg-neutral-800 border border-neutral-600 text-cyan-400 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Colors, Transparency & Clan Typography */}
              <div className="space-y-4">
                {/* Exact Hex Color Pickers */}
                <div className="bg-gray-50 border border-gray-300 p-3 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-900 text-xs">
                      Channel Colors & Exact Hex Codes:
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono font-bold">Exact Hex Input</span>
                  </div>

                  {/* Background Color */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-700 text-xs">Background Color:</span>
                      <span className="font-mono text-xs font-bold text-gray-900">{bgColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor.startsWith('#') ? bgColor : '#000000'}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-9 h-8 p-0 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 p-1.5 border rounded font-mono text-xs font-bold bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {HEX_COLOR_PALETTES.backgrounds.map((bgp) => (
                        <button
                          key={bgp.hex}
                          type="button"
                          onClick={() => setBgColor(bgp.hex)}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-100 font-mono"
                          title={bgp.desc}
                        >
                          {bgp.label} ({bgp.hex})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wrapper / Box Fill Color */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-700 text-xs">Wrapper / Box Fill Color:</span>
                      <span className="font-mono text-xs font-bold text-gray-900">{boxFillColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boxFillColor.startsWith('#') ? boxFillColor : '#ffffff'}
                        onChange={(e) => setBoxFillColor(e.target.value)}
                        className="w-9 h-8 p-0 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={boxFillColor}
                        onChange={(e) => setBoxFillColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 p-1.5 border rounded font-mono text-xs font-bold bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {HEX_COLOR_PALETTES.boxFills.map((bf) => (
                        <button
                          key={bf.hex}
                          type="button"
                          onClick={() => setBoxFillColor(bf.hex)}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-100 font-mono"
                        >
                          {bf.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Box Transparency Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 text-xs">
                        Wrapper/Box Transparency & Opacity:
                      </label>
                      <span className="font-mono font-bold text-blue-700 text-xs">{channelOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      step="5"
                      value={channelOpacity}
                      onChange={(e) => setChannelOpacity(parseInt(e.target.value, 10))}
                      className="w-full cursor-pointer"
                    />
                    <div className="text-[10px] text-gray-500">
                      Setting container box fills with transparency lets your 3D wallpaper shine through!
                    </div>
                  </div>

                  {/* Border Shade & Style */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-700 text-[11px]">Border Shade:</span>
                        <span className="font-mono text-[10px] font-bold">{borderColor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={borderColor.startsWith('#') ? borderColor : '#cccccc'}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-8 h-7 p-0 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="flex-1 p-1 border rounded font-mono text-[11px] font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700 text-[11px] block mb-1">Border Style:</span>
                      <select
                        value={borderStyle}
                        onChange={(e) => setBorderStyle(e.target.value as any)}
                        className="w-full p-1.5 border rounded bg-white text-xs font-bold"
                      >
                        <option value="solid">Solid</option>
                        <option value="double">Double</option>
                        <option value="dashed">Dashed</option>
                        <option value="groove">Groove (3D)</option>
                        <option value="ridge">Ridge (3D)</option>
                      </select>
                    </div>
                  </div>

                  {/* Text Highlight Tone & Body Text */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-700 text-[11px]">Text Highlights / Links:</span>
                        <span className="font-mono text-[10px] font-bold">{highlightColor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={highlightColor.startsWith('#') ? highlightColor : '#ff2233'}
                          onChange={(e) => setHighlightColor(e.target.value)}
                          className="w-8 h-7 p-0 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={highlightColor}
                          onChange={(e) => setHighlightColor(e.target.value)}
                          className="flex-1 p-1 border rounded font-mono text-[11px] font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-700 text-[11px]">Body Text Color:</span>
                        <span className="font-mono text-[10px] font-bold">{textColor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={textColor.startsWith('#') ? textColor : '#1f2937'}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-7 p-0 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 p-1 border rounded font-mono text-[11px] font-bold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preset Font Pairings for Clan Identity */}
                <div className="bg-amber-50/60 border border-amber-300 p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-950 text-xs">
                      Font Styling: Preset Font Pairings for Clan Identity:
                    </label>
                    <span className="text-[10px] font-bold text-amber-800">Clan & Machinima</span>
                  </div>

                  <div className="space-y-1.5">
                    {FONT_PAIRING_PRESETS.map((fp) => (
                      <button
                        key={fp.id}
                        type="button"
                        onClick={() => setFontFamily(fp.id as any)}
                        className={`w-full p-2 rounded border text-left cursor-pointer transition-all flex items-center justify-between ${
                          fontFamily === fp.id
                            ? 'bg-amber-500 text-black font-black border-amber-600 shadow-xs ring-1 ring-amber-400'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-amber-100/50'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold ${fp.fontClass}`}>
                            {fp.name}
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">{fp.desc}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border border-black/10 bg-black/5 ${fp.fontClass}`}>
                          Sample Aa
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipped Shop Inventory Items */}
                <div className="bg-gray-50 border p-2.5 rounded space-y-2">
                  <div className="font-bold text-gray-800 text-xs">
                    Equip Shop Themes & Borders:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        Layout Theme:
                      </label>
                      <select
                        value={activeTheme}
                        onChange={(e) => setActiveTheme(e.target.value)}
                        className="w-full text-xs p-1 border rounded bg-white font-medium"
                      >
                        <option value="">-- Default --</option>
                        {channel.purchasedThemes?.map((tId) => {
                          const t = shopInventory.themes.find((item: any) => item.id === tId);
                          return t ? (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                        Avatar Border:
                      </label>
                      <select
                        value={activeBorder}
                        onChange={(e) => setActiveBorder(e.target.value)}
                        className="w-full text-xs p-1 border rounded bg-white font-medium"
                      >
                        <option value="">-- Default --</option>
                        {channel.purchasedBorders?.map((bId) => {
                          const b = shopInventory.borders.find((item: any) => item.id === bId);
                          return b ? (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Content & Featured Video */}
        {activeTab === 'content' && (
          <div className="card-panel bg-white border border-[#ccc] p-4 rounded-b-md shadow-xs space-y-4">
            <div className="space-y-4">
              {/* Featured Video Spotlight */}
              <div className="bg-yellow-50/70 border border-yellow-300 p-3 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-yellow-900 text-xs flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>Pin Featured Video (Channel Trailer Spotlight):</span>
                  </label>
                  {featuredVideoId && (
                    <button
                      type="button"
                      onClick={() => setFeaturedVideoId('')}
                      className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      Remove Pin
                    </button>
                  )}
                </div>

                <select
                  value={featuredVideoId}
                  onChange={(e) => setFeaturedVideoId(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-xs font-bold text-gray-800"
                >
                  <option value="">-- None (Show Standard Videos Grid) --</option>
                  <optgroup label="My Uploaded Videos">
                    {myVideos.map((v) => (
                      <option key={v.id} value={v.id}>
                        📹 {v.title} ({v.views.toLocaleString()} views)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Great Videos">
                    {videos
                      .filter((v) => v.authorId !== channel.id)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          ⭐ {v.title}
                        </option>
                      ))}
                  </optgroup>
                </select>

                <p className="text-[10px] text-gray-600">
                  When enabled, this video is spotlighted in an embedded retro media player at the top of your channel home!
                </p>
              </div>

              {/* Channel Bulletin / Marquee Announcement */}
              <div className="bg-gray-50 border border-gray-200 p-3 rounded space-y-1.5">
                <label className="font-bold text-gray-800 block text-xs flex items-center gap-1.5">
                  <span>📢</span>
                  <span>Channel Bulletin / Announcement Banner:</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🚨 New montage every Friday at 4PM! Rate 5 stars & subscribe!"
                  value={channelBulletin}
                  onChange={(e) => setChannelBulletin(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-xs font-bold text-blue-900"
                />
                <p className="text-[10px] text-gray-500">
                  Appears as a prominent bulletin banner at the very top of your channel page for all visitors.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Social Links & Sub-box */}
        {activeTab === 'social' && (
          <div className="card-panel bg-white border border-[#ccc] p-4 rounded-b-md shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Social Links Manager */}
              <div className="space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <span>🔗</span>
                  <span>Custom Social & Web Links</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {socialLinks.map((sl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded border bg-gray-50 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-gray-800 mr-2">{sl.platform}:</span>
                        <span className="text-gray-500 truncate">{sl.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(idx)}
                        className="text-red-600 hover:text-red-800 font-bold px-1 text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="p-1.5 border rounded bg-white text-xs font-bold w-32"
                  >
                    <option value="Website">Website</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="Discord">Discord</option>
                    <option value="MySpace">MySpace</option>
                    <option value="Newgrounds">Newgrounds</option>
                    <option value="Bandcamp">Bandcamp</option>
                    <option value="Blog">Blog</option>
                  </select>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1 p-1.5 border rounded bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="btn py-1 px-3 font-bold text-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Featured Channels / Sub-Box */}
              <div className="space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <span>👥</span>
                  <span>Featured Channels (Sub-Box Friends)</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto border p-2 rounded bg-gray-50">
                  {otherUsers.map((u) => {
                    const isChecked = featuredChannelIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer ${
                          isChecked ? 'bg-red-50 text-red-900 font-bold' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleFeaturedChannel(u.id)}
                            className="cursor-pointer"
                          />
                          <img
                            src={u.avatarBase64 || DEFAULT_AVATAR}
                            alt={u.username}
                            className="w-6 h-6 rounded-full object-cover border"
                          />
                          <span>{u.username}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {u.subscribers.toLocaleString()} subs
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Live Framing Preview Panel */}
        <div className="card-panel bg-white border border-gray-400 p-3.5 rounded-lg space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">👀</span>
              <span className="text-xs font-black text-gray-900 uppercase tracking-wide">
                Live Channel Framing Preview (Wallpaper, 3D Gutters, Hex Colors & Clan Fonts)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {bgWallpaperScope === 'channel_and_videos' && (
                <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded shadow-2xs">
                  📺 Active on Video Player Watch Pages
                </span>
              )}
              <span className="text-[10px] font-mono text-gray-500 font-bold">
                Opacity: {channelOpacity}% • Font: {fontFamily}
              </span>
            </div>
          </div>

          {/* Simulated Channel Wallpaper Canvas */}
          <div
            className="p-3 sm:p-5 rounded-lg border border-gray-500 overflow-hidden relative shadow-inner transition-all duration-300"
            style={previewWallpaperStyle}
          >
            <div className="flex items-stretch gap-2 max-w-4xl mx-auto">
              {/* Left 3D Gutter Rail */}
              {borderGutterStyle && borderGutterStyle !== 'none' && (
                <div className="hidden sm:flex flex-col items-center justify-between py-4 px-1.5 w-10 rounded-l select-none flex-shrink-0 bg-black/80 border-y border-l border-white/20 backdrop-blur-md shadow-2xl text-[8px] font-black uppercase text-white">
                  <span className="text-xs animate-pulse">⚡</span>
                  <div className="[writing-mode:vertical-rl] rotate-180 truncate py-2 text-red-400">
                    {leftGutterText || 'MACHINIMA PARTNER'}
                  </div>
                  <div className="text-[7px] bg-red-600 text-white px-1 py-0.2 rounded font-mono font-bold">
                    3D
                  </div>
                </div>
              )}

              {/* Main Container Box with user's hex fill & opacity */}
              <div
                className={`flex-1 rounded shadow-xl overflow-hidden transition-all duration-300 ${previewFontClass}`}
                style={{
                  backgroundColor: hexToRgba(boxFillColor, containerOpacity),
                  borderColor: borderColor,
                  borderStyle: borderStyle,
                  borderWidth: '2px',
                  color: textColor,
                }}
              >
                {/* Header Banner Preview */}
                <div
                  className="w-full bg-cover bg-center p-3 relative flex flex-col justify-end min-h-[90px]"
                  style={{
                    backgroundImage: bannerFile
                      ? undefined
                      : channel.bannerBase64
                      ? `url(${channel.bannerBase64})`
                      : 'linear-gradient(to right, #1e293b, #0f172a)',
                    ...(customCssText ? parseCssStringToReact(customCssText) : {}),
                  }}
                >
                  {/* Partner Verified Badge */}
                  {partnerBadgeType && partnerBadgeType !== 'none' && (
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded shadow-md border ${
                          partnerBadgeType === 'machinima'
                            ? 'bg-red-600 text-white border-red-800'
                            : partnerBadgeType === 'homebrew'
                            ? 'bg-cyan-500 text-black border-cyan-300'
                            : partnerBadgeType === 'maker'
                            ? 'bg-purple-600 text-white border-purple-800'
                            : 'bg-amber-400 text-black border-amber-500'
                        }`}
                      >
                        {partnerBadgeType === 'machinima' && '🔴 MACHINIMA PARTNER'}
                        {partnerBadgeType === 'homebrew' && '🕹️ HOMEBREW CHANNEL'}
                        {partnerBadgeType === 'maker' && '🌟 MAKER SYNDICATE'}
                        {partnerBadgeType === 'director' && '🎬 YOUTUBE DIRECTOR'}
                        {partnerBadgeType === 'musician' && '🎵 MUSICIAN'}
                        {partnerBadgeType === 'guru' && '💡 GURU'}
                        {partnerBadgeType === 'fullscreen' && '⚡ FULLSCREEN'}
                      </span>
                    </div>
                  )}

                  {bannerTagline && (
                    <div className="bg-black/85 text-amber-300 px-2 py-1 rounded text-[10px] font-black uppercase max-w-md border-l-2 border-red-600">
                      {bannerTagline}
                    </div>
                  )}
                </div>

                {/* Channel Header Info Row */}
                <div className="p-3 flex items-center justify-between border-t border-black/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow bg-white overflow-hidden flex-shrink-0">
                      <img
                        src={channel.avatarBase64 || DEFAULT_AVATAR}
                        alt={username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-black text-sm flex items-center gap-1.5">
                        <span>{username || 'Channel Name'}</span>
                        {customLogoType === 'homebrew' && (
                          <span className="text-[10px] bg-cyan-500 text-black px-1.5 py-0.2 rounded font-bold">
                            🕹️ Homebrew
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {subscribers.toLocaleString()} subscribers • {myVideos.length} videos
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 text-[11px] font-black rounded shadow-xs text-white"
                      style={{ backgroundColor: highlightColor }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>

                {/* Simulated Content Box with highlight link */}
                <div className="p-3 border-t border-black/10 bg-black/5 flex items-center justify-between text-[11px]">
                  <span className="font-bold">
                    Primary Box Fill: <code className="font-mono">{boxFillColor}</code>
                  </span>
                  <span
                    className="font-black hover:underline cursor-pointer"
                    style={{ color: highlightColor }}
                  >
                    Highlight Link Text ({highlightColor})
                  </span>
                </div>
              </div>

              {/* Right 3D Gutter Rail */}
              {borderGutterStyle && borderGutterStyle !== 'none' && (
                <div className="hidden sm:flex flex-col items-center justify-between py-4 px-1.5 w-10 rounded-r select-none flex-shrink-0 bg-black/80 border-y border-r border-white/20 backdrop-blur-md shadow-2xl text-[8px] font-black uppercase text-white">
                  <span className="text-xs animate-pulse">🎮</span>
                  <div className="[writing-mode:vertical-rl] rotate-180 truncate py-2 text-cyan-400">
                    {rightGutterText || 'CLAN ROSTER'}
                  </div>
                  <div className="text-[7px] bg-cyan-600 text-white px-1 py-0.2 rounded font-mono font-bold">
                    HD
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Master Actions */}
        <div className="card-panel bg-white border border-[#ccc] p-3 rounded-lg shadow-sm flex items-center justify-between">
          <div className="text-gray-500 text-[11px]">
            Changes will apply immediately across your channel and video player views.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('channel', { id: channel.id })}
              className="btn py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary py-1.5 px-6 font-black text-xs shadow-md cursor-pointer"
            >
              Save Channel Customizations ✨
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
