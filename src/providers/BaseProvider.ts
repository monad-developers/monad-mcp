import { Provider, Signer, JsonRpcProvider } from 'ethers';
import { TransactionOptions, TokenTransferOptions, SwapOptions, BridgeOptions } from '../interfaces/wallet';

/**
 * Base provider class that implements common functionality
 */
export abstract class BaseProvider {
  protected provider: JsonRpcProvider;
  protected signer?: Signer;

  constructor(provider: JsonRpcProvider, signer?: Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Get the current provider
   */
  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get the current signer if available
   */
  getSigner(): Signer | undefined {
    return this.signer;
  }

  /**
   * Check if the provider has a signer
   */
  hasSigner(): boolean {
    return !!this.signer;
  }

  /**
   * Get the chain ID
   */
  async getChainId(): Promise<string> {
    const network = await this.provider.getNetwork();
    return network.chainId.toString();
  }

  /**
   * Get the current gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice ?? 0n;
  }

  /**
   * Get the current block number
   */
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Abstract methods that must be implemented by specific providers
   */
  abstract sendTransaction(options: TransactionOptions): Promise<string>;
  abstract sendToken(options: TokenTransferOptions): Promise<string>;
  abstract swap(options: SwapOptions): Promise<string>;
  abstract bridge(options: BridgeOptions): Promise<string>;
} 