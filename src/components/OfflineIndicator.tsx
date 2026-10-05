import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  onNavigateOfflineVault?: () => void;
  savedVideoCount?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onNavigateOfflineVault,
  savedVideoCount = 0,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col sm:flex-row items-center gap-2 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xl border-2 border-amber-400 select-none animate-bounce">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
        <span className="text-base">📺</span>
        <span>Offline Mode Active • Running without Internet Connection</span>
      </div>
      {onNavigateOfflineVault && (
        <button
          type="button"
          onClick={onNavigateOfflineVault}
          className="btn text-[11px] py-0.5 px-2 bg-black/40 hover:bg-black/60 text-white font-extrabold rounded border border-white/40 cursor-pointer"
        >
          <span>💾 View Offline Vault</span>
          {savedVideoCount > 0 && (
            <span className="ml-1 bg-white text-amber-900 px-1 py-0.2 rounded font-black text-[9px]">
              {savedVideoCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
