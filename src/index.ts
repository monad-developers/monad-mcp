// Import wallet interfaces and implementation
import { WalletConfig } from './interfaces/wallet';
import { EvmMcpWallet } from './core/wallet';

// Export wallet interfaces
export {
  IWallet,
  WalletConfig,
  TransactionOptions,
  TokenTransferOptions,
  SwapOptions,
  BridgeOptions
} from './interfaces/wallet';

// Export wallet implementation
export { EvmMcpWallet } from './core/wallet';

// Export Uniswap service
export { UniswapService } from './integrations/uniswap/uniswap-service';

// Export Bridge service
export { BridgeService } from './integrations/bridge/bridge-service';

// Export MCP server
export { McpServer, McpServerConfig, createMcpServer } from './mcp/server';

// Export constants
export {
  ERC20_ABI,
  CHAIN_IDS,
  ETHEREUM_TOKENS,
  DEFAULT_GAS_LIMITS,
  DERIVATION_PATHS,
  DEFAULT_RPC_URLS
} from './utils/constants';

/**
 * Create a new wallet instance
 * @param config Wallet configuration
 * @returns EvmMcpWallet instance
 */
export function createWallet(config: WalletConfig): EvmMcpWallet {
  return new EvmMcpWallet(config);
}

/**
 * Library version
 */
export const VERSION = '0.1.0';
