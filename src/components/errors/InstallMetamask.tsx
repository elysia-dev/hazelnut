import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function InstallMetamask() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '50%',
      }}
    >
      <h1
        style={{
          alignSelf: 'center',
          textAlign: 'center',
          color: '#1c1c1c',
        }}
      >
        {t('Error.InstallMetamask')}
      </h1>
      <p
        style={{
          fontWeight: 200,
          alignSelf: 'center',
          textAlign: 'center',
          color: '#A7A7A7',
        }}
      >
        {t('Error.AlreadyInstalled')}
      </p>
      <p
        style={{
          fontWeight: 200,
          alignSelf: 'center',
          textAlign: 'center',
          color: '#A7A7A7',
        }}
      >
        {t('Error.PleaseReload')}
      </p>
    </div>
  );
}

export default InstallMetamask;
