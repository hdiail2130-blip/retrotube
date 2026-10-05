import React, { useState, useRef } from 'react';
import { Video, VideoAdConfig, CustomAdSettings } from '../types';
import { readAsBase64 } from '../utils/text';
import { AD_PRESETS } from '../utils/adCommercial';

interface VideoAdSelectorModalProps {
  isOpen: boolean;
  video: Video;
  globalAd?: CustomAdSettings;
  onClose: () => void;
  onSave: (videoId: string, config: VideoAdConfig) => void;
  onTriggerTestAd?: () => void;
}

export const VideoAdSelectorModal: React.FC<VideoAdSelectorModalProps> = ({
  isOpen,
  video,
  globalAd,
  onClose,
  onSave,
  onTriggerTestAd,
}) => {
  const existingConfig = video.customAdConfig;

  const [enabled, setEnabled] = useState(
    existingConfig !== undefined ? existingConfig.enabled : !video.customAdDisabled
  );
  const [mode, setMode] = useState<'global' | 'custom' | 'none'>(
    existingConfig?.mode || (video.customAdDisabled ? 'none' : 'global')
  );
  const [title, setTitle] = useState(
    existingConfig?.title || `Special Commercial Break - ${video.title}`
  );
  const [sponsorName, setSponsorName] = useState(
    existingConfig?.sponsorName || 'Featured Video Sponsor'
  );
  const [sponsorUrl, setSponsorUrl] = useState(
    existingConfig?.sponsorUrl || 'https://archive.org'
  );
  const [adVideoBase64, setAdVideoBase64] = useState<string | undefined>(
    existingConfig?.adVideoBase64
  );
  const [fileName, setFileName] = useState<string | undefined>(
    existingConfig?.fileName
  );
  const [fileSize, setFileSize] = useState<string | undefined>(
    existingConfig?.fileSize
  );
  const [skipCountdownSeconds, setSkipCountdownSeconds] = useState(
    existingConfig?.skipCountdownSeconds ?? 5
  );
  const [timestamps, setTimestamps] = useState<number[]>(
    existingConfig?.timestamps && existingConfig.timestamps.length > 0
      ? existingConfig.timestamps
      : video.customAdTimestamps || globalAd?.timestamps || [12]
  );
  const [newTimestampInput, setNewTimestampInput] = useState('');
  const [activePreset, setActivePreset] = useState<string>(
    existingConfig?.activePreset || 'custom_file'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  const handleAddTimestamp = () => {
    const parsed = parseTimeToSeconds(newTimestampInput);
    if (parsed === null) return;
    if (timestamps.includes(parsed)) {
      setNewTimestampInput('');
      return;
    }
    setTimestamps([...timestamps, parsed].sort((a, b) => a - b));
    setNewTimestampInput('');
  };

  const handleRemoveTimestamp = (ts: number) => {
    setTimestamps(timestamps.filter((t) => t !== ts));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid MP4 or webm video file.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileName(file.name);
      setFileSize(`${sizeMB} MB`);

      if (file.size < 25 * 1024 * 1024) {
        const base64 = await readAsBase64(file);
        setAdVideoBase64(base64);
      } else {
        const objUrl = URL.createObjectURL(file);
        setAdVideoBase64(objUrl);
      }

      setMode('custom');
      setActivePreset('custom_file');
      setTitle(`Ad: ${file.name}`);
      setIsUploading(false);
    } catch (err: any) {
      setUploadError('Failed to import video file: ' + (err?.message || 'unknown error'));
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    const finalEnabled = mode !== 'none' && enabled;
    const config: VideoAdConfig = {
      enabled: finalEnabled,
      mode: finalEnabled ? mode : 'none',
      title: title.trim() || `Ad - ${video.title}`,
      sponsorName: sponsorName.trim() || 'Featured Sponsor',
      sponsorUrl: sponsorUrl.trim() || 'https://archive.org',
      adVideoBase64,
      fileName,
      fileSize,
      skipCountdownSeconds,
      timestamps: timestamps.length > 0 ? timestamps : [12],
      activePreset: activePreset as any,
    };

    onSave(video.id, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-xs select-none">
      <div className="bg-[#f0f0f0] border-2 border-[#999] rounded-md shadow-2xl w-full max-w-xl overflow-hidden text-gray-900 font-sans my-auto">
        {/* Window Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white px-3 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">📹</span>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide">
                Select Ad Video for Uploaded Video
              </h2>
              <p className="text-[10px] text-amber-100 font-medium truncate max-w-md">
                Video: {video.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded bg-black/30 hover:bg-black/50 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Video Preview Card */}
          <div className="bg-white border border-gray-300 rounded p-2.5 flex items-center gap-3">
            <img
              src={video.thumb}
              alt={video.title}
              className="w-20 h-14 object-cover rounded border border-gray-300 bg-black flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-gray-900 truncate">{video.title}</h3>
              <p className="text-[10px] text-gray-500">
                Duration: {video.time} • Uploaded {video.date}
              </p>
            </div>
          </div>

          {/* Ad Selection Mode */}
          <div className="bg-white border border-gray-300 rounded p-3 space-y-2.5 shadow-2xs">
            <label className="font-extrabold text-gray-800 text-xs block border-b border-gray-200 pb-1">
              Select Ad Configuration for this Video:
            </label>

            <div className="space-y-2">
              {/* Option 1: Global Ad */}
              <label
                className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                  mode === 'global' && enabled
                    ? 'bg-amber-50 border-amber-400 font-bold shadow-2xs ring-1 ring-amber-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="videoAdMode"
                  checked={mode === 'global' && enabled}
                  onChange={() => {
                    setMode('global');
                    setEnabled(true);
                  }}
                  className="mt-0.5 text-amber-600"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    🟡 Selected: Use Platform-Wide Global Ad
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Plays default global ad ({globalAd?.title || 'Retro Ad Spot'}) at configured timestamps.
                  </div>
                </div>
              </label>

              {/* Option 2: Specific Custom MP4 Ad for this Video */}
              <label
                className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                  mode === 'custom' && enabled
                    ? 'bg-purple-50 border-purple-400 font-bold shadow-2xs ring-1 ring-purple-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="videoAdMode"
                  checked={mode === 'custom' && enabled}
                  onChange={() => {
                    setMode('custom');
                    setEnabled(true);
                  }}
                  className="mt-0.5 text-purple-600"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    📹 Selected: Specific Custom Ad Video for this Video
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Import a dedicated MP4 commercial or choose a custom sponsor specifically for this video!
                  </div>
                </div>
              </label>

              {/* Option 3: Unselected / No Ads on this video */}
              <label
                className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                  mode === 'none' || !enabled
                    ? 'bg-gray-200 border-gray-400 font-bold shadow-2xs'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="videoAdMode"
                  checked={mode === 'none' || !enabled}
                  onChange={() => {
                    setMode('none');
                    setEnabled(false);
                  }}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-gray-800">
                    ⚪ Unselected: No Ads on this Video
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Video plays completely clean without commercial breaks or yellow line notches.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Specific MP4 Video Uploader & Options (if custom selected) */}
          {mode === 'custom' && enabled && (
            <div className="bg-white border border-gray-300 rounded p-3 space-y-3 shadow-2xs">
              <div className="font-extrabold text-xs text-purple-950 border-b border-gray-200 pb-1 flex items-center justify-between">
                <span>Import Dedicated MP4 Ad for this Video:</span>
                {fileName && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded font-bold">
                    ✓ MP4 Attached
                  </span>
                )}
              </div>

              {/* File upload trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 rounded p-3 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="text-xl mb-0.5">📁</div>
                <div className="font-bold text-purple-900 text-xs">
                  {fileName ? `Change File: ${fileName} (${fileSize})` : 'Choose MP4 Video Ad for this Video'}
                </div>
                <div className="text-[10px] text-gray-500">
                  Select any .mp4 file to play exclusively on this video
                </div>
                {isUploading && (
                  <div className="text-xs font-bold text-purple-600 mt-1 animate-pulse">
                    ⏳ Reading video file data...
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="text-red-600 font-bold bg-red-50 border border-red-200 p-2 rounded text-[11px]">
                  ⚠️ {uploadError}
                </div>
              )}

              {/* Or Select Retro Commercial Preset */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1">
                  Or select a nostalgic retro commercial spot:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(AD_PRESETS).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActivePreset(p.id);
                        setTitle(p.title);
                        setSponsorName(p.sponsorName);
                        setAdVideoBase64(undefined);
                        setFileName(undefined);
                      }}
                      className={`text-left p-1.5 rounded border transition-all cursor-pointer ${
                        activePreset === p.id && !fileName
                          ? 'bg-purple-100 border-purple-500 font-bold ring-1 ring-purple-400'
                          : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate">{p.title}</div>
                      <div className="text-[9px] text-gray-500 truncate">{p.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Sponsor inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                    Ad Title:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                    Sponsor Name:
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Timestamps configuration for this video */}
          {mode !== 'none' && enabled && (
            <div className="bg-white border border-gray-300 rounded p-3 space-y-2 shadow-2xs">
              <label className="font-extrabold text-xs text-gray-800 block border-b border-gray-200 pb-1">
                🟡 Iconic Yellow Line Cue Timestamps for this Video:
              </label>

              {/* Active timestamps */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[28px] p-1.5 bg-gray-50 border border-gray-200 rounded">
                {timestamps.map((ts) => (
                  <span
                    key={ts}
                    className="inline-flex items-center gap-1 bg-[#fbc02d] text-black font-black px-1.5 py-0.5 rounded text-[11px] border border-[#f57f17]"
                  >
                    <span>🟡 {formatTime(ts)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimestamp(ts)}
                      className="hover:text-red-700 font-black cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add timestamp */}
              <div className="flex items-center gap-1.5">
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
                  className="px-2 py-1 text-xs border border-gray-300 rounded-l-xs bg-white text-gray-900 w-28"
                />
                <button
                  type="button"
                  onClick={handleAddTimestamp}
                  className="btn text-xs py-1 px-2.5 font-bold bg-[#cc181e] text-white hover:bg-red-700 cursor-pointer"
                >
                  + Add Cue
                </button>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    type="button"
                    onClick={() => setTimestamps([5])}
                    className="btn text-[10px] py-0.5 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                  >
                    0:05
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimestamps([12])}
                    className="btn text-[10px] py-0.5 px-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 font-bold cursor-pointer"
                  >
                    0:12
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimestamps([30])}
                    className="btn text-[10px] py-0.5 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                  >
                    0:30
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#e2e2e2] border-t border-[#ccc] px-4 py-2.5 flex items-center justify-between gap-2 shadow-inner">
          <div>
            {onTriggerTestAd && mode !== 'none' && enabled && (
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  setTimeout(() => {
                    if (onTriggerTestAd) onTriggerTestAd();
                  }, 150);
                }}
                className="btn text-xs py-1 px-3 font-bold bg-amber-500 hover:bg-amber-400 text-black border-amber-600 cursor-pointer shadow-xs"
              >
                ▶ Test Ad on this Video
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
              Apply to Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
