import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import BuyingStage from '../core/enums/BuyingStage';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useAssetToken, useElysiaToken } from '../hooks/useContract';
import { BigNumber } from 'bignumber.js';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import Loading from '../components/Loading';
import BoxLayout from '../components/BoxLayout';
import { useHistory, useParams } from 'react-router-dom';
import {
  completeTransactionRequest,
} from '../core/clients/EspressoClient';
import ServerError from '../components/errors/ServerError';
import AddressBottomTab from '../components/AddressBottomTab';
import TransactionType from '../core/enums/TransactionType';
import useElPrice from '../hooks/useElPrice';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  stage: BuyingStage;
  error: boolean;
  message: string;
  txHash: string;
};

type Supply = BigNumber | undefined;

function Buying(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const history = useHistory();
  const elToken = useElysiaToken();
  const elPricePerToken = useElPrice();
  const assetToken = useAssetToken(props.transactionRequest.product.contractAddress);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: BuyingStage.ALLOWANCE_CHECK,
    error: false,
    message: '',
    txHash: '',
  });

  const [counter, setCounter] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<Supply>(undefined);
  const loading = [
    BuyingStage.ALLOWANCE_PENDING,
    BuyingStage.TRANSACTION_PENDING,
  ].includes(state.stage);

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
            ? BuyingStage.TRANSACTION
            : BuyingStage.ALLOWANCE_RETRY,
          message: '',
        });
      });
  };

  const createTransaction = () => {
    assetToken?.populateTransaction
      .purchase(props.transactionRequest.amount)
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
              stage: BuyingStage.TRANSACTION_PENDING,
              txHash,
            });
          })
          .catch((error: any) => {
            setState({
              ...state,
              stage: BuyingStage.TRANSACTION_RETRY,
              message: error.message,
            });
          });
      });
  };

  const approve = () => {
    elToken?.populateTransaction
      .approve(props.transactionRequest.product.contractAddress, '1' + '0'.repeat(25))
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
            setState({
              ...state,
              stage: BuyingStage.ALLOWANCE_PENDING,
              txHash,
            });
          })
          .catch((error: any) => {
            setState({
              ...state,
              stage: BuyingStage.ALLOWANCE_RETRY,
            });
          });
      });
  };

  const checkPendingTx = (nextStage: BuyingStage, prevStage: BuyingStage) => {
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

  const getTotalSupply = () => {
    assetToken?.totalSupply().then((res: BigNumber) => {
      const supply = new BigNumber(res.toString());
      setTotalSupply(supply);
    });
  };

  useEffect(getTotalSupply, [assetToken]);
  useEffect(() => {
    if (!account) return;
    checkAllowance();
  },
    [account]
  );

  useEffect(() => {
    switch (state.stage) {
      case BuyingStage.ALLOWANCE_CHECK:
        account && checkAllowance();
        break;
      case BuyingStage.TRANSACTION:
        account && createTransaction();
        break;
      case BuyingStage.TRANSACTION_RESULT:
        completeTransactionRequest(id);
        setTimeout(() => {
          history.push({
            pathname: '/txCompletion',
            state: {
              type: TransactionType.BUYING,
              product: props.transactionRequest.product.title,
              value: totalSupply
                ? (
                  props.transactionRequest.amount / totalSupply.toNumber()
                ).toFixed(4)
                : '--',
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
      case BuyingStage.ALLOWANCE_PENDING:
        timer = setTimeout(() => {
          checkPendingTx(BuyingStage.TRANSACTION, BuyingStage.ALLOWANCE_RETRY);
        }, 2000);
        break;
      case BuyingStage.TRANSACTION_PENDING:
        timer = setTimeout(() => {
          checkPendingTx(
            BuyingStage.TRANSACTION_RESULT,
            BuyingStage.TRANSACTION_RETRY,
          );
        }, 2000);
        break;
    }

    return () => {
      clearTimeout(timer);
    };
  }, [state.stage, counter]);

  if (state.error) {
    return <ServerError message={state.message} />;
  } else if (!account) {
    return <ConnectWallet handler={() => { activate(InjectedConnector) }} />;
  } else {
    return (
      <>
        { loading && <Loading message={t(`Buying.${state.stage}`)} />}
        <div style={{ filter: loading ? "blur(10px)" : "none" }}>
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
              {state.txHash && (
                <span
                  style={{
                    textAlign: 'center',
                    fontSize: 10,
                    width: '90%',
                    paddingLeft: '5%',
                    paddingRight: '5%',
                    display: 'block',
                    wordBreak: 'break-all',
                  }}
                >
                  {state.txHash}
                </span>
              )}
            </div>
          </BoxLayout>
          <AddressBottomTab />
        </div>
      </>
    );
  }
}

export default Buying;
