import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber, utils } from 'ethers';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import Swal, { RetrySwal } from '../core/utils/Swal';
import { changeEthNet, isValidChainId } from '../core/utils/createNetwork';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';
import ConfirmationList from '../components/ConfirmationList';
import usePrice from '../hooks/usePrice';
import PaymentMethod from '../core/types/PaymentMethod';
import useChainId from '../hooks/useChainId';

const UnstakeAndMigrate: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );
  const chainId = useChainId();
  const { elPrice, elfiPrice, daiPrice } = usePrice();
  const [currentRound, setCurrentRound] = useState(1);
  stakingPoolContract?.currentRound().then((res: any) => {
    setCurrentRound(res);
  });
  const rewardUnit = transactionRequest.unit?.toLowerCase() === PaymentMethod.EL
    ? PaymentMethod.ELFI.toUpperCase()
    : PaymentMethod.DAI.toUpperCase();
  const price = transactionRequest.unit?.toLowerCase() === PaymentMethod.EL
    ? elPrice
    : elfiPrice;
  const rewardPrice = transactionRequest.unit?.toLowerCase() === PaymentMethod.EL
  ? elfiPrice
  : daiPrice;

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
          html: `<div style="font-size:15px;">${t('Completion.TransactionSuccess')}</div>`,
          showConfirmButton: false,
          icon: 'success',
          iconColor: '#3679B5',
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
    if(!chainId) return;
    createNetwork();
    Swal.close();
  }, [account, chainId]);

  if (!account) {
    return <ConnectWallet handler={() => activate(InjectedConnector)} />;
  } else {
    return (
      <BoxLayout>
        <div style={{ padding: 20 }}>
          <h1 style={{
            fontSize: 22,
            color: '#1C1C1C',
            marginTop: 10,
            marginBottom: 24,
            fontFamily: 'Spoqa Han Sans',
            fontWeight: 700,
            }}>
            {t('Staking.Transaction')}
          </h1>
          <ConfirmationList
            list={[
              {
                label: t('Staking.UnstakingRound'),
                value: t('Staking.RoundWithAffix', { round: transactionRequest.round }),
              },
              {
                label: t('Staking.UnstakingAmount'),
                value: `${transactionRequest.value} ${transactionRequest.unit}`,
                subvalue: `$ ${(parseFloat(transactionRequest.value || '0') * parseFloat(utils.formatEther(price))).toFixed(2)}`,
              },
              {
                label: t('Staking.MigrationRound'),
                value: `${t('Staking.RoundWithAffix', { round: transactionRequest.round })} → ${t('Staking.RoundWithAffix', { round: currentRound })}`,
              },
              {
                label: t('Staking.MigrationAmount'),
                value: `${transactionRequest.migrationValue} ${transactionRequest.unit}`,
                subvalue: `$ ${(parseFloat(transactionRequest.migrationValue || '0') * parseFloat(utils.formatEther(price))).toFixed(2)}`,
              },
              {
                label: t('Staking.RewardAmount'),
                value: `${transactionRequest.rewardValue} ${rewardUnit}`,
                subvalue: `$ ${(parseFloat(transactionRequest.rewardValue || '0') * parseFloat(utils.formatEther(rewardPrice))).toFixed(2)}`,
              }
            ]}
          />
        </div>
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
        }}>
          <Button
            style={{ borderRadius: 5 }}
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
}

export default UnstakeAndMigrate;
