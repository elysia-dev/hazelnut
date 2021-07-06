import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import BoxLayout from '../components/BoxLayout';
import { useParams } from 'react-router-dom';
import { completeTransactionRequest } from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import RequestStage from '../core/enums/RequestStage';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import InterestSuccess from './../images/success_interest.svg';
import Swal, { RetrySwal } from '../core/utils/Swal';
import Button from '../components/Button';
import usePrice from '../hooks/usePrice';
import PaymentMethod from '../core/types/PaymentMethod';
import { BigNumber } from 'ethers';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  stage: RequestStage;
  loading: boolean;
  txHash: string;
};

function Interest(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const { elPrice, ethPrice, loaded } = usePrice();
  const assetToken = useContract(
    props.transactionRequest.contract.address,
    props.transactionRequest.contract.abi,
  );
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: RequestStage.TRANSACTION_PENDING,
    loading: false,
    txHash: '',
  });

  const txResult = useWatingTx(state.txHash);
  const [interest, setInterest] = useState<number>(0);

  const connectWallet = () => {
    activate(InjectedConnector);
  };

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

  const loadInterest = () => {
    assetToken?.getReward(account).then((res: BigNumber) => {
      setInterest(
        parseFloat(utils.formatEther(res)) /
          parseFloat(
            utils.formatEther(
              props.transactionRequest.product.paymentMethod ===
                PaymentMethod.ETH
                ? ethPrice
                : elPrice,
            ),
          ),
      );
    });
  };

  const createTransaction = () => {
    assetToken?.populateTransaction.claimReward().then(populatedTransaction => {
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
          setState({
            ...state,
            loading: true,
            stage: RequestStage.TRANSACTION_RESULT,
            txHash,
          });
        })
        .catch((error: any) => {
          setState({
            ...state,
            stage: RequestStage.TRANSACTION_RETRY,
          });
        });
    });
  };

  useEffect(() => {
    if (!account || !loaded) return;
    loadInterest();
    setState({
      ...state,
      stage: RequestStage.TRANSACTION,
    });
  }, [account, loaded]);

  useEffect(() => {
    switch (state.stage) {
      case RequestStage.TRANSACTION_RETRY:
        RetrySwal.fire({
          text: t('Buying.TransactionRetry'),
          icon: 'error',
          confirmButtonText: t('Retry'),
          showCloseButton: true,
        }).then(res => {
          if (res.isConfirmed) {
            setState({
              ...state,
              stage: RequestStage.TRANSACTION,
            });
          }
        });
        break;
      case RequestStage.TRANSACTION_RESULT:
        completeTransactionRequest(id, state.txHash);
        Swal.fire({
          title: t('Completion.Title'),
          html: `<div style="font-size: 15px;"> ${t(
            'Completion.InterestResult',
            {
              product: props.transactionRequest.product.title,
              value: interest.toFixed(6),
              paymentMethod: props.transactionRequest.product.paymentMethod,
            },
          )}
          <br />
          ${t('Completion.Notice')}
          </div>`,
          imageUrl: InterestSuccess,
          imageWidth: 180,
          allowOutsideClick: false,
          showConfirmButton: false,
        });
        break;
      default:
        return;
    }
  }, [state.stage]);

  useEffect(() => {
    if (![TxStatus.SUCCESS, TxStatus.FAIL].includes(txResult.status)) return;

    switch (state.stage) {
      case RequestStage.TRANSACTION_PENDING:
        setState({
          ...state,
          stage:
            txResult.status === TxStatus.SUCCESS
              ? RequestStage.TRANSACTION_RESULT
              : RequestStage.TRANSACTION_RETRY,
        });
        break;
    }
  }, [txResult.status]);

  if (!account) {
    return <ConnectWallet handler={connectWallet} />;
  } else {
    return (
      <div>
        <BoxLayout>
          <TxSummary
            inUnit={props.transactionRequest.product.paymentMethod.toUpperCase()}
            inValue={interest.toFixed(4)}
            outUnit={''}
            outValue={'0'}
            title={t('Interest.Title')}
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

export default Interest;
