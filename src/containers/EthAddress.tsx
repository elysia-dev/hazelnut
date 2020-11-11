import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BuyingStage from '../core/enums/BuyingStage';
import Spinner from 'react-spinkit';
import BuyingSummary from '../components/BuyingSummary';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import BuyingStatusBar from '../components/BuyingStatusBar';
import { useParams } from 'react-router-dom';
import getLibrary from '../core/utils/getLibrary';
import Register from '../components/Register';

type ParamTypes = {
  id: string;
};

function EthAddress() {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const { id } = useParams<ParamTypes>();

  if (window.ethereum?.isMetaMask) {
    return (
      <Web3ReactProvider getLibrary={getLibrary}>
        <Register />
      </Web3ReactProvider>
    );
  } else {
    return (
      <div>
        <h2>Install Metamask</h2>
      </div>
    );
  }
}

export default EthAddress;
