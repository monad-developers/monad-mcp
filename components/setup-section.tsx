'use client'

const mcpConfig = {
  mcpServers: {
    MonadMcp: {
      url: 'https://monad-mcp-tau.vercel.app/sse',
    },
  },
}

export function SetupSection() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
        1. Configure MCP Settings
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Add the following configuration to your project's{' '}
        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[#FBFAF9] dark:text-[#FBFAF9]">
          .cursor/mcp.json
        </code>{' '}
        file:
      </p>
      <div className="relative">
        <pre className="bg-gray-900 text-[#FBFAF9] p-4 rounded-lg overflow-x-auto">
          <code>{JSON.stringify(mcpConfig, null, 2)}</code>
        </pre>
        <button
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded cursor-pointer"
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2))
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-label="Copy to clipboard"
            role="img"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
