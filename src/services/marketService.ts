import type { Asset, Category, Review, Order, Royalty, CreatorStats } from '@/types';

// Categories - defined but with 0 assets initially
export const platformCategories: Category[] = [
  {
    id: '1',
    name: 'Games & Demos',
    slug: 'games-demos',
    icon: 'Gamepad2',
    description: 'Full game projects and playable prototypes',
    sortOrder: 1,
    assetCount: 0,
  },
  {
    id: '2',
    name: 'Frameworks & Tools',
    slug: 'frameworks-tools',
    icon: 'Wrench',
    description: 'Development utilities and code frameworks',
    sortOrder: 2,
    assetCount: 0,
  },
  {
    id: '3',
    name: 'UI Kits & HUDs',
    slug: 'ui-kits-huds',
    icon: 'Layout',
    description: 'Interface components and heads-up displays',
    sortOrder: 3,
    assetCount: 0,
  },
  {
    id: '4',
    name: '2D Art & Sprites',
    slug: '2d-art-sprites',
    icon: 'Image',
    description: 'Graphics, illustrations, and sprite sheets',
    sortOrder: 4,
    assetCount: 0,
  },
  {
    id: '5',
    name: '3D Models & Avatars',
    slug: '3d-models-avatars',
    icon: 'Box',
    description: 'Characters, environments, and 3D assets',
    sortOrder: 5,
    assetCount: 0,
  },
  {
    id: '6',
    name: 'Audio & Music',
    slug: 'audio-music',
    icon: 'Music',
    description: 'Sound effects, music tracks, and audio kits',
    sortOrder: 6,
    assetCount: 0,
  },
];

// Data access - ensured real content from storage
export const getAssets = (): Asset[] => {
  const data = localStorage.getItem(STORAGE_KEYS.assets);
  return data ? JSON.parse(data) : [];
};

export const getFeaturedAssets = (): Asset[] => {
  const assets = getAssets().filter(asset => asset.status === 'approved');
  return assets.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0)).slice(0, 4);
};

export const platformReviews: Review[] = [];
export const platformOrders: Order[] = [];
export const platformRoyalties: Royalty[] = [];

// Default empty stats
export const platformCreatorStats: CreatorStats = {
  totalAssets: 0,
  totalSales: 0,
  totalDownloads: 0,
  totalEarnings: 0,
  pendingRoyalties: 0,
  availableRoyalties: 0,
  lifetimeRoyalties: 0,
};

// localStorage keys
const STORAGE_KEYS = {
  assets: 'novaura_assets',
  reviews: 'novaura_reviews',
  orders: 'novaura_orders',
  royalties: 'novaura_royalties',
  categories: 'novaura_categories',
};

// Initialize storage with empty data if not exists
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.assets)) {
    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.royalties)) {
    localStorage.setItem(STORAGE_KEYS.royalties, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.categories)) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(platformCategories));
  }
};

// Get data from localStorage
export const getStoredAssets = (): Asset[] => {
  const data = localStorage.getItem(STORAGE_KEYS.assets);
  return data ? JSON.parse(data) : [];
};

export const getStoredReviews = (): Review[] => {
  const data = localStorage.getItem(STORAGE_KEYS.reviews);
  return data ? JSON.parse(data) : [];
};

export const getStoredOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.orders);
  return data ? JSON.parse(data) : [];
};

export const getStoredRoyalties = (): Royalty[] => {
  const data = localStorage.getItem(STORAGE_KEYS.royalties);
  return data ? JSON.parse(data) : [];
};

export const getStoredCategories = (): Category[] => {
  const data = localStorage.getItem(STORAGE_KEYS.categories);
  return data ? JSON.parse(data) : platformCategories;
};

// Save data to localStorage
export const saveAsset = (asset: Asset) => {
  const assets = getStoredAssets();
  const existingIndex = assets.findIndex(a => a.id === asset.id);
  if (existingIndex >= 0) {
    assets[existingIndex] = asset;
  } else {
    assets.push(asset);
  }
  localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(assets));
  
  // Update category count
  updateCategoryCount(asset.category);
};

export const updateCategoryCount = (categorySlug: string) => {
  const categories = getStoredCategories();
  const category = categories.find(c => c.slug === categorySlug);
  if (category) {
    const assets = getStoredAssets();
    category.assetCount = assets.filter(a => a.category === categorySlug && a.status === 'approved').length;
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
  }
};

export const saveReview = (review: Review) => {
  const reviews = getStoredReviews();
  reviews.push(review);
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
};

export const saveOrder = (order: Order) => {
  const orders = getStoredOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
};

export const saveRoyalty = (royalty: Royalty) => {
  const royalties = getStoredRoyalties();
  royalties.push(royalty);
  localStorage.setItem(STORAGE_KEYS.royalties, JSON.stringify(royalties));
};

// Helper functions - use stored data
export const getAssetBySlug = (slug: string): Asset | undefined => {
  return getAssets().find(asset => asset.slug === slug);
};

export const getAssetById = (id: string): Asset | undefined => {
  return getAssets().find(asset => asset.id === id);
};

export const getAssetsByCategory = (categorySlug: string): Asset[] => {
  return getAssets().filter(asset => asset.category === categorySlug && asset.status === 'approved');
};

export const getAssetsByCreator = (creatorId: string): Asset[] => {
  return getAssets().filter(asset => asset.creatorId === creatorId);
};

export const getReviewsByAsset = (assetId: string): Review[] => {
  return getStoredReviews().filter(review => review.assetId === assetId);
};

export const getTrendingAssets = (): Asset[] => {
  const assets = getAssets().filter(asset => asset.status === 'approved');
  return [...assets].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 6);
};

export const getNewArrivals = (): Asset[] => {
  const assets = getAssets().filter(asset => asset.status === 'approved');
  return [...assets]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, 6);
};

// Get pending assets for admin approval
export const getPendingAssets = (): Asset[] => {
  return getAssets().filter(asset => asset.status === 'pending');
};

// Approve/reject asset
export const approveAsset = (assetId: string) => {
  const asset = getAssetById(assetId);
  if (asset) {
    asset.status = 'approved';
    asset.publishedAt = new Date().toISOString();
    saveAsset(asset);
  }
};

export const rejectAsset = (assetId: string, reason: string) => {
  const asset = getAssetById(assetId);
  if (asset) {
    asset.status = 'rejected';
    asset.rejectionReason = reason;
    saveAsset(asset);
  }
};

// Get creator stats from real data
export const getCreatorStats = (creatorId: string): CreatorStats => {
  const assets = getAssetsByCreator(creatorId);
  const orders = getStoredOrders();
  const royalties = getStoredRoyalties().filter(r => r.creatorId === creatorId);
  
  const creatorAssetIds = assets.map(a => a.id);
  const creatorOrders = orders.filter(o => o.items.some(i => creatorAssetIds.includes(i.assetId)));
  
  const totalSales = creatorOrders.reduce((sum, o) => sum + o.items.filter(i => creatorAssetIds.includes(i.assetId)).length, 0);
  const totalDownloads = assets.reduce((sum, a) => sum + (a.downloadCount || 0), 0);
  const totalEarnings = royalties.reduce((sum, r) => sum + r.amount, 0);
  const pendingRoyalties = royalties.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const availableRoyalties = royalties.filter(r => r.status === 'available').reduce((sum, r) => sum + r.amount, 0);
  
  return {
    totalAssets: assets.length,
    totalSales,
    totalDownloads,
    totalEarnings,
    pendingRoyalties,
    availableRoyalties,
    lifetimeRoyalties: totalEarnings,
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create slug from title
export const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};
