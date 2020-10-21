import TransactionType from "../enums/TransactionType";
import LanguageType from "../enums/LanguageType";

type TransactionRequest = {
  type: TransactionType
  amount: number
  productTitle: string
  tokenName: string
  contractAddress: string
  expectedAnnualReturn: string
  usdPricePerToken: number
  userAddresses: string[]
  language?: LanguageType
}

export default TransactionRequest;