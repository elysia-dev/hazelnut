import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import { getElPrice } from '../core/clients/CoingeckoClient';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken, useElysiaToken } from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import { useHistory, useParams } from 'react-router-dom';
import { completeTransactionRequest } from '../core/clients/EspressoClient';
import AddressBottomTab from '../components/AddressBottomTab';
import { BigNumber } from 'bignumber.js';
import TransactionType from '../core/enums/TransactionType';
import Loading from '../components/Loading';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  elPricePerToken: number;
  loading: boolean;
  error: boolean;
  message: string;
  txHash: string;
};

type Balance = BigNumber | undefined;

function Refund(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const history = useHistory();
  const elToken = useElysiaToken();
  const assetToken = useAssetToken(props.transactionRequest.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    elPricePerToken: 0.003,
    loading: false,
    error: false,
    message: '',
    txHash: '',
  });
  const [counter, setCounter] = useState<number>(0);
  const [balance, setBalance] = useState<Balance>(undefined);

  const expectedUsdValue =
    (props.transactionRequest.amount || 0) *
    props.transactionRequest.usdPricePerToken;
  const expectedElValue = expectedUsdValue / state.elPricePerToken;

  const connectWallet = () => {
    activate(InjectedConnector);
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
            setState({
              ...state,
              loading: true,
              error: false,
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
            type: TransactionType.REFUND,
            product: props.transactionRequest.productTitle,
            value: expectedElValue.toFixed(2),
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

  useEffect(connectWallet, []);
  useEffect(loadElPrice, []);
  useEffect(getBalance, [account]);
  useEffect(() => {
    if (account) {
      createTransaction();
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
              outUnit={props.transactionRequest.tokenName}
              outValue={props.transactionRequest.amount.toString()}
              inUnit={'EL'}
              inValue={expectedElValue.toFixed(2)}
              title={`${t('Refund.Title')} (${props.transactionRequest.productTitle
                })`}
            />
            {state.error && (
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
            )}
            {state.error && (
              <Button
                style={{ marginTop: 50 }}
                title={t(`Buying.TransactionRetryButton`)}
                clickHandler={createTransaction}
              />
            )}
          </BoxLayout>
          <AddressBottomTab address={account} balance={balance} />
        </div>
      </>
    );
  }
}

export default Refund;
