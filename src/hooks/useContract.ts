import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import getContract from '../core/utils/getContract'
import { useWeb3React } from '@web3-react/core'
import ERC20_ABI from '../core/constants/abis/erc20.json';

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useWeb3React<Web3Provider>()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useElysiaToken(): Contract | null {
  return useContract(process.env.REACT_APP_ELYSIA_TOKEN_ADDRESS, ERC20_ABI, false)
}

export default useContract