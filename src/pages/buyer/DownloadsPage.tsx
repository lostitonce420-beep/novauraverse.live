import { motion } from 'framer-motion';
import { Download, Box, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DownloadsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-8">
            My Downloads
          </h1>

          <div className="space-y-4">
            {[1, 2].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-void-light border border-white/5 rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-void rounded-lg flex items-center justify-center">
                    <Box className="w-8 h-8 text-white/20" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-text-primary">
                      {index === 0 ? 'Aetherium Physics Adventure Game' : 'Aetherium UI Kit'}
                    </h3>
                    <p className="text-text-muted text-sm mt-1">
                      Version 1.2.0 • Purchased Jan 15, 2026
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-gradient-rgb text-void font-bold">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="border-white/20">
                      <FileText className="w-4 h-4 mr-2" />
                      License
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
