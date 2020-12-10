import React from 'react';

type Props = {
  children: React.ReactNode
}

function BoxLayout(props: Props) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        position: 'fixed',
        backgroundColor: '#F9F9F9',
      }}
    >
      <div
        style={{
          padding: 30,
          width: 346,
          margin: 'auto',
          marginTop: 30,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          boxShadow: '0 0 6px #00000010'
        }}
      >
        {props.children}
      </div>
    </div>
  )
}

export default BoxLayout;