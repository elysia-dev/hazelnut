import React, { useEffect } from 'react';
import Spinner from 'react-spinkit';
import { Web3ReactProvider } from '@web3-react/core';
import { useHistory, useParams } from 'react-router-dom';
import getLibrary from '../core/utils/getLibrary';
import Register from '../components/Register';
import { checkValidRegister } from '../core/clients/EspressoClient';
import { useTranslation } from 'react-i18next';
import InstallMetamask from '../components/errors/InstallMetamask';

type ParamTypes = {
  id: string;
};

function EthAddress() {
  const { id } = useParams<ParamTypes>();
  const history = useHistory();

  useEffect(() => {
    checkValidRegister(id)
      .then()
      .catch(e => {
        if (e.response.status === 404) {
          history.push('/notFound');
        }
      });
  }, []);

  if (id !== undefined) {
    if (window.ethereum?.isMetaMask) {
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
