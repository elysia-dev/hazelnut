import React, { useEffect } from 'react';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { utils } from 'ethers';
import InjectedConnector from '../core/connectors/InjectedConnector';
import ConnectWallet from '../components/ConnectWallet';
import BoxLayout from '../components/BoxLayout';
import Swal, { RetrySwal } from '../core/utils/Swal';
import Button from '../components/Button';
import { changeEthNet, isValidChainId } from '../core/utils/createNetwork';
import ConfirmationList from '../components/ConfirmationList';
import usePrice from '../hooks/usePrice';
import PaymentMethod from '../core/types/PaymentMethod';
import useChainId from '../hooks/useChainId';
import { PopulatedTransaction } from '@ethersproject/contracts';
import useContract from '../hooks/useContract';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';
import AppFonts from '../core/enums/AppFonts';
import AppColors from '../core/enums/AppColors';

const Reward: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({
  transactionRequest,
}) => {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const chainId = useChainId();
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );
  const { elfiPrice, daiPrice } = usePrice();
  const price =
    transactionRequest.unit?.toLowerCase() === PaymentMethod.ELFI
      ? elfiPrice
      : daiPrice;

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
    if (!isValidChainId(transactionRequest.unit || '', chainId)) {
      alert(t('Error.InvalidNetwork'));
      changeEthNet(library).then(() => {
        return;
      });
    }

    stakingPoolContract?.populateTransaction
      .claim(transactionRequest.round)
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
          html: `<div style="font-size:15px;">${t(
            'Completion.TransactionSuccess',
          )}</div>`,
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
    if (chainId) {
      if (chainId === process.env.REACT_APP_ETH_NETWORK) {
        Swal.close();
      } else {
        changeEthNet(library).then(() => {
          Swal.close();
        });
      }
    }
  }, [chainId]);

  if (!account) {
    return <ConnectWallet handler={() => activate(InjectedConnector)} />;
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
            {t('Staking.RewardTitle', { unit: transactionRequest.unit })}
          </h1>
          <ConfirmationList
            list={[
              {
                label: t('Staking.RewardRound'),
                value: t('Staking.RoundWithAffix', {
                  round: transactionRequest.round,
                }),
              },
              {
                label: t('Staking.RewardAmount'),
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
                : createTransaction();
            }}
            title={t('Buying.TransactionRetryButton')}
          />
        </div>
      </BoxLayout>
    );
  }
};

export default Reward;
