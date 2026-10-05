import { User } from '../types';

export const customEmojiRegex = /\[emoji:([^\]]+?):([0-9]+)\]/g;
export const memberEmojiRegex = /\[member_emoji:([^\]]+?):([0-9]+?):([0-9]+)\]/g;
export const gifRegex = /\[gif:([^\]]+)\]/g;
export const timestampRegex = /(?:(\d+):)?(\d+):(\d+)/g;

export function parseTimestampToSeconds(text: string): number | null {
  const match = text.match(/(?:(\d+):)?(\d+):(\d+)/);
  if (!match) return null;
  const hrs = match[1] ? parseInt(match[1], 10) : 0;
  const mins = parseInt(match[2], 10);
  const secs = parseInt(match[3], 10);
  return hrs * 3600 + mins * 60 + secs;
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, (t) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return map[t] || t;
  });
}

export interface ImageFileInfo {
  dataUrl: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  width: number;
  height: number;
  isAnimatedGif: boolean;
}

export function readImageFileAsDataUrl(file: File | undefined | null): Promise<ImageFileInfo | null> {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '';
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const sizeKb = file.size / 1024;
      const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${sizeKb.toFixed(1)} KB`;

      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          name: file.name,
          type: file.type || 'image/png',
          size: sizeFormatted,
          sizeBytes: file.size,
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
          isAnimatedGif: isGif,
        });
      };
      img.onerror = () => {
        resolve({
          dataUrl,
          name: file.name,
          type: file.type || 'image/png',
          size: sizeFormatted,
          sizeBytes: file.size,
          width: 0,
          height: 0,
          isAnimatedGif: isGif,
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function processAndResizeImage(
  file: File | undefined | null,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    // Always preserve GIFs (animations) and SVGs (vector fidelity) directly without rasterizing
    if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // If image is already smaller than max dimensions, preserve original data URL directly
        if (img.width <= maxWidth && img.height <= maxHeight) {
          return resolve((e.target?.result as string) || '');
        }
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(outType, 0.9));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function readAsBase64(file: File | undefined | null): Promise<string> {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.readAsDataURL(file);
  });
}

export interface RenderRichTextProps {
  text: string;
  users: User[];
  onSeek?: (seconds: number) => void;
  onEmojiClick?: (src: string) => void;
}

export function parseCssStringToReact(styleStr?: string | null): React.CSSProperties {
  if (!styleStr) return {};
  const styleObj: Record<string, string> = {};
  styleStr.split(';').forEach((rule) => {
    const [prop, val] = rule.split(':');
    if (prop && val) {
      const camelProp = prop.trim().replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      styleObj[camelProp] = val.trim();
    }
  });
  return styleObj as React.CSSProperties;
}
