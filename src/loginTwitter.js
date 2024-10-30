/*推特登录的回调页面
该页面从params中获取oauth_token和oauth_verifier，然后进行登录，登录成功后，跳转到首页   
*/

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
// 删除 axios 导入
// import axios from 'axios';

function LoginTwitter({ onLoginSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const requestSentRef = useRef(false);
  const {setUser} = useUser();

  useEffect(() => {
    const loginWithTwitter = async () => {
      if (requestSentRef.current) {
        return; // 如果请求已经发送，直接返回
      }

      const searchParams = new URLSearchParams(location.search);
      const oauthToken = searchParams.get('oauth_token');
      const oauthVerifier = searchParams.get('oauth_verifier');

      if (!oauthToken || !oauthVerifier) {
        setError('缺少必要的 OAuth 参数');
        setLoading(false);
        return;
      }

      try {
        requestSentRef.current = true; // 标记请求已发送

        const response = await fetch('/api/twitterAuth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oauthToken,
            oauthVerifier
          }),
        });

        if (!response.ok) {
          throw new Error('登录请求失败');
        }

        const data = await response.json();

        console.log(`loginTwitter result=`);
        console.log(data);
        // 登录成功，把内容保存到localstorage中
        localStorage.setItem('twitterData', data.twitterData);
        if(onLoginSuccess){
          onLoginSuccess(data.userName);
        }
        setUser(data.userName);
        navigate('/');
        console.log('loginTwitter success',data.userName);
      } catch (err) {
        setError('登录失败：' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loginWithTwitter();
  }, [location, navigate, onLoginSuccess]);

  if (loading) {
    return <div>正在登录中，请稍候...</div>;
  }

  if (error) {
    return <div>错误：{error}</div>;
  }

  return null; // 登录成功后会重定向，不需要渲染任何内容
}

export default LoginTwitter;
