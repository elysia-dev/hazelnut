import React from 'react';
import Button from './Button';
import Logo from './../images/logo.png';
import BoxLayout from './BoxLayout';

type Props = {
  handler: () => void;
};

function ConnectWallet(props: Props) {
  return (
    <BoxLayout>
      <div
        style={{
          height: '100%',
          padding: '5% 5%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, justifyItems: 'center', alignItems: 'center' }}>
          <div
            style={{
              borderRadius: '50%',
              width: 140,
              height: 140,
              boxShadow: '0 1px 6px #00000029',
              margin: 'auto',
              marginTop: '50%',
            }}
          >
            <div style={{ margin: 'auto', width: 90, padding: 25 }}>
              <img
                src={Logo}
                style={{
                  width: 90,
                  position: 'relative',
                  top: -3,
                  left: 1,
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: 25,
              textAlign: 'center',
              marginTop: 30,
              fontWeight: 900,
              color: '#1C1C1C',
            }}
          >
            ELYSIA
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          padding: '0px 10px',
        }}
      >
        <Button clickHandler={props.handler} title="Connect wallet" />
      </div>
    </BoxLayout>
  );
}

export default ConnectWallet;
