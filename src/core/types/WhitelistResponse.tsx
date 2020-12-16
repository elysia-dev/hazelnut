type WhitelistResponse = {
  status: 'new' | 'pending' | 'complete' | 'error',
  txHash: string | null
}

export default WhitelistResponse;
