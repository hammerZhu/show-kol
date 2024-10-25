import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { sendDbRequest } from '../myUtils';

const UserContext = createContext();

// ERC20 代币的 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

export function UserProvider({ children }) {
  // 在这里设置模拟的 user 值
  const [user, setUser] = useState('logan99962');
  const [wallets, setWallets] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState('');

  useEffect(() => {
    async function verifyAuth() {
      try {
        let twitterData = localStorage.getItem('twitterData');
        if(twitterData){
           console.log("twitterData=");
           console.log(twitterData);
           const response = await fetch('/api/verifyTwitterAuth', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({twitterData}),
           });
            if(response.ok){
              const data = await response.json();
              console.log("login user=");
              console.log(data);
              setUser(data);
            }
        }
      } catch (error) {
        console.error('验证失败:', error);
      }
    }

    // 如果你想在生产环境中禁用模拟数据，可以添加这个条件
    if (process.env.NODE_ENV === 'production') {
      verifyAuth();
    }
  }, []);

  async function fetchWalletsAndBalance() {
    if (user) {
      try {
        // 假设我们有一个 API 端点来获取用户绑定的钱包
        let sqlstr=`select wallet from ShowKolUsers where name='${user}'`;
        const response = await sendDbRequest(sqlstr);
        let wallets=[];
        if(response && response.data){
            wallets=response.data.map(item=>item.wallet);
        }
        setWallets(wallets);
        console.log('fetchWalletsAndBalance:',wallets);
        // 连接到 BSC 网络
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // ERC20 代币合约地址（这里使用的是 BSC 上的 ETH 代币地址）
        const tokenAddress = '0x2170ed0880ac9a755fd29b2688956bd959f933f8';
        
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        let totalBalance = ethers.getBigInt(0);
        for (const wallet of wallets) {
          const balance = await tokenContract.balanceOf(wallet);
          totalBalance += balance;
        }
        
        // 获取代币小数位数
        const decimals = await tokenContract.decimals();
        
        // 获取代币符号
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
        
        // 将余额转换为可读格式
        const formattedBalance = ethers.formatUnits(totalBalance, decimals);
        console.log(`${symbol} 余额:`, formattedBalance);
        setTokenBalance(formattedBalance);
      } catch (error) {
        console.error('获取钱包和余额时出错:', error);
      }
    }
  }

  useEffect(() => {
    if (user) {
      fetchWalletsAndBalance();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, wallets, setWallets, tokenBalance, tokenSymbol }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
