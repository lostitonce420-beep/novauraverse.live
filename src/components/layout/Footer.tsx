import { Link } from 'react-router-dom';
import { Sparkles, Twitter, Github, MessageCircle } from 'lucide-react';

const footerLinks = {
  Marketplace: [
    { label: 'Browse All', href: '/browse' },
    { label: 'Categories', href: '/browse' },
    { label: 'Featured', href: '/browse' },
    { label: 'New Arrivals', href: '/browse' },
  ],
  Creators: [
    { label: 'Become a Creator', href: '/signup' },
    { label: 'Creator Dashboard', href: '/creator/dashboard' },
    { label: 'Upload Asset', href: '/creator/assets/new' },
    { label: 'Earnings', href: '/creator/earnings' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Status', href: '/status' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'License Terms', href: '/legal/agreement' },
    { label: 'Royalties & Economy', href: '/legal/royalties' },
    { label: 'Creator Terms', href: '/legal/creator-terms' },
    { label: 'Cookies Policy', href: '/legal/cookies' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-void-light">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <span className="font-heading text-xl font-bold text-gradient-rgb">
                NovAura
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-sm">
              The ethical marketplace for creators. Build worlds, buy the pieces, 
              keep creators credited with fair royalties.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-text-secondary text-sm hover:text-neon-cyan transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 NovAura Market. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link to="/legal/privacy" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Privacy
            </Link>
            <Link to="/legal/terms" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Terms
            </Link>
            <Link to="/changelog" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Changelog
            </Link>
            <Link to="/contact" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer & Staff Policy */}
        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            <div className="p-4 rounded-xl bg-void border border-white/5">
              <div className="flex justify-center mb-4">
                <div className="px-6 py-2 bg-neon-lime/10 border border-neon-lime/30 rounded-full">
                  <span className="text-neon-lime font-black text-xs uppercase tracking-widest">Live: March 13, 2026</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed text-center italic">
                <span className="text-text-secondary font-bold uppercase tracking-widest block mb-2">Legal Liability Disclaimer</span>
                NovAura acts as an ethical facilitator for digital expression. We are not responsible for the individual actions of creators or the use/submissions of their content outside of our ecosystem boundaries. 
                All assets and publicly posted media are subject to human-review. We strictly prohibit illegal or unconsenting content.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10">
              <div className="flex justify-center mb-4">
                <div className="px-6 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full">
                  <span className="text-neon-cyan font-black text-xs uppercase tracking-widest">Expansion Protocol</span>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed text-center font-medium italic">
                <span className="text-neon-cyan font-bold uppercase tracking-widest block mb-2">Notice of Continuous Evolution</span>
                The NovAura ecosystem is in a state of rapid expansion. Multiple new features and overhauls are being made every week. The features and capabilities will continue to expand, so please forgive any short comings and please let us know what needs to be improved upon for your next visit!
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-text-muted/60 text-xs">
              Aetherium & NovAura visual identity, site art and graphics by{' '}
              <span className="text-neon-cyan/80 font-medium">KIMI 2.5</span> — 
              Websites & Argentic Swarm Capabilities Through Articulation
            </p>
            <p className="text-text-muted/40 text-xs mt-1">
              "World class artist delivering character-consistent, theme-consistent style" — Founder
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
