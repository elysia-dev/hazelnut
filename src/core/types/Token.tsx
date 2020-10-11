type Token = {
  type: string;
  amount?: number;
  contractAddress: string;
  title: string;
  expectedAnualReturn?: string;
  userAddresses: string[];
  pricePerToken: string;
  email: string;
}

export default Token;