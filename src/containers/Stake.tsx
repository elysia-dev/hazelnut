import React from 'react';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';

const Stake: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  return (
    <div>
      <h1>Stake</h1>
      <div>{transactionRequest.value}</div>
      <div>{transactionRequest.type}</div>
      <div>{transactionRequest.contractAddress}</div>
      <div>{transactionRequest.ethAddresses}</div>
      <div>{transactionRequest.language}</div>
      <div>{transactionRequest.rewardValue}</div>
      <div>{transactionRequest.migrationValue}</div>
    </div>
  );
}

export default Stake;
