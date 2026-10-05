import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenPcModal?: () => void;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenPcModal,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, render a sleek indicator or PC Hub trigger
  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={onOpenPcModal}
        className={`btn text-xs py-1 px-2.5 font-bold bg-green-50 text-green-900 border-green-300 hover:bg-green-100 flex items-center gap-1 cursor-pointer shadow-2xs ${className}`}
        title="RetroTube PC App Active • Open PC Download Hub & Settings"
      >
        <span>💻</span>
        <span className="hidden sm:inline">PC Edition</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      </button>
    );
  }

  // Chromium / Edge / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`btn text-xs py-1 px-2.5 font-extrabold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 border-red-700 shadow-2xs flex items-center gap-1 cursor-pointer animate-pulse ${className}`}
        title="Install RetroTube directly to Windows Taskbar & Desktop"
      >
        <span>💻</span>
        <span>Install PC App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`btn text-xs py-1 px-2 font-bold bg-white text-gray-700 border-gray-300 hover:bg-gray-100 flex items-center gap-1 cursor-pointer shadow-2xs ${className}`}
          title="Install on iPhone / iPad Home Screen"
        >
          <span>📱</span>
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-gray-300 text-gray-800">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>📱</span>
                <span>Install RetroTube on iPhone / iPad</span>
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                1. Tap the <strong>Share</strong> button in the Safari bottom toolbar (box with upward arrow).<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Tap <strong>Add</strong> in the top right to install RetroTube!
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="btn btn-primary mt-4 w-full py-1.5 text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback: Always allow opening PC Hub & downloading .EXE
  return (
    <button
      type="button"
      onClick={onOpenPcModal}
      className={`btn text-xs py-1 px-2.5 font-bold bg-gradient-to-r from-neutral-900 to-neutral-800 text-white hover:bg-black border-neutral-700 flex items-center gap-1 cursor-pointer shadow-2xs ${className}`}
      title="Download RetroTube for PC (.EXE / Windows Desktop Launcher)"
    >
      <span>🖥️</span>
      <span className="hidden sm:inline">PC .EXE</span>
    </button>
  );
};
