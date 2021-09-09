import React from 'react';
import PaymentMethod from '../core/types/PaymentMethod';
import ApproveDes from './ApproveDes';
import ConfirmModal from './ConfirmModal';

type Props = {
  isApproved: boolean;
  list?: { label: string; value: string; subvalue?: string }[];
  paymentMethod: PaymentMethod;
};

const ApproveStep: React.FC<Props> = ({ isApproved, list, paymentMethod }) => {
  return (
    <>
      {paymentMethod === PaymentMethod.EL && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: 37,
              width: '50%',
              backgroundColor: isApproved ? '#E6E6E6' : '#666666',
              borderTopLeftRadius: 5,
              borderBottomLeftRadius: 5,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: '#FFF',
                paddingLeft: 9,
                textAlign: 'left',
                paddingTop: 6,
                paddingBottom: 6,
                fontFamily: 'Spoqa Han Sans',
                fontWeight: 'bold',
              }}
            >
              {'1단계\n권한승인'.split('\n').map(text => {
                return (
                  <span>
                    {text}
                    <br />
                  </span>
                );
              })}
            </div>
          </div>
          <div
            style={{
              height: 37,
              width: '50%',
              backgroundColor: !isApproved ? '#E6E6E6' : '#666666',
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: '#FFF',
                paddingRight: 9,
                paddingTop: 6,
                paddingBottom: 6,
                fontFamily: 'Spoqa Han Sans',
                fontWeight: 'bold',
              }}
            >
              {'2단계\n최종확인'.split('\n').map(text => {
                return (
                  <span>
                    {text}
                    <br />
                  </span>
                );
              })}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: '49.9%',
              borderTop: '18.5px solid rgba(0,0,0,0)',
              borderBottom: '18.5px solid rgba(0,0,0,0)',
              borderLeft: `19px solid ${isApproved ? '#E6E6E6' : '#666666'}`,
            }}
          />
        </div>
      )}
      {isApproved ? <ConfirmModal list={list} /> : <ApproveDes />}
    </>
  );
};

export default ApproveStep;
