import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TransactionRequest from '../core/types/TransactionRequest';

type Props = {
  transactionRequest: TransactionRequest;
  elPricePerToken: number;
  expectedElValue: number;
};

const GrayBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
  width: 312px;
  height: 180px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f6f6f8;
  border-width: 1px;
  border-color: #e5e5e5;
  margin-left: auto;
  margin-right: auto;
`;

const WhiteBox = styled.div`
  width: 292px;
  height: 60px;
  border-radius: 10px;
  background-color: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  align-items: space-between;
`;
const GraySpan = styled.span`
  fontsize: 13px;
  text-align: center;
  align-items: center;
  color: #626368;
`;

const BlackSpan = styled.span`
  fontsize: 13px;
  text-align: center;
  align-items: center;
  color: #1c1c1c;
`;

const SpanWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
function BuyingSummary(props: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ paddingTop: 20 }}>
      <p
        style={{
          fontSize: 25,
          fontWeight: 'bold',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        {`${t('Buying.CreateTransaction')} (${
          props.transactionRequest.productTitle
        })`}
      </p>
      <GrayBox>
        <WhiteBox>
          <SpanWrapper>
            <GraySpan style={{ flex: 1, textAlign: 'left' }}> FROM </GraySpan>
            <GraySpan style={{ flex: 1 }}> TO </GraySpan>
            <GraySpan style={{ flex: 3, textAlign: 'right' }}> VALUE </GraySpan>
          </SpanWrapper>
          <div style={{ flex: 1 }}>
            <div
              style={{
                position: 'relative',
                top: '50%',
                width: '100%',
                height: 1,
                backgroundColor: '#E5E5E5',
              }}
            ></div>
          </div>
          <SpanWrapper>
            <BlackSpan style={{ flex: 1, textAlign: 'left' }}> YOU </BlackSpan>
            <BlackSpan style={{ flex: 1 }}> ELYSIA </BlackSpan>
            <BlackSpan style={{ flex: 3, textAlign: 'right' }}>
              EL {props.expectedElValue.toFixed(2)}
            </BlackSpan>
          </SpanWrapper>
        </WhiteBox>
        <div
          style={{
            width: 30,
            height: 20,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <img
            alt={'arrow'}
            style={{
              width: '100%',
              height: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            src={require('../images/downarrow.png')}
          />
        </div>
        <WhiteBox>
          <SpanWrapper>
            <GraySpan style={{ flex: 1, textAlign: 'left' }}> FROM </GraySpan>
            <GraySpan style={{ flex: 1 }}> TO </GraySpan>
            <GraySpan style={{ flex: 3, textAlign: 'right' }}> VALUE </GraySpan>
          </SpanWrapper>
          <div style={{ flex: 1 }}>
            <div
              style={{
                position: 'relative',
                top: '50%',
                width: '100%',
                height: 1,
                backgroundColor: '#E5E5E5',
              }}
            ></div>
          </div>
          <SpanWrapper>
            <BlackSpan style={{ flex: 1, textAlign: 'left' }}>ELYSIA</BlackSpan>
            <BlackSpan style={{ flex: 1 }}> YOU </BlackSpan>
            <BlackSpan style={{ flex: 3, textAlign: 'right' }}>
              {props.transactionRequest.tokenName}
              {props.transactionRequest.amount}
            </BlackSpan>
          </SpanWrapper>
        </WhiteBox>
      </GrayBox>
    </div>
  );
}

export default BuyingSummary;
