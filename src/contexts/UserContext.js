import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { sendDbRequest } from '../myUtils';
import { BrowserProvider } from 'ethers';
const UserContext = createContext();


// ERC20 代币的 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];
//根据实际需要来配置。注意最后区块需要加大，服务器只能保持一小段时间的区块数据，必要的时候，需要用一个后台程序来刷新旧的区块。
const START_BLOCK=21657962;
const ProviderUrl='https://mainnet.base.org';
// 修改 TokenAddress 为数组
const TokenAddresses = [
 '0x574178357661527601482b79af6bb1ff7cc1306a', // 1984 token
  '0x4278a8944cf63753b13e9f726bbc1192412988d8'// 在这里添加其他代币地址
];
//0x4e9299467f723E190bd2B7e6339624382A786a3E 测试账号，21701002 测试首区块。
export function UserProvider({ children }) {
  // 在这里设置模拟的 user 值
  const [user, setUser] = useState('');//todo 发行版改成空串。
  const [wallets, setWallets] = useState([]);
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState({});
  const [holdingScores, setHoldingScores] = useState({});
  const [userScore, setUserScore] = useState({
    name: '',
    lastBlockNumber: START_BLOCK,
    lastTweetScore: 0,
    lastTweetId: '',
    referrial: '',
    baseScore: 0,
    ethScore: 0
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [currentWallet, setCurrentWallet] = useState('');

  useEffect(() => {
    initUser();
  }, []);

  // 生成新的邀请码
  const generateInviteCode = async () => {
    try {
      // 生成12位随机邀请码
      const randomCode = Math.random().toString(36).substring(2, 14).toUpperCase();
      const sqlstr = `
        INSERT INTO ShowKolInviteCodes (code, user) 
        VALUES ('${randomCode}', '${user}')
      `;
      
      const response = await sendDbRequest(sqlstr);
      if (response && response.success) {
        // 更新本地邀请码列表
        setInviteCodes(prev => [...prev, randomCode]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('生成邀请码失败:', error);
      return false;
    }
  };

  // 获取用户的所有邀请码
  const fetchInviteCodes = async () => {
    try {
      const sqlstr = `SELECT code FROM ShowKolInviteCodes WHERE user = '${user}'`;
      const response = await sendDbRequest(sqlstr);
      
      if (response && response.data) {
        setInviteCodes(response.data.map(item => item.code));
      }
    } catch (error) {
      console.error('获取邀请码失败:', error);
    }
  };

  // 在用户登录后获取邀请码
  useEffect(() => {
    if (user) {
      fetchInviteCodes();
    } else {
      setInviteCodes([]); // 用户登出时清空邀请码列表
    }
  }, [user]);

  // 获取用户分数记录的函数
  const fetchUserScore = async (username) => {
    try {
      const sqlstr = `SELECT * FROM ShowKolScore WHERE name='${username}'`;
      const response = await sendDbRequest(sqlstr);
      
      if (response && response.data && response.data.length > 0) {
        const scoreData = response.data[0];
        
        setUserScore({
          name: scoreData.name,
          lastBlockNumber: scoreData.lastBlockNumber || START_BLOCK,
          lastTweetScore: scoreData.lastTweetScore || 0,
          lastTweetId: scoreData.lastTweetId || '',
          referrial: scoreData.referrial || '',
          baseScore: 0,
          ethScore:0
        });
        
        
      } else {
        // 如果没有记录，创建新记录，新纪录没有钱包，所以blocknumber是最新的block.
        let referrialValue = localStorage.getItem('referral');
        let referrial = referrialValue ? referrialValue : '';
        
        const newUserScore = {
          name: username,
          lastBlockNumber: START_BLOCK,
          lastTweetScore: 0,
          lastTweetId: '',
          referrial: referrial,
          baseScore: 0,
          ethScore: 0
        };
        setUserScore(newUserScore);
        
        // 构建 SQL 插入语句
        let sqlstr = `
          INSERT INTO ShowKolScore (
            name,  lastTweetScore, lastTweetId, referrial
          ) VALUES (
            '${username}', 0, '', '${referrial}'
          )`;
        await sendDbRequest(sqlstr);
      }
    } catch (error) {
      console.error('获取用户分数记录失败:', error);
    }
  };

  // 获取当前用户邀请的所有用户
  const fetchInvitedUsers = async () => {
    try {
      const sqlstr = `
        SELECT s.name, s.lastTweetScore 
        FROM ShowKolScore s 
        JOIN ShowKolInviteCodes i ON s.referrial = i.code 
        WHERE i.user = '${user}'
      `;
      
      const response = await sendDbRequest(sqlstr);
      if (response && response.data) {
        setInvitedUsers(response.data);
      }
    } catch (error) {
      console.error('获取邀请用户列表失败:', error);
    }
  };

  // 在用户登录后获取邀请的用户列表
  useEffect(() => {
    if (user) {
      fetchInvitedUsers();
    } else {
      setInvitedUsers([]); // 用户登出时清空列表
    }
  }, [user]);

  async function initUser(){
    if (isInitializing) return;
    setIsInitializing(true);
    try{
      if (process.env.NODE_ENV === 'production') {
        await verifyAuth();
      }
      if(user){
        await fetchUserScore(user);
        await fetchWallets();
        // 尝试自动连接上次使用的钱包
        await autoConnectWallet();
        await updateTweetScore(user);
      }
    }catch(error){
      console.error('初始化用户时出错:', error);
    }finally{
      setIsInitializing(false);
    }
    
  }
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
            // 获取到用户名后立即获取分数记录
            await fetchUserScore(data);
          }
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  }
  async function fetchWallets() {
    if (user) {
      try {
        let sqlstr = `select wallet from ShowKolUsers where name='${user}'`;
        const response = await sendDbRequest(sqlstr);
        let wallets = [];
        if (response && response.data) {
          wallets = response.data.map(item => item.wallet);
        }
        setWallets(wallets);
        
        // 在成功获取钱包后计算两个链的积分
        await Promise.all([
          calculateBaseHoldingScore(wallets),
          calculateEthHoldingScore(wallets)
        ]);
      } catch (error) {
        console.error('获取钱包信息时出错:', error);
      }
    }
  }
  
 /* async function fetchWalletsAndBalance(wallets) {
    if (user) {
      try {
        const provider = new ethers.JsonRpcProvider(ProviderUrl);
        const balances = {};
        const symbols = {};
        
        for (const tokenAddress of TokenAddresses) {
          const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          let totalBalance = ethers.getBigInt(0);
          
          for (const wallet of wallets) {
            const balance = await tokenContract.balanceOf(wallet);
            totalBalance += balance;
          }
          
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();
          
          symbols[tokenAddress] = symbol;
          balances[tokenAddress] = ethers.formatUnits(totalBalance, decimals);
        }
        
        setTokenSymbols(symbols);
        setTokenBalances(balances);
      } catch (error) {
        console.error('获取钱包和余额时出错:', error);
      }
    }
  }
*/
  
  // 更新推文分数的函数
  const updateTweetScore = async (user) => {
    try {
      //查询用户是否有新的帖子未统计
      let sqlstr = `select tid,score from ShowKolPostedTweets where author='${user.toLowerCase()}' and tid>'${userScore.lastTweetId}' order by tid desc`;
      const response = await sendDbRequest(sqlstr);
      let score=0;
      let latestTid='';
      if(response && response.data && response.data.length>0){
        latestTid=response.data[0].tid;
        for(let i=0;i<response.data.length;i++){
          score+=response.data[i].score;
        }
      }
      if(score>0){
        const newScore = userScore.lastTweetScore + score;
      
        // 更新数据库
        const sqlstr1 = `
          UPDATE ShowKolScore 
          SET lastTweetScore = ${newScore}, 
              lastTweetId = '${latestTid}' 
          WHERE name = '${user.toLowerCase()}'
        `;
        await sendDbRequest(sqlstr);
        // 更新本地状态
        setUserScore(prev => ({
          ...prev,
          lastTweetScore: newScore,
          lastTweetId: latestTid
        }));
      }
      

      
    } catch (error) {
      console.error('更新推文分数失败:', error);
    }
  };

  // 删除钱包的函数
  const removeWallet = async (wallet) => {
    try {
      // 1. 先更新积分
      await Promise.all([
        calculateBaseHoldingScore(wallets),
        calculateEthHoldingScore(wallets)
      ]);
     // 再删除钱包记录
    let sqlstr = `
      DELETE FROM ShowKolUsers 
      WHERE wallet='${wallet}'
    `;
    let response = await sendDbRequest(sqlstr);
    
    if (response && response.success) {
      // 6. 更新本地状态
      setWallets(wallets.filter(w => w !== wallet));
      return true;
    } else {
      console.error('删除钱包失败:', response?.message);
      return false;
    }
    } catch (error) {
      console.error('删除钱包时出错:', error);
      return false;
    }
  };

  // 添加新函数获取最新区块
  const getLatestBlockNumber = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(ProviderUrl);
      const blockNumber = await provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error('获取最新区块号失败:', error);
      return null;
    }
  };

  const appendWallet = async (address) => {
    if (!user) {
      console.warn('用户未登录Twitter,无法绑定钱包地址');
      return false;
    }
    console.log('appendWallet', address);
    address=address.toLowerCase();
    try {
      // 1. 检查数据库中是否已经存在该钱包地址
      let sqlstr = `select * from ShowKolUsers where wallet='${address}'`;
      let result = await sendDbRequest(sqlstr);
      console.log('appendWallet result=',result);
      if (result && result.data && result.data.length === 0) {
        console.log(`old wallets=${wallets}`);
        // 2. 先更新现有积分
        await Promise.all([
          calculateBaseHoldingScore(wallets),
          calculateEthHoldingScore(wallets)
        ]);
        //添加钱包到数据库
        sqlstr = `INSERT INTO ShowKolUsers VALUES ('${address}','${user}')`;
        await sendDbRequest(sqlstr);
        // 更新本地状态
        setWallets(prevWallets =>{
            if(!prevWallets.includes(address)){
              return [...prevWallets, address];
            }else{
              return prevWallets;
            }
         }); 
        
        console.log(`钱包地址${address}已成功绑定到Twitter账号${user}`);
        return true;
      } else {
        console.log('该钱包地址已存在');
        return false;
      }
    } catch (error) {
      console.error('绑定钱包地址失败:', error);
      return false;
    }
  };
// 添加计算 Base 链积分的函数
async function calculateBaseHoldingScore(wallets) {
  try {
    // 1. 获取最大区块号作为截止区块
    const sqlMaxBlock = `SELECT MAX(blockNumber) as maxBlock FROM ShowKolBaseTrades`;
    const maxBlockResponse = await sendDbRequest(sqlMaxBlock);
    const endBlock = maxBlockResponse.data[0].maxBlock;
    
    let totalScore = 0;
    
    // 2. 对每个钱包分别计算积分
    for (const wallet of wallets) {
      // 获取该钱包的所有交易记录并按区块排序
      const sqlTrades = `
        SELECT blockNumber, amount 
        FROM ShowKolBaseTrades 
        WHERE address = '${wallet.toLowerCase()}' 
        ORDER BY blockNumber ASC
      `;
      const tradesResponse = await sendDbRequest(sqlTrades);
      const trades = tradesResponse.data;
      
      if (!trades || trades.length === 0) continue;
      
      // 用于追踪每次买入的记录
      let buyRecords = [];  // 格式: [{amount: number, block: number}]
      
      // 3. 处理每笔交易
      for (const trade of trades) {
        const { blockNumber, amount } = trade;
        
        if (amount > 0) {
          // 买入操作：直接添加到买入记录
          buyRecords.push({
            amount: amount,
            block: blockNumber
          });
        } else {
          // 卖出操作：从最早的买入记录中扣除
          let remainingSellAmount = -amount;
          
          while (remainingSellAmount > 0 && buyRecords.length > 0) {
            const oldestBuy = buyRecords[0];
            
            if (oldestBuy.amount <= remainingSellAmount) {
              // 完全卖出这笔买入
              remainingSellAmount -= oldestBuy.amount;
              buyRecords.shift();
            } else {
              // 部分卖出这笔买入
              oldestBuy.amount -= remainingSellAmount;
              remainingSellAmount = 0;
            }
          }
        }
      }
      
      // 4. 计算剩余买入记录的积分
      for (const record of buyRecords) {
        // 积分 = 数量 * (截止区块 - 买入区块)
        const score = record.amount * (endBlock - record.block);
        totalScore += score;
      }
    }
    console.log('calculateBaseHoldingScore', totalScore);
    setUserScore(prev => ({
      ...prev,
      baseScore: totalScore
    }));
    return totalScore;
    
  } catch (error) {
    console.error('计算 Base 链持币积分时出错:', error);
    return 0;
  }
}

  // 添加计算 ETH 链积分的函数
  async function calculateEthHoldingScore(wallets) {
    try {
      // 1. 获取最大区块号作为截止区块
      const sqlMaxBlock = `SELECT MAX(blockNumber) as maxBlock FROM ShowKolEthTrades`;
      const maxBlockResponse = await sendDbRequest(sqlMaxBlock);
      const endBlock = maxBlockResponse.data[0].maxBlock;
      
      let totalScore = 0;
      
      // 2. 对每个钱包分别计算积分
      for (const wallet of wallets) {
        // 获取该钱包的所有交易记录并按区块排序
        const sqlTrades = `
          SELECT blockNumber, amount 
          FROM ShowKolEthTrades 
          WHERE address = '${wallet.toLowerCase()}' 
          ORDER BY blockNumber ASC
        `;
        const tradesResponse = await sendDbRequest(sqlTrades);
        const trades = tradesResponse.data;
        
        if (!trades || trades.length === 0) continue;
        
        // 用于追踪每次买入的记录
        let buyRecords = [];  // 格式: [{amount: number, block: number}]
        
        // 3. 处理每笔交易
        for (const trade of trades) {
          const { blockNumber, amount } = trade;
          
          if (amount > 0) {
            // 买入操作：直接添加到买入记录
            buyRecords.push({
              amount: amount,
              block: blockNumber
            });
          } else {
            // 卖出操作：从最早的买入记录中扣除
            let remainingSellAmount = -amount;
            
            while (remainingSellAmount > 0 && buyRecords.length > 0) {
              const oldestBuy = buyRecords[0];
              
              if (oldestBuy.amount <= remainingSellAmount) {
                // 完全卖出这笔买入
                remainingSellAmount -= oldestBuy.amount;
                buyRecords.shift();
              } else {
                // 部分卖出这笔买入
                oldestBuy.amount -= remainingSellAmount;
                remainingSellAmount = 0;
              }
            }
          }
        }
        
        // 4. 计算剩余买入记录的积分
        for (const record of buyRecords) {
          // 积分 = 数量 * (截止区块 - 买入区块)
          const score = record.amount * (endBlock - record.block);
          totalScore += score;
        }
      }
      console.log('calculateEthHoldingScore', totalScore);
      setUserScore(prev => ({
        ...prev,
        ethScore: totalScore
      }));
      return totalScore;
      
    } catch (error) {
      console.error('计算 ETH 链持币积分时出错:', error);
      return 0;
    }
  }


  
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
  let connectedAddress='';
  try {
    // 请求用户授权
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    // 创建 ethers 提供者
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    connectedAddress=address;
    console.log(`connectedWallet: ${address}`);
    await appendWallet(address);

    // 设置当前钱包
    setCurrentWallet(address);
    // 保存钱包类型
    localStorage.setItem('lastWalletType', walletType);
    localStorage.setItem('lastConnectedWallet', address);

  } catch (error) {
    console.error('用户拒绝连接或发生错误', error);
    setCurrentWallet('');
  }
  return connectedAddress;
 }
 // 添加自动连接钱包的函数
const autoConnectWallet = async () => {
  const lastWalletType = localStorage.getItem('lastWalletType');
  if (lastWalletType) {
    await connectWallet(lastWalletType);
  }
};
  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      wallets, 
      setWallets, 
      currentWallet,
      tokenBalances, 
      tokenSymbols,
      holdingScores,
      userScore,
      setUserScore,
      fetchUserScore,
      removeWallet,
      inviteCodes,
      generateInviteCode,
      fetchInviteCodes,
      invitedUsers,
      fetchInvitedUsers,
      getLatestBlockNumber,
      appendWallet,
      calculateBaseHoldingScore,
      calculateEthHoldingScore,
      connectWallet
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
