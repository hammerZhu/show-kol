import React from 'react';
import { useUser } from '../contexts/UserContext';

function TokenBalance() {
  const { user, holdingScore } = useUser();

  if (!user || holdingScore === null) {
    return null;
  }

  return (
    <div className="flex items-center">
      <img src='./images/token.png' alt="ETH" className="w-6 h-6 mr-2" />
      <span className="text-white">{parseFloat(holdingScore).toFixed(2)}</span>
    </div>
  );
}

export default TokenBalance;
