enum Stage {
  WHITELIST_CHECK = 'WhitelistCheck',
  WHITELIST_RETRY = 'WhitelistRetry',
  ALLOWANCE_CHECK = 'AllowanceCheck',
  ALLOWANCE_RETRY = 'AllowanceRetry',
  TRANSACTION = 'Transaction',
  TRANSACTION_RESULT = 'TransactionResult',
  TRANSACTION_RETRY = 'TransactionRetry',
}

export default Stage