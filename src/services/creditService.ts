import { TIER_CONFIG, builderBotCost, type MembershipTier } from '../config/tierConfig';
import type { AIProvider } from '../stores/aiStore';

const STORAGE_KEY = (userId: string) => `novaura_credits_${userId}`;

interface CreditState {
  dailyCredits: number;
  dailyCreditsReset: string; // ISO date (date only)
  builderBotUsedThisMonth: number;
  monthlyReset: string; // ISO date (month + year key, e.g. "2026-03")
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function load(userId: string): CreditState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    dailyCredits: 0,
    dailyCreditsReset: '',
    builderBotUsedThisMonth: 0,
    monthlyReset: '',
  };
}

function save(userId: string, state: CreditState): void {
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(state));
}

/** Get (and auto-refresh) the current credit state for a user */
function getState(userId: string, tier: MembershipTier): CreditState {
  const config = TIER_CONFIG[tier];
  let state = load(userId);
  const today = todayKey();
  const month = monthKey();

  // Reset daily credits if new day
  if (state.dailyCreditsReset !== today) {
    state = { ...state, dailyCredits: config.creditsPerDay, dailyCreditsReset: today };
  }

  // Reset monthly BuilderBot count if new month
  if (state.monthlyReset !== month) {
    state = { ...state, builderBotUsedThisMonth: 0, monthlyReset: month };
  }

  save(userId, state);
  return state;
}

export interface CreditCheckResult {
  allowed: boolean;
  cost: number;
  reason?: string;
  dailyRemaining: number;
  monthlyRemaining: number;
}

/**
 * Check if a user can run BuilderBot and deduct credits if so.
 * Pass `deduct: false` to just check without spending.
 */
export function checkAndSpendBuilderBot(
  userId: string,
  tier: MembershipTier,
  provider: AIProvider,
  deduct = true
): CreditCheckResult {
  const config = TIER_CONFIG[tier];
  const state = getState(userId, tier);
  const cost = builderBotCost(provider, config.creditMultiplier);
  const monthlyRemaining = config.builderBotPerMonth - state.builderBotUsedThisMonth;
  // Local AI = always free, no limits
  if (cost === 0) {
    return { allowed: true, cost: 0, dailyRemaining: state.dailyCredits, monthlyRemaining };
  }

  // Monthly cap check
  if (state.builderBotUsedThisMonth >= config.builderBotPerMonth) {
    return {
      allowed: false,
      cost,
      reason: `Monthly BuilderBot limit reached (${config.builderBotPerMonth} runs). Resets next month.`,
      dailyRemaining: state.dailyCredits,
      monthlyRemaining: 0,
    };
  }

  // Daily cap check (free tier only)
  if (
    config.builderBotPerDay !== Infinity &&
    state.builderBotUsedThisMonth % config.builderBotPerDay === 0 &&
    state.dailyCredits < cost
  ) {
    return {
      allowed: false,
      cost,
      reason: `Not enough credits (need ${cost}, have ${state.dailyCredits}). Resets tomorrow.`,
      dailyRemaining: state.dailyCredits,
      monthlyRemaining,
    };
  }

  // Insufficient credits
  if (state.dailyCredits < cost) {
    return {
      allowed: false,
      cost,
      reason: `Not enough credits for ${provider} (need ${cost}, have ${state.dailyCredits}).`,
      dailyRemaining: state.dailyCredits,
      monthlyRemaining,
    };
  }

  if (deduct) {
    state.dailyCredits -= cost;
    state.builderBotUsedThisMonth += 1;
    save(userId, state);
  }

  return {
    allowed: true,
    cost,
    dailyRemaining: state.dailyCredits - (deduct ? 0 : cost),
    monthlyRemaining: monthlyRemaining - (deduct ? 1 : 0),
  };
}

/** Get current credit/usage snapshot without spending */
export function getCreditSnapshot(userId: string, tier: MembershipTier) {
  const config = TIER_CONFIG[tier];
  const state = getState(userId, tier);
  return {
    dailyCredits: state.dailyCredits,
    dailyMax: config.creditsPerDay,
    builderBotUsedThisMonth: state.builderBotUsedThisMonth,
    builderBotMonthlyLimit: config.builderBotPerMonth,
    builderBotMonthlyRemaining: config.builderBotPerMonth - state.builderBotUsedThisMonth,
  };
}
