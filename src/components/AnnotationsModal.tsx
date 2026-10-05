import React, { useState } from 'react';
import { Video, Annotation, AnnotationType } from '../types';

interface AnnotationsModalProps {
  isOpen: boolean;
  video: Video;
  currentTime?: number;
  onClose: () => void;
  onSaveAnnotations: (videoId: string, annotations: Annotation[]) => void;
  onNavigate?: (route: string, params?: Record<string, any>) => void;
}

export const AnnotationsModal: React.FC<AnnotationsModalProps> = ({
  isOpen,
  video,
  currentTime = 0,
  onClose,
  onSaveAnnotations,
}) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(video.annotations || []);
  const [selectedId, setSelectedId] = useState<string | null>(
    video.annotations && video.annotations.length > 0 ? video.annotations[0].id : null
  );

  // New/Editing annotation draft
  const selected = annotations.find((a) => a.id === selectedId) || null;

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddNew = (type: AnnotationType = 'speech_bubble') => {
    const start = Math.floor(currentTime);
    const end = start + 6;
    const newAnn: Annotation = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      text: type === 'speech_bubble' ? 'Check this out! Subscribe & Rate 5 Stars!' : 'Click here for part 2!',
      startTime: start,
      endTime: end,
      x: type === 'title' ? 10 : 25,
      y: type === 'title' ? 40 : 20,
      width: type === 'title' ? 80 : 35,
      bgColor: type === 'note' ? '#ffff88' : type === 'speech_bubble' ? '#ffffff' : '#000000',
      textColor: type === 'title' ? '#ffffff' : '#000000',
      fontSize: type === 'title' ? 20 : 12,
      linkType: 'none',
      linkTarget: '',
    };

    setAnnotations([...annotations, newAnn]);
    setSelectedId(newAnn.id);
  };

  const handleUpdateSelected = (updates: Partial<Annotation>) => {
    if (!selectedId) return;
    setAnnotations(
      annotations.map((a) => (a.id === selectedId ? { ...a, ...updates } : a))
    );
  };

  const handleDeleteSelected = (id: string) => {
    const updated = annotations.filter((a) => a.id !== id);
    setAnnotations(updated);
    if (selectedId === id) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleApplyPresetPosition = (pos: 'top_left' | 'top_right' | 'center' | 'bottom_left' | 'bottom_right') => {
    if (!selectedId) return;
    switch (pos) {
      case 'top_left':
        handleUpdateSelected({ x: 5, y: 10, width: 35 });
        break;
      case 'top_right':
        handleUpdateSelected({ x: 60, y: 10, width: 35 });
        break;
      case 'center':
        handleUpdateSelected({ x: 30, y: 35, width: 40 });
        break;
      case 'bottom_left':
        handleUpdateSelected({ x: 5, y: 65, width: 35 });
        break;
      case 'bottom_right':
        handleUpdateSelected({ x: 60, y: 65, width: 35 });
        break;
    }
  };

  const handleSave = () => {
    onSaveAnnotations(video.id, annotations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-xs select-none">
      <div className="bg-[#f0f0f0] border-2 border-[#999] rounded-md shadow-2xl w-full max-w-3xl overflow-hidden text-gray-900 font-sans my-auto">
        {/* Retro Window Header */}
        <div className="bg-gradient-to-r from-[#cc181e] via-[#e52d27] to-[#b31217] text-white px-3 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide">
                Classic YouTube Annotations Editor
              </h2>
              <p className="text-[10px] text-red-100 font-medium">
                Add Speech Bubbles, Notes, Spotlights, and Titles with interactive links and timestamps!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded bg-black/30 hover:bg-black/50 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 max-h-[78vh] overflow-y-auto text-xs">
          {/* Top action row: add types */}
          <div className="bg-white border border-gray-300 rounded p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs text-gray-800 mr-1">+ Add Annotation:</span>
              <button
                type="button"
                onClick={() => handleAddNew('speech_bubble')}
                className="btn text-xs py-1 px-2.5 font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>🗨️</span>
                <span>Speech Bubble</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddNew('note')}
                className="btn text-xs py-1 px-2.5 font-bold bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border-yellow-300 flex items-center gap-1 cursor-pointer"
              >
                <span>📝</span>
                <span>Note</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddNew('spotlight')}
                className="btn text-xs py-1 px-2.5 font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>🔦</span>
                <span>Spotlight</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddNew('title')}
                className="btn text-xs py-1 px-2.5 font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 flex items-center gap-1 cursor-pointer"
              >
                <span>🔤</span>
                <span>Title</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddNew('label')}
                className="btn text-xs py-1 px-2.5 font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>🏷️</span>
                <span>Label</span>
              </button>
            </div>

            <div className="text-[10px] text-gray-500 font-mono">
              Current Playhead: <strong className="text-gray-900">{formatTime(currentTime)}</strong>
            </div>
          </div>

          {/* Two-Column Editor Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Left Column: List of Annotations (4 cols) */}
            <div className="md:col-span-5 bg-white border border-gray-300 rounded p-2.5 shadow-2xs space-y-2">
              <div className="font-extrabold text-xs text-gray-800 border-b border-gray-200 pb-1 flex items-center justify-between">
                <span>Annotations on this Video ({annotations.length})</span>
                {annotations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnnotations([])}
                    className="text-[10px] text-red-600 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {annotations.length === 0 ? (
                  <div className="text-gray-400 italic text-center py-8">
                    No annotations yet. Click &quot;+ Add Annotation&quot; above to create speech bubbles, notes, or spotlight links!
                  </div>
                ) : (
                  annotations.map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => setSelectedId(ann.id)}
                      className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                        selectedId === ann.id
                          ? 'bg-amber-100/80 border-amber-500 font-bold shadow-2xs ring-1 ring-amber-400'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-1.5">
                        <span className="text-sm">
                          {ann.type === 'speech_bubble'
                            ? '🗨️'
                            : ann.type === 'note'
                            ? '📝'
                            : ann.type === 'spotlight'
                            ? '🔦'
                            : ann.type === 'title'
                            ? '🔤'
                            : '🏷️'}
                        </span>
                        <div className="truncate">
                          <div className="text-xs truncate">{ann.text || '[Empty Annotation]'}</div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {formatTime(ann.startTime)} - {formatTime(ann.endTime)}
                            {ann.linkType && ann.linkType !== 'none' ? ' • 🔗 Link' : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSelected(ann.id);
                        }}
                        className="text-gray-400 hover:text-red-700 font-black text-sm px-1 cursor-pointer"
                        title="Delete annotation"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Selected Annotation Inspector (7 cols) */}
            <div className="md:col-span-7 bg-white border border-gray-300 rounded p-3 shadow-2xs space-y-3">
              {selected ? (
                <>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                    <span className="font-extrabold text-xs text-gray-900 uppercase">
                      Edit Selected Annotation
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">
                      {selected.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Text input */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      Annotation Text:
                    </label>
                    <textarea
                      value={selected.text}
                      onChange={(e) => handleUpdateSelected({ text: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-red-600"
                      placeholder="Enter annotation caption..."
                    />
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Start Time (seconds):
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={selected.startTime}
                          onChange={(e) =>
                            handleUpdateSelected({ startTime: Math.max(0, parseInt(e.target.value, 10) || 0) })
                          }
                          className="w-full text-xs p-1 border border-gray-300 rounded bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSelected({ startTime: Math.floor(currentTime) })}
                          className="btn text-[10px] py-1 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer whitespace-nowrap"
                          title="Set start to current player time"
                        >
                          Now
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        End Time (seconds):
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={selected.endTime}
                          onChange={(e) =>
                            handleUpdateSelected({ endTime: Math.max(selected.startTime + 1, parseInt(e.target.value, 10) || 0) })
                          }
                          className="w-full text-xs p-1 border border-gray-300 rounded bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSelected({ endTime: Math.floor(currentTime) + 4 })}
                          className="btn text-[10px] py-1 px-1.5 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer whitespace-nowrap"
                          title="Set to 4s from now"
                        >
                          +4s
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Color Schemes */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">
                      Color Theme:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: 'Yellow Post-It', bg: '#ffff88', text: '#000000' },
                        { label: 'Classic White', bg: '#ffffff', text: '#000000' },
                        { label: 'YouTube Red', bg: '#cc181e', text: '#ffffff' },
                        { label: 'Cyan Blue', bg: '#0284c7', text: '#ffffff' },
                        { label: 'Dark Obsidian', bg: 'rgba(0,0,0,0.85)', text: '#ffffff' },
                        { label: 'Retro Green', bg: '#10b981', text: '#ffffff' },
                      ].map((theme) => (
                        <button
                          key={theme.label}
                          type="button"
                          onClick={() => handleUpdateSelected({ bgColor: theme.bg, textColor: theme.text })}
                          className="px-2 py-0.5 rounded text-[10px] font-bold border transition-transform hover:scale-105 cursor-pointer shadow-2xs"
                          style={{ backgroundColor: theme.bg, color: theme.text }}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Positioning & Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-gray-700">Screen Position & Layout:</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleApplyPresetPosition('top_left')}
                          className="text-[9px] bg-gray-100 hover:bg-gray-200 px-1 py-0.2 rounded border"
                        >
                          Top-L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetPosition('top_right')}
                          className="text-[9px] bg-gray-100 hover:bg-gray-200 px-1 py-0.2 rounded border"
                        >
                          Top-R
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetPosition('center')}
                          className="text-[9px] bg-gray-100 hover:bg-gray-200 px-1 py-0.2 rounded border"
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetPosition('bottom_right')}
                          className="text-[9px] bg-gray-100 hover:bg-gray-200 px-1 py-0.2 rounded border"
                        >
                          Bottom-R
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[9px] text-gray-500">X Position: {selected.x}%</span>
                        <input
                          type="range"
                          min={0}
                          max={85}
                          value={selected.x}
                          onChange={(e) => handleUpdateSelected({ x: parseInt(e.target.value, 10) })}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500">Y Position: {selected.y}%</span>
                        <input
                          type="range"
                          min={0}
                          max={85}
                          value={selected.y}
                          onChange={(e) => handleUpdateSelected({ y: parseInt(e.target.value, 10) })}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500">Width: {selected.width}%</span>
                        <input
                          type="range"
                          min={15}
                          max={90}
                          value={selected.width}
                          onChange={(e) => handleUpdateSelected({ width: parseInt(e.target.value, 10) })}
                          className="w-full accent-red-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Link Settings */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded p-2.5 space-y-1.5">
                    <div className="font-bold text-[11px] text-blue-900 flex items-center justify-between">
                      <span>🔗 Clickable Annotation Link (Optional):</span>
                      <span className="text-[9px] text-blue-600">Old YouTube Feature</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-600 mb-0.5">Link Target Type:</label>
                        <select
                          value={selected.linkType || 'none'}
                          onChange={(e) => handleUpdateSelected({ linkType: e.target.value as any })}
                          className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                        >
                          <option value="none">No Link (Plain Text Note)</option>
                          <option value="timestamp">Jump to Timestamp in this Video</option>
                          <option value="video">Open Another Video (Video ID)</option>
                          <option value="channel">Subscribe / Channel Page</option>
                          <option value="external">External Website URL</option>
                        </select>
                      </div>

                      {selected.linkType && selected.linkType !== 'none' && (
                        <div>
                          <label className="block text-[10px] text-gray-600 mb-0.5">
                            {selected.linkType === 'timestamp'
                              ? 'Timestamp (e.g. 52 or 1:15):'
                              : selected.linkType === 'video'
                              ? 'Video ID (e.g. v3):'
                              : selected.linkType === 'channel'
                              ? 'Channel ID (e.g. u1):'
                              : 'URL (e.g. https://...):'}
                          </label>
                          <input
                            type="text"
                            value={selected.linkTarget || ''}
                            onChange={(e) => handleUpdateSelected({ linkTarget: e.target.value })}
                            placeholder={
                              selected.linkType === 'timestamp'
                                ? '0:52'
                                : selected.linkType === 'video'
                                ? 'v2'
                                : 'Target...'
                            }
                            className="w-full text-xs p-1 border border-gray-300 rounded bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 italic text-center py-16">
                  Select an annotation on the left or add a new one to customize text, time ranges, and links!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#e2e2e2] border-t border-[#ccc] px-4 py-2.5 flex items-center justify-between gap-2 shadow-inner">
          <div className="text-[11px] text-gray-600">
            {annotations.length} annotation{annotations.length === 1 ? '' : 's'} configured for &quot;{video.title}&quot;
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn text-xs py-1 px-3 text-gray-700 bg-white hover:bg-gray-100 border-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary text-xs py-1 px-4 font-black cursor-pointer shadow-xs"
            >
              Save Annotations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
