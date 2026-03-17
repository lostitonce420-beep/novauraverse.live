import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Gamepad2, 
  Wrench, 
  Layout, 
  Image, 
  Box, 
  Music,
  Star,
  TrendingUp,
  Zap,
  Package,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOMeta } from '@/components/seo/SEOMeta';
import { platformCategories, getAssets, getFeaturedAssets, getTrendingAssets, getNewArrivals, initializeStorage, getStoredOrders, getStoredRoyalties } from '@/services/marketService';
import { formatPrice } from '@/utils/format';
import type { Asset } from '@/types';
import { useHighlightStore } from '@/stores/highlightStore';

const iconMap: Record<string, typeof Box> = {
  Gamepad2,
  Wrench,
  Layout,
  Image,
  Box,
  Music,
};

export default function HomePage() {
  const [featuredAssets, setFeaturedAssets] = useState<Asset[]>([]);
  const [trendingAssets, setTrendingAssets] = useState<Asset[]>([]);
  const [newArrivals, setNewArrivals] = useState<Asset[]>([]);
  const { staffPicks, paidPromotions } = useHighlightStore();
  const [stats, setStats] = useState({
    assets: 0,
    creators: 0,
    developers: 0,
    paidToCreators: 0,
  });

  useEffect(() => {
    // Initialize localStorage
    initializeStorage();
    
    // Load data
    const allAssets = getAssets();
    const featured = getFeaturedAssets();
    
    // Phase 6: Highlights Logic
    let highlightItems: Asset[] = [];
    
    if (paidPromotions.length > 0 || staffPicks.length > 0) {
      const promoted = allAssets.filter(a => paidPromotions.includes(a.id));
      const picks = allAssets.filter(a => staffPicks.includes(a.id));
      // Remove duplicates
      const combined = [...promoted, ...picks];
      highlightItems = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    }
    
    if (highlightItems.length === 0) {
      highlightItems = featured;
    }

    setFeaturedAssets(highlightItems);
    setTrendingAssets(getTrendingAssets());
    setNewArrivals(getNewArrivals());
    
    // Calculate stats
    const assets = allAssets.filter(a => a.status === 'approved');
    const orders = getStoredOrders();
    const royalties = getStoredRoyalties();
    
    const creatorIds = new Set(assets.map(a => a.creatorId));
    const buyerIds = new Set(orders.map(o => o.buyerId));
    const totalPaid = royalties.reduce((sum, r) => sum + r.amount, 0);
    
    setStats({
      assets: assets.length,
      creators: creatorIds.size,
      developers: buyerIds.size,
      paidToCreators: totalPaid,
    });
  }, [staffPicks, paidPromotions]);

  const formatStat = (value: number, suffix: string = '') => {
    if (value === 0) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix}`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K${suffix}`;
    return `${value}${suffix}`;
  };

  return (
    <div className="min-h-screen">
      <SEOMeta
        title="NovAura — The Creator Ecosystem"
        description="The ethical creator marketplace. Buy, sell, and create game assets, 3D models, software, music, and digital experiences. Fair royalties. Real community."
        keywords={['game assets', 'creator marketplace', 'indie game assets', 'game development', '3D models', 'sound effects', 'NovAura']}
        url="https://novauraverse.com"
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: 'url("/C:/Users/Busin/.gemini/antigravity/brain/5705e2c4-a431-4a20-b1ab-34b5b08a02db/novaura_midnight_launch_hero_1773549966380.png")' }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,249,0.15)]"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-neon-cyan/50 blur-lg rounded-full"
                />
              </div>
              <span className="text-sm text-neon-cyan font-bold tracking-wider uppercase">
                Midnight Launch Core: Phase Alpha Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6"
            >
              <span className="text-text-primary">Build</span>{' '}
              <span className="text-gradient-rgb animate-gradient hover:animate-glitch cursor-default">Future Worlds.</span>
              <br />
              <span className="text-text-primary">Master the</span>{' '}
              <span className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,255,249,0.5)]">Sovereign Web.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-8 mb-12 p-6 rounded-2xl bg-void-light border border-neon-cyan/20 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col md:flex-row items-center gap-6 text-left relative z-10">
                <div className="w-16 h-16 rounded-xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20 shrink-0">
                  <Cpu className="w-8 h-8 text-neon-cyan animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    Coming Soon: <span className="text-neon-cyan">Downloadable Agentic Hybrid Command Station</span>
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mt-2">
                    Packed with new features and powerful enhancements at the baremetal level. 
                    Full Dev tools and API soon to follow—and get ready for the <span className="text-neon-violet font-bold">Nova Navi Systems!</span>
                  </p>
                </div>
                <div className="ml-auto">
                  <Link to="/domains">
                    <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                      View Domain Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10"
            >
              The ethical marketplace for game developers. Fair royalties, 
              transparent licensing, and assets that just work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/browse">
                <Button 
                  size="lg" 
                  className="bg-gradient-rgb text-void font-bold px-8 py-6 text-lg hover:opacity-90 transition-opacity"
                >
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-text-primary hover:bg-white/5 px-8 py-6 text-lg"
                >
                  Become a Creator
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-16"
            >
              {[
                { value: formatStat(stats.assets), label: 'Assets' },
                { value: formatStat(stats.creators), label: 'Creators' },
                { value: formatStat(stats.developers), label: 'Developers' },
                { value: formatStat(stats.paidToCreators, '$'), label: 'Paid to Creators' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-2xl sm:text-3xl font-bold text-neon-cyan">
                    {stat.value}
                  </p>
                  <p className="text-text-secondary text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 lg:py-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Browse by <span className="text-gradient-cyan">Category</span>
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                Find exactly what you need for your next project
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {platformCategories.map((category, index) => {
                const Icon = iconMap[category.icon] || Box;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/browse/${category.slug}`}
                      className="group block bg-void-light border border-white/5 rounded-xl p-6 text-center card-hover"
                    >
                      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-neon-cyan/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
                        <Icon className="w-6 h-6 text-neon-cyan" />
                      </div>
                      <h3 className="font-medium text-text-primary mb-1 group-hover:text-neon-cyan transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-text-muted text-sm">
                        {category.assetCount?.toLocaleString() || 0} assets
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Assets / Highlights */}
      <section className="py-20 lg:py-32 bg-void-light/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                  Featured <span className="text-neon-violet">Highlights</span>
                </h2>
                <p className="text-text-secondary">
                  {(paidPromotions.length > 0 || staffPicks.length > 0) ? "Hand-picked promotions and staff picks" : "Trending assets from our community"}
                </p>
              </div>
              <Link 
                to="/browse" 
                className="hidden sm:flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {featuredAssets.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-medium text-text-primary mb-2">No assets yet</h3>
                <p className="text-text-secondary mb-6">Be the first to publish an asset on NovAura!</p>
                <Link to="/creator/upload">
                  <Button className="bg-gradient-rgb text-void font-bold">
                    Upload Your First Asset
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/asset/${asset.slug}`} className="group block">
                      <div className="bg-void-light border border-white/5 rounded-xl overflow-hidden card-hover relative">
                        {/* Promotion Badge */}
                        {paidPromotions.includes(asset.id) && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-neon-cyan text-void text-[8px] font-black uppercase tracking-widest rounded shadow-[0_0_10px_rgba(0,255,249,0.5)]">
                            Promoted
                          </div>
                        )}
                        {staffPicks.includes(asset.id) && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-neon-lime text-void text-[8px] font-black uppercase tracking-widest rounded shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                            Staff Pick
                          </div>
                        )}

                        {/* Thumbnail */}
                        <div className="aspect-video bg-void relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Box className="w-12 h-12 text-white/20" />
                          </div>
                          {asset.ratingAverage > 0 && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-void/80 rounded-lg">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-medium">{asset.ratingAverage}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-medium text-text-primary mb-1 group-hover:text-neon-cyan transition-colors line-clamp-1">
                            {asset.title}
                          </h3>
                          <p className="text-text-muted text-sm mb-3">
                            by {asset.creator?.username || 'Unknown'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-lg font-bold text-neon-cyan">
                              {asset.price === 0 ? 'Free' : formatPrice(asset.price)}
                            </span>
                            <span className="text-text-muted text-xs">
                              {(asset.downloadCount || 0).toLocaleString()} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending & New */}
      <section className="py-20 lg:py-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-neon-magenta" />
                  <h2 className="font-heading text-2xl font-bold text-text-primary">
                    Trending Now
                  </h2>
                </div>
                {trendingAssets.length === 0 ? (
                  <div className="text-center py-8 bg-void-light border border-white/5 rounded-xl">
                    <p className="text-text-muted">No trending assets yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trendingAssets.slice(0, 4).map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link to={`/asset/${asset.slug}`} className="group flex items-center gap-4 p-4 bg-void-light border border-white/5 rounded-xl card-hover">
                          <div className="w-16 h-16 rounded-lg bg-void flex items-center justify-center flex-shrink-0">
                            <Box className="w-8 h-8 text-white/20" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                              {asset.title}
                            </h3>
                            <p className="text-text-muted text-sm">
                              {(asset.downloadCount || 0).toLocaleString()} downloads
                            </p>
                          </div>
                          <span className="font-heading font-bold text-neon-cyan">
                            {asset.price === 0 ? 'Free' : formatPrice(asset.price)}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-neon-lime" />
                  <h2 className="font-heading text-2xl font-bold text-text-primary">
                    New Arrivals
                  </h2>
                </div>
                {newArrivals.length === 0 ? (
                  <div className="text-center py-8 bg-void-light border border-white/5 rounded-xl">
                    <p className="text-text-muted">No new arrivals yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newArrivals.slice(0, 4).map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link to={`/asset/${asset.slug}`} className="group flex items-center gap-4 p-4 bg-void-light border border-white/5 rounded-xl card-hover">
                          <div className="w-16 h-16 rounded-lg bg-void flex items-center justify-center flex-shrink-0">
                            <Box className="w-8 h-8 text-white/20" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                              {asset.title}
                            </h3>
                            <p className="text-text-muted text-sm">
                              by {asset.creator?.username || 'Unknown'}
                            </p>
                          </div>
                          <span className="font-heading font-bold text-neon-cyan">
                            {asset.price === 0 ? 'Free' : formatPrice(asset.price)}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap / Coming Soon Section */}
      <section className="py-20 lg:py-32 bg-void relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/5 to-transparent" />
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-4"
              >
                <Zap className="w-3 h-3 text-neon-cyan" />
                <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">The Next Evolution</span>
              </motion.div>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold text-text-primary mb-6">
                Coming Soon to <span className="text-gradient-rgb">NovAura</span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto italic">
                "Breaking the boundaries between browser and baremetal."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Agentic Command Station",
                  desc: "Downloadable hybrid hub packed with powerful baremetal-level enhancements.",
                  icon: Cpu,
                  color: "text-neon-cyan"
                },
                {
                  title: "Nova Navi Systems",
                  desc: "Revolutionary neural navigation and intent-based ecosystem traversal.",
                  icon: Sparkles,
                  color: "text-neon-magenta"
                },
                {
                  title: "Dev Tools & API",
                  desc: "Full-scale developer environment and API access for external integrations.",
                  icon: Wrench,
                  color: "text-neon-lime"
                },
                {
                  title: "Neural IDE",
                  desc: "Agent-first site building and code synthesis inspired by IDX architecture.",
                  icon: Layout,
                  color: "text-neon-violet"
                }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-void-light border border-white/5 hover:border-neon-cyan/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-neon-cyan/10 via-neon-violet/10 to-neon-magenta/10 border border-white/10 rounded-2xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-radial from-neon-cyan/10 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
                  Ready to share your work?
                </h2>
                <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
                  Join creators earning fair royalties on NovAura. 
                  Keep your rights, get paid what you deserve.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="bg-gradient-rgb text-void font-bold px-8 py-6 text-lg"
                    >
                      Start Creating
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/creator/dashboard">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-white/20 text-text-primary hover:bg-white/5 px-8 py-6 text-lg"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
