import React from "react";
import Token from "../core/types/Token";

type Props = {
  token: Token
}

function Interest(props: Props) {
  return (
    <div>
      <h2>Interest!</h2>
      <p> {props.token.amount}</p>
    </div>
  );
}

export default Interest;