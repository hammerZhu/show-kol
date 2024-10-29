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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 提示信息 */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <p>提示：发推后将获得相应的积分奖励，请确保推文内容符合社区规范。</p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex gap-6">
        {/* 可发送推文表格 */}
        <div className="w-1/3 bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-white">可发送推文</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-4 py-2 text-left text-white">标题</th>
                  <th className="px-4 py-2 text-left text-white">截止时间</th>
                </tr>
              </thead>
              <tbody>
                {availableTweets.map((tweet, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-600 hover:bg-gray-600 cursor-pointer"
                    onClick={() => setTweetContent(tweet.content)}
                  >
                    <td className="px-4 py-2 text-white">{tweet.title}</td>
                    <td className="px-4 py-2 text-white">
                      {new Date(tweet.endTime).toLocaleDateString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 文本输入区域 */}
        <div className="w-2/3">
          <div className="mb-8">
            <textarea
              value={tweetContent}
              onChange={(e) => setTweetContent(e.target.value)}
              className="w-full h-32 p-4 border rounded-lg bg-gray-700 text-white resize-none"
              placeholder="请输入推文内容..."
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">{280 - tweetContent.length} 字符剩余</span>
              <button
                onClick={handleTweetSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                disabled={!tweetContent.trim()}
              >
                发送推文
              </button>
            </div>
          </div>
        </div>
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

export default UserTweet;
