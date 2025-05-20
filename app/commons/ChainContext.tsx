import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Chain } from 'viem/chains';
import { c } from './common';
import { _chains } from './_chains';

interface ChainContextType {
  chainIdToChain: { [chainId: number]: Chain };
  erc3770ShortNameToChain: { [shortName: string]: Chain };
  chainIdToImage: { [chainId: number]: string };
}

const ChainContext = createContext<ChainContextType | null>(null);

export function ChainProvider({ children }: { children: ReactNode }) {
  // Memoize chainIdToChain object
  const chainIdToChain = useMemo(() => {
    let res: {
      [chainId: number]: Chain;
    } = {};

    Object.values(c).map((chain) => {
      res[chain.id] = chain;
    });

    return res;
  }, []);

  // Memoize erc3770ShortNameToChain object
  const erc3770ShortNameToChain = useMemo(() => {
    let res: {
      [shortName: string]: Chain;
    } = {};

    Object.entries(c).forEach(([key, chain]) => {
      const chainInfo = _chains.find(
        (c: { chainId: number; shortName: string }) => c.chainId === chain.id
      );

      if (chainInfo) {
        res[chainInfo.shortName] = chain;
      }
    });

    return res;
  }, []);

  // Memoize chainIdToImage object
  const chainIdToImage = useMemo(() => {
    const basePath = "/chainIcons";

    let res: {
      [chainId: number]: string;
    } = {
      [c.arbitrum.id]: `${basePath}/arbitrum.svg`,
      [c.avalanche.id]: `${basePath}/avalanche.svg`,
      [c.base.id]: `${basePath}/base.svg`,
      [c.bsc.id]: `${basePath}/bsc.svg`,
      [c.cronos.id]: `${basePath}/cronos.svg`,
      [c.goerli.id]: `${basePath}/ethereum.svg`,
      [c.mainnet.id]: `${basePath}/ethereum.svg`,
      [c.optimism.id]: `${basePath}/optimism.svg`,
      [c.polygon.id]: `${basePath}/polygon.svg`,
      [c.sepolia.id]: `${basePath}/ethereum.svg`,
      [c.zora.id]: `${basePath}/zora.svg`,
    };

    Object.keys(chainIdToChain).map((_chainId) => {
      const chainId = Number(_chainId);

      if (!res[chainId]) {
        res[
          chainId
        ] = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=128&url=${chainIdToChain[chainId].blockExplorers?.default.url}`;
      }
    });

    return res;
  }, [chainIdToChain]);

  const value = useMemo(() => ({
    chainIdToChain,
    erc3770ShortNameToChain,
    chainIdToImage,
  }), [chainIdToChain, erc3770ShortNameToChain, chainIdToImage]);

  return (
    <ChainContext.Provider value={value}>
      {children}
    </ChainContext.Provider>
  );
}

// Hooks for convenient access to context data
export function useChainContext() {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChainContext must be used within a ChainProvider');
  }
  return context;
}

export function useChainIdToChain() {
  const { chainIdToChain } = useChainContext();
  return chainIdToChain;
}

export function useErc3770ShortNameToChain() {
  const { erc3770ShortNameToChain } = useChainContext();
  return erc3770ShortNameToChain;
}

export function useChainIdToImage() {
  const { chainIdToImage } = useChainContext();
  return chainIdToImage;
} 