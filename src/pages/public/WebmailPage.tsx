import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Inbox, Send, Star, Trash2, Archive, RefreshCw,
  Search, Plus, User, ChevronLeft, Paperclip, Reply, Forward,
  MoreHorizontal, CheckSquare, Square, Filter, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEOMeta } from '@/components/seo/SEOMeta';
import { useAuthStore } from '@/stores/authStore';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive';
  attachments?: { name: string; size: string }[];
}

const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    from: 'welcome@novaura.life',
    to: 'user@novaura.life',
    subject: 'Welcome to NovAura Email!',
    body: `Welcome to your @novaura.life email account!\n\nYou now have access to:\n- Unlimited email addresses\n- Titan Mail webmail interface\n- SMTP/IMAP support\n- AI-powered email features\n\nGet started by customizing your account settings.`,
    date: '2026-04-05T08:30:00',
    read: false,
    starred: true,
    folder: 'inbox'
  },
  {
    id: '2',
    from: 'noreply@novaura.life',
    to: 'user@novaura.life',
    subject: 'Your Email Account is Active',
    body: 'Your @novaura.life email account has been successfully activated. You can now send and receive emails.',
    date: '2026-04-04T14:22:00',
    read: true,
    starred: false,
    folder: 'inbox'
  }
];

export default function WebmailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const filteredEmails = emails.filter(e => {
    if (e.folder !== selectedFolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.subject.toLowerCase().includes(q) || 
             e.from.toLowerCase().includes(q) ||
             e.body.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.read).length;

  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, read: true } : e));
  };

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
  };

  const moveToTrash = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'trash' } : e));
    if (selectedEmail?.id === emailId) setSelectedEmail(null);
  };

  const sendEmail = () => {
    const newEmail: Email = {
      id: `mail_${Date.now()}`,
      from: user?.email || 'user@novaura.life',
      to: composeData.to,
      subject: composeData.subject,
      body: composeData.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent'
    };
    setEmails(prev => [newEmail, ...prev]);
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">NovAura Webmail</h2>
          <p className="text-text-secondary mb-4">Please sign in to access your email</p>
          <Button onClick={() => window.location.href = `${import.meta.env.BASE_URL}login?redirect=${import.meta.env.BASE_URL}webmail`}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <SEOMeta
        title="NovAura Webmail"
        description="Check your @novaura.life email from any browser."
      />

      {/* Header */}
      <header className="h-14 bg-void-light border-b border-white/5 flex items-center px-4">
        <div className="flex items-center gap-2 mr-8">
          <Mail className="w-6 h-6 text-neon-cyan" />
          <span className="font-bold text-white">NovAura Mail</span>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-void border-white/10"
            />
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowCompose(true)}>
            <Plus className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
            <User className="w-4 h-4 text-neon-cyan" />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-60 bg-void-light border-r border-white/5 p-4">
          <Button 
            className="w-full mb-4 bg-neon-cyan text-void font-bold"
            onClick={() => setShowCompose(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Compose
          </Button>

          <nav className="space-y-1">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
              { id: 'sent', label: 'Sent', icon: Send },
              { id: 'drafts', label: 'Drafts', icon: Mail },
              { id: 'trash', label: 'Trash', icon: Trash2 },
            ].map(folder => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id as any);
                  setSelectedEmail(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-neon-cyan/10 text-neon-cyan'
                    : 'text-text-secondary hover:bg-white/5'
                }`}
              >
                <folder.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count > 0 && (
                  <span className="bg-neon-cyan text-void text-xs font-bold px-2 py-0.5 rounded-full">
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-white/5">
            <p className="text-xs text-text-muted mb-2">Your Address</p>
            <p className="text-sm text-white font-medium">{user?.email || 'user@novaura.life'}</p>
          </div>
        </aside>

        {/* Email List */}
        <div className="flex-1 flex">
          <div className={`${selectedEmail ? 'w-1/3' : 'w-full'} border-r border-white/5 overflow-y-auto`}>
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <CheckSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-text-muted">
                {filteredEmails.length} messages
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {filteredEmails.map(email => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    markAsRead(email.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id
                      ? 'bg-neon-cyan/10 border-l-2 border-neon-cyan'
                      : 'hover:bg-white/5 border-l-2 border-transparent'
                  } ${!email.read ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(email.id);
                      }}
                      className="mt-0.5"
                    >
                      <Star className={`w-4 h-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-text-muted'}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm truncate ${!email.read ? 'font-semibold text-white' : 'text-text-secondary'}`}>
                          {email.from}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${!email.read ? 'font-medium text-white' : 'text-text-secondary'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-text-muted truncate mt-1">
                        {email.body.substring(0, 60)}...
                      </p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {new Date(email.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Detail */}
          {selectedEmail && (
            <div className="flex-1 bg-void overflow-y-auto">
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="icon">
                  <Archive className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => moveToTrash(selectedEmail.id)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Reply className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Forward className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">{selectedEmail.subject}</h2>
                
                <div className="flex items-start gap-3 mb-6 pb-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedEmail.from}</p>
                    <p className="text-sm text-text-muted">to {selectedEmail.to}</p>
                  </div>
                  <span className="text-sm text-text-muted">
                    {new Date(selectedEmail.date).toLocaleString()}
                  </span>
                </div>

                <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.body}
                </div>

                {selectedEmail.attachments && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-sm text-text-muted mb-2">Attachments</p>
                    <div className="flex gap-2">
                      {selectedEmail.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-void-light rounded-lg">
                          <Paperclip className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-white">{att.name}</span>
                          <span className="text-xs text-text-muted">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-void-light border border-white/10 rounded-xl w-full max-w-2xl"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-medium">New Message</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCompose(false)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Input
                  placeholder="To"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  className="bg-void border-white/10"
                />
              </div>
              <div>
                <Input
                  placeholder="Subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="bg-void border-white/10"
                />
              </div>
              <div>
                <textarea
                  placeholder="Message body..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  rows={8}
                  className="w-full bg-void border border-white/10 rounded-lg p-3 text-white placeholder:text-text-muted resize-none focus:outline-none focus:border-neon-cyan"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowCompose(false)}>Discard</Button>
                <Button onClick={sendEmail} className="bg-neon-cyan text-void font-bold">
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
