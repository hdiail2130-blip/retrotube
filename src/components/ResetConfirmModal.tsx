import React from 'react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border-2 border-red-600 rounded-md shadow-2xl max-w-md w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2.5 flex items-center justify-between font-bold shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <span>⚠️</span>
            <span>Reset RetroTube to Factory Defaults</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white font-black text-base leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 bg-neutral-50 text-gray-800">
          <div className="bg-amber-50 border border-amber-300 rounded p-3 text-amber-950 font-medium leading-relaxed">
            <strong className="block text-xs font-bold text-red-700 mb-1">
              Warning: This action will restore all platform data to initial 2011 factory state!
            </strong>
            Any custom created channels, imported videos, watch history, custom ads, and created playlists will be reset back to the original RetroTube defaults.
          </div>

          <div className="text-[11px] space-y-1.5 text-gray-700">
            <p className="font-bold text-gray-900">What will be restored:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-gray-600">
              <li>Original spotlight video catalog &amp; iconic channels</li>
              <li>Classic player skins and red theme branding</li>
              <li>Fresh clean watch history &amp; initial offline vault</li>
              <li>Default Machinima &amp; classic MCN partnerships</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-100 border-t border-gray-300 px-4 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn py-1.5 px-4 font-bold text-gray-700 bg-white hover:bg-gray-50 border-gray-300 cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            className="btn btn-primary py-1.5 px-4 font-black bg-red-600 hover:bg-red-700 text-white border-red-800 cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>🗑️</span>
            <span>Yes, Reset Default State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
