import StakingTransactionType from '../enums/StakingTransactionType';

type StakingTransactionRequest = {
  value?: string,
  type?: StakingTransactionType,
  unit?: 'EL' | 'ELFI' | 'DAI',
  contractAddress?: string,
  userAddress?: string,
  language?: string,
  rewardValue?: string, // 없으면 '0'으로 온다!
  migrationValue?: string, // 입력 안 하면 undefined로 오는 듯 ('undefined'?)
}

export default StakingTransactionRequest;
