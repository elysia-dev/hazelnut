import axios from 'axios';
import TransferType from '../enums/TransferType';

export const saveTxData = (
  uuid: string,
  transferType: TransferType,
  cryptoType: string,
  hash: string,
  amount: string,
  unit?: string,
  migrationUnstakingAmount?: string,
  migrationRewardAmount?: string,
) => {
  axios
    .post(`${process.env.REACT_APP_UUID_DATA_URL}/${uuid}/tx`, {
      transferType,
      date: String(new Date()),
      unit: unit?.toUpperCase() || '',
      nonce: 0,
      hash,
      amount,
      cryptoType: cryptoType.toUpperCase(),
      migrationUnstakingAmount: migrationUnstakingAmount || '',
      migrationRewardAmount: migrationRewardAmount || '',
    })
    .then(res => {})
    .catch(error => {});
};
