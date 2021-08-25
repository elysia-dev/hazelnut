import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import queryString from 'query-string';
import { Web3ReactProvider } from '@web3-react/core';
import getLibrary from '../core/utils/getLibrary';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import StakingTransactionType from '../core/enums/StakingTransactionType';
import Stake from './Stake';
import Unstake from './Unstake';
import UnstakeAndMigrate from './UnstakeAndMigrate';
import Reward from './Reward';
import InstallMetamask from '../components/errors/InstallMetamask';

const StakingRequests: React.FC = () => {
  const { search } = useLocation();
  const imtokenParams = useParams<StakingTransactionRequest>();
  const metamaskParmas = queryString.parse(search);
  const params = window.ethereum?.isImToken ? imtokenParams : metamaskParmas;

  if (window.ethereum?.isMetaMask || window.ethereum?.isImToken) {
    const reqType = params.type;
    return (
      <Web3ReactProvider getLibrary={getLibrary}>
        {reqType === StakingTransactionType.STAKE && (
          <Stake transactionRequest={params} />
        )}
        {reqType === StakingTransactionType.UNSTAKE && (
          <Unstake transactionRequest={params} />
        )}
        {reqType === StakingTransactionType.UNSTAKE_AND_MIGRATE && (
          <UnstakeAndMigrate transactionRequest={params} />
        )}
        {reqType === StakingTransactionType.REWARD && (
          <Reward transactionRequest={params} />
        )}
      </Web3ReactProvider>
    );
  } else {
    return <InstallMetamask />;
  }
}

export default StakingRequests;
