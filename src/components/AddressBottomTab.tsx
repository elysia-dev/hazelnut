import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  address: string;
  balance: BigNumber | undefined;
};

type Balance = string | undefined;

function AddressBottomTab(props: Props) {
  const { t } = useTranslation();

  const minimizedAddress = `${props.address.substring(
    0,
    6,
  )}...${props.address.substring(props.address.length - 4)}`;

  return (
    <div
      style={{
        width: '100%',
        height: 35,
        position: 'fixed',
        bottom: 0,
        boxShadow: '0px 0px 6px #00000010',
        background: '#fff',
        paddingTop: 20,
        paddingBottom: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignContent: 'center',
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div
          style={{
            flex: 2,
            background: '#F6F6F8',
            borderRadius: 5,
            border: 'solid 1px #E5E5E5',
            height: 35,
            paddingLeft: 6,
            paddingRight: 6,
            display: 'flex',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 15,
              color: '#1c1c1c',
              fontWeight: 900,
              alignSelf: 'center',
              textAlign: 'center',
            }}
          >
            {minimizedAddress}
          </span>
        </div>
        <div
          style={{
            marginLeft: 20,
            flex: 3,
            boxShadow: '0px 2px 6px #00000029',
            height: 35,
            paddingLeft: '5%',
            paddingRight: '5%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            borderRadius: 5,
          }}
        >
          <div
            style={{
              flex: 1,
              alignSelf: 'center',
              textAlign: 'right',
            }}
          >
            <span style={{ color: '#414141', fontSize: 15 }}>
              {process.env.NODE_ENV === 'production' ? 'EL ' : 'ELRS '}
            </span>
            <span style={{ color: '#1C1C1C', fontSize: 15, fontWeight: 900 }}>
              {props.balance
                ? (props.balance.toNumber() / 10 ** 18).toFixed(2)
                : 'Checking'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressBottomTab;
