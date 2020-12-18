import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import TransactionType from '../core/enums/TransactionType';
import Button from './Button';
import BuyingSuccess from './../images/success_buying.svg';
import InterestSuccess from './../images/success_interest.svg';
import RefundSuccess from './../images/success_refund.svg';

import BoxLayout from './BoxLayout';

interface LocationState {
  type: string;
  product: string;
  value: string;
}

function TransactionCompletion() {
  const { t } = useTranslation();
  const location = useLocation<LocationState>();
  const { type, product, value } = location.state;
  const image = () => {
    switch (type) {
      case TransactionType.INTEREST:
        return InterestSuccess;
      case TransactionType.BUYING:
        return BuyingSuccess;
      case TransactionType.REFUND:
        return RefundSuccess;
      default:
        return InterestSuccess;
    }
  };

  return (
    <BoxLayout style={{ background: '#F9F9F9' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 13,
          boxShadow: '0px 0px 6px #00000010',
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 25,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {t(`Completion.${type.charAt(0).toUpperCase() + type.slice(1)}`)}
        </div>
        <div>
          <div
            style={{
              margin: 'auto',
              width: type === TransactionType.INTEREST ? 200 : 300,
              marginTop: 50,
            }}
          >
            <img
              src={image()}
              style={{
                width: '100%',
              }}
            />
          </div>
        </div>
        <span
          style={{
            marginTop: 30,
            paddingLeft: '5%',
            paddingRight: '5%',
            display: 'block',
            fontSize: 20,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {t(
            `Completion.${type.charAt(0).toUpperCase() + type.slice(1)}Result`,
            {
              product: product,
              value: value,
            },
          )}
        </span>

        <Button
          style={{ marginLeft: '5%', width: '90%', marginTop: 30 }}
          clickHandler={() => {}}
          title={t('Completion.ReturnToApp')}
        />
      </div>
    </BoxLayout>
  );
}

export default TransactionCompletion;
