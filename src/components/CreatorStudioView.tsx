import React, { useState, useEffect } from 'react';
import {
  User,
  Video,
  McnNetwork,
  McnSponsorshipDeal,
  ContentIdClaim,
  McnRoyaltyInvoice,
} from '../types';
import { McnSimulatorView } from './McnSimulatorView';
import { playIEClick, playCashRegister } from '../utils/audio';
import { resolveYouTubeChannelMetadata } from '../utils/youtubeChannelResolver';
import { extractYouTubeId } from '../utils/youtube';

interface CreatorStudioViewProps {
  currentUser: User;
  users: User[];
  videos: Video[];
  mcns: McnNetwork[];
  sponsorshipDeals: McnSponsorshipDeal[];
  contentIdClaims: ContentIdClaim[];
  royaltyInvoices: McnRoyaltyInvoice[];
  navSoundsEnabled?: boolean;
  onUpdateVideo: (videoId: string, updates: Partial<Video>) => void;
  onDeleteVideo: (videoId: string) => void;
  onBulkUpdateVideos: (videoIds: string[], updates: Partial<Video>) => void;
  onOpenAdjustViews: (video: Video) => void;
  onSwitchUser: (userId: string) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
  // MCN handlers
  onCreateMcn: (newMcn: McnNetwork) => void;
  onUpdateMcn: (mcnId: string, updates: Partial<McnNetwork>) => void;
  onSignContract: (channelId: string, mcnId: string) => void;
  onVoidContract: (channelId: string) => void;
  onSendContractOffer: (channelId: string, mcnId: string, signBonus: number) => void;
  onClaimSponsorship: (dealId: string, mcnId: string) => void;
  onAssignSponsorshipChannel: (dealId: string, channelId: string) => void;
  onAddContentIdClaim: (claim: Omit<ContentIdClaim, 'id'>) => void;
  onResolveContentIdClaim: (claimId: string, action: 'release' | 'uphold') => void;
  onRunMonthlyPayouts: (mcnId: string) => void;
  onWithdrawVault: (mcnId: string, amount: number) => void;
  onAttachMusicToVideo: (videoId: string, trackTitle: string) => void;
  onImportVideosToChannel?: (channelId: string, newVideos: Array<Partial<Video>>) => void;
  onUpdateChannelProfile?: (channelId: string, updates: Partial<User>) => void;
  onOpenVideoAdSelector?: (video: Video) => void;
  onOpenAnnotationsModal?: (video: Video) => void;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  currentUser,
  users,
  videos,
  mcns,
  sponsorshipDeals,
  contentIdClaims,
  royaltyInvoices,
  navSoundsEnabled = true,
  onUpdateVideo,
  onDeleteVideo,
  onBulkUpdateVideos,
  onOpenAdjustViews,
  onSwitchUser,
  onNavigate,
  onCreateMcn,
  onUpdateMcn,
  onSignContract,
  onVoidContract,
  onSendContractOffer,
  onClaimSponsorship,
  onAssignSponsorshipChannel,
  onAddContentIdClaim,
  onResolveContentIdClaim,
  onRunMonthlyPayouts,
  onWithdrawVault,
  onAttachMusicToVideo,
  onImportVideosToChannel,
  onUpdateChannelProfile,
  onOpenVideoAdSelector,
  onOpenAnnotationsModal,
}) => {
  // Navigation tabs: 'dashboard' | 'video_manager' | 'analytics' | 'live_studio' | 'comments' | 'mcn_hub' | 'yt_sync'
  const [studioTab, setStudioTab] = useState<string>('dashboard');

  // YouTube Channel Sync & Import state
  const [ytSyncUrl, setYtSyncUrl] = useState(currentUser.youtubeChannelUrl || '');
  const [isSyncingStudioYt, setIsSyncingStudioYt] = useState(false);
  const [studioSyncMsg, setStudioSyncMsg] = useState<string | null>(null);
  const [customSingleYtInput, setCustomSingleYtInput] = useState('');
  const [channelMetaPreview, setChannelMetaPreview] = useState<{
    channelName: string;
    avatarUrl: string;
    bio: string;
    subscribers: number;
    videoCount: number;
    bannerUrl?: string;
    handle?: string;
    channelId?: string;
    url?: string;
  } | null>(null);

  const handleInspectYouTubeChannel = async (query: string) => {
    if (!query.trim()) return;
    setIsSyncingStudioYt(true);
    setStudioSyncMsg('Inspecting official YouTube channel metadata & bio...');
    try {
      const res = await resolveYouTubeChannelMetadata(query.trim());
      setChannelMetaPreview({
        channelName: res.name,
        avatarUrl: res.avatarUrl,
        bio: res.bio,
        subscribers: res.subscribers,
        videoCount: res.videos.length,
        bannerUrl: res.bannerUrl,
        handle: res.handle,
        channelId: res.channelId,
        url: res.url,
      });
      setStudioSyncMsg(`Found verified channel "${res.name}" with real profile photo, bio, and ${res.videos.length} videos detected.`);
    } catch {
      setStudioSyncMsg('Could not fetch channel metadata. Please check URL or username.');
    } finally {
      setIsSyncingStudioYt(false);
    }
  };

  const handleApplyProfileToChannel = () => {
    if (!channelMetaPreview || !onUpdateChannelProfile) return;
    onUpdateChannelProfile(currentUser.id, {
      avatarBase64: channelMetaPreview.avatarUrl,
      bio: channelMetaPreview.bio,
      subscribers: channelMetaPreview.subscribers,
      bannerBase64: channelMetaPreview.bannerUrl || currentUser.bannerBase64,
      youtubeChannelHandle: channelMetaPreview.handle || currentUser.youtubeChannelHandle,
      youtubeChannelId: channelMetaPreview.channelId || currentUser.youtubeChannelId,
      youtubeChannelUrl: channelMetaPreview.url || currentUser.youtubeChannelUrl,
    });
    setStudioSyncMsg(`✨ Applied official YouTube avatar profile photo and bio to ${currentUser.username}!`);
    playCashRegister(navSoundsEnabled);
  };

  const handleStudioSyncEverything = async () => {
    setIsSyncingStudioYt(true);
    setStudioSyncMsg('Fetching YouTube metadata for full channel & video sync...');
    try {
      const query = ytSyncUrl || currentUser.youtubeChannelHandle || currentUser.username;
      const res = await resolveYouTubeChannelMetadata(query);

      // 1. Update Profile (Avatar, Bio, Banner, Subs)
      if (onUpdateChannelProfile) {
        onUpdateChannelProfile(currentUser.id, {
          avatarBase64: res.avatarUrl,
          bio: res.bio,
          subscribers: res.subscribers,
          bannerBase64: res.bannerUrl || currentUser.bannerBase64,
          youtubeChannelHandle: res.handle,
          youtubeChannelId: res.channelId || currentUser.youtubeChannelId,
          youtubeChannelUrl: res.url || currentUser.youtubeChannelUrl,
        });
      }

      // 2. Import missing videos
      let importedCount = 0;
      if (res.videos.length > 0 && onImportVideosToChannel) {
        const existingYtIds = new Set(channelVideos.map((v) => v.youtubeId).filter(Boolean));
        const missing = res.videos.filter((v) => !existingYtIds.has(v.youtubeId));
        if (missing.length > 0) {
          onImportVideosToChannel(currentUser.id, missing);
          importedCount = missing.length;
        }
      }

      setChannelMetaPreview({
        channelName: res.name,
        avatarUrl: res.avatarUrl,
        bio: res.bio,
        subscribers: res.subscribers,
        videoCount: res.videos.length,
        bannerUrl: res.bannerUrl,
        handle: res.handle,
        channelId: res.channelId,
        url: res.url,
      });

      setStudioSyncMsg(
        `✨ Full Channel Sync Complete: Updated profile photo, native bio description, and imported ${importedCount} new video(s)!`
      );
      playCashRegister(navSoundsEnabled);
    } catch {
      setStudioSyncMsg('Could not fetch YouTube metadata gateway.');
    } finally {
      setIsSyncingStudioYt(false);
    }
  };

  const handleStudioSyncAllVideos = async () => {
    setIsSyncingStudioYt(true);
    setStudioSyncMsg('Querying YouTube gateway for channel uploads...');
    try {
      const query = ytSyncUrl || currentUser.youtubeChannelHandle || currentUser.username;
      const res = await resolveYouTubeChannelMetadata(query);
      if (res.videos.length > 0 && onImportVideosToChannel) {
        const existingYtIds = new Set(channelVideos.map((v) => v.youtubeId).filter(Boolean));
        const missing = res.videos.filter((v) => !existingYtIds.has(v.youtubeId));
        if (missing.length > 0) {
          onImportVideosToChannel(currentUser.id, missing);
          setStudioSyncMsg(`✨ Successfully imported all ${missing.length} new videos from official YouTube catalog into Video Manager!`);
          playCashRegister(navSoundsEnabled);
        } else {
          setStudioSyncMsg(`All ${res.videos.length} videos from the official YouTube catalog are already imported.`);
        }
      } else {
        setStudioSyncMsg('Checked gateway: No additional uploads found.');
      }
    } catch {
      setStudioSyncMsg('Could not fetch YouTube metadata gateway.');
    } finally {
      setIsSyncingStudioYt(false);
    }
  };

  const handleImportSingleYtVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = extractYouTubeId(customSingleYtInput.trim());
    if (!rawId) {
      setStudioSyncMsg('⚠️ Invalid YouTube URL or video ID format.');
      return;
    }
    if (onImportVideosToChannel) {
      onImportVideosToChannel(currentUser.id, [
        {
          title: `YouTube Stream (${rawId})`,
          desc: `Imported via Creator Studio from https://www.youtube.com/watch?v=${rawId}`,
          youtubeId: rawId,
          thumb: `https://img.youtube.com/vi/${rawId}/hqdefault.jpg`,
          views: Math.floor(Math.random() * 8000) + 250,
          time: '4:20',
          category: currentUser.topic || 'Entertainment',
        },
      ]);
      setStudioSyncMsg(`✅ Video [${rawId}] successfully imported into your Studio Video Manager!`);
      setCustomSingleYtInput('');
      playCashRegister(navSoundsEnabled);
    }
  };

  // Video Manager search & bulk selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'monetized' | 'claimed'>('all');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Live Stream Studio Simulator state
  const [isLive, setIsLive] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);
  const [streamTitle, setStreamTitle] = useState(`${currentUser.username}'s Friday Retro Broadcast`);
  const [streamCategory, setStreamCategory] = useState('Gaming');
  const [streamKey] = useState(`live_retro_${Math.random().toString(36).substring(2, 10)}`);
  const [liveViewers, setLiveViewers] = useState(148);
  const [liveChatMessages, setLiveChatMessages] = useState<
    Array<{ id: string; user: string; text: string; isSuperChat?: boolean; amount?: number }>
  >([
    { id: '1', user: 'xX_GamerPro_Xx', text: 'FIRST! Lets gooo!' },
    { id: '2', user: 'HaloReachFan09', text: 'Quality looks insane in 1080p!' },
    { id: '3', user: 'CreeperSlayer', text: 'Are you partnering with Machinima?' },
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  // Channel videos filter
  const channelVideos = videos.filter((v) => v.authorId === currentUser.id);
  const totalViews = channelVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const currentMcn = mcns.find((m) => m.id === currentUser.activeContract);
  const estimatedCpm = (2.2 * (currentMcn?.cpmMultiplier || 1.0)).toFixed(2);
  const estimatedPartnerEarnings = ((totalViews / 1000) * parseFloat(estimatedCpm) * ((currentMcn?.splitPercentage || 70) / 100)).toFixed(2);

  // Live stream timer effect
  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        setLiveDuration((prev) => prev + 1);
        // Random viewer count fluctuation
        setLiveViewers((prev) => Math.max(20, prev + Math.floor(Math.random() * 11) - 5));

        // Periodic simulated chat
        if (Math.random() > 0.65) {
          const vintageChatters = [
            'N00bMaster2010',
            'Windows7User',
            'VlogSquad99',
            'FrapsRecorder',
            'SonyVegasEditor',
            'RunescapeKing',
          ];
          const vintageComments = [
            'unregistered hypercam 2 haha',
            'Sub for sub bro?',
            'What song is this?',
            'Nice play!!',
            'Can you do a tutorial on Sony Vegas?',
            'Greetings from Sweden!',
            'Machinima Respawn brought me here!',
          ];
          const randomUser = vintageChatters[Math.floor(Math.random() * vintageChatters.length)];
          const randomText = vintageComments[Math.floor(Math.random() * vintageComments.length)];

          setLiveChatMessages((msgs) => [
            ...msgs.slice(-25),
            { id: Date.now().toString(), user: randomUser, text: randomText },
          ]);
        }
      }, 1000);
    } else {
      setLiveDuration(0);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  // Video selection helpers
  const handleToggleSelectVideo = (id: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const handleSelectAllVideos = () => {
    if (selectedVideoIds.length === filteredVideos.length) {
      setSelectedVideoIds([]);
    } else {
      setSelectedVideoIds(filteredVideos.map((v) => v.id));
    }
  };

  const filteredVideos = channelVideos.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterVisibility === 'monetized') return v.isMonetized !== false;
    if (filterVisibility === 'claimed') return v.contentIdStatus === 'claimed';
    return true;
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-[1060px] mx-auto p-3 sm:p-5 select-none text-xs space-y-4">
      {/* 2011 YouTube Creator Studio Header */}
      <div className="bg-linear-to-b from-[#f9f9f9] to-[#ececec] border border-[#ccc] rounded p-3 shadow-2xs flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded border border-gray-400 overflow-hidden bg-neutral-900 flex items-center justify-center font-bold text-white text-base">
            {currentUser.avatarBase64 ? (
              <img
                src={currentUser.avatarBase64}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{currentUser.username[0]?.toUpperCase()}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-gray-900">
                {currentUser.username} Studio
              </h1>
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-2xs">
                CREATOR HUB
              </span>
              {currentMcn && (
                <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                  [{currentMcn.tag}] Partner
                </span>
              )}
            </div>
            <p className="text-gray-500 text-[11px]">
              {currentUser.subscribers.toLocaleString()} subscribers • {totalViews.toLocaleString()} channel views • Wallet: ${(currentUser.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Studio Channel Switcher & Actions */}
        <div className="flex items-center gap-2">
          <label className="font-bold text-gray-600 text-xs">Switch Channel:</label>
          <select
            value={currentUser.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="btn btn-primary text-xs py-1.5 px-3 font-bold cursor-pointer"
          >
            ➕ Upload Video
          </button>
          <button
            type="button"
            onClick={() => onNavigate('channel', { id: currentUser.id })}
            className="btn text-xs py-1.5 px-3 font-bold"
          >
            📺 View Public Channel
          </button>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-1">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📈' },
          { id: 'video_manager', label: `📼 Video Manager (${channelVideos.length})`, icon: '🎬' },
          { id: 'yt_sync', label: '📺 YouTube Channel Sync & Import', icon: '📺' },
          { id: 'analytics', label: '📈 Insight Analytics', icon: '📊' },
          { id: 'live_studio', label: '🔴 Live Stream Studio', icon: '📡' },
          { id: 'comments', label: '💬 Comments & Community', icon: '🗨️' },
          { id: 'mcn_hub', label: `🏢 MCN Network Headquarters ${currentMcn ? `[${currentMcn.tag}]` : ''}`, icon: '🤝' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStudioTab(tab.id);
              playIEClick(navSoundsEnabled);
            }}
            className={`px-3 py-1.5 rounded-t text-xs font-bold transition-all cursor-pointer ${
              studioTab === tab.id
                ? 'bg-white border border-gray-300 border-b-white text-red-700 shadow-2xs -mb-[2px] z-10'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STUDIO DASHBOARD */}
      {studioTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs">
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Lifetime Views</span>
              <strong className="text-lg font-black text-gray-900">{totalViews.toLocaleString()}</strong>
              <span className="text-[10px] text-green-700 font-bold block mt-0.5">↑ +14.2% this month</span>
            </div>

            <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs">
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Subscribers</span>
              <strong className="text-lg font-black text-gray-900">{currentUser.subscribers.toLocaleString()}</strong>
              <span className="text-[10px] text-blue-700 font-bold block mt-0.5">Verified Creator</span>
            </div>

            <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs">
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Est. Partner Revenue</span>
              <strong className="text-lg font-black text-green-700">${estimatedPartnerEarnings}</strong>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {currentMcn ? `${currentMcn.name} (${currentMcn.splitPercentage}%)` : 'Free Agent Rate'}
              </span>
            </div>

            <div className="bg-white border border-gray-300 rounded p-3 shadow-2xs">
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Average CPM</span>
              <strong className="text-lg font-black text-amber-700">${estimatedCpm}</strong>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {currentMcn ? `${currentMcn.cpmMultiplier}x MCN Multiplier` : '1.0x Base Rate'}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-yellow-50/80 border border-yellow-300 rounded p-3 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <div>
                <strong className="text-xs text-yellow-950 font-bold">Studio Quick Launch:</strong>
                <span className="text-xs text-yellow-900 ml-1">Accelerate channel growth and monetize your content.</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStudioTab('live_studio')}
                className="btn text-xs py-1 px-2.5 font-bold bg-white text-red-700 border-red-300 hover:bg-red-50"
              >
                🔴 Go Live Control Room
              </button>
              <button
                type="button"
                onClick={() => setStudioTab('mcn_hub')}
                className="btn text-xs py-1 px-2.5 font-bold bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                🏢 MCN Network Simulator
              </button>
              <button
                type="button"
                onClick={() => onNavigate('edit_channel', { id: currentUser.id })}
                className="btn text-xs py-1 px-2.5 font-bold"
              >
                🎨 Customizer Theme
              </button>
            </div>
          </div>

          {/* Top Performing Videos Widget */}
          <div className="bg-white border border-gray-300 rounded p-3.5 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                Top Performing Uploads on {currentUser.username}
              </h3>
              <button
                type="button"
                onClick={() => setStudioTab('video_manager')}
                className="text-blue-700 hover:underline font-bold text-xs"
              >
                View all in Video Manager →
              </button>
            </div>

            {channelVideos.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No uploads found on this channel. Click &quot;Upload Video&quot; to publish your first broadcast!
              </div>
            ) : (
              <div className="space-y-2">
                {channelVideos.slice(0, 4).map((vid) => (
                  <div
                    key={vid.id}
                    className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded border overflow-hidden bg-black flex-shrink-0 relative">
                        <img src={vid.thumb} alt={vid.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] font-mono px-1">
                          {vid.time}
                        </span>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => onNavigate('watch', { id: vid.id })}
                          className="font-bold text-xs text-blue-800 hover:underline text-left block"
                        >
                          {vid.title}
                        </button>
                        <span className="text-[10px] text-gray-500">
                          {vid.views.toLocaleString()} views • {vid.comments.length} comments • {vid.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenAdjustViews(vid)}
                        className="btn text-xs py-0.5 px-2 text-amber-800 font-bold bg-amber-50 border-amber-300 hover:bg-amber-100"
                        title="Adjust Views & Ratings in God Mode"
                      >
                        ⚡ Boost Views
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('edit_video', { id: vid.id })}
                        className="btn text-xs py-0.5 px-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2011 RetroTube Community & Bulletin News */}
          <div className="bg-white border border-gray-300 rounded p-3.5 shadow-2xs space-y-2">
            <h4 className="font-bold text-xs text-gray-800 border-b pb-1">
              📰 RetroTube Creator Announcements (Fall 2011)
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>New MCN Simulator Released:</strong> You can now establish custom partner networks, sign creators, and claim brand sponsorship bonuses.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Full 1080p60 Remasters Supported:</strong> Ensure your video stream IDs are tagged with high-bitrate settings in the Video Manager.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Content ID Enforcement:</strong> Original audio registered by Machinima, Maker Studios, and Indie MCNs will automatically claim ad revenue.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: VIDEO MANAGER */}
      {studioTab === 'video_manager' && (
        <div className="bg-white border border-gray-300 rounded p-3.5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                📼 Video Manager ({channelVideos.length} Uploads)
              </h3>
              <p className="text-xs text-gray-500">
                Manage your channel catalogue, perform bulk operations, adjust monetization, and check copyright claim status.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search uploads by title..."
                className="text-xs p-1.5 border border-gray-300 rounded bg-white w-full sm:w-48"
              />

              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as any)}
                className="text-xs p-1.5 border border-gray-300 rounded bg-white font-bold"
              >
                <option value="all">All Uploads</option>
                <option value="monetized">Monetized Only ($)</option>
                <option value="claimed">Content ID Claimed</option>
              </select>
            </div>
          </div>

          {/* Bulk Operations Bar */}
          {selectedVideoIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-300 rounded p-2 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div className="font-bold text-blue-900">
                Selected {selectedVideoIds.length} of {filteredVideos.length} videos:
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onBulkUpdateVideos(selectedVideoIds, { isMonetized: true });
                    playCashRegister(navSoundsEnabled);
                  }}
                  className="btn text-xs py-0.5 px-2 bg-white text-green-800 font-bold border-green-300 hover:bg-green-50"
                >
                  💵 Monetize On ($)
                </button>
                <button
                  type="button"
                  onClick={() => onBulkUpdateVideos(selectedVideoIds, { isMonetized: false })}
                  className="btn text-xs py-0.5 px-2 bg-white text-gray-700 hover:bg-gray-100"
                >
                  Turn Off Ads
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Boost each selected video by +10,000 views
                    selectedVideoIds.forEach((vId) => {
                      const v = videos.find((item) => item.id === vId);
                      if (v) onUpdateVideo(vId, { views: v.views + 10000 });
                    });
                    playCashRegister(navSoundsEnabled);
                  }}
                  className="btn text-xs py-0.5 px-2 bg-amber-50 text-amber-900 font-bold border-amber-300 hover:bg-amber-100"
                >
                  ⚡ +10K Views Each
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${selectedVideoIds.length} selected videos permanently?`)) {
                      selectedVideoIds.forEach((vId) => onDeleteVideo(vId));
                      setSelectedVideoIds([]);
                    }
                  }}
                  className="btn text-xs py-0.5 px-2 text-red-700 border-red-300 hover:bg-red-50 font-bold"
                >
                  Delete Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVideoIds([])}
                  className="text-gray-500 hover:underline ml-1"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Videos Table */}
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="p-2 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredVideos.length > 0 &&
                        selectedVideoIds.length === filteredVideos.length
                      }
                      onChange={handleSelectAllVideos}
                    />
                  </th>
                  <th className="p-2">Video</th>
                  <th className="p-2">Visibility</th>
                  <th className="p-2">Monetization</th>
                  <th className="p-2">Copyright</th>
                  <th className="p-2">Views</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((vid) => {
                  const isSelected = selectedVideoIds.includes(vid.id);
                  const isMonetized = vid.isMonetized !== false;
                  const isClaimed = vid.contentIdStatus === 'claimed';

                  return (
                    <tr
                      key={vid.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectVideo(vid.id)}
                        />
                      </td>

                      <td className="p-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-14 h-9 rounded border overflow-hidden bg-black relative flex-shrink-0">
                            <img src={vid.thumb} alt={vid.title} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] font-mono px-0.5">
                              {vid.time}
                            </span>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => onNavigate('watch', { id: vid.id })}
                              className="font-bold text-gray-900 hover:text-blue-700 hover:underline text-left block"
                            >
                              {vid.title}
                            </button>
                            <span className="text-[10px] text-gray-500">
                              Uploaded {vid.date} • {vid.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-2">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Public
                        </span>
                      </td>

                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateVideo(vid.id, { isMonetized: !isMonetized });
                            playCashRegister(navSoundsEnabled);
                          }}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                            isMonetized
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-500 border border-gray-300'
                          }`}
                          title="Toggle video monetization"
                        >
                          {isMonetized ? 'Monetized ($)' : 'Disabled'}
                        </button>
                      </td>

                      <td className="p-2">
                        {isClaimed ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Claimed
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Clean ✓
                          </span>
                        )}
                      </td>

                      <td className="p-2 font-bold text-gray-800">
                        {vid.views.toLocaleString()}
                      </td>

                      <td className="p-2 text-amber-500 font-bold">
                        ★ {(vid.ratingSum / Math.max(1, vid.ratingCount)).toFixed(1)}
                      </td>

                      <td className="p-2 text-right space-x-1 whitespace-nowrap">
                        {onOpenVideoAdSelector && (
                          <button
                            type="button"
                            onClick={() => onOpenVideoAdSelector(vid)}
                            className="btn text-xs py-0.5 px-2 font-bold bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                            title="Select specific ad video or toggle ads for this video"
                          >
                            🟡 Ad
                          </button>
                        )}
                        {onOpenAnnotationsModal && (
                          <button
                            type="button"
                            onClick={() => onOpenAnnotationsModal(vid)}
                            className="btn text-xs py-0.5 px-2 font-bold bg-red-50 text-red-900 border-red-300 hover:bg-red-100"
                            title="Manage classic annotations for this video"
                          >
                            💬 Annotations
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAdjustViews(vid)}
                          className="btn text-xs py-0.5 px-2 text-amber-800 font-bold bg-amber-50 border-amber-300"
                          title="Boost Views (God Mode)"
                        >
                          ⚡ Boost
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('edit_video', { id: vid.id })}
                          className="btn text-xs py-0.5 px-2 font-bold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INSIGHT ANALYTICS */}
      {studioTab === 'analytics' && (
        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-5">
          <div className="border-b pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                📈 Insight Channel Analytics (2011 View Engine)
              </h3>
              <p className="text-xs text-gray-500">
                Deep performance breakdown: retention trends, traffic origins, operating system bandwidth, and monetization CPM.
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded border border-gray-300">
              Period: Last 30 Days
            </span>
          </div>

          {/* Graphical Representation of Views & Revenue */}
          <div className="bg-gray-50 border border-gray-300 rounded p-3 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>Estimated Daily Views (30-Day Curve)</span>
              <span className="text-green-700 font-mono">Peak: 48,200 views/day</span>
            </div>

            {/* Retro Bar Chart */}
            <div className="h-32 flex items-end gap-1.5 pt-4 px-2 border-b border-gray-300">
              {[
                32, 45, 60, 52, 70, 65, 80, 75, 95, 88, 110, 105, 120, 115, 135,
                142, 130, 160, 155, 175, 168, 190, 185, 210, 205, 230, 245, 260, 275, 290
              ].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-linear-to-t from-red-700 to-red-500 rounded-t hover:opacity-80 transition-opacity cursor-pointer relative group"
                  style={{ height: `${(val / 300) * 100}%` }}
                >
                  <div className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-mono px-1 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    Day {idx + 1}: {(val * 160).toLocaleString()} views
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Day 1 (Aug 21)</span>
              <span>Day 15</span>
              <span>Day 30 (Today)</span>
            </div>
          </div>

          {/* Traffic Sources & Technology Breakdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Traffic Sources */}
            <div className="bg-white border rounded p-3 space-y-2">
              <h4 className="font-bold text-xs text-gray-800 border-b pb-1">
                🌐 Top Traffic Sources
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>RetroTube Search</span>
                    <span className="font-bold">44%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-red-600 h-full w-[44%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Suggested / Related Videos</span>
                    <span className="font-bold">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-blue-600 h-full w-[32%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>External (MSN, Forums, AIM)</span>
                    <span className="font-bold">16%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-amber-500 h-full w-[16%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Direct Links & Bookmarks</span>
                    <span className="font-bold">8%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-gray-500 h-full w-[8%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Operating System Demographics */}
            <div className="bg-white border rounded p-3 space-y-2">
              <h4 className="font-bold text-xs text-gray-800 border-b pb-1">
                💻 Audience Operating Systems
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Windows XP</span>
                    <span className="font-bold">52%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-blue-500 h-full w-[52%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Windows 7 (Aero Glass)</span>
                    <span className="font-bold">34%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-cyan-500 h-full w-[34%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Mac OS X Snow Leopard</span>
                    <span className="font-bold">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-purple-500 h-full w-[10%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>Linux / Other</span>
                    <span className="font-bold">4%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-green-600 h-full w-[4%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Resolution Stats */}
            <div className="bg-white border rounded p-3 space-y-2">
              <h4 className="font-bold text-xs text-gray-800 border-b pb-1">
                📺 Stream Resolution Quality
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>360p Standard Flash</span>
                    <span className="font-bold">48%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-amber-600 h-full w-[48%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>720p HD</span>
                    <span className="font-bold">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-green-600 h-full w-[32%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600">
                    <span>1080p Full HD</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[20%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE BROADCAST CONTROL ROOM */}
      {studioTab === 'live_studio' && (
        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-4">
          <div className="border-b pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <span className="text-red-600 text-base">🔴</span>
                <span>Live Broadcast Studio Control Room</span>
              </h3>
              <p className="text-xs text-gray-500">
                Simulate broadcasting live to the world! Set stream credentials, monitor incoming real-time chat, and trigger simulated Super Chat tips.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLive(!isLive);
                  playIEClick(navSoundsEnabled);
                }}
                className={`btn text-xs py-1.5 px-4 font-bold shadow-2xs ${
                  isLive
                    ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                    : 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                }`}
              >
                {isLive ? '⏹️ End Broadcast' : '🔴 Go Live On Air'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stream Settings & Ingest */}
            <div className="md:col-span-2 space-y-3">
              <div className="bg-neutral-900 text-white rounded p-4 aspect-video flex flex-col justify-between relative overflow-hidden border border-neutral-700">
                {isLive ? (
                  <>
                    <div className="flex justify-between items-center z-10">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded animate-pulse">
                          LIVE ON AIR
                        </span>
                        <span className="text-gray-300 font-mono text-xs">
                          {formatDuration(liveDuration)}
                        </span>
                      </div>
                      <span className="bg-black/70 text-white font-bold text-xs px-2 py-0.5 rounded">
                        👥 {liveViewers.toLocaleString()} Watching
                      </span>
                    </div>

                    <div className="text-center my-auto">
                      <h2 className="text-base font-black text-white">{streamTitle}</h2>
                      <span className="text-gray-400 text-xs">{streamCategory} Broadcast</span>
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono bg-black/50 p-1 rounded z-10">
                      Bitrate: 4,500 kbps • Audio: 128 kbps AAC • Encoder: Open Broadcaster (OBS)
                    </div>
                  </>
                ) : (
                  <div className="m-auto text-center space-y-2">
                    <span className="text-3xl">📡</span>
                    <h3 className="font-bold text-sm text-gray-300">Broadcast is currently Offline</h3>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Configure your stream settings below and click &quot;Go Live On Air&quot; to begin streaming.
                    </p>
                  </div>
                )}
              </div>

              {/* Stream Parameters Form */}
              <div className="bg-gray-50 border border-gray-300 rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stream Broadcast Title:</label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="w-full text-xs p-1.5 border rounded bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stream Category:</label>
                  <select
                    value={streamCategory}
                    onChange={(e) => setStreamCategory(e.target.value)}
                    className="w-full text-xs p-1.5 border rounded bg-white font-bold"
                  >
                    <option value="Gaming">Gaming & Machinima</option>
                    <option value="Entertainment">Entertainment & Vlogs</option>
                    <option value="Music">Live Concert / Music</option>
                    <option value="Tech">Tech & Retro Computing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">RTMP Server Ingest URL:</label>
                  <input
                    type="text"
                    readOnly
                    value="rtmp://a.rtmp.retrotube.com/live2"
                    className="w-full text-xs p-1.5 border rounded bg-gray-100 font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stream Key (Keep Secret):</label>
                  <input
                    type="text"
                    readOnly
                    value={streamKey}
                    className="w-full text-xs p-1.5 border rounded bg-gray-100 font-mono text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Live Chat Simulator */}
            <div className="bg-white border border-gray-300 rounded flex flex-col h-[400px]">
              <div className="p-2 border-b bg-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-xs">💬 Live Stream Chat</span>
                <span className="text-[10px] text-green-700 font-bold">
                  {isLive ? 'Connected' : 'Waiting...'}
                </span>
              </div>

              <div className="flex-1 p-2 overflow-y-auto space-y-1.5 text-[11px]">
                {liveChatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-1 rounded leading-tight ${
                      msg.isSuperChat
                        ? 'bg-amber-100 border border-amber-300 text-amber-900 font-bold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <strong className="text-gray-900 mr-1">{msg.user}:</strong>
                    <span>{msg.text}</span>
                    {msg.isSuperChat && (
                      <span className="text-green-800 font-extrabold ml-1">
                        [Tipped ${msg.amount?.toFixed(2)}]
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input & Simulated Super Chat Button */}
              <div className="p-2 border-t bg-gray-50 space-y-1.5">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newChatInput.trim()) {
                        setLiveChatMessages((prev) => [
                          ...prev,
                          { id: Date.now().toString(), user: currentUser.username, text: newChatInput.trim() },
                        ]);
                        setNewChatInput('');
                      }
                    }}
                    placeholder="Send a live chat message..."
                    className="flex-1 text-xs p-1 border rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newChatInput.trim()) return;
                      setLiveChatMessages((prev) => [
                        ...prev,
                        { id: Date.now().toString(), user: currentUser.username, text: newChatInput.trim() },
                      ]);
                      setNewChatInput('');
                    }}
                    className="btn text-xs py-1 px-2 font-bold"
                  >
                    Send
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const tipAmts = [5, 10, 25, 50];
                    const randomTip = tipAmts[Math.floor(Math.random() * tipAmts.length)];
                    setLiveChatMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        user: 'SuperFan_2011',
                        text: `Hyped for this stream! Keep up the awesome work!`,
                        isSuperChat: true,
                        amount: randomTip,
                      },
                    ]);
                    playCashRegister(navSoundsEnabled);
                  }}
                  className="w-full btn text-xs py-1 text-green-800 font-bold bg-green-50 border-green-300 hover:bg-green-100"
                >
                  💸 Simulate Viewer Super Chat ($Tip)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMENTS & COMMUNITY MODERATION */}
      {studioTab === 'comments' && (
        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-4">
          <div className="border-b pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                💬 Comments & Community Moderation
              </h3>
              <p className="text-xs text-gray-500">
                Manage incoming feedback across all channel uploads. Heart viewer favorites, pin discussions, or remove unwanted spam.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {channelVideos.flatMap((v) =>
              v.comments.map((c) => ({
                comment: c,
                videoTitle: v.title,
                videoId: v.id,
              }))
            ).length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No comments on this channel yet.
              </div>
            ) : (
              channelVideos
                .flatMap((v) =>
                  v.comments.map((c) => ({
                    comment: c,
                    videoTitle: v.title,
                    videoId: v.id,
                  }))
                )
                .map(({ comment, videoTitle, videoId }) => (
                  <div
                    key={comment.id}
                    className="p-3 border border-gray-200 rounded hover:bg-gray-50 flex justify-between items-start gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-gray-900">
                          {users.find((u) => u.id === comment.userId)?.username || 'Viewer'}
                        </strong>
                        <span className="text-gray-400 text-[10px]">• {comment.date}</span>
                        <button
                          type="button"
                          onClick={() => onNavigate('watch', { id: videoId })}
                          className="text-[10px] text-blue-700 hover:underline font-bold"
                        >
                          on &quot;{videoTitle}&quot;
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 mt-1">{comment.text}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => playIEClick(navSoundsEnabled)}
                        className="btn text-xs py-0.5 px-2 text-red-600 hover:bg-red-50 font-bold"
                        title="Heart comment as Creator Favorite"
                      >
                        ❤️ Heart
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('watch', { id: videoId })}
                        className="btn text-xs py-0.5 px-2 font-bold"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB: YOUTUBE CHANNEL SYNC & IMPORT */}
      {studioTab === 'yt_sync' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-800 via-red-700 to-neutral-900 text-white rounded p-4 border border-red-900 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-red-300 font-mono font-bold block">
                  YouTube Partner Gateway & Catalog Importer
                </span>
                <h2 className="text-base font-black flex items-center gap-2">
                  <span>📺</span>
                  <span>Official YouTube Channel Synchronization Center</span>
                </h2>
                <p className="text-xs text-red-100 mt-0.5">
                  Fetch live profile metadata, avatar, bio, and import all official video uploads directly into your RetroTube Studio.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStudioSyncAllVideos}
                  disabled={isSyncingStudioYt}
                  className="btn text-xs py-1.5 px-3 bg-white text-red-700 hover:bg-gray-100 font-bold border-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>{isSyncingStudioYt ? '⏳' : '📥'}</span>
                  <span>{isSyncingStudioYt ? 'Querying...' : 'Sync All Channel Videos'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback alert */}
          {studioSyncMsg && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs font-bold text-blue-900 flex justify-between items-center shadow-xs">
              <div className="flex items-center gap-1.5">
                <span>ℹ️</span>
                <span>{studioSyncMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setStudioSyncMsg(null)}
                className="text-gray-400 hover:text-black font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Channel Metadata Sync & Gateway */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-4">
              <h3 className="font-black text-xs text-gray-900 uppercase tracking-wide border-b pb-1.5 flex items-center gap-1.5">
                <span>📡</span>
                <span>YouTube Channel Connection</span>
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  YouTube Channel Link, Handle (@name), or Channel ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ytSyncUrl}
                    onChange={(e) => setYtSyncUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/@mkbhd or @pewdiepie"
                    className="flex-1 text-xs p-2 border rounded border-gray-300 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectYouTubeChannel(ytSyncUrl)}
                    disabled={isSyncingStudioYt}
                    className="btn btn-primary text-xs py-1.5 px-3 font-bold"
                  >
                    Inspect
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 block">
                  Automatically extracts live profile picture, bio description, and verified badge using CORS gateway.
                </span>
              </div>

              {/* Active Channel Preview */}
              <div className="border border-gray-200 rounded p-3 bg-gray-50/50 space-y-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Active Channel Metadata Card
                </div>
                <div className="flex items-start gap-3">
                  <img
                    src={channelMetaPreview?.avatarUrl || currentUser.avatarBase64}
                    alt={currentUser.username}
                    className="w-16 h-16 rounded-full border-2 border-red-600 shadow-md object-cover flex-shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-sm text-gray-900 truncate">
                        {channelMetaPreview?.channelName || currentUser.username}
                      </strong>
                      <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        ✓ VERIFIED
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {channelMetaPreview
                        ? `${channelMetaPreview.subscribers.toLocaleString()} subscribers • ${channelMetaPreview.videoCount} uploads detected`
                        : `${currentUser.subscribers.toLocaleString()} subscribers • ${channelVideos.length} videos in studio`}
                    </div>
                    <p className="text-[11px] text-gray-600 italic line-clamp-3">
                      &quot;{channelMetaPreview?.bio || currentUser.bio || 'Official YouTube creator channel.'}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-200 flex-wrap">
                  {channelMetaPreview && (
                    <button
                      type="button"
                      onClick={handleApplyProfileToChannel}
                      className="btn text-xs py-1 px-2.5 font-bold bg-white text-gray-800 border-gray-300 hover:bg-gray-100 flex items-center gap-1 shadow-2xs"
                      title="Apply the extracted native YouTube avatar photo and bio description to your RetroTube channel"
                    >
                      <span>👤</span>
                      <span>Apply Avatar & Bio</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStudioSyncAllVideos}
                    disabled={isSyncingStudioYt}
                    className="btn text-xs py-1 px-2.5 font-bold bg-white text-red-700 border-red-300 hover:bg-red-50 flex items-center gap-1 shadow-2xs disabled:opacity-50"
                  >
                    <span>📥</span>
                    <span>Import All Uploads ({channelMetaPreview?.videoCount || 'All'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStudioSyncEverything}
                    disabled={isSyncingStudioYt}
                    className="btn btn-primary text-xs py-1 px-3 font-bold flex items-center gap-1 shadow-xs disabled:opacity-50"
                    title="Simultaneously apply official profile avatar, native bio, and import all videos"
                  >
                    <span>⚡</span>
                    <span>Full Sync (Profile & Videos)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Single Video Instant Importer */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-4">
              <h3 className="font-black text-xs text-gray-900 uppercase tracking-wide border-b pb-1.5 flex items-center gap-1.5">
                <span>🎬</span>
                <span>Instant Single Video Importer</span>
              </h3>

              <form onSubmit={handleImportSingleYtVideo} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Paste Any YouTube Video URL or 11-Character ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSingleYtInput}
                      onChange={(e) => setCustomSingleYtInput(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="flex-1 text-xs p-2 border rounded border-gray-300 bg-white font-mono"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary text-xs py-1.5 px-3 font-bold whitespace-nowrap"
                    >
                      + Import Video
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Fetches high-res thumbnail and creates playback record in your Studio Video Manager.
                  </span>
                </div>
              </form>

              {/* Imported Catalog Status */}
              <div className="border border-gray-200 rounded p-3 bg-gray-50/50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Studio Video Manager Count:</span>
                  <span className="font-mono font-bold text-gray-900">{channelVideos.length} Videos</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Official YouTube Streams:</span>
                  <span className="font-mono font-bold text-red-600">
                    {channelVideos.filter((v) => !!v.youtubeId).length} Linked Videos
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStudioTab('video_manager')}
                    className="btn text-xs py-1 px-3 font-bold"
                  >
                    Manage Videos in Manager ➔
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('channel', { id: currentUser.id })}
                    className="btn text-xs py-1 px-3 text-red-700 hover:bg-red-50 font-bold"
                  >
                    View on Channel ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MCN NETWORK HEADQUARTERS (EMBEDDED FULL SIMULATOR) */}
      {studioTab === 'mcn_hub' && (
        <McnSimulatorView
          currentUser={currentUser}
          users={users}
          videos={videos}
          mcns={mcns}
          sponsorshipDeals={sponsorshipDeals}
          contentIdClaims={contentIdClaims}
          royaltyInvoices={royaltyInvoices}
          navSoundsEnabled={navSoundsEnabled}
          onCreateMcn={onCreateMcn}
          onUpdateMcn={onUpdateMcn}
          onSignContract={onSignContract}
          onVoidContract={onVoidContract}
          onSendContractOffer={onSendContractOffer}
          onClaimSponsorship={onClaimSponsorship}
          onAssignSponsorshipChannel={onAssignSponsorshipChannel}
          onAddContentIdClaim={onAddContentIdClaim}
          onResolveContentIdClaim={onResolveContentIdClaim}
          onRunMonthlyPayouts={onRunMonthlyPayouts}
          onWithdrawVault={onWithdrawVault}
          onAttachMusicToVideo={onAttachMusicToVideo}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
