import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAssets } from '@/services/marketService';
import { formatPrice } from '@/utils/format';
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  
  const results = getAssets().filter(asset => 
    asset.title.toLowerCase().includes(query.toLowerCase()) ||
    asset.description.toLowerCase().includes(query.toLowerCase()) ||
    asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-6">
            Search
          </h1>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assets, creators, tags..."
                className="pl-12 py-6 bg-void-light border-white/10 text-text-primary placeholder:text-text-muted text-lg"
              />
            </div>
          </form>

          {query && (
            <div className="mb-4 text-text-muted">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>
          )}

          <div className="space-y-4">
            {results.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/asset/${asset.slug}`}
                  className="flex items-center gap-4 p-4 bg-void-light border border-white/5 rounded-xl card-hover"
                >
                  <div className="w-20 h-20 bg-void rounded-lg flex items-center justify-center">
                    <Box className="w-10 h-10 text-white/20" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-text-primary text-lg">{asset.title}</h3>
                    <p className="text-text-muted text-sm mt-1">
                      by {asset.creator?.username || 'Unknown'} • {asset.category}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {asset.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 text-text-muted text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="font-heading text-xl font-bold text-neon-cyan">
                    {formatPrice(asset.price)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {query && results.length === 0 && (
            <div className="text-center py-12">
              <Box className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-text-secondary">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


