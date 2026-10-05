export type ThemePreset = 'default' | 'dark-red' | 'winxp' | 'winvista' | 'win7';
export type MediaSkin =
  | 'wmp11'
  | 'classic_flash'
  | 'quicktime'
  | 'youtube_2008'
  | 'winamp_classic'
  | 'vlc_classic'
  | 'realplayer_g2'
  | 'crt_tv_retro';

export type VideoQuality = 'auto' | 'hd1080' | 'hd720' | 'large' | 'medium' | 'small' | 'highres';

export interface MembershipTier {
  name: string;
  price: number;
  badgeColor: string;
}

export interface MemberEmoji {
  name: string;
  base64: string;
}

export interface MembershipSettings {
  enabled: boolean;
  tiers: MembershipTier[];
  emojis: MemberEmoji[];
}

export interface ChannelSocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface User {
  id: string;
  username: string;
  bio: string;
  subscribers: number;
  bgColor: string;
  bgImageBase64?: string;
  bgPattern?: 'none' | 'stars' | 'clouds' | 'grid' | 'bliss' | 'matrix' | 'dots' | 'wood' | 'c4d_metal' | 'graffiti' | 'homebrew' | 'custom';
  bgRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  bgFixed?: boolean;
  channelOpacity?: number; // 30 to 100
  fontFamily?: 'sans' | 'serif' | 'mono' | 'impact' | 'comic' | 'homebrew' | 'c4d_clan';
  headerColor?: string;
  accentColor?: string;
  boxFillColor?: string; // Hex code for wrapper box fill (e.g. #ffffff, #000000)
  borderColor?: string; // Hex code for border stroke
  borderStyle?: 'solid' | 'double' | 'dashed' | 'groove' | 'ridge';
  textColor?: string; // Hex code for body text
  highlightColor?: string; // Hex code for text highlights & links
  bgWallpaperScope?: 'channel_only' | 'channel_and_videos'; // Apply wallpaper to channel only or also video player page
  borderGutterStyle?: 'none' | 'c4d_metallic' | 'graffiti_fx' | 'cod_camo' | 'homebrew_matrix' | 'frutiger_gloss'; // 3D side gutter graphics framing the channel
  leftGutterText?: string; // Social handles / sponsor logos mapped along left border
  rightGutterText?: string; // Handles mapped along right border
  bannerTagline?: string; // Custom header slogan or clan subtext
  partnerBadgeType?: 'none' | 'machinima' | 'maker' | 'fullscreen' | 'director' | 'musician' | 'guru' | 'homebrew'; // Verified branding header badges
  customCssText?: string; // Custom CSS rules for custom headers
  bannerHeight?: 'compact' | 'normal' | 'extended' | 'panoramic';
  bannerBase64?: string;
  avatarBase64?: string;
  customLogoBase64?: string; // Custom logo graphic for Homebrew / clan emblem
  customLogoType?: 'none' | 'homebrew' | 'machinima' | 'clan_snipe' | 'retro_tube' | 'custom_upload';
  featuredVideoId?: string;
  channelBulletin?: string;
  featuredChannelIds?: string[];
  socialLinks?: ChannelSocialLink[];
  subscriptions: string[];
  balance: number;
  memberships: Record<string, number>; // channelId -> tierIndex
  notificationPreferences?: Record<string, 'all' | 'personalized' | 'none'>;
  userRatings?: Record<string, number>; // videoId -> star rating (1-5)
  activeBorder?: string | null;
  activeTheme?: string | null;
  activeContract?: string | null;
  customBannerExtended?: boolean;
  purchasedThemes?: string[];
  purchasedBorders?: string[];
  earningsHistory?: Array<{
    date: string;
    source: string;
    amount: number;
  }>;
  membershipSettings?: MembershipSettings;
  // Channel creation, topic categorization, and YouTube channel embed
  topic?: string;
  customTopic?: string;
  isYoutubeImported?: boolean;
  youtubeChannelUrl?: string;
  youtubeChannelHandle?: string;
  youtubeChannelId?: string;
  joinedDate?: string;
  channelType?: 'personal' | 'brand' | 'embedded_youtube';
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  date: string;
  likes: number;
  isSuperChat?: boolean;
  scAmount?: number;
  replies?: Comment[];
}

export interface CustomAdSettings {
  enabled: boolean;
  title: string;
  sponsorName: string;
  sponsorUrl?: string;
  adVideoBase64?: string; // imported mp4 file data URL or blob URL
  fileName?: string;
  fileSize?: string;
  skipCountdownSeconds: number; // e.g. 5
  canSkip?: boolean;
  timestamps: number[]; // timestamps in seconds for every video
  applyToAllVideos: boolean;
  onlySelectedVideos?: boolean; // When true, ads ONLY run on videos explicitly selected by user
  selectedVideoIds?: string[]; // IDs of videos selected for ads
  activePreset?: 'custom_file' | 'cybersoda' | 'retro_console' | 'megahits' | 'vintage_cereal';
}

export type AnnotationType = 'speech_bubble' | 'note' | 'spotlight' | 'title' | 'label';

export interface Annotation {
  id: string;
  type: AnnotationType;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  x: number; // 0 to 100 percentage from left
  y: number; // 0 to 100 percentage from top
  width: number; // percentage width e.g. 25
  height?: number; // percentage height
  bgColor?: string; // e.g. '#ffffcc', '#cc181e', 'rgba(0,0,0,0.7)', etc.
  textColor?: string; // e.g. '#000000', '#ffffff'
  fontSize?: number; // font size px e.g. 11, 13, 16
  linkType?: 'none' | 'timestamp' | 'video' | 'channel' | 'external';
  linkTarget?: string; // timestamp seconds e.g. "52", videoId e.g. "v3", channelId e.g. "u2", or URL
}

export interface VideoAdConfig {
  enabled: boolean; // whether ad is selected/active for this video
  mode: 'global' | 'custom' | 'none'; // 'global' uses global ad; 'custom' uses this video's specific ad; 'none' is unselected/off
  title?: string;
  sponsorName?: string;
  sponsorUrl?: string;
  adVideoBase64?: string; // specific imported MP4 for this video
  fileName?: string;
  fileSize?: string;
  skipCountdownSeconds?: number;
  timestamps?: number[]; // specific ad timestamps for this video
  activePreset?: 'custom_file' | 'cybersoda' | 'retro_console' | 'megahits' | 'vintage_cereal';
}

export interface VideoCollaboration {
  channelId: string; // The collaborated channel ID
  role?: string; // e.g. 'Co-Creator / Co-Star', 'Featured Collaborator', 'Guest Appearance', 'Co-Director / Produced with', 'Soundtrack / Music Feature'
  splitPercentage?: number; // e.g. 50 (50% share of ad/superchat revenue)
  status?: 'accepted' | 'pending';
  notes?: string; // custom collab note or shoutout
  customChannelName?: string;
}

export interface Video {
  id: string;
  authorId: string;
  title: string;
  category: string;
  views: number;
  ratingSum: number;
  ratingCount: number;
  time: string;
  date: string;
  desc: string;
  description?: string;
  thumb: string;
  videoBase64?: string;
  youtubeId?: string | null;
  comments: Comment[];
  isMonetized?: boolean;
  contentIdStatus?: 'clean' | 'claimed' | 'strike';
  claimedByMcnId?: string | null;
  activeSponsorshipId?: string | null;
  backgroundMusicTrack?: string | null;
  customAdTimestamps?: number[];
  customAdDisabled?: boolean;
  customAdConfig?: VideoAdConfig;
  annotations?: Annotation[];
  collabChannelId?: string; // Direct reference to primary collaborator channel ID
  collabRole?: string; // e.g. 'Co-Creator', 'Featured Collab'
  collaboration?: VideoCollaboration; // Detailed collaboration info
  collaborations?: VideoCollaboration[]; // Multiple collaborations support
  // Wayback & Streaming resolution fields
  streamUrl?: string;
  waybackUrl?: string;
  waybackEmbedUrl?: string;
  waybackHighPerformanceUrl?: string;
  waybackPlaybackEngine?: 'high_performance' | 'wayback_embed' | 'youtube';
  preferWaybackEmbed?: boolean;
  waybackSnapshotDate?: string;
  waybackTimestamp?: string;
}

export interface WaybackMachineConfig {
  currentTimestamp?: string;
  currentDateFormatted?: string;
  currentYear?: string;
  activeYear?: string;
  enabled?: boolean;
  isActive?: boolean;
  isCollapsed?: boolean;
  activeCaptureCount?: number;
  totalCaptures?: number;
  streamQuality?: string;
  playbackEnginePreference?: string;
  snapshots?: Array<{
    title: string;
    url: string;
    timestamp: string;
    date: string;
  }>;
}

export interface PollOption {
  text: string;
  image?: string;
  votes: number;
}

export interface Post {
  id: string;
  channelId: string;
  authorId: string;
  type: 'text' | 'poll';
  content: string;
  image?: string;
  images?: string[];
  date: string;
  options?: PollOption[];
  comments?: Comment[];
}

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  description?: string;
  authorId?: string;
  createdAt?: string;
  isPrivate?: boolean;
  customCover?: string;
}

export interface SubSpace {
  id: string;
  name: string;
  subChannelIds: string[];
}

export interface ShopTheme {
  id: string;
  name: string;
  price: number;
  bg: string;
  text: string;
}

export interface ShopBorder {
  id: string;
  name: string;
  price: number;
  style: string;
}

export interface CustomPartner {
  id: string;
  name: string;
  split: string;
  cpm: string;
  logo?: string;
}

// 🏢 Multi-Channel Network (MCN) Simulator Models
export interface McnNetwork {
  id: string;
  name: string;
  tag: string; // e.g. [MACH], [MAKER], [VOX], [RETRO]
  slogan: string;
  description: string;
  founderId: string;
  founderName?: string;
  splitPercentage: number; // Creator gets X%, Network takes (100 - X)%
  cpmMultiplier: number; // e.g. 1.5x
  minSubscribersRequired: number;
  logoBase64?: string; // Local image import for network logo
  bannerBase64?: string; // Local image import for network banner
  badgeBase64?: string; // Custom badge icon for videos & channel headers
  contractTermMonths: number; // Lock-in contract period e.g. 12 or 24 months
  signedChannelIds: string[];
  pendingInvites?: string[];
  vaultBalance: number; // Accumulated MCN Treasury balance in USD
  perks: string[];
  isOfficial?: boolean;
}

export interface McnSponsorshipDeal {
  id: string;
  brandName: string;
  brandCategory: 'Gaming & Tech' | 'Lifestyle & Audio' | 'Food & Fuel' | 'Hosting & Web';
  tagline: string;
  logo: string;
  budgetTotal: number;
  cpmBonus: number; // e.g. +$4.50 per 1k views
  payoutPerVideo: number; // flat fee bonus
  assignedNetworkId: string | null;
  assignedChannelIds: string[];
  active: boolean;
}

export interface ContentIdClaim {
  id: string;
  assetTitle: string;
  claimantMcnId: string;
  targetVideoId: string;
  claimType: 'monetize' | 'block' | 'strike';
  status: 'active' | 'disputed' | 'released';
  disputeReason?: string;
  matchTimestamp: string;
  adRevenueDiverted: number;
}

export interface McnRoyaltyInvoice {
  id: string;
  mcnId: string;
  channelId: string;
  period: string;
  totalViews: number;
  grossRevenue: number;
  creatorCut: number;
  networkCut: number;
  status: 'paid' | 'pending';
  date: string;
}

export type LogoEffect = 'none' | 'glow' | 'pulse' | 'scanline' | 'glitch' | 'pixelated';

export interface GlobalSettings {
  themeColor: string;
  logoBase64: string;
  themePreset: ThemePreset;
  logoHeight?: number;
  logoAnimationEffect?: LogoEffect;
  logoTagline?: string;
  showTagline?: boolean;
  customLogoName?: string;
  customLogoType?: string;
  customLogoSize?: string;
}

export interface WatchHistoryItem {
  id: string;
  videoId: string;
  watchedAt: number; // Unix timestamp in ms
  watchedDateFormatted: string;
  lastPositionSeconds?: number;
  durationSeconds?: number;
  completed?: boolean;
}

export interface RetroTubeState {
  currentUserId: string;
  globalSettings: GlobalSettings;
  categories: string[];
  queue: string[];
  playlists: Playlist[];
  subSpaces: SubSpace[];
  watchHistory?: WatchHistoryItem[];
  historyPaused?: boolean;
  offlineSavedVideoIds?: string[];
  settings: {
    navSounds: boolean;
    mediaSkin: MediaSkin;
    defaultPlaybackRate: number;
    preferredQuality: VideoQuality;
    autoplay?: boolean;
    annotationsEnabled?: boolean;
  };
  customAd?: CustomAdSettings;
  customPartners: CustomPartner[];
  mcns?: McnNetwork[];
  sponsorshipDeals?: McnSponsorshipDeal[];
  contentIdClaims?: ContentIdClaim[];
  royaltyInvoices?: McnRoyaltyInvoice[];
  shopInventory: {
    themes: ShopTheme[];
    borders: ShopBorder[];
    recommendedSlots: Array<{ id: string; name: string; price: number }>;
  };
  promotedVideos: string[];
  users: User[];
  videos: Video[];
  posts: Post[];
}
