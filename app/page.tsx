'use client'

import { Footer } from '@/components/footer'
import { SetupSection } from '@/components/setup-section'
import {
  ArrowRight,
  Code,
  Database,
  FileCode,
  Layers,
  Shield,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="relative overflow-hidden pt-20">
        <motion.div
          className="container mx-auto px-6 py-24 relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={fadeIn}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-monad-200">
              Monad Developer MCP
            </h1>
            <motion.p
              className="text-xl md:text-2xl text-monad-100 mb-8"
              variants={fadeIn}
            >
              Set up remote Monad Developer MCP in your IDE in minutes!
            </motion.p>
            <motion.div variants={fadeIn}>
              <a
                href="#setup-guide"
                className="inline-flex items-center gap-2 bg-monad-500 hover:bg-monad-600 transition-colors px-6 py-3 rounded-lg font-medium text-white"
              >
                Get Started <ArrowRight size={18} />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        {/* Setup Guide */}
        <section id="setup-guide" className="max-w-4xl mx-auto mb-20">
          <motion.div
            className="bg-gray-800/60 backdrop-blur-sm border border-monad-800/40 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="p-1 bg-gradient-to-r from-monad-500 via-monad-600 to-monad-500" />
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <Code className="text-monad-500" size={28} />
                Setup Guide
              </h2>

              <div className="space-y-10">
                <SetupSection />

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-monad-900/30 text-monad-400">
                      2
                    </span>
                    Verify Connection
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Once configured, your Cursor IDE will automatically connect
                    to the MCP SSE server. You can verify the connection by
                    opening Composer in Agent Mode (
                    <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300">
                      Cmd + I
                    </code>
                    ) and asking it "What is the balance of this wallet
                    address?". You should see a card like so in the Agent
                    sidebar to the right:
                  </p>
                  <div className="bg-gray-900/80 border border-gray-700 p-4 rounded-lg shadow-md flex items-center mt-2">
                    <span className="text-gray-400">
                      &gt; Called MCP tool
                      <code className="font-mono text-monad-300 ml-1">
                        get-mon-balance
                      </code>
                      <span className="text-green-400 ml-1">✓</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-monad-900/30 text-monad-400">
                      3
                    </span>
                    Configure User Rules
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Add the following to your Cursor user rules by going to the
                    command palette (
                    <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300">
                      Cmd/Ctrl + Shift + P
                    </code>
                    ) and selecting
                    <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 mx-1">
                      Cursor Settings &gt; Rules
                    </code>
                    :
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 border border-gray-700 text-monad-300 p-4 rounded-lg overflow-x-auto mt-4">
                      <code>Always use mcp tools</code>
                    </pre>
                    <button
                      className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                      onClick={() =>
                        navigator.clipboard.writeText('Always use mcp tools')
                      }
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* MCP Features */}
        <section className="max-w-4xl mx-auto mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Available MCP Tools
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Access powerful blockchain development tools directly in your IDE
              with Monad's MCP integration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Balance & Account Tools */}
            <motion.div
              className="bg-gray-800/60 backdrop-blur-sm border border-monad-800/40 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-monad-900/30 rounded-lg">
                    <Database size={20} className="text-monad-400" />
                  </div>
                  <h3 className="font-semibold text-xl text-white">
                    Balance & Account Tools
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        get-mon-balance
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Get MON balance for any address on Monad testnet
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        get-erc20-balance
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Check ERC20 token balances with automatic token
                      information retrieval
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Transaction & Block Tools */}
            <motion.div
              className="bg-gray-800/60 backdrop-blur-sm border border-monad-800/40 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-monad-900/30 rounded-lg">
                    <Layers size={20} className="text-monad-400" />
                  </div>
                  <h3 className="font-semibold text-xl text-white">
                    Transaction & Block Tools
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        get-transaction
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Retrieve detailed transaction information by hash
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        get-tx-receipt
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Get transaction receipts with gas usage and status details
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        decode-calldata
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Decode transaction calldata to human-readable function
                      calls
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contract Tools */}
            <motion.div
              className="bg-gray-800/60 backdrop-blur-sm border border-monad-800/40 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-monad-900/30 rounded-lg">
                    <FileCode size={20} className="text-monad-400" />
                  </div>
                  <h3 className="font-semibold text-xl text-white">
                    Contract Tools
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        get-contract-source
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Retrieve contract source code and ABI from Monad testnet
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        readContract
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Read data from any contract function with custom ABI
                      support
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Network Tools */}
            <motion.div
              className="bg-gray-800/60 backdrop-blur-sm border border-monad-800/40 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-monad-900/30 rounded-lg">
                    <Zap size={20} className="text-monad-400" />
                  </div>
                  <h3 className="font-semibold text-xl text-white">
                    Network Tools
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        estimate-priority-fee
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Get current gas price and priority fee estimates
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                        get-monad-constants
                      </code>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Access network information and common contract addresses
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Utility Tools */}
            <motion.div
              className="bg-gray-800/60 backdrop-blur-sm border border-monad-800/40 rounded-xl overflow-hidden md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-monad-900/30 rounded-lg">
                    <Shield size={20} className="text-monad-400" />
                  </div>
                  <h3 className="font-semibold text-xl text-white">
                    Utility & Documentation Tools
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-4">
                    <li>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                          convert
                        </code>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Convert between different data formats (hex, string,
                        number, keccak256)
                      </p>
                    </li>
                    <li>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                          monad-docs
                        </code>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Access Monad developer documentation directly in your
                        IDE
                      </p>
                    </li>
                  </ul>
                  <ul className="space-y-4">
                    <li>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-700/60 px-2 py-1 rounded text-monad-300 text-sm">
                          read-monad-docs
                        </code>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Read specific sections of Monad documentation
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <motion.div
            className="bg-gradient-to-r from-monad-900/30 to-monad-950/30 backdrop-blur-sm border border-monad-700/30 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Ready to start building on Monad?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get access to powerful development tools and join the growing
              community of Monad developers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://monad.xyz/post/monad-testnet-onboarding-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-monad-500 hover:bg-monad-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Testnet Onboarding Guide
              </a>
              <a
                href="https://discord.gg/monaddev"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Join Developer Discord
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
