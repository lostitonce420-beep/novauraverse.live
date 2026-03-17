
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  tier: 'free' | 'middle' | 'sovereign';
  endpoint?: string; // For messaging redirection
  createdAt: string;
  lastUsed?: string;
}

class ApiKeyService {
  private STORAGE_KEY = 'novaura_api_keys_';

  private getStorageKey(userId: string) {
    return `${this.STORAGE_KEY}${userId}`;
  }

  getKeys(userId: string): ApiKey[] {
    const data = localStorage.getItem(this.getStorageKey(userId));
    return data ? JSON.parse(data) : [];
  }

  generateKey(userId: string, name: string, tier: ApiKey['tier']): ApiKey {
    const keys = this.getKeys(userId);
    
    // Middle tier constraint check (simulated)
    if (tier === 'middle' || tier === 'sovereign') {
      console.log(`[API_KEY] Verifying subscription for tier: ${tier}`);
    }

    const newKey: ApiKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      key: `nv_${Math.random().toString(36).substr(2, 12)}_${Math.random().toString(36).substr(2, 12)}`,
      tier,
      createdAt: new Date().toISOString()
    };

    keys.push(newKey);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(keys));
    return newKey;
  }

  updateKeyEndpoint(userId: string, keyId: string, endpoint: string): boolean {
    const keys = this.getKeys(userId);
    const index = keys.findIndex(k => k.id === keyId);
    if (index === -1) return false;

    keys[index].endpoint = endpoint;
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(keys));
    return true;
  }

  deleteKey(userId: string, keyId: string): void {
    const keys = this.getKeys(userId).filter(k => k.id !== keyId);
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(keys));
  }

  validateKey(keyString: string): ApiKey | null {
    // In a real app, this would query a global database or cache
    // Here we'll simulate a scan across known local storage keys (for demo purposes)
    for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey?.startsWith(this.STORAGE_KEY)) {
            const keys: ApiKey[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const found = keys.find(k => k.key === keyString);
            if (found) return found;
        }
    }
    return null;
  }

  routeMessage(keyString: string, message: Record<string, unknown>): Promise<Response> {
    const apiKey = this.validateKey(keyString);
    if (!apiKey || !apiKey.endpoint) {
      throw new Error('Invalid API key or missing endpoint redirection.');
    }

    return fetch(apiKey.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NovAura-Key': keyString,
      },
      body: JSON.stringify({ ...message, timestamp: new Date().toISOString() }),
    });
  }
}

export const apiKeyService = new ApiKeyService();
