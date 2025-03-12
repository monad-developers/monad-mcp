import { JsonRpcProvider as EthersJsonRpcProvider, Wallet } from 'ethers';
import { BaseProvider } from './BaseProvider';
import {
  TransactionOptions,
  TokenTransferOptions,
  SwapOptions,
  BridgeOptions
} from '../interfaces/wallet';
import { formatEther, parseEther } from 'ethers';

/**
 * JSON-RPC provider implementation
 */
export class JsonRpcProvider extends BaseProvider {
  constructor(rpcUrl: string, privateKey?: string) {
    const provider = new EthersJsonRpcProvider(rpcUrl);
    const signer = privateKey ? new Wallet(privateKey, provider) : undefined;
    super(provider, signer);
  }

  /**
   * Send a transaction
   */
  async sendTransaction(options: TransactionOptions): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    const tx = await this.signer.sendTransaction({
      to: options.to,
      value: options.value ? parseEther(options.value) : 0n,
      data: options.data,
      gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
      maxFeePerGas: options.maxFeePerGas ? BigInt(options.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: options.maxPriorityFeePerGas
        ? BigInt(options.maxPriorityFeePerGas)
        : undefined,
      nonce: options.nonce
    });

    return tx.hash;
  }

  /**
   * Send tokens
   */
  async sendToken(options: TokenTransferOptions): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available');
    }

    // ERC20 transfer function signature
    const data =
      '0xa9059cbb' +
      options.to.slice(2).padStart(64, '0') +
      BigInt(options.amount).toString(16).padStart(64, '0');

    const tx = await this.signer.sendTransaction({
      to: options.tokenAddress,
      data,
      gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
      gasPrice: options.gasPrice ? BigInt(options.gasPrice) : undefined
    });

    return tx.hash;
  }

  /**
   * Swap tokens using DEX
   */
  async swap(options: SwapOptions): Promise<string> {
    throw new Error('Swap functionality not implemented in JsonRpcProvider');
  }

  /**
   * Bridge assets across chains
   */
  async bridge(options: BridgeOptions): Promise<string> {
    throw new Error('Bridge functionality not implemented in JsonRpcProvider');
  }
}
