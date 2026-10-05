import { Video, CustomAdSettings } from '../types';

/**
 * Resolves the effective ad settings for a specific video.
 * Handles:
 * 1. Specific custom ad video imported for this video
 * 2. Explicitly selected / unselected state for this video
 * 3. Fallback to global platform ad if enabled and not disabled for this video
 */
export function getEffectiveVideoAd(
  video?: Video | null,
  globalAd?: CustomAdSettings | null
): CustomAdSettings | null {
  if (!video) return globalAd && globalAd.enabled ? globalAd : null;

  const vConfig = video.customAdConfig;

  // 1. Check video-specific configuration
  if (vConfig) {
    // Explicitly unselected / disabled for this video
    if (!vConfig.enabled || vConfig.mode === 'none') {
      return null;
    }

    // Specific custom ad video imported or selected for this video
    if (vConfig.mode === 'custom') {
      return {
        enabled: true,
        title: vConfig.title || `Special Commercial (${video.title})`,
        sponsorName: vConfig.sponsorName || 'Featured Video Sponsor',
        sponsorUrl: vConfig.sponsorUrl || 'https://archive.org',
        adVideoBase64: vConfig.adVideoBase64,
        fileName: vConfig.fileName,
        fileSize: vConfig.fileSize,
        skipCountdownSeconds: vConfig.skipCountdownSeconds ?? 5,
        canSkip: true,
        timestamps: vConfig.timestamps && vConfig.timestamps.length > 0 ? vConfig.timestamps : [12],
        applyToAllVideos: false,
        activePreset: vConfig.activePreset || (vConfig.adVideoBase64 ? 'custom_file' : 'cybersoda'),
      };
    }

    // Explicitly selected global ad mode
    if (vConfig.mode === 'global') {
      if (!globalAd || !globalAd.enabled) return null;
      return {
        ...globalAd,
        timestamps: vConfig.timestamps && vConfig.timestamps.length > 0 ? vConfig.timestamps : globalAd.timestamps,
      };
    }
  }

  // 2. Explicitly deselected override flag
  if (video.customAdDisabled) {
    return null;
  }

  // 3. Fall back to global ad if active
  if (globalAd && globalAd.enabled) {
    // If onlySelectedVideos is on (or applyToAllVideos is false), check if this video is selected!
    const onlySelected = globalAd.onlySelectedVideos ?? (!globalAd.applyToAllVideos);
    if (onlySelected) {
      const isSelected = globalAd.selectedVideoIds?.includes(video.id);
      if (!isSelected) {
        return null;
      }
    }

    if (video.customAdTimestamps && video.customAdTimestamps.length > 0) {
      return {
        ...globalAd,
        timestamps: video.customAdTimestamps,
      };
    }
    return globalAd;
  }

  return null;
}

/**
 * Returns human-readable ad status badge details for a video
 */
export function getVideoAdStatus(
  video: Video,
  globalAd?: CustomAdSettings | null
): {
  isEnabled: boolean;
  mode: 'custom' | 'global' | 'none';
  badgeText: string;
  badgeClass: string;
  description: string;
  isExplicitlySelected: boolean;
} {
  const effective = getEffectiveVideoAd(video, globalAd);
  const vConfig = video.customAdConfig;

  if (vConfig?.mode === 'custom' && vConfig.enabled) {
    return {
      isEnabled: true,
      mode: 'custom',
      badgeText: '📹 Specific MP4 Ad (Selected)',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold',
      description: vConfig.fileName ? `Custom file: ${vConfig.fileName}` : 'Specific ad configured for this video',
      isExplicitlySelected: true,
    };
  }

  if (effective && effective.enabled) {
    return {
      isEnabled: true,
      mode: 'global',
      badgeText: '🟡 Selected for Ads',
      badgeClass: 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold',
      description: `Active commercial break at: ${effective.timestamps.map((t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`).join(', ')}`,
      isExplicitlySelected: true,
    };
  }

  return {
    isEnabled: false,
    mode: 'none',
    badgeText: '⚪ Deselected (Ad-Free)',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300 font-bold',
    description: 'This video is deselected. Clean playback without ads or yellow lines.',
    isExplicitlySelected: false,
  };
}

export function isVideoSelectedForAds(video: Video, globalAd?: CustomAdSettings | null): boolean {
  return getVideoAdStatus(video, globalAd).isEnabled;
}
