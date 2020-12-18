import React from "react";
import BoxLayout from "./BoxLayout";
import "./Loading.css";

function Loading() {
  return (
    <BoxLayout>
      <div
        style={{
          margin: "auto",
          marginTop: 190,
          marginBottom: 190,
          width: 80
        }}
      >
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    </BoxLayout>
  )
}

export default Loading;