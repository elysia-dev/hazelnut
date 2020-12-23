import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken } from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import BigNumber from 'bignumber.js';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import { useHistory, useParams } from 'react-router-dom';
import { completeTransactionRequest, getWhitelistRequest } from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import TransactionType from '../core/enums/TransactionType';
import Loading from '../components/Loading';
import RequestStage from '../core/enums/RequestStage';
import { useElPrice } from '../hooks/useElysia';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import InterestSuccess from './../images/success_interest.svg';
import Swal from '../core/utils/Swal';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  stage: RequestStage;
  loading: boolean;
  error: boolean;
  message: string;
  txHash: string;
};

function Interest(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const history = useHistory();
  const elPricePerToken = useElPrice();
  const assetToken = useAssetToken(props.transactionRequest.product.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: RequestStage.WHITELIST_CHECK,
    loading: false,
    error: false,
    message: '',
    txHash: '',
  });

  const txResult = useWatingTx(state.txHash);
  const [counter, setCounter] = useState<number>(0);
  const [interest, setInterest] = useState<string>('');

  const longLoading = [
    RequestStage.WHITELIST_REQUEST,
    RequestStage.WHITELIST_PENDING,
    RequestStage.TRANSACTION_PENDING,
  ].includes(state.stage);

  const connectWallet = () => {
    activate(InjectedConnector);
  };

  const loadInterest = () => {
    assetToken?.getReward(account).then((res: BigNumber) => {
      setInterest(
        new BigNumber(res.toString())
          .div(new BigNumber('1' + '0'.repeat(18)))
          .div(new BigNumber(elPricePerToken))
          .toFormat(3),
      );
    });
  };

  const checkWhitelisted = () => {
    if (account !== props.transactionRequest.userAddresses[0]) {
      setState({
        ...state,
        stage: RequestStage.WHITELIST_RETRY,
        message: props.transactionRequest.userAddresses[0].substr(0, 10) + '**',
      });

      return;
    }

    assetToken?.isWhitelisted(account).then((res: any) => {
      setState({
        ...state,
        stage: res
          ? RequestStage.TRANSACTION
          : RequestStage.WHITELIST_REQUEST,
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
              chainId: 3,
            },
          ],
        })
        .then((txHash: string) => {
          setState({
            ...state,
            error: false,
            loading: true,
            stage: RequestStage.TRANSACTION_PENDING,
            txHash,
          });
        })
        .catch((error: any) => {
          setState({
            ...state,
            message: error.message,
            stage: RequestStage.TRANSACTION_RETRY,
            error: true,
          });
        });
    });
  };

  const requestWhitelist = () => {
    getWhitelistRequest(id)
      .then(res => {
        console.log(res.data);
        if (res.data.status === 'new' || !res.data.txHash) {
          setCounter(counter + 1);
        } else if (res.data.status === 'error') {
          serverError();
        } else {
          setState({
            ...state,
            stage: RequestStage.WHITELIST_PENDING,
            txHash: res.data.txHash,
          });
        }
      })
      .catch(e => {
        if (e.status === 404) {
          history.push('/notfound');
        } else {
          serverError();
        }
      });
  };

  const serverError = () => {
    setState({
      ...state,
      error: true,
      message: 'Elysia Server Internal error',
    });
  };

  useEffect(() => {
    if (!account) return;
    loadInterest();
    checkWhitelisted();
  }, [account]);

  useEffect(() => {
    switch (state.stage) {
      case RequestStage.TRANSACTION:
        account && createTransaction();
        break;
      case RequestStage.TRANSACTION_RESULT:
        completeTransactionRequest(id);
        Swal.fire({
          title: t('Completion.Interest'),
          html: t(
            'Completion.InterestResult',
            {
              product: props.transactionRequest.product.title,
              value: interest
            }
          ),
          confirmButtonText: t('Completion.ReturnToApp'),
          imageUrl: InterestSuccess,
          imageWidth: 180,
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
          stage: txResult.status === TxStatus.SUCCESS ? RequestStage.TRANSACTION_RESULT : RequestStage.TRANSACTION_RETRY
        })
        break;
      case RequestStage.WHITELIST_PENDING:
        setState({
          ...state,
          stage: txResult.status === TxStatus.SUCCESS ? RequestStage.TRANSACTION : RequestStage.TRANSACTION_RETRY
        })
        break;
    }
  }, [txResult.status]);

  if (!account) {
    return <ConnectWallet handler={connectWallet} />;
  } else {
    return (
      <>
        { longLoading && <Loading />}
        <div style={{ filter: state.loading ? "blur(10px)" : "none" }}>
          <BoxLayout style={{ background: '#F9F9F9' }}>
            <TxSummary
              inUnit={'EL'}
              inValue={interest}
              outUnit={''}
              outValue={'0'}
              title={t('Interest.Title')}
              transactionRequest={props.transactionRequest}
            />
            {
              [
                RequestStage.WHITELIST_RETRY,
                RequestStage.TRANSACTION_RETRY,
              ].includes(state.stage) && (
                <Button
                  title={t(`Buying.${state.stage}Button`)}
                  clickHandler={() => {
                    if (state.stage.includes('Transaction')) {
                      createTransaction();
                    } else {
                      checkWhitelisted();
                    }
                  }}
                />
              )
            }
          </BoxLayout>
          <AddressBottomTab />
        </div>
      </>
    );
  }
}

export default Interest;
