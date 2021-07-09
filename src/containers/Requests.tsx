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
import { getProductInfo } from '../core/clients/EspressoClient';
import { useTranslation } from 'react-i18next';
import InstallMetamask from '../components/errors/InstallMetamask';
import LanguageType from '../core/enums/LanguageType';
import PaymentMethod from '../core/types/PaymentMethod';
import ETH_abi from '../AssetTokenEthAbi.json'
import assetAbi from '../AssetTokenAbi.json';
import TokenAbi from '../core/constants/abis/asset-token.json'
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';

type ParamTypes = {
  productid: string;
  valueto: string;
  type: TransactionType;
  contractaddress: string;
  useraddress: string;
  userlanguage: LanguageType;
};
function Requests() {
  const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>();
  const { productid, valueto, type, contractaddress, useraddress, userlanguage } = useParams<ParamTypes>();
  const { i18n } = useTranslation();
  const history = useHistory();


  async function loadTransactionRequest() {
    // TODO : Validate token with api
    const product  = await getProductInfo(Number(productid));
    setTransactionRequest({
      type: type,
      amount: Number(valueto),
      userAddresses: useraddress,
      language: userlanguage,
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
        address:contractaddress,
        abi:JSON.stringify(product.data.paymentMethod === PaymentMethod.BNB ? ETH_abi : TokenAbi),
        version:"v2.0.0"
      }
    })
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
