import type { User } from '@/types';

// localStorage keys
const STORAGE_KEYS = {
  users: 'novaura_users',
  currentUser: 'novaura_current_user',
};

// Initialize storage
export const initializeUserStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const genesisUser: User = {
      id: 'novaura-genesis',
      email: 'labs@novaura.tech',
      username: 'NovAura Staff',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NovAura',
      bio: 'Official NovAura Labs account for system updates and technical support.',
      preferences: {
        showNsfw: false,
        ageVerified: true,
        emailNotifications: true,
        marketingEmails: false,
        publicProfile: true,
        showActivity: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      consciousnessCoins: 0, // Staff account starts at neutral
      isSubscriber: true,
      rank: 'Core Staff',
      badges: ['dev_core', 'crown'],
    };
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([genesisUser]));
  }
};

// Get all users
export const getAllUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.users);
  return data ? JSON.parse(data) : [];
};

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.id === id);
};

// Get user by username
export const getUserByUsername = (username: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
};

// Save user (create or update)
export const saveUser = (user: User) => {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
};

// Check if any admin exists
export const hasAdmin = (): boolean => {
  const users = getAllUsers();
  return users.some(u => u.role === 'admin');
};

// Default preferences
const defaultPreferences = {
  showNsfw: false,
  ageVerified: false,
  emailNotifications: true,
  marketingEmails: false,
  publicProfile: true,
  showActivity: true,
};

// Create first admin (owner setup)
export const createFirstAdmin = (email: string, username: string = 'The Catalyst'): User => {
  const adminUser: User = {
    id: 'owner_dillan',
    email: email.toLowerCase(),
    username,
    role: 'admin',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: 'Founder of NovAura Market. Game developer, artist, and creative technologist.',
    location: 'United States',
    preferences: defaultPreferences,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consciousnessCoins: 10000,
    isSubscriber: true,
    rank: 'Legend',
    badges: ['green_phat', 'crown', 'dev_core'],
  };
  
  saveUser(adminUser);
  return adminUser;
};

// Create regular user
export const createUser = (email: string, username: string, role: 'buyer' | 'creator' = 'buyer'): User => {
  const newUser: User = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    username,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    preferences: { ...defaultPreferences },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consciousnessCoins: 50,
    isSubscriber: false,
    rank: role === 'creator' ? 'Contributor' : 'Member',
    badges: role === 'creator' ? ['creator_pro'] : [],
  };
  
  saveUser(newUser);
  
  // Add owner as contact for new user
  addOwnerAsContact(newUser.id);
  
  return newUser;
};


// Update user preferences
export const updateUserPreferences = (userId: string, preferences: Partial<User['preferences']>): void => {
  const user = getUserById(userId);
  if (user) {
    user.preferences = { ...user.preferences, ...preferences };
    user.updatedAt = new Date().toISOString();
    saveUser(user);
  }
};

// Update user profile
export const updateUserProfile = (userId: string, profile: Partial<Omit<User, 'id' | 'email' | 'role' | 'preferences'>>): void => {
  const user = getUserById(userId);
  if (user) {
    Object.assign(user, profile);
    user.updatedAt = new Date().toISOString();
    saveUser(user);
  }
};

// Add owner as contact for new user
export const addOwnerAsContact = (newUserId: string): void => {
  // Lazy import to avoid circular dependency
  import('./messageService').then(({ sendMessage }) => {
    // Send welcome message from owner
    sendMessage(
      'owner_dillan',
      newUserId,
      `Welcome to NovAura Market! 🎉\n\nI'm Dillan, the founder of this platform. I'm excited to have you join our community of creators and developers.\n\nIf you have any questions, need help getting started, or just want to chat about game development, feel free to reach out anytime.\n\nHappy creating!\n- Dillan`,
      'text'
    );
  });
};

// Verify age for NSFW content
export const verifyUserAge = (userId: string): void => {
  const user = getUserById(userId);
  if (user) {
    user.preferences.ageVerified = true;
    user.preferences.ageVerifiedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    saveUser(user);
  }
};

// Update user role
export const updateUserRole = (userId: string, newRole: 'buyer' | 'creator' | 'moderator' | 'admin') => {
  const user = getUserById(userId);
  if (user) {
    user.role = newRole;
    user.updatedAt = new Date().toISOString();
    saveUser(user);
  }
};

// Delete user
export const deleteUser = (userId: string) => {
  const users = getAllUsers();
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(filtered));
};

// Set current session user
export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
};

// Get current session user
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.currentUser);
  return data ? JSON.parse(data) : null;
};

// Verify password (simple hash for demo - replace with bcrypt on backend)
const hashPassword = (password: string): string => {
  // In production, this would be handled server-side with bcrypt
  // This is just a simple hash for client-side demo
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// Store password (in production, this is server-side only)
const passwordStore: Record<string, string> = {};

export const setUserPassword = (email: string, password: string) => {
  passwordStore[email.toLowerCase()] = hashPassword(password);
};

export const verifyPassword = (email: string, password: string): boolean => {
  const stored = passwordStore[email.toLowerCase()];
  return stored === hashPassword(password);
};

export const hasPassword = (email: string): boolean => {
  return !!passwordStore[email.toLowerCase()];
};
