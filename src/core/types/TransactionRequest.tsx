import TransactionType from '../enums/TransactionType';
import LanguageType from '../enums/LanguageType';
import PaymentMethod from './PaymentMethod';

type TransactionRequest = {
  type: TransactionType | string;
  amount: number;
  userAddresses: string | string[] | null;
  language?: LanguageType | string;
  product: {
    title: string;
    tokenName: string;
    expectedAnnualReturn: string;
    contractAddress: string;
    usdPricePerToken: number;
    paymentMethod: PaymentMethod;
    data: {
      images: string[];
    };
  };
  contract: {
    address: string | string[] | null;
    abi: string;
    version: string;
  };
  uuid: string;
};

export default TransactionRequest;
