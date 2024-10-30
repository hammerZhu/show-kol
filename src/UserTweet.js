import React, { useState, useEffect } from 'react';
import { useUser } from './contexts/UserContext';
import { sendDbRequest } from './myUtils';

function UserTweet() {
  const { user } = useUser();
  const [tweetContent, setTweetContent] = useState('');
  const [tweets, setTweets] = useState([]);
  const [availableTweets, setAvailableTweets] = useState([]);

  useEffect(() => {
    console.log('userTweets user=',user);
    if (user) {
      
      fetchAvailableTweets();
      fetchUserTweets();
    }
  }, [user]);


  const fetchUserTweets = async () => {
    try {
      const sqlstr = `SELECT tid,time,score FROM ShowKolPostedTweets WHERE author = '${user.toLowerCase()}' ORDER BY tid DESC`;
      const response = await sendDbRequest(sqlstr);
      if (response && response.success) {
        setTweets(response.data);
      }
    } catch (error) {
      console.error('获取推文失败:', error);
    }
  };

  const fetchAvailableTweets = async () => {
    try {
        let nowTime=new Date().getTime();
      const sqlstr = `select title,content,endTime from ShowKolWaittingTweets where endTime>${nowTime} ORDER BY endTime ASC`;
      const response = await sendDbRequest(sqlstr);
      if (response && response.success) {
        setAvailableTweets(response.data);
      }
    } catch (error) {
      console.error('获取可发送推文失败:', error);
    }
  };

  const handleTweetSubmit = async () => {
    try {
      console.log('发送推文:', tweetContent);
      const encodedContent = encodeURIComponent(tweetContent);
      const twitterIntentURL = `https://twitter.com/intent/tweet?text=${encodedContent}`;
      console.log("twitterIntentURL", twitterIntentURL);
      
      // 尝试打开窗口
      const newWindow = window.open(twitterIntentURL, '_blank');
      
      // 检查是否成功打开窗口
      if (newWindow === null || typeof(newWindow) === 'undefined') {
        console.error('弹窗被阻止，请允许浏览器弹窗');
        alert('请允许浏览器弹窗以打开 Twitter');
      } else {
        setTweetContent('');
      }
    } catch (error) {
      console.error('打开 Twitter 窗口失败:', error);
    }
  };

  // 处理发送特定推文
  const handleSendTweet = (tweetContent) => {
    const encodedContent = encodeURIComponent(tweetContent);
    const twitterIntentURL = `https://twitter.com/intent/tweet?text=${encodedContent}`;
    const link = document.createElement('a');
    link.href = twitterIntentURL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 提示信息 */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <p>提示：发推后将获得相应的积分奖励，请确保推文内容符合社区规范。</p>
      </div>

      {/* 可发送推文卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {availableTweets.map((tweet, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* 卡片头部 - 截止时间 */}
            <div className="bg-gray-700 px-4 py-2 flex justify-between items-center">
              <span className="text-sm text-gray-300">截止时间</span>
              <span className="text-sm text-gray-300">
                {new Date(tweet.endTime).toLocaleDateString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {/* 推文内容 - 可滚动区域 */}
            <div className="p-4 h-40 overflow-y-auto custom-scrollbar">
              <p className="text-white whitespace-pre-wrap">{tweet.content}</p>
            </div>
            
            {/* 卡片底部 - 发送按钮 */}
            <div className="px-4 py-3 bg-gray-700">
              <button
                onClick={() => handleSendTweet(tweet.title)}
                className="w-full bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors duration-200"
              >
                发送推文
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 已发推文列表 */}
      <div className="bg-gray-700 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4 text-white">已发推文</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-4 py-2 text-left">日期</th>
                <th className="px-4 py-2 text-left">推文ID</th>
                <th className="px-4 py-2 text-right">分数</th>
              </tr>
            </thead>
            <tbody>
              {tweets.map((tweet) => (
                <tr key={tweet.tid} className="border-b border-gray-600 hover:bg-gray-600">
                  <td className="px-4 py-2">
                    {new Date(tweet.time).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-2">{tweet.tid}</td>
                  <td className="px-4 py-2 text-right">{tweet.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 添加自定义滚动条样式
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4B5563;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6B7280;
  }
`;

// 将样式添加到 head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default UserTweet;
