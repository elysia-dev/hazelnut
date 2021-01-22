import Axios, { AxiosResponse } from 'axios';

type Response = {
  elysia: {
    usd: number;
  };
};

type EthResponse = {
  ethereum: {
    usd: number;
  };
};

export const getElPrice = (): Promise<AxiosResponse<Response>> => {
  return Axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=elysia&vs_currencies=usd',
  );
};

export const getEthPrice = (): Promise<AxiosResponse<EthResponse>> => {
  return Axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  );
};

