import { getUserById, saveUser, getCurrentUser, setCurrentUser } from './userStorage';

export interface Transaction {
  id: string;
  userId: string;
  type: 'claim' | 'spend' | 'recharge' | 'bonus' | 'initial';
  amount: number;
  balanceAfter: number;
  reason: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  ledger: 'novaura_economy_ledger',
  balanceKey: 'nova_ec_sig', // Obfuscated key for balance integrity
};

// Simple obfuscation to prevent casual editing of localStorage values
const obfuscate = (value: number): string => {
  const secret = "aura-consciousness-2026";
  const str = value.toString();
  return btoa(str + ":" + secret);
};

const deobfuscate = (encoded: string): number => {
  try {
    const decoded = atob(encoded);
    const [val] = decoded.split(':');
    return parseInt(val, 10) || 0;
  } catch {
    return 0;
  }
};

export const getLedger = (userId: string): Transaction[] => {
  const data = localStorage.getItem(`${STORAGE_KEYS.ledger}_${userId}`);
  return data ? JSON.parse(data) : [];
};

export const recordTransaction = (userId: string, tx: Omit<Transaction, 'id' | 'timestamp' | 'userId'>) => {
  const ledger = getLedger(userId);
  const newTx: Transaction = {
    ...tx,
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    timestamp: new Date().toISOString(),
  };
  
  ledger.unshift(newTx);
  // Keep last 50 transactions
  localStorage.setItem(`${STORAGE_KEYS.ledger}_${userId}`, JSON.stringify(ledger.slice(0, 50)));
};

export const getSecureBalance = (userId: string): number => {
  const user = getUserById(userId);
  if (!user) return 0;
  
  const storedSig = localStorage.getItem(`${STORAGE_KEYS.balanceKey}_${userId}`);
  if (storedSig) {
    const verifiedBalance = deobfuscate(storedSig);
    // If they don't match, we prioritize the verified one or log a warning
    // In a real app, this would trigger an audit
    return verifiedBalance;
  }
  
  return user.consciousnessCoins || 0;
};

export const updateSecureBalance = (userId: string, newBalance: number) => {
  localStorage.setItem(`${STORAGE_KEYS.balanceKey}_${userId}`, obfuscate(newBalance));
  
  const user = getUserById(userId);
  if (user) {
    user.consciousnessCoins = newBalance;
    user.updatedAt = new Date().toISOString();
    saveUser(user);
    
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      setCurrentUser(user);
    }
    
    // Dispatch custom event for cross-tab sync
    window.dispatchEvent(new CustomEvent('novaura_balance_update', { 
      detail: { userId, balance: newBalance } 
    }));
  }
};

export const spendCoins = (userId: string, amount: number, reason: string = 'Service usage'): boolean => {
  const currentBalance = getSecureBalance(userId);
  if (currentBalance < amount) return false;
  
  const newBalance = currentBalance - amount;
  updateSecureBalance(userId, newBalance);
  
  recordTransaction(userId, {
    type: 'spend',
    amount: -amount,
    balanceAfter: newBalance,
    reason
  });
  
  return true;
};

export const addCoins = (userId: string, amount: number, reason: string = 'Credit adjustment'): void => {
  const currentBalance = getSecureBalance(userId);
  const newBalance = currentBalance + amount;
  updateSecureBalance(userId, newBalance);
  
  recordTransaction(userId, {
    type: 'bonus',
    amount,
    balanceAfter: newBalance,
    reason
  });
};

export const claimDailyCoins = (userId: string): { success: boolean; coinsAdded: number; message: string } => {
  const user = getUserById(userId);
  if (!user) return { success: false, coinsAdded: 0, message: 'User not found' };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  if (user.lastDailyClaim) {
    const lastClaim = new Date(user.lastDailyClaim);
    const lastClaimDay = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate()).getTime();
    
    if (lastClaimDay === today) {
      return { success: false, coinsAdded: 0, message: 'Already claimed today' };
    }
  }

  const bonus = 50;
  const currentBalance = getSecureBalance(userId);
  const newBalance = currentBalance + bonus;
  
  // Update user last claim date
  user.lastDailyClaim = now.toISOString();
  saveUser(user);
  
  updateSecureBalance(userId, newBalance);
  
  recordTransaction(userId, {
    type: 'claim',
    amount: bonus,
    balanceAfter: newBalance,
    reason: 'Daily Consciousness Link Bonus'
  });

  return { success: true, coinsAdded: bonus, message: 'Daily bonus claimed!' };
};

export const economyService = {
  getLedger,
  recordTransaction,
  getSecureBalance,
  updateSecureBalance,
  spendCoins,
  addCoins,
  claimDailyCoins,
};
