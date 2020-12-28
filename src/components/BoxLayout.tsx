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
        maxWidth: 500,
        margin: "auto",
        ...props.style,
      }}
    >
      <div
        style={{
          margin: 'auto',
          height: "100%",
          overflowY: "scroll"
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export default BoxLayout;
