import { EvmMcpWallet } from '../core/wallet';
import { CHAIN_IDS } from '../utils/constants';

// Mock ethers.js
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  
  // Mock Wallet
  const mockWallet = {
    address: '0x1234567890123456789012345678901234567890',
    privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    signMessage: jest.fn().mockResolvedValue('0xmocksignature'),
    signTransaction: jest.fn().mockResolvedValue('0xmocksignedtx'),
    sendTransaction: jest.fn().mockResolvedValue({ hash: '0xmocktxhash' })
  };
  
  // Mock Provider
  const mockProvider = {
    getBalance: jest.fn().mockResolvedValue(originalModule.parseEther('1.0')),
    waitForTransaction: jest.fn().mockResolvedValue({}),
  };
  
  // Mock Contract
  const mockContract = {
    balanceOf: jest.fn().mockResolvedValue(originalModule.parseUnits('100', 6)),
    transfer: jest.fn().mockResolvedValue({ hash: '0xmocktokentxhash' })
  };
  
  return {
    ...originalModule,
    Wallet: jest.fn().mockImplementation(() => mockWallet),
    JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
    Contract: jest.fn().mockImplementation(() => mockContract)
  };
});

// Mock bip39
jest.mock('bip39', () => ({
  mnemonicToSeedSync: jest.fn().mockReturnValue(Buffer.from('mockseed'))
}));

// Mock hdkey
jest.mock('hdkey', () => ({
  fromMasterSeed: jest.fn().mockImplementation(() => ({
    derive: jest.fn().mockImplementation(() => ({
      privateKey: Buffer.from('mockprivatekey')
    }))
  }))
}));

describe('EvmMcpWallet', () => {
  let wallet: EvmMcpWallet;
  
  beforeEach(() => {
    // Create wallet with private key
    wallet = new EvmMcpWallet({
      privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      rpcUrl: 'https://mainnet.infura.io/v3/mock-key',
      chainId: CHAIN_IDS.ETHEREUM
    });
  });
  
  describe('constructor', () => {
    it('should create a wallet with private key', () => {
      expect(wallet).toBeDefined();
      expect(wallet.getAddress()).toBe('0x1234567890123456789012345678901234567890');
    });
    
    it('should create a wallet with mnemonic', () => {
      const mnemonicWallet = new EvmMcpWallet({
        mnemonic: 'test test test test test test test test test test test junk',
        rpcUrl: 'https://mainnet.infura.io/v3/mock-key',
        chainId: CHAIN_IDS.ETHEREUM
      });
      
      expect(mnemonicWallet).toBeDefined();
      expect(mnemonicWallet.getAddress()).toBe('0x1234567890123456789012345678901234567890');
    });
    
    it('should throw error if neither private key nor mnemonic is provided', () => {
      expect(() => {
        new EvmMcpWallet({
          rpcUrl: 'https://mainnet.infura.io/v3/mock-key',
          chainId: CHAIN_IDS.ETHEREUM
        });
      }).toThrow('Either privateKey or mnemonic must be provided');
    });
  });
  
  describe('getAddress', () => {
    it('should return the wallet address', () => {
      expect(wallet.getAddress()).toBe('0x1234567890123456789012345678901234567890');
    });
  });
  
  describe('getPrivateKey', () => {
    it('should return the wallet private key', () => {
      expect(wallet.getPrivateKey()).toBe('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    });
  });
  
  describe('getBalance', () => {
    it('should return the wallet balance', async () => {
      const balance = await wallet.getBalance();
      expect(balance).toBe('1.0');
    });
  });
  
  describe('getTokenBalance', () => {
    it('should return the token balance', async () => {
      const balance = await wallet.getTokenBalance('0xTokenAddress', 6);
      expect(balance).toBe('100.0');
    });
  });
  
  describe('sendTransaction', () => {
    it('should send a transaction', async () => {
      const txHash = await wallet.sendTransaction({
        to: '0xRecipientAddress',
        value: '0.1',
        gasLimit: 21000
      });
      
      expect(txHash).toBe('0xmocktxhash');
    });
  });
  
  describe('sendToken', () => {
    it('should send tokens', async () => {
      const txHash = await wallet.sendToken({
        tokenAddress: '0xTokenAddress',
        to: '0xRecipientAddress',
        amount: '10',
        decimals: 6
      });
      
      expect(txHash).toBe('0xmocktokentxhash');
    });
  });
  
  describe('signMessage', () => {
    it('should sign a message', async () => {
      const signature = await wallet.signMessage('Hello, Web3!');
      expect(signature).toBe('0xmocksignature');
    });
  });
  
  describe('signTransaction', () => {
    it('should sign a transaction', async () => {
      const signedTx = await wallet.signTransaction({
        to: '0xRecipientAddress',
        value: '0.1',
        gasLimit: 21000
      });
      
      expect(signedTx).toBe('0xmocksignedtx');
    });
  });
}); 