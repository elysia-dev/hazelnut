import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken } from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import { useHistory, useParams } from 'react-router-dom';
import { completeTransactionRequest } from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import Loading from '../components/Loading';
import { useElPrice } from '../hooks/useElysia';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import Swal, { SwalWithReact } from '../core/utils/Swal';
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
  const assetToken = useAssetToken(props.transactionRequest.product.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    txHash: '',
  });
  const txResult = useWatingTx(state.txHash);

  const expectedElValue = (props.transactionRequest.amount || 0) *
    props.transactionRequest.product.usdPricePerToken / elPricePerToken;

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
                chainId: 3,
              },
            ],
          })
          .then((txHash: string) => {
            SwalWithReact.fire({
              html: <Loading />,
              title: t('Buying.TransactionPending'),
              showConfirmButton: false,
            })
            setState({
              ...state,
              txHash,
            });
          })
          .catch((error: any) => {
            Swal.fire({
              text: error.message,
              icon: 'error',
              confirmButtonText: t('Buying.TransactionRetryButton'),
              allowOutsideClick: false,
            }).then((res) => {
              if (res.isConfirmed) {
                createTransaction();
              }
            })
          });
      });
  };

  useEffect(connectWallet, []);
  useEffect(() => {
    if (account) {
      createTransaction();
    }
  }, [account]);

  useEffect(() => {
    if (txResult.status === TxStatus.SUCCESS) {
      completeTransactionRequest(id);
      Swal.fire({
        title: t('Completion.Refund'),
        html: t(
          'Completion.RefundResult',
          {
            product: props.transactionRequest.product.title,
            value: expectedElValue.toFixed(2)
          }
        ),
        confirmButtonText: t('Completion.ReturnToApp'),
        imageUrl: RefundSuccess,
        imageWidth: 275,
        allowOutsideClick: false,
      }).then((res) => {
        if (res.isConfirmed) {
        }
      })
    } else if (txResult.status === TxStatus.FAIL) {
      Swal.fire({
        text: t('Buying.TransactionRetry'),
        icon: 'error',
        confirmButtonText: t('Buying.TransactionRetryButton'),
        allowOutsideClick: false,
      }).then((res) => {
        if (res.isConfirmed) {
          createTransaction();
        }
      })
    }
  }, [txResult.status]);

  if (!account) {
    return <ConnectWallet handler={connectWallet} />;
  } else {
    return (
      <div>
        <BoxLayout style={{ background: '#F9F9F9' }}>
          <TxSummary
            outUnit={props.transactionRequest.product.tokenName}
            outValue={props.transactionRequest.amount.toString()}
            inUnit={'EL'}
            inValue={expectedElValue.toFixed(2)}
            title={t('Refund.Title')}
            transactionRequest={props.transactionRequest}
          />
        </BoxLayout>
        <AddressBottomTab />
      </div>
    );
  }
}

export default Refund;
