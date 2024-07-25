import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Button, Input, Box, Text, VStack } from '@chakra-ui/react';

const SwapComponent = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [wbtcAmount, setWbtcAmount] = useState('');
  const [btcAmount, setBtcAmount] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      wbtcAmount: '0.001',
      btcAmount: '0.000997',
      receiveAddress: '0xAddress1',
    },
    {
      id: '2',
      wbtcAmount: '0.005',
      btcAmount: '0.004985',
      receiveAddress: '0xAddress2',
    }
  ]);
  const [balance, setBalance] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (walletConnected && address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const balance = await provider.getBalance(address);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchBalance();
  }, [walletConnected, address]);

  const connectWallet = async () => {
    try {
      let provider;

      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('MetaMask provider:', provider);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const userAddress = accounts[0];
          setAddress(userAddress);
          setWalletConnected(true);
        } else {
          throw new Error('No accounts found.');
        }
      } else {
        provider = new WalletConnectProvider({
          infuraId: process.env.REACT_APP_INFURA_ID
        });
        console.log('WalletConnect provider:', provider);
        await provider.enable();
        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Failed to connect to wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setAddress('');
    setBalance('');
  };

  const handleSwap = async () => {
    try {
      // Implement swap functionality here
      console.log('Swapping', wbtcAmount, 'WBTC to', btcAmount, 'BTC for address', receiveAddress);

      // Example: Simulating a transaction and updating history
      const newTransaction = {
        id: new Date().toISOString(),
        wbtcAmount,
        btcAmount,
        receiveAddress
      };

      setTransactions(prev => [newTransaction, ...prev.slice(0, 1)]); // Keep only the 2 most recent transactions
      setWbtcAmount('');
      setBtcAmount('');
      setReceiveAddress('');
    } catch (error) {
      console.error('Error during swap:', error);
      alert('Failed to complete swap. Please check your inputs and try again.');
    }
  };

  return (
    <Box className="min-h-screen bg-gray-900 flex items-center justify-center" p={4}>
      <Box className="bg-gray-800 text-white p-8 rounded-lg shadow-lg" maxW="lg" width="full">
        <Text fontSize="2xl" mb={4}>Swap</Text>
        {walletConnected ? (
          <>
            <Text mb={4}>Connected Address: {address}</Text>
            <Text mb={4}>Balance: {balance} ETH</Text>
            <Button onClick={disconnectWallet} colorScheme="red" mb={4} width="full">
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <Button onClick={connectWallet} colorScheme="blue" mb={4} width="full">
            Connect Wallet
          </Button>
        )}
        <Box mb={4}>
          <Text className="block text-sm">Send WBTC</Text>
          <Input
            type="text"
            value={wbtcAmount}
            onChange={(e) => setWbtcAmount(e.target.value)}
            className="w-full p-2 mt-1 bg-gray-700 rounded"
          />
        </Box>
        <Box mb={4}>
          <Text className="block text-sm">Receive BTC</Text>
          <Input
            type="text"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value)}
            className="w-full p-2 mt-1 bg-gray-700 rounded"
          />
        </Box>
        <Box mb={4}>
          <Text className="block text-sm">Receive address</Text>
          <Input
            type="text"
            value={receiveAddress}
            onChange={(e) => setReceiveAddress(e.target.value)}
            className="w-full p-2 mt-1 bg-gray-700 rounded"
          />
        </Box>
        <Button onClick={handleSwap} colorScheme="green" width="full">
          Swap
        </Button>
        <Box mt={6}>
          <Text fontSize="xl" mb={4}>Transaction History</Text>
          {transactions.length === 0 ? (
            <Text>No transactions yet.</Text>
          ) : (
            <VStack spacing={3} align="start">
              {transactions.map((tx, index) => (
                <Box key={tx.id} className="bg-gray-700 p-4 rounded-lg">
                  <Box className="flex justify-between mb-2">
                    <Text>Order Id {index + 1}</Text>
                    <Text>Status: Success</Text>
                  </Box>
                  <Box className="flex justify-between mb-2">
                    <Text>WBTC: {tx.wbtcAmount}</Text>
                    <Text>BTC: {tx.btcAmount}</Text>
                  </Box>
                  <Text>Receive Address: {tx.receiveAddress}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SwapComponent;