import React from "react";
import Token from "../core/types/Token";

type Props = {
  token: Token
}

// States
// 0 : whitelist checking
// 1 : whitelist retry
// 2 : allownace checking
// 3 : allowance retry
// 4 : making transactions
// 5 : transaction result

function Buying(props: Props) {
  return (
    <div>
      <h2>Buying!</h2>
      <p> {props.token.amount}</p>
    </div>
  );
}

export default Buying;