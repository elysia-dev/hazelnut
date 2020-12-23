import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken, useElysiaToken } from '../hooks/useContract';
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
import InterestStage from '../core/enums/InterestStage';
import useElPrice from '../hooks/useElPrice';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  stage: InterestStage;
  loading: boolean;
  error: boolean;
  message: string;
  txHash: string;
};

type Balance = BigNumber | undefined;

function Interest(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const history = useHistory();
  const elToken = useElysiaToken();
  const elPricePerToken = useElPrice();
  const assetToken = useAssetToken(props.transactionRequest.product.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: InterestStage.WHITELIST_CHECK,
    loading: false,
    error: false,
    message: '',
    txHash: '',
  });

  const [interest, setInterest] = useState<string>('');
  const [counter, setCounter] = useState<number>(0);
  const [balance, setBalance] = useState<Balance>(undefined);

  const longLoading = [
    InterestStage.WHITELIST_REQUEST,
    InterestStage.WHITELIST_PENDING,
    InterestStage.TRANSACTION_PENDING,
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

  const getBalance = () => {
    elToken?.balanceOf(account).then((res: BigNumber) => {
      const balance = new BigNumber(res.toString());
      setBalance(balance);
    });
  };

  const checkWhitelisted = () => {
    if (account !== props.transactionRequest.userAddresses[0]) {
      setState({
        ...state,
        stage: InterestStage.WHITELIST_RETRY,
        message: props.transactionRequest.userAddresses[0].substr(0, 10) + '**',
      });

      return;
    }

    assetToken?.isWhitelisted(account).then((res: any) => {
      setState({
        ...state,
        stage: res
          ? InterestStage.TRANSACTION
          : InterestStage.WHITELIST_REQUEST,
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
            stage: InterestStage.TRANSACTION_PENDING,
            txHash,
          });
        })
        .catch((error: any) => {
          setState({
            ...state,
            message: error.message,
            stage: InterestStage.TRANSACTION_RETRY,
            error: true,
          });
        });
    });
  };

  const checkPendingTx = (nextStage: InterestStage, prevStage: InterestStage) => {
    library?.getTransactionReceipt(state.txHash).then((res: any) => {
      if (res && res.status === 1) {
        setState({
          ...state,
          stage: nextStage,
          txHash: '',
        });
      } else if (res && res.status !== 1) {
        setState({
          ...state,
          stage: prevStage,
        });
      } else {
        setCounter(counter + 1);
      }
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
            stage: InterestStage.WHITELIST_PENDING,
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

  useEffect(connectWallet, []);
  useEffect(() => {
    if (!account) return;
    getBalance();
    loadInterest();
    checkWhitelisted();
  }, [account]);
  useEffect(() => {
    switch (state.stage) {
      case InterestStage.TRANSACTION:
        account && createTransaction();
        break;
      case InterestStage.TRANSACTION_RESULT:
        completeTransactionRequest(id);
        setTimeout(() => {
          history.push({
            pathname: '/txCompletion',
            state: {
              type: TransactionType.INTEREST,
              product: props.transactionRequest.product.title,
            },
          });
        }, 3000);
        break;
      default:
        return;
    }
  }, [state.stage]);
  useEffect(() => {
    let timer: number;

    switch (state.stage) {
      case InterestStage.TRANSACTION_PENDING:
        timer = setTimeout(() => {
          checkPendingTx(
            InterestStage.TRANSACTION_RESULT,
            InterestStage.TRANSACTION_RETRY,
          );
        }, 2000);
        break;
      case InterestStage.WHITELIST_REQUEST:
        timer = setTimeout(() => {
          requestWhitelist();
        }, 3000);
        break;
      case InterestStage.WHITELIST_PENDING:
        timer = setTimeout(() => {
          checkPendingTx(
            InterestStage.TRANSACTION,
            InterestStage.WHITELIST_RETRY,
          );
        }, 2000);
        break;
    }

    return () => {
      clearTimeout(timer);
    };
  }, [state.stage, counter]);

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
                InterestStage.WHITELIST_RETRY,
                InterestStage.TRANSACTION_RETRY,
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
          <AddressBottomTab address={account} balance={balance} />
        </div>
      </>
    );
  }
}

export default Interest;
