// Simple in-memory cache with TTL
class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttl = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.store) {
      if (now > item.expiry) {
        this.store.delete(key);
      }
    }
  }
}

export const cache = new Cache();

// Auto cleanup every 5 minutes
setInterval(() => cache.cleanup(), 300000);

// Cache helpers
export const getCachedData = async (key, fetchFn, ttl = 300000) => {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
};

export const invalidateCache = (pattern) => {
  if (pattern) {
    // Invalidate keys matching pattern
    for (const key of cache.store.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};