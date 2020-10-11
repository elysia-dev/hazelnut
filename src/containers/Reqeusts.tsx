import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Web3ReactProvider } from '@web3-react/core'
import Spinner from "react-spinkit";
import Token from "../core/types/Token";
import * as jwt from "jsonwebtoken";
import TokenType from "../core/enums/TokenType";
import Buying from "./Buying";
import Refund from "./Refund";
import Interest from "./Interest";
import getLibrary from "../core/utils/getLibrary";

type ParamTypes = {
  token: string
}

type State = {
  decodedToken: Token
}

function Requests() {
  const [state, setState] = useState<State>();
  const { token } = useParams<ParamTypes>();
  const history = useHistory();

  function decodeToken() {
    // TODO : Validate token with api
    const decodedToken = jwt.decode(token) as Token;

    if (decodedToken) {
      setState({ decodedToken });
    } else {
      history.push('/notFound')
    }
  }

  useEffect(decodeToken, []);
  if (state?.decodedToken) {
    if (window.ethereum?.isMetaMask) {
      return (
        <div>
          <Web3ReactProvider getLibrary={getLibrary}>
            {state.decodedToken.type === TokenType.BUYING && <Buying token={state.decodedToken} />}
            {state.decodedToken.type === TokenType.REFUND && <Refund token={state.decodedToken} />}
            {state.decodedToken.type === TokenType.INTEREST && <Interest token={state.decodedToken} />}
          </Web3ReactProvider>
        </div>
      );
    } else {
      return (
        <div>
          <h2>Install Metamask</h2>
        </div>
      )
    }
  } else {
    return (
      <div>
        <Spinner name="line-scale" />
      </div>
    )
  }

}

export default Requests;