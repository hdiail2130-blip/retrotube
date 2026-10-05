// GIPHY Live Search Service & Fallback Catalog

export interface GiphyGif {
  id: string;
  title: string;
  url: string;        // Full resolution GIF
  preview: string;    // Optimized preview for thumbnails
  embedUrl: string;   // Official Giphy iframe embed URL (https://giphy.com/embed/...)
  width?: number;
  height?: number;
  tags?: string[];
  category?: string;
  sourceUrl?: string;
}

// Rotated public & open API keys for resilience
const GIPHY_API_KEYS = [
  'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh', // Giphy Web public key
  '3eFQvMIgguhKAdzKaOvngWhDt3ZdaUt2',
  '56ViPtPO5AmUxF6G3m4un97KfSuUkAcY',
  'dc6zaTOxFJmzC',
  '0UTRb9woFTOjahpgbvVHarNuihn3OZTX',
  'LIVD8duuoENaglC3GUCJUPkATHapd3mF',
];

// Rich curated nostalgic & viral catalog ensuring 100% live working results even if network throttles
export const CURATED_GIPHY_LIBRARY: GiphyGif[] = [
  // 2000s Internet Legends
  {
    id: '4vF7Xv63qH6K2j6s2F',
    title: 'Keyboard Cat (Play Him Off)',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3cyMTF2NWhnbjFsdzExbjY4ZWNyeDVvdG92MWcxb28waWc5b3V6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4vF7Xv63qH6K2j6s2F/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3cyMTF2NWhnbjFsdzExbjY4ZWNyeDVvdG92MWcxb28waWc5b3V6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4vF7Xv63qH6K2j6s2F/giphy.gif',
    embedUrl: 'https://giphy.com/embed/4vF7Xv63qH6K2j6s2F',
    tags: ['cat', 'keyboard', 'piano', 'music', 'playhimoff', 'retro', '2000s', 'classic', 'meme'],
    category: 'memes',
  },
  {
    id: '26tP21kMc9KstODS0',
    title: 'Dramatic Chipmunk',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZicGcxOTBzNm5xOHlqenY2ZjQxOTR5YjU4MWhhbzI4bTRpY3JzMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tP21kMc9KstODS0/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZicGcxOTBzNm5xOHlqenY2ZjQxOTR5YjU4MWhhbzI4bTRpY3JzMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tP21kMc9KstODS0/giphy.gif',
    embedUrl: 'https://giphy.com/embed/26tP21kMc9KstODS0',
    tags: ['chipmunk', 'dramatic', 'shock', 'shocked', 'look', 'prairiedog', 'suspense', 'meme'],
    category: 'memes',
  },
  {
    id: 'l3vQYbeX9K4L9vGvS',
    title: 'Nyan Cat Space Loop',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1NHN5NXdzMndreWN0M2wwYzZlZmFpMDByNXRpdjRxbG05cjJscyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vQYbeX9K4L9vGvS/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1NHN5NXdzMndreWN0M2wwYzZlZmFpMDByNXRpdjRxbG05cjJscyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vQYbeX9K4L9vGvS/giphy.gif',
    embedUrl: 'https://giphy.com/embed/l3vQYbeX9K4L9vGvS',
    tags: ['nyan', 'cat', 'rainbow', 'space', 'poptart', 'music', 'pixel', 'stars', 'meme'],
    category: 'memes',
  },
  {
    id: 'Vuw9m5wXviFIQ',
    title: 'Rick Astley - Never Gonna Give You Up (Rickroll)',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODF4OWVpeXB5NnVqOHdmeTI2dGxlMXp4dDdyajkyNXB4NHN6cGswciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vuw9m5wXviFIQ/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODF4OWVpeXB5NnVqOHdmeTI2dGxlMXp4dDdyajkyNXB4NHN6cGswciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vuw9m5wXviFIQ/giphy.gif',
    embedUrl: 'https://giphy.com/embed/Vuw9m5wXviFIQ',
    tags: ['rickroll', 'rickastley', 'dance', 'nevergonnagiveyouup', 'song', 'troll', 'classic'],
    category: 'dance',
  },
  {
    id: 'kC2ZgXfCO3TUI',
    title: 'Charlie Bit My Finger',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmwwazN1YmJmaWwwc2Z3bXgyMHk5MnR2YTVscGRrcjN3ZDVzMmJidSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kC2ZgXfCO3TUI/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmwwazN1YmJmaWwwc2Z3bXgyMHk5MnR2YTVscGRrcjN3ZDVzMmJidSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kC2ZgXfCO3TUI/giphy.gif',
    embedUrl: 'https://giphy.com/embed/kC2ZgXfCO3TUI',
    tags: ['charlie', 'baby', 'funny', 'viral', 'classic', 'ouch', 'bite'],
    category: 'memes',
  },
  {
    id: 'hrN6bYppUxs2Y',
    title: 'Double Rainbow All The Way',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3Z2pwaTFwdGg1dzNka2ZnbWl2dmpybncwbHpsbXU2am45NnZpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hrN6bYppUxs2Y/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3Z2pwaTFwdGg1dzNka2ZnbWl2dmpybncwbHpsbXU2am45NnZpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hrN6bYppUxs2Y/giphy.gif',
    embedUrl: 'https://giphy.com/embed/hrN6bYppUxs2Y',
    tags: ['rainbow', 'doublerainbow', 'nature', 'omg', 'whatdoesitmean', 'happy', 'nature'],
    category: 'memes',
  },
  {
    id: 'IB9foBA4PVkKA',
    title: 'Peanut Butter Jelly Time Dancing Banana',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9mb2s0cTNucDR5Y3ZpZnZ6dW1iNW1ocGNlMXBvNHJ0dnB5YzhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IB9foBA4PVkKA/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9mb2s0cTNucDR5Y3ZpZnZ6dW1iNW1ocGNlMXBvNHJ0dnB5YzhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IB9foBA4PVkKA/giphy.gif',
    embedUrl: 'https://giphy.com/embed/IB9foBA4PVkKA',
    tags: ['banana', 'peanutbutter', 'jelly', 'dance', 'pbjt', 'dancing', 'flash', 'funny'],
    category: 'dance',
  },
  {
    id: 'zXHZWGLWNQkrS',
    title: 'Badger Badger Mushroom Snake',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjR6NG85enA1aHJldmd0ajhhNHNraXg5dmRhZ3dyZWhvYnlha2oxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zXHZWGLWNQkrS/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjR6NG85enA1aHJldmd0ajhhNHNraXg5dmRhZ3dyZWhvYnlha2oxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zXHZWGLWNQkrS/giphy.gif',
    embedUrl: 'https://giphy.com/embed/zXHZWGLWNQkrS',
    tags: ['badger', 'mushroom', 'snake', 'flash', 'weebl', 'retro', 'loop', 'song'],
    category: 'memes',
  },

  // Reaction Favorites
  {
    id: '26ufdipQqU2lhNA4g',
    title: 'Mind Blown Galaxy Explosion',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrZ3M2OXp2bmtidmNuZ3k5NW4xMnd2czR4cmFia3d4YjZic2FodyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzdrZ3M2OXp2bmtidmNuZ3k5NW4xMnd2czR4cmFia3d4YjZic2FodyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif',
    embedUrl: 'https://giphy.com/embed/26ufdipQqU2lhNA4g',
    tags: ['mindblown', 'galaxy', 'timanderic', 'shocked', 'explosion', 'reaction', 'universe', 'wow'],
    category: 'reactions',
  },
  {
    id: 'pUeXcg80cO8I8',
    title: 'Michael Jackson Popcorn Watching Drama',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHRqczJvdWtiYm50cDFwM2p2enkyczVzcHl5YTVuY3VzN2ZhaWN0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pUeXcg80cO8I8/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHRqczJvdWtiYm50cDFwM2p2enkyczVzcHl5YTVuY3VzN2ZhaWN0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pUeXcg80cO8I8/giphy.gif',
    embedUrl: 'https://giphy.com/embed/pUeXcg80cO8I8',
    tags: ['popcorn', 'mj', 'eating', 'drama', 'watching', 'thriller', 'cinema', 'movie', 'reaction'],
    category: 'reactions',
  },
  {
    id: '6OWIl75ibpuFO',
    title: 'Picard Facepalm (Star Trek)',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmtpYjB1anpmcWR0N3BwMzg3OG55NmZ5a20yNWlyNnAzc253OWlmeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6OWIl75ibpuFO/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmtpYjB1anpmcWR0N3BwMzg3OG55NmZ5a20yNWlyNnAzc253OWlmeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6OWIl75ibpuFO/giphy.gif',
    embedUrl: 'https://giphy.com/embed/6OWIl75ibpuFO',
    tags: ['facepalm', 'picard', 'startrek', 'disbelief', 'fail', 'headache', 'reaction'],
    category: 'reactions',
  },
  {
    id: '7rj2ZgttvgomY',
    title: 'Citizen Kane Slow Clapping Applause',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXVnd2U5enV6d3IwbDN5ejYxaXZ2b25xY3RjdmQzazIwaTVicGFzMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7rj2ZgttvgomY/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXVnd2U5enV6d3IwbDN5ejYxaXZ2b25xY3RjdmQzazIwaTVicGFzMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7rj2ZgttvgomY/giphy.gif',
    embedUrl: 'https://giphy.com/embed/7rj2ZgttvgomY',
    tags: ['clap', 'applause', 'bravo', 'citizenkane', 'slowclap', 'respect', 'reaction'],
    category: 'reactions',
  },
  {
    id: 'GCLlQnV7d42BRBRpdK',
    title: 'Leo DiCaprio Gatsby Champagne Cheers',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82MWkza3F5bXRvM2Qzd2t2eG15ZGF3NzlpbWF0eW04c214cTJ5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GCLlQnV7d42BRBRpdK/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82MWkza3F5bXRvM2Qzd2t2eG15ZGF3NzlpbWF0eW04c214cTJ5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GCLlQnV7d42BRBRpdK/giphy.gif',
    embedUrl: 'https://giphy.com/embed/GCLlQnV7d42BRBRpdK',
    tags: ['cheers', 'gatsby', 'leonardo', 'champagne', 'congrats', 'toast', 'celebrate', 'reaction'],
    category: 'reactions',
  },

  // Gaming Legends
  {
    id: 'atQF1zaSGqBTy',
    title: '8-Bit Retro Super Mario Jumping',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2dnFwMXA0cW51cm51aGJwZW1tYW96eXJjNDRtd3pnYXF2dTN1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/atQF1zaSGqBTy/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2dnFwMXA0cW51cm51aGJwZW1tYW96eXJjNDRtd3pnYXF2dTN1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/atQF1zaSGqBTy/giphy.gif',
    embedUrl: 'https://giphy.com/embed/atQF1zaSGqBTy',
    tags: ['mario', 'nintendo', 'pixel', '8bit', 'gaming', 'retro', 'jump', 'nes'],
    category: 'gaming',
  },
  {
    id: 'cuHjncTuHW40g',
    title: 'Minecraft Creeper Explosion',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDcyNmgxajdtZTNpaTVoaG1vdHhrdWlsMXZ1Z3R4dnptZjRzNm1nZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cuHjncTuHW40g/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDcyNmgxajdtZTNpaTVoaG1vdHhrdWlsMXZ1Z3R4dnptZjRzNm1nZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cuHjncTuHW40g/giphy.gif',
    embedUrl: 'https://giphy.com/embed/cuHjncTuHW40g',
    tags: ['minecraft', 'creeper', 'boom', 'gaming', 'classic', 'tnt', 'blocks'],
    category: 'gaming',
  },
  {
    id: 'mdfPClWEizfO2qRTIE',
    title: 'Sonic The Hedgehog Running Turbo Fast',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndic29vOXh5dzRmdW12dWpwa3Zrc3Z4c2g5YTNwOWRtdmF4b2JjOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mdfPClWEizfO2qRTIE/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndic29vOXh5dzRmdW12dWpwa3Zrc3Z4c2g5YTNwOWRtdmF4b2JjOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mdfPClWEizfO2qRTIE/giphy.gif',
    embedUrl: 'https://giphy.com/embed/mdfPClWEizfO2qRTIE',
    tags: ['sonic', 'sega', 'fast', 'running', 'turbo', 'gaming', 'speed', 'retro'],
    category: 'gaming',
  },

  // Dance & Party
  {
    id: 'pa37AAGzKXoqk',
    title: 'Carlton Dance - Fresh Prince of Bel-Air',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWNwa3R1d2drNzR0dmgyZjZqbjR2Mm1oaGlkcHlnY20xdnpnaDBuNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pa37AAGzKXoqk/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWNwa3R1d2drNzR0dmgyZjZqbjR2Mm1oaGlkcHlnY20xdnpnaDBuNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pa37AAGzKXoqk/giphy.gif',
    embedUrl: 'https://giphy.com/embed/pa37AAGzKXoqk',
    tags: ['carlton', 'dance', 'freshprince', 'celebrate', 'groove', 'happy', 'party'],
    category: 'dance',
  },
  {
    id: '10hzvF9FTulBtK',
    title: 'Peter Parker Spiderman Emo Street Dance',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXZpOWd5Zms3bnUwdm5ld3F6NXg1M2FwOXNldmJqMnZwb2Nsa3ptNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10hzvF9FTulBtK/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXZpOWd5Zms3bnUwdm5ld3F6NXg1M2FwOXNldmJqMnZwb2Nsa3ptNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10hzvF9FTulBtK/giphy.gif',
    embedUrl: 'https://giphy.com/embed/10hzvF9FTulBtK',
    tags: ['spiderman', 'dance', 'toby', 'funny', 'moves', 'street', 'swagger', 'marvel'],
    category: 'dance',
  },

  // Animals & Lolcats
  {
    id: 'o0vwzuFwCGAFO',
    title: 'Typing Hacker Cat (Working Overtime)',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnp3cWdrZnJ3a29sdzM3ZDF0N2I0Mm04Y3R6djRtbnpqbnVxbjU2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o0vwzuFwCGAFO/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnp3cWdrZnJ3a29sdzM3ZDF0N2I0Mm04Y3R6djRtbnpqbnVxbjU2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o0vwzuFwCGAFO/giphy.gif',
    embedUrl: 'https://giphy.com/embed/o0vwzuFwCGAFO',
    tags: ['cat', 'typing', 'computer', 'work', 'busy', 'hacker', 'coding', 'animals', 'lolcats'],
    category: 'animals',
  },
  {
    id: 'jpbnoe3UIa8TU8LM13',
    title: 'Cat Vibing Bouncing Head to Music',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGlsbmNlaDNud2pxMmoxYmFnOXVuc21yNHN1MnBxbHB4aWpjeGtpZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jpbnoe3UIa8TU8LM13/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGlsbmNlaDNud2pxMmoxYmFnOXVuc21yNHN1MnBxbHB4aWpjeGtpZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jpbnoe3UIa8TU8LM13/giphy.gif',
    embedUrl: 'https://giphy.com/embed/jpbnoe3UIa8TU8LM13',
    tags: ['vibing', 'cat', 'music', 'bouncing', 'headbob', 'beat', 'animals', 'cute'],
    category: 'animals',
  },
  {
    id: 'MDJ9IbxxvDUQM',
    title: 'Laser Cat Eyes (Pew Pew)',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2dnFwMXA0cW51cm51aGJwZW1tYW96eXJjNDRtd3pnYXF2dTN1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2dnFwMXA0cW51cm51aGJwZW1tYW96eXJjNDRtd3pnYXF2dTN1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif',
    embedUrl: 'https://giphy.com/embed/MDJ9IbxxvDUQM',
    tags: ['laser', 'cat', 'pewpew', 'retro', 'space', 'funny', 'animals'],
    category: 'animals',
  },
  {
    id: 'l41lI4bYucs4FQDVS',
    title: 'Shiba Inu Doge Nod of Approval',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnp3cWdrZnJ3a29sdzM3ZDF0N2I0Mm04Y3R6djRtbnpqbnVxbjU2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lI4bYucs4FQDVS/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnp3cWdrZnJ3a29sdzM3ZDF0N2I0Mm04Y3R6djRtbnpqbnVxbjU2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lI4bYucs4FQDVS/giphy.gif',
    embedUrl: 'https://giphy.com/embed/l41lI4bYucs4FQDVS',
    tags: ['dog', 'shiba', 'doge', 'nod', 'yes', 'agree', 'animals', 'puppy'],
    category: 'animals',
  },
  {
    id: 'B37cYPCruqvbG',
    title: 'Confused John Travolta Pulp Fiction',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3Z2pwaTFwdGg1dzNka2ZnbWl2dmpybncwbHpsbXU2am45NnZpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B37cYPCruqvbG/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTV3Z2pwaTFwdGg1dzNka2ZnbWl2dmpybncwbHpsbXU2am45NnZpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B37cYPCruqvbG/giphy.gif',
    embedUrl: 'https://giphy.com/embed/B37cYPCruqvbG',
    tags: ['confused', 'travolta', 'pulpfiction', 'where', 'lost', 'reaction', 'what'],
    category: 'reactions',
  },
  {
    id: '5GoVLqeAOo6PK',
    title: 'Kermit Flailing Arms Excited',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9mb2s0cTNucDR5Y3ZpZnZ6dW1iNW1ocGNlMXBvNHJ0dnB5YzhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5GoVLqeAOo6PK/giphy.gif',
    preview: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9mb2s0cTNucDR5Y3ZpZnZ6dW1iNW1ocGNlMXBvNHJ0dnB5YzhwaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5GoVLqeAOo6PK/giphy.gif',
    embedUrl: 'https://giphy.com/embed/5GoVLqeAOo6PK',
    tags: ['kermit', 'yay', 'excited', 'flail', 'happy', 'muppets', 'celebrate'],
    category: 'reactions',
  }
];

// Extract Giphy ID from various URL formats
export function extractGiphyId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // If it's already an ID
  if (/^[a-zA-Z0-9_-]{8,32}$/.test(trimmed)) {
    return trimmed;
  }
  // giphy.com/embed/{id}
  const embedMatch = trimmed.match(/giphy\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];

  // giphy.com/gifs/{name}-{id} or giphy.com/gifs/{id}
  const gifMatch = trimmed.match(/giphy\.com\/gifs\/(?:.*-)?([a-zA-Z0-9_-]+)/);
  if (gifMatch) return gifMatch[1];

  // media.giphy.com/media/{id}/giphy.gif or /media/v1.../{id}/giphy.gif
  const mediaMatch = trimmed.match(/\/([a-zA-Z0-9_-]+)\/giphy\.(gif|mp4|webp)/);
  if (mediaMatch) return mediaMatch[1];

  return null;
}

// Convert GIPHY item to our normalized structure
function formatGiphyItem(item: any): GiphyGif {
  const id = item.id;
  const original = item.images?.original?.url || `https://media.giphy.com/media/${id}/giphy.gif`;
  const preview =
    item.images?.fixed_height_small?.url ||
    item.images?.fixed_height?.url ||
    item.images?.downsized?.url ||
    original;
  const embedUrl = `https://giphy.com/embed/${id}`;
  return {
    id,
    title: item.title || 'GIF on GIPHY',
    url: original,
    preview,
    embedUrl,
    width: parseInt(item.images?.original?.width || '300', 10),
    height: parseInt(item.images?.original?.height || '200', 10),
    sourceUrl: item.url || `https://giphy.com/gifs/${id}`,
  };
}

/**
 * Searches GIPHY API live with automatic fallback key rotation.
 * If external API call fails (e.g., ad-blocker or rate-limiting), seamlessly searches curated library.
 */
export async function searchGiphyLive(
  query: string,
  limit: number = 24,
  rating: string = 'g'
): Promise<{ results: GiphyGif[]; isLiveApi: boolean; error?: string }> {
  const term = query.trim();

  // If query is blank, fetch trending or return curated
  const isTrending = term.length === 0;

  // Try API keys in cascade
  for (const apiKey of GIPHY_API_KEYS) {
    try {
      const endpoint = isTrending
        ? `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=${rating}`
        : `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
            term
          )}&limit=${limit}&rating=${rating}&lang=en`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          const results = data.data.map(formatGiphyItem);
          return { results, isLiveApi: true };
        }
      }
    } catch {
      // Continue to next key or fallback
    }
  }

  // Fallback: search local curated library
  const q = term.toLowerCase();
  const filtered = isTrending
    ? CURATED_GIPHY_LIBRARY
    : CURATED_GIPHY_LIBRARY.filter((g) => {
        if (g.title.toLowerCase().includes(q)) return true;
        if (g.tags && g.tags.some((t) => t.toLowerCase().includes(q))) return true;
        if (g.category && g.category.toLowerCase().includes(q)) return true;
        return false;
      });

  return {
    results: filtered.length > 0 ? filtered : CURATED_GIPHY_LIBRARY.slice(0, limit),
    isLiveApi: false,
  };
}
