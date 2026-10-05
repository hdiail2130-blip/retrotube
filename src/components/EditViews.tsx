import React, { useState } from 'react';
import { SubSpace, User, Video } from '../types';
import { processAndResizeImage } from '../utils/text';

interface EditVideoViewProps {
  video: Video;
  users: User[];
  onSave: (updatedVideo: Partial<Video>) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export const EditVideoView: React.FC<EditVideoViewProps> = ({
  video,
  users,
  onSave,
  onNavigate,
}) => {
  const [title, setTitle] = useState(video.title);
  const [desc, setDesc] = useState(video.desc);
  const [authorId, setAuthorId] = useState(video.authorId);
  const [youtubeId, setYoutubeId] = useState(video.youtubeId || '');
  const [views, setViews] = useState(video.views);
  const [ratingCount, setRatingCount] = useState(video.ratingCount);
  const [ratingSum, setRatingSum] = useState(video.ratingSum);
  const [newThumbFile, setNewThumbFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let thumbBase64 = video.thumb;
    if (newThumbFile) {
      thumbBase64 = await processAndResizeImage(newThumbFile, 640, 480);
    }

    onSave({
      title,
      desc,
      authorId,
      youtubeId: youtubeId.trim() || null,
      views,
      ratingCount,
      ratingSum,
      thumb: thumbBase64,
    });
  };

  return (
    <div className="card-panel max-w-xl mx-auto my-4 text-xs select-none">
      <div className="section-header flex justify-between items-center">
        <span>Edit Video Settings & Performance</span>
        <button
          type="button"
          onClick={() => onNavigate('watch', { id: video.id })}
          className="btn text-xs py-0.5 px-2"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-300 p-3 rounded">
          <label className="font-bold text-gray-800 block mb-1">Video Owner Channel:</label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full text-xs font-bold p-1.5 border rounded bg-white"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs font-bold p-1.5 border rounded bg-white"
            required
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Description:</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="w-full text-xs p-1.5 border rounded bg-white"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">YouTube Stream ID (Optional):</label>
          <input
            type="text"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="11-digit YouTube ID"
            className="w-full text-xs p-1.5 border rounded bg-white"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Replace Thumbnail:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewThumbFile(e.target.files?.[0] || null)}
            className="w-full text-xs"
          />
        </div>

        {/* Metrics Tuning */}
        <div className="bg-gray-50 border p-3 rounded grid grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-gray-600 block mb-1">Total Views:</label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs p-1 border rounded bg-white"
            />
          </div>
          <div>
            <label className="font-bold text-gray-600 block mb-1">Ratings Count:</label>
            <input
              type="number"
              value={ratingCount}
              onChange={(e) => setRatingCount(parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs p-1 border rounded bg-white"
            />
          </div>
          <div>
            <label className="font-bold text-gray-600 block mb-1">Ratings Sum:</label>
            <input
              type="number"
              value={ratingSum}
              onChange={(e) => setRatingSum(parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs p-1 border rounded bg-white"
            />
          </div>
        </div>

        <div className="border-t pt-3 flex justify-between">
          <button type="submit" className="btn btn-primary text-xs py-1.5 px-4 font-bold">
            Save Video
          </button>
          <button
            type="button"
            onClick={() => onNavigate('watch', { id: video.id })}
            className="btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

import { ChannelCustomizerView } from './ChannelCustomizerView';

export { ChannelCustomizerView };

interface EditChannelViewProps {
  channel: User;
  shopInventory: any;
  videos?: Video[];
  users?: User[];
  onSave: (updatedChannel: Partial<User>) => void;
  onDeleteChannel: (channelId: string) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export const EditChannelView: React.FC<EditChannelViewProps> = ({
  channel,
  shopInventory,
  videos = [],
  users = [],
  onSave,
  onDeleteChannel,
  onNavigate,
}) => {
  return (
    <ChannelCustomizerView
      channel={channel}
      videos={videos}
      users={users}
      shopInventory={shopInventory}
      onSave={onSave}
      onDeleteChannel={onDeleteChannel}
      onNavigate={onNavigate}
    />
  );
};

interface SubSpaceModalProps {
  space: SubSpace | null;
  users: User[];
  onClose: () => void;
  onSave: (spaceId: string, subChannelIds: string[]) => void;
  onDelete: (spaceId: string) => void;
}

export const SubSpaceModal: React.FC<SubSpaceModalProps> = ({
  space,
  users,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!space) return null;

  const [selectedIds, setSelectedIds] = useState<string[]>(space.subChannelIds || []);

  const toggleChannel = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-[#fcfcfc] border-2 border-gray-600 rounded-md shadow-2xl max-w-sm w-full overflow-hidden text-xs">
        <div className="bg-gradient-to-b from-gray-700 to-gray-900 text-white font-bold p-2.5 flex justify-between items-center text-xs">
          <span>Manage Curated Subspace: {space.name}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold leading-none cursor-pointer hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-gray-600 text-xs">
            Select creators to include in this custom subscription feed:
          </p>

          <div className="max-h-48 overflow-y-auto bg-white border border-gray-300 rounded p-2 space-y-1.5">
            {users.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleChannel(u.id)}
                />
                <span className="font-bold text-gray-800">{u.username}</span>
              </label>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={() => onDelete(space.id)}
              className="text-red-600 hover:underline font-bold"
            >
              Delete Space
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSave(space.id, selectedIds)}
                className="btn btn-primary text-xs py-1 px-3"
              >
                Save
              </button>
              <button type="button" onClick={onClose} className="btn text-xs py-1 px-3">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
