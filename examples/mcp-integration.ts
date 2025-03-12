/**
 * MCP Integration Example
 * 
 * This example demonstrates how to integrate the MCP Wallet with MCP-enabled AI assistants.
 * It shows how to set up an MCP server that exposes wallet functionality to AI models.
 */

import { createMcpServer, createWallet, WalletConfig, McpServerConfig } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Starting MCP Wallet MCP Integration Example');

  // Initialize wallet configuration
  const walletConfig: WalletConfig = {
    rpcUrl: process.env.MCP_WALLET_RPC_URL || 'https://eth.llamarpc.com',
    chainId: process.env.MCP_WALLET_CHAIN_ID ? parseInt(process.env.MCP_WALLET_CHAIN_ID) : 1,
    network: {
      name: process.env.MCP_WALLET_NETWORK_NAME || 'Ethereum Mainnet',
      explorerUrl: process.env.MCP_WALLET_EXPLORER_URL || 'https://etherscan.io',
      nativeToken: process.env.MCP_WALLET_NATIVE_TOKEN || 'ETH'
    }
  };

  // Add authentication method
  if (process.env.MCP_WALLET_PRIVATE_KEY) {
    walletConfig.privateKey = process.env.MCP_WALLET_PRIVATE_KEY;
  } else if (process.env.MCP_WALLET_MNEMONIC) {
    walletConfig.mnemonic = process.env.MCP_WALLET_MNEMONIC;
  } else if (process.env.MCP_WALLET_ADDRESS) {
    walletConfig.address = process.env.MCP_WALLET_ADDRESS;
  } else {
    // For demo purposes, use a read-only address if no authentication is provided
    walletConfig.address = '0x0000000000000000000000000000000000000000';
    console.log('No authentication method provided. Using read-only mode with zero address.');
  }

  // Optional MPC configuration
  if (process.env.MCP_WALLET_MPC_ENABLED === 'true') {
    walletConfig.enableMpc = true;
  }

  // Create a wallet instance
  const wallet = createWallet(walletConfig);
  console.log(`Wallet initialized with address: ${wallet.getAddress()}`);

  // Create MCP server configuration
  const serverConfig: McpServerConfig = {
    port: process.env.MCP_WALLET_PORT ? parseInt(process.env.MCP_WALLET_PORT) : 3000,
    network: {
      name: process.env.MCP_WALLET_NETWORK_NAME || 'Unknown Network',
      explorerUrl: process.env.MCP_WALLET_EXPLORER_URL || '',
      nativeToken: process.env.MCP_WALLET_NATIVE_TOKEN || 'ETH'
    }
  };

  // Create an MCP server with the wallet
  const mcpServer = createMcpServer(walletConfig, serverConfig);

  // Start the MCP server
  await mcpServer.start();
  console.log('MCP server started. Press Ctrl+C to stop.');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await mcpServer.stop();
    process.exit(0);
  });
}

// Run the example
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 