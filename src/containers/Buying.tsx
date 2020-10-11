import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import Token from "../core/types/Token";
import BuyingStage from "../core/enums/BuyingStage";
import Spinner from "react-spinkit";

type Props = {
  token: Token
}

type State = {
  stage: BuyingStage
}

function Buying(props: Props) {
  const { t } = useTranslation();

  const [state, setState] = useState<State>({
    stage: BuyingStage.WHITELIST_CHECK
  });

  const needSpinner = [
    BuyingStage.ALLOWANCE_CHECK,
    BuyingStage.WHITELIST_CHECK,
    BuyingStage.WHITELIST_CHECK
  ].includes(state.stage);

  return (
    <div>
      <h1>{`${props.token.amount} ELA1`}</h1>
      {
        needSpinner && (
          <div>
            <Spinner name="line-scale" />
          </div>
        )
      }
      <p>{t(`Buying.${state.stage}`)}</p>
      { state.stage === BuyingStage.WHITELIST_RETRY && <p> {props.token.userAddress}</p>}
    </div>
  );
}

export default Buying;