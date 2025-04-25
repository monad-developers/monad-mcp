import { z } from "zod";
import { initializeMcpApiHandler } from "../lib/mcp-api-handler";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createPublicClient,
  formatUnits,
  getContract,
  http,
  parseAbi,
  stringify,
} from "viem";
import {
  numberToHex,
  hexToBigInt,
  isHex,
  hexToString,
  stringToHex,
  Hex,
  Chain,
  keccak256 as toKeccak256,
  pad,
} from "viem";
import { c, chainIdToChain } from "./commons/common";
import { fetchFunctionInterface } from "./commons/decoder";

import { ERC20_ABI, monadTestnet } from "./commons/constants";
import { startHexWith0x } from "./commons/utils";
import * as fs from 'fs';
import * as path from 'path';
export const mcpHandler = initializeMcpApiHandler(
  (server) => {
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(),
    });

    // Add more tools, resources, and prompts here
    // server.tool("echo", { message: z.string() }, async ({ message }) => ({
    //   content: [{ type: "text", text: `Tool echo: ${message}` }],
    // }))
    const logToFile = (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} - ${message}${data ? '\nData: ' + JSON.stringify(data, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      , 2) : ''}\n`;
      
      // Create logs directory if it doesn't exist
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }
      
      // Write to log file
      fs.appendFileSync(
        path.join(logDir, 'mcp-server.log'),
        logMessage
      );
    };

    server.tool(
      "get-mon-balance",
      "Get MON balance for an address on Monad testnet",
      {
        address: z
          .string()
          .describe("Monad testnet address to check balance for"),
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
        walletAddress: z
          .string()
          .describe("Wallet address to check balance for"),
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
      "Get information about a specific block on Monad testnet (latest or by block number)",
      {
        blockNumber: z
          .string()
          .describe("Block number or 'latest' for most recent block"),
      },

      async ({ blockNumber }) => {
        try {
          const blockTag =
            typeof blockNumber === "string"
              ? blockNumber === "latest"
                ? "latest"
                : BigInt(blockNumber)
              : BigInt(blockNumber);
          const block = await publicClient.getBlock({
            blockNumber: blockTag === "latest" ? undefined : blockTag,
          });

          return {
            content: [
              {
                type: "text",
                text: stringify(
                  {
                    hash: block.hash,
                    number: block.number,
                    timestamp: new Date(
                      Number(block.timestamp) * 1000
                    ).toISOString(),
                    gasUsed: block.gasUsed.toString(),
                    transactions: block.transactions.length,
                    miner: block.miner,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          console.error("Error getting block:", error);
          return {
            content: [
              {
                type: "text",
                text: `Failed to retrieve block information. Please provide either 'latest' or a valid block number. Error: ${
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
                text: stringify(
                  {
                    status: receipt.status === "success" ? "Success" : "Failed",
                    blockNumber: receipt.blockNumber.toString(),
                    gasUsed: receipt.gasUsed.toString(),
                    effectiveGasPrice:
                      formatUnits(receipt.effectiveGasPrice, 9) + " Gwei",
                    cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
                    logs: receipt.logs.length,
                    contractAddress: receipt.contractAddress, // null if not contract creation
                  },
                  null,
                  2
                ),
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
    server.tool(
      "get-contract-source",
      "Get the source code for a contract on Monad testnet",
      {
        address: z.string().describe("Contract address to get source code for"),
      },
      async ({ address }) => {
        try {
          const response = await fetch(
            `https://api.blockvision.org/v2/monad/contract/source/code?address=${address}`,
            {
              method: "GET",
              headers: {
                "x-api-key": "2tRA19wur3pIgTiE8WcLmaUIizZ",
                accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.result && 'creationByteCode' in data.result) {
            delete data.result.creationByteCode;
          }
          if (data.result && 'sourceCode' in data.result) {
            delete data.result.sourceCode;
          }
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          console.error("Error fetching contract source:", error);
          return {
            content: [
              {
                type: "text",
                text: `Failed to retrieve contract source for address: ${address}. Error: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      }
    );
    server.tool(
      "estimate-priority-fee",
      "Estimate the current priority fee on Monad testnet",
      {},
      async () => {
        try {
          const gasPrice = await publicClient.getGasPrice();
          const maxPriorityFee =
            await publicClient.estimateMaxPriorityFeePerGas();

          return {
            content: [
              {
                type: "text",
                text: `Current estimated gas price: ${gasPrice} gwei\nMax priority fee: ${maxPriorityFee} gwei`,
              },
            ],
          };
        } catch (error) {
          console.error("Error estimating gas price:", error);
          return {
            content: [
              {
                type: "text",
                text: `Failed to estimate gas price. Error: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      }
    );
    // server.tool("monad-docs", {}, async () => {
    //   try {
    //     const response = await fetch("https://docs.monad.xyz/llms-full.txt");
    //     if (!response.ok) {
    //       return {
    //         content: [{ type: "text", text: `Error fetching Monad LLMs full text: ${response.status}` }],
    //       };
    //     }
    //     const text = await response.text();
    //     return {
    //       content: [{ type: "text", text: text }],
    //     };
    //   } catch (error) {
    //     console.error("Error fetching Monad LLMs full text:", error);
    //     return {
    //       content: [{ type: "text", text: `Error fetching Monad LLMs full text: ${error instanceof Error ? error.message : String(error)}` }],
    //     };
    //   }
    // });
    server.tool(
      "monad-docs",
      "Fetch Monad developer documentation",
      {},
      async () => {
        try {
          const response = await fetch("https://docs.monad.xyz/llms.txt");
          if (!response.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error fetching Monad docs: ${response.status}`,
                },
              ],
            };
          }
          const text = await response.text();
          // Add base URL to links
          const baseUrl = "https://docs.monad.xyz/";
          const processedText = text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            (match, title, path) => {
              return `[${title}](${baseUrl}${path})`;
            }
          );
          return {
            content: [{ type: "text", text: processedText }],
          };
        } catch (error) {
          console.error("Error fetching Monad docs:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error fetching Monad docs: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      }
    );
    server.tool(
      "get-monad-constants",
      "Get Monad testnet network information and contract addresses",
      {},
      async () => {
        const constants = {
          network: {
            name: "Monad Testnet",
            chainId: 10143,
            symbol: "MON",
            rpc: "https://testnet-rpc.monad.xyz",
            explorer: "https://testnet.monadexplorer.com",
          },
          contracts: {
            CreateX: "0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed",
            FoundryDeterministicDeployer:
              "0x4e59b44847b379578588920ca78fbf26c0b4956c",
            EntryPointV6: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            EntryPointV7: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
            Multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
            Permit2: "0x000000000022d473030f116ddee9f6b43ac78ba3",
            SafeSingletonFactory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
            UniswapV2Factory: "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0",
            UniswapV3Factory: "0x961235a9020b05c44df1026d956d1f4d78014276",
            UniswapV2Router02: "0xfb8e1c3b833f9e67a71c859a132cf783b645e436",
            UniversalRouter: "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893",
            WrappedMonad: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
          },
          tokens: {
            USDC: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
            USDT: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
            WBTC: "0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d",
            WETH: "0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37",
            WSOL: "0x5387C85A4965769f6B0Df430638a1388493486F1",
          },
          links: {
            testnetHub: "https://testnet.monad.xyz",
            ecosystem: "https://www.monad.xyz/ecosystem",
            networkVisualization: "https://gmonads.com",
          },
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(constants, null, 2),
            },
          ],
        };
      }
    );
    server.tool(
      "convert",
      "Convert between different data formats (hex, string, number, keccak256)",
      {
        input: z.string().describe("Input value to convert"),
        operations: z
          .array(
            z.enum([
              "toHex",
              "toString",
              "toNumber",
              "toKeccak256",
              "pad32",
              "toBigInt",
            ])
          )
          .describe("Array of conversion operations to perform in sequence"),
      },
      async ({ input, operations }) => {
        try {
          server.server.sendLoggingMessage({
            level: "info",
            data: { input, operations },
          });
          let currentValue: any = input;

          // First convert from input format to initial value
          // Check input type
          if (typeof input === "string") {
            if (isHex(input)) {
              currentValue = input as Hex;
            } else if (!isNaN(Number(input))) {
              currentValue = Number(input);
            } else {
              currentValue = input;
            }
          } else if (typeof input === "number") {
            currentValue = input;
          } else {
            throw new Error("Invalid input type. Expected string or number.");
          }

          // Process each operation in sequence
          const results = operations.map((operation) => {
            try {
              switch (operation) {
                case "toHex":
                  if (typeof currentValue === "string") {
                    return { operation, result: stringToHex(currentValue) };
                  } else if (typeof currentValue === "number") {
                    return { operation, result: numberToHex(currentValue) };
                  } else if (isHex(currentValue)) {
                    return { operation, result: currentValue };
                  }
                  throw new Error("Cannot convert to hex");

                case "toString":
                  if (isHex(currentValue)) {
                    return { operation, result: hexToString(currentValue) };
                  }
                  return { operation, result: String(currentValue) };

                case "toNumber":
                  if (isHex(currentValue)) {
                    return {
                      operation,
                      result: Number(hexToBigInt(currentValue)),
                    };
                  }
                  return { operation, result: Number(currentValue) };

                case "toKeccak256":
                  if (isHex(currentValue)) {
                    return { operation, result: toKeccak256(currentValue) };
                  } else if (typeof currentValue === "string") {
                    return {
                      operation,
                      result: toKeccak256(stringToHex(currentValue)),
                    };
                  }
                  throw new Error("Cannot compute keccak256");

                case "pad32":
                  if (isHex(currentValue)) {
                    return { operation, result: pad(currentValue) };
                  }
                  throw new Error("Can only pad hex values");

                case "toBigInt":
                  if (isHex(currentValue)) {
                    return {
                      operation,
                      result: hexToBigInt(currentValue).toString(),
                    };
                  }
                  return { operation, result: BigInt(currentValue).toString() };

                default:
                  throw new Error(`Unknown operation: ${operation}`);
              }
            } catch (error) {
              return {
                operation,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    input: {
                      value: input,
                    },
                    conversions: results,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Conversion error: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      }
    );
    // ... existing code ...
    server.tool(
      "decode-calldata",
      "Decode Ethereum transaction calldata and get function information",
      {
        input: z
          .object({
            calldata: z.string().optional().describe("Raw calldata to decode"),
            tx: z
              .string()
              .optional()
              .describe("Transaction hash or explorer URL"),
            chainId: z
              .string()
              .optional()
              .describe("Chain ID (required if tx is a hash)"),
          })
          .refine((data) => data.calldata || data.tx, {
            message: "Either calldata or tx must be provided",
          }),
      },
      async ({ input }) => {
        try {
          let calldata = input.calldata;

          // If transaction hash/URL is provided, fetch the calldata
          if (input.tx) {
            try {
              let txHash: string;
              let chain: any;

              // Check if input is a full transaction hash
              if (/^0x([A-Fa-f0-9]{64})$/.test(input.tx)) {
                txHash = input.tx;

                if (!input.chainId)
                  throw new Error(
                    "Chain ID required when using transaction hash"
                  );
                const chainId = parseInt(input.chainId);
                chain = monadTestnet;
                if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`);
              } else {
                // Handle explorer URL
                txHash = input.tx.split("/").pop()!;

                // Find chain from explorer URL
                const chainKey = Object.keys(c as any).filter((chainKey) => {
                  const chain = c[chainKey as keyof typeof c] as Chain;

                  if (!chain.blockExplorers) return false;

                  const explorerDomainDefault = chain.blockExplorers.default.url
                    .split("//")
                    .pop()!;
                  const explorerDomainEtherscan =
                    chain.blockExplorers.etherscan?.url.split("//").pop();

                  return input
                    .tx!.split("/")
                    .some(
                      (urlPart) =>
                        urlPart.toLowerCase() ===
                          explorerDomainDefault.toLowerCase() ||
                        (explorerDomainEtherscan &&
                          urlPart.toLowerCase() ===
                            explorerDomainEtherscan.toLowerCase())
                    );
                })[0];

                if (!chainKey)
                  throw new Error(
                    "Could not determine chain from explorer URL"
                  );
                chain = c[chainKey as keyof typeof c];
              }

              // Create client and fetch transaction

              const transaction = await publicClient.getTransaction({
                hash: txHash as Hex,
              });

              calldata = transaction.input;
            } catch (error) {
              throw new Error(
                `Failed to fetch transaction data: ${
                  error instanceof Error ? error.message : String(error)
                }`
              );
            }
          }

          if (!calldata) {
            throw new Error("No calldata available to decode");
          }

          // Ensure calldata starts with 0x
          calldata = startHexWith0x(calldata);

          // Get function selector (first 4 bytes / 8 characters after 0x)
          const selector = calldata.slice(0, 10);
          console.log("selector", selector);
          // Fetch function interface
          const functionInterface = await fetchFunctionInterface({ selector });

          if (!functionInterface) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      selector,
                      status: "unknown_function",
                      message:
                        "Could not find matching function signature for this selector",
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          // Parse function name and parameters
          const functionName = functionInterface.split("(")[0];
          const parametersString = functionInterface.slice(
            functionInterface.indexOf("(")
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    selector,
                    function: {
                      name: functionName,
                      signature: functionInterface,
                      parameters: parametersString,
                    },
                    calldata: calldata,
                    status: "success",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to decode calldata: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "readContract",
      "Read data from a smart contract. Format: { address: '0x...', abi: [...], functionName: 'string', args: [] }",
      {
        address: z.string().describe("Contract address (0x...)"),
        abi: z
          .array(z.object({
            name: z.string(),
            type: z.string(),
            stateMutability: z.string().optional(),
            inputs: z.array(z.object({
              name: z.string(),
              type: z.string()
            })),
            outputs: z.array(z.object({
              name: z.string(),
              type: z.string()
            }))
          }))
          .describe(
            "Contract ABI array (e.g., [{ name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: 'balance', type: 'uint256' }] }])"
          ),
        functionName: z
          .string()
          .describe("Function name to call (e.g., 'balanceOf')"),
        args: z
          .array(z.any())
          .optional()
          .describe("Function arguments array (e.g., ['0x...'])"),
      },
      async ({ address, abi, functionName, args }) => {
        const result = await readContract({
          address: address as `0x${string}`,
          abi,
          functionName,
          args,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    );
    function serializeValue(value: any): any {
  // Handle null and undefined
  if (value == null) {
    return value;
  }

  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  // Handle objects (but not Date, RegExp, etc.)
  if (typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeValue(v)])
    );
  }

  // Handle other types (strings, numbers, booleans)
  return value;
}
    async function readContract({
      address,
      abi,
      functionName,
      args = [],
    }: {
      address: `0x${string}`;
      abi: any[]; // Received ABI
      functionName: string;
      args?: any[];
    }) {
      try {
        logToFile('Starting contract read', {
          address,
          functionName,
          args
        });

        // Create contract instance with received ABI
        const contract = getContract({
          address,
          abi: (abi), // Parse the received ABI
          client: publicClient,
        });
        logToFile('Contract instance created', {
          address: contract.address,
          abi: contract.abi
        });

        // Dynamically call the function
        logToFile('Calling contract function', {
          functionName,
          args
        });
        const result = await contract.read[functionName](args);
        const safeJsonString = JSON.stringify(serializeValue(result));

// Use it with logging

        logToFile('Contract function call successful', {
          functionName,
          result
        });

        return {
          success: true,
          data: safeJsonString,
        };
      } catch (error) {
        logToFile('Error reading contract', {
          error: error instanceof Error ? error.message : String(error),
          address,
          functionName,
          args
        });
        console.error(`Error reading contract: ${error}`);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
    // server.resource(
    //   "monad-docs",
    //   new ResourceTemplate("monad://docs/references/llms-full", { list: undefined }),
    //   async (uri) => {
    //     try {
    //       const response = await fetch("https://docs.monad.xyz/llms-full.txt");
    //       if (!response.ok) {
    //         return {
    //           contents: [{
    //             uri: uri.href,
    //             text: `Error fetching Monad LLMs full text: ${response.status}`
    //           }]
    //         };
    //       }
    //       const text = await response.text();
    //       return {
    //         contents: [{
    //           uri: uri.href,
    //           text: text
    //         }]
    //       };
    //     } catch (error) {
    //       console.error("Error fetching Monad LLMs full text:", error);
    //       return {
    //         contents: [{
    //           uri: uri.href,
    //           text: `Error fetching Monad LLMs full text: ${error instanceof Error ? error.message : String(error)}`
    //         }]
    //       };
    //     }
    //   }
    // );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        resources: {
          monadDocs: {
            description: "Read the Monad LLMs full text",
          },
        },
      },
    },
  }
);
