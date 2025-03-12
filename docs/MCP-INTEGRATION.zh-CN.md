# MCP 钱包集成指南

本指南详细介绍了如何将 MCP 钱包与支持 MCP 的 AI 助手集成，使 AI 能够安全地帮助用户管理其加密资产。

## 什么是 MCP？

MCP（模型-上下文-协议）是一种开放标准，它实现了 AI 模型与外部工具和服务之间的安全、双向连接。在 Web3 钱包的上下文中，MCP 允许：

- AI 助手安全地访问钱包功能
- 用户通过自然语言与其加密资产交互
- 维护严格的安全边界，保护私钥和敏感操作

MCP 协议由 Anthropic 开发，现已被多个 AI 助手和工具采用，包括 Claude、Cursor、WindSurf 和 Cline。

## 安装

### 全局安装（推荐）

```bash
npm install -g mcp-wallet
# 或
yarn global add mcp-wallet
```

全局安装允许你从任何目录使用 CLI 命令，并使 MCP 服务器可供所有支持 MCP 的 AI 助手访问。

### 本地安装

```bash
npm install mcp-wallet
# 或
yarn add mcp-wallet
```

## 配置

### 环境变量

配置 MCP 钱包的推荐方式是通过环境变量：

```bash
# 必需配置
export MCP_WALLET_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
export MCP_WALLET_CHAIN_ID="1"

# 认证（选择一种）
export MCP_WALLET_PRIVATE_KEY="0x..." # 用于签名交易的私钥
# 或
export MCP_WALLET_MNEMONIC="你的十二个助记词" # 用于 HD 钱包的助记词
# 或
export MCP_WALLET_ADDRESS="0x..." # 只读模式

# 可选配置
export MCP_WALLET_MPC_ENABLED="true" # 启用多方计算以增强安全性
export MCP_WALLET_MAX_FEE="50" # 最大 Gas 费用（GWEI）
export MCP_WALLET_APPROVAL_TIMEOUT="120" # 等待交易批准的秒数
export MCP_WALLET_PORT="3000" # MCP 服务器端口（默认：3000）
export MCP_WALLET_HOST="127.0.0.1" # MCP 服务器主机（默认：127.0.0.1）
export MCP_WALLET_REQUIRE_CONFIRMATION="true" # 是否需要用户确认交易（默认：true）
```

### 使用 CLI 初始化

你也可以使用 CLI 工具初始化配置：

```bash
mcp-wallet init
```

这将引导你完成配置过程，并将配置保存到 `.env` 文件中。

## 与 MCP 客户端一起使用

### Claude

要在 Claude 中使用 MCP 钱包：

1. 安装 Claude 扩展或使用 Claude 网页界面
2. 创建新的聊天并启用 MCP 工具选项
3. 添加 MCP 钱包作为工具，配置如下：

```json
{
  "name": "mcp_wallet",
  "description": "用于与以太坊和其他 EVM 链交互的安全 Web3 钱包",
  "authentication": {
    "type": "none"
  },
  "functions": [
    {
      "name": "getWalletInfo",
      "description": "获取钱包地址和余额信息"
    },
    {
      "name": "sendTransaction",
      "description": "发送交易（需要用户确认）"
    },
    {
      "name": "getTokenBalances",
      "description": "获取钱包的代币余额"
    }
  ]
}
```

4. Claude 现在可以通过调用这些函数来帮助你管理钱包

示例对话：

```
用户: 我的钱包里有多少 ETH？

Claude: 让我为您检查您的 ETH 余额。

[Claude 调用 getWalletInfo 函数]

Claude: 您的钱包地址 0x1234...5678 当前有 1.25 ETH，按当前汇率约值 2,500 美元。
```

### Cursor

要在 Cursor 中使用 MCP 钱包：

1. 打开 Cursor IDE
2. 全局安装 MCP 钱包包：`npm install -g mcp-wallet`
3. 创建一个新文件，使用以下代码初始化 MCP 集成：

```javascript
// mcp-config.js
import { registerMcpTool } from 'cursor-mcp';
import { EvmMcpWallet } from 'mcp-wallet';

// 将钱包注册为 MCP 工具
registerMcpTool('mcp_wallet', {
  description: '以太坊钱包操作',
  functions: {
    // 定义可用函数
    getAddress: async () => {
      const wallet = new EvmMcpWallet(); // 将使用环境变量进行配置
      return wallet.getAddress();
    },
    // 根据需要添加其他函数
  }
});
```

4. 运行配置文件以注册工具
5. Cursor 的 AI 助手现在可以访问钱包功能

### WindSurf

要在 WindSurf 中使用 MCP 钱包：

1. 打开 WindSurf 浏览器
2. 导航至 设置 > 扩展 > MCP 工具
3. 添加新的 MCP 工具，详情如下：
   - 名称：MCP 钱包
   - 包：mcp-wallet
   - 权限：wallet_access, network_access
4. 配置 RPC 端点和其他设置
5. 保存配置

### Cline

要在 Cline 中使用 MCP 钱包：

1. 安装 Cline CLI：`npm install -g cline-cli`
2. 全局安装 MCP 钱包：`npm install -g mcp-wallet`
3. 添加 MCP 钱包插件：`cline plugins add mcp-wallet`
4. 配置钱包：`cline config wallet set-provider mcp-wallet`
5. 初始化钱包：`cline wallet init`
6. 现在可以使用钱包命令：`cline wallet balance`

## 使用 MCP 服务器

MCP 钱包包含一个 MCP 服务器，可以暴露钱包功能给 AI 助手。

### 启动服务器

使用 CLI 启动服务器：

```bash
mcp-wallet serve
```

或在代码中创建服务器：

```javascript
import { createMcpServer } from 'mcp-wallet';

// 创建并启动 MCP 服务器
const server = createMcpServer({
  port: 3000,
  host: '127.0.0.1',
  requireConfirmation: true,
  wallet: {
    privateKey: process.env.MCP_WALLET_PRIVATE_KEY,
    rpcUrl: process.env.MCP_WALLET_RPC_URL,
    chainId: parseInt(process.env.MCP_WALLET_CHAIN_ID || '1')
  }
});

// 启动服务器
server.start();

// 优雅关闭
process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});
```

### 可用的 MCP 函数

MCP 服务器暴露以下函数：

1. **钱包信息**：
   - `getAddress()` - 获取钱包地址
   - `getBalance()` - 获取 ETH 余额
   - `getNetwork()`