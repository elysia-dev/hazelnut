import React from "react";
import { useTranslation } from 'react-i18next';
import Success from "./../images/success.svg";
import BoxLayout from "./BoxLayout";

function TransactionCompletion() {
  const { t } = useTranslation();

  return (
    <BoxLayout>
      <div
        style={{
          height: 440
        }}
      >
        <div
          style={{
            fontSize: 25,
            fontWeight: 'bold',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          Transaction Completion
        </div>
        <div>
          <div style={{ margin: "auto", width: 200, marginTop: 100 }}>
            <img
              src={Success}
              style={{
                width: 200,
              }}
            />
          </div>
        </div>
      </div>
    </BoxLayout>
  )
}

export default TransactionCompletion;