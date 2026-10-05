import React, { useState } from 'react';
import { Playlist, User, Video } from '../types';

interface PlaylistViewProps {
  playlist: Playlist;
  videos: Video[];
  users: User[];
  currentUser: User;
  onNavigateVideo: (id: string) => void;
  onNavigateChannel: (id: string) => void;
  onPlayAll: (playlist: Playlist) => void;
  onShufflePlay: (playlist: Playlist) => void;
  onRemoveVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  onAddVideoToPlaylist: (playlistId: string, videoId: string) => void;
  onReorderPlaylistVideo: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onUpdatePlaylistDetails: (playlistId: string, name: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onOpenAdjustViews: (video: Video) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  videos,
  users,
  currentUser,
  onNavigateVideo,
  onNavigateChannel,
  onPlayAll,
  onShufflePlay,
  onRemoveVideoFromPlaylist,
  onAddVideoToPlaylist,
  onReorderPlaylistVideo,
  onUpdatePlaylistDetails,
  onDeletePlaylist,
  onOpenAdjustViews,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const [editDesc, setEditDesc] = useState(playlist.description || '');
  const [showAddVideosDrawer, setShowAddVideosDrawer] = useState(false);
  const [searchVideoQuery, setSearchVideoQuery] = useState('');

  // Resolve playlist videos in order
  const playlistVideos: Video[] = playlist.videoIds
    .map((id) => videos.find((v) => v.id === id))
    .filter((v): v is Video => !!v);

  // Calculate total seconds and readable duration
  const totalSeconds = playlistVideos.reduce((acc, v) => {
    const parts = v.time.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) {
      return acc + parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return acc + parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return acc;
  }, 0);

  const formatTotalDuration = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${mins} min ${s} sec`;
  };

  const author = playlist.authorId
    ? users.find((u) => u.id === playlist.authorId)
    : currentUser;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdatePlaylistDetails(playlist.id, editName.trim(), editDesc.trim());
    setIsEditing(false);
  };

  const isSystemPlaylist = playlist.id === 'pl_wl' || playlist.id === 'pl_fav';

  // Available videos not yet in playlist
  const candidateVideos = videos.filter(
    (v) =>
      !playlist.videoIds.includes(v.id) &&
      (v.title.toLowerCase().includes(searchVideoQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchVideoQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 text-xs select-none mb-8">
      {/* Playlist Hero Banner */}
      <div className="card-panel bg-gradient-to-r from-[#fafafa] via-white to-[#f5f5f5] border border-[#ccc] p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Playlist Cover Art / Collage */}
            <div className="relative w-28 h-20 bg-gray-800 rounded border border-gray-400 overflow-hidden flex-shrink-0 shadow-md">
              {playlistVideos.length > 0 ? (
                <img
                  src={playlistVideos[0].thumb}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-black">
                  📁
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-white text-xs font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-2xs">
                  {playlist.videoIds.length} Videos
                </span>
              </div>
            </div>

            {/* Playlist Title & Meta */}
            <div className="space-y-1 min-w-0">
              {isEditing ? (
                <form onSubmit={handleSaveDetails} className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-sm font-bold p-1 border rounded bg-white"
                    required
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Playlist description..."
                    rows={2}
                    className="w-full text-xs p-1 border rounded bg-white"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary text-xs py-0.5 px-2 font-bold">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn text-xs py-0.5 px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black text-gray-900 tracking-tight">
                      {playlist.name}
                    </h1>
                    {playlist.isPrivate ? (
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                        🔒 Private
                      </span>
                    ) : (
                      <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                        🌐 Public
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-gray-700 text-xs px-1 cursor-pointer"
                      title="Edit title & description"
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  <p className="text-gray-600 text-xs max-w-xl">
                    {playlist.description || 'No description provided for this playlist.'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                    <span>
                      Created by{' '}
                      <button
                        type="button"
                        onClick={() => author && onNavigateChannel(author.id)}
                        className="font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        {author?.username || 'You'}
                      </button>
                    </span>
                    <span>•</span>
                    <span>{playlistVideos.length} videos</span>
                    <span>•</span>
                    <span>Total length: <strong className="text-gray-800">{formatTotalDuration(totalSeconds)}</strong></span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Master Control Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              disabled={playlistVideos.length === 0}
              onClick={() => onPlayAll(playlist)}
              className="btn btn-primary py-1.5 px-4 font-black flex items-center gap-1.5 shadow-sm text-xs cursor-pointer disabled:opacity-50"
            >
              <span>▶</span>
              <span>Play All</span>
            </button>

            <button
              type="button"
              disabled={playlistVideos.length === 0}
              onClick={() => onShufflePlay(playlist)}
              className="btn py-1.5 px-3 font-bold flex items-center gap-1.5 text-gray-800 hover:bg-gray-100 text-xs cursor-pointer disabled:opacity-50"
            >
              <span>🔀</span>
              <span>Shuffle</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddVideosDrawer(!showAddVideosDrawer)}
              className="btn py-1.5 px-3 font-bold text-red-700 border-red-300 hover:bg-red-50 text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>➕</span>
              <span>{showAddVideosDrawer ? 'Hide Add Videos' : 'Add Specific Video'}</span>
            </button>

            {!isSystemPlaylist && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Permanently delete "${playlist.name}"?`)) {
                    onDeletePlaylist(playlist.id);
                  }
                }}
                className="btn text-xs py-1.5 px-2 text-red-600 hover:bg-red-50 border-red-200"
                title="Delete this custom playlist"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Specific Videos Drawer */}
      {showAddVideosDrawer && (
        <div className="card-panel bg-amber-50/70 border border-amber-200 p-3 rounded-lg space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
              <span>➕</span>
              <span>Add Specific Video to "{playlist.name}"</span>
            </div>
            <input
              type="text"
              placeholder="Search videos by title or category..."
              value={searchVideoQuery}
              onChange={(e) => setSearchVideoQuery(e.target.value)}
              className="p-1 px-2 text-xs border border-amber-300 rounded bg-white w-64 font-medium"
            />
          </div>

          {candidateVideos.length === 0 ? (
            <div className="text-gray-500 italic py-2 text-center">
              All matching videos are already in this playlist!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {candidateVideos.map((vid) => {
                const vidAuthor = users.find((u) => u.id === vid.authorId);
                return (
                  <div
                    key={vid.id}
                    className="flex items-center gap-2 p-1.5 rounded bg-white border border-amber-200 hover:border-amber-400 shadow-2xs group"
                  >
                    <img
                      src={vid.thumb}
                      alt={vid.title}
                      className="w-14 h-9 object-cover rounded border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 text-[11px] truncate">
                        {vid.title}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {vidAuthor?.username} • {vid.time}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddVideoToPlaylist(playlist.id, vid.id)}
                      className="btn text-xs py-1 px-2 font-bold text-red-700 hover:bg-red-50 flex-shrink-0"
                      title="Add to playlist"
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Playlist Videos List */}
      <div className="card-panel bg-white border border-[#ccc] rounded-lg overflow-hidden shadow-xs">
        <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center justify-between font-bold text-gray-700">
          <span>Playlist Queue ({playlistVideos.length} items)</span>
          <span className="text-[11px] text-gray-500">
            Drag or use arrows to sort • Click to play
          </span>
        </div>

        {playlistVideos.length === 0 ? (
          <div className="p-8 text-center text-gray-500 space-y-2">
            <div className="text-3xl">📭</div>
            <div className="font-bold text-sm">This playlist is currently empty</div>
            <p className="text-xs text-gray-400">
              Click "Add Specific Video" above or click "+ Save to Playlist" on any video to add items here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {playlistVideos.map((video, idx) => {
              const vidAuthor = users.find((u) => u.id === video.authorId);
              const stars =
                video.ratingCount > 0
                  ? (video.ratingSum / video.ratingCount).toFixed(1)
                  : '5.0';

              return (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-2.5 hover:bg-gray-50 group transition-colors"
                >
                  {/* Position number & reorder arrows */}
                  <div className="flex flex-col items-center justify-center w-8 flex-shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onReorderPlaylistVideo(playlist.id, idx, idx - 1)}
                      className="text-[10px] text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <span className="font-mono font-bold text-gray-500 text-xs">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === playlistVideos.length - 1}
                      onClick={() => onReorderPlaylistVideo(playlist.id, idx, idx + 1)}
                      className="text-[10px] text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div
                    className="relative w-24 h-15 bg-black rounded overflow-hidden flex-shrink-0 cursor-pointer border border-gray-300 shadow-2xs group-hover:border-red-400"
                    onClick={() => onNavigateVideo(video.id)}
                  >
                    <img
                      src={video.thumb}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
                      {video.time}
                    </span>
                  </div>

                  {/* Video details */}
                  <div className="min-w-0 flex-1">
                    <h3
                      onClick={() => onNavigateVideo(video.id)}
                      className="font-bold text-blue-700 text-xs hover:underline cursor-pointer truncate"
                    >
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-0.5">
                      <button
                        type="button"
                        onClick={() => vidAuthor && onNavigateChannel(vidAuthor.id)}
                        className="hover:underline text-gray-700 font-medium"
                      >
                        {vidAuthor?.username || 'Unknown'}
                      </button>
                      <span>•</span>
                      <span>{video.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span className="text-amber-500">⭐ {stars}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigateVideo(video.id)}
                      className="btn text-xs py-1 px-2.5 font-bold"
                      title="Play this video now"
                    >
                      ▶ Play
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenAdjustViews(video)}
                      className="btn text-xs py-1 px-2 text-amber-700 hover:bg-amber-50 border-amber-300"
                      title="Adjust views count (God Mode)"
                    >
                      ⚡ {video.views.toLocaleString()} views
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveVideoFromPlaylist(playlist.id, video.id)}
                      className="btn text-xs py-1 px-2 text-red-600 hover:bg-red-50 border-red-200"
                      title="Remove from this playlist"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
