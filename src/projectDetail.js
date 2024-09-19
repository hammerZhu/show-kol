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
import { sendPostRequest,sendDbRequest,transformScore } from './myUtils';

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
    let sqlstr=`select k.screen_name,k.totalScore,k.updatedTime,k.influence,k.influenceAccouunts,x.followers,x.description from kolXAccountDetail k inner join XAccounts x on k.screen_name=x.screen_name where k.screen_name='${projectName}'`;
    let result=await sendDbRequest(sqlstr);
    if(result && result.success){
      let influenceAccouunts=[];
      if(result.data[0].influenceAccouunts.length>0){
        influenceAccouunts=JSON.parse(result.data[0].influenceAccouunts);
      }
      let data={
        name:result.data[0].screen_name,
        score:result.data[0].totalScore,
        followers:result.data[0].followers,
        description:result.data[0].description,
        influence:result.data[0].influence, // 新增 influence 数据
        influenceAccouunts:influenceAccouunts
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#1e1e1e', color: '#fff', fontSize: '15.4px' }}>
      <div style={{ display: 'flex', backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ width: '50%', marginRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <img 
              src="https://pbs.twimg.com/profile_images/1558667234855292929/RqgodvGb_400x400.jpg" 
              alt={projectInfo.name} 
              style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
            />
            <p style={{ fontSize: '1.6em', fontWeight: 'bold', margin: 0 }}>
              <a href={`https://x.com/${projectInfo.name}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8a2be2' }}>{projectInfo.name}</a>
            </p>
          </div>
          <div style={{ backgroundColor: '#3a3a3a', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
            粉丝数：{projectInfo.followers}
          </div>
          <div style={{ backgroundColor: '#3a3a3a', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
            内容分：{transformScore(projectInfo.score).toFixed(2)}📈
          </div>
          <div style={{ backgroundColor: '#3a3a3a', borderRadius: '10px', padding: '8px' }}>
            影响力分：{transformScore(projectInfo.influence).toFixed(2)}📉
          </div>
        </div>
        <div style={{ width: '50%' }}>
          <div style={{ 
            backgroundColor: '#3a3a3a', 
            borderRadius: '10px', 
            padding: '15px',
            height: '100%',
            overflow: 'auto',
            maxHeight: '150px' // 您可以根据需要调整这个值
          }}>
            <p style={{ margin: 0 }}>{projectInfo.description}</p>
          </div>
        </div>
      </div>
      
      {/* 新增的influenceAccouunts列表 */}
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #666', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.32em', textAlign: 'left' }}>相关联的账号</h3>
        <div style={{ display: 'flex', maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ flex: 1, marginRight: '10px' }}>
            {projectInfo.influenceAccouunts.slice(0, Math.ceil(projectInfo.influenceAccouunts.length / 2)).map((account, index) => (
              <div key={index} style={{ backgroundColor: '#3a3a3a', borderRadius: '5px', padding: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>{account.name}</p>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#aaa' }}>粉丝: {account.followers}</p>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {projectInfo.influenceAccouunts.slice(Math.ceil(projectInfo.influenceAccouunts.length / 2)).map((account, index) => (
              <div key={index} style={{ backgroundColor: '#3a3a3a', borderRadius: '5px', padding: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>{account.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: '#aaa' }}>粉丝: {account.followers}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 现有的评论区域 */}
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #666', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.2em', textAlign: 'left' }}>评论</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} style={{ backgroundColor: '#3a3a3a', borderRadius: '5px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ margin: 0 }}>{comment.comment}</p>
              <div style={{ fontSize: '0.8em', color: '#aaa', marginTop: '8px' }}>
                <span>From {comment.author}</span> - <span>At {new Date(comment.updatedTime).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p>该项目目前没有用户评论，欢迎你来评论。</p>
        )}
      </div>
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #666', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.2em', textAlign: 'left' }}>发表评论</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ width: '100%', height: '80px', marginBottom: '12px', padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: '#3a3a3a', color: '#fff', fontSize: '14px' }}
        />
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleCommentSubmit}
            style={{
              padding: '8px 20px',
              backgroundColor: '#8a2be2',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            发表
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;