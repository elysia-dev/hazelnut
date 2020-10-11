import React from "react";
import Token from "../core/types/Token";

type Props = {
  token: Token
  elPricePerToken: number
}

function BuyingSummary(props: Props) {
  const userAddress = props.token.userAddresses[0] || '0xError'
  const expectedUsdValue = (props.token.amount || 0)
    * parseFloat(props.token.pricePerToken);
  const expectedElValue = expectedUsdValue / props.elPricePerToken;

  return (
    <div>
      <div>
        <span> You ({userAddress}) </span>
        <span> → </span>
        <span> Elysia </span>
        <span> (expected) {expectedElValue.toFixed(2)} EL </span>
      </div>
      <div>
        <span> Elysia </span>
        <span> → </span>
        <span> You ({userAddress}) </span>
        <span> {props.token.amount} ELA </span>
      </div>
    </div>
  );
}

export default BuyingSummary;