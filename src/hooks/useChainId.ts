import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';

function useChainId() {
  const [chainId, setChainId] = useState<string>('');
  const { library } = useWeb3React();

  if (library) { // 지갑에 연결되면
    library.provider.request({ method: 'eth_chainId' })
    .then((res: any) => setChainId(res));
  }

  return chainId;
}

export default useChainId;
