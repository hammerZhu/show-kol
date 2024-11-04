import React from 'react';
import { useUser } from '../contexts/UserContext';

function PostScore() {

  const { userScore } = useUser();
 // console.log("PostScore",userScore);
  if (!userScore || !userScore.lastTweetScore || !userScore.invitedScore) {
    return null;
  }
  let totalScore=userScore.lastTweetScore+userScore.invitedScore;
  //console.log('tweetScore=',totalScore);
  return (
    <div className="flex items-center">
      <img src='./images/twitter.png' alt="Post" className="w-6 h-6 mr-2" />
      <span className="text-white">{totalScore}</span>
    </div>
  );
}

export default PostScore;
