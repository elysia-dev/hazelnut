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
      timer = setTimeout(() => { setCounter(counter - 4) }, 500);
    }

    return () => {
      clearTimeout(timer);
    }
  }, [counter])

  return (
    <div style={{ height: 150, marginTop: 10, position: "relative" }}>
      <div className="circle">
        <div className="wave">
          <div className="wave-before" style={{ top: `${counter}%` }} />
          <div className="wave-after" style={{ top: `${counter}%` }} />
        </div>
      </div>
    </div>
  )
}

export default Loading;