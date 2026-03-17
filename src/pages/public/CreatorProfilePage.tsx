import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Package, 
  Users,
  ExternalLink,
  Box,
  User,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { getAssets, initializeStorage } from '@/services/marketService';
import { formatPrice } from '@/utils/format';
import { useState, useEffect } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { Button } from '@/components/ui/button';
import type { Asset } from '@/types';

export default function CreatorProfilePage() {
  const { username } = useParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [creator, setCreator] = useState<any>(null);
  const { followCreator, unfollowCreator, isFollowing, followedCreators } = useSocialStore();

  const creatorId = creator?.id || '';
  const following = isFollowing(creatorId);

  useEffect(() => {
    initializeStorage();
    // Find creator by username from all assets
    const allAssets = getAssets();
    const creatorAssets = allAssets.filter(a => 
      a.creator?.username?.toLowerCase() === username?.toLowerCase()
    );
    
    if (creatorAssets.length > 0) {
      setCreator(creatorAssets[0].creator);
      setAssets(creatorAssets.filter(a => a.status === 'approved'));
    }
  }, [username]);

  if (!creator) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center py-20">
            <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">
              Creator not found
            </h1>
            <p className="text-text-secondary">
              The creator you're looking for doesn't exist or hasn't published any assets yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-void-light border border-white/5 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-rgb p-1">
                {creator.avatar ? (
                  <img 
                    src={creator.avatar}
                    alt={creator.username}
                    className="w-full h-full rounded-xl bg-void object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-void flex items-center justify-center">
                    <User className="w-10 h-10 text-text-muted" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-grow">
                <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
                  {creator.username}
                </h1>
                <p className="text-text-secondary mb-4 max-w-xl">
                  {creator.bio || 'No bio provided.'}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-4">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Package className="w-4 h-4" />
                    <span>{assets.length} assets</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{creator.followerCount ?? followedCreators.filter((c: any) => c.userId === creatorId).length} followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>0 avg rating</span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  {creator.website && (
                    <a 
                      href={creator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {creator.twitter && (
                    <a 
                      href={`https://twitter.com/${creator.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              <Button
                onClick={() => {
                  if (following) {
                    unfollowCreator(creatorId);
                  } else {
                    followCreator(creatorId, creator.username, creator.avatar);
                  }
                }}
                className={`px-6 py-3 font-bold rounded-xl transition-all ${
                  following
                    ? 'bg-void-light border border-neon-cyan/30 text-neon-cyan hover:border-neon-red hover:text-neon-red'
                    : 'bg-gradient-rgb text-void hover:opacity-90'
                }`}
              >
                {following ? (
                  <><UserMinus className="w-4 h-4 mr-2" /> Following</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                )}
              </Button>
            </div>
          </div>

          {/* Assets Grid */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">
              Assets by {creator.username}
            </h2>

            {assets.length === 0 ? (
              <div className="text-center py-12 bg-void-light border border-white/5 rounded-xl">
                <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No published assets yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/asset/${asset.slug}`} className="group block">
                      <div className="bg-void-light border border-white/5 rounded-xl overflow-hidden card-hover">
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
                        </div>

                        <div className="p-4">
                          <h3 className="font-medium text-text-primary mb-1 group-hover:text-neon-cyan transition-colors line-clamp-1">
                            {asset.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-lg font-bold text-neon-cyan">
                              {formatPrice(asset.price)}
                            </span>
                            {(asset.ratingAverage || 0) > 0 && (
                              <span className="flex items-center gap-1 text-sm text-text-muted">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                {asset.ratingAverage?.toFixed(1)}
                              </span>
                            )}
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
      </div>
    </div>
  );
}


