type Token = {
  type: string;
  amount?: number;
  contractAddress: string;
  title: string;
  expectedAnnualReturn?: string;
  userAddresses: string[];
  pricePerToken: string;
  email: string;
}

export default Token;