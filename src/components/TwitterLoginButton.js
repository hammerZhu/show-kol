import React from 'react';
// 删除 axios 导入
// import axios from 'axios';
import '../index.css';

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
        console.log("try to login");
        const response = await fetch('/api/twitterAuth', {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        onSuccess(data);
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