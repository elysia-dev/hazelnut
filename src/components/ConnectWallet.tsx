import React from "react";

type Props = {
  handler: Function
}

function ConnectWallet(props: Props) {
  return (
    <div style={{ justifyContent: 'center', justifyItems: 'center' }}>
      <div style={{ width: 312, height: 20, marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <button
          style={{
            backgroundColor: "#D0D8DF",
            borderRadius: 10,
            borderWidth: 0,
            width: 312,
            height: 50
          }}
          onClick={() => props.handler()}
        >
          <p style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
            Connect wallet
      </p>
        </button>
      </div>
    </div>
  )
}

export default ConnectWallet;