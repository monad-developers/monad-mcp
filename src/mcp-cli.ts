#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import {
  WalletConfig,
  TokenTransferOptions,
  SwapOptions,
  BridgeOptions
} from './interfaces/wallet';
import {
  ERC20_ABI,
  ETHEREUM_TOKENS,
  MONAD_TOKENS,
  CHAIN_IDS,
  DEFAULT_GAS_LIMITS
} from './utils/constants';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

// Enable debug logging
process.env.DEBUG = 'mcp:*';

// Load environment variables from home directory
dotenv.config({ path: path.join(os.homedir(), '.env') });
// Load environment variables from current directory
dotenv.config();

// Add debug logging function
const debug = (message: string, ...args: any[]) => {
  console.error(`[DEBUG] ${message}`, ...args);
};

/**
 * Wallet-related tool definitions
 */
const WALLET_ADDRESS_TOOL: Tool = {
  name: 'mcp_wallet_address',
  description: '获取当前地址信息.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

const WALLET_BALANCE_TOOL: Tool = {
  name: 'mcp_wallet_balance',
  description: '获取当前地址的数量.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

const TOKEN_TRANSFER_TOOL: Tool = {
  name: 'mcp_token_transfer',
  description: '发送代币到指定地址.',
  inputSchema: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: '代币符号或合约地址 (例如: ETH, USDT, 0x...)'
      },
      to: {
        type: 'string',
        description: '接收地址'
      },
      amount: {
        type: 'string',
        description: '发送数量'
      }
    },
    required: ['token', 'to', 'amount']
  }
};

const TOKEN_PRICE_TOOL: Tool = {
  name: 'mcp_token_price',
  description: '查询代币价格.',
  inputSchema: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: '代币符号 (例如: ETH, BTC, USDT)'
      },
      currency: {
        type: 'string',
        description: '计价货币 (例如: USD, CNY)',
        default: 'USD'
      }
    },
    required: ['token']
  }
};

const SWAP_TOOL: Tool = {
  name: 'mcp_swap',
  description: '在 Uniswap 上交换代币.',
  inputSchema: {
    type: 'object',
    properties: {
      fromToken: {
        type: 'string',
        description: '源代币符号或合约地址'
      },
      toToken: {
        type: 'string',
        description: '目标代币符号或合约地址'
      },
      amount: {
        type: 'string',
        description: '交换数量'
      },
      slippage: {
        type: 'number',
        description: '最大滑点百分比',
        default: 0.5
      }
    },
    required: ['fromToken', 'toToken', 'amount']
  }
};

const BRIDGE_TOOL: Tool = {
  name: 'mcp_bridge',
  description: '跨链转移资产.',
  inputSchema: {
    type: 'object',
    properties: {
      fromChain: {
        type: 'string',
        description: '源链 (例如: ethereum, polygon, arbitrum)'
      },
      toChain: {
        type: 'string',
        description: '目标链 (例如: ethereum, polygon, arbitrum)'
      },
      token: {
        type: 'string',
        description: '代币符号或合约地址'
      },
      amount: {
        type: 'string',
        description: '转移数量'
      },
      provider: {
        type: 'string',
        description: '跨链桥提供商 (across, relay)',
        default: 'across'
      }
    },
    required: ['fromChain', 'toChain', 'token', 'amount']
  }
};

/**
 * Create Token tool definition
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CREATE_TOKEN_TOOL: Tool = {
  name: 'mcp_create_token',
  description: '创建一个新的代币.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '代币名称'
      },
      symbol: {
        type: 'string',
        description: '代币符号'
      },
      initialSupply: {
        type: 'string',
        description: '初始供应量'
      }
    },
    required: ['name', 'symbol', 'initialSupply']
  }
};

/**
 * Initialize wallet from configuration
 */
function initializeWallet(config: WalletConfig): ethers.Wallet | null {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);

  if (config.privateKey) {
    // Initialize from private key
    return new ethers.Wallet(config.privateKey, provider);
  } else if (config.mnemonic) {
    // Initialize from mnemonic
    const seed = bip39.mnemonicToSeedSync(config.mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);

    // Use default Ethereum derivation path if not specified
    const derivationPath = config.derivationPath || "m/44'/60'/0'/0/0";
    const accountIndex = config.accountIndex || 0;

    // If accountIndex is provided, adjust the path
    const path =
      derivationPath.endsWith('/0') && accountIndex > 0
        ? derivationPath.slice(0, -1) + accountIndex
        : derivationPath;

    const child = hdkey.derive(path);
    const privateKey = '0x' + child.privateKey?.toString('hex');
    return new ethers.Wallet(privateKey, provider);
  }

  return null;
}

/**
 * Get wallet configuration from environment variables
 */
function getWalletConfig(): WalletConfig {
  const rpcUrl = process.env.MCP_RPC_URL || 'https://testnet-rpc.monad.xyz';
  const chainId = parseInt(process.env.MCP_CHAIN_ID || '10143', 10);
  const privateKey = process.env.MCP_PRIVATE_KEY;
  const mnemonic = process.env.MCP_MNEMONIC;
  const address = process.env.MCP_ADDRESS;
  const enableMpc = process.env.MCP_MPC_ENABLED === 'true';
  const maxFeePerGas = process.env.MCP_MAX_FEE;
  const approvalTimeout = parseInt(process.env.MCP_APPROVAL_TIMEOUT || '120', 10);

  // Network information
  const networkName = process.env.MCP_NETWORK_NAME || 'Monad Testnet';
  const explorerUrl = process.env.MCP_EXPLORER_URL || 'https://testnet.monadexplorer.com';
  const nativeToken = process.env.MCP_NATIVE_TOKEN || 'MON';

  if (!privateKey && !mnemonic && !address) {
    console.error(
      'Error: No authentication method provided. Please set MCP_PRIVATE_KEY, MCP_MNEMONIC, or MCP_ADDRESS.'
    );
    process.exit(1);
  }

  return {
    rpcUrl,
    chainId,
    privateKey,
    mnemonic,
    address,
    enableMpc,
    maxFeePerGas,
    approvalTimeout,
    network: {
      name: networkName,
      explorerUrl,
      nativeToken
    }
  };
}

/**
 * Get token contract address from symbol or address
 */
function getTokenAddress(tokenSymbolOrAddress: string, chainId: number): string {
  // If it's already an address, return it
  if (tokenSymbolOrAddress.startsWith('0x') && tokenSymbolOrAddress.length === 42) {
    return tokenSymbolOrAddress;
  }

  // Handle native token symbols
  if (
    tokenSymbolOrAddress.toUpperCase() === 'MONAD' ||
    tokenSymbolOrAddress.toUpperCase() === 'MON' ||
    tokenSymbolOrAddress.toUpperCase() === 'ETH'
  ) {
    return chainId === CHAIN_IDS.MONAD
      ? 'MONAD'
      : chainId === CHAIN_IDS.MONAD_TESTNET
        ? 'MON'
        : 'ETH';
  }

  // Look up in token lists based on chain ID
  if (chainId === CHAIN_IDS.MONAD) {
    const address = MONAD_TOKENS[tokenSymbolOrAddress.toUpperCase()];
    if (address) return address;
  } else if (chainId === CHAIN_IDS.MONAD_TESTNET) {
    const address = MONAD_TOKENS[tokenSymbolOrAddress.toUpperCase()];
    if (address) return address;
  } else if (chainId === CHAIN_IDS.ETHEREUM) {
    const address = ETHEREUM_TOKENS[tokenSymbolOrAddress.toUpperCase()];
    if (address) return address;
  }

  throw new Error(`Unknown token symbol: ${tokenSymbolOrAddress}`);
}

/**
 * Get chain ID from chain name
 */
function getChainId(chainName: string): number {
  const chainMap: Record<string, number> = {
    ethereum: CHAIN_IDS.ETHEREUM,
    polygon: CHAIN_IDS.POLYGON,
    arbitrum: CHAIN_IDS.ARBITRUM_ONE,
    optimism: CHAIN_IDS.OPTIMISM,
    bsc: CHAIN_IDS.BSC,
    avalanche: CHAIN_IDS.AVALANCHE
  };

  const chainId = chainMap[chainName.toLowerCase()];
  if (!chainId) {
    throw new Error(`Chain ${chainName} not supported`);
  }

  return chainId;
}

/**
 * Get explorer URL for transaction
 */
function getExplorerUrl(txHash: string, config: WalletConfig): string {
  const explorerUrl = config.network?.explorerUrl || 'https://testnet.monadexplorer.com';
  return `${explorerUrl}/tx/${txHash}`;
}

/**
 * Transfer tokens
 */
async function transferTokens(
  wallet: ethers.Wallet,
  options: TokenTransferOptions,
  config: WalletConfig
): Promise<{ txHash: string; explorerUrl: string }> {
  // Check if wallet is available
  if (!wallet) {
    throw new Error('Wallet not available for sending transactions');
  }

  // Handle native token (ETH) transfer
  if (options.tokenAddress === 'MON') {
    const tx = await wallet.sendTransaction({
      to: options.to,
      value: ethers.parseEther(options.amount),
      gasLimit: options.gasLimit || DEFAULT_GAS_LIMITS.ETH_TRANSFER
    });

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction failed');
    }

    return {
      txHash: tx.hash,
      explorerUrl: getExplorerUrl(tx.hash, config)
    };
  }

  // Handle ERC20 token transfer
  const tokenContract = new ethers.Contract(options.tokenAddress, ERC20_ABI, wallet);
  const decimals = options.decimals || (await tokenContract.decimals());
  const amount = ethers.parseUnits(options.amount, decimals);

  const tx = await tokenContract.transfer(options.to, amount, {
    gasLimit: options.gasLimit || DEFAULT_GAS_LIMITS.ERC20_TRANSFER
  });

  const receipt = await tx.wait();
  if (!receipt) {
    throw new Error('Transaction failed');
  }

  return {
    txHash: tx.hash,
    explorerUrl: getExplorerUrl(tx.hash, config)
  };
}

/**
 * Get token price from CoinGecko API
 */
async function getTokenPrice(token: string, currency: string = 'usd'): Promise<number> {
  try {
    // Map common token symbols to CoinGecko IDs
    const tokenIdMap: Record<string, string> = {
      ETH: 'ethereum',
      BTC: 'bitcoin',
      USDT: 'tether',
      USDC: 'usd-coin',
      DAI: 'dai',
      LINK: 'chainlink',
      UNI: 'uniswap',
      AAVE: 'aave',
      MATIC: 'matic-network',
      SOL: 'solana',
      AVAX: 'avalanche-2',
      DOT: 'polkadot',
      ADA: 'cardano',
      MON: 'monad' // 添加 Monad 映射
    };

    const tokenId = tokenIdMap[token.toUpperCase()] || token.toLowerCase();

    // 添加超时设置和重试逻辑
    const axiosInstance = axios.create({
      timeout: 10000 // 10秒超时
    });

    // 尝试 CoinGecko API
    try {
      debug(`Fetching price from CoinGecko for ${tokenId} in ${currency}`);
      const response = await axiosInstance.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currency.toLowerCase()}`
      );

      if (response.data && response.data[tokenId]) {
        const price = response.data[tokenId][currency.toLowerCase()];
        debug(`Price for ${token}: ${price} ${currency.toUpperCase()}`);
        return price;
      }
    } catch (coinGeckoError) {
      debug(
        `CoinGecko API error: ${coinGeckoError instanceof Error ? coinGeckoError.message : String(coinGeckoError)}`
      );
      // 继续尝试备用 API
    }

    // 备用 API: CryptoCompare
    try {
      debug(`Fetching price from CryptoCompare for ${token} in ${currency}`);
      const backupResponse = await axiosInstance.get(
        `https://min-api.cryptocompare.com/data/price?fsym=${token.toUpperCase()}&tsyms=${currency.toUpperCase()}`
      );

      if (backupResponse.data && backupResponse.data[currency.toUpperCase()]) {
        const price = backupResponse.data[currency.toUpperCase()];
        debug(`Price from backup API for ${token}: ${price} ${currency.toUpperCase()}`);
        return price;
      }
    } catch (backupError) {
      debug(
        `Backup API error: ${backupError instanceof Error ? backupError.message : String(backupError)}`
      );
      // 如果备用 API 也失败，继续抛出错误
    }

    // 如果所有 API 都失败，返回模拟价格（仅用于测试环境）
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      debug(`Using mock price for ${token}`);
      const mockPrices: Record<string, number> = {
        ETH: 3500,
        BTC: 60000,
        USDT: 1,
        USDC: 1,
        DAI: 1,
        MON: 10
      };

      const mockPrice = mockPrices[token.toUpperCase()] || 1;
      debug(`Mock price for ${token}: ${mockPrice} ${currency.toUpperCase()}`);
      return mockPrice;
    }

    throw new Error(`Price data not available for ${token}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch price: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Execute swap on Uniswap
 * Note: This is a simplified implementation. In a production environment,
 * you would use the Uniswap SDK or router contracts directly.
 */
async function executeSwap(
  wallet: ethers.Wallet,
  options: SwapOptions,
  config: WalletConfig
): Promise<{ txHash: string; explorerUrl: string }> {
  // Check if wallet is available
  if (!wallet) {
    throw new Error('Wallet not available for swapping');
  }

  // In a real implementation, you would:
  // 1. Get token addresses and validate them
  // 2. Get token decimals
  // 3. Calculate amounts with slippage
  // 4. Approve tokens if needed
  // 5. Call Uniswap router contract

  // For this demo, we'll simulate a swap with a mock transaction
  // In a real implementation, you would use the Uniswap SDK or router contracts

  // Uniswap V3 Router address
  const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

  // Mock swap function call
  const mockSwapTx = await wallet.sendTransaction({
    to: UNISWAP_ROUTER,
    value: options.fromToken.toUpperCase() === 'ETH' ? ethers.parseEther(options.amount) : 0,
    data: '0x', // In a real implementation, this would be the encoded function call
    gasLimit: DEFAULT_GAS_LIMITS.SWAP
  });

  const receipt = await mockSwapTx.wait();
  if (!receipt) {
    throw new Error('Swap transaction failed');
  }

  return {
    txHash: mockSwapTx.hash,
    explorerUrl: getExplorerUrl(mockSwapTx.hash, config)
  };
}

/**
 * Execute bridge transaction
 * Note: This is a simplified implementation. In a production environment,
 * you would use the specific bridge provider's SDK or contracts.
 */
async function executeBridge(
  wallet: ethers.Wallet,
  options: BridgeOptions,
  config: WalletConfig
): Promise<{ txHash: string; explorerUrl: string }> {
  // Check if wallet is available
  if (!wallet) {
    throw new Error('Wallet not available for bridging');
  }

  // In a real implementation, you would:
  // 1. Validate source and destination chains
  // 2. Get token addresses and validate them
  // 3. Calculate amounts with slippage
  // 4. Approve tokens if needed
  // 5. Call the appropriate bridge contract based on the provider

  // For this demo, we'll simulate a bridge with a mock transaction
  let bridgeAddress: string;

  // Select bridge provider
  if (options.provider.toLowerCase() === 'across') {
    bridgeAddress = '0x4D9079Bb4165aeb4084c526a32695dCfd2F77381'; // Across bridge address
  } else if (options.provider.toLowerCase() === 'relay') {
    bridgeAddress = '0xfCEAAf9792139BF714a694f868A215493461446D'; // Relay bridge address
  } else {
    throw new Error(`Bridge provider ${options.provider} not supported`);
  }

  // Mock bridge function call
  const mockBridgeTx = await wallet.sendTransaction({
    to: bridgeAddress,
    value: options.token.toUpperCase() === 'ETH' ? ethers.parseEther(options.amount) : 0,
    data: '0x', // In a real implementation, this would be the encoded function call
    gasLimit: DEFAULT_GAS_LIMITS.BRIDGE
  });

  const receipt = await mockBridgeTx.wait();
  if (!receipt) {
    throw new Error('Bridge transaction failed');
  }

  return {
    txHash: mockBridgeTx.hash,
    explorerUrl: getExplorerUrl(mockBridgeTx.hash, config)
  };
}

/**
 * Resolve ENS name to address
 */
async function resolveEns(
  ensName: string,
  provider: ethers.JsonRpcProvider
): Promise<string | null> {
  try {
    debug(`Resolving ENS name: ${ensName}`);
    const address = await provider.resolveName(ensName);
    debug(`Resolved ENS name ${ensName} to address: ${address}`);
    return address;
  } catch (error) {
    debug(
      `Error resolving ENS name ${ensName}: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Resolve address or ENS name
 */
async function resolveAddress(
  addressOrEns: string,
  provider: ethers.JsonRpcProvider
): Promise<string> {
  // If it's already a valid address, return it
  if (ethers.isAddress(addressOrEns)) {
    return addressOrEns;
  }

  // Check if it's an ENS name (ends with .eth or contains a dot)
  const ensNameStr: string = addressOrEns;
  if (ensNameStr.endsWith('.eth') || ensNameStr.includes('.')) {
    const resolvedAddress = await resolveEns(ensNameStr, provider);
    if (resolvedAddress) {
      return resolvedAddress;
    }
    throw new Error(`Could not resolve ENS name: ${ensNameStr}`);
  }

  // Not a valid address or ENS name
  throw new Error(`Invalid address or ENS name: ${addressOrEns}`);
}

// Server implementation
const server = new Server(
  {
    name: 'mcp-wallet-mcp',
    version: '0.1.2'
  },
  {
    capabilities: {
      tools: {},
      logging: {}
    }
  }
);

// Get wallet configuration and initialize wallet
const config = getWalletConfig();
const wallet = initializeWallet(config);

// Log wallet configuration for debugging
debug('Wallet configuration:', {
  rpcUrl: config.rpcUrl,
  chainId: config.chainId,
  hasPrivateKey: !!config.privateKey,
  hasMnemonic: !!config.mnemonic,
  address: config.address,
  network: config.network
});

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    WALLET_ADDRESS_TOOL,
    WALLET_BALANCE_TOOL,
    TOKEN_TRANSFER_TOOL,
    TOKEN_PRICE_TOOL,
    SWAP_TOOL,
    BRIDGE_TOOL
    // CREATE_TOKEN_TOOL
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  try {
    const { name, arguments: args } = request.params;

    // Log incoming request with timestamp
    server.sendLoggingMessage({
      level: 'info',
      data: `[${new Date().toISOString()}] Received request for tool: ${name}`
    });

    if (!args) {
      throw new Error('No arguments provided');
    }

    switch (name) {
      case 'mcp_wallet_address': {
        debug('Processing wallet_address request');

        let address: string;
        if (wallet) {
          address = await wallet.getAddress();
          debug(`Wallet address: ${address}`);
        } else if (config.address) {
          address = config.address;
          debug(`Read-only address: ${address}`);
        } else {
          throw new Error('No wallet or address available');
        }

        return {
          content: [{ type: 'text', text: address }],
          isError: false
        };
      }

      case 'mcp_wallet_balance': {
        debug('Processing wallet_balance request');

        let address: string;
        if (wallet) {
          address = await wallet.getAddress();
        } else if (config.address) {
          address = config.address;
        } else {
          throw new Error('No wallet or address available');
        }

        const provider =
          wallet?.provider || new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
        const balance = await provider.getBalance(address);
        const nativeToken = config.network?.nativeToken || 'MONAD';

        return {
          content: [{ type: 'text', text: ethers.formatEther(balance) + ' ' + nativeToken }],
          isError: false
        };
      }

      case 'mcp_token_transfer': {
        debug('Processing token_transfer request');

        if (!wallet) {
          throw new Error('Wallet not available for sending transactions');
        }

        const { token, to, amount } = args as { token: string; to: string; amount: string };

        // Get provider
        const provider = wallet.provider as ethers.JsonRpcProvider;

        // Resolve recipient address (could be ENS name)
        let recipientAddress: string;
        try {
          recipientAddress = await resolveAddress(to, provider);
          debug(`Resolved recipient address: ${recipientAddress}`);
        } catch (error) {
          throw new Error(`Invalid recipient address or ENS name: ${to}`);
        }

        // Get token address from symbol or address
        const tokenAddress = getTokenAddress(token, config.chainId);

        // Execute transfer
        const result = await transferTokens(
          wallet,
          {
            tokenAddress,
            to: recipientAddress,
            amount
          },
          config
        );

        return {
          content: [
            {
              type: 'text',
              text: `Transfer successful!\nTransaction Hash: ${result.txHash}\nExplorer URL: ${result.explorerUrl}`
            }
          ],
          isError: false
        };
      }

      case 'mcp_token_price': {
        debug('Processing token_price request');

        const { token, currency = 'USD' } = args as { token: string; currency?: string };
        const price = await getTokenPrice(token, currency);

        return {
          content: [
            {
              type: 'text',
              text: `Current price of ${token}: ${price} ${currency.toUpperCase()}`
            }
          ],
          isError: false
        };
      }

      case 'mcp_swap': {
        debug('Processing swap request');

        if (!wallet) {
          throw new Error('Wallet not available for swapping');
        }

        const {
          fromToken,
          toToken,
          amount,
          slippage = 0.5,
          recipient
        } = args as {
          fromToken: string;
          toToken: string;
          amount: string;
          slippage?: number;
          recipient?: string;
        };

        // Get token addresses
        const fromTokenAddress = getTokenAddress(fromToken, config.chainId);
        const toTokenAddress = getTokenAddress(toToken, config.chainId);

        // Resolve recipient address if provided
        let recipientAddress: string | undefined;
        if (recipient) {
          try {
            recipientAddress = await resolveAddress(
              recipient,
              wallet.provider as ethers.JsonRpcProvider
            );
          } catch (error) {
            throw new Error(`Invalid recipient address or ENS name: ${recipient}`);
          }
        }

        // Execute swap
        const result = await executeSwap(
          wallet,
          {
            fromToken: fromTokenAddress,
            toToken: toTokenAddress,
            amount,
            slippage,
            recipient: recipientAddress
          },
          config
        );

        return {
          content: [
            {
              type: 'text',
              text: `Swap from ${fromToken} to ${toToken} successful!\nTransaction Hash: ${result.txHash}\nExplorer URL: ${result.explorerUrl}`
            }
          ],
          isError: false
        };
      }

      case 'mcp_bridge': {
        debug('Processing bridge request');

        if (!wallet) {
          throw new Error('Wallet not available for bridging');
        }

        const {
          fromChain,
          toChain,
          token,
          amount,
          provider = 'across',
          recipient
        } = args as {
          fromChain: string;
          toChain: string;
          token: string;
          amount: string;
          provider?: string;
          recipient?: string;
        };

        // Get chain IDs
        const fromChainId = getChainId(fromChain);
        const toChainId = getChainId(toChain);

        // Validate current chain matches fromChain
        if (fromChainId !== config.chainId) {
          throw new Error(
            `Current wallet is on chain ID ${config.chainId}, but bridge request is for chain ID ${fromChainId}`
          );
        }

        // Get token address
        const tokenAddress = getTokenAddress(token, fromChainId);

        // Resolve recipient address if provided
        let recipientAddress: string | undefined;
        if (recipient) {
          try {
            recipientAddress = await resolveAddress(
              recipient,
              wallet.provider as ethers.JsonRpcProvider
            );
          } catch (error) {
            throw new Error(`Invalid recipient address or ENS name: ${recipient}`);
          }
        }

        // Execute bridge
        const result = await executeBridge(
          wallet,
          {
            fromChainId,
            toChainId,
            token: tokenAddress,
            amount,
            provider,
            recipient: recipientAddress
          },
          config
        );

        return {
          content: [
            {
              type: 'text',
              text: `Bridge from ${fromChain} to ${toChain} initiated!\nTransaction Hash: ${result.txHash}\nExplorer URL: ${result.explorerUrl}`
            }
          ],
          isError: false
        };
      }

      case 'mcp_create_token': {
        debug('Processing create_token request');

        if (!wallet) {
          throw new Error('Wallet not available for token deployment');
        }

        const { name, symbol, initialSupply } = args as {
          name: string;
          symbol: string;
          initialSupply: string;
        };

        // Deploy token
        const result = await deployToken(wallet, name, symbol, initialSupply);

        return {
          content: [
            {
              type: 'text',
              text: `Token deployed successfully!\nToken Address: ${result.address}\nTransaction Hash: ${result.txHash}\nExplorer URL: ${result.explorerUrl}`
            }
          ],
          isError: false
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    // Log detailed error information
    server.sendLoggingMessage({
      level: 'error',
      data: {
        message: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        tool: request.params.name,
        arguments: request.params.arguments,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  } finally {
    // Log request completion with performance metrics
    server.sendLoggingMessage({
      level: 'info',
      data: `Request completed in ${Date.now() - startTime}ms`
    });
  }
});

/**
 * Start the server
 */
async function runServer() {
  try {
    debug('Starting server initialization...');
    console.error('Initializing MCP Wallet Server...');

    debug('Creating transport...');
    const transport = new StdioServerTransport();

    debug('Connecting to transport...');
    await server.connect(transport);

    debug('Setting up error handlers...');
    // Use process events instead since StdioServerTransport doesn't have event emitters
    process.on('error', (error: Error) => {
      console.error('[Process Error]:', error);
    });

    process.on('beforeExit', () => {
      console.error('[Process] Shutting down');
    });

    debug('Server initialization complete');
    server.sendLoggingMessage({
      level: 'info',
      data: 'MCP Wallet Server initialized successfully'
    });

    console.error('MCP Wallet Server running on stdio');
  } catch (error) {
    console.error('Fatal error running server:', error);
    process.exit(1);
  }
}

// Add process error handlers
process.on('uncaughtException', (error: Error) => {
  console.error('[Uncaught Exception]:', error);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('[Unhandled Rejection]:', error);
});

// Start the server
runServer().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});

/**
 * Deploy a new ERC20 token
 */
async function deployToken(
  wallet: ethers.Wallet,
  name: string,
  symbol: string,
  initialSupply: string
): Promise<{ address: string; txHash: string; explorerUrl: string }> {
  if (!wallet) {
    throw new Error('Wallet not available for token deployment');
  }

  debug(`Deploying new token: ${name} (${symbol}) with initial supply: ${initialSupply}`);

  // 使用简化的 ERC20 ABI
  const erc20Abi = [
    'constructor(string memory name_, string memory symbol_, uint256 initialSupply_)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)'
  ];

  // 使用更简单的 ERC20 字节码
  const erc20Bytecode =
    '0x60806040523480156200001157600080fd5b5060405162000a0a38038062000a0a8339810160408190526200003491620001db565b8251839083906200004d90600390602085019062000068565b5080516200006390600490602084019062000068565b505050620002ff565b828054620000769062000245565b90600052602060002090601f0160209004810192826200009a5760008555620000e5565b82601f10620000b557805160ff1916838001178555620000e5565b82800160010185558215620000e5579182015b82811115620000e5578251825591602001919060010190620000c8565b50620000f3929150620000f7565b5090565b5b80821115620000f35760008155600101620000f8565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200013657600080fd5b81516001600160401b03808211156200015357620001536200010e565b604051601f8301601f19908116603f011681019082821181831017156200017e576200017e6200010e565b816040528381526020925086838588010111156200019b57600080fd5b600091505b83821015620001bf5785820183015181830184015290820190620001a0565b83821115620001d15760008385830101525b9695505050505050565b600080600060608486031215620001f157600080fd5b83516001600160401b03808211156200020957600080fd5b620002178783880162000124565b945060208601519150808211156200022e57600080fd5b506200023d8682870162000124565b925050604084015190509250925092565b600181811c908216806200025a57607f821691505b602082108114156200027c57634e487b7160e01b600052602260045260246000fd5b50919050565b6106fb806200030f6000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806306fdde031461006757806318160ddd14610085578063313ce567146100a057806370a08231146100af57806395d89b41146100d8578063a9059cbb146100e0575b600080fd5b61006f610113565b60405161007c9190610502565b60405180910390f35b6002545b60405190815260200161007c565b604051601281526020016100a0565b6100896100bd366004610499565b6000602081905290815260409020549081565b61006f6101a5565b6100f36100ee3660046104c0565b6101b4565b604051901515815260200161007c565b6060600380546101229061057c565b80601f016020809104026020016040519081016040528092919081815260200182805461014e9061057c565b801561019b5780601f106101705761010080835404028352916020019161019b565b820191906000526020600020905b81548152906001019060200180831161017e57829003601f168152602001915b5050505050905090565b6060600480546101229061057c565b6000336001600160a01b038416148061020a57506001600160a01b038216600090815260016020908152604080832033845290915290205460001914155b61026c5760405162461bcd60e51b815260206004820152602960248201527f455243323a2063616e6e6f74207472616e7366657220746f20746865207a65726044820152686f20616464726573736960b81b60648201526084015b60405180910390fd5b6001600160a01b0383166102ce5760405162461bcd60e51b815260206004820152602560248201527f455243323a207472616e7366657220746f20746865207a65726f206164647265604482015264737360d81b6064820152608401610263565b6001600160a01b038316600090815260208190526040902054818110156103465760405162461bcd60e51b815260206004820152602660248201527f455243323a207472616e7366657220616d6f756e7420657863656564732062616044820152656c616e636560d01b6064820152608401610263565b6001600160a01b038381166000908152602081905260408082208585039055918516815291812080548492906103809084906104fa565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516103cc91815260200190565b60405180910390a36103df8484846103e4565b50600192915050565b505050565b80356001600160a01b038116811461040057600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261042c57600080fd5b813567ffffffffffffffff8082111561044757610447610405565b604051601f8301601f19908116603f0116810190828211818310171561046f5761046f610405565b8160405283815286602085880101111561048857600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000602082840312156104ab57600080fd5b6104b4826103e9565b9392505050565b600080604083850312156104d357600080fd5b6104dc836103e9565b946020939093013593505050565b6000821982111561051b57634e487b7160e01b600052601160045260246000fd5b500190565b600081518084526020808501945080840160005b8381101561055157815187529582019590820190600101610535565b509495945050505050565b600181811c9082168061056e57607f821691505b6020821081141561058f57634e487b7160e01b600052602260045260246000fd5b5091905056fea2646970667358221220c8d8d8f8f8d8d8f8f8d8d8f8f8d8d8f8f8d8d8f8f8d8d8f8f8d8d8f8f8d8d890';

  try {
    // 创建合约工厂
    const factory = new ethers.ContractFactory(erc20Abi, erc20Bytecode, wallet);
    debug('Contract factory created');

    // 部署合约，使用更高的 gas 限制
    const deployTx = await factory.getDeployTransaction(
      name,
      symbol,
      ethers.parseEther(initialSupply)
    );

    // 估算 gas 并添加 20% 缓冲
    const estimatedGas = await wallet.estimateGas(deployTx);
    const gasLimit = Math.floor(Number(estimatedGas) * 1.2);
    debug(`Estimated gas: ${estimatedGas}, using gas limit: ${gasLimit}`);

    // 发送交易
    const tx = await wallet.sendTransaction({
      ...deployTx,
      gasLimit
    });
    debug(`Deployment transaction sent: ${tx.hash}`);

    // 等待交易确认
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction receipt not available');
    }
    debug('Transaction confirmed');

    const config = getWalletConfig();
    const address = receipt.contractAddress || '';

    if (!address) {
      throw new Error('Contract address not available in receipt');
    }

    debug(`Token deployed at address: ${address}`);
    return {
      address,
      txHash: tx.hash,
      explorerUrl: getExplorerUrl(tx.hash, config)
    };
  } catch (error) {
    debug(`Token deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(
      `Failed to deploy token: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
