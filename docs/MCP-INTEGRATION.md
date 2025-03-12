# MCP Wallet - MCP Integration Guide

This document provides detailed instructions on how to integrate the MCP Wallet with MCP-enabled AI assistants.

## What is MCP?

MCP (Model-Context-Protocol) is an open standard that enables secure, two-way connections between AI models and external tools like this wallet. The MCP protocol allows AI assistants to securely access and operate wallet functions while maintaining the security of private keys and sensitive operations.

## Installation

First, install the MCP Wallet globally:

```bash
npm install -g mcp-wallet
# or
yarn global add mcp-wallet
```

## Configuration

### Environment Variables Configuration

The recommended way to configure MCP Wallet is through environment variables:

```bash
# Required configuration
export MCP_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
export MCP_CHAIN_ID="1"

# Authentication (choose one)
export MCP_PRIVATE_KEY="0x..." # Private key for signing transactions
# OR
export MCP_MNEMONIC="your twelve word mnemonic phrase here" # Mnemonic for HD wallet
# OR
export MCP_ADDRESS="0x..." # For read-only mode

# Optional configuration
export MCP_MPC_ENABLED="true" # Enable Multi-Party Computation for enhanced security
export MCP_MAX_FEE="50" # Maximum gas fee in GWEI
export MCP_APPROVAL_TIMEOUT="120" # Seconds to wait for transaction approval
```

You can also use the CLI tool to initialize the configuration:

```bash
mcp-wallet init
```

This will guide you through the configuration process and save the configuration to a `~/.mcp-wallet.env` file.

## Using with Different MCP Clients

### Using with Claude

1. Install the Claude extension or use the Claude web interface
2. Create a new chat and enable the MCP tools option
3. Add the MCP Wallet as a tool with the following configuration:

```json
{
  "name": "mcp_wallet",
  "description": "A secure Web3 wallet for interacting with Ethereum and other EVM chains",
  "authentication": {
    "type": "none"
  },
  "functions": [
    {
      "name": "getWalletInfo",
      "description": "Get wallet address and balance information"
    },
    {
      "name": "sendTransaction",
      "description": "Send a transaction (requires user confirmation)"
    },
    {
      "name": "getTokenBalances",
      "description": "Get token balances for the wallet"
    }
  ]
}
```

4. Claude can now help you manage your wallet by calling these functions

### Using with Cursor

1. Open Cursor IDE
2. Install the MCP Wallet package globally: `npm install -g mcp-wallet`
3. Create a new file with the following code to initialize the MCP integration:

```javascript
// mcp-config.js
import { registerMcpTool } from 'cursor-mcp';
import { EvmMcpWallet } from 'mcp-wallet';

// Register the wallet as an MCP tool
registerMcpTool('mcp_wallet', {
  description: 'Ethereum wallet operations',
  functions: {
    // Define available functions
    getAddress: async () => {
      const wallet = new EvmMcpWallet(); // Will use environment variables for configuration
      return wallet.getAddress();
    },
    // Add other functions as needed
  }
});
```

4. Run the configuration file to register the tool
5. Cursor's AI assistant can now access the wallet functions

### Using with WindSurf

1. Open WindSurf browser
2. Navigate to Settings > Extensions > MCP Tools
3. Add a new MCP tool with the following details:
   - Name: MCP Wallet
   - Package: mcp-wallet
   - Permissions: wallet_access, network_access
4. Configure the RPC endpoints and other settings
5. Save the configuration

### Using with Cline

1. Install Cline CLI: `npm install -g cline-cli`
2. Install MCP Wallet globally: `npm install -g mcp-wallet`
3. Add the MCP Wallet plugin: `cline plugins add mcp-wallet`
4. Configure the wallet: `cline config wallet set-provider mcp-wallet`
5. Initialize your wallet: `cline wallet init`
6. You can now use wallet commands: `cline wallet balance`

## Using the MCP Server

MCP Wallet provides an MCP server that exposes wallet functionality to AI assistants. You can start the server using the CLI tool:

```bash
mcp-wallet serve
```

Or in code:

```javascript
import { createMcpServer } from 'mcp-wallet';

// Create MCP server
const mcpServer = createMcpServer({
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  chainId: 1,
  address: '0xYourAddress' // Read-only mode
}, {
  port: 3000,
  allowedOperations: ['read', 'prepare', 'info'], // Only allow read-only operations
  requireConfirmation: true
});

// Start the server
await mcpServer.start();
```

## Security Considerations

When using the MCP integration, keep the following security considerations in mind:

1. **Use read-only mode**: When possible, use read-only mode by providing only an address instead of a private key or mnemonic.
2. **Limit operations**: Only allow necessary operations, such as read-only and preparation operations.
3. **Require confirmation**: Always require user confirmation for all transaction operations.
4. **Use MPC**: Consider enabling the Multi-Party Computation (MPC) feature for enhanced security.
5. **Monitor activity**: Regularly check your transaction history to ensure there are no unauthorized activities.

## Example

Check the `examples/mcp-integration.ts` file to see how to integrate the MCP server in your code.

## More Resources

- [MCP Protocol Official Documentation](https://modelcontextprotocol.io/)
- [Claude MCP Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- [MCP Wallet GitHub Repository](https://github.com/yourusername/mcp-wallet) 