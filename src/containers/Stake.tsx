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
import useContract, {
  useElysiaToken,
  useElfiToken,
} from '../hooks/useContract';
import Loading from '../components/Loading';
import TxStatus from '../core/enums/TxStatus';
import ConfirmationList from '../components/ConfirmationList';
import usePrice from '../hooks/usePrice';
import PaymentMethod from '../core/types/PaymentMethod';
import useChainId from '../hooks/useChainId';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';
import ApproveStep from '../components/ApproveStep';
import AppFonts from '../core/enums/AppFonts';
import AppColors from '../core/enums/AppColors';
import TransferType from '../core/enums/TransferType';
import { saveTxData } from '../core/utils/saveTxData';

const Stake: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({
  transactionRequest,
}) => {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const [state, setState] = useState({
    stage: RequestStage.INIT,
    error: false,
    txHash: '',
  });
  const txResult = useWatingTx(state.txHash);
  const chainId = useChainId();
  const elToken = useElysiaToken();
  const elfiToken = useElfiToken();
  const tokenContract = transactionRequest.unit === 'EL' ? elToken : elfiToken;
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );
  const { elPrice, elfiPrice } = usePrice();
  const price =
    transactionRequest.unit?.toLowerCase() === PaymentMethod.EL
      ? elPrice
      : elfiPrice;

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
          stage: res.gte(utils.parseEther(transactionRequest.value || '0'))
            ? RequestStage.CONFIRM
            : RequestStage.ALLOWANCE_RETRY,
        });
      });
  };

  const createTransaction = () => {
    stakingPoolContract?.populateTransaction
      .stake(utils.parseEther(transactionRequest.value || '0'))
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
        if (nextStage !== RequestStage.ALLOWANCE_PENDING) {
          const { uuid, value, unit } = transactionRequest;
          saveTxData(uuid!, TransferType.Staking, unit!, txHash, value!);
        }
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
    if (chainId) {
      if (chainId === process.env.REACT_APP_ETH_NETWORK) {
        Swal.close();
      } else {
        changeEthNet(library).then(() => {
          Swal.close();
        });
      }

      setState({
        ...state,
        stage: RequestStage.INIT,
      });
    }
  }, [chainId]);

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
        if (!isValidChainId(transactionRequest.unit || '', chainId)) {
          alert(t('Error.InvalidNetwork'));
          changeEthNet(library).then(() => {
            setState({
              ...state,
              stage: RequestStage.INIT,
            });
          });
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
        SwalWithReact.fire({
          html: (
            <ApproveStep
              isApproved={false}
              paymentMethod={transactionRequest.unit?.toLowerCase()}
            />
          ),
          confirmButtonText: t('Buying.Transaction'),
          showCloseButton: true,
        }).then(res => {
          if (res.isConfirmed) {
            approve();
          }
        });
        break;
      case RequestStage.CONFIRM:
        SwalWithReact.fire({
          html: (
            <ApproveStep
              isApproved={true}
              list={[
                {
                  label: t('Staking.StakingRound'),
                  value: t('Staking.RoundWithAffix', {
                    round: transactionRequest.round,
                  }),
                },
                {
                  label: t('Staking.StakingAmount'),
                  value: `${transactionRequest.value} ${transactionRequest.unit}`,
                  subvalue: `$ ${(
                    parseFloat(transactionRequest.value || '0') *
                    parseFloat(utils.formatEther(price))
                  ).toFixed(2)}`,
                },
              ]}
              paymentMethod={transactionRequest.unit?.toLowerCase()}
            />
          ),
          confirmButtonText: t('Buying.Transaction'),
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
          html: `<div style="font-size:15px;">${t(
            'Completion.TransactionSuccess',
          )}</div>`,
          showConfirmButton: false,
          icon: 'success',
          iconColor: '#3679B5',
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
              ? RequestStage.CONFIRM
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
          <h1
            style={{
              fontSize: 22,
              color: AppColors.BLACK,
              marginTop: 10,
              marginBottom: 24,
              fontFamily: AppFonts.Regular,
              fontWeight: 700,
            }}
          >
            {t('Staking.StakingTitle', { unit: transactionRequest.unit })}
          </h1>
          <ConfirmationList
            list={[
              {
                label: t('Staking.StakingRound'),
                value: t('Staking.RoundWithAffix', {
                  round: transactionRequest.round,
                }),
              },
              {
                label: t('Staking.StakingAmount'),
                value: `${transactionRequest.value} ${transactionRequest.unit}`,
                subvalue: `$ ${(
                  parseFloat(transactionRequest.value || '0') *
                  parseFloat(utils.formatEther(price))
                ).toFixed(2)}`,
              },
            ]}
          />
        </div>
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <Button
            style={{ borderRadius: 5 }}
            clickHandler={() => {
              account && String(transactionRequest.userAddress) !== account
                ? checkAccount()
                : setState({ ...state, stage: RequestStage.NETWORK_CHECK });
            }}
            title={t('Buying.TransactionRetryButton')}
          />
        </div>
      </BoxLayout>
    );
  }
};

export default Stake;
