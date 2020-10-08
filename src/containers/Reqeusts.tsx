import React from "react";
import { useParams } from "react-router-dom";

type ParamTypes = {
  token: string
}

function Requests() {
  const { token } = useParams<ParamTypes>();
  return (
    <div>
      <h2>Reqeust!</h2>
      <p>{token}</p>
    </div>
  );
}

export default Requests;