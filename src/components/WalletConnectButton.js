import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { useUser } from '../contexts/UserContext'; // 导入useUser hook
import { sendDbRequest } from '../myUtils.js'; // 假设这是您的数据库请求函数

function WalletConnectButton() {
  const [account, setAccount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { appendWallet } = useUser(); // 只需要引入 appendWallet 函数

  useEffect(() => {
    // 监听账号变化
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount('');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // 清理函数
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connectWallet = async (walletType) => {
    let provider;
    switch (walletType) {
      case 'metamask':
        provider = window.ethereum;
        if (!provider) {
          alert('Please install or unlock Metamask!');
          return;
        }
        break;
      case 'phantom':
        const isPhantomInstalled = window?.phantom?.ethereum?.isPhantom;
        if(isPhantomInstalled){
            provider = window.phantom.ethereum;
        }
        else{
          alert('Please install or unlock Phantom wallet!');
          return;
        }
        break;
      case 'okx':
        if (window.okxwallet) {
          provider = window.okxwallet;
        } else {
          alert('Please install or unlock OKX wallet!');
          return;
        }
        break;
      default:
        alert('not supported wallet type');
        return;
    }

    try {
      // 请求用户授权
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      // 创建 ethers 提供者
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      console.log(`钱包已连接: ${address}`);
      console.log(`地址类型: ${typeof address}`);
      // 调用 context 中的 appendWallet 函数
      await appendWallet(address);
    } catch (error) {
      console.error('用户拒绝连接或发生错误', error);
    }
    setShowModal(false);
  };

  const disconnectWallet = async () => {
    if (window.confirm('Are you sure to disconnect?')) {
      setAccount('');
      // 如果需要，这里可以添加其他清理逻辑
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div
        onClick={() => account ? disconnectWallet() : setShowModal(true)}
        className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded cursor-pointer rounded-xl">
        <span className="mr-2">
          {/* 在这里插入图标 */}
        </span>
        <span>
          {account ? formatAddress(account) : 'connect wallet'}
        </span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">select a wallet</h2>
            <div className="flex flex-col gap-4">
              <div onClick={() => connectWallet('metamask')} className="flex items-center bg-gray-700 text-white p-2 rounded cursor-pointer">
                <span className="mr-2">
                  <img src="/images/metamask.webp" alt="Metamask" className="w-6 h-6" />
                </span>
                <span>Metamask</span>
              </div>
              <div onClick={() => connectWallet('phantom')} className="flex items-center bg-gray-700 text-white p-2 rounded cursor-pointer">
                <span className="mr-2">
                  <img src="/images/phantom.png" alt="Phantom" className="w-6 h-6" />
                </span>
                <span>Phantom</span>
              </div>
              <div onClick={() => connectWallet('okx')} className="flex items-center bg-gray-700 text-white p-2 rounded cursor-pointer">
                <span className="mr-2">
                  <img src="/images/okx_okb_logo.png" alt="OKX Wallet" className="w-6 h-6" />
                </span>
                <span>OKX Wallet</span>
              </div>
            </div>
            <div onClick={() => setShowModal(false)} className="mt-4 bg-gray-700 text-white p-2 rounded cursor-pointer text-center">
              Cancel
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WalletConnectButton;
