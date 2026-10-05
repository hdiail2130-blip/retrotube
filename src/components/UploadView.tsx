import React, { useState } from 'react';
import { User, CustomAdSettings, VideoAdConfig, Annotation, AnnotationType, VideoCollaboration } from '../types';
import { extractYouTubeId } from '../utils/youtube';
import { processAndResizeImage, readAsBase64 } from '../utils/text';
import { startPCFanSound } from '../utils/audio';
import { AD_PRESETS } from '../utils/adCommercial';
import { DEFAULT_AVATAR } from '../data/initialData';
import { COLLAB_ROLE_PRESETS } from './VideoCollabModal';
import { parseWaybackUrl, WAYBACK_HISTORICAL_PRESETS, WaybackParsedResult } from '../utils/wayback';

interface UploadViewProps {
  currentUser: User;
  users: User[];
  categories: string[];
  navSounds: boolean;
  globalAd?: CustomAdSettings;
  onUploadVideo: (videoData: any) => void;
  onNavigate: (route: string) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  currentUser,
  users,
  categories,
  navSounds,
  globalAd,
  onUploadVideo,
  onNavigate,
}) => {
  const [uploadMode, setUploadMode] = useState<'local' | 'youtube' | 'wayback'>('youtube');
  const [waybackInput, setWaybackInput] = useState('');
  const [waybackParsed, setWaybackParsed] = useState<WaybackParsedResult | null>(null);
  const [highPerformanceMode, setHighPerformanceMode] = useState(true);
  const [authorId, setAuthorId] = useState(currentUser.id);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Entertainment');
  const [newCatName, setNewCatName] = useState('');
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytAuthorMode, setYtAuthorMode] = useState<'retro' | 'original'>('retro');
  const [originalCreatorName, setOriginalCreatorName] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Per-video Ad Configuration State
  const [adSelectionMode, setAdSelectionMode] = useState<'global' | 'custom' | 'none'>('global');
  const [customAdFile, setCustomAdFile] = useState<File | null>(null);
  const [customAdTitle, setCustomAdTitle] = useState('Exclusive Video Commercial Spot');
  const [customAdSponsorName, setCustomAdSponsorName] = useState('CyberSoda Energy Drink');
  const [customAdSponsorUrl, setCustomAdSponsorUrl] = useState('https://archive.org');
  const [customAdPreset, setCustomAdPreset] = useState<'custom_file' | 'cybersoda' | 'retro_console' | 'megahits' | 'vintage_cereal'>('cybersoda');
  const [customAdSkipSeconds, setCustomAdSkipSeconds] = useState(5);
  const [customAdTimestamps, setCustomAdTimestamps] = useState('0:08');

  // Initial Annotations State
  const [enableInitialAnnotations, setEnableInitialAnnotations] = useState(true);
  const [initialAnnotationType, setInitialAnnotationType] = useState<AnnotationType>('speech_bubble');
  const [initialAnnotationText, setInitialAnnotationText] = useState('Subscribe & Rate 5 Stars! ⭐⭐⭐⭐⭐');
  const [initialAnnotationStart, setInitialAnnotationStart] = useState(2);
  const [initialAnnotationEnd, setInitialAnnotationEnd] = useState(8);
  const [initialAnnotationLinkType, setInitialAnnotationLinkType] = useState<'none' | 'timestamp' | 'external'>('none');
  const [initialAnnotationLinkTarget, setInitialAnnotationLinkTarget] = useState('');

  // Channel Collaboration State
  const [isCollabEnabled, setIsCollabEnabled] = useState(false);
  const eligibleCollabUsers = users.filter((u) => u.id !== authorId);
  const [collabChannelId, setCollabChannelId] = useState(eligibleCollabUsers[0]?.id || '');
  const [collabRolePreset, setCollabRolePreset] = useState('Co-Creator & Co-Star');
  const [collabCustomRole, setCollabCustomRole] = useState('');
  const [collabSplitPercentage, setCollabSplitPercentage] = useState(50);
  const [collabNotes, setCollabNotes] = useState('');

  const fetchYouTubeInfo = async () => {
    const id = extractYouTubeId(ytUrl);
    if (!id) {
      setStatusMessage('Invalid YouTube URL or ID.');
      return;
    }

    setStatusMessage('Fetching YouTube metadata...');
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.author_name) {
        setOriginalCreatorName(data.author_name);
        setYtAuthorMode('original');
      }
      setStatusMessage('High-resolution YouTube metadata imported successfully!');
    } catch (err) {
      setStatusMessage('Direct metadata fetch failed, but video will still embed in high resolution.');
    }
  };

  const handleWaybackChange = (url: string) => {
    setWaybackInput(url);
    if (!url.trim()) {
      setWaybackParsed(null);
      return;
    }
    const parsed = parseWaybackUrl(url);
    setWaybackParsed(parsed);
    if (!title.trim() && parsed.snapshotYear) {
      setTitle(`Archived Video (${parsed.snapshotYear})`);
    }
    if (parsed.youtubeId) {
      fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${parsed.youtubeId}`)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.title && !title.trim()) setTitle(data.title);
          if (data.author_name && !originalCreatorName.trim()) {
            setOriginalCreatorName(data.author_name);
            setYtAuthorMode('original');
          }
        })
        .catch(() => {});
    }
  };

  const handleApplyWaybackPreset = (preset: typeof WAYBACK_HISTORICAL_PRESETS[0]) => {
    setWaybackInput(preset.url);
    setTitle(preset.title);
    setCategory(preset.category);
    setDesc(`${preset.desc}\n\nPreserved in the Internet Archive / Wayback Machine historical archive.`);
    const parsed = parseWaybackUrl(preset.url);
    setWaybackParsed(parsed);
    setStatusMessage(`Loaded Wayback Machine preset: ${preset.title}`);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage('Synthesizing hardware and processing stream assets...');

    // Play PC Fan sound effect
    startPCFanSound(navSounds);

    let finalAuthorId = authorId;
    let ytId: string | null = null;
    let waybackUrl: string | undefined = undefined;
    let waybackTimestamp: string | undefined = undefined;
    let waybackSnapshotDate: string | undefined = undefined;
    let waybackHighPerformanceUrl: string | undefined = undefined;
    let waybackEmbedUrl: string | undefined = undefined;
    let waybackOriginalUrl: string | undefined = undefined;
    let waybackPlaybackEngine: 'high_performance' | 'wayback_embed' | 'youtube' | undefined = undefined;
    let waybackMediaType: any = undefined;
    let streamUrl: string | undefined = undefined;

    if (uploadMode === 'youtube') {
      ytId = extractYouTubeId(ytUrl);
      if (!ytId) {
        setStatusMessage('Please enter a valid YouTube URL or 11-digit Video ID.');
        setIsProcessing(false);
        return;
      }

      if (ytAuthorMode === 'original' && originalCreatorName.trim()) {
        const creatorName = originalCreatorName.trim();
        const existing = users.find((u) => u.username.toLowerCase() === creatorName.toLowerCase());
        if (existing) {
          finalAuthorId = existing.id;
        } else {
          // Auto create channel
          finalAuthorId = `u_${Date.now()}`;
        }
      }
    } else if (uploadMode === 'wayback') {
      if (!waybackInput.trim()) {
        setStatusMessage('Please enter a valid Wayback Machine or Archive.org link.');
        setIsProcessing(false);
        return;
      }

      const parsed = waybackParsed || parseWaybackUrl(waybackInput);
      waybackUrl = parsed.rawUrl;
      waybackTimestamp = parsed.snapshotTimestamp;
      waybackSnapshotDate = parsed.snapshotDateFormatted;
      waybackMediaType = parsed.mediaType;
      waybackEmbedUrl = parsed.embedUrl;
      waybackOriginalUrl = parsed.originalUrl;
      waybackPlaybackEngine = highPerformanceMode ? 'high_performance' : 'wayback_embed';

      if (parsed.youtubeId) {
        ytId = parsed.youtubeId;
      }

      if (highPerformanceMode && parsed.highPerformanceStreamUrl) {
        waybackHighPerformanceUrl = parsed.highPerformanceStreamUrl;
        streamUrl = parsed.highPerformanceStreamUrl;
      } else if (parsed.mediaType === 'direct_stream') {
        streamUrl = parsed.rawUrl;
      }

      if (ytAuthorMode === 'original' && originalCreatorName.trim()) {
        const creatorName = originalCreatorName.trim();
        const existing = users.find((u) => u.username.toLowerCase() === creatorName.toLowerCase());
        if (existing) {
          finalAuthorId = existing.id;
        } else {
          finalAuthorId = `u_${Date.now()}`;
        }
      }
    }

    const finalCat = isCreatingNewCat && newCatName.trim() ? newCatName.trim() : category;

    // Process files
    let videoBase64 = '';
    if (uploadMode === 'local' && videoFile) {
      videoBase64 = await readAsBase64(videoFile);
    }

    let thumbBase64 = '';
    if (thumbFile) {
      thumbBase64 = await processAndResizeImage(thumbFile, 640, 480);
    } else if (ytId) {
      thumbBase64 = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    } else if (uploadMode === 'wayback') {
      thumbBase64 = 'https://placehold.co/640x360/0369a1/ffffff?text=Wayback+Machine+Archive';
    } else {
      thumbBase64 = 'https://placehold.co/640x360/cc181e/ffffff?text=RetroTube+Video';
    }

    const parseTimestamps = (input: string): number[] => {
      const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
      const res: number[] = [];
      for (const p of parts) {
        if (p.includes(':')) {
          const segs = p.split(':').map((n) => parseInt(n, 10));
          if (segs.length === 2 && !isNaN(segs[0]) && !isNaN(segs[1])) {
            res.push(segs[0] * 60 + segs[1]);
          }
        } else {
          const n = parseFloat(p);
          if (!isNaN(n) && n >= 0) res.push(Math.round(n));
        }
      }
      return res.length > 0 ? res.sort((a, b) => a - b) : [12];
    };

    let customAdConfig: VideoAdConfig | undefined = undefined;
    let customAdDisabled = false;

    if (adSelectionMode === 'none') {
      customAdDisabled = true;
      customAdConfig = {
        enabled: false,
        mode: 'none',
      };
    } else if (adSelectionMode === 'custom') {
      let adBase64: string | undefined = undefined;
      let fileName: string | undefined = undefined;
      let fileSize: string | undefined = undefined;

      if (customAdFile) {
        fileName = customAdFile.name;
        fileSize = `${(customAdFile.size / (1024 * 1024)).toFixed(1)} MB`;
        if (customAdFile.size < 25 * 1024 * 1024) {
          adBase64 = await readAsBase64(customAdFile);
        } else {
          adBase64 = URL.createObjectURL(customAdFile);
        }
      }

      customAdConfig = {
        enabled: true,
        mode: 'custom',
        title: customAdTitle.trim() || 'Video Commercial Break',
        sponsorName: customAdSponsorName.trim() || 'Featured Sponsor',
        sponsorUrl: customAdSponsorUrl.trim() || 'https://archive.org',
        adVideoBase64: adBase64,
        fileName,
        fileSize,
        skipCountdownSeconds: customAdSkipSeconds,
        timestamps: parseTimestamps(customAdTimestamps),
        activePreset: customAdFile ? 'custom_file' : customAdPreset,
      };
    } else {
      // Global
      customAdConfig = {
        enabled: true,
        mode: 'global',
      };
    }

    // Annotations
    const initialAnnotations: Annotation[] = [];
    if (enableInitialAnnotations && initialAnnotationText.trim()) {
      initialAnnotations.push({
        id: `ann_${Date.now()}`,
        type: initialAnnotationType,
        text: initialAnnotationText.trim(),
        startTime: initialAnnotationStart,
        endTime: Math.max(initialAnnotationStart + 2, initialAnnotationEnd),
        x: initialAnnotationType === 'title' ? 10 : 25,
        y: initialAnnotationType === 'title' ? 40 : 20,
        width: initialAnnotationType === 'title' ? 80 : 45,
        bgColor:
          initialAnnotationType === 'note'
            ? '#ffff88'
            : initialAnnotationType === 'speech_bubble'
            ? '#ffffff'
            : 'rgba(0,0,0,0.75)',
        textColor: initialAnnotationType === 'title' ? '#ffffff' : '#000000',
        fontSize: initialAnnotationType === 'title' ? 18 : 12,
        linkType: initialAnnotationLinkType,
        linkTarget: initialAnnotationLinkTarget.trim(),
      });
    }

    // Channel Collaboration
    let collaboration: VideoCollaboration | undefined = undefined;
    let collabRole: string | undefined = undefined;
    if (isCollabEnabled && collabChannelId && collabChannelId !== finalAuthorId) {
      collabRole = collabRolePreset === 'custom' ? (collabCustomRole.trim() || 'Collaborator') : collabRolePreset;
      collaboration = {
        channelId: collabChannelId,
        role: collabRole,
        splitPercentage: Number(collabSplitPercentage) || 0,
        notes: collabNotes.trim() || undefined,
        status: 'accepted',
      };
    }

    const newVideo = {
      id: `v_${Date.now()}`,
      authorId: finalAuthorId,
      originalCreatorName: ytAuthorMode === 'original' ? originalCreatorName.trim() : undefined,
      title: title.trim() || 'Untitled Video',
      desc: desc.trim(),
      category: finalCat,
      views: Math.floor(Math.random() * 500) + 10,
      ratingSum: 15,
      ratingCount: 3,
      time: uploadMode === 'youtube' ? '3:30' : uploadMode === 'wayback' ? '4:15' : '0:45',
      date: uploadMode === 'wayback' && waybackSnapshotDate ? waybackSnapshotDate : 'Just now',
      thumb: thumbBase64,
      videoBase64,
      youtubeId: ytId,
      waybackUrl,
      waybackTimestamp,
      waybackSnapshotDate,
      waybackHighPerformanceUrl,
      waybackEmbedUrl,
      waybackOriginalUrl,
      waybackPlaybackEngine,
      waybackMediaType,
      streamUrl,
      comments: [],
      customAdConfig,
      customAdDisabled,
      annotations: initialAnnotations,
      collabChannelId: isCollabEnabled ? collabChannelId : undefined,
      collabRole: isCollabEnabled ? collabRole : undefined,
      collaboration,
    };

    setTimeout(() => {
      onUploadVideo(newVideo);
    }, 1200);
  };

  return (
    <div className="card-panel max-w-2xl mx-auto my-4 text-xs select-none">
      <div className="section-header flex justify-between items-center">
        <span>Upload or Embed High-Resolution Video</span>
        <button type="button" onClick={() => onNavigate('home')} className="btn text-xs py-0.5 px-2">
          Cancel
        </button>
      </div>

      <form onSubmit={handleUploadSubmit} className="space-y-4">
        {/* Upload Channel Selector */}
        <div className="bg-amber-50 border border-amber-300 p-3 rounded space-y-1">
          <label className="font-bold text-gray-800 text-xs block">Publishing Account:</label>
          <select
            value={authorId}
            onChange={(e) => {
              const newAuthorId = e.target.value;
              setAuthorId(newAuthorId);
              if (collabChannelId === newAuthorId) {
                const nextCollab = users.find((u) => u.id !== newAuthorId);
                if (nextCollab) setCollabChannelId(nextCollab.id);
              }
            }}
            className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.subscribers} subs)
              </option>
            ))}
          </select>
        </div>

        {/* 🤝 Channel Collaboration & Co-Creator (Collab Partner) */}
        <div className="bg-emerald-50/70 border border-emerald-300 rounded p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🤝</span>
              <div>
                <span className="font-extrabold text-xs text-emerald-950">
                  Channel Collaboration & Co-Creator
                </span>
                <span className="ml-2 text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                  NEW UPDATE
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCollabEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsCollabEnabled(checked);
                  if (checked && (!collabChannelId || collabChannelId === authorId)) {
                    const fallback = users.find((u) => u.id !== authorId);
                    if (fallback) setCollabChannelId(fallback.id);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="text-[11px] text-emerald-900/80">
            Collaborate with another channel on this video upload! Features dual creator badges, co-author attribution, dual subscribe buttons, and automated ad & Super Chat revenue sharing.
          </div>

          {isCollabEnabled && (
            <div className="space-y-3 pt-1 border-t border-emerald-200">
              {/* Partner Channel Picker */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Collaborator Channel:
                </label>
                <select
                  value={collabChannelId}
                  onChange={(e) => setCollabChannelId(e.target.value)}
                  className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white focus:border-emerald-600"
                >
                  {users
                    .filter((u) => u.id !== authorId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.subscribers.toLocaleString()} subs • {u.topic || 'General'})
                      </option>
                    ))}
                </select>

                {/* Partner Preview Card */}
                {(() => {
                  const partner = users.find((u) => u.id === collabChannelId);
                  if (!partner) return null;
                  return (
                    <div className="mt-1.5 bg-white border border-emerald-200 rounded p-2 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={partner.avatarBase64 || DEFAULT_AVATAR}
                          alt={partner.username}
                          className="w-7 h-7 rounded border border-gray-300 object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-emerald-900">{partner.username}</div>
                          <div className="text-[10px] text-gray-500">
                            {partner.subscribers.toLocaleString()} subscribers • {partner.topic || 'Partner'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                        Linked Collab Partner
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Collab Role */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Collaboration Credit / Role:
                </label>
                <select
                  value={collabRolePreset}
                  onChange={(e) => setCollabRolePreset(e.target.value)}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white focus:border-emerald-600"
                >
                  {COLLAB_ROLE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {collabRolePreset === 'custom' && (
                  <input
                    type="text"
                    value={collabCustomRole}
                    onChange={(e) => setCollabCustomRole(e.target.value)}
                    placeholder="Enter custom role (e.g. Guest Animator, Voice Actor)..."
                    className="w-full text-xs p-1.5 border border-emerald-400 rounded bg-white mt-1.5"
                  />
                )}
              </div>

              {/* Revenue Split */}
              <div className="bg-amber-50/90 border border-amber-300 rounded p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1">
                    <span>💰</span>
                    <span>Ad & Tip Revenue Share Split:</span>
                  </span>
                  <span className="font-black text-xs text-amber-900 bg-white border border-amber-300 px-1.5 py-0.2 rounded">
                    {100 - collabSplitPercentage}% Author / {collabSplitPercentage}% Collab
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-bold">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={collabSplitPercentage}
                    onChange={(e) => setCollabSplitPercentage(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-500 font-bold">100%</span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: '50/50 Equal', val: 50 },
                    { label: '70/30 Standard', val: 30 },
                    { label: '60/40 Co-Star', val: 40 },
                    { label: 'Credit Only (0%)', val: 0 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setCollabSplitPercentage(p.val)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                        collabSplitPercentage === p.val
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collab Note / Joint Shoutout */}
              <div>
                <label className="font-bold text-gray-800 block mb-0.5">
                  Collaboration Note / Shoutout (Optional):
                </label>
                <input
                  type="text"
                  value={collabNotes}
                  onChange={(e) => setCollabNotes(e.target.value)}
                  placeholder="e.g. Co-created with my good friend! Check out their channel for part 2!"
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
                />
              </div>

              {/* Visual Dual Channel Badge Preview */}
              <div className="bg-gradient-to-r from-emerald-100/60 via-teal-50 to-cyan-50 border border-emerald-300 rounded p-2.5">
                <div className="text-[10px] font-bold text-emerald-950 uppercase mb-1">
                  Preview: Dual-Channel Player Attribution
                </div>
                <div className="bg-white border border-emerald-200 rounded p-2 flex items-center justify-between gap-2 shadow-2xs">
                  {/* Author */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={users.find((u) => u.id === authorId)?.avatarBase64 || DEFAULT_AVATAR}
                      alt="Author"
                      className="w-6 h-6 rounded border border-gray-300 object-cover"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-blue-700 truncate">
                        {users.find((u) => u.id === authorId)?.username}
                      </div>
                      <div className="text-[9px] text-gray-400">Publisher</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-1 text-emerald-700 font-extrabold text-xs">
                    <span>🤝</span>
                    <span className="text-[10px] bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded">
                      COLLAB
                    </span>
                  </div>

                  {/* Partner */}
                  <div className="flex items-center gap-1.5 min-w-0 text-right justify-end">
                    <div className="truncate">
                      <div className="font-bold text-xs text-emerald-700 truncate">
                        {users.find((u) => u.id === collabChannelId)?.username || 'Partner'}
                      </div>
                      <div className="text-[9px] text-emerald-600 truncate">
                        {collabRolePreset === 'custom' ? (collabCustomRole || 'Collab') : collabRolePreset}
                      </div>
                    </div>
                    <img
                      src={users.find((u) => u.id === collabChannelId)?.avatarBase64 || DEFAULT_AVATAR}
                      alt="Partner"
                      className="w-6 h-6 rounded border border-emerald-400 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="flex bg-gray-100 border-b text-xs font-bold flex-wrap">
            <button
              type="button"
              onClick={() => setUploadMode('youtube')}
              className={`flex-1 min-w-[140px] py-2 text-center cursor-pointer transition-colors ${
                uploadMode === 'youtube'
                  ? 'bg-white text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              📺 YouTube Embed Link
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('wayback')}
              className={`flex-1 min-w-[180px] py-2 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                uploadMode === 'wayback'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-600 font-black'
                  : 'text-gray-600 hover:text-black font-bold'
              }`}
            >
              <span>🏛️</span>
              <span>Wayback Machine / Archive.org</span>
              <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-mono font-bold">
                NEW
              </span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('local')}
              className={`flex-1 min-w-[140px] py-2 text-center cursor-pointer transition-colors ${
                uploadMode === 'local'
                  ? 'bg-white text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              📁 Local Video File (MP4/WEBM)
            </button>
          </div>

          <div className="p-3 bg-white">
            {uploadMode === 'youtube' ? (
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    YouTube Video URL or 11-digit Video ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                      className="flex-1 text-xs p-1.5 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={fetchYouTubeInfo}
                      className="btn btn-primary text-xs py-1.5 px-3 font-bold"
                    >
                      Fetch Info
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Supports 1080p, 60fps, high-def streaming with variable speeds.
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1.5">
                  <div className="font-bold text-gray-700">Attribution Option:</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ytAuthor"
                      checked={ytAuthorMode === 'retro'}
                      onChange={() => setYtAuthorMode('retro')}
                    />
                    <span>Publish to selected channel above ({users.find((u) => u.id === authorId)?.username})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ytAuthor"
                      checked={ytAuthorMode === 'original'}
                      onChange={() => setYtAuthorMode('original')}
                    />
                    <span>Auto-import as original creator channel:</span>
                    <input
                      type="text"
                      value={originalCreatorName}
                      onChange={(e) => setOriginalCreatorName(e.target.value)}
                      placeholder="Creator Name"
                      className="p-1 text-xs border rounded ml-1 bg-white"
                    />
                  </label>
                </div>
              </div>
            ) : uploadMode === 'wayback' ? (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>Wayback Machine / Archive.org Snapshot URL:</span>
                    </label>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">
                      Preserved 2005-2012 Web Archives
                    </span>
                  </div>
                  <input
                    type="text"
                    value={waybackInput}
                    onChange={(e) => handleWaybackChange(e.target.value)}
                    placeholder="e.g. https://web.archive.org/web/20090425010203/http://www.youtube.com/watch?v=dQw4w9WgXcQ or https://archive.org/details/..."
                    className="w-full text-xs p-2 border border-blue-400 rounded bg-blue-50/20 font-mono focus:bg-white"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                    <span>Supports web.archive.org captures, archive.org item details, embeds & direct MP4 streams.</span>
                  </div>
                </div>

                {/* High-Performance Direct Stream Toggle */}
                <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <div>
                        <span className="font-black text-xs text-emerald-950">
                          High-Performance Direct Stream (HTML5 Native):
                        </span>
                        <div className="text-[10px] text-emerald-800">
                          Bypasses heavy Wayback web page toolbars and HTML wrappers using raw byte-stream modifiers (<code>id_</code> / <code>oe_</code> / direct MP4) for 60fps hardware acceleration, fluid scrubbing, and zero CORS/iframe lag!
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={highPerformanceMode}
                        onChange={(e) => setHighPerformanceMode(e.target.checked)}
                        className="cursor-pointer h-4 w-4 accent-emerald-600"
                      />
                      <span className="text-xs font-bold text-emerald-900">Active</span>
                    </label>
                  </div>
                </div>

                {/* Live Parsed Diagnostic Box */}
                {waybackParsed && (
                  <div className="bg-amber-50/70 border border-amber-300 rounded p-2.5 space-y-1.5 text-xs text-amber-950">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        <span>🔍</span>
                        <span>Archive Inspection Diagnostic:</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold">
                        {waybackParsed.mediaType.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-200">
                      <div>
                        <span className="text-gray-500 block">Snapshot Date:</span>
                        <strong className="text-gray-900">
                          {waybackParsed.snapshotDateFormatted || 'Historical Internet Archive'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Stream Mode:</span>
                        <strong className={highPerformanceMode ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                          {highPerformanceMode ? '⚡ Direct Raw Byte Stream (HTML5)' : '📼 Original Archive Embed'}
                        </strong>
                      </div>
                      {waybackParsed.originalUrl && (
                        <div className="sm:col-span-2 truncate">
                          <span className="text-gray-500 block">Original Preserved Target:</span>
                          <span className="font-mono text-[10px] text-gray-700 truncate block">
                            {waybackParsed.originalUrl}
                          </span>
                        </div>
                      )}
                      {waybackParsed.highPerformanceStreamUrl && highPerformanceMode && (
                        <div className="sm:col-span-2 truncate">
                          <span className="text-emerald-700 font-bold block">Optimized Direct Stream Link:</span>
                          <span className="font-mono text-[10px] text-emerald-900 truncate block">
                            {waybackParsed.highPerformanceStreamUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 1-Click Historical Presets */}
                <div className="bg-gray-50 border border-gray-300 p-2.5 rounded space-y-1.5">
                  <div className="font-bold text-gray-800 text-[11px] flex items-center justify-between">
                    <span>1-Click Historical Wayback Machine Presets:</span>
                    <span className="text-[10px] text-gray-500">2006-2010 Preserved Classics</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {WAYBACK_HISTORICAL_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyWaybackPreset(p)}
                        className="p-1.5 bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded text-left cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <span className="text-base">{p.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] text-gray-800 truncate">{p.title}</div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {p.snapshotDate} • {p.category}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribution Mode */}
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1.5">
                  <div className="font-bold text-gray-700">Attribution Option:</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wbAuthor"
                      checked={ytAuthorMode === 'retro'}
                      onChange={() => setYtAuthorMode('retro')}
                    />
                    <span>Publish to selected channel above ({users.find((u) => u.id === authorId)?.username})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wbAuthor"
                      checked={ytAuthorMode === 'original'}
                      onChange={() => setYtAuthorMode('original')}
                    />
                    <span>Auto-import as original creator channel:</span>
                    <input
                      type="text"
                      value={originalCreatorName}
                      onChange={(e) => setOriginalCreatorName(e.target.value)}
                      placeholder="Creator Name"
                      className="p-1 text-xs border rounded ml-1 bg-white"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Video File:</label>
                <input
                  type="file"
                  accept="video/mp4, video/webm"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Supports MP4 and WebM. Simulated PC hardware whirr plays on upload!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video Metadata Inputs */}
        <div className="space-y-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Epic 2011 Vlog in High Definition"
              className="w-full text-xs font-bold p-1.5 border border-gray-300 rounded bg-white"
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Description:</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe your video... Timestamps like 0:05 will become clickable automatically!"
              rows={3}
              className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Category:</label>
              <select
                value={isCreatingNewCat ? '__NEW__' : category}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCreatingNewCat(true);
                  } else {
                    setIsCreatingNewCat(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__NEW__">+ Create New Category...</option>
              </select>

              {isCreatingNewCat && (
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New Category Name"
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white mt-1.5"
                />
              )}
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Custom Thumbnail (Optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                className="w-full text-xs"
              />
              <span className="text-[10px] text-gray-500">
                If omitted for YouTube, HQ thumbnail is automatically used.
              </span>
            </div>
          </div>
        </div>

        {/* Video Commercials & Ad Selection Section */}
        <div className="bg-amber-50/60 border border-amber-300 rounded p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-950 text-xs">
              <span className="text-sm">🟡</span>
              <span>Video Ad Selection & Iconic Yellow Lines</span>
            </div>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-200/80 px-1.5 py-0.2 rounded">
              Monetization Setting
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-800 block">
              Choose Ad Configuration for this Video:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Global */}
              <label
                className={`p-2 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                  adSelectionMode === 'global'
                    ? 'bg-amber-100/80 border-amber-500 font-bold shadow-2xs ring-1 ring-amber-400'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="radio"
                    name="uploadAdMode"
                    checked={adSelectionMode === 'global'}
                    onChange={() => setAdSelectionMode('global')}
                    className="accent-amber-600"
                  />
                  <span className="text-xs text-amber-950">Global Ad</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-tight">
                  Uses platform global commercial with standard yellow line cues.
                </p>
              </label>

              {/* Option 2: Specific */}
              <label
                className={`p-2 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                  adSelectionMode === 'custom'
                    ? 'bg-purple-100/80 border-purple-500 font-bold shadow-2xs ring-1 ring-purple-400'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="radio"
                    name="uploadAdMode"
                    checked={adSelectionMode === 'custom'}
                    onChange={() => setAdSelectionMode('custom')}
                    className="accent-purple-600"
                  />
                  <span className="text-xs text-purple-950">Specific Ad Video</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-tight">
                  Import a custom MP4 or choose dedicated sponsor for this video!
                </p>
              </label>

              {/* Option 3: Unselected / None */}
              <label
                className={`p-2 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                  adSelectionMode === 'none'
                    ? 'bg-gray-200 border-gray-500 font-bold shadow-2xs ring-1 ring-gray-400'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="radio"
                    name="uploadAdMode"
                    checked={adSelectionMode === 'none'}
                    onChange={() => setAdSelectionMode('none')}
                    className="accent-gray-600"
                  />
                  <span className="text-xs text-gray-800">No Ads (Ad-Free)</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-tight">
                  Unselected. Clean video without ad breaks or skip buttons.
                </p>
              </label>
            </div>
          </div>

          {/* Specific Ad Video Inputs */}
          {adSelectionMode === 'custom' && (
            <div className="bg-white border border-purple-200 rounded p-3 space-y-2.5 mt-2 shadow-2xs">
              <div className="font-extrabold text-[11px] text-purple-900 border-b border-purple-100 pb-1">
                Configure Specific Ad Video for this Upload:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">
                    Import Custom MP4 Ad File (Optional):
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={(e) => setCustomAdFile(e.target.files?.[0] || null)}
                    className="w-full text-[11px]"
                  />
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {customAdFile ? `✓ ${customAdFile.name} attached` : 'Or pick a retro preset below'}
                  </span>
                </div>

                {!customAdFile && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-0.5">
                      Retro Commercial Preset:
                    </label>
                    <select
                      value={customAdPreset}
                      onChange={(e) => setCustomAdPreset(e.target.value as any)}
                      className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                    >
                      {Object.entries(AD_PRESETS).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.badge} - {val.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Commercial Title:</label>
                  <input
                    type="text"
                    value={customAdTitle}
                    onChange={(e) => setCustomAdTitle(e.target.value)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Sponsor Brand Name:</label>
                  <input
                    type="text"
                    value={customAdSponsorName}
                    onChange={(e) => setCustomAdSponsorName(e.target.value)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">
                    Iconic Yellow Line Timestamps:
                  </label>
                  <input
                    type="text"
                    value={customAdTimestamps}
                    onChange={(e) => setCustomAdTimestamps(e.target.value)}
                    placeholder="e.g. 0:08, 0:30"
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white font-mono"
                  />
                  <span className="text-[10px] text-amber-800">
                    Yellow lines appear on the timeline at these timestamps!
                  </span>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">
                    Skip Button Countdown (Seconds):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={customAdSkipSeconds}
                    onChange={(e) => setCustomAdSkipSeconds(parseInt(e.target.value, 10) || 5)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Classic YouTube Annotations Section */}
        <div className="bg-red-50/60 border border-red-200 rounded p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-red-200 pb-1.5">
            <div className="flex items-center gap-1.5 font-extrabold text-red-950 text-xs">
              <span className="text-sm">💬</span>
              <span>Classic YouTube Annotations</span>
            </div>
            <label className="flex items-center gap-1 text-[11px] font-bold text-red-900 cursor-pointer">
              <input
                type="checkbox"
                checked={enableInitialAnnotations}
                onChange={(e) => setEnableInitialAnnotations(e.target.checked)}
                className="accent-red-600"
              />
              <span>Add Initial Annotation</span>
            </label>
          </div>

          {enableInitialAnnotations && (
            <div className="bg-white border border-red-100 rounded p-3 space-y-2.5 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Annotation Type:</label>
                  <select
                    value={initialAnnotationType}
                    onChange={(e) => setInitialAnnotationType(e.target.value as any)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white font-bold"
                  >
                    <option value="speech_bubble">🗨️ Speech Bubble</option>
                    <option value="note">📝 Iconic Yellow Note</option>
                    <option value="title">🔤 Title Overlay</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Start Time (Seconds):</label>
                  <input
                    type="number"
                    min={0}
                    value={initialAnnotationStart}
                    onChange={(e) => setInitialAnnotationStart(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">End Time (Seconds):</label>
                  <input
                    type="number"
                    min={initialAnnotationStart + 1}
                    value={initialAnnotationEnd}
                    onChange={(e) => setInitialAnnotationEnd(parseInt(e.target.value, 10) || 6)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Annotation Text:</label>
                <input
                  type="text"
                  value={initialAnnotationText}
                  onChange={(e) => setInitialAnnotationText(e.target.value)}
                  placeholder="e.g. Subscribe & Rate 5 Stars! ⭐⭐⭐⭐⭐"
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Optional Click Action:</label>
                  <select
                    value={initialAnnotationLinkType}
                    onChange={(e) => setInitialAnnotationLinkType(e.target.value as any)}
                    className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                  >
                    <option value="none">None (Display Text Only)</option>
                    <option value="timestamp">Jump to Video Timestamp</option>
                    <option value="external">Open Web Link</option>
                  </select>
                </div>

                {initialAnnotationLinkType !== 'none' && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-0.5">
                      {initialAnnotationLinkType === 'timestamp' ? 'Timestamp (Seconds e.g. 15):' : 'URL Link:'}
                    </label>
                    <input
                      type="text"
                      value={initialAnnotationLinkTarget}
                      onChange={(e) => setInitialAnnotationLinkTarget(e.target.value)}
                      placeholder={initialAnnotationLinkType === 'timestamp' ? '15' : 'https://archive.org'}
                      className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded text-xs font-bold">
            {statusMessage}
          </div>
        )}

        <div className="border-t pt-3 flex items-center justify-between">
          <button
            type="submit"
            disabled={isProcessing}
            className="btn btn-primary text-sm py-2 px-6 font-bold shadow-md"
          >
            {isProcessing ? 'Publishing...' : 'Upload & Broadcast Video'}
          </button>
          <button type="button" onClick={() => onNavigate('home')} className="btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
