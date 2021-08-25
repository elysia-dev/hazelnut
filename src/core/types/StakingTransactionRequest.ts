import StakingTransactionType from '../enums/StakingTransactionType';

type StakingTransactionRequest = {
  value?: string,
  type?: StakingTransactionType,
  unit?: 'EL' | 'ELFI' | 'DAI',
  round?: string, // 원래 1~6이지만 지금 테스트 중인 라운드가 7을 넘어서서...
  contractAddress?: string,
  userAddress?: string,
  language?: string,
  rewardValue?: string, // 없으면 '0'으로 온다!
  migrationValue?: string, // 입력 안 하면 undefined로 오는 듯 ('undefined'?)
}

export default StakingTransactionRequest;
