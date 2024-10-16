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
import { formatDate, sendPostRequest, sendDbRequest, transformScore } from './myUtils';

function ProjectDetail() {
  const { name } = useParams();
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    score: 0,
    followers: 0,
    description: '',
    influence: 0,
    influenceAccouunts: [],
    headImage: ''
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [tags, setTags] = useState([]);

  const getProjectInfo = async (projectName) => {
    let sqlstr = `select k.screen_name,k.totalScore,k.updatedTime,k.influence,k.influenceAccouunts,x.followers,x.description,x.headImage,x.name from kolXAccountDetail k inner join XAccounts x on k.screen_name=x.screen_name where k.screen_name='${projectName}'`;
    let result = await sendDbRequest(sqlstr);
    if (result && result.success) {
      let influenceAccouunts = [];
      if (result.data[0].influenceAccouunts.length > 0) {
        influenceAccouunts = JSON.parse(result.data[0].influenceAccouunts);
      }
      if (influenceAccouunts == undefined) {
        console.log("influenceAccouunts is undefined");
      }
      console.log("influenceAccouunts:");
      console.log(influenceAccouunts);
      let data = {
        name: result.data[0].screen_name,
        showName: result.data[0].name,
        score: result.data[0].totalScore,
        followers: result.data[0].followers,
        description: result.data[0].description,
        influence: result.data[0].influence,
        influenceAccouunts: influenceAccouunts,
        headImage: result.data[0].headImage
      }
      setProjectInfo(data);
    }
  };

  // getTags 函数框架
  const getTags = async (projectName) => {
    // 在这里实现获取标签的逻辑
    let tagList=[];
    let sqlstr=`select tagId,tagName from kolTags`;
    let result=await sendDbRequest(sqlstr);
    if(result && result.success){
      let tagMap=new Map();
      for(let tag of result.data){
        tagMap.set(tag.tagId,tag.tagName);
      }
      let sqlstr2=`select tagId from XAccountTags where account='${projectName}';`;
      let result2=await sendDbRequest(sqlstr2);
      if(result2 && result2.success){
        for(let tag of result2.data){ 
          tagList.push(tagMap.get(tag.tagId));
        }
      }
    }
    return tagList;
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

    let data = { comment: newComment, name: name, stars: 5 };
    const result = await sendPostRequest('post_kol_comment', JSON.stringify(data));
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
    getTags(name).then(setTags);
  }, [name]);

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  let leftInfluenceAccounts = projectInfo.influenceAccouunts.slice(0, Math.ceil(projectInfo.influenceAccouunts.length / 2));
  let rightInfluenceAccounts = projectInfo.influenceAccouunts.slice(Math.ceil(projectInfo.influenceAccouunts.length / 2));
  return (
    <div className="max-w-4xl mx-auto p-4 font-sans text-white bg-gray-900">
      <div className="bg-gray-800 rounded-lg p-6 mb-6 flex flex-wrap">
        <div className="w-full md:w-1/2 pr-4 mb-4 md:mb-0">
          <div className="flex items-center mb-4">
            <img 
              src={projectInfo.headImage} 
              alt={projectInfo.name} 
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="text-2xl font-bold flex flex-col">
              <a href={`https://x.com/${projectInfo.name}`} target="_blank" rel="noopener noreferrer" className="text-purple-500">{projectInfo.showName}</a>
              <span className="text-gray-500 text-sm">@{projectInfo.name}</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 overflow-y-auto max-h-40">
            <p className="whitespace-pre-wrap">{projectInfo.description}</p>
          </div>
          
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div className="bg-gray-700 rounded-lg p-2 mb-2">
            粉丝数: {projectInfo.followers}
          </div>
          <div className="bg-gray-700 rounded-lg p-2 mb-2">
            内容得分: {transformScore(projectInfo.score).toFixed(2)}
          </div>
          <div className="bg-gray-700 rounded-lg p-2 mb-2">
            影响力得分: {transformScore(projectInfo.influence).toFixed(2)}
          </div>
          <div className="bg-gray-700 rounded-lg p-2">
            标签: 
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-600">Related Accounts</h3>
        <div className="flex flex-wrap max-h-60 overflow-y-auto">
          <div className="w-full md:w-1/2 pr-2">
            {leftInfluenceAccounts.map((account, index) => (
              <div key={index} className="bg-gray-700 rounded p-2 mb-2 flex justify-between items-center">
                <a href={`https://x.com/${account.name}`} target="_blank" rel="noopener noreferrer" className="text-purple-500">{account.name}</a>
                <p className="text-sm text-gray-400">Followers: {account.followers}</p>
              </div>
            ))}
          </div>
          <div className="w-full md:w-1/2 pl-2">
            {rightInfluenceAccounts.map((account, index) => (
              <div key={index} className="bg-gray-700 rounded p-2 mb-2 flex justify-between items-center">
                <a href={`https://x.com/${account.name}`} target="_blank" rel="noopener noreferrer" className="text-purple-500">{account.name}</a>
                <p className="text-sm text-gray-400">Followers: {account.followers}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-600">Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="bg-gray-700 rounded p-3 mb-3">
              <p>{comment.comment}</p>
              <div className="text-sm text-gray-400 mt-2">
                <span>From {comment.author}</span> - <span>At {new Date(comment.updatedTime).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p>There are no comments for this project yet. Feel free to leave one.</p>
        )}
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-600">Leave a Comment</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full h-24 mb-4 p-2 rounded bg-gray-700 text-white text-sm resize-none"
        />
        <div className="text-center">
          <button
            onClick={handleCommentSubmit}
            className="px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-bold cursor-pointer transition duration-300 ease-in-out hover:bg-purple-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
