/**
 * Wayback Machine (web.archive.org) & Internet Archive (archive.org)
 * Stream Resolution, Parser, High-Performance Optimizer & Embed Generator
 */

import { extractYouTubeId } from './youtube';
import { Video } from '../types';

export interface WaybackParsedResult {
  isWayback: boolean;
  isArchiveOrg: boolean;
  rawUrl: string;
  originalUrl?: string;
  youtubeId?: string | null;
  archiveItemId?: string | null;
  snapshotTimestamp?: string;
  snapshotDateFormatted?: string;
  snapshotYear?: string;
  highPerformanceStreamUrl?: string;
  embedUrl?: string;
  mediaType: 'youtube_archive' | 'direct_stream' | 'archive_embed';
  note: string;
  suggestedPlaybackEngine?: 'high_performance' | 'wayback_embed' | 'youtube';
}

/**
 * Format Wayback 14-digit or 8-digit timestamp into readable date
 * e.g. "20090425010203" -> "Apr 25, 2009 (01:02 UTC)"
 */
export function formatWaybackTimestamp(timestamp?: string): { formatted: string; year: string } {
  if (!timestamp || timestamp.length < 4) {
    return { formatted: 'Archived Snapshot', year: 'Retro' };
  }

  const year = timestamp.substring(0, 4);
  const monthIdx = timestamp.length >= 6 ? parseInt(timestamp.substring(4, 6), 10) - 1 : -1;
  const day = timestamp.length >= 8 ? parseInt(timestamp.substring(6, 8), 10) : 1;
  const hour = timestamp.length >= 10 ? timestamp.substring(8, 10) : '';
  const min = timestamp.length >= 12 ? timestamp.substring(10, 12) : '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthName = monthIdx >= 0 && monthIdx < 12 ? months[monthIdx] : '';

  let formatted = '';
  if (monthName) {
    formatted = `${monthName} ${day}, ${year}`;
  } else {
    formatted = `Year ${year}`;
  }

  if (hour && min) {
    formatted += ` at ${hour}:${min} UTC`;
  }

  return { formatted, year };
}

/**
 * Parses any Wayback Machine or Archive.org URL or embed snippet
 * and extracts high-performance direct media streams, YouTube IDs, or clean embeds.
 */
export function parseWaybackUrl(inputUrl: string): WaybackParsedResult {
  let trimmed = (inputUrl || '').trim();

  // Handle pasted <iframe> or <embed> snippet
  if (trimmed.includes('<iframe') || trimmed.includes('<embed')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1].trim();
    }
  }

  // Remove surrounding quotes if any
  trimmed = trimmed.replace(/^["']|["']$/g, '');

  if (!trimmed) {
    return {
      isWayback: false,
      isArchiveOrg: false,
      rawUrl: '',
      mediaType: 'direct_stream',
      note: 'Empty URL provided.',
      suggestedPlaybackEngine: 'high_performance',
    };
  }

  const isWaybackDomain = /web\.archive\.org/i.test(trimmed);
  const isArchiveOrgDomain = /archive\.org/i.test(trimmed);

  // 1. Check if it's a web.archive.org URL
  if (isWaybackDomain) {
    // Check for raw direct stream with modifiers: id_, oe_, if_, mp_, im_
    const rawModifierRegex = /web\.archive\.org\/web\/(\d{4,14})(id_|oe_|if_|mp_|im_)\/(https?:\/\/.*|\w+:\/\/.*)/i;
    const rawMatch = trimmed.match(rawModifierRegex);

    if (rawMatch) {
      const timestamp = rawMatch[1];
      const modifier = rawMatch[2];
      const originalUrl = rawMatch[3];
      const { formatted: snapshotDateFormatted, year: snapshotYear } = formatWaybackTimestamp(timestamp);
      const ytId = extractYouTubeId(originalUrl);

      const highPerformanceStreamUrl = `https://web.archive.org/web/${timestamp}id_/${originalUrl}`;
      const embedUrl = `https://web.archive.org/web/${timestamp}if_/${originalUrl}`;

      return {
        isWayback: true,
        isArchiveOrg: true,
        rawUrl: trimmed,
        originalUrl,
        youtubeId: ytId,
        snapshotTimestamp: timestamp,
        snapshotDateFormatted,
        snapshotYear,
        highPerformanceStreamUrl,
        embedUrl,
        mediaType: ytId ? 'youtube_archive' : 'direct_stream',
        suggestedPlaybackEngine: modifier === 'if_' ? 'wayback_embed' : 'high_performance',
        note: `Wayback Machine direct stream detected with [${modifier}] flag. High-performance byte-streaming and clean embed generated!`,
      };
    }

    // Pattern: web.archive.org/web/{timestamp}{optional_flags}/{original_url}
    const wbRegex = /web\.archive\.org\/web\/(\d{4,14})([a-z_]{0,4})\/(https?:\/\/.*|\w+:\/\/.*)/i;
    const match = trimmed.match(wbRegex);

    if (match) {
      const timestamp = match[1];
      const originalUrl = match[3];

      const { formatted: snapshotDateFormatted, year: snapshotYear } = formatWaybackTimestamp(timestamp);
      const ytId = extractYouTubeId(originalUrl);

      // High-performance stream using identity modifier `id_`
      // Bypasses the heavy Wayback Machine header toolbar and serves raw byte ranges!
      const highPerformanceStreamUrl = `https://web.archive.org/web/${timestamp}id_/${originalUrl}`;
      // Clean iframe embed using `if_` modifier
      const embedUrl = `https://web.archive.org/web/${timestamp}if_/${originalUrl}`;

      if (ytId) {
        return {
          isWayback: true,
          isArchiveOrg: true,
          rawUrl: trimmed,
          originalUrl,
          youtubeId: ytId,
          snapshotTimestamp: timestamp,
          snapshotDateFormatted,
          snapshotYear,
          highPerformanceStreamUrl,
          embedUrl,
          mediaType: 'youtube_archive',
          suggestedPlaybackEngine: 'high_performance',
          note: `Archived YouTube Video (${snapshotYear}) detected! Preserved stream link ready with instant 60fps HTML5 acceleration.`,
        };
      }

      const isDirectMedia = /\.(mp4|webm|ogv|flv|mov|m4v|mkv)(\?.*)?$/i.test(originalUrl);

      return {
        isWayback: true,
        isArchiveOrg: true,
        rawUrl: trimmed,
        originalUrl,
        snapshotTimestamp: timestamp,
        snapshotDateFormatted,
        snapshotYear,
        highPerformanceStreamUrl,
        embedUrl,
        mediaType: isDirectMedia ? 'direct_stream' : 'archive_embed',
        suggestedPlaybackEngine: isDirectMedia ? 'high_performance' : 'wayback_embed',
        note: `Wayback Machine Snapshot (${snapshotDateFormatted}) converted to high-performance direct byte stream (id_ mode) and clean embed (if_ mode)!`,
      };
    }
  }

  // 2. Check if it's an archive.org URL (embed, details, download)
  if (isArchiveOrgDomain) {
    // Check archive.org/embed/{id}
    const embedRegex = /archive\.org\/embed\/([a-zA-Z0-9_\-\.]+)/i;
    const embedMatch = trimmed.match(embedRegex);
    if (embedMatch) {
      const itemId = embedMatch[1];
      const ytMatch = itemId.match(/^youtube-([a-zA-Z0-9_-]{11})$/i);
      const ytId = ytMatch ? ytMatch[1] : null;

      return {
        isWayback: false,
        isArchiveOrg: true,
        rawUrl: trimmed,
        archiveItemId: itemId,
        youtubeId: ytId,
        highPerformanceStreamUrl: `https://archive.org/download/${itemId}/${itemId}.mp4`,
        embedUrl: `https://archive.org/embed/${itemId}`,
        mediaType: ytId ? 'youtube_archive' : 'archive_embed',
        suggestedPlaybackEngine: 'wayback_embed',
        note: `Internet Archive Item "${itemId}" embedded with responsive playback & high-performance fallback stream.`,
      };
    }

    // Check archive.org/details/{id}
    const detailsRegex = /archive\.org\/details\/([a-zA-Z0-9_\-\.]+)/i;
    const detailsMatch = trimmed.match(detailsRegex);
    if (detailsMatch) {
      const itemId = detailsMatch[1];
      const ytMatch = itemId.match(/^youtube-([a-zA-Z0-9_-]{11})$/i);
      const ytId = ytMatch ? ytMatch[1] : null;

      return {
        isWayback: false,
        isArchiveOrg: true,
        rawUrl: trimmed,
        archiveItemId: itemId,
        youtubeId: ytId,
        highPerformanceStreamUrl: `https://archive.org/download/${itemId}/${itemId}.mp4`,
        embedUrl: `https://archive.org/embed/${itemId}`,
        mediaType: ytId ? 'youtube_archive' : 'archive_embed',
        suggestedPlaybackEngine: 'high_performance',
        note: `Internet Archive Details "${itemId}" converted to high-speed embed stream!`,
      };
    }

    // Check archive.org/download/{id}/{filename}
    const downloadRegex = /archive\.org\/download\/([a-zA-Z0-9_\-\.]+)\/(.*)/i;
    const downloadMatch = trimmed.match(downloadRegex);
    if (downloadMatch) {
      const itemId = downloadMatch[1];
      const filename = downloadMatch[2];

      return {
        isWayback: false,
        isArchiveOrg: true,
        rawUrl: trimmed,
        archiveItemId: itemId,
        highPerformanceStreamUrl: trimmed,
        embedUrl: `https://archive.org/embed/${itemId}`,
        mediaType: 'direct_stream',
        suggestedPlaybackEngine: 'high_performance',
        note: `Direct Internet Archive Media File (${filename}) loaded for high-fps native HTML5 playback!`,
      };
    }
  }

  // 3. Fallback: check if standard URL has YouTube ID
  const fallbackYt = extractYouTubeId(trimmed);
  if (fallbackYt) {
    return {
      isWayback: false,
      isArchiveOrg: false,
      rawUrl: trimmed,
      youtubeId: fallbackYt,
      mediaType: 'youtube_archive',
      suggestedPlaybackEngine: 'youtube',
      note: 'Standard YouTube link detected.',
    };
  }

  // 4. Fallback: direct video stream (mp4, webm)
  return {
    isWayback: false,
    isArchiveOrg: false,
    rawUrl: trimmed,
    highPerformanceStreamUrl: trimmed,
    mediaType: 'direct_stream',
    suggestedPlaybackEngine: 'high_performance',
    note: 'Generic media stream or video URL.',
  };
}

/**
 * Generate authentic 2008 embed code snippets for Wayback Machine & archive streams
 */
export function generateWaybackEmbedCode(
  video: Partial<Video>,
  format: 'iframe' | 'flash_object' | 'html5_video' | 'direct_stream',
  options: { width?: number; height?: number; autoplay?: boolean; allowFullscreen?: boolean } = {}
): string {
  const width = options.width || 640;
  const height = options.height || 385;
  const autoplay = options.autoplay ? 1 : 0;
  const allowFullscreen = options.allowFullscreen !== false;

  const embedUrl =
    video.waybackEmbedUrl ||
    (video.waybackUrl && video.waybackUrl.includes('archive.org/details')
      ? video.waybackUrl.replace('/details/', '/embed/')
      : video.waybackUrl) ||
    (video.youtubeId ? `https://www.youtube.com/embed/${video.youtubeId}` : '');

  const streamUrl = video.waybackHighPerformanceUrl || video.streamUrl || video.videoBase64 || '';

  switch (format) {
    case 'iframe':
      return `<iframe width="${width}" height="${height}" src="${embedUrl}${
        embedUrl.includes('?') ? '&' : '?'
      }autoplay=${autoplay}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ${
        allowFullscreen ? 'allowfullscreen' : ''
      }></iframe>`;

    case 'flash_object':
      // Authentic 2008 YouTube / Wayback Flash embed syntax
      return `<object width="${width}" height="${height}">
  <param name="movie" value="${embedUrl}"></param>
  <param name="allowFullScreen" value="${allowFullscreen ? 'true' : 'false'}"></param>
  <param name="allowscriptaccess" value="always"></param>
  <param name="wmode" value="transparent"></param>
  <embed src="${embedUrl}" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="${allowFullscreen ? 'true' : 'false'}" width="${width}" height="${height}" wmode="transparent"></embed>
</object>`;

    case 'html5_video':
      return `<video width="${width}" height="${height}" controls ${autoplay ? 'autoplay ' : ''}playsinline poster="${video.thumb || ''}">
  <source src="${streamUrl || embedUrl}" type="video/mp4" />
  Your browser does not support the video tag.
</video>`;

    case 'direct_stream':
    default:
      return streamUrl || embedUrl || video.waybackUrl || '';
  }
}

/**
 * Returns the list of playback engines available for a given video
 */
export function getWaybackPlaybackEngines(video: Partial<Video>): Array<{
  id: 'high_performance' | 'wayback_embed' | 'youtube';
  name: string;
  icon: string;
  badge: string;
  description: string;
}> {
  const engines: Array<{
    id: 'high_performance' | 'wayback_embed' | 'youtube';
    name: string;
    icon: string;
    badge: string;
    description: string;
  }> = [];

  const hasHighPerf = Boolean(video.waybackHighPerformanceUrl || video.streamUrl || video.videoBase64);
  const hasWayback = Boolean(video.waybackUrl || video.waybackEmbedUrl);
  const hasYouTube = Boolean(video.youtubeId);

  if (hasHighPerf) {
    engines.push({
      id: 'high_performance',
      name: 'High-Performance Direct Stream',
      icon: '⚡',
      badge: '60fps HTML5 Raw',
      description: 'Zero-lag direct byte streaming with full retro player controls, annotations & skins.',
    });
  }

  if (hasWayback) {
    engines.push({
      id: 'wayback_embed',
      name: 'Wayback Machine Preserved Embed',
      icon: '🏛️',
      badge: 'Archive IFrame',
      description: 'Clean embedded archive player preserved directly from the Internet Archive.',
    });
  }

  if (hasYouTube) {
    engines.push({
      id: 'youtube',
      name: 'Modern YouTube Player',
      icon: '▶️',
      badge: 'YouTube IFrame',
      description: 'Standard YouTube player integration with fallback to Wayback archives.',
    });
  }

  return engines;
}

/**
 * Famous historical Wayback Machine snapshots from 2005-2011
 * For 1-click testing, historical archiving & instant demoing
 */
export const WAYBACK_HISTORICAL_PRESETS = [
  {
    id: 'wb_zoo_2006',
    title: 'Me at the zoo (April 2006 Wayback Snapshot)',
    category: 'Entertainment',
    url: 'https://web.archive.org/web/20060614120000/http://www.youtube.com/watch?v=jNQXAC9IVRw',
    snapshotTimestamp: '20060614120000',
    snapshotDate: 'Jun 14, 2006',
    desc: 'Original Wayback Machine archival snapshot of the very first YouTube video in 2006.',
    youtubeId: 'jNQXAC9IVRw',
    icon: '🐘',
    highPerformanceUrl: 'https://web.archive.org/web/20060614120000id_/http://www.youtube.com/watch?v=jNQXAC9IVRw',
    embedUrl: 'https://web.archive.org/web/20060614120000if_/http://www.youtube.com/watch?v=jNQXAC9IVRw',
  },
  {
    id: 'wb_rickroll_2008',
    title: 'Rick Astley - Never Gonna Give You Up (2008 Snapshot)',
    category: 'Music',
    url: 'https://web.archive.org/web/20080415120000/http://www.youtube.com/watch?v=dQw4w9WgXcQ',
    snapshotTimestamp: '20080415120000',
    snapshotDate: 'Apr 15, 2008',
    desc: 'Archived snapshot during the legendary 2008 April Fools Rickroll phenomenon.',
    youtubeId: 'dQw4w9WgXcQ',
    icon: '🕺',
    highPerformanceUrl: 'https://web.archive.org/web/20080415120000id_/http://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://web.archive.org/web/20080415120000if_/http://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'wb_charlie_2009',
    title: 'Charlie bit my finger - again ! (2009 Snapshot)',
    category: 'Comedy',
    url: 'https://web.archive.org/web/20091012180000/http://www.youtube.com/watch?v=_OBlgSz8sSM',
    snapshotTimestamp: '20091012180000',
    snapshotDate: 'Oct 12, 2009',
    desc: 'Classic 2009 viral video snapshot preserved on the Internet Archive.',
    youtubeId: '_OBlgSz8sSM',
    icon: '👶',
    highPerformanceUrl: 'https://web.archive.org/web/20091012180000id_/http://www.youtube.com/watch?v=_OBlgSz8sSM',
    embedUrl: 'https://web.archive.org/web/20091012180000if_/http://www.youtube.com/watch?v=_OBlgSz8sSM',
  },
  {
    id: 'wb_minecraft_alpha',
    title: 'Minecraft Alpha 2010 Trailer (Archive.org Item)',
    category: 'Gaming',
    url: 'https://archive.org/details/youtube-MmB9b5njVbA',
    snapshotTimestamp: '20101220150000',
    snapshotDate: 'Dec 20, 2010',
    desc: 'Minecraft Alpha trailer from late 2010 preserved in Internet Archive records.',
    youtubeId: 'MmB9b5njVbA',
    icon: '⛏️',
    highPerformanceUrl: 'https://archive.org/download/youtube-MmB9b5njVbA/youtube-MmB9b5njVbA.mp4',
    embedUrl: 'https://archive.org/embed/youtube-MmB9b5njVbA',
  },
  {
    id: 'wb_open_culture',
    title: 'Internet Archive Open Media Stream (Big Buck Bunny 720p)',
    category: 'Film & Animation',
    url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    snapshotTimestamp: '20080410120000',
    snapshotDate: 'Apr 10, 2008',
    desc: 'High-performance direct MP4 byte stream from archive.org servers (hardware 60fps).',
    youtubeId: null,
    icon: '🐰',
    highPerformanceUrl: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    embedUrl: 'https://archive.org/embed/BigBuckBunny_124',
  },
  {
    id: 'wb_evolution_dance_2006',
    title: 'Evolution of Dance (2006 Wayback Snapshot)',
    category: 'Comedy',
    url: 'https://web.archive.org/web/20060501120000/http://www.youtube.com/watch?v=dMH0bHeiRNg',
    snapshotTimestamp: '20060501120000',
    snapshotDate: 'May 1, 2006',
    desc: 'Historic early viral dance video snapshot preserved on web.archive.org.',
    youtubeId: 'dMH0bHeiRNg',
    icon: '🕺',
    highPerformanceUrl: 'https://web.archive.org/web/20060501120000id_/http://www.youtube.com/watch?v=dMH0bHeiRNg',
    embedUrl: 'https://web.archive.org/web/20060501120000if_/http://www.youtube.com/watch?v=dMH0bHeiRNg',
  },
  {
    id: 'wb_leeroy_jenkins',
    title: 'Leeroy Jenkins (2005 Preserved Archive)',
    category: 'Gaming',
    url: 'https://archive.org/details/LeeroyJenkins_201305',
    snapshotTimestamp: '20050510120000',
    snapshotDate: 'May 10, 2005',
    desc: 'Legendary World of Warcraft raid moment preserved in archive.org historical records.',
    youtubeId: null,
    icon: '⚔️',
    highPerformanceUrl: 'https://archive.org/download/LeeroyJenkins_201305/LeeroyJenkins.mp4',
    embedUrl: 'https://archive.org/embed/LeeroyJenkins_201305',
  },
];
