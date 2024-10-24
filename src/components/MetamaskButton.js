import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function MetamaskButton() {
  const [account, setAccount] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
  };

  const connectMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('用户拒绝了连接请求');
      }
    } else {
      alert('Please install Metamask!');
    }
  };

  const disconnectMetamask = async () => {
    if (window.confirm('Are you sure disconnect metamask？')) {
      setAccount('');
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={account ? disconnectMetamask : connectMetamask}
      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
    >
      {account ? formatAddress(account) : 'Connect Metamask'}
    </button>
  );
}

export default MetamaskButton;
