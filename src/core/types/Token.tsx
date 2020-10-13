type Token = {
  type: string;
  amount?: number;
  productTitle: string;
  tokenName: string;
  contractAddress: string;
  expectedAnnualReturn?: string;
  userAddresses: string[];
  usdPricePerToken: string;
  email: string;
}

export default Token;