import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import TransactionRequest from "../core/types/TransactionRequest";
import BuyingStage from "../core/enums/BuyingStage";
import { getElPrice } from "../core/clients/CoingeckoClient";
import { useWeb3React } from "@web3-react/core";
import InjectedConnector from "../core/connectors/InjectedConnector";
import BuyingStatusBar from "../components/BuyingStatusBar";
import { useAssetToken, useElysiaToken } from "../hooks/useContract";
import { BigNumber } from "bignumber.js";
import ConnectWallet from "../components/ConnectWallet";
import TxSummary from "../components/TxSummary";
import Button from "../components/Button";
import Loading from "../components/Loading";
import BoxLayout from "../components/BoxLayout";
import { useHistory } from "react-router-dom";

type Props = {
  transactionRequest: TransactionRequest
}

type State = {
  stage: BuyingStage
  elPricePerToken: number
  loading: boolean
  error: boolean
  message: string
  txHash: string
}

function Buying(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const history = useHistory();
  const elToken = useElysiaToken();
  const assetToken = useAssetToken(props.transactionRequest.contractAddress);

  const [state, setState] = useState<State>({
    stage: BuyingStage.WHITELIST_CHECK,
    elPricePerToken: 0.003,
    loading: true,
    error: false,
    message: "",
    txHash: "",
  });

  const [counter, setCounter] = useState<number>(0);

  const expectedUsdValue = (props.transactionRequest.amount || 0)
    * props.transactionRequest.usdPricePerToken;
  const expectedElValue = expectedUsdValue / state.elPricePerToken;
  const expectedReturn = (
    expectedElValue * parseFloat(props.transactionRequest.expectedAnnualReturn) * 0.01
  );
  const expectedReturnUsd = expectedReturn * state.elPricePerToken;

  const connectWallet = () => {
    activate(InjectedConnector)
  }

  const loadElPrice = () => {
    getElPrice().then((res) => {
      setState({
        ...state,
        elPricePerToken: res.data.elysia.usd,
        loading: false,
      })
    }).catch((e) => {
      setState({ ...state, error: true })
    })
  }

  const checkWhitelisted = () => {
    assetToken?.isWhitelisted(account).then((res: any) => {
      setState({
        ...state,
        stage: res ? BuyingStage.ALLOWANCE_CHECK : BuyingStage.WHITELIST_RETRY,
        message: props.transactionRequest.userAddresses[0].substr(0, 10) + '**',
      })
    })
  }

  const checkAllowance = () => {
    elToken?.allowance(account, props.transactionRequest.contractAddress).then((res: BigNumber) => {
      const allownace = new BigNumber(res.toString());
      setState({
        ...state,
        stage: allownace.gte(new BigNumber(expectedElValue + '0'.repeat(18))) ? BuyingStage.TRANSACTION : BuyingStage.ALLOWANCE_RETRY,
        message: "",
      })
    })
  }

  const createTransaction = () => {
    assetToken?.populateTransaction.purchase(props.transactionRequest.amount).then((populatedTransaction) => {
      library.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: populatedTransaction.to,
          from: account,
          data: populatedTransaction.data,
          chainId: 3,
        }],
      }).then((txHash: string) => {
        setState({
          ...state,
          stage: BuyingStage.TRANSACTION_PENDING,
          txHash
        })
      }).catch((error: any) => {
        setState({
          ...state,
          stage: BuyingStage.TRANSACTION_RETRY,
          message: error.message,
        })
      })
    })
  }

  const approve = () => {
    elToken?.populateTransaction.approve(
      props.transactionRequest.contractAddress,
      "1" + "0".repeat(25)
    ).then((populatedTransaction) => {
      library.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: populatedTransaction.to,
          from: account,
          data: populatedTransaction.data,
        }],
      }).then((txHash: string) => {
        setState({
          ...state,
          stage: BuyingStage.ALLOWANCE_PENDING,
          txHash,
        })

      }).catch((error: any) => {
        setState({
          ...state,
          stage: BuyingStage.ALLOWANCE_RETRY,
        })
      })
    })
  }

  const checkPendingTx = (nextStage: BuyingStage, prevStage: BuyingStage) => {
    library?.getTransactionReceipt(state.txHash).then((res: any) => {
      console.log(res);
      if (res && res.status === 1) {
        setState({
          ...state,
          stage: nextStage,
          txHash: "",
        })
      } else if (res && res.status !== 1) {
        setState({
          ...state,
          stage: prevStage,
        })
      } else {
        setCounter(counter + 1);
      }
    })
  }

  useEffect(connectWallet, []);
  useEffect(loadElPrice, []);
  useEffect(checkWhitelisted, [account]);

  useEffect(() => {
    switch (state.stage) {
      case BuyingStage.ALLOWANCE_CHECK:
        account && checkAllowance();
        break;
      case BuyingStage.TRANSACTION:
        account && createTransaction();
        break;
      case BuyingStage.TRANSACTION_RESULT:
        // TODO : Make pending tx be expired
        setTimeout(() => {
          history.push("/txCompletion")
        }, 3000)
      default: return
    }
  }, [state.stage])

  useEffect(() => {
    state.stage === BuyingStage.ALLOWANCE_PENDING && setTimeout(() => {
      checkPendingTx(BuyingStage.TRANSACTION, BuyingStage.ALLOWANCE_RETRY)
    }, 2000);

    state.stage === BuyingStage.TRANSACTION_PENDING && setTimeout(() => {
      checkPendingTx(BuyingStage.TRANSACTION_RESULT, BuyingStage.TRANSACTION_RETRY)
    }, 2000);
  }, [state.stage, counter])

  if (state.error) {
    return (
      <div>
        {t("Error.PriceServer")}
      </div>
    );
  } else if (state.loading) {
    return (
      <Loading />
    );
  } else if (!account) {
    return (
      <ConnectWallet handler={connectWallet} />
    )
  } else {
    return (
      <BoxLayout>
        <div style={{ height: 500 }}>
          <TxSummary
            inUnit={props.transactionRequest.tokenName}
            inValue={props.transactionRequest.amount.toString()}
            outUnit={'EL'}
            outValue={expectedElValue.toFixed(2)}
            title={
              `${t('Buying.CreateTransaction')} (${props.transactionRequest.productTitle})`
            }
          />
          <div style={{ width: 312, height: 20, marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <p style={{ color: "#1c1c1c", fontWeight: 'bold', fontSize: 15 }}>{t('Buying.ExpectedAnnualReturn')}</p>
            <p style={{ color: "#1c1c1c", fontWeight: 'bold', fontSize: 15 }}>
              {`EL ${expectedReturn.toFixed(2)} ($ ${expectedReturnUsd.toFixed(2)})`}
            </p>
          </div>
          <BuyingStatusBar
            transactionRequest={props.transactionRequest}
            stage={state.stage}
            loading={state.loading}
            error={state.error}
            message={state.message}
          />
          {
            [BuyingStage.ALLOWANCE_RETRY, BuyingStage.TRANSACTION_RETRY].includes(state.stage) && <Button
              title={t(`Buying.${state.stage}Button`)}
              clickHandler={() => {
                if (state.stage.includes("Whitelist")) {
                  setState({
                    ...state,
                    stage: BuyingStage.WHITELIST_CHECK
                  })
                } else if (state.stage.includes("Transaction")) {
                  setState({
                    ...state,
                    stage: BuyingStage.TRANSACTION
                  })
                } else {
                  approve();
                }
              }}
            />
          }
          {
            state.txHash && <div style={{ textAlign: "center", fontSize: 10 }}>
              {state.txHash}
            </div>
          }
        </div>
      </BoxLayout>
    );
  }
}

export default Buying;