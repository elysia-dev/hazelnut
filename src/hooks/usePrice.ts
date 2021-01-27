import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import PRICE_ORACLE_ABI from '../core/constants/abis/price-oracle.json';
import useContract from "./useContract";

export function useEthPrice(): number {
  return usePrice(
    1212,
    process.env.REACT_APP_ETH_PRICE_ORACLE_ADDRESS || '',
    PRICE_ORACLE_ABI
  )
}

export function useElPrice(): number {
  return usePrice(
    0.03,
    process.env.REACT_APP_EL_PRICE_ORACLE_ADDRESS || '',
    PRICE_ORACLE_ABI
  )
}

export default function usePrice(
  initialValue: number,
  address: string,
  abi: object,
): number {
  const [price, setPrice] = useState<number>(initialValue);
  const priceOracle = useContract(address, abi, false)

  useEffect(() => {
    priceOracle?.getPrice().then((res: BigNumber) => {
      const price = res.div(`1${'0'.repeat(18)}`).toNumber()

      console.log(price)

      if (price > 0) {
        setPrice(price)
      }
    }).catch((e: any) => {
      console.log(e)
    })
  }, [priceOracle])

  return price;
}