import React, { useState } from 'react';
import { Video } from '../types';
import { generateWaybackEmbedCode } from '../utils/wayback';

interface WaybackEmbedModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export const WaybackEmbedModal: React.FC<WaybackEmbedModalProps> = ({
  video,
  isOpen,
  onClose,
}) => {
  const [embedFormat, setEmbedFormat] = useState<'iframe' | 'flash_object' | 'html5_video' | 'direct_stream'>('iframe');
  const [embedWidth, setEmbedWidth] = useState(640);
  const [embedHeight, setEmbedHeight] = useState(385);
  const [autoplay, setAutoplay] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatedCode = generateWaybackEmbedCode(video, embedFormat, {
    width: embedWidth,
    height: embedHeight,
    autoplay,
    allowFullscreen: true,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#242424] text-white border-2 border-amber-500 rounded-lg max-w-xl w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="font-serif font-black text-amber-400 text-sm tracking-wide">
                WAYBACK MACHINE & ARCHIVE EMBED GENERATOR
              </h3>
              <div className="text-[11px] text-gray-400">
                Preserved Video Snapshot: {video.title}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-300">
            Choose Embed Format:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setEmbedFormat('iframe')}
              className={`p-2 rounded text-xs font-bold border text-left cursor-pointer transition-all ${
                embedFormat === 'iframe'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-black/40 text-gray-300 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div>🖼️ Clean IFrame</div>
              <div className="text-[9px] opacity-80 font-normal">Modern standard embed</div>
            </button>

            <button
              type="button"
              onClick={() => setEmbedFormat('flash_object')}
              className={`p-2 rounded text-xs font-bold border text-left cursor-pointer transition-all ${
                embedFormat === 'flash_object'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-black/40 text-gray-300 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div>⚡ Flash 2008 &lt;object&gt;</div>
              <div className="text-[9px] opacity-80 font-normal">Vintage MySpace / Forum</div>
            </button>

            <button
              type="button"
              onClick={() => setEmbedFormat('html5_video')}
              className={`p-2 rounded text-xs font-bold border text-left cursor-pointer transition-all ${
                embedFormat === 'html5_video'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-black/40 text-gray-300 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div>🎥 HTML5 Video</div>
              <div className="text-[9px] opacity-80 font-normal">Hardware &lt;video&gt; tag</div>
            </button>

            <button
              type="button"
              onClick={() => setEmbedFormat('direct_stream')}
              className={`p-2 rounded text-xs font-bold border text-left cursor-pointer transition-all ${
                embedFormat === 'direct_stream'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-black/40 text-gray-300 border-gray-700 hover:bg-gray-800'
              }`}
            >
              <div>🔗 Direct URL</div>
              <div className="text-[9px] opacity-80 font-normal">Raw byte stream</div>
            </button>
          </div>
        </div>

        {/* Dimension & Playback Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-gray-400 font-bold mb-1">Player Size:</label>
            <select
              value={`${embedWidth}x${embedHeight}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                setEmbedWidth(w);
                setEmbedHeight(h);
              }}
              className="w-full bg-[#111] border border-gray-700 text-white p-1.5 rounded text-xs"
            >
              <option value="640x385">640 × 385 (Classic 16:9)</option>
              <option value="480x360">480 × 360 (Retro 4:3 SD)</option>
              <option value="854x480">854 × 480 (480p Wide)</option>
              <option value="1280x720">1280 × 720 (720p HD)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-gray-200">Autoplay on Load</span>
            </label>
          </div>

          <div className="bg-black/40 p-2 rounded border border-gray-800 text-[10px] text-gray-400 font-mono">
            <div>Snapshot: {video.waybackSnapshotDate || 'Historical Archive'}</div>
            <div>Optimization: id_ Direct Range</div>
          </div>
        </div>

        {/* Code Box */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-amber-400">
              Embed HTML / Snippet Code:
            </label>
            {copied && (
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">
                Copied to clipboard!
              </span>
            )}
          </div>
          <textarea
            readOnly
            rows={4}
            value={generatedCode}
            className="w-full bg-black/90 text-amber-300 font-mono text-[11px] p-2.5 rounded border border-gray-700 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="text-[10px] text-gray-400 font-mono">
            Preserved directly from web.archive.org & archive.org
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-md flex items-center gap-1"
            >
              <span>📋</span>
              <span>Copy Embed Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
