import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import StakingTransactionRequest from '../core/types/StakingTransactionRequest';
import RequestStage from '../core/enums/RequestStage';
import ServerError from '../components/errors/ServerError';
import ConnectWallet from '../components/ConnectWallet';
import BoxLayout from '../components/BoxLayout';
import Button from '../components/Button';
import AddressBottomTab from '../components/AddressBottomTab';
import Swal, { RetrySwal, SwalWithReact } from '../core/utils/Swal';

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
        </BoxLayout>
        <AddressBottomTab
          chainId={process.env.REACT_APP_ETH_NETWORK}
          paymentMethod={transactionRequest.unit} // 아 헐 스테이캉 단위를 안 가져오네...
        />
      </div>
    );
  }
}

export default Stake;
