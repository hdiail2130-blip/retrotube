import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { processAndResizeImage } from '../utils/text';
import { searchGiphyLive, extractGiphyId, GiphyGif, CURATED_GIPHY_LIBRARY } from '../utils/giphy';
import { GiphySearchModal } from './GiphySearchModal';

interface MediaBarProps {
  textareaId: string;
  channelId?: string;
  currentUser: User;
  users: User[];
  onInsertText: (token: string) => void;
  onOpenEmojiSizer?: (src: string) => void;
}

interface CuratedGif {
  id: string;
  category: 'memes' | 'reactions' | 'gaming' | 'dance' | 'animals';
  title: string;
  url: string;
  preview: string;
  tags: string[];
}

const CURATED_GIFS: CuratedGif[] = [
  // 2000s Classic Memes
  {
    id: 'm1',
    category: 'memes',
    title: 'Keyboard Cat',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3cyMTF2NWhnbjFsdzExbjY4ZWNyeDVvdG92MWcxb28waWc5b3V6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4vF7Xv63qH6K2j6s2F/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3cyMTF2NWhnbjFsdzExbjY4ZWNyeDVvdG92MWcxb28waWc5b3V6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4vF7Xv63qH6K2j6s2F/giphy.gif',
    tags: ['cat', 'piano', 'retro', 'keyboard', 'playhimoff', 'classic'],
  },
  {
    id: 'm2',
    category: 'memes',
    title: 'Dramatic Chipmunk',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZicGcxOTBzNm5xOHlqenY2ZjQxOTR5YjU4MWhhbzI4bTRpY3JzMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tP21kMc9KstODS0/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZicGcxOTBzNm5xOHlqenY2ZjQxOTR5YjU4MWhhbzI4bTRpY3JzMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tP21kMc9KstODS0/giphy.gif',
    tags: ['chipmunk', 'dramatic', 'shock', 'look', 'prairiedog'],
  },
  {
    id: 'm3',
    category: 'memes',
    title: 'Nyan Cat Space Loop',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1NHN5NXdzMndreWN0M2wwYzZlZmFpMDByNXRpdjRxbG05cjJscyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vQYbeX9K4L9vGvS/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1NHN5NXdzMndreWN0M2wwYzZlZmFpMDByNXRpdjRxbG05cjJscyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vQYbeX9K4L9vGvS/giphy.gif',
    tags: ['nyan', 'cat', 'rainbow', 'space', 'poptart', 'music'],
  },
  {
    id: 'm4',
    category: 'memes',
    title: 'Rick Astley Roll',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODF4OWVpeXB5NnVqOHdmeTI2dGxlMXp4dDdyajkyNXB4NHN6cGswciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vuw9m5wXviFIQ/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODF4OWVpeXB5NnVqOHdmeTI2dGxlMXp4dDdyajkyNXB4NHN6cGswciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vuw9m5wXviFIQ/giphy.gif',
    tags: ['rickroll', 'rickastley', 'dance', 'nevergonnagiveyouup', 'classic'],
  },
  {
    id: 'm5',
    category: 'memes',
    title: 'Charlie Bit My Finger',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmwwazN1YmJmaWwwc2Z3bXgyMHk5MnR2YTVscGRrcjN3ZDVzMmJidSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kC2ZgXfCO3TUI/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmwwazN1YmJmaWwwc2Z3bXgyMHk5MnR2YTVscGRrcjN3ZDVzMmJidSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kC2ZgXfCO3TUI/giphy.gif',
    tags: ['charlie', 'baby', 'funny', 'viral', 'classic'],
  },
  {
    id: 'm6',
    category: 'memes',
    title: 'Double Rainbow All The Way',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3Z2pwaTFwdGg1dzNka2ZnbWl2dmpybncwbHpsbXU2am45NnZpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hrN6bYppUxs2Y/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3Z2pwaTFwdGg1dzNka2ZnbWl2dmpybncwbHpsbXU2am45NnZpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hrN6bYppUxs2Y/giphy.gif',
    tags: ['rainbow', 'doublerainbow', 'nature', 'omg', 'whatdoesitmean'],
  },
  {
    id: 'm7',
    category: 'memes',
    title: 'Peanut Butter Jelly Time',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9mb2s0cTNucDR5Y3ZpZnZ6dW1iNW1ocGNlMXBvNHJ0dnB5YzhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IB9foBA4PVkKA/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9mb2s0cTNucDR5Y3ZpZnZ6dW1iNW1ocGNlMXBvNHJ0dnB5YzhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IB9foBA4PVkKA/giphy.gif',
    tags: ['banana', 'peanutbutter', 'jelly', 'dance', 'pbjt'],
  },
  {
    id: 'm8',
    category: 'memes',
    title: 'Badger Badger Mushroom',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjR6NG85enA1aHJldmd0ajhhNHNraXg5dmRhZ3dyZWhvYnlha2oxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zXHZWGLWNQkrS/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjR6NG85enA1aHJldmd0ajhhNHNraXg5dmRhZ3dyZWhvYnlha2oxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zXHZWGLWNQkrS/giphy.gif',
    tags: ['badger', 'mushroom', 'snake', 'flash', 'weebl'],
  },

  // Reactions
  {
    id: 'r1',
    category: 'reactions',
    title: 'Mind Blown Galaxy',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrZ3M2OXp2bmtidmNuZ3k5NW4xMnd2czR4cmFia3d4YjZic2FodyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrZ3M2OXp2bmtidmNuZ3k5NW4xMnd2czR4cmFia3d4YjZic2FodyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif',
    tags: ['mindblown', 'galaxy', 'timanderic', 'shocked', 'explosion', 'reaction'],
  },
  {
    id: 'r2',
    category: 'reactions',
    title: 'Popcorn Michael Jackson',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHRqczJvdWtiYm50cDFwM2p2enkyczVzcHl5YTVuY3VzN2ZhaWN0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pUeXcg80cO8I8/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHRqczJvdWtiYm50cDFwM2p2enkyczVzcHl5YTVuY3VzN2ZhaWN0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pUeXcg80cO8I8/giphy.gif',
    tags: ['popcorn', 'mj', 'eating', 'drama', 'watching', 'thriller'],
  },
  {
    id: 'r3',
    category: 'reactions',
    title: 'Picard Facepalm',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmtpYjB1anpmcWR0N3BwMzg3OG55NmZ5a20yNWlyNnAzc253OWlmeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6OWIl75ibpuFO/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmtpYjB1anpmcWR0N3BwMzg3OG55NmZ5a20yNWlyNnAzc253OWlmeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6OWIl75ibpuFO/giphy.gif',
    tags: ['facepalm', 'picard', 'startrek', 'disbelief', 'fail'],
  },
  {
    id: 'r4',
    category: 'reactions',
    title: 'Citizen Kane Clapping',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXVnd2U5enV6d3IwbDN5ejYxaXZ2b25xY3RjdmQzazIwaTVicGFzMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7rj2ZgttvgomY/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXVnd2U5enV6d3IwbDN5ejYxaXZ2b25xY3RjdmQzazIwaTVicGFzMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7rj2ZgttvgomY/giphy.gif',
    tags: ['clap', 'applause', 'bravo', 'citizenkane', 'slowclap'],
  },
  {
    id: 'r5',
    category: 'reactions',
    title: 'Leo DiCaprio Gatsby Cheers',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82MWkza3F5bXRvM2Qzd2t2eG15ZGF3NzlpbWF0eW04c214cTJ5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GCLlQnV7d42BRBRpdK/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82MWkza3F5bXRvM2Qzd2t2eG15ZGF3NzlpbWF0eW04c214cTJ5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GCLlQnV7d42BRBRpdK/giphy.gif',
    tags: ['cheers', 'gatsby', 'leonardo', 'champagne', 'congrats', 'toast'],
  },

  // Gaming
  {
    id: 'g1',
    category: 'gaming',
    title: '8-Bit Retro Mario',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2dnFwMXA0cW51cm51aGJwZW1tYW96eXJjNDRtd3pnYXF2dTN1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/atQF1zaSGqBTy/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2dnFwMXA0cW51cm51aGJwZW1tYW96eXJjNDRtd3pnYXF2dTN1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/atQF1zaSGqBTy/giphy.gif',
    tags: ['mario', 'nintendo', 'pixel', '8bit', 'gaming', 'retro'],
  },
  {
    id: 'g2',
    category: 'gaming',
    title: 'Minecraft Creeper Sss',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDcyNmgxajdtZTNpaTVoaG1vdHhrdWlsMXZ1Z3R4dnptZjRzNm1nZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cuHjncTuHW40g/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDcyNmgxajdtZTNpaTVoaG1vdHhrdWlsMXZ1Z3R4dnptZjRzNm1nZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cuHjncTuHW40g/giphy.gif',
    tags: ['minecraft', 'creeper', 'boom', 'gaming', 'classic'],
  },
  {
    id: 'g3',
    category: 'gaming',
    title: 'Sonic Running Fast',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndic29vOXh5dzRmdW12dWpwa3Zrc3Z4c2g5YTNwOWRtdmF4b2JjOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mdfPClWEizfO2qRTIE/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndic29vOXh5dzRmdW12dWpwa3Zrc3Z4c2g5YTNwOWRtdmF4b2JjOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mdfPClWEizfO2qRTIE/giphy.gif',
    tags: ['sonic', 'sega', 'fast', 'running', 'turbo', 'gaming'],
  },

  // Dance & Retro TV
  {
    id: 'd1',
    category: 'dance',
    title: 'Carlton Dance Fresh Prince',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWNwa3R1d2drNzR0dmgyZjZqbjR2Mm1oaGlkcHlnY20xdnpnaDBuNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pa37AAGzKXoqk/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWNwa3R1d2drNzR0dmgyZjZqbjR2Mm1oaGlkcHlnY20xdnpnaDBuNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pa37AAGzKXoqk/giphy.gif',
    tags: ['carlton', 'dance', 'freshprince', 'celebrate', 'groove'],
  },
  {
    id: 'd2',
    category: 'dance',
    title: 'Spiderman Dance Party',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXZpOWd5Zms3bnUwdm5ld3F6NXg1M2FwOXNldmJqMnZwb2Nsa3ptNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10hzvF9FTulBtK/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXZpOWd5Zms3bnUwdm5ld3F6NXg1M2FwOXNldmJqMnZwb2Nsa3ptNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10hzvF9FTulBtK/giphy.gif',
    tags: ['spiderman', 'dance', 'toby', 'funny', 'moves'],
  },

  // Animals & Lolcats
  {
    id: 'a1',
    category: 'animals',
    title: 'Typing Cat Working Hard',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnp3cWdrZnJ3a29sdzM3ZDF0N2I0Mm04Y3R6djRtbnpqbnVxbjU2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o0vwzuFwCGAFO/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnp3cWdrZnJ3a29sdzM3ZDF0N2I0Mm04Y3R6djRtbnpqbnVxbjU2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o0vwzuFwCGAFO/giphy.gif',
    tags: ['cat', 'typing', 'computer', 'work', 'busy', 'hacker'],
  },
  {
    id: 'a2',
    category: 'animals',
    title: 'Bouncing Vibing Cat',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGlsbmNlaDNud2pxMmoxYmFnOXVuc21yNHN1MnBxbHB4aWpjeGtpZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jpbnoe3UIa8TU8LM13/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGlsbmNlaDNud2pxMmoxYmFnOXVuc21yNHN1MnBxbHB4aWpjeGtpZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jpbnoe3UIa8TU8LM13/giphy.gif',
    tags: ['vibing', 'cat', 'music', 'bouncing', 'headbob'],
  },
];

export const MediaBar: React.FC<MediaBarProps> = ({
  channelId,
  currentUser,
  users,
  onInsertText,
  onOpenEmojiSizer,
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [emojiSize, setEmojiSize] = useState(24);

  // Giphy states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [onlineResults, setOnlineResults] = useState<GiphyGif[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(true);
  const [selectedEmbedGif, setSelectedEmbedGif] = useState<GiphyGif | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetChannel = users.find((u) => u.id === (channelId || currentUser.id));
  const isMember =
    targetChannel && currentUser.memberships && currentUser.memberships[targetChannel.id] !== undefined;
  const isOwner = targetChannel?.id === currentUser.id;

  // Filter curated GIFs
  const filteredCuratedGifs = CURATED_GIFS.filter((gif) => {
    const matchesCat = activeCategory === 'all' || gif.category === activeCategory;
    if (!searchQuery.trim()) return matchesCat;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      gif.title.toLowerCase().includes(q) || gif.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Live GIPHY search execution
  const executeGiphySearch = async (term: string) => {
    setIsSearchingOnline(true);
    try {
      const resp = await searchGiphyLive(term, 24);
      setOnlineResults(resp.results);
      setIsLiveApi(resp.isLiveApi);
    } catch {
      setOnlineResults([]);
      setIsLiveApi(false);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Initial load when Giphy drawer is toggled on
  useEffect(() => {
    if (showGiphy && onlineResults.length === 0) {
      executeGiphySearch(searchQuery);
    }
  }, [showGiphy]);

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      executeGiphySearch(val);
    }, 400);
  };

  const handleSearchGiphy = (q: string) => {
    executeGiphySearch(q);
  };

  const handleInsertGif = (url: string) => {
    onInsertText(`[gif:${url}]`);
  };

  const handleInsertCustomUrl = () => {
    const raw = customGifUrl.trim();
    if (!raw) return;
    const extractedId = extractGiphyId(raw);
    const url = extractedId
      ? `https://media.giphy.com/media/${extractedId}/giphy.gif`
      : raw;
    handleInsertGif(url);
    setCustomGifUrl('');
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndResizeImage(file, 128, 128).then((base64) => {
      if (base64) {
        onInsertText(`[emoji:${base64}:${emojiSize}]`);
      }
    });
    e.target.value = '';
  };

  const standardEmojis = [
    '😀', '😂', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎',
    '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔', '😳', '👻',
    '🔥', '👍', '👎', '🎉', '🌟', '❤️', '💯', '⚡', '🚀', '🐱',
    '💩', '👀', '✨', '💀', '👽', '🎮', '📺', '📼', '💿', '🕹️'
  ];

  return (
    <div className="text-xs mb-2 select-none">
      {/* Utility Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 bg-gradient-to-b from-[#f2f2f2] to-[#e4e4e4] border border-[#ccc] rounded-t px-2.5 py-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-gray-700 text-[11px] mr-1 flex items-center gap-1">
            <span>🎨</span>
            <span>Rich Media:</span>
          </span>

          <button
            type="button"
            onClick={() => {
              setShowEmojis(!showEmojis);
              setShowGiphy(false);
            }}
            className={`btn text-[11px] py-0.5 px-2.5 flex items-center gap-1 ${
              showEmojis ? 'bg-amber-200 border-amber-400 font-extrabold' : ''
            }`}
          >
            <span>😄</span>
            <span>Emojis & Perks</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showGiphy;
              setShowGiphy(next);
              setShowEmojis(false);
            }}
            className={`btn text-[11px] py-0.5 px-2.5 flex items-center gap-1 ${
              showGiphy ? 'bg-amber-200 border-amber-400 font-extrabold' : ''
            }`}
          >
            <span className="text-red-600 font-black">⚡</span>
            <span>GIF Hub</span>
            <span className="bg-red-600 text-white text-[8px] font-black px-1 rounded-full uppercase">
              Pro
            </span>
          </button>

          <label className="btn text-[11px] py-0.5 px-2.5 cursor-pointer flex items-center gap-1">
            <span>🖼️</span>
            <span>Upload File</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
          </label>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-gray-600">
          <span>Emoji Size:</span>
          <input
            type="range"
            min={16}
            max={64}
            value={emojiSize}
            onChange={(e) => setEmojiSize(parseInt(e.target.value, 10))}
            className="w-14 h-1.5 cursor-pointer accent-[#cc181e]"
          />
          <span className="font-bold text-gray-800 w-6 text-right">{emojiSize}px</span>
        </div>
      </div>

      {/* Emojis Drawer */}
      {showEmojis && (
        <div className="bg-[#fafafa] border border-t-0 border-[#ccc] p-3 rounded-b shadow-sm space-y-2.5">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Standard Emoticons & Icons:
            </div>
            <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded border border-gray-200">
              {standardEmojis.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => onInsertText(emo)}
                  className="hover:bg-amber-100 rounded p-1 text-base transition-transform hover:scale-130 cursor-pointer"
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Member Emojis */}
          {targetChannel?.membershipSettings?.enabled && (
            <div className="border-t border-gray-200 pt-2">
              <div className="text-[10px] font-bold text-green-800 flex items-center justify-between mb-1.5">
                <span>⭐ Exclusive Member Perks ({targetChannel.username}):</span>
                {isMember || isOwner ? (
                  <span className="text-green-600 font-extrabold">Unlocked ✓</span>
                ) : (
                  <span className="text-amber-700 font-bold">Locked (Members Only)</span>
                )}
              </div>

              {isMember || isOwner ? (
                <div className="flex flex-wrap gap-2 bg-green-50 p-2 border border-green-200 rounded">
                  {targetChannel.membershipSettings.emojis.length === 0 ? (
                    <span className="text-gray-500 text-[10px] italic">
                      No custom member emojis uploaded yet by channel owner.
                    </span>
                  ) : (
                    targetChannel.membershipSettings.emojis.map((em, idx) => (
                      <button
                        key={em.name}
                        type="button"
                        onClick={() =>
                          onInsertText(`[member_emoji:${targetChannel.id}:${idx}:${emojiSize}]`)
                        }
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-green-100 p-1.5 rounded border border-green-300 shadow-xs cursor-pointer"
                        title={`:${em.name}:`}
                      >
                        <img src={em.base64} alt={em.name} className="h-5 w-auto rounded" />
                        <span className="text-[10px] font-bold text-gray-700">:{em.name}:</span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 p-2.5 border border-amber-200 rounded text-center text-[11px] text-amber-900">
                  <span>Join this channel membership to unlock exclusive animated perks!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Better GIPHY Hub Drawer */}
      {showGiphy && (
        <div className="bg-[#fafafa] border border-t-0 border-[#ccc] p-3 rounded-b shadow-md space-y-2.5">
          {/* Top Search & Full Explorer Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchGiphy(searchQuery)}
                placeholder="Search live animated GIFs on GIPHY (e.g. keyboard cat, dance, lol)..."
                className="flex-1 text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white font-sans focus:outline-none focus:border-red-600 shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleSearchGiphy(searchQuery)}
                className="btn btn-primary text-xs py-1.5 px-3 font-bold"
              >
                Search
              </button>
            </div>

            {/* Direct URL Input */}
            <div className="flex gap-1.5">
              <input
                type="url"
                value={customGifUrl}
                onChange={(e) => setCustomGifUrl(e.target.value)}
                placeholder="🔗 Paste GIPHY link / ID..."
                className="w-40 text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-[11px]"
              />
              <button
                type="button"
                onClick={handleInsertCustomUrl}
                disabled={!customGifUrl.trim()}
                className="btn text-xs py-1.5 px-2 font-bold disabled:opacity-50"
              >
                + Insert
              </button>

              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="btn text-xs py-1.5 px-2.5 font-extrabold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 shadow-xs flex items-center gap-1"
                title="Open full interactive GIPHY Search & Embed Modal"
              >
                <span>🔍</span>
                <span>Open Explorer</span>
              </button>
            </div>
          </div>

          {/* Quick Trending / Category Pills */}
          <div className="flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 pb-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'all', label: '🔥 All GIFs' },
                { id: 'memes', label: '🕹️ 2000s Memes' },
                { id: 'reactions', label: '😂 Reactions' },
                { id: 'gaming', label: '🎮 Gaming' },
                { id: 'dance', label: '🕺 Dance & Party' },
                { id: 'animals', label: '🐱 Animals & Lolcats' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'all') {
                      executeGiphySearch(cat.id);
                    } else {
                      executeGiphySearch('');
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-xs cursor-pointer font-bold transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Live API Status Badge */}
            <div className="flex items-center gap-1 text-[10px]">
              <span
                className={`px-1.5 py-0.5 rounded font-black text-[9px] flex items-center gap-1 ${
                  isLiveApi ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isLiveApi ? 'LIVE GIPHY API' : 'OFFLINE LIBRARY'}</span>
              </span>
            </div>
          </div>

          {/* Selected Live GIPHY Embed Player Drawer (if user clicked inspect) */}
          {selectedEmbedGif && (
            <div className="bg-white border-2 border-red-500 rounded p-2 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-red-700 flex items-center gap-1">
                  <span>🎬 Live GIPHY Player:</span>
                  <span className="text-gray-700 font-normal truncate max-w-xs">{selectedEmbedGif.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEmbedGif(null)}
                  className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                >
                  ✕ Close Preview
                </button>
              </div>
              <div className="relative aspect-video max-h-48 w-full rounded overflow-hidden bg-black border border-gray-300">
                <iframe
                  src={selectedEmbedGif.embedUrl}
                  title={selectedEmbedGif.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleInsertGif(selectedEmbedGif.url)}
                  className="btn btn-primary text-xs py-1 px-3 font-bold"
                >
                  + Insert This GIF [gif:url]
                </button>
              </div>
            </div>
          )}

          {/* Online Results Header if active */}
          {onlineResults.length > 0 && searchQuery && (
            <div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded text-blue-900 font-bold text-[10px]">
              <span>🌐 Web GIPHY Live Search: &ldquo;{searchQuery}&rdquo; ({onlineResults.length} gifs)</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  executeGiphySearch('');
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}

          {/* GIFs Grid */}
          <div className="relative min-h-[130px] max-h-60 overflow-y-auto pr-1">
            {isSearchingOnline ? (
              <div className="flex items-center justify-center h-28 text-blue-600 font-bold text-xs gap-2">
                <span className="animate-spin text-base">⏳</span>
                <span>Streaming live animated GIFs from GIPHY...</span>
              </div>
            ) : onlineResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {onlineResults.map((gif) => (
                  <div
                    key={gif.id}
                    onClick={() => handleInsertGif(gif.url)}
                    className="relative aspect-square rounded border-2 border-gray-300 hover:border-red-600 cursor-pointer overflow-hidden group bg-black transition-all transform hover:scale-105 shadow-2xs"
                    title={`${gif.title} - Click to insert, or click preview icon`}
                  >
                    <img
                      src={gif.preview}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white text-[9px] font-bold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                      + Insert
                    </div>
                    {/* Embed Iframe Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmbedGif(gif);
                      }}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white text-[9px] font-bold p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Inspect live GIPHY player"
                    >
                      ▶
                    </button>
                  </div>
                ))}
              </div>
            ) : filteredCuratedGifs.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {filteredCuratedGifs.map((gif) => (
                  <div
                    key={gif.id}
                    onClick={() => handleInsertGif(gif.url)}
                    className="relative aspect-square rounded border-2 border-gray-300 hover:border-red-600 cursor-pointer overflow-hidden group bg-black transition-all transform hover:scale-105 shadow-2xs"
                    title={gif.title}
                  >
                    <img
                      src={gif.preview}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white text-[9px] font-bold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                      {gif.title}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs">
                No matching animated GIFs found for &ldquo;{searchQuery}&rdquo;. Try another term or paste a direct link!
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-gray-200">
            <span>Tip: Click any GIF to insert <code className="bg-gray-100 px-1 py-0.2 rounded border font-mono">[gif:url]</code></span>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="text-red-700 hover:underline font-bold"
            >
              Open Full GIPHY Live Embed Explorer ↗
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Embedded GIPHY Live Search Modal */}
      <GiphySearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectGif={(url) => handleInsertGif(url)}
        targetContextDescription="Insert GIF into your comment or reply"
      />
    </div>
  );
};
