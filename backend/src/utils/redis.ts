import type Redis from "ioredis";

export class RedisCache {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds !== undefined) {
      await this.redis.set(key, stringValue, "EX", ttlSeconds);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      console.warn(
        `RedisCache: failed to parse value for key "${key}" — evicting`,
      );
      await this.del(key);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Reserved for future use
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}
