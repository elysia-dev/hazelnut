import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import BigNumber from 'bignumber.js';
import BoxLayout from '../components/BoxLayout';
import { useHistory, useParams } from 'react-router-dom';
import {
  completeTransactionRequest,
  getWhitelistRequest,
} from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import Loading from '../components/Loading';
import RequestStage from '../core/enums/RequestStage';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import InterestSuccess from './../images/success_interest.svg';
import Swal, { RetrySwal, SwalWithReact } from '../core/utils/Swal';
import Button from '../components/Button';
import { useElPrice, useEthPrice } from '../hooks/usePrice';
import PaymentMethod from '../core/types/PaymentMethod';

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
  const history = useHistory();
  const elPrice = useElPrice();
  const ethPrice = useEthPrice();
  const assetToken = useContract(props.transactionRequest.contract.address, props.transactionRequest.contract.abi);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: RequestStage.WHITELIST_CHECK,
    loading: false,
    txHash: '',
  });

  const txResult = useWatingTx(state.txHash);
  const [counter, setCounter] = useState<number>(0);
  const [interest, setInterest] = useState<string>('');

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
        new BigNumber(res.toString())
          .div(new BigNumber('1' + '0'.repeat(18)))
          .div(new BigNumber(
            props.transactionRequest.product.paymentMethod === PaymentMethod.ETH ?
              ethPrice :
              elPrice
          ))
          .toFormat(3),
      );
    });
  };

  const checkWhitelisted = () => {
    if (account !== props.transactionRequest.userAddresses[0]) {
      setState({
        ...state,
        stage: RequestStage.WHITELIST_RETRY,
      });

      return;
    }

    assetToken?.isWhitelisted(account).then((res: any) => {
      setState({
        ...state,
        stage: res ? RequestStage.TRANSACTION : RequestStage.WHITELIST_REQUEST,
      });
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
            stage: RequestStage.TRANSACTION_PENDING,
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

  const requestWhitelist = () => {
    getWhitelistRequest(id)
      .then(res => {
        if (res.data.status === 'new' || !res.data.txHash) {
          setCounter(counter + 1);
        } else if (res.data.status === 'error') {
          history.push('/serverError');
        } else {
          setState({
            ...state,
            stage: RequestStage.WHITELIST_PENDING,
            txHash: res.data.txHash,
          });
        }
      })
      .catch(() => {
        history.push('/serverError');
      });
  };

  useEffect(() => {
    if (!account) return;
    loadInterest();
    setState({
      ...state,
      stage: RequestStage.WHITELIST_CHECK,
    });
  }, [account]);

  useEffect(() => {
    switch (state.stage) {
      case RequestStage.WHITELIST_REQUEST:
      case RequestStage.WHITELIST_PENDING:
      case RequestStage.TRANSACTION_PENDING:
        SwalWithReact.fire({
          html: <Loading />,
          title: t(`Buying.${state.stage}`),
          showConfirmButton: false,
        });
        break;
      case RequestStage.WHITELIST_RETRY:
        RetrySwal.fire({
          icon: 'error',
          confirmButtonText: t('Retry'),
          html: `${t('Buying.WhitelistRetry')}<br>${props.transactionRequest.userAddresses[0]
            }`,
          showCloseButton: true,
        }).then(res => {
          if (res.isConfirmed) {
            checkWhitelisted();
          }
        });
        break;
      case RequestStage.TRANSACTION:
        SwalWithReact.close();
        account && createTransaction();
        break;
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
          title: t('Completion.Interest'),
          html: `<div style="font-size: 15px;"> ${t(
            'Completion.InterestResult',
            {
              product: props.transactionRequest.product.title,
              value: interest,
            },
          )}
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
    let timer: number;

    if (state.stage == RequestStage.WHITELIST_REQUEST) {
      timer = setTimeout(() => {
        requestWhitelist();
      }, 3000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [state.stage, counter]);

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
      case RequestStage.WHITELIST_PENDING:
        setState({
          ...state,
          stage:
            txResult.status === TxStatus.SUCCESS
              ? RequestStage.TRANSACTION
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
            inValue={interest}
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
                  : checkWhitelisted();
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

export default Interest;
