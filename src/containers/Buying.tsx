import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import RequestStage from '../core/enums/RequestStage';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken, useElysiaToken } from '../hooks/useContract';
import { BigNumber } from 'bignumber.js';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import Loading from '../components/Loading';
import BoxLayout from '../components/BoxLayout';
import { useParams } from 'react-router-dom';
import {
  completeTransactionRequest,
} from '../core/clients/EspressoClient';
import ServerError from '../components/errors/ServerError';
import AddressBottomTab from '../components/AddressBottomTab';
import { useElPrice, useTotalSupply } from '../hooks/useElysia';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import { PopulatedTransaction } from '@ethersproject/contracts';
import BuyingSuccess from './../images/success_buying.svg';
import Swal, { SwalWithReact } from '../core/utils/Swal';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  stage: RequestStage;
  error: boolean;
  txHash: string;
};

function Buying(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const elToken = useElysiaToken();
  const elPricePerToken = useElPrice();
  const assetToken = useAssetToken(props.transactionRequest.product.contractAddress);
  const totalSupply = useTotalSupply(props.transactionRequest.product.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: RequestStage.ALLOWANCE_CHECK,
    error: false,
    txHash: '',
  });

  const txResult = useWatingTx(state.txHash);

  const expectedElValue = (props.transactionRequest.amount || 0) *
    props.transactionRequest.product.usdPricePerToken / elPricePerToken;
  const expectedReturn =
    expectedElValue *
    parseFloat(props.transactionRequest.product.expectedAnnualReturn) *
    0.01;

  const checkAllowance = () => {
    elToken
      ?.allowance(account, props.transactionRequest.product.contractAddress)
      .then((res: BigNumber) => {
        const allownace = new BigNumber(res.toString());
        setState({
          ...state,
          stage: allownace.gte(new BigNumber(expectedElValue + '0'.repeat(18)))
            ? RequestStage.TRANSACTION
            : RequestStage.ALLOWANCE_RETRY,
        });
      });
  };

  const createTransaction = () => {
    assetToken?.populateTransaction
      .purchase(props.transactionRequest.amount)
      .then(populatedTransaction => {
        sendTx(populatedTransaction, RequestStage.TRANSACTION_PENDING, RequestStage.TRANSACTION_RETRY);
      });
  };

  const approve = () => {
    elToken?.populateTransaction
      .approve(props.transactionRequest.product.contractAddress, '1' + '0'.repeat(25))
      .then(populatedTransaction => {
        sendTx(populatedTransaction, RequestStage.ALLOWANCE_PENDING, RequestStage.ALLOWANCE_CHECK);
      })
  };

  const sendTx = (
    populatedTransaction: PopulatedTransaction,
    nextStage: RequestStage,
    prevStage: RequestStage,
  ) => {
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
          stage: nextStage,
          txHash,
        });
      })
      .catch((error: any) => {
        setState({
          ...state,
          stage: prevStage,
        });
      });
  }

  useEffect(() => {
    if (!account) return;
    Swal.close();

    if (state.stage === RequestStage.ALLOWANCE_CHECK) {
      checkAllowance();
    } else {
      setState({
        ...state,
        stage: RequestStage.ALLOWANCE_CHECK,
      })
    }
  },
    [account]
  );

  useEffect(() => {
    switch (state.stage) {
      case RequestStage.ALLOWANCE_PENDING: case RequestStage.TRANSACTION_PENDING:
        SwalWithReact.fire({
          html: <Loading />,
          title: t(`Buying.${state.stage}`),
          showConfirmButton: false,
        })
        break;
      case RequestStage.ALLOWANCE_CHECK:
        account && checkAllowance();
        break;
      case RequestStage.ALLOWANCE_RETRY:
        Swal.fire({
          text: t('Buying.AllowanceRetry'),
          icon: 'info',
          confirmButtonText: t('Buying.AllowanceRetryButton'),
          allowOutsideClick: false,
        }).then((res) => {
          if (res.isConfirmed) {
            approve();
          }
        })
        break;
      case RequestStage.TRANSACTION_RETRY:
        Swal.fire({
          text: t('Buying.TransactionRetry'),
          icon: 'error',
          confirmButtonText: t('Buying.TransactionRetryButton'),
          allowOutsideClick: false,
        }).then((res) => {
          if (res.isConfirmed) {
            setState({
              ...state,
              stage: RequestStage.TRANSACTION,
            })
          }
        })
        break;
      case RequestStage.TRANSACTION:
        SwalWithReact.close();
        account && createTransaction();
        break;
      case RequestStage.TRANSACTION_RESULT:
        completeTransactionRequest(id);
        Swal.fire({
          title: t('Completion.Buying'),
          html: t(
            'Completion.BuyingResult',
            {
              product: props.transactionRequest.product.title,
              value: totalSupply ?
                (new BigNumber(props.transactionRequest.amount)).div(totalSupply).multipliedBy(100).toFixed(1)
                : '--',
            }
          ),
          confirmButtonText: t('Completion.ReturnToApp'),
          imageUrl: BuyingSuccess,
          imageWidth: 275,
          allowOutsideClick: false,
        }).then((res) => {
          if (res.isConfirmed) {
          }
        })
        break;
      default:
        return;
    }
  }, [state.stage]);

  useEffect(() => {
    if (![TxStatus.SUCCESS, TxStatus.FAIL].includes(txResult.status)) return;

    switch (state.stage) {
      case RequestStage.ALLOWANCE_PENDING:
        setState({
          ...state,
          stage: txResult.status === TxStatus.SUCCESS ? RequestStage.TRANSACTION : RequestStage.ALLOWANCE_RETRY
        })
        break;
      case RequestStage.TRANSACTION_PENDING:
        setState({
          ...state,
          stage: txResult.status === TxStatus.SUCCESS ? RequestStage.TRANSACTION_RESULT : RequestStage.TRANSACTION_RETRY
        })
        break;
    }
  }, [txResult.status]);

  if (state.error) {
    return <ServerError />;
  } else if (!account) {
    return <ConnectWallet handler={() => { activate(InjectedConnector) }} />;
  } else {
    return (
      <div>
        <BoxLayout>
          <div style={{ height: 500 }}>
            <TxSummary
              inUnit={props.transactionRequest.product.tokenName}
              inValue={props.transactionRequest.amount.toString()}
              outUnit={'EL'}
              outValue={expectedElValue.toFixed(2)}
              title={t('Buying.CreateTransaction')}
              transactionRequest={props.transactionRequest}
            />
            <div
              style={{
                height: 40,
                backgroundColor: "#F6F6F8",
                margin: "0px 15px",
                padding: "0px 15px",
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            >
              <div style={{ fontSize: 10 }}>
                {t('Buying.Annual')}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ color: '#1c1c1c', fontWeight: 'bold', fontSize: 15 }}
                >
                  {t('Buying.ExpectedReturn')}
                </div>
                <div
                  style={{ color: '#1c1c1c', fontSize: 15 }}
                >
                  EL
                   <strong style={{ marginLeft: "5px" }}>
                    {expectedReturn.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </BoxLayout>
        <AddressBottomTab />
      </div>
    );
  }
}

export default Buying;
