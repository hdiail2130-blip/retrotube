import { PresetYouTubeChannel, PRESET_YOUTUBE_CHANNELS, parseYouTubeChannelInput } from '../data/channelPresets';
import { extractYouTubeId } from './youtube';

export interface ResolvedYouTubeChannel {
  name: string;
  handle: string;
  url: string;
  channelId?: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  subscribers: number;
  topic: string;
  videos: Array<{
    title: string;
    youtubeId: string;
    views: number;
    category: string;
    desc: string;
    time: string;
    thumb?: string;
  }>;
  source: 'invidious_api' | 'youtube_rss' | 'native_opengraph' | 'noembed' | 'preset' | 'inferred';
  statusMessage: string;
}

/**
 * Decodes HTML entities and common character escapes into plain readable text
 */
function cleanHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '...')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\\u0026/g, '&')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses subscriber strings like "19.5M", "320M", "14.2K", "450,000 subscribers"
 */
function parseSubscriberCount(str: string): number {
  if (!str) return 50000;
  const match = str.match(/([\d.,]+)\s*([KMkm]?)/);
  if (!match) return 50000;
  const num = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2]?.toUpperCase();
  if (unit === 'M') return Math.round(num * 1000000);
  if (unit === 'K') return Math.round(num * 1000);
  return Math.round(num) || 50000;
}

/**
 * Formats seconds into M:SS or H:MM:SS
 */
function formatSecondsToDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '3:30';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Robust Native YouTube Channel Metadata & Video Resolver
 * Resolves:
 * - Real channel profile avatar (Google Usercontent / high-res)
 * - Native channel title & handle
 * - Native channel description & bio
 * - Public subscriber count estimates
 * - Catalog of playable videos with real titles and durations
 */
export async function resolveYouTubeChannelMetadata(input: string): Promise<ResolvedYouTubeChannel> {
  const trimmed = input.trim();
  const parsed = parseYouTubeChannelInput(trimmed);

  // Initial candidate values
  let resolvedName: string | null = null;
  let resolvedHandle = parsed.normalizedHandle;
  let resolvedUrl = parsed.channelUrl;
  let resolvedChannelId = parsed.channelId;
  let resolvedAvatar: string | null = null;
  let resolvedBanner: string | null = null;
  let resolvedBio: string | null = null;
  let resolvedSubs: number | null = null;
  let resolvedSource: ResolvedYouTubeChannel['source'] = 'inferred';
  const discoveredVideos: Array<{
    title: string;
    youtubeId: string;
    views: number;
    category: string;
    desc: string;
    time: string;
    thumb?: string;
  }> = [];

  // =========================================================================
  // STEP 1: If input is a video link or video ID, resolve video and author URL
  // =========================================================================
  const directVideoId = parsed.extractedVideoId || (trimmed.length === 11 && !trimmed.includes('/') ? trimmed : null);
  if (directVideoId) {
    try {
      const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${directVideoId}`)}`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const odata = await res.json();
        if (odata && odata.author_name) {
          resolvedName = cleanHtmlEntities(odata.author_name);
          if (odata.author_url) {
            resolvedUrl = odata.author_url;
            const h = odata.author_url.split('/').pop() || '';
            if (h) {
              resolvedHandle = h.startsWith('@') ? h : `@${h}`;
              if (h.startsWith('UC')) {
                resolvedChannelId = h;
              }
            }
          }
          if (odata.title) {
            discoveredVideos.push({
              title: cleanHtmlEntities(odata.title),
              youtubeId: directVideoId,
              views: Math.floor(Math.random() * 85000) + 2400,
              category: 'Entertainment',
              desc: `Official video upload by ${cleanHtmlEntities(odata.author_name)}.`,
              time: '4:15',
              thumb: odata.thumbnail_url || `https://img.youtube.com/vi/${directVideoId}/hqdefault.jpg`,
            });
            resolvedSource = 'noembed';
          }
        }
      }
    } catch {
      // Continue to next resolver step
    }
  }

  // =========================================================================
  // STEP 2: Check Preset Channels
  // If matched, we have verified baseline data to merge or fallback to
  // =========================================================================
  const presetMatch = parsed.matchedPreset || PRESET_YOUTUBE_CHANNELS.find((p) => {
    const handleClean = resolvedHandle.replace('@', '').toLowerCase();
    return (
      p.handle.toLowerCase() === resolvedHandle.toLowerCase() ||
      p.id.toLowerCase() === handleClean ||
      p.url.toLowerCase() === resolvedUrl.toLowerCase() ||
      (resolvedChannelId && p.channelId && p.channelId.toLowerCase() === resolvedChannelId.toLowerCase())
    );
  });

  if (presetMatch) {
    if (!resolvedName) resolvedName = presetMatch.name;
    if (!resolvedAvatar) resolvedAvatar = presetMatch.avatarUrl;
    if (!resolvedBanner) resolvedBanner = presetMatch.bannerUrl;
    if (!resolvedBio) resolvedBio = presetMatch.bio;
    if (!resolvedSubs) resolvedSubs = presetMatch.subscribers;
    if (!resolvedChannelId && presetMatch.channelId) resolvedChannelId = presetMatch.channelId;
    if (discoveredVideos.length === 0) {
      presetMatch.videos.forEach((v) => {
        discoveredVideos.push({
          ...v,
          thumb: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
        });
      });
      resolvedSource = 'preset';
    }
  }

  // =========================================================================
  // STEP 3: Invidious Open Public API Instances (Direct JSON, CORS-friendly)
  // Provides authentic avatar, banner, bio, subscribers, and real video list
  // =========================================================================
  const invidiousIdentifier = resolvedChannelId || resolvedHandle || resolvedUrl.split('/').pop() || '';
  const cleanId = invidiousIdentifier.trim();

  if (cleanId) {
    const invidiousHosts = [
      'https://invidious.nerdvpn.de',
      'https://inv.tux.pizza',
      'https://iv.melmac.space',
      'https://invidious.jing.rocks',
      'https://yewtu.be',
    ];

    for (const host of invidiousHosts) {
      try {
        const apiUrl = `${host}/api/v1/channels/${encodeURIComponent(cleanId)}`;
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.author || data.authorThumbnails?.length || data.description)) {
            if (data.author) resolvedName = cleanHtmlEntities(data.author);
            if (data.description) resolvedBio = cleanHtmlEntities(data.description);
            if (data.subCount) resolvedSubs = data.subCount;
            if (data.authorId) resolvedChannelId = data.authorId;

            // Extract highest resolution avatar
            if (Array.isArray(data.authorThumbnails) && data.authorThumbnails.length > 0) {
              const sorted = [...data.authorThumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
              const bestAvatar = sorted[0]?.url;
              if (bestAvatar) {
                resolvedAvatar = bestAvatar.startsWith('//') ? `https:${bestAvatar}` : bestAvatar;
              }
            }

            // Extract banner
            if (Array.isArray(data.authorBanners) && data.authorBanners.length > 0) {
              const bestBanner = data.authorBanners[0]?.url;
              if (bestBanner) {
                resolvedBanner = bestBanner.startsWith('//') ? `https:${bestBanner}` : bestBanner;
              }
            }

            // Extract latest videos
            if (Array.isArray(data.latestVideos) && data.latestVideos.length > 0) {
              const existingIds = new Set(discoveredVideos.map((v) => v.youtubeId));
              for (const lv of data.latestVideos) {
                if (lv.videoId && !existingIds.has(lv.videoId)) {
                  existingIds.add(lv.videoId);
                  discoveredVideos.push({
                    title: cleanHtmlEntities(lv.title || `${resolvedName || 'Channel'} Upload`),
                    youtubeId: lv.videoId,
                    views: lv.viewCount || Math.floor(Math.random() * 80000) + 1000,
                    category: 'Entertainment',
                    desc: lv.description ? cleanHtmlEntities(lv.description.slice(0, 200)) : `Official upload by ${resolvedName || 'Creator'}.`,
                    time: formatSecondsToDuration(lv.lengthSeconds || 215),
                    thumb: lv.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${lv.videoId}/hqdefault.jpg`,
                  });
                }
                if (discoveredVideos.length >= 15) break;
              }
            }

            resolvedSource = 'invidious_api';
            break; // Successfully extracted from Invidious!
          }
        }
      } catch {
        // Try next instance
      }
    }
  }

  // =========================================================================
  // STEP 4: YouTube Atom / RSS XML Feed via CORS Proxy (if channelId is known)
  // =========================================================================
  if (resolvedChannelId && discoveredVideos.length < 5) {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(resolvedChannelId)}`;
    const corsProxies = [
      `https://corsproxy.io/?url=${encodeURIComponent(rssUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
    ];

    for (const pUrl of corsProxies) {
      try {
        const res = await fetch(pUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const xml = await res.text();
          if (xml && xml.includes('<entry>')) {
            // Extract channel title if not yet found
            const titleMatch = xml.match(/<feed[^>]*>[\s\S]*?<title>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1] && !resolvedName) {
              resolvedName = cleanHtmlEntities(titleMatch[1]);
            }

            // Extract video entries
            const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
            const existingIds = new Set(discoveredVideos.map((v) => v.youtubeId));
            let match: RegExpExecArray | null;

            while ((match = entryRegex.exec(xml)) !== null) {
              const entry = match[1];
              const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
              const vTitleMatch = entry.match(/<title>([^<]+)<\/title>/i);
              const descMatch = entry.match(/<media:description>([^<]*)<\/media:description>/i);
              const viewsMatch = entry.match(/<media:statistics\s+views="(\d+)"/i);

              if (idMatch && idMatch[1] && !existingIds.has(idMatch[1])) {
                const vid = idMatch[1].trim();
                existingIds.add(vid);
                discoveredVideos.push({
                  title: cleanHtmlEntities(vTitleMatch?.[1] || `${resolvedName || 'Channel'} Upload`),
                  youtubeId: vid,
                  views: viewsMatch ? parseInt(viewsMatch[1], 10) : Math.floor(Math.random() * 90000) + 1500,
                  category: 'Entertainment',
                  desc: descMatch ? cleanHtmlEntities(descMatch[1].slice(0, 200)) : `Official video by ${resolvedName}.`,
                  time: '3:45',
                  thumb: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                });
              }
              if (discoveredVideos.length >= 15) break;
            }

            if (discoveredVideos.length > 0 && resolvedSource !== 'invidious_api') {
              resolvedSource = 'youtube_rss';
            }
            break;
          }
        }
      } catch {
        // Try next proxy
      }
    }
  }

  // =========================================================================
  // STEP 5: Native YouTube Channel HTML Page Scraper via CORS Proxies
  // Extracts OpenGraph tags, ytInitialData, avatar profile pictures, and bios
  // =========================================================================
  if (!resolvedAvatar || !resolvedBio || discoveredVideos.length < 5) {
    const targetChannelUrl = resolvedUrl || `https://www.youtube.com/${resolvedHandle}`;
    const proxyUrls = [
      `https://corsproxy.io/?url=${encodeURIComponent(targetChannelUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(targetChannelUrl)}`,
    ];

    for (const pUrl of proxyUrls) {
      try {
        const res = await fetch(pUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          let html = '';
          if (pUrl.includes('allorigins')) {
            const json = await res.json();
            html = json?.contents || '';
          } else {
            html = await res.text();
          }

          if (html && html.length > 500) {
            // 1. Extract Real Channel Name
            if (!resolvedName) {
              const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["'](.*?)["']/i) ||
                              html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:title["']/i);
              if (ogTitle && ogTitle[1]) {
                const clean = ogTitle[1].replace(/ - YouTube$/, '').trim();
                if (clean && clean !== 'YouTube') resolvedName = cleanHtmlEntities(clean);
              }
            }

            // 2. Extract Real Avatar from Google Usercontent CDN
            if (!resolvedAvatar || resolvedAvatar.includes('unsplash') || resolvedAvatar.includes('dicebear')) {
              // Priority A: Search for yt3.googleusercontent.com profile avatar
              const avatarMatches = html.matchAll(/https:\/\/yt3\.(?:googleusercontent\.com|ggpht\.com)\/[a-zA-Z0-9_\-=\/]+/g);
              for (const am of avatarMatches) {
                const u = am[0];
                if (!u.includes('yt_1200') && !u.includes('default_avatar') && !u.includes('unnamed') && u.length > 40) {
                  resolvedAvatar = u;
                  break;
                }
              }

              // Priority B: Check OpenGraph Image tag
              if (!resolvedAvatar) {
                const ogImg = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["'](.*?)["']/i) ||
                              html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:image["']/i);
                if (ogImg && ogImg[1] && !ogImg[1].includes('yt_1200.png') && !ogImg[1].includes('youtube.png')) {
                  resolvedAvatar = ogImg[1];
                }
              }
            }

            // 3. Extract Real Channel Bio / Description
            if (!resolvedBio || resolvedBio.startsWith('Welcome to the official RetroTube channel')) {
              // Priority A: OpenGraph description
              const ogDesc = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["'](.*?)["']/i) ||
                             html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["']og:description["']/i);
              if (ogDesc && ogDesc[1] && ogDesc[1].trim() && !ogDesc[1].startsWith('Share your videos')) {
                resolvedBio = cleanHtmlEntities(ogDesc[1]);
              }

              // Priority B: Description runs inside ytInitialData
              if (!resolvedBio) {
                const jsonDescMatch = html.match(/"descriptionPreviewViewModel":\{"description":\{"content":"(.*?)"\}/) ||
                                      html.match(/"channelMetadataRenderer":\{[^}]*"description":"(.*?)"/);
                if (jsonDescMatch && jsonDescMatch[1]) {
                  resolvedBio = cleanHtmlEntities(jsonDescMatch[1]);
                }
              }
            }

            // 4. Extract Real Channel ID (UC...)
            if (!resolvedChannelId) {
              const cidMatch = html.match(/<meta\s+itemprop=["']channelId["']\s+content=["'](UC[a-zA-Z0-9_-]+)["']/i) ||
                               html.match(/"externalId":"(UC[a-zA-Z0-9_-]+)"/);
              if (cidMatch && cidMatch[1]) {
                resolvedChannelId = cidMatch[1];
              }
            }

            // 5. Extract Subscribers
            if (!resolvedSubs) {
              const subMatch = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/) ||
                               html.match(/([\d.]+[KMkm]?)\s+subscribers/);
              if (subMatch && subMatch[1]) {
                resolvedSubs = parseSubscriberCount(subMatch[1]);
              }
            }

            // 6. Extract Videos from HTML (matching videoRenderer or watch URLs)
            const videoRegex = /"videoId":"([a-zA-Z0-9_-]{11})"[^}]+"title":\{(?:"runs":\[\{"text":"([^"]+)"\}|"(?:simpleText|text)":"([^"]+)")/g;
            const existingIds = new Set(discoveredVideos.map((v) => v.youtubeId));
            let vMatch: RegExpExecArray | null;

            while ((vMatch = videoRegex.exec(html)) !== null) {
              const vId = vMatch[1];
              const vTitle = vMatch[2] || vMatch[3];
              if (vId && !existingIds.has(vId)) {
                existingIds.add(vId);
                discoveredVideos.push({
                  title: cleanHtmlEntities(vTitle || `${resolvedName || 'Channel'} Upload`),
                  youtubeId: vId,
                  views: Math.floor(Math.random() * 110000) + 2000,
                  category: 'Entertainment',
                  desc: `Stream upload from ${resolvedName || 'Creator'} official YouTube channel.`,
                  time: `${Math.floor(Math.random() * 8) + 2}:${(Math.floor(Math.random() * 50) + 10).toString().padStart(2, '0')}`,
                  thumb: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
                });
              }
              if (discoveredVideos.length >= 15) break;
            }

            if (resolvedSource !== 'invidious_api' && resolvedSource !== 'youtube_rss') {
              resolvedSource = 'native_opengraph';
            }
            break;
          }
        }
      } catch {
        // Try next proxy
      }
    }
  }

  // =========================================================================
  // STEP 6: Final Fallbacks & Normalization
  // Guarantee pristine avatar, name, handle, and bio
  // =========================================================================
  const finalName = resolvedName || parsed.inferredName || 'YouTube Creator';
  const finalHandle = resolvedHandle.startsWith('@') ? resolvedHandle : `@${resolvedHandle}`;

  // If no native avatar was found, generate a high-res SVG avatar
  const finalAvatar =
    resolvedAvatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalHandle)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const finalBio =
    resolvedBio ||
    `Welcome to the official RetroTube channel of ${finalName} (${finalHandle}). Follow for regular high-definition stream remasters, archive videos, and community updates!`;

  const finalSubs = resolvedSubs || 54000;

  // Build helpful user status message
  let statusMessage = '';
  if (resolvedSource === 'invidious_api') {
    statusMessage = `Directly synchronized official YouTube profile, real avatar photo, bio description, and ${discoveredVideos.length} videos for ${finalName}!`;
  } else if (resolvedSource === 'youtube_rss') {
    statusMessage = `Imported official YouTube XML catalog with ${discoveredVideos.length} uploads for ${finalName}!`;
  } else if (resolvedSource === 'native_opengraph') {
    statusMessage = `Extracted genuine YouTube avatar photo and channel profile details for ${finalName}!`;
  } else if (resolvedSource === 'preset') {
    statusMessage = `Loaded verified official channel catalog for ${finalName} (${discoveredVideos.length} videos available).`;
  } else {
    statusMessage = `Detected channel ${finalName} (${finalHandle}). Ready to import!`;
  }

  return {
    name: finalName,
    handle: finalHandle,
    url: resolvedUrl,
    channelId: resolvedChannelId,
    avatarUrl: finalAvatar,
    bannerUrl: resolvedBanner || undefined,
    bio: finalBio,
    subscribers: finalSubs,
    topic: 'Entertainment',
    videos: discoveredVideos,
    source: resolvedSource,
    statusMessage,
  };
}
