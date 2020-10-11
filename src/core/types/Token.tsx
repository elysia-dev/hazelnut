type Token = {
  type: string;
  amount?: number;
  contractAddress: string;
  title: string;
  expectedAnualReturn?: string;
  userAddress: string;
  email: string;
}

export default Token;