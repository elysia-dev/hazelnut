import { BigNumber, constants, utils } from 'ethers';
import { useEffect, useState } from "react";
import useContract from "./useContract";
import CoingeckoClient from '../api/CoingeckoClient';
import UniswapClient from '../api/UniswapClient';

interface IPrice {
  elPrice: BigNumber,
  ethPrice: BigNumber,
  bnbPrice:BigNumber,
  elfiPrice: BigNumber,
  daiPrice: BigNumber,
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
  const [prices, setPrices] = useState<{ elPrice: BigNumber, ethPrice: BigNumber, bnbPrice:BigNumber, elfiPrice: BigNumber, daiPrice: BigNumber, loaded: boolean }>({
    elPrice: constants.One,
    ethPrice: constants.One,
    bnbPrice: constants.One,
    elfiPrice: constants.One,
    daiPrice: constants.One,
    loaded: false,
  })

  const loadPrices = async () => {
    try {
      const coingeckoClient = await CoingeckoClient.getElAndEthPrice();
      const uniswapClient = await UniswapClient.getELFIPRice();

      setPrices({
        elPrice: utils.parseEther(coingeckoClient.data.elysia.usd.toString()),
        ethPrice: utils.parseEther(coingeckoClient.data.ethereum.usd.toString()),
        bnbPrice: utils.parseEther(coingeckoClient.data.binancecoin.usd.toString()),
        elfiPrice: utils.parseEther(
          parseFloat(uniswapClient.data.data.token.tokenDayData[0].priceUSD).toFixed(10),
        ),
        daiPrice: utils.parseEther(coingeckoClient.data.dai.usd.toString()),
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

export default usePrice;
