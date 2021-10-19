import axios from 'axios';
import TransferType from '../enums/TransferType';

export const saveTxData = (
  uuid: string,
  transferType: TransferType,
  cryptoType: string,
  txHash: string,
  amount: string,
  unit?: string,
) => {
  axios
    .post(`${process.env.REACT_APP_UUID_DATA_URL}/${uuid}/tx`, {
      transferType,
      date: String(new Date()),
      unit: unit?.toUpperCase() || '',
      nonce: 0,
      txHash,
      amount,
      cryptoType: cryptoType.toUpperCase(),
    })
    .then(res => {})
    .catch(error => {});
};
