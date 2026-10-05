import React, { useState, useRef, useEffect } from 'react';
import { GlobalSettings, LogoEffect } from '../types';
import { readImageFileAsDataUrl, ImageFileInfo } from '../utils/text';
import { RETRO_LOGO_PRESETS, RetroLogoPreset } from '../data/logoPresets';

interface CustomLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalSettings: GlobalSettings;
  onSaveLogo: (settings: {
    logoBase64: string;
    logoHeight: number;
    logoAnimationEffect: LogoEffect;
    logoTagline?: string;
    showTagline?: boolean;
    customLogoName?: string;
    customLogoType?: string;
    customLogoSize?: string;
  }) => void;
  onResetDefault: () => void;
}

export const CustomLogoModal: React.FC<CustomLogoModalProps> = ({
  isOpen,
  onClose,
  globalSettings,
  onSaveLogo,
  onResetDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'options'>('upload');
  const [logoBase64, setLogoBase64] = useState<string>(globalSettings.logoBase64 || '');
  const [logoHeight, setLogoHeight] = useState<number>(globalSettings.logoHeight || 36);
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(globalSettings.logoAnimationEffect || 'none');
  const [logoTagline, setLogoTagline] = useState<string>(globalSettings.logoTagline || 'Broadcast Yourself™');
  const [showTagline, setShowTagline] = useState<boolean>(globalSettings.showTagline ?? true);

  const [fileInfo, setFileInfo] = useState<ImageFileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'winxp' | 'vista'>('light');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLogoBase64(globalSettings.logoBase64 || '');
      setLogoHeight(globalSettings.logoHeight || 36);
      setLogoEffect(globalSettings.logoAnimationEffect || 'none');
      setLogoTagline(globalSettings.logoTagline || 'Broadcast Yourself™');
      setShowTagline(globalSettings.showTagline ?? true);
      setErrorMessage(null);

      if (globalSettings.customLogoName) {
        setFileInfo({
          dataUrl: globalSettings.logoBase64 || '',
          name: globalSettings.customLogoName,
          type: globalSettings.customLogoType || 'image/png',
          size: globalSettings.customLogoSize || 'Saved',
          sizeBytes: 0,
          width: 0,
          height: 0,
          isAnimatedGif: (globalSettings.customLogoType || '').includes('gif') || (globalSettings.customLogoName || '').toLowerCase().endsWith('.gif'),
        });
      } else {
        setFileInfo(null);
      }
    }
  }, [isOpen, globalSettings]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/') && !file.name.match(/\.(png|gif|jpe?g|webp|svg|bmp|ico|apng)$/i)) {
      setErrorMessage('Please select a valid image file (GIF, PNG, SVG, JPG, WebP, BMP, or ICO).');
      return;
    }

    try {
      const info = await readImageFileAsDataUrl(file);
      if (info) {
        setLogoBase64(info.dataUrl);
        setFileInfo(info);

        // Auto-adjust height suggestion if aspect ratio is wide
        if (info.height > 0 && info.width > 0) {
          const ratio = info.width / info.height;
          if (ratio > 4 && logoHeight < 32) {
            setLogoHeight(34);
          }
        }
      } else {
        setErrorMessage('Failed to read image file. Please try another file.');
      }
    } catch (err: any) {
      setErrorMessage(`Error importing file: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = (preset: RetroLogoPreset) => {
    setLogoBase64(preset.dataUrl);
    setLogoHeight(preset.recommendedHeight);
    setLogoTagline(preset.tagline);
    setFileInfo({
      dataUrl: preset.dataUrl,
      name: `${preset.name}.svg`,
      type: 'image/svg+xml',
      size: 'Vector SVG',
      sizeBytes: 2048,
      width: 300,
      height: 64,
      isAnimatedGif: false,
    });
    setErrorMessage(null);
  };

  const handleSave = () => {
    onSaveLogo({
      logoBase64,
      logoHeight,
      logoAnimationEffect: logoEffect,
      logoTagline,
      showTagline,
      customLogoName: fileInfo?.name || (logoBase64 ? 'custom_logo' : undefined),
      customLogoType: fileInfo?.type || (logoBase64 ? 'image/png' : undefined),
      customLogoSize: fileInfo?.size || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setLogoBase64('');
    setFileInfo(null);
    setLogoHeight(36);
    setLogoEffect('none');
    setLogoTagline('Broadcast Yourself™');
    setShowTagline(true);
    onResetDefault();
    onClose();
  };

  const getEffectClassName = (eff: LogoEffect) => {
    switch (eff) {
      case 'glow':
        return 'logo-effect-glow';
      case 'pulse':
        return 'logo-effect-pulse';
      case 'scanline':
        return 'logo-effect-scanline';
      case 'glitch':
        return 'logo-effect-glitch';
      case 'pixelated':
        return 'logo-effect-pixelated';
      default:
        return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 select-none backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#f0f0f0] border-2 border-[#999] rounded-md shadow-2xl w-full max-w-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Window Title Bar */}
        <div className="bg-gradient-to-r from-[#cc181e] via-[#b81419] to-[#800a0d] text-white px-3 py-2 flex items-center justify-between font-bold text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🎨</span>
            <span>RetroTube Custom Logo Studio</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">
              GIF • PNG • SVG • LOCAL IMPORT
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-gray-800 max-h-[85vh] overflow-y-auto">
          {/* Header Simulation Live Preview */}
          <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-xs">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex items-center justify-between">
              <span className="font-extrabold text-gray-700 flex items-center gap-1.5">
                <span>👁️</span>
                <span>Live Header Simulator:</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <span className="text-gray-500 mr-1">Preview Theme:</span>
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  className={`px-2 py-0.5 rounded border ${
                    previewBg === 'light' ? 'bg-white border-red-500 text-red-600 font-black' : 'bg-gray-200 border-gray-300 text-gray-700'
                  }`}
                >
                  Light ☀️
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2 py-0.5 rounded border ${
                    previewBg === 'dark' ? 'bg-neutral-800 border-red-500 text-white font-black' : 'bg-gray-200 border-gray-300 text-gray-700'
                  }`}
                >
                  Dark 🌙
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('winxp')}
                  className={`px-2 py-0.5 rounded border ${
                    previewBg === 'winxp' ? 'bg-blue-600 border-yellow-400 text-white font-black' : 'bg-gray-200 border-gray-300 text-gray-700'
                  }`}
                >
                  WinXP 🟦
                </button>
              </div>
            </div>

            {/* Simulated Header Container */}
            <div
              className={`p-3 transition-colors ${
                previewBg === 'light'
                  ? 'bg-gradient-to-b from-white to-[#f1f1f1] border-b border-[#e5e5e5]'
                  : previewBg === 'dark'
                  ? 'bg-neutral-900 border-b border-neutral-700 text-white'
                  : 'bg-gradient-to-b from-[#0058e6] via-[#3879f4] to-[#0046b8] border-b border-[#002d80] text-white'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Simulated Logo Display */}
                <div className="flex items-center gap-2">
                  {logoBase64 ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={logoBase64}
                        alt="Custom RetroTube Logo"
                        style={{ height: `${logoHeight}px` }}
                        className={`max-h-14 w-auto object-contain transition-all ${getEffectClassName(logoEffect)}`}
                      />
                      {showTagline && logoTagline && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block ${
                            previewBg === 'light' ? 'text-gray-500' : 'text-gray-200'
                          }`}
                        >
                          {logoTagline}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center select-none">
                      <span
                        className={`text-2xl font-black tracking-tight ${
                          previewBg === 'light' ? 'text-gray-800' : 'text-white'
                        }`}
                      >
                        Retro
                      </span>
                      <span className="bg-gradient-to-b from-[#cc181e] to-[#a51014] text-white font-extrabold text-xl px-2 py-0.5 rounded-md ml-0.5 shadow-sm">
                        Tube
                      </span>
                      {showTagline && (
                        <span
                          className={`ml-2 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block ${
                            previewBg === 'light' ? 'text-gray-500' : 'text-gray-200'
                          }`}
                        >
                          {logoTagline || 'Broadcast Yourself™'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulated Search Mockup */}
                <div className="flex items-center gap-1 opacity-70 scale-95 pointer-events-none hidden sm:flex">
                  <div className="text-[10px] bg-white border border-gray-300 px-3 py-1 text-gray-500 rounded-l w-36">
                    Search videos...
                  </div>
                  <div className="btn text-[10px] py-1 px-2 rounded-r rounded-l-none bg-gray-200 font-bold">
                    Search
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-300 gap-1 font-bold text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-1.5 px-3.5 border-t border-l border-r rounded-t-md transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white border-gray-300 text-red-600 border-b-white -mb-px shadow-2xs font-extrabold'
                  : 'bg-gray-200 border-transparent text-gray-600 hover:bg-gray-300'
              }`}
            >
              📁 Upload Local File (GIF, PNG, etc.)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`py-1.5 px-3.5 border-t border-l border-r rounded-t-md transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-white border-gray-300 text-red-600 border-b-white -mb-px shadow-2xs font-extrabold'
                  : 'bg-gray-200 border-transparent text-gray-600 hover:bg-gray-300'
              }`}
            >
              ⭐ Retro Vintage Presets ({RETRO_LOGO_PRESETS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('options')}
              className={`py-1.5 px-3.5 border-t border-l border-r rounded-t-md transition-all cursor-pointer ${
                activeTab === 'options'
                  ? 'bg-white border-gray-300 text-red-600 border-b-white -mb-px shadow-2xs font-extrabold'
                  : 'bg-gray-200 border-transparent text-gray-600 hover:bg-gray-300'
              }`}
            >
              🎛️ Sizing, Taglines & Retro Effects
            </button>
          </div>

          {/* TAB 1: LOCAL FILE UPLOAD (GIF, PNG, SVG, JPG, WEBP, etc.) */}
          {activeTab === 'upload' && (
            <div className="space-y-3 bg-white p-3.5 rounded-b-md border border-t-0 border-gray-300">
              {errorMessage && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-1.5 rounded text-xs font-bold flex items-center justify-between">
                  <span>⚠️ {errorMessage}</span>
                  <button type="button" onClick={() => setErrorMessage(null)} className="text-red-900 ml-2">✕</button>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-600 bg-red-50/70 ring-4 ring-red-200'
                    : 'border-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-red-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.gif,.png,.jpg,.jpeg,.webp,.svg,.bmp,.ico,.apng"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-2xl">
                    <span title="Animated GIF">🎞️</span>
                    <span title="Lossless PNG">🖼️</span>
                    <span title="Scalable SVG">📐</span>
                    <span title="WebP / JPG">🌟</span>
                  </div>
                  <div className="font-extrabold text-sm text-gray-800">
                    Click to browse or Drag & Drop custom logo file here
                  </div>
                  <div className="text-[11px] text-gray-500 max-w-md">
                    Direct local file import. Full support for <strong className="text-red-700">animated GIFs</strong> (keeps loop animations intact), <strong className="text-blue-700">transparent PNGs</strong>, SVGs, JPEGs, and WebP!
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="btn btn-primary mt-2 text-xs py-1.5 px-4 font-bold shadow-xs cursor-pointer"
                  >
                    📂 Browse Image From Computer...
                  </button>
                </div>
              </div>

              {/* Loaded File Info Card */}
              {fileInfo && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white border border-gray-300 rounded flex items-center justify-center p-1 overflow-hidden shadow-inner">
                      <img src={fileInfo.dataUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-green-950 flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{fileInfo.name}</span>
                        {fileInfo.isAnimatedGif && (
                          <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                            🎞️ ANIMATED GIF
                          </span>
                        )}
                        {fileInfo.type.includes('png') && (
                          <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                            PNG (ALPHA)
                          </span>
                        )}
                        {fileInfo.type.includes('svg') && (
                          <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                            VECTOR SVG
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-600 flex items-center gap-2 mt-0.5">
                        <span>Format: {fileInfo.type}</span>
                        <span>•</span>
                        <span>Size: {fileInfo.size}</span>
                        {fileInfo.width > 0 && (
                          <>
                            <span>•</span>
                            <span>Dimensions: {fileInfo.width} × {fileInfo.height} px</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn text-[11px] py-1 px-2.5 font-bold cursor-pointer"
                    >
                      Choose Different File
                    </button>
                  </div>
                </div>
              )}

              {/* Supported formats legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                  <div className="font-extrabold text-red-700">🎞️ Animated GIF</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Loops smoothly in header</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                  <div className="font-extrabold text-blue-700">🖼️ Lossless PNG</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Preserves clear transparency</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                  <div className="font-extrabold text-amber-700">📐 Scalable SVG</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Ultra-sharp on Retina/4K</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                  <div className="font-extrabold text-green-700">📸 WebP & JPG</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Fast local photo loading</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RETRO VINTAGE PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3 bg-white p-3.5 rounded-b-md border border-t-0 border-gray-300">
              <div className="text-[11px] text-gray-600">
                Want a nostalgic look right now? Click any preset below to test or apply instantly:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RETRO_LOGO_PRESETS.map((preset) => {
                  const isSelected = logoBase64 === preset.dataUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-red-600 bg-red-50/60 ring-2 ring-red-400 shadow-xs'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-10 flex items-center justify-center bg-white border border-gray-200 rounded p-1 mb-2">
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="max-h-8 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between font-extrabold text-xs text-gray-900">
                          <span>{preset.name}</span>
                          <span className="text-[9px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-black">
                            {preset.badgeText}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                          {preset.description}
                        </div>
                      </div>
                      <div className="mt-2 pt-1 border-t border-gray-200 flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Era: {preset.era}</span>
                        <span className={`font-bold ${isSelected ? 'text-red-700' : 'text-blue-600'}`}>
                          {isSelected ? '✓ Selected' : 'Click to Load'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SIZING & RETRO EFFECTS */}
          {activeTab === 'options' && (
            <div className="space-y-4 bg-white p-3.5 rounded-b-md border border-t-0 border-gray-300">
              {/* Logo Height Slider */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-extrabold text-xs text-gray-800">
                    Logo Display Height: <span className="text-red-600">{logoHeight}px</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLogoHeight(36)}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Reset (36px)
                  </button>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  value={logoHeight}
                  onChange={(e) => setLogoHeight(parseInt(e.target.value, 10))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                  <span>20px (Compact)</span>
                  <span>36px (Standard Header)</span>
                  <span>60px (Extra Large)</span>
                </div>
              </div>

              {/* Retro Visual Effects */}
              <div>
                <label className="font-extrabold text-xs text-gray-800 block mb-2">
                  Retro CRT & Visual Effect:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'none' as LogoEffect, label: 'Clean Original', desc: 'No filters or extra effects' },
                    { id: 'glow' as LogoEffect, label: '🔥 Neon Retro Glow', desc: 'Warm 2000s tube backlight' },
                    { id: 'pulse' as LogoEffect, label: '💓 Gentle Pulse', desc: 'Subtle breathing pulse motion' },
                    { id: 'scanline' as LogoEffect, label: '📺 CRT Scanlines', desc: 'Vintage TV phosphor contrast' },
                    { id: 'glitch' as LogoEffect, label: '⚡ VHS Glitch', desc: 'Periodic analog tape jitter' },
                    { id: 'pixelated' as LogoEffect, label: '👾 8-Bit Pixel Art', desc: 'Crisp nearest-neighbor pixels' },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => setLogoEffect(eff.id)}
                      className={`p-2 rounded text-left border cursor-pointer transition-all ${
                        logoEffect === eff.id
                          ? 'border-red-600 bg-red-50 text-red-950 ring-2 ring-red-400 shadow-2xs'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="font-extrabold text-xs">{eff.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{eff.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slogan / Tagline */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                  <input
                    type="checkbox"
                    checked={showTagline}
                    onChange={(e) => setShowTagline(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span>Show Tagline beside Logo in Header</span>
                </label>
                {showTagline && (
                  <div>
                    <input
                      type="text"
                      value={logoTagline}
                      onChange={(e) => setLogoTagline(e.target.value)}
                      placeholder="e.g. Broadcast Yourself™"
                      className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
                    />
                    <div className="text-[9px] text-gray-500 mt-1">
                      Nostalgic slogans: &ldquo;Broadcast Yourself™&rdquo;, &ldquo;1080p HD Streaming&rdquo;, &ldquo;Your Digital Video Repository&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-red-700 hover:text-red-900 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>🔄</span>
              <span>Revert to Default RetroTube Logo</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn text-xs py-1.5 px-4 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary text-xs py-1.5 px-6 font-bold shadow-md cursor-pointer flex items-center gap-1"
              >
                <span>✓</span>
                <span>Apply & Save Logo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
