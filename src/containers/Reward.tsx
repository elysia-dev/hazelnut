import React from 'react';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';

const Reward: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  return (
    <div>
      <h1>Reward</h1>
      <div>{transactionRequest.value}</div>
      <div>{transactionRequest.type}</div>
      <div>{transactionRequest.unit}</div>
      <div>{transactionRequest.contractAddress}</div>
      <div>{transactionRequest.userAddress}</div>
      <div>{transactionRequest.language}</div>
      <div>{transactionRequest.rewardValue}</div>
      <div>{transactionRequest.migrationValue}</div>
    </div>
  );
}

export default Reward;
