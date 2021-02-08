import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';
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

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  txHash: string;
};

function Refund(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const assetToken = useContract(
    props.transactionRequest.contract.address,
    props.transactionRequest.contract.abi,
  );
  const [expectedValue] = useExpectedValue(props.transactionRequest);
  const { id } = useParams<{ id: string }>();

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
    assetToken?.populateTransaction
      .refund(utils.parseEther(props.transactionRequest.amount.toString()))
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
                  value: parseFloat(utils.formatEther(expectedValue)).toFixed(
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
            inValue={parseFloat(utils.formatEther(expectedValue)).toFixed(4)}
            title={t('Refund.Title')}
            transactionRequest={props.transactionRequest}
          />
          <div style={{ marginTop: 20, paddingLeft: 10, paddingRight: 10 }}>
            <Button
              clickHandler={() => {
                account && props.transactionRequest.userAddresses[0] !== account
                  ? checkAccount()
                  : createTransaction();
              }}
              title={t('Buying.TransactionRetryButton')}
            />
          </div>
          <div style={{ height: 100 }}></div>
        </BoxLayout>
        <AddressBottomTab
          paymentMethod={props.transactionRequest.product.paymentMethod}
        />
      </div>
    );
  }
}

export default Refund;
