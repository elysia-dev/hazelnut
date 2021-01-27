import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import PRICE_ORACLE_ABI from '../core/constants/abis/price-oracle.json';
import PaymentMethod from "../core/types/PaymentMethod";
import TransactionRequest from "../core/types/TransactionRequest";
import { useElPrice, useEthPrice } from "./useElysia";

export default function useExpectedValue(
  transactionRequest: TransactionRequest,
): number[] {
  const elPrice = useElPrice();
  const ethPrice = useEthPrice();

  const expectedValue =
    ((transactionRequest.amount || 0) *
      transactionRequest.product.usdPricePerToken) /
    (transactionRequest.product.paymentMethod === PaymentMethod.ETH ? ethPrice : elPrice)

  const expectedReturn = expectedValue *
    parseFloat(transactionRequest.product.expectedAnnualReturn) *
    0.01

  return [expectedValue, expectedReturn];
}