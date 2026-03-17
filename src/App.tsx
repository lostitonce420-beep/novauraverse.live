import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

// Error Boundary
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import CreatorLayout from '@/components/layout/CreatorLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public Pages - NovAura Market
import HomePage from '@/pages/public/HomePage';
import BrowsePage from '@/pages/public/BrowsePage';
import AssetDetailPage from '@/pages/public/AssetDetailPage';
import CreatorProfilePage from '@/pages/public/CreatorProfilePage';
import UserProfilePage from '@/pages/public/UserProfilePage';
import SearchPage from '@/pages/public/SearchPage';
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicyPage';
import ContactPage from '@/pages/public/ContactPage';
import HelpCenterPage from '@/pages/public/HelpCenterPage';
import StatusPage from '@/pages/public/StatusPage';
import LicensingTermsPage from '@/pages/public/LicensingTermsPage';
import StudioShowcasePage from '@/pages/public/StudioShowcasePage';
import MusicMarketplacePage from '@/pages/public/MusicMarketplacePage';
import GalleryPage from '@/pages/public/GalleryPage';
import GallerySubmitPage from '@/pages/public/GallerySubmitPage';
import GamesPage from '@/pages/public/GamesPage';
import SoftwarePage from '@/pages/public/SoftwarePage';
import FreeItemsPage from '@/pages/public/FreeItemsPage';
import DevAuraReaderPage from '@/pages/public/DevAuraReaderPage';
import FeedPage from '@/pages/public/FeedPage';
import EcosystemHub from '@/pages/public/EcosystemHub';
import NovaRegistryPage from '@/pages/public/NovaRegistryPage';
import RoyaltiesPolicyPage from '@/pages/public/RoyaltiesPolicyPage';
import TermsOfUsePage from '@/pages/public/TermsOfUsePage';
import AssetAgreementPage from '@/pages/public/AssetAgreementPage';
import CookiesPolicyPage from '@/pages/public/CookiesPolicyPage';
import CreatorAgreementPage from '@/pages/public/CreatorAgreementPage';
import DomainMarketplace from '@/pages/public/DomainMarketplace';
import PricingPage from '@/pages/public/PricingPage';
import APIKeyLibraryPage from '@/pages/public/APIKeyLibraryPage';
import ChangelogPage from '@/pages/public/ChangelogPage';
import CreatorLounge from '@/pages/public/CreatorLounge';
import AuraStrategistPortal from '@/pages/public/AuraStrategistPortal';
import NovaChat from '@/pages/public/NovaChat';

// Novalow Domains Pages
import HostingPlansPage from '@/pages/novalow/HostingPlansPage';
import SiteBuilderPage from '@/pages/novalow/SiteBuilderPage';
import DevToolsPage from '@/pages/novalow/DevToolsPage';
import TutorialsPage from '@/pages/novalow/TutorialsPage';
import SecurityPage from '@/pages/novalow/SecurityPage';
import PromotePage from '@/pages/novalow/PromotePage';

// Auth Pages
import LoginPage from '@/pages/public/LoginPage';
import SignupPage from '@/pages/public/SignupPage';
import AdminSetupPage from '@/pages/public/AdminSetupPage';

// Buyer Pages
import CartPage from '@/pages/buyer/CartPage';
import CheckoutPage from '@/pages/buyer/CheckoutPage';
import OrdersPage from '@/pages/buyer/OrdersPage';
import DownloadsPage from '@/pages/buyer/DownloadsPage';
import WishlistPage from '@/pages/buyer/WishlistPage';
import SettingsPage from '@/pages/buyer/SettingsPage';
import AgreementsPage from '@/pages/buyer/AgreementsPage';
import MessagesPage from '@/pages/buyer/MessagesPage';
import NotificationsPage from '@/pages/buyer/NotificationsPage';

// Creator Pages
import CreatorDashboard from '@/pages/creator/CreatorDashboard';
import CreatorAssets from '@/pages/creator/CreatorAssets';
import CreatorUpload from '@/pages/creator/CreatorUpload';
import CreatorEarnings from '@/pages/creator/CreatorEarnings';
import CreatorSettings from '@/pages/creator/CreatorSettings';
import NovaIDE from '@/pages/creator/NovaIDE';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAssets from '@/pages/admin/AdminAssets';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCommandCenter from '@/pages/admin/AdminCommandCenter';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import ToastContainer from '@/components/ToastContainer';
import ScrollToTop from '@/components/ScrollToTop';
import FloatingNovaChat from '@/components/ui/FloatingNovaChat';
import TrainingConsentModal from '@/components/ui/TrainingConsentModal';

// Stores
import { useAuthStore } from '@/stores/authStore';

// UI Features
import { AuraGuide } from '@/components/ui/AuraGuide';
import { GlobalBadgeAwardOverlay } from '@/components/ui/AuraBadgeAward';
import { useUIStore } from '@/stores/uiStore';

import './App.css';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

import { initializeStorage } from '@/services/marketService';
import { initializeSocialStorage } from '@/services/socialService';
import { initializeCommunityStorage } from '@/services/communityService';
import { auraScheduler } from '@/services/auraScheduler';

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              {/* NovAura Market Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/browse/:category" element={<BrowsePage />} />
              <Route path="/asset/:slug" element={<AssetDetailPage />} />
              <Route path="/creator/:username" element={<CreatorProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/licensing" element={<LicensingTermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/studio" element={<StudioShowcasePage />} />
              <Route path="/music" element={<MusicMarketplacePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/gallery/submit" element={<GallerySubmitPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/software" element={<SoftwarePage />} />
              <Route path="/free" element={<FreeItemsPage />} />
              <Route path="/profile/:username" element={<UserProfilePage />} />
              <Route path="/reader" element={<DevAuraReaderPage />} />
              <Route path="/registry" element={<NovaRegistryPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/hub" element={<EcosystemHub />} />
              <Route path="/legal/royalties" element={<RoyaltiesPolicyPage />} />
              <Route path="/legal/terms" element={<TermsOfUsePage />} />
              <Route path="/legal/agreement" element={<AssetAgreementPage />} />
              <Route path="/legal/cookies" element={<CookiesPolicyPage />} />
              <Route path="/legal/creator-terms" element={<CreatorAgreementPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/creators" element={<CreatorLounge />} />
              <Route path="/strategist" element={<AuraStrategistPortal />} />
              <Route path="/chat" element={<NovaChat />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/api-keys" element={<APIKeyLibraryPage />} />
              
              {/* Novalow Domains Routes */}
              <Route path="/domains" element={<DomainMarketplace />} />
              <Route path="/hosting" element={<HostingPlansPage />} />
              <Route path="/builder" element={<SiteBuilderPage />} />
              <Route path="/devtools" element={<DevToolsPage />} />
              <Route path="/tutorials" element={<TutorialsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/promote" element={<PromotePage />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<MainLayout hideNav={true} />}>
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
              />
              <Route 
                path="/signup" 
                element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />} 
              />
              <Route path="/admin-setup" element={<AdminSetupPage />} />
            </Route>

            {/* Buyer Routes (Protected) */}
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['buyer', 'creator', 'admin']} />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/agreements" element={<AgreementsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:userId" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Creator Routes (Protected) */}
            <Route element={<ProtectedRoute allowedRoles={['creator', 'admin']} />}>
              <Route element={<CreatorLayout />}>
                <Route path="/creator/dashboard" element={<CreatorDashboard />} />
                <Route path="/creator/assets" element={<CreatorAssets />} />
                <Route path="/creator/assets/new" element={<CreatorUpload />} />
                <Route path="/creator/earnings" element={<CreatorEarnings />} />
                <Route path="/creator/settings" element={<CreatorSettings />} />
                <Route path="/ide" element={<NovaIDE />} />
              </Route>
            </Route>

            {/* Admin Routes (Protected) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/assets" element={<AdminAssets />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/command-center" element={<AdminCommandCenter />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { performanceMode } = useUIStore();
  const { init, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (performanceMode) {
      document.body.classList.add('performance-mode');
    } else {
      document.body.classList.remove('performance-mode');
    }
  }, [performanceMode]);

  useEffect(() => {
    initializeStorage();
    initializeSocialStorage();
    initializeCommunityStorage();
    init();
  }, [init]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      auraScheduler.init(user.id);
    }
  }, [isAuthenticated, user]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
          <ToastContainer />
          <AuraGuide />
          <GlobalBadgeAwardOverlay />
          <FloatingNovaChat />
          <TrainingConsentModal />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
