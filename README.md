# MCP Wallet

A comprehensive Web3 wallet SDK based on the MCP (Model-Context-Protocol) for interacting with Monad and other EVM-compatible blockchains. This library provides a secure, feature-rich wallet implementation that can be integrated into any JavaScript/TypeScript application or used directly with AI assistants that support MCP.

[中文文档](./README.zh-CN.md) |  [MCP Integration Guide](./docs/MCP-INTEGRATION.md)

## 🤖 MCP Integration - Core Features

MCP Wallet is primarily designed to work with MCP-enabled AI assistants. The Model Context Protocol (MCP) is an open standard that enables secure, two-way connections between AI models and external tools like this wallet.

### What is MCP?

MCP (Model-Context-Protocol) is a protocol that allows AI models to interact with external tools and services. In the context of this wallet:

- It enables AI assistants to help users manage their crypto assets securely
- It provides standardized ways for LLMs to access wallet functionality
- It maintains security boundaries to protect private keys and sensitive operations

### MCP Capabilities

This wallet exposes the following capabilities through MCP:

1. **Read-only operations**: Get wallet address, check balances, view transaction history
2. **Preparation operations**: Create transaction objects, estimate gas fees, suggest swap routes
3. **Information services**: Token price information, network status, chain information
4. **Security-focused design**: No direct access to private keys, user confirmation required for transactions

### Supported Operations

The MCP Wallet supports the following operations through MCP:

#### Basic Operations
- Get wallet address and balance
- View transaction history
- Check gas prices
- Estimate transaction fees

#### Token Operations
- View ERC-20 token balances
- Transfer ERC-20 tokens
- View ERC-721 (NFT) balances
- Transfer NFTs
- Get token prices and market data

#### DeFi Operations
- Token swaps via Uniswap
  - MONAD to token swaps
  - Token to token swaps
  - Support for multiple DEX protocols
  - Custom slippage and deadline settings

#### Cross-chain Operations
- Bridge assets between chains
  - Support for Across Protocol
  - Support for major EVM chains (Monad, Ethereum, Polygon, Arbitrum, Optimism)
  - Cross-chain token transfers
  - Bridge fee estimation

#### Transaction Management
- Create and prepare transactions
- Gas fee estimation and optimization
- Transaction status monitoring
- Transaction history tracking

#### Security Operations
- Read-only mode for safe browsing
- Multi-Party Computation (MPC) support
- Transaction approval workflows
- Rate limiting and access controls

### Operation Examples

Here are some examples of how to interact with the wallet through natural language prompts:

#### Basic Operations
```
"What's my wallet balance?"
"Show me my recent transactions"
"What's the current gas price?"
"Get my wallet address"
```

#### Token Operations
```
"Check my USDC balance"
"Send 100 USDT to 0x123..."
"Show me my NFT collection"
"What's the current price of MONAD?"
```

#### DeFi Operations
```
"Swap 1 MONAD to USDC"
"What's the best rate for swapping 1000 USDT to MONAD?"
"Show me the liquidity pools I'm participating in"
"Calculate slippage for swapping 5 MONAD to USDC"
```

#### Cross-chain Operations
```
"Bridge 1 MONAD from Monad to Ethereum"
"What's the fee for bridging 1000 USDC to Monad?"
"Show available bridge options for MONAD to Optimism"
"Track my cross-chain transfer status"
```

#### Transaction Management
```
"Create a transaction to send 1 MONAD"
"Estimate gas fee for this transfer"
"Check the status of transaction 0x123..."
"Show my pending transactions"
```

### Security Considerations

#### Key Management
1. **Private Key Protection**:
   - Never share private keys or mnemonics with anyone
   - Store keys in secure, encrypted storage
   - Use hardware wallets for large amounts
   - Enable biometric authentication when available

2. **Access Control**:
   - Use read-only mode by default
   - Implement role-based access control
   - Set transaction limits
   - Enable multi-signature for high-value transactions

3. **Network Security**:
   - Use secure RPC endpoints
   - Implement SSL/TLS for all connections
   - Monitor for suspicious activities
   - Regular security audits

#### Transaction Safety
1. **Verification Steps**:
   - Always verify recipient addresses
   - Double-check transaction amounts
   - Review gas fees before approval
   - Confirm network/chain ID

2. **Smart Contract Safety**:
   - Verify contract addresses
   - Review contract permissions
   - Check for audited contracts
   - Use simulation before execution

3. **Approval Management**:
   - Review token approvals regularly
   - Set approval limits
   - Revoke unused approvals
   - Monitor approval expiration

#### MPC Security
1. **Multi-Party Computation**:
   - Split key shares securely
   - Use threshold signatures
   - Implement secure key recovery
   - Regular key rotation

2. **Operational Security**:
   - Use secure communication channels
   - Implement timeouts
   - Rate limiting
   - Audit logging

#### AI Assistant Integration
1. **Prompt Safety**:
   - Use clear, unambiguous language
   - Avoid sensitive information in prompts
   - Verify AI understanding
   - Review suggested actions

2. **Permission Management**:
   - Set operation limits
   - Define allowed actions
   - Implement cooling periods
   - Regular permission review

3. **Transaction Review**:
   - Mandatory human verification
   - Clear confirmation dialogs
   - Detailed transaction preview
   - Cancel option always available

## Installation

```bash
npm install -g mcp-wallet
# or
yarn global add mcp-wallet
```

### Local Installation

```bash
npm install mcp-wallet
# or
yarn add mcp-wallet
```

### Running on Cursor

Configuring Cursor 🖥️
Note: Requires Cursor version 0.45.6+

To configure MCP Wallet in Cursor:

1. Open Cursor Settings
2. Go to Features > MCP Servers 
3. Click "+ Add New MCP Server"
4. Enter the following:
   - Name: "mcp-wallet" (or your preferred name)
   - Type: "command"
   - Command: `env MCP_PRIVATE_KEY=0x... npx -y mcp-wallet-mcp`

> If you are using Windows, try `cmd /c "set MCP_PRIVATE_KEY=0x... && npx -y mcp-wallet-mcp"`

### Running on Windsurf

Add this to your `./codeium/windsurf/model_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-wallet": {
      "command": "npx",
      "args": ["-y", "mcp-wallet-mcp"],
      "env": {
        "MCP_PRIVATE_KEY": "0x...",
      }
    }
  }
}
```

### Running on Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-wallet": {
      "command": "npx",
      "args": ["-y", "mcp-wallet-mcp"],
      "env": {
        "MCP_PRIVATE_KEY": "YOUR_PRIVATE_KEY_HERE",
        "MCP_RPC_URL": "https://testnet.rpc.monad.xyz",
        "MCP_CHAIN_ID": "10143",
        
        "MCP_MPC_ENABLED": "true",
        "MCP_MAX_FEE": "50",
        "MCP_APPROVAL_TIMEOUT": "120"
      }
    }
  }
}
```

Once configured, Claude can interact with your wallet through natural language commands.

## Environment Variables Configuration

The recommended way to configure MCP Wallet is through environment variables:

```bash
# Required configuration
export MCP_PRIVATE_KEY="https://testnet.rpc.monad.xyz"
export MCP_CHAIN_ID="10143"

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

## CLI Commands

MCP Wallet comes with a command-line interface (CLI) that allows you to interact with the wallet from the terminal:

```bash
# Initialize wallet configuration
mcp-wallet init

# Get wallet address
mcp-wallet address

# Get MONAD balance
mcp-wallet balance

# Get token balance
mcp-wallet token-balance 0xTokenContractAddress

# Send MONAD
mcp-wallet send 0xRecipientAddress 0.1

# Send tokens
mcp-wallet send-token 0xTokenContractAddress 0xRecipientAddress 100

# Start MCP server
mcp-wallet serve
```

## Development

```bash
# Clone the repository
git clone https://github.com/monad-developers/monad-mcp.git
cd monad-mcp

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
