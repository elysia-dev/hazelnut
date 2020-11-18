import React from 'react';
import { Animated } from 'react-animated-css';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TransactionRequest from '../core/types/TransactionRequest';
import BuyingStage from '../core/enums/BuyingStage';
import LoadingIndicator from 'react-loading-indicator';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './BuyingStatusBar.css';

const Circle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  justify-content: center;
  align-content: center;
`;

const StepNum = styled.p`
  color: #e5e5e5;
  font-weight: bold;
  font-size: 15px;
  text-align: center;
  margin-top: -5px;
`;

type Props = {
  transactionRequest: TransactionRequest;
  stage: BuyingStage;
  loading: boolean;
  error: boolean;
};

function BuyingStatusBar(props: Props) {
  const { t } = useTranslation();
  const stage = props.stage;
  const isWhiteCheck = stage === BuyingStage.WHITELIST_CHECK;
  const isWhiteRetry = stage === BuyingStage.WHITELIST_RETRY;
  const isAllowanceCheck = stage === BuyingStage.ALLOWANCE_CHECK;
  const isAllowanceRetry = stage === BuyingStage.ALLOWANCE_RETRY;
  const isTransaction = stage === BuyingStage.TRANSACTION;

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
        <div className={'step1'}>
          <Circle
            style={{ backgroundColor: !isWhiteRetry ? '#3679B5' : '#CC3743' }}
          >
            <div style={{ padding: 6 }}>
              {isWhiteCheck && (
                <LoadingIndicator
                  color={{ red: 255, green: 255, blue: 255, alpha: 1 }}
                  segments={8}
                  segmentWidth={2}
                />
              )}
              {isWhiteRetry && (
                <p
                  style={{
                    fontSize: 17,
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: 0,
                  }}
                >
                  !
                </p>
              )}
              {!(isWhiteCheck || isWhiteRetry) && (
                <Animated
                  animationIn="flash"
                  animationInDuration={1000}
                  animationOut="flash"
                  isVisible={isAllowanceCheck}
                  style={{ top: '50%', marginTop: -1, position: 'relative' }}
                >
                  <img src={require('../images/whitecheck.png')} />
                </Animated>
              )}
            </div>
          </Circle>
        </div>
        <div style={{ width: 108, paddingTop: 16, overflow: 'hidden' }}>
          {(isAllowanceRetry || isTransaction) && <div className="fix"></div>}
          {(isWhiteCheck || isWhiteRetry || isAllowanceCheck) && (
            <div className={`default ${isAllowanceCheck && 'slide'}`}></div>
          )}
        </div>
        <div className={'step2'}>
          <Circle
            style={{
              backgroundColor: isAllowanceRetry
                ? '#CC3743'
                : isWhiteRetry || isWhiteCheck
                ? '#fff'
                : '#3679B5',
              border: isWhiteCheck || isWhiteRetry ? 'solid 1px #E5E5E5' : '',
            }}
          >
            <div style={{ padding: 6 }}>
              {isAllowanceCheck && (
                <LoadingIndicator
                  color={{ red: 255, green: 255, blue: 255, alpha: 1 }}
                  segments={8}
                  segmentWidth={2}
                />
              )}
              {isAllowanceRetry && (
                <p
                  style={{
                    fontSize: 17,
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: 0,
                  }}
                >
                  !
                </p>
              )}
              {isTransaction && (
                <Animated
                  animationIn="flash"
                  animationInDuration={1000}
                  animationOut="flash"
                  isVisible={true}
                  style={{ top: '50%', marginTop: -1, position: 'relative' }}
                >
                  <img src={require('../images/whitecheck.png')} />
                </Animated>
              )}
            </div>
            {(isWhiteCheck || isWhiteRetry) && <StepNum>2</StepNum>}
          </Circle>
        </div>
        <div style={{ width: 108, paddingTop: 16 }}>
          <div className={`default ${isTransaction && 'slide'}`}></div>
        </div>
        <div className={'step3'}>
          <Circle
            style={{
              backgroundColor: isTransaction ? '#3679B5' : '#fff',
              border: isTransaction ? '' : 'solid 1px #E5E5E5',
            }}
          >
            <div style={{ padding: 6 }}>
              {isTransaction && (
                <LoadingIndicator
                  color={{ red: 255, green: 255, blue: 255, alpha: 1 }}
                  segments={8}
                  segmentWidth={2}
                />
              )}
            </div>
            {!isTransaction && <StepNum>3</StepNum>}
          </Circle>
        </div>
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
            textAlign: isAllowanceCheck
              ? 'center'
              : isTransaction
              ? 'right'
              : 'left',
          }}
        >
          {t(`Buying.${props.stage}`)}
        </p>
        {isWhiteRetry && (
          <p style={{ color: '#1c1c1c', textDecorationLine: 'underline' }}>
            {props.transactionRequest.userAddresses[0]}
          </p>
        )}
      </div>
    </>
  );
}

export default BuyingStatusBar;
