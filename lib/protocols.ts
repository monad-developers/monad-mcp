import { z } from 'zod'
import { createClient } from 'redis'

interface Protocol {
  name: string
  category: string
  subcategory: string
  contract: string
  address: string
}

class ProtocolDatabase {
  private redis: ReturnType<typeof createClient>
  private isInitialized = false
  private readonly CACHE_KEY = 'protocols:data'
  private readonly CACHE_TTL = 3600 // 1 hour in seconds
  private readonly LAST_UPDATE_KEY = 'protocols:last_update'

  constructor() {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL
    if (!redisUrl) {
      throw new Error('REDIS_URL or KV_URL environment variable is not set')
    }

    this.redis = createClient({
      url: redisUrl,
    })

    this.redis.on('error', (err) => {
      console.error('Redis error in ProtocolDatabase:', err)
    })
  }

  private async ensureConnected() {
    if (!this.isInitialized) {
      await this.redis.connect()
      this.isInitialized = true
    }
  }

  async loadData(): Promise<void> {
    await this.ensureConnected()

    try {
      // Check if we have cached data and it's not expired
      const lastUpdate = await this.redis.get(this.LAST_UPDATE_KEY)
      const now = Date.now()

      if (
        lastUpdate &&
        now - Number.parseInt(lastUpdate) < this.CACHE_TTL * 1000
      ) {
        // Cache is still valid, no need to reload
        return
      }

      // Fetch fresh data from GitHub
      const response = await fetch(
        'https://raw.githubusercontent.com/monad-developers/protocols/refs/heads/main/protocols.csv',
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch CSV: ${response.status} ${response.statusText}`,
        )
      }

      const csvText = await response.text()
      const protocols: Protocol[] = []

      const lines = csvText.split('\n')

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 5) {
          protocols.push({
            name: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            subcategory: values[2]?.trim() || '',
            contract: values[3]?.trim() || '',
            address: values[4]?.trim() || '',
          })
        }
      }

      // Store in Redis with TTL
      await this.redis.setEx(
        this.CACHE_KEY,
        this.CACHE_TTL,
        JSON.stringify(protocols),
      )
      await this.redis.set(this.LAST_UPDATE_KEY, now.toString())

      console.log(`Loaded ${protocols.length} protocols into cache`)
    } catch (error) {
      console.error('Failed to load protocol data:', error)
      throw new Error(`Failed to load protocol data: ${error}`)
    }
  }

  private async getProtocols(): Promise<Protocol[]> {
    await this.ensureConnected()

    const cached = await this.redis.get(this.CACHE_KEY)
    if (!cached) {
      await this.loadData()
      const freshCached = await this.redis.get(this.CACHE_KEY)
      if (!freshCached) {
        throw new Error('Failed to load protocol data')
      }
      return JSON.parse(freshCached)
    }

    return JSON.parse(cached)
  }

  async search(filters: {
    category?: string
    subcategory?: string
    name?: string
    contract?: string
  }) {
    const protocols = await this.getProtocols()
    const { category, subcategory, name, contract } = filters

    return protocols.filter((protocol) => {
      if (
        category &&
        !protocol.category.toLowerCase().includes(category.toLowerCase())
      )
        return false
      if (
        subcategory &&
        !protocol.subcategory.toLowerCase().includes(subcategory.toLowerCase())
      )
        return false
      if (name && !protocol.name.toLowerCase().includes(name.toLowerCase()))
        return false
      if (
        contract &&
        !protocol.contract.toLowerCase().includes(contract.toLowerCase())
      )
        return false
      if (
        contract &&
        !protocol.address.toLowerCase().includes(contract.toLowerCase())
      )
        return false
      return true
    })
  }

  async getCategories() {
    const protocols = await this.getProtocols()
    return [...new Set(protocols.map((p) => p.category))].filter(Boolean)
  }

  async getSubcategories(category?: string) {
    const protocols = await this.getProtocols()
    const filtered = category
      ? protocols.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase(),
        )
      : protocols

    return [...new Set(filtered.map((p) => p.subcategory))].filter(Boolean)
  }

  async discoverByQuery(query: string) {
    const protocols = await this.getProtocols()
    const q = query.toLowerCase()

    // Keyword mapping
    if (
      q.includes('dex') ||
      q.includes('exchange') ||
      q.includes('swap') ||
      q.includes('trade')
    ) {
      return protocols.filter((p) =>
        p.subcategory.toLowerCase().includes('dex'),
      )
    }
    if (q.includes('lending') || q.includes('borrow') || q.includes('lend')) {
      return protocols.filter((p) =>
        p.subcategory.toLowerCase().includes('lending'),
      )
    }
    if (q.includes('game') || q.includes('gaming') || q.includes('play')) {
      return protocols.filter((p) =>
        p.category.toLowerCase().includes('gaming'),
      )
    }
    if (
      q.includes('nft') ||
      q.includes('collectible') ||
      q.includes('marketplace')
    ) {
      return protocols.filter((p) => p.category.toLowerCase().includes('nft'))
    }
    if (q.includes('ai') || q.includes('agent') || q.includes('artificial')) {
      return protocols.filter((p) => p.category.toLowerCase().includes('ai'))
    }
    if (q.includes('defi') || q.includes('finance')) {
      return protocols.filter((p) => p.category.toLowerCase().includes('defi'))
    }

    // Fallback: search by name
    return protocols
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 10)
  }

  async clearCache() {
    await this.ensureConnected()
    await this.redis.del(this.CACHE_KEY)
    await this.redis.del(this.LAST_UPDATE_KEY)
  }

  async getCacheInfo() {
    await this.ensureConnected()
    const lastUpdate = await this.redis.get(this.LAST_UPDATE_KEY)
    const hasData = await this.redis.exists(this.CACHE_KEY)

    return {
      hasData: hasData === 1,
      lastUpdate: lastUpdate ? new Date(Number.parseInt(lastUpdate)) : null,
      ttl: this.CACHE_TTL,
    }
  }
}

// Export singleton instance
export const protocolDb = new ProtocolDatabase()

// Helper functions to format responses
export function formatProtocolList(protocols: Protocol[], limit = 20) {
  if (protocols.length === 0) {
    return 'No protocols found matching the criteria.'
  }

  let response = `Found ${protocols.length} protocol(s):\n\n`

  for (const protocol of protocols.slice(0, limit)) {
    response += `**${protocol.name}** (${protocol.category} > ${protocol.subcategory})\n`
    response += `Contract: ${protocol.contract}\n`
    response += `Address: \`${protocol.address}\`\n\n`
  }

  if (protocols.length > limit) {
    response += `... and ${protocols.length - limit} more results`
  }

  return response
}
