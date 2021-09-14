import React from 'react';
import { useTranslation } from 'react-i18next';
import AppColors from '../core/enums/AppColors';
import AppFonts from '../core/enums/AppFonts';

function ApproveDes() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        alignItems: 'center',
        marginTop: 57,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontFamily: AppFonts.Regular,
          fontWeight: 'bold',
        }}
      >
        {t('Buying.approve_guide')}
      </div>
      <div
        style={{
          width: '100%',
          borderTopWidth: 1,
          borderColor: AppColors.GREY,
          marginTop: 15,
          marginBottom: 29,
        }}
      />
      <div
        style={{
          fontSize: 14,
          color: AppColors.BLACK,
          textAlign: 'center',
          marginBottom: 26,
          fontFamily: AppFonts.Regular,
        }}
      >
        {t('Buying.approve_guide_first')}
      </div>
      <div
        style={{
          fontSize: 14,
          color: AppColors.BLACK,
          textAlign: 'center',
          fontFamily: AppFonts.Regular,
        }}
      >
        {t('Buying.approve_guide_second')}
      </div>
    </div>
  );
}

export default ApproveDes;
