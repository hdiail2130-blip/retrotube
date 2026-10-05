import React, { useState } from 'react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string, description: string, isPrivate: boolean) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreatePlaylist,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlaylist(name.trim(), desc.trim(), isPrivate);
    setName('');
    setDesc('');
    setIsPrivate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-white border-2 border-[#cc181e] rounded shadow-2xl max-w-sm w-full overflow-hidden text-xs">
        <div className="bg-gradient-to-r from-[#cc181e] to-[#990000] text-white px-3 py-2 flex items-center justify-between font-bold">
          <div className="flex items-center gap-1.5">
            <span>📁</span>
            <span>Create New Playlist</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 text-sm font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Playlist Title *</label>
            <input
              type="text"
              placeholder="e.g. 2000s Classic Montages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-bold p-1.5 border rounded bg-white"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Description (Optional)</label>
            <textarea
              placeholder="Add details about this collection..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full text-xs p-1.5 border rounded bg-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1 bg-gray-50 p-2 rounded border border-gray-200">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="cursor-pointer"
            />
            <div>
              <span className="font-bold text-gray-800 block">Private Playlist</span>
              <span className="text-[10px] text-gray-500 block">
                Only visible to you on your channel
              </span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn py-1 px-3 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary py-1 px-4 font-bold text-xs shadow-xs"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
