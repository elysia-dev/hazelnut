import React from "react";

type Props = {
  clickHandler: () => void,
  title: string,
  style?: {}
}

function Button(props: Props) {
  return (
    <div
      style={{
        ...props.style,
        backgroundColor: "#3679B5",
        borderRadius: 10,
        borderWidth: 0,
        height: 50,
        cursor: "pointer",
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 340,
      }}
      onClick={props.clickHandler}
    >
      <div
        style={{
          paddingTop: 14,
          color: "#fff",
          fontSize: 16,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {props.title}
      </div>
    </div>
  )
}

export default Button;