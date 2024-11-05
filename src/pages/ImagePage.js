import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import TwitterLoginButton from '../components/TwitterLoginButton';
import { useTranslation } from 'react-i18next';

function ImagePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [inviteCode, setInviteCode] = useState('');
  const { t } = useTranslation();

  const handleInviteCodeChange = (e) => {
    setInviteCode(e.target.value);
  };
  const handleImageClick = () => {
    if (user) {
      navigate('/search');
    }
  };
  const handleLoginFailure=(error)=>{
    alert(error.message);
  }
  const handleLoginSuccess=(response)=>{
    console.log(response);
    window.location.href = response;
  }
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* 登录栏 */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="text-white text-lg">{t('image.enterInviteCode')}</div>
          
          <div className="flex-1 mx-4">
            <input
              type="text"
              value={inviteCode}
              onChange={handleInviteCodeChange}
              placeholder={t('image.inviteCodePlaceholder')}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <TwitterLoginButton 
            inviteCode={inviteCode} 
            onSuccess={handleLoginSuccess} 
            onFailure={handleLoginFailure} 
            user={user}
          />
        </div>
        
        {/* 图片容器 */}
        <div 
          className="relative cursor-pointer" 
          onClick={handleImageClick}
          title={user ? t('image.clickToSearch') : ""}
        >
          <img
            src="/images/frontImage.png"  // 确保将图片放在 public 目录下
            alt="Web3 Ecosystem"
            className="w-full h-auto"
            style={{ maxHeight: 'calc(100vh - 200px)' }}  // 确保图片不会太大
          />
          
          {/* 可选：添加图片加载状态 */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300" 
               style={{ display: 'none' }}>  {/* 当图片加载时隐藏 */}
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
        
        {/* 图片描述 */}
        <div className="p-6 border-t border-gray-700">
          <p className="text-gray-300 text-xl text-center font-medium">
            {t('image.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImagePage; 