import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button';

function InstallMetamask() {
  const { t } = useTranslation();

  function refreshPage() {
    window.location.reload();
  }

  return (
    <div
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '50%',
        padding: '0% 5%',
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
          bottom: 75,
        }}
      >
        {t('Error.AlreadyInstalled')}
      </p>
      <Button clickHandler={refreshPage} title={t('Error.PleaseReload')} />
    </div>
  );
}

export default InstallMetamask;
