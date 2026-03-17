import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { platformCreatorStats, platformRoyalties } from '@/services/marketService';
import { formatPrice, formatDate } from '@/utils/format';

const monthlyData = [
  { month: 'Jan', earnings: 1200 },
  { month: 'Feb', earnings: 1850 },
  { month: 'Mar', earnings: 2100 },
  { month: 'Apr', earnings: 1650 },
  { month: 'May', earnings: 2400 },
  { month: 'Jun', earnings: 3200 },
];

export default function CreatorEarnings() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
          Earnings
        </h1>
        <p className="text-text-secondary">
          Track your sales, royalties, and payouts
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-void-light border border-white/5 rounded-xl p-6"
        >
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5 text-neon-cyan" />
          </div>
          <p className="text-text-muted text-sm mb-1">Lifetime Earnings</p>
          <p className="font-heading text-2xl font-bold text-text-primary">
            {formatPrice(platformCreatorStats.lifetimeRoyalties)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-void-light border border-white/5 rounded-xl p-6"
        >
          <div className="w-10 h-10 rounded-lg bg-neon-lime/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-neon-lime" />
          </div>
          <p className="text-text-muted text-sm mb-1">Available for Payout</p>
          <p className="font-heading text-2xl font-bold text-neon-lime">
            {formatPrice(platformCreatorStats.availableRoyalties)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-void-light border border-white/5 rounded-xl p-6"
        >
          <div className="w-10 h-10 rounded-lg bg-neon-violet/10 flex items-center justify-center mb-4">
            <TrendingDown className="w-5 h-5 text-neon-violet" />
          </div>
          <p className="text-text-muted text-sm mb-1">Pending (14 days)</p>
          <p className="font-heading text-2xl font-bold text-text-primary">
            {formatPrice(platformCreatorStats.pendingRoyalties)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-void-light border border-white/5 rounded-xl p-6"
        >
          <div className="w-10 h-10 rounded-lg bg-neon-magenta/10 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5 text-neon-magenta" />
          </div>
          <p className="text-text-muted text-sm mb-1">Next Payout</p>
          <p className="font-heading text-2xl font-bold text-text-primary">
            Feb 1, 2026
          </p>
        </motion.div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-void-light border border-white/5 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-bold text-text-primary">
            Earnings Overview
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="h-48 flex items-end gap-4">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-neon-cyan/50 to-neon-cyan rounded-t-lg transition-all hover:from-neon-cyan hover:to-neon-cyan"
                style={{ height: `${(data.earnings / 3500) * 100}%` }}
              />
              <span className="text-xs text-text-muted mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Royalties */}
      <div className="bg-void-light border border-white/5 rounded-xl p-6">
        <h2 className="font-heading text-lg font-bold text-text-primary mb-6">
          Recent Royalties
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm">Asset</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm">Amount</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {platformRoyalties.map((royalty, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5 last:border-b-0">
                  <td className="px-4 py-4 text-text-primary">
                    Aetherium Physics Game
                  </td>
                  <td className="px-4 py-4 font-heading font-bold text-neon-cyan">
                    {formatPrice(royalty.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      royalty.status === 'paid' 
                        ? 'bg-neon-lime/20 text-neon-lime' 
                        : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {royalty.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    {formatDate(royalty.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

