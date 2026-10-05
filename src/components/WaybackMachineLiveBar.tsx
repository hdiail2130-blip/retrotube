import React, { useState, useEffect } from 'react';
import { Video, WaybackMachineConfig } from '../types';
import { WAYBACK_HISTORICAL_PRESETS, parseWaybackUrl } from '../utils/wayback';

interface WaybackMachineLiveBarProps {
  config: WaybackMachineConfig;
  currentRoute: { name: string; params: Record<string, any> };
  activeVideo?: Video | null;
  videos: Video[];
  onUpdateConfig: (updates: Partial<WaybackMachineConfig>) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onLoadWaybackUrl?: (url: string) => void;
  onSaveSnapshot?: (snapshot: { title: string; url: string; timestamp: string; date: string }) => void;
}

const HISTORICAL_YEARS = [
  { year: '2005', era: 'Genesis (First Year)', captures: 142, bars: [20, 35, 60, 45, 80, 95, 70, 50, 40, 65, 85, 90] },
  { year: '2006', era: 'Early Viral & Zoo', captures: 489, bars: [40, 55, 75, 90, 85, 100, 95, 80, 70, 65, 90, 85] },
  { year: '2007', era: 'Partners & Custom Layouts', captures: 890, bars: [60, 75, 80, 85, 95, 90, 85, 95, 100, 90, 85, 80] },
  { year: '2008', era: 'Golden Era & Rickroll', captures: 1842, bars: [85, 90, 95, 100, 95, 90, 85, 90, 95, 100, 90, 85] },
  { year: '2009', era: 'HD 720p Launch', captures: 1530, bars: [70, 85, 90, 95, 85, 80, 75, 80, 85, 90, 95, 100] },
  { year: '2010', era: '1080p & Cosmic Panda', captures: 1210, bars: [80, 75, 85, 90, 80, 75, 70, 80, 85, 90, 80, 75] },
  { year: '2011', era: 'Minecraft Alpha & Modern', captures: 980, bars: [65, 70, 75, 80, 85, 80, 75, 70, 80, 85, 75, 70] },
  { year: '2012', era: 'One Channel Era', captures: 760, bars: [50, 60, 65, 70, 75, 70, 65, 60, 70, 75, 65, 60] },
];

export const WaybackMachineLiveBar: React.FC<WaybackMachineLiveBarProps> = ({
  config,
  currentRoute,
  activeVideo,
  videos,
  onUpdateConfig,
  onNavigate,
  onLoadWaybackUrl,
  onSaveSnapshot,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [customPageTitle, setCustomPageTitle] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute canonical simulated URL based on route
  const getSimulatedUrlForRoute = (): string => {
    const timestamp = config.currentTimestamp || '20080415120000';
    let target = 'http://www.youtube.com/';

    if (currentRoute.name === 'watch' && activeVideo) {
      if (activeVideo.youtubeId) {
        target = `http://www.youtube.com/watch?v=${activeVideo.youtubeId}`;
      } else if (activeVideo.waybackUrl) {
        target = activeVideo.waybackUrl;
      } else {
        target = `http://www.youtube.com/watch?v=${activeVideo.id}`;
      }
    } else if (currentRoute.name === 'channel' && currentRoute.params?.id) {
      target = `http://www.youtube.com/user/${currentRoute.params.id}`;
    } else if (currentRoute.name === 'upload') {
      target = 'http://www.youtube.com/my_videos_upload';
    } else if (currentRoute.name === 'home' && currentRoute.params?.searchQuery) {
      target = `http://www.youtube.com/results?search_query=${encodeURIComponent(currentRoute.params.searchQuery)}`;
    }

    return `https://web.archive.org/web/${timestamp}/${target}`;
  };

  useEffect(() => {
    setUrlInput(getSimulatedUrlForRoute());
  }, [currentRoute.name, currentRoute.params, activeVideo?.id, config.currentTimestamp]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    // Check if it's a Wayback or YouTube URL
    const parsed = parseWaybackUrl(trimmed);
    if (parsed.youtubeId) {
      // Find video by youtubeId or navigate to watch
      const existing = videos.find((v) => v.youtubeId === parsed.youtubeId);
      if (existing) {
        onNavigate('watch', { id: existing.id });
      } else {
        // Find by first video or trigger wayback loader
        if (onLoadWaybackUrl) {
          onLoadWaybackUrl(trimmed);
        } else {
          onNavigate('watch', { id: videos[0]?.id || 'v1' });
        }
      }
    } else if (onLoadWaybackUrl) {
      onLoadWaybackUrl(trimmed);
    }

    if (parsed.snapshotTimestamp) {
      onUpdateConfig({
        currentTimestamp: parsed.snapshotTimestamp,
        currentDateFormatted: parsed.snapshotDateFormatted || config.currentDateFormatted,
        currentYear: parsed.snapshotYear || config.currentYear,
      });
    }
  };

  const handleSelectYear = (item: (typeof HISTORICAL_YEARS)[0]) => {
    const newTimestamp = `${item.year}0415120000`;
    const newDate = `Apr 15, ${item.year}`;
    onUpdateConfig({
      currentYear: item.year,
      currentTimestamp: newTimestamp,
      currentDateFormatted: newDate,
    });
  };

  const handleStepSnapshot = (direction: 'prev' | 'next') => {
    const currentYearNum = parseInt(config.currentYear || '2008', 10);
    const targetYearNum = direction === 'prev' ? Math.max(2005, currentYearNum - 1) : Math.min(2012, currentYearNum + 1);
    const targetYearStr = targetYearNum.toString();
    const found = HISTORICAL_YEARS.find((y) => y.year === targetYearStr) || HISTORICAL_YEARS[3];
    handleSelectYear(found);
  };

  const handleApplyPreset = (preset: (typeof WAYBACK_HISTORICAL_PRESETS)[0]) => {
    setIsPresetDropdownOpen(false);
    onUpdateConfig({
      currentTimestamp: preset.snapshotTimestamp,
      currentDateFormatted: preset.snapshotDate,
      currentYear: preset.snapshotTimestamp.substring(0, 4),
    });

    if (preset.youtubeId) {
      const match = videos.find((v) => v.youtubeId === preset.youtubeId);
      if (match) {
        onNavigate('watch', { id: match.id });
        return;
      }
    }

    if (onLoadWaybackUrl) {
      onLoadWaybackUrl(preset.url);
    }
  };

  const handleExecuteSavePageNow = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const warcId = `urn:uuid:${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
      const snapTitle = customPageTitle.trim() || activeVideo?.title || 'RetroTube Live Portal';

      if (onSaveSnapshot) {
        onSaveSnapshot({
          title: snapTitle,
          url: urlInput,
          timestamp: ts,
          date: dateStr,
        });
      }

      setSaveSuccessMsg(`Success! Saved to Internet Archive WARC repository (Snapshot ID: ${ts}).`);
    }, 1200);
  };

  const handleCopyCurrentLink = () => {
    navigator.clipboard.writeText(urlInput);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If collapsed, render the compact floating vintage Wayback bar
  if (config.isCollapsed) {
    return (
      <div className="bg-[#1f1f1f] text-white border-b-2 border-[#d97706] px-3 py-1.5 shadow-md flex items-center justify-between text-xs z-50 sticky top-0 font-sans select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-base text-amber-400">🏛️</span>
            <span className="font-serif tracking-wider text-amber-400 uppercase text-[11px]">
              WAYBACK MACHINE
            </span>
            <span className="bg-red-700 text-white text-[9px] px-1 py-0.2 rounded font-black tracking-widest uppercase">
              LIVE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-300">
            <span>Snapshot:</span>
            <strong className="text-white font-mono bg-black/60 px-1.5 py-0.5 rounded border border-gray-700">
              {config.currentDateFormatted || 'Apr 15, 2008'}
            </strong>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">Mode:</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
              {config.playbackEnginePreference === 'high_performance'
                ? '⚡ 60fps Direct Stream (id_)'
                : '🏛️ Archive Embed (if_)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateConfig({ isCollapsed: false })}
            className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[11px] cursor-pointer shadow-xs flex items-center gap-1 transition-all"
            title="Expand Full Wayback Machine Browser & Histogram Banner"
          >
            <span>Expand Toolbar</span>
            <span>▾</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateConfig({ isActive: false })}
            className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            title="Exit Wayback Machine Live Mode"
          >
            ✕ Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Wayback Machine live archival header"
      className="bg-[#202020] text-gray-200 border-b-4 border-[#b45309] shadow-2xl z-50 sticky top-0 font-sans select-none text-xs"
    >
      {/* Top Banner Row: Brand, URL Bar & Quick Actions */}
      <div className="max-w-[1080px] mx-auto px-3 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Brand & Emblem */}
        <div className="flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Internet Archive Greek Temple Icon */}
            <div className="w-8 h-8 rounded bg-gradient-to-b from-[#2a2a2a] to-[#141414] border border-[#444] flex items-center justify-center text-lg text-amber-400 shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-serif font-black tracking-widest text-[13px] text-white">
                  WAYBACK
                </span>
                <span className="bg-[#cc0000] text-white font-extrabold text-[10px] px-1 py-0.2 rounded-xs tracking-wider uppercase shadow-xs">
                  MACHINE
                </span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold ml-1 animate-pulse">
                  ● LIVE RETROTUBE
                </span>
              </div>
              <div className="text-[9px] text-gray-400 font-serif tracking-tight mt-0.5">
                INTERNET ARCHIVE • web.archive.org
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => onUpdateConfig({ isCollapsed: true })}
              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] font-bold"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => onUpdateConfig({ isActive: false })}
              className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Address & Navigation Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center min-w-0 max-w-2xl">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://web.archive.org/web/20080415120000/http://www.youtube.com/..."
              className="w-full bg-[#111111] text-amber-300 font-mono text-[11px] px-2.5 py-1.5 rounded-l border border-r-0 border-gray-600 focus:outline-none focus:border-amber-400 shadow-inner truncate"
              title="Enter any Wayback snapshot URL, YouTube link, or target archive address"
            />
            {copiedLink && (
              <span className="absolute right-2 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                Copied!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="bg-gradient-to-b from-[#e5a00d] to-[#b37400] hover:brightness-110 active:brightness-95 text-black font-extrabold px-3 py-1.5 border border-amber-600 text-[11px] cursor-pointer shadow-xs flex items-center gap-1 select-none flex-shrink-0"
            title="Load this archived snapshot into RetroTube"
          >
            <span>Take Me Back</span>
            <span>➔</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCurrentLink}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-l-0 border-gray-600 px-2 py-1.5 text-[11px] cursor-pointer flex-shrink-0"
            title="Copy current Wayback snapshot URL"
          >
            📋
          </button>

          {/* Historical Presets Quick Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold border border-l-0 border-gray-600 rounded-r px-2 py-1.5 text-[11px] cursor-pointer flex items-center gap-1"
              title="Pick famous historical snapshots from 2005-2011"
            >
              <span>🏛️ Presets</span>
              <span className="text-[9px]">▾</span>
            </button>

            {isPresetDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-[#1c1c1c] border border-amber-500/80 rounded shadow-2xl py-1 z-50 text-left">
                <div className="px-2.5 py-1 text-[10px] font-bold text-amber-400 border-b border-gray-700 flex items-center justify-between">
                  <span>FAMOUS HISTORICAL SNAPSHOTS</span>
                  <button
                    type="button"
                    onClick={() => setIsPresetDropdownOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-800">
                  {WAYBACK_HISTORICAL_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="w-full text-left px-2.5 py-2 hover:bg-amber-950/40 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="text-base flex-shrink-0">{p.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-[11px] text-amber-300 truncate">
                          {p.title}
                        </div>
                        <div className="text-[9px] text-gray-400 font-mono">
                          {p.snapshotDate} • {p.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/70 text-amber-300 font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-all"
            title="Save Page Now: Preserve this RetroTube page or video to Wayback archives!"
          >
            <span>📸</span>
            <span>Save Page Now</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosticsModalOpen(true)}
            className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 text-[10px] font-mono cursor-pointer"
            title="Inspect Wayback HTTP 206 partial content headers & WARC record"
          >
            HTTP Headers
          </button>

          <button
            type="button"
            onClick={() => onUpdateConfig({ isCollapsed: true })}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 text-[11px] cursor-pointer"
            title="Minimize toolbar"
          >
            −
          </button>

          <button
            type="button"
            onClick={() => onUpdateConfig({ isActive: false })}
            className="px-2 py-1 bg-red-900/80 hover:bg-red-800 text-red-200 rounded border border-red-700 text-[11px] cursor-pointer font-bold"
            title="Close Wayback Machine Mode"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Middle Calendar Histogram & Timeline Row */}
      <div className="bg-[#181818] border-t border-b border-gray-800 px-3 py-1.5">
        <div className="max-w-[1080px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Snapshot Navigator & Counter */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleStepSnapshot('prev')}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded border border-gray-700 text-[10px] font-bold cursor-pointer transition-colors"
              title="Go to earlier historical snapshot"
            >
              ◀ Previous Year
            </button>

            <div className="bg-black/80 px-3 py-1 rounded border border-amber-500/60 text-center">
              <div className="text-[12px] font-black text-amber-300 font-mono tracking-wider">
                {config.currentDateFormatted || 'Apr 15, 2008'}
              </div>
              <div className="text-[8px] text-gray-400 font-mono">
                {config.currentTimestamp || '20080415120000'} UTC
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStepSnapshot('next')}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded border border-gray-700 text-[10px] font-bold cursor-pointer transition-colors"
              title="Go to later snapshot"
            >
              Next Year ▶
            </button>

            <div className="text-[10px] text-gray-400 hidden xl:block ml-1">
              Saved <strong className="text-white font-mono">{config.totalCaptures || 1842} times</strong> between Apr 24, 2005 and Oct 3, 2026.
            </div>
          </div>

          {/* Interactive Histogram Year Graph */}
          <div className="flex-1 w-full flex items-end justify-center gap-1.5 overflow-x-auto py-0.5">
            {HISTORICAL_YEARS.map((y) => {
              const isSelected = config.currentYear === y.year;
              return (
                <button
                  key={y.year}
                  type="button"
                  onClick={() => handleSelectYear(y)}
                  className={`group flex flex-col items-center cursor-pointer p-1 rounded transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-amber-950/80 border border-amber-500 shadow-md ring-1 ring-amber-400/50'
                      : 'hover:bg-gray-800/80 border border-transparent'
                  }`}
                  title={`${y.year}: ${y.era} (${y.captures} recorded captures)`}
                >
                  {/* Sparkline mini-histogram bar */}
                  <div className="flex items-end gap-0.5 h-6 mb-1">
                    {y.bars.map((barHeight, idx) => (
                      <div
                        key={idx}
                        className={`w-1 rounded-t-xs transition-all ${
                          isSelected
                            ? 'bg-amber-400 group-hover:bg-amber-300'
                            : 'bg-gray-600 group-hover:bg-gray-400'
                        }`}
                        style={{ height: `${Math.max(4, Math.round((barHeight / 100) * 24))}px` }}
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold leading-none ${
                      isSelected ? 'text-amber-300 font-black' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    {y.year}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Performance Stream Mode Selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-gray-400 font-bold hidden sm:inline">Engine:</span>
            <div className="inline-flex rounded-md shadow-xs bg-black/60 p-0.5 border border-gray-700">
              <button
                type="button"
                onClick={() => onUpdateConfig({ playbackEnginePreference: 'high_performance' })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  config.playbackEnginePreference === 'high_performance'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Direct raw byte stream (id_ mode) bypassing heavy archive banners for 60fps HTML5 video"
              >
                <span>⚡</span>
                <span>60fps Direct</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateConfig({ playbackEnginePreference: 'wayback_embed' })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  config.playbackEnginePreference === 'wayback_embed'
                    ? 'bg-amber-600 text-white shadow-xs font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Authentic Wayback iframe embed (if_ mode)"
              >
                <span>🏛️</span>
                <span>Archive Embed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Page Now Modal (Archival Crawler Simulator) */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] text-gray-100 border-2 border-amber-500 rounded-lg max-w-lg w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <div>
                  <h3 className="font-serif font-bold text-sm text-amber-400">
                    SAVE PAGE NOW TO WAYBACK MACHINE
                  </h3>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Heritrix 3.4 / ia_archiver Live Preservation Engine
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSaveSuccessMsg('');
                }}
                className="text-gray-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1 text-[11px]">
                  Target Page URL to Archive:
                </label>
                <input
                  type="text"
                  readOnly
                  value={urlInput}
                  className="w-full bg-black/60 border border-gray-700 text-amber-300 font-mono text-[11px] p-2 rounded truncate"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 text-[11px]">
                  Archival Snapshot Label / Title:
                </label>
                <input
                  type="text"
                  value={customPageTitle}
                  onChange={(e) => setCustomPageTitle(e.target.value)}
                  placeholder={activeVideo?.title || 'RetroTube Live Broadcast Portal'}
                  className="w-full bg-[#111] border border-gray-700 text-white text-xs p-2 rounded focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-black/70 border border-gray-800 p-2.5 rounded font-mono text-[10px] text-gray-300 space-y-1">
                <div className="text-emerald-400 font-bold">
                  ● Target Collection: YouTube Preserved Archival Index
                </div>
                <div>Agent: Heritrix/3.4.0 (Wayback Spider Engine)</div>
                <div>WARC Storage Cluster: ia801200.us.archive.org</div>
                <div>Byte-Range Support: HTTP 206 Partial Content (Enabled)</div>
              </div>

              {saveSuccessMsg && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500 rounded text-emerald-300 text-xs font-bold space-y-1">
                  <div>✅ {saveSuccessMsg}</div>
                  <div className="text-[10px] font-mono text-emerald-200 break-all">
                    Permanent Record: {urlInput}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSaveSuccessMsg('');
                }}
                className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs cursor-pointer font-bold"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleExecuteSavePageNow}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Crawling & Archiving...</span>
                  </>
                ) : (
                  <>
                    <span>Capture Snapshot Now</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTTP Diagnostics Modal */}
      {isDiagnosticsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] text-gray-100 border-2 border-amber-500 rounded-lg max-w-lg w-full p-4 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <span className="font-bold text-amber-400">WAYBACK MACHINE HTTP HEADERS & DIAGNOSTICS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticsModalOpen(false)}
                className="text-gray-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/90 p-3 rounded border border-gray-800 text-[10px] space-y-1 text-gray-300 overflow-x-auto">
              <div className="text-emerald-400 font-bold">HTTP/1.1 200 OK</div>
              <div>Server: Tengine / Internet Archive Proxy</div>
              <div>Date: {config.currentDateFormatted || 'Apr 15, 2008'} 12:00:00 GMT</div>
              <div>Content-Type: video/mp4; codecs=&quot;avc1.42E01E, mp4a.40.2&quot;</div>
              <div>Accept-Ranges: bytes</div>
              <div className="text-amber-300 font-bold">
                X-Archive-Wayback-Perf: id_ Identity Byte Stream Optimization (ACTIVE)
              </div>
              <div>X-Archive-Orig-Server: ia600305.us.archive.org</div>
              <div>X-Archive-Guessed-Charset: utf-8</div>
              <div>X-Archive-Crawl-Date: {config.currentTimestamp || '20080415120000'}</div>
              <div>Access-Control-Allow-Origin: *</div>
            </div>

            <div className="text-[11px] text-gray-400 font-sans">
              Identity modifier (<code className="text-amber-300">id_</code>) bypasses Wayback banner injection and script wrappers, providing direct partial-content hardware streaming with 0 latency.
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setIsDiagnosticsModalOpen(false)}
                className="px-3 py-1.5 rounded bg-amber-500 text-black font-bold text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
