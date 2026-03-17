import { motion } from 'framer-motion';
import { Package, Download, Box } from 'lucide-react';
import { platformOrders } from '@/services/marketService';
import { formatPrice, formatDate } from '@/utils/format';

export default function OrdersPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-8">
            My Orders
          </h1>

          <div className="space-y-4">
            {platformOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-void-light border border-white/5 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-text-muted text-sm">Order #{order.id}</p>
                    <p className="text-text-secondary text-sm">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? 'bg-neon-lime/20 text-neon-lime' 
                      : 'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-void rounded-lg">
                      <div className="w-12 h-12 bg-void-light rounded-lg flex items-center justify-center">
                        <Box className="w-6 h-6 text-white/20" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-text-primary">
                          {item.asset?.title || 'Asset'}
                        </p>
                      </div>
                      <span className="font-heading font-bold text-neon-cyan">
                        {formatPrice(item.pricePaid)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-text-muted text-sm">Total</p>
                    <p className="font-heading text-xl font-bold text-text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {platformOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-text-secondary">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

