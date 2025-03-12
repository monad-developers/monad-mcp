import { ethers } from 'ethers';
import {
  createWallet,
  CHAIN_IDS,
  UniswapService,
  BridgeService
} from '../src';

async function main() {
  try {
    // Initialize wallet with private key
    const wallet = createWallet({
      privateKey: '0xYourPrivateKey', // Replace with your private key
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
      chainId: CHAIN_IDS.ETHEREUM
    });

    // Get wallet address
    const address = wallet.getAddress();
    console.log('Wallet address:', address);

    // Create provider
    const provider = new ethers.JsonRpcProvider(
      'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
      CHAIN_IDS.ETHEREUM
    );

    // Example 1: Swap ETH to USDC using Uniswap
    console.log('\n--- Uniswap Swap Example ---');
    
    // Create Uniswap service
    const uniswapService = new UniswapService(
      wallet,
      provider,
      CHAIN_IDS.ETHEREUM
    );
    
    // Get ETH balance before swap
    const ethBalanceBefore = await wallet.getBalance();
    console.log('ETH Balance before swap:', ethBalanceBefore);
    
    // Get USDC balance before swap
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on Ethereum
    const usdcBalanceBefore = await wallet.getTokenBalance(usdcAddress, 6);
    console.log('USDC Balance before swap:', usdcBalanceBefore);
    
    // Swap ETH to USDC (uncomment to execute)
    /*
    const swapTxHash = await uniswapService.swap({
      fromToken: 'ETH',
      toToken: usdcAddress,
      amount: '0.01', // 0.01 ETH
      slippage: 0.5 // 0.5% slippage tolerance
    });
    console.log('Swap transaction hash:', swapTxHash);
    
    // Wait for transaction to be mined
    console.log('Waiting for swap transaction to be mined...');
    await provider.waitForTransaction(swapTxHash);
    
    // Get balances after swap
    const ethBalanceAfter = await wallet.getBalance();
    const usdcBalanceAfter = await wallet.getTokenBalance(usdcAddress, 6);
    
    console.log('ETH Balance after swap:', ethBalanceAfter);
    console.log('USDC Balance after swap:', usdcBalanceAfter);
    console.log('ETH spent:', parseFloat(ethBalanceBefore) - parseFloat(ethBalanceAfter));
    console.log('USDC received:', parseFloat(usdcBalanceAfter) - parseFloat(usdcBalanceBefore));
    */
    
    // Example 2: Bridge ETH from Ethereum to Polygon using Across Protocol
    console.log('\n--- Across Protocol Bridge Example ---');
    
    // Create Bridge service
    const bridgeService = new BridgeService(
      wallet,
      provider,
      CHAIN_IDS.ETHEREUM
    );
    
    // Bridge ETH to Polygon (uncomment to execute)
    /*
    const bridgeTxHash = await bridgeService.bridge({
      fromChainId: CHAIN_IDS.ETHEREUM,
      toChainId: CHAIN_IDS.POLYGON,
      token: 'ETH',
      amount: '0.01', // 0.01 ETH
      provider: 'across', // Use Across Protocol
      slippage: 0.5 // 0.5% slippage tolerance
    });
    console.log('Bridge transaction hash:', bridgeTxHash);
    
    // Wait for transaction to be mined
    console.log('Waiting for bridge transaction to be mined...');
    await provider.waitForTransaction(bridgeTxHash);
    
    console.log('Bridge transaction mined. Funds will arrive on Polygon shortly.');
    */
    
    // Example 3: Sign a typed data message (EIP-712)
    console.log('\n--- EIP-712 Typed Data Signing Example ---');
    
    const domain = {
      name: 'EVM-MCP Wallet',
      version: '1',
      chainId: CHAIN_IDS.ETHEREUM,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    };
    
    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
      ]
    };
    
    const value = {
      from: {
        name: 'Alice',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
      },
      contents: 'Hello, Web3!'
    };
    
    // Sign typed data (uncomment to execute)
    /*
    const signature = await wallet._signTypedData(domain, types, value);
    console.log('EIP-712 Signature:', signature);
    */

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 