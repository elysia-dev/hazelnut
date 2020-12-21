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
          margin: 'auto',
          marginTop: 90,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export default BoxLayout;
