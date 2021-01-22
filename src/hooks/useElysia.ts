import { Contract } from '@ethersproject/contracts';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react'
import { getElPrice, getEthPrice } from '../core/clients/CoingeckoClient'

export function useElPrice(): number {
  const [price, setPrice] = useState<number>(0.3);

  useEffect(() => {
    getElPrice().then((res) => {
      setPrice(res.data.elysia.usd)
    })
  }, [])

  return price;
}

export function useEthPrice(): number {
  const [price, setPrice] = useState<number>(0.3);

  useEffect(() => {
    getEthPrice().then((res) => {
      setPrice(res.data.ethereum.usd)
    })
  }, [])

  return price;
}

export function useTotalSupply(contract: Contract | null): BigNumber {
  const [totalSupply, setTotalSupply] = useState<BigNumber>(new BigNumber(0));

  useEffect(() => {
    contract?.totalSupply().then((res: BigNumber) => {
      const supply = new BigNumber(res.toString());
      setTotalSupply(supply);
    });

  }, [contract])

  return totalSupply;
}

