import { BigNumber } from 'ethers';
import { useEffect, useState } from "react";
import PRICE_ORACLE_ABI from '../core/constants/abis/price-oracle.json';
import useContract from "./useContract";

export function useEthPrice(): BigNumber {
  return usePrice(
    '1268934052030000000000',
    process.env.REACT_APP_ETH_PRICE_ORACLE_ADDRESS || '',
    PRICE_ORACLE_ABI
  )
}

export function useElPrice(): BigNumber {
  return usePrice(
    '2447090000000000',
    process.env.REACT_APP_EL_PRICE_ORACLE_ADDRESS || '',
    PRICE_ORACLE_ABI
  )
}

export default function usePrice(
  initialValue: string,
  address: string,
  abi: object,
): BigNumber {
  const [[price, loaded], setPrice] = useState<[BigNumber, boolean]>([BigNumber.from(initialValue), false]);
  const priceOracle = useContract(address, abi, false)

  useEffect(() => {
    if (loaded) return;

    priceOracle?.getPrice().then((res: BigNumber) => {
      if (res.gt(0)) {
        setPrice([res, true])
      }
    }).catch((e: any) => {
      console.log(e)
    })
  }, [priceOracle])

  return price;
}