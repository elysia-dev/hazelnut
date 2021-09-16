import React from 'react';
import { useTranslation } from 'react-i18next';
import AppColors from '../core/enums/AppColors';
import AppFonts from '../core/enums/AppFonts';

type Props = {
  list?: { label: string; value: string; subvalue?: string }[];
};

const ConfirmModal: React.FC<Props> = ({ list }) => {
  const { t } = useTranslation();
  return (
    <>
      <div
        style={{
          fontSize: 18,
          color: AppColors.BLACK,
          textAlign: 'center',
          fontFamily: AppFonts.Regular,
          fontWeight: 'bold',
          borderBottom: `1px solid ${AppColors.GREY}`,
          alignItems: 'center',
          marginTop: 35,
          height: 40,
        }}
      >
        {t('Staking.ConfirmationTitle')}
      </div>
      {list?.map(item => {
        return (
          <div
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${AppColors.GREY}`,
              alignItems: 'center',
              height: item.subvalue ? 64 : 50,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: AppColors.BLACK,
                fontFamily: AppFonts.Regular,
              }}
            >
              {item.label}
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: AppColors.BLACK,
                  textAlign: 'right',
                  fontFamily: AppFonts.Regular,
                  fontWeight: 'bold',
                }}
              >
                {item.value}
              </div>
              {item.subvalue && (
                <div
                  style={{
                    fontSize: 12,
                    color: AppColors.BLACK,
                    textAlign: 'right',
                    fontFamily: AppFonts.Regular,
                  }}
                >
                  {item.subvalue}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ConfirmModal;
