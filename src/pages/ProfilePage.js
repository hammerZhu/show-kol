import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import WalletConnectButton from '../components/WalletConnectButton';

function ProfilePage() {
  const { t } = useTranslation();
  const { user, userScore, wallets, removeWallet, inviteCodes, generateInviteCode, invitedUsers } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('profile.pleaseLogin')}</div>
      </div>
    );
  }

  const handleRemoveWallet = (wallet) => {
    if (window.confirm(`${t('profile.confirmDelete')} ${wallet} ?`)) {
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
        setCopyStatus(t('profile.invite.copySuccess'));
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
      setCopyStatus(t('profile.invite.copySuccess'));
      setTimeout(() => setCopyStatus(''), 3000);
    }).catch(err => {
      console.error('复制失败:', err);
      setCopyStatus(t('profile.invite.copyFail'));
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };

  let totalScore = userScore.baseScore + userScore.ethScore;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 用户信息卡片 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-3xl text-white">
                  {user.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user}</h1>
                <p className="text-gray-400">{t('profile.userInfo.twitterId')}</p>
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
                <h2 className="text-xl font-semibold text-white">{t('profile.scores.tweetScore')}</h2>
                <img src="/images/twitter.png" alt="Tweet Score" className="h-8 w-8 filter invert" />
              </div>
              <div className="text-3xl font-bold text-red-500">
                {userScore?.lastTweetScore || 0}
              </div>
              <p className="text-gray-400 mt-2">
                {t('profile.scores.lastTweet')}: {userScore?.lastTweetId || t('profile.scores.noTweet')}
              </p>
            </div>
          </div>

          {/* 代币积分卡片 */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{t('profile.scores.tokenScore')}</h2>
              </div>
              
              {/* 总积分 */}
              <div className="text-3xl font-bold text-red-500 mb-6">
                {totalScore}
              </div>
              
              {/* 分链显示积分 - 改为上下布局 */}
              <div className="space-y-4">
                {/* Base 链积分 */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-4">
                      <img 
                        src="/images/base_token.png" 
                        alt="Base Chain" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xl font-semibold text-red-400">
                      {userScore?.baseScore || 0}
                    </div>
                  </div>
                </div>
                
                {/* ETH 链积分 */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-4">
                      <img 
                        src="/images/token.png" 
                        alt="ETH Chain" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xl font-semibold text-red-400">
                        {userScore?.ethScore || 0}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 管理钱包部分 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('profile.wallet.title')}</h2>
            
            <div className="inline-block">
              <WalletConnectButton className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600 transition-colors duration-200" />
            </div>

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
              <h2 className="text-xl font-semibold text-white">{t('profile.invite.title')}</h2>
              {copyStatus && (
                <div className="text-sm text-green-400 animate-fade-in">
                  {copyStatus}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateInviteCode}
                disabled={isGenerating}
                className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600 transition-colors duration-200 inline-block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? t('profile.invite.generating') : t('profile.invite.addCode')}
              </button>
              <span className="text-gray-400 text-sm">{t('profile.invite.clickToCopy')}</span>
            </div>

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

            {inviteCodes.length === 0 && (
              <p className="text-gray-400 mt-4">
                {t('profile.invite.noCodes')}
              </p>
            )}
          </div>
        </div>

        {/* 邀请的用户列表 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('profile.invite.invitedUsers')}</h2>
            
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
                          <span className="text-gray-400">{t('profile.invite.tweetScore')}: </span>
                          <span className="text-red-400">{invitedUser.lastTweetScore}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">{t('profile.invite.tokenScore')}: </span>
                          <span className="text-red-400">{invitedUser.lastCoinScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">
                {t('profile.invite.noInvites')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 