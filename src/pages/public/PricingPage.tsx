import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check, X, Zap, Crown, Star,
  Bot, Image, Video, Code2, Globe, Cpu, Headphones, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { TIER_CONFIG, type MembershipTier } from '@/config/tierConfig';

// ── Catalyst badge SVG (sword through Old English C) ─────────────────────────
const CatalystBadge: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    {/* Old English C */}
    <text x="4" y="21" fontFamily="serif" fontSize="20" fontWeight="900" fill="#FBBF24" opacity="0.9">
      ©
    </text>
    {/* Sword overlay — blade */}
    <line x1="14" y1="2" x2="14" y2="22" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
    {/* Guard */}
    <line x1="10" y1="8" x2="18" y2="8" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
    {/* Pommel */}
    <circle cx="14" cy="24" r="1.5" fill="#FBBF24" />
  </svg>
);

// ── Tier icon map ─────────────────────────────────────────────────────────────
const TIER_ICONS: Record<MembershipTier, React.ReactNode> = {
  free:     <Star className="w-5 h-5" />,
  creator:  <Zap className="w-5 h-5" />,
  studio:   <Crown className="w-5 h-5" />,
  catalyst: <CatalystBadge size={22} />,
};

// ── Feature row helper ────────────────────────────────────────────────────────
interface FeatureRow {
  label: string;
  icon?: React.ReactNode;
  values: Record<MembershipTier, string | boolean>;
}

const FEATURES: FeatureRow[] = [
  {
    label: 'Credits / day',
    icon: <Zap className="w-3.5 h-3.5" />,
    values: { free: '50', creator: '200', studio: '600', catalyst: '3,000' },
  },
  {
    label: 'BuilderBot runs / month',
    icon: <Bot className="w-3.5 h-3.5" />,
    values: { free: '20', creator: '100', studio: '300', catalyst: '1,500' },
  },
  {
    label: 'Daily run cap',
    icon: <Cpu className="w-3.5 h-3.5" />,
    values: { free: '5 / day', creator: 'Uncapped', studio: 'Uncapped', catalyst: 'Uncapped' },
  },
  {
    label: 'Bring your own API keys',
    icon: <Key className="w-3.5 h-3.5" />,
    values: { free: false, creator: true, studio: true, catalyst: true },
  },
  {
    label: 'Local AI (Ollama / LM Studio)',
    icon: <Cpu className="w-3.5 h-3.5" />,
    values: { free: 'Unlimited', creator: 'Unlimited', studio: 'Unlimited', catalyst: 'Unlimited' },
  },
  {
    label: 'Web OS access',
    icon: <Globe className="w-3.5 h-3.5" />,
    values: { free: false, creator: 'Limited', studio: 'Full', catalyst: 'Full' },
  },
  {
    label: 'Image generation',
    icon: <Image className="w-3.5 h-3.5" />,
    values: { free: '3 cr each', creator: '3 cr each', studio: '3 cr each', catalyst: '1.5 cr each' },
  },
  {
    label: 'Video generation',
    icon: <Video className="w-3.5 h-3.5" />,
    values: { free: '100 cr / 4s', creator: '100 cr / 4s', studio: '100 cr / 4s', catalyst: '50 cr / 4s' },
  },
  {
    label: 'Image editing',
    icon: <Image className="w-3.5 h-3.5" />,
    values: { free: '1 cr / edit', creator: '1 cr / edit', studio: '1 cr / edit', catalyst: '0.5 cr / edit' },
  },
  {
    label: 'Asset marketplace',
    icon: <Code2 className="w-3.5 h-3.5" />,
    values: { free: true, creator: true, studio: true, catalyst: true },
  },
  {
    label: 'Publish & sell assets',
    icon: <Code2 className="w-3.5 h-3.5" />,
    values: { free: true, creator: true, studio: true, catalyst: true },
  },
  {
    label: 'Priority inference',
    icon: <Zap className="w-3.5 h-3.5" />,
    values: { free: false, creator: false, studio: false, catalyst: true },
  },
  {
    label: 'Support',
    icon: <Headphones className="w-3.5 h-3.5" />,
    values: { free: 'Community', creator: 'Community', studio: 'Priority queue', catalyst: 'Live direct' },
  },
  {
    label: 'Free company assets',
    icon: <Star className="w-3.5 h-3.5" />,
    values: { free: false, creator: false, studio: '2 assets', catalyst: '3 assets' },
  },
  {
    label: 'Aura Nova template discount',
    icon: <Code2 className="w-3.5 h-3.5" />,
    values: { free: false, creator: false, studio: 'Member discount', catalyst: '20% off' },
  },
  {
    label: 'Beta access & early releases',
    icon: <Zap className="w-3.5 h-3.5" />,
    values: { free: false, creator: false, studio: false, catalyst: true },
  },
  {
    label: 'Catalyst ⚔ badge',
    icon: <CatalystBadge size={14} />,
    values: { free: false, creator: false, studio: false, catalyst: true },
  },
];

const TIERS: MembershipTier[] = ['free', 'creator', 'studio', 'catalyst'];

const ACCENT: Record<MembershipTier, string> = {
  free:     'border-white/10',
  creator:  'border-neon-cyan/40',
  studio:   'border-neon-violet/40',
  catalyst: 'border-yellow-400/40',
};

const GLOW: Record<MembershipTier, string> = {
  free:     '',
  creator:  'shadow-[0_0_30px_rgba(0,240,255,0.08)]',
  studio:   'shadow-[0_0_30px_rgba(139,92,246,0.1)]',
  catalyst: 'shadow-[0_0_40px_rgba(251,191,36,0.12)]',
};

const BTN_CLASS: Record<MembershipTier, string> = {
  free:     'bg-white/5 text-white hover:bg-white/10',
  creator:  'bg-neon-cyan text-void font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]',
  studio:   'bg-neon-violet text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
  catalyst: 'bg-yellow-400 text-black font-bold hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]',
};

function renderValue(v: string | boolean) {
  if (v === true)  return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (v === false) return <X className="w-4 h-4 text-white/20 mx-auto" />;
  return <span className="text-[11px] text-text-secondary">{v}</span>;
}

// ── Model credit cost callout ─────────────────────────────────────────────────
const ModelCostCallout: React.FC = () => (
  <div className="mt-16 max-w-3xl mx-auto">
    <h3 className="text-center text-sm font-bold uppercase tracking-widest text-text-muted mb-2">
      AI Model Credit Cost
    </h3>
    <p className="text-center text-[11px] text-text-muted mb-6">
      Claude model quality scales with your tier automatically.
    </p>
    {/* Gemini tier row */}
    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70 mb-2">Gemini</p>
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: 'Gemini 3.0 Flash', cost: '10 cr', color: 'border-blue-400/20 text-blue-300',  note: 'Free · Creator' },
        { label: 'Gemini 3.0 Pro',   cost: '10 cr', color: 'border-blue-400/40 text-blue-400',  note: 'Studio' },
        { label: 'Gemini 3.1 Pro',   cost: '5 cr',  color: 'border-yellow-400/30 text-yellow-400', note: 'Catalyst (½ price)' },
      ].map((m) => (
        <div key={m.label} className={`rounded-xl border p-4 bg-void-light text-center ${m.color}`}>
          <div className="text-[10px] font-bold mb-1">{m.label}</div>
          <div className={`text-lg font-black font-mono`}>{m.cost}</div>
          <div className="text-[9px] text-text-muted mt-1">{m.note}</div>
        </div>
      ))}
    </div>

    {/* Claude tier row */}
    <p className="text-[10px] font-bold uppercase tracking-widest text-neon-violet/70 mb-2">Claude (own key required · Creator+)</p>
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: 'Haiku 4.5',  cost: '30 cr', color: 'border-neon-cyan/30 text-neon-cyan',     note: 'Creator' },
        { label: 'Sonnet 4.6', cost: '30 cr', color: 'border-neon-violet/30 text-neon-violet', note: 'Studio' },
        { label: 'Opus 4.6',   cost: '15 cr', color: 'border-yellow-400/30 text-yellow-400',   note: 'Catalyst (½ price)' },
      ].map((m) => (
        <div key={m.label} className={`rounded-xl border p-4 bg-void-light text-center ${m.color}`}>
          <div className="text-[10px] font-bold mb-1">{m.label}</div>
          <div className="text-lg font-black font-mono">{m.cost}</div>
          <div className="text-[9px] text-text-muted mt-1">{m.note}</div>
        </div>
      ))}
    </div>

    {/* Other models */}
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'OpenAI GPT-4o', cost: '20 cr', color: 'border-emerald-400/30 text-emerald-400', note: 'Creator+ · own key' },
        { label: 'Local AI (Ollama / LM Studio)', cost: 'FREE', color: 'border-green-400/20 text-green-400', note: 'Any tier · unlimited' },
      ].map((m) => (
        <div key={m.label} className={`rounded-xl border p-4 bg-void-light text-center ${m.color}`}>
          <div className="text-[10px] font-bold mb-1">{m.label}</div>
          <div className="text-lg font-black font-mono">{m.cost}</div>
          <div className="text-[9px] text-text-muted mt-1">{m.note}</div>
        </div>
      ))}
    </div>
    <p className="text-center text-[10px] text-text-muted mt-4">
      Local AI (Ollama / LM Studio) is always <span className="text-green-400 font-bold">FREE</span> — unlimited pipeline runs on your own hardware.
    </p>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const currentTier = user?.membershipTier ?? 'free';
  const [_hoveredTier, setHoveredTier] = useState<MembershipTier | null>(null);

  const handleSelect = (tier: MembershipTier) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    if (tier === 'free') return;
    // TODO: integrate Stripe checkout
    alert(`Stripe checkout for ${TIER_CONFIG[tier].name} ($${TIER_CONFIG[tier].price}/mo) coming soon.`);
  };

  return (
    <div className="min-h-screen bg-void text-white">
      {/* Hero */}
      <div className="relative pt-24 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-cyan/5 blur-3xl rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan text-[10px] uppercase tracking-widest mb-4">
            NovAura Membership
          </Badge>
          <h1 className="text-5xl font-heading font-black tracking-tight mb-4">
            Build without limits.
            <br />
            <span className="text-neon-cyan">Pay for what you use.</span>
          </h1>
          <p className="text-text-muted max-w-xl mx-auto text-sm leading-relaxed">
            Every tier includes the marketplace, asset publishing, and local AI inference.
            Upgrade for BuilderBot power, system AI keys, and the full Web OS.
          </p>
        </motion.div>
      </div>

      {/* Tier Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {TIERS.map((tier, i) => {
            const config = TIER_CONFIG[tier];
            const isCurrent = currentTier === tier;
            const isPopular = tier === 'studio';

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onHoverStart={() => setHoveredTier(tier)}
                onHoverEnd={() => setHoveredTier(null)}
                className={`relative rounded-2xl border bg-void-light p-6 flex flex-col transition-all duration-300 ${ACCENT[tier]} ${GLOW[tier]}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-neon-violet text-white text-[9px] uppercase tracking-widest border-0 px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500/20 text-green-400 text-[9px] uppercase tracking-widest border border-green-500/30 px-2">
                      Current
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`flex items-center gap-2 mb-3 ${config.color}`}>
                    {TIER_ICONS[tier]}
                    <span className="font-bold text-sm uppercase tracking-widest">{config.name}</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{config.price === 0 ? 'Free' : `$${config.price}`}</span>
                    {config.price > 0 && <span className="text-text-muted text-sm mb-1">/month</span>}
                  </div>
                  {config.price === 0 && (
                    <p className="text-[10px] text-text-muted mt-1">Forever free, no card needed</p>
                  )}
                </div>

                {/* Key stats */}
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Credits / day</span>
                    <span className="font-bold">{config.creditsPerDay.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">BuilderBot / month</span>
                    <span className="font-bold">{config.builderBotPerMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Own API keys</span>
                    {config.canBringOwnKeys
                      ? <Check className="w-3.5 h-3.5 text-green-400" />
                      : <X className="w-3.5 h-3.5 text-white/20" />}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Web OS</span>
                    <span className="font-bold">
                      {config.webOS === false ? '—' : config.webOS === 'limited' ? 'Limited' : 'Full'}
                    </span>
                  </div>
                  {(tier === 'studio' || tier === 'catalyst') && (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Own key = free inference</span>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Free company assets</span>
                        <span className="font-bold" style={{ color: tier === 'studio' ? '#8B5CF6' : '#FBBF24' }}>
                          {tier === 'studio' ? '2 assets' : '3 assets'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Template discount</span>
                        <span className="font-bold" style={{ color: tier === 'studio' ? '#8B5CF6' : '#FBBF24' }}>
                          {tier === 'studio' ? 'Member pricing' : '20% off'}
                        </span>
                      </div>
                    </>
                  )}
                  {tier === 'catalyst' && (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Credit cost</span>
                        <span className="font-bold text-yellow-400">½ price</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Beta & early access</span>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Live support</span>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Catalyst ⚔ badge</span>
                        <CatalystBadge size={16} />
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleSelect(tier)}
                  disabled={isCurrent}
                  className={`w-full h-10 rounded-xl transition-all duration-200 ${BTN_CLASS[tier]} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isCurrent ? 'Current Plan' : tier === 'free' ? 'Get Started' : `Upgrade to ${config.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Full comparison table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-text-muted mb-8">
            Full Feature Comparison
          </h2>
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-5 bg-void-lighter border-b border-white/5">
              <div className="p-4 text-[10px] text-text-muted uppercase tracking-widest">Feature</div>
              {TIERS.map((tier) => (
                <div key={tier} className={`p-4 text-center text-[10px] font-bold uppercase tracking-widest ${TIER_CONFIG[tier].color}`}>
                  {TIER_CONFIG[tier].name}
                </div>
              ))}
            </div>

            {FEATURES.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-5 border-b border-white/5 ${i % 2 === 0 ? 'bg-void' : 'bg-void-light'} hover:bg-void-lighter transition-colors`}
              >
                <div className="p-3 flex items-center gap-2 text-[11px] text-text-muted">
                  {row.icon && <span className="opacity-50">{row.icon}</span>}
                  {row.label}
                </div>
                {TIERS.map((tier) => (
                  <div key={tier} className="p-3 flex items-center justify-center">
                    {renderValue(row.values[tier])}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Model cost callout */}
        <ModelCostCallout />

        {/* Credit Top-Up Packs */}
        <motion.div
          className="mt-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-text-muted mb-2">
            Need more credits?
          </h3>
          <p className="text-center text-[11px] text-text-muted mb-6">
            One-time top-ups. Credits never expire. Stack on any tier.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { credits: 200,  price: 5,  label: 'Starter',  bonus: null,    color: 'border-white/10 hover:border-white/20' },
              { credits: 450,  price: 10, label: 'Builder',  bonus: '+50',   color: 'border-neon-cyan/30 hover:border-neon-cyan/50' },
              { credits: 1000, price: 20, label: 'Genesis',  bonus: '+200',  color: 'border-neon-violet/30 hover:border-neon-violet/50' },
            ].map((pack) => (
              <div
                key={pack.price}
                className={`relative rounded-xl border bg-void-light p-5 text-center transition-all group cursor-pointer hover:bg-void-lighter ${pack.color}`}
                onClick={() => alert(`Stripe credit pack checkout coming soon.`)}
              >
                {pack.bonus && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-neon-cyan text-void text-[8px] font-black border-0 px-2 py-0">
                      {pack.bonus} BONUS
                    </Badge>
                  </div>
                )}
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">{pack.label}</div>
                <div className="text-3xl font-black text-white mb-1">
                  {pack.credits.toLocaleString()}
                  <span className="text-sm text-text-muted font-normal ml-1">cr</span>
                </div>
                <div className="text-[10px] text-text-muted mb-3">
                  ${(pack.price / pack.credits * 10).toFixed(1)}¢ per credit
                </div>
                <div className="text-xl font-black text-neon-cyan">${pack.price}</div>
                <div className="text-[9px] text-text-muted mt-1">one-time</div>
              </div>
            ))}
          </div>
          <p className="text-center text-[9px] text-text-muted/50 mt-4 font-mono">
            Catalyst members pay half credits on all actions — your packs go twice as far.
          </p>
        </motion.div>

        {/* FAQ / note */}
        <motion.p
          className="text-center text-[11px] text-text-muted mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          All plans include transparent royalties, ethical licensing, and the full NovAura creator ecosystem.
          <br />
          Cancel anytime. No hidden fees.{' '}
          <button
            onClick={() => navigate('/api-keys')}
            className="underline underline-offset-2 hover:text-white/70 transition-colors"
          >
            Learn how to use your own API key for free inference →
          </button>
        </motion.p>
      </div>
    </div>
  );
};

export default PricingPage;
