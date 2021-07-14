enum RequestStage {
  INIT = 'init',
  NETWORK_CHECK = 'NetworkCheck',
  ALLOWANCE_CHECK = 'AllowanceCheck',
  ALLOWANCE_PENDING = 'AllowancePending',
  ALLOWANCE_RETRY = 'AllowanceRetry',
  TRANSACTION = 'Transaction',
  TRANSACTION_RETRY = 'TransactionRetry',
  TRANSACTION_PENDING = 'TransactionPending',
  TRANSACTION_RESULT = 'TransactionResult',
}

export default RequestStage