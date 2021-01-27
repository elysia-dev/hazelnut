import { BigNumber, utils } from 'ethers';
import PaymentMethod from "../core/types/PaymentMethod";
import TransactionRequest from "../core/types/TransactionRequest";
import getPowerOf10 from "../core/utils/getPowerOf10";
import { useElPrice, useEthPrice } from "./usePrice";

export default function useExpectedValue(
  transactionRequest: TransactionRequest,
): [BigNumber, number] {
  const elPrice = useElPrice();
  const ethPrice = useEthPrice();

  const expectedValue =
    BigNumber.from((transactionRequest.amount || 0))
      .mul(BigNumber.from(transactionRequest.product.usdPricePerToken))
      .mul(getPowerOf10(36))
      .div(transactionRequest.product.paymentMethod === PaymentMethod.ETH ? ethPrice : elPrice)

  const expectedReturn = parseFloat(utils.formatEther(expectedValue)) * parseFloat(transactionRequest.product.expectedAnnualReturn) / 100;

  return [expectedValue, expectedReturn];
}