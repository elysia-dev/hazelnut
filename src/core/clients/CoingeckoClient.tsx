import Axios, { AxiosResponse } from 'axios';

type Response = {
  elysia: {
    usd: number
  }
}

export const getElPrice = (): Promise<AxiosResponse<Response>> => {
  return Axios.get("https://api.coingecko.com/api/v3/simple/price?ids=elysia&vs_currencies=usd")
};