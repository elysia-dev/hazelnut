import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BuyingStage from '../core/enums/BuyingStage';
import Spinner from 'react-spinkit';
import BuyingSummary from '../components/BuyingSummary';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import BuyingStatusBar from '../components/BuyingStatusBar';
import { useParams } from 'react-router-dom';
import getLibrary from '../core/utils/getLibrary';
import styled from 'styled-components';

type ParamTypes = {
  id: string;
};

const GrayBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
  width: 312px;
  height: 90px;
  padding: 15px;
  border-radius: 10px;
  background-color: #f6f6f8;
  border: 1px solid #e5e5e5;
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
  flex: 4;
  flex-direction: column;
  align-content: space-between;
  align-items: space-between;
`;

function Register() {
  const { t } = useTranslation();
  const { activate, library, account } = useWeb3React();
  const { id } = useParams<ParamTypes>();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          alignContent: 'center',
        }}
      >
        <p
          style={{
            fontSize: 25,
            fontWeight: 'bold',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {'지갑 연결하기'}
        </p>
        <img
          src={require('../images/metamask_logo.png')}
          style={{
            display: 'flex',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 30,
            marginBottom: 30,
          }}
        />
        <GrayBox>
          <p
            style={{
              flex: 1,
              fontSize: 13,
              color: '#A8A8A8',
              textAlign: 'left',
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            Wallet Address
          </p>
          <WhiteBox></WhiteBox>
        </GrayBox>
        <div
          style={{
            width: 342,
            height: 50,
            marginTop: 60,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <button
            style={{
              backgroundColor: '#3679B5',
              borderRadius: 10,
              borderWidth: 0,
              width: '100%',
              height: 50,
            }}
          >
            <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              연결하기
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
