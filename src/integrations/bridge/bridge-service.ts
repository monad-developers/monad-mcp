import { ethers } from 'ethers';
import axios from 'axios';
import { IWallet } from '../../interfaces/wallet';
import { BridgeOptions } from '../../interfaces/wallet';
import { CHAIN_IDS } from '../../utils/constants';

// Across Protocol contract addresses
const ACROSS_CONTRACTS = {
  SPOKE_POOL: {
    [CHAIN_IDS.ETHEREUM]: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
    [CHAIN_IDS.POLYGON]: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096',
    [CHAIN_IDS.ARBITRUM_ONE]: '0xB88690461dDbaB6f04Dfad7df66B7725942FEb9C',
    [CHAIN_IDS.OPTIMISM]: '0x6f26Bf09B1C792e3228e5467807a900A503c0281'
  }
};

// Relay.link contract addresses
const RELAY_CONTRACTS = {
  BRIDGE: {
    [CHAIN_IDS.ETHEREUM]: '0x123...', // Replace with actual address
    [CHAIN_IDS.POLYGON]: '0x456...', // Replace with actual address
    [CHAIN_IDS.ARBITRUM_ONE]: '0x789...' // Replace with actual address
  }
};

/**
 * Service for cross-chain bridge operations
 */
export class BridgeService {
  private wallet: IWallet;
  private provider: ethers.JsonRpcProvider;
  private chainId: number;

  /**
   * Create a new BridgeService instance
   * @param wallet Wallet instance
   * @param provider JSON RPC provider
   * @param chainId Chain ID
   */
  constructor(wallet: IWallet, provider: ethers.JsonRpcProvider, chainId: number) {
    this.wallet = wallet;
    this.provider = provider;
    this.chainId = chainId;
  }

  /**
   * Bridge assets across chains
   * @param options Bridge options
   * @returns Transaction hash
   */
  async bridge(options: BridgeOptions): Promise<string> {
    // Validate chain IDs
    if (options.fromChainId !== this.chainId) {
      throw new Error(
        `Current wallet is connected to chain ${this.chainId}, but fromChainId is ${options.fromChainId}`
      );
    }

    // Select bridge provider
    switch (options.provider.toLowerCase()) {
      case 'across':
        return this.bridgeWithAcross(options);
      case 'relay':
        return this.bridgeWithRelay(options);
      default:
        throw new Error(`Unsupported bridge provider: ${options.provider}`);
    }
  }

  /**
   * Bridge assets using Across Protocol
   * @param options Bridge options
   * @returns Transaction hash
   */
  private async bridgeWithAcross(options: BridgeOptions): Promise<string> {
    // Check if Across supports the source and destination chains
    if (!ACROSS_CONTRACTS.SPOKE_POOL[options.fromChainId]) {
      throw new Error(`Across Protocol does not support source chain ${options.fromChainId}`);
    }
    if (!ACROSS_CONTRACTS.SPOKE_POOL[options.toChainId]) {
      throw new Error(`Across Protocol does not support destination chain ${options.toChainId}`);
    }

    // Get token address
    const tokenAddress =
      options.token === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : options.token;

    // Parse amount
    const amount = ethers.parseEther(options.amount);

    // Get recipient address (default to the same address on the destination chain)
    const recipient = options.recipient || this.wallet.getAddress();

    // Set relayer fee (default to 0.1% of the amount)
    const relayerFee = options.slippage
      ? (amount * BigInt(Math.floor(options.slippage * 1000))) / BigInt(1000)
      : (amount * BigInt(1)) / BigInt(1000);

    // Create Across SpokePool contract instance
    const spokePoolContract = new ethers.Contract(
      ACROSS_CONTRACTS.SPOKE_POOL[options.fromChainId],
      [
        'function deposit(address recipient, address originToken, uint256 amount, uint256 destinationChainId, uint256 relayerFeePct, uint32 quoteTimestamp) external payable returns (uint256)',
        'function depositV3(tuple(address recipient, address originToken, address destinationToken, uint256 amount, uint256 destinationChainId, uint256 relayerFeePct, uint256 quoteTimestamp, bytes message, uint32 maxCount)) external payable returns (uint256)'
      ],
      this.provider
    );

    // Current timestamp for quote
    const quoteTimestamp = Math.floor(Date.now() / 1000);

    // Prepare transaction parameters for depositV3
    const depositParams = {
      recipient,
      originToken: tokenAddress,
      destinationToken: tokenAddress, // Same token on destination
      amount,
      destinationChainId: options.toChainId,
      relayerFeePct: relayerFee,
      quoteTimestamp,
      message: '0x', // Empty message
      maxCount: 0 // No max count
    };

    // Value to send with transaction (only if bridging ETH)
    const value = options.token === 'ETH' ? amount : 0;

    // Sign and send transaction
    const txData = spokePoolContract.interface.encodeFunctionData('depositV3', [depositParams]);

    // Send transaction
    return await this.wallet.sendTransaction({
      to: ACROSS_CONTRACTS.SPOKE_POOL[options.fromChainId],
      value: value.toString(),
      data: txData,
      gasLimit: 300000 // Estimate gas limit
    });
  }

  /**
   * Bridge assets using Relay.link
   * @param options Bridge options
   * @returns Transaction hash
   */
  private async bridgeWithRelay(options: BridgeOptions): Promise<string> {
    // Check if Relay.link supports the source and destination chains
    if (!RELAY_CONTRACTS.BRIDGE[options.fromChainId]) {
      throw new Error(`Relay.link does not support source chain ${options.fromChainId}`);
    }
    if (!RELAY_CONTRACTS.BRIDGE[options.toChainId]) {
      throw new Error(`Relay.link does not support destination chain ${options.toChainId}`);
    }

    // Get token address
    const tokenAddress =
      options.token === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : options.token;

    // Parse amount
    const amount = ethers.parseEther(options.amount);

    // Get recipient address (default to the same address on the destination chain)
    const recipient = options.recipient || this.wallet.getAddress();

    // Create Relay.link Bridge contract instance
    const bridgeContract = new ethers.Contract(
      RELAY_CONTRACTS.BRIDGE[options.fromChainId],
      [
        'function bridge(address token, uint256 amount, uint256 destinationChainId, address recipient) external payable returns (uint256)'
      ],
      this.provider
    );

    // Value to send with transaction (only if bridging ETH)
    const value = options.token === 'ETH' ? amount : 0;

    // Sign and send transaction
    const txData = bridgeContract.interface.encodeFunctionData('bridge', [
      tokenAddress,
      amount,
      options.toChainId,
      recipient
    ]);

    // Send transaction
    return await this.wallet.sendTransaction({
      to: RELAY_CONTRACTS.BRIDGE[options.fromChainId],
      value: value.toString(),
      data: txData,
      gasLimit: 300000 // Estimate gas limit
    });
  }
}
