/**
 * YouTube IFrame and High-Resolution Streaming Helpers
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Check if it's a Wayback Machine archive URL containing a youtube link
  const waybackMatch = trimmed.match(/web\.archive\.org\/web\/[0-9a-zA-Z_]+\/(https?:\/\/.*)/i);
  if (waybackMatch && waybackMatch[1]) {
    return extractYouTubeId(waybackMatch[1]);
  }

  // Check archive.org/details/youtube-ID or archive.org/embed/youtube-ID
  const archiveYtMatch = trimmed.match(/archive\.org\/(?:details|embed)\/youtube-([a-zA-Z0-9_-]{11})/i);
  if (archiveYtMatch) {
    return archiveYtMatch[1];
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  options: {
    autoplay?: boolean;
    start?: number;
    highRes?: boolean;
    playbackRate?: number;
  } = {}
): string {
  const { autoplay = true, start = 0 } = options;
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    playsinline: '1',
    iv_load_policy: '3',
    fs: '1',
  });

  if (start > 0) {
    params.set('start', Math.floor(start).toString());
  }

  // Ensure origin is attached when available
  if (typeof window !== 'undefined' && window.location.origin) {
    params.set('origin', window.location.origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Loads the YouTube IFrame API script dynamically into document.
 */
let ytApiPromise: Promise<void> | null = null;

export function loadYouTubeIFrameAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if ((window as unknown as { YT?: { Player: unknown } }).YT && (window as unknown as { YT: { Player: unknown } }).YT.Player) {
    return Promise.resolve();
  }

  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const existing = document.getElementById('youtube-iframe-api');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousCallback = (window as unknown as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady;
    (window as unknown as { onYouTubeIframeAPIReady: () => void }).onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      resolve();
    };

    // Fallback timer if already loaded or blocked
    setTimeout(() => {
      if ((window as unknown as { YT?: { Player: unknown } }).YT?.Player) {
        resolve();
      }
    }, 2000);
  });

  return ytApiPromise;
}

export const SPEED_OPTIONS = [
  { label: '0.25x (Super Slow)', value: 0.25 },
  { label: '0.5x (Slow)', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x (Normal)', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x (Fast)', value: 1.5 },
  { label: '1.75x', value: 1.75 },
  { label: '2.0x (Double Speed ⚡)', value: 2.0 },
  { label: '2.5x (Turbo)', value: 2.5 },
  { label: '3.0x (Hyperspeed 🚀)', value: 3.0 },
];

export const QUALITY_OPTIONS = [
  { label: 'Auto (Best Resolution)', value: 'auto', badge: 'Auto' },
  { label: '1080p HD (High Definition)', value: 'hd1080', badge: '1080p' },
  { label: '720p HD', value: 'hd720', badge: '720p' },
  { label: '480p Standard', value: 'large', badge: '480p' },
  { label: '360p Retro Classic', value: 'medium', badge: '360p' },
  { label: '240p Low Bandwidth', value: 'small', badge: '240p' },
];
