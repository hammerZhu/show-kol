import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProjectDetail from './projectDetail';
import LoginTwitter from './loginTwitter';
import UserTweet from './UserTweet';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';
import './index.css';

// 创建一个新组件来处理路由相关的逻辑
function AppContent() {
  const location = useLocation();
  
  useEffect(() => {
    // 获取 URL 中的推荐人参数
    const params = new URLSearchParams(location.search);
    const referral = params.get('referral');
    if (referral) {
      // 将推荐人信息存储在 localStorage 中
      localStorage.setItem('referral', referral);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/project/:name" element={<ProjectDetail />} />
          <Route path="/loginTwitter" element={<LoginTwitter />} />
          <Route path="/user-tweet" element={<UserTweet />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

// 主 App 组件
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
