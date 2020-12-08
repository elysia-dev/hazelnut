import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import TransactionRequest from "../core/types/TransactionRequest";
import BuyingStage from "../core/enums/BuyingStage";
import Spinner from "react-spinkit";
import { getElPrice } from "../core/clients/CoingeckoClient";
import BuyingSummary from "../components/BuyingSummary";
import { useWeb3React } from "@web3-react/core";
import InjectedConnector from "../core/connectors/InjectedConnector";
import BuyingStatusBar from "../components/BuyingStatusBar";
import { useAssetToken, useElysiaToken } from "../hooks/useContract";
import { BigNumber } from "bignumber.js";

type Props = {
  transactionRequest: TransactionRequest
}

type State = {
  stage: BuyingStage
  elPricePerToken: number
  loading: boolean
  error: boolean
  message: string
}

function Buying(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const elToken = useElysiaToken();
  const assetToken = useAssetToken(props.transactionRequest.contractAddress);

  const [state, setState] = useState<State>({
    stage: BuyingStage.WHITELIST_CHECK,
    elPricePerToken: 0.003,
    loading: true,
    error: false,
    message: "",
  });

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
        stage: allownace.gte(new BigNumber(expectedElValue + '0'.repeat(18))) ? BuyingStage.TRANSACTION : BuyingStage.ALLOWANCE_RETRY
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
          stage: BuyingStage.TRANSACTION_RESULT,
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

  const increaseAllowance = () => {
    elToken?.populateTransaction.increaseAllowance(
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
          stage: BuyingStage.ALLOWANCE_CHECK,
        })
      }).catch((error: any) => {
        setState({
          ...state,
          stage: BuyingStage.ALLOWANCE_RETRY,
        })
      })
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
      default: return
    }
  }, [state.stage])

  if (state.error) {
    return (
      <div>
        {t("Error.PriceServer")}
      </div>
    );
  } else if (state.loading) {
    return (
      <div>
        <Spinner name="line-scale" />
      </div>
    );
  } else if (!account) {
    return (
      <div style={{ justifyContent: 'center', justifyItems: 'center' }}>
        <div style={{ width: 312, height: 20, marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <button
            style={{
              backgroundColor: "#D0D8DF",
              borderRadius: 10,
              borderWidth: 0,
              width: 312,
              height: 50
            }}
            onClick={() => connectWallet()}
          >
            <p style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
              Connect wallet
          </p>
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div style={{ justifyContent: 'center', justifyItems: 'center' }}>
        <BuyingSummary
          transactionRequest={props.transactionRequest}
          elPricePerToken={state.elPricePerToken}
          expectedElValue={expectedElValue}
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
          [BuyingStage.ALLOWANCE_RETRY, BuyingStage.TRANSACTION_RETRY].includes(state.stage) && <div
            style={{
              backgroundColor: "#3679B5",
              borderRadius: 10,
              borderWidth: 0,
              width: 312,
              height: 50,
              cursor: "pointer",
              marginLeft: 'auto', marginRight: 'auto'
            }}
            onClick={() => {
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
                increaseAllowance();
              }
            }}
          >
            <div
              style={{
                paddingTop: 12,
                color: "#fff",
                fontSize: 20,
                textAlign: "center",
                fontWeight: 300,
              }}
            >
              {t(`Buying.${state.stage}Button`)}
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Buying;