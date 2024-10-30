import React from 'react';
import { Link } from 'react-router-dom';
import TokenBalance from './TokenBalance';
import PostScore from './PostScore';
import TwitterLoginButton from './TwitterLoginButton';
import WalletConnectButton from './WalletConnectButton';
import { useUser } from '../contexts/UserContext';

function Navigation() {
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
              to="/search"
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <img
                src="/projects-icon.svg"
                alt="重新搜索"
                className="w-6 h-6 mr-2 filter invert"
              />
              <span>All kols</span>
            </Link>
            <Link
              to="/user-tweet"
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <img
                src="/post-icon.svg"
                alt="发推"
                className="w-6 h-6 mr-2 filter invert"
              />
              <span>Post</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <img
                src="/profile-icon.svg"
                alt="个人资料"
                className="w-6 h-6 mr-2 filter invert"
              />
              <span>Profile</span>
            </Link>
          </div>
        ) : (
          <div className="text-gray-300">
            请先用推特账号登录
          </div>
        )}
        <div className="flex space-x-4">
          {user && (
            <>
              <TokenBalance />
              <PostScore />
            </>
          )}
          <TwitterLoginButton
            onSuccess={handleTwitterLoginSuccess}
            onFailure={handleTwitterLoginFailure}
            onLogout={handleTwitterLogout}
            user={user}
          />
        </div>
      </nav>
    </header>
  );
}

export default Navigation; 