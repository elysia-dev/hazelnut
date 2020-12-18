import React, { useEffect, useState } from "react";
import "./Loading.css";

function Loading() {
  const [counter, setCounter] = useState<number>(50);

  useEffect(() => {
    let timer: number;

    if (counter < -55) {
      timer = setTimeout(() => { setCounter(50) }, 1000);
    } else {
      timer = setTimeout(() => { setCounter(counter - 1) }, 500);
    }

    return () => {
      clearTimeout(timer);
    }
  }, [counter])


  return (
    <div style={{ top: 0, left: 0, position: 'fixed', width: "100%", height: "100%", zIndex: 100 }}>
      <div
        style={{
          margin: "auto",
          marginTop: 190,
          marginBottom: 190,
          width: 80
        }}
      >
        <div className="circle">
          <div className="wave">
            <div className="wave-before" style={{ top: `${counter}%` }} />
            <div className="wave-after" style={{ top: `${counter}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading;