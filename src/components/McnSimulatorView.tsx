import React, { useState } from 'react';
import {
  McnNetwork,
  McnSponsorshipDeal,
  ContentIdClaim,
  McnRoyaltyInvoice,
  User,
  Video,
} from '../types';
import { processAndResizeImage } from '../utils/text';
import { playCashRegister, playMcnFanfare, playIEClick } from '../utils/audio';

interface McnSimulatorViewProps {
  currentUser: User;
  users: User[];
  videos: Video[];
  mcns: McnNetwork[];
  sponsorshipDeals: McnSponsorshipDeal[];
  contentIdClaims: ContentIdClaim[];
  royaltyInvoices: McnRoyaltyInvoice[];
  navSoundsEnabled?: boolean;
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
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

// Preset Badges for easy 1-click branding
const PRESET_BADGES = [
  {
    name: 'Classic M',
    icon: 'Ⓜ️',
    previewBg: 'linear-gradient(135deg, #b91c1c, #991b1b)',
    label: 'Red Machinima Style',
  },
  {
    name: 'Maker Star',
    icon: '⭐',
    previewBg: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
    label: 'Blue Maker Style',
  },
  {
    name: 'Cyber Shield',
    icon: '🛡️',
    previewBg: 'linear-gradient(135deg, #059669, #047857)',
    label: 'Green Emerald Shield',
  },
  {
    name: 'Golden Crown',
    icon: '👑',
    previewBg: 'linear-gradient(135deg, #d97706, #b45309)',
    label: 'Gold VIP Syndicate',
  },
  {
    name: 'Neon Spark',
    icon: '⚡',
    previewBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    label: 'Purple Pulse',
  },
];

// Curated 2009-2011 YouTube Royalty-Free Music Library
const VINTAGE_MUSIC_TRACKS = [
  {
    id: 'track_dreamscape',
    title: '009 Sound System - Dreamscape',
    artist: '009 Sound System',
    genre: 'Trance / Notepad Tutorial Anthem',
    bpm: 135,
    notes: [440, 523, 659, 587, 523, 440],
  },
  {
    id: 'track_spirit',
    title: '009 Sound System - With a Spirit',
    artist: '009 Sound System',
    genre: 'Classic Electro Pop',
    bpm: 128,
    notes: [392, 440, 523, 659, 784],
  },
  {
    id: 'track_snitch',
    title: 'Kevin MacLeod - Sneaky Snitch',
    artist: 'Incompetech Royalty-Free',
    genre: 'Comedy / Trolling Montage',
    bpm: 110,
    notes: [261, 329, 392, 523, 493],
  },
  {
    id: 'track_fluffing',
    title: 'Kevin MacLeod - Fluffing a Duck',
    artist: 'Incompetech Royalty-Free',
    genre: 'Quirky Vlogs & Bloopers',
    bpm: 140,
    notes: [329, 392, 440, 493, 587],
  },
  {
    id: 'track_paralyzer',
    title: 'Paralyzer (8-Bit Tribute Synthesis)',
    artist: 'Retro Synth Chiptune',
    genre: 'Machinima Frag Movie Intro',
    bpm: 132,
    notes: [330, 392, 440, 494, 587, 659],
  },
];

export const McnSimulatorView: React.FC<McnSimulatorViewProps> = ({
  currentUser,
  users,
  videos,
  mcns,
  sponsorshipDeals,
  contentIdClaims,
  royaltyInvoices,
  navSoundsEnabled = true,
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
  onNavigate,
}) => {
  // Tabs: 'directory' | 'create_mcn' | 'roster' | 'sponsorships' | 'content_id' | 'treasury' | 'music_vault'
  const [activeTab, setActiveTab] = useState<string>('directory');
  const [selectedMcnId, setSelectedMcnId] = useState<string>(
    currentUser.activeContract && mcns.some((m) => m.id === currentUser.activeContract)
      ? currentUser.activeContract
      : mcns[0]?.id || ''
  );

  // New MCN Form state
  const [formName, setFormName] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formSlogan, setFormSlogan] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSplit, setFormSplit] = useState(70);
  const [formCpm, setFormCpm] = useState(1.5);
  const [formMinSubs, setFormMinSubs] = useState(50);
  const [formTermMonths, setFormTermMonths] = useState(12);
  const [formLogoBase64, setFormLogoBase64] = useState<string>('');
  const [formBannerBase64, setFormBannerBase64] = useState<string>('');
  const [formBadgeBase64, setFormBadgeBase64] = useState<string>('');
  const [selectedPresetBadge, setSelectedPresetBadge] = useState<string>('Classic M');
  const [formPerks, setFormPerks] = useState<string[]>([
    'Content ID Asset Protection',
    'Royalty-Free Audio Clearance',
    'Exclusive Brand Sponsorship Deals',
    'Partner Verified Network Badge',
  ]);

  // Scouting offer modal state
  const [scoutingChannelId, setScoutingChannelId] = useState<string | null>(null);
  const [signingBonus, setSigningBonus] = useState<number>(50);

  // Content ID new claim state
  const [claimAssetTitle, setClaimAssetTitle] = useState('');
  const [claimTargetVideoId, setClaimTargetVideoId] = useState(videos[0]?.id || '');
  const [claimType, setClaimType] = useState<'monetize' | 'block' | 'strike'>('monetize');

  // Audio previewing state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [musicVideoTargetId, setMusicVideoTargetId] = useState<string>(videos[0]?.id || '');

  // Invoice viewer modal state
  const [viewingInvoice, setViewingInvoice] = useState<McnRoyaltyInvoice | null>(null);

  const selectedMcn = mcns.find((m) => m.id === selectedMcnId) || mcns[0];
  const isFounder = selectedMcn && selectedMcn.founderId === currentUser.id;
  const isSignedToThis = currentUser.activeContract === selectedMcn?.id;

  // Handle local image file imports
  const handleImageImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner' | 'badge'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playIEClick(navSoundsEnabled);

    if (type === 'logo') {
      const b64 = await processAndResizeImage(file, 256, 256);
      setFormLogoBase64(b64);
    } else if (type === 'banner') {
      const b64 = await processAndResizeImage(file, 960, 240);
      setFormBannerBase64(b64);
    } else if (type === 'badge') {
      const b64 = await processAndResizeImage(file, 96, 96);
      setFormBadgeBase64(b64);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newId = `mcn_${Date.now()}`;
    const cleanTag = (formTag.trim() || formName.slice(0, 4)).toUpperCase();

    const created: McnNetwork = {
      id: newId,
      name: formName.trim(),
      tag: cleanTag,
      slogan: formSlogan.trim() || 'Premier Creator Network',
      description: formDescription.trim() || 'Established on RetroTube MCN Engine.',
      founderId: currentUser.id,
      founderName: currentUser.username,
      splitPercentage: formSplit,
      cpmMultiplier: formCpm,
      minSubscribersRequired: formMinSubs,
      contractTermMonths: formTermMonths,
      logoBase64: formLogoBase64,
      bannerBase64: formBannerBase64,
      badgeBase64: formBadgeBase64 || formLogoBase64,
      signedChannelIds: [currentUser.id],
      vaultBalance: 250.0, // Founder starting treasury bonus
      perks: formPerks,
      isOfficial: false,
    };

    onCreateMcn(created);
    onSignContract(currentUser.id, created.id);
    setSelectedMcnId(newId);
    setActiveTab('roster');
    playMcnFanfare(navSoundsEnabled);
  };

  // Split and Buyout Simulator state
  const [simViews, setSimViews] = useState(250000);
  const [simCpm, setSimCpm] = useState(3.50);
  const [simSplit, setSimSplit] = useState(selectedMcn?.splitPercentage || 75);
  const [buyoutStatus, setBuyoutStatus] = useState<string | null>(null);

  const handleExecuteBuyout = () => {
    const buyoutCost = 150.0;
    if ((currentUser.balance || 0) < buyoutCost) {
      setBuyoutStatus(`⚠️ Insufficient channel balance ($${(currentUser.balance || 0).toFixed(2)}). Buyout fee requires $${buyoutCost.toFixed(2)}.`);
      return;
    }
    onVoidContract(currentUser.id);
    setBuyoutStatus(`🎉 Contract officially dissolved! You paid the $${buyoutCost.toFixed(2)} early release buyout fee and are now a Free Agent.`);
    playMcnFanfare(navSoundsEnabled);
  };

  // Synthesize chiptune melody for vintage audio track preview
  const previewSynthTrack = (track: typeof VINTAGE_MUSIC_TRACKS[0]) => {
    playIEClick(navSoundsEnabled);
    if (playingTrackId === track.id) {
      setPlayingTrackId(null);
      return;
    }
    setPlayingTrackId(track.id);

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      track.notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.28);

        gain.gain.setValueAtTime(0.08, now + idx * 0.28);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.28 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.28);
        osc.stop(now + idx * 0.28 + 0.28);
      });

      setTimeout(() => {
        setPlayingTrackId(null);
      }, track.notes.length * 300);
    } catch (e) {
      setPlayingTrackId(null);
    }
  };

  return (
    <div className="max-w-[1040px] mx-auto p-3 sm:p-5 select-none text-xs space-y-4">
      {/* 2011 MCN Simulator Header Banner */}
      <div className="bg-linear-to-r from-neutral-900 via-neutral-800 to-red-950 text-white p-4 rounded border border-neutral-700 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <h1 className="text-base font-black tracking-wide text-white uppercase">
              RetroTube MCN Network Simulator
            </h1>
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-2xs">
              2011 PARTNER HUB
            </span>
          </div>
          <p className="text-gray-300 text-xs mt-1">
            Found your own multi-channel media empire, scout top creators, negotiate 70/30 lock-in contracts, secure brand deals, and claim Content ID royalties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="btn text-xs py-1.5 px-3 bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-500 font-bold"
          >
            🎬 Creator Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create_mcn')}
            className="btn btn-primary text-xs py-1.5 px-3 font-bold shadow-2xs"
          >
            ➕ Found Your Own MCN
          </button>
        </div>
      </div>

      {/* Selected MCN Status Bar & Active Contract Overview */}
      <div className="bg-white border border-[#ccc] rounded p-3 shadow-2xs flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded border border-gray-300 bg-neutral-900 flex items-center justify-center overflow-hidden font-bold text-lg text-white">
            {selectedMcn?.logoBase64 ? (
              <img
                src={selectedMcn.logoBase64}
                alt={selectedMcn.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>[{selectedMcn?.tag || 'MCN'}]</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-gray-900">
                {selectedMcn?.name || 'MCN Network'}
              </h2>
              <span className="bg-blue-100 text-blue-800 font-black text-[10px] px-1.5 py-0.2 rounded border border-blue-200">
                [{selectedMcn?.tag}]
              </span>
              {selectedMcn?.isOfficial && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                  ★ Legendary Network
                </span>
              )}
            </div>
            <p className="text-gray-500 text-[11px] italic">
              &quot;{selectedMcn?.slogan}&quot; • Founder:{' '}
              <strong>{selectedMcn?.founderName || 'Media Syndicate'}</strong>
            </p>
          </div>
        </div>

        {/* MCN Network Switcher */}
        <div className="flex items-center gap-2">
          <label className="font-bold text-gray-600 text-xs">Switch Network:</label>
          <select
            value={selectedMcnId}
            onChange={(e) => setSelectedMcnId(e.target.value)}
            className="text-xs p-1.5 border border-gray-300 rounded font-bold bg-white text-gray-800"
          >
            {mcns.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} [{m.tag}] ({m.signedChannelIds.length} partners)
              </option>
            ))}
          </select>

          {/* Quick Partner / Void Action */}
          {currentUser.activeContract === selectedMcn?.id ? (
            <button
              type="button"
              onClick={() => onVoidContract(currentUser.id)}
              className="btn text-xs py-1 px-2.5 text-red-700 font-bold hover:bg-red-50"
              title="Leave network and become a free agent"
            >
              Void Partner Contract
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onSignContract(currentUser.id, selectedMcn.id);
                playMcnFanfare(navSoundsEnabled);
              }}
              className="btn btn-primary text-xs py-1 px-3 font-bold"
            >
              Sign Partner Agreement ✍️
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 pb-1">
        {[
          { id: 'directory', label: '🌐 Network Directory & Stats', icon: '📋' },
          { id: 'create_mcn', label: '🛠️ Make Your Own MCN', icon: '🎨' },
          { id: 'roster', label: `👥 Channel Roster (${selectedMcn?.signedChannelIds.length || 0})`, icon: '✍️' },
          { id: 'royalty_calc', label: '🧮 Split & Buyout Simulator', icon: '🧮' },
          { id: 'sponsorships', label: '💼 Brand Deals Marketplace', icon: '🏷️' },
          { id: 'content_id', label: '🛡️ Content ID Rights Center', icon: '⚖️' },
          { id: 'treasury', label: `💰 Treasury & Payday ($${(selectedMcn?.vaultBalance || 0).toFixed(2)})`, icon: '💵' },
          { id: 'music_vault', label: '🎵 2009 Audio Vault', icon: '🎧' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              playIEClick(navSoundsEnabled);
            }}
            className={`px-3 py-1.5 rounded-t text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white border border-gray-300 border-b-white text-red-700 shadow-2xs -mb-[2px] z-10'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Network Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mcns.map((net) => {
              const isUserNetwork = net.founderId === currentUser.id;
              const isCurrentPartner = currentUser.activeContract === net.id;
              return (
                <div
                  key={net.id}
                  className={`bg-white border rounded p-3.5 shadow-2xs space-y-3 relative ${
                    selectedMcnId === net.id ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300'
                  }`}
                >
                  {net.bannerBase64 && (
                    <div className="h-16 -mx-3.5 -mt-3.5 rounded-t overflow-hidden border-b border-gray-200">
                      <img
                        src={net.bannerBase64}
                        alt="banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-neutral-900 flex items-center justify-center font-bold text-white text-xs overflow-hidden border border-gray-300">
                        {net.logoBase64 ? (
                          <img src={net.logoBase64} alt={net.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>[{net.tag}]</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs text-gray-900">{net.name}</h3>
                        <span className="text-[10px] text-gray-500 block">
                          Founder: {net.founderName || 'Indie Founder'}
                        </span>
                      </div>
                    </div>

                    {isCurrentPartner && (
                      <span className="bg-green-100 text-green-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-300">
                        Active Partner ✓
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-2">{net.description}</p>

                  <div className="bg-gray-50 border border-gray-200 rounded p-2 grid grid-cols-3 gap-1 text-[10px] text-center font-bold text-gray-700">
                    <div>
                      <span className="text-gray-400 block font-normal">Split</span>
                      <span className="text-red-700">{net.splitPercentage}% / {100 - net.splitPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-normal">CPM Boost</span>
                      <span className="text-green-700">{net.cpmMultiplier}x</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-normal">Partners</span>
                      <span>{net.signedChannelIds.length}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMcnId(net.id);
                        setActiveTab('roster');
                        playIEClick(navSoundsEnabled);
                      }}
                      className="text-blue-700 hover:underline font-bold text-xs"
                    >
                      Manage Roster →
                    </button>

                    {isCurrentPartner ? (
                      <button
                        type="button"
                        onClick={() => onVoidContract(currentUser.id)}
                        className="btn text-xs py-0.5 px-2 text-red-700 border-red-200"
                      >
                        Void
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSignContract(currentUser.id, net.id);
                          setSelectedMcnId(net.id);
                          playMcnFanfare(navSoundsEnabled);
                        }}
                        className="btn btn-primary text-xs py-0.5 px-2.5 font-bold"
                      >
                        Join Network
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Make Your Own MCN with Local Image Import */}
      {activeTab === 'create_mcn' && (
        <div className="bg-white border border-[#ccc] rounded p-4 shadow-2xs space-y-5">
          <div className="border-b pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                🛠️ Establish Your Own Multi-Channel Network (MCN)
              </h3>
              <p className="text-xs text-gray-500">
                Become a network mogul! Upload custom branding from your local files, define contract terms, and earn cuts on all partner views.
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-300">
              Founder: {currentUser.username}
            </span>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Network Name:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Apex Gaming Syndicate, PixelPulse Media"
                  className="w-full text-xs font-bold p-2 border border-gray-300 rounded bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Network Tag / Prefix (e.g. [APEX], [PULSE]):
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  placeholder="e.g. APEX"
                  className="w-full text-xs font-bold p-2 border border-gray-300 rounded bg-white uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Tagline / Slogan:</label>
              <input
                type="text"
                value={formSlogan}
                onChange={(e) => setFormSlogan(e.target.value)}
                placeholder="e.g. Amplifying the finest content creators across the web."
                className="w-full text-xs p-2 border border-gray-300 rounded bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Network Mission & Description:</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                placeholder="State your MCN network guidelines, perks, and revenue advantages..."
                className="w-full text-xs p-2 border border-gray-300 rounded bg-white"
              />
            </div>

            {/* Local Image Import Section (User Friendly Drag & Drop / File Input) */}
            <div className="bg-amber-50/60 border border-amber-200 rounded p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                    📁 Local Image Import (Logo, Banner & Partner Emblem)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Import image files directly from your computer. Files are instantly converted to persistent local storage.
                  </p>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                  Offline Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. MCN Logo Import */}
                <div className="bg-white border border-dashed border-amber-300 rounded p-2.5 text-center space-y-2">
                  <span className="font-bold text-gray-700 block text-xs">MCN Logo / Icon</span>
                  <div className="w-16 h-16 mx-auto rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formLogoBase64 ? (
                      <img src={formLogoBase64} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 font-bold text-xs">No Logo</span>
                    )}
                  </div>
                  <label className="btn text-xs py-1 px-2.5 block cursor-pointer bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold">
                    <span>Import Local Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageImport(e, 'logo')}
                    />
                  </label>
                  {formLogoBase64 && (
                    <button
                      type="button"
                      onClick={() => setFormLogoBase64('')}
                      className="text-[10px] text-red-600 hover:underline block mx-auto"
                    >
                      Clear Logo
                    </button>
                  )}
                </div>

                {/* 2. MCN Header Banner Import */}
                <div className="bg-white border border-dashed border-amber-300 rounded p-2.5 text-center space-y-2">
                  <span className="font-bold text-gray-700 block text-xs">Network Banner</span>
                  <div className="w-full h-16 rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formBannerBase64 ? (
                      <img src={formBannerBase64} alt="Banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 font-bold text-xs">No Banner</span>
                    )}
                  </div>
                  <label className="btn text-xs py-1 px-2.5 block cursor-pointer bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold">
                    <span>Import Local Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageImport(e, 'banner')}
                    />
                  </label>
                  {formBannerBase64 && (
                    <button
                      type="button"
                      onClick={() => setFormBannerBase64('')}
                      className="text-[10px] text-red-600 hover:underline block mx-auto"
                    >
                      Clear Banner
                    </button>
                  )}
                </div>

                {/* 3. Partner Verification Badge */}
                <div className="bg-white border border-dashed border-amber-300 rounded p-2.5 text-center space-y-2">
                  <span className="font-bold text-gray-700 block text-xs">Partner Video Badge</span>
                  <div className="w-16 h-16 mx-auto rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formBadgeBase64 ? (
                      <img src={formBadgeBase64} alt="Badge preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">
                        {PRESET_BADGES.find((b) => b.name === selectedPresetBadge)?.icon || '⭐'}
                      </span>
                    )}
                  </div>
                  <label className="btn text-xs py-1 px-2.5 block cursor-pointer bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold">
                    <span>Import Local Badge</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageImport(e, 'badge')}
                    />
                  </label>
                  <div className="text-[10px] text-gray-500">
                    Or select preset:
                    <select
                      value={selectedPresetBadge}
                      onChange={(e) => {
                        setSelectedPresetBadge(e.target.value);
                        setFormBadgeBase64('');
                      }}
                      className="text-[10px] p-0.5 border rounded ml-1"
                    >
                      {PRESET_BADGES.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.icon} {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Terms & Revenue Split */}
            <div className="bg-gray-50 border border-gray-300 rounded p-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Creator Split ({formSplit}%):
                </label>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={formSplit}
                  onChange={(e) => setFormSplit(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <span className="text-[10px] text-gray-500 block">
                  Network keeps {100 - formSplit}% of ad revenue
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ad CPM Multiplier:</label>
                <select
                  value={formCpm}
                  onChange={(e) => setFormCpm(parseFloat(e.target.value))}
                  className="w-full text-xs p-1.5 border rounded bg-white font-bold"
                >
                  <option value="1.2">1.2x (Standard Indie)</option>
                  <option value="1.5">1.5x (Premium Machinima Rate)</option>
                  <option value="1.8">1.8x (High-Tier Syndicate)</option>
                  <option value="2.5">2.5x (Mega Network Gold Rate)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lock-in Term:</label>
                <select
                  value={formTermMonths}
                  onChange={(e) => setFormTermMonths(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-1.5 border rounded bg-white font-bold"
                >
                  <option value="6">6 Months Trial</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="999">Lifetime Golden Handcuffs ⛓️</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Min. Subscriber Requirement:</label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={formMinSubs}
                  onChange={(e) => setFormMinSubs(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs p-1.5 border rounded bg-white"
                />
              </div>
            </div>

            {/* Perks Selector */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Network Partner Perks Offered:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'Content ID Asset Protection',
                  'Royalty-Free Audio Clearance',
                  'Exclusive Brand Sponsorship Deals',
                  'Partner Verified Network Badge',
                  'Priority Homepage Spotlight Bidding',
                  'Sub-Network (Sub-MCN) Incubation',
                ].map((perk) => {
                  const has = formPerks.includes(perk);
                  return (
                    <label key={perk} className="flex items-center gap-2 p-1.5 bg-gray-50 border rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={has}
                        onChange={() => {
                          setFormPerks((prev) =>
                            has ? prev.filter((p) => p !== perk) : [...prev, perk]
                          );
                        }}
                      />
                      <span>{perk}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="btn text-xs py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs py-1.5 px-5 font-bold shadow-2xs"
              >
                🚀 Establish Network & Sign as Founder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Channel Scouting & Roster Management */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#ccc] rounded p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  👥 {selectedMcn?.name} Channel Roster & Scouting
                </h3>
                <p className="text-xs text-gray-500">
                  Manage partnered channels, scout free agents across RetroTube, and send signing bonus offers.
                </p>
              </div>

              {isFounder && (
                <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2 py-0.5 rounded border border-purple-200">
                  👑 You Own This Network
                </span>
              )}
            </div>

            {/* Current Signed Channels Table */}
            <div>
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-2">
                Active Partner Channels ({selectedMcn?.signedChannelIds.length || 0})
              </h4>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-bold">
                      <th className="p-2">Channel</th>
                      <th className="p-2">Subscribers</th>
                      <th className="p-2">Contract Split</th>
                      <th className="p-2">Total Videos</th>
                      <th className="p-2">Aggregate Views</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMcn?.signedChannelIds.map((chId) => {
                      const ch = users.find((u) => u.id === chId);
                      if (!ch) return null;
                      const chVideos = videos.filter((v) => v.authorId === chId);
                      const totalViews = chVideos.reduce((acc, v) => acc + (v.views || 0), 0);

                      return (
                        <tr key={chId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2 flex items-center gap-2">
                            <span className="font-bold text-gray-900">{ch.username}</span>
                            <span className="text-[10px] text-gray-400">[{selectedMcn.tag}]</span>
                          </td>
                          <td className="p-2 font-bold text-gray-700">{ch.subscribers.toLocaleString()}</td>
                          <td className="p-2 font-bold text-green-700">
                            {selectedMcn.splitPercentage}% creator / {100 - selectedMcn.splitPercentage}% MCN
                          </td>
                          <td className="p-2">{chVideos.length} vids</td>
                          <td className="p-2 font-bold">{totalViews.toLocaleString()} views</td>
                          <td className="p-2 text-right">
                            {isFounder && chId !== currentUser.id && (
                              <button
                                type="button"
                                onClick={() => onVoidContract(chId)}
                                className="btn text-xs py-0.5 px-2 text-red-700 border-red-200 hover:bg-red-50"
                              >
                                Release / Void
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onNavigate('channel', { id: chId })}
                              className="text-blue-700 hover:underline ml-2 font-bold"
                            >
                              Visit Channel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Free Agent Scouting Section */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                🔍 Scout & Sign New Channels to {selectedMcn?.name}
              </h4>
              <p className="text-xs text-gray-500">
                Send contract proposals to channels on RetroTube. You can offer an upfront cash signing bonus from your personal funds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {users
                  .filter((u) => !selectedMcn?.signedChannelIds.includes(u.id))
                  .map((candidate) => {
                    const candidateVids = videos.filter((v) => v.authorId === candidate.id);
                    const candidateViews = candidateVids.reduce((acc, v) => acc + (v.views || 0), 0);
                    return (
                      <div key={candidate.id} className="bg-gray-50 border border-gray-300 rounded p-2.5 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-xs text-gray-900 block">{candidate.username}</strong>
                            <span className="text-[10px] text-gray-500">
                              {candidate.subscribers} subs • {candidateViews.toLocaleString()} views
                            </span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded">
                            {candidate.activeContract ? 'Under Contract' : 'Free Agent'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              setScoutingChannelId(candidate.id);
                              setSigningBonus(50);
                            }}
                            className="btn btn-primary text-xs py-0.5 px-2 font-bold"
                          >
                            ✍️ Offer Contract
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('channel', { id: candidate.id })}
                            className="text-gray-600 hover:underline text-[11px]"
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Brand Deals & Sponsorship Marketplace */}
      {activeTab === 'sponsorships' && (
        <div className="bg-white border border-[#ccc] rounded p-4 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                💼 Vintage Brand Deals & Sponsorship Marketplace
              </h3>
              <p className="text-xs text-gray-500">
                Secure era-authentic sponsorships (G-Fuel, LootCrate, Audible, Astro Gaming) for your network and deploy them across partner channels for bonus revenue per view.
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
              Active Network: {selectedMcn?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsorshipDeals.map((deal) => {
              const isClaimedByCurrent = deal.assignedNetworkId === selectedMcn?.id;
              const isClaimedByOther = deal.assignedNetworkId && deal.assignedNetworkId !== selectedMcn?.id;
              const assignedChannels = users.filter((u) => deal.assignedChannelIds.includes(u.id));

              return (
                <div
                  key={deal.id}
                  className={`bg-white border rounded p-3.5 shadow-2xs space-y-3 relative ${
                    isClaimedByCurrent ? 'border-green-500 bg-green-50/20' : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{deal.logo}</span>
                      <div>
                        <h4 className="font-extrabold text-xs text-gray-900">{deal.brandName}</h4>
                        <span className="text-[10px] text-gray-500 block">{deal.brandCategory}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-green-700 text-xs block">
                        +${deal.cpmBonus.toFixed(2)} CPM Bonus
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ${deal.payoutPerVideo.toFixed(2)} flat/video
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 bg-gray-50 border rounded p-2 italic">
                    &quot;{deal.tagline}&quot;
                  </p>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Campaign Status:</span>
                      {isClaimedByCurrent ? (
                        <span className="text-green-800 font-bold">Claimed by {selectedMcn?.name} ✓</span>
                      ) : isClaimedByOther ? (
                        <span className="text-red-700 font-bold">Exclusive to another network</span>
                      ) : (
                        <span className="text-blue-700 font-bold">Available to Sign</span>
                      )}
                    </div>

                    {!deal.assignedNetworkId ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClaimSponsorship(deal.id, selectedMcn.id);
                          playCashRegister(navSoundsEnabled);
                        }}
                        className="btn btn-primary text-xs py-1 px-3 font-bold"
                      >
                        Claim for Network
                      </button>
                    ) : isClaimedByCurrent ? (
                      <div className="flex items-center gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onAssignSponsorshipChannel(deal.id, e.target.value);
                              playCashRegister(navSoundsEnabled);
                            }
                          }}
                          className="text-[11px] p-1 border rounded bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Assign to Channel...
                          </option>
                          {selectedMcn?.signedChannelIds.map((chId) => {
                            const ch = users.find((u) => u.id === chId);
                            if (!ch || deal.assignedChannelIds.includes(chId)) return null;
                            return (
                              <option key={chId} value={chId}>
                                + {ch.username}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : null}
                  </div>

                  {assignedChannels.length > 0 && (
                    <div className="text-[10px] text-gray-600 pt-1 border-t">
                      <span className="font-bold">Active Creators: </span>
                      {assignedChannels.map((c) => c.username).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Content ID Audio & Video Claiming Engine */}
      {activeTab === 'content_id' && (
        <div className="bg-white border border-[#ccc] rounded p-4 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                🛡️ Vintage YouTube Content ID & Copyright Manager
              </h3>
              <p className="text-xs text-gray-500">
                Register copyrighted assets into the MCN Rights Database, automatically scan videos, and divert ad revenue to your MCN treasury or issue vintage DMCA strikes.
              </p>
            </div>
            <span className="text-xs bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded border border-red-300">
              Rights Holder: {selectedMcn?.name}
            </span>
          </div>

          {/* New Asset Claim Form */}
          <div className="bg-gray-50 border border-gray-300 rounded p-3 space-y-3">
            <h4 className="font-bold text-xs text-gray-800">
              ⚡ Register Copyrighted Asset & Scan RetroTube
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Asset Title / Audio Name:</label>
                <input
                  type="text"
                  value={claimAssetTitle}
                  onChange={(e) => setClaimAssetTitle(e.target.value)}
                  placeholder="e.g. Machinima Anthem, Frag Track 01"
                  className="w-full text-xs p-1.5 border rounded bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Target Video to Claim:</label>
                <select
                  value={claimTargetVideoId}
                  onChange={(e) => setClaimTargetVideoId(e.target.value)}
                  className="w-full text-xs p-1.5 border rounded bg-white"
                >
                  {videos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} ({v.views.toLocaleString()} views)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Enforcement Policy:</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as any)}
                  className="w-full text-xs p-1.5 border rounded bg-white font-bold"
                >
                  <option value="monetize">Monetize Video (Take Revenue)</option>
                  <option value="block">Block Video Worldwide</option>
                  <option value="strike">Issue Formal Copyright Strike</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!claimAssetTitle.trim()) return;
                    onAddContentIdClaim({
                      assetTitle: claimAssetTitle.trim(),
                      claimantMcnId: selectedMcn.id,
                      targetVideoId: claimTargetVideoId,
                      claimType,
                      status: 'active',
                      matchTimestamp: '0:15 - 0:45',
                      adRevenueDiverted: 28.5,
                    });
                    setClaimAssetTitle('');
                    playCashRegister(navSoundsEnabled);
                  }}
                  className="w-full btn btn-primary text-xs py-1.5 font-bold"
                >
                  Scan & Assert Claim
                </button>
              </div>
            </div>
          </div>

          {/* Active Claims Registry */}
          <div>
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-2">
              Active Content ID Claims ({contentIdClaims.length})
            </h4>

            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="p-2">Protected Asset</th>
                    <th className="p-2">Claiming MCN</th>
                    <th className="p-2">Targeted Video</th>
                    <th className="p-2">Match Segment</th>
                    <th className="p-2">Policy</th>
                    <th className="p-2">Diverted Revenue</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentIdClaims.map((claim) => {
                    const targetVid = videos.find((v) => v.id === claim.targetVideoId);
                    const claimant = mcns.find((m) => m.id === claim.claimantMcnId);
                    const isMcnOwner = claim.claimantMcnId === selectedMcn?.id;

                    return (
                      <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 font-bold text-gray-900">{claim.assetTitle}</td>
                        <td className="p-2 font-bold text-blue-700">[{claimant?.tag || 'MCN'}]</td>
                        <td className="p-2 text-gray-800">
                          {targetVid ? targetVid.title : claim.targetVideoId}
                        </td>
                        <td className="p-2 font-mono text-[11px] text-gray-500">{claim.matchTimestamp}</td>
                        <td className="p-2">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              claim.claimType === 'monetize'
                                ? 'bg-green-100 text-green-800'
                                : claim.claimType === 'block'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {claim.claimType.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-green-700">
                          ${claim.adRevenueDiverted.toFixed(2)}
                        </td>
                        <td className="p-2 text-right">
                          {isMcnOwner ? (
                            <button
                              type="button"
                              onClick={() => onResolveContentIdClaim(claim.id, 'release')}
                              className="btn text-xs py-0.5 px-2 text-red-700 hover:bg-red-50"
                            >
                              Release Claim
                            </button>
                          ) : (
                            <span className="text-gray-400">View Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MCN Treasury Vault & Monthly Payday */}
      {activeTab === 'treasury' && (
        <div className="bg-white border border-[#ccc] rounded p-4 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                💰 {selectedMcn?.name} Treasury & Monthly Payday
              </h3>
              <p className="text-xs text-gray-500">
                All network fees (from partner views, brand deals, and Content ID) pool into the MCN Treasury. Run monthly payouts to distribute earnings and generate vintage invoices.
              </p>
            </div>
            <div className="text-right">
              <span className="text-gray-500 text-[10px] block">MCN Treasury Vault</span>
              <strong className="text-base font-black text-green-700">
                ${(selectedMcn?.vaultBalance || 0).toFixed(2)} USD
              </strong>
            </div>
          </div>

          <div className="bg-linear-to-r from-emerald-50 to-green-100 border border-green-300 rounded p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h4 className="font-black text-green-950 text-xs">
                📅 Run Monthly Partner Payday Cycle
              </h4>
              <p className="text-xs text-green-800">
                Calculates aggregate view earnings for all {selectedMcn?.signedChannelIds.length} partners, disburses creator payouts ({selectedMcn?.splitPercentage}%), and deposits network cuts ({100 - selectedMcn?.splitPercentage}%) into treasury.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onRunMonthlyPayouts(selectedMcn.id);
                  playCashRegister(navSoundsEnabled);
                }}
                className="btn btn-primary text-xs py-2 px-4 font-bold shadow-2xs"
              >
                💵 Execute Payday Payouts
              </button>

              {isFounder && (
                <button
                  type="button"
                  onClick={() => {
                    const amt = Math.min(100, selectedMcn.vaultBalance);
                    if (amt > 0) {
                      onWithdrawVault(selectedMcn.id, amt);
                      playCashRegister(navSoundsEnabled);
                    }
                  }}
                  className="btn text-xs py-2 px-3 font-bold bg-white text-green-800 border-green-400 hover:bg-green-50"
                  title="Withdraw dividends into your creator wallet"
                >
                  Withdraw $100 Dividends
                </button>
              )}
            </div>
          </div>

          {/* Generated Royalty Invoices */}
          <div>
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider mb-2">
              Recent Partner Earnings Statements & Invoices
            </h4>

            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="p-2">Invoice ID</th>
                    <th className="p-2">Billing Period</th>
                    <th className="p-2">Partner Channel</th>
                    <th className="p-2">Monetized Views</th>
                    <th className="p-2">Gross Ad Revenue</th>
                    <th className="p-2">Creator Share</th>
                    <th className="p-2">MCN Cut</th>
                    <th className="p-2 text-right">View Statement</th>
                  </tr>
                </thead>
                <tbody>
                  {royaltyInvoices
                    .filter((inv) => inv.mcnId === selectedMcn?.id)
                    .map((inv) => {
                      const ch = users.find((u) => u.id === inv.channelId);
                      return (
                        <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2 font-mono text-gray-500">{inv.id}</td>
                          <td className="p-2 font-bold text-gray-800">{inv.period}</td>
                          <td className="p-2 font-bold text-blue-700">{ch?.username || inv.channelId}</td>
                          <td className="p-2">{inv.totalViews.toLocaleString()}</td>
                          <td className="p-2 font-bold">${inv.grossRevenue.toFixed(2)}</td>
                          <td className="p-2 font-bold text-green-700">${inv.creatorCut.toFixed(2)}</td>
                          <td className="p-2 font-bold text-gray-700">${inv.networkCut.toFixed(2)}</td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingInvoice(inv)}
                              className="text-blue-700 hover:underline font-bold"
                            >
                              📄 Printable Statement
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: 2009 Royalty-Free Music Library */}
      {activeTab === 'music_vault' && (
        <div className="bg-white border border-[#ccc] rounded p-4 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                🎵 2009-2011 Royalty-Free Audio Vault
              </h3>
              <p className="text-xs text-gray-500">
                Exclusive copyright-cleared tracks for network partners (009 Sound System, Kevin MacLeod). Audition tracks via Web Audio synthesizer or attach to your videos!
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
              Clearance Provided by {selectedMcn?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VINTAGE_MUSIC_TRACKS.map((track) => {
              const isPlaying = playingTrackId === track.id;
              return (
                <div key={track.id} className="bg-gray-50 border border-gray-300 rounded p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">{track.title}</h4>
                      <span className="text-[10px] text-gray-500">{track.artist} • {track.genre}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{track.bpm} BPM</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => previewSynthTrack(track)}
                      className={`btn text-xs py-1 px-3 font-bold ${
                        isPlaying ? 'bg-green-600 text-white border-green-700' : 'bg-white text-gray-800'
                      }`}
                    >
                      {isPlaying ? '⏹️ Stop Chime' : '▶️ Audition Synthesizer'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={musicVideoTargetId}
                        onChange={(e) => setMusicVideoTargetId(e.target.value)}
                        className="text-[11px] p-1 border rounded bg-white"
                      >
                        {videos
                          .filter((v) => v.authorId === currentUser.id)
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.title}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (musicVideoTargetId) {
                            onAttachMusicToVideo(musicVideoTargetId, track.title);
                            playCashRegister(navSoundsEnabled);
                          }
                        }}
                        className="btn btn-primary text-xs py-1 px-2 font-bold"
                      >
                        Attach Track
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Contract Split & Buyout Simulator */}
      {activeTab === 'royalty_calc' && (
        <div className="space-y-4">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-neutral-900 to-red-950 text-white rounded p-4 border border-neutral-700 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-red-400 font-mono font-bold block">
                  Interactive Economics Engine
                </span>
                <h2 className="text-base font-black">
                  MCN Partner Royalty Split & Contract Buyout Center
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  Simulate ad revenue distribution, compare network deals vs independence, and exercise legal early contract buyouts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">Your Channel Balance:</span>
                <span className="bg-green-900/80 border border-green-600 px-2 py-1 rounded text-xs font-mono font-black text-green-300">
                  ${(currentUser.balance || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Buyout Alert Toast */}
          {buyoutStatus && (
            <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs font-bold text-amber-900 flex justify-between items-center shadow-xs">
              <div className="flex items-center gap-1.5">
                <span>⚖️</span>
                <span>{buyoutStatus}</span>
              </div>
              <button
                type="button"
                onClick={() => setBuyoutStatus(null)}
                className="text-gray-400 hover:text-black font-mono"
              >
                ✕
              </button>
            </div>
          )}

          {/* Interactive Calculator Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-4">
              <h3 className="font-black text-xs text-gray-900 uppercase tracking-wide border-b pb-1.5 flex items-center gap-1.5">
                <span>🎛️</span>
                <span>Revenue Simulation Parameters</span>
              </h3>

              {/* Views Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Monthly Video Views:</span>
                  <span className="text-red-700 font-mono">{simViews.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={5000000}
                  step={10000}
                  value={simViews}
                  onChange={(e) => setSimViews(parseInt(e.target.value, 10))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>10K</span>
                  <span>500K</span>
                  <span>1M</span>
                  <span>5M</span>
                </div>
              </div>

              {/* CPM Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Effective Ad CPM ($):</span>
                  <span className="text-red-700 font-mono">${simCpm.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={1.00}
                  max={12.00}
                  step={0.25}
                  value={simCpm}
                  onChange={(e) => setSimCpm(parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>$1.00 (Standard)</span>
                  <span>$5.00 (Gaming/Tech)</span>
                  <span>$12.00 (Fin/Premium)</span>
                </div>
              </div>

              {/* Creator Split % Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Creator Split Rate:</span>
                  <span className="text-red-700 font-mono">{simSplit}% / {100 - simSplit}% MCN</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={simSplit}
                  onChange={(e) => setSimSplit(parseInt(e.target.value, 10))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>50/50</span>
                  <span>70/30 (Machinima)</span>
                  <span>80/20</span>
                  <span>100% (Independent)</span>
                </div>
              </div>

              {/* Quick Split Presets */}
              <div className="pt-2 border-t border-gray-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Historical Split Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => { setSimSplit(70); setSimCpm(2.5); }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 border border-gray-300"
                  >
                    2010 Machinima (70/30)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSimSplit(80); setSimCpm(3.2); }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 border border-gray-300"
                  >
                    2011 Maker Studios (80/20)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSimSplit(90); setSimCpm(4.5); }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 border border-gray-300"
                  >
                    2012 Fullscreen VIP (90/10)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSimSplit(100); setSimCpm(2.0); }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 border border-gray-300"
                  >
                    100% Free Agent
                  </button>
                </div>
              </div>
            </div>

            {/* Middle: Calculated Breakdown */}
            {(() => {
              const grossMonthly = (simViews / 1000) * simCpm;
              const creatorMonthly = grossMonthly * (simSplit / 100);
              const mcnCutMonthly = grossMonthly * ((100 - simSplit) / 100);
              const creatorAnnual = creatorMonthly * 12;

              return (
                <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-xs text-gray-900 uppercase tracking-wide border-b pb-1.5 flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Simulated Monthly Royalty Payout</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-gray-50 border border-gray-200 rounded p-2.5">
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">Gross Ad Revenue</span>
                        <strong className="text-base font-black text-gray-800 font-mono">
                          ${grossMonthly.toFixed(2)}
                        </strong>
                        <span className="text-[9px] text-gray-400 block mt-0.5">Based on {simViews.toLocaleString()} views</span>
                      </div>

                      <div className="bg-green-50 border border-green-300 rounded p-2.5">
                        <span className="text-[10px] text-green-700 uppercase font-bold block">Creator Take-Home</span>
                        <strong className="text-base font-black text-green-700 font-mono">
                          ${creatorMonthly.toFixed(2)}
                        </strong>
                        <span className="text-[9px] text-green-600 block mt-0.5">{simSplit}% Partner Share</span>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded p-2.5">
                        <span className="text-[10px] text-red-700 uppercase font-bold block">MCN Treasury Cut</span>
                        <strong className="text-base font-black text-red-700 font-mono">
                          ${mcnCutMonthly.toFixed(2)}
                        </strong>
                        <span className="text-[9px] text-red-600 block mt-0.5">{100 - simSplit}% Network Fee</span>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-2.5">
                        <span className="text-[10px] text-blue-700 uppercase font-bold block">Annualized Run-Rate</span>
                        <strong className="text-base font-black text-blue-700 font-mono">
                          ${creatorAnnual.toFixed(2)}
                        </strong>
                        <span className="text-[9px] text-blue-600 block mt-0.5">12-month projection</span>
                      </div>
                    </div>

                    {/* Progress Bar of Split */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-green-700">Creator ({simSplit}%)</span>
                        <span className="text-red-700">Network ({100 - simSplit}%)</span>
                      </div>
                      <div className="w-full h-3 bg-red-200 rounded-full overflow-hidden flex">
                        <div
                          className="bg-green-600 h-full transition-all duration-300"
                          style={{ width: `${simSplit}%` }}
                        />
                        <div
                          className="bg-red-600 h-full transition-all duration-300"
                          style={{ width: `${100 - simSplit}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                    💡 <em>Pro-Tip:</em> While top MCNs take a 10%-30% cut, their premium direct sales force often secures 2x-3x higher CPMs and Content ID claim protections than independent AdSense.
                  </div>
                </div>
              );
            })()}

            {/* Right: Contract Buyout Clause & Early Release */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xs text-gray-900 uppercase tracking-wide border-b pb-1.5 flex items-center gap-1.5">
                  <span>📜</span>
                  <span>Contract Buyout Clause (Early Release)</span>
                </h3>

                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  In 2011 YouTube lore, creators signed to long-term multi-year network contracts could legally negotiate an early release through buyout clauses.
                </p>

                <div className="bg-neutral-50 border border-neutral-300 rounded p-3 my-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Your Current Status:</span>
                    <strong className={currentUser.activeContract ? 'text-red-700' : 'text-green-700'}>
                      {currentUser.activeContract
                        ? `Signed to ${mcns.find((m) => m.id === currentUser.activeContract)?.name || 'Network'}`
                        : 'Free Agent (Independent)'}
                    </strong>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Contract Lock-in Period:</span>
                    <strong className="text-gray-800">
                      {selectedMcn?.contractTermMonths || 24} Months
                    </strong>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Early Release Buyout Fee:</span>
                    <strong className="text-red-700 font-mono font-bold">$150.00 USD</strong>
                  </div>
                </div>
              </div>

              <div>
                {currentUser.activeContract ? (
                  <button
                    type="button"
                    onClick={handleExecuteBuyout}
                    className="w-full btn text-xs py-2 px-3 bg-red-600 text-white hover:bg-red-700 border-red-700 font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💸</span>
                    <span>Pay $150 Buyout & Break Contract</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full btn text-xs py-2 px-3 bg-gray-100 text-gray-400 border-gray-300 font-bold cursor-not-allowed"
                  >
                    ✓ No Active Lock-in (Free Agent)
                  </button>
                )}
                <span className="text-[10px] text-gray-400 block text-center mt-1">
                  Exercising buyout pays fee from channel balance and releases all rights immediately.
                </span>
              </div>
            </div>
          </div>

          {/* Historical Contract Comparison Table */}
          <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
            <h3 className="font-black text-xs text-gray-900 uppercase tracking-wide border-b pb-2 mb-3">
              🏛️ 2011 YouTube Network Contract Comparison Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                    <th className="p-2 font-bold">Network</th>
                    <th className="p-2 font-bold">Partner Split</th>
                    <th className="p-2 font-bold">CPM Multiplier</th>
                    <th className="p-2 font-bold">Content ID Shield</th>
                    <th className="p-2 font-bold">Music Vault Access</th>
                    <th className="p-2 font-bold">Lock-in Term</th>
                    <th className="p-2 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mcns.map((net) => {
                    const isSigned = currentUser.activeContract === net.id;
                    return (
                      <tr key={net.id} className={isSigned ? 'bg-red-50/60 font-medium' : 'hover:bg-gray-50'}>
                        <td className="p-2 flex items-center gap-2">
                          {net.logoBase64 && (
                            <img src={net.logoBase64} alt={net.name} className="w-5 h-5 rounded object-cover" />
                          )}
                          <strong className="text-gray-900">{net.name}</strong>
                          <span className="text-[10px] text-gray-500 font-mono">[{net.tag}]</span>
                          {isSigned && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-1 rounded">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-bold text-gray-800">
                          {net.splitPercentage}% / {100 - net.splitPercentage}%
                        </td>
                        <td className="p-2 text-gray-700">{net.cpmMultiplier}x</td>
                        <td className="p-2 text-green-700 font-bold">✓ Included</td>
                        <td className="p-2 text-blue-700 font-bold">✓ 2009 Archive</td>
                        <td className="p-2 text-gray-600">{net.contractTermMonths} mos</td>
                        <td className="p-2">
                          {isSigned ? (
                            <button
                              type="button"
                              onClick={() => onVoidContract(currentUser.id)}
                              className="btn text-[11px] py-0.5 px-2 text-red-700 font-bold hover:bg-red-50"
                            >
                              Leave
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onSignContract(currentUser.id, net.id);
                                playMcnFanfare(navSoundsEnabled);
                              }}
                              className="btn btn-primary text-[11px] py-0.5 px-2 font-bold"
                            >
                              Sign Contract
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Scouting Offer Modal */}
      {scoutingChannelId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-gray-400 p-4 max-w-sm w-full space-y-3 shadow-lg">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-1">
              ✍️ Send Partner Contract to {users.find((u) => u.id === scoutingChannelId)?.username}
            </h3>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Upfront Signing Bonus ($):
              </label>
              <input
                type="number"
                min={0}
                step={10}
                value={signingBonus}
                onChange={(e) => setSigningBonus(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-1.5 border rounded bg-white font-bold"
              />
              <span className="text-[10px] text-gray-500">
                Transfers from your creator balance to entice them to sign!
              </span>
            </div>

            <div className="bg-gray-50 border p-2 rounded text-[11px] text-gray-600 space-y-1">
              <div>• Network: <strong>{selectedMcn?.name}</strong></div>
              <div>• Split: <strong>{selectedMcn?.splitPercentage}% / {100 - (selectedMcn?.splitPercentage || 70)}%</strong></div>
              <div>• CPM Multiplier: <strong>{selectedMcn?.cpmMultiplier}x</strong></div>
              <div>• Term: <strong>{selectedMcn?.contractTermMonths} Months</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setScoutingChannelId(null)}
                className="btn text-xs py-1 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSendContractOffer(scoutingChannelId, selectedMcn.id, signingBonus);
                  setScoutingChannelId(null);
                  playMcnFanfare(navSoundsEnabled);
                }}
                className="btn btn-primary text-xs py-1 px-4 font-bold"
              >
                Dispatched Offer 📬
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable 2011 Vintage MCN Statement Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-gray-400 p-6 max-w-lg w-full space-y-4 shadow-2xl font-sans">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-3">
              <div>
                <span className="font-mono text-gray-400 text-xs">MCN PARTNER REVENUE STATEMENT</span>
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  {selectedMcn?.name} [{selectedMcn?.tag}]
                </h2>
                <span className="text-[11px] text-gray-500">
                  Statement ID: {viewingInvoice.id} • Issued: {viewingInvoice.date}
                </span>
              </div>
              <div className="text-right">
                <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-xs">
                  STATUS: PAID ✓
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded border border-gray-200">
              <div>
                <span className="text-gray-400 block text-[10px]">PAYEE / CREATOR:</span>
                <strong className="text-gray-900">
                  {users.find((u) => u.id === viewingInvoice.channelId)?.username}
                </strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">ACCOUNTING PERIOD:</span>
                <strong className="text-gray-900">{viewingInvoice.period}</strong>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Total Monetized Video Views:</span>
                <span className="font-bold">{viewingInvoice.totalViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Gross YouTube Ad Revenue:</span>
                <span className="font-bold">${viewingInvoice.grossRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 text-red-700">
                <span>Network Administration Fee ({100 - (selectedMcn?.splitPercentage || 70)}%):</span>
                <span>-${viewingInvoice.networkCut.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-800 font-extrabold text-sm text-green-800">
                <span>Net Creator Payout Disbursed:</span>
                <span>${viewingInvoice.creatorCut.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 italic border-t pt-2">
              This digital invoice certifies royalty distribution according to standard 2011 YouTube MCN partner agreements.
            </div>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="btn text-xs py-1 px-4 font-bold"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
