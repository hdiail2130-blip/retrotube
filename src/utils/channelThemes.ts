// Retro YouTube 2008-2011 Channel Wallpaper, Banner & Theme Presets

export interface WallpaperPreset {
  id: string;
  name: string;
  icon: string;
  category: 'gaming_3d' | 'retro_tube' | 'os_nostalgia';
  desc: string;
  defaultBgColor: string;
  defaultBoxFill: string;
  defaultBorderColor: string;
  defaultHighlightColor: string;
  defaultHeaderColor: string;
  defaultFont: 'sans' | 'serif' | 'mono' | 'impact' | 'comic' | 'homebrew' | 'c4d_clan';
  defaultOpacity: number;
  gutterStyle: 'none' | 'c4d_metallic' | 'graffiti_fx' | 'cod_camo' | 'homebrew_matrix' | 'frutiger_gloss';
  leftGutterSample: string;
  rightGutterSample: string;
  cssBackground: (bgColor: string) => React.CSSProperties;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'c4d_metal',
    name: 'Machinima 3D Cinema 4D Bevel',
    icon: '🎮',
    category: 'gaming_3d',
    desc: 'Heavy 3D rendered metallic rails, extruded bevels, and sponsor framing.',
    defaultBgColor: '#000000',
    defaultBoxFill: '#0d0d0d',
    defaultBorderColor: '#cc181e',
    defaultHighlightColor: '#ff2233',
    defaultHeaderColor: '#b30000',
    defaultFont: 'c4d_clan',
    defaultOpacity: 90,
    gutterStyle: 'c4d_metallic',
    leftGutterSample: 'MACHINIMA PARTNER • 1080p HD',
    rightGutterSample: 'SPONSORED BY G-FUEL • TWITTER @CLAN',
    cssBackground: (bg = '#000000') => ({
      backgroundColor: bg,
      backgroundImage: `
        linear-gradient(90deg, rgba(204,24,30,0.2) 0%, transparent 8%, transparent 92%, rgba(204,24,30,0.2) 100%),
        repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px),
        radial-gradient(ellipse at 50% 0%, rgba(204,24,30,0.3) 0%, transparent 60%)
      `,
    }),
  },
  {
    id: 'graffiti',
    name: 'Clan Gaming 3D Graffiti FX',
    icon: '⚡',
    category: 'gaming_3d',
    desc: 'Photoshop graffiti splatters, wireframes, and neon lens flare borders.',
    defaultBgColor: '#07090e',
    defaultBoxFill: '#0e121a',
    defaultBorderColor: '#00f0ff',
    defaultHighlightColor: '#00f0ff',
    defaultHeaderColor: '#005b82',
    defaultFont: 'impact',
    defaultOpacity: 85,
    gutterStyle: 'graffiti_fx',
    leftGutterSample: 'CLAN SNIPING • MONTAGE EDITS',
    rightGutterSample: 'SUB 4 SUB • AIM HIGH',
    cssBackground: (bg = '#07090e') => ({
      backgroundColor: bg,
      backgroundImage: `
        linear-gradient(90deg, rgba(0,240,255,0.25) 0%, transparent 12%, transparent 88%, rgba(0,240,255,0.25) 100%),
        radial-gradient(circle at 10% 20%, rgba(0,240,255,0.18) 0%, transparent 35%),
        radial-gradient(circle at 90% 70%, rgba(255,0,128,0.18) 0%, transparent 40%),
        repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)
      `,
    }),
  },
  {
    id: 'homebrew',
    name: 'Homebrew Channel Cyan Matrix',
    icon: '🕹️',
    category: 'retro_tube',
    desc: 'Iconic Homebrew console bubble grid with glowing cyan telemetry.',
    defaultBgColor: '#051824',
    defaultBoxFill: '#0a2233',
    defaultBorderColor: '#38bdf8',
    defaultHighlightColor: '#7dd3fc',
    defaultHeaderColor: '#0369a1',
    defaultFont: 'homebrew',
    defaultOpacity: 85,
    gutterStyle: 'homebrew_matrix',
    leftGutterSample: 'HOMEBREW SYSTEM v1.0.8',
    rightGutterSample: 'CUSTOM APPS • THEME LOADER',
    cssBackground: (bg = '#051824') => ({
      backgroundColor: bg,
      backgroundImage: `
        radial-gradient(#38bdf8 1.5px, transparent 1.5px),
        radial-gradient(circle at 50% 10%, rgba(56,189,248,0.25) 0%, transparent 70%),
        linear-gradient(180deg, #0284c7 0%, #0369a1 40%, #082f49 100%)
      `,
      backgroundSize: '24px 24px, 100% 100%, 100% 100%',
    }),
  },
  {
    id: 'grid',
    name: 'Classic 2008 Tube Grid',
    icon: '📐',
    category: 'retro_tube',
    desc: 'The timeless gray dot matrix that powered early YouTube channel pages.',
    defaultBgColor: '#f1f1f1',
    defaultBoxFill: '#ffffff',
    defaultBorderColor: '#cccccc',
    defaultHighlightColor: '#0033cc',
    defaultHeaderColor: '#cc181e',
    defaultFont: 'sans',
    defaultOpacity: 98,
    gutterStyle: 'none',
    leftGutterSample: 'BROADCAST YOURSELF',
    rightGutterSample: 'RETROTUBE ORIGINAL',
    cssBackground: (bg = '#f1f1f1') => ({
      backgroundColor: bg,
      backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)',
      backgroundSize: '16px 16px',
    }),
  },
  {
    id: 'matrix',
    name: 'Cyber Matrix Terminal (Deep Black)',
    icon: '📟',
    category: 'retro_tube',
    desc: 'Pitch black #000000 with phosphorescent green code grid.',
    defaultBgColor: '#000000',
    defaultBoxFill: '#03140a',
    defaultBorderColor: '#39ff14',
    defaultHighlightColor: '#39ff14',
    defaultHeaderColor: '#0f3818',
    defaultFont: 'mono',
    defaultOpacity: 85,
    gutterStyle: 'none',
    leftGutterSample: 'ROOT ACCESS // GRANTED',
    rightGutterSample: 'PORT 3000 // LISTENING',
    cssBackground: (bg = '#000000') => ({
      backgroundColor: bg,
      backgroundImage: `
        linear-gradient(rgba(0, 255, 65, 0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 65, 0.12) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
    }),
  },
  {
    id: 'stars',
    name: 'Space Nebula Stars (Deep Night)',
    icon: '✨',
    category: 'retro_tube',
    desc: 'Deep obsidian cosmic field with glittering distant stellar points.',
    defaultBgColor: '#080812',
    defaultBoxFill: '#101124',
    defaultBorderColor: '#6366f1',
    defaultHighlightColor: '#a5b4fc',
    defaultHeaderColor: '#312e81',
    defaultFont: 'sans',
    defaultOpacity: 88,
    gutterStyle: 'none',
    leftGutterSample: 'DEEP SPACE EXPEDITION',
    rightGutterSample: 'STELLAR TRANSMISSION',
    cssBackground: (bg = '#080812') => ({
      backgroundColor: bg,
      backgroundImage: `
        radial-gradient(white 1px, transparent 1px),
        radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px),
        radial-gradient(circle at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%)
      `,
      backgroundSize: '24px 24px, 48px 48px, 100% 100%',
    }),
  },
  {
    id: 'clouds',
    name: 'Frutiger Aero Sky Gloss',
    icon: '☁️',
    category: 'os_nostalgia',
    desc: 'High gloss aqua skies, reflective sun beams, and clean skeuomorphism.',
    defaultBgColor: '#e0f2fe',
    defaultBoxFill: '#ffffff',
    defaultBorderColor: '#38bdf8',
    defaultHighlightColor: '#0284c7',
    defaultHeaderColor: '#0284c7',
    defaultFont: 'sans',
    defaultOpacity: 92,
    gutterStyle: 'frutiger_gloss',
    leftGutterSample: 'FRUTIGER AERO 2008',
    rightGutterSample: 'CRYSTAL CLEAR GLASS',
    cssBackground: () => ({
      backgroundImage: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 45%, #bae6fd 75%, #f0f9ff 100%)',
    }),
  },
  {
    id: 'bliss',
    name: 'Windows XP Bliss Rolling Hills',
    icon: '🌄',
    category: 'os_nostalgia',
    desc: 'The iconic blue sky and emerald rolling hills of Windows XP.',
    defaultBgColor: '#22c55e',
    defaultBoxFill: '#ffffff',
    defaultBorderColor: '#2563eb',
    defaultHighlightColor: '#1d4ed8',
    defaultHeaderColor: '#1d4ed8',
    defaultFont: 'sans',
    defaultOpacity: 95,
    gutterStyle: 'none',
    leftGutterSample: 'WINDOWS XP PROFESSIONAL',
    rightGutterSample: 'LUNA BLUE THEME',
    cssBackground: () => ({
      backgroundImage: 'linear-gradient(180deg, #3b82f6 0%, #93c5fd 40%, #16a34a 41%, #15803d 100%)',
    }),
  },
  {
    id: 'cod_camo',
    name: 'Call of Duty Clan Camo & Lens Flare',
    icon: '🎯',
    category: 'gaming_3d',
    desc: 'Tactical carbon fiber weave with sniper reticles and orange lens flares.',
    defaultBgColor: '#0a0a0a',
    defaultBoxFill: '#121212',
    defaultBorderColor: '#f97316',
    defaultHighlightColor: '#fb923c',
    defaultHeaderColor: '#c2410c',
    defaultFont: 'c4d_clan',
    defaultOpacity: 90,
    gutterStyle: 'cod_camo',
    leftGutterSample: 'QUICKSCOPE MONTAGE • 720p 60FPS',
    rightGutterSample: 'LEADERBOARD RANK #1 • FAZE CLAN',
    cssBackground: (bg = '#0a0a0a') => ({
      backgroundColor: bg,
      backgroundImage: `
        linear-gradient(135deg, rgba(249,115,22,0.15) 0%, transparent 20%, transparent 80%, rgba(249,115,22,0.15) 100%),
        repeating-linear-gradient(45deg, #18181b 0px, #18181b 2px, #09090b 2px, #09090b 6px),
        radial-gradient(circle at 50% 0%, rgba(249,115,22,0.25) 0%, transparent 50%)
      `,
    }),
  },
];

export interface HeaderBannerPreset {
  id: string;
  name: string;
  networkTag: string;
  height: 'compact' | 'normal' | 'extended' | 'panoramic';
  bannerBgGradient: string;
  title: string;
  tagline: string;
  badge: 'machinima' | 'maker' | 'fullscreen' | 'director' | 'musician' | 'guru' | 'homebrew' | 'none';
  customCss?: string;
}

export const HEADER_BANNER_PRESETS: HeaderBannerPreset[] = [
  {
    id: 'machinima_official',
    name: 'Machinima Official Partner Header',
    networkTag: 'MACH',
    height: 'extended',
    bannerBgGradient: 'linear-gradient(135deg, #180000 0%, #680000 40%, #990000 70%, #1a0000 100%)',
    title: 'OFFICIAL MACHINIMA BROADCASTER',
    tagline: 'Best in Gaming, Montages & Cinema 4D Action • 1080p High Definition',
    badge: 'machinima',
    customCss: 'box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 4px 15px rgba(204,24,30,0.4);',
  },
  {
    id: 'homebrew_channel',
    name: 'Homebrew Channel Custom Console Header',
    networkTag: 'HOMEBREW',
    height: 'normal',
    bannerBgGradient: 'linear-gradient(135deg, #022036 0%, #034875 50%, #0077b6 100%)',
    title: 'THE HOMEBREW CHANNEL NETWORK',
    tagline: 'Custom Firmware, Retro Emulators & Community Homebrew Engine',
    badge: 'homebrew',
    customCss: 'box-shadow: inset 0 0 30px rgba(0,240,255,0.3); border-bottom: 3px solid #38bdf8;',
  },
  {
    id: 'clan_fx_3d',
    name: 'Clan Gaming Cinema 4D Extrusion',
    networkTag: 'CLAN',
    height: 'panoramic',
    bannerBgGradient: 'linear-gradient(135deg, #000000 0%, #111827 50%, #1e1b4b 100%)',
    title: '★ CLAN GAMING 3D MONTAGE UNIT ★',
    tagline: 'Cinema 4D Bevels • Color Grade FX • Trickshot Team',
    badge: 'director',
    customCss: 'border-bottom: 3px solid #00f0ff; box-shadow: 0 0 25px rgba(0,240,255,0.5);',
  },
  {
    id: 'maker_syndicate',
    name: 'Maker Studios / The Station Syndicate',
    networkTag: 'MAKER',
    height: 'normal',
    bannerBgGradient: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7e22ce 100%)',
    title: 'MAKER STUDIOS CREATOR SYNDICATE',
    tagline: 'Independent Creator Collective • Cross-Promotion Partner',
    badge: 'maker',
    customCss: 'border-bottom: 2px solid #a855f7;',
  },
  {
    id: 'retro_2008_classic',
    name: 'Classic 2008 Broadcast Yourself Banner',
    networkTag: 'YOUTUBE',
    height: 'compact',
    bannerBgGradient: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)',
    title: 'BROADCAST YOURSELF™',
    tagline: 'Official RetroTube Channel Hub • Comments & Five-Star Ratings Welcome',
    badge: 'none',
    customCss: 'border-bottom: 1px solid #cbd5e1;',
  },
];

export const FONT_PAIRING_PRESETS = [
  {
    id: 'c4d_clan',
    name: 'Cinema 4D / Clan Heavy',
    fontClass: 'font-black tracking-tight font-sans uppercase',
    cssFamily: 'Impact, "Arial Black", sans-serif',
    desc: 'Aggressive 3D extrusion typography popular in Call of Duty clan channels.',
  },
  {
    id: 'impact',
    name: 'Impact Bold',
    fontClass: 'font-black tracking-tight font-sans',
    cssFamily: 'Impact, sans-serif',
    desc: 'Classic bold YouTube montage and meme header font.',
  },
  {
    id: 'sans',
    name: 'Classic YouTube 2008 (Arial)',
    fontClass: 'font-sans',
    cssFamily: 'Arial, "Helvetica Neue", sans-serif',
    desc: 'Clean, authentic standard YouTube 2008 typography.',
  },
  {
    id: 'mono',
    name: 'Cyber Terminal (Monospace)',
    fontClass: 'font-mono',
    cssFamily: '"Courier New", Courier, monospace',
    desc: 'Retro hacker terminal code font for tech and homebrew channels.',
  },
  {
    id: 'homebrew',
    name: 'Homebrew Retro 8-Bit',
    fontClass: 'font-mono font-bold tracking-wider',
    cssFamily: '"Courier New", Consolas, monospace',
    desc: 'Telemetry console style for gaming hardware mods.',
  },
  {
    id: 'serif',
    name: 'Editorial Lore (Georgia)',
    fontClass: 'font-serif',
    cssFamily: 'Georgia, "Times New Roman", serif',
    desc: 'Classic vintage print font for documentaries and music lore.',
  },
  {
    id: 'comic',
    name: 'Playful Comic (Comic Sans)',
    fontClass: 'font-sans italic',
    cssFamily: '"Comic Sans MS", "Comic Sans", cursive',
    desc: 'Nostalgic early web comic and Machinima blooper reels.',
  },
];

export const HEX_COLOR_PALETTES = {
  backgrounds: [
    { label: 'Deep Pitch Black', hex: '#000000', desc: '100% Obsidian Clan Black' },
    { label: 'Homebrew Cyan Deep', hex: '#051824', desc: 'Homebrew Channel Dark Navy' },
    { label: 'Obsidian Nebula', hex: '#080812', desc: 'Space Cosmic Night' },
    { label: 'Clan 3D Carbon', hex: '#07090e', desc: 'Cinema 4D Gaming Black' },
    { label: 'Machinima Blood', hex: '#180000', desc: 'Machinima Deep Crimson' },
    { label: 'Tactical Camo', hex: '#0a0a0a', desc: 'Call of Duty Black Ops' },
    { label: 'Classic Tube Grey', hex: '#f1f1f1', desc: '2008 Default Grid Grey' },
    { label: 'Windows XP Blue', hex: '#3b82f6', desc: 'Bliss Rolling Sky' },
  ],
  boxFills: [
    { label: 'Deep Pitch Black', hex: '#000000' },
    { label: 'Dark Bevel Charcoal', hex: '#0d0d0d' },
    { label: 'Homebrew Dark Navy', hex: '#0a2233' },
    { label: 'Obsidian Slate', hex: '#101124' },
    { label: 'Clean Solid White', hex: '#ffffff' },
    { label: 'Parchment Cream', hex: '#fafaf9' },
    { label: 'Machinima Dark Red', hex: '#260404' },
    { label: 'Graphite Metal', hex: '#1f2937' },
  ],
  borders: [
    { label: 'Machinima Red', hex: '#cc181e' },
    { label: 'Homebrew Cyan', hex: '#38bdf8' },
    { label: 'Neon Flare Cyan', hex: '#00f0ff' },
    { label: 'Phosphor Green', hex: '#39ff14' },
    { label: 'Clan Gold', hex: '#ffd700' },
    { label: 'Classic Tube Grey', hex: '#cccccc' },
    { label: 'Electric Purple', hex: '#a855f7' },
    { label: 'Solar Orange', hex: '#f97316' },
  ],
  highlights: [
    { label: 'Machinima Hot Red', hex: '#ff2233' },
    { label: 'Homebrew Glow Blue', hex: '#7dd3fc' },
    { label: 'Neon Cyan Glow', hex: '#00f0ff' },
    { label: 'Matrix Terminal Green', hex: '#39ff14' },
    { label: 'Clan Gold Link', hex: '#facc15' },
    { label: 'Classic Tube Link Blue', hex: '#0033cc' },
    { label: 'Vibrant Magenta', hex: '#ec4899' },
    { label: 'Blaze Orange', hex: '#fb923c' },
  ],
};

export const hexToRgba = (hex: string, alpha: number) => {
  let c = (hex || '#ffffff').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(255, 255, 255, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getChannelWallpaperStyle = (channel: {
  bgColor?: string;
  bgPattern?: string;
  bgImageBase64?: string;
  bgRepeat?: string;
  bgFixed?: boolean;
}): React.CSSProperties => {
  const style: React.CSSProperties = {
    backgroundColor: channel.bgColor || '#f0f2f5',
  };

  if (channel.bgImageBase64 || channel.bgPattern === 'custom') {
    if (channel.bgImageBase64) {
      style.backgroundImage = `url(${channel.bgImageBase64})`;
    }
    style.backgroundRepeat = (channel.bgRepeat as any) || 'repeat';
    if (channel.bgFixed) style.backgroundAttachment = 'fixed';
    if (channel.bgRepeat === 'no-repeat') style.backgroundSize = 'cover';
    return style;
  }

  const preset = WALLPAPER_PRESETS.find((p) => p.id === channel.bgPattern);
  if (preset) {
    const presetStyle = preset.cssBackground(channel.bgColor || preset.defaultBgColor);
    Object.assign(style, presetStyle);
    if (channel.bgRepeat && channel.bgRepeat !== 'repeat') {
      style.backgroundRepeat = channel.bgRepeat;
    }
    if (channel.bgFixed) {
      style.backgroundAttachment = 'fixed';
    }
    return style;
  }

  switch (channel.bgPattern) {
    case 'grid':
      style.backgroundImage = 'radial-gradient(#9ca3af 1px, transparent 1px)';
      style.backgroundSize = '16px 16px';
      break;
    case 'stars':
      style.backgroundColor = '#0b0c16';
      style.backgroundImage =
        'radial-gradient(white 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)';
      style.backgroundSize = '24px 24px, 48px 48px';
      break;
    case 'clouds':
      style.backgroundImage = 'linear-gradient(180deg, #38bdf8 0%, #bae6fd 60%, #e0f2fe 100%)';
      break;
    case 'bliss':
      style.backgroundImage = 'linear-gradient(180deg, #60a5fa 0%, #93c5fd 45%, #22c55e 46%, #15803d 100%)';
      break;
    case 'matrix':
      style.backgroundColor = '#021a0e';
      style.backgroundImage =
        'linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)';
      style.backgroundSize = '20px 20px';
      break;
    case 'wood':
      style.backgroundImage = 'linear-gradient(90deg, #78350f, #92400e, #78350f)';
      break;
    case 'dots':
      style.backgroundColor = '#f3f4f6';
      style.backgroundImage = 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)';
      style.backgroundSize = '12px 12px';
      break;
    default:
      break;
  }

  if (channel.bgRepeat && channel.bgRepeat !== 'repeat') {
    style.backgroundRepeat = channel.bgRepeat;
  }
  if (channel.bgFixed) {
    style.backgroundAttachment = 'fixed';
  }
  return style;
};

export const getChannelFontClass = (fontFamily?: string) => {
  switch (fontFamily) {
    case 'c4d_clan':
      return 'font-black tracking-tight font-sans uppercase';
    case 'impact':
      return 'font-black tracking-tight font-sans';
    case 'mono':
      return 'font-mono';
    case 'homebrew':
      return 'font-mono font-bold tracking-wider';
    case 'serif':
      return 'font-serif';
    case 'comic':
      return 'font-sans italic';
    case 'sans':
    default:
      return 'font-sans';
  }
};

