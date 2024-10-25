import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './contexts/UserContext';

// 添加IP检查函数
async function checkUserRegion() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    console.log("my country code is:",data.country_code);
    return data.country_code; // 返回国家代码
  } catch (error) {
    console.error('无法获取用户IP信息:', error);
    return null;
  }
}

// 定义黑名单区域
const blacklistedRegions = ['US']; // 示例:中国,美国

// 主渲染函数
async function renderApp() {
  const userRegion = await checkUserRegion();
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  if (userRegion && blacklistedRegions.includes(userRegion)) {
    root.render(
      <React.StrictMode>
        <div className="text-center text-3xl flex justify-center items-center" style={{height: '500px'}}>Sorry, your area is not within our service area.</div>
      </React.StrictMode>
    );
  } else {
    root.render(
      <React.StrictMode>
        <UserProvider>
          <App />
        </UserProvider>
      </React.StrictMode>
    );
  }
}

renderApp();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
