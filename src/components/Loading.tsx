import React, { useEffect, useState } from "react";
import "./Loading.css";

type Props = {
  message?: string
}

function Loading(props: Props) {
  const [counter, setCounter] = useState<number>(50);

  useEffect(() => {
    let timer: number;

    if (counter < -55) {
      timer = setTimeout(() => { setCounter(50) }, 1000);
    } else {
      timer = setTimeout(() => { setCounter(counter - 2) }, 500);
    }

    return () => {
      clearTimeout(timer);
    }
  }, [counter])


  return (
    <div style={{ top: 0, left: 0, position: 'fixed', width: "100%", height: "100%", zIndex: 100 }}>
      <div className="circle">
        <div className="wave">
          <div className="wave-before" style={{ top: `${counter}%` }} />
          <div className="wave-after" style={{ top: `${counter}%` }} />
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: "bold",
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-46%, -50%)",
          whiteSpace: "nowrap",
        }}
      >
        {props.message}
      </div>
    </div>
  )
}

export default Loading;