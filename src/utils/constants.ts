/**
 * Standard ERC20 ABI
 */
export const ERC20_ABI = [
  // Read-only functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  // Write functions
  'function transfer(address to, uint256 value) returns (bool)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

/**
 * Chain IDs for supported networks
 */
export const CHAIN_IDS = {
  MONAD: 201,
  MONAD_TESTNET: 10143,
  ETHEREUM: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GOERLI: 5,
  KOVAN: 42,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
  ARBITRUM_ONE: 42161,
  ARBITRUM_NOVA: 42170,
  OPTIMISM: 10,
  BSC: 56,
  BSC_TESTNET: 97,
  AVALANCHE: 43114,
  AVALANCHE_FUJI: 43113,
  FANTOM: 250,
  FANTOM_TESTNET: 4002,
  GNOSIS: 100,
  CELO: 42220,
  HARMONY: 1666600000,
  MOONBEAM: 1284,
  MOONRIVER: 1285,
  METIS: 1088,
  CRONOS: 25,
  AURORA: 1313161554,
  BOBA: 288
};

/**
 * Common token addresses on Monad mainnet
 */
export const MONAD_TOKENS: { [key: string]: string } = {
  MONAD: 'MONAD', // Native token
  WMONAD: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Placeholder - replace with actual address
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Placeholder - replace with actual address
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Placeholder - replace with actual address
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F' // Placeholder - replace with actual address
};

/**
 * Common token addresses on Ethereum mainnet
 */
export const ETHEREUM_TOKENS: { [key: string]: string } = {
  ETH: 'ETH', // Native token
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  SUSHI: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'
};

/**
 * Default gas limits for common operations
 */
export const DEFAULT_GAS_LIMITS = {
  ETH_TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  ERC20_APPROVE: 45000,
  SWAP: 250000,
  BRIDGE: 300000,
  TOKEN_DEPLOY: 3000000
};

/**
 * Default derivation paths for different chains
 */
export const DERIVATION_PATHS = {
  MONAD: "m/44'/60'/0'/0/0", // Same as Ethereum
  ETHEREUM: "m/44'/60'/0'/0/0",
  POLYGON: "m/44'/60'/0'/0/0", // Same as Ethereum
  BSC: "m/44'/60'/0'/0/0", // Same as Ethereum
  AVALANCHE: "m/44'/60'/0'/0/0", // Same as Ethereum
  ARBITRUM: "m/44'/60'/0'/0/0", // Same as Ethereum
  OPTIMISM: "m/44'/60'/0'/0/0" // Same as Ethereum
};

/**
 * RPC URLs for different networks (placeholders - users should provide their own)
 */
export const DEFAULT_RPC_URLS = {
  [CHAIN_IDS.MONAD]: 'https://rpc.monad.xyz',
  [CHAIN_IDS.MONAD_TESTNET]: 'https://rpc-testnet.monad.xyz',
  [CHAIN_IDS.ETHEREUM]: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  [CHAIN_IDS.POLYGON]: 'https://polygon-rpc.com',
  [CHAIN_IDS.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
  [CHAIN_IDS.OPTIMISM]: 'https://mainnet.optimism.io',
  [CHAIN_IDS.BSC]: 'https://bsc-dataseed.binance.org',
  [CHAIN_IDS.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc'
};
