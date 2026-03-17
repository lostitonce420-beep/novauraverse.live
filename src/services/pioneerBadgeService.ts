import type {
  PioneerBadge,
  PioneerBadgeTier,
  SearchTermRecord,
  BadgeSearchResult,
  BadgeTransfer,
} from '@/types';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  badges: 'novaura_pioneer_badges',
  terms: 'novaura_search_terms',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeTerm = (raw: string): string => raw.trim().toLowerCase();

const id = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// ─── Persistence ──────────────────────────────────────────────────────────────

export const getAllBadges = (): PioneerBadge[] => {
  const raw = localStorage.getItem(KEYS.badges);
  return raw ? (JSON.parse(raw) as PioneerBadge[]) : [];
};

const saveBadges = (badges: PioneerBadge[]): void => {
  localStorage.setItem(KEYS.badges, JSON.stringify(badges));
};

export const getAllTermRecords = (): SearchTermRecord[] => {
  const raw = localStorage.getItem(KEYS.terms);
  return raw ? (JSON.parse(raw) as SearchTermRecord[]) : [];
};

const saveTermRecords = (records: SearchTermRecord[]): void => {
  localStorage.setItem(KEYS.terms, JSON.stringify(records));
};

export const getTermRecord = (rawTerm: string): SearchTermRecord | null => {
  const term = normalizeTerm(rawTerm);
  return getAllTermRecords().find((r) => r.term === term) ?? null;
};

// ─── Aura congratulation messages ─────────────────────────────────────────────

const auraMessages: Record<PioneerBadgeTier, (term: string, pos?: number) => string> = {
  pioneer_1: (term) =>
    `You are the very first soul to search for "${term}" in the Novaura gallery. The universe noticed. You've been awarded the Pioneer #1 shield — a permanent mark of discovery.`,
  pioneer_2: (term) =>
    `You arrived second to "${term}" — but second is still legend. Your Pioneer #2 shield is yours to keep, trade, or treasure.`,
  pioneer_3: (term) =>
    `Third to discover "${term}". The founding trio is now complete. Your Pioneer #3 shield is sealed into history.`,
  milestone_100: (term) =>
    `"${term}" just hit its 100th search. You were there. The Milestone 100 shield for this term has been awarded to you.`,
  milestone_500: (term) =>
    `500 searches for "${term}". This term is ascending. Your Milestone 500 shield marks you as a witness to its rise.`,
  milestone_1000: (term) =>
    `"${term}" has reached 1,000 searches. This is the final badge ever issued for this term — and it belongs to you. No more will ever be minted.`,
};

// ─── Core: record a search and award any earned badges ────────────────────────

/**
 * Called every time a user performs a gallery search.
 * Returns any badges awarded + updated term record.
 */
export const recordSearch = (rawTerm: string, userId: string): BadgeSearchResult => {
  const term = normalizeTerm(rawTerm);
  const displayTerm = rawTerm.trim();

  const records = getAllTermRecords();
  const badges = getAllBadges();

  let record = records.find((r) => r.term === term);
  const isNewTerm = !record;

  if (!record) {
    record = {
      term,
      displayTerm,
      searchCount: 0,
      firstSearchedAt: new Date().toISOString(),
      pioneers: [],
      milestonesAwarded: [],
    };
    records.push(record);
  }

  record.searchCount += 1;
  const newBadges: PioneerBadge[] = [];

  const award = (tier: PioneerBadgeTier): PioneerBadge => {
    const badge: PioneerBadge = {
      id: id('badge'),
      tier,
      searchTerm: term,
      searchTermDisplay: record!.displayTerm,
      ownerId: userId,
      originalEarnerId: userId,
      earnedAt: new Date().toISOString(),
      transferHistory: [],
      isListed: false,
    };
    badges.push(badge);
    newBadges.push(badge);
    return badge;
  };

  // ── Pioneer slots (only first 3 unique users per term) ──────────────────────
  const pioneerPositions = record.pioneers.map((p) => p.position);
  const alreadyPioneer = record.pioneers.some((p) => p.userId === userId);

  if (!alreadyPioneer) {
    if (!pioneerPositions.includes(1)) {
      record.pioneers.push({ userId, position: 1, searchedAt: new Date().toISOString() });
      award('pioneer_1');
    } else if (!pioneerPositions.includes(2)) {
      record.pioneers.push({ userId, position: 2, searchedAt: new Date().toISOString() });
      award('pioneer_2');
    } else if (!pioneerPositions.includes(3)) {
      record.pioneers.push({ userId, position: 3, searchedAt: new Date().toISOString() });
      award('pioneer_3');
    }
  }

  // ── Milestone slots ─────────────────────────────────────────────────────────
  const milestones = [100, 500, 1000] as const;
  for (const threshold of milestones) {
    if (
      record.searchCount >= threshold &&
      !record.milestonesAwarded.includes(threshold)
    ) {
      record.milestonesAwarded.push(threshold);
      award(`milestone_${threshold}` as PioneerBadgeTier);
    }
  }

  saveTermRecords(records);
  saveBadges(badges);

  // Build Aura message for the first awarded badge (most significant)
  let auraMessage: string | undefined;
  if (newBadges.length > 0) {
    const topBadge = newBadges[0];
    const pos = topBadge.tier.startsWith('pioneer_')
      ? Number(topBadge.tier.split('_')[1])
      : undefined;
    auraMessage = auraMessages[topBadge.tier](record.displayTerm, pos);
  }

  return { newBadges, isNewTerm, termRecord: record, auraMessage };
};

// ─── Badge queries ─────────────────────────────────────────────────────────────

export const getUserBadges = (userId: string): PioneerBadge[] =>
  getAllBadges().filter((b) => b.ownerId === userId);

export const getBadgesForTerm = (rawTerm: string): PioneerBadge[] => {
  const term = normalizeTerm(rawTerm);
  return getAllBadges().filter((b) => b.searchTerm === term);
};

export const getBadgeById = (badgeId: string): PioneerBadge | null =>
  getAllBadges().find((b) => b.id === badgeId) ?? null;

export const getListedBadges = (): PioneerBadge[] =>
  getAllBadges().filter((b) => b.isListed);

// ─── Trading ───────────────────────────────────────────────────────────────────

/** List a badge for trade at a given Aura Coin price. */
export const listBadgeForTrade = (
  badgeId: string,
  ownerId: string,
  price: number
): boolean => {
  const badges = getAllBadges();
  const badge = badges.find((b) => b.id === badgeId);
  if (!badge || badge.ownerId !== ownerId) return false;
  badge.isListed = true;
  badge.listPrice = price;
  saveBadges(badges);
  return true;
};

/** Remove a badge from the trade listing. */
export const unlistBadge = (badgeId: string, ownerId: string): boolean => {
  const badges = getAllBadges();
  const badge = badges.find((b) => b.id === badgeId);
  if (!badge || badge.ownerId !== ownerId) return false;
  badge.isListed = false;
  badge.listPrice = undefined;
  saveBadges(badges);
  return true;
};

/** Transfer ownership of a badge (trade or gift). */
export const transferBadge = (
  badgeId: string,
  fromUserId: string,
  toUserId: string,
  price?: number
): boolean => {
  const badges = getAllBadges();
  const badge = badges.find((b) => b.id === badgeId);
  if (!badge || badge.ownerId !== fromUserId) return false;

  const transfer: BadgeTransfer = {
    fromUserId,
    toUserId,
    price,
    transferredAt: new Date().toISOString(),
  };

  badge.transferHistory.push(transfer);
  badge.ownerId = toUserId;
  badge.isListed = false;
  badge.listPrice = undefined;

  saveBadges(badges);
  return true;
};

// ─── Stats & display helpers ───────────────────────────────────────────────────

/** Human-readable label for each badge tier. */
export const BADGE_LABELS: Record<PioneerBadgeTier, string> = {
  pioneer_1: '#1 Pioneer',
  pioneer_2: '#2 Pioneer',
  pioneer_3: '#3 Pioneer',
  milestone_100: '100 Searches',
  milestone_500: '500 Searches',
  milestone_1000: '1,000 Searches',
};

/** Color scheme for rendering badge shields. */
export const BADGE_COLORS: Record<PioneerBadgeTier, { bg: string; border: string; text: string }> = {
  pioneer_1: { bg: 'bg-yellow-500/20', border: 'border-yellow-400', text: 'text-yellow-300' },
  pioneer_2: { bg: 'bg-slate-400/20', border: 'border-slate-300', text: 'text-slate-200' },
  pioneer_3: { bg: 'bg-amber-700/20', border: 'border-amber-600', text: 'text-amber-400' },
  milestone_100: { bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-300' },
  milestone_500: { bg: 'bg-violet-500/20', border: 'border-violet-400', text: 'text-violet-300' },
  milestone_1000: { bg: 'bg-rose-500/20', border: 'border-rose-400', text: 'text-rose-300' },
};

/** Whether a term has exhausted all possible badges (post-1000 milestone). */
export const isTermFullyMinted = (rawTerm: string): boolean => {
  const record = getTermRecord(rawTerm);
  return record?.milestonesAwarded.includes(1000) ?? false;
};

/** Total badges ever possible per term: 3 pioneers + 3 milestones = 6. */
export const MAX_BADGES_PER_TERM = 6;
