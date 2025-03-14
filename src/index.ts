import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  createPublicClient,
  formatUnits,
  getContract,
  http,
  stringify,
} from "viem";
import { ERC20_ABI, monadTestnet } from "./constants.js";

const server = new McpServer({
  name: "monad-testnet",
  version: "0.0.1",
});

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

server.tool(
  "get-mon-balance",
  "Get MON balance for an address on Monad testnet",
  {
    address: z.string().describe("Monad testnet address to check balance for"),
  },
  async ({ address }) => {
    try {
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      return {
        content: [
          {
            type: "text",
            text: `Balance for ${address}: ${formatUnits(balance, 18)} MON`,
          },
        ],
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve balance for address: ${address}. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-transaction",
  "Get information about a transaction on Monad testnet",
  {
    txHash: z.string().describe("Transaction hash to look up"),
  },
  async ({ txHash }) => {
    try {
      const tx = await publicClient.getTransaction({
        hash: txHash as `0x${string}`,
      });

      if (!tx) {
        return {
          content: [
            {
              type: "text",
              text: `Transaction not found: ${txHash}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: stringify(tx, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting transaction:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve transaction information for hash: ${txHash}. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-erc20-balance",
  "Get ERC20 token balance for an address on Monad testnet",
  {
    tokenAddress: z.string().describe("ERC20 token contract address"),
    walletAddress: z.string().describe("Wallet address to check balance for"),
  },
  async ({ tokenAddress, walletAddress }) => {
    try {
      const contract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      const [balance, decimals, symbol, name] = await Promise.all([
        contract.read.balanceOf([walletAddress as `0x${string}`]),
        contract.read.decimals(),
        contract.read.symbol(),
        contract.read.name(),
      ]);

      const formattedBalance = formatUnits(
        balance as bigint,
        decimals as number
      );

      return {
        content: [
          {
            type: "text",
            text: `Token: ${name} (${symbol})\nBalance for ${walletAddress}: ${formattedBalance} ${symbol}`,
          },
        ],
      };
    } catch (error) {
      console.error("Error getting ERC20 balance:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve ERC20 token balance. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-block",
  "Get information about a specific block on Monad testnet",
  {
    blockNumber: z.union([
      z.string().describe("Block number or 'latest' for most recent block"),
      z.number().describe("Block number")
    ]),
  },
  async ({ blockNumber }) => {
    try {
      const blockTag = blockNumber === 'latest' ? 'latest' : 
        typeof blockNumber === 'string' ? BigInt(blockNumber) : BigInt(blockNumber);
      const block = await publicClient.getBlock({ 
        blockNumber: blockTag === 'latest' ? undefined : blockTag 
      });
      
      return {
        content: [
          {
            type: "text",
            text: stringify({
              hash: block.hash,
              number: block.number,
              timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
              gasUsed: block.gasUsed.toString(),
              transactions: block.transactions.length,
              miner: block.miner,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting block:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve block information. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-tx-receipt",
  "Get detailed transaction receipt from Monad testnet",
  {
    txHash: z.string().describe("Transaction hash to get receipt for"),
  },
  async ({ txHash }) => {
    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (!receipt) {
        return {
          content: [
            {
              type: "text",
              text: `No receipt found for transaction: ${txHash}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: stringify({
              status: receipt.status === 'success' ? 'Success' : 'Failed',
              blockNumber: receipt.blockNumber.toString(),
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: formatUnits(receipt.effectiveGasPrice, 9) + ' Gwei',
              cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
              logs: receipt.logs.length,
              contractAddress: receipt.contractAddress, // null if not contract creation
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting transaction receipt:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve transaction receipt. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Monad testnet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
