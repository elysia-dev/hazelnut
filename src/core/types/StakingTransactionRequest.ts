type StakingTransactionRequest = {
  value?: string,
  type?: string,
  contractAddress?: string,
  ethAddresses?: string,
  language?: string,
  rewardValue?: string, // 없으면 '0'으로 온다!
  migrationValue?: string,
}

export default StakingTransactionRequest;
