import { defineChain } from "viem";

// Monad testnet RPC URL - you can replace this with your own provider URL
export const MONAD_TESTNET_RPC_URL = "https://testnet-rpc.monad.xyz/";

export const monadTestnet = defineChain({
  id: 10_143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Testnet MON Token",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [MONAD_TESTNET_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 251449,
    },
  },
  testnet: true,
});

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "decimals", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "symbol", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "name", type: "string" }],
  },
] as const;
