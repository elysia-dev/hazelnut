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

//const buyingToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiYnV5aW5nIiwiY29udHJhY3RBZGRyZXNzIjoidGVzdEFkZHJlc3MiLCJldGhBZGRyZXNzZXMiOlsiZXRoQWRkcmVzc1RFU1QiXSwiYW1vdW50IjoxMCwiZXhwZWN0ZWRBbm51YWxSZXR1cm4iOiIxMC43NSIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYwMjE0OTcxOSwiZXhwIjoxNjAyMTUzNDE3LCJqdGkiOiIyYWM5NDc4ZS1hZDg2LTRhNWQtOGExNi02NjAwYjk5MmE5MDkifQ.pK8Ulb2Uit0avDT_F3yguwRjvQ6GgO_D1qn0YTKDQSU";
//const refundToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoicmVmdW5kIiwiY29udHJhY3RBZGRyZXNzIjoidGVzdEFkZHJlc3MiLCJldGhBZGRyZXNzZXMiOlsiZXRoQWRkcmVzc1RFU1QiXSwiYW1vdW50IjoxMCwiZXhwZWN0ZWRBbm51YWxSZXR1cm4iOiIxMC43NSIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYwMjE0OTcxOSwiZXhwIjoxNjAyMTU1MDAxLCJqdGkiOiJmZDVhYTk5OC04Y2MzLTRlNmItOGUyNi1mMDI4ZjY5ZTIxMDUifQ.60msL4JwSTB1Wp6DSJwpZWnLe66Szf4rfJR-bkJX3Ow";
//const interestToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiaW50ZXJlc3QiLCJjb250cmFjdEFkZHJlc3MiOiJ0ZXN0QWRkcmVzcyIsImV0aEFkZHJlc3NlcyI6WyJldGhBZGRyZXNzVEVTVCJdLCJhbW91bnQiOjEwLCJleHBlY3RlZEFubnVhbFJldHVybiI6IjEwLjc1IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjAyMTQ5NzE5LCJleHAiOjE2MDIxNTUwNDIsImp0aSI6ImRmMWQzNDFlLTRhNjAtNDA0ZS05NDFlLWI2ZGYzMjQ4NjFkMSJ9.DluDllv5aEB1vq1MAgkrdCa11lamOK2KmudRXkitI3s";

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