import React from "react";
import BoxLayout from "../BoxLayout";

type Props = {
  message: string
}

function ServerError(props: Props) {
  return (
    <BoxLayout>
      <h1 style={{ textAlign: 'center' }}>{props.message}</h1>;
    </BoxLayout>
  )
}

export default ServerError;