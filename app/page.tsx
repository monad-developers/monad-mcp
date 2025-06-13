'use client'

const mcpConfig = {
  mcpServers: {
    MonadMcp: {
      url: 'https://monad-mcp-tau.vercel.app/sse',
    },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r bg-[#836EF9] text-white relative">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Monad Developer MCP
            </h1>
            <p className="text-xl md:text-2xl text-[#FBFAF9]">
              Set up remote Monad Developer MCP in your IDE in minutes!
            </p>
          </div>
        </div>
      </header>

      {/* <!-- Main Content --> */}
      <main className="container mx-auto px-6 py-6">
        {/* <!-- Setup Guide --> */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
              Setup Guide
            </h2>

            <div className="space-y-6">
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
                    className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(mcpConfig, null, 2),
                      )
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

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
                  2. Verify Connection
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Once configured, your Cursor IDE will automatically connect to
                  the MCP SSE server. You can verify the connection by opening
                  Composer in Agent Mode (
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[#FBFAF9]-600 dark:text-[#FBFAF9]-400">
                    Cmd + I
                  </code>
                  ) and asking it "What is the balance of this wallet address?".
                  You should see a card like so in the Agent sidebar to the
                  right:
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-center mt-2">
                  <span className="text-gray-400 dark:text-gray-400">
                    &gt; Called MCP tool
                    <code className="font-mono text-gray-400 dark:text-gray-400">
                      get-mon-balance
                    </code>
                    ✓
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
                  3. Configure User Rules
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Add the following to your Cursor user rules by going to the
                  command palette (
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[#FBFAF9 dark:text-[#FBFAF9]">
                    Cmd/Ctrl + Shift + P
                  </code>
                  ) and selecting
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[#FBFAF9] dark:text-[#FBFAF9]">
                    Cursor Settings &gt; Rules
                  </code>
                  :
                </p>
                <pre className="bg-gray-900 text-[#FBFAF9] p-4 rounded-lg overflow-x-auto mt-4">
                  <code>Always use mcp tools</code>
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
                  4. Start Using MCP Features
                </h3>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
                    Available MCP Tools
                  </h3>
                  <div className="grid gap-4">
                    {/* <!-- Balance & Account Tools --> */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-[#FBFAF9] mb-2">
                        Balance & Account Tools
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-mon-balance
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get MON balance for any address on Monad testnet
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-erc20-balance
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Check ERC20 token balances with automatic token
                            information retrieval
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* <!-- Transaction & Block Tools --> */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-[#FBFAF9] mb-2">
                        Transaction & Block Tools
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-transaction
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Retrieve detailed transaction information by hash
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-tx-receipt
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get transaction receipts with gas usage and status
                            details
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-block
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Fetch block information by number or get latest
                            block
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            decode-calldata
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Decode transaction calldata to human-readable
                            function calls
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* <!-- Contract Tools --> */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-[#FBFAF9] mb-2">
                        Contract Tools
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-contract-source
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Retrieve contract source code and ABI from Monad
                            testnet
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            readContract
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Read data from any contract function with custom ABI
                            support
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* <!-- Network Tools --> */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-[#FBFAF9] mb-2">
                        Network Tools
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            estimate-priority-fee
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get current gas price and priority fee estimates
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            get-monad-constants
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Access network information and common contract
                            addresses
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* <!-- Utility Tools --> */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-[#FBFAF9] mb-2">
                        Utility Tools
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            convert
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Convert between different data formats (hex, string,
                            number, keccak256)
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            monad-docs
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Access Monad developer documentation directly in
                            your IDE
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* <!-- Documentation Tools --> */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mt-4">
                      <h4 className="font-semibold text-[#FBFAF9] mb-2">
                        Documentation Tools
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            monad-docs
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Access Monad developer documentation directly in
                            your IDE
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-[#FFFFFF]">
                            read-monad-docs
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Read specific sections of Monad documentation
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <!-- Features Section --> */}
          {/* <!-- <div className="grid md:grid-cols-2 gap-8 mt-12">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">🚀 Real-time Updates</h3>
                      <p className="text-gray-600 dark:text-gray-300">Get up-to-date information about Monad documentation right inside your IDE</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">🔒 Secure Integration</h3>
                      <p className="text-gray-600 dark:text-gray-300">Built with security in mind minimizing sensitive information exposure</p>
                  </div>
              </div> --> */}
        </div>
      </main>

      {/* <!-- Footer -->
    <!-- <footer className="bg-gray-900 text-gray-400 mt-16">
          <div className="container mx-auto px-6 py-8">
              <div className="text-center">
                  <p>Built with ❤️ for the Monad community</p>
              </div>
          </div>
      </footer> --> */}
    </div>
  )
}
