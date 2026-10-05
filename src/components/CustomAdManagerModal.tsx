import React, { useState, useRef } from 'react';
import { CustomAdSettings, Video } from '../types';
import { readAsBase64 } from '../utils/text';
import { AD_PRESETS } from '../utils/adCommercial';

interface CustomAdManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customAd: CustomAdSettings;
  videos?: Video[];
  onSave: (updatedAd: CustomAdSettings) => void;
  onTriggerTestAd?: () => void;
  onToggleVideoSelection?: (videoId: string, selected: boolean) => void;
}

export const CustomAdManagerModal: React.FC<CustomAdManagerModalProps> = ({
  isOpen,
  onClose,
  customAd,
  videos = [],
  onSave,
  onTriggerTestAd,
}) => {
  const [enabled, setEnabled] = useState(customAd.enabled);
  const [title, setTitle] = useState(customAd.title || 'CyberSoda 2000™ - Extreme Citrus Fuel!');
  const [sponsorName, setSponsorName] = useState(customAd.sponsorName || 'CyberSoda Laboratories');
  const [sponsorUrl, setSponsorUrl] = useState(customAd.sponsorUrl || 'https://archive.org');
  const [skipCountdownSeconds, setSkipCountdownSeconds] = useState(customAd.skipCountdownSeconds ?? 5);
  const [canSkip, setCanSkip] = useState(customAd.canSkip ?? true);
  const [timestamps, setTimestamps] = useState<number[]>(customAd.timestamps || [12]);
  const [newTimestampInput, setNewTimestampInput] = useState('');
  const [onlySelectedVideos, setOnlySelectedVideos] = useState(
    customAd.onlySelectedVideos ?? (!customAd.applyToAllVideos)
  );
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(
    customAd.selectedVideoIds || ['v1', 'v2']
  );
  const [videoFilterQuery, setVideoFilterQuery] = useState('');
  const [activePreset, setActivePreset] = useState<string>(customAd.activePreset || 'cybersoda');
  const [adVideoBase64, setAdVideoBase64] = useState<string | undefined>(customAd.adVideoBase64);
  const [fileName, setFileName] = useState<string | undefined>(customAd.fileName);
  const [fileSize, setFileSize] = useState<string | undefined>(customAd.fileSize);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Parse mm:ss or number to seconds
  const parseTimeToSeconds = (input: string): number | null => {
    const clean = input.trim();
    if (!clean) return null;
    if (clean.includes(':')) {
      const parts = clean.split(':').map((p) => parseInt(p, 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return parts[0] * 60 + parts[1];
      }
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
    const num = parseFloat(clean);
    return !isNaN(num) && num >= 0 ? Math.round(num) : null;
  };

  // Add new timestamp
  const handleAddTimestamp = () => {
    const parsed = parseTimeToSeconds(newTimestampInput);
    if (parsed === null) {
      alert('Please enter a valid time (e.g. 0:15 or 30).');
      return;
    }
    if (timestamps.includes(parsed)) {
      setNewTimestampInput('');
      return;
    }
    const updated = [...timestamps, parsed].sort((a, b) => a - b);
    setTimestamps(updated);
    setNewTimestampInput('');
  };

  // Remove timestamp
  const handleRemoveTimestamp = (ts: number) => {
    setTimestamps(timestamps.filter((t) => t !== ts));
  };

  // Quick timestamp presets
  const applyTimestampPreset = (presetTimes: number[]) => {
    setTimestamps([...presetTimes].sort((a, b) => a - b));
  };

  // Handle local MP4 file import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (.mp4, .webm, etc.).');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const name = file.name;
      setFileName(name);
      setFileSize(`${sizeMB} MB`);

      // Convert to base64 Data URL or create Object URL
      // If file is reasonably sized (< 25MB), base64 stores smoothly in localStorage
      if (file.size < 25 * 1024 * 1024) {
        const base64 = await readAsBase64(file);
        setAdVideoBase64(base64);
      } else {
        // Larger file: use blob object URL for current session
        const objUrl = URL.createObjectURL(file);
        setAdVideoBase64(objUrl);
      }

      setActivePreset('custom_file');
      setTitle(`Custom Ad Spot (${name})`);
      setIsUploading(false);
    } catch (err: any) {
      setUploadError('Failed to load video file: ' + (err?.message || 'unknown error'));
      setIsUploading(false);
    }
  };

  // Clear custom file and revert to preset
  const handleClearCustomFile = () => {
    setAdVideoBase64(undefined);
    setFileName(undefined);
    setFileSize(undefined);
    setActivePreset('cybersoda');
    const preset = AD_PRESETS['cybersoda'];
    if (preset) {
      setTitle(preset.title);
      setSponsorName(preset.sponsorName);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Select built-in retro ad preset
  const handleSelectPreset = (presetId: string) => {
    const preset = AD_PRESETS[presetId];
    if (!preset) return;
    setActivePreset(presetId);
    setTitle(preset.title);
    setSponsorName(preset.sponsorName);
    setAdVideoBase64(undefined);
    setFileName(undefined);
    setFileSize(undefined);
  };

  const handleToggleVideo = (vidId: string) => {
    if (selectedVideoIds.includes(vidId)) {
      setSelectedVideoIds(selectedVideoIds.filter((id) => id !== vidId));
    } else {
      setSelectedVideoIds([...selectedVideoIds, vidId]);
    }
  };

  const handleSelectAllVideos = () => {
    setSelectedVideoIds(videos.map((v) => v.id));
  };

  const handleDeselectAllVideos = () => {
    setSelectedVideoIds([]);
  };

  // Save all settings
  const handleSave = () => {
    const updated: CustomAdSettings = {
      enabled,
      title: title.trim() || 'Custom Retro Advertisement',
      sponsorName: sponsorName.trim() || 'Commercial Sponsor',
      sponsorUrl: sponsorUrl.trim() || 'https://archive.org',
      skipCountdownSeconds,
      canSkip,
      timestamps: timestamps.length > 0 ? timestamps : [12],
      applyToAllVideos: !onlySelectedVideos,
      onlySelectedVideos,
      selectedVideoIds,
      activePreset: activePreset as any,
      adVideoBase64,
      fileName,
      fileSize,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-xs select-none">
      <div className="bg-[#f0f0f0] border-2 border-[#999] rounded-md shadow-2xl w-full max-w-2xl overflow-hidden text-gray-900 font-sans my-auto">
        {/* Retro Header Window Bar */}
        <div className="bg-gradient-to-r from-[#cc181e] via-[#e52d27] to-[#b31217] text-white px-3 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🟡</span>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide">
                Custom Video Ad & Timestamp Manager
              </h2>
              <p className="text-[10px] text-red-100 font-medium">
                Import MP4 ad file, set video timestamps with iconic yellow line, and configure skip button!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded bg-black/30 hover:bg-black/50 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Master Enable/Disable Anytime Switch */}
          <div
            className={`border-2 rounded-md p-3 transition-colors ${
              enabled
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{enabled ? '🟡' : '⚪'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">
                      Custom Video Ads System
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded shadow-2xs ${
                        enabled
                          ? 'bg-amber-400 text-black border border-amber-500'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {enabled ? 'ENABLED (ACTIVE)' : 'DISABLED (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    {enabled
                      ? 'Ads are active! Iconic yellow lines appear on seekbars, playing your ad with skip button.'
                      : 'Ads are currently turned off. No ad breaks will interrupt video playback.'}
                  </p>
                </div>
              </div>

              {/* Big Toggle Button */}
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`px-4 py-1.5 rounded font-black text-xs border transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
                  enabled
                    ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-600 ring-2 ring-amber-300'
                    : 'bg-green-600 hover:bg-green-500 text-white border-green-700'
                }`}
              >
                <span>{enabled ? 'Turn OFF Ads' : 'Turn ON Ads'}</span>
                <span>{enabled ? '⏹' : '▶'}</span>
              </button>
            </div>
          </div>

          {/* 1. MP4 File Import & Presets Section */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">📹</span>
                <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">
                  1. Import MP4 Ad File or Select Retro Commercial
                </span>
              </div>
              {adVideoBase64 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded">
                  ✓ MP4 Loaded
                </span>
              )}
            </div>

            {/* File Upload Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              {/* Left: File input & Dropzone */}
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-red-300 hover:border-red-500 bg-red-50/40 hover:bg-red-50/80 rounded-md p-3 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-2xl mb-1">📁</div>
                  <div className="font-extrabold text-red-800 text-xs">
                    Click to Browse & Import MP4 Video Ad
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Supports .mp4, .webm high-res commercial video files
                  </div>
                  {isUploading && (
                    <div className="text-xs font-bold text-amber-600 mt-1 animate-pulse">
                      ⏳ Loading MP4 file data...
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="text-[11px] text-red-600 font-bold bg-red-50 border border-red-200 p-2 rounded">
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Uploaded File Details */}
                {fileName && (
                  <div className="bg-gray-50 border border-gray-300 rounded p-2 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-bold text-gray-800 text-xs truncate">
                        🎬 {fileName}
                      </div>
                      <div className="text-[10px] text-gray-500">{fileSize || 'Local Video'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCustomFile}
                      className="text-[10px] text-red-600 hover:underline font-bold flex-shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Video Preview Player or Presets */}
              <div className="space-y-2">
                {adVideoBase64 ? (
                  <div className="border border-gray-400 rounded bg-black overflow-hidden shadow-inner">
                    <div className="bg-gray-800 px-2 py-0.5 text-[9px] text-gray-300 font-bold flex justify-between items-center">
                      <span>Imported MP4 Video Preview</span>
                      <span className="text-emerald-400">Ready</span>
                    </div>
                    <video
                      ref={previewVideoRef}
                      src={adVideoBase64}
                      controls
                      playsInline
                      className="w-full h-32 object-contain bg-black"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded p-2.5">
                    <div className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Or Choose a Nostalgic Retro Preset:</span>
                      <span className="text-[9px] text-gray-500">Built-in Commercials</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.values(AD_PRESETS).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPreset(p.id)}
                          className={`text-left p-1.5 rounded border transition-all cursor-pointer ${
                            activePreset === p.id && !adVideoBase64
                              ? 'bg-amber-100 border-amber-500 font-bold shadow-2xs ring-1 ring-amber-400'
                              : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-[11px] font-bold truncate">{p.title}</div>
                          <div className="text-[9px] text-gray-500 truncate">{p.tagline}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Video Timestamp Cues & Iconic Yellow Line */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🟡</span>
                <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">
                  2. Video Timestamps & Iconic Yellow Line Cue
                </span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded font-bold">
                {timestamps.length} Cue{timestamps.length === 1 ? '' : 's'} Configured
              </span>
            </div>

            <p className="text-[11px] text-gray-600">
              Each timestamp will render the <strong>iconic yellow marker</strong> on the video player seekbar. When playback reaches that time, the custom ad seamlessly triggers with the skip button!
            </p>

            {/* Active Timestamps Tags */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[30px] p-2 bg-gray-50 border border-gray-200 rounded">
              {timestamps.length === 0 ? (
                <span className="text-[11px] text-gray-400 italic">
                  No timestamps set. Add one below to show the yellow line on the player timeline!
                </span>
              ) : (
                timestamps.map((ts) => (
                  <span
                    key={ts}
                    className="inline-flex items-center gap-1.5 bg-[#fbc02d] text-black font-extrabold px-2 py-0.5 rounded text-xs shadow-xs border border-[#f57f17]"
                  >
                    <span>🟡 {formatTime(ts)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimestamp(ts)}
                      className="hover:text-red-700 cursor-pointer font-black text-sm ml-0.5"
                      title="Remove timestamp"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Timestamp Input */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTimestampInput}
                  onChange={(e) => setNewTimestampInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTimestamp();
                    }
                  }}
                  placeholder="e.g. 0:15 or 30"
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-l-xs bg-white text-gray-900 focus:outline-none focus:border-red-600 w-32 shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleAddTimestamp}
                  className="btn rounded-r-xs rounded-l-none border-l-0 py-1 px-3 text-xs font-bold bg-[#cc181e] text-white hover:bg-red-700 cursor-pointer"
                >
                  + Add Timestamp
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-gray-500 font-bold">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyTimestampPreset([5])}
                  className="btn text-[10px] py-0.5 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                  title="0:05 Pre-Roll Ad"
                >
                  0:05 Pre-roll
                </button>
                <button
                  type="button"
                  onClick={() => applyTimestampPreset([12])}
                  className="btn text-[10px] py-0.5 px-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 font-bold cursor-pointer"
                  title="0:12 Classic Nostalgic Cue"
                >
                  0:12 Nostalgia
                </button>
                <button
                  type="button"
                  onClick={() => applyTimestampPreset([30])}
                  className="btn text-[10px] py-0.5 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                  title="0:30 Mid-Roll"
                >
                  0:30 Mid-roll
                </button>
                <button
                  type="button"
                  onClick={() => applyTimestampPreset([10, 30])}
                  className="btn text-[10px] py-0.5 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                  title="Two ad breaks"
                >
                  0:10 & 0:30
                </button>
                <button
                  type="button"
                  onClick={() => applyTimestampPreset([8, 25, 45])}
                  className="btn text-[10px] py-0.5 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                  title="Three ad breaks"
                >
                  Triple Break
                </button>
              </div>
            </div>

            {/* Video Targeting Policy */}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <label className="text-[11px] font-bold text-gray-800 block">
                Video Targeting Policy:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`p-2 rounded border cursor-pointer transition-all flex items-start gap-2 ${
                    onlySelectedVideos
                      ? 'bg-amber-100/80 border-amber-500 font-bold shadow-2xs ring-1 ring-amber-400'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoTargetingMode"
                    checked={onlySelectedVideos}
                    onChange={() => setOnlySelectedVideos(true)}
                    className="accent-amber-600 mt-0.5"
                  />
                  <div>
                    <div className="text-xs text-amber-950 font-extrabold">
                      🟡 Ads ONLY on Selected Videos (User-Pointed)
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Ads only play on videos you explicitly select or point below. All other videos remain ad-free!
                    </div>
                  </div>
                </label>

                <label
                  className={`p-2 rounded border cursor-pointer transition-all flex items-start gap-2 ${
                    !onlySelectedVideos
                      ? 'bg-blue-50 border-blue-400 font-bold shadow-2xs ring-1 ring-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoTargetingMode"
                    checked={!onlySelectedVideos}
                    onChange={() => setOnlySelectedVideos(false)}
                    className="accent-blue-600 mt-0.5"
                  />
                  <div>
                    <div className="text-xs text-blue-950 font-bold">
                      🌐 Apply Ads to All Videos Globally
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Every video on the platform displays the ad cues unless explicitly deselected.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Point & Select / Deselect Videos for Commercials */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🎯</span>
                <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">
                  3. Point & Select Videos for Commercials ({selectedVideoIds.length} of {videos.length} selected)
                </span>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllVideos}
                  className="btn text-[10px] py-0.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border-amber-300 cursor-pointer shadow-2xs"
                >
                  ✓ Select All Videos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllVideos}
                  className="btn text-[10px] py-0.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border-gray-300 cursor-pointer"
                >
                  ✕ Deselect All (Ad-Free)
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-600">
              Point and click any video to toggle between <strong>Selected for Ads 🟡</strong> and <strong>Deselected (Ad-Free) ⚪</strong>. Only selected videos will play ads and show yellow timeline markers!
            </p>

            {/* Video Search Filter */}
            {videos.length > 3 && (
              <input
                type="text"
                value={videoFilterQuery}
                onChange={(e) => setVideoFilterQuery(e.target.value)}
                placeholder="Search videos by title..."
                className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white shadow-inner"
              />
            )}

            {/* Video List Items */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {videos.length === 0 ? (
                <div className="text-center py-4 text-gray-400 italic">
                  No uploaded videos found.
                </div>
              ) : (
                videos
                  .filter((v) =>
                    v.title.toLowerCase().includes(videoFilterQuery.toLowerCase())
                  )
                  .map((v) => {
                    const isSelected = selectedVideoIds.includes(v.id);

                    return (
                      <div
                        key={v.id}
                        onClick={() => handleToggleVideo(v.id)}
                        className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-amber-50/90 border-amber-400 shadow-2xs ring-1 ring-amber-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={v.thumb}
                            alt={v.title}
                            className="w-14 h-9 object-cover rounded border border-gray-300 bg-black flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-gray-900 truncate">{v.title}</h4>
                            <p className="text-[10px] text-gray-500">
                              Duration: {v.time} • {v.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded border shadow-2xs flex items-center gap-1 ${
                              isSelected
                                ? 'bg-amber-400 text-black border-amber-500 shadow-[0_0_8px_rgba(251,192,45,0.7)]'
                                : 'bg-gray-200 text-gray-600 border-gray-300'
                            }`}
                          >
                            <span>{isSelected ? '🟡' : '⚪'}</span>
                            <span>{isSelected ? 'SELECTED FOR ADS' : 'DESELECTED (AD-FREE)'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVideo(v.id);
                            }}
                            className={`btn text-[10px] py-0.5 px-2 font-bold cursor-pointer ${
                              isSelected
                                ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                            }`}
                          >
                            {isSelected ? 'Deselect' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* 4. Skip Button Configuration */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">⏭</span>
                <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">
                  4. Iconic YouTube Skip Button Settings
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-gray-700 font-bold text-xs mb-1">
                  Skip Countdown Timer:
                </label>
                <select
                  value={skipCountdownSeconds}
                  onChange={(e) => setSkipCountdownSeconds(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-bold py-1.5 px-2 border border-gray-300 rounded bg-white text-gray-800 cursor-pointer focus:outline-none focus:border-red-600"
                >
                  <option value={0}>0s - Instant Skip Available Immediately</option>
                  <option value={3}>3 Seconds Countdown</option>
                  <option value={5}>5 Seconds Countdown (Iconic Classic YouTube Standard)</option>
                  <option value={10}>10 Seconds Countdown</option>
                  <option value={15}>15 Seconds Full Ad</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Shows authentic retro countdown banner, then transitions into the interactive &quot;Skip Ad ⏭&quot; button.
                </p>
              </div>

              {/* Interactive Skip Button Live Preview */}
              <div className="bg-neutral-900 p-3 rounded border border-neutral-700 text-center">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                  Live Skip Button Preview:
                </div>
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center bg-[#222] hover:bg-[#333] border-2 border-[#fbc02d] text-white hover:text-amber-300 font-extrabold text-xs px-3.5 py-1.5 rounded-xs shadow-[0_0_12px_rgba(251,192,45,0.7)] cursor-pointer select-none">
                    <span>Skip Ad</span>
                    <span className="text-[#fbc02d] text-sm ml-1.5">⏭</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Sponsor & Ad Details */}
          <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
              <span className="text-base">🏷️</span>
              <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">
                4. Sponsor Campaign & Ad Copy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                  Ad Title / Headline:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CyberSoda 2000 - Extreme Citrus Fuel!"
                  className="w-full text-xs px-2.5 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                  Sponsor Brand Name:
                </label>
                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="e.g. CyberSoda Laboratories"
                  className="w-full text-xs px-2.5 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#e2e2e2] border-t border-[#ccc] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            {onTriggerTestAd && (
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  setTimeout(() => {
                    if (onTriggerTestAd) onTriggerTestAd();
                  }, 150);
                }}
                className="btn text-xs py-1 px-3 font-black bg-amber-500 hover:bg-amber-400 text-black border-amber-600 cursor-pointer shadow-xs flex items-center gap-1"
                title="Save and test ad immediately on current player"
              >
                <span>▶ Test Ad Break Now</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn text-xs py-1 px-3 text-gray-700 bg-white hover:bg-gray-100 border-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary text-xs py-1 px-4 font-black cursor-pointer shadow-xs"
            >
              Save & Apply Ad Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
