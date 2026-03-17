// User Types
export type UserRole = 'buyer' | 'creator' | 'moderator' | 'admin';
export type MembershipTier = 'free' | 'creator' | 'studio' | 'catalyst';

export interface UserPreferences {
  showNsfw: boolean;
  ageVerified: boolean;
  ageVerifiedAt?: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  publicProfile: boolean;
  showActivity: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  stripeConnectId?: string;
  isOnline?: boolean;
  lastSeen?: string;
  purchasedAssetIds?: string[];
  // Phase 2: Enhanced Profile
  hardwareSpecs?: HardwareSpecs;
  portfolio?: PortfolioItem[];
  favoriteEngines?: EngineType[];
  skills?: string[];
  followerCount?: number;
  followingCount?: number;
  // Phase 5: Aura Consciousness & Economy
  consciousnessCoins?: number;
  isSubscriber?: boolean;
  lastDailyClaim?: string;
  rank?: string; // e.g., 'Legend', 'Contributor', 'Elder'
  badges?: string[]; // e.g., ['crown', 'green_phat', 'creator_pro', 'dev_core']
  membershipTier?: MembershipTier;
  // Training data consent
  trainingConsentGiven?: boolean;
  trainingConsentAt?: string;
  trainingConsentVersion?: string;
}

// Asset Types
export type AssetStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type LicenseTier = 
  | 'art_3pct'          // Individual art assets (sprites, textures) - 3%
  | 'music_1pct'        // Music & audio when used as primary soundtrack - 1%
  | 'integration_10pct' // Asset heavily drives identity (e.g. 50%+ of scenes, core chars, framework logic) - 10%
  | 'functional_15pct'  // A functional sub-game or massive template with assets & mechanics - 15%
  | 'source_20pct'      // Full source code, documentation, rebranding, heavy backend dev expected - 20%
  | 'opensource';       // Free/CC-BY, citation only - 0%
export type ContentRating = 'sfw' | 'nsfw';
export type GalleryContentRating = 'safe' | 'suggestive' | 'mature' | 'explicit';
export type Complexity = 'beginner' | 'intermediate' | 'advanced';
export type EngineType = 'unity' | 'unreal' | 'godot' | 'web' | 'other';
export type PricingType = 'fixed' | 'donation' | 'free';

export type AssetType = 'dev_asset' | 'game' | 'software';

export type GameCategory = 
  | 'rpg' | 'action' | 'puzzle' | 'strategy' | 'simulation'
  | 'adventure' | 'platformer' | 'shooter' | 'racing' | 'horror'
  | 'sandbox' | 'vr' | 'card_game' | 'visual_novel' | 'other_game';

export type SoftwareCategory =
  | 'tools' | 'plugins' | 'utilities' | 'templates' | 'dev_aids'
  | 'editors' | 'automation' | 'analytics' | 'deployment' | 'other_software';

export interface AssetFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  fileType: string;
}

export interface Asset {
  id: string;
  creatorId: string;
  creator?: User;
  title: string;
  slug: string;
  assetType?: AssetType;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  tags: string[];
  engineType: EngineType;
  complexity: Complexity;
  contentRating: ContentRating;
  licenseTier: LicenseTier;
  pricingType: PricingType;
  price: number;
  suggestedDonation?: number;
  salePrice?: number;
  files: AssetFile[];
  thumbnailUrl: string;
  screenshotUrls: string[];
  videoUrl?: string;
  documentationUrl?: string;
  version: string;
  changelog?: string;
  status: AssetStatus;
  rejectionReason?: string;
  downloadCount: number;
  viewCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  // Phase 2.5: Royalty & Revenue Share
  foundationAssets?: string[]; // IDs of assets this is built upon
  revenueSplits?: RoyaltyStake[];
}

export interface RoyaltyStake {
  id: string;
  userId: string;
  username: string;
  percentage: number; // e.g., 3.0 for 3%
  role: 'original_creator' | 'foundation_builder' | 'collaborator' | 'curator';
  assetId?: string; // Optional: reference to the foundation asset
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  parentId?: string;
  sortOrder: number;
  assetCount?: number;
}

// Order Types
export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'cancelled';

export interface OrderItem {
  id: string;
  assetId: string;
  asset?: Asset;
  pricePaid: number;
  royaltyAmount: number;
  licenseType: LicenseTier;
  downloadUrl?: string;
  downloadExpiresAt?: string;
  // Phase 2.5: Detailed splits
  revenueBreakdown?: RoyaltyLedger[];
  createdAt: string;
}

export interface RoyaltyLedger {
  id: string;
  orderId: string;
  recipientId: string;
  amount: number;
  percentageUsed: number;
  reason: string; // e.g., "Foundation Royalty (3%)"
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyer?: User;
  items: OrderItem[];
  totalAmount: number;
  platformFee: number;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
}

// Review Types
export interface Review {
  id: string;
  assetId: string;
  reviewerId: string;
  reviewer?: User;
  rating: number;
  title: string;
  content: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  assetId: string;
  asset: Asset;
  addedAt: string;
  customPrice?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Royalty Types
export type RoyaltyStatus = 'pending' | 'available' | 'paid' | 'held';

export interface Royalty {
  id: string;
  creatorId: string;
  assetId: string;
  asset?: Asset;
  orderId: string;
  amount: number;
  status: RoyaltyStatus;
  paidAt?: string;
  stripeTransferId?: string;
  createdAt: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  assetId: string;
  asset: Asset;
  createdAt: string;
}

// Filter Types
export interface AssetFilters {
  category?: string;
  assetType?: AssetType;
  engineType?: EngineType;
  complexity?: Complexity;
  contentRating?: ContentRating;
  licenseTier?: LicenseTier;
  pricingType?: PricingType;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  search?: string;
  sortBy?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

// Stats Types
export interface CreatorStats {
  totalAssets: number;
  totalSales: number;
  totalDownloads: number;
  totalEarnings: number;
  pendingRoyalties: number;
  availableRoyalties: number;
  lifetimeRoyalties: number;
}

export interface AssetStats {
  views: number;
  downloads: number;
  sales: number;
  revenue: number;
  royalties: number;
}

// Message Types
export type MessageType = 'text' | 'contract' | 'system' | 'image';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  recipientId: string;
  recipient?: User;
  type: MessageType;
  content: string;
  contractData?: {
    assetId: string;
    assetTitle: string;
    royaltyRate: number;
    status: 'pending' | 'accepted' | 'declined';
  };
  attachments?: string[];
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// Community Gallery Types
export type GallerySubmissionType = 'artwork' | 'video' | 'screenshot' | 'photography' | 'wip' | 'other';
export type GallerySubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface GallerySubmission {
  id: string;
  creatorId: string;
  creator?: User;
  title: string;
  description: string;
  type: GallerySubmissionType;
  contentRating: GalleryContentRating;
  mediaUrls: string[];
  thumbnailUrl: string;
  tags: string[];
  status: GallerySubmissionStatus;
  rejectionReason?: string;
  likes: number;
  views: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface GalleryComment {
  id: string;
  submissionId: string;
  authorId: string;
  author?: User;
  content: string;
  likes: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Hardware Specs Types
export interface HardwareSpecs {
  gpu?: string;
  cpu?: string;
  ram?: string;
  os?: string;
  monitor?: string;
  peripherals?: string[];
  notes?: string;
}

// Portfolio Types
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  screenshotUrls: string[];
  projectUrl?: string;
  websiteUrl?: string;
  liveDemoUrl?: string;
  createdAt: string;
}

// Notification Types
export type NotificationType =
  | 'sale'
  | 'message'
  | 'review'
  | 'system'
  | 'mention'
  | 'follower'
  | 'new_asset'
  | 'price_drop'
  | 'creator_update'
  | 'follow'
  | 'pioneer_badge';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  description?: string;
  creatorId?: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  assetId?: string;
  assetTitle?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationFilterType = 'all' | 'unread' | 'mentions' | 'sales' | 'messages' | 'system';

// Follow Types
export interface FollowedCreator {
  userId: string;
  username: string;
  avatar?: string;
  followedAt: string;
}
// Social Types
export interface SocialPost {
  id: string;
  creatorId: string;
  creator?: User;
  content: string;
  mediaUrls?: string[]; // Photos, videos, showreels
  likes: number;
  comments: number;
  likedBy?: string[]; // Array of User IDs
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  likes: number;
  createdAt: string;
}

// Community & Forum Types
export interface ForumThread {
  id: string;
  authorId: string;
  author?: User;
  title: string;
  content: string;
  category: 'general' | 'showcase' | 'help' | 'discussion' | 'announcement';
  tags: string[];
  views: number;
  replyCount: number;
  lastReplyAt: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  author?: User;
  content: string;
  likes: number;
  isSolution?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Job & Recruitment Types
export type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance' | 'commission';
export type JobStatus = 'open' | 'closed' | 'filled';

export interface JobPost {
  id: string;
  recruiterId: string;
  recruiter?: User;
  title: string;
  description: string;
  requirements: string[];
  budget?: {
    min: number;
    max: number;
    currency: string;
    type: 'hourly' | 'fixed' | 'milestone';
  };
  jobType: JobType;
  category: 'developer' | 'artist' | 'designer' | 'musician' | 'other';
  status: JobStatus;
  applications: number;
  createdAt: string;
  expiresAt?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicant?: User;
  coverLetter: string;
  portfolioUrl?: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  createdAt: string;
}

// Group Chat Types
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  participants: string[]; // User IDs
  admins: string[]; // User IDs
  type: 'public' | 'private' | 'restricted';
  allowedRoles?: UserRole[]; // e.g., ['creator'] for Creators Chat
  lastMessage?: Message;
  updatedAt: string;
}

// ─── Gallery Pioneer Badge System ────────────────────────────────────────────

/** The six badge tiers that can ever be issued per search term. */
export type PioneerBadgeTier =
  | 'pioneer_1'     // First ever searcher
  | 'pioneer_2'     // Second ever searcher
  | 'pioneer_3'     // Third ever searcher
  | 'milestone_100' // 100th total search
  | 'milestone_500' // 500th total search
  | 'milestone_1000'; // 1000th total search — last badge ever issued for this term

export interface BadgeTransfer {
  fromUserId: string;
  toUserId: string;
  price?: number; // Aura Coins paid, undefined = gifted
  transferredAt: string;
}

export interface PioneerBadge {
  id: string;
  tier: PioneerBadgeTier;
  searchTerm: string;         // normalized (lowercase, trimmed)
  searchTermDisplay: string;  // original casing at time of first search
  ownerId: string;            // current holder (changes on trade)
  originalEarnerId: string;   // immutable — who first earned it
  earnedAt: string;
  transferHistory: BadgeTransfer[];
  isListed: boolean;          // listed on badge marketplace
  listPrice?: number;         // Aura Coins asking price
}

export interface SearchTermRecord {
  term: string;           // normalized key
  displayTerm: string;    // display label
  searchCount: number;
  firstSearchedAt: string;
  pioneers: {
    userId: string;
    position: 1 | 2 | 3;
    searchedAt: string;
  }[];
  milestonesAwarded: (100 | 500 | 1000)[]; // milestones already issued
}

export interface BadgeSearchResult {
  newBadges: PioneerBadge[];     // badges awarded this search
  isNewTerm: boolean;            // this term had zero prior searches
  termRecord: SearchTermRecord;  // updated record
  auraMessage?: string;          // Aura congratulations message, if applicable
}
