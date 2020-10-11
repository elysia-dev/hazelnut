import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Token from "../core/types/Token";
import BuyingStage from "../core/enums/BuyingStage";
import Spinner from "react-spinkit";
import { getElPrice } from "../core/clients/CoingeckoClient";
import BuyingSummary from "../components/BuyingSummary";
import { useWeb3React } from "@web3-react/core";
import InjectedConnector from "../core/connectors/InjectedConnector";

type Props = {
  token: Token
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

  const needSpinner = [
    BuyingStage.ALLOWANCE_CHECK,
    BuyingStage.WHITELIST_CHECK,
    BuyingStage.WHITELIST_CHECK
  ].includes(state.stage);

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
      <div>
        <h1>{props.token.title}</h1>
        <BuyingSummary
          token={props.token}
          elPricePerToken={state.elPricePerToken}
        />
        {
          needSpinner && (
            <div>
              <Spinner name="line-scale" />
            </div>
          )
        }
        <p>{t(`Buying.${state.stage}`)}</p>
      </div>
    );
  }
}

export default Buying;