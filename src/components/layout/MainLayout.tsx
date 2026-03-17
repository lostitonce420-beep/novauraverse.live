import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingMessenger from '../social/FloatingMessenger';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { AuroraBackground } from '../ui/AuroraBackground';
import { AuraGuide } from '../ui/AuraGuide';

interface MainLayoutProps {
  hideNav?: boolean;
}

export default function MainLayout({ hideNav = false }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-void text-text-primary overflow-x-hidden">
      {/* Background effects */}
      <AuroraBackground />
      
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {!hideNav && <Navbar />}
        
        {!hideNav && location.pathname !== '/' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-4">
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-text-muted hover:text-neon-cyan transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Previous
              </button>
              <div className="w-px h-3 bg-white/10" />
              <Link 
                to="/"
                className="flex items-center gap-1.5 text-text-muted hover:text-neon-magenta transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
            </div>
          </div>
        )}
        
        <motion.main 
          className={`flex-grow ${!hideNav && location.pathname !== '/' ? 'pt-0' : 'pt-24'}`}
          style={{ paddingTop: !hideNav && location.pathname !== '/' ? 0 : undefined }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorBoundary section="Main Layout">
            <Outlet />
          </ErrorBoundary>
        </motion.main>
        
        {!hideNav && <Footer />}
        <AuraGuide />
      </div>

      {!hideNav && <FloatingMessenger />}
    </div>
  );
}
