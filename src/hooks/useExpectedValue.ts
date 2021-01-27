import { BigNumber, utils, constants } from 'ethers';
import PaymentMethod from "../core/types/PaymentMethod";
import TransactionRequest from "../core/types/TransactionRequest";
import getPowerOf10 from "../core/utils/getPowerOf10";
import { useElPrice, useEthPrice } from "./usePrice";

export default function useExpectedValue(
  transactionRequest: TransactionRequest,
): [BigNumber, number] {
  const elPrice = useElPrice();
  const ethPrice = useEthPrice();

  // 주의
  // 아래의 순서를 지켜야, 컨트랙트와 동일한 amount를 계산할 수 있음
  // 개수 * (decimal이 18인 usd 토큰 가격 / ethPrice) * decimal 18
  const expectedValue =
    BigNumber.from((transactionRequest.amount || 0))
      .mul(
        BigNumber.from(transactionRequest.product.usdPricePerToken)
          .mul(getPowerOf10(36))
          .div(transactionRequest.product.paymentMethod === PaymentMethod.ETH ? ethPrice : elPrice)
      )

  const expectedReturn = parseFloat(utils.formatEther(expectedValue)) * parseFloat(transactionRequest.product.expectedAnnualReturn) / 100;

  return [expectedValue, expectedReturn];
}