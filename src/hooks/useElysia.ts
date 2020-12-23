import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react'
import { getElPrice } from '../core/clients/CoingeckoClient'
import { useAssetToken } from './useContract';

export function useElPrice(): number {
  const [price, setPrice] = useState<number>(0.3);

  useEffect(() => {
    getElPrice().then((res) => {
      setPrice(res.data.elysia.usd)
    })
  }, [])

  return price;
}

export function useTotalSupply(address: string): BigNumber {
  const [totalSupply, setTotalSupply] = useState<BigNumber>(new BigNumber(0));
  const assetToken = useAssetToken(address);

  useEffect(() => {
    assetToken?.totalSupply().then((res: BigNumber) => {
      const supply = new BigNumber(res.toString());
      setTotalSupply(supply);
    });

  }, [assetToken])

  return totalSupply;
}

