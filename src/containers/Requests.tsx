import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import Spinner from 'react-spinkit';
import TransactionType from '../core/enums/TransactionType';
import Buying from './Buying';
import Refund from './Refund';
import Interest from './Interest';
import getLibrary from '../core/utils/getLibrary';
import TransactionRequest from '../core/types/TransactionRequest';
import { getTransactionRequest } from '../core/clients/EspressoClient';
import { useTranslation } from 'react-i18next';
import LanguageType from '../core/enums/LanguageType';
import InstallMetamask from '../components/errors/InstallMetamask';

type ParamTypes = {
  id: string;
};

function Requests() {
  const [transactionRequest, setTransactionRequest] = useState<
    TransactionRequest
  >();
  const { id } = useParams<ParamTypes>();
  const { i18n } = useTranslation();
  const history = useHistory();

  function loadTransactionRequest() {
    // TODO : Validate token with api
    getTransactionRequest(id)
      .then(res => {
        setTransactionRequest(res.data);
        i18n.changeLanguage(res.data.language || LanguageType.EN);
      })
      .catch(() => {
        history.push('/notFound');
      });
  }

  useEffect(loadTransactionRequest, []);

  if (transactionRequest) {
    if (window.ethereum?.isMetaMask || window.ethereum?.isImToken) {
      return (
        <div>
          <Web3ReactProvider getLibrary={getLibrary}>
            {transactionRequest.type === TransactionType.BUYING && (
              <Buying transactionRequest={transactionRequest} />
            )}
            {transactionRequest.type === TransactionType.REFUND && (
              <Refund transactionRequest={transactionRequest} />
            )}
            {transactionRequest.type === TransactionType.INTEREST && (
              <Interest transactionRequest={transactionRequest} />
            )}
          </Web3ReactProvider>
        </div>
      );
    } else {
      return <InstallMetamask />;
    }
  } else {
    return (
      <div>
        <Spinner name="line-scale" />
      </div>
    );
  }
}

export default Requests;
