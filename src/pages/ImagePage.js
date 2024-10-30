import React from 'react';

function ImagePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* 图片标题 */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Web3 生态系统</h1>
        </div>
        
        {/* 图片容器 */}
        <div className="relative">
          <img
            src="/images/web3Ecosystem.png"  // 确保将图片放在 public 目录下
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
        
        {/* 可选：图片描述或其他信息 */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-300">
            这张图展示了 Web3 生态系统的主要组成部分和它们之间的关系。
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImagePage; 