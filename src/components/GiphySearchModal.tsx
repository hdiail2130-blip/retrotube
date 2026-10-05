import React, { useState, useEffect, useRef } from 'react';
import { GiphyGif, searchGiphyLive, extractGiphyId, CURATED_GIPHY_LIBRARY } from '../utils/giphy';
import { playIEClick } from '../utils/audio';

interface GiphySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string, title?: string, embedUrl?: string) => void;
  navSoundsEnabled?: boolean;
  initialQuery?: string;
  targetContextDescription?: string; // e.g., "Insert into comment" or "Attach to Community Post"
}

export const GiphySearchModal: React.FC<GiphySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectGif,
  navSoundsEnabled = true,
  initialQuery = '',
  targetContextDescription = 'Insert into your RetroTube post or comment',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [rating, setRating] = useState('g');
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(true);
  const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<string>('trending');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const quickChips = [
    { id: 'trending', label: '🔥 Trending', query: '' },
    { id: 'memes', label: '🕹️ 2000s Memes', query: '2000s meme' },
    { id: 'reactions', label: '😂 Reactions', query: 'reaction' },
    { id: 'cats', label: '🐱 Cats & Animals', query: 'cat' },
    { id: 'dance', label: '🕺 Dance', query: 'dance party' },
    { id: 'gaming', label: '🎮 Retro Gaming', query: 'retro gaming' },
    { id: 'mindblown', label: '💥 Mind Blown', query: 'mind blown' },
    { id: 'popcorn', label: '🍿 Popcorn Drama', query: 'eating popcorn' },
    { id: 'rickroll', label: '🎤 Rick Astley', query: 'rickroll' },
    { id: 'celebrate', label: '🎉 Celebrate', query: 'cheers celebrate' },
    { id: 'fail', label: '🤦 Facepalm & Fail', query: 'facepalm' },
  ];

  // Perform search
  const executeSearch = async (queryToSearch: string, selectedRating: string = rating) => {
    setIsLoading(true);
    try {
      const resp = await searchGiphyLive(queryToSearch, 30, selectedRating);
      setResults(resp.results);
      setIsLiveApi(resp.isLiveApi);
      if (resp.results.length > 0 && !selectedGif) {
        setSelectedGif(resp.results[0]);
      }
    } catch {
      setResults(CURATED_GIPHY_LIBRARY);
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen) {
      executeSearch(searchQuery || '');
    }
  }, [isOpen]);

  // Debounced search on query change
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setActiveChip('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, 450);
  };

  const handleChipClick = (chip: typeof quickChips[0]) => {
    if (navSoundsEnabled) playIEClick();
    setActiveChip(chip.id);
    setSearchQuery(chip.query);
    executeSearch(chip.query);
  };

  const handleCustomImport = () => {
    const raw = customInput.trim();
    if (!raw) return;
    const extractedId = extractGiphyId(raw);
    const id = extractedId || `custom_${Date.now()}`;
    const url = raw.startsWith('http') ? raw : `https://media.giphy.com/media/${id}/giphy.gif`;
    const embedUrl = `https://giphy.com/embed/${id}`;

    const newGif: GiphyGif = {
      id,
      title: 'Imported GIPHY Asset',
      url,
      preview: url,
      embedUrl,
    };
    setSelectedGif(newGif);
    setResults((prev) => [newGif, ...prev]);
    setCustomInput('');
  };

  const handleSelectAndInsert = (gif: GiphyGif) => {
    if (navSoundsEnabled) playIEClick();
    onSelectGif(gif.url, gif.title, gif.embedUrl);
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(`Copied ${label}!`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#f0f0f0] border-2 border-[#808080] shadow-2xl rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-gray-800 font-sans">
        {/* Retro Title Bar */}
        <div className="bg-gradient-to-r from-[#cc181e] via-[#e52d27] to-[#b31217] text-white px-3 py-2 flex items-center justify-between shadow-xs select-none">
          <div className="flex items-center gap-2">
            <div className="bg-black/30 p-1 rounded font-black text-xs">GIPHY</div>
            <span className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
              <span>🎞️</span>
              <span>GIPHY Live Search & Embed Explorer</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isLiveApi ? 'bg-green-500 text-white' : 'bg-amber-400 text-black'
              }`}
              title={
                isLiveApi
                  ? 'Streaming live results from GIPHY v1 API'
                  : 'Operating via pre-cached retro library'
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{isLiveApi ? 'LIVE API' : 'OFFLINE MODE'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded bg-white/20 hover:bg-white/40 text-white font-black text-sm cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Action Header & Context Info */}
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex flex-wrap items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-1.5">
            <span className="font-bold">🎯 Destination:</span>
            <span className="text-gray-700 italic">{targetContextDescription}</span>
          </div>
          <div className="text-[11px] text-gray-600 flex items-center gap-2">
            <span>Powered by <strong>GIPHY™</strong></span>
            <span>•</span>
            <span>Tokens: <code className="bg-white px-1 py-0.5 rounded border border-gray-300 font-mono">[gif:url]</code></span>
          </div>
        </div>

        {/* Search Controls */}
        <div className="p-3 bg-gradient-to-b from-[#f9f9f9] to-[#ececec] border-b border-[#ccc] space-y-2.5">
          {/* Main Search Input */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                placeholder="Search millions of live animated GIFs (e.g. keyboard cat, popcorn, dancing, gaming)..."
                className="w-full text-xs sm:text-sm pl-8 pr-8 py-2 border border-gray-400 rounded bg-white shadow-inner focus:outline-none focus:border-red-600 font-sans"
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    executeSearch('');
                  }}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700 text-xs cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Rating Filter & Search Button */}
            <div className="flex items-center gap-1.5">
              <select
                value={rating}
                onChange={(e) => {
                  setRating(e.target.value);
                  executeSearch(searchQuery, e.target.value);
                }}
                className="text-xs py-2 px-2 border border-gray-400 rounded bg-white text-gray-700 cursor-pointer font-bold"
                title="Content Rating"
              >
                <option value="g">Rating: G</option>
                <option value="pg">Rating: PG</option>
                <option value="pg-13">Rating: PG-13</option>
                <option value="r">Rating: R</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  if (navSoundsEnabled) playIEClick();
                  executeSearch(searchQuery);
                }}
                disabled={isLoading}
                className="btn btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <span className="animate-spin text-sm">⏳</span>
                ) : (
                  <span>⚡</span>
                )}
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Trending Keyword Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mr-1">
              Trends:
            </span>
            {quickChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                  activeChip === chip.id
                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Direct GIPHY Link or ID Import */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-gray-200">
            <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">
              🔗 Or Paste Direct Giphy Link / ID:
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. https://giphy.com/gifs/4vF7Xv63qH6K2j6s2F or GIF ID"
              className="flex-1 text-xs px-2.5 py-1 border border-gray-300 rounded bg-white"
            />
            <button
              type="button"
              onClick={handleCustomImport}
              disabled={!customInput.trim()}
              className="btn text-xs py-1 px-3 font-bold disabled:opacity-50 cursor-pointer"
            >
              + Load GIF
            </button>
          </div>
        </div>

        {/* Main Content: Split View (Results Grid & Live Embedded Preview Player) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-white">
          {/* Left / Top: Results Grid */}
          <div className="flex-1 overflow-y-auto p-3 border-r border-gray-200 min-h-[220px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-2">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-bold text-xs">Streaming animated GIFs from GIPHY...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-2 text-center p-4">
                <span className="text-3xl">🔍</span>
                <span className="font-bold text-sm">No GIFs found for &ldquo;{searchQuery}&rdquo;</span>
                <p className="text-xs text-gray-400 max-w-sm">
                  Try another keyword, click one of the trending chips above, or paste a direct GIPHY link.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {results.map((gif) => {
                  const isCurrent = selectedGif?.id === gif.id;
                  return (
                    <div
                      key={gif.id}
                      onClick={() => {
                        if (navSoundsEnabled) playIEClick();
                        setSelectedGif(gif);
                      }}
                      onDoubleClick={() => handleSelectAndInsert(gif)}
                      className={`relative aspect-square rounded overflow-hidden border-2 cursor-pointer bg-neutral-900 group transition-all transform hover:scale-[1.02] shadow-2xs ${
                        isCurrent
                          ? 'border-red-600 ring-2 ring-red-400/50 shadow-md'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      title={`${gif.title} (Click to inspect, double-click to insert)`}
                    >
                      <img
                        src={gif.preview}
                        alt={gif.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Gradient Title Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end text-white">
                        <span className="text-[10px] font-bold line-clamp-1 leading-tight">
                          {gif.title}
                        </span>
                        <span className="text-[9px] text-amber-300 font-extrabold mt-0.5">
                          Click to Embed / Insert
                        </span>
                      </div>

                      {/* Selected Badge */}
                      {isCurrent && (
                        <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                          ACTIVE ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Live Embedded GIPHY Player & Action Console */}
          <div className="w-full md:w-80 bg-[#f7f7f7] flex flex-col p-3 overflow-y-auto space-y-3 shrink-0 border-t md:border-t-0 md:border-l border-gray-200">
            {selectedGif ? (
              <>
                <div className="border border-gray-300 bg-white rounded p-2 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1 flex items-center justify-between">
                    <span>🎬 Live Embedded Player</span>
                    <span className="bg-red-100 text-red-700 font-extrabold px-1 rounded text-[9px]">
                      GIPHY Iframe
                    </span>
                  </div>

                  {/* Official GIPHY Live Embed Iframe */}
                  <div className="relative aspect-video w-full rounded overflow-hidden bg-black border border-gray-300 shadow-inner">
                    <iframe
                      src={selectedGif.embedUrl}
                      title={selectedGif.title}
                      className="w-full h-full border-0 pointer-events-auto"
                      allowFullScreen
                    />
                  </div>

                  <div className="mt-2 text-xs font-bold text-gray-800 line-clamp-2">
                    {selectedGif.title}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center justify-between mt-1">
                    <span>ID: <code className="text-gray-700">{selectedGif.id}</code></span>
                    {selectedGif.sourceUrl && (
                      <a
                        href={selectedGif.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-bold"
                      >
                        View on GIPHY ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => handleSelectAndInsert(selectedGif)}
                  className="btn btn-primary w-full py-2.5 text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>✨</span>
                  <span>Insert This GIF</span>
                </button>

                {/* Copy Utilities */}
                <div className="space-y-1.5 bg-white border border-gray-300 rounded p-2.5 text-xs">
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Export & Share:
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(`[gif:${selectedGif.url}]`, '[gif:url] Token')
                    }
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>📋 Copy RetroTube Token</span>
                    <span className="text-[10px] text-gray-400 font-mono">[gif:...]</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedGif.url, 'Direct GIF Link')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>🔗 Copy Direct GIF URL</span>
                    <span className="text-[10px] text-gray-400 font-mono">.gif</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `<iframe src="${selectedGif.embedUrl}" width="480" height="270" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>`,
                        'GIPHY Iframe Embed Code'
                      )
                    }
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-xs font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>💻 Copy HTML Embed Code</span>
                    <span className="text-[10px] text-gray-400 font-mono">&lt;iframe&gt;</span>
                  </button>
                </div>

                {/* Notification toast */}
                {copiedNotification && (
                  <div className="bg-green-100 border border-green-400 text-green-800 text-xs font-bold p-2 rounded text-center animate-in fade-in">
                    ✓ {copiedNotification}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs text-center">
                <span>👈 Select any GIF on the left to preview the live GIPHY player and insert it.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-[#e9e9e9] border-t border-[#ccc] px-3 py-2 flex flex-wrap items-center justify-between text-xs text-gray-600 select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">RetroTube 2000s GIPHY Hub</span>
            <span>•</span>
            <span>Found {results.length} animated results</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn px-4 py-1 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            {selectedGif && (
              <button
                type="button"
                onClick={() => handleSelectAndInsert(selectedGif)}
                className="btn btn-primary px-4 py-1 text-xs font-bold cursor-pointer"
              >
                Insert Selected GIF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
