import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Token from "../core/types/Token";
import * as jwt from "jsonwebtoken";
import TokenType from "../core/enums/TokenType";
import Buying from "./Buying";
import Refund from "./Refund";
import Interest from "./Interest";

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
    return (
      <div>
        {state.decodedToken.type === TokenType.BUYING && <Buying token={state.decodedToken} />}
        {state.decodedToken.type === TokenType.REFUND && <Refund token={state.decodedToken} />}
        {state.decodedToken.type === TokenType.INTEREST && <Interest token={state.decodedToken} />}
      </div>
    );
  } else {
    return (
      <div>
        <h2>loading...</h2>
      </div>
    )
  }

}

export default Requests;