import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Spinner from "react-spinkit";
import TransactionRequest from "../core/types/TransactionRequest";
import { useWeb3React } from "@web3-react/core";
import InjectedConnector from "../core/connectors/InjectedConnector";
import { useAssetToken } from "../hooks/useContract";
import { getElPrice } from "../core/clients/CoingeckoClient";
import ConnectWallet from "../components/ConnectWallet";
import TxSummary from "../components/TxSummary";
import BigNumber from "bignumber.js";

type Props = {
  transactionRequest: TransactionRequest
}

type State = {
  loading: boolean
  elPricePerToken: number
  error: boolean
  message: string
  txHash: string
}

function Interest(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const assetToken = useAssetToken(props.transactionRequest.contractAddress);

  const [state, setState] = useState<State>({
    loading: true,
    elPricePerToken: 0.03,
    error: false,
    message: "",
    txHash: "",
  });

  const [interest, setInterest] = useState<string>("");

  const connectWallet = () => {
    activate(InjectedConnector)
  }

  const loadInterest = () => {
    assetToken?.getReward(account).then((res: BigNumber) => {
      setInterest(
        (new BigNumber(res.toString()))
          .div(new BigNumber('1' + '0'.repeat(18)))
          .div(new BigNumber(state.elPricePerToken))
          .toFormat(0)
      )
    })
  }

  const loadElPrice = () => {
    getElPrice().then((res) => {
      setState({
        ...state,
        elPricePerToken: res.data.elysia.usd,
        loading: false,
      })
    }).catch((e) => {
      setState({ ...state, error: true, message: t("Error.PriceServer") })
    })
  }

  const createTransaction = () => {
    assetToken?.populateTransaction.claimReward().then((populatedTransaction) => {
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
          error: false,
          txHash,
        })
      }).catch((error: any) => {
        setState({
          ...state,
          message: error.message,
          error: true
        })
      })
    })
  }

  useEffect(loadElPrice, []);
  useEffect(connectWallet, []);
  useEffect(() => {
    if (account) {
      loadInterest()
      setTimeout(() => { createTransaction() }, 1000)
    }
  }, [account])

  if (state.loading) {
    return (
      <div>
        <Spinner name="line-scale" />
      </div>
    );
  } else if (!account) {
    return (
      <ConnectWallet handler={connectWallet} />
    )
  } else {
    return (
      <div style={{ justifyContent: 'center', justifyItems: 'center' }}>
        <TxSummary
          out={'0'}
          in={`EL ${interest}`}
          title={
            `${t('Interest.Title')} (${props.transactionRequest.productTitle})`
          }
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
            <div
              style={{
                marginTop: 20,
                backgroundColor: "#3679B5",
                borderRadius: 10,
                borderWidth: 0,
                width: 312,
                height: 50,
                cursor: "pointer",
                marginLeft: 'auto', marginRight: 'auto'
              }}
              onClick={createTransaction}
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
                {t(`Buying.TransactionRetryButton`)}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Interest;