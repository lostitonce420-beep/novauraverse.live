import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Box,
  Package,
  ArrowRight,
  Bot,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEOMeta } from '@/components/seo/SEOMeta';
import { getAssets, getStoredCategories, initializeStorage } from '@/services/marketService';
import { formatPrice, getLicenseBadgeClass, getLicenseDisplayName } from '@/utils/format';
import { parseIntent } from '@/utils/intentParser';
import type { AssetFilters, EngineType, Complexity, ContentRating, LicenseTier, Asset, Category, AssetType } from '@/types';

const engineTypes: { value: EngineType; label: string }[] = [
  { value: 'unity', label: 'Unity' },
  { value: 'unreal', label: 'Unreal Engine' },
  { value: 'godot', label: 'Godot' },
  { value: 'web', label: 'Web' },
  { value: 'other', label: 'Other' },
];

const complexities: { value: Complexity; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const contentRatings: { value: ContentRating; label: string }[] = [
  { value: 'sfw', label: 'SFW' },
  { value: 'nsfw', label: 'NSFW' },
];

const licenseTiers: { value: LicenseTier; label: string }[] = [
  { value: 'art_3pct', label: 'Standard Assets (3%)' },
  { value: 'integration_10pct', label: 'Integration (10%)' },
  { value: 'functional_15pct', label: 'Functional Game (15%)' },
  { value: 'source_20pct', label: 'Full Source (20%)' },
  { value: 'opensource', label: 'Open Source' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function BrowsePage() {
  const { category } = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isIntentMode, setIsIntentMode] = useState(false);
  const [activeAssetType, setActiveAssetType] = useState<AssetType>('dev_asset');
  const [sortBy, setSortBy] = useState('popular');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [filters, setFilters] = useState<AssetFilters>({
    category: category || undefined,
  });

  // Intent parsing effect
  useEffect(() => {
    if (!isIntentMode) return;
    
    // Use the keyword/regex intent parser as a stand-in for full LLM logic
    const intentResult = parseIntent(searchQuery);
    
    // Automatically apply semantic intent to filter state if we matched anything
    setFilters((prev: AssetFilters) => ({
      ...prev,
      priceMax: intentResult.priceMax !== undefined ? intentResult.priceMax : prev.priceMax,
      licenseTier: intentResult.licenseTier || prev.licenseTier,
      engineType: intentResult.engineType || prev.engineType,
      complexity: intentResult.complexity || prev.complexity,
      contentRating: intentResult.contentRating || prev.contentRating,
      category: intentResult.category || category || prev.category,
    }));
  }, [searchQuery, isIntentMode, category]);

  useEffect(() => {
    initializeStorage();
    setAssets(getAssets().filter(a => a.status === 'approved'));
    setCategories(getStoredCategories());
  }, []);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Filter by Asset Type (defaults to dev_asset for legacy compatibility)
    result = result.filter(a => (a.assetType || 'dev_asset') === activeAssetType);

    // Apply filters
    if (filters.category) {
      result = result.filter(a => a.category === filters.category);
    }
    if (filters.engineType) {
      result = result.filter(a => a.engineType === filters.engineType);
    }
    if (filters.complexity) {
      result = result.filter(a => a.complexity === filters.complexity);
    }
    if (filters.contentRating) {
      result = result.filter(a => a.contentRating === filters.contentRating);
    }
    if (filters.licenseTier) {
      result = result.filter(a => a.licenseTier === filters.licenseTier);
    }
    if (filters.priceMin !== undefined) {
      result = result.filter(a => a.price >= (filters.priceMin || 0));
    }
    if (filters.priceMax !== undefined) {
      result = result.filter(a => a.price <= (filters.priceMax || Infinity));
    }
    if (filters.rating) {
      result = result.filter(a => (a.ratingAverage || 0) >= (filters.rating || 0));
    }
    if (searchQuery) {
      if (isIntentMode) {
        // If in intent mode, we matching against the remaining non-filtered keywords instead of the full messy string
        const { cleanQuery } = parseIntent(searchQuery);
        if (cleanQuery) {
          result = result.filter(a => 
            a.title.toLowerCase().includes(cleanQuery) ||
            a.description.toLowerCase().includes(cleanQuery) ||
            a.tags.some((t: string) => t.toLowerCase().includes(cleanQuery))
          );
        }
      } else {
        const query = searchQuery.toLowerCase();
        result = result.filter(a => 
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.tags.some((t: string) => t.toLowerCase().includes(query))
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
        break;
    }

    return result;
  }, [filters, searchQuery, sortBy, assets]);

  const activeCategory = category ? categories.find((c: Category) => c.slug === category) : null;

  const toggleFilter = (key: keyof AssetFilters, value: string | undefined) => {
    setFilters((prev: AssetFilters) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SEOMeta
        title="Browse Assets"
        description="Explore thousands of game assets, 3D models, audio packs, scripts, templates, and tools from independent creators on NovAura."
        keywords={['browse game assets', 'buy game assets', '3D models', 'game audio', 'scripts', 'indie assets']}
        url="https://novauraverse.com/browse"
      />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              {activeCategory 
                ? activeCategory.name 
                : activeAssetType === 'game' ? 'Playable Games' 
                : activeAssetType === 'software' ? 'Software & Tools' 
                : 'Dev Assets'}
            </h1>
            <p className="text-text-secondary">
              {activeCategory 
                ? activeCategory.description 
                : activeAssetType === 'game' ? 'Discover and play incredible indie games'
                : activeAssetType === 'software' ? 'Find powerful tools to enhance your workflow'
                : 'Discover high-quality assets from creators around the world'}
            </p>
          </div>

          {/* Type Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-white/10 pb-4">
            {(['dev_asset', 'game', 'software'] as AssetType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveAssetType(type)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeAssetType === type
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-void text-text-secondary border border-white/5 hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                {type === 'dev_asset' ? '🛠️ Dev Assets' : type === 'game' ? '🎮 Playable Games' : '💻 Software Tools'}
              </button>
            ))}
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-grow max-w-xl group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {isIntentMode ? (
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                ) : (
                  <Search className="w-5 h-5 text-text-muted" />
                )}
              </div>
              <Input
                type="text"
                placeholder={isIntentMode ? "Ask Aura... (e.g. '2d UI pack under 15 with 3% royalty')" : "Search assets normally..."}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className={`pl-12 pr-28 py-6 bg-void-light border-white/10 text-text-primary ${isIntentMode ? "placeholder:text-purple-400/50 border-purple-500/30 ring-1 ring-purple-500/20" : "placeholder:text-text-muted"} rounded-xl transition-all`}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-text-muted hover:text-text-primary rounded-full hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Intent Toggle Button */}
                <button
                  onClick={() => setIsIntentMode(!isIntentMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isIntentMode 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                      : 'bg-white/5 text-text-muted hover:text-slate-300 border border-white/10'
                  }`}
                  title={isIntentMode ? "Switch to Manual Search" : "Switch to Aura Intent Search"}
                >
                  <Bot className="w-3.5 h-3.5" />
                  Aura
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                className={`border-white/10 ${showFilters ? 'bg-neon-cyan/10 border-neon-cyan/30' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-neon-cyan text-void text-xs font-bold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-void-light border border-white/10 text-text-primary px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:border-neon-cyan"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-text-muted hover:text-text-primary'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-text-muted hover:text-text-primary'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-void-light border border-white/5 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-neon-cyan hover:text-neon-cyan/80"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Engine Type */}
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Engine</label>
                  <div className="space-y-2">
                    {engineTypes.map(engine => (
                      <label key={engine.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.engineType === engine.value}
                          onChange={() => toggleFilter('engineType', engine.value)}
                          className="custom-checkbox"
                        />
                        <span className="text-sm text-text-secondary">{engine.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Complexity */}
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Complexity</label>
                  <div className="space-y-2">
                    {complexities.map(comp => (
                      <label key={comp.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.complexity === comp.value}
                          onChange={() => toggleFilter('complexity', comp.value)}
                          className="custom-checkbox"
                        />
                        <span className="text-sm text-text-secondary">{comp.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Rating */}
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Content</label>
                  <div className="space-y-2">
                    {contentRatings.map(rating => (
                      <label key={rating.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.contentRating === rating.value}
                          onChange={() => toggleFilter('contentRating', rating.value)}
                          className="custom-checkbox"
                        />
                        <span className="text-sm text-text-secondary">{rating.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* License */}
                <div>
                  <label className="text-sm text-text-muted mb-2 block">License</label>
                  <div className="space-y-2">
                    {licenseTiers.map(tier => (
                      <label key={tier.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.licenseTier === tier.value}
                          onChange={() => toggleFilter('licenseTier', tier.value)}
                          className="custom-checkbox"
                        />
                        <span className="text-sm text-text-secondary">{tier.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Price Range</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priceMax === 0}
                        onChange={() => toggleFilter('priceMax', filters.priceMax === 0 ? undefined : '0')}
                        className="custom-checkbox"
                      />
                      <span className="text-sm text-text-secondary">Free</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priceMax === 2500}
                        onChange={() => toggleFilter('priceMax', filters.priceMax === 2500 ? undefined : '2500')}
                        className="custom-checkbox"
                      />
                      <span className="text-sm text-text-secondary">Under $25</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priceMin === 2500}
                        onChange={() => toggleFilter('priceMin', filters.priceMin === 2500 ? undefined : '2500')}
                        className="custom-checkbox"
                      />
                      <span className="text-sm text-text-secondary">$25+</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <div className="mb-6 text-text-muted">
            Showing {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
          </div>

          {/* Assets Grid/List */}
          {filteredAssets.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/asset/${asset.slug}`} className="group block">
                    {viewMode === 'grid' ? (
                      <div className="bg-void-light border border-white/5 rounded-xl overflow-hidden card-hover">
                        {/* Thumbnail */}
                        <div className="aspect-video bg-void relative overflow-hidden">
                          {asset.thumbnailUrl ? (
                            <img 
                              src={asset.thumbnailUrl} 
                              alt={asset.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-neon-violet/10" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Box className="w-12 h-12 text-white/10" />
                              </div>
                            </>
                          )}
                          {/* License badge */}
                          <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium border ${getLicenseBadgeClass(asset.licenseTier)}`}>
                            {getLicenseDisplayName(asset.licenseTier)}
                          </div>
                          {/* Rating */}
                          {(asset.ratingAverage || 0) > 0 && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-void/80 rounded-lg">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-medium">{asset.ratingAverage?.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-medium text-text-primary mb-1 group-hover:text-neon-cyan transition-colors line-clamp-1">
                            {asset.title}
                          </h3>
                          <p className="text-text-muted text-sm mb-2">
                            by {asset.creator?.username || 'Unknown'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-lg font-bold text-neon-cyan">
                              {formatPrice(asset.price)}
                            </span>
                            <span className="text-text-muted text-xs">
                              {(asset.downloadCount || 0).toLocaleString()} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-void-light border border-white/5 rounded-xl card-hover">
                        <div className="w-24 h-16 rounded-lg bg-void flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {asset.thumbnailUrl ? (
                            <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
                          ) : (
                            <Box className="w-8 h-8 text-white/20" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                            {asset.title}
                          </h3>
                          <p className="text-text-muted text-sm">
                            by {asset.creator?.username || 'Unknown'} • {asset.engineType}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs border ${getLicenseBadgeClass(asset.licenseTier)}`}>
                              {getLicenseDisplayName(asset.licenseTier)}
                            </span>
                            {(asset.ratingAverage || 0) > 0 && (
                              <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                {asset.ratingAverage?.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-heading text-xl font-bold text-neon-cyan">
                          {formatPrice(asset.price)}
                        </span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                No assets yet
              </h3>
              <p className="text-text-secondary mb-6">
                Be the first to publish an asset on NovAura!
              </p>
              <Link to="/creator/upload">
                <Button className="bg-gradient-rgb text-void font-bold">
                  Upload Your First Asset
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


