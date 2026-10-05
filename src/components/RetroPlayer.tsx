import React, { useState, useEffect, useRef } from 'react';
import { MediaSkin, Video, VideoQuality, CustomAdSettings, Annotation } from '../types';
import { loadYouTubeIFrameAPI, SPEED_OPTIONS, QUALITY_OPTIONS } from '../utils/youtube';
import { playRetroAdJingle, AD_PRESETS } from '../utils/adCommercial';
import { getEffectiveVideoAd } from '../utils/adResolver';

interface RetroPlayerProps {
  video: Video;
  skin: MediaSkin;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  onVideoEnd?: () => void;
  defaultSpeed?: number;
  defaultQuality?: VideoQuality;
  customAd?: CustomAdSettings;
  onToggleCustomAd?: (enabled: boolean) => void;
  onOpenAdSettings?: () => void;
  annotations?: Annotation[];
  annotationsEnabled?: boolean;
  onToggleAnnotations?: (enabled: boolean) => void;
  onOpenAnnotationsEditor?: () => void;
  onNavigate?: (route: string, params?: Record<string, any>) => void;
  waybackPlaybackEngine?: 'high_performance' | 'wayback_embed' | 'youtube';
  onEngineChange?: (engine: 'high_performance' | 'wayback_embed' | 'youtube') => void;
}

export const RetroPlayer: React.FC<RetroPlayerProps> = ({
  video,
  skin,
  isTheaterMode,
  onToggleTheaterMode,
  onVideoEnd,
  defaultSpeed = 1.0,
  defaultQuality = 'hd1080',
  customAd,
  onToggleCustomAd,
  onOpenAdSettings,
  annotations,
  annotationsEnabled = true,
  onToggleAnnotations,
  onOpenAnnotationsEditor,
  onNavigate,
  waybackPlaybackEngine,
  onEngineChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(defaultSpeed);
  const [quality, setQuality] = useState<VideoQuality>(defaultQuality);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isTurboActive, setIsTurboActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanlinesEnabled, setIsScanlinesEnabled] = useState(true);
  const [eqLevels, setEqLevels] = useState<number[]>([45, 65, 80, 50, 90, 75, 60, 45, 85, 95, 70, 55]);

  // High-performance direct stream or Wayback Machine resolution
  const directStreamSource = video.streamUrl || video.waybackHighPerformanceUrl || video.videoBase64;
  const hasWayback = Boolean(video.waybackUrl || video.waybackHighPerformanceUrl || video.waybackEmbedUrl);

  const archiveEmbedUrl =
    video.waybackEmbedUrl ||
    (video.waybackUrl && video.waybackUrl.includes('archive.org/embed')
      ? video.waybackUrl
      : video.waybackUrl && video.waybackUrl.includes('archive.org/details')
      ? video.waybackUrl.replace('/details/', '/embed/')
      : video.waybackUrl && video.waybackUrl.includes('web.archive.org/web/') && !video.waybackUrl.includes('if_')
      ? video.waybackUrl.replace(/\/web\/(\d{4,14})([a-z_]{0,4})\//, '/web/$1if_/')
      : video.waybackUrl || '');

  // Determine initial playback engine
  const initialEngine: 'high_performance' | 'wayback_embed' | 'youtube' =
    waybackPlaybackEngine ||
    video.waybackPlaybackEngine ||
    (video.preferWaybackEmbed ? 'wayback_embed' : undefined) ||
    (video.youtubeId ? 'youtube' : undefined) ||
    (directStreamSource ? 'high_performance' : undefined) ||
    (hasWayback ? 'wayback_embed' : 'high_performance');

  const [activeEngine, setActiveEngine] = useState<'high_performance' | 'wayback_embed' | 'youtube'>(initialEngine);
  const [embedIframeKey, setEmbedIframeKey] = useState(0);
  const [engineNotification, setEngineNotification] = useState<string | null>(null);

  // Sync with prop when prop changes
  useEffect(() => {
    if (waybackPlaybackEngine && waybackPlaybackEngine !== activeEngine) {
      setActiveEngine(waybackPlaybackEngine);
    }
  }, [waybackPlaybackEngine]);

  const handleSelectEngine = (engine: 'high_performance' | 'wayback_embed' | 'youtube') => {
    setActiveEngine(engine);
    if (onEngineChange) onEngineChange(engine);
    const label =
      engine === 'high_performance'
        ? '⚡ High-Performance Direct Stream (60fps)'
        : engine === 'wayback_embed'
        ? '🏛️ Wayback Machine Clean Embed'
        : '▶️ Modern YouTube Player';
    setEngineNotification(label);
    setTimeout(() => setEngineNotification(null), 3000);
  };

  // Dismissed annotations session set
  const [dismissedAnnotationIds, setDismissedAnnotationIds] = useState<Set<string>>(new Set());

  // Reset dismissed annotations when video changes
  useEffect(() => {
    setDismissedAnnotationIds(new Set());
  }, [video.id]);

  // Determine effective ad for this specific video
  const effectiveAd = getEffectiveVideoAd(video, customAd);

  // Custom Ad Break Playback States
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adCurrentTime, setAdCurrentTime] = useState(0);
  const [adDuration, setAdDuration] = useState(15);
  const [adSkipCountdown, setAdSkipCountdown] = useState(effectiveAd?.skipCountdownSeconds ?? 5);
  const [activeAdTimestamp, setActiveAdTimestamp] = useState<number | null>(null);
  const playedAdTimestampsRef = useRef<Set<number>>(new Set());
  const adVideoRef = useRef<HTMLVideoElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const progressBgRef = useRef<HTMLDivElement | null>(null);

  // Animated Winamp visualizer spectrum
  useEffect(() => {
    if (!isPlaying || skin !== 'winamp_classic') return;
    const eqTimer = setInterval(() => {
      setEqLevels((prev) => prev.map(() => Math.floor(Math.random() * 80) + 20));
    }, 150);
    return () => clearInterval(eqTimer);
  }, [isPlaying, skin]);

  // Initialize YouTube IFrame API or HTML5 video
  useEffect(() => {
    setIsLoading(true);
    setCurrentTime(0);

    if (video.youtubeId && activeEngine === 'youtube') {
      let isMounted = true;
      loadYouTubeIFrameAPI().then(() => {
        if (!isMounted || !ytContainerRef.current) return;

        // Destroy previous player instance if any
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {
            // Safe cleanup
          }
        }

        const playerId = `yt-player-${video.id}-${Date.now()}`;
        ytContainerRef.current.innerHTML = `<div id="${playerId}" style="width: 100%; height: 100%;"></div>`;

        const YT = (window as unknown as { YT: any }).YT;
        if (YT && YT.Player) {
          try {
            ytPlayerRef.current = new YT.Player(playerId, {
              videoId: video.youtubeId,
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                enablejsapi: 1,
                playsinline: 1,
                iv_load_policy: 3,
                fs: 1,
                origin: window.location.origin,
              },
              events: {
                onReady: (event: any) => {
                  setIsLoading(false);
                  // Apply high resolution streaming
                  const targetQ = quality === 'auto' ? 'hd1080' : quality;
                  try {
                    event.target.setPlaybackQuality(targetQ);
                    event.target.setPlaybackRate(playbackSpeed);
                  } catch (e) {
                    // Safe set
                  }
                  if (event.target.getDuration) {
                    setDuration(event.target.getDuration());
                  }
                },
                onError: (event: any) => {
                  console.warn('YouTube embed error encountered, falling back to Wayback Machine stream:', event);
                  if (directStreamSource) {
                    handleSelectEngine('high_performance');
                  } else if (hasWayback) {
                    handleSelectEngine('wayback_embed');
                  }
                },
                onStateChange: (event: any) => {
                  // 1 = playing, 2 = paused, 0 = ended, 3 = buffering
                  if (event.data === 1) {
                    setIsPlaying(true);
                    setIsLoading(false);
                  } else if (event.data === 2) {
                    setIsPlaying(false);
                  } else if (event.data === 0) {
                    setIsPlaying(false);
                    if (onVideoEnd) onVideoEnd();
                  } else if (event.data === 3) {
                    setIsLoading(true);
                  }
                },
                onPlaybackQualityChange: (event: any) => {
                  if (event.data) {
                    setQuality(event.data);
                  }
                },
                onPlaybackRateChange: (event: any) => {
                  if (event.data) {
                    setPlaybackSpeed(event.data);
                  }
                },
              },
            });
          } catch (err) {
            console.warn('YouTube IFrame API fallback activated', err);
            setIsLoading(false);
            if (directStreamSource) handleSelectEngine('high_performance');
          }
        }
      });

      return () => {
        isMounted = false;
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {
            // Ignored
          }
        }
      };
    } else {
      setIsLoading(false);
    }
  }, [video.id, video.youtubeId, activeEngine]);

  // Periodic poll for YouTube progress if active
  useEffect(() => {
    if (!video.youtubeId) return;
    const interval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const curr = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (curr !== undefined) setCurrentTime(curr);
          if (dur !== undefined && dur > 0) setDuration(dur);
        } catch (e) {
          // Poll catch
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [video.youtubeId]);

  // Apply speed changes
  const applyPlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setIsTurboActive(speed >= 2.0);

    // Apply to YouTube
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      try {
        ytPlayerRef.current.setPlaybackRate(speed);
      } catch (e) {
        // Safe catch
      }
    }

    // Apply to HTML5 video
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Toggle 2x Turbo Speed Boost
  const toggleTurboSpeed = () => {
    if (playbackSpeed === 2.0) {
      applyPlaybackSpeed(1.0);
    } else {
      applyPlaybackSpeed(2.0);
    }
  };

  // Apply resolution/quality changes
  const applyQuality = (newQuality: VideoQuality) => {
    setQuality(newQuality);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackQuality === 'function') {
      try {
        ytPlayerRef.current.setPlaybackQuality(newQuality === 'auto' ? 'hd1080' : newQuality);
      } catch (e) {
        // Safe catch
      }
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (video.youtubeId && ytPlayerRef.current) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo();
        } else {
          ytPlayerRef.current.playVideo();
        }
      } catch (e) {
        // Safe catch
      }
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Stop video
  const handleStop = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (video.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Jump skip
  const handleSkip = (seconds: number) => {
    const target = Math.max(0, Math.min(currentTime + seconds, duration || 0));
    setCurrentTime(target);
    if (video.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(target, true);
      } catch (e) {}
    } else if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  // Volume control
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(Math.round(newVol * 100));
        if (newVol === 0) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      } catch (e) {}
    }
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(volume > 0 ? volume : 0.8);
    } else {
      setIsMuted(true);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') {
        try {
          ytPlayerRef.current.mute();
        } catch (e) {}
      }
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  };

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBgRef.current || duration <= 0) return;
    const rect = progressBgRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetSec = Math.max(0, Math.min(pos * duration, duration));

    setCurrentTime(targetSec);

    if (video.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(targetSec, true);
      } catch (err) {
        // Safe
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
    }
  };

  // Expose global seek for timestamps
  useEffect(() => {
    (window as any).jumpToTime = (seconds: number) => {
      setCurrentTime(seconds);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          ytPlayerRef.current.seekTo(seconds, true);
          ytPlayerRef.current.playVideo();
        } catch (e) {}
      } else if (videoRef.current) {
        videoRef.current.currentTime = seconds;
        videoRef.current.play().catch(() => {});
      }
    };
    return () => {
      delete (window as any).jumpToTime;
    };
  }, []);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Trigger custom ad break
  const triggerAdBreak = (ts: number = 0) => {
    if (!effectiveAd?.enabled) return;
    // Pause main playback
    if (video.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setActiveAdTimestamp(ts);
    playedAdTimestampsRef.current.add(ts);
    setAdCurrentTime(0);
    const estDuration = effectiveAd.activePreset && AD_PRESETS[effectiveAd.activePreset]
      ? AD_PRESETS[effectiveAd.activePreset].estimatedDuration
      : 15;
    setAdDuration(estDuration);
    setAdSkipCountdown(effectiveAd.skipCountdownSeconds ?? 5);
    setIsAdPlaying(true);
    playRetroAdJingle(effectiveAd.activePreset || 'cybersoda');
  };

  // Skip or conclude ad break
  const handleSkipAd = () => {
    setIsAdPlaying(false);
    // Resume video
    if (video.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {}
    } else if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Ad playback timer & countdown
  useEffect(() => {
    if (!isAdPlaying) return;
    const timer = setInterval(() => {
      setAdSkipCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setAdCurrentTime((prev) => {
        const next = prev + 1;
        if (next >= adDuration) {
          handleSkipAd();
          return adDuration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAdPlaying, adDuration]);

  // Watch video playback time against configured ad timestamps for this specific video
  useEffect(() => {
    if (!effectiveAd?.enabled || !effectiveAd.timestamps?.length || isAdPlaying) return;

    // Allow re-trigger if user scrubbed backwards before cue
    effectiveAd.timestamps.forEach((ts) => {
      if (currentTime < ts - 2 && playedAdTimestampsRef.current.has(ts)) {
        playedAdTimestampsRef.current.delete(ts);
      }
    });

    // Check if current time crossed an unplayed timestamp
    for (const ts of effectiveAd.timestamps) {
      if (
        currentTime >= ts &&
        currentTime < ts + 1.2 &&
        !playedAdTimestampsRef.current.has(ts)
      ) {
        triggerAdBreak(ts);
        break;
      }
    }
  }, [currentTime, effectiveAd, isAdPlaying]);

  // Expose global ad trigger for testing
  useEffect(() => {
    (window as any).triggerAdBreak = (ts?: number) => {
      triggerAdBreak(ts ?? (effectiveAd?.timestamps?.[0] || 12));
    };
    return () => {
      delete (window as any).triggerAdBreak;
    };
  }, [effectiveAd]);

  // Handle Classic Annotation Clicks
  const handleAnnotationClick = (a: Annotation) => {
    if (!a.linkType || a.linkType === 'none' || !a.linkTarget) return;

    if (a.linkType === 'timestamp') {
      let targetSec = parseFloat(a.linkTarget);
      if (a.linkTarget.includes(':')) {
        const parts = a.linkTarget.split(':').map((p) => parseInt(p, 10));
        if (parts.length === 2) targetSec = parts[0] * 60 + parts[1];
      }
      if (!isNaN(targetSec)) {
        if (typeof (window as any).jumpToTime === 'function') {
          (window as any).jumpToTime(targetSec);
        } else {
          handleSkip(targetSec - currentTime);
        }
      }
    } else if (a.linkType === 'video' && onNavigate) {
      onNavigate('watch', { id: a.linkTarget });
    } else if (a.linkType === 'channel' && onNavigate) {
      onNavigate('channel', { id: a.linkTarget });
    } else if (a.linkType === 'external') {
      window.open(a.linkTarget, '_blank', 'noopener,noreferrer');
    }
  };

  // Render Iconic YouTube Yellow Lines on Timeline
  const renderYellowAdMarkers = () => {
    if (!effectiveAd?.enabled || duration <= 0 || !effectiveAd.timestamps?.length) return null;
    return (
      <>
        {effectiveAd.timestamps.map((ts) => {
          if (ts <= 0 || ts > duration) return null;
          const pct = (ts / duration) * 100;
          return (
            <div
              key={`ad-marker-${ts}`}
              className="absolute top-0 bottom-0 w-1.5 bg-[#fbc02d] hover:bg-[#ffeb3b] z-20 shadow-[0_0_6px_rgba(251,192,45,1)] cursor-pointer rounded-xs pointer-events-auto"
              style={{ left: `calc(${pct}% - 3px)` }}
              title={`🟡 Iconic YouTube Ad Break at ${formatTime(ts)} (Click to preview ad)`}
              onClick={(e) => {
                e.stopPropagation();
                triggerAdBreak(ts);
              }}
            />
          );
        })}
      </>
    );
  };

  // Progress percentage
  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const el = document.getElementById('retro-player-container');
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  };

  const isHD = quality === 'hd1080' || quality === 'hd720' || quality === 'highres' || quality === 'auto';

  const controlsHeight =
    skin === 'crt_tv_retro'
      ? 46
      : skin === 'winamp_classic'
      ? 44
      : skin === 'realplayer_g2'
      ? 42
      : 38;

  return (
    <div
      id="retro-player-container"
      className={`relative bg-black transition-all duration-300 shadow-2xl overflow-hidden mb-3.5 select-none ${
        skin === 'crt_tv_retro'
          ? 'rounded-2xl border-8 border-[#26211c] shadow-[0_0_25px_rgba(0,0,0,0.9)] ring-2 ring-[#4a3f35]'
          : 'rounded border border-[#111]'
      } ${
        isTheaterMode ? 'w-full max-w-[980px] h-[480px]' : 'w-full max-w-[640px] h-[385px]'
      }`}
    >
      {/* Video Content Canvas */}
      <div
        className="w-full relative bg-black flex items-center justify-center overflow-hidden"
        style={{ height: `calc(100% - ${controlsHeight}px)` }}
      >
        {activeEngine === 'youtube' && video.youtubeId ? (
          <div ref={ytContainerRef} className="w-full h-full bg-black">
            {/* Fallback iframe before API mounts */}
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.origin : ''
              )}`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : activeEngine === 'wayback_embed' || (!video.youtubeId && !directStreamSource && video.waybackUrl) ? (
          <div className="w-full h-full bg-black relative flex flex-col">
            {/* Top Wayback Machine Preserved Snapshot Ribbon */}
            <div className="bg-[#181818] border-b border-gray-700 px-2.5 py-1 flex items-center justify-between text-[11px] text-gray-200 z-10 select-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-400 font-bold">🏛️ Wayback Machine Preserved Player</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.2 rounded font-mono font-bold">
                  {video.waybackSnapshotDate || 'Historical Snapshot'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {directStreamSource && (
                  <button
                    type="button"
                    onClick={() => handleSelectEngine('high_performance')}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    title="Switch to 60fps direct hardware byte stream with retro skins"
                  >
                    ⚡ Switch to 60fps Direct Stream
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEmbedIframeKey((k) => k + 1)}
                  className="text-[10px] text-gray-300 hover:text-white px-1.5 py-0.2 rounded bg-gray-800 border border-gray-600 cursor-pointer"
                  title="Reload embedded iframe"
                >
                  🔄 Reload
                </button>
              </div>
            </div>

            {/* Embedded Responsive IFrame */}
            <div className="flex-1 w-full h-full relative min-h-[280px]">
              <iframe
                key={embedIframeKey}
                src={archiveEmbedUrl}
                title={video.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        ) : directStreamSource ? (
          <video
            ref={videoRef}
            src={directStreamSource}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || 0);
                setIsLoading(false);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                setDuration(videoRef.current.duration || 0);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (onVideoEnd) onVideoEnd();
            }}
            autoPlay
          />
        ) : (
          <div className="text-center p-6 text-gray-400">
            <div className="text-4xl mb-2">📺</div>
            <p className="font-bold text-sm text-gray-200">[ Simulated Video Canvas ]</p>
            <p className="text-xs text-gray-500 mt-1">Ready for high-resolution video file, YouTube, or Wayback Machine stream</p>
          </div>
        )}

        {/* Wayback Machine Archive Preserved Badge on Player Screen */}
        {video.waybackUrl && (
          <div className="absolute top-2.5 left-3.5 z-30 flex items-center gap-1.5 flex-wrap pointer-events-auto">
            <a
              href={video.waybackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/85 hover:bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/70 shadow-md backdrop-blur-xs flex items-center gap-1 transition-all"
              title="Preserved on Internet Archive Wayback Machine. Click to view historical capture!"
            >
              <span>🏛️</span>
              <span className="text-amber-300">Wayback Machine</span>
              {video.waybackSnapshotDate && (
                <span className="text-gray-300 hidden sm:inline">• {video.waybackSnapshotDate}</span>
              )}
              <span className="text-[9px] text-amber-400 font-mono">↗</span>
            </a>

            {video.waybackHighPerformanceUrl && (
              <span className="bg-emerald-950/90 text-emerald-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/60 shadow-xs flex items-center gap-1">
                <span>⚡</span>
                <span>Direct Raw Stream (60fps)</span>
              </span>
            )}
          </div>
        )}

        {/* Nostalgic Watermarks on top-right */}
        {(skin === 'classic_flash' || skin === 'youtube_2008') && (
          <div className="absolute top-2.5 right-3.5 bg-black/75 text-white font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded border border-white/20 pointer-events-none shadow-md z-30">
            You<span className="bg-[#cc181e] text-white px-1 ml-0.5 rounded-xs">Tube</span>
          </div>
        )}

        {/* CRT Scanline Overlay Effect */}
        {skin === 'crt_tv_retro' && isScanlinesEnabled && (
          <div
            className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-75"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}

        {/* CRT Phosphor Green OSD */}
        {skin === 'crt_tv_retro' && (
          <div className="absolute top-3 left-4 z-30 font-mono text-emerald-400 text-xs font-black tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] uppercase select-none pointer-events-none">
            <div>{isPlaying ? 'PLAY ▶' : 'PAUSE ❚❚'} SP {formatTime(currentTime)}</div>
            <div className="text-[10px] text-emerald-500/80">CH 03 • STEREO • NTSC</div>
          </div>
        )}

        {/* Speed Turbo HUD notification badge */}
        {playbackSpeed !== 1.0 && (
          <div className="absolute top-2.5 left-3.5 bg-red-600/90 text-white text-xs font-black px-2 py-1 rounded shadow-lg flex items-center gap-1 backdrop-blur-xs animate-pulse z-30">
            <span>⚡ {playbackSpeed}x Speed</span>
          </div>
        )}

        {/* High Resolution Stream Active Badge */}
        {video.youtubeId && isHD && (
          <div className="absolute top-2.5 right-3.5 bg-red-700/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow border border-red-400 tracking-wider">
            HD 1080p
          </div>
        )}

        {/* Classic YouTube Annotations Overlay */}
        {!isAdPlaying && annotationsEnabled && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {(annotations || video.annotations || [])
              .filter((a) => {
                if (dismissedAnnotationIds.has(a.id)) return false;
                return currentTime >= a.startTime && currentTime <= a.endTime;
              })
              .map((ann) => {
                const isClickable = !!(ann.linkType && ann.linkType !== 'none' && ann.linkTarget);

                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnnotationClick(ann);
                    }}
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      width: `${ann.width}%`,
                      minHeight: ann.height ? `${ann.height}%` : undefined,
                      backgroundColor:
                        ann.bgColor ||
                        (ann.type === 'note'
                          ? '#ffff88'
                          : ann.type === 'title'
                          ? 'rgba(0,0,0,0.75)'
                          : ann.type === 'speech_bubble'
                          ? '#ffffff'
                          : ann.type === 'spotlight'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.8)'),
                      color:
                        ann.textColor ||
                        (ann.type === 'title' || ann.type === 'spotlight' || ann.type === 'label'
                          ? '#ffffff'
                          : '#000000'),
                      fontSize: ann.fontSize ? `${ann.fontSize}px` : undefined,
                    }}
                    className={`absolute p-2 rounded shadow-md pointer-events-auto group transition-all select-none ${
                      isClickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                    } ${
                      ann.type === 'speech_bubble'
                        ? 'border border-gray-400 font-sans'
                        : ann.type === 'note'
                        ? 'border border-black/40 font-sans shadow-lg'
                        : ann.type === 'title'
                        ? 'border-y border-white/20 font-black tracking-wide text-center uppercase shadow-2xl'
                        : ann.type === 'spotlight'
                        ? 'border-2 border-white/80 hover:border-amber-400 bg-white/10 hover:bg-white/20'
                        : 'border border-black/40 font-mono'
                    }`}
                  >
                    {/* Speech bubble tail pointer */}
                    {ann.type === 'speech_bubble' && (
                      <div
                        className="absolute -bottom-2 left-4 w-0 h-0 border-x-6 border-x-transparent border-t-8"
                        style={{
                          borderTopColor: ann.bgColor || '#ffffff',
                          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                        }}
                      />
                    )}

                    {/* Close 'X' Button on Annotation */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDismissedAnnotationIds((prev) => new Set([...prev, ann.id]));
                      }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black/80 hover:bg-red-600 text-white font-black text-[9px] flex items-center justify-center cursor-pointer shadow-md opacity-75 group-hover:opacity-100 transition-opacity"
                      title="Close annotation"
                    >
                      ×
                    </button>

                    {/* Text Content */}
                    <div className="leading-snug break-words">{ann.text}</div>

                    {/* Link indicator */}
                    {isClickable && (
                      <div className="mt-1 text-[9px] font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                        <span>🔗</span>
                        <span>
                          {ann.linkType === 'timestamp'
                            ? `Jump to ${ann.linkTarget}s`
                            : ann.linkType === 'video'
                            ? 'Watch Video'
                            : ann.linkType === 'channel'
                            ? 'Visit Channel'
                            : 'Open Link'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Quick Custom Ad & Annotations Status Indicator on Player */}
        <div
          className={`absolute ${
            playbackSpeed !== 1.0 ? 'top-8' : 'top-2.5'
          } left-3.5 z-30 flex items-center gap-1.5 flex-wrap`}
        >
          {/* Ad Status Button */}
          <button
            type="button"
            onClick={() => onToggleCustomAd && onToggleCustomAd(!effectiveAd?.enabled)}
            className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all cursor-pointer shadow-md flex items-center gap-1 ${
              effectiveAd?.enabled
                ? 'bg-[#fbc02d] text-black border-[#f57f17] shadow-[0_0_8px_rgba(251,192,45,0.8)] ring-1 ring-amber-300'
                : 'bg-black/70 text-gray-300 border-white/20 hover:text-white'
            }`}
            title={
              effectiveAd?.enabled
                ? `Custom Ads: ACTIVE (${
                    video.customAdConfig?.mode === 'custom' ? 'Specific Video Ad' : 'Global Ad'
                  } - Click to disable anytime)`
                : 'Custom Ads: DISABLED (Click to enable anytime)'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                effectiveAd?.enabled ? 'bg-black' : 'bg-gray-400'
              }`}
            />
            <span>🟡 AD: {effectiveAd?.enabled ? 'ON' : 'OFF'}</span>
            {video.customAdConfig?.mode === 'custom' && effectiveAd?.enabled && (
              <span className="bg-purple-900 text-white text-[8px] px-1 py-0.2 rounded font-black ml-0.5">
                VIDEO AD
              </span>
            )}
          </button>

          {onOpenAdSettings && (
            <button
              type="button"
              onClick={onOpenAdSettings}
              className="text-[9px] font-bold bg-black/70 hover:bg-black text-gray-300 hover:text-white px-1.5 py-0.5 rounded border border-white/20 cursor-pointer shadow-md"
              title="Configure custom MP4 ad, yellow line timestamps, and skip button"
            >
              ⚙️
            </button>
          )}

          {/* Annotations Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleAnnotations && onToggleAnnotations(!annotationsEnabled)}
            className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all cursor-pointer shadow-md flex items-center gap-1 ${
              annotationsEnabled
                ? 'bg-[#cc181e] text-white border-red-700 shadow-[0_0_8px_rgba(204,24,30,0.7)]'
                : 'bg-black/70 text-gray-400 border-white/20 hover:text-white'
            }`}
            title={
              annotationsEnabled
                ? 'Annotations: ACTIVE (Click to toggle off)'
                : 'Annotations: HIDDEN (Click to toggle on)'
            }
          >
            <span>💬</span>
            <span>ANNOTATIONS: {annotationsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {onOpenAnnotationsEditor && (
            <button
              type="button"
              onClick={onOpenAnnotationsEditor}
              className="text-[9px] font-bold bg-black/70 hover:bg-black text-gray-300 hover:text-white px-1.5 py-0.5 rounded border border-white/20 cursor-pointer shadow-md"
              title="Add or edit speech bubbles, notes, and spotlights on this video"
            >
              ✏️
            </button>
          )}
        </div>

        {/* Custom MP4 Video Ad & Nostalgic Commercial Break Overlay */}
        {isAdPlaying && effectiveAd?.enabled && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
            {/* Ad Video Content */}
            {effectiveAd.adVideoBase64 ? (
              <video
                ref={adVideoRef}
                src={effectiveAd.adVideoBase64}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
                onLoadedMetadata={() => {
                  if (adVideoRef.current && adVideoRef.current.duration) {
                    setAdDuration(adVideoRef.current.duration);
                  }
                }}
                onTimeUpdate={() => {
                  if (adVideoRef.current) {
                    setAdCurrentTime(adVideoRef.current.currentTime);
                  }
                }}
                onEnded={handleSkipAd}
              />
            ) : (
              /* Built-in Nostalgic Retro Commercial Broadcast Canvas */
              <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] text-white">
                {/* Animated Background Rays & Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-cyan-400 shadow-[0_0_10px_#f59e0b]" />

                {/* Retro Badge Slogan */}
                <div className="relative z-10 text-center max-w-md px-4">
                  <div className="inline-block bg-gradient-to-r from-amber-500 to-red-600 text-black font-black text-[10px] sm:text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-amber-300">
                    {effectiveAd.activePreset && AD_PRESETS[effectiveAd.activePreset]?.badge
                      ? AD_PRESETS[effectiveAd.activePreset].badge
                      : '★ OFFICIAL RETRO COMMERCIAL SPOT ★'}
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,192,45,0.9)] tracking-tight leading-tight mb-1">
                    {effectiveAd.title || 'CyberSoda 2000™ - Extreme Citrus Fuel!'}
                  </h2>

                  <p className="text-xs font-extrabold text-cyan-300 mb-2.5 tracking-wide">
                    {effectiveAd.activePreset && AD_PRESETS[effectiveAd.activePreset]?.tagline
                      ? AD_PRESETS[effectiveAd.activePreset].tagline
                      : 'FEEL THE 2000s NEON VOLTAGE RUSH!'}
                  </p>

                  <div className="bg-black/60 border border-white/20 rounded p-2 text-[10px] sm:text-[11px] text-gray-200 text-left space-y-1 mb-2 backdrop-blur-xs">
                    {effectiveAd.activePreset && AD_PRESETS[effectiveAd.activePreset]?.bulletPoints
                      ? AD_PRESETS[effectiveAd.activePreset].bulletPoints.map((bp, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            <span>{bp}</span>
                          </div>
                        ))
                      : (
                        <>
                          <div>⚡ 400% Extreme Natural Guarana & Citrus Fizz</div>
                          <div>🎮 Tested & Approved by 2000s Gaming Champions</div>
                          <div>💿 Free Retro Game Demo Under Every Bottle Cap!</div>
                        </>
                      )}
                  </div>

                  <div className="text-[10px] text-amber-200 font-bold tracking-wider uppercase">
                    {effectiveAd.activePreset && AD_PRESETS[effectiveAd.activePreset]?.cta
                      ? AD_PRESETS[effectiveAd.activePreset].cta
                      : 'In stores & electronics retailers everywhere!'}
                  </div>
                </div>
              </div>
            )}

            {/* Top Header Bar Overlay: Ad Info & Settings */}
            <div className="absolute top-0 inset-x-0 p-2.5 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="bg-[#fbc02d] text-black font-black text-[10px] px-2 py-0.5 rounded-xs shadow-md tracking-wider">
                  🟡 AD 1 of 1
                </span>
                <span className="text-white text-xs font-bold drop-shadow-md truncate max-w-[200px] sm:max-w-xs">
                  Video will resume after ad ({Math.max(0, Math.ceil(adDuration - adCurrentTime))}s)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenAdSettings && (
                  <button
                    type="button"
                    onClick={onOpenAdSettings}
                    className="text-[10px] font-bold text-gray-300 hover:text-white bg-black/60 hover:bg-black/80 px-2 py-1 rounded border border-white/20 cursor-pointer shadow-xs"
                    title="Configure Ad MP4 file and timestamps"
                  >
                    ⚙️ Ad Settings
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Yellow Ad Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/70 z-30">
              <div
                className="h-full bg-[#fbc02d] shadow-[0_0_8px_#fbc02d] transition-[width] duration-300"
                style={{ width: `${Math.min(100, (adCurrentTime / Math.max(1, adDuration)) * 100)}%` }}
              />
            </div>

            {/* Bottom Left: Sponsor Callout */}
            <div className="absolute bottom-3 left-3 z-30">
              <a
                href={effectiveAd.sponsorUrl || 'https://archive.org'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-black/80 hover:bg-black text-white hover:text-amber-300 border border-white/30 hover:border-amber-400 px-2.5 py-1.5 rounded-xs text-[11px] font-bold shadow-lg transition-colors cursor-pointer"
                title="Visit Sponsor"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {effectiveAd.sponsorName || 'Visit Sponsor'}
                </span>
                <span className="text-amber-400 text-xs">↗</span>
              </a>
            </div>

            {/* Bottom Right: THE ICONIC YOUTUBE SKIP BUTTON */}
            <div className="absolute bottom-3 right-0 z-30">
              {adSkipCountdown > 0 ? (
                <div className="bg-black/85 text-white text-xs font-bold px-3.5 py-2 border-2 border-r-0 border-white/25 rounded-l-xs shadow-2xl backdrop-blur-xs flex items-center gap-2 select-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    You can skip ad in <span className="font-mono text-amber-300 font-extrabold text-sm">{adSkipCountdown}s</span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipAd}
                  className="bg-gradient-to-r from-[#222] via-[#1a1a1a] to-[#111] hover:from-[#333] hover:to-[#222] active:scale-95 text-white hover:text-amber-300 font-black text-xs px-4 py-2 border-2 border-r-0 border-[#fbc02d] rounded-l-xs shadow-[0_0_16px_rgba(251,192,45,0.7)] cursor-pointer transition-all flex items-center gap-2 group select-none hover:scale-102"
                >
                  <span>Skip Ad</span>
                  <span className="text-[#fbc02d] text-base group-hover:translate-x-1 transition-transform">⏭</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Retro Skin Controls Bar (Skin 1: Windows Media Player 11) */}
      {skin === 'wmp11' && (
        <div className="absolute bottom-0 inset-x-0 h-[38px] bg-gradient-to-b from-[#222222]/95 via-[#151515]/95 to-[#0a0a0a] border-t border-white/15 px-3 flex items-center gap-2.5 z-40 text-white shadow-inner">
          {/* Blue Radial Center Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-radial from-[#3b82f6] via-[#1d4ed8] to-[#1e3a8a] border border-[#93c5fd] shadow-[0_0_8px_rgba(59,130,246,0.8)] flex items-center justify-center text-white text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Time Counter */}
          <span className="text-[10px] font-mono text-[#93c5fd] font-bold min-w-[75px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Neon Blue Seek Progress Bar */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-2 bg-[#2d3748] rounded-full relative cursor-pointer group shadow-inner overflow-hidden"
            title="Click to seek"
          >
            <div
              className="h-full bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full relative transition-[width] duration-75"
              style={{ width: `${progressPct}%` }}
            />
            {renderYellowAdMarkers()}
          </div>

          {/* Quick 2x Turbo Speed Toggle */}
          <button
            type="button"
            onClick={toggleTurboSpeed}
            className={`text-[10px] font-black px-2 py-0.5 rounded transition-all cursor-pointer ${
              playbackSpeed === 2.0
                ? 'bg-amber-500 text-black shadow-[0_0_8px_#f59e0b]'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            title="Toggle instant 2x turbo playback speed"
          >
            2x ⚡
          </button>

          {/* Speed Selector Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowQualityMenu(false);
              }}
              className="text-[10px] font-bold bg-[#1e293b] hover:bg-[#334155] border border-blue-400/40 text-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
              title="Playback speed menu"
            >
              <span>{playbackSpeed}x</span>
              <span className="text-[8px]">▼</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-9 right-0 bg-[#0f172a] border border-blue-500/40 rounded shadow-xl py-1 w-36 z-50 text-[11px] backdrop-blur-md">
                <div className="px-2 py-1 text-[9px] font-bold text-blue-400 uppercase tracking-wider border-b border-gray-700">
                  Playback Speed
                </div>
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      applyPlaybackSpeed(opt.value);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 flex items-center justify-between hover:bg-blue-950/60 cursor-pointer ${
                      playbackSpeed === opt.value ? 'text-cyan-400 font-bold bg-blue-900/40' : 'text-gray-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {playbackSpeed === opt.value && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quality / Resolution Selector */}
          {video.youtubeId && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-0.5 cursor-pointer ${
                  isHD
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_6px_rgba(220,38,38,0.8)]'
                    : 'bg-[#1e293b] border-gray-600 text-gray-300'
                }`}
                title="Resolution quality selector"
              >
                <span>{quality.toUpperCase().replace('HD', '') || 'HD'}</span>
                <span className="text-[8px]">▼</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-9 right-0 bg-[#0f172a] border border-red-500/40 rounded shadow-xl py-1 w-44 z-50 text-[11px] backdrop-blur-md">
                  <div className="px-2 py-1 text-[9px] font-bold text-red-400 uppercase tracking-wider border-b border-gray-700">
                    Streaming Quality
                  </div>
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => {
                        applyQuality(q.value as VideoQuality);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1 flex items-center justify-between hover:bg-red-950/60 cursor-pointer ${
                        quality === q.value ? 'text-red-400 font-bold bg-red-900/40' : 'text-gray-300'
                      }`}
                    >
                      <span>{q.label}</span>
                      {quality === q.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theater Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheaterMode}
            className={`text-xs px-1 hover:text-blue-300 cursor-pointer ${
              isTheaterMode ? 'text-cyan-400 font-black' : 'text-gray-400'
            }`}
            title="Toggle Theater Mode (Wide Layout)"
          >
            ▱
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs text-gray-300 hover:text-white px-1 cursor-pointer font-bold"
            title="Full Screen"
          >
            ⛶
          </button>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 2: Classic 2006 Flash Player) */}
      {skin === 'classic_flash' && (
        <div className="absolute bottom-0 inset-x-0 h-[36px] bg-gradient-to-b from-[#f2f2f2] to-[#c7c7c7] border-t-2 border-white px-3 flex items-center gap-2.5 z-40 text-[#333] shadow-md select-none">
          {/* Beveled Play Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 bg-gradient-to-b from-white to-[#d6d6d6] border border-[#999] rounded text-[10px] font-bold flex items-center justify-center shadow-xs cursor-pointer hover:bg-white active:shadow-inner text-[#444]"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Time Display */}
          <span className="text-[11px] font-bold font-sans text-gray-700 min-w-[70px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Chunky Red Seek Bar */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-3 bg-[#d5d5d5] border border-[#888] rounded-xs relative cursor-pointer shadow-inner"
          >
            <div
              className="h-full bg-gradient-to-b from-[#e52d27] to-[#b31217] rounded-xs border-r border-[#7a0c10]"
              style={{ width: `${progressPct}%` }}
            />
            {renderYellowAdMarkers()}
          </div>

          {/* Quick Speed Button */}
          <button
            type="button"
            onClick={toggleTurboSpeed}
            className={`text-[10px] font-bold px-2 py-0.5 rounded border border-gray-400 shadow-xs cursor-pointer ${
              playbackSpeed === 2.0 ? 'bg-red-600 text-white font-black' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {playbackSpeed}x ⚡
          </button>

          {/* Resolution Badge */}
          {video.youtubeId && (
            <button
              type="button"
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isHD ? 'bg-red-600 text-white border-red-700 font-extrabold' : 'bg-gray-200 border-gray-400'
              }`}
            >
              HD
            </button>
          )}

          {showQualityMenu && (
            <div className="absolute bottom-9 right-8 bg-white border border-gray-400 shadow-xl py-1 w-40 z-50 text-[11px]">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => {
                    applyQuality(q.value as VideoQuality);
                    setShowQualityMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 hover:bg-red-100 text-gray-800 block font-medium"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Theater Toggle */}
          <button
            type="button"
            onClick={onToggleTheaterMode}
            className="text-xs px-1 text-gray-700 font-bold hover:text-red-700 cursor-pointer"
            title="Theater Mode"
          >
            ▱
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs text-gray-700 font-bold hover:text-black px-1 cursor-pointer"
          >
            ⛶
          </button>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 3: QuickTime Player) */}
      {skin === 'quicktime' && (
        <div className="absolute bottom-0 inset-x-0 h-[36px] bg-gradient-to-b from-[#e2e2e2] via-[#b5b5b5] to-[#999999] border-t border-[#f0f0f0] px-3 flex items-center gap-2.5 z-40 text-black shadow-md">
          {/* Metallic Square Play Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 bg-gradient-to-b from-white to-[#cccccc] border border-[#666] rounded-xs text-[10px] font-bold flex items-center justify-center shadow-xs cursor-pointer active:translate-y-px"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Silver Progress Bar */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-2 bg-[#666] rounded-xs border border-[#444] relative cursor-pointer shadow-inner"
          >
            <div className="h-full bg-[#3b82f6] rounded-xs" style={{ width: `${progressPct}%` }} />
            {renderYellowAdMarkers()}
          </div>

          <span className="text-[11px] font-bold text-gray-900 font-mono">
            {formatTime(currentTime)}
          </span>

          <button
            type="button"
            onClick={toggleTurboSpeed}
            className="text-[10px] font-bold bg-[#eee] border border-[#777] px-1.5 py-0.5 rounded cursor-pointer"
          >
            {playbackSpeed}x Speed
          </button>

          <button
            type="button"
            onClick={onToggleTheaterMode}
            className="text-xs font-bold text-gray-800 hover:text-blue-700 cursor-pointer"
          >
            ▱
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs font-bold text-gray-800 hover:text-black cursor-pointer"
          >
            ⛶
          </button>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 4: Old YouTube 2008-2010 Player) */}
      {skin === 'youtube_2008' && (
        <div className="absolute bottom-0 inset-x-0 h-[38px] bg-gradient-to-b from-[#2e2e2e] via-[#1c1c1c] to-[#111111] border-t border-white/20 px-2 sm:px-3 flex items-center gap-2 z-40 text-white select-none shadow-md font-sans">
          {/* Classic rectangular play/pause button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-7 h-6 bg-gradient-to-b from-[#3a3a3a] to-[#202020] hover:from-[#4a4a4a] hover:to-[#2b2b2b] active:from-[#151515] active:to-[#1a1a1a] border border-[#555] rounded-xs text-[11px] font-bold flex items-center justify-center cursor-pointer shadow-xs text-gray-200"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Classic Red Scrubber Progress Bar */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-2.5 bg-[#383838] hover:h-3 transition-all rounded-xs border border-[#484848] relative cursor-pointer group shadow-inner"
            title="Click to seek"
          >
            <div
              className="h-full bg-gradient-to-r from-[#e62117] to-[#cc181e] rounded-xs relative"
              style={{ width: `${progressPct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white border border-[#999] rounded-full shadow-md" />
            </div>
            {renderYellowAdMarkers()}
          </div>

          {/* Time Counter: 0:42 / 3:15 */}
          <span className="text-[11px] font-bold text-gray-300 min-w-[70px] text-center font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Speaker Volume button + slider */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMute}
              className="text-xs text-gray-300 hover:text-white cursor-pointer px-0.5"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-12 h-1.5 accent-[#cc181e] cursor-pointer hidden sm:inline-block"
              title="Volume"
            />
          </div>

          {/* Classic HQ / HD Badge Button */}
          {video.youtubeId && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                }}
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                  isHD
                    ? 'bg-[#cc181e] hover:bg-[#b01419] border-red-400 text-white shadow-xs'
                    : 'bg-[#333] hover:bg-[#444] border-gray-600 text-gray-300'
                }`}
                title="Change Video Quality"
              >
                {isHD ? 'HD' : 'HQ'}
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-9 right-0 bg-[#1c1c1c] border border-gray-600 rounded shadow-2xl py-1 w-36 z-50 text-[11px]">
                  <div className="px-2 py-0.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700">
                    Quality
                  </div>
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => {
                        applyQuality(q.value as VideoQuality);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 flex items-center justify-between hover:bg-[#333] cursor-pointer ${
                        quality === q.value ? 'text-red-400 font-bold bg-[#292929]' : 'text-gray-300'
                      }`}
                    >
                      <span>{q.label}</span>
                      {quality === q.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Speed Turbo */}
          <button
            type="button"
            onClick={toggleTurboSpeed}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border cursor-pointer ${
              playbackSpeed === 2.0
                ? 'bg-red-600 text-white border-red-500 font-black'
                : 'bg-[#292929] hover:bg-[#383838] text-gray-300 border-gray-700'
            }`}
            title="Toggle 2x Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Classic YouTube Annotations Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleAnnotations && onToggleAnnotations(!annotationsEnabled)}
            className={`text-xs px-1.5 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
              annotationsEnabled
                ? 'bg-[#cc181e] text-white border-red-500 font-black shadow-xs'
                : 'bg-[#292929] hover:bg-[#383838] text-gray-400 hover:text-white border-gray-700'
            }`}
            title={annotationsEnabled ? 'Turn Annotations OFF' : 'Turn Annotations ON (Classic YouTube Feature)'}
          >
            <span>💬</span>
            <span className="text-[10px] hidden sm:inline">Annotations</span>
          </button>

          {/* Theater mode */}
          <button
            type="button"
            onClick={onToggleTheaterMode}
            className={`text-xs px-1 hover:text-white cursor-pointer ${
              isTheaterMode ? 'text-red-500 font-bold' : 'text-gray-400'
            }`}
            title="Theater Mode"
          >
            ▱
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs text-gray-300 hover:text-white px-1 cursor-pointer font-bold"
            title="Full Screen"
          >
            ⛶
          </button>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 5: Winamp 2.x Classic Skin) */}
      {skin === 'winamp_classic' && (
        <div className="absolute bottom-0 inset-x-0 h-[44px] bg-[#222426] border-t-2 border-[#555a60] border-b border-black px-2 flex items-center justify-between gap-1.5 z-40 text-white select-none shadow-[0_-2px_10px_rgba(0,0,0,0.8)] font-mono">
          {/* Left: Classic Green LED Display with Time & Animated Spectrum Analyzer */}
          <div className="flex items-center gap-1.5 bg-black border border-[#444] rounded-xs px-1.5 py-0.5 shadow-inner">
            <div className="flex items-end gap-0.5 h-6 w-14 bg-[#0a0f0a] px-1 py-0.5 rounded-xs border border-[#1a331a]">
              {eqLevels.slice(0, 8).map((lvl, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-gradient-to-t from-[#00ff00] via-[#ffff00] to-[#ff0000] rounded-2xs transition-all duration-150"
                  style={{ height: isPlaying ? `${lvl}%` : '15%' }}
                />
              ))}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[#00ff00] font-black text-xs tracking-wider leading-none drop-shadow-[0_0_4px_#00ff00]">
                {formatTime(currentTime)}
              </span>
              <span className="text-[8px] text-[#00cc00] leading-tight font-bold">
                {isPlaying ? '128K STEREO' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Center: Winamp Transport Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSkip(-10)}
              className="w-5 h-5 bg-gradient-to-b from-[#4a4f55] to-[#25282c] hover:from-[#5a6067] hover:to-[#35393e] active:from-[#1b1d20] active:to-[#2d3135] border border-t-[#777d85] border-l-[#777d85] border-r-[#151719] border-b-[#151719] rounded-xs text-[9px] text-[#ccc] flex items-center justify-center cursor-pointer shadow-xs"
              title="Rewind 10s"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={`w-6 h-6 bg-gradient-to-b ${
                isPlaying ? 'from-[#00bb00] to-[#006600] text-black font-black' : 'from-[#4a4f55] to-[#25282c] text-[#00ff00]'
              } hover:brightness-110 active:brightness-90 border border-t-[#777d85] border-l-[#777d85] border-r-[#151719] border-b-[#151719] rounded-xs text-[10px] flex items-center justify-center cursor-pointer shadow-xs`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="w-5 h-5 bg-gradient-to-b from-[#4a4f55] to-[#25282c] hover:from-[#5a6067] hover:to-[#35393e] active:from-[#1b1d20] active:to-[#2d3135] border border-t-[#777d85] border-l-[#777d85] border-r-[#151719] border-b-[#151719] rounded-xs text-[9px] text-[#ccc] flex items-center justify-center cursor-pointer shadow-xs"
              title="Stop"
            >
              ■
            </button>
            <button
              type="button"
              onClick={() => handleSkip(10)}
              className="w-5 h-5 bg-gradient-to-b from-[#4a4f55] to-[#25282c] hover:from-[#5a6067] hover:to-[#35393e] active:from-[#1b1d20] active:to-[#2d3135] border border-t-[#777d85] border-l-[#777d85] border-r-[#151719] border-b-[#151719] rounded-xs text-[9px] text-[#ccc] flex items-center justify-center cursor-pointer shadow-xs"
              title="Fast Forward 10s"
            >
              ⏭
            </button>
          </div>

          {/* Seek Bar: Segmented Winamp Track Bar */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-3 bg-[#111] border border-[#444] rounded-xs relative cursor-pointer mx-1 shadow-inner overflow-hidden"
            title="Seek Position"
          >
            <div
              className="h-full bg-gradient-to-r from-[#00cc00] via-[#ffff00] to-[#ff3300] rounded-xs border-r border-white/60"
              style={{ width: `${progressPct}%` }}
            />
            {renderYellowAdMarkers()}
          </div>

          {/* Volume Meter Bar */}
          <div className="hidden sm:flex items-center gap-1 bg-black border border-[#444] px-1.5 py-0.5 rounded-xs">
            <span className="text-[9px] text-[#00ff00] font-bold">VOL</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-10 h-1.5 accent-[#00ff00] cursor-pointer"
              title="Winamp Volume"
            />
          </div>

          {/* Winamp Classic Title Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black italic tracking-widest text-[#00ff00] drop-shadow-[0_0_5px_#00ff00] hidden md:inline">
              WINAMP
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-[10px] text-gray-300 hover:text-white px-1 border border-[#444] rounded-xs bg-[#333] cursor-pointer"
              title="Full Screen"
            >
              ⛶
            </button>
          </div>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 6: VLC Media Player Classic 2000s) */}
      {skin === 'vlc_classic' && (
        <div className="absolute bottom-0 inset-x-0 h-[38px] bg-gradient-to-b from-[#ece9d8] via-[#e5dfce] to-[#d6cfb8] border-t-2 border-white px-2.5 flex items-center gap-2 z-40 text-black select-none shadow-md font-sans">
          {/* Iconic Traffic Cone */}
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" title="VLC media player">
            <span className="text-base leading-none">🚧</span>
          </div>

          {/* Windows Classic Bevel Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 bg-gradient-to-b from-[#ffffff] to-[#dcd8c8] hover:from-[#ffffff] hover:to-[#ebe7d8] active:from-[#c2bdb0] active:to-[#dcd8c8] border-t border-l border-t-white border-l-white border-r border-b border-r-[#7f7a6f] border-b-[#7f7a6f] rounded-xs text-[10px] font-bold flex items-center justify-center shadow-xs cursor-pointer text-gray-800"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Stop Button */}
          <button
            type="button"
            onClick={handleStop}
            className="w-5 h-5 bg-gradient-to-b from-[#ffffff] to-[#dcd8c8] hover:from-[#ffffff] hover:to-[#ebe7d8] active:from-[#c2bdb0] active:to-[#dcd8c8] border-t border-l border-t-white border-l-white border-r border-b border-r-[#7f7a6f] border-b-[#7f7a6f] rounded-xs text-[9px] font-bold flex items-center justify-center shadow-xs cursor-pointer text-gray-800"
            title="Stop"
          >
            ■
          </button>

          {/* Time Display */}
          <span className="text-[11px] font-bold text-gray-800 font-mono min-w-[65px]">
            {formatTime(currentTime)}
          </span>

          {/* Blue VLC Slider Track */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-2 bg-[#b8b3a5] rounded-xs border-t border-l border-t-[#777] border-l-[#777] border-r border-b border-r-white border-b-white relative cursor-pointer shadow-inner"
            title="Click to seek"
          >
            <div
              className="h-full bg-gradient-to-b from-[#4a90e2] to-[#2563eb] rounded-xs relative"
              style={{ width: `${progressPct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-3.5 bg-gradient-to-b from-white to-[#c0bcb0] border border-[#666] rounded-xs shadow-xs" />
            </div>
            {renderYellowAdMarkers()}
          </div>

          {/* Total Time */}
          <span className="text-[11px] font-bold text-gray-700 font-mono">
            {formatTime(duration)}
          </span>

          {/* Volume Slider */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMute}
              className="text-xs text-gray-700 hover:text-black cursor-pointer"
              title="Mute/Unmute"
            >
              {isMuted || volume === 0 ? '🔈' : '🔊'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-12 h-1.5 accent-blue-600 cursor-pointer hidden sm:inline-block"
              title="Volume"
            />
          </div>

          {/* Speed Multiplier Button */}
          <button
            type="button"
            onClick={toggleTurboSpeed}
            className="text-[10px] font-bold bg-[#eee9d8] border-t border-l border-t-white border-l-white border-r border-b border-r-[#888] border-b-[#888] px-1.5 py-0.5 rounded-xs text-gray-800 cursor-pointer hover:bg-white"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs text-gray-700 hover:text-black px-1 font-bold cursor-pointer"
            title="Full Screen"
          >
            ⛶
          </button>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 7: RealPlayer G2 / RealOne 2000s Classic) */}
      {skin === 'realplayer_g2' && (
        <div className="absolute bottom-0 inset-x-0 h-[42px] bg-gradient-to-b from-[#2a3848] via-[#1a2533] to-[#101721] border-t-2 border-[#4d6480] px-3 flex items-center justify-between gap-2 z-40 text-white select-none shadow-[0_-2px_12px_rgba(0,0,0,0.8)] font-sans">
          {/* Left: RealPlayer Blue Swirl Logo & Chrome Oval Play Button */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-[10px] font-black text-white shadow-xs border border-white/40">
              🌀
            </div>
            <button
              type="button"
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-gradient-to-b from-[#40566f] via-[#243344] to-[#151f2b] hover:from-[#4f6b8a] hover:to-[#2d3f54] active:scale-95 border-2 border-[#6082a6] shadow-[0_0_8px_rgba(56,189,248,0.5)] flex items-center justify-center text-cyan-300 text-xs font-black cursor-pointer transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
          </div>

          {/* Center: Glowing Turquoise LCD Clip Display */}
          <div className="flex-1 max-w-xs sm:max-w-sm bg-[#08121a] border border-[#1b3d54] rounded px-2 py-0.5 flex flex-col justify-center shadow-inner">
            <div className="flex items-center justify-between text-[9px] text-cyan-400 font-mono font-bold leading-tight">
              <span className="truncate max-w-[130px] sm:max-w-[170px]">RealAudio • {video.title}</span>
              <span>{isPlaying ? '512 Kbps' : 'PAUSED'}</span>
            </div>
            {/* Cyan Seek Progress Bar */}
            <div
              ref={progressBgRef}
              onClick={handleSeek}
              className="w-full h-1.5 bg-[#0e2333] rounded-xs relative cursor-pointer mt-1 group"
              title="Seek clip"
            >
              <div
                className="h-full bg-gradient-to-r from-[#06b6d4] to-[#38bdf8] rounded-xs shadow-[0_0_6px_#38bdf8]"
                style={{ width: `${progressPct}%` }}
              />
              {renderYellowAdMarkers()}
            </div>
          </div>

          {/* Time & Volume */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-300 font-bold">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                className="text-xs text-cyan-400 hover:text-white cursor-pointer"
                title="Mute"
              >
                {isMuted || volume === 0 ? '🔇' : '🔉'}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-10 h-1.5 accent-cyan-400 cursor-pointer"
                title="Volume"
              />
            </div>

            <button
              type="button"
              onClick={toggleTurboSpeed}
              className="text-[9px] font-bold bg-[#142333] hover:bg-[#1d334a] border border-cyan-500/40 text-cyan-200 px-1.5 py-0.5 rounded cursor-pointer"
            >
              {playbackSpeed}x
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-xs text-cyan-300 hover:text-white px-0.5 cursor-pointer"
              title="Full Screen"
            >
              ⛶
            </button>
          </div>
        </div>
      )}

      {/* Retro Skin Controls Bar (Skin 8: Retro CRT TV & VCR with Phosphor OSD) */}
      {skin === 'crt_tv_retro' && (
        <div className="absolute bottom-0 inset-x-0 h-[46px] bg-[#1a1714] border-t-4 border-[#2b241e] border-b-2 border-black px-2 sm:px-3 flex items-center justify-between gap-1.5 z-40 text-[#d4af37] select-none shadow-[0_-4px_16px_rgba(0,0,0,0.9)] font-mono">
          {/* Physical VCR Mechanical Pushbuttons */}
          <div className="flex items-center gap-1">
            {/* Power LED Indicator */}
            <div className="flex items-center gap-1 mr-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-600 shadow-[0_0_8px_#ef4444]'
                } border border-black`}
              />
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider hidden sm:inline">VCR</span>
            </div>

            <button
              type="button"
              onClick={() => handleSkip(-15)}
              className="px-1.5 py-1 bg-gradient-to-b from-[#38332c] to-[#1c1915] hover:brightness-110 active:translate-y-px border-t border-l border-t-[#524b41] border-l-[#524b41] border-r border-b border-r-[#0f0d0b] border-b-[#0f0d0b] rounded-xs text-[9px] text-amber-200 font-black cursor-pointer shadow-md"
              title="REW ◄◄"
            >
              ◄◄
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className={`px-2 py-1 bg-gradient-to-b ${
                isPlaying
                  ? 'from-[#10b981] to-[#047857] text-white shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                  : 'from-[#38332c] to-[#1c1915] text-emerald-400'
              } hover:brightness-110 active:translate-y-px border-t border-l border-t-[#524b41] border-l-[#524b41] border-r border-b border-r-[#0f0d0b] border-b-[#0f0d0b] rounded-xs text-[10px] font-black cursor-pointer shadow-md`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '❚❚ PAUSE' : '► PLAY'}
            </button>

            <button
              type="button"
              onClick={handleStop}
              className="px-1.5 py-1 bg-gradient-to-b from-[#38332c] to-[#1c1915] hover:brightness-110 active:translate-y-px border-t border-l border-t-[#524b41] border-l-[#524b41] border-r border-b border-r-[#0f0d0b] border-b-[#0f0d0b] rounded-xs text-[9px] text-red-400 font-black cursor-pointer shadow-md"
              title="STOP ■"
            >
              ■
            </button>

            <button
              type="button"
              onClick={() => handleSkip(15)}
              className="px-1.5 py-1 bg-gradient-to-b from-[#38332c] to-[#1c1915] hover:brightness-110 active:translate-y-px border-t border-l border-t-[#524b41] border-l-[#524b41] border-r border-b border-r-[#0f0d0b] border-b-[#0f0d0b] rounded-xs text-[9px] text-amber-200 font-black cursor-pointer shadow-md"
              title="FF ►►"
            >
              ►►
            </button>
          </div>

          {/* Center: Analog Tape Counter Progress Bar */}
          <div
            ref={progressBgRef}
            onClick={handleSeek}
            className="flex-1 h-3 bg-[#0d0c0a] border-2 border-[#38332c] rounded-xs relative cursor-pointer mx-1.5 shadow-inner"
            title="VCR Tape Position"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-xs"
              style={{ width: `${progressPct}%` }}
            />
            {renderYellowAdMarkers()}
          </div>

          {/* Right: Tape Time & CRT Scanline Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-black tracking-widest drop-shadow-[0_0_5px_#10b981]">
              SP {formatTime(currentTime)}
            </span>

            <button
              type="button"
              onClick={() => setIsScanlinesEnabled(!isScanlinesEnabled)}
              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-xs border cursor-pointer ${
                isScanlinesEnabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-[0_0_6px_#10b981]'
                  : 'bg-[#29241e] text-gray-400 border-[#473d32]'
              }`}
              title="Toggle CRT Scanline Overlay"
            >
              CRT
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-xs text-amber-200 hover:text-white px-1 cursor-pointer"
              title="Full Screen"
            >
              ⛶
            </button>
          </div>
        </div>
      )}

      {/* Engine Switcher Bar & Live Notifications */}
      {engineNotification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-amber-300 border border-amber-500 text-xs font-bold px-3 py-1.5 rounded shadow-2xl backdrop-blur-xs animate-bounce">
          {engineNotification}
        </div>
      )}

      {/* Multi-Engine Playback Switcher Strip */}
      {(hasWayback || (video.youtubeId && directStreamSource)) && (
        <div className="w-full bg-[#181818] border-t border-[#333] px-3 py-1.5 flex items-center justify-between text-[11px] gap-2 select-none">
          <div className="flex items-center gap-1.5 text-gray-300 font-bold">
            <span className="text-amber-400">🏛️</span>
            <span className="hidden sm:inline">Stream Engine:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {directStreamSource && (
              <button
                type="button"
                onClick={() => handleSelectEngine('high_performance')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  activeEngine === 'high_performance'
                    ? 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-400'
                    : 'bg-black/60 text-gray-300 hover:text-white border border-gray-700'
                }`}
                title="Direct Byte Stream (id_ flag): Hardware accelerated 60fps native HTML5 video with retro skins, speed, volume, and annotations!"
              >
                <span>⚡</span>
                <span>60fps Direct Stream</span>
              </button>
            )}

            {(video.waybackUrl || video.waybackEmbedUrl) && (
              <button
                type="button"
                onClick={() => handleSelectEngine('wayback_embed')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  activeEngine === 'wayback_embed'
                    ? 'bg-amber-600 text-white shadow-xs font-black ring-1 ring-amber-400'
                    : 'bg-black/60 text-gray-300 hover:text-white border border-gray-700'
                }`}
                title="Wayback Machine Clean IFrame Embed (if_ flag): Authentic preserved Internet Archive player"
              >
                <span>🏛️</span>
                <span>Wayback Embed</span>
              </button>
            )}

            {video.youtubeId && (
              <button
                type="button"
                onClick={() => handleSelectEngine('youtube')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  activeEngine === 'youtube'
                    ? 'bg-red-600 text-white shadow-xs font-black ring-1 ring-red-400'
                    : 'bg-black/60 text-gray-300 hover:text-white border border-gray-700'
                }`}
                title="Modern YouTube Player Integration"
              >
                <span>▶️</span>
                <span>YouTube</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
