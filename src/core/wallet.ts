import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import {
  IWallet,
  WalletConfig,
  TransactionOptions,
  TokenTransferOptions,
  SwapOptions,
  BridgeOptions
} from '../interfaces/wallet';
import { ERC20_ABI } from '../utils/constants';

/**
 * Core wallet implementation using ethers.js
 */
export class EvmMcpWallet implements IWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private mnemonic: string | null = null;
  private chainId: number;

  /**
   * Create a new wallet instance
   * @param config Wallet configuration
   */
  constructor(config: WalletConfig) {
    this.chainId = config.chainId;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl, this.chainId);

    if (config.privateKey) {
      // Initialize from private key
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    } else if (config.mnemonic) {
      // Initialize from mnemonic
      this.mnemonic = config.mnemonic;
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
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } else {
      throw new Error('Either privateKey or mnemonic must be provided');
    }
  }

  /**
   * Get the wallet's address
   * @returns Wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get the wallet's private key
   * @returns Private key
   */
  getPrivateKey(): string {
    return this.wallet.privateKey;
  }

  /**
   * Get the wallet's mnemonic phrase (if available)
   * @returns Mnemonic phrase or null
   */
  getMnemonic(): string | null {
    return this.mnemonic;
  }

  /**
   * Get the native token balance (ETH, MATIC, etc.)
   * @returns Balance in ETH/native token
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get the balance of a specific token
   * @param tokenAddress Token contract address
   * @param decimals Token decimals (defaults to 18)
   * @returns Token balance
   */
  async getTokenBalance(tokenAddress: string, decimals: number = 18): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await tokenContract.balanceOf(this.wallet.address);
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Send a transaction
   * @param options Transaction options
   * @returns Transaction hash
   */
  async sendTransaction(options: TransactionOptions): Promise<string> {
    const tx: ethers.TransactionRequest = {
      to: options.to,
      chainId: this.chainId
    };

    if (options.value) {
      tx.value = ethers.parseEther(options.value);
    }

    if (options.data) {
      tx.data = options.data;
    }

    if (options.gasLimit) {
      tx.gasLimit = BigInt(options.gasLimit);
    }

    if (options.gasPrice) {
      tx.gasPrice = ethers.parseUnits(options.gasPrice.toString(), 'gwei');
    }

    if (options.maxFeePerGas) {
      tx.maxFeePerGas = ethers.parseUnits(options.maxFeePerGas.toString(), 'gwei');
    }

    if (options.maxPriorityFeePerGas) {
      tx.maxPriorityFeePerGas = ethers.parseUnits(options.maxPriorityFeePerGas.toString(), 'gwei');
    }

    if (options.nonce !== undefined) {
      tx.nonce = options.nonce;
    }

    const txResponse = await this.wallet.sendTransaction(tx);
    return txResponse.hash;
  }

  /**
   * Send tokens
   * @param options Token transfer options
   * @returns Transaction hash
   */
  async sendToken(options: TokenTransferOptions): Promise<string> {
    const tokenContract = new ethers.Contract(options.tokenAddress, ERC20_ABI, this.wallet);
    const decimals = options.decimals || 18;
    const amount = ethers.parseUnits(options.amount, decimals);

    const tx: ethers.TransactionRequest = {
      chainId: this.chainId
    };

    if (options.gasLimit) {
      tx.gasLimit = BigInt(options.gasLimit);
    }

    if (options.gasPrice) {
      tx.gasPrice = ethers.parseUnits(options.gasPrice.toString(), 'gwei');
    }

    const txResponse = await tokenContract.transfer(options.to, amount, tx);
    return txResponse.hash;
  }

  /**
   * Sign a message
   * @param message Message to sign
   * @returns Signature
   */
  async signMessage(message: string): Promise<string> {
    return await this.wallet.signMessage(message);
  }

  /**
   * Sign a transaction
   * @param options Transaction options
   * @returns Signed transaction
   */
  async signTransaction(options: TransactionOptions): Promise<string> {
    const tx: ethers.TransactionRequest = {
      to: options.to,
      chainId: this.chainId
    };

    if (options.value) {
      tx.value = ethers.parseEther(options.value);
    }

    if (options.data) {
      tx.data = options.data;
    }

    if (options.gasLimit) {
      tx.gasLimit = BigInt(options.gasLimit);
    }

    if (options.gasPrice) {
      tx.gasPrice = ethers.parseUnits(options.gasPrice.toString(), 'gwei');
    }

    if (options.maxFeePerGas) {
      tx.maxFeePerGas = ethers.parseUnits(options.maxFeePerGas.toString(), 'gwei');
    }

    if (options.maxPriorityFeePerGas) {
      tx.maxPriorityFeePerGas = ethers.parseUnits(options.maxPriorityFeePerGas.toString(), 'gwei');
    }

    if (options.nonce !== undefined) {
      tx.nonce = options.nonce;
    }

    return await this.wallet.signTransaction(tx);
  }

  /**
   * Swap tokens using integrated DEX
   * @param options Swap options
   * @returns Transaction hash
   */
  async swap(options: SwapOptions): Promise<string> {
    // This is a placeholder - the actual implementation will be in a separate module
    throw new Error('Swap functionality not implemented yet. Please use the UniswapService.');
  }

  /**
   * Bridge assets across chains
   * @param options Bridge options
   * @returns Transaction hash
   */
  async bridge(options: BridgeOptions): Promise<string> {
    // This is a placeholder - the actual implementation will be in a separate module
    throw new Error('Bridge functionality not implemented yet. Please use the BridgeService.');
  }
}
