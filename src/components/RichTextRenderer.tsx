import React from 'react';
import { User } from '../types';
import { customEmojiRegex, memberEmojiRegex, gifRegex, timestampRegex, parseTimestampToSeconds } from '../utils/text';

interface Props {
  text: string;
  users: User[];
  onSeek?: (seconds: number) => void;
  onEmojiClick?: (src: string) => void;
  className?: string;
}

export const RichTextRenderer: React.FC<Props> = ({
  text,
  users,
  onSeek,
  onEmojiClick,
  className = '',
}) => {
  if (!text) return null;

  // Split text by lines and parse tokens
  const lines = text.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        // Tokenize line
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyCounter = 0;

        while (remaining.length > 0) {
          // Check custom emoji: [emoji:src:size]
          const emojiMatch = remaining.match(/^\[emoji:([^\]]+?):([0-9]+)\]/);
          if (emojiMatch) {
            const src = emojiMatch[1];
            const size = parseInt(emojiMatch[2], 10) || 24;
            parts.push(
              <img
                key={`emoji-${lineIdx}-${keyCounter++}`}
                src={src}
                alt="emoji"
                style={{ height: `${size}px`, maxHeight: '64px' }}
                className="inline-block align-middle cursor-pointer hover:scale-125 transition-transform mx-1 rounded"
                onClick={() => onEmojiClick && onEmojiClick(src)}
              />
            );
            remaining = remaining.substring(emojiMatch[0].length);
            continue;
          }

          // Check member emoji: [member_emoji:channelId:idx:size]
          const memberEmojiMatch = remaining.match(/^\[member_emoji:([^\]]+?):([0-9]+?):([0-9]+)\]/);
          if (memberEmojiMatch) {
            const chId = memberEmojiMatch[1];
            const emIdx = parseInt(memberEmojiMatch[2], 10);
            const size = parseInt(memberEmojiMatch[3], 10) || 24;
            const targetUser = users.find((u) => u.id === chId);
            const emojiObj = targetUser?.membershipSettings?.emojis?.[emIdx];

            if (emojiObj) {
              parts.push(
                <img
                  key={`memoji-${lineIdx}-${keyCounter++}`}
                  src={emojiObj.base64}
                  title={`:${emojiObj.name}:`}
                  alt={emojiObj.name}
                  style={{ height: `${size}px`, maxHeight: '64px' }}
                  className="inline-block align-middle cursor-pointer hover:scale-125 transition-transform mx-1 rounded"
                  onClick={() => onEmojiClick && onEmojiClick(emojiObj.base64)}
                />
              );
            } else {
              parts.push(<span key={`memoji-del-${lineIdx}-${keyCounter++}`} className="text-gray-400 text-xs">[Emoji]</span>);
            }
            remaining = remaining.substring(memberEmojiMatch[0].length);
            continue;
          }

          // Check gif: [gif:url]
          const gifMatch = remaining.match(/^\[gif:([^\]]+)\]/);
          if (gifMatch) {
            const gifUrl = gifMatch[1];
            parts.push(
              <div key={`gif-${lineIdx}-${keyCounter++}`} className="my-2">
                <img
                  src={gifUrl}
                  alt="GIF"
                  className="max-h-36 max-w-full rounded border border-gray-300 shadow-sm cursor-pointer hover:border-red-600 transition-colors"
                  onClick={() => onEmojiClick && onEmojiClick(gifUrl)}
                />
              </div>
            );
            remaining = remaining.substring(gifMatch[0].length);
            continue;
          }

          // Check timestamp: e.g. 0:05, 1:42, 01:23:45
          const timeMatch = remaining.match(/^(?:(\d+):)?(\d+):(\d+)/);
          if (timeMatch) {
            const timeStr = timeMatch[0];
            const totalSecs = parseTimestampToSeconds(timeStr);
            parts.push(
              <button
                key={`time-${lineIdx}-${keyCounter++}`}
                type="button"
                onClick={() => totalSecs !== null && onSeek && onSeek(totalSecs)}
                className="font-bold text-blue-600 hover:text-blue-800 underline bg-blue-50 px-1 py-0.5 rounded text-xs cursor-pointer inline-flex items-center gap-0.5"
                title={`Jump to ${timeStr}`}
              >
                <span>⏱️</span>
                <span>{timeStr}</span>
              </button>
            );
            remaining = remaining.substring(timeStr.length);
            continue;
          }

          // Otherwise grab plain text until next token
          const nextSpecialIdx = remaining.search(/\[(emoji|member_emoji|gif):|(?:(?:\d+:)?\d+:\d+)/);
          if (nextSpecialIdx === -1) {
            parts.push(remaining);
            remaining = '';
          } else if (nextSpecialIdx === 0) {
            // Safety against infinite loops
            parts.push(remaining[0]);
            remaining = remaining.substring(1);
          } else {
            parts.push(remaining.substring(0, nextSpecialIdx));
            remaining = remaining.substring(nextSpecialIdx);
          }
        }

        return (
          <div key={`line-${lineIdx}`} className="leading-relaxed">
            {parts}
          </div>
        );
      })}
    </div>
  );
};
