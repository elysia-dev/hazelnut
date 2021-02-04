import TransactionType from "../enums/TransactionType";
import LanguageType from "../enums/LanguageType";
import PaymentMethod from "./PaymentMethod";

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
    paymentMethod: PaymentMethod
    data: {
      images: string[]
    }
  }
  contract: {
    address: string
    abi: string
    version: string
  }
}

export default TransactionRequest;