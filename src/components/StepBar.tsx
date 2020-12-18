import React from 'react';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './BuyingStatusBar.css';

type Props = {
  active: boolean;
  animated: boolean;
};

function StepBar(props: Props) {
  return (
    <div style={{ width: 108, paddingTop: 16, overflow: 'hidden' }}>
      {props.active && <div className="fix"></div>}
      {(props.animated) && (
        <div className={`default ${props.animated && 'slide'}`}></div>
      )}
    </div>
  )
}

export default StepBar;