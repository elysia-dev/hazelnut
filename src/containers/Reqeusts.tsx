import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Web3ReactProvider } from '@web3-react/core'
import Spinner from "react-spinkit";
import TransactionType from "../core/enums/TransactionType";
import Buying from "./Buying";
import Refund from "./Refund";
import Interest from "./Interest";
import getLibrary from "../core/utils/getLibrary";
import TransactionRequest from "../core/types/TransactionRequest";
import { getTransactionRequest } from "../core/clients/EspressoClient";

type ParamTypes = {
  id: string
}

function Requests() {
  const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>();
  const { id } = useParams<ParamTypes>();
  const history = useHistory();

  function loadTransactionRequest() {
    // TODO : Validate token with api
    getTransactionRequest(id).then((res) => {
      setTransactionRequest(res.data)
    }).catch(() => {
      history.push('/notFound')
    })
  }

  useEffect(loadTransactionRequest, []);

  if (transactionRequest) {
    if (window.ethereum?.isMetaMask) {
      return (
        <div>
          <Web3ReactProvider getLibrary={getLibrary}>
            {transactionRequest.type === TransactionType.BUYING && <Buying transactionRequest={transactionRequest} />}
            {transactionRequest.type === TransactionType.REFUND && <Refund transactionRequest={transactionRequest} />}
            {transactionRequest.type === TransactionType.INTEREST && <Interest transactionRequest={transactionRequest} />}
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