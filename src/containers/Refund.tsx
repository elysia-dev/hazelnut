import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber, BigNumberish, constants, utils } from 'ethers';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import { useParams } from 'react-router-dom';
import { completeTransactionRequest } from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import Swal, { RetrySwal } from '../core/utils/Swal';
import RefundSuccess from './../images/success_refund.svg';
import useExpectedValue from '../hooks/useExpectedValue';
import { request } from 'http';
import { changeEthNet, createBnbNet, createEthNet, isValidChainId } from '../core/utils/createNetwork';
import PaymentMethod from '../core/types/PaymentMethod';

type Props = {
  transactionRequest: TransactionRequest;
};

function Refund(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const assetToken = useContract(
    String(props.transactionRequest.contract.address),
    props.transactionRequest.contract.abi,
  );
  const [expectedValue] = useExpectedValue(props.transactionRequest);
  const [accountBalance, setAccountBalance] = useState<BigNumberish>(constants.Zero);
  const { id } = useParams<{ id: string }>();

  const [chainId, setChainId] = useState<string>('');

  const currentChainId = async () => {
    setChainId(await library.provider.request({
       method: 'eth_chainId'
     }));
  }

  const networkCheck = () => {
      return isValidChainId(props.transactionRequest.product.paymentMethod, chainId);
  }

  const createNetwork = async () => {
    let network: Promise<void> | undefined;
    if(props.transactionRequest.product.paymentMethod === PaymentMethod.BNB){
      if(chainId === process.env.REACT_APP_BNB_NETWORK) return;
      network = createBnbNet(library);
    } else {
      if(chainId === process.env.REACT_APP_ETH_NETWORK) return;
      network = changeEthNet(library);
    }
    try {
      if(!(chainId === process.env.REACT_APP_ETH_NETWORK) && window.ethereum?.isImToken) {
        throw Error; 
        }
        await network
    } catch (switchChainError) {
      if(!(props.transactionRequest.product.paymentMethod === PaymentMethod.EL ||
         props.transactionRequest.product.paymentMethod === PaymentMethod.ETH)){
          return;
      }
        network = createEthNet(library);
      try{
        await network;
     } catch (error) {
       console.error(error);
     }
  } finally {
    currentChainId();
  }
}

  const checkAccount = () => {
    RetrySwal.fire({
      html: `<div style="font-size:15px; margin-top: 20px;">
          ${t('Error.CheckAccount')}
          </div>`,
      icon: 'info',
      confirmButtonText: t('Error.Check'),
      showCloseButton: true,
    });
  };

  const connectWallet = () => {
    activate(InjectedConnector);
  };

  const createTransaction = () => {
    if(!networkCheck()){
      createNetwork();
      return;
    }
    const requestAmount = utils.parseEther(props.transactionRequest.amount.toString())

    const amount = (BigNumber.from(accountBalance)
      .sub(requestAmount))
      .gte(constants.Zero) ? requestAmount : accountBalance

    assetToken?.populateTransaction
      .refund(amount)
      .then(populatedTransaction => {
        library.provider
          .request({
            method: 'eth_sendTransaction',
            params: [
              {
                to: populatedTransaction.to,
                from: account,
                data: populatedTransaction.data,
              },
            ],
          })
          .then((txHash: string) => {
            completeTransactionRequest(id, txHash);
            Swal.fire({
              title: t('Completion.Title'),
              html: `<div style="font-size: 15px;"> ${t(
                'Completion.RefundResult',
                {
                  product: props.transactionRequest.product.title,
                  value: parseFloat(utils.formatEther(expectedValue.value)).toFixed(
                    4,
                  ),
                  paymentMethod: props.transactionRequest.product.paymentMethod,
                },
              )}
                <br />
                ${t('Completion.Notice')}
              </div>`,
              imageUrl: RefundSuccess,
              imageWidth: 275,
              showConfirmButton: false,
            });
          })
          .catch((error: any) => {
            Swal.fire({
              text: t('Error.TransactionCancled'),
              icon: 'error',
              confirmButtonText: t('Buying.TransactionRetryButton'),
              showCloseButton: true,
            }).then(res => {
              if (res.isConfirmed) {
                createTransaction();
              }
            });
          });
      });
  };

  useEffect(connectWallet, []);
  useEffect(() => {
    assetToken?.balanceOf(account).then((balance: BigNumberish) => {
      setAccountBalance(balance);
    })
    currentChainId();
    if(!chainId) return;
    createNetwork();
  }, [account, chainId])

  if (!account) {
    return <ConnectWallet handler={connectWallet} />;
  } else {
    return (
      <div>
        <BoxLayout>
          <TxSummary
            outUnit={props.transactionRequest.product.tokenName}
            outValue={props.transactionRequest.amount.toString()}
            inUnit={props.transactionRequest.product.paymentMethod.toUpperCase()}
            inValue={expectedValue.loaded ? parseFloat(utils.formatEther(expectedValue.value)).toFixed(4) : "Checking"}
            title={t('Refund.Title')}
            transactionRequest={props.transactionRequest}
          />
          <div style={{ marginTop: 20, paddingLeft: 10, paddingRight: 10 }}>
            <Button
              clickHandler={() => {
                account && props.transactionRequest.userAddresses !== account
                  ? checkAccount()
                  : createTransaction();
              }}
              title={t('Buying.TransactionRetryButton')}
            />
          </div>
          <div style={{ height: 100 }}></div>
        </BoxLayout>
        <AddressBottomTab
        chainId={chainId}
          paymentMethod={props.transactionRequest.product.paymentMethod}
        />
      </div>
    );
  }
}

export default Refund;
