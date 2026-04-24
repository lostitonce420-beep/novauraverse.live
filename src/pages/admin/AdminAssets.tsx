import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Check, 
  X, 
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAssets } from '@/services/marketService';
import { formatPrice, formatDate } from '@/utils/format';
import { Box } from 'lucide-react';
import type { Asset, AssetStatus } from '@/types';

const statusColors: Record<AssetStatus, string> = {
  draft: 'bg-text-muted/20 text-text-muted',
  pending: 'bg-yellow-400/20 text-yellow-400',
  approved: 'bg-neon-lime/20 text-neon-lime',
  rejected: 'bg-neon-red/20 text-neon-red',
};

const statusLabels: Record<AssetStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function AdminAssets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const allAssets = await getAssets();
        setAssets(allAssets);
      } catch (err) {
        console.error('Failed to load assets:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, []);
  
  const filteredAssets = assets.filter((asset: Asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            Asset Management
          </h1>
          <p className="text-text-secondary">
            Review and manage all platform assets
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input
            type="text"
            placeholder="Search assets or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 bg-void-light border-white/10 text-text-primary placeholder:text-text-muted"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                  : 'bg-void-light text-text-secondary border border-white/5 hover:text-text-primary'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-void-light border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-text-muted font-medium text-sm">Asset</th>
                <th className="text-left px-6 py-4 text-text-muted font-medium text-sm">Creator</th>
                <th className="text-left px-6 py-4 text-text-muted font-medium text-sm">Price</th>
                <th className="text-left px-6 py-4 text-text-muted font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-text-muted font-medium text-sm">Submitted</th>
                <th className="text-right px-6 py-4 text-text-muted font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-void rounded-lg flex items-center justify-center">
                        <Box className="w-6 h-6 text-white/20" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{asset.title}</p>
                        <p className="text-sm text-text-muted">{asset.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {asset.creator?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-heading font-bold text-neon-cyan">
                      {formatPrice(asset.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>
                      {statusLabels[asset.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {formatDate(asset.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-text-muted hover:text-neon-cyan transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {asset.status === 'pending' && (
                        <>
                          <button className="p-2 text-text-muted hover:text-neon-lime transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-text-muted hover:text-neon-red transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Box className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-text-secondary">No assets found</p>
          </div>
        )}
      </div>
    </div>
  );
}
