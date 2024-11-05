import React from 'react';
// 删除 axios 导入
// import axios from 'axios';
import '../index.css';
import { sendDbRequest} from '../myUtils';

const TwitterLoginButton = ({ onSuccess, onFailure, onLogout, user, inviteCode }) => {
  const handleClick = async () => {
    if (user) {
      // 用户已登录，询问是否退出
      if (window.confirm('Are you sure to logout?')) {
        try {
          if(onLogout){
            onLogout();
          }
        } catch (error) {
          console.error('logout failed:', error);
          if(onFailure){
          onFailure(error);
        }
        }
      }
    } else {
      // 用户未登录，执行登录操作
      try {
        //检查邀请码是否有效
        let isAvailable=await checkInviteCode(inviteCode);
        if(!isAvailable){
          let error=new Error("Invite code is not available");
          onFailure(error);
          return;
        }
        console.log("try to login with invite code:", inviteCode);
        const response = await fetch('/api/twitterAuth', {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        if(onSuccess){
          onSuccess(data);
        }
      } catch (error) {
        console.error('login failed:', error);
        if(onFailure){
          onFailure(error);
        }
      }
    }
  };
  const checkInviteCode=async (code)=>{
      let sqlstr=`select * from ShowKolInviteCodes where code='${code}'`;
      const response=await sendDbRequest(sqlstr);
      if(response && response.data && response.data.length>0){
         //检查是否已经被使用.
         let sqlstr2=`select * from ShowKolScore where referrial='${code}'`;
         const response2=await sendDbRequest(sqlstr2);
         if(response2 && response2.data && response2.data.length>0){
          return false;
         }
         return true;
      }
      return false;
  }
  return (
    <button onClick={handleClick} className="bg-red-500 rounded-xl px-8 py-2 flex items-center">
      <img src="/x_logo.png" alt="X Logo" className="w-6 h-6 mr-2" />
      {user ? `@${user}` : '推特登录'}
    </button>
  );
};

export default TwitterLoginButton;