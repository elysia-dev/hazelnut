import Axios, { AxiosResponse } from 'axios';
import TransactionRequest from '../types/TransactionRequest';
import EthAddressResponse from '../types/EthAddressResponse';

export const getTransactionRequest = (
  id: string,
): Promise<AxiosResponse<TransactionRequest>> => {
  return Axios.get(
    `${process.env.REACT_APP_API_URL}/transactionRequests/${id}`,
  );
};

export const completeTransactionRequest = (
  id: string,
  txHash: string,
): Promise<AxiosResponse<void>> => {
  return Axios.put(
    `${process.env.REACT_APP_API_URL}/transactionRequests/${id}/complete/${txHash}`,
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

export const getProductInfo = (
  productId: number,
): Promise<AxiosResponse> => {
  return Axios.get(`${process.env.REACT_APP_API_URL}/products?productId=${productId}`);
};

export const getProductContract = (
  contractAddress: string,
): Promise<AxiosResponse> => {
  return Axios.get(`${process.env.REACT_APP_API_URL}/products?contractAddress=${contractAddress}`);
};