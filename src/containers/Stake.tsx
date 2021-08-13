import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, constants, utils } from 'ethers';
import { PopulatedTransaction } from '@ethersproject/contracts';
import InjectedConnector from '../core/connectors/InjectedConnector';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import RequestStage from '../core/enums/RequestStage';
import ServerError from '../components/errors/ServerError';
import ConnectWallet from '../components/ConnectWallet';
import BoxLayout from '../components/BoxLayout';
import Button from '../components/Button';
import AddressBottomTab from '../components/AddressBottomTab';
import Swal, { RetrySwal, SwalWithReact } from '../core/utils/Swal';
import { useWatingTx } from '../hooks/useWatingTx';
import { isValidChainId, changeEthNet } from '../core/utils/createNetwork';
import useContract, { useElysiaToken, useElfiToken } from '../hooks/useContract';
import Loading from '../components/Loading';
import TxStatus from '../core/enums/TxStatus';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';

const Stake: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  // return (
  //   <div>
  //     <h1>Stake</h1>
  //     <div>{transactionRequest.value}</div>
  //     <div>{transactionRequest.type}</div>
  //     <div>{transactionRequest.contractAddress}</div>
  //     <div>{transactionRequest.ethAddresses}</div> // ethAddresses -> userAddresses로 바꿔야 함!!!! ㅜㅜ
  //     <div>{transactionRequest.language}</div>
  //     <div>{transactionRequest.rewardValue}</div>
  //     <div>{transactionRequest.migrationValue}</div>
  //   </div>
  // );

  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const [state, setState] = useState({
    stage: RequestStage.INIT,
    error: false,
    txHash: '',
  });
  const txResult = useWatingTx(state.txHash);
  const [chainId, setChainId] = useState<string>('');
  const elToken = useElysiaToken();
  const elfiToken = useElfiToken();
  const tokenContract = transactionRequest.unit === 'EL' ? elToken : elfiToken;
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );

  const currentChainId = async () => {
    const id =  await library.provider.request({
      method: 'eth_chainId'
    })
    setChainId(() => id);
  };

  const networkCheck = () => {
    return isValidChainId(
      transactionRequest.unit || '',
      chainId,
    );
  };

  const createNetwork = async () => {
    // let network: Promise<void> | undefined;
    // if (props.transactionRequest.product.paymentMethod === PaymentMethod.BNB) {
    //   if(chainId === process.env.REACT_APP_BNB_NETWORK) return;
    //   network = createBnbNet(library);
    // } else {
      if (chainId === process.env.REACT_APP_ETH_NETWORK) return;
      // network = changeEthNet(library);
      // const network = changeEthNet(library);
      await changeEthNet(library);
      setState({
        ...state,
        stage: RequestStage.INIT,
      });
      currentChainId();
    // }
    // try {
    //   // if(!(chainId === process.env.REACT_APP_ETH_NETWORK) && window.ethereum?.isImToken) {
    //   //     throw Error;
    //   // }
    //   await network;
    // } catch (switchChainError) {
    //   // if (
    //   //   !(
    //   //     props.transactionRequest.product.paymentMethod === PaymentMethod.EL ||
    //   //     props.transactionRequest.product.paymentMethod === PaymentMethod.ETH
    //   //   )
    //   // ) {
    //   //   return;
    //   // }
    //   network = createEthNet(library);
    //   try {
    //     await network;
    //   } catch (error) {
    //     console.error(error);
    //   }
    // } finally {
    //   setState({
    //     ...state,
    //     stage: RequestStage.INIT,
    //   });
    //   currentChainId();
    // }
  };

  const checkAccount = () => {
    RetrySwal.fire({
      html: `<div style="font-size:15px; margin-top: 20px;">
        ${t('Error.CheckAccount')}
        </div>`,
      icon: 'info',
      confirmButtonText: t('Error.Check'),
      showCloseButton: true,
    });
  };

  const checkAllowance = () => {
    // if (
    //   props.transactionRequest.product.paymentMethod === PaymentMethod.ETH ||
    //   props.transactionRequest.product.paymentMethod === PaymentMethod.BNB
    // ) {
    //   setState({
    //     ...state,
    //     stage: RequestStage.TRANSACTION,
    //   });

    //   return;
    // }

    tokenContract
      ?.allowance(account, transactionRequest.contractAddress)
      .then((res: BigNumber) => {
        setState({
          ...state,
          stage: res.gte(transactionRequest.value || '')
            ? RequestStage.TRANSACTION
            : RequestStage.ALLOWANCE_RETRY,
        });
      });
  };

  const createTransaction = () => {
    // if (
    //   props.transactionRequest.product.paymentMethod === PaymentMethod.ETH ||
    //   props.transactionRequest.product.paymentMethod === PaymentMethod.BNB
    // ) {
    //   assetToken?.populateTransaction
    //     .purchase()
    //     .then(populatedTransaction => {
    //       let expectedValueHex = expectedValue.value.toHexString()
    //       const hexString = expectedValueHex[2] === '0'
    //           ? expectedValueHex.substr(3)
    //           : expectedValueHex;
    //       sendTx(
    //         populatedTransaction,
    //         RequestStage.TRANSACTION_RESULT,
    //         RequestStage.TRANSACTION_RETRY,
    //         hexString,
    //       );
    //     })
    // } else {
      stakingPoolContract?.populateTransaction
        .stake(BigNumber.from(transactionRequest.value).toHexString())
        .then(populatedTransaction => {
          sendTx(
            populatedTransaction,
            RequestStage.TRANSACTION_PENDING,
            RequestStage.TRANSACTION_RETRY,
          );
        });
    // }
  };

  const approve = () => {
    tokenContract?.populateTransaction
      .approve(transactionRequest.contractAddress, constants.MaxUint256)
      .then(populatedTransaction => {
        sendTx(
          populatedTransaction,
          RequestStage.ALLOWANCE_PENDING,
          RequestStage.ALLOWANCE_CHECK,
        );
      });
  };

  const sendTx = (
    populatedTransaction: PopulatedTransaction,
    nextStage: RequestStage,
    prevStage: RequestStage,
    value?: string,
  ) => {
    library.provider
      .request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: populatedTransaction.to,
            from: account,
            data: populatedTransaction.data,
            value: value,
          },
        ],
      })
      .then((txHash: string) => {
        setState({
          ...state,
          stage: nextStage,
          txHash,
        });
      })
      .catch((error: any) => {
        console.error(error);
        setState({
          ...state,
          stage: prevStage,
        });
      });
  };

  useEffect(() => {
    if (!account && !chainId) return;
    currentChainId();
    if(!chainId) return;
    createNetwork();
    Swal.close();

    setState({
      ...state,
      stage: RequestStage.INIT,
    });
  }, [account, chainId]);

  useEffect(() => {
    switch (state.stage) {
      case RequestStage.ALLOWANCE_PENDING:
      case RequestStage.TRANSACTION_PENDING:
        SwalWithReact.fire({
          html: <Loading />,
          title: t(`Buying.${state.stage}`),
          showConfirmButton: false,
        });
        break;
      case RequestStage.NETWORK_CHECK:
        if (!networkCheck()) {
          createNetwork();
        } else {
          setState({
            ...state,
            stage: RequestStage.ALLOWANCE_CHECK,
          });
        }
        break;
      case RequestStage.ALLOWANCE_CHECK:
        SwalWithReact.fire({
          html: <Loading />,
          title: t(`Buying.${state.stage}`),
          showConfirmButton: false,
        });
        account && checkAllowance();
        break;
      case RequestStage.ALLOWANCE_RETRY:
        RetrySwal.fire({
          html: `<div style="font-size:15px; margin-top: 20px;"> ${t(
            'Buying.AllowanceRetry',
          )}</div>`,
          icon: 'info',
          confirmButtonText: t('Buying.TransactionRetryButton'),
          showCloseButton: true,
        }).then(res => {
          if (res.isConfirmed) {
            approve();
          }
        });
        break;
      case RequestStage.TRANSACTION_RETRY:
        RetrySwal.fire({
          text: t('Buying.TransactionRetry'),
          icon: 'error',
          confirmButtonText: t('Retry'),
          showCloseButton: true,
        }).then(res => {
          if (res.isConfirmed) {
            setState({
              ...state,
              stage: RequestStage.TRANSACTION,
            });
          }
        });
        break;
      case RequestStage.TRANSACTION:
        SwalWithReact.close();
        account && createTransaction();
        break;
      case RequestStage.TRANSACTION_RESULT:
        // completeTransactionRequest(id, state.txHash);
        Swal.fire({
          title: t('Completion.Title'),
          // html: `<div style="font-size:15px;"> ${t('Completion.BuyingResult', {
          //   product: props.transactionRequest.product.title,
          //   value:
          //     totalSupply.toString() !== '0'
          //       ? (
          //           (props.transactionRequest.amount /
          //             parseFloat(formatEther(totalSupply))) *
          //           100
          //         ).toFixed(2)
          //       : '--',
          // })}<br />${t('Completion.Notice')}</div>
          // `,
          showConfirmButton: false,
          // imageUrl: BuyingSuccess,
          imageWidth: 275,
          allowOutsideClick: false,
        });
        break;
      default:
        return;
    }
  }, [state.stage]);

  useEffect(() => {
    if (![TxStatus.SUCCESS, TxStatus.FAIL].includes(txResult.status)) return;

    switch (state.stage) {
      case RequestStage.ALLOWANCE_PENDING:
        setState({
          ...state,
          stage:
            txResult.status === TxStatus.SUCCESS
              ? RequestStage.TRANSACTION
              : RequestStage.ALLOWANCE_RETRY,
        });
        break;
      case RequestStage.TRANSACTION_PENDING:
        setState({
          ...state,
          stage:
            txResult.status === TxStatus.SUCCESS
              ? RequestStage.TRANSACTION_RESULT
              : RequestStage.TRANSACTION_RETRY,
        });
        break;
    }
  }, [txResult.status]);

  if (state.error) {
    return <ServerError />;
  } else if (!account) {
    return (
      <ConnectWallet
        handler={() => {
          activate(InjectedConnector);
        }}
      />
    );
  } else {
    return (
      <div>
        <BoxLayout>
          <div style={{ padding: 20 }}>
            <Button
              style={{ marginTop: 20 }}
              clickHandler={() => {
                account &&
                String(transactionRequest.userAddress) !== account
                  ? checkAccount()
                  : setState({ ...state, stage: RequestStage.NETWORK_CHECK });
              }}
              title={t('Buying.TransactionRetryButton')}
              // disabled={!expectedValue.loaded}
            />
          </div>
        </BoxLayout>
        <AddressBottomTab
          chainId={process.env.REACT_APP_ETH_NETWORK}
          paymentMethod={transactionRequest.unit || ''}
        />
      </div>
    );
  }
}

export default Stake;
