import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
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
import TransactionType from '../core/enums/TransactionType';
import Loading from '../components/Loading';
import { useElPrice } from '../hooks/useElysia';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  loading: boolean;
  error: boolean;
  message: string;
  txHash: string;
};

function Refund(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const history = useHistory();
  const elToken = useElysiaToken();
  const elPricePerToken = useElPrice();
  const assetToken = useAssetToken(props.transactionRequest.product.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    loading: false,
    error: false,
    message: '',
    txHash: '',
  });
  const [counter, setCounter] = useState<number>(0);

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
            product: props.transactionRequest.product.title,
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
        <div style={{ filter: state.loading ? "blur(10px)" : "none" }}>
          <BoxLayout style={{ background: '#F9F9F9' }}>
            <TxSummary
              outUnit={props.transactionRequest.product.tokenName}
              outValue={props.transactionRequest.amount.toString()}
              inUnit={'EL'}
              inValue={expectedElValue.toFixed(2)}
              title={t('Refund.Title')}
              transactionRequest={props.transactionRequest}
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
          <AddressBottomTab />
        </div>
      </>
    );
  }
}

export default Refund;
