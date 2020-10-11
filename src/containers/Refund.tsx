import React from "react";
import Token from "../core/types/Token";

type Props = {
  token: Token
}

function Refund(props: Props) {
  return (
    <div>
      <h2>Refund!</h2>
      <p> {props.token.amount}</p>
    </div>
  );
}

export default Refund;