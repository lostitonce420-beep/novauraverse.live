import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Crown,
  Edit3,
  Globe,
  Layout,
  Code,
  AlertTriangle,
  Search,
  MoreVertical,
  Save,
  Star,
  Zap,
  Megaphone,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useHighlightStore } from '@/stores/highlightStore';
import { 
  getAllUsers, 
  updateUserRole, 
  initializeUserStorage
} from '@/services/userStorage';
import { 
  getPendingAssets, 
  approveAsset, 
  rejectAsset, 
  getAssets,
  initializeStorage 
} from '@/services/marketService';
import { getUserAgreements } from '@/legal/eulaBoilerplate';
import type { User, Asset } from '@/types';

// Site content storage
const getSiteContent = () => {
  const defaultContent = {
    homepage: {
      heroTitle: 'Build Worlds. Buy the Pieces.',
      heroSubtitle: 'The ethical marketplace for game developers. Fair royalties, transparent licensing, and assets that just work.',
      ctaPrimary: 'Explore Marketplace',
      ctaSecondary: 'Become a Creator',
    },
    about: {
      title: 'About NovAura Market',
      content: 'NovAura Market is an ethical creator marketplace built to protect indie developers while enabling collaboration and fair compensation.',
    },
    footer: {
      tagline: 'Building the future of game development, together.',
    }
  };
  const stored = localStorage.getItem('novaura_site_content');
  return stored ? JSON.parse(stored) : defaultContent;
};

const saveSiteContent = (content: any) => {
  localStorage.setItem('novaura_site_content', JSON.stringify(content));
};

// Check if user is the owner
const isOwner = (user: User | null): boolean => {
  if (!user) return false;
  return user.email === 'the.lost.catalyst@gmail.com' || user.email === 'Dillan.Copeland@Novauraverse.com';
};

export default function AdminCommandCenter() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'submissions' | 'highlights' | 'agreements' | 'users' | 'roles'>('overview');
  const [staffOnboarding, setStaffOnboarding] = useState<boolean>(
    localStorage.getItem('novaura_staff_onboarding') !== 'false'
  );

  const toggleStaffOnboarding = (val: boolean) => {
    localStorage.setItem('novaura_staff_onboarding', val ? 'true' : 'false');
    setStaffOnboarding(val);
    addToast({
      type: val ? 'success' : 'info',
      title: val ? 'Staff Onboarding Enabled' : 'Staff Onboarding Disabled',
      message: val
        ? 'New staff can now register via /staff-login.'
        : 'Staff registration is now locked.',
    });
  };
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [pendingAssets, setPendingAssets] = useState<Asset[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const { staffPicks, paidPromotions, setStaffPicks, setPaidPromotions } = useHighlightStore();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState(getSiteContent());
  const [editingContent, setEditingContent] = useState(false);
  
  // Search/filter states
  const [userSearch, setUserSearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  
  // Role assignment
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  // Content editing
  const [editedContent, setEditedContent] = useState(siteContent);

  // Define loadData with useCallback BEFORE useEffect hooks that use it
  const loadData = useCallback(() => {
    setUsers(getAllUsers());
    setPendingAssets(getPendingAssets());
    setAllAssets(getAssets());
    
    // Load all agreements
    const allUsers = getAllUsers();
    let allAgreements: any[] = [];
    allUsers.forEach(u => {
      const userAgreements = getUserAgreements(u.id);
      allAgreements = [...allAgreements, ...userAgreements];
    });
    setAgreements(allAgreements);
  }, []);

  useEffect(() => {
    initializeUserStorage();
    initializeStorage();
    loadData();
  }, [loadData]);

  // Check if user is owner
  if (!isOwner(user)) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-neon-red mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
        <p className="text-text-secondary">This area is restricted to platform administrators.</p>
      </div>
    );
  }

  const handleApproveAsset = (assetId: string) => {
    approveAsset(assetId);
    addToast({ type: 'success', title: 'Asset Approved', message: 'The asset is now live on the marketplace.' });
    loadData();
  };

  const handleRejectAsset = (assetId: string) => {
    rejectAsset(assetId, 'Does not meet platform guidelines');
    addToast({ type: 'info', title: 'Asset Rejected', message: 'The asset has been rejected.' });
    loadData();
  };

  const handleRoleChange = (userId: string, newRole: 'buyer' | 'creator' | 'admin' | 'moderator') => {
    updateUserRole(userId, newRole as any);
    addToast({ type: 'success', title: 'Role Updated', message: `User role changed to ${newRole}.` });
    loadData();
    setShowRoleModal(false);
  };

  const handleSaveContent = () => {
    saveSiteContent(editedContent);
    setSiteContent(editedContent);
    setEditingContent(false);
    addToast({ type: 'success', title: 'Content Saved', message: 'Site content has been updated.' });
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAssets = allAssets.filter(a =>
    a.title.toLowerCase().includes(assetSearch.toLowerCase()) ||
    a.creator?.username.toLowerCase().includes(assetSearch.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'content', label: 'Site Content', icon: Edit3 },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'highlights', label: 'Highlights', icon: Megaphone },
    { id: 'agreements', label: 'Agreements', icon: CheckCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Titles', icon: Crown },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-rgb flex items-center justify-center">
            <Shield className="w-6 h-6 text-void" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              Admin Command Center
            </h1>
            <p className="text-text-secondary">
              Welcome, {user?.username}. You have full platform control.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                icon={Users} 
                label="Total Users" 
                value={users.length} 
                color="neon-cyan" 
              />
              <StatCard 
                icon={FileText} 
                label="Total Assets" 
                value={allAssets.length} 
                color="neon-violet" 
              />
              <StatCard 
                icon={AlertTriangle} 
                label="Pending Review" 
                value={pendingAssets.length} 
                color="neon-magenta" 
              />
              <StatCard 
                icon={CheckCircle} 
                label="Agreements" 
                value={agreements.length} 
                color="neon-lime" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Submissions */}
              <div className="bg-void-light border border-white/5 rounded-xl p-6">
                <h3 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Pending Submissions
                </h3>
                {pendingAssets.length === 0 ? (
                  <p className="text-text-muted">No pending submissions</p>
                ) : (
                  <div className="space-y-3">
                    {pendingAssets.slice(0, 3).map((asset) => (
                      <div key={asset.id} className="flex items-center gap-3 p-3 bg-void rounded-lg">
                        <div className="w-10 h-10 bg-void-light rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-text-muted" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-text-primary">{asset.title}</p>
                          <p className="text-text-muted text-sm">by {asset.creator?.username}</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('submissions')}
                          className="px-3 py-1.5 bg-neon-cyan/10 text-neon-cyan rounded-lg text-sm"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-void-light border border-white/5 rounded-xl p-6">
                <h3 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('content')}
                    className="p-4 bg-void rounded-lg hover:bg-void-light transition-colors text-left"
                  >
                    <Edit3 className="w-5 h-5 text-neon-cyan mb-2" />
                    <p className="font-medium text-text-primary">Edit Site Content</p>
                    <p className="text-text-muted text-sm">Update homepage text</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-void rounded-lg hover:bg-void-light transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-neon-violet mb-2" />
                    <p className="font-medium text-text-primary">Manage Users</p>
                    <p className="text-text-muted text-sm">View and edit users</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className="p-4 bg-void rounded-lg hover:bg-void-light transition-colors text-left"
                  >
                    <Crown className="w-5 h-5 text-neon-magenta mb-2" />
                    <p className="font-medium text-text-primary">Assign Roles</p>
                    <p className="text-text-muted text-sm">Make admins/mods</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('agreements')}
                    className="p-4 bg-void rounded-lg hover:bg-void-light transition-colors text-left"
                  >
                    <CheckCircle className="w-5 h-5 text-neon-lime mb-2" />
                    <p className="font-medium text-text-primary">View Agreements</p>
                    <p className="text-text-muted text-sm">Check royalty records</p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-void-light border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Site Content Editor
                </h3>
                {!editingContent ? (
                  <Button
                    onClick={() => setEditingContent(true)}
                    className="bg-neon-cyan text-void font-bold"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Content
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingContent(false);
                        setEditedContent(siteContent);
                      }}
                      className="border-white/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveContent}
                      className="bg-gradient-rgb text-void font-bold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Homepage Content */}
                <div className="border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-neon-cyan" />
                    Homepage
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-2">Hero Title</label>
                      {editingContent ? (
                        <Input
                          value={editedContent.homepage.heroTitle}
                          onChange={(e) => setEditedContent({
                            ...editedContent,
                            homepage: { ...editedContent.homepage, heroTitle: e.target.value }
                          })}
                          className="bg-void border-white/10"
                        />
                      ) : (
                        <p className="text-text-primary bg-void p-3 rounded-lg">{siteContent.homepage.heroTitle}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-2">Hero Subtitle</label>
                      {editingContent ? (
                        <Textarea
                          value={editedContent.homepage.heroSubtitle}
                          onChange={(e) => setEditedContent({
                            ...editedContent,
                            homepage: { ...editedContent.homepage, heroSubtitle: e.target.value }
                          })}
                          className="bg-void border-white/10"
                          rows={2}
                        />
                      ) : (
                        <p className="text-text-primary bg-void p-3 rounded-lg">{siteContent.homepage.heroSubtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* About Content */}
                <div className="border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-neon-violet" />
                    About Page
                  </h4>
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Content</label>
                    {editingContent ? (
                      <Textarea
                        value={editedContent.about.content}
                        onChange={(e) => setEditedContent({
                          ...editedContent,
                          about: { ...editedContent.about, content: e.target.value }
                        })}
                        className="bg-void border-white/10"
                        rows={4}
                      />
                    ) : (
                      <p className="text-text-primary bg-void p-3 rounded-lg">{siteContent.about.content}</p>
                    )}
                  </div>
                </div>

                {/* Footer Content */}
                <div className="border border-white/10 rounded-lg p-4">
                  <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Code className="w-4 h-4 text-neon-lime" />
                    Footer
                  </h4>
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Tagline</label>
                    {editingContent ? (
                      <Input
                        value={editedContent.footer.tagline}
                        onChange={(e) => setEditedContent({
                          ...editedContent,
                          footer: { ...editedContent.footer, tagline: e.target.value }
                        })}
                        className="bg-void border-white/10"
                      />
                    ) : (
                      <p className="text-text-primary bg-void p-3 rounded-lg">{siteContent.footer.tagline}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <motion.div
            key="submissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-void-light border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Asset Submissions
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type="text"
                    placeholder="Search assets..."
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    className="pl-10 py-2 bg-void border-white/10 w-64"
                  />
                </div>
              </div>

              {/* Pending Section */}
              <div className="mb-8">
                <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Pending Review ({pendingAssets.length})
                </h4>
                {pendingAssets.length === 0 ? (
                  <p className="text-text-muted bg-void p-4 rounded-lg">No pending submissions</p>
                ) : (
                  <div className="space-y-3">
                    {pendingAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center gap-4 p-4 bg-void border border-yellow-400/20 rounded-lg">
                        <div className="w-14 h-14 bg-void-light rounded-lg flex items-center justify-center overflow-hidden">
                          {asset.thumbnailUrl ? (
                            <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-6 h-6 text-text-muted" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-text-primary">{asset.title}</p>
                          <p className="text-text-muted text-sm">by {asset.creator?.username} • {asset.licenseTier}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveAsset(asset.id)}
                            className="px-4 py-2 bg-neon-lime/20 text-neon-lime rounded-lg hover:bg-neon-lime/30 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAsset(asset.id)}
                            className="px-4 py-2 bg-neon-red/20 text-neon-red rounded-lg hover:bg-neon-red/30 transition-colors"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Assets Section */}
              <div>
                <h4 className="font-medium text-text-primary mb-4">All Assets ({filteredAssets.length})</h4>
                <div className="space-y-2">
                  {filteredAssets.slice(0, 10).map((asset) => (
                    <div key={asset.id} className="flex items-center gap-4 p-3 bg-void rounded-lg">
                      <div className="w-10 h-10 bg-void-light rounded-lg flex items-center justify-center overflow-hidden">
                        {asset.thumbnailUrl ? (
                          <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-text-primary">{asset.title}</p>
                        <p className="text-text-muted text-xs">by {asset.creator?.username}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        asset.status === 'approved' ? 'bg-neon-lime/20 text-neon-lime' :
                        asset.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-neon-red/20 text-neon-red'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* HIGHLIGHTS TAB */}
        {activeTab === 'highlights' && (
          <motion.div
            key="highlights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-void-light border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-1">
                    Storefront Highlights
                  </h3>
                  <p className="text-text-muted text-sm">Designate staff picks and paid tier advertisements for the homepage.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type="text"
                    placeholder="Search all assets..."
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    className="pl-10 py-2 bg-void border-white/10 w-64"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-20 bg-void/50 rounded-xl border border-dashed border-white/10">
                    <Package className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                    <p className="text-text-muted uppercase tracking-widest text-xs font-bold">No assets found matching your search</p>
                  </div>
                ) : (
                  filteredAssets.map((asset) => {
                    const isStaffPick = staffPicks.includes(asset.id);
                    const isPaidPromotion = paidPromotions.includes(asset.id);
                    
                    return (
                      <div key={asset.id} className={`flex items-center gap-4 p-4 bg-void border rounded-xl transition-all ${isPaidPromotion ? 'border-neon-cyan/40 bg-neon-cyan/5' : isStaffPick ? 'border-neon-lime/40 bg-neon-lime/5' : 'border-white/5'}`}>
                        <div className="w-16 h-16 bg-void-light rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                          {asset.thumbnailUrl ? (
                            <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-8 h-8 text-text-muted" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-text-primary text-lg">{asset.title}</p>
                            {isPaidPromotion && <span className="px-2 py-0.5 bg-neon-cyan text-void text-[8px] font-black uppercase tracking-widest rounded shadow-sm">Promoted</span>}
                            {isStaffPick && <span className="px-2 py-0.5 bg-neon-lime text-void text-[8px] font-black uppercase tracking-widest rounded shadow-sm">Staff Pick</span>}
                          </div>
                          <p className="text-text-muted text-xs">by {asset.creator?.username} • {asset.category} • {asset.licenseTier}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isPaidPromotion) {
                                setPaidPromotions(paidPromotions.filter(id => id !== asset.id));
                              } else {
                                setPaidPromotions([...paidPromotions, asset.id]);
                              }
                            }}
                            className={`h-9 px-4 text-[10px] font-black border transition-all ${isPaidPromotion ? 'bg-neon-cyan text-void border-neon-cyan shadow-[0_0_15px_rgba(0,255,249,0.3)]' : 'border-white/10 text-text-muted hover:border-neon-cyan/50 hover:text-neon-cyan hover:bg-neon-cyan/5'}`}
                          >
                            {isPaidPromotion ? "REMOVE PROMO" : "MAKE PROMO"}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isStaffPick) {
                                setStaffPicks(staffPicks.filter(id => id !== asset.id));
                              } else {
                                setStaffPicks([...staffPicks, asset.id]);
                              }
                            }}
                            className={`h-9 px-4 text-[10px] font-black border transition-all ${isStaffPick ? 'bg-neon-lime text-void border-neon-lime shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'border-white/10 text-text-muted hover:border-neon-lime/50 hover:text-neon-lime hover:bg-neon-lime/5'}`}
                          >
                            {isStaffPick ? "REMOVE PICK" : "STAFF PICK"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'agreements' && (
          <motion.div
            key="agreements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-void-light border border-white/5 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-text-primary mb-6">
                Royalty Agreements
              </h3>
              
              {agreements.length === 0 ? (
                <p className="text-text-muted">No agreements recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {agreements.slice(0, 20).map((agreement) => (
                    <div key={agreement.id} className="flex items-center gap-4 p-4 bg-void rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-text-primary">{agreement.assetTitle}</p>
                        <p className="text-text-muted text-sm">
                          by {agreement.creatorName} • {agreement.royaltyPercentage}% royalty
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-text-muted text-sm">{new Date(agreement.signedAt).toLocaleDateString()}</p>
                        <p className="text-text-muted text-xs">{agreement.signatureName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-void-light border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  User Management
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 py-2 bg-void border-white/10 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-text-muted text-sm font-medium px-4 py-3">User</th>
                      <th className="text-left text-text-muted text-sm font-medium px-4 py-3">Role</th>
                      <th className="text-left text-text-muted text-sm font-medium px-4 py-3">Joined</th>
                      <th className="text-right text-text-muted text-sm font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-lg" />
                            <div>
                              <p className="font-medium text-text-primary">{u.username}</p>
                              <p className="text-text-muted text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.role === 'admin' ? 'bg-neon-magenta/20 text-neon-magenta' :
                            u.role === 'moderator' ? 'bg-neon-violet/20 text-neon-violet' :
                            u.role === 'creator' ? 'bg-neon-cyan/20 text-neon-cyan' :
                            'bg-white/10 text-text-secondary'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowRoleModal(true);
                            }}
                            className="p-2 text-text-muted hover:text-neon-cyan transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ROLES TAB */}
        {activeTab === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-void-light border border-white/5 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-text-primary mb-6">
                Role & Title Management
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <RoleCard
                  icon={Crown}
                  title="Owner"
                  description="Full platform control"
                  color="text-neon-magenta"
                  bgColor="bg-neon-magenta/10"
                  count={users.filter(u => u.email === 'the.lost.catalyst@gmail.com').length}
                />
                <RoleCard
                  icon={Shield}
                  title="Admin"
                  description="Manage users & content"
                  color="text-neon-violet"
                  bgColor="bg-neon-violet/10"
                  count={users.filter(u => u.role === 'admin').length}
                />
                <RoleCard
                  icon={Star}
                  title="Moderator"
                  description="Review submissions"
                  color="text-neon-cyan"
                  bgColor="bg-neon-cyan/10"
                  count={users.filter(u => u.role === 'moderator').length}
                />
                <RoleCard
                  icon={Zap}
                  title="Creator"
                  description="Can upload assets"
                  color="text-neon-lime"
                  bgColor="bg-neon-lime/10"
                  count={users.filter(u => u.role === 'creator').length}
                />
              </div>

              <div className="bg-void rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-4">Assign Roles</h4>
                <p className="text-text-muted text-sm mb-4">
                  Select a user from the Users tab and click the menu to assign roles.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-2 bg-neon-cyan/10 text-neon-cyan rounded-lg"
                  >
                    Go to Users
                  </button>
                </div>
              </div>

              {/* Staff Onboarding Toggle */}
              <div className="mt-6 bg-void rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Staff Onboarding</h4>
                    <p className="text-text-muted text-sm mt-1">
                      Controls whether new staff can register at <span className="text-neon-cyan">/staff-login</span>.
                      Disable this after your team is set up.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStaffOnboarding(!staffOnboarding)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex items-center ${
                      staffOnboarding ? 'bg-neon-cyan' : 'bg-white/10'
                    }`}
                  >
                    <span className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      staffOnboarding ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className={`mt-3 text-xs px-3 py-1.5 rounded inline-block ${
                  staffOnboarding
                    ? 'bg-neon-lime/10 text-neon-lime'
                    : 'bg-neon-red/10 text-neon-red'
                }`}>
                  {staffOnboarding ? 'OPEN — staff can register' : 'CLOSED — registration locked'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-void-light border border-white/10 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">
              Assign Role to {selectedUser.username}
            </h3>
            <div className="space-y-2">
              {['buyer', 'creator', 'moderator', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(selectedUser.id, role as any)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUser.role === role
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                      : 'bg-void hover:bg-void-light'
                  }`}
                >
                  <span className="font-medium capitalize">{role}</span>
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-white/20"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  return (
    <div className="bg-void-light border border-white/5 rounded-xl p-6">
      <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-text-muted text-sm mb-1">{label}</p>
      <p className="font-heading text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

function RoleCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  bgColor,
  count 
}: { 
  icon: typeof Crown; 
  title: string; 
  description: string; 
  color: string; 
  bgColor: string;
  count: number;
}) {
  return (
    <div className="bg-void border border-white/10 rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="font-medium text-text-primary">{title}</p>
      <p className="text-text-muted text-sm">{description}</p>
      <p className={`font-heading text-2xl font-bold ${color} mt-2`}>{count}</p>
    </div>
  );
}


