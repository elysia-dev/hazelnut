import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import InjectedConnector from '../core/connectors/InjectedConnector';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { registerEthAddress } from '../core/clients/EspressoClient';

type Props = {
  id: string;
};

type Account = string | null | undefined;

const GrayBox = styled.div`
  flex-direction: column;
  margin-top: 20px;
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
  const [connected, setConnected] = useState<boolean>(false);
  const [userAccount, setUserAccount] = useState<Account>(undefined);

  const connectWallet = () => {
    activate(InjectedConnector);
  };

  const register = () => {
    if (!userAccount) {
      return alert(t('Error.InvalidAddress'));
    }
    registerEthAddress(props.id, userAccount)
      .then(() => {
        setConnected(true)
      })
      .catch(e => {
        if (e.response.status === 400) {
          alert(t('Register.Duplicated'));
        }
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
      throttle(() => setUserAccount(account), 500);
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
          marginTop: 30,
          fontSize: 25,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {t('Register.ConnectWallet')}
      </p>
      <div
        style={{
          width: 130,
          height: 130,
          marginTop: 30,
          borderRadius: 65,
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0px 1px 6px #00000029',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <img
          src={require('../images/metamask_logo.png')}
          srcSet={`${require('../images/metamask_logo@2x.png')} 2x, ${require('../images/metamask_logo@3x.png')} 3x`}
          style={{
            display: 'flex',
            width: 90,
            height: 90,
            marginLeft: 'auto',
            marginRight: 'auto',
            alignSelf: 'center',
            // marginTop: 30,
            // marginBottom: 30,
          }}
        />
      </div>
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
          disabled={connected}
          style={{
            backgroundColor: '#3679B5',
            borderRadius: 10,
            borderWidth: 0,
            width: '100%',
            height: 50,
          }}
        >
          <p style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
            {connected ? t('Register.Connected') : t('Register.Connect')}
          </p>
        </button>
      </div>
    </div>
  );
}

export default Register;
