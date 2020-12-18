import React from 'react';
import styled from 'styled-components';

type Props = {
  inUnit: string;
  inValue: string;
  outUnit: string;
  outValue: string;
  title: string;
  children?: React.ReactNode;
};

const GrayBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
  width: 300px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f6f6f8;
  border-width: 1px;
  border-color: #e5e5e5;
  margin-left: auto;
  margin-right: auto;
`;

const WhiteBox = styled.div`
  width: 280px;
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

function TxSummary(props: Props) {
  return (
    <div
      style={{
        boxShadow: '0px 0px 6px #00000010',
        background: '#fff',
        paddingTop: 20,
        paddingBottom: 20,
        borderRadius: 25,
      }}
    >
      <div
        style={{
          fontSize: 25,
          fontWeight: 'bold',
          marginBottom: 12,
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
        }}
      >
        {props.title}
      </div>
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
              {props.outUnit}
              <span style={{ fontWeight: 900, marginLeft: 10 }}>
                {props.outValue}
              </span>
            </BlackSpan>
          </SpanWrapper>
        </WhiteBox>
        <div
          style={{
            width: '100%',
            height: 30,
          }}
        >
          <div
            style={{
              margin: 'auto',
              marginTop: 10,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #838383',
            }}
          />
        </div>
        <WhiteBox style={{ height: 20 }}>
          <SpanWrapper>
            <BlackSpan style={{ flex: 1, textAlign: 'left' }}>ELYSIA</BlackSpan>
            <BlackSpan style={{ flex: 1 }}> YOU </BlackSpan>
            <BlackSpan style={{ flex: 3, textAlign: 'right' }}>
              {props.inUnit}
              <span style={{ fontWeight: 900, marginLeft: 10 }}>
                {props.inValue}
              </span>
            </BlackSpan>
          </SpanWrapper>
        </WhiteBox>
      </GrayBox>
      {props.children}
    </div>
  );
}

export default TxSummary;
