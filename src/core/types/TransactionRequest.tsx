import TransactionType from "../enums/TransactionType";

type TransactionRequest = {
  type: TransactionType
  amount: number
  productTitle: string
  tokenName: string
  contractAddress: string
  expectedAnnualReturn: string
  usdPricePerToken: number,
  userAddresses: string[]
}

export default TransactionRequest;