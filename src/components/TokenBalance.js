import React from 'react';
import { useUser } from '../contexts/UserContext';

function TokenBalance() {
  const { user, tokenBalance } = useUser();

  if (!user || tokenBalance === null) {
    return null;
  }

  return (
    <div className="flex items-center">
      <img src='./images/token.png' alt="ETH" className="w-6 h-6 mr-2" />
      <span className="text-white">{parseFloat(tokenBalance).toFixed(2)}</span>
    </div>
  );
}

export default TokenBalance;
