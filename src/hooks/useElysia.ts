import { Contract } from '@ethersproject/contracts';
import { BigNumberish, constants } from 'ethers';
import { useEffect, useState } from 'react';

export function useTotalSupply(contract: Contract | null): BigNumberish {
  const [totalSupply, setTotalSupply] = useState<BigNumberish>(constants.Zero);

  useEffect(() => {
    contract?.totalSupply().then((supply: BigNumberish) => {
      setTotalSupply(supply);
    });
  }, [contract]);

  return totalSupply;
}
