import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import WalletConnectButton from '../components/WalletConnectButton';

function ProfilePage() {
  const { user, userScore,wallets, removeWallet, inviteCodes, generateInviteCode, invitedUsers } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">请先登录</div>
      </div>
    );
  }

  const handleRemoveWallet = (wallet) => {
    if (window.confirm(`确定要删除钱包 ${wallet} 吗？`)) {
      removeWallet(wallet);
    }
  };

  // 格式化钱包地址
  const formatWalletAddress = (wallet) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const handleGenerateInviteCode = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const success = await generateInviteCode();
      if (success) {
        setCopyStatus('邀请码生成成功！');
        setTimeout(() => setCopyStatus(''), 3000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteLink = (code) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/?referral=${code}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopyStatus(`邀请链接已复制！`);
      setTimeout(() => setCopyStatus(''), 3000);
    }).catch(err => {
      console.error('复制失败:', err);
      setCopyStatus('复制失败，请重试');
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };
  let totalScore = 0;
 for(let i=0;i<userScore.lastCoinScores.length;i++){
  totalScore += userScore.lastCoinScores[i];
 }
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 用户信息卡片 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-3xl text-white">
                  {user.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user}</h1>
                <p className="text-gray-400">Twitter ID</p>
              </div>
            </div>
          </div>
        </div>

        {/* 积分卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 推文积分卡片 */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">推文积分</h2>
                <img src="/images/twitter.png" alt="Tweet Score" className="h-8 w-8 filter invert" />
              </div>
              <div className="text-3xl font-bold text-purple-500">
                {userScore?.lastTweetScore || 0}
              </div>
              <p className="text-gray-400 mt-2">
                最后推文: {userScore?.lastTweetId ?userScore.lastTweetId : '暂无'}
              </p>
            </div>
          </div>

          {/* 代币积分卡片 */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">代币积分</h2>
                <img src="/images/token.png" alt="Coin Score" className="h-8 w-8 filter invert" />
              </div>
              <div className="text-3xl font-bold text-purple-500">
                {totalScore}
              </div>
              <p className="text-gray-400 mt-2">
                最后区块: {userScore?.lastBlockNumber || '暂无'}
              </p>
            </div>
          </div>
        </div>

        {/* 管理钱包部分 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">管理已连接钱包</h2>
            
            {/* 直接使用 WalletConnectButton */}
            <div className="inline-block">
              <WalletConnectButton className="bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors duration-200" />
            </div>

            {/* 已连接钱包列表 */}
            <ul className="flex flex-wrap gap-2 mt-4">
              {wallets.map((wallet, index) => (
                <li key={index} className="flex items-center bg-gray-700 p-2 rounded-lg">
                  <span className="text-white">{formatWalletAddress(wallet)}</span>
                  <button
                    onClick={() => handleRemoveWallet(wallet)}
                    className="ml-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 邀请功能部分 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">邀请好友</h2>
              {copyStatus && (
                <div className="text-sm text-green-400 animate-fade-in">
                  {copyStatus}
                </div>
              )}
            </div>
            
            {/* 生成邀请码按钮和提示文字 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateInviteCode}
                disabled={isGenerating}
                className="bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors duration-200 inline-block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '生成中...' : '添加邀请码'}
              </button>
              <span className="text-gray-400 text-sm">点击邀请码可复制链接</span>
            </div>

            {/* 邀请码列表 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {inviteCodes.map((code, index) => (
                <div 
                  key={index} 
                  onClick={() => copyInviteLink(code)}
                  className="inline-block bg-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                >
                  <span className="text-white font-mono">{code}</span>
                </div>
              ))}
            </div>

            {/* 如果没有邀请码，显示提示 */}
            {inviteCodes.length === 0 && (
              <p className="text-gray-400 mt-4">
                还没有邀请码，点击上方按钮生成一个吧！
              </p>
            )}
          </div>
        </div>

        {/* 邀请的用户列表 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">我邀请的人</h2>
            
            {invitedUsers.length > 0 ? (
              <div className="space-y-4">
                {invitedUsers.map((invitedUser, index) => (
                  <div 
                    key={index}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono">@{invitedUser.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-gray-400">推文积分: </span>
                          <span className="text-purple-400">{invitedUser.lastTweetScore}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">代币积分: </span>
                          <span className="text-purple-400">{invitedUser.lastCoinScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">
                还没有邀请任何用户
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 