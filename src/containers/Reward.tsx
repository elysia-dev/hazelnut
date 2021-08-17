import React, { useEffect, useState } from 'react';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import { useTranslation } from 'react-i18next';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract from '../hooks/useContract';
import ConnectWallet from '../components/ConnectWallet';
import BoxLayout from '../components/BoxLayout';
import AddressBottomTab from '../components/AddressBottomTab';
import InterestSuccess from './../images/success_interest.svg';
import Swal, { RetrySwal } from '../core/utils/Swal';
import Button from '../components/Button';
import PaymentMethod from '../core/types/PaymentMethod';
import { changeEthNet, isValidChainId } from '../core/utils/createNetwork';
import STAKING_POOL_ABI from '../core/constants/abis/staking-pool.json';

const Reward: React.FC<{ transactionRequest: StakingTransactionRequest }> = ({ transactionRequest }) => {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const [chainId, setChainId] = useState<string>('');
  const stakingPoolContract = useContract(
    transactionRequest.contractAddress || '',
    STAKING_POOL_ABI,
  );

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
          html: `<div style="font-size: 15px;"> ${t('Completion.RewardResult', {
            stakingTokenType: transactionRequest.unit,
            amount: transactionRequest.value,
          })}<br />${t('Completion.Notice')}</div>
          `,
          imageUrl: InterestSuccess,
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
      <div>
        <BoxLayout>
          <div style={{ padding: 20 }}>
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
        <AddressBottomTab
          chainId={chainId}
          paymentMethod={transactionRequest.unit === 'EL' ? PaymentMethod.EL : PaymentMethod.ELFI}
        />
      </div>
    );
  }
}

export default Reward;
