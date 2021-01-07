import React, { useEffect, useState } from 'react';
import Spinner from 'react-spinkit';
import { Web3ReactProvider } from '@web3-react/core';
import { useHistory, useParams } from 'react-router-dom';
import getLibrary from '../core/utils/getLibrary';
import Register from '../components/Register';
import { checkValidRegister } from '../core/clients/EspressoClient';
import { useTranslation } from 'react-i18next';
import InstallMetamask from '../components/errors/InstallMetamask';
import LanguageType from '../core/enums/LanguageType';
import { setServers } from 'dns';

type ParamTypes = {
  id: string;
};

function EthAddress() {
  const { id } = useParams<ParamTypes>();
  const { i18n } = useTranslation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkValidRegister(id)
      .then(res => {
        i18n.changeLanguage(res.data.language || LanguageType.EN);
        setLoading(false);
      })
      .catch(e => {
        if (e.response.status === 404) {
          history.push('/notFound');
        }
      });
  }, []);

  if (id !== undefined && !loading) {
    if (window.ethereum?.isMetaMask || window.ethereum?.isImToken) {
      return (
        <Web3ReactProvider getLibrary={getLibrary}>
          <Register id={id} />
        </Web3ReactProvider>
      );
    } else {
      return <InstallMetamask />;
    }
  } else {
    return (
      <div>
        <Spinner name="line-scale" />
      </div>
    );
  }
}
export default EthAddress;
