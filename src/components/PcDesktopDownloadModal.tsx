import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  downloadWindowsExe,
  downloadWindowsBatLauncher,
  downloadWindowsDesktopShortcut,
  downloadOfflineHtmlPackage,
  downloadOfflineBatLauncher,
} from '../utils/pcDesktopDownloader';

interface PcDesktopDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const PcDesktopDownloadModal: React.FC<PcDesktopDownloadModalProps> = ({
  isOpen,
  onClose,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://retrotube.app';

  const handleDownloadExe = (exeName = 'RetroTube.exe') => {
    downloadWindowsExe(currentAppUrl, exeName);
    setDownloadSuccessMessage(`🎉 "${exeName}" downloaded! Portable executable ready — NO installation required. Just double-click to launch!`);
    setTimeout(() => setDownloadSuccessMessage(null), 6000);
  };

  const handleDownloadBat = () => {
    downloadWindowsBatLauncher(currentAppUrl, 'RetroTube-Desktop-Launcher.bat');
    setDownloadSuccessMessage('⚡ "RetroTube-Desktop-Launcher.bat" downloaded! Double-click to launch in standalone window.');
    setTimeout(() => setDownloadSuccessMessage(null), 6000);
  };

  const handleDownloadShortcut = () => {
    downloadWindowsDesktopShortcut(currentAppUrl, 'Create-RetroTube-Desktop-Shortcut.vbs');
    setDownloadSuccessMessage('📌 Shortcut script downloaded! Run it to place RetroTube on your Windows Desktop.');
    setTimeout(() => setDownloadSuccessMessage(null), 6000);
  };

  const handleDownloadOfflineHtml = () => {
    downloadOfflineHtmlPackage('RetroTube-Offline-Full-PC-Edition.html');
    setDownloadSuccessMessage('🌟 "RetroTube-Offline-Full-PC-Edition.html" downloaded! Complete original video catalog included — runs 100% offline without internet!');
    setTimeout(() => setDownloadSuccessMessage(null), 6000);
  };

  const handleDownloadOfflineBat = () => {
    downloadOfflineBatLauncher('RetroTube-PC-Offline-Launcher.bat');
    setDownloadSuccessMessage('⚡ "RetroTube-PC-Offline-Launcher.bat" downloaded! Double-click to launch the offline PC edition in clean window mode.');
    setTimeout(() => setDownloadSuccessMessage(null), 6000);
  };

  const handlePwaInstall = async () => {
    const success = await install();
    if (success) {
      setDownloadSuccessMessage('🌟 RetroTube installed to your desktop successfully!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 select-none backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#f0f0f0] border-2 border-[#888] rounded-md shadow-2xl w-full max-w-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Windows Aero / Retro Style Title Bar */}
        <div className="bg-gradient-to-r from-[#0058e6] via-[#2470f7] to-[#0042b3] text-white px-3 py-2 flex items-center justify-between font-bold text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🖥️</span>
            <span>RetroTube for Windows PC • Portable Executable (No Install Required)</span>
            <span className="text-[10px] bg-green-500 text-white font-black px-1.5 py-0.5 rounded font-mono shadow-xs">
              PORTABLE .EXE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded text-xs font-black cursor-pointer shadow-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-gray-800 max-h-[85vh] overflow-y-auto">
          {/* Notification Alert */}
          {downloadSuccessMessage && (
            <div className="bg-green-50 border-2 border-green-500 text-green-950 px-3 py-2 rounded text-xs font-bold flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1.5">
                <span>✅</span>
                <span>{downloadSuccessMessage}</span>
              </span>
              <button
                type="button"
                onClick={() => setDownloadSuccessMessage(null)}
                className="text-green-800 hover:text-green-950 font-black ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Hero Banner: Portable Executable Ready */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-red-950 text-white p-4 rounded-md shadow-md border-2 border-red-600/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-base font-black tracking-tight text-white">
                  RetroTube.exe — Portable PC Client
                </h3>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  ✓ NO INSTALL REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-gray-300 max-w-md">
                <strong>Zero setup wizard. Zero installer.</strong> Single-file standalone executable that runs directly on your Windows PC with native performance and clean window mode!
              </p>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleDownloadExe('RetroTube.exe')}
                className="btn btn-primary text-xs py-2 px-5 font-black shadow-lg flex items-center justify-center gap-1.5 bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white border-red-900 cursor-pointer"
              >
                <span>💾</span>
                <span>Download RetroTube.exe</span>
              </button>
              <div className="text-[9px] text-emerald-300 font-bold text-center">
                ✓ Ready to run immediately
              </div>
            </div>
          </div>

          {/* Download Options Grid */}
          <div className="space-y-2">
            <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1">
              <span>📦</span>
              <span>Select Your Portable Desktop Option:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Native Windows RetroTube.exe (NO INSTALL) */}
              <div className="bg-white border-2 border-red-500 rounded-md p-3 flex flex-col justify-between shadow-xs transition-all ring-2 ring-red-100">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-red-700 text-xs flex items-center gap-1">
                      <span>🪟</span>
                      <span>RetroTube.exe</span>
                    </span>
                    <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                      NO INSTALL REQUIRED
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-700 mt-1 font-medium">
                    Portable single-file Windows executable. Just download and double-click to launch directly!
                  </p>
                  <ul className="text-[9px] text-gray-600 mt-2 space-y-1 list-none">
                    <li className="flex items-center gap-1">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>No installer or setup:</strong> Runs straight out of the box</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>No administrator rights:</strong> Works on standard user accounts</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><strong>Universal:</strong> Compatible with Windows 11, 10, 8, 7, XP</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-3 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleDownloadExe('RetroTube.exe')}
                    className="btn btn-primary text-xs py-1.5 px-3 font-black w-full flex items-center justify-center gap-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                  >
                    <span>⬇️</span>
                    <span>Download RetroTube.exe (Portable)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadExe('RetroTube-Portable.exe')}
                    className="text-[10px] text-blue-700 hover:underline font-bold w-full text-center block cursor-pointer"
                  >
                    Alternative: Download as RetroTube-Portable.exe
                  </button>
                </div>
              </div>

              {/* Option 2: Full Standalone Offline PC Edition (Contains Full Original Content) */}
              <div className="bg-white border-2 border-indigo-400 hover:border-indigo-600 rounded-md p-3 flex flex-col justify-between shadow-xs transition-all ring-2 ring-indigo-50">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-800 text-xs flex items-center gap-1">
                      <span>💾</span>
                      <span>Full Offline PC Edition (.HTML)</span>
                    </span>
                    <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                      FULL CONTENT INCLUDED
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-700 mt-1 font-medium">
                    Self-contained PC standalone package with the actual original videos, retro player skins, comments, and watch history embedded!
                  </p>
                  <ul className="text-[9px] text-gray-600 mt-2 space-y-1 list-none">
                    <li className="flex items-center gap-1">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span><strong>Works 100% Offline:</strong> Zero internet connection needed</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span><strong>All original content:</strong> Full video catalog &amp; player inside</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span><strong>Runs on any PC:</strong> Open directly from USB or hard drive</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-3 space-y-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadOfflineHtml}
                    className="btn btn-primary text-xs py-1.5 px-3 font-black w-full flex items-center justify-center gap-1 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-800"
                  >
                    <span>⬇️</span>
                    <span>Download Offline PC Edition (.HTML)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadOfflineBat}
                    className="text-[10px] text-indigo-700 hover:underline font-bold w-full text-center block cursor-pointer"
                  >
                    + Download Windows Offline Kiosk Launcher (.BAT)
                  </button>
                </div>
              </div>

              {/* Option 3: Standalone Window Batch Launcher (.BAT) */}
              <div className="bg-white border border-gray-300 hover:border-blue-400 rounded-md p-3 flex flex-col justify-between shadow-xs transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-700 text-xs flex items-center gap-1">
                      <span>⚡</span>
                      <span>Standalone Launcher (.BAT)</span>
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-black">
                      NO INSTALL
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Native batch script that opens RetroTube in clean window mode (<code className="bg-gray-100 px-1 py-0.2 rounded font-mono">--app</code> kiosk) without browser address bars.
                  </p>
                  <ul className="text-[9px] text-gray-600 mt-2 space-y-1 list-none">
                    <li className="flex items-center gap-1">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Clean desktop app window</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>No browser tabs or URL bars</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Zero installation needed</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBat}
                  className="btn mt-3 text-xs py-1.5 px-3 font-bold w-full bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>⬇️</span>
                  <span>Download Launcher (.BAT)</span>
                </button>
              </div>

              {/* Option 3: Desktop Shortcut (.VBS) */}
              <div className="bg-white border border-gray-300 hover:border-amber-400 rounded-md p-3 flex flex-col justify-between shadow-xs transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-800 text-xs flex items-center gap-1">
                      <span>📌</span>
                      <span>Pin to Desktop Shortcut</span>
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-black">
                      1-CLICK
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Lightweight script that creates an authentic &ldquo;RetroTube&rdquo; shortcut directly on your Windows Desktop.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadShortcut}
                  className="btn mt-3 text-xs py-1.5 px-3 font-bold w-full bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>📌</span>
                  <span>Create Desktop Shortcut (.VBS)</span>
                </button>
              </div>

              {/* Option 4: PWA Desktop Browser Installation */}
              <div className="bg-white border border-gray-300 hover:border-green-400 rounded-md p-3 flex flex-col justify-between shadow-xs transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-green-800 text-xs flex items-center gap-1">
                      <span>🌐</span>
                      <span>Windows Taskbar App (PWA)</span>
                    </span>
                    <span className="bg-green-100 text-green-800 text-[9px] px-1.5 py-0.5 rounded font-black">
                      WINDOWS APP
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Adds RetroTube to your Windows Start Menu and Taskbar via Chrome or Edge browser integration.
                  </p>
                </div>

                {isInstalled ? (
                  <div className="mt-3 text-center py-1.5 px-3 bg-green-100 text-green-900 font-bold rounded text-xs">
                    ✓ Already Running as Desktop App
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePwaInstall}
                    className="btn mt-3 text-xs py-1.5 px-3 font-bold w-full bg-green-600 text-white hover:bg-green-700 border-green-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>💻</span>
                    <span>{isInstallable ? 'Install to Windows Apps' : 'Add to Windows Apps'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PC Keyboard Shortcuts Reference */}
          <div className="bg-gray-50 border border-gray-300 rounded p-3 space-y-2">
            <div className="font-extrabold text-gray-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>⌨️</span>
                <span>Full PC Keyboard Controls (Active on all playback):</span>
              </span>
              {onToggleFullscreen && (
                <button
                  type="button"
                  onClick={onToggleFullscreen}
                  className="btn text-[10px] py-0.5 px-2 bg-neutral-800 text-white hover:bg-black font-bold flex items-center gap-1"
                >
                  <span>🖥️</span>
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter PC Fullscreen (F11)'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">Space</kbd> or <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">K</kbd>
                <div className="text-gray-500 mt-0.5">Play / Pause</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">F</kbd> / <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">Enter</kbd>
                <div className="text-gray-500 mt-0.5">Toggle Fullscreen</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">M</kbd>
                <div className="text-gray-500 mt-0.5">Mute / Unmute</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">J</kbd> / <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">L</kbd>
                <div className="text-gray-500 mt-0.5">Seek -10s / +10s</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">←</kbd> / <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">→</kbd>
                <div className="text-gray-500 mt-0.5">Seek -5s / +5s</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">↑</kbd> / <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">↓</kbd>
                <div className="text-gray-500 mt-0.5">Volume Up / Down</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">0..9</kbd>
                <div className="text-gray-500 mt-0.5">Jump to 0%..90%</div>
              </div>
              <div className="bg-white p-1.5 rounded border border-gray-200">
                <kbd className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded border border-gray-300">C</kbd>
                <div className="text-gray-500 mt-0.5">Toggle Annotations</div>
              </div>
            </div>
          </div>

          {/* System Requirements */}
          <div className="border-t border-gray-200 pt-2 flex flex-wrap items-center justify-between text-[10px] text-gray-500">
            <span>Operating System: Windows 11, 10, 8.1, 7, Vista, XP (32-bit / 64-bit)</span>
            <span>Hardware: 512 MB RAM • Any Modern GPU</span>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 border-t border-gray-300 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleDownloadExe('RetroTube.exe')}
              className="text-red-700 hover:text-red-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>💾</span>
              <span>Direct Link: RetroTube.exe (Portable Standalone)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn text-xs py-1.5 px-5 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
