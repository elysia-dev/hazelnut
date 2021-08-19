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
import Swal, { RetrySwal, SwalWithReact } from '../core/utils/Swal';
import { useWatingTx } from '../hooks/useWatingTx';
import { isValidChainId, changeEthNet } from '../core/utils/createNetwork';
import useContract, { useElysiaToken, useElfiToken } from '../hooks/useContract';
import Loading from '../components/Loading';
import TxStatus from '../core/enums/TxStatus';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';
import BuyingSuccess from './../images/success_buying.svg'; // 근데 다른 이미지 써야 할 듯...
import ConfirmationList from '../components/ConfirmationList';
import usePrice from '../hooks/usePrice';

const Stake: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
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
  const { elPrice } = usePrice();

  const currentChainId = async () => {
    setChainId(await library.provider.request({
      method: 'eth_chainId'
    }));
  };

  const networkCheck = () => {
    return isValidChainId(
      transactionRequest.unit || '',
      chainId,
    );
  };

  const createNetwork = async () => {
    if (chainId === process.env.REACT_APP_ETH_NETWORK) return;
    await changeEthNet(library);
    setState({
      ...state,
      stage: RequestStage.INIT,
    });
    currentChainId();
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
    stakingPoolContract?.populateTransaction
      .stake(BigNumber.from(transactionRequest.value))
      .then(populatedTransaction => {
        sendTransaction(
          populatedTransaction,
          RequestStage.TRANSACTION_PENDING,
          RequestStage.TRANSACTION_RETRY,
        );
      });
  };

  const approve = () => {
    tokenContract?.populateTransaction
      .approve(transactionRequest.contractAddress, constants.MaxUint256)
      .then(populatedTransaction => {
        sendTransaction(
          populatedTransaction,
          RequestStage.ALLOWANCE_PENDING,
          RequestStage.ALLOWANCE_CHECK,
        );
      });
  };

  const sendTransaction = (
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
        Swal.fire({
          title: t('Completion.Title'),
          html: `<div style="font-size:15px;"> ${t('Completion.StakingResult', {
            stakingTokenType: transactionRequest.unit,
            amount: transactionRequest.value,
          })}<br />${t('Completion.Notice')}</div>
          `,
          showConfirmButton: false,
          imageUrl: BuyingSuccess,
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
      <BoxLayout>
        <div style={{ padding: 20 }}>
          <h1 style={{ fontSize: 22, color: '#1C1C1C' }}>
            {`${transactionRequest.unit} 스테이킹`}
          </h1>
          <ConfirmationList
            list={[
              {
                label: '스테이킹 회차',
                value: `${transactionRequest.round}차`,
              },
              {
                label: '스테이킹 수량',
                value: `${transactionRequest.value} ${transactionRequest.unit}`,
                subvalue: `$ ${parseFloat(transactionRequest.value || '0') * parseFloat(utils.formatEther(elPrice))}`,
              }
            ]}
          />
          <Button
            style={{ marginTop: 20 }}
            clickHandler={() => {
              account &&
              String(transactionRequest.userAddress) !== account
                ? checkAccount()
                : setState({ ...state, stage: RequestStage.NETWORK_CHECK });
            }}
            title={t('Buying.TransactionRetryButton')}
          />
        </div>
      </BoxLayout>
    );
  }
}

export default Stake;
