import React from 'react';
import { useUser } from '../contexts/UserContext';

function TokenBalance() {
  const { user, userScore } = useUser();

  if (!user || userScore === null) {
    return null;
  }
  let totalScore = 0;
  totalScore = userScore.baseScore + userScore.ethScore;
 
  return (
    <div className="flex items-center">
      <img src='./images/token.png' alt="ETH" className="w-6 h-6 mr-2" />
      <span className="text-white">{totalScore}</span>
    </div>
  );
}

export default TokenBalance;
