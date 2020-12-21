import React from 'react';
import styled from 'styled-components';
import TransactionRequest from '../core/types/TransactionRequest';

type Props = {
  inUnit: string;
  inValue: string;
  outUnit: string;
  outValue: string;
  title: string;
  transactionRequest: TransactionRequest;
};

const InnerBox = styled.div`
  border: 1px solid #E6ECF2;
  border-radius: 5px;
  padding: 14px;
`;

const SmallSpan = styled.div`
  color: #707380;
  font-size: 11px;
`;

const BigSpan = styled.div`
  color: #1C1C1C;
  font-size: 18px;
  font-weight: bold;
`;

function TxSummary(props: Props) {
  return (
    <div style={{ margin: "0px 15px" }}>
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
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <span
          style={{
            background: "#F6F6F8",
            padding: "4px 19px",
            fontSize: 15,
            color: "#5C5B5B",
            borderRadius: 5,
            fontWeight: "bold",
          }}
        >{props.transactionRequest.product.tokenName}</span>
      </div>
      <div
        style={{
          backgroundImage: `url(${props.transactionRequest.product.data.images[0]})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom",
          backgroundSize: "cover",
          height: 175,
          borderBottomRightRadius: 5,
          borderBottomLeftRadius: 5,
          marginBottom: 15,
        }}
      >
      </div>
      <div style={{ backgroundColor: "#F6F6F8" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 5,
            padding: 15,
            boxShadow: "0 0 10px #00000029"
          }}>
          <InnerBox style={{ marginBottom: 30 }}>
            <div style={{ height: 20 }}>
              <SmallSpan style={{ float: "left" }}>FROM</SmallSpan>
              <SmallSpan style={{ float: "right" }}>VALUE</SmallSpan>
            </div>
            <div style={{ height: 20 }}>
              <BigSpan style={{ float: "left" }}>{props.outUnit}</BigSpan>
              <BigSpan style={{ float: "right" }}>{props.outValue}</BigSpan>
            </div>
          </InnerBox>
          <InnerBox>
            <div style={{ height: 20 }}>
              <SmallSpan style={{ float: "left" }}>TO</SmallSpan>
              <SmallSpan style={{ float: "right" }}>VALUE</SmallSpan>
            </div>
            <div style={{ height: 20 }}>
              <BigSpan style={{ float: "left" }}>{props.inUnit}</BigSpan>
              <BigSpan style={{ float: "right" }}>{props.inValue}</BigSpan>
            </div>
          </InnerBox>
        </div>
        <div style={{ height: 30 }}></div>
      </div>
    </div>
  );
}

export default TxSummary;
