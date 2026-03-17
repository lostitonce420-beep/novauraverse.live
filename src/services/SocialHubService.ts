import { economyService } from './economyService';

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  isTradable: boolean;
  tier: 'founder' | 'rare' | 'common';
}

export interface SocialProfile {
  userId: string;
  badges: UserBadge[];
  nameToken: string; // Special icon next to name
  reputation: number;
}

class SocialHubService {
  private STORAGE_KEY = 'novaura_social_profiles';

  // --- Gambling Bot (58x2 Dice) ---
  async rollDice(userId: string, betAmount: number): Promise<{ roll: number; success: boolean; payout: number }> {
    if (betAmount > 20) throw new Error("Maximum bet is 20 Nova Coins.");
    
    // Check balance via economyService
    const balance = economyService.getSecureBalance(userId);
    if (balance < betAmount) throw new Error("Insufficient Nova Coins.");

    const roll = Math.floor(Math.random() * 100) + 1;
    const success = roll > 58;
    const payout = success ? betAmount * 2 : 0;

    // Resolve transaction
    if (success) {
      economyService.addCoins(userId, betAmount, "Dice Roll Payout (58x2)");
    } else {
      economyService.spendCoins(userId, betAmount, "Dice Roll Bet (58x2)");
    }

    console.log(`[SOCIAL_BOT] User ${userId} rolled ${roll}. Success: ${success}. Payout: ${payout}`);
    return { roll, success, payout };
  }

  // --- Badge & Token System ---
  getProfile(userId: string): SocialProfile {
    const profiles = this.getAllProfiles();
    return profiles[userId] || { userId, badges: [], nameToken: '👤', reputation: 0 };
  }

  assignBadge(userId: string, badge: UserBadge) {
    const profiles = this.getAllProfiles();
    const profile = this.getProfile(userId);
    
    if (!profile.badges.find(b => b.id === badge.id)) {
      profile.badges.push(badge);
      profiles[userId] = profile;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    }
  }

  updateNameToken(userId: string, token: string) {
    const profiles = this.getAllProfiles();
    const profile = this.getProfile(userId);
    profile.nameToken = token;
    profiles[userId] = profile;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
  }

  private getAllProfiles(): Record<string, SocialProfile> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }
}

export const socialHubService = new SocialHubService();
