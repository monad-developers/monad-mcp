import { z } from 'zod'

interface Protocol {
  name: string
  category: string
  subcategory: string
  contract: string
  address: string
}

class ProtocolDatabase {
  private protocols: Protocol[] = []
  private isLoaded = false

  async loadData() {
    if (this.isLoaded) return

    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/monad-developers/protocols/refs/heads/main/protocols.csv'
      )
      const csvText = await response.text()
      
      const lines = csvText.split('\n')
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 5) {
          this.protocols.push({
            name: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            subcategory: values[2]?.trim() || '',
            contract: values[3]?.trim() || '',
            address: values[4]?.trim() || '',
          })
        }
      }
      this.isLoaded = true
    } catch (error) {
      throw new Error(`Failed to load protocol data: ${error}`)
    }
  }

  search(filters: {
    category?: string
    subcategory?: string
    name?: string
    contract?: string
  }) {
    const { category, subcategory, name, contract } = filters
    
    return this.protocols.filter(protocol => {
      if (category && !protocol.category.toLowerCase().includes(category.toLowerCase())) return false
      if (subcategory && !protocol.subcategory.toLowerCase().includes(subcategory.toLowerCase())) return false
      if (name && !protocol.name.toLowerCase().includes(name.toLowerCase())) return false
      if (contract && !protocol.contract.toLowerCase().includes(contract.toLowerCase())) return false
      if (contract && !protocol.address.toLowerCase().includes(contract.toLowerCase())) return false
      return true
    })
  }


  getCategories() {
    return [...new Set(this.protocols.map(p => p.category))].filter(Boolean)
  }

  getSubcategories(category?: string) {
    const filtered = category 
      ? this.protocols.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : this.protocols
    
    return [...new Set(filtered.map(p => p.subcategory))].filter(Boolean)
  }


  discoverByQuery(query: string) {
    const q = query.toLowerCase()
    
    // Keyword mapping
    if (q.includes('dex') || q.includes('exchange') || q.includes('swap') || q.includes('trade')) {
      return this.search({ subcategory: 'DEX' })
    }
    if (q.includes('lending') || q.includes('borrow') || q.includes('lend')) {
      return this.search({ subcategory: 'Lending' })
    }
    if (q.includes('game') || q.includes('gaming') || q.includes('play')) {
      return this.search({ category: 'Gaming' })
    }
    if (q.includes('nft') || q.includes('collectible') || q.includes('marketplace')) {
      return this.search({ category: 'NFT' })
    }
    if (q.includes('ai') || q.includes('agent') || q.includes('artificial')) {
      return this.search({ category: 'AI' })
    }
    if (q.includes('defi') || q.includes('finance')) {
      return this.search({ category: 'DeFi' })
    }
    
    // Fallback: search by name
    return this.search({ name: query }).slice(0, 10)
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

