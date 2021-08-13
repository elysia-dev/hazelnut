import React from 'react';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';

const UnstakeAndMigrate: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  return (
    <div>
      <h1>UnstakeAndMigrate</h1>
      <div>{transactionRequest.value}</div>
      <div>{transactionRequest.type}</div>
      <div>{transactionRequest.unit}</div>
      <div>{transactionRequest.round}</div>
      <div>{transactionRequest.contractAddress}</div>
      <div>{transactionRequest.userAddress}</div>
      <div>{transactionRequest.language}</div>
      <div>{transactionRequest.rewardValue}</div>
      <div>{transactionRequest.migrationValue}</div>
    </div>
  );
}

export default UnstakeAndMigrate;
