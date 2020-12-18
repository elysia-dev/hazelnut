import React from 'react';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

function BoxLayout(props: Props) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        position: 'fixed',
        ...props.style,
      }}
    >
      <div
        style={{
          padding: 15,
          margin: 'auto',
          marginTop: 30,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export default BoxLayout;
