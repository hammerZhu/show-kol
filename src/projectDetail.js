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
    influence: 0,
    influenceAccouunts:[],
    headImage:''
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const getProjectInfo = async (projectName) => {
    let sqlstr=`select k.screen_name,k.totalScore,k.updatedTime,k.influence,k.influenceAccouunts,x.followers,x.description,x.headImage from kolXAccountDetail k inner join XAccounts x on k.screen_name=x.screen_name where k.screen_name='${projectName}'`;
    let result=await sendDbRequest(sqlstr);
    if(result && result.success){
      let influenceAccouunts=[];
      if(result.data[0].influenceAccouunts.length>0){
        influenceAccouunts=JSON.parse(result.data[0].influenceAccouunts);
      }
      if(influenceAccouunts==undefined){
        console.log("influenceAccouunts is undefined");
      }
      console.log("influenceAccouunts:");
      console.log(influenceAccouunts);
      let data={
        name:result.data[0].screen_name,
        score:result.data[0].totalScore,
        followers:result.data[0].followers,
        description:result.data[0].description,
        influence:result.data[0].influence,
        influenceAccouunts:influenceAccouunts,
        headImage:result.data[0].headImage
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

    let data={comment:newComment,name:name,stars:5};
    const result = await sendPostRequest('post_kol_comment',JSON.stringify(data));
    if (result && result.success) {
      getComments(name);
      setNewComment('');
    } else {
      alert('Comment submission failed. Please try again.');
    }
  };

  useEffect(() => {
    getProjectInfo(name);
    getComments(name);
  }, [name]);

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  let leftInfluenceAccounts=projectInfo.influenceAccouunts.slice(0, Math.ceil(projectInfo.influenceAccouunts.length / 2));
  let rightInfluenceAccounts=projectInfo.influenceAccouunts.slice(Math.ceil(projectInfo.influenceAccouunts.length / 2));
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#1e1e1e', color: '#fff', fontSize: '15.4px' }}>
      <div style={{ display: 'flex', backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ width: '50%', marginRight: '20px' , minWidth: '360px'}}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <img 
              src={projectInfo.headImage} 
              alt={projectInfo.name} 
              style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
            />
            <p style={{ fontSize: '1.6em', fontWeight: 'bold', margin: 0 }}>
              <a href={`https://x.com/${projectInfo.name}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8a2be2' }}>{projectInfo.name}</a>
            </p>
          </div>
          <div style={{ backgroundColor: '#3a3a3a', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
            Followers: {projectInfo.followers}
          </div>
          <div style={{ backgroundColor: '#3a3a3a', borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
            Content Score: {transformScore(projectInfo.score).toFixed(2)}📈
          </div>
          <div style={{ backgroundColor: '#3a3a3a', borderRadius: '10px', padding: '8px' }}>
            Influence Score: {transformScore(projectInfo.influence).toFixed(2)}📉
          </div>
        </div>
        <div style={{ width: '50%', minWidth: '360px' }}>
          <div style={{ 
            backgroundColor: '#3a3a3a', 
            borderRadius: '10px', 
            padding: '15px',
            height: '100%',
            minHeight: '150px',
            overflow: 'auto',
            maxHeight: '150px'
          }}>
            <p style={{ margin: 0 }}>{projectInfo.description}</p>
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #666', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.32em', textAlign: 'left' }}>Related Accounts</h3>
        <div style={{ display: 'flex', maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ flex: 1, marginRight: '10px' }}>
            {leftInfluenceAccounts.map((account, index) => (
              <div key={index} style={{ backgroundColor: '#3a3a3a', borderRadius: '5px', padding: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={`https://x.com/${account.name}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8a2be2' }}>{account.name}</a>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#aaa' }}>Followers: {account.followers}</p>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {rightInfluenceAccounts.map((account, index) => (
              <div key={index} style={{ backgroundColor: '#3a3a3a', borderRadius: '5px', padding: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={`https://x.com/${account.name}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8a2be2' }}>{account.name}</a>
                <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: '#aaa' }}>Followers: {account.followers}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #666', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.2em', textAlign: 'left' }}>Comments</h3>
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
          <p>There are no comments for this project yet. Feel free to leave one.</p>
        )}
      </div>
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '20px' }}>
        <h3 style={{ borderBottom: '1px solid #666', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.2em', textAlign: 'left' }}>Leave a Comment</h3>
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
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;