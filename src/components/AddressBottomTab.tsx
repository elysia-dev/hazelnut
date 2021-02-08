import { useWeb3React } from '@web3-react/core';
import { BigNumberish, utils } from 'ethers';
import React, { useEffect, useState } from 'react';
import PaymentMethod from '../core/types/PaymentMethod';
import { useElysiaToken } from '../hooks/useContract';
import AccountIcon from './AccountIcon';

type Props = {
  paymentMethod: string;
};

function AddressBottomTab(props: Props) {
  const elToken = useElysiaToken();
  const [balance, setBalance] = useState<BigNumberish | undefined>(undefined);
  const { account, library } = useWeb3React();

  useEffect(() => {
    if (props.paymentMethod === PaymentMethod.EL) {
      elToken?.balanceOf(account).then((balance: BigNumberish) => {
        setBalance(balance);
      });
    } else if (props.paymentMethod === PaymentMethod.ETH) {
      library.getBalance(account).then((balance: BigNumberish) => {
        setBalance(balance);
      });
    }
  }, [account]);

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
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div
          style={{
            background: '#F6F6F8',
            borderRadius: 5,
            border: 'solid 1px #E5E5E5',
            padding: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: '#1c1c1c',
              fontWeight: 900,
              alignSelf: 'center',
              textAlign: 'center',
            }}
          >
            {`${account?.substring(0, 6)}...${account?.substring(
              account?.length - 4,
            )}`}
          </span>
          <div style={{ marginLeft: 10 }}>
            <AccountIcon />
          </div>
        </div>
        <div
          style={{
            border: 'solid 1px #E5E5E5',
            marginLeft: 20,
            borderRadius: 5,
            padding: 10,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ color: '#414141', fontSize: 15 }}>
            {props.paymentMethod.toUpperCase()}
            {/* {process.env.NODE_ENV === 'production' ? 'EL ' : 'ELRS '} */}
          </div>
          <div
            style={{
              color: '#1C1C1C',
              fontSize: 15,
              fontWeight: 900,
              marginLeft: 5,
            }}
          >
            {balance
              ? parseFloat(utils.formatEther(balance)).toFixed(props.paymentMethod === PaymentMethod.EL ? 2 : 4)
              : 'Checking'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressBottomTab;
