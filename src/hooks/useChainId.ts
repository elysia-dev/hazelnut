import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

function useChainId() {
  const [chainId, setChainId] = useState<string>('');
  const { library } = useWeb3React();

  useEffect(() => {
    library?.provider.request({ method: 'eth_chainId' })
    .then((res: any) => setChainId(res));
  }, [library]);

  return chainId;
}

export default useChainId;
