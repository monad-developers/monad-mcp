import Redis from 'redis'

const redis = process.env.REDIS_URL ? Redis.createClient({
  url: process.env.REDIS_URL
}) : null

export class CacheManager {
  private static instance: CacheManager
  private redis: Redis.RedisClientType | null = null

  private constructor() {
    if (redis) {
      this.redis = redis
      this.redis.on('error', (err) => console.error('Redis error:', err))
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }
}

export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttlSeconds: number = 300
) => {
  return async (...args: T): Promise<R> => {
    const cache = CacheManager.getInstance()
    const cacheKey = keyGenerator(...args)
    
    // Try to get from cache first
    const cached = await cache.get<R>(cacheKey)
    if (cached !== null) {
      return cached
    }
    
    // Execute function and cache result
    const result = await fn(...args)
    await cache.set(cacheKey, result, ttlSeconds)
    
    return result
  }
}