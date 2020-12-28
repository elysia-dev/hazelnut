import React from "react";

type Props = {
  clickHandler: () => void,
  title: string,
  style?: {}
}

function Button(props: Props) {
  return (
    <button
      style={{
        ...props.style,
        backgroundColor: "#3679B5",
        borderRadius: 10,
        borderWidth: 0,
        height: 50,
        cursor: "pointer",
        marginLeft: 'auto',
        marginRight: 'auto',
        width: "100%",
      }}
      onClick={props.clickHandler}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 16,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {props.title}
      </div>
    </button>
  )
}

export default Button;