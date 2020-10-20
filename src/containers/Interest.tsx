import React from "react";
import TransactionRequest from "../core/types/TransactionRequest";

type Props = {
  transactionRequest: TransactionRequest
}

function Interest(props: Props) {
  return (
    <div>
      <h2>Interest!</h2>
      <p> {props.transactionRequest.amount}</p>
    </div>
  );
}

export default Interest;