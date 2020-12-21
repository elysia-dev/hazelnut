enum InterestStage {
  WHITELIST_CHECK = 'WhitelistCheck',
  WHITELIST_REQUEST = 'WhitelistRequest',
  WHITELIST_PENDING = 'WhitelistPending',
  WHITELIST_RETRY = 'WhitelistRetry',
  TRANSACTION = 'Transaction',
  TRANSACTION_RETRY = 'TransactionRetry',
  TRANSACTION_PENDING = 'TransactionPending',
  TRANSACTION_RESULT = 'TransactionResult',
}

export default InterestStage