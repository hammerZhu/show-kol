/*推特登录的回调页面
该页面从params中获取oauth_token和oauth_verifier，然后进行登录，登录成功后，跳转到首页   
*/

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function LoginTwitter({ onLoginSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loginWithTwitter = async () => {
      const searchParams = new URLSearchParams(location.search);
      const oauthToken = searchParams.get('oauth_token');
      const oauthVerifier = searchParams.get('oauth_verifier');

      if (!oauthToken || !oauthVerifier) {
        setError('缺少必要的 OAuth 参数');
        setLoading(false);
        return;
      }

      try {
        // 发送请求到后端进行 Twitter 登录验证
        const response = await axios.post('/api/twitterAuth', {
          oauthToken,
          oauthVerifier
        });

        // 假设后端返回用户信息和登录令牌
        console.log(`login twitter result=`);
        console.log(response.data);
        // 登录成功，把内容保存到localstorage中
        localStorage.setItem('twitterData', response.data.twitterData);
        onLoginSuccess(response.data.userName);
        navigate('/');
      } catch (err) {
        setError('登录失败：' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loginWithTwitter();
  }, [location, navigate]);

  if (loading) {
    return <div>正在登录中，请稍候...</div>;
  }

  if (error) {
    return <div>错误：{error}</div>;
  }

  return null; // 登录成功后会重定向，不需要渲染任何内容
}

export default LoginTwitter;
