import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import InjectedConnector from '../core/connectors/InjectedConnector';
import ConnectWallet from '../components/ConnectWallet';
import Button from '../components/Button';
import BoxLayout from '../components/BoxLayout';
import Swal, { RetrySwal } from '../core/utils/Swal';
import { changeEthNet, isValidChainId } from '../core/utils/createNetwork';
import ConfirmationList from '../components/ConfirmationList';
import usePrice from '../hooks/usePrice';
import PaymentMethod from '../core/types/PaymentMethod';
import useChainId from '../hooks/useChainId';
import { PopulatedTransaction } from '@ethersproject/contracts';
import useContract from '../hooks/useContract';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';
import AppColors from '../core/enums/AppColors';
import AppFonts from '../core/enums/AppFonts';

const Unstake: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({
  transactionRequest,
}) => {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );
  const chainId = useChainId();
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

  const createTransaction = () => {
    if (!isValidChainId(transactionRequest.unit || '', chainId)) {
      alert(t('Error.InvalidNetwork'));
      changeEthNet(library).then(() => {
        return;
      });
    }

    stakingPoolContract?.populateTransaction
      .withdraw(
        utils.parseEther(transactionRequest.value || '0'),
        transactionRequest.contractAddress ===
          process.env.REACT_APP_ELFI_STAKING_POOL_V2_ADDRESS
          ? Number(transactionRequest.round) - 2
          : transactionRequest.round,
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
            {t('Staking.UnstakingTitle', { unit: transactionRequest.unit })}
          </h1>
          <ConfirmationList
            list={[
              {
                label: t('Staking.UnstakingRound'),
                value: t('Staking.RoundWithAffix', {
                  round: transactionRequest.round,
                }),
              },
              {
                label: t('Staking.UnstakingAmount'),
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

export default Unstake;
