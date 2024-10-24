import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';

function WalletConnectButton() {
  const [account, setAccount] = useState('');
  const [showModal, setShowModal] = useState(false);

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
      await provider.request({ method: 'eth_requestAccounts' });
      // 创建 ethers 提供者
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      console.log(`钱包已连接: ${address}`);
      console.log(`地址类型: ${typeof address}`);
    } catch (error) {
      console.error('user rejected connection', error);
    }
    setShowModal(false);
  };

  const disconnectWallet = async () => {
    if (window.confirm('Are you sure to disconnect?')) {
      setAccount('');
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div
        onClick={() => account ? disconnectWallet() : setShowModal(true)}
        className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded cursor-pointer rounded-xl">
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
