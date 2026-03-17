import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Package,
  DollarSign,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { UserBadge } from '../ui/UserBadge';
import { NotificationBell } from '../notifications/NotificationBell';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { toggleMobileMenu, isMobileMenuOpen, openSearch } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Discourse', href: '/hub' },
    { label: 'Market', href: '/browse' },
    { label: 'Strategist', href: '/strategist' },
    { label: 'Games', href: '/games' },
    { label: 'Chat', href: '/chat' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-void/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-neon-cyan transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            </div>
            <span className="font-heading text-xl lg:text-2xl font-bold text-gradient-rgb">
              NovAura
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10"
              onClick={openSearch}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Cart */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-cyan text-void text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary hover:bg-white/5"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full border border-white/10"
                  />
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-sm">{user?.username}</span>
                    {user?.badges?.map((badge) => (
                      <UserBadge key={badge} type={badge as any} size="sm" />
                    ))}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-void-light border border-white/10 rounded-xl shadow-card overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5">
                        <p className="font-medium text-text-primary">{user?.username}</p>
                        <p className="text-sm text-text-secondary">{user?.email}</p>
                      </div>
                      
                      <div className="p-2">
                        {user?.role === 'creator' && (
                          <>
                            <Link
                              to="/creator/dashboard"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Creator Dashboard
                            </Link>
                            <Link
                              to="/creator/assets"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Package className="w-4 h-4" />
                              My Assets
                            </Link>
                            <Link
                              to="/creator/earnings"
                              className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <DollarSign className="w-4 h-4" />
                              Earnings
                            </Link>
                          </>
                        )}
                        
                        <Link
                          to={`/profile/${user?.username}`}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        
                        <Link
                          to="/messages"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Messages
                        </Link>
                        
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        
                        <Link
                          to="/creators"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-neon-pink hover:text-white hover:bg-neon-pink/10 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Sparkles className="w-4 h-4" />
                          Creator Lounge
                        </Link>
                        
                        <Link
                          to="/gallery/submit"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ImageIcon className="w-4 h-4" />
                          Submit to Gallery
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neon-red hover:text-neon-red hover:bg-neon-red/10 rounded-lg transition-colors mt-2 border-t border-white/5 pt-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block">
                  <Button 
                    variant="ghost" 
                    className="text-text-secondary hover:text-text-primary"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-rgb text-void font-semibold hover:opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-text-secondary hover:text-text-primary"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-void-light border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => toggleMobileMenu()}
                >
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <Link to="/login" onClick={() => toggleMobileMenu()}>
                    <Button variant="outline" className="w-full border-white/20">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => toggleMobileMenu()}>
                    <Button className="w-full bg-gradient-rgb text-void font-semibold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
