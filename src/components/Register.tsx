import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { registerEthAddress } from '../core/clients/EspressoClient';
import { useEagerConnect, useInactiveListener } from '../hooks/connectHooks';

type Props = {
  id: string;
};

type Account = string | null | undefined;

const GrayBox = styled.div`
  flex-direction: column;
  margin-left: 5%;
  align-self: center;
  align-content: space-between;
  justify-content: center;
  width: 80%;
  height: 90px;
  padding: 5%;
  border-radius: 10px;
  background-color: #f6f6f8;
  border: 1px solid #e5e5e5;
`;

const WhiteBox = styled.div`
  width: 93%;
  height: 45px;
  border-radius: 10px;
  background-color: #fff;
  padding: 10px;
  flex: 4;
  align-self: center;
  align-content: space-between;
  align-items: space-between;
`;

let throttle_flag = false;
const throttle = (func: () => void, delay: number) => {
  if (!throttle_flag) {
    func();
    throttle_flag = true;
    setTimeout(() => {
      throttle_flag = false;
    }, delay);
  }
};

function Register(props: Props) {
  const { t } = useTranslation();
  const { account, activate, deactivate } = useWeb3React();
  const history = useHistory();
  const [userAccount, setUserAccount] = useState<Account>(undefined);

  const connectWallet = () => {
    activate(InjectedConnector);
  };

  const register = () => {
    if (typeof userAccount !== 'string') {
      return alert(t('Error.InvalidAddress'));
    }
    registerEthAddress(props.id, userAccount)
      .then(() => {
        alert(t('Register.Connected'));
      })
      .catch(e => {
        if (e.response.status === 404) {
          history.push('/notFound');
        }
      });
  };

  useEffect(() => {
    connectWallet();
    return () => {
      deactivate();
    };
  }, []);

  useEffect(() => {
    if (account) {
      throttle(() => setUserAccount(account), 1000);
    }
  }, [account]);

  return (
    <div
      style={{
        width: '100%',
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
        {t('Register.ConnectWallet')}
      </p>
      <img
        src={require('../images/metamask_logo.png')}
        srcSet={`${require('../images/metamask_logo@2x.png')} 2x, ${require('../images/metamask_logo@3x.png')} 3x`}
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
        <WhiteBox>
          <span
            style={{
              color: '#1C1C1C',
              fontSize: 13,
              width: '100%',
              display: 'block',
              wordBreak: 'break-all',
            }}
          >
            {userAccount}
          </span>
        </WhiteBox>
      </GrayBox>
      <div
        style={{
          width: '90%',
          marginLeft: '5%',
          height: 50,
          position: 'absolute',
          bottom: 20,
          alignSelf: 'center',
        }}
      >
        <button
          onClick={register}
          style={{
            backgroundColor: '#3679B5',
            borderRadius: 10,
            borderWidth: 0,
            width: '100%',
            height: 50,
          }}
        >
          <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
            {t('Register.Connect')}
          </p>
        </button>
      </div>
    </div>
  );
}

export default Register;