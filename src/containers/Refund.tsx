import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import Loading from '../components/Loading';
import { useElPrice } from '../hooks/useElysia';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import Swal, { RetrySwal, SwalWithReact } from '../core/utils/Swal';
import RefundSuccess from './../images/success_refund.svg';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  txHash: string;
};

function Refund(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const elPricePerToken = useElPrice();
  const assetToken = useContract(props.transactionRequest.contract.address, props.transactionRequest.contract.abi);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    txHash: '',
  });
  const txResult = useWatingTx(state.txHash);

  const expectedElValue =
    ((props.transactionRequest.amount || 0) *
      props.transactionRequest.product.usdPricePerToken) /
    elPricePerToken;

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
      .refund(props.transactionRequest.amount)
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
            SwalWithReact.fire({
              html: <Loading />,
              title: t('Buying.TransactionPending'),
              showConfirmButton: false,
            });
            setState({
              ...state,
              txHash,
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
    if (txResult.status === TxStatus.SUCCESS) {
      completeTransactionRequest(id, state.txHash);
      Swal.fire({
        title: t('Completion.Refund'),
        html: `<div style="font-size: 15px;"> ${t('Completion.RefundResult', {
          product: props.transactionRequest.product.title,
          value: expectedElValue.toFixed(2),
        })}
        </div>`,
        imageUrl: RefundSuccess,
        imageWidth: 275,
        showConfirmButton: false,
      });
    } else if (txResult.status === TxStatus.FAIL) {
      RetrySwal.fire({
        text: t('Buying.TransactionRetry'),
        icon: 'error',
        confirmButtonText: t('Retry'),
        showConfirmButton: true,
      }).then(res => {
        if (res.isConfirmed) {
          createTransaction();
        }
      });
    }
  }, [txResult.status]);

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
            inValue={expectedElValue.toFixed(2)}
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
        <AddressBottomTab />
      </div>
    );
  }
}

export default Refund;
