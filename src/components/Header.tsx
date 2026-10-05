import React, { useState } from 'react';
import { User, LogoEffect } from '../types';

interface HeaderProps {
  currentUser: User;
  users: User[];
  logoBase64?: string;
  logoHeight?: number;
  logoAnimationEffect?: LogoEffect;
  logoTagline?: string;
  showTagline?: boolean;
  customAdEnabled?: boolean;
  onSearch: (query: string) => void;
  onSwitchUser: (userId: string) => void;
  onAddSimulatedCash: () => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onOpenGiphyModal?: (initialQuery?: string) => void;
  onOpenCreateChannel?: () => void;
  onOpenAdSettings?: () => void;
  onOpenLogoModal?: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  logoBase64,
  logoHeight = 36,
  logoAnimationEffect = 'none',
  logoTagline = 'Broadcast Yourself™',
  showTagline = true,
  customAdEnabled,
  onSearch,
  onSwitchUser,
  onAddSimulatedCash,
  onNavigate,
  onOpenGiphyModal,
  onOpenCreateChannel,
  onOpenAdSettings,
  onOpenLogoModal,
  historyCount = 0,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTarget, setSearchTarget] = useState<'videos' | 'giphy'>('videos');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (searchTarget === 'giphy') {
      if (onOpenGiphyModal) {
        onOpenGiphyModal(query);
      }
    } else {
      onSearch(query);
    }
  };

  const getLogoEffectClass = (eff: LogoEffect) => {
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
    <header className="bg-gradient-to-b from-white to-[#f1f1f1] border-b border-[#e5e5e5] shadow-xs sticky top-0 z-50 py-2.5">
      <div className="max-w-[1040px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Slogan */}
        <div className="flex items-center gap-2 group/logo relative">
          {logoBase64 ? (
            <div className="flex items-center gap-2">
              <img
                src={logoBase64}
                alt="RetroTube Custom Logo"
                style={{ height: `${logoHeight}px` }}
                className={`max-h-16 w-auto cursor-pointer object-contain transition-transform group-hover/logo:scale-102 ${getLogoEffectClass(
                  logoAnimationEffect
                )}`}
                onClick={() => onNavigate('home')}
                title="RetroTube - Click to go Home"
              />
              {showTagline && logoTagline && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline-block">
                  {logoTagline}
                </span>
              )}
            </div>
          ) : (
            <div
              className="flex items-center cursor-pointer select-none group"
              onClick={() => onNavigate('home')}
            >
              <span className="text-2xl font-black tracking-tight text-gray-800">Retro</span>
              <span className="bg-gradient-to-b from-[#cc181e] to-[#a51014] text-white font-extrabold text-xl px-2 py-0.5 rounded-md ml-0.5 shadow-sm text-shadow-sm group-hover:scale-105 transition-transform">
                Tube
              </span>
              {showTagline && (
                <span className="ml-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline-block">
                  {logoTagline}
                </span>
              )}
            </div>
          )}

          {/* Quick Edit/Upload Logo Hover Badge */}
          {onOpenLogoModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLogoModal();
              }}
              className="opacity-0 group-hover/logo:opacity-100 transition-opacity bg-black/75 hover:bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow cursor-pointer ml-1 hidden sm:inline-flex items-center gap-1"
              title="Upload custom logo (GIF, PNG, SVG, local file)"
            >
              <span>📷</span>
              <span>{logoBase64 ? 'Edit Logo' : 'Upload Logo'}</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-lg">
          <select
            value={searchTarget}
            onChange={(e) => setSearchTarget(e.target.value as 'videos' | 'giphy')}
            className="text-[11px] font-bold py-1.5 px-1.5 border border-r-0 border-gray-300 rounded-l-xs bg-[#f8f8f8] text-gray-700 cursor-pointer focus:outline-none"
            title="Choose search mode: Videos or Live GIPHY GIFs"
          >
            <option value="videos">Videos</option>
            <option value="giphy">🎞️ GIPHY</option>
          </select>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              searchTarget === 'giphy'
                ? 'Search live animated GIFs on GIPHY...'
                : 'Search videos, channels, 1080p remasters...'
            }
            className="flex-1 text-xs px-3 py-1.5 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-red-600 shadow-inner"
          />
          <button
            type="submit"
            className={`btn rounded-r-xs rounded-l-none border-l-0 py-1.5 px-3 text-xs font-bold ${
              searchTarget === 'giphy' ? 'bg-red-600 text-white hover:bg-red-700' : ''
            }`}
          >
            {searchTarget === 'giphy' ? 'Find GIF' : 'Search'}
          </button>
        </form>

        {/* User Navigation & Wallet */}
        <div className="flex items-center gap-2 text-xs">
          {/* GIPHY Live Search Quick Button */}
          {onOpenGiphyModal && (
            <button
              type="button"
              onClick={() => onOpenGiphyModal(searchInput.trim())}
              className="btn text-xs py-1 px-2.5 font-black bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 border-red-700 shadow-2xs flex items-center gap-1 cursor-pointer"
              title="Open Live Working GIPHY Embed Explorer"
            >
              <span>🎞️</span>
              <span className="hidden sm:inline">GIPHY</span>
            </button>
          )}

          {/* Simulated Balance Box */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded px-2 py-1 shadow-2xs">
            <span className="font-extrabold text-amber-800" title="Simulated creator & tipping balance">
              💰 ${(currentUser.balance || 0).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={onAddSimulatedCash}
              className="text-[10px] font-bold text-green-700 hover:underline cursor-pointer"
              title="Add $50 simulated testing funds"
            >
              + Cash
            </button>
          </div>

          {/* User Account Switcher */}
          <select
            value={currentUser.id}
            onChange={(e) => {
              if (e.target.value === '__create_channel__') {
                if (onOpenCreateChannel) onOpenCreateChannel();
              } else {
                onSwitchUser(e.target.value);
              }
            }}
            className="text-xs font-bold py-1 px-1.5 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer max-w-[130px]"
          >
            <optgroup label="Your Channels">
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.isYoutubeImported ? `📺 ${u.username}` : u.username}
                </option>
              ))}
            </optgroup>
            <optgroup label="Channel Actions">
              <option value="__create_channel__">+ Create New Channel...</option>
            </optgroup>
          </select>

          {onOpenCreateChannel && (
            <button
              type="button"
              onClick={onOpenCreateChannel}
              className="btn text-xs py-1 px-2 font-bold bg-red-50 text-red-700 hover:bg-red-100 border-red-300 cursor-pointer shadow-2xs flex items-center gap-1"
              title="Create a new channel or import from YouTube"
            >
              <span>+</span>
              <span className="hidden sm:inline">Channel</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('channel', { id: currentUser.id })}
            className="text-blue-700 hover:underline font-bold hidden md:inline-block cursor-pointer"
          >
            My Channel
          </button>

          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="btn text-xs py-1 px-2.5 font-bold bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-600 hidden sm:inline-block cursor-pointer shadow-2xs"
            title="Creator Studio (Video Manager, Analytics, Live Stream)"
          >
            🎬 Studio
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mcn')}
            className="btn text-xs py-1 px-2.5 font-bold bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hidden sm:inline-block cursor-pointer shadow-2xs"
            title="MCN Simulator & Brand Deals Hub"
          >
            🏢 MCN Hub
          </button>

          {onOpenAdSettings && (
            <button
              type="button"
              onClick={onOpenAdSettings}
              className={`btn text-xs py-1 px-2.5 font-bold border transition-all cursor-pointer shadow-2xs hidden sm:inline-flex items-center gap-1 ${
                customAdEnabled
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
              }`}
              title="Custom Video Ads, MP4 Import & Yellow Line Timestamps"
            >
              <span>🟡</span>
              <span>Ads</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-black ${customAdEnabled ? 'bg-amber-400 text-black' : 'bg-gray-200 text-gray-600'}`}>
                {customAdEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {onOpenLogoModal && (
            <button
              type="button"
              onClick={onOpenLogoModal}
              className="btn text-xs py-1 px-2.5 font-bold bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hidden sm:inline-flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Upload Custom RetroTube Logo (GIF, PNG, SVG, JPG)"
            >
              <span>🖼️</span>
              <span>Logo</span>
              {logoBase64 && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" title="Custom logo active" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-gray-700 hover:text-red-700 cursor-pointer font-bold hidden sm:inline-flex items-center gap-1"
            title="View Your Watched Video History"
          >
            <span>📜</span>
            <span>History</span>
            {historyCount > 0 && (
              <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded-full font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="text-gray-600 hover:text-gray-900 cursor-pointer font-bold"
            title="Skins & Audio Settings"
          >
            ⚙️ Settings
          </button>

          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="btn btn-primary py-1 px-3 text-xs font-bold cursor-pointer"
          >
            Upload
          </button>
        </div>
      </div>
    </header>
  );
};
