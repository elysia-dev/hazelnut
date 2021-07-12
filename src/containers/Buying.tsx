import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import RequestStage from '../core/enums/RequestStage';
import { useWeb3React } from '@web3-react/core';
import { utils, BigNumber as Big } from 'ethers';
import InjectedConnector from '../core/connectors/InjectedConnector';
import useContract, { useElysiaToken } from '../hooks/useContract';
import { BigNumber } from 'bignumber.js';
import ConnectWallet from '../components/ConnectWallet';
import TxSummary from '../components/TxSummary';
import Loading from '../components/Loading';
import BoxLayout from '../components/BoxLayout';
import { useParams } from 'react-router-dom';
import { completeTransactionRequest } from '../core/clients/EspressoClient';
import ServerError from '../components/errors/ServerError';
import AddressBottomTab from '../components/AddressBottomTab';
import { useTotalSupply } from '../hooks/useElysia';
import { useWatingTx } from '../hooks/useWatingTx';
import TxStatus from '../core/enums/TxStatus';
import { PopulatedTransaction } from '@ethersproject/contracts';
import BuyingSuccess from './../images/success_buying.svg';
import Swal, { RetrySwal, SwalWithReact } from '../core/utils/Swal';
import Button from '../components/Button';
import PaymentMethod from '../core/types/PaymentMethod';
import useExpectedValue from '../hooks/useExpectedValue';
import { formatEther } from 'ethers/lib/utils';
import NetworkChainId from '../core/enums/NetworkChainId';
import { changeKovan, createBnbTestNet, createKovan, isValidChainId } from '../core/utils/createNetwork';

type Props = {
  transactionRequest: TransactionRequest;
};

type State = {
  stage: RequestStage;
  error: boolean;
  txHash: string;
};

function Buying(props: Props) {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const elToken = useElysiaToken();
  const assetToken = useContract(
    String(props.transactionRequest.contract.address),
    props.transactionRequest.contract.abi,
  );
  const [expectedValue, expectedReturn] = useExpectedValue(
    props.transactionRequest,
  );
  const totalSupply = useTotalSupply(assetToken);
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<State>({
    stage: RequestStage.INIT,
    error: false,
    txHash: '',
  });
  const [chainId, setChainId] = useState<string>('');

  const currentChainId = async () => {
    setChainId(await library.provider.request({
       method: 'eth_chainId'
     }));
  }

  const networkCheck = () => {
      return isValidChainId(props.transactionRequest.product.paymentMethod, chainId);
  }

  const createNetwork = async () => {
    try {
      if(props.transactionRequest.product.paymentMethod === PaymentMethod.BNB){
        if(chainId !== NetworkChainId.BnbTestNet){
         await createBnbTestNet(library)
       } 
      } else {
        await changeKovan(library)
    }
    } catch (switchChainError) {
     try{
       if(props.transactionRequest.product.paymentMethod === PaymentMethod.EL ||
          props.transactionRequest.product.paymentMethod === PaymentMethod.ETH){
          await createKovan(library)
      }
      return;
     } catch (error) {
       console.error(error);
     }
  } finally {
    setState({
      ...state,
      stage: RequestStage.INIT,
    })
    currentChainId();
  }
}

  const txResult = useWatingTx(state.txHash);

  const checkAllowance = () => {
    if (props.transactionRequest.product.paymentMethod === PaymentMethod.ETH || 
        props.transactionRequest.product.paymentMethod === PaymentMethod.BNB) {
      setState({
        ...state,
        stage: RequestStage.TRANSACTION,
      });

      return;
    }

    elToken
      ?.allowance(account, props.transactionRequest.contract.address)
      .then((res: BigNumber) => {
        const allownace = new BigNumber(res.toString());
        setState({
          ...state,
          stage: allownace.gte(expectedValue.toString())
            ? RequestStage.TRANSACTION
            : RequestStage.ALLOWANCE_RETRY,
        });
      });
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
    if (props.transactionRequest.product.paymentMethod === PaymentMethod.ETH || 
       props.transactionRequest.product.paymentMethod === PaymentMethod.BNB) {
      assetToken?.populateTransaction.purchase().then(populatedTransaction => {
        sendTx(
          populatedTransaction,
          RequestStage.TRANSACTION_RESULT,
          RequestStage.TRANSACTION_RETRY,
          expectedValue.value.toHexString(),
        );
      });
    } else {
      assetToken?.populateTransaction
        .purchase(expectedValue.value.toHexString())
        .then(populatedTransaction => {
          sendTx(
            populatedTransaction,
            RequestStage.TRANSACTION_PENDING,
            RequestStage.TRANSACTION_RETRY,
          );
        });
    }
  };

  const approve = () => {
    elToken?.populateTransaction
      .approve(props.transactionRequest.contract.address, '1' + '0'.repeat(25))
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
    library.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: populatedTransaction.to,
            from: account,
            data: populatedTransaction.data,
            value,
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
        if(!networkCheck()){
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
        completeTransactionRequest(id, state.txHash);
        Swal.fire({
          title: t('Completion.Title'),
          html: `<div style="font-size:15px;"> ${t(
            'Completion.BuyingResult',
            {
              product: props.transactionRequest.product.title,
              value: totalSupply.toString() !== '0' ?
                (props.transactionRequest.amount / parseFloat(formatEther(totalSupply)) * 100).toFixed(2)
                : '--',
            }
          )}<br />${t('Completion.Notice')}</div>
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
      <div>
        <BoxLayout>
          <TxSummary
            inUnit={props.transactionRequest.product.tokenName}
            inValue={props.transactionRequest.amount.toString()}
            outUnit={props.transactionRequest.product.paymentMethod.toUpperCase()}
            outValue={expectedValue.loaded ? parseFloat(utils.formatEther(expectedValue.value)).toFixed(5) : "Checking"}
            title={t('Buying.CreateTransaction')}
            transactionRequest={props.transactionRequest}
          />
          <div
            style={{
              backgroundColor: '#F6F6F8',
              margin: '0px 15px',
              padding: '0px 15px',
              paddingBottom: 10,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              marginBottom: 100,
            }}
          >
            <div style={{ fontSize: 10 }}>{t('Buying.Annual')}</div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{ color: '#1c1c1c', fontWeight: 'bold', fontSize: 15 }}
              >
                {t('Buying.ExpectedReturn')}
              </div>
              <div style={{ color: '#1c1c1c', fontSize: 15 }}>
                {props.transactionRequest.product.paymentMethod.toUpperCase()}
                <strong style={{ marginLeft: '5px' }}>
                  {expectedReturn.toFixed(4)}
                </strong>
              </div>
            </div>
            <Button
              style={{ marginTop: 20 }}
              clickHandler={() => {
                account && props.transactionRequest.userAddresses !== account
                  ? checkAccount()
                  : setState({ ...state, stage: RequestStage.NETWORK_CHECK});
              }}
              title={t('Buying.TransactionRetryButton')}
            />
          </div>
        </BoxLayout>
        <AddressBottomTab chainId={chainId} paymentMethod={props.transactionRequest.product.paymentMethod} />
      </div>
    );
  }
}

export default Buying;
