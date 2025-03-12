#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import inquirer from 'inquirer';
import { EvmMcpWallet, WalletConfig, VERSION } from './index';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Load environment variables
config();

// Initialize CLI
const program = new Command();

// Set version and description
program
  .name('mcp-wallet')
  .description('MCP Wallet - A Web3 wallet with MCP integration')
  .version(VERSION);

// Helper function to get wallet configuration from environment variables
function getWalletConfigFromEnv(): WalletConfig {
  const config: WalletConfig = {
    rpcUrl: process.env.MCP_WALLET_RPC_URL || 'https://rpc.monad.xyz',
    chainId: process.env.MCP_WALLET_CHAIN_ID ? parseInt(process.env.MCP_WALLET_CHAIN_ID) : 201,
    network: {
      name: process.env.MCP_WALLET_NETWORK_NAME || 'Monad Mainnet',
      explorerUrl: process.env.MCP_WALLET_EXPLORER_URL || 'https://explorer.monad.xyz',
      nativeToken: process.env.MCP_WALLET_NATIVE_TOKEN || 'MONAD'
    }
  };

  // Add authentication method (only one should be set)
  if (process.env.MCP_WALLET_PRIVATE_KEY) {
    config.privateKey = process.env.MCP_WALLET_PRIVATE_KEY;
  } else if (process.env.MCP_WALLET_MNEMONIC) {
    config.mnemonic = process.env.MCP_WALLET_MNEMONIC;
  } else if (process.env.MCP_WALLET_ADDRESS) {
    config.address = process.env.MCP_WALLET_ADDRESS || '';
  }

  // Add optional configurations
  if (process.env.MCP_WALLET_MPC_ENABLED === 'true') {
    config.enableMpc = true;
  }

  if (process.env.MCP_WALLET_MAX_FEE) {
    config.maxFeePerGas = process.env.MCP_WALLET_MAX_FEE;
  }

  return config;
}

// Helper function to create a wallet instance
async function createWalletInstance(): Promise<EvmMcpWallet> {
  let config = getWalletConfigFromEnv();
  // If configuration is incomplete, prompt for missing values
  if (!config.rpcUrl || !config.chainId) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'rpcUrl',
        message: 'Enter RPC URL:',
        default: config.rpcUrl || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        when: !config.rpcUrl
      },
      {
        type: 'number',
        name: 'chainId',
        message: 'Enter Chain ID:',
        default: config.chainId || 1,
        when: !config.chainId
      }
    ]);

    config = { ...config, ...answers };
  }

  // If no authentication method is provided, prompt for one
  if (!config.privateKey && !config.mnemonic && !config.address) {
    const authMethod = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'Select authentication method:',
        choices: [
          { name: 'Private Key', value: 'privateKey' },
          { name: 'Mnemonic Phrase', value: 'mnemonic' },
          { name: 'Address Only (Read-only mode)', value: 'address' }
        ]
      }
    ]);

    const authDetails = await inquirer.prompt([
      {
        type: 'password',
        name: 'privateKey',
        message: 'Enter private key:',
        when: authMethod.method === 'privateKey'
      },
      {
        type: 'password',
        name: 'mnemonic',
        message: 'Enter mnemonic phrase:',
        when: authMethod.method === 'mnemonic'
      },
      {
        type: 'input',
        name: 'address',
        message: 'Enter wallet address:',
        when: authMethod.method === 'address'
      }
    ]);

    config = { ...config, ...authDetails };
  }

  return new EvmMcpWallet(config);
}

// Initialize MCP configuration
program
  .command('init')
  .description('Initialize MCP configuration')
  .action(async () => {
    console.log('Initializing MCP Wallet configuration...');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'rpcUrl',
        message: 'Enter RPC URL:',
        default: process.env.MCP_WALLET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
      },
      {
        type: 'number',
        name: 'chainId',
        message: 'Enter Chain ID:',
        default: process.env.MCP_WALLET_CHAIN_ID ? parseInt(process.env.MCP_WALLET_CHAIN_ID) : 1
      },
      {
        type: 'list',
        name: 'authMethod',
        message: 'Select authentication method:',
        choices: [
          { name: 'Private Key', value: 'privateKey' },
          { name: 'Mnemonic Phrase', value: 'mnemonic' },
          { name: 'Address Only (Read-only mode)', value: 'address' }
        ]
      },
      {
        type: 'password',
        name: 'privateKey',
        message: 'Enter private key:',
        when: (answers) => answers.authMethod === 'privateKey'
      },
      {
        type: 'password',
        name: 'mnemonic',
        message: 'Enter mnemonic phrase:',
        when: (answers) => answers.authMethod === 'mnemonic'
      },
      {
        type: 'input',
        name: 'address',
        message: 'Enter wallet address:',
        when: (answers) => answers.authMethod === 'address'
      },
      {
        type: 'confirm',
        name: 'enableMpc',
        message: 'Enable Multi-Party Computation (MPC) for enhanced security?',
        default: false
      },
      {
        type: 'input',
        name: 'maxFee',
        message: 'Set maximum gas fee in GWEI (leave empty for default):',
        default: ''
      }
    ]);

    // Create .env file content
    let envContent = `MCP_WALLET_RPC_URL="${answers.rpcUrl}"\n`;
    envContent += `MCP_WALLET_CHAIN_ID="${answers.chainId}"\n`;

    if (answers.privateKey) {
      envContent += `MCP_WALLET_PRIVATE_KEY="${answers.privateKey}"\n`;
    } else if (answers.mnemonic) {
      envContent += `MCP_WALLET_MNEMONIC="${answers.mnemonic}"\n`;
    } else if (answers.address) {
      envContent += `MCP_WALLET_ADDRESS="${answers.address}"\n`;
    }

    if (answers.enableMpc) {
      envContent += `MCP_WALLET_MPC_ENABLED="true"\n`;
    }

    if (answers.maxFee) {
      envContent += `MCP_WALLET_MAX_FEE="${answers.maxFee}"\n`;
    }

    // Save to .env file in user's home directory
    const envFilePath = path.join(os.homedir(), '.mcp-wallet.env');
    fs.writeFileSync(envFilePath, envContent);

    console.log(`Configuration saved to ${envFilePath}`);
    console.log('You can now use the wallet commands with this configuration.');
  });

// Get wallet address
program
  .command('address')
  .description('Get wallet address')
  .action(async () => {
    try {
      const wallet = await createWalletInstance();
      const address = wallet.getAddress();
      console.log(`Wallet Address: ${address}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  });

// Get wallet balance
program
  .command('balance')
  .description('Get wallet balance')
  .action(async () => {
    try {
      const wallet = await createWalletInstance();
      const balance = await wallet.getBalance();
      console.log(`ETH Balance: ${balance} ETH`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  });

// Get token balance
program
  .command('token-balance <tokenAddress>')
  .description('Get token balance')
  .action(async (tokenAddress) => {
    try {
      const wallet = await createWalletInstance();
      const balance = await wallet.getTokenBalance(tokenAddress);
      console.log(`Token Balance: ${balance}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  });

// Send ETH
program
  .command('send <to> <amount>')
  .description('Send ETH to an address')
  .option('-g, --gas-limit <limit>', 'Gas limit for the transaction')
  .action(async (to, amount, options) => {
    try {
      const wallet = await createWalletInstance();

      // Confirm transaction
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `Send ${amount} ETH to ${to}?`,
          default: false
        }
      ]);

      if (!confirm.proceed) {
        console.log('Transaction cancelled');
        return;
      }

      const txHash = await wallet.sendTransaction({
        to,
        value: amount,
        gasLimit: options.gasLimit ? parseInt(options.gasLimit) : undefined
      });

      console.log(`Transaction sent! Hash: ${txHash}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  });

// Send token
program
  .command('send-token <tokenAddress> <to> <amount>')
  .description('Send tokens to an address')
  .option('-d, --decimals <decimals>', 'Token decimals', '18')
  .action(async (tokenAddress, to, amount, options) => {
    try {
      const wallet = await createWalletInstance();

      // Confirm transaction
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `Send ${amount} tokens from ${tokenAddress} to ${to}?`,
          default: false
        }
      ]);

      if (!confirm.proceed) {
        console.log('Transaction cancelled');
        return;
      }

      const txHash = await wallet.sendToken({
        tokenAddress,
        to,
        amount,
        decimals: parseInt(options.decimals)
      });

      console.log(`Transaction sent! Hash: ${txHash}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  });

// MCP server command
program
  .command('serve')
  .description('Start MCP server to expose wallet functionality')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .action(async (options) => {
    console.log(`Starting MCP server on port ${options.port}...`);
    console.log('This will expose wallet functionality to MCP-enabled AI assistants');

    // Here we would initialize the MCP server
    // This is a placeholder for the actual implementation
    console.log('MCP server started. Press Ctrl+C to stop.');

    // Keep the process running
    process.stdin.resume();
  });

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (process.argv.length === 2) {
  program.help();
}
