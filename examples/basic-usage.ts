import { createWallet, CHAIN_IDS } from '../src';

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

    // Get ETH balance
    const balance = await wallet.getBalance();
    console.log('ETH Balance:', balance);

    // Send ETH (uncomment to execute)
    /*
    const txHash = await wallet.sendTransaction({
      to: '0xRecipientAddress', // Replace with recipient address
      value: '0.01', // ETH
      gasLimit: 21000
    });
    console.log('Transaction hash:', txHash);
    */

    // Initialize wallet with mnemonic
    const walletFromMnemonic = createWallet({
      mnemonic: 'your twelve word mnemonic phrase here', // Replace with your mnemonic
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
      chainId: CHAIN_IDS.ETHEREUM
    });

    console.log('Wallet address from mnemonic:', walletFromMnemonic.getAddress());

    // Get token balance (USDC example)
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on Ethereum
    const tokenBalance = await wallet.getTokenBalance(usdcAddress, 6);
    console.log('USDC Balance:', tokenBalance);

    // Send tokens (uncomment to execute)
    /*
    const tokenTxHash = await wallet.sendToken({
      tokenAddress: usdcAddress,
      to: '0xRecipientAddress', // Replace with recipient address
      amount: '10', // 10 USDC
      decimals: 6
    });
    console.log('Token transaction hash:', tokenTxHash);
    */

    // Sign a message
    const signature = await wallet.signMessage('Hello, Web3!');
    console.log('Signature:', signature);

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 