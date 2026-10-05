import React, { useState, useEffect } from 'react';
import {
  RetroTubeState,
  User,
  Video,
  Post,
  Playlist,
  McnNetwork,
  ContentIdClaim,
  McnSponsorshipDeal,
  McnRoyaltyInvoice,
  CustomAdSettings,
  VideoAdConfig,
  Annotation,
  VideoCollaboration,
  LogoEffect,
} from './types';
import { INITIAL_STATE, DEFAULT_AVATAR } from './data/initialData';
import { playIEClick, playMSNNudge } from './utils/audio';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { WatchView } from './components/WatchView';
import { ChannelView } from './components/ChannelView';
import { UploadView } from './components/UploadView';
import { SettingsView } from './components/SettingsView';
import { EditVideoView, EditChannelView, SubSpaceModal } from './components/EditViews';
import { SuperChatModal, EmojiSizerModal, MembershipJoinModal } from './components/Modals';
import { AdjustViewsModal } from './components/AdjustViewsModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { PlaylistView } from './components/PlaylistView';
import { McnSimulatorView } from './components/McnSimulatorView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { GiphySearchModal } from './components/GiphySearchModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { CustomAdManagerModal } from './components/CustomAdManagerModal';
import { VideoAdSelectorModal } from './components/VideoAdSelectorModal';
import { AnnotationsModal } from './components/AnnotationsModal';
import { VideoCollabModal } from './components/VideoCollabModal';
import { CustomLogoModal } from './components/CustomLogoModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { HistoryView } from './components/HistoryView';
import { OfflineVaultView } from './components/OfflineVaultView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const STORAGE_KEY = 'retrotube_v18_state';

export default function App() {
  const [state, setState] = useState<RetroTubeState>(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.users && parsed.videos) {
          return {
            ...INITIAL_STATE,
            ...parsed,
            globalSettings: {
              ...INITIAL_STATE.globalSettings,
              ...(parsed.globalSettings || {}),
            },
            mcns: parsed.mcns && parsed.mcns.length > 0 ? parsed.mcns : INITIAL_STATE.mcns,
            sponsorshipDeals:
              parsed.sponsorshipDeals && parsed.sponsorshipDeals.length > 0
                ? parsed.sponsorshipDeals
                : INITIAL_STATE.sponsorshipDeals,
            contentIdClaims:
              parsed.contentIdClaims && parsed.contentIdClaims.length > 0
                ? parsed.contentIdClaims
                : INITIAL_STATE.contentIdClaims,
            royaltyInvoices:
              parsed.royaltyInvoices && parsed.royaltyInvoices.length > 0
                ? parsed.royaltyInvoices
                : INITIAL_STATE.royaltyInvoices,
            settings: {
              ...INITIAL_STATE.settings,
              ...(parsed.settings || {}),
            },
            customAd: parsed.customAd
              ? { ...INITIAL_STATE.customAd, ...parsed.customAd }
              : INITIAL_STATE.customAd,
            shopInventory: {
              ...INITIAL_STATE.shopInventory,
              ...(parsed.shopInventory || {}),
            },
          };
        }
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_STATE;
  });

  const [route, setRoute] = useState<{ name: string; params: Record<string, any> }>({
    name: 'home',
    params: {},
  });

  // Modals state
  const [activeSuperChatVideoId, setActiveSuperChatVideoId] = useState<string | null>(null);
  const [activeEmojiSizerSrc, setActiveEmojiSizerSrc] = useState<string | null>(null);
  const [activeJoinChannelId, setActiveJoinChannelId] = useState<string | null>(null);
  const [managingSubSpaceId, setManagingSubSpaceId] = useState<string | null>(null);
  const [activeAdjustVideo, setActiveAdjustVideo] = useState<Video | null>(null);
  const [activeAddToPlaylistVideo, setActiveAddToPlaylistVideo] = useState<Video | null>(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isGlobalGiphyOpen, setIsGlobalGiphyOpen] = useState(false);
  const [globalGiphyInitialQuery, setGlobalGiphyInitialQuery] = useState('');
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isCustomAdModalOpen, setIsCustomAdModalOpen] = useState(false);
  const [activeAdSelectorVideo, setActiveAdSelectorVideo] = useState<Video | null>(null);
  const [activeAnnotationsVideo, setActiveAnnotationsVideo] = useState<Video | null>(null);
  const [activeCollabVideo, setActiveCollabVideo] = useState<Video | null>(null);
  const [annotationsEnabled, setAnnotationsEnabled] = useState<boolean>(true);
  const [isCustomLogoModalOpen, setIsCustomLogoModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isOnline = useOnlineStatus();

  // System Toast / Alert Banner
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

  const showAlert = (title: string, message: string) => {
    setAlertInfo({ title, message });
    setTimeout(() => {
      setAlertInfo((prev) => (prev?.title === title ? null : prev));
    }, 5000);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      showAlert('🖥️ PC Fullscreen Mode', 'Entered full PC desktop screen. Press F or Esc to exit.');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      showAlert('Windowed Mode', 'Exited fullscreen mode.');
    }
  };

  // Global PC Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl && activeEl.getAttribute('contenteditable') === 'true');

      if (isInput) return;

      // Fullscreen toggle on 'f' or 'F'
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSaveCustomLogo = (logoConfig: {
    logoBase64: string;
    logoHeight: number;
    logoAnimationEffect: LogoEffect;
    logoTagline?: string;
    showTagline?: boolean;
    customLogoName?: string;
    customLogoType?: string;
    customLogoSize?: string;
  }) => {
    setState((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        logoBase64: logoConfig.logoBase64,
        logoHeight: logoConfig.logoHeight,
        logoAnimationEffect: logoConfig.logoAnimationEffect,
        logoTagline: logoConfig.logoTagline,
        showTagline: logoConfig.showTagline,
        customLogoName: logoConfig.customLogoName,
        customLogoType: logoConfig.customLogoType,
        customLogoSize: logoConfig.customLogoSize,
      },
    }));

    if (state.settings.navSounds) {
      playIEClick();
    }

    if (logoConfig.logoBase64) {
      const isGif = (logoConfig.customLogoType || '').includes('gif') || (logoConfig.customLogoName || '').toLowerCase().endsWith('.gif');
      showAlert(
        '🎨 Custom Logo Applied!',
        isGif
          ? 'Animated GIF logo active! Broadcast Yourself with retro motion.'
          : 'Your custom logo image has been successfully applied to RetroTube!'
      );
    } else {
      showAlert('Default Logo Restored', 'Reverted back to standard RetroTube branding.');
    }
  };

  const handleResetDefaultLogo = () => {
    setState((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        logoBase64: '',
        customLogoName: undefined,
        customLogoType: undefined,
        customLogoSize: undefined,
      },
    }));
    if (state.settings.navSounds) {
      playIEClick();
    }
    showAlert('Logo Reset', 'Reverted back to default RetroTube logo.');
  };

  // Watch History & Offline Handlers
  const handleLogHistory = (videoId: string, positionSeconds?: number, durationSeconds?: number) => {
    if (state.historyPaused) return;

    setState((prev) => {
      const existingHistory = prev.watchHistory || [];
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date(now).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const watchedDateFormatted = `Today at ${timeStr} (${dateStr})`;

      // Remove previous entry for same video
      const filtered = existingHistory.filter((item) => item.videoId !== videoId);

      const newItem = {
        id: `hist_${now}_${Math.random().toString(36).substr(2, 6)}`,
        videoId,
        watchedAt: now,
        watchedDateFormatted,
        lastPositionSeconds: positionSeconds || 0,
        durationSeconds: durationSeconds || 0,
        completed: false,
      };

      // Keep latest 100 items
      return {
        ...prev,
        watchHistory: [newItem, ...filtered].slice(0, 100),
      };
    });
  };

  const handleRemoveHistoryItem = (historyId: string) => {
    setState((prev) => ({
      ...prev,
      watchHistory: (prev.watchHistory || []).filter((item) => item.id !== historyId),
    }));
    showAlert('Removed from History', 'Video has been deleted from your watch history.');
  };

  const handleClearHistory = () => {
    setState((prev) => ({
      ...prev,
      watchHistory: [],
    }));
    showAlert('Watch History Cleared', 'Your watch timeline has been completely cleared.');
  };

  const handleTogglePauseHistory = (paused: boolean) => {
    setState((prev) => ({
      ...prev,
      historyPaused: paused,
    }));
    showAlert(
      paused ? 'Watch History Paused' : 'Watch History Resumed',
      paused
        ? 'RetroTube will not record watched videos until you unpause.'
        : 'RetroTube is now recording your watch timeline.'
    );
  };

  const handleToggleOfflineSave = (videoId: string) => {
    setState((prev) => {
      const currentVault = prev.offlineSavedVideoIds || [];
      const exists = currentVault.includes(videoId);
      const nextVault = exists
        ? currentVault.filter((id) => id !== videoId)
        : [...currentVault, videoId];

      const targetVideo = prev.videos.find((v) => v.id === videoId);
      const title = targetVideo ? `"${targetVideo.title}"` : 'Video';

      showAlert(
        exists ? 'Removed from Offline Vault' : '💾 Saved for Offline Playback!',
        exists
          ? `${title} was removed from offline storage.`
          : `${title} is now cached and ready to play without an internet connection!`
      );

      return {
        ...prev,
        offlineSavedVideoIds: nextVault,
      };
    });
  };

  const handleSaveAllSpotlightOffline = () => {
    setState((prev) => {
      const allIds = Array.from(new Set([...(prev.offlineSavedVideoIds || []), ...prev.videos.map((v) => v.id)]));
      showAlert(
        '📥 All Videos Cached for Offline Playback!',
        `Saved all ${prev.videos.length} videos to local offline storage. Ready for zero-internet PC playback!`
      );
      return {
        ...prev,
        offlineSavedVideoIds: allIds,
      };
    });
  };

  const handleClearOfflineVault = () => {
    setState((prev) => ({
      ...prev,
      offlineSavedVideoIds: [],
    }));
    showAlert('Offline Vault Cleared', 'All locally cached offline videos have been cleared.');
  };

  const handleSaveVideoAdConfig = (videoId: string, config: VideoAdConfig) => {
    setState((prev) => {
      const currentSelected = new Set(prev.customAd?.selectedVideoIds || ['v1', 'v2']);
      if (config.enabled && config.mode !== 'none') {
        currentSelected.add(videoId);
      } else {
        currentSelected.delete(videoId);
      }

      return {
        ...prev,
        customAd: {
          ...(prev.customAd || INITIAL_STATE.customAd!),
          selectedVideoIds: Array.from(currentSelected),
        },
        videos: prev.videos.map((v) =>
          v.id === videoId
            ? {
                ...v,
                customAdConfig: config,
                customAdDisabled: !config.enabled || config.mode === 'none',
                customAdTimestamps: config.timestamps,
              }
            : v
        ),
      };
    });
    showAlert(
      '📹 Video Ad Updated',
      config.mode === 'custom'
        ? 'Specific custom ad video saved and selected for this video!'
        : config.mode === 'none'
        ? 'Ads deselected (ad-free) for this video!'
        : 'Global ad settings selected for this video!'
    );
  };

  const handleToggleVideoAdSelection = (videoId: string, enabled: boolean) => {
    setState((prev) => {
      const currentSelected = new Set(prev.customAd?.selectedVideoIds || ['v1', 'v2']);
      if (enabled) {
        currentSelected.add(videoId);
      } else {
        currentSelected.delete(videoId);
      }

      return {
        ...prev,
        customAd: {
          ...(prev.customAd || INITIAL_STATE.customAd!),
          selectedVideoIds: Array.from(currentSelected),
        },
        videos: prev.videos.map((v) => {
          if (v.id !== videoId) return v;
          const existingConfig = v.customAdConfig;
          return {
            ...v,
            customAdDisabled: !enabled,
            customAdConfig: existingConfig
              ? {
                  ...existingConfig,
                  enabled,
                  mode: enabled
                    ? existingConfig.mode === 'none'
                      ? 'global'
                      : existingConfig.mode
                    : 'none',
                }
              : { enabled, mode: enabled ? 'global' : 'none' },
          };
        }),
      };
    });
    showAlert(
      enabled ? '🟡 Video Selected for Ads' : '⚪ Video Deselected (Ad-Free)',
      enabled
        ? 'Ads are now ACTIVE on this video with iconic yellow timeline cues!'
        : 'This video is now DESELECTED. It will play clean without commercial breaks.'
    );
  };

  const handleSaveAnnotations = (videoId: string, annotations: Annotation[]) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === videoId ? { ...v, annotations } : v
      ),
    }));
    showAlert('💬 Annotations Saved', `Saved ${annotations.length} annotations to video!`);
  };

  const handleSaveVideoCollaboration = (videoId: string, collab: VideoCollaboration | null) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === videoId
          ? {
              ...v,
              collabChannelId: collab ? collab.channelId : undefined,
              collabRole: collab ? collab.role : undefined,
              collaboration: collab || undefined,
            }
          : v
      ),
    }));

    if (collab) {
      const partner = state.users.find((u) => u.id === collab.channelId);
      showAlert(
        '🤝 Collaboration Linked!',
        `Official collaboration with ${partner?.username || 'Partner Channel'} saved (${collab.role || 'Partner'} • ${collab.splitPercentage}% revenue share)!`
      );
    } else {
      showAlert('Collaboration Removed', 'This video is now configured as a solo creator upload.');
    }
  };

  const handleToggleAnnotations = (enabled: boolean) => {
    setAnnotationsEnabled(enabled);
    showAlert(
      enabled ? '💬 Annotations Enabled' : '💬 Annotations Hidden',
      enabled
        ? 'Speech bubbles, notes, and spotlights are now visible on video.'
        : 'Annotations hidden during playback.'
    );
  };

  const handleToggleCustomAd = (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      customAd: {
        ...(prev.customAd || INITIAL_STATE.customAd!),
        enabled,
      },
    }));
    showAlert(
      enabled ? '🟡 Custom Ads Enabled' : '⚪ Custom Ads Disabled',
      enabled
        ? 'Custom ads are active! Iconic yellow timeline cues and skip button enabled.'
        : 'Custom ads turned off. Video will play continuously without ad interruptions.'
    );
  };

  const handleSaveCustomAd = (updatedAd: CustomAdSettings) => {
    setState((prev) => ({
      ...prev,
      customAd: updatedAd,
    }));
    showAlert('🟡 Custom Ad Settings Saved', 'MP4 ad file, yellow line timestamps, and skip button updated!');
  };

  const handleTriggerTestAd = () => {
    if (route.name !== 'watch') {
      const firstVid = state.videos[0];
      if (firstVid) {
        navigate('watch', { id: firstVid.id });
      }
    }
    setTimeout(() => {
      if (typeof (window as any).triggerAdBreak === 'function') {
        (window as any).triggerAdBreak(state.customAd?.timestamps?.[0] || 12);
      }
    }, 400);
  };

  const handleCreateChannel = (
    newChannelData: Partial<User>,
    initialVideos: Array<Partial<Video>> = [],
    switchImmediately: boolean = true
  ) => {
    const newChannelId = `u_${Date.now()}`;
    const fullChannel: User = {
      id: newChannelId,
      username: newChannelData.username || 'New Creator',
      bio: newChannelData.bio || 'Welcome to my RetroTube broadcast channel! Sub4sub and rate 5 stars!',
      subscribers: newChannelData.subscribers ?? 0,
      bgColor: newChannelData.bgColor || '#f4f4f4',
      bgPattern: newChannelData.bgPattern || 'none',
      bgRepeat: 'repeat',
      bgFixed: true,
      channelOpacity: 95,
      fontFamily: 'sans',
      headerColor: newChannelData.headerColor || '#cc181e',
      accentColor: newChannelData.accentColor || '#cc181e',
      bannerHeight: 'normal',
      avatarBase64: newChannelData.avatarBase64,
      bannerBase64: newChannelData.bannerBase64,
      topic: newChannelData.topic || 'General Entertainment',
      customTopic: newChannelData.customTopic,
      isYoutubeImported: newChannelData.isYoutubeImported || false,
      youtubeChannelUrl: newChannelData.youtubeChannelUrl,
      youtubeChannelHandle: newChannelData.youtubeChannelHandle,
      channelType: newChannelData.channelType || 'personal',
      joinedDate: newChannelData.joinedDate || ('Joined ' + new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
      subscriptions: [state.currentUserId],
      balance: 100.0,
      memberships: {},
      socialLinks: [
        ...(newChannelData.youtubeChannelUrl ? [{ platform: 'YouTube', url: newChannelData.youtubeChannelUrl }] : []),
      ],
      ...newChannelData,
    };

    const newVideos: Video[] = initialVideos.map((v, idx) => ({
      id: `v_${Date.now()}_${idx}`,
      title: v.title || `Upload #${idx + 1}`,
      desc: v.desc || `Official video from ${fullChannel.username}.`,
      description: v.desc || `Official video from ${fullChannel.username}.`,
      time: v.time || '3:30',
      views: v.views ?? (Math.floor(Math.random() * 5000) + 120),
      date: 'Just now',
      authorId: newChannelId,
      category: v.category || (fullChannel.topic?.split('&')[0].trim()) || 'Entertainment',
      thumb: v.thumb || (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : ''),
      youtubeId: v.youtubeId || null,
      ratingSum: 95,
      ratingCount: 20,
      comments: [],
      isMonetized: true,
      contentIdStatus: 'clean',
    }));

    setState((prev) => ({
      ...prev,
      users: [...prev.users, fullChannel],
      videos: newVideos.length > 0 ? [...newVideos, ...prev.videos] : prev.videos,
      currentUserId: switchImmediately ? newChannelId : prev.currentUserId,
    }));

    if (state.settings?.navSounds) {
      playMSNNudge();
    }

    showAlert(
      'Channel Created!',
      `Channel "${fullChannel.username}" has been successfully created${fullChannel.isYoutubeImported ? ' from YouTube' : ''}${newVideos.length > 0 ? ` and ${newVideos.length} playable video(s)` : ''}!`
    );

    if (switchImmediately) {
      navigate('channel', { id: newChannelId });
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply CSS Theme Presets and Colors
  useEffect(() => {
    document.body.className = `theme-${state.globalSettings.themePreset || 'default'}`;
    if (state.globalSettings.themeColor) {
      document.documentElement.style.setProperty('--theme-color', state.globalSettings.themeColor);
      document.documentElement.style.setProperty('--theme-color-hover', state.globalSettings.themeColor);
    }
  }, [state.globalSettings.themePreset, state.globalSettings.themeColor]);

  // Global Explorer Click Sound Handler
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.btn') ||
        target.closest('.video-card')
      ) {
        playIEClick(state.settings.navSounds);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [state.settings.navSounds]);

  // Route navigation helper
  const navigate = (routeName: string, params: Record<string, any> = {}) => {
    setRoute({ name: routeName, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentUser =
    state.users.find((u) => u.id === state.currentUserId) || state.users[0] || INITIAL_STATE.users[0];

  // Actions
  const handleAddSimulatedCash = () => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === prev.currentUserId ? { ...u, balance: (u.balance || 0) + 50.0 } : u
      ),
    }));
    showAlert('Funds Credited 💰', `Added $50.00 to ${currentUser.username}'s simulated wallet balance!`);
  };

  const handleSwitchUser = (newUserId: string) => {
    setState((prev) => ({ ...prev, currentUserId: newUserId }));
    showAlert('Profile Switched', `Now acting as ${state.users.find((u) => u.id === newUserId)?.username}`);
  };

  const handleToggleSubscribe = (channelId: string) => {
    if (channelId === state.currentUserId) return;
    const isSub = currentUser.subscriptions?.includes(channelId);

    setState((prev) => {
      const updatedUsers = prev.users.map((u) => {
        if (u.id === prev.currentUserId) {
          const subs = u.subscriptions || [];
          return {
            ...u,
            subscriptions: isSub ? subs.filter((id) => id !== channelId) : [...subs, channelId],
          };
        }
        if (u.id === channelId) {
          return {
            ...u,
            subscribers: Math.max(0, u.subscribers + (isSub ? -1 : 1)),
          };
        }
        return u;
      });

      return { ...prev, users: updatedUsers };
    });

    if (!isSub) {
      playMSNNudge(state.settings.navSounds);
      showAlert('Subscribed! 🔔', `You are now subscribed to ${state.users.find((u) => u.id === channelId)?.username}`);
    } else {
      showAlert('Unsubscribed', `Removed from your subscriptions.`);
    }
  };

  const handleAddToQueue = (videoId: string) => {
    if (state.queue.includes(videoId)) {
      showAlert('Already in Queue', 'This video is already in your active autoplay line.');
      return;
    }
    setState((prev) => ({ ...prev, queue: [...prev.queue, videoId] }));
    showAlert('Added to Play Queue 📺', 'Video queued for continuous streaming!');
  };

  const handleToggleWatchLater = (videoId: string) => {
    const wl = state.playlists.find((p) => p.id === 'pl_wl');
    const isSaved = wl?.videoIds.includes(videoId);

    setState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => {
        if (pl.id === 'pl_wl') {
          return {
            ...pl,
            videoIds: isSaved
              ? pl.videoIds.filter((id) => id !== videoId)
              : [...pl.videoIds, videoId],
          };
        }
        return pl;
      }),
    }));

    showAlert(
      isSaved ? 'Removed from Watch Later' : 'Saved to Watch Later 🕒',
      isSaved ? 'Video removed from your library.' : 'Video bookmarked to your Watch Later playlist!'
    );
  };

  const isWatchLater = (videoId: string) => {
    const wl = state.playlists.find((p) => p.id === 'pl_wl');
    return !!wl?.videoIds.includes(videoId);
  };

  const handlePostComment = (videoId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      userId: state.currentUserId,
      text,
      date: 'Just now',
      likes: 0,
      replies: [],
    };

    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === videoId ? { ...v, comments: [newComment, ...v.comments] } : v
      ),
    }));

    showAlert('Comment Published', 'Your response is live in the video discussion!');
  };

  const handlePostReply = (videoId: string, commentId: string, text: string) => {
    const newReply = {
      id: `rep_${Date.now()}`,
      userId: state.currentUserId,
      text,
      date: 'Just now',
      likes: 0,
      replies: [],
    };

    const addReplyRecursive = (comments: any[]): any[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: addReplyRecursive(c.replies) };
        }
        return c;
      });
    };

    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === videoId ? { ...v, comments: addReplyRecursive(v.comments) } : v
      ),
    }));

    showAlert('Reply Sent', 'Your threaded reply was added!');
  };

  const handleLikeComment = (videoId: string, commentId: string) => {
    const likeRecursive = (comments: any[]): any[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, likes: (c.likes || 0) + 1 };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: likeRecursive(c.replies) };
        }
        return c;
      });
    };

    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === videoId ? { ...v, comments: likeRecursive(v.comments) } : v
      ),
    }));
  };

  const handleRateVideo = (videoId: string, rating: number) => {
    const currentRating = currentUser.userRatings?.[videoId];
    const isUpdate = currentRating !== undefined;

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id === prev.currentUserId) {
          return {
            ...u,
            userRatings: {
              ...(u.userRatings || {}),
              [videoId]: rating,
            },
          };
        }
        return u;
      }),
      videos: prev.videos.map((v) => {
        if (v.id === videoId) {
          if (isUpdate) {
            return {
              ...v,
              ratingSum: v.ratingSum - currentRating + rating,
            };
          } else {
            return {
              ...v,
              ratingSum: v.ratingSum + rating,
              ratingCount: v.ratingCount + 1,
            };
          }
        }
        return v;
      }),
    }));

    playIEClick(state.settings.navSounds);
    showAlert(
      'Rating Submitted ⭐',
      isUpdate
        ? `Updated your rating to ${rating} stars!`
        : `Thanks for rating! You gave this video ${rating} stars.`
    );
  };

  const handleSetNotificationPref = (channelId: string, pref: 'all' | 'personalized' | 'none') => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id === prev.currentUserId) {
          return {
            ...u,
            notificationPreferences: {
              ...(u.notificationPreferences || {}),
              [channelId]: pref,
            },
          };
        }
        return u;
      }),
    }));

    const channelName = state.users.find((u) => u.id === channelId)?.username || 'channel';
    const prefLabels = {
      all: 'All alerts enabled 🔔 (Never miss an upload!)',
      personalized: 'Personalized highlights enabled 🔕',
      none: 'Muted 🚫',
    };
    showAlert('Notification Preferences', `${channelName}: ${prefLabels[pref]}`);
  };

  // Submit Super Chat Tip
  const handleSubmitSuperChat = (videoId: string, amount: number, text: string) => {
    if (currentUser.balance < amount) {
      showAlert('Insufficient Balance', 'Please click "+ Cash" to credit more simulation funds.');
      return;
    }

    const video = state.videos.find((v) => v.id === videoId);
    if (!video) return;

    // Calculate MCN cut if creator is partnered
    const creator = state.users.find((u) => u.id === video.authorId);
    let netPayout = amount;
    if (creator?.activeContract === 'machinima') {
      netPayout = amount * 0.6; // 40% cut
    } else if (creator?.activeContract === 'maker') {
      netPayout = amount * 0.5; // 50% split
    }

    // Collaboration revenue sharing split
    const collabId = video.collabChannelId || video.collaboration?.channelId;
    const splitPercent = video.collaboration?.splitPercentage ?? (collabId ? 50 : 0);
    const collabShare = collabId && splitPercent > 0 ? (netPayout * splitPercent) / 100 : 0;
    const authorShare = netPayout - collabShare;
    const collabUser = collabId ? state.users.find((u) => u.id === collabId) : null;

    const superChatComment = {
      id: `sc_${Date.now()}`,
      userId: state.currentUserId,
      text,
      date: 'Just now',
      likes: 0,
      isSuperChat: true,
      scAmount: amount,
      replies: [],
    };

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id === prev.currentUserId) {
          return { ...u, balance: Math.max(0, (u.balance || 0) - amount) };
        }
        if (u.id === video.authorId) {
          const ledger = u.earningsHistory || [];
          return {
            ...u,
            balance: (u.balance || 0) + authorShare,
            earningsHistory: [
              {
                date: 'Just now',
                source: `Super Chat Tip from ${currentUser.username}${collabUser ? ` (Split ${100 - splitPercent}%)` : ''} ($${authorShare.toFixed(2)})`,
                amount: authorShare,
              },
              ...ledger,
            ],
          };
        }
        if (collabId && u.id === collabId && collabShare > 0) {
          const ledger = u.earningsHistory || [];
          return {
            ...u,
            balance: (u.balance || 0) + collabShare,
            earningsHistory: [
              {
                date: 'Just now',
                source: `Collab Super Chat on "${video.title}" from ${currentUser.username} (${splitPercent}% split) ($${collabShare.toFixed(2)})`,
                amount: collabShare,
              },
              ...ledger,
            ],
          };
        }
        return u;
      }),
      videos: prev.videos.map((v) =>
        v.id === videoId ? { ...v, comments: [superChatComment, ...v.comments] } : v
      ),
    }));

    setActiveSuperChatVideoId(null);
    playMSNNudge(state.settings.navSounds);
    if (collabUser && collabShare > 0) {
      showAlert(
        'Super Chat Dispatched & Split! 💸🤝',
        `Tipped $${amount.toFixed(2)}: $${authorShare.toFixed(2)} to ${creator?.username} & $${collabShare.toFixed(2)} to ${collabUser.username}!`
      );
    } else {
      showAlert('Super Chat Dispatched! 💸', `Tipped $${amount.toFixed(2)} to ${creator?.username}!`);
    }
  };

  // Channel Membership Purchase
  const handlePurchaseMembership = (channelId: string, tierIndex: number) => {
    const targetChannel = state.users.find((u) => u.id === channelId);
    const tier = targetChannel?.membershipSettings?.tiers?.[tierIndex];
    if (!targetChannel || !tier) return;

    if (currentUser.balance < tier.price) {
      showAlert('Need More Funds', `Membership costs $${tier.price.toFixed(2)}. Add cash from top bar!`);
      return;
    }

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id === prev.currentUserId) {
          return {
            ...u,
            balance: Math.max(0, (u.balance || 0) - tier.price),
            memberships: {
              ...(u.memberships || {}),
              [channelId]: tierIndex,
            },
          };
        }
        if (u.id === channelId) {
          const ledger = u.earningsHistory || [];
          return {
            ...u,
            balance: (u.balance || 0) + tier.price,
            earningsHistory: [
              {
                date: 'Just now',
                source: `Membership Join from ${currentUser.username} (${tier.name})`,
                amount: tier.price,
              },
              ...ledger,
            ],
          };
        }
        return u;
      }),
    }));

    setActiveJoinChannelId(null);
    playMSNNudge(state.settings.navSounds);
    showAlert('Welcome to the Club! ⭐', `You joined ${targetChannel.username}'s ${tier.name} tier!`);
  };

  // Upload Video
  const handleUploadVideo = (newVideo: any) => {
    setState((prev) => {
      let updatedUsers = [...prev.users];
      if (newVideo.originalCreatorName) {
        const creatorName = newVideo.originalCreatorName;
        if (!updatedUsers.some((u) => u.id === newVideo.authorId)) {
          updatedUsers.push({
            id: newVideo.authorId,
            username: creatorName,
            bio: 'Imported YouTube Creator channel.',
            subscribers: 14200,
            bgColor: '#ffffff',
            subscriptions: [],
            balance: 100.0,
            memberships: {},
          });
        }
      }

      return {
        ...prev,
        users: updatedUsers,
        videos: [newVideo, ...prev.videos],
      };
    });

    showAlert('Broadcast Published! 🚀', `"${newVideo.title}" is now live in high-resolution streaming!`);
    navigate('watch', { id: newVideo.id });
  };

  // Adjust Video Views & Ratings (God Mode)
  const handleSaveViews = (
    videoId: string,
    newViews: number,
    ratingCount?: number,
    ratingSum?: number
  ) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            views: newViews,
            ratingSum: ratingSum !== undefined ? ratingSum : v.ratingSum,
            ratingCount: ratingCount !== undefined ? ratingCount : v.ratingCount,
          };
        }
        return v;
      }),
    }));
    playMSNNudge(state.settings.navSounds);
    showAlert('Views Adjusted ⚡', `Video views updated to ${newViews.toLocaleString()}!`);
    setActiveAdjustVideo(null);
  };

  // Toggle Video in Playlist
  const handleToggleVideoInPlaylist = (playlistId: string, videoId: string) => {
    setState((prev) => {
      let isAdded = false;
      const updatedPlaylists = (prev.playlists || []).map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.videoIds.includes(videoId);
          isAdded = !exists;
          return {
            ...pl,
            videoIds: exists
              ? pl.videoIds.filter((id) => id !== videoId)
              : [...pl.videoIds, videoId],
          };
        }
        return pl;
      });
      return { ...prev, playlists: updatedPlaylists };
    });
  };

  // Create New Playlist
  const handleCreatePlaylist = (
    name: string,
    description: string,
    isPrivate: boolean,
    initialVideoId?: string
  ) => {
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      authorId: state.currentUserId,
      name,
      description,
      isPrivate,
      videoIds: initialVideoId ? [initialVideoId] : [],
      createdAt: 'Just now',
    };
    setState((prev) => ({
      ...prev,
      playlists: [...(prev.playlists || []), newPlaylist],
    }));
    setIsCreatePlaylistOpen(false);
    showAlert('Playlist Created 📁', `"${name}" added to your retro library!`);
  };

  // Creator Studio & Video Management Handlers
  const handleUpdateVideo = (videoId: string, updates: Partial<Video>) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) => (v.id === videoId ? { ...v, ...updates } : v)),
    }));
    showAlert('Video Updated 🎬', 'Video settings and metadata saved!');
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm('Permanently delete this video?')) {
      setState((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v.id !== videoId),
        queue: prev.queue.filter((id) => id !== videoId),
        playlists: (prev.playlists || []).map((pl) => ({
          ...pl,
          videoIds: pl.videoIds.filter((id) => id !== videoId),
        })),
      }));
      showAlert('Video Deleted', 'Video has been removed from RetroTube.');
    }
  };

  const handleBulkUpdateVideos = (videoIds: string[], updates: Partial<Video>) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) => (videoIds.includes(v.id) ? { ...v, ...updates } : v)),
    }));
    showAlert('Bulk Action Applied ✓', `Updated ${videoIds.length} videos!`);
  };

  // MCN Simulator Handlers
  const handleCreateMcn = (newMcn: McnNetwork) => {
    setState((prev) => ({
      ...prev,
      mcns: [...(prev.mcns || []), newMcn],
    }));
    showAlert('MCN Network Founded! 🏢', `"${newMcn.name}" is now recruiting creators!`);
  };

  const handleUpdateMcn = (mcnId: string, updates: Partial<McnNetwork>) => {
    setState((prev) => ({
      ...prev,
      mcns: (prev.mcns || []).map((m) => (m.id === mcnId ? { ...m, ...updates } : m)),
    }));
    showAlert('MCN Network Updated 🏢', 'Contract terms and branding saved!');
  };

  const handleSignMcnContract = (channelId: string, mcnId: string) => {
    const targetMcn = (state.mcns || []).find((m) => m.id === mcnId);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === channelId ? { ...u, activeContract: mcnId } : u
      ),
      mcns: (prev.mcns || []).map((m) => {
        if (m.id === mcnId) {
          return {
            ...m,
            signedChannelIds: Array.from(new Set([...m.signedChannelIds, channelId])),
          };
        }
        return {
          ...m,
          signedChannelIds: m.signedChannelIds.filter((id) => id !== channelId),
        };
      }),
    }));
    showAlert('Partner Contract Signed ✍️', `Channel partnered with ${targetMcn?.name || 'MCN'}!`);
  };

  const handleVoidMcnContract = (channelId: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === channelId ? { ...u, activeContract: null } : u)),
      mcns: (prev.mcns || []).map((m) => ({
        ...m,
        signedChannelIds: m.signedChannelIds.filter((id) => id !== channelId),
      })),
    }));
    showAlert('Contract Voided', 'Channel is now an independent creator.');
  };

  const handleSendContractOffer = (channelId: string, mcnId: string, signBonus: number) => {
    const channelUser = state.users.find((u) => u.id === channelId);
    const targetMcn = (state.mcns || []).find((m) => m.id === mcnId);
    if (targetMcn && (targetMcn.vaultBalance || 0) < signBonus) {
      showAlert('Vault Balance Low', `Need at least $${signBonus.toFixed(2)} in network vault.`);
      return;
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === channelId
          ? {
              ...u,
              activeContract: mcnId,
              balance: (u.balance || 0) + signBonus,
              earningsHistory: [
                {
                  date: 'Just now',
                  source: `Signing Bonus from ${targetMcn?.name || 'MCN'} ($${signBonus.toFixed(2)})`,
                  amount: signBonus,
                },
                ...(u.earningsHistory || []),
              ],
            }
          : u
      ),
      mcns: (prev.mcns || []).map((m) =>
        m.id === mcnId
          ? {
              ...m,
              vaultBalance: Math.max(0, (m.vaultBalance || 0) - signBonus),
              signedChannelIds: Array.from(new Set([...m.signedChannelIds, channelId])),
            }
          : {
              ...m,
              signedChannelIds: m.signedChannelIds.filter((id) => id !== channelId),
            }
      ),
    }));
    showAlert('Recruitment Accepted! 🤝', `${channelUser?.username} signed with ${targetMcn?.name} (Bonus: $${signBonus.toFixed(2)})!`);
  };

  const handleClaimSponsorship = (dealId: string, mcnId: string) => {
    setState((prev) => ({
      ...prev,
      sponsorshipDeals: (prev.sponsorshipDeals || []).map((d) =>
        d.id === dealId ? { ...d, assignedNetworkId: mcnId } : d
      ),
    }));
    showAlert('Sponsorship Locked 💼', 'Brand campaign secured for your network creators!');
  };

  const handleAssignSponsorshipChannel = (dealId: string, channelId: string) => {
    const deal = (state.sponsorshipDeals || []).find((d) => d.id === dealId);
    const chUser = state.users.find((u) => u.id === channelId);
    setState((prev) => ({
      ...prev,
      sponsorshipDeals: (prev.sponsorshipDeals || []).map((d) => {
        if (d.id === dealId) {
          const assigned = d.assignedChannelIds || [];
          const exists = assigned.includes(channelId);
          return {
            ...d,
            assignedChannelIds: exists
              ? assigned.filter((id) => id !== channelId)
              : [...assigned, channelId],
          };
        }
        return d;
      }),
      users: prev.users.map((u) => {
        if (u.id === channelId && deal) {
          return {
            ...u,
            balance: (u.balance || 0) + deal.payoutPerVideo,
            earningsHistory: [
              {
                date: 'Just now',
                source: `Brand Integration: ${deal.brandName} ($${deal.payoutPerVideo.toFixed(2)})`,
                amount: deal.payoutPerVideo,
              },
              ...(u.earningsHistory || []),
            ],
          };
        }
        return u;
      }),
    }));
    showAlert('Sponsorship Assigned! 🏷️', `Brand campaign activated for ${chUser?.username}!`);
  };

  const handleAddContentIdClaim = (claim: Omit<ContentIdClaim, 'id'>) => {
    const newClaim: ContentIdClaim = {
      ...claim,
      id: `cid_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      contentIdClaims: [newClaim, ...(prev.contentIdClaims || [])],
      videos: prev.videos.map((v) =>
        v.id === claim.targetVideoId
          ? {
              ...v,
              contentIdStatus: claim.claimType === 'strike' ? 'strike' : 'claimed',
              claimedByMcnId: claim.claimantMcnId,
            }
          : v
      ),
    }));
    showAlert('Content ID Claim Registered ⚖️', `Automated claim enforced on target video.`);
  };

  const handleResolveContentIdClaim = (claimId: string, action: 'release' | 'uphold') => {
    const claim = (state.contentIdClaims || []).find((c) => c.id === claimId);
    setState((prev) => ({
      ...prev,
      contentIdClaims: (prev.contentIdClaims || []).map((c) =>
        c.id === claimId
          ? { ...c, status: action === 'release' ? 'released' : 'active' }
          : c
      ),
      videos: prev.videos.map((v) => {
        if (claim && v.id === claim.targetVideoId) {
          return {
            ...v,
            contentIdStatus: action === 'release' ? 'clean' : v.contentIdStatus,
            claimedByMcnId: action === 'release' ? null : v.claimedByMcnId,
          };
        }
        return v;
      }),
    }));
    showAlert(action === 'release' ? 'Claim Released ✓' : 'Claim Upheld ⚖️', `Content ID status updated.`);
  };

  const handleRunMonthlyPayouts = (mcnId: string) => {
    const mcn = (state.mcns || []).find((m) => m.id === mcnId);
    if (!mcn) return;
    let totalGross = 0;
    let totalCreatorCut = 0;
    let totalNetworkCut = 0;
    const newInvoices: any[] = [];

    mcn.signedChannelIds.forEach((chId) => {
      const chVideos = state.videos.filter((v) => v.authorId === chId);
      const views = chVideos.reduce((sum, v) => sum + v.views, 0);
      const gross = (views / 1000) * (3.0 * mcn.cpmMultiplier);
      const creatorCut = gross * (mcn.splitPercentage / 100);
      const networkCut = gross - creatorCut;

      totalGross += gross;
      totalCreatorCut += creatorCut;
      totalNetworkCut += networkCut;

      newInvoices.push({
        id: `inv_${Date.now()}_${chId}`,
        mcnId,
        channelId: chId,
        period: 'Monthly Distribution Cycle',
        totalViews: views,
        grossRevenue: Math.round(gross * 100) / 100,
        creatorCut: Math.round(creatorCut * 100) / 100,
        networkCut: Math.round(networkCut * 100) / 100,
        status: 'paid',
        date: 'Today',
      });
    });

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        const invoice = newInvoices.find((inv) => inv.channelId === u.id);
        if (invoice) {
          return {
            ...u,
            balance: (u.balance || 0) + invoice.creatorCut,
            earningsHistory: [
              {
                date: 'Just now',
                source: `Monthly MCN Revenue Share (${mcn.name})`,
                amount: invoice.creatorCut,
              },
              ...(u.earningsHistory || []),
            ],
          };
        }
        return u;
      }),
      mcns: (prev.mcns || []).map((m) =>
        m.id === mcnId
          ? { ...m, vaultBalance: (m.vaultBalance || 0) + totalNetworkCut }
          : m
      ),
      royaltyInvoices: [...newInvoices, ...(prev.royaltyInvoices || [])],
    }));

    showAlert('Monthly Royalties Dispatched 💸', `Paid $${totalCreatorCut.toFixed(2)} to creators, added $${totalNetworkCut.toFixed(2)} to network vault!`);
  };

  const handleWithdrawVault = (mcnId: string, amount: number) => {
    const mcn = (state.mcns || []).find((m) => m.id === mcnId);
    if (!mcn || (mcn.vaultBalance || 0) < amount) {
      showAlert('Insufficient Vault Balance', 'Not enough treasury funds to withdraw.');
      return;
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === mcn.founderId ? { ...u, balance: (u.balance || 0) + amount } : u
      ),
      mcns: (prev.mcns || []).map((m) =>
        m.id === mcnId ? { ...m, vaultBalance: Math.max(0, (m.vaultBalance || 0) - amount) } : m
      ),
    }));
    showAlert('Vault Withdrawn 💰', `Transferred $${amount.toFixed(2)} to network founder's balance!`);
  };

  const handleAttachMusicToVideo = (videoId: string, trackTitle: string) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === videoId ? { ...v, backgroundMusicTrack: trackTitle } : v
      ),
    }));
    showAlert('Soundtrack Licensed 🎵', `Cleared "${trackTitle}" for video streaming!`);
  };

  const handleImportVideosToChannel = (channelId: string, newVideos: Array<Partial<Video>>) => {
    const targetUser = state.users.find((u) => u.id === channelId) || currentUser;
    const created: Video[] = newVideos.map((nv, idx) => ({
      id: `vid_yt_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      title: nv.title || 'Official YouTube Broadcast',
      desc: nv.desc || `Official video from ${targetUser.username}`,
      authorId: channelId,
      views: nv.views ?? (Math.floor(Math.random() * 8500) + 400),
      ratingSum: 75,
      ratingCount: 15,
      time: nv.time || '3:45',
      date: 'Just now',
      category: nv.category || targetUser.topic || 'Entertainment',
      thumb: nv.thumb || (nv.youtubeId ? `https://img.youtube.com/vi/${nv.youtubeId}/hqdefault.jpg` : DEFAULT_AVATAR),
      youtubeId: nv.youtubeId,
      comments: [],
    }));

    setState((prev) => ({
      ...prev,
      videos: [...created, ...prev.videos],
    }));

    showAlert(
      'YouTube Catalog Imported 🎬',
      `Imported ${created.length} videos to ${targetUser.username}'s channel!`
    );
  };

  const handleSyncChannelProfile = (channelId: string, updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id === channelId) {
          return {
            ...u,
            ...updates,
            id: u.id,
            isYoutubeImported: true,
          };
        }
        return u;
      }),
    }));
    showAlert(
      'Channel Profile Synced ✨',
      'Official YouTube avatar profile photo and native bio description updated successfully!'
    );
  };

  // Filtered videos for Home
  let filteredVideos = state.videos;
  let headerTitle = 'Spotlight Videos (High-Definition Streaming)';

  if (route.name === 'home') {
    if (route.params.feed === 'subscriptions') {
      const subs = currentUser.subscriptions || [];
      filteredVideos = state.videos.filter((v) => subs.includes(v.authorId));
      headerTitle = 'Subscriptions Feed';
    } else if (route.params.subSpaceId) {
      const space = state.subSpaces.find((s) => s.id === route.params.subSpaceId);
      filteredVideos = state.videos.filter((v) => space?.subChannelIds.includes(v.authorId));
      headerTitle = `Curated Subspace: ${space?.name}`;
    } else if (route.params.playlistId) {
      const pl = state.playlists.find((p) => p.id === route.params.playlistId);
      filteredVideos = state.videos.filter((v) => pl?.videoIds.includes(v.id));
      headerTitle = `Playlist: ${pl?.name}`;
    } else if (route.params.category) {
      filteredVideos = state.videos.filter((v) => v.category === route.params.category);
      headerTitle = `${route.params.category} Videos`;
    } else if (route.params.searchQuery) {
      const q = route.params.searchQuery.toLowerCase();
      filteredVideos = state.videos.filter((v) => {
        const author = state.users.find((u) => u.id === v.authorId);
        return v.title.toLowerCase().includes(q) || author?.username.toLowerCase().includes(q);
      });
      headerTitle = `Search results for: "${route.params.searchQuery}"`;
    }
  }

  // Backup export / import
  const exportStateJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'retrotube_backup_state.json';
    a.click();
  };

  const importStateJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.users && parsed.videos) {
          setState(parsed);
          showAlert('State Restored ✓', 'Imported data, custom channels, and layouts synchronized!');
        }
      } catch (err) {
        showAlert('Import Error', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenResetModal = () => {
    setIsResetConfirmOpen(true);
  };

  const handleExecuteResetDefaultState = () => {
    try {
      const freshState = JSON.parse(JSON.stringify(INITIAL_STATE));
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
      setState(freshState);
      setIsResetConfirmOpen(false);
      showAlert('Platform Reset Complete ✓', 'Reverted RetroTube database and settings to original factory specs.');
      navigate('home');
      if (freshState.settings.navSounds) {
        playIEClick();
      }
    } catch {
      setState(INITIAL_STATE);
      setIsResetConfirmOpen(false);
      showAlert('Platform Reset Complete', 'Reverted database to factory specs.');
      navigate('home');
    }
  };

  // Find active video for watch view
  const activeWatchVideo =
    state.videos.find((v) => v.id === route.params.id) || state.videos[0];
  const activeWatchAuthor =
    state.users.find((u) => u.id === activeWatchVideo?.authorId) || state.users[0];

  // Auto advance queue or Up Next (respecting Autoplay setting)
  const handleVideoEnded = () => {
    if (state.settings.autoplay === false) {
      return;
    }
    if (state.queue.length > 0) {
      const nextId = state.queue[0];
      setState((prev) => ({ ...prev, queue: prev.queue.slice(1) }));
      showAlert('Next Video ▶️', 'Auto-playing next video in queue line...');
      setTimeout(() => {
        navigate('watch', { id: nextId });
      }, 1000);
      return;
    }

    // Continuous Up Next: next video from creator or platform
    const currentVideo = activeWatchVideo;
    if (!currentVideo) return;
    const authorVideos = state.videos.filter(
      (v) => v.authorId === currentVideo.authorId && v.id !== currentVideo.id
    );
    const otherVideos = state.videos.filter(
      (v) => v.id !== currentVideo.id && v.authorId !== currentVideo.authorId
    );
    const nextVideo = authorVideos[0] || otherVideos[0];
    if (nextVideo) {
      showAlert('Autoplaying Up Next 📺', `Playing "${nextVideo.title}"...`);
      setTimeout(() => {
        navigate('watch', { id: nextVideo.id });
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-inherit text-inherit">
      {/* System Toast / Alert Banner */}
      {alertInfo && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full bg-[#ffffe0] border-2 border-[#e6db55] p-3 rounded-md shadow-2xl flex items-start justify-between gap-2 text-xs">
          <div>
            <div className="font-bold text-red-700">{alertInfo.title}</div>
            <div className="text-gray-800 mt-0.5">{alertInfo.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            className="btn text-[10px] py-0.5 px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        users={state.users}
        logoBase64={state.globalSettings.logoBase64}
        logoHeight={state.globalSettings.logoHeight || 36}
        logoAnimationEffect={state.globalSettings.logoAnimationEffect || 'none'}
        logoTagline={state.globalSettings.logoTagline || 'Broadcast Yourself™'}
        showTagline={state.globalSettings.showTagline ?? true}
        customAdEnabled={state.customAd?.enabled ?? true}
        onSearch={(q) => navigate('home', { searchQuery: q })}
        onSwitchUser={handleSwitchUser}
        onAddSimulatedCash={handleAddSimulatedCash}
        onNavigate={navigate}
        onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
        onOpenAdSettings={() => setIsCustomAdModalOpen(true)}
        onOpenLogoModal={() => setIsCustomLogoModalOpen(true)}
        historyCount={(state.watchHistory || []).length}
        onOpenGiphyModal={(initialQ) => {
          setGlobalGiphyInitialQuery(initialQ || '');
          setIsGlobalGiphyOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1040px] w-full mx-auto px-3 sm:px-4 py-4">
        {route.name === 'home' && (
          <div className="flex flex-col md:flex-row gap-5">
            <Sidebar
              categories={state.categories}
              activeCategory={route.params.category || null}
              activeFeed={route.params.feed || null}
              activeSubSpaceId={route.params.subSpaceId || null}
              activePlaylistId={route.params.playlistId || null}
              playlists={state.playlists}
              subSpaces={state.subSpaces}
              queue={state.queue}
              videos={state.videos}
              customAdEnabled={state.customAd?.enabled ?? true}
              onOpenAdSettings={() => setIsCustomAdModalOpen(true)}
              historyCount={(state.watchHistory || []).length}
              offlineCount={(state.offlineSavedVideoIds || []).length}
              activeRouteName={route.name}
              onNavigate={(r, p) => navigate(r, p)}
              onSelectCategory={(cat) => navigate('home', cat ? { category: cat } : {})}
              onSelectFeed={(feed) => navigate('home', feed ? { feed } : {})}
              onSelectSubSpace={(id) => navigate('home', id ? { subSpaceId: id } : {})}
              onSelectPlaylist={(id) => navigate('playlist', { id })}
              onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
              onCreateSubSpace={() => {
                const name = prompt('Enter a title for this curated subscription folder:');
                if (name?.trim()) {
                  const newSpace = { id: `sp_${Date.now()}`, name: name.trim(), subChannelIds: [] };
                  setState((prev) => ({ ...prev, subSpaces: [...prev.subSpaces, newSpace] }));
                  showAlert('Subspace Created', `Created folder "${name}"!`);
                }
              }}
              onManageSubSpace={(id) => setManagingSubSpaceId(id)}
              onNavigateVideo={(id) => navigate('watch', { id })}
              onClearQueue={() => {
                setState((prev) => ({ ...prev, queue: [] }));
                showAlert('Queue Cleared', 'Active playback line has been reset.');
              }}
              onRemoveFromQueue={(id) =>
                setState((prev) => ({ ...prev, queue: prev.queue.filter((i) => i !== id) }))
              }
            />

            <div className="flex-1 min-w-0">
              <HomeView
                videos={filteredVideos}
                users={state.users}
                headerText={headerTitle}
                searchQuery={route.params.searchQuery}
                promotedVideoIds={state.promotedVideos}
                onNavigateVideo={(id) => navigate('watch', { id })}
                onNavigateChannel={(id) => navigate('channel', { id })}
                onClearSearch={() => navigate('home')}
                onAddToQueue={handleAddToQueue}
                onToggleWatchLater={handleToggleWatchLater}
                isWatchLater={isWatchLater}
                onOpenAddToPlaylist={(vid) => setActiveAddToPlaylistVideo(vid)}
                onOpenAdjustViews={(vid) => setActiveAdjustVideo(vid)}
              />
            </div>
          </div>
        )}

        {route.name === 'watch' && activeWatchVideo && (
          <WatchView
            video={activeWatchVideo}
            videos={state.videos}
            author={activeWatchAuthor}
            currentUser={currentUser}
            users={state.users}
            skin={state.settings.mediaSkin}
            defaultSpeed={state.settings.defaultPlaybackRate}
            defaultQuality={state.settings.preferredQuality}
            customAd={state.customAd || INITIAL_STATE.customAd}
            onToggleCustomAd={handleToggleCustomAd}
            onOpenAdSettings={() => setIsCustomAdModalOpen(true)}
            onOpenVideoAdSelector={(vid) => setActiveAdSelectorVideo(vid)}
            onToggleVideoAdSelection={handleToggleVideoAdSelection}
            annotationsEnabled={annotationsEnabled}
            onToggleAnnotations={handleToggleAnnotations}
            onOpenAnnotationsModal={(vid) => setActiveAnnotationsVideo(vid)}
            onOpenCollabModal={(vid) => setActiveCollabVideo(vid)}
            onNavigate={navigate}
            onToggleSubscribe={handleToggleSubscribe}
            onOpenSuperChat={(vidId) => setActiveSuperChatVideoId(vidId)}
            onOpenMembershipModal={(chId) => setActiveJoinChannelId(chId)}
            onOpenEmojiSizer={(src) => setActiveEmojiSizerSrc(src)}
            onPostComment={handlePostComment}
            onPostReply={handlePostReply}
            onLikeComment={handleLikeComment}
            onRateVideo={handleRateVideo}
            onAddToQueue={handleAddToQueue}
            onToggleWatchLater={handleToggleWatchLater}
            onSetNotificationPref={handleSetNotificationPref}
            onVideoEnd={handleVideoEnded}
            isWatchLater={isWatchLater(activeWatchVideo.id)}
            autoplay={state.settings.autoplay ?? true}
            onToggleAutoplay={(val) => {
              setState((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  autoplay: val,
                },
              }));
            }}
            onOpenAdjustViews={(vid) => setActiveAdjustVideo(vid)}
            onOpenAddToPlaylist={(vid) => setActiveAddToPlaylistVideo(vid)}
            onSkinChange={(newSkin) => {
              setState((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  mediaSkin: newSkin,
                },
              }));
            }}
            isSavedOffline={(state.offlineSavedVideoIds || []).includes(activeWatchVideo.id)}
            onToggleOfflineSave={handleToggleOfflineSave}
            onLogHistory={handleLogHistory}
            initialSeekSeconds={route.params.startSeconds ? Number(route.params.startSeconds) : undefined}
          />
        )}

        {route.name === 'channel' && (
          <ChannelView
            channel={state.users.find((u) => u.id === (route.params.id || state.currentUserId)) || currentUser}
            currentUser={currentUser}
            users={state.users}
            videos={state.videos}
            posts={state.posts}
            playlists={state.playlists}
            shopInventory={state.shopInventory}
            customPartners={state.customPartners}
            activeTab={route.params.tab || 'videos'}
            onNavigate={navigate}
            onToggleSubscribe={handleToggleSubscribe}
            onSetNotificationPref={handleSetNotificationPref}
            onOpenMembershipModal={(chId) => setActiveJoinChannelId(chId)}
            onOpenEmojiSizer={(src) => setActiveEmojiSizerSrc(src)}
            onOpenAdjustViews={(vid) => setActiveAdjustVideo(vid)}
            onOpenAddToPlaylist={(vid) => setActiveAddToPlaylistVideo(vid)}
            onSelectPlaylist={(plId) => {
              const pl = state.playlists.find((p) => p.id === plId);
              const firstVid = pl?.videoIds[0] || state.videos[0]?.id;
              if (firstVid) navigate('watch', { id: firstVid, list: plId });
            }}
            onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
            onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
            onImportVideosToChannel={handleImportVideosToChannel}
            onVotePoll={(postId, optionIdx) => {
              setState((prev) => ({
                ...prev,
                posts: prev.posts.map((p) => {
                  if (p.id === postId && p.options) {
                    const updated = [...p.options];
                    updated[optionIdx] = {
                      ...updated[optionIdx],
                      votes: (updated[optionIdx].votes || 0) + 1,
                    };
                    return { ...p, options: updated };
                  }
                  return p;
                }),
              }));
              showAlert('Vote Cast!', 'Your poll answer has been counted.');
            }}
            onSubmitPost={(chId, postData) => {
              const newPost: Post = {
                id: `p_${Date.now()}`,
                channelId: chId,
                authorId: postData.authorId,
                type: postData.type,
                content: postData.content,
                images: postData.images,
                options: postData.options,
                date: 'Just now',
                comments: [],
              };
              setState((prev) => ({ ...prev, posts: [newPost, ...prev.posts] }));
              showAlert('Community Post Published', 'Your update is now visible in the channel feed!');
            }}
            onPostCommunityComment={(postId, text) => {
              const newComment = {
                id: `cm_${Date.now()}`,
                userId: state.currentUserId,
                text,
                date: 'Just now',
                likes: 0,
                replies: [],
              };
              setState((prev) => ({
                ...prev,
                posts: prev.posts.map((p) =>
                  p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
                ),
              }));
            }}
            onBuyShopItem={(chId, type, itemId) => {
              const item =
                type === 'theme'
                  ? state.shopInventory.themes.find((t) => t.id === itemId)
                  : state.shopInventory.borders.find((b) => b.id === itemId);
              if (!item) return;

              if (currentUser.balance < item.price) {
                showAlert('Insufficient Funds', 'Add cash from the top bar to buy items.');
                return;
              }

              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) => {
                  if (u.id === chId) {
                    return {
                      ...u,
                      balance: (u.balance || 0) - item.price,
                      purchasedThemes:
                        type === 'theme'
                          ? [...(u.purchasedThemes || []), itemId]
                          : u.purchasedThemes,
                      purchasedBorders:
                        type === 'border'
                          ? [...(u.purchasedBorders || []), itemId]
                          : u.purchasedBorders,
                    };
                  }
                  return u;
                }),
              }));

              showAlert('Purchase Successful 🛒', `Bought "${item.name}"!`);
            }}
            onToggleEquipTheme={(chId, themeId) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === chId ? { ...u, activeTheme: u.activeTheme === themeId ? null : themeId } : u
                ),
              }));
              showAlert('Theme Updated', 'Active channel background layout changed!');
            }}
            onToggleEquipBorder={(chId, borderId) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === chId
                    ? { ...u, activeBorder: u.activeBorder === borderId ? null : borderId }
                    : u
                ),
              }));
              showAlert('Border Equipped', 'Active animated avatar border updated!');
            }}
            onBuyVideoPromotion={(chId, videoId) => {
              if (currentUser.balance < 25.0) {
                showAlert('Need Funds', 'Promotion costs $25.00.');
                return;
              }
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === chId ? { ...u, balance: (u.balance || 0) - 25.0 } : u
                ),
                promotedVideos: prev.promotedVideos.includes(videoId)
                  ? prev.promotedVideos
                  : [...prev.promotedVideos, videoId],
              }));
              showAlert('Spotlight Bid Active 🚀', 'Your video is now pinned on the homepage!');
            }}
            onSignContract={(chId, contractType) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === chId ? { ...u, activeContract: contractType } : u
                ),
              }));
              showAlert('Contract Signed ✍️', `Signed ${contractType} network partner agreement!`);
            }}
            onVoidContract={(chId) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) => (u.id === chId ? { ...u, activeContract: null } : u)),
              }));
              showAlert('Contract Voided', 'You are now an independent free agent.');
            }}
            onCreateCustomMcn={(chId, data) => {
              const newMcn = {
                id: `mcn_${Date.now()}`,
                name: data.name,
                split: data.split,
                cpm: data.cpm,
              };
              setState((prev) => ({
                ...prev,
                customPartners: [...prev.customPartners, newMcn],
              }));
              showAlert('MCN Established', `Created "${data.name}" partner network!`);
            }}
            onEarnFastSubs={(chId) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === chId ? { ...u, subscribers: (u.subscribers || 0) + 15 } : u
                ),
              }));
              showAlert('Milestone Fast-Track', 'Gained 15 subscribers!');
            }}
            onSaveMembershipSettings={(chId, settings) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === chId ? { ...u, membershipSettings: settings } : u
                ),
              }));
              showAlert('Memberships Saved', 'Channel tiers and perks updated!');
            }}
            onUploadMemberEmoji={(chId, name, base64) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) => {
                  if (u.id === chId) {
                    const curr = u.membershipSettings || { enabled: true, tiers: [], emojis: [] };
                    return {
                      ...u,
                      membershipSettings: {
                        ...curr,
                        emojis: [...(curr.emojis || []), { name, base64 }],
                      },
                    };
                  }
                  return u;
                }),
              }));
              showAlert('Emoji Added ⭐', `:${name}: is now available to your members!`);
            }}
            onDeleteMemberEmoji={(chId, index) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) => {
                  if (u.id === chId && u.membershipSettings) {
                    const ems = [...(u.membershipSettings.emojis || [])];
                    ems.splice(index, 1);
                    return {
                      ...u,
                      membershipSettings: {
                        ...u.membershipSettings,
                        emojis: ems,
                      },
                    };
                  }
                  return u;
                }),
              }));
              showAlert('Emoji Deleted', 'Member emoji removed.');
            }}
            onAddToQueue={handleAddToQueue}
            onToggleWatchLater={handleToggleWatchLater}
            isWatchLater={isWatchLater}
            onUpdateChannelProfile={handleSyncChannelProfile}
          />
        )}

        {route.name === 'upload' && (
          <UploadView
            currentUser={currentUser}
            users={state.users}
            categories={state.categories}
            navSounds={state.settings.navSounds}
            globalAd={state.customAd || INITIAL_STATE.customAd}
            onUploadVideo={handleUploadVideo}
            onNavigate={(r) => navigate(r)}
          />
        )}

        {route.name === 'settings' && (
          <SettingsView
            currentSettings={{
              themeColor: state.globalSettings.themeColor,
              logoBase64: state.globalSettings.logoBase64,
              logoHeight: state.globalSettings.logoHeight,
              logoAnimationEffect: state.globalSettings.logoAnimationEffect,
              logoTagline: state.globalSettings.logoTagline,
              showTagline: state.globalSettings.showTagline,
              themePreset: state.globalSettings.themePreset,
              navSounds: state.settings.navSounds,
              autoplay: state.settings.autoplay ?? true,
              mediaSkin: state.settings.mediaSkin,
              defaultPlaybackRate: state.settings.defaultPlaybackRate,
              preferredQuality: state.settings.preferredQuality,
            }}
            customAd={state.customAd || INITIAL_STATE.customAd}
            onToggleCustomAd={handleToggleCustomAd}
            onOpenAdSettings={() => setIsCustomAdModalOpen(true)}
            onOpenLogoModal={() => setIsCustomLogoModalOpen(true)}
            onResetDefaultState={handleOpenResetModal}
            onSave={(newSettings) => {
              setState((prev) => ({
                ...prev,
                globalSettings: {
                  themeColor: newSettings.themeColor,
                  logoBase64: newSettings.logoBase64,
                  logoHeight: newSettings.logoHeight,
                  logoAnimationEffect: newSettings.logoAnimationEffect,
                  logoTagline: newSettings.logoTagline,
                  showTagline: newSettings.showTagline,
                  themePreset: newSettings.themePreset,
                  customLogoName: newSettings.customLogoName,
                  customLogoType: newSettings.customLogoType,
                  customLogoSize: newSettings.customLogoSize,
                },
                settings: {
                  navSounds: newSettings.navSounds,
                  autoplay: newSettings.autoplay,
                  mediaSkin: newSettings.mediaSkin,
                  defaultPlaybackRate: newSettings.defaultPlaybackRate,
                  preferredQuality: newSettings.preferredQuality,
                },
              }));
              showAlert('Settings Applied', 'Theme, logo, sound, and player preferences updated!');
              navigate('home');
            }}
            onNavigate={(r) => navigate(r)}
          />
        )}

        {route.name === 'edit_video' && (
          <EditVideoView
            video={state.videos.find((v) => v.id === route.params.id) || state.videos[0]}
            users={state.users}
            onSave={(updates) => {
              setState((prev) => ({
                ...prev,
                videos: prev.videos.map((v) =>
                  v.id === route.params.id ? { ...v, ...updates } : v
                ),
              }));
              showAlert('Video Updated', 'Video attributes saved!');
              navigate('watch', { id: route.params.id });
            }}
            onNavigate={navigate}
          />
        )}

        {route.name === 'edit_channel' && (
          <EditChannelView
            channel={state.users.find((u) => u.id === route.params.id) || currentUser}
            videos={state.videos}
            users={state.users}
            shopInventory={state.shopInventory}
            onSave={(updates) => {
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === route.params.id ? { ...u, ...updates } : u
                ),
              }));
              showAlert('Channel Updated', 'Profile customizations saved!');
              navigate('channel', { id: route.params.id });
            }}
            onDeleteChannel={(delId) => {
              if (state.users.length <= 1) {
                showAlert('Cannot Delete', 'You must have at least one channel.');
                return;
              }
              if (confirm('Permanently delete this channel?')) {
                setState((prev) => ({
                  ...prev,
                  users: prev.users.filter((u) => u.id !== delId),
                  currentUserId:
                    prev.currentUserId === delId
                      ? prev.users.find((u) => u.id !== delId)!.id
                      : prev.currentUserId,
                }));
                showAlert('Channel Deleted', 'Channel was removed.');
                navigate('home');
              }
            }}
            onNavigate={navigate}
          />
        )}

        {route.name === 'playlist' && (
          <PlaylistView
            playlist={
              state.playlists.find((p) => p.id === route.params.id) ||
              state.playlists[0]
            }
            videos={state.videos}
            users={state.users}
            currentUser={currentUser}
            onNavigateVideo={(id) =>
              navigate('watch', { id, list: route.params.id })
            }
            onNavigateChannel={(id) => navigate('channel', { id })}
            onPlayAll={(pl) => {
              const firstVid = pl.videoIds[0] || state.videos[0]?.id;
              if (firstVid) navigate('watch', { id: firstVid, list: pl.id });
            }}
            onShufflePlay={(pl) => {
              const shuffled = [...pl.videoIds].sort(() => Math.random() - 0.5);
              const firstVid = shuffled[0] || state.videos[0]?.id;
              if (firstVid) navigate('watch', { id: firstVid, list: pl.id });
            }}
            onRemoveVideoFromPlaylist={(playlistId, videoId) => {
              setState((prev) => ({
                ...prev,
                playlists: prev.playlists.map((p) =>
                  p.id === playlistId
                    ? { ...p, videoIds: p.videoIds.filter((id) => id !== videoId) }
                    : p
                ),
              }));
              showAlert('Video Removed', 'Removed video from playlist.');
            }}
            onAddVideoToPlaylist={(playlistId, videoId) => {
              setState((prev) => ({
                ...prev,
                playlists: prev.playlists.map((p) =>
                  p.id === playlistId && !p.videoIds.includes(videoId)
                    ? { ...p, videoIds: [...p.videoIds, videoId] }
                    : p
                ),
              }));
              showAlert('Video Added 📁', 'Added video to playlist!');
            }}
            onReorderPlaylistVideo={(playlistId, fromIndex, toIndex) => {
              setState((prev) => ({
                ...prev,
                playlists: prev.playlists.map((p) => {
                  if (p.id === playlistId) {
                    const newIds = [...p.videoIds];
                    const [moved] = newIds.splice(fromIndex, 1);
                    newIds.splice(toIndex, 0, moved);
                    return { ...p, videoIds: newIds };
                  }
                  return p;
                }),
              }));
            }}
            onUpdatePlaylistDetails={(playlistId, name, description) => {
              setState((prev) => ({
                ...prev,
                playlists: prev.playlists.map((p) =>
                  p.id === playlistId ? { ...p, name, description } : p
                ),
              }));
              showAlert('Playlist Updated', 'Playlist details saved.');
            }}
            onDeletePlaylist={(playlistId) => {
              setState((prev) => ({
                ...prev,
                playlists: prev.playlists.filter((p) => p.id !== playlistId),
              }));
              showAlert('Playlist Deleted', 'Playlist was removed.');
              navigate('home');
            }}
            onOpenAdjustViews={(vid) => setActiveAdjustVideo(vid)}
          />
        )}

        {route.name === 'studio' && (
          <CreatorStudioView
            currentUser={currentUser}
            users={state.users}
            videos={state.videos}
            mcns={state.mcns || INITIAL_STATE.mcns || []}
            sponsorshipDeals={state.sponsorshipDeals || INITIAL_STATE.sponsorshipDeals || []}
            contentIdClaims={state.contentIdClaims || INITIAL_STATE.contentIdClaims || []}
            royaltyInvoices={state.royaltyInvoices || INITIAL_STATE.royaltyInvoices || []}
            navSoundsEnabled={state.settings.navSounds}
            onUpdateVideo={handleUpdateVideo}
            onDeleteVideo={handleDeleteVideo}
            onBulkUpdateVideos={handleBulkUpdateVideos}
            onOpenAdjustViews={(vid) => setActiveAdjustVideo(vid)}
            onSwitchUser={handleSwitchUser}
            onNavigate={navigate}
            onCreateMcn={handleCreateMcn}
            onUpdateMcn={handleUpdateMcn}
            onSignContract={handleSignMcnContract}
            onVoidContract={handleVoidMcnContract}
            onSendContractOffer={handleSendContractOffer}
            onClaimSponsorship={handleClaimSponsorship}
            onAssignSponsorshipChannel={handleAssignSponsorshipChannel}
            onAddContentIdClaim={handleAddContentIdClaim}
            onResolveContentIdClaim={handleResolveContentIdClaim}
            onRunMonthlyPayouts={handleRunMonthlyPayouts}
            onWithdrawVault={handleWithdrawVault}
            onAttachMusicToVideo={handleAttachMusicToVideo}
            onImportVideosToChannel={handleImportVideosToChannel}
            onUpdateChannelProfile={handleSyncChannelProfile}
            onOpenVideoAdSelector={(vid) => setActiveAdSelectorVideo(vid)}
            onOpenAnnotationsModal={(vid) => setActiveAnnotationsVideo(vid)}
          />
        )}

        {route.name === 'mcn' && (
          <McnSimulatorView
            currentUser={currentUser}
            users={state.users}
            videos={state.videos}
            mcns={state.mcns || INITIAL_STATE.mcns || []}
            sponsorshipDeals={state.sponsorshipDeals || INITIAL_STATE.sponsorshipDeals || []}
            contentIdClaims={state.contentIdClaims || INITIAL_STATE.contentIdClaims || []}
            royaltyInvoices={state.royaltyInvoices || INITIAL_STATE.royaltyInvoices || []}
            navSoundsEnabled={state.settings.navSounds}
            onCreateMcn={handleCreateMcn}
            onUpdateMcn={handleUpdateMcn}
            onSignContract={handleSignMcnContract}
            onVoidContract={handleVoidMcnContract}
            onSendContractOffer={handleSendContractOffer}
            onClaimSponsorship={handleClaimSponsorship}
            onAssignSponsorshipChannel={handleAssignSponsorshipChannel}
            onAddContentIdClaim={handleAddContentIdClaim}
            onResolveContentIdClaim={handleResolveContentIdClaim}
            onRunMonthlyPayouts={handleRunMonthlyPayouts}
            onWithdrawVault={handleWithdrawVault}
            onAttachMusicToVideo={handleAttachMusicToVideo}
            onNavigate={navigate}
          />
        )}

        {route.name === 'history' && (
          <HistoryView
            history={state.watchHistory || []}
            videos={state.videos}
            users={state.users}
            isHistoryPaused={!!state.historyPaused}
            offlineSavedVideoIds={state.offlineSavedVideoIds || []}
            onNavigateVideo={(id, startSec) => navigate('watch', { id, startSeconds: startSec })}
            onNavigateChannel={(chId) => navigate('channel', { id: chId })}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            onClearHistory={handleClearHistory}
            onTogglePauseHistory={handleTogglePauseHistory}
            onToggleOfflineSave={handleToggleOfflineSave}
          />
        )}

        {route.name === 'offline_vault' && (
          <OfflineVaultView
            offlineSavedVideoIds={state.offlineSavedVideoIds || []}
            videos={state.videos}
            users={state.users}
            isOnline={isOnline}
            onNavigateVideo={(id) => navigate('watch', { id })}
            onNavigateChannel={(chId) => navigate('channel', { id: chId })}
            onToggleOfflineSave={handleToggleOfflineSave}
            onSaveAllSpotlightOffline={handleSaveAllSpotlightOffline}
            onClearOfflineVault={handleClearOfflineVault}
          />
        )}
      </main>

      {/* Global Modals */}
      <SuperChatModal
        video={state.videos.find((v) => v.id === activeSuperChatVideoId) || null}
        currentUser={currentUser}
        onClose={() => setActiveSuperChatVideoId(null)}
        onSubmit={handleSubmitSuperChat}
      />

      <EmojiSizerModal
        src={activeEmojiSizerSrc}
        onClose={() => setActiveEmojiSizerSrc(null)}
      />

      <MembershipJoinModal
        channel={state.users.find((u) => u.id === activeJoinChannelId) || null}
        currentUser={currentUser}
        onClose={() => setActiveJoinChannelId(null)}
        onPurchase={handlePurchaseMembership}
      />

      <SubSpaceModal
        space={state.subSpaces.find((s) => s.id === managingSubSpaceId) || null}
        users={state.users}
        onClose={() => setManagingSubSpaceId(null)}
        onSave={(spaceId, subChannelIds) => {
          setState((prev) => ({
            ...prev,
            subSpaces: prev.subSpaces.map((s) =>
              s.id === spaceId ? { ...s, subChannelIds } : s
            ),
          }));
          setManagingSubSpaceId(null);
          showAlert('Subspace Updated', 'Folder members saved!');
        }}
        onDelete={(spaceId) => {
          setState((prev) => ({
            ...prev,
            subSpaces: prev.subSpaces.filter((s) => s.id !== spaceId),
          }));
          setManagingSubSpaceId(null);
          showAlert('Subspace Removed', 'Custom folder deleted.');
        }}
      />

      <AdjustViewsModal
        video={activeAdjustVideo}
        isOpen={!!activeAdjustVideo}
        onClose={() => setActiveAdjustVideo(null)}
        onSaveViews={handleSaveViews}
      />

      <AddToPlaylistModal
        video={activeAddToPlaylistVideo}
        playlists={state.playlists || []}
        isOpen={!!activeAddToPlaylistVideo}
        onClose={() => setActiveAddToPlaylistVideo(null)}
        onToggleVideoInPlaylist={handleToggleVideoInPlaylist}
        onCreatePlaylistWithVideo={(name, description, isPrivate, videoId) => {
          handleCreatePlaylist(name, description, isPrivate, videoId);
        }}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreatePlaylist={(name, description, isPrivate) => {
          handleCreatePlaylist(name, description, isPrivate, activeAddToPlaylistVideo?.id);
        }}
      />

      <GiphySearchModal
        isOpen={isGlobalGiphyOpen}
        onClose={() => setIsGlobalGiphyOpen(false)}
        initialQuery={globalGiphyInitialQuery}
        onSelectGif={(url) => {
          navigator.clipboard.writeText(`[gif:${url}]`);
          showAlert(
            'GIPHY Token Copied',
            `Copied [gif:${url}] to clipboard! You can paste it into any video comment or community post.`
          );
        }}
        targetContextDescription="RetroTube Live GIPHY Hub • Click any GIF to copy token, copy direct link, or view iframe embed"
      />

      <CreateChannelModal
        isOpen={isCreateChannelModalOpen || route.name === 'create_channel'}
        onClose={() => {
          setIsCreateChannelModalOpen(false);
          if (route.name === 'create_channel') {
            navigate('home');
          }
        }}
        currentUser={currentUser}
        existingUsers={state.users}
        onCreateChannel={handleCreateChannel}
      />

      <CustomAdManagerModal
        isOpen={isCustomAdModalOpen}
        onClose={() => setIsCustomAdModalOpen(false)}
        customAd={state.customAd || INITIAL_STATE.customAd!}
        videos={state.videos}
        onSave={handleSaveCustomAd}
        onTriggerTestAd={handleTriggerTestAd}
      />

      {activeAdSelectorVideo && (
        <VideoAdSelectorModal
          isOpen={!!activeAdSelectorVideo}
          video={activeAdSelectorVideo}
          globalAd={state.customAd || INITIAL_STATE.customAd}
          onClose={() => setActiveAdSelectorVideo(null)}
          onSave={handleSaveVideoAdConfig}
          onTriggerTestAd={() => {
            setActiveAdSelectorVideo(null);
            handleTriggerTestAd();
          }}
        />
      )}

      {activeAnnotationsVideo && (
        <AnnotationsModal
          isOpen={!!activeAnnotationsVideo}
          video={activeAnnotationsVideo}
          onClose={() => setActiveAnnotationsVideo(null)}
          onSaveAnnotations={handleSaveAnnotations}
          onNavigate={(routeName, params) => navigate(routeName, params)}
        />
      )}

      {activeCollabVideo && (
        <VideoCollabModal
          isOpen={!!activeCollabVideo}
          video={activeCollabVideo}
          users={state.users}
          currentUser={currentUser}
          onClose={() => setActiveCollabVideo(null)}
          onSaveCollab={handleSaveVideoCollaboration}
          onNavigateChannel={(chId) => navigate('channel', { id: chId })}
        />
      )}

      {/* Custom RetroTube Logo Studio Modal (GIF / PNG / SVG / Local Import) */}
      <CustomLogoModal
        isOpen={isCustomLogoModalOpen}
        onClose={() => setIsCustomLogoModalOpen(false)}
        globalSettings={state.globalSettings}
        onSaveLogo={handleSaveCustomLogo}
        onResetDefault={handleResetDefaultLogo}
      />

      {/* Reset Default State Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={handleExecuteResetDefaultState}
      />

      {/* Nostalgic Data Persistence Footer */}
      <footer className="bg-[#f1f1f1] border-t border-[#ccc] py-4 text-center text-xs text-gray-600 select-none mt-10">
        <div className="max-w-[1040px] mx-auto px-4 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="btn text-xs py-0.5 px-2.5 font-bold bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>📺</span>
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}</span>
            </button>
            <span className="text-gray-300">|</span>
            <span className="font-bold">Data Persistence:</span>
            <span>Saved to browser local memory automatically.</span>
            <button
              type="button"
              onClick={exportStateJson}
              className="btn text-xs py-0.5 px-2 cursor-pointer font-medium"
            >
              Export State (JSON)
            </button>
            <label className="btn text-xs py-0.5 px-2 cursor-pointer font-medium">
              <span>Import State (JSON)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importStateJson}
              />
            </label>
            <button
              type="button"
              onClick={handleOpenResetModal}
              className="btn text-xs py-0.5 px-2.5 font-bold text-red-700 bg-red-50 hover:bg-red-100 border-red-300 cursor-pointer shadow-2xs flex items-center gap-1"
              title="Reset entire RetroTube platform to fresh 2011 defaults"
            >
              <span>🔄</span>
              <span>Reset Default State</span>
            </button>
          </div>
          <div className="text-[10px] text-gray-500">
            RetroTube Engine • Golden Era YouTube Experience • Offline Ready • 1080p HD Streaming & Variable Playback Speeds
          </div>
        </div>
      </footer>

      {/* Offline Mode Indicator */}
      <OfflineIndicator
        onNavigateOfflineVault={() => navigate('offline_vault')}
        savedVideoCount={(state.offlineSavedVideoIds || []).length}
      />
    </div>
  );
}
