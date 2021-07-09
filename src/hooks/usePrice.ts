import React from 'react'
import { BigNumber, constants } from 'ethers';
import { useEffect, useState } from "react";
import PRICE_ORACLE_ABI from '../core/constants/abis/price-oracle.json';
import useContract from "./useContract";

interface IPrice {
  elPrice: BigNumber,
  ethPrice: BigNumber,
  loaded: boolean
}

function usePrice(): IPrice {
  const [prices, setPrices] = useState<{ elPrice: BigNumber, ethPrice: BigNumber, loaded: boolean }>({
    elPrice: constants.One,
    ethPrice: constants.One,
    loaded: false,
  })

  const elPriceOracle = useContract(process.env.REACT_APP_EL_PRICE_ORACLE_ADDRESS, PRICE_ORACLE_ABI, false)
  const ethPriceOracle = useContract(process.env.REACT_APP_ETH_PRICE_ORACLE_ADDRESS, PRICE_ORACLE_ABI, false)

  const loadPrices = async () => {
    try {
      setPrices({
        elPrice: (await elPriceOracle!.getPrice()) as BigNumber,
        ethPrice: (await ethPriceOracle!.getPrice()) as BigNumber,
        loaded: true,
      })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (elPriceOracle && ethPriceOracle) {
      loadPrices();
    }
  }, [elPriceOracle, ethPriceOracle])

  return prices;
}

export default usePrice