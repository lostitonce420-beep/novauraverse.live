import { useState, type ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  AlertCircle,
  FileText,
  Box,
  Calendar,
  User,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAssetBySlug, getReviewsByAsset, getAssets } from '@/services/marketService';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { formatPrice, formatDate, getLicenseBadgeClass, getLicenseDisplayName } from '@/utils/format';
import type { LicenseTier } from '@/types';

const licenseDetails: Record<LicenseTier, { title: string; description: string; points: string[] }> = {
  art_3pct: {
    title: 'Individual Art License',
    description: 'For single sprites, textures, and artwork. 3% royalty on product revenue.',
    points: [
      'Use in unlimited commercial projects',
      'Modify and adapt for your needs',
      'Credit the original creator',
      '3% royalty on product revenue',
      'Use alongside other assets',
    ],
  },
  music_1pct: {
    title: 'Music & Audio License',
    description: 'For music, soundtracks, and audio when defining your game\'s sonic identity. 1% royalty.',
    points: [
      'Use as primary soundtrack or ambience',
      'Loop and edit for your needs',
      'Credit the musician prominently',
      '1% royalty on product revenue',
      'Fair compensation for audio creators',
    ],
  },
  integration_10pct: {
    title: 'Asset Collection License',
    description: 'When multiple assets from one creator define your game\'s aesthetic. 10% royalty.',
    points: [
      'Complete art packs or soundtracks',
      'Dominant visual/audio identity',
      '10% royalty on total revenue',
      'Prominent attribution required',
      'Per-creator, not per-asset',
    ],
  },
  functional_15pct: {
    title: 'Game Framework License',
    description: 'Reusable systems powering core mechanics. 15% royalty on product revenue.',
    points: [
      'Card games, battle systems, UI kits',
      'Modify and extend the framework',
      '15% royalty on product revenue',
      'Preserve copyright in code',
      'Cannot resell as standalone',
    ],
  },
  source_20pct: {
    title: 'Full Source License',
    description: 'Complete game projects with full source code. 20% royalty on product revenue.',
    points: [
      'Full source code access',
      '20% royalty on product revenue',
      'Right to rebrand & modify',
      'Commercial use permitted'
    ]
  },
  opensource: {
    title: 'Open Source License',
    description: 'MIT/Apache licensed. Free to use with proper attribution.',
    points: [
      'No royalties required',
      'Free for any use',
      'Keep license file intact',
      'Community contributions welcome',
      'Fork and redistribute',
    ],
  },
};

export default function AssetDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const asset = getAssetBySlug(slug || '');
  const reviews = asset ? getReviewsByAsset(asset.id) : [];
  
  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart } = useCartStore();
  const { addToast, openLoginModal } = useUIStore();
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>(
    asset?.pricingType === 'donation' ? (asset.suggestedDonation ? (asset.suggestedDonation / 100).toString() : '0') : ''
  );

  if (!asset) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Box className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">
            Asset Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            The asset you're looking for doesn't exist.
          </p>
          <Link to="/browse">
            <Button>Browse Assets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    if (isInCart(asset.id)) {
      addToast({
        type: 'info',
        title: 'Already in cart',
        message: 'This asset is already in your cart.',
      });
      return;
    }
    
    const priceToAdd = asset.pricingType === 'donation' ? Math.round(parseFloat(customPrice || '0') * 100) : undefined;
    
    addItem(asset, priceToAdd);
    addToast({
      type: 'success',
      title: 'Added to cart',
      message: `${asset.title} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    if (!isInCart(asset.id)) {
      const priceToAdd = asset.pricingType === 'donation' ? Math.round(parseFloat(customPrice || '0') * 100) : undefined;
      addItem(asset, priceToAdd);
    }
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    setIsWishlisted(!isWishlisted);
    addToast({
      type: 'success',
      title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
    });
  };

  const relatedAssets = getAssets()
    .filter(a => a.category === asset.category && a.id !== asset.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/browse" className="hover:text-text-primary transition-colors">Browse</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary">{asset.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Media & Info */}
            <div className="lg:col-span-2">
              {/* Media Gallery */}
              <div className="aspect-video bg-void-light border border-white/5 rounded-xl overflow-hidden mb-6">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-cyan/5 to-neon-violet/5">
                  <Box className="w-24 h-24 text-white/10" />
                </div>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-video bg-void-light border border-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:border-neon-cyan/30 transition-colors"
                  >
                    <Box className="w-8 h-8 text-white/10" />
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="bg-void-light border border-white/5 mb-6">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                  <TabsTrigger value="changelog">Changelog</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-0">
                  <div className="bg-void-light border border-white/5 rounded-xl p-6">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-text-secondary whitespace-pre-line">
                        {asset.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <h4 className="text-sm font-medium text-text-muted mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {asset.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-3 py-1 bg-white/5 text-text-secondary text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map(review => (
                        <div key={review.id} className="bg-void-light border border-white/5 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-neon-cyan" />
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">User {review.reviewerId}</p>
                                <p className="text-sm text-text-muted">{formatDate(review.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <h4 className="font-medium text-text-primary mb-2">{review.title}</h4>
                          <p className="text-text-secondary">{review.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-void-light border border-white/5 rounded-xl">
                        <Star className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-text-secondary">No reviews yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="changelog" className="mt-0">
                  <div className="bg-void-light border border-white/5 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-neon-cyan mt-2" />
                        <div>
                          <p className="font-medium text-text-primary">{asset.version}</p>
                          <p className="text-text-secondary">{asset.changelog}</p>
                          <p className="text-sm text-text-muted mt-1">{formatDate(asset.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Related Assets */}
              {relatedAssets.length > 0 && (
                <div>
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
                    Related Assets
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {relatedAssets.map(related => (
                      <Link 
                        key={related.id} 
                        to={`/asset/${related.slug}`}
                        className="group block bg-void-light border border-white/5 rounded-lg overflow-hidden card-hover"
                      >
                        <div className="aspect-video bg-void flex items-center justify-center">
                          <Box className="w-8 h-8 text-white/10" />
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                            {related.title}
                          </p>
                          <p className="text-neon-cyan text-sm font-bold">
                            {formatPrice(related.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Purchase Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Purchase Card */}
                <div className="bg-void-light border border-white/5 rounded-xl p-6 mb-6">
                  {/* Title & Rating */}
                  <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">
                    {asset.title}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{asset.ratingAverage}</span>
                      <span className="text-text-muted">({asset.ratingCount})</span>
                    </div>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{asset.downloadCount.toLocaleString()} downloads</span>
                  </div>

                  {/* Creator */}
                  <Link 
                    to={`/creator/${asset.creator?.username}`}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-6 hover:bg-white/10 transition-colors"
                  >
                    <img 
                      src={asset.creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${asset.creatorId}`}
                      alt={asset.creator?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-text-primary">{asset.creator?.username}</p>
                      <p className="text-sm text-text-muted">View profile</p>
                    </div>
                  </Link>

                  {/* License Selection */}
                  <div className="mb-6">
                    <label className="text-sm text-text-muted mb-2 block">License Type</label>
                    <div className={`p-3 rounded-lg border ${getLicenseBadgeClass(asset.licenseTier)}`}>
                      <p className="font-medium">{getLicenseDisplayName(asset.licenseTier)}</p>
                      <p className="text-sm opacity-80">
                        {licenseDetails[asset.licenseTier].description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {asset.pricingType === 'donation' ? (
                      <div>
                        <label className="text-sm text-text-muted mb-2 block">Name your price (USD)</label>
                        <div className="relative mb-2">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                          <Input
                            type="number"
                            value={customPrice}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomPrice(e.target.value)}
                            min="0"
                            step="0.50"
                            className="pl-8 py-6 text-xl bg-void border-white/20 text-text-primary focus:border-neon-cyan"
                          />
                        </div>
                        {asset.suggestedDonation !== undefined && asset.suggestedDonation > 0 && (
                          <p className="text-xs text-text-muted">
                            Suggested donation: {formatPrice(asset.suggestedDonation)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading text-4xl font-bold text-neon-cyan">
                          {asset.pricingType === 'free' ? 'Free' : formatPrice(asset.price)}
                        </span>
                        {asset.salePrice && (
                          <span className="text-text-muted line-through">
                            {formatPrice(asset.salePrice)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-rgb text-void font-bold py-6 hover:opacity-90"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/20 text-text-primary hover:bg-white/5 py-6"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isInCart(asset.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={handleWishlist}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        isWishlisted 
                          ? 'border-neon-magenta bg-neon-magenta/10 text-neon-magenta' 
                          : 'border-white/10 text-text-muted hover:text-text-primary hover:border-white/20'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-neon-magenta' : ''}`} />
                      <span className="text-sm">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-white/10 text-text-muted hover:text-text-primary hover:border-white/20 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>

                {/* Asset Info */}
                <div className="bg-void-light border border-white/5 rounded-xl p-6">
                  <h3 className="font-medium text-text-primary mb-4">Asset Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        Engine
                      </span>
                      <span className="text-text-primary capitalize">{asset.engineType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Category
                      </span>
                      <span className="text-text-primary capitalize">{asset.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Complexity
                      </span>
                      <span className="text-text-primary capitalize">{asset.complexity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Published
                      </span>
                      <span className="text-text-primary">{formatDate(asset.publishedAt || asset.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Version
                      </span>
                      <span className="text-text-primary">{asset.version}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


