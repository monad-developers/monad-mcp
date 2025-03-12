import { ethers } from 'ethers';
import { Token, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core';
import { Pool, Route, SwapQuoter, SwapRouter, Trade } from '@uniswap/v3-sdk';
import { IWallet } from '../../interfaces/wallet';
import { SwapOptions } from '../../interfaces/wallet';
import { ETHEREUM_TOKENS, CHAIN_IDS } from '../../utils/constants';

// Uniswap contract addresses
const UNISWAP_CONTRACTS = {
  SWAP_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  QUOTER: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
};

// Common token decimals
const TOKEN_DECIMALS: {[key: string]: number} = {
  ETH: 18,
  WETH: 18,
  USDT: 6,
  USDC: 6,
  DAI: 18,
  WBTC: 8
};

/**
 * Service for interacting with Uniswap protocol
 */
export class UniswapService {
  private wallet: IWallet;
  private provider: ethers.JsonRpcProvider;
  private chainId: number;

  /**
   * Create a new UniswapService instance
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
   * Get token address from symbol or address
   * @param tokenSymbolOrAddress Token symbol or address
   * @returns Token address
   */
  private getTokenAddress(tokenSymbolOrAddress: string): string {
    // If it's already an address, return it
    if (tokenSymbolOrAddress.startsWith('0x')) {
      return tokenSymbolOrAddress;
    }

    // Check if it's a known token symbol
    const upperSymbol = tokenSymbolOrAddress.toUpperCase();
    if (this.chainId === CHAIN_IDS.ETHEREUM && ETHEREUM_TOKENS[upperSymbol]) {
      return ETHEREUM_TOKENS[upperSymbol];
    }

    throw new Error(`Unknown token symbol: ${tokenSymbolOrAddress}`);
  }

  /**
   * Get token decimals
   * @param tokenSymbolOrAddress Token symbol or address
   * @returns Token decimals
   */
  private async getTokenDecimals(tokenSymbolOrAddress: string): Promise<number> {
    // Check if it's a known token
    const upperSymbol = tokenSymbolOrAddress.toUpperCase();
    if (TOKEN_DECIMALS[upperSymbol]) {
      return TOKEN_DECIMALS[upperSymbol];
    }

    // If it's an address, fetch decimals from contract
    if (tokenSymbolOrAddress.startsWith('0x')) {
      const tokenContract = new ethers.Contract(
        tokenSymbolOrAddress,
        ['function decimals() view returns (uint8)'],
        this.provider
      );
      return await tokenContract.decimals();
    }

    // Default to 18 decimals
    return 18;
  }

  /**
   * Swap tokens using Uniswap
   * @param options Swap options
   * @returns Transaction hash
   */
  async swap(options: SwapOptions): Promise<string> {
    const fromTokenAddress = this.getTokenAddress(options.fromToken);
    const toTokenAddress = this.getTokenAddress(options.toToken);

    // Get token decimals
    const fromTokenDecimals = await this.getTokenDecimals(options.fromToken);
    const toTokenDecimals = await this.getTokenDecimals(options.toToken);

    // Create token instances
    const fromToken = new Token(this.chainId, fromTokenAddress, fromTokenDecimals);
    const toToken = new Token(this.chainId, toTokenAddress, toTokenDecimals);

    // Parse amount
    const amountIn = ethers.parseUnits(options.amount, fromTokenDecimals);

    // Create currency amount
    const currencyAmountIn = CurrencyAmount.fromRawAmount(fromToken, amountIn.toString());

    // Set slippage tolerance
    const slippageTolerance = new Percent(Math.floor(options.slippage * 100), 10000);

    // Set deadline
    const deadline = Math.floor(Date.now() / 1000) + (options.deadline || 20) * 60;

    // Get recipient address
    const recipient = options.recipient || this.wallet.getAddress();

    // Create Uniswap router contract
    const routerContract = new ethers.Contract(
      UNISWAP_CONTRACTS.SWAP_ROUTER,
      [
        'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
        'function exactInput(tuple(bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)'
      ],
      this.provider
    );

    // For simplicity, we'll use exactInputSingle which uses a single pool
    // In a production environment, you'd want to find the best route

    // Get quote for the swap
    const quoterContract = new ethers.Contract(
      UNISWAP_CONTRACTS.QUOTER,
      [
        'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
      ],
      this.provider
    );

    // Use 0.3% fee pool by default
    const poolFee = 3000;

    // Get quote
    const quoteAmountOut = await quoterContract.quoteExactInputSingle(
      fromTokenAddress,
      toTokenAddress,
      poolFee,
      amountIn,
      0
    );

    // Calculate minimum amount out based on slippage
    const minimumAmountOut = quoteAmountOut
      .mul(10000 - Math.floor(options.slippage * 100))
      .div(10000);

    // Prepare transaction parameters
    const params = {
      tokenIn: fromTokenAddress,
      tokenOut: toTokenAddress,
      fee: poolFee,
      recipient,
      deadline,
      amountIn,
      amountOutMinimum: minimumAmountOut,
      sqrtPriceLimitX96: 0
    };

    // If swapping ETH, we need to use the WETH address and send ETH with the transaction
    const value = options.fromToken.toUpperCase() === 'ETH' ? amountIn : 0;

    // Sign and send transaction
    const txData = routerContract.interface.encodeFunctionData('exactInputSingle', [params]);

    // Send transaction
    return await this.wallet.sendTransaction({
      to: UNISWAP_CONTRACTS.SWAP_ROUTER,
      value: value.toString(),
      data: txData,
      gasLimit: 300000 // Estimate gas limit
    });
  }
}
