import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { sendDbRequest } from '../myUtils';

const UserContext = createContext();

//todo 初始化的顺序需要确定好。

// ERC20 代币的 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];
//根据实际需要来配置。注意最后区块需要加大，服务器只能保持一小段时间的区块数据，必要的时候，需要用一个后台程序来刷新旧的区块。
const START_BLOCK=21657962;
const ProviderUrl='https://developer-access-mainnet.base.org';
const TokenAddress='0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';//degen token 

export function UserProvider({ children }) {
  // 在这里设置模拟的 user 值
  const [user, setUser] = useState('logan99962');
  const [wallets, setWallets] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [holdingScore, setHoldingScore] = useState(0); // 当前用户持有币的积分。
  const [userScore, setUserScore] = useState({
    name: '',
    lastCoinScore: 0,
    lastBlockNumber: START_BLOCK,
    lastTweetScore: 0,
    lastTweetId: ''
  });//当前用户基准积分。
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    initUser();
  }, []);
  // 获取用户分数记录的函数
  const fetchUserScore = async (username) => {
    try {
      const sqlstr = `SELECT * FROM ShowKolScore WHERE name='${username}'`;
      const response = await sendDbRequest(sqlstr);
      
      if (response && response.data && response.data.length > 0) {
        const scoreData = response.data[0];
        setUserScore({
          name: scoreData.name,
          lastCoinScore: scoreData.last_coin_score || 0,
          lastBlockNumber: scoreData.last_block_number || START_BLOCK,
          lastTweetScore: scoreData.last_tweet_score || 0,
          lastTweetId: scoreData.last_tweet_id || ''
        });
      } else {
        // 如果没有记录，创建新记录
        setUserScore({
          name: username,
          lastCoinScore: 0,
          lastBlockNumber: START_BLOCK,
          lastTweetScore: 0,
          lastTweetId: ''
        });
        let sqlstr = `INSERT INTO ShowKolScore (name, lastCoinScore, lastBlockNumber, lastTweetScore, lastTweetId) VALUES ('${username}', 0, 0, 0, '')`;
        await sendDbRequest(sqlstr);
      }
    } catch (error) {
      console.error('获取用户分数记录失败:', error);
    }
  };

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
        console.log('fetchWalletsAndBalance:', wallets);
        
        // 在成功获取钱包后调用其他函数
        let lastBlockNumber = userScore.lastBlockNumber;
        //todo await fetchWalletsAndBalance(wallets);
        await calculateHoldingScore(wallets,lastBlockNumber);
      } catch (error) {
        console.error('获取钱包信息时出错:', error);
      }
    }
  }
  async function fetchWalletsAndBalance(wallets) {
    if (user) {
      try {
       // 连接到 BSC 网络
        const provider = new ethers.JsonRpcProvider(ProviderUrl);
        
        // ERC20 代币合约地址
        
        const tokenContract = new ethers.Contract(TokenAddress, ERC20_ABI, provider);
        
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

  async function calculateHoldingScore(wallets,lastBlockNumber) {
    console.log(`calculateHoldingScore for wallets=${wallets} from block=${lastBlockNumber}`);
    
    if (!wallets.length) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(ProviderUrl);
      let totalScore = 0;
      const currentBlock = await provider.getBlockNumber();

      for (const wallet of wallets) {
        console.log('get transfer logs for wallet=',wallet);
        // 获取所有转入和转出交易
        const transfersIn = await provider.getLogs({
          address: TokenAddress,
          topics: [
            ethers.id("Transfer(address,address,uint256)"),
            null,
            ethers.zeroPadValue(wallet.toLowerCase(), 32)
          ],
          fromBlock:lastBlockNumber,
          toBlock: 'latest'
        });
       // console.log('transfersIn=',transfersIn);
        const transfersOut = await provider.getLogs({
          address: TokenAddress,
          topics: [
            ethers.id("Transfer(address,address,uint256)"),
            ethers.zeroPadValue(wallet.toLowerCase(), 32),
            null
          ],
          fromBlock: lastBlockNumber,
          toBlock: 'latest'
        });
       // console.log('transfersOut=',transfersOut);
        // 按区块号排序所有交易
        const allTransfers = [...transfersIn, ...transfersOut]
          .sort((a, b) => a.blockNumber - b.blockNumber);
       // console.log('allTransfers=',allTransfers);
        let balance = ethers.getBigInt(0);
        let lastBlockNum = 0;

        // 计算每次交易后的余额和持有时长
        for (const transfer of allTransfers) {
          if (lastBlockNum > 0) {
            // 计算这段时间的持有分数 (余额 * 区块数)
            totalScore += Number(balance) * (transfer.blockNumber - lastBlockNum);
          }

          const amount = ethers.getBigInt(transfer.data);
          if (transfer.topics[2].toLowerCase() === ethers.zeroPadValue(wallet.toLowerCase(), 32)) {
            // 转入
            balance += amount;
          } else {
            // 转出
            balance -= amount;
          }
          lastBlockNum = transfer.blockNumber;
        }

        // 计算最后一次交易到当前的持有分数
        if (lastBlockNum > 0 && balance > 0) {
          totalScore += Number(balance) * (currentBlock - lastBlockNum);
        }
      }
      //和现有积分相加，得到最后的得分。
      setHoldingScore(totalScore/1e22+userScore.lastCoinScore);
      console.log('持有分数：', totalScore);
    } catch (error) {
      console.error('计算持有分数时出错:', error);
    }
  }

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

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      wallets, 
      setWallets, 
      tokenBalance, 
      tokenSymbol,
      holdingScore,
      userScore,
      setUserScore
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
