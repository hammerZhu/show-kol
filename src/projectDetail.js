/*
create table kolComments(
    name vchar40 primary key not null,
    comment vchar4000,
    updatedTime timestamp,
    author vchar40,
    stars integer
);
*/


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatDate } from './myUtils';
import { sendPostRequest,sendDbRequest } from './myUtils';

function ProjectDetail() {
  const { name } = useParams();
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    score: 0,
    followers: 0,
    description: '',
    influence: 0 // 新增 influence 字段
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const getProjectInfo = async (projectName) => {
    let sqlstr=`select k.screen_name,k.totalScore,k.updatedTime,k.influence,x.followers,x.description from kolXAccountDetail k inner join XAccounts x on k.screen_name=x.screen_name where k.screen_name='${projectName}'`;
    let result=await sendDbRequest(sqlstr);
    if(result && result.success){
      let data={
        name:result.data[0].screen_name,
        score:result.data[0].totalScore,
        followers:result.data[0].followers,
        description:result.data[0].description,
        influence:result.data[0].influence // 新增 influence 数据
      }
      setProjectInfo(data);
    }
    
  };

   const getComments = async (projectName) => {
    let sqlstr = `SELECT name,comment,updatedTime,author,stars FROM kolComments WHERE name='${projectName}'`;
    let result = await sendDbRequest(sqlstr);
    console.log(`comments:`);
    console.log(result);
    if (result && result.success) {
      setComments(result.data);
      
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return;

    //{comment: string, name:string,stars:number}
    let data={comment:newComment,name:name,stars:5};
    const result = await sendPostRequest('post_kol_comment',JSON.stringify(data));
    if (result && result.success) {
      // 刷新评论列表
      getComments(name);
      setNewComment('');
    } else {
      alert('评论发送失败，请重试。');
    }
  };

  useEffect(() => {
    getProjectInfo(name);
    getComments(name);
  }, [name]);

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto',padding:'10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #ddd', borderRadius: '10px', padding: '15px' , backgroundColor: '#4CAF50'}}>
        <div style={{ flex: 1 }}>
          <p>KOL名称：<a href={`https://x.com/${projectInfo.name}`} target="_blank" rel="noopener noreferrer">{projectInfo.name}</a></p>
          <p>粉丝数 ：{projectInfo.followers}</p>
          <p>内容分 ：{projectInfo.score}</p>
          <p>影响力分：{projectInfo.influence}</p> {/* 新增显示影响力分 */}
        </div>
        <div style={{ flex: 1 }}>
          <p>KOL简介：{projectInfo.description}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>评论</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
              <p>{comment.comment}</p>
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                <span>From {comment.author}</span> - <span>At {new Date(comment.updatedTime).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p>该项目目前没有用户评论，欢迎你来评论。</p>
        )}
      </div>
      <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '10px', padding: '15px', backgroundColor: 'transparent' }}>
        <h3 style={{ marginTop: '0' }}>发表看法</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ width: '100%', height: '100px', marginBottom: '10px', padding: '5px' }}
        />
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleCommentSubmit} 
            style={{ 
              padding: '10px 25px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: '2px solid #4CAF50',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            发表
          </button>
        </div>
      </div>
      {/* 这里可以添加更多项目详情内容 */}
    </div>
  );
}

export default ProjectDetail;