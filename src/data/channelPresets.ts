export interface PresetTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const PRESENT_CHANNEL_TOPICS: PresetTopic[] = [
  { id: 'gaming', name: 'Gaming & Machinima', icon: '🎮', description: 'Gameplay, walkthroughs, speedruns & Machinima' },
  { id: 'tech', name: 'Tech, Gadgets & Computing', icon: '💻', description: 'Retro hardware, PC building, OS tours & programming' },
  { id: 'music', name: 'Music, Beats & Remixes', icon: '🎵', description: 'Chiptunes, lo-fi beats, synthwave & 2000s pop' },
  { id: 'comedy', name: 'Comedy, Skits & Parodies', icon: '😂', description: 'Sketches, lipsyncs, viral humor & YTP' },
  { id: 'animation', name: 'Animation, Cartoons & Flash', icon: '🎨', description: 'Flash cartoons, 2D animations, anime abridged' },
  { id: 'vlogs', name: 'Vlogs & Daily Life', icon: '📹', description: 'Classic webcam vlogging, storytimes & life updates' },
  { id: 'nostalgia', name: '2000s Nostalgia & Y2K Archives', icon: '📼', description: 'Golden era aesthetics, Windows XP, VHS rips' },
  { id: 'film', name: 'Film, TV & Cinema Reviews', icon: '🎬', description: 'Movie essays, nostalgic reviews & trailers' },
  { id: 'education', name: 'Education, Science & History', icon: '🧠', description: 'How things work, computer history & tutorials' },
  { id: 'sports', name: 'Action, Stunts & Sports', icon: '🛹', description: 'Skateboarding, parkour, sports compilations' },
  { id: 'autos', name: 'Autos, Motors & Racing', icon: '🏎️', description: 'Tuning, retro rally, car culture' },
  { id: 'diy', name: 'How-To, Crafts & DIY', icon: '🛠️', description: 'Guides, crafts, experiments & repairs' },
];

export interface PresetAvatar {
  id: string;
  name: string;
  url: string;
  category: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'robot',
    name: '2006 Retro Robot',
    category: 'Classic YouTube',
    url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'duck',
    name: 'WinXP Yellow Duck',
    category: 'Windows XP',
    url: 'https://images.unsplash.com/photo-1555861496-0666c8981751?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'butterfly',
    name: 'WinXP Azure Butterfly',
    category: 'Windows XP',
    url: 'https://images.unsplash.com/photo-1559253664-ca249d4608c6?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'chess',
    name: 'WinXP Chess Knight',
    category: 'Windows XP',
    url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'webcam',
    name: '2005 Pixel Webcam',
    category: 'Retro Tech',
    url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'pixel_sword',
    name: '8-bit Gamer Sword',
    category: 'Gaming',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'cassette',
    name: 'Neon Cassette Tape',
    category: 'Music',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'skateboard',
    name: 'Street Skateboard',
    category: 'Action',
    url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=160&q=80',
  },
];

export interface ChannelThemeStyle {
  id: string;
  name: string;
  headerColor: string;
  accentColor: string;
  bgColor: string;
  bgPattern: 'none' | 'stars' | 'clouds' | 'grid' | 'bliss' | 'matrix' | 'dots' | 'wood';
}

export const PRESET_CHANNEL_STYLES: ChannelThemeStyle[] = [
  {
    id: 'classic_red',
    name: 'Classic 2005 Broadcast Red',
    headerColor: '#cc181e',
    accentColor: '#cc181e',
    bgColor: '#f4f4f4',
    bgPattern: 'none',
  },
  {
    id: 'machinima_gold',
    name: 'Machinima Black & Gold',
    headerColor: '#eab308',
    accentColor: '#ca8a04',
    bgColor: '#18181b',
    bgPattern: 'grid',
  },
  {
    id: 'winxp_bliss',
    name: 'Windows XP Bliss Green/Sky',
    headerColor: '#0284c7',
    accentColor: '#16a34a',
    bgColor: '#e0f2fe',
    bgPattern: 'bliss',
  },
  {
    id: 'matrix_hacker',
    name: 'Cyber Matrix Terminal',
    headerColor: '#22c55e',
    accentColor: '#15803d',
    bgColor: '#052e16',
    bgPattern: 'matrix',
  },
  {
    id: 'twilight_y2k',
    name: 'Y2K Starlight Lavender',
    headerColor: '#9333ea',
    accentColor: '#7e22ce',
    bgColor: '#fdf4ff',
    bgPattern: 'stars',
  },
];

export interface PresetYouTubeChannel {
  id: string;
  name: string;
  handle: string;
  url: string;
  channelId?: string;
  topic: string;
  bio: string;
  subscribers: number;
  avatarUrl: string;
  bannerUrl: string;
  headerColor: string;
  accentColor: string;
  videos: Array<{
    title: string;
    youtubeId: string;
    views: number;
    category: string;
    desc: string;
    time: string;
  }>;
}

export const PRESET_YOUTUBE_CHANNELS: PresetYouTubeChannel[] = [
  {
    id: 'lofigirl',
    name: 'Lofi Girl',
    handle: '@LofiGirl',
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    url: 'https://www.youtube.com/@LofiGirl',
    topic: 'Music, Beats & Remixes',
    bio: 'Peaceful lofi hip hop beats to study, chill, read, code, or relax to 24/7. High audio quality stream and ambient community haven.',
    subscribers: 14200000,
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#0284c7',
    accentColor: '#0369a1',
    videos: [
      {
        title: 'lofi hip hop radio - beats to relax/study to',
        youtubeId: 'jfKfPfyJRdk',
        views: 65420000,
        category: 'Music',
        desc: 'Peaceful lofi hip hop beats to study, chill, read, code, or relax to 24/7. High audio quality stream.',
        time: '3:45',
      },
      {
        title: 'lofi hip hop radio - beats to sleep/chill to',
        youtubeId: 'rUxyKA_-grg',
        views: 28310000,
        category: 'Music',
        desc: 'Relaxing gentle lofi beats to sleep, dream, and wind down.',
        time: '4:10',
      },
      {
        title: 'Synthwave Radio - chill synth / retro beats',
        youtubeId: '4xDzrJKXOOY',
        views: 18900000,
        category: 'Music',
        desc: 'Retro chill synthwave and 80s electronic driving beats.',
        time: '3:50',
      },
    ],
  },
  {
    id: 'mkbhd',
    name: 'Marques Brownlee',
    handle: '@mkbhd',
    channelId: 'UCBJycsmduPTe830rUCms71w',
    url: 'https://www.youtube.com/@mkbhd',
    topic: 'Tech, Gadgets & Computing',
    bio: 'Quality Tech Videos | YouTuber | Geek | Consumer Electronics | Tech Head. Reviews, deep dives, and camera showdowns since 2008.',
    subscribers: 19500000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#171717',
    accentColor: '#dc2626',
    videos: [
      {
        title: 'Smartphone Awards 2023!',
        youtubeId: 'xPfv_e0dC68',
        views: 6500000,
        category: 'Tech',
        desc: 'The best and worst smartphones of the entire year reviewed.',
        time: '18:14',
      },
      {
        title: 'Apple Vision Pro Review: Tomorrow\'s Tech Today',
        youtubeId: 'dtp6bS6yc4U',
        views: 18400000,
        category: 'Tech',
        desc: 'Full deep dive into spatial computing, eye tracking, and the future of displays.',
        time: '24:10',
      },
      {
        title: 'Retro Tech: The Game Boy Color!',
        youtubeId: '8h5rX3Xq4h0',
        views: 7900000,
        category: 'Tech',
        desc: 'Looking back at Nintendo\'s revolutionary handheld console.',
        time: '14:22',
      },
    ],
  },
  {
    id: 'veritasium',
    name: 'Veritasium',
    handle: '@veritasium',
    channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA',
    url: 'https://www.youtube.com/@veritasium',
    topic: 'Education, Science & History',
    bio: 'An element of truth - videos about science, education, physics, astronomy, and crazy real-world experiments by Derek Muller.',
    subscribers: 16500000,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#0369a1',
    accentColor: '#0284c7',
    videos: [
      {
        title: 'Why Are 96,000,000 Black Balls on This Reservoir?',
        youtubeId: 'uxPdPptKQyc',
        views: 94000000,
        category: 'Education',
        desc: 'The true scientific reason Los Angeles covered their reservoir with 96 million shade balls.',
        time: '12:07',
      },
      {
        title: 'How An Infinite Hotel Works - The Hilbert Paradox',
        youtubeId: 'OxGsU8oIWjY',
        views: 28000000,
        category: 'Education',
        desc: 'Visual explanation of infinity, Hilbert\'s Grand Hotel, and mathematics.',
        time: '8:45',
      },
      {
        title: 'The Simplest Math Problem No One Can Solve (Collatz Conjecture)',
        youtubeId: '094y1Z2wpJg',
        views: 39000000,
        category: 'Education',
        desc: 'Derek investigates the famous 3x+1 Collatz conjecture math problem.',
        time: '22:08',
      },
    ],
  },
  {
    id: 'mrbeast',
    name: 'MrBeast',
    handle: '@MrBeast',
    channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    url: 'https://www.youtube.com/@MrBeast',
    topic: 'Action, Stunts & Sports',
    bio: 'I want to make the world a better place before I die. Stunts, philanthropy, and insane challenges!',
    subscribers: 320000000,
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#0284c7',
    accentColor: '#0369a1',
    videos: [
      {
        title: '$456,000 Squid Game In Real Life!',
        youtubeId: '08SLFf7rpAU',
        views: 650000000,
        category: 'Entertainment',
        desc: 'Recreating every single game from Squid Game in real life with 456 contestants!',
        time: '25:41',
      },
      {
        title: 'I Spent 50 Hours In Solitary Confinement',
        youtubeId: 'gHzuHb5g7k8',
        views: 210000000,
        category: 'Entertainment',
        desc: '50 hours trapped inside a pure white room with no clock or entertainment.',
        time: '15:20',
      },
      {
        title: 'Last To Leave Circle Wins $500,000',
        youtubeId: 'zxYjTTXc-J8',
        views: 320000000,
        category: 'Entertainment',
        desc: '100 people step inside a giant red circle. The last person to step outside takes home $500k.',
        time: '18:50',
      },
    ],
  },
  {
    id: 'rickastley',
    name: 'Rick Astley',
    handle: '@RickAstleyVEVO',
    channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
    url: 'https://www.youtube.com/@RickAstleyVEVO',
    topic: 'Music, Beats & Remixes',
    bio: 'The official channel of Rick Astley. Never gonna give you up, never gonna let you down, never gonna run around and desert you!',
    subscribers: 4300000,
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#b91c1c',
    accentColor: '#991b1b',
    videos: [
      {
        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
        youtubeId: 'dQw4w9WgXcQ',
        views: 1498000000,
        category: 'Music',
        desc: 'The official video for "Never Gonna Give You Up" by Rick Astley. The internet\'s most celebrated masterpiece.',
        time: '3:33',
      },
      {
        title: 'Rick Astley - Together Forever (Official Video)',
        youtubeId: 'yPYZpwSpKmA',
        views: 220000000,
        category: 'Music',
        desc: 'Together Forever music video by Rick Astley.',
        time: '3:25',
      },
    ],
  },
  {
    id: 'pewdiepie',
    name: 'PewDiePie',
    handle: '@PewDiePie',
    channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
    url: 'https://www.youtube.com/@PewDiePie',
    topic: 'Gaming & Machinima',
    bio: 'Brofist! Legendary Swedish gaming pioneer, creator of Amnesia playthroughs, Meme Review, and LWIAY.',
    subscribers: 111000000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#dc2626',
    accentColor: '#b91c1c',
    videos: [
      {
        title: 'A Funny Montage - PewDiePie (Classic Golden Era)',
        youtubeId: 'f94z_w_ZgX0',
        views: 92000000,
        category: 'Gaming',
        desc: 'Classic funny gaming montage highlights and screams from 2012-2013.',
        time: '4:22',
      },
      {
        title: 'Bitch Lasagna - PewDiePie (Official Music Video)',
        youtubeId: '6Dh-RL__uN4',
        views: 315000000,
        category: 'Music',
        desc: 'The historic track during the great YouTube subscriber race.',
        time: '2:15',
      },
      {
        title: 'Minecraft Part 1 - A New Beginning',
        youtubeId: '4yfx7Q_76uM',
        views: 54000000,
        category: 'Gaming',
        desc: 'PewDiePie plays Minecraft for the first time with Sven and Joergen.',
        time: '19:42',
      },
    ],
  },
  {
    id: 'linustechtips',
    name: 'Linus Tech Tips',
    handle: '@LinusTechTips',
    channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    url: 'https://www.youtube.com/@LinusTechTips',
    topic: 'Tech, Gadgets & Computing',
    bio: 'Tech can be complicated; we try to make it easy. Dedicated to reviewing PC hardware, building monster rigs, and pushing tech limits.',
    subscribers: 15800000,
    avatarUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#ea580c',
    accentColor: '#c2410c',
    videos: [
      {
        title: 'Building a PC... using only parts from Wish.com',
        youtubeId: '3U221tD0iJ4',
        views: 14500000,
        category: 'Tech',
        desc: 'Linus attempts to build a working gaming PC entirely from budget listings.',
        time: '18:32',
      },
      {
        title: 'The Fastest Gaming PC in the World (Liquid Nitrogen)',
        youtubeId: 'yv_v_W72u_E',
        views: 8900000,
        category: 'Tech',
        desc: 'Overclocking high-end CPUs to extreme limits with cryogenic liquid nitrogen.',
        time: '15:40',
      },
    ],
  },
  {
    id: 'nilered',
    name: 'NileRed',
    handle: '@NileRed',
    channelId: 'UC1vl43b176RkyGfl6lU_8g',
    url: 'https://www.youtube.com/@NileRed',
    topic: 'Education, Science & History',
    bio: 'Welcome to NileRed! My videos are all about chemistry, wacky experiments, and turning ordinary everyday objects into surprising chemical compounds.',
    subscribers: 6100000,
    avatarUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#b91c1c',
    accentColor: '#991b1b',
    videos: [
      {
        title: 'Making aerogel at home',
        youtubeId: 'xPfv_e0dC68',
        views: 18000000,
        category: 'Education',
        desc: 'Synthesizing the lightest solid material on planet Earth in a laboratory.',
        time: '19:45',
      },
      {
        title: 'Turning cotton balls into cotton candy',
        youtubeId: 'uxPdPptKQyc',
        views: 24000000,
        category: 'Education',
        desc: 'A wild chemical pathway from pure cellulose to edible sucrose.',
        time: '23:10',
      },
    ],
  },
  {
    id: 'kurzgesagt',
    name: 'Kurzgesagt – In a Nutshell',
    handle: '@kurzgesagt',
    channelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
    url: 'https://www.youtube.com/@kurzgesagt',
    topic: 'Animation, Cartoons & Flash',
    bio: 'Videos explaining things with optimistic nihilism. We are a small team who want to make science look beautiful. Because it is beautiful.',
    subscribers: 22000000,
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#4f46e5',
    accentColor: '#4338ca',
    videos: [
      {
        title: 'The Last Human on Earth',
        youtubeId: '5iZ1-vvSFVE',
        views: 19000000,
        category: 'Animation',
        desc: 'What happens at the absolute end of time and the universe?',
        time: '11:15',
      },
      {
        title: 'What If We Detonated All Nuclear Bombs at Once?',
        youtubeId: 'JyECrGp-Sw8',
        views: 34000000,
        category: 'Animation',
        desc: 'Exploring the catastrophic physics of an all-out planetary explosion.',
        time: '10:48',
      },
    ],
  },
  {
    id: 'vsauce',
    name: 'Vsauce',
    handle: '@Vsauce',
    channelId: 'UC6nSFpj9HTCZ5t-N3Rm3-HA',
    url: 'https://www.youtube.com/@Vsauce',
    topic: 'Education, Science & History',
    bio: 'Our World is Amazing. Michael Stevens explores science, philosophy, psychology, paradoxes, and the mysteries of human existence.',
    subscribers: 21500000,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#0891b2',
    accentColor: '#0e7490',
    videos: [
      {
        title: 'What If Everyone JUMPED At Once?',
        youtubeId: 'jHbyQ_bptJ4',
        views: 41000000,
        category: 'Education',
        desc: 'What happens to the Earth if all 8 billion humans leap at the same moment?',
        time: '9:04',
      },
      {
        title: 'The Banach-Tarski Paradox',
        youtubeId: 's86-Z-CbaHA',
        views: 31000000,
        category: 'Education',
        desc: 'How 1 sphere can mathematically be disassembled into 2 identical spheres.',
        time: '24:20',
      },
    ],
  },
  {
    id: 'cinemassacre',
    name: 'Cinemassacre (AVGN)',
    handle: '@Cinemassacre',
    channelId: 'UC0M0rxSz3IF0CsSour1iWmw',
    url: 'https://www.youtube.com/@Cinemassacre',
    topic: 'Gaming & Machinima',
    bio: "He's gonna take you back to the past to play the bad games that suck ass. James Rolfe's Angry Video Game Nerd, Monster Madness, and classic movie reviews.",
    subscribers: 3750000,
    avatarUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#4d7c0f',
    accentColor: '#3f6212',
    videos: [
      {
        title: 'Castlevania Part 1 - Angry Video Game Nerd (AVGN)',
        youtubeId: '94Y6y1MOoEo',
        views: 7800000,
        category: 'Gaming',
        desc: 'The Nerd reviews the Castlevania series for the NES.',
        time: '12:05',
      },
      {
        title: 'Teenage Mutant Ninja Turtles NES - Angry Video Game Nerd',
        youtubeId: 'XJLEGu8HFR4',
        views: 11400000,
        category: 'Gaming',
        desc: 'The infamous dam swimming level and frustrating platforming on NES.',
        time: '11:18',
      },
    ],
  },
  {
    id: 'smosh',
    name: 'Smosh (Classic Era)',
    handle: '@Smosh',
    channelId: 'UCY30JRSgfhYXA6i6xX1erWg',
    url: 'https://www.youtube.com/@Smosh',
    topic: 'Comedy, Skits & Parodies',
    bio: 'Ian Hecox & Anthony Padilla. The iconic duo that defined YouTube comedy sketch comedy from 2005 into the 2010s.',
    subscribers: 25000000,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#e11d48',
    accentColor: '#be123c',
    videos: [
      {
        title: 'Pokemon Theme Song Video - The 2005 Classic',
        youtubeId: 'bU_jGZ_k-G8',
        views: 31000000,
        category: 'Comedy',
        desc: 'The viral video that started it all in late 2005!',
        time: '3:15',
      },
    ],
  },
  {
    id: 'jawed',
    name: 'jawed',
    handle: '@jawed',
    channelId: 'UC4QobU6ST3KWZCmTQ45O9Wg',
    url: 'https://www.youtube.com/@jawed',
    topic: '2000s Nostalgia & Y2K Archives',
    bio: 'YouTube Co-Founder. Channel that uploaded the first video on YouTube on April 23, 2005.',
    subscribers: 4200000,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#cc181e',
    accentColor: '#991b1b',
    videos: [
      {
        title: 'Me at the zoo - The First Video on YouTube',
        youtubeId: 'jNQXAC9IVRw',
        views: 312000000,
        category: 'Entertainment',
        desc: 'The first video on YouTube, shot by Yakov Lapitsky at the San Diego Zoo.',
        time: '0:19',
      },
    ],
  },
  {
    id: 'teamfourstar',
    name: 'Team Four Star',
    handle: '@TeamFourStar',
    channelId: 'UCsvazPPlhZlch0-t3HEXG3g',
    url: 'https://www.youtube.com/@TeamFourStar',
    topic: 'Animation, Cartoons & Flash',
    bio: 'Pioneers of anime parody abridging. Creators of DragonBall Z Abridged, Hellsing Ultimate Abridged, gaming playthroughs, and classic voice-over comedy.',
    subscribers: 3800000,
    avatarUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1100&q=80',
    headerColor: '#ea580c',
    accentColor: '#c2410c',
    videos: [
      {
        title: 'DragonBall Z Abridged: Episode 1',
        youtubeId: '2nYozH88Fre',
        views: 19500000,
        category: 'Comedy',
        desc: 'DBZ Abridged Episode 1: A legendary reimagining of the Saiyan Saga.',
        time: '10:15',
      },
      {
        title: 'DragonBall Z Abridged: Episode 2',
        youtubeId: 'c8iU_jXlK4U',
        views: 14200000,
        category: 'Comedy',
        desc: 'DBZ Abridged Episode 2: The battle continues!',
        time: '10:48',
      },
    ],
  },
];

/**
 * Parses user input for YouTube channels:
 * Accepts:
 *  - @handle (e.g. "@LofiGirl" or "LofiGirl")
 *  - https://www.youtube.com/@handle
 *  - https://www.youtube.com/channel/UCxxxx
 *  - https://www.youtube.com/c/CustomName
 *  - https://www.youtube.com/user/LegacyName
 *  - https://www.youtube.com/watch?v=VIDEO_ID (video from channel)
 */
export function parseYouTubeChannelInput(input: string): {
  normalizedHandle: string;
  channelUrl: string;
  channelId?: string;
  matchedPreset?: PresetYouTubeChannel;
  extractedVideoId?: string;
  inferredName: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      normalizedHandle: '@Creator',
      channelUrl: 'https://www.youtube.com',
      inferredName: 'New Channel',
    };
  }

  // Check if it directly matches a preset handle or name or ID or channelId
  const lower = trimmed.toLowerCase();
  const directPreset = PRESET_YOUTUBE_CHANNELS.find(
    (p) =>
      p.id.toLowerCase() === lower ||
      p.handle.toLowerCase() === lower ||
      p.handle.toLowerCase() === `@${lower}` ||
      p.name.toLowerCase() === lower ||
      p.url.toLowerCase() === lower ||
      (p.channelId && p.channelId.toLowerCase() === lower)
  );
  if (directPreset) {
    return {
      normalizedHandle: directPreset.handle,
      channelUrl: directPreset.url,
      channelId: directPreset.channelId,
      matchedPreset: directPreset,
      inferredName: directPreset.name,
    };
  }

  // Check if input is a video link
  const videoMatch = trimmed.match(/(?:youtu\.be\/|watch\?v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  let extractedVideoId: string | undefined;
  if (videoMatch) {
    extractedVideoId = videoMatch[1];
  }

  let handle = '';
  let url = trimmed;
  let channelId: string | undefined;

  // Pattern: youtube.com/@handle
  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/i);
  if (handleMatch) {
    handle = `@${handleMatch[1]}`;
    url = `https://www.youtube.com/${handle}`;
  } else if (trimmed.startsWith('@')) {
    handle = trimmed;
    url = `https://www.youtube.com/${handle}`;
  } else if (/^https?:\/\/.*youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/i.test(trimmed)) {
    const cid = trimmed.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/i)![1];
    channelId = cid;
    handle = `@channel_${cid.slice(0, 8)}`;
    url = `https://www.youtube.com/channel/${cid}`;
  } else if (/^UC[a-zA-Z0-9_-]{20,}/.test(trimmed)) {
    channelId = trimmed;
    handle = `@channel_${trimmed.slice(0, 8)}`;
    url = `https://www.youtube.com/channel/${trimmed}`;
  } else if (/^https?:\/\/.*youtube\.com\/(c|user)\/([a-zA-Z0-9_.-]+)/i.test(trimmed)) {
    const cname = trimmed.match(/\/(c|user)\/([a-zA-Z0-9_.-]+)/i)![2];
    handle = `@${cname}`;
    url = `https://www.youtube.com/c/${cname}`;
  } else if (!trimmed.startsWith('http')) {
    // Plain username typed
    const clean = trimmed.replace(/\s+/g, '');
    handle = clean.startsWith('@') ? clean : `@${clean}`;
    url = `https://www.youtube.com/${handle}`;
  }

  // Check if handle matches preset
  const matchedPreset = PRESET_YOUTUBE_CHANNELS.find(
    (p) => p.handle.toLowerCase() === handle.toLowerCase() || p.id.toLowerCase() === handle.replace('@', '').toLowerCase()
  );

  // Derive human name from handle
  const rawName = handle.replace(/^@/, '');
  const inferredName = matchedPreset?.name || (rawName
    ? rawName.replace(/([A-Z])/g, ' $1').trim()
    : 'YouTube Channel');

  return {
    normalizedHandle: handle || '@YouTubeCreator',
    channelUrl: url,
    channelId: channelId || matchedPreset?.channelId,
    matchedPreset,
    extractedVideoId,
    inferredName: inferredName || 'YouTube Creator',
  };
}
