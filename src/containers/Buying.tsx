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

type Props = {
  transactionRequest: TransactionRequest
}

type State = {
  stage: BuyingStage
  elPricePerToken: number
  loading: boolean
  error: boolean
}

function Buying(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();

  const [state, setState] = useState<State>({
    stage: BuyingStage.WHITELIST_CHECK,
    elPricePerToken: 0.003,
    loading: true,
    error: false,
  });

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

  useEffect(connectWallet, []);
  useEffect(loadElPrice, []);
  useEffect(() => {
    if (!!library) {
      library.getBalance(account)
        .then((balance: any) => {
          console.log(balance)
        })
        .catch(() => {
          console.log("error")
        })
      console.log(library);
    }
  }, [account, library])

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
      <div>
        <div onClick={() => connectWallet()}>
          Connect wallet
        </div>
      </div>
    )
  } else {
    return (
      <div style={{ justifyContent: 'center', justifyItems: 'center' }}>

        <BuyingSummary
          transactionRequest={props.transactionRequest}
          elPricePerToken={state.elPricePerToken}
        />
        <div style={{ width: 312, height: 20, marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <p style={{ color: "#1c1c1c", fontWeight: 'bold', fontSize: 15 }}>{t('Buying.ExpectedAnnualReturn')}</p>
          <p style={{ color: "#1c1c1c", fontWeight: 'bold', fontSize: 15 }}>
            $ {parseFloat(props.transactionRequest.expectedAnnualReturn ? props.transactionRequest.expectedAnnualReturn : "0").toFixed(2)}
          </p>
        </div>
        <BuyingStatusBar
          transactionRequest={props.transactionRequest}
          stage={state.stage}
          loading={state.loading}
          error={state.error}
        />
        <div style={{ width: 312, height: 50, marginLeft: 'auto', marginRight: 'auto' }}>
          <button style={{ backgroundColor: (state.stage === BuyingStage.WHITELIST_CHECK || state.stage === BuyingStage.ALLOWANCE_CHECK) ? "#D0D8DF" : "#3679B5", borderRadius: 10, borderWidth: 0, width: 312, height: 50 }}>
            <p style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>{t(`Buying.${state.stage}_button`)}</p>
          </button>
        </div>
      </div>
    );
  }
}

export default Buying;