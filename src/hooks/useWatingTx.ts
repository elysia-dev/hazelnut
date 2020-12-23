import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react'
import TxStatus from '../core/enums/TxStatus';

type TxResult = {
  status: TxStatus,
  error: string,
}

export function useWatingTx(txHash: string): TxResult {
  const { library } = useWeb3React();
  const [state, setState] = useState<{ status: TxStatus, error: string, counter: number }>(
    { status: TxStatus.NONE, error: "", counter: 0 }
  );

  useEffect(() => {
    if (txHash) {
      setState({
        status: TxStatus.PENDING,
        error: "",
        counter: state.counter + 1,
      })
    }
  }, [txHash])

  useEffect(() => {
    if (state.status !== TxStatus.PENDING) {
      return;
    }

    let timer = setTimeout(() => {
      library?.getTransactionReceipt(txHash).then((res: any) => {
        if (res && res.status === 1) {
          setState({
            ...state,
            status: TxStatus.SUCCESS,
          });
        } else if (res && res.status !== 1) {
          setState({
            ...state,
            status: TxStatus.FAIL,
            error: 'Transaction is failed',
          });
        } else {
          setState({
            ...state,
            counter: state.counter + 1
          })
        }
      }).catch((e: any) =>
        setState({
          ...state,
          status: TxStatus.FAIL,
          error: e.toString(),
        })
      )
    }, 2000)

    return () => {
      clearTimeout(timer);
    }
  }, [state.counter])

  return {
    status: state.status,
    error: state.error,
  };
}