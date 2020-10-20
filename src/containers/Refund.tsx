import React from "react";
import TransactionRequest from "../core/types/TransactionRequest";

type Props = {
  transactionRequest: TransactionRequest
}

function Refund(props: Props) {
  return (
    <div>
      <h2>Refund!</h2>
      <p> {props.transactionRequest.amount}</p>
    </div>
  );
}

export default Refund;