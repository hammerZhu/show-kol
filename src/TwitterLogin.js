import React from 'react';
import axios from 'axios';
import './index.css';

const TwitterLoginButton = ({ onSuccess, onFailure, onLogout, user }) => {
  const handleClick = async () => {
    if (user) {
      // 用户已登录，询问是否退出
      if (window.confirm('Are you sure to logout?')) {
        try {
          onLogout();
        } catch (error) {
          console.error('logout failed:', error);
          onFailure(error);
        }
      }
    } else {
      // 用户未登录，执行登录操作
      try {
        const response = await axios.get('/api/twitterAuth', null);
        console.log(response.data);
        onSuccess(response.data);
      } catch (error) {
        console.error('login failed:', error);
        onFailure(error);
      }
    }
  };

  return (
    <button onClick={handleClick} className="bg-purple-500 rounded-xl px-6 py-2 flex items-center">
      <img src="/x_logo.png" alt="X Logo" className="w-6 h-6 mr-2" />
      {user  ? `@${user}` : 'login with twitter'}
    </button>
  );
};

export default TwitterLoginButton;