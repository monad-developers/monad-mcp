/**
 * Wallet configuration options
 */
export interface WalletConfig {
  /**
   * Private key for the wallet (hex string with or without 0x prefix)
   */
  privateKey?: string;

  /**
   * Mnemonic phrase (12, 15, 18, 21, or 24 words)
   */
  mnemonic?: string;

  /**
   * RPC URL for connecting to the blockchain
   */
  rpcUrl: string;

  /**
   * Chain ID for the target blockchain
   */
  chainId: number;

  /**
   * Optional derivation path for HD wallets (defaults to m/44'/60'/0'/0/0 for Ethereum)
   */
  derivationPath?: string;

  /**
   * Optional index for the HD wallet (defaults to 0)
   */
  accountIndex?: number;

  /**
   * Wallet address for read-only mode
   */
  address?: string;

  /**
   * Enable Multi-Party Computation (MPC) for enhanced security
   */
  enableMpc?: boolean;

  /**
   * Maximum gas fee in GWEI
   */
  maxFeePerGas?: string;

  /**
   * Seconds to wait for transaction approval
   */
  approvalTimeout?: number;

  /**
   * Network information
   */
  network?: {
    /**
     * Network name (e.g., "Monad Mainnet")
     */
    name: string;

    /**
     * Block explorer URL
     */
    explorerUrl: string;

    /**
     * Native token symbol (e.g., "MONAD")
     */
    nativeToken: string;
  };
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  /**
   * Recipient address
   */
  to: string;

  /**
   * Amount to send in ETH/native token
   */
  value?: string;

  /**
   * Transaction data (hex string)
   */
  data?: string;

  /**
   * Gas limit for the transaction
   */
  gasLimit?: number | string;

  /**
   * Gas price in Gwei
   */
  gasPrice?: number | string;

  /**
   * Max fee per gas (for EIP-1559 transactions)
   */
  maxFeePerGas?: number | string;

  /**
   * Max priority fee per gas (for EIP-1559 transactions)
   */
  maxPriorityFeePerGas?: number | string;

  /**
   * Nonce for the transaction
   */
  nonce?: number;
}

/**
 * Token transfer options
 */
export interface TokenTransferOptions {
  /**
   * Token contract address
   */
  tokenAddress: string;

  /**
   * Recipient address
   */
  to: string;

  /**
   * Amount to send (in token units)
   */
  amount: string;

  /**
   * Token decimals (defaults to 18)
   */
  decimals?: number;

  /**
   * Gas limit for the transaction
   */
  gasLimit?: number | string;

  /**
   * Gas price in Gwei
   */
  gasPrice?: number | string;
}

/**
 * Swap options for DEX integrations
 */
export interface SwapOptions {
  /**
   * Source token (address or symbol)
   */
  fromToken: string;

  /**
   * Destination token (address or symbol)
   */
  toToken: string;

  /**
   * Amount to swap (in fromToken units)
   */
  amount: string;

  /**
   * Maximum slippage percentage (e.g., 0.5 for 0.5%)
   */
  slippage: number;

  /**
   * Recipient address (defaults to wallet address)
   */
  recipient?: string;

  /**
   * Deadline in minutes (defaults to 20)
   */
  deadline?: number;
}

/**
 * Bridge options for cross-chain transfers
 */
export interface BridgeOptions {
  /**
   * Source chain ID
   */
  fromChainId: number;

  /**
   * Destination chain ID
   */
  toChainId: number;

  /**
   * Token to bridge (address or symbol)
   */
  token: string;

  /**
   * Amount to bridge (in token units)
   */
  amount: string;

  /**
   * Bridge provider to use ('across', 'relay', etc.)
   */
  provider: 'across' | 'relay' | string;

  /**
   * Recipient address (defaults to wallet address on destination chain)
   */
  recipient?: string;

  /**
   * Maximum slippage percentage (e.g., 0.5 for 0.5%)
   */
  slippage?: number;
}

/**
 * Wallet interface
 */
export interface IWallet {
  /**
   * Get the wallet's address
   */
  getAddress(): string;

  /**
   * Get the wallet's private key
   */
  getPrivateKey(): string;

  /**
   * Get the wallet's mnemonic phrase (if available)
   */
  getMnemonic(): string | null;

  /**
   * Get the native token balance (ETH, MATIC, etc.)
   */
  getBalance(): Promise<string>;

  /**
   * Get the balance of a specific token
   */
  getTokenBalance(tokenAddress: string, decimals?: number): Promise<string>;

  /**
   * Send a transaction
   */
  sendTransaction(options: TransactionOptions): Promise<string>;

  /**
   * Send tokens
   */
  sendToken(options: TokenTransferOptions): Promise<string>;

  /**
   * Sign a message
   */
  signMessage(message: string): Promise<string>;

  /**
   * Sign a transaction
   */
  signTransaction(options: TransactionOptions): Promise<string>;

  /**
   * Swap tokens using integrated DEX
   */
  swap(options: SwapOptions): Promise<string>;

  /**
   * Bridge assets across chains
   */
  bridge(options: BridgeOptions): Promise<string>;
}
