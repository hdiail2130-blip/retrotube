import React, { useState } from 'react';
import { User, Video } from '../types';

interface SuperChatModalProps {
  video: Video | null;
  currentUser: User;
  onClose: () => void;
  onSubmit: (videoId: string, amount: number, text: string) => void;
}

export const SuperChatModal: React.FC<SuperChatModalProps> = ({
  video,
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<number>(5.0);
  const [message, setMessage] = useState('');

  if (!video) return null;

  const getPreviewTheme = (val: number) => {
    if (val >= 50) return { bg: '#E91E63', text: '#FFF', label: 'Legendary Pink Crown' };
    if (val >= 20) return { bg: '#FF5722', text: '#FFF', label: 'Royal Orange' };
    if (val >= 10) return { bg: '#FFEB3B', text: '#000', label: 'Golden Star' };
    if (val >= 5) return { bg: '#00E676', text: '#000', label: 'Lime Supporter' };
    return { bg: '#00E5FF', text: '#000', label: 'Standard Cyan' };
  };

  const currentTheme = getPreviewTheme(amount);
  const canAfford = currentUser.balance >= amount;

  const handleSend = () => {
    if (!canAfford) return;
    onSubmit(video.id, amount, message.trim() || 'Keep up the amazing videos!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-[#fcfcfc] border-2 border-[#555] rounded-md shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="bg-gradient-to-b from-[#777] to-[#333] text-white font-bold p-2.5 flex justify-between items-center text-xs">
          <span>💸 Send Super Chat Tip to Creator</span>
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold leading-none cursor-pointer hover:text-red-400"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-gray-600 leading-relaxed">
            Highlight your message in the live discussions stream and directly support the creator with simulated tipping!
          </p>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Tip Amount Tier:</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 5, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-1.5 rounded font-black border text-center cursor-pointer transition-all ${
                    amount === val
                      ? 'border-black ring-2 ring-blue-500 scale-105'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                  style={{ backgroundColor: getPreviewTheme(val).bg, color: getPreviewTheme(val).text }}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Your Tip Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded bg-white text-xs"
            />
          </div>

          {/* Live Preview Card */}
          <div>
            <label className="font-bold text-gray-500 text-[10px] uppercase block mb-1">Live Banner Preview:</label>
            <div
              className="rounded border p-2.5 shadow-xs"
              style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
            >
              <div className="flex justify-between font-bold text-xs mb-1">
                <span>{currentUser.username}</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="text-xs font-semibold">
                {message.trim() || 'Your message will appear highlighted here!'}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="text-gray-600">
              Your Balance:{' '}
              <strong className={canAfford ? 'text-green-700' : 'text-red-600'}>
                ${(currentUser.balance || 0).toFixed(2)}
              </strong>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={!canAfford}
                className={`btn btn-primary font-bold ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {canAfford ? 'Send Tip' : 'Insufficient Funds'}
              </button>
              <button type="button" onClick={onClose} className="btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EmojiSizerModalProps {
  src: string | null;
  onClose: () => void;
}

export const EmojiSizerModal: React.FC<EmojiSizerModalProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(64);

  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-[#fcfcfc] border-2 border-red-700 rounded-md shadow-2xl max-w-sm w-full overflow-hidden text-xs">
        <div className="bg-gradient-to-b from-red-600 to-red-800 text-white font-bold p-2.5 flex justify-between items-center text-xs">
          <span>✨ Interactive Emoji Inspector & Resizer</span>
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold leading-none cursor-pointer hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div
            className="bg-white border border-gray-300 rounded p-4 flex items-center justify-center min-h-[160px] shadow-inner"
            style={{
              backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)',
              backgroundSize: '8px 8px',
            }}
          >
            <img
              src={src}
              alt="Inspected asset"
              style={{ height: `${scale}px`, maxHeight: '180px' }}
              className="w-auto object-contain transition-all duration-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1">
              <span>Display Scale:</span>
              <span className="text-red-700 font-extrabold">{scale}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={180}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value, 10))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          <div className="text-right border-t pt-3">
            <button type="button" onClick={onClose} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MembershipJoinModalProps {
  channel: User | null;
  currentUser: User;
  onClose: () => void;
  onPurchase: (channelId: string, tierIndex: number) => void;
}

export const MembershipJoinModal: React.FC<MembershipJoinModalProps> = ({
  channel,
  currentUser,
  onClose,
  onPurchase,
}) => {
  if (!channel || !channel.membershipSettings?.enabled) return null;

  const tiers = channel.membershipSettings.tiers || [];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-[#fcfcfc] border-2 border-green-700 rounded-md shadow-2xl max-w-md w-full overflow-hidden text-xs">
        <div className="bg-gradient-to-b from-green-700 to-green-900 text-white font-bold p-2.5 flex justify-between items-center text-xs">
          <span>⭐ Join {channel.username}&apos;s Channel Membership</span>
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold leading-none cursor-pointer hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-gray-600">
            Join this creator&apos;s membership club to unlock an exclusive name badge next to your comments and exclusive animated emojis!
          </p>

          <div className="space-y-2">
            {tiers.map((t, idx) => {
              const isCurrentTier =
                currentUser.memberships && currentUser.memberships[channel.id] === idx;
              const canAfford = currentUser.balance >= t.price;

              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-300 rounded p-3 flex justify-between items-center shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-xs"
                        style={{ backgroundColor: t.badgeColor || '#444' }}
                      >
                        {t.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Exclusive badge & perks in this channel&apos;s comments.
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-green-700 mb-1">
                      ${t.price.toFixed(2)}/mo
                    </div>
                    {isCurrentTier ? (
                      <span className="text-green-700 font-bold text-xs">Active Tier ✓</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPurchase(channel.id, idx)}
                        disabled={!canAfford}
                        className={`btn btn-join-member text-xs py-1 px-3 ${
                          !canAfford ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {canAfford ? 'Join' : 'Need Funds'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-gray-600">
              Wallet Balance: <strong className="text-green-700">${currentUser.balance.toFixed(2)}</strong>
            </span>
            <button type="button" onClick={onClose} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
