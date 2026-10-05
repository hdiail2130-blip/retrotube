import React, { useState } from 'react';
import { MediaSkin, ThemePreset, VideoQuality, CustomAdSettings, LogoEffect } from '../types';
import { readImageFileAsDataUrl, ImageFileInfo } from '../utils/text';

interface SettingsViewProps {
  currentSettings: {
    themeColor: string;
    logoBase64: string;
    logoHeight?: number;
    logoAnimationEffect?: LogoEffect;
    logoTagline?: string;
    showTagline?: boolean;
    themePreset: ThemePreset;
    navSounds: boolean;
    mediaSkin: MediaSkin;
    defaultPlaybackRate: number;
    preferredQuality: VideoQuality;
    autoplay?: boolean;
  };
  customAd?: CustomAdSettings;
  onToggleCustomAd?: (enabled: boolean) => void;
  onOpenAdSettings?: () => void;
  onOpenLogoModal?: () => void;
  onResetDefaultState?: () => void;
  onSave: (newSettings: any) => void;
  onNavigate: (route: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentSettings,
  customAd,
  onToggleCustomAd,
  onOpenAdSettings,
  onOpenLogoModal,
  onResetDefaultState,
  onSave,
  onNavigate,
}) => {
  const [themeColor, setThemeColor] = useState(currentSettings.themeColor || '#cc181e');
  const [themePreset, setThemePreset] = useState<ThemePreset>(currentSettings.themePreset || 'default');
  const [navSounds, setNavSounds] = useState(currentSettings.navSounds ?? true);
  const [autoplay, setAutoplay] = useState(currentSettings.autoplay ?? true);
  const [mediaSkin, setMediaSkin] = useState<MediaSkin>(currentSettings.mediaSkin || 'wmp11');
  const [defaultPlaybackRate, setDefaultPlaybackRate] = useState(currentSettings.defaultPlaybackRate || 1.0);
  const [preferredQuality, setPreferredQuality] = useState<VideoQuality>(currentSettings.preferredQuality || 'hd1080');

  // Custom Logo State
  const [currentLogo, setCurrentLogo] = useState(currentSettings.logoBase64 || '');
  const [logoHeight, setLogoHeight] = useState<number>(currentSettings.logoHeight || 36);
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(currentSettings.logoAnimationEffect || 'none');
  const [logoTagline, setLogoTagline] = useState<string>(currentSettings.logoTagline || 'Broadcast Yourself™');
  const [showTagline, setShowTagline] = useState<boolean>(currentSettings.showTagline ?? true);
  const [logoFileInfo, setLogoFileInfo] = useState<ImageFileInfo | null>(null);

  const handleLogoFileSelect = async (file: File | undefined | null) => {
    if (!file) return;
    const info = await readImageFileAsDataUrl(file);
    if (info) {
      setCurrentLogo(info.dataUrl);
      setLogoFileInfo(info);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      themeColor,
      themePreset,
      navSounds,
      autoplay,
      mediaSkin,
      defaultPlaybackRate,
      preferredQuality,
      logoBase64: currentLogo,
      logoHeight,
      logoAnimationEffect: logoEffect,
      logoTagline,
      showTagline,
      customLogoName: logoFileInfo?.name,
      customLogoType: logoFileInfo?.type,
      customLogoSize: logoFileInfo?.size,
    });
  };

  return (
    <div className="card-panel max-w-xl mx-auto my-4 text-xs select-none">
      <div className="section-header flex justify-between items-center">
        <span>Global RetroTube Engine Settings</span>
        <button type="button" onClick={() => onNavigate('home')} className="btn text-xs py-0.5 px-2">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Autoplay Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="cursor-pointer h-4 w-4 text-blue-600 rounded"
            />
            <span className="font-bold text-gray-800 text-xs">
              Enable Video Autoplay (Continuous Up Next Streaming) ▶️
            </span>
          </label>
          <p className="text-[10px] text-gray-600 mt-1">
            When enabled, RetroTube automatically plays the next item from your queue or recommended videos when the current video finishes. Turn off to keep the player paused at the end screen.
          </p>
        </div>

        {/* Custom Video Ad System */}
        {customAd && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customAd.enabled}
                  onChange={(e) => onToggleCustomAd && onToggleCustomAd(e.target.checked)}
                  className="cursor-pointer h-4 w-4 text-amber-600 rounded"
                />
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <span>🟡</span>
                  <span>Enable Custom Video Ads & Iconic Yellow Line Timeline Cues</span>
                </span>
              </label>

              {onOpenAdSettings && (
                <button
                  type="button"
                  onClick={onOpenAdSettings}
                  className="btn text-xs py-1 px-2.5 font-bold bg-white text-gray-800 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>⚙️</span>
                  <span>Import MP4 & Configure</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-600">
              When enabled, retro media player seekbars render the iconic yellow ad notch at configured timestamps ({customAd.timestamps?.map(t => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`).join(', ')}), playing your custom MP4 ad file with a retro skip button!
            </p>
          </div>
        )}

        {/* Nostalgic Audio Synthesizer */}
        <div className="bg-amber-50 border border-amber-300 rounded p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={navSounds}
              onChange={(e) => setNavSounds(e.target.checked)}
              className="cursor-pointer"
            />
            <span className="font-bold text-gray-800 text-xs">
              Enable Nostalgic System Sound Effects 🔊
            </span>
          </label>
          <p className="text-[10px] text-gray-600 mt-1">
            Synthesizes authentic Windows Explorer clicks, PC hardware fan whirrs on upload, and MSN nudges natively in the browser via Web Audio!
          </p>
        </div>

        {/* Media Player Skin */}
        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Default Retro Media Player Skin:
          </label>
          <select
            value={mediaSkin}
            onChange={(e) => setMediaSkin(e.target.value as MediaSkin)}
            className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white mb-2.5"
          >
            <option value="youtube_2008">Old YouTube 2008 Golden Era (Dark Gradient, Red Scrubber & HQ)</option>
            <option value="wmp11">Windows Media Player 11 (Dark Obsidian Glass & Neon Blue Play)</option>
            <option value="classic_flash">Classic 2006 Flash Player (Blocky Gray & Red Progress)</option>
            <option value="winamp_classic">Winamp 2.x Classic (Green LED LCD & Animated EQ Visualizer)</option>
            <option value="vlc_classic">VLC Media Player 2000s (Classic Silver Toolbar & Traffic Cone)</option>
            <option value="realplayer_g2">RealPlayer G2 / RealOne (Curved Aqua Chassis & Cyan LED)</option>
            <option value="crt_tv_retro">Retro CRT TV & VCR (Chunky Bezel, Green Phosphor OSD & Scanlines)</option>
            <option value="quicktime">QuickTime 7 Player (Metallic Brushed Silver & Square Play)</option>
          </select>

          {/* Visual Retro Skin Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'youtube_2008' as MediaSkin, label: 'YouTube 2008', icon: '🔴', desc: 'Dark gradient & red scrubber' },
              { id: 'wmp11' as MediaSkin, label: 'WMP 11', icon: '🔵', desc: 'Obsidian glass & blue radial' },
              { id: 'classic_flash' as MediaSkin, label: '2006 Flash', icon: '⚡', desc: 'Blocky beige & classic seek' },
              { id: 'winamp_classic' as MediaSkin, label: 'Winamp 2.x', icon: '📻', desc: 'Green LED & EQ visualizer' },
              { id: 'vlc_classic' as MediaSkin, label: 'VLC Classic', icon: '🚧', desc: 'Silver toolbar & traffic cone' },
              { id: 'realplayer_g2' as MediaSkin, label: 'RealPlayer G2', icon: '🌀', desc: 'Aqua metallic & cyan display' },
              { id: 'crt_tv_retro' as MediaSkin, label: 'CRT TV & VCR', icon: '📺', desc: 'Green OSD, scanlines & tape buttons' },
              { id: 'quicktime' as MediaSkin, label: 'QuickTime 7', icon: '🍏', desc: 'Brushed metal & blue slider' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setMediaSkin(s.id)}
                className={`p-2 rounded text-left border cursor-pointer transition-all ${
                  mediaSkin === s.id
                    ? 'bg-red-50 border-red-500 ring-2 ring-red-400 shadow-xs'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                  <span>{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5 leading-tight truncate">
                  {s.desc}
                </div>
              </button>
            ))}
          </div>

          <span className="text-[10px] text-gray-500 mt-1.5 block">
            Updates controls, seekbar styles, and buttons for all streaming videos.
          </span>
        </div>

        {/* Playback Speed & High-Res Defaults */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Default Playback Speed:</label>
            <select
              value={defaultPlaybackRate}
              onChange={(e) => setDefaultPlaybackRate(parseFloat(e.target.value))}
              className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
            >
              <option value="0.75">0.75x (Relaxed)</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.25">1.25x (Crisp)</option>
              <option value="1.5">1.5x (Fast)</option>
              <option value="2.0">2.0x ⚡ (Turbo Double-Speed)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Streaming Resolution Preference:</label>
            <select
              value={preferredQuality}
              onChange={(e) => setPreferredQuality(e.target.value as VideoQuality)}
              className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
            >
              <option value="hd1080">1080p HD (High-Definition Crisp)</option>
              <option value="hd720">720p HD</option>
              <option value="large">480p Standard</option>
              <option value="auto">Auto (Best Available)</option>
            </select>
          </div>
        </div>

        {/* Skeuomorphic OS UI Style Preset */}
        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Skeuomorphic OS UI Style Preset:
          </label>
          <select
            value={themePreset}
            onChange={(e) => setThemePreset(e.target.value as ThemePreset)}
            className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
          >
            <option value="default">RetroTube Classic (Default 2010 White/Red)</option>
            <option value="dark-red">Dark & Red (Midnight Edition)</option>
            <option value="winxp">Windows XP (Luna Blue OS Layout)</option>
            <option value="winvista">Windows Vista (Aero Obsidian Aurora Glass)</option>
            <option value="win7">Windows 7 (Classic Aero Sky Blue)</option>
          </select>
          <span className="text-[10px] text-gray-500 mt-0.5 block">
            Customizes background tones, window borders, and atmospheric typography.
          </span>
        </div>

        {/* Accent Color Picker */}
        <div>
          <label className="font-bold text-gray-700 block mb-1">Highlight Accent Color:</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-14 h-8 p-0 border border-gray-300 rounded cursor-pointer"
            />
            <span className="font-mono text-xs">{themeColor}</span>
          </div>
        </div>

        {/* Custom RetroTube Logo Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                <span>🎨</span>
                <span>Custom RetroTube Header Logo:</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black">
                  GIF • PNG • SVG
                </span>
              </label>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Import local animated GIFs, transparent PNGs, SVGs, or any image file to replace the default RetroTube brand.
              </p>
            </div>

            {onOpenLogoModal && (
              <button
                type="button"
                onClick={onOpenLogoModal}
                className="btn text-xs py-1 px-3 font-bold bg-white text-gray-800 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <span>⭐</span>
                <span>Open Studio & Presets</span>
              </button>
            )}
          </div>

          {/* Local File Input */}
          <div>
            <input
              type="file"
              accept="image/*,.gif,.png,.jpg,.jpeg,.webp,.svg,.bmp,.ico"
              onChange={(e) => handleLogoFileSelect(e.target.files?.[0])}
              className="w-full text-xs file:btn file:py-1 file:px-2.5 file:mr-2 file:text-xs file:font-bold cursor-pointer"
            />
          </div>

          {/* Live Preview Bar */}
          {currentLogo ? (
            <div className="bg-white border border-gray-300 rounded p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 border border-gray-200 p-1.5 rounded flex items-center justify-center">
                  <img
                    src={currentLogo}
                    alt="Active logo"
                    style={{ height: `${logoHeight}px` }}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-gray-900 flex items-center gap-2">
                    <span>Active Custom Logo</span>
                    {((logoFileInfo?.type || '').includes('gif') || currentLogo.startsWith('data:image/gif')) && (
                      <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black animate-pulse">
                        🎞️ ANIMATED GIF
                      </span>
                    )}
                  </div>
                  {logoFileInfo && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {logoFileInfo.name} • {logoFileInfo.size} {logoFileInfo.width > 0 ? `• ${logoFileInfo.width}×${logoFileInfo.height}px` : ''}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLogo('');
                    setLogoFileInfo(null);
                  }}
                  className="text-red-600 hover:underline text-[10px] font-bold cursor-pointer"
                >
                  Revert to Default Logo
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 italic bg-white/70 p-2 rounded border border-dashed border-gray-300">
              Default RetroTube branding currently active. Select a local file above or choose from retro presets.
            </div>
          )}

          {/* Height and Tagline Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-red-200/60">
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-700 mb-1">
                <span>Display Height: {logoHeight}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="56"
                step="1"
                value={logoHeight}
                onChange={(e) => setLogoHeight(parseInt(e.target.value, 10))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 block mb-1">Retro Visual Effect:</label>
              <select
                value={logoEffect}
                onChange={(e) => setLogoEffect(e.target.value as LogoEffect)}
                className="w-full text-xs font-bold p-1 border border-gray-300 rounded bg-white"
              >
                <option value="none">Clean Original</option>
                <option value="glow">Neon Retro Glow 🔥</option>
                <option value="pulse">Gentle Pulse 💓</option>
                <option value="scanline">CRT TV Scanlines 📺</option>
                <option value="glitch">VHS Glitch Jitter ⚡</option>
                <option value="pixelated">8-Bit Pixel Art 👾</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reset Platform Defaults */}
        <div className="bg-red-50/70 border border-red-200 rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-extrabold text-red-900 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Reset Entire RetroTube Platform to 2011 Defaults:</span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Revert all channels, spotlight videos, playlists, watch history, and themes back to factory defaults.
            </p>
          </div>
          {onResetDefaultState && (
            <button
              type="button"
              onClick={onResetDefaultState}
              className="btn py-1.5 px-3 font-extrabold bg-red-600 hover:bg-red-700 text-white border-red-800 cursor-pointer shadow-xs flex items-center gap-1 whitespace-nowrap"
            >
              <span>🔄</span>
              <span>Reset Default State</span>
            </button>
          )}
        </div>

        <div className="border-t pt-3 flex items-center justify-between">
          <button type="submit" className="btn btn-primary text-xs py-2 px-6 font-bold shadow-md">
            Save Settings
          </button>
          <button type="button" onClick={() => onNavigate('home')} className="btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
