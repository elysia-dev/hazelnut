import React from 'react';
import { useTranslation } from 'react-i18next';

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
          fontFamily: 'Spoqa Han Sans',
          fontWeight: 'bold',
        }}
      >
        {t('Buying.approve_guide')}
      </div>
      <div
        style={{
          width: '100%',
          borderTopWidth: 1,
          borderColor: 'gray',
          marginTop: 15,
          marginBottom: 29,
        }}
      />
      <div
        style={{
          fontSize: 14,
          color: 'black',
          textAlign: 'center',
          marginBottom: 26,
          fontFamily: 'Spoqa Han Sans',
        }}
      >
        {t('Buying.approve_guide_first')}
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'black',
          textAlign: 'center',
          fontFamily: 'Spoqa Han Sans',
        }}
      >
        {t('Buying.approve_guide_second')}
      </div>
    </div>
  );
}

export default ApproveDes;
