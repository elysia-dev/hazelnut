import { BigNumber, utils, constants } from 'ethers';
import { useEffect, useState } from 'react';
import PaymentMethod from "../core/types/PaymentMethod";
import TransactionRequest from "../core/types/TransactionRequest";
import getPowerOf10 from "../core/utils/getPowerOf10";
import usePrice from "./usePrice";

export default function useExpectedValue(
  transactionRequest: TransactionRequest,
): [{value: BigNumber, loaded: boolean}, number] {
  const { elPrice, ethPrice, bnbPrice, loaded } = usePrice();
  const [expectedValue, setExpectedValue] = useState<{value: BigNumber, loaded: boolean}>({
    value: constants.Zero,
    loaded: false
  });
  let decimalCount = 0;
  let decimalDiv = 1;
  const amount  = String(transactionRequest.amount);

  if(amount.includes(".")){
     const decimal =amount.substring(amount.indexOf('.') + 1);
     Array(decimal.length).fill(0).forEach(() =>{
       decimalDiv *= 10;
       decimalCount += 1;
     })
  }


  function paymentMethodPrice(paymentMethod: string): BigNumber {
    if(paymentMethod === PaymentMethod.ETH){
      return ethPrice;
    }
    if(paymentMethod === PaymentMethod.BNB){
      return bnbPrice;
    }
    return elPrice;
  }

  // 주의
  // 아래의 순서를 지켜야, 컨트랙트와 동일한 amount를 계산할 수 있음
  // 개수 * (decimal이 18인 usd 토큰 가격 / ethPrice) * decimal 18
  useEffect(() => {
    if(loaded){
      setExpectedValue({
        value: BigNumber.from(utils.parseUnits(amount || "0",decimalCount))
        .mul(
          BigNumber.from(transactionRequest.product.usdPricePerToken)
            .mul(getPowerOf10(36))
            .div(paymentMethodPrice(transactionRequest.product.paymentMethod))
        ).div(decimalDiv),
        loaded: true
      })
    }
  }, [loaded])

  const expectedReturn = parseFloat(utils.formatEther(expectedValue.value)) * parseFloat(transactionRequest.product.expectedAnnualReturn) / 100;

  return [expectedValue, expectedReturn];
}