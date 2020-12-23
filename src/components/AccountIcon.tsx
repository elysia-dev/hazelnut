import React, { useEffect, useRef } from 'react'

import styled from 'styled-components'

import Jazzicon from 'jazzicon'
import { useWeb3React } from '@web3-react/core'

const StyledIdenticonContainer = styled.div`
`

export default function AccountIcon() {
  const ref = useRef<HTMLDivElement>()

  const { account } = useWeb3React();

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = ''
      ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)))
    }
  }, [account])

  return <div
    style={{
      height: "1rem",
      width: "1rem",
      borderRadius: "1.125rem",
    }}
    ref={ref as any}
  />
}
