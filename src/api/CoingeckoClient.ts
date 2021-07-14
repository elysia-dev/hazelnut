import axios, { AxiosResponse } from 'axios';
import CoinPriceResponse from '../core/types/CoinPriceResponse';

export default class CoingeckoClient {
  static getElAndEthPrice = async (): Promise<AxiosResponse<CoinPriceResponse>> => {
    return axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=elysia,ethereum,binancecoin&vs_currencies=usd',
    );
  };
}
