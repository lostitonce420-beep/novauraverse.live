/**
 * Wishlist Service
 * 
 * Client-side service for managing wishlist items with localStorage backup.
 * Syncs with Polsia backend when user is logged in.
 */

import type { Asset } from '@/types';
import { getAssetById } from './marketService';

// Storage key for localStorage
const WISHLIST_STORAGE_KEY = 'novaura_wishlist';

// Types for service
export interface WishlistServiceItem {
  assetId: string;
  addedAt: string;
  note?: string;
}

export interface SyncResult {
  success: boolean;
  message?: string;
  itemCount?: number;
}

/**
 * Get wishlist items from localStorage
 */
export const getWishlist = (): WishlistServiceItem[] => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading wishlist from localStorage:', error);
  }
  return [];
};

/**
 * Save wishlist items to localStorage
 */
export const saveWishlist = (items: WishlistServiceItem[]): void => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

/**
 * Add an item to the wishlist
 */
export const addToWishlist = (assetId: string, note?: string): WishlistServiceItem[] => {
  const wishlist = getWishlist();
  
  // Check if already in wishlist
  if (wishlist.some(item => item.assetId === assetId)) {
    return wishlist;
  }
  
  const newItem: WishlistServiceItem = {
    assetId,
    addedAt: new Date().toISOString(),
    note,
  };
  
  const updatedWishlist = [...wishlist, newItem];
  saveWishlist(updatedWishlist);
  
  return updatedWishlist;
};

/**
 * Remove an item from the wishlist
 */
export const removeFromWishlist = (assetId: string): WishlistServiceItem[] => {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter(item => item.assetId !== assetId);
  saveWishlist(updatedWishlist);
  return updatedWishlist;
};

/**
 * Check if an asset is in the wishlist
 */
export const isInWishlist = (assetId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.assetId === assetId);
};

/**
 * Toggle an asset in the wishlist (add if not present, remove if present)
 */
export const toggleWishlist = (assetId: string, note?: string): { items: WishlistServiceItem[]; added: boolean } => {
  const isCurrentlyInWishlist = isInWishlist(assetId);
  
  if (isCurrentlyInWishlist) {
    return {
      items: removeFromWishlist(assetId),
      added: false,
    };
  } else {
    return {
      items: addToWishlist(assetId, note),
      added: true,
    };
  }
};

/**
 * Clear all items from the wishlist
 */
export const clearWishlist = (): void => {
  saveWishlist([]);
};

/**
 * Move an item from wishlist to cart
 * Returns the asset if successful, null if not found
 */
export const moveToCart = (assetId: string): Asset | null => {
  const asset = getAssetById(assetId);
  if (asset) {
    removeFromWishlist(assetId);
    return asset;
  }
  return null;
};

/**
 * Get the count of items in the wishlist
 */
export const getWishlistCount = (): number => {
  return getWishlist().length;
};

/**
 * Get full asset data for all wishlist items
 */
export const getWishlistAssets = (): Array<{ item: WishlistServiceItem; asset: Asset | null }> => {
  const wishlist = getWishlist();
  return wishlist.map(item => ({
    item,
    asset: getAssetById(item.assetId) ?? null,
  }));
};

/**
 * Update wishlist item note
 */
export const updateWishlistNote = (assetId: string, note?: string): WishlistServiceItem[] => {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.map(item => 
    item.assetId === assetId ? { ...item, note } : item
  );
  saveWishlist(updatedWishlist);
  return updatedWishlist;
};

/**
 * Sync wishlist to server (Polsia backend)
 * Called when user logs in to persist their wishlist
 */
export const syncToServer = async (_userId: string): Promise<SyncResult> => {
  const wishlist = getWishlist();
  
  // TODO: Replace with actual API call to Polsia backend
  // Example:
  // const response = await fetch('/api/wishlist/sync', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, items: wishlist }),
  // });
  // return response.json();
  
  // For now, simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store server sync timestamp
  localStorage.setItem('novaura_wishlist_last_sync', new Date().toISOString());
  
  return {
    success: true,
    message: 'Wishlist synced to server',
    itemCount: wishlist.length,
  };
};

/**
 * Sync wishlist from server (Polsia backend)
 * Called on login to merge server wishlist with local
 */
export const syncFromServer = async (_userId: string): Promise<SyncResult> => {
  // TODO: Replace with actual API call to Polsia backend
  // Example:
  // const response = await fetch(`/api/wishlist/${userId}`);
  // const serverWishlist = await response.json();
  
  // For now, simulate API call with empty response
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, merge server wishlist with local wishlist
  // Server wishlist takes precedence for conflicts
  
  return {
    success: true,
    message: 'Wishlist synced from server',
    itemCount: getWishlistCount(),
  };
};

/**
 * Merge local wishlist with server wishlist
 * Server items take precedence for conflicts
 */
export const mergeWishlists = (
  localItems: WishlistServiceItem[],
  serverItems: WishlistServiceItem[]
): WishlistServiceItem[] => {
  const merged = new Map<string, WishlistServiceItem>();
  
  // Add local items first
  localItems.forEach(item => {
    merged.set(item.assetId, item);
  });
  
  // Server items override local items
  serverItems.forEach(item => {
    merged.set(item.assetId, item);
  });
  
  return Array.from(merged.values());
};

/**
 * Share wishlist via URL
 * Generates a shareable URL with encoded wishlist data
 */
export const generateShareableUrl = (): string => {
  const wishlist = getWishlist();
  const assetIds = wishlist.map(item => item.assetId);
  const encoded = btoa(JSON.stringify(assetIds));
  return `${window.location.origin}/wishlist/shared?ids=${encoded}`;
};

/**
 * Load wishlist from shared URL
 */
export const loadFromSharedUrl = (encodedIds: string): string[] => {
  try {
    const decoded = JSON.parse(atob(encodedIds));
    return Array.isArray(decoded) ? decoded : [];
  } catch {
    return [];
  }
};

/**
 * Export wishlist to JSON file
 */
export const exportWishlist = (): void => {
  const wishlist = getWishlist();
  const dataStr = JSON.stringify(wishlist, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `novaura-wishlist-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import wishlist from JSON file
 */
export const importWishlist = async (file: File): Promise<{ success: boolean; count: number; errors: string[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(imported)) {
          resolve({ success: false, count: 0, errors: ['Invalid file format'] });
          return;
        }
        
        const currentWishlist = getWishlist();
        const errors: string[] = [];
        let addedCount = 0;
        
        imported.forEach((item: any) => {
          if (item.assetId && typeof item.assetId === 'string') {
            if (!currentWishlist.some(w => w.assetId === item.assetId)) {
              currentWishlist.push({
                assetId: item.assetId,
                addedAt: item.addedAt || new Date().toISOString(),
                note: item.note,
              });
              addedCount++;
            }
          } else {
            errors.push(`Invalid item: ${JSON.stringify(item)}`);
          }
        });
        
        saveWishlist(currentWishlist);
        resolve({ success: true, count: addedCount, errors });
      } catch (error) {
        resolve({ success: false, count: 0, errors: ['Failed to parse file'] });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, count: 0, errors: ['Failed to read file'] });
    };
    
    reader.readAsText(file);
  });
};
