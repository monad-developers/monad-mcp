import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { EvmMcpWallet, WalletConfig } from '../index';
import packageJson from '../../package.json';

// Tool handler type
// interface ToolHandler {
//   (params: any): Promise<any>;
// }

/**
 * MCP Server for MCP Wallet
 * This class implements the Model-Context-Protocol (MCP) server
 * to expose wallet functionality to AI assistants.
 */
export class McpServer {
  private wallet: EvmMcpWallet;
  private config: McpServerConfig;
  public mcpServer: Server;
  private transport: StdioServerTransport;
  private tools: Tool[] = [];

  private pendingConfirmations: Map<
    string,
    {
      params: any;
      status: 'pending' | 'confirmed' | 'rejected';
      createdAt: number;
    }
  > = new Map();

  /**
   * Create a new MCP server instance
   * @param walletConfig Wallet configuration
   * @param serverConfig Server configuration
   */
  constructor(walletConfig: WalletConfig, serverConfig: McpServerConfig = {}) {
    this.wallet = new EvmMcpWallet(walletConfig);
    this.config = {
      port: 3000,
      allowedOperations: ['read', 'prepare', 'info'],
      requireConfirmation: true,
      ...serverConfig
    };

    // Initialize MCP server with stdio transport
    this.mcpServer = new Server(
      {
        name: packageJson.name,
        version: packageJson.version
      },
      {
        capabilities: {
          tools: {},
          logging: {}
        }
      }
    );
    this.transport = new StdioServerTransport();
    // Setup MCP request handlers
    this.setupRequestHandlers();
  }

  /**
   * Start the MCP server
   * @returns Promise that resolves when the server is started
   */
  async start(): Promise<void> {
    this.mcpServer.sendLoggingMessage({
      level: 'info',
      data: `Starting MCP server on port ${this.config.port}...`
    });

    // Register MCP tools
    this.registerTools();

    // Connect to the transport
    await this.mcpServer.connect(this.transport);

    this.mcpServer.sendLoggingMessage({
      level: 'info',
      data: 'MCP server started'
    });

    this.mcpServer.sendLoggingMessage({
      level: 'info',
      data: `Available operations: ${this.config.allowedOperations?.join(', ') || 'none'}`
    });
  }

  /**
   * Confirm a pending transaction
   * @param txId Transaction ID to confirm
   * @returns Promise that resolves with the transaction result
   */
  async confirmTransaction(txId: string): Promise<any> {
    const pendingTx = this.pendingConfirmations.get(txId);
    if (!pendingTx) {
      const error = `Transaction with ID ${txId} not found`;
      this.mcpServer.sendLoggingMessage({
        level: 'error',
        data: error
      });
      throw new Error(error);
    }

    pendingTx.status = 'confirmed';
    this.pendingConfirmations.set(txId, pendingTx);

    try {
      // Process the confirmed transaction
      const result = await this.wallet.sendTransaction(pendingTx.params);
      this.mcpServer.sendLoggingMessage({
        level: 'info',
        data: `Transaction ${txId} confirmed and sent with hash: ${result}`
      });
      return result;
    } catch (error) {
      this.mcpServer.sendLoggingMessage({
        level: 'error',
        data: `Failed to send transaction ${txId}: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }

  /**
   * Reject a pending transaction
   * @param txId Transaction ID to reject
   */
  rejectTransaction(txId: string): void {
    const pendingTx = this.pendingConfirmations.get(txId);
    if (!pendingTx) {
      const error = `Transaction with ID ${txId} not found`;
      this.mcpServer.sendLoggingMessage({
        level: 'error',
        data: error
      });
      throw new Error(error);
    }

    pendingTx.status = 'rejected';
    this.pendingConfirmations.set(txId, pendingTx);
    this.mcpServer.sendLoggingMessage({
      level: 'info',
      data: `Transaction ${txId} rejected`
    });
  }

  /**
   * Setup MCP request handlers
   * This configures how the server responds to different MCP requests
   */
  private setupRequestHandlers(): void {
    // Handle tool calls
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, params } = request.params;
      try {
        const tool = this.tools.find((t) => t.name === name);
        if (!tool) {
          const error = `Tool ${name} not found`;
          this.mcpServer.sendLoggingMessage({
            level: 'error',
            data: error
          });
          throw new Error(error);
        }
        const result = await (tool as any).handler(params);
        this.mcpServer.sendLoggingMessage({
          level: 'info',
          data: `Tool ${name} executed successfully`
        });
        return { result };
      } catch (error) {
        if (error instanceof Error) {
          try {
            // Check if this is a structured error (like confirmation needed)
            const parsedError = JSON.parse(error.message);
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Tool ${name} requires confirmation: ${parsedError.message}`
            });
            return { error: parsedError };
          } catch {
            // Regular error
            this.mcpServer.sendLoggingMessage({
              level: 'error',
              data: `Tool ${name} failed: ${error.message}`
            });
            return { error: { code: 'TOOL_ERROR', message: error.message } };
          }
        }
        this.mcpServer.sendLoggingMessage({
          level: 'error',
          data: `Tool ${name} failed with unknown error`
        });
        return { error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' } };
      }
    });

    // Handle tool listing
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      this.mcpServer.sendLoggingMessage({
        level: 'info',
        data: `Listing ${this.tools.length} available tools`
      });
      return { tools: this.tools };
    });
  }

  /**
   * Register wallet tools with the MCP server
   * This exposes wallet functionality to MCP clients
   */
  private registerTools(): void {
    // Read-only operations
    if (this.config.allowedOperations?.includes('read')) {
      const getAddressTool: Tool = {
        name: 'wallet_getAddress',
        description: JSON.stringify({ zh: '获取钱包地址', en: 'Get wallet address' }),
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false
        },
        outputSchema: {
          type: 'string',
          pattern: '^0x[a-fA-F0-9]{40}$',
          description: JSON.stringify({ zh: '以太坊地址', en: 'Ethereum address' })
        },
        handler: async () => {
          try {
            const address = await this.wallet.getAddress();
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Retrieved wallet address: ${address}`
            });
            return address;
          } catch (error) {
            this.mcpServer.sendLoggingMessage({
              level: 'error',
              data: `Failed to get wallet address: ${error instanceof Error ? error.message : String(error)}`
            });
            throw error;
          }
        }
      };
      this.tools.push(getAddressTool);

      const getBalanceTool: Tool = {
        name: 'wallet_getBalance',
        description: JSON.stringify({ zh: '获取ETH余额', en: 'Get ETH balance' }),
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false
        },
        outputSchema: {
          type: 'string',
          pattern: '^[0-9]+$',
          description: JSON.stringify({ zh: '余额（wei单位）', en: 'Balance in wei' })
        },
        handler: async () => {
          try {
            const balance = await this.wallet.getBalance();
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Retrieved wallet balance: ${balance} wei`
            });
            return balance;
          } catch (error) {
            this.mcpServer.sendLoggingMessage({
              level: 'error',
              data: `Failed to get wallet balance: ${error instanceof Error ? error.message : String(error)}`
            });
            throw error;
          }
        }
      };
      this.tools.push(getBalanceTool);
    }

    // Preparation operations
    if (this.config.allowedOperations?.includes('prepare')) {
      const signTransactionTool: Tool = {
        name: 'wallet_signTransaction',
        description: '对交易进行签名',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              description: JSON.stringify({ zh: '接收地址', en: 'Recipient address' })
            },
            value: {
              type: 'string',
              pattern: '^[0-9]+$',
              description: JSON.stringify({ zh: '转账金额(wei)', en: 'Amount in wei' })
            },
            data: {
              type: 'string',
              description: JSON.stringify({ zh: '交易数据', en: 'Transaction data' })
            }
          },
          required: ['to', 'value'],
          additionalProperties: false
        },
        outputSchema: {
          type: 'object',
          properties: {
            signedTransaction: {
              type: 'string',
              description: JSON.stringify({ zh: '已签名的交易数据', en: 'Signed transaction data' })
            }
          },
          required: ['signedTransaction']
        },
        handler: async (params: any) => {
          try {
            const signedTx = await this.wallet.signTransaction(params);
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Transaction signed successfully for recipient: ${params.to}`
            });
            return { signedTransaction: signedTx };
          } catch (error) {
            this.mcpServer.sendLoggingMessage({
              level: 'error',
              data: `Failed to sign transaction: ${error instanceof Error ? error.message : String(error)}`
            });
            throw error;
          }
        }
      };
      this.tools.push(signTransactionTool);
    }

    // Information services
    if (this.config.allowedOperations?.includes('info')) {
      const getTokenBalanceTool: Tool = {
        name: 'wallet_getTokenBalance',
        description: '获取代币余额',
        inputSchema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              description: JSON.stringify({ zh: '代币合约地址', en: 'Token contract address' })
            },
            decimals: {
              type: 'number',
              description: JSON.stringify({ zh: '代币精度', en: 'Token decimals' }),
              default: 18
            }
          },
          required: ['token'],
          additionalProperties: false
        },
        outputSchema: {
          type: 'string',
          description: JSON.stringify({ zh: '代币余额', en: 'Token balance' })
        },
        handler: async (params: any) => {
          try {
            const balance = await this.wallet.getTokenBalance(params.token, params.decimals);
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Retrieved token balance for ${params.token}: ${balance}`
            });
            return balance;
          } catch (error) {
            this.mcpServer.sendLoggingMessage({
              level: 'error',
              data: `Failed to get token balance: ${error instanceof Error ? error.message : String(error)}`
            });
            throw error;
          }
        }
      };
      this.tools.push(getTokenBalanceTool);
    }

    // Transaction operations (if allowed and with confirmation)
    if (this.config.allowedOperations?.includes('transaction') && this.config.requireConfirmation) {
      const sendTransactionTool: Tool = {
        name: 'wallet_sendTransaction',
        description: '发送ETH交易(需要确认)',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              description: JSON.stringify({ zh: '接收地址', en: 'Recipient address' })
            },
            value: {
              type: 'string',
              pattern: '^[0-9]+$',
              description: JSON.stringify({ zh: '转账金额(wei)', en: 'Amount in wei' })
            },
            data: {
              type: 'string',
              description: JSON.stringify({ zh: '交易数据', en: 'Transaction data' })
            }
          },
          required: ['to', 'value'],
          additionalProperties: false
        },
        outputSchema: {
          type: 'object',
          properties: {
            transactionHash: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{64}$',
              description: JSON.stringify({ zh: '交易哈希', en: 'Transaction hash' })
            }
          },
          required: ['transactionHash']
        },
        handler: async (params: any) => {
          if (this.config.requireConfirmation) {
            const txId = crypto.randomUUID();
            this.pendingConfirmations.set(txId, {
              params,
              status: 'pending',
              createdAt: Date.now()
            });
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Transaction pending confirmation (ID: ${txId})`
            });
            throw new Error(
              JSON.stringify({
                code: 'NEED_CONFIRMATION',
                message: JSON.stringify({
                  zh: `交易等待用户确认 (ID: ${txId})`,
                  en: `Transaction pending confirmation (ID: ${txId})`
                })
              })
            );
          }
          try {
            const txHash = await this.wallet.sendTransaction(params);
            this.mcpServer.sendLoggingMessage({
              level: 'info',
              data: `Transaction sent successfully with hash: ${txHash}`
            });
            return { transactionHash: txHash };
          } catch (error) {
            this.mcpServer.sendLoggingMessage({
              level: 'error',
              data: `Failed to send transaction: ${error instanceof Error ? error.message : String(error)}`
            });
            throw error;
          }
        }
      };
      this.tools.push(sendTransactionTool);
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    // Close any open connections
    try {
      await this.transport.close();
      this.mcpServer.sendLoggingMessage({
        level: 'info',
        data: 'MCP server stopped'
      });
    } catch (error) {
      this.mcpServer.sendLoggingMessage({
        level: 'error',
        data: `Error stopping server: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
}

/**
 * MCP Server Configuration
 */
export interface McpServerConfig {
  /**
   * Port to listen on
   * @default 3000
   */
  port?: number;

  /**
   * Allowed operation types
   * - read: Read-only operations (getAddress, getBalance, etc.)
   * - prepare: Preparation operations (createTransaction, estimateGas, etc.)
   * - info: Information services (getTokenPrice, getNetworkStatus, etc.)
   * - transaction: Transaction operations (sendTransaction, sendToken, etc.)
   * @default ['read', 'prepare', 'info']
   */
  allowedOperations?: ('read' | 'prepare' | 'info' | 'transaction')[];

  /**
   * Whether to require confirmation for transactions
   * @default true
   */
  requireConfirmation?: boolean;
}

/**
 * Create a new MCP server instance
 * @param walletConfig Wallet configuration
 * @param serverConfig Server configuration
 * @returns MCP server instance
 */
export function createMcpServer(
  walletConfig: WalletConfig,
  serverConfig?: McpServerConfig
): McpServer {
  return new McpServer(walletConfig, serverConfig);
}
