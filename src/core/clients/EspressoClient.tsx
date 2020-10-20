import Axios, { AxiosResponse } from 'axios';
import TransactionRequest from '../types/TransactionRequest';

export const getTransactionRequest = (id: string): Promise<AxiosResponse<TransactionRequest>> => {
  return Axios.get(`${process.env.REACT_APP_API_URL}/transactionRequests/${id}`)
};