import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import queryString from 'query-string';

type ParamType = {
  value?: string,
  type?: string,
  contractAddress?: string,
  ethAddresses?: string,
  language?: string,
  rewardValue?: string, // 없으면 '0'으로 온다!
  migrationValue?: string,
}

const StakingRequests: React.FC = () => {
  const { search } = useLocation();
  const imtokenParams = useParams<ParamType>();
  const metamaskParmas = queryString.parse(search);
  const params = window.ethereum?.isImToken ? imtokenParams : metamaskParmas;

  return (
    <div>
      <div>{params.value}</div>
      <div>{params.type}</div>
      <div>{params.contractAddress}</div>
      <div>{params.ethAddresses}</div>
      <div>{params.language}</div>
      <div>{params.rewardValue}</div>
      <div>{params.migrationValue}</div>
    </div>
  );
}

export default StakingRequests;
