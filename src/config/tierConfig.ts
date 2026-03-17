import type { AIProvider } from '../stores/aiStore';

// ── Membership Tiers ──────────────────────────────────────────────────────────
export type MembershipTier = 'free' | 'creator' | 'studio' | 'catalyst';

export interface TierDefinition {
  id: MembershipTier;
  name: string;
  price: number; // USD/month
  creditsPerDay: number;
  builderBotPerMonth: number;
  builderBotPerDay: number; // Infinity = uncapped
  canBringOwnKeys: boolean;
  localAIUnlimited: boolean;
  webOS: false | 'limited' | true;
  creditMultiplier: number; // 1.0 = full price, 0.5 = half
  priorityInference: boolean;
  liveSupport: boolean;
  catalystBadge: boolean;
  color: string;
  accentColor: string;
}

export const TIER_CONFIG: Record<MembershipTier, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    creditsPerDay: 50,
    builderBotPerMonth: 20,
    builderBotPerDay: 5,
    canBringOwnKeys: false,
    localAIUnlimited: true,
    webOS: false,
    creditMultiplier: 1.0,
    priorityInference: false,
    liveSupport: false,
    catalystBadge: false,
    color: 'text-white/60',
    accentColor: '#6b7280',
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 9,
    creditsPerDay: 200,
    builderBotPerMonth: 100,
    builderBotPerDay: Infinity,
    canBringOwnKeys: true,
    localAIUnlimited: true,
    webOS: 'limited',
    creditMultiplier: 1.0,
    priorityInference: false,
    liveSupport: false,
    catalystBadge: false,
    color: 'text-neon-cyan',
    accentColor: '#00F0FF',
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 17,
    creditsPerDay: 600,
    builderBotPerMonth: 300,
    builderBotPerDay: Infinity,
    canBringOwnKeys: true,
    localAIUnlimited: true,
    webOS: true,
    creditMultiplier: 1.0,
    priorityInference: false,
    liveSupport: false,
    catalystBadge: false,
    color: 'text-neon-violet',
    accentColor: '#8B5CF6',
  },
  catalyst: {
    id: 'catalyst',
    name: 'Catalyst',
    price: 50,
    creditsPerDay: 3000,
    builderBotPerMonth: 1500,
    builderBotPerDay: Infinity,
    canBringOwnKeys: true,
    localAIUnlimited: true,
    webOS: true,
    creditMultiplier: 0.5,
    priorityInference: true,
    liveSupport: true,
    catalystBadge: true,
    color: 'text-yellow-400',
    accentColor: '#FBBF24',
  },
};

// ── Base credit costs (before multipliers) ────────────────────────────────────
export const BASE_COSTS = {
  builderBotRun: 10,
  imageGen: 3,
  imageEdit: 1,
  videoGenPer4s: 100,
};

// ── Model credit multipliers ──────────────────────────────────────────────────
export const MODEL_MULTIPLIER: Partial<Record<AIProvider | string, number>> = {
  gemini: 1,
  openai: 2,
  claude: 3,
  kimi: 3,
  ollama: 0,    // local = free
  lmstudio: 0,  // local = free
};

/** Compute the actual credit cost for a BuilderBot run */
export function builderBotCost(
  provider: AIProvider,
  tierMultiplier = 1.0
): number {
  const modelMult = MODEL_MULTIPLIER[provider] ?? 1;
  if (modelMult === 0) return 0; // local AI is always free
  return Math.ceil(BASE_COSTS.builderBotRun * modelMult * tierMultiplier);
}

/** Human-readable tier label for a given provider cost */
export function providerCostLabel(provider: AIProvider): string {
  const mult = MODEL_MULTIPLIER[provider];
  if (mult === 0) return 'FREE (local)';
  if (mult === 1) return '10 credits';
  if (mult === 2) return '20 credits';
  return '30 credits';
}
