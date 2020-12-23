import { useEffect, useState } from 'react'
import { getElPrice } from '../core/clients/CoingeckoClient'

// returns null on errors
function useElPrice(): number {
  const [elPrice, setElPrice] = useState<number>(0.3);

  useEffect(() => {
    getElPrice().then((res) => {
      setElPrice(res.data.elysia.usd)
    })
  }, [])

  return elPrice;
}

export default useElPrice;