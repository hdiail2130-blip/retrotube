import React, { useState } from 'react';
import { Playlist, Video } from '../types';

interface AddToPlaylistModalProps {
  video: Video | null;
  playlists: Playlist[];
  isOpen: boolean;
  onClose: () => void;
  onToggleVideoInPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylistWithVideo: (
    name: string,
    description: string,
    isPrivate: boolean,
    videoId: string
  ) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  video,
  playlists,
  isOpen,
  onClose,
  onToggleVideoInPlaylist,
  onCreatePlaylistWithVideo,
}) => {
  if (!isOpen || !video) return null;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    onCreatePlaylistWithVideo(
      newPlaylistName.trim(),
      newPlaylistDesc.trim(),
      isPrivate,
      video.id
    );

    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-white border-2 border-[#cc181e] rounded shadow-2xl max-w-sm w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#cc181e] to-[#990000] text-white px-3 py-2 flex items-center justify-between font-bold">
          <div className="flex items-center gap-1.5">
            <span>➕</span>
            <span>Save to Playlist</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 text-sm font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Video preview pill */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2.5">
          <img
            src={video.thumb}
            alt={video.title}
            className="w-12 h-8 object-cover rounded border border-gray-300 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 truncate">{video.title}</div>
            <div className="text-[10px] text-gray-500">{video.time} • Adding this specific video</div>
          </div>
        </div>

        {/* Existing Playlists Checklist */}
        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Select Playlists:
          </div>

          {playlists.length === 0 ? (
            <div className="text-gray-400 italic text-center py-3">
              No playlists found yet. Create one below!
            </div>
          ) : (
            <div className="space-y-1">
              {playlists.map((pl) => {
                const inPlaylist = pl.videoIds.includes(video.id);
                return (
                  <label
                    key={pl.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                      inPlaylist
                        ? 'bg-red-50 border-red-200 text-red-900 font-bold'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={inPlaylist}
                        onChange={() => onToggleVideoInPlaylist(pl.id, video.id)}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="truncate text-xs">{pl.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] text-gray-400">
                      {pl.isPrivate ? <span>🔒 Private</span> : <span>🌐 Public</span>}
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-bold">
                        {pl.videoIds.length}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Create New Playlist Inline Drawer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          {!showCreateForm ? (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="w-full btn py-1.5 px-3 font-bold text-red-700 hover:text-red-900 border-dashed border-red-300 hover:border-red-500 bg-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNew} className="space-y-2.5">
              <div className="font-bold text-gray-800 text-xs flex items-center justify-between">
                <span>New Playlist Info:</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-700 text-xs font-normal underline"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Favorite AMVs 2008"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white font-medium"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe your collection..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-700">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span>Keep Private (Only me)</span>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary py-1 px-3 font-bold text-xs shadow-xs"
                >
                  Create & Add Video
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-gray-100 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn py-1 px-4 font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
