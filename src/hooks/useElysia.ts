import { Contract } from '@ethersproject/contracts';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react'

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

