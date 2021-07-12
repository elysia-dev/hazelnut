import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import Spinner from 'react-spinkit';
import queryString from 'query-string';
import TransactionType from '../core/enums/TransactionType';
import Buying from './Buying';
import Refund from './Refund';
import Interest from './Interest';
import getLibrary from '../core/utils/getLibrary';
import TransactionRequest from '../core/types/TransactionRequest';
import { getProductInfo } from '../core/clients/EspressoClient';
import { useTranslation } from 'react-i18next';
import InstallMetamask from '../components/errors/InstallMetamask';
import LanguageType from '../core/enums/LanguageType';
import PaymentMethod from '../core/types/PaymentMethod';
import ETH_abi from '../AssetTokenEthAbi.json'
import TokenAbi from '../core/constants/abis/asset-token.json'

function Requests () {
  const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>();
  const { search } = useLocation();
  const {productId, value, type, contractAddress, address, language} = queryString.parse(search);
  const { i18n } = useTranslation();
  const history = useHistory();

  async function loadTransactionRequest() {
    try {
        // TODO : Validate token with api
    const product  = await getProductInfo(Number(productId));
    setTransactionRequest({
      type: String(type),
      amount: Number(value),
      userAddresses: String(address),
      language: String(language),
      product:{
        title: product.data.title,
        tokenName: product.data.tokenName,
        expectedAnnualReturn: product.data.expectedAnnualReturn,
        contractAddress: product.data.contractAddress,
        usdPricePerToken: product.data.usdPricePerToken,
        paymentMethod:product.data.paymentMethod,
        data:{
          images:product.data.data.images,
        }
      },
      contract:{
        address:contractAddress,
        abi:JSON.stringify(product.data.paymentMethod === PaymentMethod.BNB ? ETH_abi : TokenAbi),
        version:"v2.0.0"
      }
    })
    i18n.changeLanguage(String(language) || LanguageType.EN);
    } catch (error) {
      history.push('/notFound');
    }
  }

  useEffect(() => {
    loadTransactionRequest();
  }, []);

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
