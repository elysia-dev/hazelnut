import Axios, { AxiosResponse } from 'axios';
import TransactionRequest from '../types/TransactionRequest';

export const getTransactionRequest = (
  id: string,
): Promise<AxiosResponse<TransactionRequest>> => {
  return Axios.get(
    `${process.env.REACT_APP_API_URL}/transactionRequests/${id}`,
  );
};

export const checkValidRegister = (id: string): Promise<AxiosResponse> => {
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
