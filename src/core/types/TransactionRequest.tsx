import TransactionType from "../enums/TransactionType";
import LanguageType from "../enums/LanguageType";

type TransactionRequest = {
  type: TransactionType
  amount: number
  userAddresses: string[]
  language?: LanguageType
  product: {
    title: string
    tokenName: string
    expectedAnnualReturn: string
    contractAddress: string
    usdPricePerToken: number
    data: {
      images: string[]
    }
  }
}

export default TransactionRequest;