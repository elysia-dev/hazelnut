import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import PRICE_ORACLE_ABI from '../core/constants/abis/price-oracle.json';
import useContract from "./useContract";

export function useEthPrice(): number {
  const [price, setPrice] = useState<number>(1212);
  const priceOracle = useContract(process.env.REACT_APP_EL_PRICE_ORACLE_ADDRESS, PRICE_ORACLE_ABI, false)

  useEffect(() => {
    priceOracle?.getPrice().then((res: BigNumber) => {
      const price = res.div(`1${'0'.repeat(18)}`).toNumber()

      if (price > 0) {
        setPrice(price)
      }
    }).catch((e: any) => {
      console.log(e);
    })
  }, [priceOracle])

  return price;
}

export function useElPrice(): number {
  const [price, setPrice] = useState<number>(0.03);
  const priceOracle = useContract(process.env.REACT_APP_EL_PRICE_ORACLE_ADDRESS, PRICE_ORACLE_ABI, false)

  useEffect(() => {
    priceOracle?.getPrice().then((res: BigNumber) => {
      const price = res.div(`1${'0'.repeat(18)}`).toNumber()

      if (price > 0) {
        setPrice(price)
      }
    }).catch((e: any) => {
      console.log(e)
    })
  }, [])

  return price;
}