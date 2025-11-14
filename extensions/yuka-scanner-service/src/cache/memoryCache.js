export class MemoryCache {
  constructor({ ttl = 3600 } = {}) {
    this.ttl = ttl * 1000; // milliseconds
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() > entry.expiresAt;
    if (isExpired) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    const expiresAt = Date.now() + this.ttl;
    this.store.set(key, { value, expiresAt });
    return value;
  }

  has(key) {
    return Boolean(this.get(key));
  }

  clear() {
    this.store.clear();
  }
}
