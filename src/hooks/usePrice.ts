import React from 'react'
import { BigNumber, constants, utils } from 'ethers';
import { useEffect, useState } from "react";
import PRICE_ORACLE_ABI from '../core/constants/abis/price-oracle.json';
import useContract from "./useContract";
import axios, { AxiosResponse } from 'axios';
import CoingeckoClient from '../api/CoingeckoClient';

interface IPrice {
  elPrice: BigNumber,
  ethPrice: BigNumber,
  bnbPrice:BigNumber,
  loaded: boolean
}
export function usePriceLoader(
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



function usePrice(): IPrice {
  const [prices, setPrices] = useState<{ elPrice: BigNumber, ethPrice: BigNumber,bnbPrice:BigNumber, loaded: boolean }>({
    elPrice: constants.One,
    ethPrice: constants.One,
    bnbPrice: constants.One,
    loaded: false,
  })

  // const elPriceOracle = useContract(process.env.REACT_APP_EL_PRICE_ORACLE_ADDRESS, PRICE_ORACLE_ABI, false)
  // const ethPriceOracle = useContract(process.env.REACT_APP_ETH_PRICE_ORACLE_ADDRESS, PRICE_ORACLE_ABI, false)


  const loadPrices = async () => {
    try {
      const coingeckoClient = await CoingeckoClient.getElAndEthPrice();
      setPrices({
        elPrice: utils.parseEther(coingeckoClient.data.elysia.usd.toString()),
        ethPrice: utils.parseEther(coingeckoClient.data.ethereum.usd.toString()),
        bnbPrice: utils.parseEther(coingeckoClient.data.binancecoin.usd.toString()),
        loaded: true,
      })
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
      loadPrices();
  }, [])

  return prices;
}

export default usePrice