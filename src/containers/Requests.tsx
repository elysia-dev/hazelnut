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
import { getTransactionRequest } from '../core/clients/EspressoClient';
import { getProductInfo } from '../core/clients/EspressoClient';
import { useTranslation } from 'react-i18next';
import InstallMetamask from '../components/errors/InstallMetamask';
import LanguageType from '../core/enums/LanguageType';
import PaymentMethod from '../core/types/PaymentMethod';
import ETH_abi from '../AssetTokenEthAbi.json'
import TokenAbi from '../core/constants/abis/asset-token.json'

type ParamTypes = {
  id: string | undefined;
  imProductId : string;
  imValueTo: string;
  imType: string
  imContractAddress: string;
  imEthAddresses: string;
  imLanguage: string;
};
type TransferInfoTypes = {
  productId: number,
  type: string,
  value: number,
  address: string,
  contractAddress: string,
  language: string,
}

function Requests () {
  const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>();
  const { search } = useLocation();
  const { id } = useParams<ParamTypes>();
  const imTokenInfo = useParams<ParamTypes>();
  const metaMaskInfo = queryString.parse(search);
  const { i18n } = useTranslation();
  const history = useHistory();

  async function loadTransactionRequest() {
        // TODO : Validate token with api
        const isImtoken = window.ethereum?.isImToken;
        if(id){
          getTransactionRequest(id)
          .then(res => {
            setTransactionRequest(res.data);
            i18n.changeLanguage(res.data.language || LanguageType.EN);
          })
          .catch(() => {
            history.push('/notFound');
          });
        } else {
          const transferInfo: TransferInfoTypes = {
            productId: isImtoken ? Number(imTokenInfo.imProductId) : Number(metaMaskInfo.productId),
            type: isImtoken ? imTokenInfo.imType : String(metaMaskInfo.type),
            value: isImtoken ? Number(imTokenInfo.imValueTo) : Number(metaMaskInfo.value),
            address: isImtoken ? imTokenInfo.imEthAddresses : String(metaMaskInfo.address),
            contractAddress: isImtoken ? imTokenInfo.imContractAddress : String(metaMaskInfo.contractAddress),
            language: isImtoken ? imTokenInfo.imLanguage : String(metaMaskInfo.language),
          }
          getProductInfo(transferInfo.productId).then((product) => {
            setTransactionRequest({
              type: transferInfo.type,
              amount: transferInfo.value,
              userAddresses: transferInfo.address,
              language: transferInfo.language,
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
                address: transferInfo.contractAddress,
                abi:JSON.stringify(product.data.paymentMethod !== PaymentMethod.EL ? ETH_abi : TokenAbi),
                version:'v2.0.0'
              }
            })
            i18n.changeLanguage(transferInfo.language || LanguageType.EN);
          })
          .catch(() => {
            history.push('/notFound');
          });;
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
