// Built-in Retro Vintage Logo Presets (SVG Data URLs)

export interface RetroLogoPreset {
  id: string;
  name: string;
  era: string;
  tagline: string;
  badgeText: string;
  description: string;
  dataUrl: string;
  recommendedHeight: number;
}

export const RETRO_LOGO_PRESETS: RetroLogoPreset[] = [
  {
    id: 'preset_2005_beta',
    name: 'RetroTube 2005 Beta',
    era: 'Early 2005',
    tagline: 'Your Digital Video Repository',
    badgeText: 'BETA',
    description: 'The minimalist original 2005 layout with serif branding and authentic red beta tag.',
    recommendedHeight: 34,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" width="280" height="64">
  <defs>
    <linearGradient id="tubeGrad05" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d82020"/>
      <stop offset="50%" stop-color="#c01515"/>
      <stop offset="100%" stop-color="#9a0e0e"/>
    </linearGradient>
    <filter id="shadow05" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <text x="6" y="44" font-family="'Times New Roman', serif" font-size="34" font-weight="bold" fill="#222" letter-spacing="-0.5">Retro</text>
  <g filter="url(#shadow05)">
    <rect x="94" y="10" width="86" height="44" rx="14" fill="url(#tubeGrad05)" stroke="#780808" stroke-width="1.5"/>
    <ellipse cx="137" cy="18" rx="34" ry="7" fill="#ffffff" opacity="0.32"/>
    <text x="137" y="42" font-family="'Times New Roman', serif" font-size="30" font-weight="bold" fill="#ffffff" text-anchor="middle">Tube</text>
  </g>
  <rect x="188" y="16" width="46" height="20" rx="3" fill="#e67e22" stroke="#b35400" stroke-width="1"/>
  <text x="211" y="30" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">BETA</text>
</svg>
`),
  },
  {
    id: 'preset_2006_classic',
    name: '2006 Broadcast Yourself',
    era: '2006 - 2009',
    tagline: 'Broadcast Yourself™',
    badgeText: 'GOLDEN ERA',
    description: 'The most iconic Web 2.0 gloss badge with high-contrast bevel and red tube screen.',
    recommendedHeight: 38,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64" width="300" height="64">
  <defs>
    <linearGradient id="glossGrad06" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff3333"/>
      <stop offset="48%" stop-color="#cc181e"/>
      <stop offset="52%" stop-color="#b01015"/>
      <stop offset="100%" stop-color="#800a0d"/>
    </linearGradient>
    <linearGradient id="shineGrad06" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <text x="4" y="45" font-family="'Impact', 'Arial Black', sans-serif" font-size="38" font-weight="bold" fill="#1f1f1f" letter-spacing="-0.5">Retro</text>
  <rect x="108" y="8" width="94" height="48" rx="16" fill="url(#glossGrad06)" stroke="#660000" stroke-width="2"/>
  <path d="M 112 12 Q 155 12 198 12 Q 198 28 155 28 Q 112 28 112 12 Z" fill="url(#shineGrad06)"/>
  <text x="155" y="44" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle">Tube</text>
  <text x="210" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#666">TM</text>
</svg>
`),
  },
  {
    id: 'preset_2008_hd_gold',
    name: '2008 Golden Era Tube HD',
    era: '2008 - 2011',
    tagline: 'High Definition Streaming 1080p',
    badgeText: '1080p HD',
    description: 'Sleek dark obsidian bezel with glowing metallic gold 1080p HD emblem.',
    recommendedHeight: 38,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" width="320" height="64">
  <defs>
    <linearGradient id="goldGrad08" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd700"/>
      <stop offset="50%" stop-color="#f39c12"/>
      <stop offset="100%" stop-color="#d35400"/>
    </linearGradient>
    <linearGradient id="tubeDark08" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e62020"/>
      <stop offset="100%" stop-color="#990000"/>
    </linearGradient>
  </defs>
  <text x="6" y="44" font-family="'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#2c3e50">Retro</text>
  <rect x="110" y="8" width="94" height="48" rx="14" fill="url(#tubeDark08)" stroke="#550000" stroke-width="2"/>
  <text x="157" y="43" font-family="'Arial Black', sans-serif" font-size="32" font-weight="900" fill="#ffffff" text-anchor="middle">Tube</text>
  <g transform="translate(214, 16)">
    <rect x="0" y="0" width="58" height="24" rx="4" fill="#111" stroke="url(#goldGrad08)" stroke-width="1.8"/>
    <text x="29" y="17" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="url(#goldGrad08)" text-anchor="middle" letter-spacing="1">1080p</text>
  </g>
</svg>
`),
  },
  {
    id: 'preset_8bit_pixel',
    name: '8-Bit Arcade Pixel Tube',
    era: 'Retro Pixel Style',
    tagline: 'Insert Coin To Broadcast',
    badgeText: 'PIXEL ART',
    description: 'Chunky arcade CRT pixel art aesthetic with vibrant phosphor green and pixel TV box.',
    recommendedHeight: 36,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 64" width="310" height="64">
  <rect x="0" y="0" width="310" height="64" fill="transparent"/>
  <!-- Pixelated Retro -->
  <text x="6" y="45" font-family="'Courier New', monospace" font-size="36" font-weight="900" fill="#222" letter-spacing="-1">RETRO</text>
  <!-- Pixel Box Tube -->
  <rect x="140" y="10" width="92" height="44" fill="#e74c3c"/>
  <rect x="136" y="14" width="100" height="36" fill="#e74c3c"/>
  <rect x="144" y="14" width="84" height="36" fill="#c0392b"/>
  <rect x="146" y="16" width="30" height="8" fill="#ff7675" opacity="0.8"/>
  <text x="186" y="42" font-family="'Courier New', monospace" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle">TUBE</text>
  <g transform="translate(244, 16)">
    <rect x="0" y="0" width="46" height="20" fill="#2ecc71"/>
    <text x="23" y="14" font-family="monospace" font-size="10" font-weight="900" fill="#000" text-anchor="middle">8-BIT</text>
  </g>
</svg>
`),
  },
  {
    id: 'preset_cyber_synthwave',
    name: 'Cyber Neon Synthwave',
    era: 'Neon 80s/90s',
    tagline: 'Outrun The Algorithm',
    badgeText: 'NEON',
    description: 'Electric cyan and neon magenta grid aesthetic with synthwave CRT tube box.',
    recommendedHeight: 38,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 64" width="310" height="64">
  <defs>
    <linearGradient id="neonCyanPink" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f3ff"/>
      <stop offset="100%" stop-color="#ff007f"/>
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ff007f" flood-opacity="0.8"/>
    </filter>
  </defs>
  <text x="6" y="44" font-family="'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#0a0a14" stroke="#00f3ff" stroke-width="1.2">RETRO</text>
  <g filter="url(#neonGlow)">
    <rect x="136" y="8" width="94" height="48" rx="12" fill="#120524" stroke="url(#neonCyanPink)" stroke-width="2.5"/>
    <text x="183" y="43" font-family="'Arial Black', sans-serif" font-size="32" font-weight="900" fill="#ff007f" text-anchor="middle">TUBE</text>
  </g>
  <text x="240" y="32" font-family="sans-serif" font-size="10" font-weight="900" fill="#00f3ff" letter-spacing="1">⚡NEON</text>
</svg>
`),
  },
  {
    id: 'preset_win98_media',
    name: 'Windows 98 Media Tube',
    era: 'Windows 95/98',
    tagline: 'Multimedia Edition v4.0',
    badgeText: 'WIN98',
    description: 'Chunky 3D beveled silver-gray chassis with teal Windows Media banner.',
    recommendedHeight: 36,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 64" width="310" height="64">
  <rect x="4" y="8" width="292" height="48" fill="#c0c0c0" stroke="#808080" stroke-width="1.5"/>
  <line x1="4" y1="8" x2="296" y2="8" stroke="#ffffff" stroke-width="2"/>
  <line x1="4" y1="8" x2="4" y2="56" stroke="#ffffff" stroke-width="2"/>
  <line x1="5" y1="55" x2="296" y2="55" stroke="#404040" stroke-width="2"/>
  <line x1="295" y1="8" x2="295" y2="56" stroke="#404040" stroke-width="2"/>
  <rect x="10" y="14" width="24" height="36" fill="#008080"/>
  <text x="22" y="38" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff" text-anchor="middle">▶</text>
  <text x="44" y="42" font-family="'MS Sans Serif', Tahoma, sans-serif" font-size="28" font-weight="bold" fill="#000000">Retro</text>
  <rect x="126" y="14" width="86" height="36" fill="#000080"/>
  <text x="169" y="41" font-family="'MS Sans Serif', Tahoma, sans-serif" font-size="26" font-weight="bold" fill="#ffffff" text-anchor="middle">Tube</text>
  <rect x="220" y="18" width="66" height="26" fill="#ffffff" stroke="#000" stroke-width="1"/>
  <text x="253" y="36" font-family="sans-serif" font-size="11" font-weight="bold" fill="#cc0000" text-anchor="middle">v4.0</text>
</svg>
`),
  },
  {
    id: 'preset_vaporwave_tv',
    name: 'Vaporwave Sunset TV',
    era: 'Vaporwave 90s',
    tagline: 'ＡＥＳＴＨＥＴＩＣ ＶＩＤＥＯ',
    badgeText: 'VHS',
    description: 'Nostalgic purple-pink sunset CRT television tube with VHS tape indicator.',
    recommendedHeight: 38,
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 64" width="310" height="64">
  <defs>
    <linearGradient id="vapoSunset" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff71ce"/>
      <stop offset="50%" stop-color="#b967ff"/>
      <stop offset="100%" stop-color="#01cdfe"/>
    </linearGradient>
  </defs>
  <text x="6" y="43" font-family="'Arial Black', sans-serif" font-size="32" font-weight="900" fill="#2d1345" letter-spacing="1">RETRO</text>
  <rect x="130" y="8" width="96" height="48" rx="14" fill="url(#vapoSunset)" stroke="#521482" stroke-width="2"/>
  <ellipse cx="178" cy="18" rx="36" ry="6" fill="#ffffff" opacity="0.4"/>
  <text x="178" y="43" font-family="'Arial Black', sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle">TUBE</text>
  <rect x="236" y="16" width="46" height="22" rx="4" fill="#05ffa1" stroke="#00b874" stroke-width="1.5"/>
  <text x="259" y="32" font-family="monospace" font-size="12" font-weight="900" fill="#000000" text-anchor="middle">SP-LP</text>
</svg>
`),
  },
];
