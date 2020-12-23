enum RequestStage {
  ALLOWANCE_CHECK = 'AllowanceCheck',
  ALLOWANCE_PENDING = 'AllowancePending',
  ALLOWANCE_RETRY = 'AllowanceRetry',
  WHITELIST_CHECK = 'WhitelistCheck',
  WHITELIST_REQUEST = 'WhitelistRequest',
  WHITELIST_PENDING = 'WhitelistPending',
  WHITELIST_RETRY = 'WhitelistRetry',
  TRANSACTION = 'Transaction',
  TRANSACTION_RETRY = 'TransactionRetry',
  TRANSACTION_PENDING = 'TransactionPending',
  TRANSACTION_RESULT = 'TransactionResult',
}

export default RequestStage