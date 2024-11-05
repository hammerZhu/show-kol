import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TokenBalance from './TokenBalance';
import PostScore from './PostScore';
import TwitterLoginButton from './TwitterLoginButton';
import WalletConnectButton from './WalletConnectButton';
import { useUser } from '../contexts/UserContext';

function Navigation() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUser();

  const handleTwitterLoginSuccess = (response) => {
    console.log(response);
    window.location.href = response;
  };

  const handleTwitterLoginFailure = (error) => {
    console.error(error);
  };

  const handleTwitterLogout = () => {
    localStorage.removeItem('twitterData');
    setUser(null);
    window.location.href = '/';
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-gray-800 shadow-lg">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="h-10 rounded-full" />
          </Link>
          <span className="text-2xl font-bold text-white">DISCOVER</span>
        </div>
        {user ? (
          <div className="flex space-x-6">
            <Link
              to="/user-tweet"
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <img
                src="/projects-icon.svg"
                alt={t('nav.post')}
                className="w-6 h-6 mr-2 filter invert"
              />
              <span>{t('nav.post')}</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <img
                src="/profile-icon.svg"
                alt={t('nav.profile')}
                className="w-6 h-6 mr-2 filter invert"
              />
              <span>{t('nav.profile')}</span>
            </Link>
          </div>
        ) : (
          <div className="text-gray-300">
            {t('nav.pleaseLogin')}
          </div>
        )}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
          >
            {i18n.language === 'zh' ? 'English' : '中文'}
          </button>
          {user && (
            <>
              <TokenBalance />
              <PostScore />
            </>
          )}
          {user && (
             <TwitterLoginButton
             onSuccess={handleTwitterLoginSuccess}
             onFailure={handleTwitterLoginFailure}
             onLogout={handleTwitterLogout}
             user={user}
            />
          )}
         
        </div>
      </nav>
    </header>
  );
}

export default Navigation; 