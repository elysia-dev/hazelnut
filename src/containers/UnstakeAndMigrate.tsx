import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber, utils } from 'ethers';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract, { useElysiaToken, useElfiToken } from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import AddressBottomTab from '../components/AddressBottomTab';
import Swal, { RetrySwal } from '../core/utils/Swal';
import RefundSuccess from './../images/success_refund.svg';
import { changeEthNet, isValidChainId } from '../core/utils/createNetwork';
import PaymentMethod from '../core/types/PaymentMethod';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';
import ConfirmationList from '../components/ConfirmationList';
import usePrice from '../hooks/usePrice';

const UnstakeAndMigrate: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );
  const [chainId, setChainId] = useState<string>('');
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

  const createTransaction = () => {
    if(!networkCheck()){
      createNetwork();
      return;
    }

    stakingPoolContract?.populateTransaction
      .migrate(
        BigNumber.from(transactionRequest.value),
        transactionRequest.round
      )
      .then(populatedTransaction => {
        sendTransaction(populatedTransaction);
      });
  };

  const sendTransaction = (populatedTransaction: PopulatedTransaction) => {
    library.provider
      .request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: populatedTransaction.to,
            from: account,
            data: populatedTransaction.data,
          },
        ],
      })
      .then(() => {
        Swal.fire({
          title: t('Completion.Title'),
          html: `<div style="font-size: 15px;"> ${t('Completion.MigrationResult', {
            stakingTokenType: transactionRequest.unit,
            amount: transactionRequest.value,
            round: transactionRequest.round,
          })}<br />${t('Completion.Notice')}</div>
          `,
          imageUrl: RefundSuccess,
          imageWidth: 275,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      })
      .catch(() => {
        Swal.fire({
          text: t('Error.TransactionCancled'),
          icon: 'error',
          confirmButtonText: t('Buying.TransactionRetryButton'),
          showCloseButton: true,
        }).then(res => {
          if (res.isConfirmed) {
            createTransaction();
          }
        });
      });
  };

  useEffect(() => {
    if (!account && !chainId) return;
    currentChainId();
    if(!chainId) return;
    createNetwork();
    // Swal.close();
  }, [account, chainId]);

  if (!account) {
    return <ConnectWallet handler={() => activate(InjectedConnector)} />;
  } else {
    return (
      <BoxLayout>
        <div style={{ padding: 20 }}>
          <h1 style={{ fontSize: 22, color: '#1C1C1C' }}>
            {'트랜잭션'}
          </h1>
          <ConfirmationList
            list={[
              {
                label: '언스테이킹 회차',
                value: `${transactionRequest.round}차`,
              },
              {
                label: '언스테이킹 수량',
                value: `${transactionRequest.value} ${transactionRequest.unit}`,
                subvalue: `$ ${parseFloat(transactionRequest.value || '0') * parseFloat(utils.formatEther(elPrice))}`,
              },
              {
                label: '마이그레이션 회차',
                value: `${transactionRequest.round}차 → ${transactionRequest.round}차`,
              },
              {
                label: '마이그레이션 수량',
                value: `${transactionRequest.migrationValue} ${transactionRequest.unit}`,
                subvalue: `$ ${parseFloat(transactionRequest.migrationValue || '0') * parseFloat(utils.formatEther(elPrice))}`,
              },
              {
                label: '보상 수량',
                value: `${transactionRequest.rewardValue} ELFI!!!!`
              }
            ]}
          />
          <Button
            style={{ marginTop: 20 }}
            clickHandler={() => {
              account &&
              String(transactionRequest.userAddress) !== account
                ? checkAccount()
                : createTransaction();
            }}
            title={t('Buying.TransactionRetryButton')}
          />
        </div>
      </BoxLayout>
    );
  }

  // return (
  //   <div>
  //     <h1>UnstakeAndMigrate</h1>
  //     <div>{transactionRequest.value}</div>
  //     <div>{transactionRequest.type}</div>
  //     <div>{transactionRequest.unit}</div>
  //     <div>{transactionRequest.round}</div>
  //     <div>{transactionRequest.contractAddress}</div>
  //     <div>{transactionRequest.userAddress}</div>
  //     <div>{transactionRequest.language}</div>
  //     <div>{transactionRequest.rewardValue}</div>
  //     <div>{transactionRequest.migrationValue}</div>
  //   </div>
  // );
}

export default UnstakeAndMigrate;
