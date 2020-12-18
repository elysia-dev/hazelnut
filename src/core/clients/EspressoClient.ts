import Axios, { AxiosResponse } from 'axios';
import TransactionRequest from '../types/TransactionRequest';
import EthAddressResponse from '../types/EthAddressResponse';
import WhitelistResponse from '../types/WhitelistResponse';

export const getTransactionRequest = (
  id: string,
): Promise<AxiosResponse<TransactionRequest>> => {
  return Axios.get(
    `${process.env.REACT_APP_API_URL}/transactionRequests/${id}`,
  );
};

export const completeTransactionRequest = (
  id: string,
): Promise<AxiosResponse<void>> => {
  return Axios.put(
    `${process.env.REACT_APP_API_URL}/transactionRequests/${id}/complete`,
  );
};

export const checkValidRegister = (id: string): Promise<AxiosResponse<EthAddressResponse>> => {
  return Axios.get(`${process.env.REACT_APP_API_URL}/ethAddress/${id}`);
};

export const registerEthAddress = (
  id: string,
  address: string,
): Promise<AxiosResponse> => {
  return Axios.put(`${process.env.REACT_APP_API_URL}/ethAddress/${id}`, {
    address: address,
  });
};

export const getWhitelistRequest = (id: string): Promise<AxiosResponse<WhitelistResponse>> => {
  return Axios.get(`${process.env.REACT_APP_API_URL}/productWhitelist/${id}`);
};
