import React from 'react';
import { useTranslation } from 'react-i18next';
import TransactionRequest from '../core/types/TransactionRequest';
import BuyingStage from '../core/enums/BuyingStage';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './BuyingStatusBar.css';
import StepStage from '../core/enums/StepStage';
import Step from './Step';
import StepBar from './StepBar';

type Props = {
  transactionRequest: TransactionRequest;
  stage: BuyingStage;
  loading: boolean;
  error: boolean;
  message: string;
};

function BuyingStatusBar(props: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div
        style={{
          display: 'flex',
          marginTop: 50,
          width: 312,
          marginLeft: 'auto',
          marginRight: ' auto',
        }}
      >
        <Step
          step={1}
          stage={
            props.stage === BuyingStage.WHITELIST_CHECK ? StepStage.LOADING :
              props.stage === BuyingStage.WHITELIST_RETRY ? StepStage.FAIL :
                StepStage.SUCCESS
          }
        />
        <StepBar
          active={!props.stage.includes('Whitelist')}
          animated={props.stage === BuyingStage.ALLOWANCE_CHECK}
        />
        <Step
          step={2}
          stage={
            [BuyingStage.ALLOWANCE_CHECK, BuyingStage.ALLOWANCE_PENDING].includes(props.stage) ? StepStage.LOADING :
              props.stage === BuyingStage.ALLOWANCE_RETRY ? StepStage.FAIL :
                props.stage.includes('Whitelist') ? StepStage.NONE :
                  StepStage.SUCCESS
          }
        />
        <StepBar
          active={props.stage.includes('Transaction')}
          animated={props.stage === BuyingStage.TRANSACTION}
        />
        <Step
          step={3}
          stage={
            [BuyingStage.TRANSACTION, BuyingStage.TRANSACTION_PENDING].includes(props.stage) ? StepStage.LOADING :
              props.stage === BuyingStage.TRANSACTION_RETRY ? StepStage.FAIL :
                props.stage.includes('Whitelist') || props.stage.includes('Allowance') ? StepStage.NONE :
                  StepStage.SUCCESS
          }
        />
      </div>
      <div
        style={{
          marginTop: 0,
          width: 312,
          marginLeft: 'auto',
          marginRight: ' auto',
        }}
      >
        <p
          style={{
            textAlign: props.stage.includes("Allowance")
              ? 'center'
              : props.stage.includes("Transaction")
                ? 'right'
                : 'left',
          }}
        >
          {t(`Buying.${props.stage}`)}
        </p>
        {props.stage.includes("Retry") && (
          <p style={{ color: '#1c1c1c', textDecorationLine: 'underline' }}>
            {props.message}
          </p>
        )}
      </div>
    </>
  );
}

export default BuyingStatusBar;
