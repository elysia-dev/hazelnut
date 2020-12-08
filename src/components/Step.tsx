import React from 'react';
import { Animated } from 'react-animated-css';
import styled from 'styled-components';
import LoadingIndicator from 'react-loading-indicator';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './BuyingStatusBar.css';
import StepStage from '../core/enums/StepStage';

const Circle = styled.div`
width: 32px;
height: 32px;
border-radius: 16px;
justify-content: center;
align-content: center;
`;

const StepNum = styled.p`
  color: #e5e5e5;
  font-weight: bold;
  font-size: 15px;
  text-align: center;
  margin-top: -5px;
`;

type Props = {
  step: number;
  stage: StepStage;
};

function Step(props: Props) {
  return (
    <div>
      <Circle
        style={{
          backgroundColor: props.stage === StepStage.FAIL ? '#CC3743' :
            props.stage === StepStage.NONE ? '#ffffff' : '#3679B5'
        }}
      >
        <div style={{ padding: 6 }}>
          {
            props.stage === StepStage.LOADING && <LoadingIndicator
              color={{ red: 255, green: 255, blue: 255, alpha: 1 }}
              segments={8}
              segmentWidth={2}
            />
          }
          {
            props.stage === StepStage.FAIL && <p
              style={{
                fontSize: 17,
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 0,
              }}
            >
              !
            </p>
          }
          {
            props.stage === StepStage.SUCCESS && <Animated
              animationIn="flash"
              animationInDuration={1000}
              animationOut="flash"
              isVisible={true}
              style={{ top: '50%', marginTop: -1, position: 'relative' }}
            >
              <img src={require('../images/whitecheck.png')} />
            </Animated>
          }
        </div>
        {props.stage === StepStage.NONE && <StepNum>{props.step}</StepNum>}
      </Circle>
    </div>
  )
}

export default Step;