import React, { useState } from 'react';
import { User, Video, VideoCollaboration } from '../types';
import { DEFAULT_AVATAR } from '../data/initialData';

interface VideoCollabModalProps {
  isOpen: boolean;
  video: Video;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSaveCollab: (videoId: string, collab: VideoCollaboration | null) => void;
  onNavigateChannel?: (channelId: string) => void;
}

export const COLLAB_ROLE_PRESETS = [
  { label: '🌟 Co-Creator & Co-Star (Equal Billing)', value: 'Co-Creator & Co-Star' },
  { label: '🎬 Co-Director & Producer', value: 'Co-Director & Producer' },
  { label: '🎤 Featured Collaborator (feat. @channel)', value: 'Featured Collaborator' },
  { label: '👾 Special Guest / Cameo Appearance', value: 'Special Guest' },
  { label: '🎵 Music & Soundtrack Feature', value: 'Music Feature' },
  { label: '💡 Writing & Creative Concept', value: 'Creative Partner' },
  { label: '✏️ Custom Role...', value: 'custom' },
];

export const VideoCollabModal: React.FC<VideoCollabModalProps> = ({
  isOpen,
  video,
  users,
  currentUser,
  onClose,
  onSaveCollab,
  onNavigateChannel,
}) => {
  if (!isOpen) return null;

  const existingCollab = video.collaboration || (video.collabChannelId ? {
    channelId: video.collabChannelId,
    role: video.collabRole || 'Featured Collaborator',
    splitPercentage: 50,
    status: 'accepted' as const,
  } : null);

  const author = users.find((u) => u.id === video.authorId);
  const eligibleChannels = users.filter((u) => u.id !== video.authorId);

  const [collabEnabled, setCollabEnabled] = useState<boolean>(!!existingCollab);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    existingCollab?.channelId || eligibleChannels[0]?.id || ''
  );
  const [rolePreset, setRolePreset] = useState<string>(() => {
    if (!existingCollab?.role) return 'Co-Creator & Co-Star';
    const found = COLLAB_ROLE_PRESETS.find((p) => p.value === existingCollab.role);
    return found ? found.value : 'custom';
  });
  const [customRoleText, setCustomRoleText] = useState<string>(
    existingCollab?.role && !COLLAB_ROLE_PRESETS.some((p) => p.value === existingCollab.role)
      ? existingCollab.role
      : ''
  );
  const [splitPercentage, setSplitPercentage] = useState<number>(
    existingCollab?.splitPercentage ?? 50
  );
  const [collabNotes, setCollabNotes] = useState<string>(
    existingCollab?.notes || ''
  );

  const selectedCollabUser = users.find((u) => u.id === selectedChannelId);

  const finalRole = rolePreset === 'custom'
    ? (customRoleText.trim() || 'Collaborator')
    : rolePreset;

  const handleSave = () => {
    if (!collabEnabled || !selectedChannelId) {
      onSaveCollab(video.id, null);
    } else {
      const collabData: VideoCollaboration = {
        channelId: selectedChannelId,
        role: finalRole,
        splitPercentage: Number(splitPercentage) || 0,
        notes: collabNotes.trim() || undefined,
        status: 'accepted',
      };
      onSaveCollab(video.id, collabData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 select-none">
      <div className="bg-white border-2 border-[#999] rounded-md max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl text-xs overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <div>
              <div className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                <span>Channel Collaboration Settings</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">2011 Co-Creator Hub</span>
              </div>
              <div className="text-[11px] text-emerald-100 truncate max-w-xs">
                {video.title}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-red-200 font-bold text-lg p-1 leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Main Enable Toggle */}
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <span>Enable Channel Collaboration</span>
                {collabEnabled && (
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-600 mt-0.5">
                Displays dual-channel badges on player, features both channels, and splits ad & Super Chat revenue.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={collabEnabled}
                onChange={(e) => setCollabEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {collabEnabled && (
            <>
              {/* Partner Channel Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 block">
                  Select Collaborator Channel:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="w-full text-xs font-bold p-2 border border-gray-300 rounded bg-white focus:border-emerald-600"
                  >
                    {eligibleChannels.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.subscribers.toLocaleString()} subs • {u.topic || 'General'})
                      </option>
                    ))}
                  </select>

                  {/* Selected Channel Quick Card */}
                  {selectedCollabUser && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={selectedCollabUser.avatarBase64 || DEFAULT_AVATAR}
                          alt={selectedCollabUser.username}
                          className="w-9 h-9 rounded border border-gray-300 object-cover"
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-xs flex items-center gap-1">
                            <span>{selectedCollabUser.username}</span>
                            {selectedCollabUser.topic && (
                              <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-medium">
                                {selectedCollabUser.topic}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {selectedCollabUser.subscribers.toLocaleString()} subscribers • Balance: ${selectedCollabUser.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {onNavigateChannel && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateChannel(selectedCollabUser.id);
                          }}
                          className="btn text-[10px] py-1 px-2"
                        >
                          View Channel ↗
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Collab Role / Credit */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 block">
                  Collaboration Credit / Role:
                </label>
                <select
                  value={rolePreset}
                  onChange={(e) => setRolePreset(e.target.value)}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white focus:border-emerald-600 font-medium"
                >
                  {COLLAB_ROLE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {rolePreset === 'custom' && (
                  <input
                    type="text"
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    placeholder="Enter custom role (e.g. Lead Animator, Voice Talent, Co-Writer)..."
                    className="w-full text-xs p-1.5 border border-emerald-400 rounded bg-emerald-50/40"
                  />
                )}
              </div>

              {/* Revenue Sharing Split */}
              <div className="bg-amber-50/80 border border-amber-300 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <span>💰</span>
                    <span>Collab Monetization & Revenue Split:</span>
                  </span>
                  <span className="font-black text-xs text-amber-800 bg-white border border-amber-300 px-2 py-0.5 rounded shadow-2xs">
                    {100 - splitPercentage}% {author?.username || 'Uploader'} / {splitPercentage}% {selectedCollabUser?.username || 'Collab'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-600">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={splitPercentage}
                    onChange={(e) => setSplitPercentage(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-gray-600">100%</span>
                </div>

                {/* Quick Split Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '50/50 Equal', val: 50 },
                    { label: '70/30 Standard', val: 30 },
                    { label: '60/40 Co-Star', val: 40 },
                    { label: '80/20 Guest', val: 20 },
                    { label: 'Credit Only (0%)', val: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setSplitPercentage(preset.val)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                        splitPercentage === preset.val
                          ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-amber-900/80">
                  Tip & Super Chat earnings and commercial ad revenue generated while this video is watched will be automatically split directly into each creator channel's bank account!
                </div>
              </div>

              {/* Collab Note / Shoutout */}
              <div className="space-y-1">
                <label className="font-bold text-gray-800 block">
                  Collab Shoutout / Description Note (Optional):
                </label>
                <input
                  type="text"
                  value={collabNotes}
                  onChange={(e) => setCollabNotes(e.target.value)}
                  placeholder="e.g. Special collab episode! Be sure to subscribe to both channels for part 2!"
                  className="w-full text-xs p-1.5 border border-gray-300 rounded"
                />
              </div>

              {/* Live Preview Box */}
              <div className="border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 rounded p-3 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-900 flex items-center justify-between">
                  <span>Dual Channel Display Preview:</span>
                  <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded font-mono">
                    WATCH & FEED VIEW
                  </span>
                </div>

                <div className="bg-white border border-emerald-200 rounded p-2 flex items-center justify-between gap-2 shadow-2xs">
                  {/* Author 1 */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={author?.avatarBase64 || DEFAULT_AVATAR}
                      alt={author?.username}
                      className="w-7 h-7 rounded border border-gray-300 object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-blue-700 truncate">{author?.username}</div>
                      <div className="text-[9px] text-gray-500">Publisher</div>
                    </div>
                  </div>

                  {/* Collab Badge */}
                  <div className="flex flex-col items-center px-1 flex-shrink-0">
                    <span className="text-base leading-none">🤝</span>
                    <span className="text-[8px] font-black text-emerald-800 uppercase tracking-tighter">
                      COLLAB
                    </span>
                  </div>

                  {/* Author 2 */}
                  <div className="flex items-center gap-1.5 min-w-0 text-right justify-end">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-emerald-700 truncate">
                        {selectedCollabUser?.username || 'Partner'}
                      </div>
                      <div className="text-[9px] text-emerald-600 truncate">{finalRole}</div>
                    </div>
                    <img
                      src={selectedCollabUser?.avatarBase64 || DEFAULT_AVATAR}
                      alt={selectedCollabUser?.username}
                      className="w-7 h-7 rounded border border-emerald-400 object-cover flex-shrink-0"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-emerald-800 text-center font-semibold">
                  Official Partnership • {finalRole} • {splitPercentage > 0 ? `${splitPercentage}% Revenue Share` : 'Credit Recognition'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#e8e8e8] border-t border-[#ccc] flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-600">
            {collabEnabled ? 'Dual channel credit will be active' : 'Solo creator upload'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn text-xs py-1 px-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary text-xs py-1 px-4 font-bold bg-emerald-700 hover:bg-emerald-800 border-emerald-900 text-white cursor-pointer shadow-sm"
            >
              Save Collaboration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
