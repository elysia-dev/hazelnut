import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken, useElysiaToken } from '../hooks/useContract';
import { getElPrice } from '../core/clients/CoingeckoClient';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import BigNumber from 'bignumber.js';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import { useHistory, useParams } from 'react-router-dom';
import { completeTransactionRequest } from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import TransactionType from '../core/enums/TransactionType';
import Loading from '../components/Loading';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  loading: boolean;
  elPricePerToken: number;
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
  const assetToken = useAssetToken(props.transactionRequest.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    loading: false,
    elPricePerToken: 0.03,
    error: false,
    message: '',
    txHash: '',
  });

  const [interest, setInterest] = useState<string>('');
  const [counter, setCounter] = useState<number>(0);
  const [balance, setBalance] = useState<Balance>(undefined);

  const connectWallet = () => {
    activate(InjectedConnector);
  };

  const loadInterest = () => {
    assetToken?.getReward(account).then((res: BigNumber) => {
      setInterest(
        new BigNumber(res.toString())
          .div(new BigNumber('1' + '0'.repeat(18)))
          .div(new BigNumber(state.elPricePerToken))
          .toFormat(3),
      );
    });
  };

  const loadElPrice = () => {
    getElPrice()
      .then(res => {
        setState({
          ...state,
          elPricePerToken: res.data.elysia.usd,
        });
      })
      .catch(e => {
        setState({ ...state, error: true, message: t('Error.PriceServer') });
      });
  };

  const getBalance = () => {
    elToken?.balanceOf(account).then((res: BigNumber) => {
      const balance = new BigNumber(res.toString());
      setBalance(balance);
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
            txHash,
          });
        })
        .catch((error: any) => {
          setState({
            ...state,
            message: error.message,
            error: true,
          });
        });
    });
  };

  const checkPendingTx = () => {
    library?.getTransactionReceipt(state.txHash).then((res: any) => {
      if (res && res.status === 1) {
        completeTransactionRequest(id);
        history.push({
          pathname: '/txCompletion',
          state: {
            type: TransactionType.INTEREST,
            product: props.transactionRequest.productTitle,
            value: interest,
          },
        });
      } else if (res && res.status !== 1) {
        setState({
          ...state,
          loading: false,
          error: true,
          message: 'Transaction is failed',
          txHash: '',
        });
      } else {
        setCounter(counter + 1);
      }
    });
  };

  useEffect(loadElPrice, []);
  useEffect(connectWallet, []);
  useEffect(getBalance, [account]);
  useEffect(() => {
    if (account) {
      loadInterest();
      setTimeout(() => {
        createTransaction();
      }, 1000);
    }
  }, [account]);
  useEffect(() => {
    if (state.txHash) {
      setTimeout(() => {
        checkPendingTx();
      }, 1000);
    }
  }, [state.txHash, counter]);

  if (!account) {
    return <ConnectWallet handler={connectWallet} />;
  } else {
    return (
      <>
        { state.loading && <Loading />}
        <div style={{ filter: state.loading ? "blur(4px)" : "none" }}>
          <BoxLayout style={{ background: '#F9F9F9' }}>
            <TxSummary
              inUnit={'EL'}
              inValue={interest}
              outUnit={''}
              outValue={'0'}
              title={`${t('Interest.Title')} (${props.transactionRequest.productTitle
                })`}
            />
            {state.error && (
              <>
                <div
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: 10,
                    color: '#1c1c1c',
                    textDecorationLine: 'underline',
                    textAlign: 'center',
                    width: 312,
                  }}
                >
                  {state.message}
                </div>
                <Button
                  style={{ marginTop: 20 }}
                  title={t(`Buying.TransactionRetryButton`)}
                  clickHandler={createTransaction}
                />
              </>
            )}
          </BoxLayout>
          <AddressBottomTab address={account} balance={balance} />
        </div>
      </>
    );
  }
}

export default Interest;
