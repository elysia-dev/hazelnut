import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { StakingPool__factory } from '@elysia-dev/contract-typechain';

const useStakingPool = (address: string) => {
	const { library } = useWeb3React();
	const contract = useMemo(() => {
    if (!address || !library) return null;
		return StakingPool__factory.connect(
			address,
			library.getSigner(),
		);
	}, [library, address]);

	return contract;
}

export default useStakingPool;
