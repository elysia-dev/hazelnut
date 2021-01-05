import React from 'react';
import styled from 'styled-components';
import TransactionRequest from '../core/types/TransactionRequest';
import EL from '../images/el.png';
import AssetToken from '../images/asset_token.png';
import BlueArrow from '../images/blue_arrow.png';

type Props = {
  inUnit: 'EL' | string;
  inValue: string;
  outUnit: 'EL' | string;
  outValue: string;
  title: string;
  transactionRequest: TransactionRequest;
};

const InnerBox = styled.div`
  border: 1px solid #e6ecf2;
  border-radius: 5px;
  padding: 14px;
`;

const SmallSpan = styled.div`
  color: #707380;
  font-size: 11px;
`;

const BigSpan = styled.div`
  color: #1c1c1c;
  font-size: 18px;
  font-weight: bold;
`;

type LogoProps = {
  type: 'EL' | string;
};

const Logo = (props: LogoProps) => {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        backgroundImage: `url(${props.type === 'EL' ? EL : AssetToken})`,
        backgroundSize: 'cover',
        borderRadius: 15,
        boxShadow: '0 0 10px #00000029',
      }}
    />
  );
};

const TxSummary = (props: Props) => {
  return (
    <div style={{ margin: '0px 15px', paddingTop: 10 }}>
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
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <span
          style={{
            background: '#F6F6F8',
            padding: '4px 19px',
            fontSize: 15,
            color: '#5C5B5B',
            borderRadius: 5,
            fontWeight: 'bold',
          }}
        >
          {props.transactionRequest.product.tokenName}
        </span>
      </div>
      <div
        style={{
          backgroundImage: `url(${props.transactionRequest.product.data.images[0]})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 30%',
          backgroundSize: 'cover',
          height: 175,
          borderBottomRightRadius: 5,
          borderBottomLeftRadius: 5,
          marginBottom: 15,
        }}
      ></div>
      <div style={{ backgroundColor: '#F6F6F8' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 5,
            padding: 15,
            boxShadow: '0 0 10px #00000029',
          }}
        >
          <InnerBox>
            <div style={{ height: 20, display: 'flex' }}>
              <SmallSpan>FROM</SmallSpan>
              <SmallSpan style={{ marginLeft: 'auto' }}>VALUE</SmallSpan>
            </div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center' }}>
              <Logo type={props.outUnit} />
              <BigSpan style={{ marginLeft: 6 }}>{props.outUnit}</BigSpan>
              <BigSpan style={{ marginLeft: 'auto' }}>{props.outValue}</BigSpan>
            </div>
          </InnerBox>
          <div style={{ height: 30, textAlign: 'center' }}>
            <img style={{ width: 15, marginTop: 5 }} src={BlueArrow} />
          </div>
          <InnerBox>
            <div style={{ height: 20, display: 'flex' }}>
              <SmallSpan>TO</SmallSpan>
              <SmallSpan style={{ marginLeft: 'auto' }}>VALUE</SmallSpan>
            </div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center' }}>
              <Logo type={props.inUnit} />
              <BigSpan style={{ marginLeft: 6 }}>{props.inUnit}</BigSpan>
              <BigSpan style={{ marginLeft: 'auto' }}>{props.inValue}</BigSpan>
            </div>
          </InnerBox>
        </div>
        <div style={{ height: 15 }}></div>
      </div>
    </div>
  );
};

export default TxSummary;
