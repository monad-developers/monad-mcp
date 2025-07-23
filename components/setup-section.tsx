'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

const mcpConfig = {
  mcpServers: {
    MonadMcp: {
      url: 'https://monad-mcp-tau.vercel.app/sse',
    },
  },
}

export function SetupSection() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-monad-900/30 text-monad-400">
          1
        </span>
        Configure MCP Settings
      </h3>
      <p className="text-gray-300 mb-4">
        Add the following configuration to your project's{' '}
        <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300">
          .cursor/mcp.json
        </code>{' '}
        file:
      </p>
      <div className="relative">
        <pre className="bg-gray-900 border border-gray-700 text-monad-300 p-4 rounded-lg overflow-x-auto">
          <code>{JSON.stringify(mcpConfig, null, 2)}</code>
        </pre>
        <button
          className="absolute right-3 top-3 bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded transition-colors"
          type="button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </div>
  )
}
